-- Fix product issues found in price list comparison

-- 1. Fix typo: "Ham, Cheese. & Egg" should be "Ham, Cheese, & Egg"
UPDATE "Products"
SET name = 'Ham, Cheese, & Egg'
WHERE name = 'Ham, Cheese. & Egg' AND category = 'Sandwich';

-- 2. Update Graham Balls to specify "Plain"
UPDATE "Products"
SET name = 'Graham Balls (Plain, 15pcs)'
WHERE name = 'Graham Balls (15pcs)' AND category = 'Others';

-- 3. Add missing Graham Balls (Mallows, 15pcs) - ₱250
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active)
VALUES (gen_random_uuid(), 'Graham Balls (Mallows, 15pcs)', 'Others', 250, 'pack', 15, true);
