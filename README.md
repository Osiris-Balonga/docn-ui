# docn-ui

Un catalogue de composants et de templates PDF composables, avec une interface de documentation construite avec shadcn/ui.

**État au 28 août 2026 : GitHub configuré et vérifié ; L00G en revue avant L01.** Le projet est destiné à être open source ; la licence reste à choisir. Aucun site, moteur PDF, registre public ou package n'est encore implémenté. Consulter [l'état des lots](docs/implementation/status.json) et [la gouvernance GitHub](docs/GITHUB.md).

[Project docn-ui V1](https://github.com/users/Osiris-Balonga/projects/2) · [Issues](https://github.com/Osiris-Balonga/docn-ui/issues) · [PR de configuration #9](https://github.com/Osiris-Balonga/docn-ui/pull/9) · [Preuves L00G](docs/qa/L00G.md)

## Pour l'agent d'implémentation

1. Lire le [guide de démarrage de l'agent](docs/implementation/START_HERE.md), puis [AGENTS.md](AGENTS.md).
2. Lire le [plan maître](IMPLEMENTATION_PLAN.md).
3. Consulter [l'état des lots](docs/implementation/status.json).
4. Exécuter la première fiche admissible, en commençant par [L00 — Gouvernance](docs/implementation/lots/L00-governance.md).

## Documents de référence

| Document | Rôle |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Vision, utilisateurs, principes et hypothèses |
| [DESIGN.md](DESIGN.md) | Expérience et interface shadcn/ui |
| [PRD](docs/PRD.md) | Exigences identifiées et périmètre V1 |
| [Architecture](docs/ARCHITECTURE.md) | Modules, dépendances et flux |
| [Contrats PDF](docs/specs/DOCUMENT_MODEL.md) | Données, formats, thèmes, rendu et erreurs |
| [Catalogue V1](docs/specs/TEMPLATE_CATALOG.md) | Quinze compositions, cinq familles |
| [Distribution](docs/specs/REGISTRY.md) | Code récupérable et registre compatible shadcn |
| [Tests](docs/TESTING.md) | Commandes, matrices et preuves |
| [Livraison](docs/RELEASE.md) | Git, CI, publication et rollback |
| [GitHub](docs/GITHUB.md) | Protections, Project, milestones, issues et suivi par les agents |
| [Risques](docs/RISKS.md) | Incertitudes, décisions et limites |
| [Sources](docs/REFERENCES.md) | Inspiration et références techniques |

Cette documentation adopte une organisation inspirée de BMAD : brief produit, PRD, architecture, décisions, lots et stories vérifiables. Elle ne prétend pas être un projet généré par BMAD et ne requiert pas son installation.

## Périmètre de lancement

Cartes de visite, billets d'événement, reçus thermiques, étiquettes et factures ; trois compositions par famille. Aperçu du PDF réel, édition de données, thèmes, formats, téléchargement et récupération du code. Pas d'éditeur libre par glisser-déposer ni de compte utilisateur dans cette V1.
