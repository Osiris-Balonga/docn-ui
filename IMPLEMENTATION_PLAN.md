# docn-ui — plan d'implémentation et de livraison

Date : 2026-08-28. Statut : **L00 vérifié ; GitHub L00G configuré, PR #9 en revue avant L01**. Le plan compte désormais **18 lots et 60 stories/commits prévus**, hors commits documentaires de traçabilité. L'[état des lots](docs/implementation/status.json) consigne la progression réelle.

## 1. Contrat d'exécution

Lire [AGENTS.md](AGENTS.md). Le PRD décrit le résultat attendu ; les spécifications définissent les contrats ; les lots ordonnent le travail. En cas de contradiction, arrêter la partie affectée, expliciter l'écart et corriger les documents avant de coder. Les hypothèses de [PRODUCT.md](PRODUCT.md) restent identifiées.

Le dossier était vide et sans `.git` lors de la préparation. Aucun commit, remote, domaine, hébergement ou droit de publication n'est supposé exister.

## 2. Inspiration adaptée

Le plan initial de `paint-3d`, commit `c2cbdd5`, fournit le modèle : gouvernance, architecture, lots, commits atomiques, tests et critères de livraison. Ici les fiches sont séparées pour faciliter les reprises. Le détail des divergences est dans [REFERENCES.md](docs/REFERENCES.md) ; aucune modification n'est autorisée dans le projet de référence.

Organisation inspirée de BMAD, sans runtime BMAD : brief → PRD → architecture/ADR → epics/lots → stories/commits → preuves et état. Un lot correspond à un epic livrable ; chaque commit planifié porte une story `Lxx-Syy`.

Révision demandée le 2026-08-28 : reprendre la gouvernance GitHub de Munganga, en durcissant le sens des PR et en conservant les commits. L00G est inséré sans renuméroter les IDs existants ; il utilise le préfixe `L00G-Syy`.

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
| Quelles règles GitHub et quel suivi ? | [GITHUB](docs/GITHUB.md) et [IDs réels](docs/implementation/github.json) |

## 4. Ordre des lots

Exécution séquentielle par défaut. `Dépend de` désigne le lot précédent requis pour commencer ; ses propres prérequis sont transitifs. Les fiches et `status.json` utilisent la même séquence. Ne pas multiplier les agents ou branches parallèles sans demande du mainteneur.

| Lot | Livrable | Dépend de | Fiche |
| --- | --- | --- | --- |
| L00 | Gouvernance et premier commit documentaire | — | [Gouvernance](docs/implementation/lots/L00-governance.md) |
| L00G | Dépôt public, protections, Project et issues | L00 | [GitHub](docs/implementation/lots/L00G-github-governance.md) |
| L01 | Workspace, Next.js, shadcn, tests et CI minimale | L00G | [Bootstrap](docs/implementation/lots/L01-bootstrap.md) |
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

- **G0 / L00 + L00G** : premier commit local, puis dépôt public protégé, Project et issues vérifiés ; L00G intégré avant le bootstrap applicatif.
- **G1 / L02** : carte à dimensions exactes, police locale, recto verso, reçu long et rendu worker prouvés. Une difficulté de moteur se traite ici, pas après quinze templates.
- **G2 / L05** : première chaîne utile, données → aperçu réel → téléchargement, validée visuellement.
- **G3 / L07** : code installé dans un projet vierge, sans dépendance au monorepo ni au site docn-ui.
- **G4 / L11** : quinze compositions réelles sur cinq familles, avec leurs fixtures et leur registre.
- **G5 / L14** : exigences et risques couverts avec un échantillonnage ciblé, limites et exceptions documentées ; pas de matrice combinatoire.
- **G6 / L16** : publication autorisée, version et assets immuables, vérification du site public. Un build local ne satisfait pas ce jalon.

## 6. Git et commits

Modèle retenu : `main` = version publique ; `dev` = intégration et branche par défaut ; branches de lots vers `dev`. PR obligatoire sur les deux branches ; seule `dev` du même dépôt cible `main`. Merge commits uniquement. Le bootstrap distant unique de L00G est documenté dans [GITHUB](docs/GITHUB.md) ; ensuite aucun push direct, bypass, squash ou fusion automatique.

Les messages exacts et le contenu de chaque commit sont dans les fiches. Tests du comportement dans le même commit que le code ; commits `test(...)` supplémentaires pour les parcours transverses. Une story peut être subdivisée si elle devient trop volumineuse, avec IDs suffixés et raison dans la fiche avant exécution.

Mode hors ligne : les lots suivants peuvent partir du dernier lot `verified_local` si l'utilisateur a demandé de poursuivre localement. Les PR futures sont d'abord empilées vers la branche précédente ; après fusion de celle-ci, retargeter la suivante vers `dev`. Pas de faux statut `merged` et pas de réécriture de commits pour fabriquer un historique.

## 7. État et reprise

États : `planned` → `in_progress` → `verified_local` → `in_review` → `merged` ; `released` réservé à L16. `blocked` contient un motif concret et une condition de reprise. Pas de date, résultat ou SHA fictif.

L00 est désormais `verified_local`, avec ses deux commits existants ; les autres lots reflètent leur progression réelle. Chaque entrée pointe vers sa fiche ; les commits attendus restent dans la fiche. `actualCommits` ne contient que des SHAs existants. Le Project affiche le suivi partagé : une issue par lot, stories en checklist, preuves et PR liées ; [GITHUB](docs/GITHUB.md) fixe les transitions, sans assimiler validation locale et fusion.

## 8. Autorisations et décisions externes

Le mainteneur demande maintenant GitHub avant L01 et confirme `Osiris-Balonga/docn-ui` public. Le setup de L00G est autorisé ; une fusion reste une décision distincte. Licence, hébergeur, domaine et publication du site ne sont pas décidés. Un accès GitHub indisponible bloque L00G, sans autoriser à l'omettre ni à commencer L01. Ne pas inventer `@docn`, un package npm ou une licence.

## 9. Fin du projet et extensions

La V1 est finie quand le [PRD](docs/PRD.md) et les critères de L16 sont satisfaits. Les rapports, devis, CV, certificats, menus, brochures, badges, RTL, import de polices, éditeur libre, génération IA et API hébergée sont une feuille de route ultérieure ; aucune de ces extensions ne doit retarder implicitement la V1 ni être annoncée comme disponible.
