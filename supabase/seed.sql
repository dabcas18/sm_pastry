-- Seed data for the Products table

-- COOKIES
INSERT INTO "Products" ("name", "category", "price", "unit_type", "pieces_per_pack") VALUES
('Double Chocolate Chip', 'Cookies', 270.00, 'pack', 12),
('Chocolate Chip', 'Cookies', 200.00, 'pack', 12),
('Raisin Oatmeal', 'Cookies', 290.00, 'pack', 12),
('Sampler Set (3 flavors)', 'Cookies', 260.00, 'pack', 12);

-- CINNAMON ROLLS
INSERT INTO "Products" ("name", "category", "price", "unit_type", "pieces_per_pack") VALUES
('Raisin & Cashew', 'Cinnamon Rolls', 220.00, 'pack', 4),
('Cream Cheese', 'Cinnamon Rolls', 250.00, 'pack', 4),
('with Caramel Sauce', 'Cinnamon Rolls', 220.00, 'pack', 4);

-- SANDWICH
INSERT INTO "Products" ("name", "category", "price", "unit_type") VALUES
('Ham, Cheese & Egg', 'Sandwich', 270.00, 'piece'),
('Tuna, Crabstick & Mango', 'Sandwich', 270.00, 'piece'),
('Pepperoni and Cheese', 'Sandwich', 270.00, 'piece');

-- MALLOWS
INSERT INTO "Products" ("name", "category", "price", "unit_type") VALUES
('Plain with Chocolate', 'Mallows', 240.00, 'piece'),
('Ube with Chocolate', 'Mallows', 250.00, 'piece'),
('Mango with Chocolate', 'Mallows', 250.00, 'piece'),
('Strawberry with Chocolate', 'Mallows', 250.00, 'piece');

-- MUFFINS
INSERT INTO "Products" ("name", "category", "price", "unit_type") VALUES
('Double Chocolate Chocolate Chip', 'Muffins', 300.00, 'piece'),
('Chocolate Chip', 'Muffins', 280.00, 'piece'),
('Banana Cashew', 'Muffins', 300.00, 'piece'),
('Cashew & Chocolate', 'Muffins', 300.00, 'piece'),
('Perfect Mix (any 2)', 'Muffins', 300.00, 'piece'),
('Sampler Set (4 flavors)', 'Muffins', 300.00, 'piece');

-- LOAVES
INSERT INTO "Products" ("name", "category", "price", "unit_type") VALUES
('Classic Banana', 'Loaves', 250.00, 'piece'),
('Choco Banana Nut', 'Loaves', 300.00, 'piece'),
('Taisan', 'Loaves', 250.00, 'piece');

-- OTHERS
INSERT INTO "Products" ("name", "category", "price", "unit_type", "pieces_per_pack") VALUES
('Red Velvet Cupcakes (4pcs)', 'Others', 250.00, 'pack', 4),
('Brownies (6 pcs)', 'Others', 300.00, 'pack', 6),
('Brownies (9pcs)', 'Others', 425.00, 'pack', 9),
('Graham Balls (15pcs)', 'Others', 150.00, 'pack', 15);
