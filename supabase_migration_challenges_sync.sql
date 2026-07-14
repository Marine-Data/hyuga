-- ============================================================
-- SARAILLON — Migration : synchronisation des Défis entre appareils
-- À REJOUER TOI-MÊME sur le projet Supabase (SQL Editor).
--
-- Contexte : jusqu'ici, la table "challenges" n'existait pas du tout
-- côté Supabase. Qui avait relevé quoi, les preuves photo/vidéo, les
-- likes et les commentaires restaient uniquement sur le téléphone de
-- chaque personne — jamais partagés avec le reste du groupe. C'est la
-- cause des commentaires "manquants" : ils existaient bien, juste sur
-- un autre téléphone que le tien. Cette migration crée la table.
-- ============================================================

create table if not exists public.challenges (
  id bigint primary key,
  creator text,
  is_quest boolean default false,
  quest_label text,
  xp integer default 20,
  description text default '',
  media jsonb,
  completed_by jsonb default '[]'::jsonb,
  proofs jsonb default '{}'::jsonb,
  likes jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.challenges enable row level security;

drop policy if exists "Allow anonymous access to challenges" on public.challenges;
create policy "Allow anonymous access to challenges"
  on public.challenges
  for all
  using (true)
  with check (true);
