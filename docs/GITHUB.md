# GitHub — dépôt, protections et pilotage

Décision du 2026-08-28 : dépôt **public `Osiris-Balonga/docn-ui`**, demandé pour un projet open source. La licence reste à confirmer ; public ne signifie pas qu'une licence a déjà été accordée. Exécution dans [L00G](implementation/lots/L00G-github-governance.md), avant L01. Les IDs et résultats réels vivent dans [github.json](implementation/github.json), [status.json](implementation/status.json) et le rapport du lot.

## 1. Dépôt et branches

- `dev` est la branche par défaut et d'intégration ; `main` reçoit les promotions stables.
- Branches de lots depuis `dev` ; PR vers `dev`. La seule source admise vers `main` est **`dev` du même dépôt**, contrôlée par ID de dépôt et nom de branche.
- Aucun `hotfix/*`, `release/*`, fork nommé `dev` ou autre branche ne cible directement `main`. Une correction urgente suit `fix/* -> dev -> main`.
- Après une promotion, resynchroniser si nécessaire `main -> dev` par PR sans nouvelle modification. Les branches de release ciblent d'abord `dev`, puis une PR distincte `dev -> main` promeut le candidat.
- Merge commits uniquement, squash et rebase merge désactivés : préserver les SHAs des stories. Pas de règle d'historique linéaire incompatible avec ce choix.
- Auto-merge désactivé. Pas de suppression automatique des branches : ne pas risquer de supprimer `dev` après une promotion. Nettoyer uniquement les branches de travail fusionnées, explicitement.
- Issues et Projects activés ; pas de Wiki, Pages, hébergement ou publication de package implicites.

## 2. Rulesets actifs attendus

Deux rulesets ciblent exactement `refs/heads/dev` et `refs/heads/main` : `protect-dev` et `protect-main`.

| Règle | dev | main |
| --- | --- | --- |
| PR obligatoire | Oui | Oui |
| Suppression de branche | Interdite | Interdite |
| Push forcé | Interdit | Interdit |
| Conversations résolues | Oui | Oui |
| Contournements permanents, y compris administrateurs/apps | Aucun | Aucun |
| Contrôle obligatoire dès L00G | `branch-policy` | `branch-policy` |
| App source du contrôle | GitHub Actions, ID réel lu via API | Même source |
| Méthode de fusion | Merge commit | Merge commit |

En travail solo, zéro approbation tierce requise ; les PR et contrôles restent obligatoires. Si un reviewer distinct est ajouté, décider explicitement du nombre d'approbations, du rejet des reviews périmées et de l'approbation du dernier push. Ne pas copier les quotas Munganga (1/2) qui bloqueraient un auteur seul ; ne pas inventer un CODEOWNER.

Ne pas activer `restrict_updates` sans besoin : cette restriction peut aussi empêcher les merges autorisés. Ne pas ajouter un bypass administrateur pour débloquer CI. L'administrateur peut techniquement modifier les règles ; l'agent n'en a pas l'autorisation pour contourner un échec.

Les rulesets de branches sont disponibles pour les dépôts publics GitHub Free ; leur activation doit être relue dans l'API, pas déduite de fichiers JSON versionnés. [Règles GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

## 3. Contrôle du sens des PR

`.github/workflows/branch-policy.yml` est un contrôle de gouvernance léger, pas une suite applicative. Il tourne sur ouverture, réouverture, synchronisation, modification de base et sortie du mode draft, sans filtre de chemins.

Utiliser `pull_request_target` pour lire la politique de la base de confiance. Le checkout, s'il est nécessaire pour réutiliser la fonction testée, est fixé explicitement à `pull_request.base.sha`, credentials non persistés, uniquement les fichiers de gouvernance. **Jamais de checkout, build, dépendance, script ou artefact de la branche proposée** dans ce workflow. Permissions `contents: read`, aucune écriture ni secret de Project. Le payload est lu comme JSON depuis `GITHUB_EVENT_PATH`, jamais interpolé comme commande shell. [Événement et précautions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target).

