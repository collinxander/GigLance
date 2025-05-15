-- Create enum for project categories
CREATE TYPE project_category AS ENUM (
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Video Production',
  'Music Production',
  'Photography',
  'Marketing',
  'Business',
  'Other'
);

-- Create enum for project status
CREATE TYPE project_status AS ENUM (
  'In Progress',
  'Completed',
  'On Hold',
  'Cancelled'
);

-- Create enum for review status
CREATE TYPE review_status AS ENUM (
  'Pending',
  'Published',
  'Rejected'
);

-- Create projects table with enhanced features
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category project_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  project_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status project_status DEFAULT 'In Progress',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_case_studies table
CREATE TABLE project_case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status review_status DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, reviewer_id)
);

-- Create verification_badges table
CREATE TABLE verification_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, type)
);

-- Add RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for project case studies
ALTER TABLE project_case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public case studies are viewable by everyone"
  ON project_case_studies FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own case studies"
  ON project_case_studies FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_case_studies.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own case studies"
  ON project_case_studies FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_case_studies.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own case studies"
  ON project_case_studies FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_case_studies.project_id
    AND projects.user_id = auth.uid()
  ));

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'Published');

CREATE POLICY "Users can insert reviews for their projects"
  ON reviews FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = reviews.project_id
    AND projects.reviewer_id = auth.uid()
  ));

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (reviewer_id = auth.uid());

-- Add RLS policies for verification badges
ALTER TABLE verification_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public badges are viewable by everyone"
  ON verification_badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage badges"
  ON verification_badges FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE creative_id = NEW.creative_id
    AND status = 'Published'
  )
  WHERE id = NEW.creative_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating average rating
CREATE TRIGGER update_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Create function to award verification badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Award "Top Rated" badge for users with high ratings
  IF (
    SELECT AVG(rating) >= 4.5
    FROM reviews
    WHERE creative_id = NEW.creative_id
    AND status = 'Published'
    AND created_at >= NOW() - INTERVAL '6 months'
  ) THEN
    INSERT INTO verification_badges (user_id, type, description)
    VALUES (NEW.creative_id, 'top_rated', 'Consistently receives high ratings')
    ON CONFLICT (user_id, type) DO NOTHING;
  END IF;

  -- Award "Verified" badge for users with sufficient reviews
  IF (
    SELECT COUNT(*) >= 10
    FROM reviews
    WHERE creative_id = NEW.creative_id
    AND status = 'Published'
  ) THEN
    INSERT INTO verification_badges (user_id, type, description)
    VALUES (NEW.creative_id, 'verified', 'Has received multiple positive reviews')
    ON CONFLICT (user_id, type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for awarding badges
CREATE TRIGGER award_badges_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges(); 