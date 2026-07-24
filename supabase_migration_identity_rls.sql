-- ============================================================
-- SARAILLON — Migration : vraie identité par profil + RLS restreinte
-- Déjà appliquée sur le projet Supabase "saraillon" (iupghubmnibbdipingnj)
-- le 24/07/2026, suite à un audit sécurité. Copie pour l'historique git —
-- pas besoin de la rejouer.
--
-- Contexte : jusqu'ici, "se connecter" dans l'app = choisir un nom dans une
-- liste (voir selectProfile() dans app-core.js), sans rien vérifier côté
-- serveur. Toutes les policies RLS étaient "using (true) with check (true)"
-- (accès anonyme total) : n'importe qui possédant la clé publique Supabase
-- (visible dans index.html) pouvait lire, modifier ou supprimer les
-- données de n'importe quel profil sur les ~20 tables réellement utilisées
-- par l'app, plus une quinzaine de tables mortes (restes d'itérations
-- précédentes, jamais lues/écrites par le code actuel).
--
-- Ce que fait cette migration :
-- 1) Un système d'identité minimal : chaque profil est lié à une session
--    Supabase Auth anonyme via un code secret choisi par la personne elle-
--    même au premier lancement (voir claim_person ci-dessous). Le code
--    n'est jamais lisible en clair (haché avec pgcrypto), et personne ne
--    peut lier un profil sans connaître son code.
-- 2) Réécriture des policies RLS des 20 tables actives : personnelles
--    (checklist, notifications push, billets de train, messages privés...)
--    restreintes à la personne concernée ; partagées (planning, galerie,
--    défis, corvées...) ouvertes à tout membre de la famille identifié,
--    mais plus au premier venu sur internet ; suppression restreinte à
--    l'auteur quand une colonne le permet.
-- 3) Fermeture de l'accès public sur les tables mortes (aucune donnée ni
--    fonctionnalité de l'app n'en dépend).
--
-- Voir app-core.js (ensurePersonClaimed, showPersonCodeModal,
-- submitPersonCode) pour la partie client, et index.html (#modalPersonCode)
-- pour la modale.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.person_auth (
  person_id integer primary key,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now()
);
alter table public.person_auth enable row level security;
create policy "no direct access" on public.person_auth for all using (false) with check (false);

create table if not exists public.person_pins (
  person_id integer primary key,
  pin_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.person_pins enable row level security;
create policy "no direct access" on public.person_pins for all using (false) with check (false);

create or replace function public.current_person_id()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select person_id from public.person_auth where auth_user_id = auth.uid();
$$;

create or replace function public.person_has_pin(p_person_id integer)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.person_pins where person_id = p_person_id);
$$;

-- Seule porte d'entrée pour lier un auth_user_id à un person_id : au premier appel pour
-- un person_id donné, enregistre le code fourni comme code de cette personne ; aux appels
-- suivants, vérifie qu'il correspond avant de (re)lier l'appareil courant (ex : nouveau
-- téléphone, réinstallation).
create or replace function public.claim_person(p_person_id integer, p_pin text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_pin is null or length(p_pin) < 4 then
    raise exception 'code trop court';
  end if;

  select pin_hash into v_hash from public.person_pins where person_id = p_person_id;

  if v_hash is null then
    insert into public.person_pins (person_id, pin_hash)
    values (p_person_id, crypt(p_pin, gen_salt('bf')));
  else
    if crypt(p_pin, v_hash) <> v_hash then
      raise exception 'code incorrect';
    end if;
  end if;

  insert into public.person_auth (person_id, auth_user_id)
  values (p_person_id, v_uid)
  on conflict (person_id) do update set auth_user_id = excluded.auth_user_id, claimed_at = now();

  return p_person_id;
end;
$$;

revoke all on function public.claim_person(integer, text) from public;
grant execute on function public.claim_person(integer, text) to anon, authenticated;
revoke all on function public.current_person_id() from public;
grant execute on function public.current_person_id() to anon, authenticated;
revoke all on function public.person_has_pin(integer) from public;
grant execute on function public.person_has_pin(integer) to anon, authenticated;

-- ============== Tables personnelles (accès restreint à la personne) ==============
drop policy if exists "Allow anonymous access to push_subscriptions" on public.push_subscriptions;
create policy "own rows only" on public.push_subscriptions for all
  using (current_person_id() = person_id) with check (current_person_id() = person_id);

drop policy if exists "allow all" on public.private_messages;
create policy "read own sent or received" on public.private_messages for select
  using (current_person_id() = sender_id or current_person_id() = target_id);
create policy "send as self" on public.private_messages for insert
  with check (current_person_id() = sender_id);
create policy "delete own sent" on public.private_messages for delete
  using (current_person_id() = sender_id);

drop policy if exists "allow all travel_tickets" on public.travel_tickets;
create policy "own rows only" on public.travel_tickets for all
  using (current_person_id() = person_id) with check (current_person_id() = person_id);

drop policy if exists "Allow anonymous access to checklist_valise" on public.checklist_valise;
create policy "own rows only" on public.checklist_valise for all
  using (current_person_id() = person_id) with check (current_person_id() = person_id);

-- Écriture personnelle, lecture partagée (le groupe doit voir ces infos)
drop policy if exists "allow all travel_info" on public.travel_info;
create policy "family read" on public.travel_info for select using (current_person_id() is not null);
create policy "own rows write" on public.travel_info for insert with check (current_person_id() = person_id);
create policy "own rows update" on public.travel_info for update
  using (current_person_id() = person_id) with check (current_person_id() = person_id);

drop policy if exists "Allow anonymous access to secret_missions" on public.secret_missions;
create policy "family read" on public.secret_missions for select using (current_person_id() is not null);
create policy "own rows write" on public.secret_missions for insert with check (current_person_id() = person_id);
create policy "own rows update" on public.secret_missions for update
  using (current_person_id() = person_id) with check (current_person_id() = person_id);

drop policy if exists "Allow anonymous access to user_profiles" on public.user_profiles;
create policy "family read" on public.user_profiles for select using (current_person_id() is not null);
create policy "own rows write" on public.user_profiles for insert with check (current_person_id() = person_id);
create policy "own rows update" on public.user_profiles for update
  using (current_person_id() = person_id) with check (current_person_id() = person_id);

-- ============== Tables partagées (tout membre identifié) ==============
drop policy if exists "allow all deleted_items" on public.deleted_items;
create policy "family members" on public.deleted_items for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "allow all chat_messages" on public.chat_messages;
create policy "family read/insert" on public.chat_messages for select using (current_person_id() is not null);
create policy "send as self" on public.chat_messages for insert with check (current_person_id() = person_id);
create policy "family react" on public.chat_messages for update
  using (current_person_id() is not null) with check (current_person_id() is not null);
create policy "delete own message" on public.chat_messages for delete using (current_person_id() = person_id);

drop policy if exists "Allow anonymous access to shopping_list" on public.shopping_list;
drop policy if exists "Enable insert access" on public.shopping_list;
drop policy if exists "Enable update access" on public.shopping_list;
drop policy if exists "Enable delete access" on public.shopping_list;
drop policy if exists "Enable read access" on public.shopping_list;
create policy "family members" on public.shopping_list for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow anonymous access to inscriptions" on public.inscriptions;
create policy "family read" on public.inscriptions for select using (current_person_id() is not null);
create policy "own rows write" on public.inscriptions for insert with check (current_person_id() = person_id);
create policy "own rows delete" on public.inscriptions for delete using (current_person_id() = person_id);

drop policy if exists "Allow anonymous access to challenges" on public.challenges;
create policy "family members" on public.challenges for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow anonymous access to gallery_items" on public.gallery_items;
create policy "family members" on public.gallery_items for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow anonymous access to feed_entries" on public.feed_entries;
create policy "family read" on public.feed_entries for select using (current_person_id() is not null);
create policy "own rows write" on public.feed_entries for insert with check (current_person_id() = person_id);
create policy "family update likes/comments" on public.feed_entries for update
  using (current_person_id() is not null) with check (current_person_id() is not null);
create policy "own rows delete" on public.feed_entries for delete using (current_person_id() = person_id);

drop policy if exists "polls_delete_all" on public.polls;
drop policy if exists "polls_insert_all" on public.polls;
drop policy if exists "polls_update_all" on public.polls;
drop policy if exists "polls_select_all" on public.polls;
create policy "family members" on public.polls for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "expenses_delete_all" on public.expenses;
drop policy if exists "expenses_update_all" on public.expenses;
drop policy if exists "expenses_insert_all" on public.expenses;
drop policy if exists "expenses_select_all" on public.expenses;
create policy "family members" on public.expenses for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow all" on public.notifications;
drop policy if exists "Allow anonymous access to notifications" on public.notifications;
create policy "family read" on public.notifications for select using (current_person_id() is not null);
create policy "own rows write" on public.notifications for insert with check (current_person_id() = author_id);
create policy "family update readby" on public.notifications for update
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow anonymous access to chore_assignments" on public.chore_assignments;
create policy "family members" on public.chore_assignments for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow anonymous access to reservations" on public.reservations;
create policy "family members" on public.reservations for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

drop policy if exists "Allow anonymous access to treasure_hunt_items" on public.treasure_hunt_items;
create policy "family members" on public.treasure_hunt_items for all
  using (current_person_id() is not null) with check (current_person_id() is not null);

-- ============== Tables mortes : accès public retiré ==============
-- Jamais lues/écrites par l'app live (restes d'itérations précédentes) ou gérées
-- uniquement côté serveur via service_role (qui n'est de toute façon jamais soumis à la
-- RLS) : reservation_targets et trip_planning (edge function morning-digest).
drop policy if exists "Enable delete access" on public.activities;
drop policy if exists "Enable insert access" on public.activities;
drop policy if exists "Enable update access" on public.activities;
drop policy if exists "Enable read access" on public.activities;
drop policy if exists "Allow all" on public.challenges_sync;
drop policy if exists "comments_authenticated" on public.comments;
drop policy if exists "corvee_assignments_select" on public.corvee_assignments;
drop policy if exists "corvee_assignments_insert" on public.corvee_assignments;
drop policy if exists "public_read" on public.corvees;
drop policy if exists "public_read" on public.defis;
drop policy if exists "public read" on public.departure_tasks;
drop policy if exists "public update" on public.departure_tasks;
drop policy if exists "public write" on public.departure_tasks;
drop policy if exists "public_read" on public.equipe;
drop policy if exists "likes_authenticated" on public.likes;
drop policy if exists "Enable insert access" on public.meals;
drop policy if exists "Enable read access" on public.meals;
drop policy if exists "Enable update access" on public.meals;
drop policy if exists "Enable all access for messages_caches" on public.messages_caches;
drop policy if exists "Enable read access" on public.photos;
drop policy if exists "Enable insert access" on public.photos;
drop policy if exists "public_read" on public.programme;
drop policy if exists "Allow anonymous access to reservation_targets" on public.reservation_targets;
drop policy if exists "allow all scheduled_broadcasts" on public.scheduled_broadcasts;
drop policy if exists "Enable read access" on public.surprises;
drop policy if exists "Enable insert access" on public.surprises;
drop policy if exists "allow read trip_planning" on public.trip_planning;
