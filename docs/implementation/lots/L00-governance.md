# L00 — Gouvernance et premier commit documentaire

Statut initial : **planned**. Branche : `main (bootstrap local), puis dev`.

Dépendances : aucune. Exigences : G0 ; gouvernance transversale.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../RELEASE.md), [référence 2](../../adr/0002-git-release.md).

## Périmètre et fichiers

Transformer le dossier documentaire en base Git propre après demande d'implémentation. Aucun dépôt distant ne doit être créé automatiquement.

Fichiers/responsabilités cibles : Racine, docs/, .gitignore, .gitattributes, .editorconfig ; aucun code applicatif.

## Stories et commits dans l'ordre

### L00-S01 — `docs(plan): establish docn-ui implementation baseline`

- [ ] Relire le plan et l'état réel du dossier ; ne pas relancer de génération qui écrase cette documentation.
- [ ] Après autorisation de commencer, initialiser Git local sur main si absent ; ne pas configurer une identité Git inventée. Ajouter ignore des builds, node_modules, secrets et .artifacts, attributs texte et configuration éditeur.
- [ ] Vérifier les liens, IDs de lots et absence d'artefacts/données privées ; committer uniquement gouvernance et documentation.
- [ ] Créer dev au commit initial pour les prochains lots ; noter le SHA réel dans le rapport suivant. Remote/visibilité/licence restent des décisions externes.

**Acceptation :** Le premier commit ne contient aucun site simulé ni package applicatif. Le plan est navigable, l'état initial n'annonce aucun lot développé.

**Vérification ciblée :** Contrôle documentaire et git diff --check ; aucune commande de tests applicatifs.

## Critère de sortie

### Trace d'exécution après le commit initial

Le commit de story ne peut pas contenir son propre SHA ni prouver la création ultérieure de `dev`. Un commit documentaire complémentaire `docs(progress): record verified governance baseline`, sur `dev`, enregistrera donc les contrôles post-commit et le SHA initial, sans amendement. Il ne constitue pas une nouvelle story applicative ni un démarrage de L01. Son propre SHA sera consigné lors de la prochaine mise à jour de l'état.

G0 : premier commit documentaire réel et arbre de travail expliqué. Un accès GitHub manquant ne bloque pas le bootstrap local.

Compléter [l'état](../status.json) et créer `docs/qa/L00.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de push, création de remote, branche dans paint-3d, installation ou publication.
