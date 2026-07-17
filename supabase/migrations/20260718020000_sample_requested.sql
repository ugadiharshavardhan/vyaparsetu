-- Per-item "send me a sample" request.
-- Buyers toggle it on a cart line; at checkout it is copied onto the
-- order_items row so sellers can see which lines need a sample included.

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS sample_requested boolean NOT NULL DEFAULT false;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS sample_requested boolean NOT NULL DEFAULT false;
