# Saraillon — déploiement du 22 juillet 2026

## Fichiers à coller dans GitHub

Ouvrir chaque fichier sur `Marine-Data/saraillon` → crayon ✏️ → tout sélectionner
(Ctrl+A) → coller → *Commit changes*.

| Fichier | Ce qui change |
|---|---|
| `saraillon-data.js` | Nouveau planning, plongée du mercredi matin, règles de corvées, réservations |
| `app-core.js` | Carte Réservations, correctif du bug de notifications push |
| `app-planning.js` | Photos de journée, corvées par jour, activités de demi-journée |
| `index.html` | Onglet Réservations, onboarding, uploads photos |
| `app-challenges.js` | Likes et commentaires de défis silencieux |
| `app-features.js` | Commentaire obsolète |

Deux fichiers SQL sont à **ajouter** (bouton *Add file → Create new file*), pour
l'historique uniquement — ils sont déjà appliqués sur Supabase :
`supabase_migration_reservations.sql` et `supabase_migration_notifications_push.sql`.

## Déjà fait côté Supabase

- Colonne `push` sur `notifications` + trigger corrigé
- Tables `reservations` et `reservation_targets`
- `trip_planning` synchronisé avec le nouveau planning
- `morning-digest` v10 : rappelle les réservations non faites à moins de 3 jours

## Après le déploiement

**Deux images à créer et uploader** dans Réglages → photos de journée :
Anse Magaud (J3) et Almanarre (J8). Les sept autres restent valables.

**Demander à chacune de recharger l'app une fois**, pour que le correctif des
notifications s'applique sur son téléphone.

## Si le planning change plus tard

Trois endroits à tenir alignés, dans cet ordre :
1. `planningData` dans `saraillon-data.js` (+ incrémenter `PLANNING_VERSION`)
2. la table `trip_planning` sur Supabase — sinon le digest du matin annonce l'ancien programme
3. la table `reservation_targets` si une réservation est ajoutée ou retirée
