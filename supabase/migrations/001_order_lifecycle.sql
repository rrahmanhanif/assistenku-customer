-- Assistenku Customer App base schema (customer + order lifecycle)
-- Ensure enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'ORDER_CREATED',
      'WAITING_ASSIGNMENT',
      'ASSIGNED',
      'MITRA_ON_ROUTE',
      'IN_PROGRESS',
      'EVIDENCE_SUBMITTED',
      'NEEDS_REVISION',
      'COMPLETED_PENDING_PAYMENT',
      'PAID',
      'CLOSED',
      'CANCELLED'
    );
  END IF;
END
$$;

-- Core master data
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_price numeric(12,2) DEFAULT 0,
  pricing_rules_json jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE,
  name text,
  phone text,
  email text,
  default_address_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label text,
  address_text text NOT NULL,
  lat numeric(10,6),
  lng numeric(10,6),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders lifecycle
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id),
  address_id uuid REFERENCES public.customer_addresses(id),
  address_text text NOT NULL,
  schedule_at timestamptz,
  notes text,
  status public.order_status DEFAULT 'ORDER_CREATED',
  price_estimate numeric(12,2) DEFAULT 0,
  final_price numeric(12,2),
  requires_evidence_approval boolean DEFAULT false,
  assigned_partner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  addon_name text NOT NULL,
  addon_price numeric(12,2) DEFAULT 0,
  qty integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.order_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  actor_role text NOT NULL,
  actor_id uuid,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  uploader_role text NOT NULL,
  uploader_id uuid,
  file_url text NOT NULL,
  file_type text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_no text,
  amount numeric(12,2) NOT NULL,
  method text DEFAULT 'manual_transfer',
  status text DEFAULT 'pending',
  proof_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  category text,
  description text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_role text NOT NULL,
  sender_id uuid,
  message_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  actor_role text,
  actor_id uuid,
  payload_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_timeline_order ON public.order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_evidence_order ON public.order_evidence(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_order ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON public.customer_addresses(customer_id);

-- RLS policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Customers
CREATE POLICY IF NOT EXISTS customers_select_self ON public.customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS customers_update_self ON public.customers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS customers_select_addresses ON public.customer_addresses
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY IF NOT EXISTS customers_manage_addresses ON public.customer_addresses
  FOR INSERT WITH CHECK (customer_id = auth.uid())
  TO authenticated;

CREATE POLICY IF NOT EXISTS customers_update_addresses ON public.customer_addresses
  FOR UPDATE USING (customer_id = auth.uid());

-- Orders
CREATE POLICY IF NOT EXISTS customers_select_own_orders ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY IF NOT EXISTS customers_insert_orders ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY IF NOT EXISTS customers_update_orders ON public.orders
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY IF NOT EXISTS customers_related_addons ON public.order_addons
  FOR SELECT USING (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()))
  WITH CHECK (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

CREATE POLICY IF NOT EXISTS customers_related_timeline ON public.order_timeline
  FOR SELECT USING (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

CREATE POLICY IF NOT EXISTS customers_related_evidence ON public.order_evidence
  FOR SELECT USING (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

CREATE POLICY IF NOT EXISTS customers_related_payments ON public.payments
  FOR SELECT USING (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()))
  WITH CHECK (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

CREATE POLICY IF NOT EXISTS customers_related_disputes ON public.disputes
  FOR SELECT USING (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()))
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY IF NOT EXISTS customers_related_chat ON public.chat_messages
  FOR SELECT USING (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()))
  WITH CHECK (EXISTS(SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

-- Utility function to append timeline and audit entries
CREATE OR REPLACE FUNCTION public.log_order_event(
  p_order_id uuid,
  p_from public.order_status,
  p_to public.order_status,
  p_role text,
  p_actor uuid,
  p_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.order_timeline(order_id, from_status, to_status, actor_role, actor_id, note)
  VALUES (p_order_id, p_from, p_to, p_role, p_actor, p_note);

  INSERT INTO public.audit_logs(event_type, entity_type, entity_id, actor_role, actor_id, payload_json)
  VALUES (
    'ORDER_STATUS_CHANGE',
    'orders',
    p_order_id,
    p_role,
    p_actor,
    jsonb_build_object('from', p_from, 'to', p_to, 'note', p_note)
  );
END;
$$;
