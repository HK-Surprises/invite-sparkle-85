ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS send_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sent_at timestamptz;

ALTER TABLE public.guests
  ADD CONSTRAINT guests_send_status_check CHECK (send_status IN ('pending','sent'));