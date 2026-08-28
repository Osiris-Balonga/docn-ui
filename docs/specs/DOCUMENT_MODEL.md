# Contrats des documents PDF

Contrat normatif pour L02–L11. Les signatures sont des intentions à typer et tester, pas une API existante.

## 1. Identité, formats et thèmes

`TemplateDefinition<T>` décrit : `id`, `version`, `schemaVersion`, `family`, metadata, `supportedFormatIds`, `supportedThemeIds`, `schema`, `defaultData`, fixtures et fonction de composition. Les metadata sérialisables sont dans un module distinct de la fonction React et de Zod.

`RenderRequest` contient `protocolVersion: 1`, `revision`, `templateId`, `templateVersion`, `data`, `formatId`, options de format autorisées, `themeId`, overrides bornés, `locale`, `printProfile` et assets autorisés. Une incompatibilité donne une erreur structurée, jamais une conversion silencieuse.

`RenderResult` contient `revision`, `pdfBytes`, `pageCount`, dimensions finales, diagnostics et empreinte des entrées normalisées. L'empreinte ne quitte pas la mémoire ni n'est utilisée comme télémétrie.

Un format fixe déclare largeur/hauteur en mm ; un format continu déclare largeur et hauteur maximum. Orientation transforme les dimensions une seule fois. Conversion canonique `pt = mm * 72 / 25.4`, arrondi uniquement à l'affichage. Tolérance des assertions de taille : 0,1 pt.

Un thème contient couleurs RGB/hex compatibles moteur, familles de polices autorisées, tailles en points, espacements, filets. Pas de CSS variables, OKLCH ou classes Tailwind envoyés au moteur. Les trois thèmes `neutral`, `editorial`, `bold` partagent les mêmes rôles ; les adaptations structurelles restent dans les templates.

## 2. Formats et profils d'impression

- Taille de coupe : dimension finale du support, hors fond perdu.
- Fond perdu : extension du fond autour de la coupe, paramétrable dans la liste autorisée.
- Zone de sécurité : inset intérieur pour textes et QR ; aucune information indispensable dans le fond perdu.
- Traits de coupe : option graphique située hors coupe, avec marge externe dédiée ; ils ne doivent pas traverser le contenu.

V1 fournit `screen` (taille de coupe, sans marques) et `print` (fond perdu/marges explicites). Exemple de test : coupe 85×55 mm + fond perdu de 3 mm donne 91×61 mm sans traits ; une marge externe de marques s'ajoute des deux côtés si activée. Définir toutes les boîtes en coordonnées PDF, avec conversion de l'origine haut/gauche du layout vers bas/gauche des boîtes PDF.

L02 vérifie la possibilité de définir MediaBox/TrimBox/BleedBox. Si le moteur n'expose pas les boîtes requises, utiliser un post-traitement isolé qualifié, ou retirer l'option concernée jusqu'à une décision explicite. L'aperçu et le téléchargement utilisent toujours le résultat final post-traité. Aucun claim CMJN, profil ICC ou PDF/X.

Recto/verso = deux pages de même dimension dans l'ordre front/back, pas un montage d'imposition duplex universel. Les instructions de retournement dépendent de l'imprimante ; vérifier sur une feuille test, ne pas appliquer de miroir au texte. Les planches d'étiquettes sont des documents distincts du format individuel.

## 3. Schémas de données

Schémas stricts, sans clés inconnues ; erreurs par chemin de champ. Chaînes normalisées sans effacer les accents. Dates ISO en entrée, locale explicite, date de facture sans conversion de fuseau implicite. Événements : instant et fuseau IANA séparés. Exemples reproductibles avec dates fixes.

### Carte

`name`, `role?`, `organization?`, `email?`, `phone?`, `website?`, `address?`, `logoAssetId?`, `qrPayload?`. Au moins une coordonnée. Nom long : retour à la ligne puis erreur si dépassement ; ne pas rapetisser sous le minimum du template.

### Billet

`eventName`, `startsAt`, `timeZone`, `venue`, `attendeeName?`, `ticketId`, `category?`, `seat?`, `qrPayload`. Le QR encode exactement la chaîne validée ; il n'assure ni signature cryptographique, ni unicité, ni contrôle d'accès. Zone détachable = repère graphique, pas une découpe physique.

### Reçu et facture

Utiliser un noyau commun de lignes monétaires : identifiant, libellé, quantité entière V1, prix en unité mineure entière, taux de taxe en points de base. Devise unique par document, exposant connu (exemples XAF, EUR, USD), limite inférieure à `Number.MAX_SAFE_INTEGER` et contrôles d'overflow.

Règle V1 : prix hors taxe ; sous-total ligne = quantité × prix ; taxe ligne arrondie à l'unité mineure selon une politique half-up explicite ; total = somme des lignes et taxes arrondies. Pas de décimales binaires pour les montants, de remises/taxes composées, d'avoirs ou de quantités fractionnaires V1. L'utilisateur est informé que cette politique peut nécessiter adaptation fiscale.

