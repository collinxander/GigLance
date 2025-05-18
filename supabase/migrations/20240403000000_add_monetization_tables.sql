-- Create subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
    features JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create commission settings table
CREATE TABLE commission_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    percentage DECIMAL(5,2) NOT NULL,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create escrow table
CREATE TABLE escrow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'released', 'disputed', 'refunded')),
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create featured listings table
CREATE TABLE featured_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, interval, features) VALUES
    ('Basic', 0.00, 'month', '{
        "profile_views": 100,
        "portfolio_items": 5,
        "search_visibility": "standard",
        "messaging": false,
        "analytics": false,
        "custom_domain": false
    }'),
    ('Pro', 9.99, 'month', '{
        "profile_views": 1000,
        "portfolio_items": 20,
        "search_visibility": "priority",
        "messaging": true,
        "analytics": "basic",
        "custom_domain": false
    }'),
    ('Premium', 19.99, 'month', '{
        "profile_views": "unlimited",
        "portfolio_items": "unlimited",
        "search_visibility": "featured",
        "messaging": true,
        "analytics": "advanced",
        "custom_domain": true
    }');

-- Insert default commission settings
INSERT INTO commission_settings (percentage, min_amount, max_amount) VALUES
    (5.00, 10.00, 1000.00);

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies
CREATE POLICY "Subscription plans are viewable by everyone"
    ON subscription_plans FOR SELECT
    USING (true);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
    ON user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Commission settings policies
CREATE POLICY "Commission settings are viewable by everyone"
    ON commission_settings FOR SELECT
    USING (true);

-- Escrow policies
CREATE POLICY "Users can view their own escrow transactions"
    ON escrow FOR SELECT
    USING (
        auth.uid() IN (
            SELECT creator_id FROM gigs WHERE id = escrow.gig_id
            UNION
            SELECT client_id FROM gigs WHERE id = escrow.gig_id
        )
    );

-- Featured listings policies
CREATE POLICY "Featured listings are viewable by everyone"
    ON featured_listings FOR SELECT
    USING (true);

CREATE POLICY "Users can create featured listings for their own gigs"
    ON featured_listings FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT client_id FROM gigs WHERE id = featured_listings.gig_id
        )
    ); 