-- ==========================================
-- SUPER CLEAN SLATE: MASTER INITIALIZATION
-- ==========================================

-- 1. DROP ALL TABLES SAFELY
DROP TABLE IF EXISTS public.annotations CASCADE;
DROP TABLE IF EXISTS public.essays CASCADE;
DROP TABLE IF EXISTS public.response_chains CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.reactions CASCADE;
DROP TABLE IF EXISTS public.reflections CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.course_staff CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.pending_enrollments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.allowed_emails CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. ENABLE UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE ALL CUSTOM TYPES
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN CREATE TYPE public.user_role AS ENUM ('student', 'professor', 'admin'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN CREATE TYPE public.course_status AS ENUM ('active', 'archived'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reflection_privacy') THEN CREATE TYPE public.reflection_privacy AS ENUM ('draft', 'class', 'public'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reflection_status') THEN CREATE TYPE public.reflection_status AS ENUM ('draft', 'published'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'note_type') THEN CREATE TYPE public.note_type AS ENUM ('free', 'positioned', 'reading', 'link', 'fluid', 'quote'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_type') THEN CREATE TYPE public.comment_type AS ENUM ('extending', 'complicating', 'questioning', 'affirming'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN CREATE TYPE public.reaction_type AS ENUM ('shifts', 'pushback', 'new'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'annotation_move') THEN CREATE TYPE public.annotation_move AS ENUM ('they-say', 'i-say', 'so-what', 'evidence', 'naysayer', 'context'); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'essay_status') THEN CREATE TYPE public.essay_status AS ENUM ('draft', 'submitted', 'graded', 'public'); END IF;
END $$;

-- 4. BUILD ALL TABLES
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role public.user_role NOT NULL DEFAULT 'student',
    register_number TEXT,
    right_now_i_think TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    semester TEXT NOT NULL,
    university TEXT NOT NULL,
    professor_id UUID REFERENCES public.profiles(id),
    featured_chain_id UUID,
    status public.course_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.enrollments (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.user_role DEFAULT 'student',
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (course_id, student_id)
);

CREATE TABLE public.pending_enrollments (
    email TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (email, course_id)
);

CREATE TABLE public.course_staff (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.user_role DEFAULT 'professor',
    PRIMARY KEY (course_id, professor_id)
);

CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    prompt_type TEXT,
    they_say_prompt TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    type public.note_type DEFAULT 'fluid',
    title TEXT,
    content TEXT,
    url TEXT,
    link_title TEXT,
    tags TEXT[],
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    they_say_source JSONB,
    privacy public.reflection_privacy DEFAULT 'class',
    status public.reflection_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.reaction_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reflection_id, user_id)
);

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.comment_type NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.response_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT,
    reflection_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.courses ADD CONSTRAINT fk_course_chain FOREIGN KEY (featured_chain_id) REFERENCES public.response_chains(id) ON DELETE SET NULL;

CREATE TABLE public.essays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    sections JSONB,
    status public.essay_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE CASCADE,
    essay_id UUID REFERENCES public.essays(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    paragraph_index INTEGER,
    move_type public.annotation_move,
    selected_text TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.annotations ADD CONSTRAINT check_annotation_target CHECK ( (reflection_id IS NOT NULL) OR (essay_id IS NOT NULL) );

CREATE TABLE public.allowed_emails (
    email TEXT PRIMARY KEY,
    name TEXT,
    register_number TEXT,
    role public.user_role DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id)
);


-- 5. APPLY SECURITY DEFINER HELPERS
CREATE OR REPLACE FUNCTION public.is_admin(u_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = u_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_professor(u_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = u_id AND (role = 'professor' OR role = 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_enrolled(u_id UUID, c_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.enrollments WHERE student_id = u_id AND course_id = c_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. APPLY RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone_view_profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "user_update_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "user_insert_profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "view_enrolled_courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "manage_courses" ON public.courses FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "view_enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "manage_enrollments" ON public.enrollments FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "view_pending" ON public.pending_enrollments FOR SELECT USING (true);
CREATE POLICY "manage_pending" ON public.pending_enrollments FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "view_course_staff" ON public.course_staff FOR SELECT USING (true);
CREATE POLICY "manage_course_staff" ON public.course_staff FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "view_sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "manage_sessions" ON public.sessions FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "user_own_notes" ON public.notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "view_reflections" ON public.reflections FOR SELECT USING (
  privacy = 'public' OR auth.uid() = user_id OR public.is_professor(auth.uid()) OR 
  (privacy = 'class' AND public.is_enrolled(auth.uid(), (SELECT course_id FROM public.sessions WHERE id = session_id)))
);
CREATE POLICY "user_own_reflections" ON public.reflections FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "view_reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "user_own_reactions" ON public.reactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "view_comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "user_own_comments" ON public.comments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "view_chains" ON public.response_chains FOR SELECT USING (true);
CREATE POLICY "manage_chains" ON public.response_chains FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "user_own_essays" ON public.essays FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "view_public_essays" ON public.essays FOR SELECT USING (status IN ('submitted', 'graded', 'public'));

CREATE POLICY "view_annotations" ON public.annotations FOR SELECT USING (true);
CREATE POLICY "manage_annotations" ON public.annotations FOR ALL USING (public.is_professor(auth.uid()));

CREATE POLICY "manage_whitelist" ON public.allowed_emails FOR ALL USING (public.is_professor(auth.uid()));
CREATE POLICY "user_view_whitelist" ON public.allowed_emails FOR SELECT USING (LOWER(email) = LOWER(auth.jwt() ->> 'email'));

-- 7. APPLY TRIGGERS
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

DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
CREATE TRIGGER on_auth_user_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_auth_user_allowed();


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role;
    v_name TEXT;
    v_reg TEXT;
BEGIN
    SELECT role, name, register_number INTO v_role, v_name, v_reg
    FROM public.allowed_emails 
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email))
    LIMIT 1;

    INSERT INTO public.profiles (id, email, name, role, register_number)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(v_name, split_part(NEW.email, '@', 1)), 
        COALESCE(v_role, 'student'::public.user_role),
        v_reg
    );
    
    INSERT INTO public.enrollments (course_id, student_id)
    SELECT course_id, NEW.id 
    FROM public.pending_enrollments 
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email))
    ON CONFLICT DO NOTHING;

    DELETE FROM public.pending_enrollments 
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.email));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 8. INITIAL ADMIN ACCOUNTS
INSERT INTO public.allowed_emails (email, role)
VALUES 
    ('admin@sjcc.edu.in', 'admin'),
    ('vinay@sjcc.edu.in', 'admin'),
    ('vinay.kambipura@gmail.com', 'admin'),
    ('tester@sjcc.edu.in', 'student')
ON CONFLICT (email) DO NOTHING;
