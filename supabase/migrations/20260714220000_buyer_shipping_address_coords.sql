-- Structured shipping address snapshot on buyers (checkout profile address)
ALTER TABLE public.buyers
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;

COMMENT ON COLUMN public.buyers.shipping_address IS
  'Structured default shipping address for the buyer (form + map pin).';

-- Coordinates on shipping_addresses for Leaflet pin
ALTER TABLE public.shipping_addresses
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN public.shipping_addresses.latitude IS 'Map pin latitude';
COMMENT ON COLUMN public.shipping_addresses.longitude IS 'Map pin longitude';
