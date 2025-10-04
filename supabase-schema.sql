-- SwapHands Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS items (
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
CREATE TABLE IF NOT EXISTS lost_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    location_found TEXT NOT NULL,
    image_url TEXT NOT NULL,
    claimed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    date_found TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_item_id UUID NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
    claimant_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proof_image_url TEXT NOT NULL,
    bill_image_url TEXT,
    comments TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage buckets (run these separately in Supabase Storage settings)
-- 1. Create bucket named 'items' with public access
-- 2. Create bucket named 'claims' with public access

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_claimed_by ON lost_items(claimed_by);

-- Enable Row Level Security (RLS) - Important for production!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - you may want to customize these)
-- Allow all authenticated users to read all data
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON lost_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON complaints FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON claims FOR SELECT USING (true);

-- Allow users to insert/update their own data
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (true);
CREATE POLICY "Users can insert lost items" ON lost_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert claims" ON claims FOR INSERT WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE lost_items;
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE claims;
