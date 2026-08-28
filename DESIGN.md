# Design — site et documents

Statut : spécification proposée pour implémentation ; aucun écran rendu ou validé à ce stade. Référence explicite : expérience de documentation shadcn/ui. Voir [PRD](docs/PRD.md).

## Scène d'utilisation

Un développeur consulte la documentation sur son ordinateur de travail, compare plusieurs PDF et copie du code. Une interface claire convient à la comparaison avec la page imprimée ; un thème sombre/system reste disponible sans modifier le thème des documents.

## Structure du site

| Route | Contenu et action principale |
| --- | --- |
| `/` | Promesse concise, vrais aperçus, entrée vers le catalogue et démarrage |
| `/templates/` | Recherche, filtres famille/format, résultat, navigation |
| `/templates/[slug]/` | Données, PDF réel, formats compatibles, thèmes, source, téléchargement |
| `/components/` et `/components/[slug]/` | API, exemple PDF, source, limites et installation |
| `/formats/` | Dimensions, compatibilités, marges et explications d'impression |
| `/themes/` | Trois thèmes montrés sur le même document |
| `/docs/[[...slug]]/` | Installation, guides, ajout d'un template, limites |

Slugs connus au build, 404 explicite. Pas de pages factices dans la navigation : un lien apparaît avec sa route fonctionnelle.

## Composition

- En-tête discret : marque textuelle docn-ui, Templates, Components, Docs, recherche, thème. Lien GitHub uniquement après configuration réelle.
- Barre latérale de documentation sur desktop ; `Sheet` sur mobile. Fil d'Ariane et sommaire seulement pour les pages qui en bénéficient.
- Largeur de lecture 65–75 caractères, zone de catalogue plus large. Vue template en deux colonnes à partir de 1024 px : paramètres 320–380 px, aperçu flexible ; en dessous, sections ou onglets empilés.
- Galerie : vignettes rasterisées depuis les PDF avec leurs proportions réelles. Ne pas forcer carte et reçu dans le même ratio A4 ; fond neutre autour de chaque support.
- Fiche : nom, famille, dimensions, nombre de pages/faces, actions. Onglets `Preview` et `Code` ; groupe de réglages Data, Format, Theme, Print séparé des onglets de vue.
- Le titre d'un template n'inclut pas son thème : ce sont deux choix distincts.

## shadcn/ui

Installer avec le CLI, committer les sources, utiliser les tokens sémantiques. Base UI par défaut, choisie une fois. Installer seulement les composants employés.

Composants prévus : Button, Input, Textarea, Label/Field, Select, Tabs, Tooltip, Sheet, Separator, Breadcrumb, Command/Dialog, Alert, Skeleton, Badge, DropdownMenu, Switch, Table et pagination simple si nécessaire. Ne pas supposer que les signatures d'API sont identiques entre bases ; consulter la documentation de la version résolue.

`components/ui` contient les primitives générées. `features/catalog`, `features/playground` et `features/docs` contiennent les compositions métier. Pas de copie ad hoc d'un bouton ou dialogue déjà disponible.

## Identité visuelle

- Tokens du site en OKLCH, base neutre, contraste des textes AA. Accent discret unique à fixer en L03, pas de palette inventée par chaque page.
- Geist Sans pour le site, Geist Mono pour le code, fichiers locaux et licences suivies. Polices PDF distinctes dans le registre documentaire.
- Rayons cohérents issus de shadcn, séparateurs légers, ombres réservées aux surfaces flottantes ; éviter les cartes imbriquées.
- Icônes Lucide avec label accessible ; boutons d'action de même hauteur.
- Animations de feedback de 150–200 ms, aucune apparition qui masque le contenu par défaut ; réduction de mouvement respectée.
- Pas de grille décorative, texte dégradé, effets de verre généralisés ou imitation du logo shadcn.

## États obligatoires

| Zone | États à concevoir |
| --- | --- |
| Catalogue | résultats, aucun résultat, recherche effacée, filtres restaurés |
| Éditeur | pristine, modifié valide, invalide, réinitialisation |
| Rendu | initial, chargement des assets, génération, prêt, obsolète, erreur, timeout |
| Images | absente, importée, refusée, retirée |
| Code | fichier choisi, copie réussie, presse-papiers indisponible |
| Export | disponible pour la révision courante, désactivé, échec récupérable |

Conserver le dernier PDF valide pendant une erreur de saisie, mais le signaler comme ancien et désactiver le téléchargement tant qu'il ne correspond pas à la saisie courante. Annoncer les erreurs près du champ et via une zone live non bavarde. Ne pas montrer un toast de succès avant la production du fichier.

## Interactions

Recherche via `Ctrl/Cmd+K`, focus rendu au déclencheur, Échap ferme la fenêtre. Tabulation logique dans l'éditeur, navigation entre pages du PDF, zoom et ajustement à la largeur. Les filtres publics peuvent vivre dans l'URL ; aucune donnée personnelle, image ou JSON de document dans l'URL ou localStorage. Préférence de thème du site seulement persistée.

Le panneau Code montre tous les fichiers nécessaires et un exemple d'utilisation typé. Modifier les données n'exécute jamais du code arbitraire. Les formats incompatibles sont absents ou désactivés avec motif, jamais appliqués silencieusement.

## Validation visuelle

Captures réelles à 375×812, 768×1024, 1280×800 et 1440×900, clair/sombre et zoom 200 %. Vérifier en particulier le reçu très haut, les deux faces d'une carte, l'absence de défilement horizontal global, le code long, la recherche au clavier et les états d'erreur. Preuves dans le rapport du lot ; aucune capture n'est encore disponible.
