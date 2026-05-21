
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'packeta',
  ADD COLUMN IF NOT EXISTS packeta_point_id text,
  ADD COLUMN IF NOT EXISTS packeta_point_name text,
  ADD COLUMN IF NOT EXISTS packeta_point_address text,
  ADD COLUMN IF NOT EXISTS sent_status_emails text[] NOT NULL DEFAULT '{}'::text[];
