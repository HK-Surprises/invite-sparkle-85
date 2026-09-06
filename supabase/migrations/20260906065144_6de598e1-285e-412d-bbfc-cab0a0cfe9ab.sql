CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ===== Roles =====
CREATE TYPE public.app_role AS ENUM ('super_admin', 'customer', 'studio', 'event_manager');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  mobile TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- ===== Customers =====
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  customer_type TEXT NOT NULL DEFAULT 'individual',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  invitation_limit INTEGER NOT NULL DEFAULT 100 CHECK (invitation_limit >= 0),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_customer_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.customers WHERE user_id = auth.uid() LIMIT 1
$$;

-- ===== Categories & Templates =====
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  component_key TEXT NOT NULL,
  preview_image_url TEXT,
  description TEXT,
  field_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX templates_category_idx ON public.templates(category_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.customer_template_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, template_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_template_access TO authenticated;
GRANT ALL ON public.customer_template_access TO service_role;
ALTER TABLE public.customer_template_access ENABLE ROW LEVEL SECURITY;

-- ===== Invitations & Guests =====
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id),
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX invitations_customer_idx ON public.invitations(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile TEXT,
  group_name TEXT,
  people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count > 0),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'not_opened' CHECK (status IN ('not_opened','opened')),
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX guests_invitation_idx ON public.guests(invitation_id);
GRANT SELECT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.invitation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX invitation_views_guest_idx ON public.invitation_views(guest_id);
GRANT SELECT ON public.invitation_views TO authenticated;
GRANT ALL ON public.invitation_views TO service_role;
ALTER TABLE public.invitation_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER templates_updated BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER invitations_updated BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Policies =====
CREATE POLICY "profiles_own_select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "customers_admin_all" ON public.customers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "customers_own_select" ON public.customers FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "categories_read" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "templates_admin_all" ON public.templates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "templates_customer_assigned" ON public.templates FOR SELECT TO authenticated
  USING (is_active AND EXISTS (SELECT 1 FROM public.customer_template_access a WHERE a.template_id = templates.id AND a.customer_id = public.current_customer_id()));

CREATE POLICY "access_admin_all" ON public.customer_template_access FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "access_own_select" ON public.customer_template_access FOR SELECT TO authenticated USING (customer_id = public.current_customer_id());

CREATE POLICY "invitations_admin_all" ON public.invitations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "invitations_own_select" ON public.invitations FOR SELECT TO authenticated USING (customer_id = public.current_customer_id());
CREATE POLICY "invitations_own_insert" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (
    customer_id = public.current_customer_id()
    AND EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.status = 'active')
    AND EXISTS (SELECT 1 FROM public.customer_template_access a JOIN public.templates t ON t.id = a.template_id
                WHERE a.customer_id = invitations.customer_id AND a.template_id = invitations.template_id AND t.is_active)
  );
CREATE POLICY "invitations_own_update" ON public.invitations FOR UPDATE TO authenticated
  USING (customer_id = public.current_customer_id())
  WITH CHECK (
    customer_id = public.current_customer_id()
    AND EXISTS (SELECT 1 FROM public.customer_template_access a JOIN public.templates t ON t.id = a.template_id
                WHERE a.customer_id = invitations.customer_id AND a.template_id = invitations.template_id AND t.is_active)
  );
CREATE POLICY "invitations_own_delete" ON public.invitations FOR DELETE TO authenticated USING (customer_id = public.current_customer_id());

CREATE POLICY "guests_admin_all" ON public.guests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "guests_own_select" ON public.guests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = guests.invitation_id AND i.customer_id = public.current_customer_id()));
CREATE POLICY "guests_own_update" ON public.guests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = guests.invitation_id AND i.customer_id = public.current_customer_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = guests.invitation_id AND i.customer_id = public.current_customer_id()));
CREATE POLICY "guests_own_delete" ON public.guests FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = guests.invitation_id AND i.customer_id = public.current_customer_id()));

CREATE POLICY "views_admin_select" ON public.invitation_views FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "views_own_select" ON public.invitation_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guests g JOIN public.invitations i ON i.id = g.invitation_id WHERE g.id = invitation_views.guest_id AND i.customer_id = public.current_customer_id()));

CREATE POLICY "settings_read" ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.platform_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===== Business functions =====
CREATE OR REPLACE FUNCTION public.generate_invitation_token(_len INTEGER DEFAULT 10)
RETURNS TEXT LANGUAGE plpgsql VOLATILE SET search_path = public, extensions AS $$
DECLARE
  alphabet TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  bytes BYTEA := extensions.gen_random_bytes(_len);
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 0.._len - 1 LOOP
    result := result || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  END LOOP;
  RETURN result;
