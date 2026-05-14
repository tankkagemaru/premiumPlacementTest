-- 004_results_cleanup.sql
-- Drops legacy columns after the new approval/results code is live and verified.
-- DO NOT apply until 003 has been deployed AND the app code has been switched
-- to the new schema for at least one full review cycle. Reversing this is
-- expensive (requires restoring backups), so confirm the new flow works first.

begin;

alter table public.test_results
  drop column if exists is_approved,
  drop column if exists approved_at,
  drop column if exists approved_by,
  drop column if exists needs_teacher_review,
  drop column if exists notes,
  drop column if exists student_name,
  drop column if exists student_passport;

commit;
