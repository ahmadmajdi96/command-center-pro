
-- Enums
DO $$ BEGIN
  CREATE TYPE public.doc_status AS ENUM ('draft','open','in_progress','completed','cancelled','on_hold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.integration_system AS ENUM ('mes','qms','oms','cmms','qc_system','command_center');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Carriers
CREATE TABLE IF NOT EXISTS public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  service_level TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tracking_url_template TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.carriers TO authenticated;
GRANT ALL ON public.carriers TO service_role;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read carriers" ON public.carriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write carriers" ON public.carriers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_carriers_ua BEFORE UPDATE ON public.carriers FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Receiving
CREATE TABLE IF NOT EXISTS public.receiving_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status public.doc_status NOT NULL DEFAULT 'open',
  expected_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.receiving_orders TO authenticated;
GRANT ALL ON public.receiving_orders TO service_role;
ALTER TABLE public.receiving_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all rcv" ON public.receiving_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_rcv_ua BEFORE UPDATE ON public.receiving_orders FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

CREATE TABLE IF NOT EXISTS public.receiving_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiving_id UUID NOT NULL REFERENCES public.receiving_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity_expected NUMERIC NOT NULL DEFAULT 0,
  quantity_received NUMERIC NOT NULL DEFAULT 0,
  lot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.receiving_lines TO authenticated;
GRANT ALL ON public.receiving_lines TO service_role;
ALTER TABLE public.receiving_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all rcvl" ON public.receiving_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Putaway tasks
CREATE TABLE IF NOT EXISTS public.putaway_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  receiving_id UUID REFERENCES public.receiving_orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  from_location TEXT,
  to_bin_id UUID REFERENCES public.bins(id) ON DELETE SET NULL,
  status public.doc_status NOT NULL DEFAULT 'open',
  assigned_to UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.putaway_tasks TO authenticated;
GRANT ALL ON public.putaway_tasks TO service_role;
ALTER TABLE public.putaway_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all pt" ON public.putaway_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_pt_ua BEFORE UPDATE ON public.putaway_tasks FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Pick waves + tasks
CREATE TABLE IF NOT EXISTS public.pick_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  status public.doc_status NOT NULL DEFAULT 'open',
  released_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pick_waves TO authenticated;
GRANT ALL ON public.pick_waves TO service_role;
ALTER TABLE public.pick_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all pw" ON public.pick_waves FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_pw_ua BEFORE UPDATE ON public.pick_waves FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

CREATE TABLE IF NOT EXISTS public.pick_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_id UUID REFERENCES public.pick_waves(id) ON DELETE CASCADE,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  bin_id UUID REFERENCES public.bins(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  quantity_picked NUMERIC NOT NULL DEFAULT 0,
  status public.doc_status NOT NULL DEFAULT 'open',
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pick_tasks TO authenticated;
GRANT ALL ON public.pick_tasks TO service_role;
ALTER TABLE public.pick_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all pkt" ON public.pick_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_pkt_ua BEFORE UPDATE ON public.pick_tasks FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Packs
CREATE TABLE IF NOT EXISTS public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  station TEXT,
  weight_kg NUMERIC,
  dimensions TEXT,
  status public.doc_status NOT NULL DEFAULT 'open',
  packed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.packs TO authenticated;
GRANT ALL ON public.packs TO service_role;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all packs" ON public.packs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_packs_ua BEFORE UPDATE ON public.packs FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE SET NULL,
  tracking_number TEXT,
  status public.doc_status NOT NULL DEFAULT 'open',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  destination TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all shp" ON public.shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_shp_ua BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Quality holds
CREATE TABLE IF NOT EXISTS public.quality_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  lot TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status public.doc_status NOT NULL DEFAULT 'on_hold',
  external_ref TEXT,
  qc_source TEXT,
  created_by UUID,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.quality_holds TO authenticated;
GRANT ALL ON public.quality_holds TO service_role;
ALTER TABLE public.quality_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all qh" ON public.quality_holds FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_qh_ua BEFORE UPDATE ON public.quality_holds FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Cycle counts
CREATE TABLE IF NOT EXISTS public.cycle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  status public.doc_status NOT NULL DEFAULT 'open',
  variance NUMERIC DEFAULT 0,
  counted_by UUID,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.cycle_counts TO authenticated;
GRANT ALL ON public.cycle_counts TO service_role;
ALTER TABLE public.cycle_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all cc" ON public.cycle_counts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_cc_ua BEFORE UPDATE ON public.cycle_counts FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Inventory adjustments
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  bin_id UUID REFERENCES public.bins(id) ON DELETE SET NULL,
  quantity_delta NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status public.doc_status NOT NULL DEFAULT 'completed',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.inventory_adjustments TO authenticated;
GRANT ALL ON public.inventory_adjustments TO service_role;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all ia" ON public.inventory_adjustments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tg_ia_ua BEFORE UPDATE ON public.inventory_adjustments FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read audit" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth ins audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Settings (single row per key)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tg_settings_ua BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Integration events (from MES/QMS/OMS/CMMS/QC/CC)
CREATE TABLE IF NOT EXISTS public.integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system public.integration_system NOT NULL,
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received',
  error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_intev_sys ON public.integration_events(system, created_at DESC);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.integration_events TO authenticated;
GRANT ALL ON public.integration_events TO service_role;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all iev" ON public.integration_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Integration sync runs
CREATE TABLE IF NOT EXISTS public.integration_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system public.integration_system NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  pulled INT DEFAULT 0,
  reconciled INT DEFAULT 0,
  errors INT DEFAULT 0,
  detail JSONB DEFAULT '{}'::jsonb
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.integration_sync_runs TO authenticated;
GRANT ALL ON public.integration_sync_runs TO service_role;
ALTER TABLE public.integration_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all isr" ON public.integration_sync_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shared cross-project tables (QC + Command Center)
CREATE TABLE IF NOT EXISTS public.qc_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  lot TEXT,
  result TEXT NOT NULL,
  inspector TEXT,
  inspected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.qc_inspections TO authenticated;
GRANT ALL ON public.qc_inspections TO service_role;
ALTER TABLE public.qc_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all qci" ON public.qc_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.cc_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  order_number TEXT NOT NULL,
  customer TEXT,
  status TEXT,
  total NUMERIC,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw JSONB DEFAULT '{}'::jsonb
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.cc_orders TO authenticated;
GRANT ALL ON public.cc_orders TO service_role;
ALTER TABLE public.cc_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all cco" ON public.cc_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
