-- ========================================================
-- RESTRICTED LOGIN (WHITELIST) - v1.2 (Professor Support)
-- ========================================================

-- 1. Create Whitelist Table if not exists
CREATE TABLE IF NOT EXISTS public.allowed_emails (
    email TEXT PRIMARY KEY,
    name TEXT,
    register_number TEXT,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id)
);

-- Ensure profiles table has register_number
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS register_number TEXT;

-- 2. Populate Whitelist with Existing Users (RETAINING DATA)
INSERT INTO public.allowed_emails (email, role)
SELECT email, role FROM public.profiles
ON CONFLICT (email) DO NOTHING;

-- 3. Hardcode Permanent Admin Whitelist (Safety Measure)
INSERT INTO public.allowed_emails (email, role)
VALUES 
    ('vinay@sjcc.edu.in', 'admin'),
    ('vinay.kambipura@gmail.com', 'admin'),
    ('vinayforbooks@gmail.com', 'admin'),
    ('admin@sjcc.edu.in', 'admin'),
    ('tester@sjcc.edu.in', 'student')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- 4. Signup Validation Function
CREATE OR REPLACE FUNCTION public.check_auth_user_allowed()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.allowed_emails 
        WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email))
    ) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Registration not allowed for this email address. Please contact your instructor.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach/Refresh Trigger
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
CREATE TRIGGER on_auth_user_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_auth_user_allowed();

-- 6. Updated RLS to include Professors and Self-Lookup
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Whitelist viewable by admins" ON public.allowed_emails;
DROP POLICY IF EXISTS "Whitelist manageable by admins" ON public.allowed_emails;
DROP POLICY IF EXISTS "Professors and Admins manage whitelist" ON public.allowed_emails;
DROP POLICY IF EXISTS "Users can view their own whitelist entry" ON public.allowed_emails;

CREATE POLICY "Professors and Admins manage whitelist" 
    ON public.allowed_emails FOR ALL 
    USING ( 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'professor') 
    );

CREATE POLICY "Users can view their own whitelist entry"
    ON public.allowed_emails FOR SELECT
    USING ( LOWER(email) = LOWER(auth.jwt() ->> 'email') );

-- 7. Automatic Profile Creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_reg TEXT;
BEGIN
    -- Get role, name, and reg no from whitelist safely (LIMIT 1 protects against accidental casing duplicates)
    SELECT role, name, register_number INTO v_role, v_name, v_reg
    FROM public.allowed_emails 
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email))
    LIMIT 1;

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, name, role, register_number)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(v_name, split_part(NEW.email, '@', 1)), 
        COALESCE(v_role, 'student'),
        v_reg
    );
    
    -- Migrate any pending enrollments to actual enrollments
    INSERT INTO public.enrollments (course_id, student_id)
    SELECT course_id, NEW.id 
    FROM public.pending_enrollments 
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email))
    ON CONFLICT DO NOTHING;

    -- Clean up pending enrollments
    DELETE FROM public.pending_enrollments 
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Create Pending Enrollments Table
CREATE TABLE IF NOT EXISTS public.pending_enrollments (
    email TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (email, course_id)
);

ALTER TABLE public.pending_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pending enrollments accessible to admins and professors" ON public.pending_enrollments;
CREATE POLICY "Pending enrollments accessible to admins and professors" 
    ON public.pending_enrollments FOR ALL 
    USING ( 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'professor') 
    );
