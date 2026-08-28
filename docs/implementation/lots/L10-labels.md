# L10 — Étiquettes individuelles et planches

Statut initial : **planned**. Branche : `feat/label-templates`.

Dépendances : L09. Exigences : FR-11, FR-13, FR-16 ; NFR-05.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/DOCUMENT_MODEL.md), [référence 2](../../specs/TEMPLATE_CATALOG.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Trois compositions avec export individuel ou planche paramétrée, sans prétendre à une référence commerciale de papier non testée.

Fichiers/responsabilités cibles : packages/documents/src/core/imposition, templates/labels, formulaire et contrôles de planche.

## Stories et commits dans l'ordre

### L10-S01 — `feat(labels): define bounded sheet geometry and placement`

- [ ] Fonctions pures dimensions/marges/espaces/cellules, nombre de lignes/colonnes possible et placement row-major.
- [ ] Cellule de départ première page, quantité et page suivante ; Refuser format impossible, marges négatives et dépassement.
- [ ] Schéma étiquette, profil individuel/planche et custom dimensions bornées.

**Acceptation :** Tout rectangle reste dans la page ; chaque donnée occupe exactement une cellule attendue.

**Vérification ciblée :** Unit imposition : première/dernière cellule, changement de page et géométrie impossible. Pas un test pour chaque combinaison de millimètres.

### L10-S02 — `feat(labels): add product address and inventory layouts`

- [ ] Composer trois layouts adaptés aux tailles, QR réutilisé avec sa contrainte de densité.
- [ ] Ajouter rendu individuel puis planche avec IDs ordonnés ; éviter duplication de la logique de template.
- [ ] Contrôles UI de dimensions, sheet/individual, quantité et départ ; metadata, vignettes et registre.

**Acceptation :** Changer de mode export conserve les données et produit dimensions/nombre de pages attendus.

**Vérification ciblée :** Suite PDF de famille : trois exemples individuels, une planche chevauchant deux pages ; inspecter texte et coordonnées.

### L10-S03 — `test(labels): qualify sheet alignment and partial-sheet export`

- [ ] Comparer placement réel PDF aux coordonnées attendues indépendantes ; vérifier aucune donnée sautée ou doublée.
- [ ] Créer une référence visuelle de planche si elle apporte la couverture de structure absente des étiquettes individuelles.
- [ ] Documenter feuille test, échelle 100 %, marges matérielles et absence de certification Avery.

**Acceptation :** Une planche commencée au milieu et poursuivie sur la page suivante est correcte ; limites d'impression affichées.

**Vérification ciblée :** pnpm test:pdf label ; pnpm test:unit imposition ; pnpm verify:registry. Aucun E2E par cellule.

## Critère de sortie

Douze compositions au total ; imposition isolée, testée et utilisable sans site.

Compléter [l'état](../status.json) et créer `docs/qa/L10.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de driver imprimante, imposition duplex universelle ni compatibilité commerciale supposée.
