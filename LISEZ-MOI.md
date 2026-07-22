# Saraillon — déploiement du 22 juillet 2026

## Comment faire

Ces 6 fichiers sont les versions **complètes et finales**. Pour chacun, sur GitHub
(`Marine-Data/saraillon`) : ouvrir le fichier → crayon ✏️ → tout sélectionner
(Ctrl+A) → coller le nouveau contenu → *Commit changes*.

Aucun autre fichier n'est à toucher. La partie Supabase est déjà appliquée.

| Fichier | Ce qui change |
|---|---|
| `saraillon-data.js` | Nouveau planning 10 jours, `PLANNING_VERSION = 5`, règles de corvées |
| `app-planning.js` | Photos de journée, corvées par jour, correctif push |
| `index.html` | Onboarding, lignes d'upload des photos dans les Réglages |
| `app-core.js` | Correctif du bug de notifications push |
| `app-challenges.js` | Likes et commentaires de défis silencieux |
| `app-features.js` | Commentaire obsolète |

## Après le déploiement

**Deux images à créer et uploader** (Réglages → photos de journée) :

- **Anse Magaud (J3)** → enregistre le fichier sous n'importe quel nom, l'app le
  renommera `day-magaud.jpg`
- **Almanarre (J8)** → deviendra `day-almanarre.jpg`

Les 7 autres photos restent en place et correspondent toujours à leur journée.
`day-plongee.jpg` et `day-viaferrata.jpg` ne sont plus appelées par l'app.

**Demander à chacune de recharger l'app une fois.** Tant qu'un téléphone tourne sur
l'ancienne version, ses notifications continuent d'être filtrées à l'ancienne (voir
plus bas) — rien ne casse, mais le correctif ne s'applique pas encore pour elle.
