# L00G — GitHub, protections et suivi du projet

Statut initial : **planned**. Branche : `chore/github-governance`.

Dépendances : L00. Exigences : GOV-01 à GOV-04 ; G0 étendu. Lot inséré avant L01 sans renuméroter les stories existantes.

## Lecture et entrée

Lire [AGENTS](../../../AGENTS.md), [le plan](../../../IMPLEMENTATION_PLAN.md), [GITHUB](../../GITHUB.md), [ADR 0002](../../adr/0002-git-release.md), [TESTING](../../TESTING.md), l'état et la preuve L00. La cible publique `Osiris-Balonga/docn-ui` est confirmée ; licence et déploiement restent distincts.

## Périmètre et fichiers

`.github/workflows/branch-policy.yml`, `.github/rulesets`, `.github/ISSUE_TEMPLATE`, template PR, `CONTRIBUTING.md`, `tooling/github`, `docs/implementation/github.json`, état et QA. Créer/configurer le dépôt et le Project, puis peupler les issues depuis les fiches. Aucun code Next.js/PDF ni installation npm.

## Stories et commits dans l'ordre

### L00G-S01 — `chore(github): add trusted branch policy and contribution templates`

- [x] Créer le contrôle de source/base avec code de confiance, aucune exécution de la PR proposée ; tester la table de cas utile avec Node sans dépendances.
- [x] Versionner les deux rulesets attendus, sans bypass, avec PR et branch-policy obligatoires ; fusion merge commit, historique conservé.
- [x] Ajouter templates issue/PR et CONTRIBUTING avec périmètres de tests, issue/lot, preuves et protocole de suivi.

**Acceptation :** Les fichiers de gouvernance sont prêts à être amorcés sur main/dev ; le contrôle refuse les sources non autorisées et les forks dev vers main.

**Vérification ciblée :** Contrôle documentaire, `git diff --check`, `node --test tooling/github/branch-policy.test.mjs`. Aucune suite applicative.

### L00G-S02 — `chore(github): record protected repository bootstrap`

- [x] Créer le dépôt public vide puis les références initiales sur le SHA de S01 ; consigner l'exception unique de bootstrap, sans réécrire L00.
- [x] Fixer dev par défaut, merge commits seuls, auto-merge désactivé ; activer protect-dev/protect-main et lire leur contenu effectif.
- [x] Enregistrer URL/IDs et droits effectivement obtenus ; les commits de traçabilité suivants restent sur la branche de lot avec PR.

**Acceptation :** Dépôt réel, deux branches protégées, aucune liste de bypass et contrôle obligatoire ; rien publié sur un hébergeur.

**Vérification ciblée :** Lectures API du dépôt/rulesets/branches ; vérifier l'app source du check et l'absence de contournement. Le test de PR réel est complété en S04.

### L00G-S03 — `chore(project): seed milestones and lot issue tracking`

- [ ] Créer/réutiliser le Project public docn-ui V1 lié au dépôt, un seul Status, Lot/Priority et champs natifs ; stocker IDs réels.
- [ ] Créer labels limités, sept milestones et 18 issues de lot avec checklists des 60 stories ; L00 historique, autres états justifiés par preuves.
- [ ] Idempotence par marqueur stable et mapping ; préserver contenu humain et cases existantes. Documenter mises à jour par l'agent et droits Projects, sans token ajouté aux workflows.

**Acceptation :** Chaque lot possède une seule issue et un seul item ; dépendances, commits, jalons et statuts sont lisibles ; aucune date ni assignation inventée.

**Vérification ciblée :** Inventaire API comparé aux fiches, liens, doublons, options/IDs et états ; relecture après mutations. Aucune suite PDF/browser.

### L00G-S04 — `docs(github): record policy checks and project handoff`

- [ ] Vérifier un push direct refusé sur chaque branche avec un commit vide de probe, sans suppression/force ; vérifier une PR interdite vers main et une PR normale vers dev.
- [ ] Relire les checks effectifs et l'état de fusion ; fermer la PR négative sans fusion. Conserver la PR de configuration vers dev, liée à l'issue.
- [ ] Mettre à jour état, QA, suivi GitHub et guide de reprise avec preuves réelles. Ne pas marquer merged avant accord et fusion observée.

**Acceptation :** Les protections ont des preuves réelles et le Project reflète la PR ; L01 attend l'intégration de L00G. Les limites éventuelles sont explicites.

**Vérification ciblée :** Refus serveur, checks et métadonnées de PR, audit API final ; aucune tentative de force push/suppression, aucune fusion automatique.

## Critère de sortie

G0 étendu : configuration distante vérifiée, suivi initial créé, PR documentaire prête. `in_review` jusqu'à fusion autorisée ; L01 dépend de cette intégration. Un contrôle local ou un JSON ne constitue pas une preuve de protection active.

## Hors périmètre

Modification de Munganga/paint-3d, licence choisie arbitrairement, déploiement du site, achat, secret Projects dans CI, merge sans accord, protection provisoirement désactivée.
