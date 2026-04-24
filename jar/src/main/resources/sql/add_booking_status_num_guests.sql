-- Add status and num_guests columns to bookings table
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS num_guests INTEGER;

-- Normalize legacy lowercase / free-text status values to enum names expected by Hibernate
UPDATE bookings
SET status = CASE LOWER(TRIM(status))
    WHEN 'pending' THEN 'PENDING'
    WHEN 'confirmed' THEN 'CONFIRMED'
    WHEN 'cancelled' THEN 'CANCELLED'
    WHEN 'canceled' THEN 'CANCELLED'
    WHEN 'completed' THEN 'COMPLETED'
    ELSE 'PENDING'
END
WHERE status IS NULL
   OR status <> UPPER(status)
   OR status NOT IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
