# Saraillon — déploiement du 22 juillet 2026

## Fichiers à coller dans GitHub

Ouvrir chaque fichier sur `Marine-Data/saraillon` → crayon ✏️ → tout sélectionner
(Ctrl+A) → coller → *Commit changes*.

| Fichier | Ce qui change |
|---|---|
| `saraillon-data.js` | Nouveau planning, plongée du mercredi matin, règles de corvées, réservations |
| `app-core.js` | Carte Réservations, nouvelle navigation, correctif notifications push |
| `index.html` | Barre du bas à 5 destinations, onglet Réservations, uploads photos |
| `styles.css` | Correctif du header fixe, barre du bas colorée |
| `app-planning.js` | Photos de journée, corvées par jour, demi-journée |
| `app-gallery.js` | Repli d'upload rendu visible, garde-fou vidéo, outil de migration |
| `app-activities.js` | Correctifs désinscription et suppression d'articles de courses |
| `app-challenges.js` | Likes et commentaires de défis silencieux |
| `app-features.js` | Commentaire obsolète |
| `sw.js` | **Version du cache → v4** (indispensable, sinon rien ne change sur les téléphones) |

Deux fichiers SQL à **ajouter** (*Add file → Create new file*), pour l'historique
seulement — déjà appliqués sur Supabase : `supabase_migration_reservations.sql` et
`supabase_migration_notifications_push.sql`.

## Déjà fait côté Supabase

- Colonne `push` sur `notifications` + trigger corrigé
- Tables `reservations` et `reservation_targets`
- `trip_planning` synchronisé (10 jours, plongée incluse)
- Inscriptions plongée déplacées vers le mercredi ; Inès retirée (elle s'était
  désinscrite elle-même), Sonia conservée
- `morning-digest` v10 : rappelle les réservations non faites à moins de 3 jours

## Après le déploiement

**Fermer complètement l'app et la rouvrir deux fois.** La première ouverture installe
le nouveau service worker, la seconde sert les fichiers à jour. Sur iPhone, glisser
l'app hors du sélecteur de tâches.

**Deux images à créer et uploader** dans Réglages → photos de journée :
Anse Magaud (J3) et Almanarre (J8).

**Lancer une fois** Réglages → Données → « Alléger les photos historiques », avec du
réseau. Ça déplace les 3 photos de juillet hors de la base (1,3 Mo).

## À retenir pour la suite

**À chaque modification d'un `.js`, `.html` ou `.css` : incrémenter `CACHE_VERSION`
dans `sw.js`.** Sinon les téléphones gardent l'ancienne version, parfois plusieurs
jours, et peuvent même mélanger ancien et nouveau code.

Si le planning change, trois endroits à aligner dans cet ordre :
1. `planningData` dans `saraillon-data.js` (+ incrémenter `PLANNING_VERSION`)
2. la table `trip_planning` sur Supabase — sinon le digest du matin ment
3. la table `reservation_targets` si une réservation est ajoutée ou retirée
