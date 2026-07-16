# ClairCRM

ClairCRM est un CRM statique destiné à gérer les contacts, opportunités, tâches,
rendez-vous, devis et factures depuis un navigateur.

## Lancer le projet

Ouvrez `index.html` dans un navigateur moderne. Aucun serveur ni installation
n’est nécessaire pour le développement local.

## Fonctionnalités

- Tableau de bord commercial et indicateurs.
- Gestion des contacts : création, recherche, modification et suppression.
- Pipeline d’opportunités et vue Kanban.
- Gestion des tâches avec échéance, heure et état d’avancement.
- Calendrier mensuel pour planifier tâches et rendez-vous.
- Gestion des devis et factures : création, modification, suppression, statuts
  et conversion d’un devis en facture.
- Export CSV et impression de document commercial.

## Organisation du code

| Fichier | Responsabilité |
| --- | --- |
| `index.html` | Structure de l’interface et chargement des ressources |
| `app.js` | Contacts, opportunités, tâches, projets et formulaire commun |
| `calendar.js` | Vue mensuelle et planification |
| `billing.js` | Devis et factures |
| `enhancements.js` | Vues complémentaires, recherche et export |
| `*.css` | Styles répartis par domaine fonctionnel |

## Données et confidentialité

Les données sont enregistrées dans le `localStorage` du navigateur. Elles ne
sont ni synchronisées entre appareils ni envoyées vers un serveur. Le déploiement
Netlify applique `noindex, nofollow` afin que le CRM ne soit pas référencé par
les moteurs de recherche.

## Vérification avant publication

```powershell
node --check app.js
node --check calendar.js
node --check billing.js
node --check enhancements.js
git diff --check
```