Politique : `dev` reçoit les préfixes prévus (`feat/`, `fix/`, `chore/`, `docs/`, `test/`, `ci/`, `build/`, `refactor/`, `release/`), y compris depuis un fork ; `main -> dev` est réservé au dépôt lui-même. Toute entrée manquante, base inconnue ou source interdite échoue explicitement. Vers `main`, comparer aussi `head.repo.id` et `base.repo.id` au dépôt courant.

Un workflow présent mais absent des required checks ne protège pas les fusions. Les noms des checks doivent être uniques ; vérifier leur association à la PR et à GitHub Actions avec une vraie PR. Le contrôle ne garantit pas à lui seul qu'une release a été autorisée ; la décision humaine reste distincte.

## 4. Bootstrap sans historique réécrit

1. Inspecter Git, cible, identité existante et accès ; ne pas réinitialiser un dépôt distant qui existe.
2. Préparer le plan, les templates, les rulesets et le workflow fiable dans des commits locaux. Vérifier liens, politique et absence de secrets.
3. Créer le dépôt vide public sans README/licence générés. Créer initialement `main` et `dev` sur le même SHA documentaire de bootstrap, descendant de L00, qui contient déjà la politique. Conserver les anciens SHAs ; aucune force ni réécriture des refs existantes.
4. Cette création initiale de références est l'unique exception de bootstrap aux PR. La consigner avec SHA ; elle n'autorise aucun push direct ultérieur. Activer immédiatement les deux rulesets, fixer `dev` comme défaut et activer explicitement GitHub Actions. Si les runs n'apparaissent pas malgré les permissions API, vérifier le message d'activation dans l'interface ; ne pas retirer le check requis.
5. Les commits suivants, y compris la trace de configuration, vont sur `chore/github-governance`, avec PR vers `dev`. Aucune fusion sans accord du mainteneur. Les protections ne sont jamais suspendues pour achever le lot.
6. Vérifier par lectures API et PR de contrôle. Les probes de push utilisent un commit vide isolé ; un succès inattendu arrête l'audit, sans reset forcé ni suppression pour masquer l'incident. Un `--dry-run` seul ne prouve pas le refus serveur.

## 5. CI progressive et contrôles exigés

L00G : uniquement `branch-policy`. L01 ajoute `quality`, `unit-tests` (les trois scopes légers une fois) et `build`, après un run réel réussi, puis les rend obligatoires. L02, L06 et L07 étendent respectivement PDF, E2E et consumers. L15 vérifie l'ensemble et ajoute `release-policy` pour les promotions ; il ne reporte pas les protections initiales à la fin du projet.

Si une suite lourde est conditionnelle, un check de synthèse stable vérifie succès ou non-applicabilité explicite ; ne pas exiger un workflow qui disparaît à cause de `paths-ignore`. Une release exécute tous les scopes. La CI n'exécute pas à la fois `validate:full` et chacune de ses sous-commandes. Les règles évoluent après lecture du nom et de l'app du check réel, jamais avec un résultat fictif.

## 6. Project et backlog

Un Project public **docn-ui V1**, lié au dépôt, contient les issues de travail. Créer **une issue par lot (18)** ; les stories et commits sont des checklists dans l'issue, pas 60 issues supplémentaires par défaut. Une sous-issue n'est utile que pour un travail autonome, un bug distinct ou une assignation séparée.

Chaque issue porte un marqueur stable `<!-- docn:lot:Lxx -->`, son titre `[Lxx] …`, les dépendances, le lien de fiche au SHA/branche approprié, les stories/commits, acceptations, vérifications ciblées et preuves. L00 est importée comme historique accompli, sans inventer une ancienne PR. L00G reste ouverte jusqu'à validation et fusion de sa PR documentaire.

