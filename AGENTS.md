# Instructions aux agents — docn-ui

## Mission et autorité

Construire le produit décrit dans [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), un lot à la fois. Les demandes explicites du mainteneur priment sur le plan. Ne pas confondre une recommandation technique avec une autorisation de publier.

Le mainteneur a autorisé le démarrage de l'implémentation locale le 2026-08-28. Suivre l'état réel dans `docs/implementation/status.json` et le protocole par lot. Cette autorisation ne couvre ni un push, ni une création de dépôt distant, un déploiement, une publication npm ou un achat de domaine.

## Lecture obligatoire au début d'un lot

1. [État](docs/implementation/status.json) et plan maître.
2. [Produit](PRODUCT.md), [design](DESIGN.md), [PRD](docs/PRD.md).
3. [Architecture](docs/ARCHITECTURE.md), ADR et spécifications cités par la fiche.
4. Fiche du lot, critères de sortie du précédent et preuves associées.

Ne pas relire tous les lots en détail à chaque reprise. Ne pas traiter les exemples d'API comme du code déjà présent.

## Protocole d'exécution

- Inspecter Git et les modifications existantes avant d'écrire ; préserver le travail utilisateur.
- Suivre les stories et messages de commits de la fiche. Une intention cohérente et testée par commit ; inclure les tests du comportement dans le commit concerné.
- Ne pas créer de commits volontairement rouges. Un correctif imprévu reçoit un commit `fix(...)` distinct et une explication dans les preuves.
- Ne pas accumuler tout un lot dans un commit final. Les commits détaillés font partie du livrable.
- Ne jamais changer le statut en `verified_local` sans les tests et preuves exigés. Une commande lancée n'est pas une vérification réussie.
- Mettre à jour `docs/implementation/status.json` et `docs/qa/Lxx.md` dans les commits du lot ; ne pas inscrire un faux SHA. Un SHA peut être enregistré au commit suivant, sans amendement artificiel.
- Mode connecté : une branche par lot, PR vers `dev`, attente de fusion autorisée avant le suivant. Pas de merge automatique.
- Sans remote : commits et validations locaux possibles si l'implémentation est autorisée. Garder les branches séquentielles à partir du dernier lot vérifié, noter `verified_local` ; ne pas prétendre à une PR ou une livraison. Documenter les bases de branches pour les PR ultérieures.
- Une limite de temps, un test indisponible ou une dépendance externe manquante se signalent explicitement ; ne pas remplacer une preuve réelle par une capture fictive.

## Frontières et qualité

- shadcn/ui réel pour le site ; sources dans `apps/www/src/components/ui`. Base UI retenue par défaut dans l'ADR 0001, sans mélanger des composants de bases différentes.
- Aucun composant DOM, Tailwind ou shadcn dans les documents PDF. Les documents utilisent `@react-pdf/renderer` et leurs propres tokens.
- Un seul code source de chaque template ; catalogue, aperçu, export et registre en dérivent.
- Rendu du contenu utilisateur local dans le navigateur ; ne pas ajouter de route serveur de génération, télémétrie ou stockage distant sans nouvelle décision.
- Pas d'évaluation de JSX/JavaScript saisi par l'utilisateur. JSON et images autorisées seulement.
- Pas d'abstraction générique de moteur multiformat, de CMS, de CLI propriétaire, d'authentification ni de facturation SaaS dans cette V1.
- Pas de nouvelle dépendance sans raison, licence et impact sur le bundle. Versions exactes après L01, lockfile commité.
- Tests proportionnés au comportement : chiffres et géométrie, contenu réel du PDF, vérification visuelle, parcours utilisateur et installation hors monorepo.
- Instruction explicite du mainteneur : pas de multiplication de tests inutiles. Suivre [TESTING.md](docs/TESTING.md), choisir le périmètre le plus bas suffisant, réutiliser les fixtures et ne pas retester shadcn. Pas de produit cartésien des variantes, pas de suite complète à chaque commit.
- Ne pas diluer les seuils, désactiver un contrôle ou régénérer des références visuelles uniquement pour faire passer CI.
- Tester le site responsive, le clavier et la préférence de réduction des animations.
- Ne pas revendiquer PDF/X, CMJN, PDF/UA, conformité fiscale ou validité d'un billet sécurisé.

## Sécurité de l'espace de travail

`C:/Users/Dell/Documents/Dev Projects/paint-3d` est une référence en lecture seule. Ne jamais y écrire, changer de branche, créer de worktree, installer, committer ou lancer un nettoyage. Ne pas importer ses contraintes caméra/MediaPipe dans docn-ui.

Pas de `git reset --hard`, `git clean`, push forcé, suppression de fichiers utilisateur ni réécriture d'historique. Aucun secret, document personnel, build ou rapport volumineux dans Git.

## Rapport de fin de lot

Indiquer : lot/stories réalisés, commits créés, tests exécutés et résultats, preuves, écarts au plan, limitations et prochaine étape admissible. Distinguer `verified_local`, `merged` et `released`.
