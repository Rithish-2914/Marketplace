-- SwapHands Supabase Database Schema (with camelCase columns)
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS lost_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (with camelCase columns)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "regNo" TEXT NOT NULL,
    branch TEXT NOT NULL,
    year INTEGER NOT NULL,
    "hostelBlock" TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
    "profilePictureUrl" TEXT NOT NULL,
    rating DECIMAL(3,1) DEFAULT 0,
    "ratingsCount" INTEGER DEFAULT 0,
    "isSuspended" BOOLEAN DEFAULT FALSE,
    wishlist TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sellerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    condition TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "openToExchange" BOOLEAN DEFAULT FALSE,
    "isSold" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lost Items table
CREATE TABLE lost_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    "locationFound" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "claimedBy" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "dateFound" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "itemId" UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    "reporterId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "lostItemId" UUID NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
    "claimantId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "proofImageUrl" TEXT NOT NULL,
    "billImageUrl" TEXT,
    comments TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_items_seller_id ON items("sellerId");
CREATE INDEX idx_items_created_at ON items("createdAt" DESC);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_lost_items_claimed_by ON lost_items("claimedBy");

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
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

-- Create RLS Policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON lost_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON complaints FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON claims FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (true);
CREATE POLICY "Users can insert lost items" ON lost_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert claims" ON claims FOR INSERT WITH CHECK (true);
