-- 005_registration_code_trigger.sql
--
-- Make registration-code consumption server-enforced via a Postgres trigger
-- on auth.users INSERT. The previous design required the client to call
-- /api/consume-registration-code AFTER Supabase signup succeeded; if a
-- browser still held a stale client bundle from an earlier deploy, that
-- call never fired and the code counter drifted from reality.
--
-- New design:
--   1. Caller (client or admin endpoint) sets the registration code in
--      auth.users.raw_user_meta_data.registration_code at signup time
--      (Supabase signup API: pass `data: { registration_code: '...' }`).
--   2. This AFTER-INSERT trigger atomically increments the matching code
--      and writes an audit row in the same transaction as the user row.
--   3. If the code is invalid/inactive/expired/exhausted the trigger
--      RAISES and the auth.users INSERT is rolled back — signup itself
--      fails, so we cannot end up with a user that bypassed the gate.
--   4. If raw_user_meta_data has no registration_code, the trigger is a
--      no-op (preserves Supabase Dashboard / admin API user creation).
--
-- Notes:
--   - The match on `code` is case-insensitive (upper(...) both sides) to
--     mirror the validation logic in api/validate-registration.js and the
--     code-creation logic in api/registration-codes.js.
--   - SECURITY DEFINER lets the trigger update public.registration_codes
--     under the table owner's privileges regardless of who triggered the
--     signup.

create or replace function public.consume_registration_code_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  code_text text;
  matched_id bigint;
begin
  code_text := upper(trim(coalesce(new.raw_user_meta_data->>'registration_code', '')));
  if code_text = '' then
    return new;
  end if;

  update public.registration_codes
  set used_count  = used_count + 1,
      last_used_at = now()
  where upper(code) = code_text
    and is_active = true
    and (max_uses = 0 or used_count < max_uses)
    and (expires_at is null or expires_at > now())
  returning id into matched_id;

  if matched_id is null then
    raise exception 'invalid_registration_code'
      using errcode = 'P0001',
            message = 'Registration code is invalid, inactive, expired, or has reached its usage limit.';
  end if;

  insert into public.registration_code_usage (code_id, used_email, used_at)
  values (matched_id, new.email, now());

  return new;
end;
$$;

drop trigger if exists trg_consume_registration_code on auth.users;
create trigger trg_consume_registration_code
after insert on auth.users
for each row execute function public.consume_registration_code_on_signup();
