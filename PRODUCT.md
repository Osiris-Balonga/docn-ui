# Product — docn-ui

## Register

product

## Platform

web

## Users

Développeurs React/TypeScript qui doivent produire des PDF soignés depuis des données, sans redessiner chaque document. Le catalogue doit aussi être compréhensible par un designer ou un utilisateur qui teste un modèle, sans transformer la V1 en éditeur généraliste.

## Product Purpose

Fournir des formats physiques explicites, des compositions adaptées à chaque usage et une identité visuelle personnalisable. L'utilisateur découvre un template, teste ses données, constate le rendu PDF exact, le télécharge et récupère son code.

## Décisions confirmées

- Modèle inspiré de shadcn et PDFx : composants composables, code récupérable, catalogue documenté.
- shadcn/ui pour l'interface du site, dont l'expérience rappelle sa documentation.
- Diversité des supports, notamment cartes de visite et tickets.
- Première chaîne complète avec une carte de visite, puis extension aux autres familles.
- Plan d'implémentation détaillé en fichiers, étapes et commits ; pas d'implémentation pendant la rédaction du plan.

## Hypothèses de travail du plan

Ces choix sont des propositions explicites de l'agent, modifiables via ADR avant leur lot ; ils ne sont pas attribués au mainteneur : site initial en anglais pour une audience développeur, documents en français et anglais ; V1 de quinze compositions ; Next.js statique ; génération locale ; distribution via le CLI shadcn existant ; licence permissive recommandée mais non accordée à ce stade.

## Brand Personality

Précise, sobre, accessible. L'interface met les documents en valeur ; les templates peuvent être plus expressifs que l'interface. Pas de promesse « impression professionnelle universelle ».

## Anti-references

- Un catalogue de variantes identiques dont seule la couleur change.
- Des aperçus HTML qui ne correspondent pas au PDF téléchargé.
- Un outil imposant des dizaines de réglages avant le premier document.
- Une imitation du nom, logo ou contenu de shadcn ou PDFx.
- Une page promotionnelle dominante sans accès rapide aux templates.

## Design Principles

1. Le document réel est la référence de l'aperçu et du téléchargement.
2. Le support dicte la composition ; changer les dimensions ne suffit pas.
3. Le code appartient au projet utilisateur après installation.
4. Les limites sont visibles : texte trop long, format incompatible, police absente.
5. La confidentialité est simple : les données d'essai restent dans le navigateur.

## Accessibility & Inclusion

Objectif de conception WCAG 2.2 AA pour le site, clavier complet, focus visible, zoom à 200 %, texte des états et respect de `prefers-reduced-motion`. Le contenu du PDF est également présenté sous forme de données accessibles dans l'éditeur ; cela ne constitue pas une certification d'accessibilité du fichier PDF. Les scripts autres que latin et leurs polices nécessitent une qualification ultérieure.
