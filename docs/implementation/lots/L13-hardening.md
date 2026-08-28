# L13 — Accessibilité, sécurité et performance ciblées

Statut initial : **planned**. Branche : `chore/production-hardening`.

Dépendances : L12. Exigences : NFR-01, NFR-02, NFR-04, NFR-07, NFR-10.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../TESTING.md), [référence 2](../../RELEASE.md), [référence 3](../../specs/DOCUMENT_MODEL.md), [référence 4](../../../DESIGN.md).

## Périmètre et fichiers

Corriger les défauts observés dans les parcours existants ; ne pas lancer une refonte ou une campagne de milliers de tests.

Fichiers/responsabilités cibles : apps/www coordination/viewer/UI, sécurité build/headers, budgets et docs/qa/L13.md.

## Stories et commits dans l'ordre

### L13-S01 — `fix(a11y): complete keyboard and responsive document workflows`

- [ ] Clavier dans palette, filtres, formulaire, onglets, viewer et boutons export ; nom accessible et focus restauré.
- [ ] Erreurs et progression annoncées sans spam ; données accessibles hors canvas, couche texte PDF.js si supportée par version qualifiée.
- [ ] Corriger responsive, code long, reçu haut, 200 % zoom et reduced-motion ; ne pas utiliser des snapshots pour toute combinaison.

**Acceptation :** Le parcours complet est utilisable sans souris et sans débordement global ; limites du fichier PDF accessibles clairement indiquées.

**Vérification ciblée :** Étendre E2E accessibilité existant, axe sur états significatifs, contrôle manuel lecteur d'écran/clavier.

### L13-S02 — `perf(pdf): bound rendering work and viewer memory`

- [ ] Mesurer chargement initial, temps carte warm/cold, reçu long/facture et mémoire après 20 éditions/navigation.
- [ ] Confirmer backpressure/timeout, limiter pages canvas en mémoire, libérer les anciens documents/URLs et éviter les imports eager.
- [ ] Fixer budgets chiffrés à partir de l'environnement de référence décrit, sans métriques de laptop présentées comme universelles.
- [ ] Budgets d'architecture non négociables : zéro moteur PDF dans route de docs simple, un job actif + un pending, 15 s timeout et 50 pages max.

**Acceptation :** Aucune croissance non bornée des workers/URLs/canvases ; thème de site ne relance pas un rendu PDF.

**Vérification ciblée :** Un scénario de mesure reproductible, analyse bundle et integration cleanup existante ; pas de assertions de timing fragiles dans chaque test.

### L13-S03 — `fix(security): harden assets links and generated-document boundaries`

- [ ] Revoir MIME/magic bytes/tailles, URL sources interdites, schémas de liens et erreurs expurgées.
- [ ] Définir CSP/headers compatibles avec le build réel sur serveur statique de test ; tester worker et polices réels.
- [ ] Contrôler absence de données dans URL/logs/storage, pas de télémétrie ni police distante ; supply chain et licences vérifiées.
- [ ] Configurer vérification de dépendances et mises à jour sans auto-merge ; ne pas installer un scanner serveur inutile.

**Acceptation :** Les entrées hostiles sont refusées et les contraintes réseau n'empêchent pas la génération nominale.

**Vérification ciblée :** Tests négatifs ciblés dans suites existantes ; E2E privacy/security sur vrai build ; verify:assets.

### L13-S04 — `docs(quality): record browser support and performance evidence`

- [ ] Documenter navigateur/OS réellement testés, configuration runner, budgets, erreurs et limites.
- [ ] Cibler Chromium CI ; smoke manuel Firefox et Safari réel quand disponibles, WebKit automatisé n'étant pas preuve Safari/iOS.
- [ ] Mettre à jour matrice de contrôle et traiter les risques restants sans les masquer par un claim de compatibilité universelle.

**Acceptation :** Les promesses publiques correspondent exactement aux résultats observés ; exceptions identifiées pour L14.

**Vérification ciblée :** Rapport QA et inspection des preuves ; ne pas relancer les suites déjà vertes sur le même SHA pour rédiger le rapport.

## Critère de sortie

Risques qualité traités ou limitations explicitement consignées ; données privées toujours locales.

Compléter [l'état](../status.json) et créer `docs/qa/L13.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas d'analytics, benchmark géant, nouvelle suite par dépendance ou certification PDF/UA.
