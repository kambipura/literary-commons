-- ============================================================
-- PATCH: Support session-free reflections
-- Run this in the Supabase SQL Editor (safe, non-destructive)
-- ============================================================

-- 1. Change ON DELETE CASCADE → ON DELETE SET NULL for reflections.session_id
--    Prevents reflections from being deleted when a session is removed
ALTER TABLE public.reflections
  DROP CONSTRAINT IF EXISTS reflections_session_id_fkey;

ALTER TABLE public.reflections
  ADD CONSTRAINT reflections_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;

-- 2. Fix the view_reflections RLS policy to handle NULL session_id
--    Previously: class-privacy + null session_id = invisible to everyone
--    Now: class-privacy + null session_id = visible to any enrolled student
DROP POLICY IF EXISTS "view_reflections" ON public.reflections;

CREATE POLICY "view_reflections" ON public.reflections FOR SELECT USING (
  -- Always: public reflections are visible to all
  privacy = 'public'

  -- Always: own reflections are visible
  OR auth.uid() = user_id

  -- Always: professors see everything
  OR public.is_professor(auth.uid())

  -- Class reflections tied to a session: visible to enrolled students in that course
  OR (
    privacy = 'class'
    AND session_id IS NOT NULL
    AND public.is_enrolled(
      auth.uid(),
      (SELECT course_id FROM public.sessions WHERE id = session_id)
    )
  )

  -- Class reflections with NO session (free write): visible to any enrolled student
  OR (
    privacy = 'class'
    AND session_id IS NULL
    AND EXISTS (SELECT 1 FROM public.enrollments WHERE student_id = auth.uid())
  )
);

-- Done. You can verify with:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'reflections';
