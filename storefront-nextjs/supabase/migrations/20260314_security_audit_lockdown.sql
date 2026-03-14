-- SECURITY AUDIT LOCKDOWN MIGRATION
-- Enforces RLS and strict access control for production readiness.

-- 1. Enable RLS on all critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pages ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'employee', 'editor'))
);

DROP POLICY IF EXISTS "Super Admins can manage roles" ON profiles;
CREATE POLICY "Super Admins can manage roles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- 3. Orders & Order Items Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'employee'))
);

DROP POLICY IF EXISTS "Order items access" ON order_items;
CREATE POLICY "Order items access" ON order_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'employee')))
  )
);

-- 4. Reviews Policies
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own reviews" ON reviews;
CREATE POLICY "Users can manage their own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can moderate reviews" ON reviews;
CREATE POLICY "Admins can moderate reviews" ON reviews FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor'))
);

-- 5. Products & Categories (Read-only for users, full for admins)
DROP POLICY IF EXISTS "Public read access for products" ON products;
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (status = 'active' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'editor')));

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'editor'))
);

DROP POLICY IF EXISTS "Public read access for categories" ON categories;
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'editor'))
);

-- 6. CMS & Settings
DROP POLICY IF EXISTS "Public view for published pages" ON dynamic_pages;
CREATE POLICY "Public view for published pages" ON dynamic_pages FOR SELECT USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'editor')));

DROP POLICY IF EXISTS "Admins manage pages" ON dynamic_pages;
CREATE POLICY "Admins manage pages" ON dynamic_pages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor', 'editor'))
);

DROP POLICY IF EXISTS "Public settings view" ON site_settings;
CREATE POLICY "Public settings view" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON site_settings;
CREATE POLICY "Admins manage settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'supervisor'))
);
