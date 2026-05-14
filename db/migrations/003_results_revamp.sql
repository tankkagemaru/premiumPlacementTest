-- 003_results_revamp.sql
-- Unifies the test_results approval/lifecycle model.
-- Safe to run multiple times; uses IF EXISTS / IF NOT EXISTS / coalesce.
-- After this migration the canonical state column is `status`
-- ('pending' | 'approved' | 'rejected'). Legacy approval columns
-- (is_approved, approved_at, approved_by) remain in place until
-- 004_results_cleanup.sql is applied post-deploy.

begin;

-- 1. Normalize student_id: legacy rows used auth.users.id; rewrite to students.id.
update public.test_results tr
  set student_id = s.id
  from public.students s
  where tr.student_id = s.user_id;

-- 2. Ensure every column the new model needs exists.
alter table public.test_results
  add column if not exists attempt_no integer,
  add column if not exists official_for_placement boolean not null default false,
  add column if not exists retake_granted boolean not null default false,
  add column if not exists retake_granted_by uuid,
  add column if not exists retake_granted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid,
  add column if not exists ability_estimate numeric,
  add column if not exists status text;

-- 3. Backfill status from legacy fields.
update public.test_results
  set status = case
    when is_approved is true then 'approved'
    when approved_at is not null then 'approved'
    when nullif(status, '') is not null then status
    else 'pending'
  end
  where status is null or status = '';

alter table public.test_results
  alter column status set default 'pending',
  alter column status set not null;

alter table public.test_results
  drop constraint if exists test_results_status_check;

alter table public.test_results
  add constraint test_results_status_check
    check (status in ('pending', 'approved', 'rejected'));

-- 4. Unify reviewed_at/reviewed_by from approved_at/approved_by.
update public.test_results
  set reviewed_at = approved_at,
      reviewed_by = approved_by
  where reviewed_at is null
    and approved_at is not null;

-- 5. Backfill attempt_no per student in chronological order.
with seq as (
  select id,
         row_number() over (
           partition by student_id
           order by coalesce(completed_at, now())
         ) as n
  from public.test_results
)
update public.test_results tr
  set attempt_no = seq.n
  from seq
  where seq.id = tr.id
    and tr.attempt_no is null;

-- 6. Backfill official_for_placement: latest approved attempt per student.
-- Reset all rows first so any pre-existing trues (from manual testing or
-- prior partial runs) don't violate the unique index in step 10.
update public.test_results
  set official_for_placement = false
  where official_for_placement = true;

with latest_approved as (
  select distinct on (student_id) id
  from public.test_results
  where status = 'approved'
  order by student_id, coalesce(completed_at, now()) desc, id desc
)
update public.test_results
  set official_for_placement = true
  where id in (select id from latest_approved);

-- 7. Convert student_responses to jsonb. Treat malformed text as [] to avoid blocking the migration.
do $$
declare
  current_type text;
begin
  select data_type
    into current_type
    from information_schema.columns
   where table_schema = 'public'
     and table_name = 'test_results'
     and column_name = 'student_responses';

  if current_type is not null and current_type <> 'jsonb' then
    execute $sql$
      alter table public.test_results
        alter column student_responses type jsonb
        using case
          when student_responses is null then null
          when student_responses ~ '^\s*[\[\{]' then student_responses::jsonb
          else '[]'::jsonb
        end
    $sql$;
  end if;
end$$;

-- 8. Rename completed_at -> submitted_at for clearer lifecycle semantics.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'test_results'
      and column_name = 'completed_at'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'test_results'
      and column_name = 'submitted_at'
  ) then
    execute 'alter table public.test_results rename column completed_at to submitted_at';
  end if;
end$$;

-- 9. Index for the new single-key fetch (student_id + status + attempt order).
create index if not exists idx_test_results_student_status_attempt
  on public.test_results (student_id, status, attempt_no desc);

-- 10. At most one official attempt per student (partial unique index).
create unique index if not exists uniq_test_results_one_official_per_student
  on public.test_results (student_id)
  where official_for_placement = true;

commit;
