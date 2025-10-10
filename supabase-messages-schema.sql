-- SwapHands Messaging System Schema
-- Run this in your Supabase SQL Editor to add messaging functionality

-- Messages table
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

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
-- Users can read messages where they are either sender or receiver
CREATE POLICY "Users can read their own messages" ON messages 
FOR SELECT 
USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id);

-- Users can insert messages where they are the sender
CREATE POLICY "Users can send messages" ON messages 
FOR INSERT 
WITH CHECK (auth.uid()::text = sender_id);

-- Users can update their own sent messages
CREATE POLICY "Users can update their own messages" ON messages 
FOR UPDATE 
USING (auth.uid()::text = sender_id);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
