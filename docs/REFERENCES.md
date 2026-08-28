# Sources et inspiration

Consultation : 2026-08-28. Les versions devront être vérifiées au bootstrap ; ces liens sont des références, pas des garanties de compatibilité testées pour docn-ui.

## paint-3d / DrawMotion — lecture seule

Chemin local : `C:/Users/Dell/Documents/Dev Projects/paint-3d`.

- Premier commit : `c2cbdd5`, `chore(repo): initialize DrawMotion governance`.
- Fichier initial : `git show c2cbdd5:IMPLEMENTATION_PLAN.md` ; 656 lignes, gouvernance, 12 lots, commits exacts, critères et livraison.
- Documents initiaux complémentaires : `PRODUCT.md`, `DESIGN.md`, ADR de stack/Git.
- État final consulté : `8e370cd5e6802be762bf14a192a3e68cbb52fa54`, branche `codex/pwa-offline`, arbre de travail propre à la lecture.
- Instruction utilisateur ajoutée pendant la planification : s'inspirer spécifiquement de `docs/TESTING.md`, `package.json`, `vitest.config.ts`, `playwright.config.ts` finaux pour séparer les périmètres et éviter les tests inutiles.

Repris : lots séquentiels, tests par responsabilité, commits atomiques, états/preuves, validations locales distinctes de la livraison. Adapté : structure en fiches, branche `dev/main` cohérente, pas de squash qui supprime le journal demandé, aucun remote obligatoire pour travailler localement, `validate` léger et `validate:full` explicite. Non repris : webcam, gestes, MediaPipe, PWA et contraintes spécifiques de DrawMotion.

Seules des lectures `git log/show/ls-tree/status` et de fichiers ont été effectuées ; pas de checkout, reset, installation ou écriture dans ce projet.

## PDFx

[Site](https://pdfx.akashpise.dev/) et [dépôt corrigé](https://github.com/akii09/pdfx). Le registre consulté expose 24 composants et 10 blocks, répartis entre six factures et quatre rapports. Il a inspiré le positionnement, sans copie de code.

[Registre source](https://github.com/akii09/pdfx/blob/main/apps/www/src/registry/index.json) ; [architecture](https://github.com/akii09/pdfx/blob/main/ARCHITECTURE.md). Le manque relevé concerne les templates prêts à utiliser de tickets/cartes/étiquettes ; il ne prouve pas l'impossibilité de tailles personnalisées du moteur.

## Sources primaires techniques

- [shadcn — installation Next.js](https://ui.shadcn.com/docs/installation/next) : intégration au site.
- [shadcn — registre](https://ui.shadcn.com/docs/registry) et [schéma des items](https://ui.shadcn.com/docs/registry/registry-item-json) : distribution, dépendances qualifiées, types et targets.
- [Next.js — export statique](https://nextjs.org/docs/app/guides/static-exports) : lu aussi directement en Markdown officiel après échec d'extraction web ; génération au build et contraintes sans runtime serveur.
- [React-pdf — Page](https://react-pdf.org/docs/v4/components/page) : dimensions et hauteur optionnelle.
- [React-pdf — fonctions avancées](https://react-pdf.org/advanced) et [polices](https://react-pdf.org/fonts) : pagination et compatibilité des assets.
- [PDF.js — exemples officiels](https://mozilla.github.io/pdf.js/examples/) : lecture et rendu des octets PDF.

Ces capacités doivent être démontrées ensemble dans L02/L07. La documentation officielle ne remplace pas un test du montage exact retenu.
