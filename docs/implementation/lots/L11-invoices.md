# L11 — Factures multipages et catalogue complet

Statut initial : **planned**. Branche : `feat/invoice-templates`.

Dépendances : L10. Exigences : FR-01, FR-12, FR-13, FR-16 ; NFR-05 ; G4.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/DOCUMENT_MODEL.md), [référence 2](../../specs/TEMPLATE_CATALOG.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Trois factures avec pagination réelle et calculs partagés du reçu. Atteindre quinze compositions sans élargir le produit à un logiciel comptable.

Fichiers/responsabilités cibles : packages/documents/src/primitives/table, templates/invoices, formulaire lignes et registre.

## Stories et commits dans l'ordre

### L11-S01 — `feat(invoices): add invoice schema and multipage table primitives`

- [ ] Réutiliser money et ses tests ; ajouter données vendeur/client/numéro/dates/lignes et champs textuels bornés.
- [ ] Table PDF en flux, en-têtes répétés et marges footer ; lignes hautes subdivisées selon contrat ou erreur explicite.
- [ ] Totaux/signature gardés ensemble quand possible ; textes extraits sur toutes les pages.

**Acceptation :** Une facture longue ne recouvre pas son footer et ne perd ni ligne ni total.

**Vérification ciblée :** Suite PDF pagination existante enrichie ; un unit contrat spécifique si nécessaire, pas de recopie money.

### L11-S02 — `feat(invoices): add minimal business and studio layouts`

- [ ] Implémenter trois compositions avec A4/Letter, thèmes et coordonnées optionnelles.
- [ ] Formulaire lignes borné avec ajout/retrait stable ; réutiliser contrôle de données/erreurs du playground.
- [ ] Metadata, catalogue, vignettes, source, registre et descriptions de différence visuelle.

**Acceptation :** Quinze compositions annoncées et réellement disponibles ; chaque facture a ses données et un rendu complet.

**Vérification ciblée :** Exemples nominaux dans la suite PDF facture et revue de planche contact.

### L11-S03 — `test(invoices): verify long-table export and summary placement`

- [ ] Une fixture représentative multipage avec libellé long, contrôles de continuité et total correct.
- [ ] Étendre un parcours E2E à l'ajout de lignes et au PDF téléchargé ; ne pas refaire les permutations d'arrondi en browser.
- [ ] Cas d'erreur limite de lignes ou champ trop long vérifié au niveau approprié.

**Acceptation :** L'export final contient première/dernière ligne, numéro et total ; aucune page blanche ni bloc coupé illisible.

**Vérification ciblée :** pnpm test:pdf invoice ; pnpm test:e2e invoice.spec.ts ; référence visuelle facture multipage sélectionnée.

### L11-S04 — `docs(catalog): document the complete v1 template inventory`

- [ ] Vérifier inventaire quinze IDs uniques et metadata/fixtures/source/registre associés.
- [ ] Ajouter avertissement calcul/fiscalité et limites des formats, sans déclarer conformité territoriale.
- [ ] Réaliser G4 avec validate:full des scopes activés, installer les graphes nouveaux si la distribution a changé et enregistrer la preuve.

**Acceptation :** G4 : catalogue V1 complet ; chaque exigence famille est traçable ; aucune promesse de template futur dans la navigation.

**Vérification ciblée :** pnpm validate:full ; revue d'inventaire et planche contact. Cette validation de jalon ne se répète pas après chaque correction de libellé.

## Critère de sortie

Quinze compositions sur cinq familles. G4 vérifié avec code/source/exports et limitations.

Compléter [l'état](../status.json) et créer `docs/qa/L11.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas d'avoirs, taxes composées, quantités fractionnaires, facturation électronique certifiée ou tenue comptable.
