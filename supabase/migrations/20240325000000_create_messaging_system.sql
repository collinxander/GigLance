-- Create message status enum
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status message_status DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, creative_id, gig_id)
);

-- Create file attachments table
CREATE TABLE file_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message notifications table
CREATE TABLE message_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_creative_id ON conversations(creative_id);
CREATE INDEX idx_conversations_gig_id ON conversations(gig_id);
CREATE INDEX idx_file_attachments_message_id ON file_attachments(message_id);
CREATE INDEX idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX idx_message_notifications_message_id ON message_notifications(message_id);

-- Create function to update conversation's last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last_message_at
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Create function to create message notification
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    -- Get the recipient's ID (the other user in the conversation)
    SELECT 
        CASE 
            WHEN c.client_id = NEW.sender_id THEN c.creative_id
            ELSE c.client_id
        END INTO recipient_id
    FROM conversations c
    WHERE c.id = NEW.conversation_id;

    -- Create notification for the recipient
    INSERT INTO message_notifications (user_id, message_id)
    VALUES (recipient_id, NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for creating message notifications
CREATE TRIGGER create_message_notification_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();

-- Set up Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.client_id = auth.uid() OR c.creative_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (c.client_id = auth.uid() OR c.creative_id = auth.uid())
        )
    );

-- Create policies for conversations
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        client_id = auth.uid() OR creative_id = auth.uid()
    );

CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        client_id = auth.uid() OR creative_id = auth.uid()
    );

-- Create policies for file attachments
CREATE POLICY "Users can view file attachments in their conversations"
    ON file_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.id = file_attachments.message_id
            AND (c.client_id = auth.uid() OR c.creative_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert file attachments in their conversations"
    ON file_attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.id = message_id
            AND (c.client_id = auth.uid() OR c.creative_id = auth.uid())
        )
    );

-- Create policies for message notifications
CREATE POLICY "Users can view their notifications"
    ON message_notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
    ON message_notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid()); 