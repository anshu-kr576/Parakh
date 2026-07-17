-- Enable uuid-ossp extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for teacher authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Teacher',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create exam_papers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.exam_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    pdf_filename TEXT NOT NULL,
    parsed_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create evaluations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    pdf_filename TEXT NOT NULL,
    parsed_data JSONB NOT NULL,
    student_name TEXT,
    roll_number TEXT,
    exam_code TEXT,
    subject TEXT,
    obtained_marks NUMERIC,
    max_marks NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for tables to protect against public access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

