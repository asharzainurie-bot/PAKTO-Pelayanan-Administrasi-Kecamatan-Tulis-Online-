-- SQL for Supabase Editor

-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  address TEXT,
  phone TEXT,
  village TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Kecamatan Profile table
CREATE TABLE kecamatan_profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT 'Kecamatan Tulis',
  address TEXT DEFAULT 'Alamat Kecamatan Tulis',
  phone TEXT DEFAULT '08123456789',
  logo_url TEXT,
  CONSTRAINT singleton CHECK (id = 1)
);

-- Insert default kecamatan profile
INSERT INTO kecamatan_profile (id, name, address, phone)
VALUES (1, 'Kecamatan Tulis', 'Alamat Kecamatan Tulis', '08123456789')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Requests table
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SKTM', 'Dispensasi Nikah')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requirements JSONB DEFAULT '[]'::jsonb,
  result_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kecamatan_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Policies for Kecamatan Profile
CREATE POLICY "Anyone can view kecamatan profile" ON kecamatan_profile FOR SELECT USING (true);
CREATE POLICY "Admins can update kecamatan profile" ON kecamatan_profile FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. Policies for Requests
CREATE POLICY "Users can view their own requests" ON requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requests" ON requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all requests" ON requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all requests" ON requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. Storage Policies (Run these in SQL Editor)
-- Requirements Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('requirements-bucket', 'requirements-bucket', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload requirements" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'requirements-bucket');
CREATE POLICY "Anyone can view requirements" ON storage.objects FOR SELECT USING (bucket_id = 'requirements-bucket');

-- Results Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('results-bucket', 'results-bucket', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload results" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'results-bucket' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can view results" ON storage.objects FOR SELECT USING (bucket_id = 'results-bucket');

-- 9. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