END; $$;

-- Adds a guest with server-side limit enforcement and unique token
CREATE OR REPLACE FUNCTION public.add_guest(_invitation_id UUID, _name TEXT, _mobile TEXT DEFAULT NULL, _group_name TEXT DEFAULT NULL, _people_count INTEGER DEFAULT 1)
RETURNS public.guests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_customer public.customers%ROWTYPE;
  v_used INTEGER;
  v_token TEXT;
  v_guest public.guests%ROWTYPE;
  v_tries INTEGER := 0;
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 1 OR length(_name) > 120 THEN
    RAISE EXCEPTION 'Guest name is required' USING ERRCODE = '22023';
  END IF;

  SELECT c.* INTO v_customer
  FROM public.customers c JOIN public.invitations i ON i.customer_id = c.id
  WHERE i.id = _invitation_id AND (c.user_id = auth.uid() OR public.is_admin());

  IF v_customer.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = '42501';
  END IF;
  IF v_customer.status <> 'active' THEN
    RAISE EXCEPTION 'Your account is inactive. Please contact support.' USING ERRCODE = 'P0001';
  END IF;

  -- lock customer row to serialise limit checks
  PERFORM 1 FROM public.customers WHERE id = v_customer.id FOR UPDATE;

  SELECT count(*) INTO v_used FROM public.guests g JOIN public.invitations i ON i.id = g.invitation_id WHERE i.customer_id = v_customer.id;
  IF v_used >= v_customer.invitation_limit THEN
    RAISE EXCEPTION 'LIMIT_REACHED' USING ERRCODE = 'P0002';
  END IF;

  LOOP
    v_token := public.generate_invitation_token(10);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.guests WHERE token = v_token);
    v_tries := v_tries + 1;
    IF v_tries > 10 THEN RAISE EXCEPTION 'Could not generate token'; END IF;
  END LOOP;

  INSERT INTO public.guests (invitation_id, name, mobile, group_name, people_count, token)
  VALUES (_invitation_id, trim(_name), NULLIF(trim(coalesce(_mobile,'')), ''), NULLIF(trim(coalesce(_group_name,'')), ''), GREATEST(coalesce(_people_count,1),1), v_token)
  RETURNING * INTO v_guest;
  RETURN v_guest;
END; $$;
GRANT EXECUTE ON FUNCTION public.add_guest(UUID, TEXT, TEXT, TEXT, INTEGER) TO authenticated;

