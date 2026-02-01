-- Seed real circuits (rute) for Geroxym Travel – Drobeta-Turnu Severin base
-- Trigger trg_create_route_seats will create seats for each route on INSERT
-- Idempotent: inserts only when no routes exist (avoids duplicates on re-run)

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.routes) = 0 THEN
    INSERT INTO public.routes (
      origin,
      destination,
      depart_at,
      capacity_total,
      reserve_offline,
      price_cents,
      currency,
      created_by,
      status,
      route_category,
      route_subcategory,
      description
    ) VALUES
      -- INTERN: curse interne din România
      ('Drobeta-Turnu Severin', 'București', '2026-03-01 07:00:00+02', 49, 5, 9500, 'RON', NULL, 'active', 'intern', NULL, 'Curso expres București, plecare dimineața.'),
      ('Drobeta-Turnu Severin', 'București', '2026-03-08 07:00:00+02', 49, 5, 9500, 'RON', NULL, 'active', 'intern', NULL, 'Curso expres București, plecare dimineața.'),
      ('Drobeta-Turnu Severin', 'Constanța', '2026-03-15 06:30:00+02', 49, 5, 14900, 'RON', NULL, 'active', 'intern', NULL, 'Direct la mare – Constanța.'),
      ('Drobeta-Turnu Severin', 'Brașov', '2026-03-22 06:00:00+02', 49, 5, 12900, 'RON', NULL, 'active', 'intern', NULL, 'Brașov – Transilvania.'),
      ('Drobeta-Turnu Severin', 'Cluj-Napoca', '2026-04-05 05:30:00+02', 49, 5, 13900, 'RON', NULL, 'active', 'intern', NULL, 'Cluj-Napoca – inima Transilvaniei.'),
      ('Drobeta-Turnu Severin', 'Timișoara', '2026-04-12 07:00:00+02', 49, 5, 11900, 'RON', NULL, 'active', 'intern', NULL, 'Timișoara – capitală culturală.'),
      ('Drobeta-Turnu Severin', 'Sibiu', '2026-04-19 06:00:00+02', 49, 5, 12500, 'RON', NULL, 'active', 'intern', NULL, 'Sibiu – orașul ogivelor.'),
      ('Drobeta-Turnu Severin', 'Iași', '2026-04-26 05:00:00+02', 49, 5, 15900, 'RON', NULL, 'active', 'intern', NULL, 'Iași – capitală culturală a Moldovei.'),
      -- EXTERN: curse internaționale
      ('Drobeta-Turnu Severin', 'Sofia', '2026-05-03 06:00:00+02', 49, 5, 18900, 'RON', NULL, 'active', 'extern', NULL, 'Sofia – capitala Bulgariei.'),
      ('Drobeta-Turnu Severin', 'Belgrade', '2026-05-10 06:30:00+02', 49, 5, 17900, 'RON', NULL, 'active', 'extern', NULL, 'Belgrade – Serbia.'),
      ('Drobeta-Turnu Severin', 'Budapest', '2026-05-17 05:00:00+02', 49, 5, 21900, 'RON', NULL, 'active', 'extern', NULL, 'Budapest – capitala Ungariei.'),
      -- PELERINAJ
      ('Drobeta-Turnu Severin', 'Săpânța', '2026-05-24 05:30:00+02', 49, 5, 16900, 'RON', NULL, 'active', 'pelerinaj', NULL, 'Cimitirul Vesel și Mănăstiri Maramureș.'),
      ('Drobeta-Turnu Severin', 'Putna', '2026-06-07 05:00:00+02', 49, 5, 15900, 'RON', NULL, 'active', 'pelerinaj', NULL, 'Mănăstirea Putna – Ștefan cel Mare.'),
      ('Drobeta-Turnu Severin', 'Iași (Mănăstiri)', '2026-06-14 04:30:00+02', 49, 5, 16500, 'RON', NULL, 'active', 'pelerinaj', NULL, 'Pelerinaj Iași – mănăstiri și biserici istorice.'),
      ('Drobeta-Turnu Severin', 'Târgu Jiu', '2026-06-21 07:00:00+02', 49, 5, 7900, 'RON', NULL, 'active', 'pelerinaj', NULL, 'Târgu Jiu – Brâncuși, Coloana Infinitului.'),
      -- SEJUR LA MARE – Grecia
      ('Drobeta-Turnu Severin', 'Halkidiki', '2026-06-28 04:00:00+02', 49, 5, 89900, 'RON', NULL, 'active', 'sejur_mare', 'grecia', 'Sejur 7 nopți Halkidiki – Grecia.'),
      ('Drobeta-Turnu Severin', 'Thessaloniki / Kassandra', '2026-07-05 04:00:00+02', 49, 5, 92900, 'RON', NULL, 'active', 'sejur_mare', 'grecia', 'Sejur 7 nopți – Kassandra, Halkidiki.'),
      -- SEJUR LA MARE – Turcia
      ('Drobeta-Turnu Severin', 'Istanbul', '2026-07-12 03:00:00+02', 49, 5, 79900, 'RON', NULL, 'active', 'sejur_mare', 'turcia', 'Sejur 5 nopți Istanbul.'),
      ('Drobeta-Turnu Severin', 'Antalya', '2026-07-19 02:00:00+02', 49, 5, 109900, 'RON', NULL, 'active', 'sejur_mare', 'turcia', 'Sejur 7 nopți Antalya – coasta turcească.'),
      -- SEJUR LA MARE – Albania
      ('Drobeta-Turnu Severin', 'Durres', '2026-07-26 05:00:00+02', 49, 5, 64900, 'RON', NULL, 'active', 'sejur_mare', 'albania', 'Sejur 7 nopți Durres – Albania.'),
      ('Drobeta-Turnu Severin', 'Vlora', '2026-08-02 05:00:00+02', 49, 5, 69900, 'RON', NULL, 'active', 'sejur_mare', 'albania', 'Sejur 7 nopți Vlora – Riviera albaneză.'),
      -- SEJUR LA MARE – Bulgaria
      ('Drobeta-Turnu Severin', 'Sunny Beach', '2026-08-09 04:00:00+02', 49, 5, 74900, 'RON', NULL, 'active', 'sejur_mare', 'bulgaria', 'Sejur 7 nopți Sunny Beach – Bulgaria.'),
      ('Drobeta-Turnu Severin', 'Golden Sands', '2026-08-16 04:00:00+02', 49, 5, 77900, 'RON', NULL, 'active', 'sejur_mare', 'bulgaria', 'Sejur 7 nopți Golden Sands – Bulgaria.');
  END IF;
END $$;
