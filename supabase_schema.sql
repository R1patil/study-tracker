-- Supabase SQL Schema for Jarvis Study Tracker
-- Copy and paste this script into your Supabase SQL Editor to create the necessary tables.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    app TEXT NOT NULL,
    title TEXT,
    duration_seconds INT NOT NULL DEFAULT 5,
    category TEXT NOT NULL, -- productive | passive | distracted | idle
    is_productive BOOLEAN NOT NULL DEFAULT FALSE,
    keystrokes INT DEFAULT 0,
    late_night BOOLEAN DEFAULT FALSE
);

-- Index for querying activity logs by user and time range
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_time 
ON public.activity_logs (user_id, timestamp DESC);

-- 3. Curriculum Progress Table
CREATE TABLE IF NOT EXISTS public.curriculum_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    title TEXT NOT NULL,
    track TEXT NOT NULL,
    section TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started', -- not_started | in_progress | done
    notes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

-- 4. Calendar Events Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    event_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL, -- study | exam | lecture
    PRIMARY KEY (user_id, event_id)
);

-- 5. YouTube History Table
CREATE TABLE IF NOT EXISTS public.youtube_history (
    video_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    channel TEXT,
    topic_id TEXT,
    status TEXT NOT NULL DEFAULT 'unwatched', -- watched | unwatched
    watched_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, video_id)
);

-- 6. Wisdom Antidotes Table (Global reference table, not user-bound)
CREATE TABLE IF NOT EXISTS public.wisdom_antidotes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    source_book TEXT,
    category TEXT,
    exercise_type TEXT,
    instructions TEXT,
    media_path TEXT,
    youtube_id TEXT
);

-- Populate default wisdom antidotes if empty
INSERT INTO public.wisdom_antidotes (id, text, source_book, category, exercise_type, instructions, media_path, youtube_id)
VALUES 
('w01', 'Yogas Chitta Vritti Nirodha', 'Patanjali Yoga Sutras (1.2)', 'rajasic_antidote', 'quote', 'Yoga is the silencing of the modifications of the mind. Close your eyes and watch your thoughts settle like silt in a lake.', '', ''),
('w02', 'Tatah Ksheeyate Prakasha Avaranam', 'Patanjali Yoga Sutras (2.52)', 'tamasic_antidote', 'quote', 'Through Pranayama (breath control), the veil that covers the inner light is destroyed, revealing clarity.', '', ''),
('w03', 'Karmanye Vadhikaraste Ma Phaleshu Kadachana', 'Bhagavad Gita (2.47)', 'tamasic_antidote', 'quote', 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Shift your focus back to building.', '', ''),
('w04', 'Anulom Vilom (Alternate Nostril Breathing)', 'Pranayama Manual', 'rajasic_antidote', 'pranayama', 'Calms the nervous system and balances the left/right hemispheres of the brain. Inhale through the left nostril for 4s, hold, exhale through the right for 4s, repeat.', '/assets/yoga/anulom_vilom.gif', 'vLd_Xz1oM1I'),
('w05', 'Kapalbhati (Shining Skull Breath)', 'Pranayama Manual', 'tamasic_antidote', 'pranayama', 'Increases oxygen saturation, burns lethargy (Tamas), and wakes up the frontal brain. Forcefully exhale through your nose while drawing your belly in, then inhale passively.', '/assets/yoga/breath_bubble.gif', '4qS83S8w8OQ'),
('w06', 'Shoulder & Chest Opener (Bhujangasana Stretch)', 'Yoga Asanas', 'sattvic_nurture', 'asana', 'Relieves coding desk fatigue, improves blood circulation, and aligns the spine. Interlace your fingers behind your back, squeeze your shoulder blades, and look up gently.', '/assets/yoga/shoulder_stretch.jpg', ''),
('w07', 'Box Breathing (Sama Vritti)', 'Pranayama Manual', 'rajasic_antidote', 'pranayama', 'Deeply grounding. Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds. Repeat for 4 cycles.', '/assets/yoga/breath_bubble.gif', ''),
('w08', 'Bhramari Pranayama (Humming Bee Breath)', 'Pranayama Manual', 'rajasic_antidote', 'pranayama', 'Instantly reduces mental noise and anxiety. Close your ears with your thumbs, rest fingers on your eyes, take a deep breath, and make a deep humming sound on exhale.', '/assets/yoga/breath_bubble.gif', '')
ON CONFLICT (id) DO NOTHING;

-- 7. Study Sessions Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_mins DOUBLE PRECISION NOT NULL,
    topic_id TEXT,
    topic_title TEXT NOT NULL
);

-- Index on study sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions (user_id, date);

-- 8. User Streaks Table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_study_date DATE,
    active_timer JSONB DEFAULT NULL
);

-- 9. Google Searches Table
CREATE TABLE IF NOT EXISTS public.google_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    category TEXT DEFAULT 'General'
);

-- Index on google searches
CREATE INDEX IF NOT EXISTS idx_google_searches_user ON public.google_searches (user_id, timestamp DESC);

-- 10. Coral SQL Compatibility Schemas & Views
-- This maps the legacy Coral SQL query schemas/tables to our new Supabase tables
-- so the Jarvis AI Agent can run unchanged Coral SQL queries on the live DB!

CREATE SCHEMA IF NOT EXISTS student_activity;
CREATE OR REPLACE VIEW student_activity.activity AS 
SELECT timestamp, app, title, duration_seconds, is_productive, category, keystrokes, late_night 
FROM public.activity_logs;

CREATE SCHEMA IF NOT EXISTS student_progress;
CREATE OR REPLACE VIEW student_progress.progress AS 
SELECT topic_id, title, track, section, status, notes, updated_at 
FROM public.curriculum_progress;

CREATE SCHEMA IF NOT EXISTS student_calendar;
CREATE OR REPLACE VIEW student_calendar.events AS 
SELECT event_id, title, start_time, end_time, category 
FROM public.calendar_events;

CREATE SCHEMA IF NOT EXISTS student_searches;
CREATE OR REPLACE VIEW student_searches.searches AS 
SELECT query, timestamp, category 
FROM public.google_searches;

CREATE SCHEMA IF NOT EXISTS student_youtube;
CREATE OR REPLACE VIEW student_youtube.videos AS 
SELECT video_id, title, channel, topic_id, status, watched_at 
FROM public.youtube_history;

CREATE SCHEMA IF NOT EXISTS student_wisdom;
CREATE OR REPLACE VIEW student_wisdom.wisdom AS 
SELECT id, text, source_book, category, exercise_type, instructions, media_path, youtube_id 
FROM public.wisdom_antidotes;

-- 11. Disable Row Level Security (RLS) for all tables to allow simple REST API insertions (useful for offline daemon & migration)
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.curriculum_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.youtube_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wisdom_antidotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_searches DISABLE ROW LEVEL SECURITY;

-- 12. Stored Procedure for executing AI-generated queries (SECURITY DEFINER to bypass RLS for AI queries)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
    RETURN COALESCE(result, '[]'::json);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