-- Public resolution of a token: validates everything and records a view
CREATE OR REPLACE FUNCTION public.resolve_invitation(_token TEXT, _record_view BOOLEAN DEFAULT true)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g public.guests%ROWTYPE;
  i public.invitations%ROWTYPE;
  c public.customers%ROWTYPE;
  t public.templates%ROWTYPE;
  today DATE := (now() AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
  IF _token IS NULL OR length(_token) < 6 OR length(_token) > 40 THEN
    RETURN jsonb_build_object('state', 'not_found');
  END IF;
  SELECT * INTO g FROM public.guests WHERE token = _token;
  IF g.id IS NULL THEN RETURN jsonb_build_object('state', 'not_found'); END IF;
  SELECT * INTO i FROM public.invitations WHERE id = g.invitation_id;
  SELECT * INTO c FROM public.customers WHERE id = i.customer_id;
  SELECT * INTO t FROM public.templates WHERE id = i.template_id;

  IF c.status <> 'active' OR i.status <> 'active' OR NOT t.is_active THEN
    RETURN jsonb_build_object('state', 'inactive');
  END IF;
  IF c.start_date IS NOT NULL AND today < c.start_date THEN
    RETURN jsonb_build_object('state', 'not_started');
  END IF;
  IF c.end_date IS NOT NULL AND today > c.end_date THEN
    RETURN jsonb_build_object('state', 'expired');
  END IF;

  IF _record_view THEN
    INSERT INTO public.invitation_views (guest_id) VALUES (g.id);
    UPDATE public.guests SET status = 'opened', last_viewed_at = now() WHERE id = g.id;
  END IF;

  RETURN jsonb_build_object(
    'state', 'ok',
    'guest', jsonb_build_object('name', g.name, 'group_name', g.group_name, 'people_count', g.people_count),
    'invitation', jsonb_build_object('title', i.title, 'data', i.data),
    'template', jsonb_build_object('component_key', t.component_key, 'name', t.name)
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.resolve_invitation(TEXT, BOOLEAN) TO anon, authenticated;

-- Usage view for admin / customer dashboards
CREATE OR REPLACE VIEW public.customer_usage WITH (security_invoker = true) AS
SELECT c.id AS customer_id,
       c.invitation_limit,
       (SELECT count(*) FROM public.guests g JOIN public.invitations i ON i.id = g.invitation_id WHERE i.customer_id = c.id)::int AS used,
       (SELECT count(*) FROM public.guests g JOIN public.invitations i ON i.id = g.invitation_id WHERE i.customer_id = c.id AND g.status = 'opened')::int AS opened,
       (SELECT count(*) FROM public.invitations i WHERE i.customer_id = c.id)::int AS invitations
FROM public.customers c;
GRANT SELECT ON public.customer_usage TO authenticated;
GRANT SELECT ON public.customer_usage TO service_role;

-- ===== Seed =====
INSERT INTO public.platform_settings (key, value) VALUES
 ('general', '{"platform_name":"InviteHub","support_email":"support@invitehub.in","support_phone":"+91 98765 00000","timezone":"Asia/Kolkata","default_language":"en","maintenance_mode":false}'::jsonb);

INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES
 ('10000000-0000-0000-0000-000000000001','Wedding','wedding','Shaadi, reception and sangeet invitations',1),
 ('10000000-0000-0000-0000-000000000002','Engagement','engagement','Sagai and ring ceremony invitations',2),
 ('10000000-0000-0000-0000-000000000003','Birthday','birthday','Birthday celebrations for all ages',3),
 ('10000000-0000-0000-0000-000000000004','Anniversary','anniversary','Milestone anniversary celebrations',4),
 ('10000000-0000-0000-0000-000000000005','Housewarming','housewarming','Griha pravesh and new home ceremonies',5),
 ('10000000-0000-0000-0000-000000000006','Religious','religious','Pooja, katha and religious gatherings',6),
 ('10000000-0000-0000-0000-000000000007','Other','other','Any other celebration',7);

INSERT INTO public.templates (id, category_id, name, slug, component_key, description, field_schema) VALUES
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Traditional Wedding 01','traditional-wedding-01','wedding_traditional_01','Deep maroon and gold with mandala motifs',
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","type":"date","required":true},{"key":"eventTime","label":"Muhurat / time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"hostNote","label":"Hosted by (family names)"},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Modern Wedding 02','modern-wedding-02','wedding_modern_02','Blush and sage with clean serif typography',
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","type":"date","required":true},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"hostNote","label":"Hosted by"},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Elegant Wedding 03','elegant-wedding-03','wedding_elegant_03','Ivory and lavender with floral border',
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","type":"date","required":true},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"hostNote","label":"Hosted by"},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Minimal Wedding 04','minimal-wedding-04','wedding_minimal_04','Whitespace, one accent, nothing extra',
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","type":"date","required":true},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"city","label":"City","required":true},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','Elegant Engagement 01','elegant-engagement-01','engagement_elegant_01','Peach and rose gold ring ceremony card',
  '[{"key":"groomName","label":"His name","required":true},{"key":"brideName","label":"Her name","required":true},{"key":"eventDate","label":"Ceremony date","type":"date","required":true},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"hostNote","label":"Hosted by"},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003','Birthday Celebration 01','birthday-celebration-01','birthday_celebration_01','Soft confetti and warm pastel balloons',
  '[{"key":"primaryName","label":"Birthday person","required":true},{"key":"milestone","label":"Turning (age or milestone)"},{"key":"eventDate","label":"Party date","type":"date","required":true},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"hostNote","label":"Hosted by"},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000005','New Home 01','new-home-01','housewarming_new_home_01','Fresh green and terracotta griha pravesh',
  '[{"key":"primaryName","label":"Family name","required":true},{"key":"eventDate","label":"Griha pravesh date","type":"date","required":true},{"key":"eventTime","label":"Muhurat / time"},{"key":"venueName","label":"New home name"},{"key":"venueAddress","label":"Address","required":true},{"key":"city","label":"City","required":true},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000006','Religious Celebration 01','religious-celebration-01','religious_celebration_01','Saffron and cream with diya motifs',
  '[{"key":"primaryName","label":"Occasion (e.g. Satyanarayan Katha)","required":true},{"key":"hostNote","label":"Hosted by family","required":true},{"key":"eventDate","label":"Date","type":"date","required":true},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Address"},{"key":"city","label":"City","required":true},{"key":"message","label":"Personal message","type":"textarea"}]'::jsonb);

