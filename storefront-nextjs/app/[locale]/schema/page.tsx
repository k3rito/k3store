export default function TechnicalSpecification() {
  return (
    <div className="flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-4xl pt-16">
        <div style={{ padding: '24px', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333', backgroundColor: '#f9f9f9', height: '100%', overflowY: 'auto' }}>
          <h1 style={{ color: '#0055A4', borderBottom: '2px solid #0055A4', paddingBottom: '8px' }}>Technical Specification: Medical E-commerce</h1>
          
          <h2 style={{ color: '#0055A4', marginTop: '24px' }}>1. Tech Stack</h2>
          <ul>
            <li><strong>Frontend:</strong> Next.js (App Router), Tailwind CSS</li>
            <li><strong>Backend/Database:</strong> Supabase (PostgreSQL, Auth, Storage)</li>
            <li><strong>i18n:</strong> next-intl (Arabic RTL / English LTR support)</li>
          </ul>

          <h2 style={{ color: '#0055A4', marginTop: '24px' }}>2. Supabase SQL Schema</h2>
          <pre style={{ background: '#eee', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '14px' }}>
{`-- Profiles Table (Extended User Info)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'super_admin', 'supervisor', 'employee', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL(12,2) NOT NULL,
  stock INT DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  display_order INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
          </pre>

          <h2 style={{ color: '#0055A4', marginTop: '24px' }}>3. Core Features Implementation</h2>
          <p><strong>Auth & RBAC:</strong> Users are assigned specific professional roles. Middleware checks the role on login to redirect admins to <code>/admin</code>. Access is secured via JWT app_metadata.</p>
          <p><strong>Performance:</strong> Aggregated SQL metrics and unstable_cache for high-performance storefront delivery.</p>
          <p><strong>i18n Logic:</strong> Context-based language switching that toggles <code>dir=&quot;rtl&quot;</code> and swaps <code>name_en</code> for <code>name_ar</code>.</p>
        </div>
      </div>
    </div>
  );
}
