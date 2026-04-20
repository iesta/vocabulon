-- Run this in Supabase SQL Editor to create the progress tracking table

CREATE TABLE IF NOT EXISTS user_card_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('vocab', 'phrase')),
  done BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Enable Row Level Security
ALTER TABLE user_card_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own progress
CREATE POLICY "Users manage own progress" ON user_card_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