-- Demo users (created in auth)
INSERT INTO public.profiles (id, full_name, mobile) VALUES
 ('edc449be-c100-4d70-80bd-1e422bae7717','InviteHub Admin','+91 98765 00000'),
 ('a37c16ed-c45c-48f8-ab57-99202009dae3','Rahul Shah','+91 98250 12345');
INSERT INTO public.user_roles (user_id, role) VALUES
 ('edc449be-c100-4d70-80bd-1e422bae7717','super_admin'),
 ('a37c16ed-c45c-48f8-ab57-99202009dae3','customer');

INSERT INTO public.customers (id, user_id, name, email, mobile, status, invitation_limit, start_date, end_date, notes) VALUES
 ('30000000-0000-0000-0000-000000000001','a37c16ed-c45c-48f8-ab57-99202009dae3','Rahul Shah','rahul@invitehub.demo','+91 98250 12345','active',200,'2026-09-01','2026-12-31','Wedding in December, Ahmedabad'),
 ('30000000-0000-0000-0000-000000000002',NULL,'Meera Patel','meera@invitehub.demo','+91 98790 22334','active',150,'2026-09-01','2026-11-30','Engagement ceremony'),
 ('30000000-0000-0000-0000-000000000003',NULL,'Kiran Desai','kiran@invitehub.demo','+91 99090 55667','inactive',100,'2026-06-01','2026-08-15','Expired access');

INSERT INTO public.customer_template_access (customer_id, template_id) VALUES
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001'),
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003'),
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000005'),
 ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002');

INSERT INTO public.invitations (id, customer_id, template_id, title, data, status) VALUES
 ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Rahul & Priya Wedding',
  '{"groomName":"Rahul","brideName":"Priya","eventDate":"2026-12-20","eventTime":"7:30 PM onwards","venueName":"The Grand Palace","venueAddress":"SG Highway, Bodakdev","city":"Ahmedabad","hostNote":"Shah & Mehta families","message":"Your presence would make our special day even more meaningful."}'::jsonb,'active');

INSERT INTO public.guests (id, invitation_id, name, mobile, group_name, people_count, token, status, last_viewed_at, created_at) VALUES
 ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','Amit Shah','+91 98240 11111','Family',2,'a8Kx91PqLm','opened',now() - interval '2 hours',now() - interval '6 days'),
 ('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','Neha Patel','+91 98240 22222','Friends',1,'x72kP91mRt','opened',now() - interval '1 day',now() - interval '6 days'),
 ('50000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000001','Karan Mehta','+91 98240 33333','College',1,'7Fk3PqW2Zn','not_opened',NULL,now() - interval '5 days'),
 ('50000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000001','Priya Desai',NULL,'Friends',1,'Qm4Vt8HbXc','opened',now() - interval '3 days',now() - interval '5 days'),
 ('50000000-0000-0000-0000-000000000005','40000000-0000-0000-0000-000000000001','Rahul Joshi','+91 98240 55555','Office',2,'Zp9Rc2NdYs','not_opened',NULL,now() - interval '4 days'),
 ('50000000-0000-0000-0000-000000000006','40000000-0000-0000-0000-000000000001','Simran Thakkar','+91 98240 66666','Family',3,'Lw5Jh7GfKe','opened',now() - interval '5 hours',now() - interval '3 days'),
 ('50000000-0000-0000-0000-000000000007','40000000-0000-0000-0000-000000000001','Deepak Kumar',NULL,'Office',1,'Bn3Xs6TqVy','not_opened',NULL,now() - interval '2 days'),
 ('50000000-0000-0000-0000-000000000008','40000000-0000-0000-0000-000000000001','Patel Family','+91 98240 88888','Relatives',5,'Hc8Dm4PkWa','opened',now() - interval '30 minutes',now() - interval '1 day');

INSERT INTO public.invitation_views (guest_id, viewed_at) VALUES
 ('50000000-0000-0000-0000-000000000001', now() - interval '2 days'),
 ('50000000-0000-0000-0000-000000000001', now() - interval '2 hours'),
 ('50000000-0000-0000-0000-000000000002', now() - interval '1 day'),
 ('50000000-0000-0000-0000-000000000004', now() - interval '3 days'),
 ('50000000-0000-0000-0000-000000000006', now() - interval '5 hours'),
 ('50000000-0000-0000-0000-000000000008', now() - interval '30 minutes');