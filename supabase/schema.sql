-- Create table for storing user progress
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  progress_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read/write their own progress
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Note: You'll also need to enable Google auth in Supabase Dashboard
-- Go to Authentication → Providers → Google and enter:
-- Client ID: 549337296430-js98uihnf6evlkn4h5mga7jpjicqsgeo.apps.googleusercontent.com
-- Client Secret: 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