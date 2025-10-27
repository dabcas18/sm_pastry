-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE "Products" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "unit_type" VARCHAR(50) NOT NULL, -- Using VARCHAR instead of ENUM for flexibility
  "pieces_per_pack" INTEGER,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE "Orders" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_name" VARCHAR(255) NOT NULL,
  "order_date" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "total_amount" DECIMAL(10,2) NOT NULL,
  "is_paid" BOOLEAN DEFAULT false,
  "is_completed" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items Table
CREATE TABLE "OrderItems" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" uuid NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "Products"(id),
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for foreign keys for performance
CREATE INDEX ON "OrderItems" ("order_id");
CREATE INDEX ON "OrderItems" ("product_id");

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Orders table
CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON "Orders"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Trigger for Products table
CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON "Products"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();