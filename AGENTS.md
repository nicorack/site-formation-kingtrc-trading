# Architecture rules

- Store both Telegram URLs with the Drive URL in `public.formation_links`, using its existing approval-gated RLS, so all access links share the same protection.
- Filter learner enrollments and approval notices to the offered special-course category without deleting historical orders, preserving payment records.
- Map the special-course category to its display label through formationCategoryLabel; retain the stored category for existing enrollment and payment checks.