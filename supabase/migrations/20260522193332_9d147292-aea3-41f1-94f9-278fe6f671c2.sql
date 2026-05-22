
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS packeta_packet_id text,
  ADD COLUMN IF NOT EXISTS packeta_barcode text,
  ADD COLUMN IF NOT EXISTS packeta_tracking_url text,
  ADD COLUMN IF NOT EXISTS packeta_parcel_size text,
  ADD COLUMN IF NOT EXISTS packeta_weight numeric,
  ADD COLUMN IF NOT EXISTS packeta_submitted_at timestamptz;
