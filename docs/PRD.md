# PRD — docn-ui V1

Statut : spécification de planification, 2026-08-28. Référence : [produit](../PRODUCT.md). Les IDs ci-dessous servent à relier les exigences aux lots et aux preuves.

## Résultat utilisateur

Un développeur trouve un document adapté à son support, remplace les données de démonstration, obtient un PDF fidèle à l'aperçu et installe le même template dans son projet sans dépendre du site docn-ui à l'exécution.

Parcours principal : catalogue → composition → données → format compatible → thème → aperçu PDF → téléchargement ou installation → rendu autonome.

## Exigences fonctionnelles

| ID | Exigence vérifiable | Lots responsables |
| --- | --- | --- |
| FR-01 | Catalogue de 15 compositions, cinq familles, recherche et filtres combinables | L06, L08–L11 |
| FR-02 | Fiche avec description, formats compatibles, données, thème, source, limites | L05, L06, L12 |
| FR-03 | Dimensions physiques explicites ; format, composition et thème indépendants | L02, L04 |
| FR-04 | Aperçu du PDF réellement généré, pages/faces, zoom, état de révision | L02, L05, L06 |
| FR-05 | Éditeur de données typées, validation et remise à zéro ; JSON en mode avancé | L05, L06 |
| FR-06 | Téléchargement du même PDF que l'aperçu courant, nom sûr et erreurs visibles | L05, L06 |
| FR-07 | Trois thèmes cohérents ; modification contrôlée de l'accent et du logo | L04, L06 |
| FR-08 | Trois cartes de visite, deux faces, formats compatibles et zones sûres | L05 |
| FR-09 | Trois billets, QR code vérifié et contenu variable sans troncature cachée | L08 |
| FR-10 | Trois reçus, largeurs 58/80 mm, hauteur liée au contenu et limite explicite | L09 |
| FR-11 | Trois étiquettes, export individuel et planche paramétrée | L10 |
| FR-12 | Trois factures, A4/Letter, lignes multipages et calculs déterministes | L11 |
| FR-13 | Code complet consultable, récupérable et installable via registre shadcn | L07, L12 |
| FR-14 | Installation vérifiée dans deux projets vierges, navigateur et Node | L07, L14 |
| FR-15 | Documentation des composants, formats, thèmes, usages et création d'un template | L12 |
| FR-16 | Données documentaires FR/EN ; contenu du site initial en anglais | L04–L12 |

Une variation de couleur ne compte pas comme nouvelle composition. La matrice précise des templates et formats est dans le [catalogue](specs/TEMPLATE_CATALOG.md).

## Exigences non fonctionnelles

| ID | Contrat | Vérification / lots |
| --- | --- | --- |
| NFR-01 | Données saisies et images jamais envoyées à un service distant | interception réseau, L06/L13/L14 |
| NFR-02 | Site utilisable au clavier, responsive et avec réduction de mouvement | axe + tests manuels, L03/L13/L14 |
| NFR-03 | Résultat indépendant des tokens/CSS DOM du site | test de frontières et consommation externe, L04/L07 |
| NFR-04 | Rendu lourd isolé ; dernière saisie prioritaire ; ressources libérées | concurrence/timeout/navigation, L02/L06/L13 |
| NFR-05 | PDF vérifié structurellement et visuellement ; texte non perdu | suite PDF, L02 puis chaque famille |
| NFR-06 | Versions, assets et builds reproductibles ; licences tracées | lockfile/hashes/CI, L01/L07/L15 |
| NFR-07 | Entrées bornées ; pas d'exécution de code ni chargement d'URL utilisateur | tests négatifs, L06/L13 |
| NFR-08 | Installation hors monorepo sans imports privés ni dépendance docn-ui runtime | consumer fixtures, L07/L14 |
| NFR-09 | URL et version de registre explicites, pas de publication implicite | L07/L15/L16 |
| NFR-10 | Aucun support d'impression ou de navigateur non testé annoncé comme garanti | QA et documentation, L12/L14/L16 |

## Critères des principaux parcours

### Trouver un template

Étant sur `/templates/`, quand l'utilisateur combine famille et format, seuls les modèles compatibles apparaissent. Le compteur correspond, le retour arrière restaure les filtres publics, et une recherche sans résultat propose de les effacer. Aucun moteur PDF n'est nécessaire pour filtrer la galerie.

### Personnaliser et exporter

Étant sur une carte, quand l'utilisateur modifie son nom puis son logo, il voit une génération annoncée puis le PDF de cette révision. Il peut parcourir le verso. Le téléchargement est bloqué tant que la nouvelle révision n'est pas prête ; les octets téléchargés correspondent à l'aperçu. Des données invalides ne font pas disparaître les champs ni ne remplacent les valeurs par celles d'exemple.

### Installer

Étant sur la source, quand l'utilisateur suit la commande de registre dans un projet compatible, tous les fichiers et dépendances nécessaires sont installés. Les imports se résolvent sans les alias du monorepo. Après configuration des assets documentée, le rendu fonctionne sans accès au domaine docn-ui.

## Données et fonctionnalités exclues

Pas de comptes, espace cloud, historique de documents, serveur de rendu, paiements, éditeur libre, code utilisateur exécutable, import HTML/Markdown arbitraire, partage de données par URL, scan/validation serveur de billet ou bibliothèque de templates payants. Le navigateur n'ouvre que des PDF générés par l'application, pas des PDF externes téléversés.

Pas de certification fiscale des factures ; les champs légaux restent à adapter par le consommateur. Pas de garantie CMJN/PDF-X/PDF-UA. Pas de persistance automatique des coordonnées ou logos. Pas de PWA/offline garanti à cette étape.

## Définition de terminé

Les 15 compositions existent et sont distinctes ; chaque template possède schéma, exemple nominal, cas limites, formats, source, fiche, test PDF et entrée de registre. Les deux modes de consommation sont vérifiés, les parcours passent sur les navigateurs ciblés, les limitations sont publiées et aucune donnée n'est transmise. L16 exige en plus l'autorisation, une version publique vérifiée et un rollback documenté. Toute exception doit être explicitement acceptée et réduire la promesse publique correspondante.
