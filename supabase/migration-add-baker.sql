-- Migration: Add baker column to Products table and assign products to bakers
-- Run this after the initial schema and seed

-- Step 1: Add baker column to Products table
ALTER TABLE "Products"
ADD COLUMN "baker" VARCHAR(50) DEFAULT 'Unassigned';

-- Step 2: Assign products to Anna
-- Anna owns: Muffins, Brownies, Graham Balls
UPDATE "Products"
SET "baker" = 'Anna'
WHERE "category" = 'Muffins (Box of 4)'
   OR "name" LIKE '%Brownies%'
   OR "name" = 'Graham Balls (15pcs)';

-- Step 3: Assign products to Nicole
-- Nicole owns: Cookies, Cinnamon Rolls, Red Velvet Cupcakes
UPDATE "Products"
SET "baker" = 'Nicole'
WHERE "category" = 'Cookies (1 Dozen)'
   OR "category" = 'Cinnamon Rolls (Box of 4)'
   OR "name" = 'Red Velvet Cupcakes (4pcs)';

-- Step 4: Assign products to Mommy
-- Mommy owns: Sandwich, Mallows, Loaves, Cakes
UPDATE "Products"
SET "baker" = 'Mommy'
WHERE "category" = 'Sandwich'
   OR "category" = 'Mallows'
   OR "category" = 'Loaves'
   OR "category" = 'Cakes';
