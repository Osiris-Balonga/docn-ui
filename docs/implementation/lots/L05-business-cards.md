# L05 — Carte de visite de bout en bout

Statut initial : **planned**. Branche : `feat/business-card-templates`.

Dépendances : L04. Exigences : FR-02, FR-04–FR-08 ; NFR-04, NFR-05 ; G2.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/TEMPLATE_CATALOG.md), [référence 2](../../specs/DOCUMENT_MODEL.md), [référence 3](../../../DESIGN.md), [référence 4](../../TESTING.md).

## Périmètre et fichiers

Première chaîne complète avec business-card-minimal, puis deux autres compositions. Valider le produit avant généralisation de la galerie.

Fichiers/responsabilités cibles : packages/documents/src/templates/business-cards, apps/www/src/features/playground et pdf-viewer, route template.

## Stories et commits dans l'ordre

### L05-S01 — `feat(cards): add typed two-sided minimal business card`

- [ ] Schéma carte, données synthétiques FR/EN, metadata et formats déclarés ; composer recto/verso minimal.
- [ ] Respecter zones sûres, coordonnées facultatives et ordre des faces ; message si nom ou adresse ne tient pas.
- [ ] Une suite PDF de famille contient le cas nominal et le risque de débordement ; mesurer les deux faces.

**Acceptation :** Le PDF minimal a deux pages à la bonne taille, sans perte des coordonnées et sans dépendance site.

**Vérification ciblée :** pnpm test:pdf business-card ; revue des deux faces.

### L05-S02 — `feat(playground): edit card data and preview the actual PDF`

- [ ] Créer fiche et formulaire carte avec shadcn, validation près des champs et reset à l'exemple.
- [ ] Brancher worker/version des données, choix format/thème et viewer pages/zoom ; état ancien/erreur explicite.
- [ ] Téléchargement du même résultat final ; nom de fichier neutre et sûr, pas de données personnelles inutiles dans le nom.
- [ ] Activer `test:e2e` et la configuration Playwright Chromium au premier parcours réel : serveur de build isolé, un worker, retries 0, artefacts ignorés. Ajouter ce périmètre à `test:all` sans l'inclure dans les tests légers.

**Acceptation :** Modifier le nom met à jour le PDF ; le verso et l'export correspondent à la dernière révision valide.

**Vérification ciblée :** Components du formulaire avec renderer simulé ; un vrai parcours browser modification→verso→export.

### L05-S03 — `feat(cards): add editorial and studio compositions`

- [ ] Ajouter les deux structures distinctes prévues, partager schéma et helpers de famille.
- [ ] Déclarer les formats réellement supportés ; tester le changement de taille aux limites, pas tous les thèmes/langues combinés.
- [ ] Produire les vignettes depuis les PDF ; relire ensemble les trois compositions et leurs versos.

**Acceptation :** Trois compositions différenciées structurellement ; toute taille annoncée reste lisible.

**Vérification ciblée :** Étendre la même suite PDF aux deux exemples nominaux ; planche contact et cas de plus petit format.

### L05-S04 — `test(cards): verify faithful export and fixed-layout recovery`

- [ ] Consolider le parcours réel avec saisie invalide puis correction, reset et changement de format.
- [ ] Vérifier contenu et dimensions du fichier téléchargé, pas seulement l'événement download ; empreinte/octets de la révision de preview.
- [ ] Supprimer les écrans de spike devenus inutiles ; enregistrer QA G2 et limites physiques.

**Acceptation :** G2 : utilisateur sans aide produit une carte personnalisée et en récupère un PDF correct ; aucune fonctionnalité annoncée n'est simulée.

**Vérification ciblée :** pnpm validate ; pnpm test:pdf business-card ; E2E carte ciblé et revue visuelle. Aucun E2E copié pour chaque composition.

## Critère de sortie

G2 atteint ; première expérience complète et trois cartes prêtes pour catalogue/registre.

Compléter [l'état](../status.json) et créer `docs/qa/L05.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de rendu HTML de substitution, code editor exécutable ou catalogue général avant cette preuve.
