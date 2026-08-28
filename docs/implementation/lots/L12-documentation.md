# L12 — Documentation, composants, formats et thèmes

Statut initial : **planned**. Branche : `feat/documentation-catalog`.

Dépendances : L11. Exigences : FR-02, FR-13, FR-15, FR-16.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../../DESIGN.md), [référence 2](../../specs/REGISTRY.md), [référence 3](../../specs/DOCUMENT_MODEL.md), [référence 4](../../TESTING.md).

## Périmètre et fichiers

Rendre les capacités existantes compréhensibles et réutilisables. Les pages de composants ne sont pas de nouveaux composants métier.

Fichiers/responsabilités cibles : apps/www/src/content/docs, features/docs, routes components/formats/themes, metadata et recherche.

## Stories et commits dans l'ordre

### L12-S01 — `feat(docs): document installation and independent PDF usage`

- [ ] Guides installation, assets locaux, browser/Node, thème, format, données/locale et mise à jour du code possédé.
- [ ] Exemples importés depuis fixtures consommateur vérifiées ; éviter une deuxième version manuelle du code d'exemple.
- [ ] Pages de limites : fonts/scripts, impression, PDF accessible, QR non sécurisé, facture non certifiée.
- [ ] MDX local de confiance uniquement ; aucun contenu utilisateur interprété comme MDX.

**Acceptation :** Un développeur peut suivre les prérequis sans connaissance du monorepo et comprendre les limites avant export.

**Vérification ciblée :** Build docs et contrôle des liens ; réutiliser preuves consumer plutôt que rejouer chaque snippet indépendamment.

### L12-S02 — `feat(docs): expose PDF primitives formats and theme examples`

- [ ] Index/fiches des primitives réellement disponibles avec props, usage, exemple PDF et source/installation.
- [ ] Pages formats avec dimensions et compatibilités réelles ; thèmes comparés sur le même document.
- [ ] Produire exemples visuels avec le pipeline existant ; pas de tests par paragraphe ou carte de documentation.

**Acceptation :** Les routes components/formats/themes sont complètes, indexables et cohérentes avec les contrats du code.

**Vérification ciblée :** Vérification d'inventaire/liens et un smoke navigation docs ; revue visuelle ciblée.

### L12-S03 — `docs(contributing): define template contribution and review workflow`

- [ ] Guide ajouter un template : schéma/metadata/composition/fixture/registre/aperçu et test au bon périmètre.
- [ ] Checklist de qualité visuelle et de données, licences, changements de format/API et versioning.
- [ ] Intégrer toute la documentation dans la recherche, titres/description/canonical et sitemap ; URLs de preview non indexables.

**Acceptation :** Un contributeur sait ajouter une composition sans modifier le cœur du playground ni copier toute une famille.

**Vérification ciblée :** pnpm validate ; pnpm build ; liens statiques. Pas de suite PDF complète pour une modification documentaire seule.

## Critère de sortie

Catalogue, primitives et guides exploitables ; aucun exemple trompeur ni source incomplète.

Compléter [l'état](../status.json) et créer `docs/qa/L12.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de moteur de blog, CMS, documentation multilingue intégrale ou forum.
