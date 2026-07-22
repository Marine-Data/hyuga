-- ============================================================
-- SARAILLON — Migration : réservations à faire
-- Déjà appliquée sur le projet Supabase "saraillon" (iupghubmnibbdipingnj).
-- Copie pour l'historique git — pas besoin de la rejouer.
-- ============================================================

-- État partagé "c'est réservé, et par qui". La LISTE des réservations n'est PAS
-- stockée ici : elle est dérivée de planningData côté app (champ "reservation" sur
-- une activité), pour ne pas créer une source de vérité de plus.
-- id = "dayIdx-actIdx".
create table if not exists public.reservations (
  id text primary key,
  done boolean not null default false,
  person_id integer,
  person_name text,
  updated_at timestamptz not null default now()
);

alter table public.reservations enable row level security;
drop policy if exists "Allow anonymous access to reservations" on public.reservations;
create policy "Allow anonymous access to reservations"
  on public.reservations for all using (true) with check (true);

-- Miroir minimal de la liste, pour le digest du matin (une edge function ne peut pas
-- lire planningData, qui vit dans le JS). À tenir à jour si le planning change.
create table if not exists public.reservation_targets (
  id text primary key,
  day_date date not null,
  label text not null,
  emoji text
);

alter table public.reservation_targets enable row level security;
drop policy if exists "Allow anonymous access to reservation_targets" on public.reservation_targets;
create policy "Allow anonymous access to reservation_targets"
  on public.reservation_targets for all using (true) with check (true);

insert into public.reservation_targets (id, day_date, label, emoji) values
  ('2-2','2026-08-23','Dîner au restaurant à l''Anse Magaud','🍽️'),
  ('3-1','2026-08-24','Pizzas du Colombier','🍕'),
  ('3-2','2026-08-24','La Ferme des Olivades','🫒'),
  ('4-0','2026-08-25','Location du bateau','⛵'),
  ('5-0','2026-08-26','Plongée','🤿'),
  ('6-2','2026-08-27','Dîner au Colombier','🍕'),
  ('7-4','2026-08-28','Restaurant à Hyères','🍽️'),
  ('8-4','2026-08-29','Dîner au Mourillon','🍽️')
on conflict (id) do update
  set day_date = excluded.day_date, label = excluded.label, emoji = excluded.emoji;

-- Voir aussi supabase_migration_notifications_push.sql pour le correctif du trigger push.
