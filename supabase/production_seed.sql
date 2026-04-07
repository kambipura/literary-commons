-- ========================================================
-- PRODUCTION SEED: Literary Commons Beta Release v1.0
-- ========================================================

-- 1. CLEAN SLATE
-- This deletes ALL existing courses and sessions to ensure no mock data remains.
-- WARNING: This will clear your current test data.
TRUNCATE public.courses, public.sessions RESTART IDENTITY CASCADE;

-- 2. CREATE BETA COURSE
-- We use a CTE (Common Table Expression) to store the ID for the next step.
WITH new_course AS (
  INSERT INTO public.courses (name, code, semester, university, status)
  VALUES (
      'Reading and Writing Workshop', 
      'RW-2026', 
      'Semester I · 2026', 
      'SJCC University', 
      'active'
  )
  RETURNING id
)
-- 3. CREATE INITIAL SESSIONS
INSERT INTO public.sessions (course_id, number, title, prompt_type, they_say_prompt, is_active)
SELECT id, 1, 'Arrivals: The politics of language', 'they-say', 'Reading Rushdie suggests that language is not just a tool, but a geography. Identify one paragraph that shifts your understanding of "Standard English."', true FROM new_course
UNION ALL
SELECT id, 2, 'Dialogic Imagination', 'i-say', 'How does the concept of "polyphony" resonate with your own experience of speaking multiple languages or dialects?', false FROM new_course;

-- 4. VERIFY RESULTS
-- This will show your course and sessions together in one table.
SELECT 
  c.name as course_name,
  s.number as session_no,
  s.title as session_title,
  s.is_active
FROM public.courses c
JOIN public.sessions s ON s.course_id = c.id
WHERE c.code = 'RW-2026'
ORDER BY s.number;

-- 5. PROMOTION (Run this separately!)
-- After you log in for the first time, run the line below with your email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
