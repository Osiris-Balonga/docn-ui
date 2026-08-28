# L08 — Billets d'événement et QR vectoriel

Statut initial : **planned**. Branche : `feat/event-ticket-templates`.

Dépendances : L07. Exigences : FR-01, FR-09, FR-13, FR-16 ; NFR-05.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/DOCUMENT_MODEL.md), [référence 2](../../specs/TEMPLATE_CATALOG.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Trois billets distincts, formats et QR utiles. Le QR représente une donnée ; aucun système de billetterie sécurisé n'est implémenté.

Fichiers/responsabilités cibles : packages/documents/src/primitives/qr, templates/event-tickets, formulaire famille, metadata et registre.

## Stories et commits dans l'ordre

### L08-S01 — `feat(tickets): add ticket schema and printable QR primitive`

- [ ] Schéma d'événement avec instant/fuseau/lieu/identifiant et payload validé ; données exemples fixes.
- [ ] Encodeur maintenu/licencié et primitive vectorielle avec zone calme, taille minimale des modules et densité vérifiée.
- [ ] Erreur de payload trop dense ; pas de lien tiers demandé pour générer le QR.

**Acceptation :** QR du PDF final décodé identique à l'entrée et date affichée dans le fuseau choisi.

**Vérification ciblée :** Unit validation date/payload au bon niveau ; un test PDF QR avec rasterisation et décodage indépendant.

### L08-S02 — `feat(tickets): add classic conference and live layouts`

- [ ] Implémenter trois compositions distinctes avec zones de texte bornées et QR non déformé.
- [ ] Classic/live formats paysage ; conference A6 et layout paysage dédié, pas simple réduction homothétique.
- [ ] Ajouter formulaire famille, metadata, vignettes réelles, source et items de registre via le pipeline existant.

**Acceptation :** Trois billets disponibles dans le catalogue ; format supporté explicite, toutes les informations essentielles lisibles.

**Vérification ciblée :** Une suite PDF de famille paramétrée avec trois exemples nominaux et un titre/nom long représentatif.

### L08-S03 — `test(tickets): qualify layout density and ticket export`

- [ ] Étendre la suite QR pour le cas limite de densité réellement nouveau, ne pas tester l'algorithme tiers exhaustivement.
- [ ] Sélectionner un billet pour référence visuelle ; relire la planche contact des trois modèles.
- [ ] Documenter la séparation entre génération graphique, contrôle d'accès et impression/découpe.

**Acceptation :** Aucun QR coupé et aucun claim de billet infalsifiable ; registre de tous les items valide.

**Vérification ciblée :** pnpm test:pdf ticket ; pnpm verify:registry ; parcours export existant réutilisé, pas trois nouveaux E2E.

## Critère de sortie

Six compositions publiques au total et primitive QR réutilisable. Un décodage numérique est distingué d'un essai imprimé.

Compléter [l'état](../status.json) et créer `docs/qa/L08.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de signature de billet, scan serveur, réservation, paiement ou base de participants.