Facture : vendeur, client, numéro, dates, devise, lignes, notes, conditions et champs légaux textuels libres bornés. Reçu : commerçant, numéro, instant/fuseau, lignes, devise et mode de paiement textuel ; jamais de numéro de carte complet.

### Étiquette

`title`, `subtitle?`, `reference?`, `lines[]`, `qrPayload?`, `logoAssetId?`. Une liste d'étiquettes peut alimenter une planche. La géométrie de planche est indépendante des données.

## 4. Limites initiales à coder

| Entrée / ressource | Limite V1 |
| --- | --- |
| JSON de données | 256 KiB UTF-8 ; profondeur maximum 8 |
| Chaîne générale | 2 000 caractères, limites plus strictes par champ |
| Nom/titre court | 120 caractères, capacité visuelle vérifiée séparément |
| QR payload | 512 octets UTF-8, rejet si densité incompatible avec taille |
| Images utilisateur | PNG/JPEG seulement ; 2 images, 5 MiB chacune, 16 Mpx chacune |
| Lignes facture/reçu | 200 ; reçu borné aussi par hauteur finale |
| Étiquettes par export | 100 |
| Taille coupe personnalisée | 20–420 mm par côté fixe, dans les limites du template |
| Reçu continu | largeur 58/80 mm, hauteur maximum 2 000 mm |
| Pages | 50 maximum |
| PDF final | 20 MiB maximum |
| Génération | timeout 15 s, worker arrêté puis reprise explicite |

Ces valeurs sont des budgets produit initiaux. Les modifier exige justification et tests ; aucune coupure automatique du contenu pour respecter une limite.

Valider l'en-tête, le décodage et les dimensions des images ; extension/MIME déclaré seuls insuffisants. Normaliser orientation EXIF, retirer les métadonnées lors d'un réencodage local. Refuser SVG/HTML/PDF importés et URL utilisateur (SSRF distant exclu par absence de serveur, mais exfiltration côté client toujours à prévenir). Les liens textuels HTTP(S)/mailto/tel ne sont pas des sources d'images et sont validés séparément.

## 5. Layout et débordement

Primitives nécessaires : DocumentFrame, PageFrame, Text/Heading, Stack/Row, Separator, Image, QRCode, FieldPair, Table/Row/Cell, KeepTogether, PageNumber. Éviter les composants universels avec dizaines de flags.

Les cadres fixes refusent le dépassement non résolu ; les documents en flux paginent. Ne pas entourer toute une facture de `wrap={false}`. Les en-têtes répétés ne recouvrent pas le contenu, les totaux/signatures restent ensemble quand possible, les pages vides finales sont détectées. Une ligne de tableau plus haute que la zone disponible doit être subdivisée de façon définie ou rejetée avec explication.

Pour les cadres fixes, les limites de caractères ne prouvent pas l'absence de débordement. Tester avec la vraie police et prévoir un préflight géométrique fondé sur la mesure de texte et l'inspection du résultat. Les fixtures adverses incluent caractères larges, URL sans espaces et lignes multiples.

L02 qualifie la hauteur automatique du reçu. Si elle échoue dans la version choisie, une mesure préalable déterministe avec la même police/layout est requise ; interdiction d'estimer la hauteur par nombre de caractères. Le dépassement de 2 000 mm retourne une erreur, pas un reçu tronqué.

## 6. Polices, QR et assets

Polices PDF statiques TTF/WOFF compatibles, graisses explicitement enregistrées, accents FR/EN vérifiés. Ne pas réutiliser aveuglément les WOFF2/variables du site. Base envisagée : Noto Sans et Noto Serif statiques sous licence vérifiée, limitée aux graisses utilisées. Aucun téléchargement de police depuis un CDN au rendu.

QR vectoriel, fond clair, modules foncés, zone calme au moins quatre modules ; vérifier par décodage d'une rasterisation du PDF final. Ne pas promettre qu'un QR arbitrairement long tient sur une petite carte ; rejeter avec message actionnable.

`AssetResolver` résout des IDs de manifest en buffers/URLs de même origine côté navigateur et chemins absolus vérifiés côté Node. Aucune lecture arbitraire de fichier depuis `data`. Hash et licence de chaque asset distribuable sont inventoriés.

## 7. Erreurs et révisions

Codes stables : `INVALID_DATA`, `UNSUPPORTED_FORMAT`, `UNSUPPORTED_GLYPH`, `ASSET_REJECTED`, `LAYOUT_OVERFLOW`, `QR_TOO_DENSE`, `LIMIT_EXCEEDED`, `RENDER_TIMEOUT`, `RENDER_FAILED`. Diagnostics sans données personnelles, stack réservée au développement.

Une révision identifie données, format, thème, locale, images et profil d'impression. Tous ces changements invalident le téléchargement précédent. Le dernier résultat valide peut rester affiché avec indication « aperçu précédent ». Après correction, l'erreur s'efface et la génération reprend ; les résultats de requêtes antérieures ne remplacent jamais la dernière.
