-- Seed 35 circuite diverse (51 locuri, 4 offline). Data plecare > azi.
-- Rulează după 20250202_bus_layout_create_route_seats. Trigger creează automat 51 locuri.

INSERT INTO public.routes (
  origin,
  destination,
  depart_at,
  capacity_total,
  reserve_offline,
  price_cents,
  currency,
  status,
  route_category,
  route_subcategory,
  description
) VALUES
  -- INTERN
  ('Drobeta-Turnu Severin', 'București', '2026-02-07 07:00:00+02', 51, 4, 8900, 'RON', 'active', 'intern', NULL, 'Curso expres București, plecare dimineața.'),
  ('Drobeta-Turnu Severin', 'București', '2026-02-14 07:00:00+02', 51, 4, 8900, 'RON', 'active', 'intern', NULL, 'Curso expres București.'),
  ('Drobeta-Turnu Severin', 'Constanța', '2026-02-21 06:30:00+02', 51, 4, 13900, 'RON', 'active', 'intern', NULL, 'Direct la mare – Constanța.'),
  ('Drobeta-Turnu Severin', 'Brașov', '2026-02-28 06:00:00+02', 51, 4, 11900, 'RON', 'active', 'intern', NULL, 'Brașov – Transilvania, Poiana Brașov.'),
  ('Drobeta-Turnu Severin', 'Cluj-Napoca', '2026-03-07 05:30:00+02', 51, 4, 12900, 'RON', 'active', 'intern', NULL, 'Cluj-Napoca – inima Transilvaniei.'),
  ('Drobeta-Turnu Severin', 'Timișoara', '2026-03-14 07:00:00+02', 51, 4, 10900, 'RON', 'active', 'intern', NULL, 'Timișoara – capitală culturală.'),
  ('Drobeta-Turnu Severin', 'Sibiu', '2026-03-21 06:00:00+02', 51, 4, 11500, 'RON', 'active', 'intern', NULL, 'Sibiu – orașul ogivelor.'),
  ('Drobeta-Turnu Severin', 'Iași', '2026-03-28 05:00:00+02', 51, 4, 14900, 'RON', 'active', 'intern', NULL, 'Iași – capitală culturală a Moldovei.'),
  ('Drobeta-Turnu Severin', 'Oradea', '2026-04-04 06:00:00+02', 51, 4, 11900, 'RON', 'active', 'intern', NULL, 'Oradea – orașul termal.'),
  ('Drobeta-Turnu Severin', 'Galați', '2026-04-11 05:30:00+02', 51, 4, 12900, 'RON', 'active', 'intern', NULL, 'Galați – port la Dunăre.'),
  -- EXTERN
  ('Drobeta-Turnu Severin', 'Sofia', '2026-04-18 06:00:00+02', 51, 4, 17900, 'RON', 'active', 'extern', NULL, 'Sofia – capitala Bulgariei.'),
  ('Drobeta-Turnu Severin', 'Belgrade', '2026-04-25 06:30:00+02', 51, 4, 16900, 'RON', 'active', 'extern', NULL, 'Belgrade – Serbia.'),
  ('Drobeta-Turnu Severin', 'Budapest', '2026-05-02 05:00:00+02', 51, 4, 20900, 'RON', 'active', 'extern', NULL, 'Budapest – capitala Ungariei.'),
  ('Drobeta-Turnu Severin', 'Viena', '2026-05-09 04:30:00+02', 51, 4, 24900, 'RON', 'active', 'extern', NULL, 'Viena – capitala muzicii.'),
  ('Drobeta-Turnu Severin', 'Sarajevo', '2026-05-16 05:30:00+02', 51, 4, 18900, 'RON', 'active', 'extern', NULL, 'Sarajevo – inima Bosniei.'),
  -- PELERINAJ
  ('Drobeta-Turnu Severin', 'Săpânța', '2026-05-23 05:30:00+02', 51, 4, 15900, 'RON', 'active', 'pelerinaj', NULL, 'Cimitirul Vesel și Mănăstiri Maramureș.'),
  ('Drobeta-Turnu Severin', 'Putna', '2026-05-30 05:00:00+02', 51, 4, 14900, 'RON', 'active', 'pelerinaj', NULL, 'Mănăstirea Putna – Ștefan cel Mare.'),
  ('Drobeta-Turnu Severin', 'Iași (Mănăstiri)', '2026-06-06 04:30:00+02', 51, 4, 15500, 'RON', 'active', 'pelerinaj', NULL, 'Pelerinaj Iași – mănăstiri și biserici istorice.'),
  ('Drobeta-Turnu Severin', 'Târgu Jiu', '2026-06-13 07:00:00+02', 51, 4, 6900, 'RON', 'active', 'pelerinaj', NULL, 'Târgu Jiu – Brâncuși, Coloana Infinitului.'),
  ('Drobeta-Turnu Severin', 'Curtea de Argeș', '2026-06-20 06:00:00+02', 51, 4, 9900, 'RON', 'active', 'pelerinaj', NULL, 'Mănăstirea Curtea de Argeș – legenda Meșterului Manole.'),
  ('Drobeta-Turnu Severin', 'Nicula', '2026-06-27 05:30:00+02', 51, 4, 11900, 'RON', 'active', 'pelerinaj', NULL, 'Pelerinaj Nicula – icoana făcătoare de minuni.'),
  -- SEJUR LA MARE – Grecia
  ('Drobeta-Turnu Severin', 'Halkidiki', '2026-07-04 04:00:00+02', 51, 4, 87900, 'RON', 'active', 'sejur_mare', 'grecia', 'Sejur 7 nopți Halkidiki – Grecia.'),
  ('Drobeta-Turnu Severin', 'Thessaloniki / Kassandra', '2026-07-11 04:00:00+02', 51, 4, 90900, 'RON', 'active', 'sejur_mare', 'grecia', 'Sejur 7 nopți – Kassandra, Halkidiki.'),
  ('Drobeta-Turnu Severin', 'Creta', '2026-07-18 03:00:00+02', 51, 4, 99900, 'RON', 'active', 'sejur_mare', 'grecia', 'Sejur 7 nopți Creta – insula zeilor.'),
  -- SEJUR LA MARE – Turcia
  ('Drobeta-Turnu Severin', 'Istanbul', '2026-07-25 03:00:00+02', 51, 4, 77900, 'RON', 'active', 'sejur_mare', 'turcia', 'Sejur 5 nopți Istanbul.'),
  ('Drobeta-Turnu Severin', 'Antalya', '2026-08-01 02:00:00+02', 51, 4, 107900, 'RON', 'active', 'sejur_mare', 'turcia', 'Sejur 7 nopți Antalya – coasta turcească.'),
  ('Drobeta-Turnu Severin', 'Bodrum', '2026-08-08 02:30:00+02', 51, 4, 114900, 'RON', 'active', 'sejur_mare', 'turcia', 'Sejur 7 nopți Bodrum – Riviera turcească.'),
  -- SEJUR LA MARE – Albania
  ('Drobeta-Turnu Severin', 'Durres', '2026-08-15 05:00:00+02', 51, 4, 62900, 'RON', 'active', 'sejur_mare', 'albania', 'Sejur 7 nopți Durres – Albania.'),
  ('Drobeta-Turnu Severin', 'Vlora', '2026-08-22 05:00:00+02', 51, 4, 67900, 'RON', 'active', 'sejur_mare', 'albania', 'Sejur 7 nopți Vlora – Riviera albaneză.'),
  ('Drobeta-Turnu Severin', 'Sarandë', '2026-08-29 04:30:00+02', 51, 4, 72900, 'RON', 'active', 'sejur_mare', 'albania', 'Sejur 7 nopți Sarandë – „Riviera albaneză”.'),
  -- SEJUR LA MARE – Bulgaria
  ('Drobeta-Turnu Severin', 'Sunny Beach', '2026-09-05 04:00:00+02', 51, 4, 71900, 'RON', 'active', 'sejur_mare', 'bulgaria', 'Sejur 7 nopți Sunny Beach – Bulgaria.'),
  ('Drobeta-Turnu Severin', 'Golden Sands', '2026-09-12 04:00:00+02', 51, 4, 74900, 'RON', 'active', 'sejur_mare', 'bulgaria', 'Sejur 7 nopți Golden Sands – Bulgaria.'),
  ('Drobeta-Turnu Severin', 'Albena', '2026-09-19 04:00:00+02', 51, 4, 76900, 'RON', 'active', 'sejur_mare', 'bulgaria', 'Sejur 7 nopți Albena – litoral bulgăresc.'),
  -- Extra interne / mix
  ('Drobeta-Turnu Severin', 'București', '2026-09-26 07:00:00+02', 51, 4, 8900, 'RON', 'active', 'intern', NULL, 'Curso expres București.'),
  ('Drobeta-Turnu Severin', 'Constanța', '2026-10-03 06:30:00+02', 51, 4, 13900, 'RON', 'active', 'intern', NULL, 'Direct la mare – Constanța, toamnă.'),
  ('Drobeta-Turnu Severin', 'Brașov', '2026-10-10 06:00:00+02', 51, 4, 11900, 'RON', 'active', 'intern', NULL, 'Brașov – toamnă în Transilvania.');
