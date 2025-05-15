-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    proposal_amount DECIMAL NOT NULL,
    estimated_timeline TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(gig_id, creative_id)
);

-- Create index for better query performance
CREATE INDEX idx_applications_gig_id ON applications(gig_id);
CREATE INDEX idx_applications_creative_id ON applications(creative_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Creatives can view their own applications"
  ON public.applications FOR SELECT
  USING (creative_id = auth.uid());

CREATE POLICY "Clients can view applications for their gigs"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gigs g
      WHERE g.id = applications.gig_id
      AND g.client_id = auth.uid()
    )
  );

CREATE POLICY "Creatives can insert their own applications"
  ON public.applications FOR INSERT
  WITH CHECK (creative_id = auth.uid());

CREATE POLICY "Creatives can update their own applications"
  ON public.applications FOR UPDATE
  USING (creative_id = auth.uid())
  WITH CHECK (
    -- Only allow updating if status is pending or withdrawn
    (status IN ('pending', 'withdrawn'))
    AND 
    (creative_id = auth.uid())
  );

CREATE POLICY "Clients can update application status for their gigs"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gigs g
      WHERE g.id = applications.gig_id
      AND g.client_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Clients can only change status to accepted or rejected
    (NEW.status IN ('accepted', 'rejected'))
    AND
    EXISTS (
      SELECT 1 FROM public.gigs g
      WHERE g.id = applications.gig_id
      AND g.client_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER on_application_updated
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_application_updated_at(); 