# Tests — périmètres séparés et couverture utile

**Instruction explicite du mainteneur : ne pas multiplier les tests inutiles.** Référence : `paint-3d` final, `docs/TESTING.md`, `package.json`, `vitest.config.ts` et `playwright.config.ts`, lus au commit `8e370cd5e6802be762bf14a192a3e68cbb52fa54`.

## 1. Question avant chaque nouveau test

Quel bug concret ce test détecte-t-il que les tests existants ne détecteraient pas ? Si la réponse est « le composant existe », « la config répète une valeur » ou « une autre couleur », ne pas ajouter le test. Étendre une suite/fixture existante avant de créer un fichier.

Ne pas retester shadcn, React, Zod, QR encoder ou PDF.js eux-mêmes. Tester notre composition, notre contrat et nos intégrations aux frontières. Ne pas répéter en E2E toutes les permutations de tests unitaires. Conserver les vrais cas limites et régressions même si un tableau de cas les regroupe : réduire le nombre de fichiers n'est pas le but.

Pas d'objectif de nombre de tests, pas de seuil global de couverture qui pousse à écrire du remplissage. La couverture est un diagnostic des chemins métier non exercés ; les risques critiques ont des assertions explicites. Pas de snapshots complets de DOM ni de snapshots de JSX PDF.

## 2. Affectation exclusive des fichiers

| Périmètre | Fichiers | Environnement et responsabilité |
| --- | --- | --- |
| `unit` | `*.test.ts`, hors suffixes ci-dessous | Node ; géométrie, money, schémas, transitions pures, graphe registre |
| `components` | `*.test.tsx`, hors suffixes spécialisés | jsdom ; interactions et sémantique des compositions UI métier |
| `integration` | `*.integration.test.{ts,tsx}` | modules réels combinés ; effets lourds aux frontières simulés explicitement |
| `pdf` | `*.pdf.test.{ts,tsx}` | Node ; vrai moteur PDF, contenu, pages, géométrie et décodage QR |
| `consumers` | `tests/consumers/**/*.consumer.test.ts` | Node/process ; vrai CLI dans projets externes, assets et rendu |
| `e2e` | `tests/e2e/**/*.spec.ts` | Chromium ; site construit, workers et export réels |
| `visual` | liste explicite `tests/visual/cases.*` | rasterisation de PDF sélectionnés + comparaison approuvée |

Les globs unit/components excluent integration/pdf/consumer. Chaque fichier appartient à un seul projet. Les tests browser ne sont pas collectés par Vitest. Les tests UI n'importent pas le moteur PDF réel ; le périmètre PDF ne monte pas le site.

## 3. Commandes contractuelles

Ces scripts sont à implémenter dans L01, puis activés avec leur première vraie suite. Un périmètre non encore implémenté est marqué indisponible, pas remplacé par un script qui retourne succès.

| Commande | Ce qu'elle exécute exclusivement |
| --- | --- |
| `pnpm test:unit` | `vitest run --project unit` |
| `pnpm test:components` | `vitest run --project components` |
| `pnpm test:integration` | `vitest run --project integration` |
| `pnpm test` | ces trois projets légers, chacun une fois, puis sortie |
| `pnpm test:watch` | mêmes trois projets en watch ; `--project` permet le filtrage documenté |
| `pnpm test:coverage` | mêmes trois projets, une seule exécution avec rapport commun |
| `pnpm test:pdf` | `vitest run --project pdf`, vrai PDF uniquement |
| `pnpm test:consumers` | projet consumers isolé, installations et processus externes |
| `pnpm test:e2e` | Playwright Chromium, parcours du site uniquement |
| `pnpm test:visual` | références PDF sélectionnées, pas les parcours E2E |
| `pnpm test:all` | orchestrateur séquentiel : test, pdf, consumers, e2e, visual ; aucune double collecte |
| `pnpm validate` | format, lint, types et `pnpm test` ; contrôle quotidien rapide |
| `pnpm validate:full` | format, lint, types et `test:all` ; build préparé/réutilisé une seule fois |
| `pnpm build` | vérification assets/registre puis build statique ; aucun test caché |
| `pnpm verify:registry` | schéma/graphe/chemins/imports du registre déjà généré ; pas d'installation |
| `pnpm verify:assets` | présence, licences et checksums ; pas de tests browser |
| `pnpm verify:bundle` | tailles des fichiers du build existant |

La différence avec DrawMotion est volontaire et explicite : `validate` est léger ici ; `validate:full` est le verrou complet de jalon. Ne pas utiliser `validate` seul comme preuve de release. `test:all` doit inclure tous les périmètres activés, pas une sélection cachée. L01 documente le contrat des commandes présentes ; les lots suivants ajoutent leurs périmètres à l'agrégateur au moment de leur activation.

Filtres natifs : `pnpm test:unit geometry`, `pnpm test:pdf invoice`, `pnpm test:e2e catalog.spec.ts`. Pas d'alias par scénario, par thème ou par template. Pour un watch isolé, documenter aussi `pnpm exec vitest --project unit` afin d'éviter le cumul de flags de projets du script global.

## 4. Quand exécuter quoi

