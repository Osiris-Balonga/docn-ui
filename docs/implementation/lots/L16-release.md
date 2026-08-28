# L16 — Release candidate et livraison v1.0.0

Statut initial : **planned**. Branche : `release/v1.0.0`.

Dépendances : L15. Exigences : G6 ; définition de terminé du PRD.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../RELEASE.md), [référence 2](../../PRD.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Qualifier et publier le candidat autorisé, en distinguant préparation locale et livraison publique. Une correction imprévue obtient son propre commit.

Fichiers/responsabilités cibles : Version catalogue/registre, CHANGELOG.md, README, licences confirmées, docs/qa/L16.md et état.

## Stories et commits dans l'ordre

### L16-S01 — `docs(release): prepare v1 documentation licenses and release notes`

- [ ] Confirmer identité/licence avant création des mentions ; compléter licences tierces et README réel.
- [ ] Notes de version : quinze compositions, formats qualifiés, fonctionnalités réelles et limites, migration si nécessaire.
- [ ] QA checklist finale avec liens vers preuves L14/L15 et décisions externes ; pas de statut released anticipé.

**Acceptation :** Les documents publics correspondent au produit réellement implémenté et aux droits de distribution confirmés.

**Vérification ciblée :** Liens/inventaire/licences ; vérification de version et origin publiques, pas de suite applicative supplémentaire pour un texte seul.

### L16-S02 — `chore(release): prepare docn-ui version 1.0.0`

- [ ] Versionner catalogue/registre/metadata et chemins immuables de release ; dépendances d'items pointent sur même version.
- [ ] Exécuter validation complète du SHA candidat ; vérifier comparaison preview/download et installation depuis registry candidat.
- [ ] Traiter tout défaut via fix séparé référencé, puis invalider seulement les preuves concernées avant validation finale du candidat.
- [ ] PR/promotion et déploiement seulement selon autorisations, conserver artefact exact et lien avec SHA.

**Acceptation :** Le candidat v1.0.0 est vérifié ; aucun chemin dev ni placeholder dans les fichiers publics.

**Vérification ciblée :** pnpm validate:full sur candidat, CI et preview si disponibles. Le build réutilisé doit porter l'empreinte du candidat.

### L16-S03 — `docs(release): record verified v1 delivery and handoff`

- [ ] Après promotion/déploiement autorisés, vérifier origine publique, deep links, assets, téléchargement et un install public.
- [ ] Créer tag/release uniquement si autorisés ; enregistrer SHAs/tag/URL exacts et rapport, pas de valeurs fictives.
- [ ] Marquer L16 released seulement quand G6 est satisfait. Si autorisation manquante, rester verified_local ou blocked avec prochaine action claire.
- [ ] Écrire guide de maintenance, prochaine famille dans backlog et procédure rollback/retour correctif via dev.

**Acceptation :** G6 : produit public vérifié et mainteneur informé ; à défaut, livraison explicitement non accomplie.

**Vérification ciblée :** Smoke public réel, installation publique représentative, lecture des IDs de version et revue du rapport final. Ne pas refaire quinze exports publics identiques.

## Critère de sortie

V1 livrée uniquement après preuves et autorisations. Les tâches postérieures n'autorisent pas des fonctionnalités supplémentaires implicites.

Compléter [l'état](../status.json) et créer `docs/qa/L16.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de publication npm inutile, faux compte GitHub, release marquée réussie sur seule base d'un build local.
