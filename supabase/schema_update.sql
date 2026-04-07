-- ==========================================
-- SCHEMA UPDATE: Fix Enrollment Role & Staffing
-- ==========================================

-- 1. Add role to enrollments if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollments' AND column_name='role') THEN
        ALTER TABLE public.enrollments ADD COLUMN role user_role DEFAULT 'student';
    END IF;
END $$;

-- 2. Create course_staff table (as used by api.js)
CREATE TABLE IF NOT EXISTS public.course_staff (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role DEFAULT 'professor',
    PRIMARY KEY (course_id, professor_id)
);

-- 3. Ensure role types are correct for profiles
-- (Already exists in main schema, but just in case)
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student';

-- 4. Enable RLS on new table
ALTER TABLE public.course_staff ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy for course_staff
DROP POLICY IF EXISTS "Staff are viewable by course participants" ON public.course_staff;
CREATE POLICY "Staff are viewable by course participants" ON public.course_staff 
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage staff" ON public.course_staff;
CREATE POLICY "Admins can manage staff" ON public.course_staff 
FOR ALL USING (public.is_admin(auth.uid()));
