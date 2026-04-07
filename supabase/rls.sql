-- ==========================================
-- PHASE 9: REFINED SUPABASE RLS POLICIES
-- ==========================================
-- Run this in your Supabase SQL Editor to resolve Infinite Recursion and secure data.

-- 1. SECURITY DEFINER HELPERS
-- These functions bypass RLS to check roles, preventing infinite recursion.

CREATE OR REPLACE FUNCTION public.is_admin(u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = u_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_professor(u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = u_id AND (role = 'professor' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_enrolled(u_id UUID, c_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE student_id = u_id AND course_id = c_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING ( auth.role() = 'authenticated' );
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING ( public.is_admin(auth.uid()) );


-- 4. COURSES & ENROLLMENTS
DROP POLICY IF EXISTS "Courses select policy" ON public.courses;
DROP POLICY IF EXISTS "Courses manage policy" ON public.courses;

CREATE POLICY "Courses select policy" ON public.courses FOR SELECT USING (
  professor_id = auth.uid() OR 
  public.is_enrolled(auth.uid(), id) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Courses manage policy" ON public.courses FOR ALL USING (
  professor_id = auth.uid() OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Enrollments select policy" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments manage policy" ON public.enrollments;

CREATE POLICY "Enrollments select policy" ON public.enrollments FOR SELECT USING (
  student_id = auth.uid() OR 
  public.is_admin(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = enrollments.course_id AND professor_id = auth.uid())
);

CREATE POLICY "Enrollments manage policy" ON public.enrollments FOR ALL USING (
  public.is_admin(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = enrollments.course_id AND professor_id = auth.uid())
);


-- 5. SESSIONS
DROP POLICY IF EXISTS "Sessions select policy" ON public.sessions;
DROP POLICY IF EXISTS "Sessions manage policy" ON public.sessions;

CREATE POLICY "Sessions select policy" ON public.sessions FOR SELECT USING (
  public.is_enrolled(auth.uid(), course_id) OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = sessions.course_id AND professor_id = auth.uid()) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Sessions manage policy" ON public.sessions FOR ALL USING (
  public.is_admin(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = sessions.course_id AND professor_id = auth.uid())
);


-- 6. PRIVATE NOTES
DROP POLICY IF EXISTS "Individual note access" ON public.notes;
CREATE POLICY "Individual note access" ON public.notes FOR ALL USING ( user_id = auth.uid() );


-- 7. REFLECTIONS & INTERACTIONS
DROP POLICY IF EXISTS "Reflections select policy" ON public.reflections;
DROP POLICY IF EXISTS "Reflections insert/update" ON public.reflections;

CREATE POLICY "Reflections select policy" ON public.reflections FOR SELECT USING (
  status = 'published' OR 
  user_id = auth.uid() OR 
  public.is_professor(auth.uid()) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Reflections manage policy" ON public.reflections FOR ALL USING ( 
  user_id = auth.uid() OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Reactions access" ON public.reactions;
CREATE POLICY "Reactions access" ON public.reactions FOR ALL USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Comments access" ON public.comments;
CREATE POLICY "Comments access" ON public.comments FOR ALL USING ( auth.role() = 'authenticated' );


-- 8. ESSAYS
DROP POLICY IF EXISTS "Essays select policy" ON public.essays;
DROP POLICY IF EXISTS "Essays manage policy" ON public.essays;

CREATE POLICY "Essays select policy" ON public.essays FOR SELECT USING (
  user_id = auth.uid() OR
  status = 'public' OR
  (status IN ('submitted', 'graded') AND public.is_professor(auth.uid())) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Essays manage policy" ON public.essays FOR ALL USING ( 
  user_id = auth.uid() OR public.is_admin(auth.uid()) 
);


-- 9. ANNOTATIONS
DROP POLICY IF EXISTS "Annotations select policy" ON public.annotations;
DROP POLICY IF EXISTS "Annotations manage policy" ON public.annotations;

CREATE POLICY "Annotations select policy" ON public.annotations FOR SELECT USING (
  professor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.reflections r WHERE r.id = annotations.reflection_id AND r.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.essays e WHERE e.id = annotations.essay_id AND e.user_id = auth.uid()) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Annotations manage policy" ON public.annotations FOR ALL USING (
  professor_id = auth.uid() OR public.is_admin(auth.uid())
);
