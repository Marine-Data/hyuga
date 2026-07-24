-- ============================================================
-- SARAILLON — Migration : colonne "push" sur notifications
-- Déjà appliquée sur le projet Supabase "saraillon" (iupghubmnibbdipingnj).
--
-- ⚠️ Le secret x-internal-secret ci-dessous est un PLACEHOLDER. La vraie
-- valeur ne doit jamais être committée dans ce repo (elle l'a été par le
-- passé et a été rotée le 2026-07-24 suite à un audit — voir historique
-- git). Elle vit uniquement dans le trigger côté Supabase et dans le code
-- de la edge function send-push ; va la consulter/modifier directement
-- via le dashboard ou le SQL Editor si besoin.
-- ============================================================

-- Le trigger décidait seul, à partir du seul "type", s'il fallait réveiller tous les
-- téléphones. Or "type" est une catégorie d'onglet, pas un événement : un ❤️ ou un 💬
-- sur un défi porte le type 'challenge' et partait donc en push comme un vrai défi
-- relevé. La décision est désormais prise côté client (addNotification) et transmise ici.
alter table public.notifications add column if not exists push boolean;

comment on column public.notifications.push is
  'Décidé par addNotification() côté client. NULL = ancien client, on retombe sur le filtre par type.';

create or replace function public.trigger_send_push()
returns trigger
language plpgsql
security definer
as $function$
BEGIN
  -- COALESCE : tant que tous les téléphones n'ont pas rechargé la nouvelle version de
  -- l'app, les lignes arrivent avec push = NULL et gardent l'ancien comportement.
  IF COALESCE(NEW.push, NEW.type IN ('planning', 'corvees', 'surprises', 'tresor', 'challenge', 'inscriptions', 'chat')) THEN
    PERFORM net.http_post(
      url := 'https://iupghubmnibbdipingnj.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', '<<VOIR NOTE CI-DESSUS — NE PAS COMMITTER LA VRAIE VALEUR>>'
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
  END IF;
  RETURN NEW;
END;
$function$;
