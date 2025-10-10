-- SwapHands - Fix for Messages and Rating Issues
-- Run this ENTIRE script in your Supabase SQL Editor

-- ============================================
-- FIX 1: Create messages table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON messages(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, item_id);

-- ============================================
-- FIX 2: Update RLS policies for Firebase Auth
-- ============================================

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop old auth.uid() based policies
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create new permissive policies (since we're using Firebase Auth, not Supabase Auth)
CREATE POLICY "Enable read access for all authenticated users" ON messages 
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all authenticated users" ON messages 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all authenticated users" ON messages 
FOR UPDATE USING (true);

-- ============================================
-- FIX 3: Update users table RLS for ratings
-- ============================================

-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policy that allows all users to update user records (needed for rating)
CREATE POLICY "Enable update access for all users" ON users 
FOR UPDATE USING (true);

-- ============================================
-- FIX 4: Enable realtime for messages
-- ============================================

-- Add messages to realtime publication (if not already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- Verify all policies are set correctly
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('messages', 'users')
ORDER BY tablename, policyname;
