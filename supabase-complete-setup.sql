-- SwapHands Complete Supabase Setup
-- Run this ENTIRE script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if any (to start fresh)
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS lost_items CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (using snake_case for PostgreSQL)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    reg_no TEXT NOT NULL,
    branch TEXT NOT NULL,
    year INTEGER NOT NULL,
    hostel_block TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
    profile_picture_url TEXT NOT NULL,
    rating DECIMAL(3,1) DEFAULT 0,
    ratings_count INTEGER DEFAULT 0,
    is_suspended BOOLEAN DEFAULT FALSE,
    wishlist TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    condition TEXT NOT NULL,
    image_url TEXT NOT NULL,
    open_to_exchange BOOLEAN DEFAULT FALSE,
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lost Items table
CREATE TABLE lost_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    location_found TEXT NOT NULL,
    image_url TEXT NOT NULL,
    claimed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    date_found TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_item_id UUID NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
    claimant_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proof_image_url TEXT NOT NULL,
    bill_image_url TEXT,
    comments TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_items_seller_id ON items(seller_id);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_lost_items_claimed_by ON lost_items(claimed_by);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON items;
DROP POLICY IF EXISTS "Enable read access for all users" ON lost_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON complaints;
DROP POLICY IF EXISTS "Enable read access for all users" ON claims;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Users can insert lost items" ON lost_items;
DROP POLICY IF EXISTS "Users can insert complaints" ON complaints;
DROP POLICY IF EXISTS "Users can insert claims" ON claims;

-- RLS Policies - Read access
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON lost_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON complaints FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON claims FOR SELECT USING (true);

-- RLS Policies - Write access
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (true);
CREATE POLICY "Users can insert lost items" ON lost_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert claims" ON claims FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE lost_items;
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE claims;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('items', 'items', true),
  ('claims', 'claims', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated deletes" ON storage.objects;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id IN ('items', 'claims'));

CREATE POLICY "Authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id IN ('items', 'claims') AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated updates" ON storage.objects 
FOR UPDATE USING (bucket_id IN ('items', 'claims') AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated deletes" ON storage.objects 
FOR DELETE USING (bucket_id IN ('items', 'claims') AND auth.role() = 'authenticated');
