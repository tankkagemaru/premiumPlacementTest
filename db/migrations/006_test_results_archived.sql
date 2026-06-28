-- 006_test_results_archived.sql
--
-- Adds an `archived` flag to test_results so teachers can hide old reviewed
-- attempts from the default Reviewed tab without losing the data (delete is
-- too final for records that may still matter for audit / appeal). Default
-- false; existing rows are unaffected.

alter table public.test_results
  add column if not exists archived boolean not null default false;

-- Filtering "non-archived, most recent first" is the default Reviewed view.
create index if not exists idx_test_results_archived_submitted
  on public.test_results(archived, submitted_at desc);
