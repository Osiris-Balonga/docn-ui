# Risques et décisions à confirmer

## Risques techniques

| ID | Risque | Prévention / décision de sortie | Lot |
| --- | --- | --- | --- |
| R01 | Worker React-pdf incompatible avec bundler/export | spike sur vrai build ; adapter bundling ou ADR, pas fallback serveur implicite | L02 |
| R02 | Polices variables/WOFF2 ou glyphes manquants | polices statiques autorisées, corpus FR/EN ; erreur explicite | L02/L04 |
| R03 | Hauteur automatique reçu incorrecte | mesure/rendu réel, taille bornée, pas estimation par caractères | L02/L09 |
| R04 | Dimensions/boîtes d'impression fausses | lecteur PDF indépendant et feuille test ; claims limités | L02/L14 |
| R05 | Aperçu différent du téléchargement | résultat immutable par révision ; buffer viewer copié | L05/L06 |
| R06 | Code installé dépend du monorepo | consumer hors workspace très tôt, graphe/aliases contrôlés | L07 |
| R07 | Assets distants nécessaires après installation | récupérateur explicite, licences/hashes, test sans domaine docn-ui | L07 |
| R08 | Tests exponentiels et lents | scopes exclusifs, échantillonnage par risque, mesures des temps | L01/L14 |
| R09 | UI figée ou mémoire en hausse | file de rendu bornée, timeout, pages virtualisées, cleanup | L06/L13 |
| R10 | Données personnelles dans URL/logs | mémoire locale, messages expurgés, interception réseau | L06/L13 |
| R11 | QR illisible après réduction | taille module/zone calme, décodage du PDF rasterisé | L08 |
| R12 | Facture interprétée comme système comptable certifié | règles de calcul explicites, disclaimer, pas de conformité affirmée | L11/L12 |
| R13 | Catalogue esthétique mais peu distinct | revue des compositions, critère de différence de structure | L05–L11 |
| R14 | Workflow de branche non bloquant ou falsifiable par la PR | base de confiance, required check réel, repo ID et tests de refus | L00G |
| R15 | Historique perdu ou workflow solo bloqué | merge commits ; pas de quota reviewer non disponible ni bypass | L00G |
| R16 | Backlog divergent ou issues dupliquées | Status unique, marqueurs/IDs stables et relecture après mutation | L00G puis tous |

## Hypothèses non bloquantes pour démarrer localement

Site anglais ; templates FR/EN ; Base UI ; Next.js statique ; trois thèmes ; quinze compositions ; pas de backend. Modifier avant le lot concerné via ADR, pas en douce dans l'implémentation.

## Informations externes requises avant publication

Destination Git publique confirmée : `Osiris-Balonga/docn-ui`. Setup GitHub demandé avant L01 ; l'absence d'accès ne permet plus de sauter cette étape. Auteur/licence, URL du site, hébergeur et autorisation de fusion/livraison restent distincts. Les noter dans `status.json.externalDecisions`, sans déduire une licence de la seule visibilité publique.

## Capacité de reprise

Un problème technique ne justifie pas de supprimer un template demandé. Isoler un résultat de spike, proposer une alternative avec coût et limite. Une validation matérielle indisponible devient une limitation explicite ; une promesse de précision d'impression ne peut pas être conservée sans preuve correspondante.
