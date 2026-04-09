-- Fix potential duplicate triggers or multi-row conflicts
DROP TRIGGER IF EXISTS check_whitelist_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;

CREATE TRIGGER on_auth_user_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_auth_user_allowed();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role;
    v_name TEXT;
    v_reg TEXT;
BEGIN
    -- Use LIMIT 1 to prevent 'too_many_rows' crash if the user accidentally has test@email.com and Test@email.com whitelisted
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
