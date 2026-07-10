-- ============================================================
-- SARAILLON — Migration : table chore_assignments
-- Déjà appliquée directement sur le projet Supabase "saraillon"
-- (iupghubmnibbdipingnj). Ce fichier est une copie pour ton repo/historique
-- git — pas besoin de le rejouer, sauf si tu recrées le projet à zéro.
-- ============================================================

create table if not exists public.chore_assignments (
  id uuid primary key default gen_random_uuid(),
  day_idx integer not null,
  person_id integer not null,
  chore_name text not null,
  emoji text,
  xp integer not null default 15,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.chore_assignments enable row level security;

drop policy if exists "Allow anonymous access to chore_assignments" on public.chore_assignments;
create policy "Allow anonymous access to chore_assignments"
  on public.chore_assignments
  for all
  using (true)
  with check (true);
