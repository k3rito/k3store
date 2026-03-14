-- Profiles updates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletters Table
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    attachment_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Audit Logs (Admins only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor'))
);

-- RLS for Newsletters (Admins only)
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage newsletters" ON newsletters FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'editor'))
);
