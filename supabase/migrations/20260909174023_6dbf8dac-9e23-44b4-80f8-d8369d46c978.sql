
INSERT INTO public.templates (id, category_id, name, slug, component_key, description, is_active, field_schema)
VALUES
 ('20000000-0000-0000-0000-000000000101','10000000-0000-0000-0000-000000000001','Royal Prestige','royal-prestige','royal_prestige_01','Luxury royal Indian wedding: gold, ivory and deep maroon with a cinematic door reveal.',true,
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","required":true,"type":"date"},{"key":"eventTime","label":"Muhurat / time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"venueMapUrl","label":"Google Maps link"},{"key":"hostNote","label":"Hosted by (family names)"},{"key":"events","label":"Events (one per line: Name | Date | Time | Venue)","type":"textarea"},{"key":"story","label":"Our story","type":"textarea"},{"key":"galleryUrls","label":"Gallery image links (one per line)","type":"textarea"},{"key":"message","label":"Personal message","type":"textarea"},{"key":"blessing","label":"Closing blessing"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000102','10000000-0000-0000-0000-000000000001','Rose Gold Blush','rose-gold-blush','rose_gold_blush_02','Romantic luxury: rose gold, blush and cream with floral petals and soft reveals.',true,
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","required":true,"type":"date"},{"key":"eventTime","label":"Time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"venueMapUrl","label":"Google Maps link"},{"key":"hostNote","label":"Hosted by (family names)"},{"key":"events","label":"Events (one per line: Name | Date | Time | Venue)","type":"textarea"},{"key":"story","label":"Our story","type":"textarea"},{"key":"galleryUrls","label":"Gallery image links (one per line)","type":"textarea"},{"key":"message","label":"Personal message","type":"textarea"},{"key":"blessing","label":"Closing blessing"}]'::jsonb),
 ('20000000-0000-0000-0000-000000000103','10000000-0000-0000-0000-000000000001','Emerald Royale','emerald-royale','emerald_royale_03','Deep emerald and gold with Mughal-inspired arches and a dramatic curtain opening.',true,
  '[{"key":"groomName","label":"Groom name","required":true},{"key":"brideName","label":"Bride name","required":true},{"key":"eventDate","label":"Wedding date","required":true,"type":"date"},{"key":"eventTime","label":"Muhurat / time"},{"key":"venueName","label":"Venue","required":true},{"key":"venueAddress","label":"Venue address"},{"key":"city","label":"City","required":true},{"key":"venueMapUrl","label":"Google Maps link"},{"key":"hostNote","label":"Hosted by (family names)"},{"key":"events","label":"Events (one per line: Name | Date | Time | Venue)","type":"textarea"},{"key":"story","label":"Our story","type":"textarea"},{"key":"galleryUrls","label":"Gallery image links (one per line)","type":"textarea"},{"key":"message","label":"Personal message","type":"textarea"},{"key":"blessing","label":"Closing blessing"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

UPDATE public.templates SET is_active = false
WHERE id IN (
 '20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004',
 '20000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000008');

INSERT INTO public.customer_template_access (customer_id, template_id)
SELECT c.id, t.id FROM public.customers c
CROSS JOIN public.templates t
WHERE t.id IN ('20000000-0000-0000-0000-000000000101','20000000-0000-0000-0000-000000000102','20000000-0000-0000-0000-000000000103')
ON CONFLICT DO NOTHING;

UPDATE public.invitations SET template_id = '20000000-0000-0000-0000-000000000101'
WHERE template_id IN ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004');
UPDATE public.invitations SET template_id = '20000000-0000-0000-0000-000000000102'
WHERE template_id IN ('20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000005');
UPDATE public.invitations SET template_id = '20000000-0000-0000-0000-000000000103'
WHERE template_id = '20000000-0000-0000-0000-000000000003';
