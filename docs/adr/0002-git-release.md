# ADR 0002 — Lots, commits et publication

Date : 2026-08-28. Statut : décision révisée après demande de setup GitHub public ; détails et preuves dans [GITHUB](../GITHUB.md).

## Décision

`main` est la branche stable ; `dev` l'intégration et la branche par défaut GitHub. Une branche par lot, PR vers `dev`, seule `dev` du même dépôt vers `main`. Pas d'exception hotfix. L00G initialise le dépôt public `Osiris-Balonga/docn-ui`, les protections, le Project et les issues avant L01.

Merge commits uniquement, afin de préserver les SHAs et commits détaillés. Squash, rebase merge, historique linéaire imposé et auto-merge désactivés. Aucun bypass de ruleset ; PR et contrôles obligatoires. Zéro review tierce requise en mode solo, à renforcer lorsqu'un reviewer distinct est disponible.

## Hors ligne

Les validations locales sont distinctes de CI/merge. Une demande explicite de poursuivre localement permet des branches empilées sur le dernier lot vérifié. Documenter base/head. Quand un remote existe, traiter les PR dans l'ordre et retargeter après fusion ; ne pas forcer l'historique pour simplifier.

## Autorisations

La demande actuelle autorise dépôt public, protections, Project, issues et pushes des branches de configuration. La création initiale des refs avant activation des règles est une exception unique documentée par SHA ; les changements suivants passent par PR. Une fusion, licence, achat ou publication du site ne sont pas autorisés implicitement. Une PR prête reste un livrable intermédiaire.

## Différence avec la référence

Le premier plan DrawMotion utilisait `main/production`, puis son projet a évolué vers `dev/main`. docn-ui choisit une convention unique dès le départ et ne copie pas les instructions historiques contradictoires.

Munganga apporte Project, milestones, templates et protections, mais ses squash merges, exception hotfix, double champ Status/Workflow et quotas de reviews ne sont pas repris. Le contrôle branch-policy est ici obligatoire dans les rulesets. La source est contrôlée par branche **et dépôt**, pas seulement par nom.
