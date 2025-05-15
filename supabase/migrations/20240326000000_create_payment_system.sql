-- Create payment status enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded'
);

-- Create payment type enum
CREATE TYPE payment_type AS ENUM (
  'escrow',
  'milestone',
  'final'
);

-- Create escrow status enum
CREATE TYPE escrow_status AS ENUM (
  'pending',
  'funded',
  'released',
  'refunded',
  'disputed'
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  payment_type payment_type NOT NULL,
  stripe_payment_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escrow table
CREATE TABLE escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  status escrow_status DEFAULT 'pending',
  release_date TIMESTAMP WITH TIME ZONE,
  dispute_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  status payment_status DEFAULT 'pending',
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment receipts table
CREATE TABLE payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_gig_id ON payments(gig_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_creative_id ON payments(creative_id);
CREATE INDEX idx_escrow_payment_id ON escrow(payment_id);
CREATE INDEX idx_milestones_gig_id ON milestones(gig_id);
CREATE INDEX idx_payment_receipts_payment_id ON payment_receipts(payment_id);

-- Create function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(CAST(nextval('receipt_number_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for receipt numbers
CREATE SEQUENCE receipt_number_seq;

-- Create trigger for receipt number generation
CREATE TRIGGER set_receipt_number
  BEFORE INSERT ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION generate_receipt_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_updated_at
  BEFORE UPDATE ON escrow
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = creative_id);

CREATE POLICY "Clients can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Escrow policies
CREATE POLICY "Users can view their own escrow"
  ON escrow FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = escrow.payment_id
      AND (payments.client_id = auth.uid() OR payments.creative_id = auth.uid())
    )
  );

CREATE POLICY "Clients can create escrow"
  ON escrow FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = escrow.payment_id
      AND payments.client_id = auth.uid()
    )
  );

-- Milestones policies
CREATE POLICY "Users can view their own milestones"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = milestones.gig_id
      AND (gigs.client_id = auth.uid() OR gigs.creative_id = auth.uid())
    )
  );

CREATE POLICY "Clients can create milestones"
  ON milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = milestones.gig_id
      AND gigs.client_id = auth.uid()
    )
  );

-- Receipts policies
CREATE POLICY "Users can view their own receipts"
  ON payment_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_receipts.payment_id
      AND (payments.client_id = auth.uid() OR payments.creative_id = auth.uid())
    )
  ); 