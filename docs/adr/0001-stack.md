# ADR 0001 — Site statique et sources documentaires séparées

Date : 2026-08-28. Statut : proposé comme défaut du plan ; shadcn/ui confirmé par le mainteneur.

## Décision

Deux workspaces pnpm : `apps/www` et `packages/documents`. Next.js App Router en export statique pour la documentation/catalogue ; React et TypeScript strict. shadcn/ui avec Base UI et Tailwind pour le site. Rendu `@react-pdf/renderer` dans un worker browser et via une entrée Node. Viewer PDF.js local, chargé à la demande.

## Justification et alternatives

Next.js permet les pages statiques indexables sans ajouter de serveur de données. Vite reste valable mais demanderait une stratégie explicite de pré-rendu de documentation ; pas de migration à Vite sans décision écrite. Pas de Turborepo au bootstrap : deux workspaces peuvent être orchestrés par pnpm et des scripts simples. Pas de store global tant que hooks/reducer suffisent.

Base UI est un choix de cohérence, pas une exigence héritée automatiquement de DrawMotion ; Radix serait possible mais les bases ne doivent pas être mélangées. La génération PDF est indépendante de ce choix. Réutiliser le nom ou le style shadcn ne signifie pas redistribuer son identité graphique.

## Validation requise

L01 consigne versions et commandes non interactives réellement supportées. L02 prouve le bundling du worker et des polices dans l'export de production, la récupération d'erreurs et la génération Node. Si le worker exige un bundler différent ou un post-traitement PDF, mettre à jour cet ADR avant les lots de catalogue.

## Conséquences

Pas de Server Actions/API runtime, pas de dépendance au site dans le code distribué, pas d'installation de packages non nécessaires. L'hébergement doit servir correctement chemins statiques, JSON, workers et polices.
