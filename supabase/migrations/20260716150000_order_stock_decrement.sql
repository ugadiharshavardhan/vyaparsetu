-- Decrement product stock when buyer order lines are inserted.
-- Restore stock when an order is cancelled.
-- Runs as SECURITY DEFINER so buyers (who cannot UPDATE products via RLS) still affect inventory.

CREATE OR REPLACE FUNCTION public.apply_order_item_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current integer;
BEGIN
  IF NEW.product_id IS NULL OR NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT stock_count INTO _current
  FROM public.products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Snapshot-only / legacy product id — skip rather than fail checkout
    RETURN NEW;
  END IF;

  IF _current < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product % (available %, ordered %)',
      NEW.product_id, _current, NEW.quantity
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.products
  SET
    stock_count = stock_count - NEW.quantity,
    in_stock = (stock_count - NEW.quantity) > 0,
    updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_apply_stock ON public.order_items;
CREATE TRIGGER trg_order_items_apply_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_order_item_stock();

CREATE OR REPLACE FUNCTION public.restore_stock_on_order_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM 'cancelled'
     AND NEW.status = 'cancelled' THEN
    UPDATE public.products p
    SET
      stock_count = p.stock_count + oi.quantity,
      in_stock = true,
      updated_at = now()
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_restore_stock_on_cancel ON public.orders;
CREATE TRIGGER trg_orders_restore_stock_on_cancel
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_stock_on_order_cancel();
