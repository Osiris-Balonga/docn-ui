# L09 — Reçus thermiques et calculs communs

Statut initial : **planned**. Branche : `feat/thermal-receipt-templates`.

Dépendances : L08. Exigences : FR-10, FR-13, FR-16 ; NFR-05.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/DOCUMENT_MODEL.md), [référence 2](../../specs/TEMPLATE_CATALOG.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Trois reçus à largeur fixe et hauteur adaptée. Le noyau money servira à la facture, sans répéter les tests de calcul.

Fichiers/responsabilités cibles : packages/documents/src/core/money, templates/receipts, formulaire reçu et registre.

## Stories et commits dans l'ordre

### L09-S01 — `feat(receipts): add minor-unit totals and receipt data contracts`

- [ ] Implémenter calculs en unités mineures sûres, taux basis-points, arrondi half-up et sommes ; quantités entières V1.
- [ ] Schémas et bornes, devises/exposants explicites, absence de PAN ou données de paiement sensibles.
- [ ] Tester les cas économiques distincts : zéro, tax rounding, devise sans décimales, overflow et total de plusieurs lignes ; garder ces tests dans money.

**Acceptation :** Totaux déterministes et identiques pour reçu/facture futur ; aucune arithmétique monétaire flottante implicite.

**Vérification ciblée :** pnpm test:unit money ; pas de répétition de tous les calculs dans les tests PDF.

### L09-S02 — `feat(receipts): add retail hospitality and service roll layouts`

- [ ] Créer compositions retail/hospitality/service et variations 58/80 mm avec taille de texte lisible.
- [ ] Réutiliser hauteur qualifiée en L02 ; vérifier dernière ligne et pieds, limiter à 2 000 mm, erreur sans troncature.
- [ ] Thèmes adaptés au monochrome et imports logo sûrs ; brancher éditeur, catalogue, source et registre.

**Acceptation :** Un reçu court n'est pas une page A4 et un reçu long conserve son total ; 58 mm n'est pas une réduction illisible de 80 mm.

**Vérification ciblée :** Suite PDF de famille : exemples nominaux, limite étroite et fixture longue ; réutiliser fixtures de faisabilité.

### L09-S03 — `test(receipts): verify variable-height output and limit recovery`

- [ ] Consolider contrôle de hauteur/max et message utilisateur ; pas de test par nombre possible de lignes.
- [ ] Une référence visuelle du reçu et un contrôle manuel de lecture sur le viewer long.
- [ ] Documenter largeur papier versus largeur imprimable, échelle 100 % et limites matérielles.

**Acceptation :** Dépassement expliqué, correction relance le rendu ; aucune facture multipage utilisée comme substitut de reçu.

**Vérification ciblée :** pnpm test:pdf receipt ; component erreur de famille seulement si spécifique ; pnpm verify:registry.

## Critère de sortie

Neuf compositions au total ; calculs et hauteur réutilisables sans logique métier dupliquée.

Compléter [l'état](../status.json) et créer `docs/qa/L09.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de commande directe d'imprimante, protocole ESC/POS, conformité fiscale ou paiement réel.
