-- ============================================================
-- SARAILLON — Migration : lien direct depuis une notification
-- À REJOUER TOI-MÊME sur le projet Supabase (SQL Editor).
--
-- Contexte : les notifications ("X a commenté ta photo", "X a
-- relevé un défi"...) ne gardaient jusqu'ici aucune référence vers
-- l'élément précis concerné (quelle photo, quel défi) — cliquer
-- dessus ouvrait juste l'onglet général (Galerie, Défis), obligeant
-- à chercher soi-même le bon élément. Cette migration ajoute la
-- colonne manquante pour permettre un lien direct.
-- ============================================================

alter table public.notifications
  add column if not exists ref_id integer;
