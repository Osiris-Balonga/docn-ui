# L06 — Catalogue et éditeur réutilisable

Statut initial : **planned**. Branche : `feat/catalog-and-playground`.

Dépendances : L05. Exigences : FR-01, FR-02, FR-04–FR-07 ; NFR-01, NFR-04, NFR-07.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../../DESIGN.md), [référence 2](../../specs/DOCUMENT_MODEL.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Généraliser l'expérience de carte pour les familles suivantes, sans construire un éditeur de mise en page ni un système de formulaire entièrement générique.

Fichiers/responsabilités cibles : apps/www/src/features/catalog, playground, pdf-viewer, routes templates ; metadata/documents.

## Stories et commits dans l'ordre

### L06-S01 — `feat(catalog): add searchable format-aware template gallery`

- [ ] Créer catalogue léger depuis metadata, galerie avec vraies vignettes, recherche et filtres combinables.
- [ ] Synchroniser seulement filtres publics dans l'URL ; compteur, état vide, effacement et retour arrière.
- [ ] Prégénérer les routes connues et 404 ; charger moteurs/templates à la demande, jamais pour toutes les vignettes.

**Acceptation :** La galerie affiche seulement les trois cartes disponibles à ce stade ; les filtres fonctionnent et n'importent pas le moteur.

**Vérification ciblée :** Unit ciblé filtre + un parcours catalogue ; pas de test de chaque texte statique.

### L06-S02 — `feat(playground): add validated data theme and format controls`

- [ ] Séparer shell réutilisable et formulaires explicites par famille ; metadata sérialisables et registry de formulaires, sans introspection universelle de Zod.
- [ ] Ajouter JSON avancé texte borné, validation avant application et retour au formulaire ; aucune évaluation de code.
- [ ] Ajouter contrôle accent/locale/profil print et reset ; conserver dernière preview valide marquée ancienne lors d'une erreur.
- [ ] Toute modification des paramètres invalide la révision exportable ; ne pas injecter JSON/logo dans URL ou stockage.

**Acceptation :** Les états et actions restent cohérents entre formulaire et JSON, sans perte silencieuse de données.

**Vérification ciblée :** Components de l'éditeur et integration coordination ; réutiliser unit schémas déjà présents.

### L06-S03 — `feat(playground): handle safe image uploads and render lifecycle`

- [ ] Imports PNG/JPEG locaux bornés, décodage/dimensions réelles, orientation normalisée et retrait EXIF ; suppression locale possible.
- [ ] File active/pending latest-wins, timeout, arrêt worker, cleanup buffers/Object URLs et tâches PDF.js.
- [ ] Erreur générique expurgée ; reprise contrôlée et téléchargement désactivé quand la révision est invalide ou obsolète.

**Acceptation :** Fichier refusé expliqué ; éditions rapides ne produisent pas un export périmé ; navigation ne laisse pas de worker actif.

**Vérification ciblée :** Unit validation d'image commune + integration latest-wins/cleanup ; un scénario réel d'erreur/reprise, pas un E2E par type MIME.

### L06-S04 — `test(playground): verify export privacy and stale-result protection`

- [ ] Étendre E2E carte pour vérifier export de la dernière révision et absence de requête contenant données/image.
- [ ] Test négatif ciblé des URL d'assets utilisateur ; données en mémoire seulement.
- [ ] Activer le job e2e-chromium et ses artefacts sans rejouer toutes les suites légères ; documenter la frontière réelle/mock.

**Acceptation :** Le parcours nominal utilise les vrais workers et PDF ; aucune donnée saisie n'est transmise au site ou à un tiers.

**Vérification ciblée :** pnpm validate ; pnpm test:e2e playground.spec.ts ; build réutilisé une seule fois.

## Critère de sortie

Catalogue et shell d'éditeur extensibles par metadata + formulaire de famille. Pas de couplage entre UI et code PDF exportable.

Compléter [l'état](../status.json) et créer `docs/qa/L06.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de partage par URL des données, historique cloud, drag-and-drop libre ou import JSX.
