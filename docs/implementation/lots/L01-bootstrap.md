# L01 — Bootstrap reproductible et périmètres de qualité

Statut initial : **planned**. Branche : `chore/bootstrap-workspace`.

Dépendances : L00. Exigences : NFR-02, NFR-03, NFR-06, NFR-08.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../ARCHITECTURE.md), [référence 2](../../TESTING.md), [référence 3](../../adr/0001-stack.md).

## Périmètre et fichiers

Deux workspaces et une page minimale, sans moteur PDF ni faux catalogue. Établir dès maintenant les commandes de tests séparées.

Fichiers/responsabilités cibles : package.json, pnpm-workspace.yaml, pnpm-lock.yaml, apps/www, packages/documents, configs TS/Vitest, .github/workflows/ci.yml.

## Stories et commits dans l'ordre

### L01-S01 — `chore(workspace): scaffold static Next.js and document sources`

- [ ] Résoudre versions stables compatibles Node/pnpm/React/Next/TS et consigner la table réelle dans docs/DEPENDENCIES.md ; fixer packageManager, engines et versions exactes.
- [ ] Créer apps/www Next App Router en export statique et packages/documents privé ; TS strict, aliases propres, scripts pnpm multiplateformes, pas de shell Unix imposé à Windows.
- [ ] Retirer les démos du scaffold ; page minimale honnête, 404 et title ; générer un export qui s'ouvre sur serveur statique.

**Acceptation :** Installation avec lockfile figé, typecheck et build reproductibles. Aucun import serveur runtime requis.

**Vérification ciblée :** pnpm install --frozen-lockfile ; pnpm typecheck ; pnpm build ; lecture HTTP locale de la page.

### L01-S02 — `chore(ui): initialize shadcn with Base UI and Tailwind`

- [ ] Consulter les options de la version exacte du CLI ; init non interactif, Base UI, configuration d'aliases et CSS variables.
- [ ] Installer seulement Button et Tooltip nécessaires au smoke écran ; committer sources et components.json ; ne pas rejouer init avec --force.
- [ ] Vérifier compilation, thème de base et polices locales du site ; ne pas confondre polices web et PDF.

**Acceptation :** Le bouton visible provient des sources shadcn et fonctionne dans le build statique.

**Vérification ciblée :** Build ciblé ; inspection visuelle simple. Aucun test qui recopie les variantes internes de shadcn.

### L01-S03 — `chore(testing): separate unit component and integration scopes`

- [ ] Configurer Vitest unit/components/integration avec globs exclusifs et environnements adaptés ; réserver conventions pdf/consumers sans fausse suite vide réussie.
- [ ] Fournir scripts décrits dans TESTING : test, watch, coverage, validate, format/lint/types. Préparer un orchestrateur qui ne collecte que les périmètres réellement activés et les documente.
- [ ] Créer un smoke de composition UI et un test uniquement si un comportement propre existe ; ne pas générer des tests par fichier de config.
- [ ] Limiter workers, ignorer .artifacts ; vérifier via listing que chaque fichier est collecté une seule fois.

**Acceptation :** test:unit ne démarre ni DOM ni navigateur ; test:components ne rend pas de PDF ; la liste des périmètres activés est explicite.

**Vérification ciblée :** pnpm validate ; listing Vitest par projet et vérification des exclusions. Pas de seuil de couverture arbitraire.

### L01-S04 — `ci: add focused quality and build checks`

- [ ] Ajouter quality, unit-tests (trois projets légers en un passage) et build ; actions vérifiées, permissions en lecture et concurrence PR.
- [ ] Template PR : comportement, risque, vérifications ciblées, preuves et autorisations. Pas de workflow qui pousse ou déploie.
- [ ] Documenter les jobs non exécutés si aucun remote autorisé ; ne pas les marquer verts.

**Acceptation :** Workflow lisible et commandes locales correspondantes passent. CI distante, si absente, est signalée non exécutée.

**Vérification ciblée :** pnpm validate ; pnpm build. Réutiliser les résultats du même SHA au lieu de lancer chaque scope deux fois.

## Critère de sortie

Workspace et build propres ; contrats de commandes publiés ; aucun lot PDF dépend d'un test factice.

Compléter [l'état](../status.json) et créer `docs/qa/L01.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de plugin d'hébergement, CMS, auth, base de données, Turborepo ou CLI propriétaire.
