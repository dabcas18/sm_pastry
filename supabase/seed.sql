-- Delete all existing data (in correct order to avoid foreign key violations)
DELETE FROM "OrderItems";  -- Delete order items first (references products)
DELETE FROM "Orders";       -- Delete orders second
DELETE FROM "Products";     -- Delete products last

-- Insert products from updated pricelist

-- COOKIES (1 Dozen = 12 pieces per pack)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Double Chocolate Chip', 'Cookies (1 Dozen)', 270, 'pack', 12, true),
(gen_random_uuid(), 'Chocolate Chip', 'Cookies (1 Dozen)', 200, 'pack', 12, true),
(gen_random_uuid(), 'Raisin Oatmeal', 'Cookies (1 Dozen)', 290, 'pack', 12, true),
(gen_random_uuid(), 'Sampler Set (3 flavors)', 'Cookies (1 Dozen)', 260, 'pack', 12, true);

-- CINNAMON ROLLS (Box of 4)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Raisin & Cashew', 'Cinnamon Rolls (Box of 4)', 220, 'pack', 4, true),
(gen_random_uuid(), 'Cream Cheese', 'Cinnamon Rolls (Box of 4)', 250, 'pack', 4, true),
(gen_random_uuid(), 'with Caramel Sauce', 'Cinnamon Rolls (Box of 4)', 220, 'pack', 4, true);

-- SANDWICH (per piece)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Ham, Cheese. & Egg', 'Sandwich', 270, 'piece', null, true),
(gen_random_uuid(), 'Tuna, Crabstick, & Mango', 'Sandwich', 270, 'piece', null, true),
(gen_random_uuid(), 'Pepperoni and Cheese', 'Sandwich', 270, 'piece', null, true),
(gen_random_uuid(), 'Chicken Salad', 'Sandwich', 270, 'piece', null, true);

-- MALLOWS (per piece)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Plain with Chocolate', 'Mallows', 240, 'piece', null, true),
(gen_random_uuid(), 'Ube with Chocolate', 'Mallows', 250, 'piece', null, true),
(gen_random_uuid(), 'Mango with Chocolate', 'Mallows', 250, 'piece', null, true),
(gen_random_uuid(), 'Strawberry with Chocolate', 'Mallows', 250, 'piece', null, true);

-- MUFFINS (Box of 4)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Double Chocolate', 'Muffins (Box of 4)', 300, 'pack', 4, true),
(gen_random_uuid(), 'Chocolate Chip', 'Muffins (Box of 4)', 280, 'pack', 4, true),
(gen_random_uuid(), 'Banana Cashew', 'Muffins (Box of 4)', 300, 'pack', 4, true),
(gen_random_uuid(), 'Cashew & Chocolate', 'Muffins (Box of 4)', 300, 'pack', 4, true),
(gen_random_uuid(), 'Perfect Mix (any 2)', 'Muffins (Box of 4)', 300, 'pack', 4, true),
(gen_random_uuid(), 'Sampler Set (4 flavors)', 'Muffins (Box of 4)', 300, 'pack', 4, true);

-- CAKES (per piece)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Pineapple Upside Down (S)', 'Cakes', 100, 'piece', null, true),
(gen_random_uuid(), 'Pineapple Upside Down (L)', 'Cakes', 350, 'piece', null, true);

-- LOAVES (per piece)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Classic Banana', 'Loaves', 250, 'piece', null, true),
(gen_random_uuid(), 'Choco Banana Nut', 'Loaves', 300, 'piece', null, true),
(gen_random_uuid(), 'Taisan', 'Loaves', 250, 'piece', null, true);

-- OTHERS (various packaging)
INSERT INTO "Products" (id, name, category, price, unit_type, pieces_per_pack, is_active) VALUES
(gen_random_uuid(), 'Red Velvet Cupcakes (4pcs)', 'Others', 250, 'pack', 4, true),
(gen_random_uuid(), 'Brownies (6pcs)', 'Others', 300, 'pack', 6, true),
(gen_random_uuid(), 'Brownies (9pcs)', 'Others', 425, 'pack', 9, true),
(gen_random_uuid(), 'Graham Balls (15pcs)', 'Others', 150, 'pack', 15, true);
