# L04 — Contrats, formats, thèmes et primitives PDF

Statut initial : **planned**. Branche : `feat/document-foundations`.

Dépendances : L03. Exigences : FR-03, FR-07, FR-16 ; NFR-03, NFR-05.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/DOCUMENT_MODEL.md), [référence 2](../../specs/TEMPLATE_CATALOG.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Formaliser ce que le spike a prouvé. Garder le noyau petit ; ajouter tables monétaires et imposition seulement avec leurs familles.

Fichiers/responsabilités cibles : packages/documents/src/core, themes, primitives, catalog, render ; asset manifest.

## Stories et commits dans l'ordre

### L04-S01 — `feat(documents): define validated formats and render contracts`

- [ ] Types des requêtes/résultats, IDs/version, formats fixes/continus et helpers mm/pt ; séparer metadata et fonctions de rendu.
- [ ] Valider dimensions, orientation, formats autorisés et profil print ; erreurs structurées avec chemin de champ.
- [ ] Définir la normalisation des données et les bornes communes, sans effacer une donnée invalide.

**Acceptation :** Les formats invalides ou incompatibles sont refusés avant le moteur ; orientation appliquée une seule fois.

**Vérification ciblée :** pnpm test:unit formats ; réutiliser tests de géométrie du spike au lieu de les recopier.

### L04-S02 — `feat(documents): add local typography and portable theme tokens`

- [ ] Créer trois thèmes PDF indépendants des tokens web, couleurs compatibles moteur et échelle typographique bornée.
- [ ] Enregistrer explicitement les graisses statiques nécessaires ; manifest provenance/licences/hashes, exemples FR/EN.
- [ ] Créer AssetResolver browser/Node avec IDs autorisés ; aucune URL ou chemin lu depuis des données utilisateur.

**Acceptation :** Changer le thème du site ne change pas le PDF ; le thème documentaire charge uniquement les assets déclarés.

**Vérification ciblée :** Tests ciblés validation thème/assets ; étendre la fixture PDF accentuée de L02.

### L04-S03 — `feat(documents): add composable PDF layout primitives`

- [ ] Implémenter seulement PageFrame, texte/titre, Stack/Row, Separator, Image et FieldPair utilisés par la carte.
- [ ] Prévoir garde de zone sûre et mesure de débordement des cadres fixes avec vraies polices ; erreurs plutôt que réduction illimitée.
- [ ] Exporter des entrées explicites ; tests de frontière interdisant imports du site et CSS DOM dans la distribution.

**Acceptation :** Une page peut être composée sans dépendance Tailwind/shadcn/Next ; son texte ne sort pas silencieusement du cadre.

**Vérification ciblée :** Unit ciblé mesure/layout ; un PDF de primitives réutilisant la suite existante, pas un test par prop.

### L04-S04 — `refactor(pdf): promote the rendering spike into shared adapters`

- [ ] Remplacer les structures temporaires du spike par les contrats définitifs ; supprimer le code jetable non utilisé.
- [ ] Garder les fixtures de faisabilité utiles et leur preuve ; migrer le viewer/protocole vers les emplacements de l'architecture.
- [ ] Documenter exports, dépendances autorisées et stratégie d'assets pour le registre futur.

**Acceptation :** Pas de deuxième moteur/fixture de référence concurrent ; build et qualification initiale restent valides.

**Vérification ciblée :** pnpm validate ; pnpm test:pdf feasibility ; build si imports/worker modifiés.

## Critère de sortie

Fondations réutilisables et minimalistes ; tous les invariants initiaux conservés.

Compléter [l'état](../status.json) et créer `docs/qa/L04.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de factory de formulaire universelle, moteur multibackend, abstractions de tables/invoices sans usage.
