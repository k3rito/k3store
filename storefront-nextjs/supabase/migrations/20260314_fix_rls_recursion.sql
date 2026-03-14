-- FIX RLS RECURSION MIGRATION
-- Syncs profiles.role to auth.users.raw_app_metadata_token -> 'role'
-- This allows RLS to check roles without querying the profiles table recursively.

-- 1. Create the sync function (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.sync_user_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_metadata_token = 
    COALESCE(raw_app_metadata_token, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_profile_role_sync ON public.profiles;
CREATE TRIGGER on_profile_role_sync
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_metadata();

-- 3. Initial sync for existing users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, role FROM public.profiles LOOP
    UPDATE auth.users
    SET raw_app_metadata_token = 
      COALESCE(raw_app_metadata_token, '{}'::jsonb) || 
      jsonb_build_object('role', r.role)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Rewrite RLS Policies to use JWT metadata instead of subqueries
-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'employee', 'editor')
);

DROP POLICY IF EXISTS "Super Admins can manage roles" ON profiles;
CREATE POLICY "Super Admins can manage roles" ON profiles FOR UPDATE USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
);

-- Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'employee')
);

-- Order Items
DROP POLICY IF EXISTS "Order items access" ON order_items;
CREATE POLICY "Order items access" ON order_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'employee')
    )
  )
);

-- Reviews
DROP POLICY IF EXISTS "Admins can moderate reviews" ON reviews;
CREATE POLICY "Admins can moderate reviews" ON reviews FOR DELETE USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor')
);

-- Products
DROP POLICY IF EXISTS "Public read access for products" ON products;
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (
  status = 'active' OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'editor')
);

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'editor')
);

-- Categories
DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'editor')
);

-- CMS & Settings
DROP POLICY IF EXISTS "Public view for published pages" ON dynamic_pages;
CREATE POLICY "Public view for published pages" ON dynamic_pages FOR SELECT USING (
  status = 'published' OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'editor')
);

DROP POLICY IF EXISTS "Admins manage pages" ON dynamic_pages;
CREATE POLICY "Admins manage pages" ON dynamic_pages FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor', 'editor')
);

DROP POLICY IF EXISTS "Admins manage settings" ON site_settings;
CREATE POLICY "Admins manage settings" ON site_settings FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'supervisor')
);
