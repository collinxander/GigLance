-- Create user_type enum
CREATE TYPE user_type AS ENUM ('client', 'creative');

-- Create interests categories
CREATE TABLE interest_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate interest categories
INSERT INTO interest_categories (name) VALUES
  ('Web Development'),
  ('Mobile Development'),
  ('UI/UX Design'),
  ('Graphic Design'),
  ('Content Writing'),
  ('Video Production'),
  ('Music Production'),
  ('Photography'),
  ('Marketing'),
  ('Business'),
  ('Data Science'),
  ('Machine Learning'),
  ('Game Development'),
  ('Animation'),
  ('Social Media');

-- Add user_type and interests to profiles
ALTER TABLE profiles 
ADD COLUMN user_type user_type,
ADD COLUMN interests UUID[] DEFAULT '{}';

-- Create onboarding_status
ALTER TABLE profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create RLS policy for interest categories
ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view interest categories"
  ON interest_categories FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX profiles_user_type_idx ON profiles(user_type);
CREATE INDEX profiles_interests_idx ON profiles USING GIN(interests); 