Champs : **Status** unique (`Backlog`, `Ready`, `In progress`, `In review`, `Blocked`, `Done`), `Lot` (texte), `Priority` (`P0`, `P1`, `P2`). Assignees, Labels, Milestone et Linked pull requests utilisent les champs natifs. Pas de second champ `Workflow` qui puisse diverger du Status.

Labels limités : `type:lot`, `type:bug`, `type:enhancement`, `type:chore` ; `area:governance`, `area:site`, `area:pdf`, `area:registry`, `area:docs`, `area:qa`, `area:delivery`. La priorité vit dans le champ Priority, pas dans un label concurrent. Ne pas assigner automatiquement des collaborateurs de Munganga.

| Milestone | Lots |
| --- | --- |
| G0 — Gouvernance | L00, L00G |
| G1 — Faisabilité PDF | L01, L02 |
| G2 — Première carte complète | L03, L04, L05 |
| G3 — Distribution autonome | L06, L07 |
| G4 — Catalogue V1 | L08, L09, L10, L11 |
| G5 — Qualification | L12, L13, L14 |
| G6 — Livraison v1.0.0 | L15, L16 |

Pas de date, estimation ou sprint inventés. Vue tabulaire par défaut ; board par Status et vue des milestones si l'interface/API disponible permet leur configuration. Ne pas déclarer ces vues créées sans les lire ; leur absence n'empêche pas le suivi tabulaire.

## 7. Mise à jour par l'agent

| Moment | Action sur GitHub et documentation |
| --- | --- |
| Avant le lot | Lire issue et état local ; Ready seulement si dépendances intégrées, puis In progress au démarrage |
| Après une story vérifiée | Cocher la story, lier le SHA réel et la preuve ciblée ; ne pas fermer le lot |
| PR ouverte | `Closes #N` dans la PR vers dev ; lier la PR, passer In review, consigner URL/numéro |
| Blocage réel | Motif et condition de reprise, Blocked ; aucun faux succès ni modification de protections |
| Fusion autorisée dans dev | Lire merge SHA/date ; état local merged, issue fermée, Status Done |
| Release L16 | Done/released seulement après vérification publique ; ne pas fermer l'issue sur la seule PR de préparation |

`dev` étant la branche par défaut, les mots-clés de fermeture des PR qui la ciblent peuvent fermer les issues à la fusion. Pour L16 utiliser `Refs #N` jusqu'à livraison, puis fermeture explicite. [Fermeture d'issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).

Les automatisations natives sont utiles pour ajout au Project/fermeture, mais ne prouvent pas une acceptation ni une release. L'agent vérifie et synchronise explicitement les champs lors de chaque transition ; aucune automation périodique n'est nécessaire. Pas d'action qui clôt une issue lorsque l'utilisateur glisse simplement une carte dans Done.

Le `GITHUB_TOKEN` de dépôt ne donne pas accès au Project utilisateur. Utiliser la session `gh` déjà autorisée ; si ses droits manquent, demander l'accès sans extraire de token. Une automation serveur future nécessiterait une app ou un token dédié à permissions minimales, jamais injecté dans une PR non fiable. [Accès Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions).

## 8. Synchronisation et reprise

Les fiches définissent le travail ; `status.json` et QA apportent les preuves ; GitHub affiche le suivi partagé. `github.json` associe les IDs réels de dépôt, Project, champs/options, milestones, issues, items et PR. Aucun ID de Munganga n'est réutilisé.

Avant de créer, rechercher par ID enregistré puis marqueur de lot ; si plusieurs correspondances existent, arrêter. Mise à jour des sections gérées seulement, préserver commentaires, ajouts humains et cases déjà vérifiées. Relire l'état après chaque mutation ; une panne intermédiaire reprend sur les IDs existants. Aucune régénération destructive, suppression en masse, doublon d'issue ou déplacement arbitraire vers Backlog.

Les commandes d'administration restent distinctes des tests applicatifs. Les bodies multilignes passent par fichier/API structurée. Les droits d'administration servent à cette configuration demandée, pas à fusionner, publier le site ni contourner CI.
