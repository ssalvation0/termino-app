-- ============================================================================
-- Termino — seed data (run AFTER schema.sql, AFTER you create your first user)
-- ============================================================================
-- 1. Sign up via the app (or Auth panel) — that creates a row in auth.users + profiles
-- 2. Grab your user id: select id from profiles;
-- 3. Replace OWNER_ID below with that uuid and run this file
-- ============================================================================

do $$
declare
  owner_id uuid := '3d300358-0f45-4c16-bf17-9850230ff6bb'; -- ⚠️ paste your profile id
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
  s_hair_cut uuid; s_color uuid; s_balayage uuid;
  s_barber_cut uuid; s_shave uuid;
  s_nails uuid; s_pedi uuid;
  s_massage uuid; s_thai uuid;
  s_pt uuid; s_yoga uuid;
  s_makeup uuid; s_brows uuid;
begin
  -- mark owner as provider
  update profiles set role = 'provider' where id = owner_id;

  insert into providers (owner_id, name, category, description, address, city, lat, lng, images, tags, verified, working_hours, rating, review_count) values
    (owner_id, 'Studio Kowalska Hair', 'hair',
     'Ekskluzywny salon fryzjerski w centrum Warszawy. Specjalizujemy się w koloryzacji i stylizacji włosów.',
     'ul. Nowy Świat 22', 'Warszawa', 52.2297, 21.0122,
     array['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
           'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
           'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80'],
     array['Koloryzacja','Strzyżenie','Stylizacja','Keratyna'], true,
     '{"mon":{"open":"09:00","close":"20:00"},"tue":{"open":"09:00","close":"20:00"},"wed":{"open":"09:00","close":"20:00"},"thu":{"open":"09:00","close":"20:00"},"fri":{"open":"09:00","close":"19:00"},"sat":{"open":"10:00","close":"17:00"},"sun":null}'::jsonb,
     4.9, 312) returning id into p1;

  insert into providers (owner_id, name, category, description, address, city, lat, lng, images, tags, verified, working_hours, rating, review_count) values
    (owner_id, 'Barber House', 'barber',
     'Klasyczny barbershop z nowoczesnym podejściem. Strzyżenia, golenie brzytwą i pielęgnacja brody.',
     'ul. Mokotowska 15', 'Warszawa', 52.2197, 21.0062,
     array['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
           'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80'],
     array['Strzyżenie','Broda','Golenie brzytwą'], true,
     '{"mon":{"open":"10:00","close":"20:00"},"tue":{"open":"10:00","close":"20:00"},"wed":{"open":"10:00","close":"20:00"},"thu":{"open":"10:00","close":"20:00"},"fri":{"open":"10:00","close":"20:00"},"sat":{"open":"09:00","close":"18:00"},"sun":{"open":"10:00","close":"15:00"}}'::jsonb,
     4.8, 218) returning id into p2;

  insert into providers (owner_id, name, category, description, address, city, lat, lng, images, tags, verified, working_hours, rating, review_count) values
    (owner_id, 'Nail Art Studio Maya', 'nails',
     'Profesjonalne studio paznokci. Manicure, pedicure, żel, hybryda.',
     'ul. Chmielna 7', 'Warszawa', 52.2337, 21.0082,
     array['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80'],
     array['Manicure','Pedicure','Hybryda','Żel'], true,
     '{"mon":{"open":"09:00","close":"19:00"},"tue":{"open":"09:00","close":"19:00"},"wed":{"open":"09:00","close":"19:00"},"thu":{"open":"09:00","close":"20:00"},"fri":{"open":"09:00","close":"19:00"},"sat":{"open":"09:00","close":"16:00"},"sun":null}'::jsonb,
     5.0, 156) returning id into p3;

  insert into providers (owner_id, name, category, description, address, city, lat, lng, images, tags, verified, working_hours, rating, review_count) values
    (owner_id, 'Zen Massage Center', 'massage',
     'Centrum masażu i relaksu. Masaż klasyczny, tajski, sportowy oraz aromaterapia.',
     'ul. Piękna 5', 'Warszawa', 52.2267, 21.0032,
     array['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'],
     array['Masaż klasyczny','Thai massage','Aromaterapia'], false,
     '{"mon":{"open":"10:00","close":"21:00"},"tue":{"open":"10:00","close":"21:00"},"wed":{"open":"10:00","close":"21:00"},"thu":{"open":"10:00","close":"21:00"},"fri":{"open":"10:00","close":"21:00"},"sat":{"open":"10:00","close":"20:00"},"sun":{"open":"11:00","close":"18:00"}}'::jsonb,
     4.7, 89) returning id into p4;

  insert into providers (owner_id, name, category, description, address, city, lat, lng, images, tags, verified, working_hours, rating, review_count) values
    (owner_id, 'FitLife Studio', 'fitness',
     'Nowoczesne studio fitness z treningami personalnymi, jogą i pilatesem.',
     'ul. Złota 59', 'Warszawa', 52.2317, 21.0002,
     array['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'],
     array['Personal training','Joga','Pilates'], true,
     '{"mon":{"open":"06:00","close":"22:00"},"tue":{"open":"06:00","close":"22:00"},"wed":{"open":"06:00","close":"22:00"},"thu":{"open":"06:00","close":"22:00"},"fri":{"open":"06:00","close":"21:00"},"sat":{"open":"08:00","close":"18:00"},"sun":{"open":"09:00","close":"16:00"}}'::jsonb,
     4.6, 201) returning id into p5;

  insert into providers (owner_id, name, category, description, address, city, lat, lng, images, tags, verified, working_hours, rating, review_count) values
    (owner_id, 'Beauty Lab', 'beauty',
     'Kompleksowy salon urody — makijaż, henna brwi, laminacja rzęs.',
     'ul. Marszałkowska 84', 'Warszawa', 52.2277, 21.0142,
     array['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80'],
     array['Makijaż','Brwi','Rzęsy'], true,
     '{"mon":{"open":"09:00","close":"19:00"},"tue":{"open":"09:00","close":"19:00"},"wed":{"open":"09:00","close":"19:00"},"thu":{"open":"09:00","close":"20:00"},"fri":{"open":"09:00","close":"19:00"},"sat":{"open":"09:00","close":"17:00"},"sun":null}'::jsonb,
     4.8, 174) returning id into p6;

  -- Services for Studio Kowalska Hair
  insert into services (provider_id, name, description, duration_min, price) values
    (p1, 'Strzyżenie damskie', 'Strzyżenie + mycie + stylizacja', 60, 150) returning id into s_hair_cut;
  insert into services (provider_id, name, description, duration_min, price) values
    (p1, 'Koloryzacja', 'Pełna koloryzacja z pielęgnacją', 180, 350) returning id into s_color;
  insert into services (provider_id, name, description, duration_min, price) values
    (p1, 'Balayage', 'Technika balayage + tonowanie', 240, 480) returning id into s_balayage;

  insert into addons (service_id, name, price) values
    (s_hair_cut, 'Odżywka głęboko nawilżająca', 30),
    (s_hair_cut, 'Maseczka do włosów', 40);

  -- Barber House
  insert into services (provider_id, name, description, duration_min, price) values
    (p2, 'Strzyżenie męskie', 'Strzyżenie + mycie + stylizacja', 45, 80) returning id into s_barber_cut;
  insert into services (provider_id, name, description, duration_min, price) values
    (p2, 'Golenie brzytwą', 'Klasyczne golenie z gorącym ręcznikiem', 30, 70) returning id into s_shave;
  insert into addons (service_id, name, price) values
    (s_barber_cut, 'Broda', 30),
    (s_barber_cut, 'Hot towel', 15);

  -- Nails
  insert into services (provider_id, name, description, duration_min, price) values
    (p3, 'Manicure hybrydowy', 'Hybryda + zdobienia', 90, 110) returning id into s_nails;
  insert into services (provider_id, name, description, duration_min, price) values
    (p3, 'Pedicure klasyczny', 'Pełna pielęgnacja stóp', 60, 90) returning id into s_pedi;

  -- Massage
  insert into services (provider_id, name, description, duration_min, price) values
    (p4, 'Masaż klasyczny 60 min', 'Masaż relaksacyjny całego ciała', 60, 150) returning id into s_massage;
  insert into services (provider_id, name, description, duration_min, price) values
    (p4, 'Thai massage 90 min', 'Tradycyjny masaż tajski', 90, 220) returning id into s_thai;

  -- Fitness
  insert into services (provider_id, name, description, duration_min, price) values
    (p5, 'Personal training', 'Trening indywidualny z trenerem', 60, 150) returning id into s_pt;
  insert into services (provider_id, name, description, duration_min, price) values
    (p5, 'Joga dla początkujących', 'Zajęcia grupowe jogi', 60, 80) returning id into s_yoga;

  -- Beauty
  insert into services (provider_id, name, description, duration_min, price) values
    (p6, 'Makijaż okolicznościowy', 'Makijaż na wesele, studniówkę itp.', 90, 200) returning id into s_makeup;
  insert into services (provider_id, name, description, duration_min, price) values
    (p6, 'Henna brwi', 'Regulacja + henna', 45, 80) returning id into s_brows;
end $$;
