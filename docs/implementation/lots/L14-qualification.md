# L14 — Qualification V1 avec tests proportionnés

Statut initial : **planned**. Branche : `test/v1-qualification`.

Dépendances : L13. Exigences : FR-01–FR-16 ; NFR-01–NFR-10 ; G5.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../TESTING.md), [référence 2](../../specs/TEMPLATE_CATALOG.md), [référence 3](../../PRD.md).

## Périmètre et fichiers

Combler les trous de couverture démontrés et auditer la suite existante. Ne pas recréer toutes les preuves des lots précédents.

Fichiers/responsabilités cibles : Suites existantes tests PDF/E2E/consumers/visual ; docs/qa/L14.md.

## Stories et commits dans l'ordre

### L14-S01 — `test(quality): close distinct v1 coverage gaps`

- [ ] Mapper chaque exigence à une preuve existante ; ajouter seulement les risques non couverts.
- [ ] Vérifier globs exclusifs, tests réellement collectés, absence de scripts silencieusement verts et noms de commande fidèles.
- [ ] Enlever tests redondants ou de détail interne ; consolider fixtures communes sans supprimer vrais cas limites.
- [ ] Consigner nombre/temps par périmètre à titre diagnostique, pas comme objectif à augmenter.

**Acceptation :** Tout nouveau test a un bug/risque écrit dans la revue ; chaque fichier appartient à un seul périmètre.

**Vérification ciblée :** Listing Vitest/Playwright et exécution des seuls nouveaux cas d'abord.

### L14-S02 — `test(pdf): approve representative visual and consumer baselines`

- [ ] Relire planche contact des quinze compositions ; références visuelles ciblées au moins une par famille, variantes supplémentaires seulement si nécessaire.
- [ ] Stabiliser rasteriseur/fonts/runner ; différences approuvées humainement, seuils non augmentés pour masquer un défaut.
- [ ] Activer explicitement `test:visual` et l'ajouter à `test:all` ; références PDF choisies, aucun parcours E2E relancé sous une autre étiquette.
- [ ] Étendre les deux consumers aux fermetures distinctes carte/facture/planche ; ne pas réinstaller chaque variante.
- [ ] Garder PDFs/rapports générés hors Git, références sélectionnées et empreintes dans leurs emplacements dédiés.

**Acceptation :** Les designs sont réellement examinés ; l'installation couvre les dépendances nouvelles sans explosion de scénarios.

**Vérification ciblée :** pnpm test:pdf ; pnpm test:visual ; pnpm test:consumers, avec réutilisation de PDFs/artefacts valides.

### L14-S03 — `docs(qa): record v1 functional and print qualification`

- [ ] Exécuter une validation complète orchestrée sur candidat propre avec un build ; réutiliser résultats du même SHA.
- [ ] Revue manuelle FR/EN, clavier, zoom, copie code, téléchargements et paramètres d'impression sur supports représentatifs.
- [ ] Si matériel disponible, imprimer carte/planche à 100 % et scanner un billet ; sinon consigner la limite sans inventer validation.
- [ ] Compléter matrice exigence→preuve/résultat et défauts acceptés explicitement ; aucune exception implicite.

**Acceptation :** G5 atteint : V1 qualifiée localement avec limites explicites ; la publication n'est pas encore déclarée.

**Vérification ciblée :** pnpm validate:full ; QA manuelle ciblée. Ne pas réexécuter coverage puis test léger dans ce même passage.

## Critère de sortie

Preuve de chaque exigence ou exception approuvée, suite maintenable et temps connu. Aucun bug bloquant d'export/données/perte de contenu.

Compléter [l'état](../status.json) et créer `docs/qa/L14.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de matrice combinatoire thèmes×formats×langues×navigateurs, pas de test de conformité d'une librairie tierce.
