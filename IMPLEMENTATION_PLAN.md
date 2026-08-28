# docn-ui — plan d'implémentation et de livraison

Date : 2026-08-28. Statut : **L00 vérifié localement ; L01 à démarrer**. L'[état des lots](docs/implementation/status.json) consigne la progression réelle.

## 1. Contrat d'exécution

Lire [AGENTS.md](AGENTS.md). Le PRD décrit le résultat attendu ; les spécifications définissent les contrats ; les lots ordonnent le travail. En cas de contradiction, arrêter la partie affectée, expliciter l'écart et corriger les documents avant de coder. Les hypothèses de [PRODUCT.md](PRODUCT.md) restent identifiées.

Le dossier était vide et sans `.git` lors de la préparation. Aucun commit, remote, domaine, hébergement ou droit de publication n'est supposé exister.

## 2. Inspiration adaptée

Le plan initial de `paint-3d`, commit `c2cbdd5`, fournit le modèle : gouvernance, architecture, lots, commits atomiques, tests et critères de livraison. Ici les fiches sont séparées pour faciliter les reprises. Le détail des divergences est dans [REFERENCES.md](docs/REFERENCES.md) ; aucune modification n'est autorisée dans le projet de référence.

Organisation inspirée de BMAD, sans runtime BMAD : brief → PRD → architecture/ADR → epics/lots → stories/commits → preuves et état. Un lot correspond à un epic livrable ; chaque commit planifié porte une story `Lxx-Syy`.

## 3. Lecture et sources de vérité

| Question | Document canonique |
| --- | --- |
| Que livrer ? | [PRD](docs/PRD.md) |
| À quoi ressemble le site ? | [DESIGN](DESIGN.md) |
| Où implémenter ? | [Architecture](docs/ARCHITECTURE.md) |
| Quel comportement PDF ? | [Contrats](docs/specs/DOCUMENT_MODEL.md) |
| Quels templates ? | [Catalogue](docs/specs/TEMPLATE_CATALOG.md) |
| Comment récupérer le code ? | [Registre](docs/specs/REGISTRY.md) |
| Quelle preuve ? | [Tests](docs/TESTING.md) |
| Quel statut réel ? | [status.json](docs/implementation/status.json) et rapports QA |
| Quels commits maintenant ? | Fiche du lot ci-dessous |

## 4. Ordre des lots

Exécution séquentielle par défaut. `Dépend de` désigne le lot précédent requis pour commencer ; ses propres prérequis sont transitifs. Les fiches et `status.json` utilisent la même séquence. Ne pas multiplier les agents ou branches parallèles sans demande du mainteneur.

| Lot | Livrable | Dépend de | Fiche |
| --- | --- | --- | --- |
| L00 | Gouvernance et premier commit documentaire | — | [Gouvernance](docs/implementation/lots/L00-governance.md) |
| L01 | Workspace, Next.js, shadcn, tests et CI minimale | L00 | [Bootstrap](docs/implementation/lots/L01-bootstrap.md) |
| L02 | Faisabilité PDF prouvée dans le build réel | L01 | [Rendu PDF](docs/implementation/lots/L02-pdf-feasibility.md) |
| L03 | Coque et navigation shadcn | L02 | [Interface](docs/implementation/lots/L03-site-shell.md) |
| L04 | Contrats, formats, thèmes et primitives PDF | L03 | [Fondations](docs/implementation/lots/L04-document-foundations.md) |
| L05 | Première carte complète puis trois compositions | L04 | [Cartes](docs/implementation/lots/L05-business-cards.md) |
| L06 | Catalogue et éditeur de données réutilisable | L05 | [Catalogue](docs/implementation/lots/L06-catalog-playground.md) |
| L07 | Installation réelle du code hors monorepo | L06 | [Registre](docs/implementation/lots/L07-registry.md) |
| L08 | Trois billets d'événement | L07 | [Billets](docs/implementation/lots/L08-event-tickets.md) |
| L09 | Trois reçus thermiques | L08 | [Reçus](docs/implementation/lots/L09-thermal-receipts.md) |
| L10 | Trois étiquettes et planches | L09 | [Étiquettes](docs/implementation/lots/L10-labels.md) |
| L11 | Trois factures multipages | L10 | [Factures](docs/implementation/lots/L11-invoices.md) |
| L12 | Documentation, galerie de composants et guides | L11 | [Documentation](docs/implementation/lots/L12-documentation.md) |
| L13 | Accessibilité, sécurité et performance | L12 | [Durcissement](docs/implementation/lots/L13-hardening.md) |
| L14 | Qualification complète et installations | L13 | [Qualification](docs/implementation/lots/L14-qualification.md) |
| L15 | CI finale, preview et préparation de livraison | L14 | [Livraison](docs/implementation/lots/L15-delivery.md) |
| L16 | QA finale, publication autorisée et v1.0.0 | L15 | [Release](docs/implementation/lots/L16-release.md) |

