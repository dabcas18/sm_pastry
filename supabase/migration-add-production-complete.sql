-- Add is_production_complete column to Orders table
-- This tracks whether the baker has finished making/packing the order
-- Separate from is_completed which tracks customer pickup/delivery

ALTER TABLE "Orders"
ADD COLUMN "is_production_complete" BOOLEAN DEFAULT false;

-- Optional: Add comment to clarify the difference
COMMENT ON COLUMN "Orders"."is_production_complete" IS 'Indicates if the baker has finished making/packing the order';
COMMENT ON COLUMN "Orders"."is_completed" IS 'Indicates if the customer has picked up/received the order';