| Changement | Vérification suffisante pendant le lot |
| --- | --- |
| Documentation seule | liens, cohérence IDs/commandes ; aucune suite applicative sans raison |
| Fonction pure | unit ciblé + types/lint concernés |
| Formulaire métier | components ciblé ; integration si coordination affectée |
| Layout PDF | suite PDF de la famille ; revue du rendu modifié |
| Pipeline worker/export | integration ciblé + un vrai parcours E2E |
| Distribution/imports/assets | verify:registry/assets + consumers ciblé |
| Style/navigation | parcours concerné et contrôle visuel responsive ciblé |
| Fin de jalon G1/G2/G3 | contrôles spécifiques du jalon + validate |
| G4/G5 et release | validate:full sur checkout propre ; réutiliser une preuve CI du même SHA |

Pas de suite complète après chaque retouche de texte. Pas de couverture + test léger répétés dans le même job CI : le job avec couverture remplace l'exécution sans couverture, il ne s'y ajoute pas.

## 5. Couverture PDF proportionnée

Une suite partagée par famille produit les trois exemples nominaux et vérifie les invariants utiles : fichier lisible, dimensions, texte essentiel, nombre de pages/faces attendu, absence de page blanche finale. Les attentes ne sont pas calculées par la fonction testée.

Ajouter ensuite les risques différents : carte débordante, QR impossible, reçu à la limite de hauteur, cellule de départ d'une planche, facture sur plusieurs pages. Les limites communes d'image, de données et de monnaie sont testées au niveau partagé, pas pour quinze compositions.

Les tests PDF inspectent les fichiers avec un lecteur indépendant du layout. Une signature `%PDF` ou un `Blob.size > 0` ne prouve pas le contenu. Le décodage QR porte sur une rasterisation du PDF final, pas seulement sur la chaîne envoyée à l'encodeur.

Les snapshots visuels commencent avec un exemple représentatif par famille. Ajouter une référence uniquement pour une structure ou régression visuelle distincte. Pas de matrice automatique 15 × formats × thèmes × langues × navigateurs. Une planche contact des quinze exemples facilite la revue humaine sans quinze suites browser.

Le test de fichier vérifie ce qu'un test unitaire ne peut pas prouver : moteur, pagination, polices et placements. Les seuils de pixel diff sont calibrés sur un runner Linux fixé avec rasteriseur/polices épinglés ; ne pas comparer Windows et Linux comme s'ils étaient bit-identiques. Metadonnées temporelles fixées en fixture ; pas d'égalité binaire arbitraire entre deux rendus.

## 6. E2E et installation externe

Petit ensemble de parcours qui couvrent des risques distincts : découverte/filtre ; carte modifiée puis export et verso ; données invalides et reprise ; changement rapide de template/révision ; import image refusé ; une facture multipage ; clavier/recherche et confidentialité. Regrouper les assertions d'un même parcours au lieu de créer un test par bouton.

Les données/moteur/worker sont réels dans le parcours nominal. Les échecs de worker ou permissions sont injectés uniquement dans les scénarios qui les demandent. Pas de test hooks de mutation de l'état React en production.

Consumers : deux environnements, pas une installation par déclinaison. La validation statique couvre tous les items ; les installations couvrent les fermetures de dépendances distinctes. Un changement du thème ne justifie pas une série de téléchargements npm.

## 7. Coût, isolation et artefacts

Vitest deux workers maximum par défaut ; PDF/consumers et Playwright un worker, retries 0. Aucun serveur utilisateur réutilisé. Ports loopback contrôlés, profils temporaires, erreurs si port occupé. Date/locale/fuseau explicites. Artefacts sous `.artifacts/` et ignorés ; seules fixtures et références sélectionnées vont dans Git.

L'orchestrateur de validation prépare le build une fois, enregistre SHA/hash des entrées et le transmet à l'E2E (`E2E_USE_BUILD=1`). Une commande E2E autonome construit elle-même si aucun artefact validé n'est fourni. Ne jamais réutiliser un build périmé. Le visual peut utiliser les PDF déjà générés avec empreinte correspondante ; sinon générer ses entrées sans rejouer toutes les assertions PDF.

En CI : un job Vitest léger, un job PDF, un job consumer, un job build et un job browser/visual selon coût ; ne pas relancer `validate:full` dans chacun. Les jobs dépendants réutilisent l'artefact de build. Les jobs conditionnels signalent explicitement `not-applicable`, jamais un résultat inventé ; la release exécute tous les périmètres.

## 8. Preuves et limites

Chaque `docs/qa/Lxx.md` mentionne commande réelle, SHA, environnement, résultat, fichiers examinés et limites. Distinguer test simulé, vrai PDF, vrai navigateur et impression physique. Les dimensions du fichier ne prouvent pas le réglage d'échelle d'une imprimante ; le scan automatisé QR ne remplace pas entièrement un essai matériel.

Au jalon final : vérifier clavier et lecteur d'écran, zoom 200 %, contraste, téléchargement sur navigateurs ciblés et impression à 100 % d'une carte/planche. L'absence d'imprimante n'empêche pas le développement ; elle est notée et empêche de promettre une calibration physique universelle.
