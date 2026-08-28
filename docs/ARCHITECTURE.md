# Architecture cible

Statut : architecture à implémenter. Décisions détaillées dans les [ADR](adr/0001-stack.md). Aucun module listé ci-dessous n'existe encore.

## Stack retenue pour le plan

| Couche | Choix | Motif |
| --- | --- | --- |
| Runtime/outillage | Node LTS compatible, pnpm workspace, TypeScript strict | reproductibilité et deux périmètres clairs |
| Site | Next.js App Router, export statique, React | pages de catalogue/documentation indexables, aucun serveur requis |
| Interface | shadcn/ui, Base UI, Tailwind CSS, Lucide | demande utilisateur et code possédé |
| Génération | `@react-pdf/renderer` | primitives PDF composables, browser/Node |
| Affichage PDF | `pdfjs-dist`, worker local | afficher les octets produits, pages et texte sélectionnable |
| Validation | Zod | schémas des données et messages structurés |
| QR | encodeur maintenu à qualifier, rendu vectoriel | lisibilité, aucune requête tierce |
| Vérification | Vitest, Testing Library, Playwright, axe, outils d'inspection PDF | comportement et artefact réel |
| Documentation | MDX local, composants contrôlés | contenu versionné, pas de CMS |
| Distribution | JSON compatible registre shadcn | réutiliser son CLI, pas de CLI propriétaire V1 |

L01 résout et consigne les versions stables compatibles exactes. Les majeures ne sont pas déduites de ce document. L02 valide les incompatibilités bundler/worker/moteur avant généralisation. Le PDF viewer `pdfjs-dist` et le générateur `@react-pdf/renderer` sont deux bibliothèques distinctes ; ne pas les confondre avec le wrapper viewer nommé `react-pdf`.

## Arborescence prévue

```text
apps/www/
  src/app/                    # routes statiques, metadata et layouts
  src/components/ui/          # sources shadcn générées
  src/features/catalog/       # filtres et galerie
  src/features/playground/    # formulaires, état et coordination de rendu
  src/features/pdf-viewer/    # PDF.js, couche texte, navigation, zoom
  src/features/docs/          # navigation, code et composants MDX
  src/content/docs/           # guides MDX internes
  src/lib/catalog/            # index léger sans import de moteur PDF
  src/workers/                # rendu browser + protocole
  src/styles/                 # tokens du site
  public/generated/           # vignettes/manifests issus du build, ignorés
  public/r/                   # registre généré, ignoré
  public/assets/              # assets publics copiés depuis sources licenciées
packages/documents/
  src/core/                   # unités, formats, géométrie, money, résultats
  src/themes/                 # tokens PDF et validation
  src/primitives/             # Text, Stack, QR, Table... PDF uniquement
  src/templates/<family>/<id>/# composition, schéma, exemples, metadata
  src/catalog/                # manifeste sans imports lourds
  src/render/                 # entrées séparées browser/node et résolution assets
  assets/                     # polices statiques et exemples licenciés
  tests/                      # fixtures partagées et intégration PDF
tooling/registry/              # manifeste, validation, génération, fichiers source
tooling/assets/                # licences, checksums, copie et vignettes
tests/consumers/               # Vite/browser et Node, isolation hors workspace
tests/e2e/                    # parcours du site construit
tests/visual/                 # références sélectionnées et configuration
docs/                         # plan, décisions, preuves
```

Deux workspaces seulement au départ. `packages/documents` reste privé côté npm : sa fonction est d'organiser les sources, pas d'imposer une dépendance runtime à l'utilisateur. Ajouter un package partagé seulement si une dépendance réelle le justifie.

## Règles de dépendances

`core` ne dépend ni de React ni du navigateur. `themes` dépend de `core`. `primitives` dépend de `core/themes` et du moteur. `templates` dépend de ces couches, jamais du site. `render` adapte les templates au navigateur ou à Node. Le site importe les metadata légères et charge explicitement le code d'un template à la demande.

Le build du registre lit ces mêmes sources. Il ne maintient aucune seconde implémentation dans `apps/www`. Les interfaces de formulaire sont définies dans le site avec métadonnées JSON communes ; elles ne s'insèrent pas dans les sources PDF distribuées.

## Flux du rendu

```text
Champs/JSON -> validation -> requête sérialisable {revision, templateId, data, format, theme, assets}
            -> worker de génération -> PDF + diagnostics + revision
            -> stockage mémoire du résultat accepté
               -> PDF.js (copie des octets si transfert)
               -> téléchargement (même contenu)
```

Pas de composants React, fonctions, objets File, chemins locaux ou références DOM envoyés dans le protocole. Normaliser en données et buffers autorisés. Le worker charge le template via un index de loaders connu ; aucun import depuis une URL fournie par l'utilisateur.

Une génération active, une demande en attente remplacée par la plus récente. Debounce court de 250 ms ; les résultats obsolètes sont ignorés. Annuler logiquement ne signifie pas arrêter le CPU : sur timeout ou navigation, terminer le worker si nécessaire et le recréer. Ne pas lancer des workers infinis.

Le viewer peut transférer/détacher ses buffers : conserver des octets immuables pour le téléchargement, lui fournir une copie. Révoquer les Object URLs et détruire loading/render tasks PDF.js au changement de document/démontage. N'afficher que les pages proches du viewport pour les documents longs.

## Next.js statique et frontières

Routes dynamiques énumérées avec `generateStaticParams`, aucun slug arbitraire au runtime. Métadonnées et documentation produites au build. Filtres via paramètres publics lus côté client ; conserver une coquille statique/suspense compatible avec l'export. Les composants serveur ne transmettent que des metadata sérialisables, pas le composant d'un template ou un schéma Zod.

Pas de Server Action, API de génération, middleware dépendant d'une requête, cookies d'authentification, ISR ou optimiseur d'image serveur. Les images de catalogue sont générées au build et servies en fichiers locaux ; configurer explicitement le mode compatible export. Les headers de sécurité viennent de l'hébergeur, pas d'une API Next indisponible en export statique.

Les fichiers des workers PDF.js et du générateur, polices et éventuels CMaps nécessaires sont servis localement à versions cohérentes. L02 prouve leur résolution en production, pas seulement dans `dev`.

## Génération des assets

Sources des templates → PDF de démonstration avec données fixes → rasterisation → vignettes → metadata/registre → build du site. Pas de miniature dessinée séparément. Un manifest associe hash des sources, fixtures, polices, version de moteur et assets dérivés. Les changements invalident les artefacts concernés ; les sorties volumineuses restent en artefacts CI, pas en Git.

Le build doit préparer les assets avant que Next copie `public`. Les exemples et les licences indispensables à une installation hors réseau docn-ui sont inclus dans le chemin de distribution décrit par [REGISTRY.md](specs/REGISTRY.md).

## Extensions sans anticiper leur implémentation

Les schémas portent `schemaVersion` ; les versions de templates et de registre sont explicites. Cela facilite les évolutions sans imposer un moteur universel. Une API hébergée ou un éditeur visuel ferait l'objet d'un PRD et d'ADR distincts, notamment sur la confidentialité et la sécurité.