## 5. Jalons de décision

- **G0 / L00** : documentation cohérente et premier commit local ; permissions distantes séparées.
- **G1 / L02** : carte à dimensions exactes, police locale, recto verso, reçu long et rendu worker prouvés. Une difficulté de moteur se traite ici, pas après quinze templates.
- **G2 / L05** : première chaîne utile, données → aperçu réel → téléchargement, validée visuellement.
- **G3 / L07** : code installé dans un projet vierge, sans dépendance au monorepo ni au site docn-ui.
- **G4 / L11** : quinze compositions réelles sur cinq familles, avec leurs fixtures et leur registre.
- **G5 / L14** : exigences et risques couverts avec un échantillonnage ciblé, limites et exceptions documentées ; pas de matrice combinatoire.
- **G6 / L16** : publication autorisée, version et assets immuables, vérification du site public. Un build local ne satisfait pas ce jalon.

## 6. Git et commits

Modèle retenu : `main` = version publique ; `dev` = intégration ; branches de lots vers `dev`. Bootstrap documentaire local sur `main`, puis création de `dev` au même commit. Conserver les commits atomiques lors de la fusion ; ne pas écraser les stories en un squash si l'objectif est de conserver ce journal.

Les messages exacts et le contenu de chaque commit sont dans les fiches. Tests du comportement dans le même commit que le code ; commits `test(...)` supplémentaires pour les parcours transverses. Une story peut être subdivisée si elle devient trop volumineuse, avec IDs suffixés et raison dans la fiche avant exécution.

Mode hors ligne : les lots suivants peuvent partir du dernier lot `verified_local` si l'utilisateur a demandé de poursuivre localement. Les PR futures sont d'abord empilées vers la branche précédente ; après fusion de celle-ci, retargeter la suivante vers `dev`. Pas de faux statut `merged` et pas de réécriture de commits pour fabriquer un historique.

## 7. État et reprise

États : `planned` → `in_progress` → `verified_local` → `in_review` → `merged` ; `released` réservé à L16. `blocked` contient un motif concret et une condition de reprise. Pas de date, résultat ou SHA fictif.

`status.json` est initialement entièrement `planned`, y compris L00 : les fichiers du plan existent, mais le lot de gouvernance n'a pas été committé. Chaque entrée pointe vers sa fiche ; la liste des commits attendus reste dans la fiche. `actualCommits` reçoit seulement des commits existants.

## 8. Autorisations et décisions externes

Le développement local peut avancer sans nom de domaine, compte hébergeur ou dépôt GitHub. Utiliser des URLs locales en tests. Avant publication, obtenir : destination Git, visibilité, licence, identité de l'auteur, hébergeur, domaine/URL publique et autorisation de publier. Ne pas inventer `@docn`, un package npm disponible ou un compte propriétaire.

## 9. Fin du projet et extensions

La V1 est finie quand le [PRD](docs/PRD.md) et les critères de L16 sont satisfaits. Les rapports, devis, CV, certificats, menus, brochures, badges, RTL, import de polices, éditeur libre, génération IA et API hébergée sont une feuille de route ultérieure ; aucune de ces extensions ne doit retarder implicitement la V1 ni être annoncée comme disponible.
