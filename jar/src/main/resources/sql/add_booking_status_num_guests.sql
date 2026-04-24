-- Add status and num_guests columns to bookings table
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS num_guests INTEGER;
