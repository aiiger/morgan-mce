-- Imperial ERP Sovereign Backbone Migration
-- Replicates VeroPM logic for local hosting

CREATE TABLE IF NOT EXISTS imperial_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    portfolio TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Draft',
    type TEXT,
    visibility TEXT DEFAULT 'Public',
    budget DECIMAL(15, 2),
    spent DECIMAL(15, 2),
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    description TEXT,
    financials JSONB DEFAULT '{}'::jsonb,
    risk_level TEXT DEFAULT 'Low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imperial_tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    client TEXT,
    submission_date DATE,
    status TEXT DEFAULT 'Draft',
    compliance_score INTEGER DEFAULT 0,
    estimated_value DECIMAL(15, 2),
    rfq_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_imperial_projects_updated_at
    BEFORE UPDATE ON imperial_projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
