# Catalogue V1 — quinze compositions

Ce catalogue définit le périmètre de lancement. Trois compositions par famille, pas trois couleurs d'un même layout. Les IDs sont stables pour les URLs, fixtures et éléments du registre.

## Inventaire

| ID | Famille | Composition et différence attendue |
| --- | --- | --- |
| `business-card-minimal` | Carte | coordonnées alignées, forte hiérarchie typographique, verso marque |
| `business-card-editorial` | Carte | contraste serif/sans, organisation asymétrique, verso informations complémentaires |
| `business-card-studio` | Carte | bloc de marque contrasté, contacts répartis, verso QR et identité |
| `event-ticket-classic` | Billet | événement à gauche, souche/identifiant à droite, QR isolé |
| `event-ticket-conference` | Billet | participant et catégorie dominants, horaire/lieu secondaires |
| `event-ticket-live` | Billet | titre expressif, date dominante, QR et accès en zone dédiée |
| `receipt-retail` | Reçu | commerçant, lignes compactes, taxes, total et paiement |
| `receipt-hospitality` | Reçu | table/commande facultative, groupes lisibles, pied de service |
| `receipt-service` | Reçu | prestataire/client, description de prestation, récapitulatif compact |
| `label-product` | Étiquette | nom produit, référence, informations courtes et QR facultatif |
| `label-address` | Étiquette | destinataire/adresse dominants, repère expéditeur facultatif |
| `label-inventory` | Étiquette | identifiant dominant, emplacement et QR en seconde zone |
| `invoice-minimal` | Facture | document léger, coordonnées compactes et tableau ouvert |
| `invoice-business` | Facture | identité formelle, blocs vendeur/client et tableau structuré |
| `invoice-studio` | Facture | identité visuelle plus présente, projet et totaux hiérarchisés |

Les trois thèmes transverses `neutral`, `editorial`, `bold` modifient les tokens, pas l'ID de composition. Sur les reçus, tous les thèmes conservent une version monochrome lisible. Aucun fond sombre massif imposé à une imprimante thermique.

## Compatibilité des formats

| Famille | Formats V1 | Contraintes |
| --- | --- | --- |
| Cartes | `card-85x55`, `card-90x50`, `card-us` (88,9×50,8 mm) | paysage ; recto/verso même taille ; personnalisation limitée aux presets |
| Billets | `ticket-210x74`, `ticket-150x70`, `ticket-a6` (105×148 mm) | classic/live : deux formats paysage ; conference : A6 portrait et 150×70 avec layout dédié |
| Reçus | `receipt-58`, `receipt-80` | hauteur automatique bornée ; aucune conversion en A4 |
| Étiquettes | `label-70x37`, `label-100x50`, `label-custom` | largeur 40–120, hauteur 25–100 mm ; préflight obligatoire |
| Factures | `a4` (210×297), `letter` (215,9×279,4 mm) | portrait et pagination ; A5 non promis en V1 |

Les noms sont des presets produit, pas la revendication d'une norme commerciale universelle. Dimensions toujours affichées en mm, équivalent pouces optionnel pour Letter/card-us. Chaque template déclare sa vraie liste de compatibilité ; ne pas annoncer tout le produit cartésien.

## Planches d'étiquettes

Profils A4 et Letter. Paramètres : taille de l'étiquette, marges de page, espacements, nombre de colonnes/lignes calculé, ordre ligne par ligne, cellule de départ et quantité. Vérifier `marges + cellules + espaces <= page` dans les deux axes. Tout placement impossible est refusé.

La page suivante repart à la première cellule ; la cellule de départ ne s'applique qu'à la première. Quantité positive bornée à 100 ; identifiants ordonnés et aucune duplication involontaire. Pas de compatibilité annoncée avec une référence Avery sans comparaison physique de cette référence.

## Dossier obligatoire de chaque template

`<id>.tsx` (composition), `schema.ts`, `metadata.ts`, `examples.ts`, tests intégrés à la suite PDF de sa famille, données d'exemple synthétiques. Extraire un sous-composant seulement s'il a une responsabilité ou une réutilisation réelle. Une famille peut partager schéma/fixtures sans recopier des fichiers identiques.

Metadata : ID, version, titre, description, tags, famille, formats/thèmes, faces, capacités QR/logo/impression, source, licence après confirmation. Les images de galerie sont générées depuis l'exemple nominal, jamais maintenues à la main.

## Fixtures et effort de test

- Chaque composition reçoit un exemple nominal : une génération et un contrôle de structure/contenu via une suite paramétrée par famille, pas un fichier de test par déclinaison.
- Les risques communs (long nom, police, URL, limites d'image) se testent au niveau partagé le plus bas ; ne pas les recopier quinze fois.
- Une fixture adverse représentative par famille exerce son risque propre : débordement carte, QR dense, reçu long, débordement de planche, facture multipage.
- Tester les bornes d'un format lorsque la géométrie diffère ; ne pas croiser automatiquement tous les formats × thèmes × langues × navigateurs.
- Références visuelles sélectionnées : une par famille, plus une face ou variante seulement si sa structure n'est couverte nulle part. Les quinze vignettes peuvent être relues en planche contact sans créer quinze suites de screenshots.

## Après V1

Rapports, devis, propositions, CV, certificats, menus, brochures, badges et invitations : backlog distinct. Une famille nouvelle doit avoir un besoin, une composition et une contrainte propres. Le maintien d'un catalogue de qualité passe avant l'affichage d'un compteur élevé.
