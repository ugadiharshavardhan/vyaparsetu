-- Normalize category taxonomy: dedicated subcategories table (no JSON on categories).
-- Seeds FMCG wholesale categories + subcategories from product taxonomy.

-- 1) Subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subcategories_category_slug_unique UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS subcategories_category_id_idx ON public.subcategories (category_id);
CREATE INDEX IF NOT EXISTS subcategories_slug_idx ON public.subcategories (slug);

-- 2) Product FK to subcategory (keep sub_category text as denormalized slug for filters)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS products_subcategory_id_idx ON public.products (subcategory_id);

-- 3) Drop JSON column from categories
ALTER TABLE public.categories DROP COLUMN IF EXISTS sub_categories;

-- 4) Ensure admin helper exists (takes uuid — matches other catalog policies)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins a WHERE a.id = _user_id);
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- 5) RLS + grants
GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT ALL ON public.subcategories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.subcategories TO authenticated;

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subcategories public read" ON public.subcategories;
CREATE POLICY "subcategories public read"
  ON public.subcategories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "subcategories admin write" ON public.subcategories;
CREATE POLICY "subcategories admin write"
  ON public.subcategories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS subcategories_updated ON public.subcategories;
CREATE TRIGGER subcategories_updated
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Replace catalog taxonomy with the FMCG list below.
-- Detach products first so category FK (ON DELETE RESTRICT) allows replacement.
UPDATE public.products SET subcategory_id = NULL, sub_category = NULL;
-- Temporarily point products at a staging category so we can drop old rows
INSERT INTO public.categories (id, slug, name, icon, image, product_count, description)
VALUES ('c-__staging__', '__staging__', 'Staging', 'Store', '', 0, 'Temporary staging row during taxonomy migration')
ON CONFLICT (id) DO NOTHING;

UPDATE public.products SET category_slug = '__staging__'
WHERE category_slug IS DISTINCT FROM '__staging__';

DELETE FROM public.subcategories;
DELETE FROM public.categories WHERE slug <> '__staging__';

INSERT INTO public.categories (id, slug, name, icon, image, product_count, description) VALUES
  ('c-food-grains-cereals', 'food-grains-cereals', 'Food Grains & Cereals', 'Wheat', '', 0, 'Rice, millets and cereal grains for wholesale restock.'),
  ('c-pulses-dal', 'pulses-dal', 'Pulses (Dal)', 'Leaf', '', 0, 'Toor, moong, urad and other dals for kirana & HORECA.'),
  ('c-flour-atta', 'flour-atta', 'Flour & Atta', 'Cookie', '', 0, 'Wheat atta, maida, besan and specialty flours.'),
  ('c-rice-products', 'rice-products', 'Rice Products', 'Soup', '', 0, 'Basmati, sona masoori, poha and brown rice.'),
  ('c-spices', 'spices', 'Spices', 'Flame', '', 0, 'Powders, whole spices and masala blends.'),
  ('c-salt-sugar', 'salt-sugar', 'Salt & Sugar', 'Droplets', '', 0, 'Salt, sugar and jaggery staples.'),
  ('c-cooking-oils', 'cooking-oils', 'Cooking Oils', 'Droplet', '', 0, 'Sunflower, mustard, coconut and other cooking oils.'),
  ('c-snacks-bakery', 'snacks-bakery', 'Snacks & Bakery', 'Cookie', '', 0, 'Biscuits, bread, namkeen and bakery items.'),
  ('c-tea-coffee', 'tea-coffee', 'Tea & Coffee', 'Coffee', '', 0, 'Tea, coffee and instant beverage powders.'),
  ('c-dry-fruits-nuts', 'dry-fruits-nuts', 'Dry Fruits & Nuts', 'Nut', '', 0, 'Almonds, cashews, raisins and mixed nuts.'),
  ('c-packaged-foods', 'packaged-foods', 'Packaged Foods', 'ShoppingBasket', '', 0, 'Noodles, pasta, pickles, papad and sauces.'),
  ('c-beverages', 'beverages', 'Beverages', 'CupSoda', '', 0, 'Juices, soft drinks, energy drinks and water.'),
  ('c-household-essentials', 'household-essentials', 'Household Essentials', 'Sparkles', '', 0, 'Detergents, cleaners, soap and dish wash.'),
  ('c-personal-care', 'personal-care', 'Personal Care', 'Heart', '', 0, 'Oral care, hair care and face wash essentials.');

INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  -- Food Grains & Cereals
  ('sc-food-grains-cereals-rice', 'c-food-grains-cereals', 'rice', 'Rice', 1),
  ('sc-food-grains-cereals-ragi', 'c-food-grains-cereals', 'ragi', 'Ragi', 2),
  ('sc-food-grains-cereals-jowar', 'c-food-grains-cereals', 'jowar', 'Jowar', 3),
  ('sc-food-grains-cereals-bajra', 'c-food-grains-cereals', 'bajra', 'Bajra', 4),
  ('sc-food-grains-cereals-barley', 'c-food-grains-cereals', 'barley', 'Barley', 5),
  ('sc-food-grains-cereals-millets', 'c-food-grains-cereals', 'millets', 'Millets', 6),
  -- Pulses (Dal)
  ('sc-pulses-dal-toor-dal', 'c-pulses-dal', 'toor-dal', 'Toor Dal', 1),
  ('sc-pulses-dal-moong-dal', 'c-pulses-dal', 'moong-dal', 'Moong Dal', 2),
  ('sc-pulses-dal-urad-dal', 'c-pulses-dal', 'urad-dal', 'Urad Dal', 3),
  ('sc-pulses-dal-chana-dal', 'c-pulses-dal', 'chana-dal', 'Chana Dal', 4),
  ('sc-pulses-dal-masoor-dal', 'c-pulses-dal', 'masoor-dal', 'Masoor Dal', 5),
  ('sc-pulses-dal-rajma', 'c-pulses-dal', 'rajma', 'Rajma', 6),
  ('sc-pulses-dal-green-gram', 'c-pulses-dal', 'green-gram', 'Green Gram', 7),
  -- Flour & Atta
  ('sc-flour-atta-wheat-flour-atta', 'c-flour-atta', 'wheat-flour-atta', 'Wheat Flour (Atta)', 1),
  ('sc-flour-atta-maida', 'c-flour-atta', 'maida', 'Maida', 2),
  ('sc-flour-atta-ragi-flour', 'c-flour-atta', 'ragi-flour', 'Ragi Flour', 3),
  ('sc-flour-atta-besan', 'c-flour-atta', 'besan', 'Besan', 4),
  ('sc-flour-atta-rice-flour', 'c-flour-atta', 'rice-flour', 'Rice Flour', 5),
  ('sc-flour-atta-corn-flour', 'c-flour-atta', 'corn-flour', 'Corn Flour', 6),
  ('sc-flour-atta-multigrain-flour', 'c-flour-atta', 'multigrain-flour', 'Multigrain Flour', 7),
  ('sc-flour-atta-sooji-semolina', 'c-flour-atta', 'sooji-semolina', 'Sooji (Semolina)', 8),
  -- Rice Products
  ('sc-rice-products-basmati-rice', 'c-rice-products', 'basmati-rice', 'Basmati Rice', 1),
  ('sc-rice-products-sona-masoori', 'c-rice-products', 'sona-masoori', 'Sona Masoori', 2),
  ('sc-rice-products-poha', 'c-rice-products', 'poha', 'Poha', 3),
  ('sc-rice-products-brown-rice', 'c-rice-products', 'brown-rice', 'Brown Rice', 4),
  -- Spices
  ('sc-spices-turmeric-powder', 'c-spices', 'turmeric-powder', 'Turmeric Powder', 1),
  ('sc-spices-red-chilli-powder', 'c-spices', 'red-chilli-powder', 'Red Chilli Powder', 2),
  ('sc-spices-coriander-powder', 'c-spices', 'coriander-powder', 'Coriander Powder', 3),
  ('sc-spices-cumin', 'c-spices', 'cumin', 'Cumin', 4),
  ('sc-spices-pepper', 'c-spices', 'pepper', 'Pepper', 5),
  ('sc-spices-garam-masala', 'c-spices', 'garam-masala', 'Garam Masala', 6),
  ('sc-spices-cardamom', 'c-spices', 'cardamom', 'Cardamom', 7),
  ('sc-spices-cloves', 'c-spices', 'cloves', 'Cloves', 8),
  ('sc-spices-cinnamon', 'c-spices', 'cinnamon', 'Cinnamon', 9),
  ('sc-spices-mustard-seeds', 'c-spices', 'mustard-seeds', 'Mustard Seeds', 10),
  -- Salt & Sugar
  ('sc-salt-sugar-rock-salt', 'c-salt-sugar', 'rock-salt', 'Rock Salt', 1),
  ('sc-salt-sugar-iodized-salt', 'c-salt-sugar', 'iodized-salt', 'Iodized Salt', 2),
  ('sc-salt-sugar-sugar', 'c-salt-sugar', 'sugar', 'Sugar', 3),
  ('sc-salt-sugar-jaggery', 'c-salt-sugar', 'jaggery', 'Jaggery', 4),
  ('sc-salt-sugar-jaggery-powder', 'c-salt-sugar', 'jaggery-powder', 'Jaggery Powder', 5),
  -- Cooking Oils
  ('sc-cooking-oils-sunflower-oil', 'c-cooking-oils', 'sunflower-oil', 'Sunflower Oil', 1),
  ('sc-cooking-oils-groundnut-oil', 'c-cooking-oils', 'groundnut-oil', 'Groundnut Oil', 2),
  ('sc-cooking-oils-mustard-oil', 'c-cooking-oils', 'mustard-oil', 'Mustard Oil', 3),
  ('sc-cooking-oils-coconut-oil', 'c-cooking-oils', 'coconut-oil', 'Coconut Oil', 4),
  ('sc-cooking-oils-sesame-oil', 'c-cooking-oils', 'sesame-oil', 'Sesame Oil', 5),
  ('sc-cooking-oils-palm-oil', 'c-cooking-oils', 'palm-oil', 'Palm Oil', 6),
  ('sc-cooking-oils-rice-bran-oil', 'c-cooking-oils', 'rice-bran-oil', 'Rice Bran Oil', 7),
  -- Snacks & Bakery
  ('sc-snacks-bakery-biscuits', 'c-snacks-bakery', 'biscuits', 'Biscuits', 1),
  ('sc-snacks-bakery-cookies', 'c-snacks-bakery', 'cookies', 'Cookies', 2),
  ('sc-snacks-bakery-rusks', 'c-snacks-bakery', 'rusks', 'Rusks', 3),
  ('sc-snacks-bakery-bread', 'c-snacks-bakery', 'bread', 'Bread', 4),
  ('sc-snacks-bakery-cakes', 'c-snacks-bakery', 'cakes', 'Cakes', 5),
  ('sc-snacks-bakery-namkeen', 'c-snacks-bakery', 'namkeen', 'Namkeen', 6),
  ('sc-snacks-bakery-chips', 'c-snacks-bakery', 'chips', 'Chips', 7),
  -- Tea & Coffee
  ('sc-tea-coffee-tea-powder', 'c-tea-coffee', 'tea-powder', 'Tea Powder', 1),
  ('sc-tea-coffee-coffee-powder', 'c-tea-coffee', 'coffee-powder', 'Coffee Powder', 2),
  ('sc-tea-coffee-green-tea', 'c-tea-coffee', 'green-tea', 'Green Tea', 3),
  ('sc-tea-coffee-instant-coffee', 'c-tea-coffee', 'instant-coffee', 'Instant Coffee', 4),
  -- Dry Fruits & Nuts
  ('sc-dry-fruits-nuts-almonds', 'c-dry-fruits-nuts', 'almonds', 'Almonds', 1),
  ('sc-dry-fruits-nuts-cashews', 'c-dry-fruits-nuts', 'cashews', 'Cashews', 2),
  ('sc-dry-fruits-nuts-raisins', 'c-dry-fruits-nuts', 'raisins', 'Raisins', 3),
  ('sc-dry-fruits-nuts-pistachios', 'c-dry-fruits-nuts', 'pistachios', 'Pistachios', 4),
  ('sc-dry-fruits-nuts-walnuts', 'c-dry-fruits-nuts', 'walnuts', 'Walnuts', 5),
  ('sc-dry-fruits-nuts-peanuts', 'c-dry-fruits-nuts', 'peanuts', 'Peanuts', 6),
  -- Packaged Foods
  ('sc-packaged-foods-instant-noodles', 'c-packaged-foods', 'instant-noodles', 'Instant Noodles', 1),
  ('sc-packaged-foods-vermicelli', 'c-packaged-foods', 'vermicelli', 'Vermicelli', 2),
  ('sc-packaged-foods-pasta', 'c-packaged-foods', 'pasta', 'Pasta', 3),
  ('sc-packaged-foods-pickles', 'c-packaged-foods', 'pickles', 'Pickles', 4),
  ('sc-packaged-foods-papad', 'c-packaged-foods', 'papad', 'Papad', 5),
  ('sc-packaged-foods-sauces', 'c-packaged-foods', 'sauces', 'Sauces', 6),
  ('sc-packaged-foods-ketchup', 'c-packaged-foods', 'ketchup', 'Ketchup', 7),
  -- Beverages
  ('sc-beverages-fruit-juices', 'c-beverages', 'fruit-juices', 'Fruit Juices', 1),
  ('sc-beverages-soft-drinks', 'c-beverages', 'soft-drinks', 'Soft Drinks', 2),
  ('sc-beverages-energy-drinks', 'c-beverages', 'energy-drinks', 'Energy Drinks', 3),
  ('sc-beverages-packaged-water', 'c-beverages', 'packaged-water', 'Packaged Water', 4),
  -- Household Essentials
  ('sc-household-essentials-detergent-powder', 'c-household-essentials', 'detergent-powder', 'Detergent Powder', 1),
  ('sc-household-essentials-dish-wash', 'c-household-essentials', 'dish-wash', 'Dish Wash', 2),
  ('sc-household-essentials-floor-cleaner', 'c-household-essentials', 'floor-cleaner', 'Floor Cleaner', 3),
  ('sc-household-essentials-toilet-cleaner', 'c-household-essentials', 'toilet-cleaner', 'Toilet Cleaner', 4),
  ('sc-household-essentials-soap', 'c-household-essentials', 'soap', 'Soap', 5),
  ('sc-household-essentials-hand-wash', 'c-household-essentials', 'hand-wash', 'Hand Wash', 6),
  -- Personal Care
  ('sc-personal-care-toothpaste', 'c-personal-care', 'toothpaste', 'Toothpaste', 1),
  ('sc-personal-care-toothbrush', 'c-personal-care', 'toothbrush', 'Toothbrush', 2),
  ('sc-personal-care-shampoo', 'c-personal-care', 'shampoo', 'Shampoo', 3),
  ('sc-personal-care-hair-oil', 'c-personal-care', 'hair-oil', 'Hair Oil', 4),
  ('sc-personal-care-face-wash', 'c-personal-care', 'face-wash', 'Face Wash', 5),
  ('sc-personal-care-talcum-powder', 'c-personal-care', 'talcum-powder', 'Talcum Powder', 6);

-- Keep products.sub_category in sync when subcategory_id is set
CREATE OR REPLACE FUNCTION public.sync_product_subcategory_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.subcategory_id IS NOT NULL THEN
    SELECT s.slug, c.slug
      INTO NEW.sub_category, NEW.category_slug
    FROM public.subcategories s
    JOIN public.categories c ON c.id = s.category_id
    WHERE s.id = NEW.subcategory_id;

    IF NEW.sub_category IS NULL THEN
      RAISE EXCEPTION 'Invalid subcategory_id %', NEW.subcategory_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_sync_subcategory ON public.products;
CREATE TRIGGER trg_products_sync_subcategory
  BEFORE INSERT OR UPDATE OF subcategory_id
  ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_subcategory_slug();

-- Remap any products that were parked on staging during the taxonomy swap
UPDATE public.products
SET category_slug = 'food-grains-cereals'
WHERE category_slug = '__staging__';

DELETE FROM public.categories WHERE slug = '__staging__';
