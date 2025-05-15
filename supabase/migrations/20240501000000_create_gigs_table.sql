-- Create gigs table
CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    timeline TEXT,
    remote_ok BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_gigs_client_id ON gigs(client_id);
CREATE INDEX idx_gigs_category ON gigs(category);
CREATE INDEX idx_gigs_status ON gigs(status);

-- Enable RLS
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public gigs are viewable by everyone"
  ON public.gigs FOR SELECT
  USING (status = 'open');

CREATE POLICY "Users can view all their own gigs"
  ON public.gigs FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert their own gigs"
  ON public.gigs FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update their own gigs"
  ON public.gigs FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Users can delete their own gigs"
  ON public.gigs FOR DELETE
  USING (client_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_gig_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER on_gig_updated
  BEFORE UPDATE ON public.gigs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_gig_updated_at(); 