-- Attempt policy schema for manual teacher approval retakes
alter table public.test_results
  add column if not exists attempt_no integer,
  add column if not exists status text,
  add column if not exists retake_granted boolean default false,
  add column if not exists retake_granted_by uuid,
  add column if not exists retake_granted_at timestamptz,
  add column if not exists official_for_placement boolean default false,
  add column if not exists submitted_at timestamptz;

create index if not exists idx_test_results_student_status
  on public.test_results(student_id, status);

create index if not exists idx_test_results_student_attempt
  on public.test_results(student_id, attempt_no);
