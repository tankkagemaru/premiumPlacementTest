create table if not exists public.registration_codes (
  id bigserial primary key,
  code text unique not null,
  created_by uuid references public.users(id),
  max_uses integer not null default 0,
  used_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz null,
  last_used_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.registration_code_usage (
  id bigserial primary key,
  code_id bigint not null references public.registration_codes(id) on delete cascade,
  used_email text null,
  used_at timestamptz not null default now()
);

create index if not exists idx_registration_codes_active on public.registration_codes(is_active, created_at desc);
create index if not exists idx_registration_code_usage_code on public.registration_code_usage(code_id, used_at desc);
