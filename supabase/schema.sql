-- ==========================================
-- PHASE 6: SUPABASE SCHEMA (Derived from UI)
-- ==========================================
-- Run this in your Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define custom enum types (derived from mock data arrays)
CREATE TYPE user_role AS ENUM ('student', 'professor', 'admin');
CREATE TYPE course_status AS ENUM ('active', 'archived');
CREATE TYPE reflection_privacy AS ENUM ('draft', 'class', 'public');
CREATE TYPE reflection_status AS ENUM ('draft', 'published');
CREATE TYPE note_type AS ENUM ('free', 'positioned', 'reading', 'link', 'fluid', 'quote');
CREATE TYPE comment_type AS ENUM ('extending', 'complicating', 'questioning', 'affirming');
CREATE TYPE reaction_type AS ENUM ('shifts', 'pushback', 'new');
CREATE TYPE annotation_move AS ENUM ('they-say', 'i-say', 'so-what', 'evidence', 'naysayer', 'context');
CREATE TYPE essay_status AS ENUM ('draft', 'submitted', 'graded', 'public');

-- 1. USERS
-- Handled mostly by Supabase Auth, but we maintain a public profile table.
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    right_now_i_think TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    semester TEXT NOT NULL,
    university TEXT NOT NULL,
    professor_id UUID REFERENCES public.profiles(id),
    featured_chain_id UUID, -- References response_chains later
    status course_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENROLLMENTS (Many-to-many courses_students)
CREATE TABLE public.enrollments (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (course_id, student_id)
);

-- 4. SESSIONS
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

-- 5. NOTES (Quote Vault / Fluid Editor saves)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    type note_type DEFAULT 'fluid',
    title TEXT,
    content TEXT,
    url TEXT,
    link_title TEXT,
    tags TEXT[],
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REFLECTIONS (Class writing)
CREATE TABLE public.reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    they_say_source JSONB, -- { type: 'prompt'|'classmate'|'passage', sourceId: 'uuid', text: 'str' }
    privacy reflection_privacy DEFAULT 'class',
    status reflection_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REACTIONS & COMMENTS
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type reaction_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reflection_id, user_id)
);

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type comment_type NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RESPONSE CHAINS
CREATE TABLE public.response_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT,
    reflection_ids UUID[], -- Array of reflection IDs in the chain
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter Course table to safely reference response_chain
ALTER TABLE public.courses ADD CONSTRAINT fk_course_chain FOREIGN KEY (featured_chain_id) REFERENCES public.response_chains(id) ON DELETE SET NULL;

-- 9. ESSAYS
CREATE TABLE public.essays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    sections JSONB, -- Fluid Blocks array: [{id, text, moveType, sourceType, sourceId}]
    status essay_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ANNOTATIONS (Professor Feedback)
CREATE TABLE public.annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reflection_id UUID REFERENCES public.reflections(id) ON DELETE CASCADE,
    essay_id UUID REFERENCES public.essays(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    paragraph_index INTEGER,
    move_type annotation_move,
    selected_text TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Make either reflection_id or essay_id required
ALTER TABLE public.annotations ADD CONSTRAINT check_annotation_target CHECK ( (reflection_id IS NOT NULL) OR (essay_id IS NOT NULL) );

-- Automation for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_notes_modtime BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_reflections_modtime BEFORE UPDATE ON public.reflections FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_essays_modtime BEFORE UPDATE ON public.essays FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
