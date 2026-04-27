CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_property_id ON messages(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
