-- ============================================================
-- SARAILLON — Migration : rendre checklist_valise personnelle
-- À REJOUER TOI-MÊME sur le projet Supabase (SQL Editor), cette
-- migration n'a pas encore été appliquée.
--
-- Contexte : jusqu'ici, la table checklist_valise n'avait pas de
-- colonne person_id — la clé de fusion (onConflict) était juste
-- "key". C'est pour ça que la synchro cloud avait été désactivée
-- dans le code (commentaire "LOCAL ONLY - données trop volatiles") :
-- sans person_id, synchroniser aurait fait partager les mêmes cases
-- cochées entre tout le monde. Cette migration ajoute la colonne
-- manquante pour que chacun ait bien sa propre checklist, synchronisée
-- entre ses appareils mais jamais visible/modifiable par les autres.
-- ============================================================

-- 1) Ajouter la colonne person_id (si elle n'existe pas déjà)
alter table public.checklist_valise
  add column if not exists person_id integer;

-- 2) Les anciennes lignes (sans person_id) ne sont plus exploitables
--    de façon fiable — elles seront ignorées par le code (qui filtre
--    désormais par person_id). Optionnel : les supprimer pour repartir propre.
-- delete from public.checklist_valise where person_id is null;

-- 3) Remplacer l'ancienne contrainte d'unicité (key seul) par (key, person_id)
alter table public.checklist_valise
  drop constraint if exists checklist_valise_key_key;

alter table public.checklist_valise
  add constraint checklist_valise_key_person_id_key unique (key, person_id);

-- 4) RLS inchangée (accès anonyme, comme le reste du projet)
alter table public.checklist_valise enable row level security;

drop policy if exists "Allow anonymous access to checklist_valise" on public.checklist_valise;
create policy "Allow anonymous access to checklist_valise"
  on public.checklist_valise
  for all
  using (true)
  with check (true);
