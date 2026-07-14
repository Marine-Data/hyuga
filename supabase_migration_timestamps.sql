-- ============================================================
-- SARAILLON — Migration : dates/heures fiables partout
-- À REJOUER TOI-MÊME sur le projet Supabase (SQL Editor).
--
-- Contexte : la Galerie et les Notifications n'envoyaient jamais leur
-- date de création à Supabase — l'app comptait uniquement sur la base
-- pour la deviner. Résultat : une photo ou une notif pouvait afficher
-- "à l'instant" au lieu de sa vraie date, différemment selon qui la
-- rechargeait et quand. Cette migration garantit que la colonne existe
-- pour stocker la vraie date envoyée par l'app (voir app-core.js).
-- ============================================================

alter table public.gallery_items
  add column if not exists timestamp timestamptz;

alter table public.notifications
  add column if not exists timestamp timestamptz;

-- Les défis (nouvelle table, voir supabase_migration_challenges_sync.sql)
-- ont déjà leur colonne timestamp dès la création.
