# ADR 0002 — Lots, commits et publication

Date : 2026-08-28. Statut : proposition de fonctionnement, exécutable après autorisation d'implémenter.

## Décision

`main` est la branche publique ; `dev` l'intégration. Une branche par lot, commits Conventional Commits conservés, PR vers `dev`. Promotion de `dev` vers `main` pour la livraison. Le premier commit local contient uniquement la documentation/gouvernance. Pas de remote présumé.

Conserver l'historique atomique par merge ou rebase merge selon configuration approuvée ; éviter le squash qui ferait disparaître les commits détaillés demandés. Ne pas réécrire l'historique local déjà partagé.

## Hors ligne

Les validations locales sont distinctes de CI/merge. Une demande explicite de poursuivre localement permet des branches empilées sur le dernier lot vérifié. Documenter base/head. Quand un remote existe, traiter les PR dans l'ordre et retargeter après fusion ; ne pas forcer l'historique pour simplifier.

## Autorisations

Créer un dépôt public, pousser, configurer protections, fusionner, acheter un domaine et publier ne sont pas autorisés par la seule présence du plan. Demander l'action manquante au moment utile. Une PR prête est un livrable intermédiaire, pas une release.

## Différence avec la référence

Le premier plan DrawMotion utilisait `main/production`, puis son projet a évolué vers `dev/main`. docn-ui choisit une convention unique dès le départ et ne copie pas les instructions historiques contradictoires.
