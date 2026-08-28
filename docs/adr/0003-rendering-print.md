# ADR 0003 — Un PDF réel et des garanties bornées

Date : 2026-08-28. Statut : architecture proposée, faisabilité bloquante en L02.

## Décision

Générer localement un PDF avec React-pdf, puis afficher ces mêmes octets via PDF.js. L'export utilise le résultat final accepté de la même révision. Le navigateur ne transmet aucune donnée à un service de rendu.

Format, thème et composition sont distincts. Les supports à dimensions fixes refusent le débordement ; les documents en flux paginent. Les profils print décrivent coupe, fond perdu, zone sûre et marques ; les boîtes PDF sont testées indépendamment.

## Alternatives écartées pour V1

Capturer du HTML/canvas en image perdrait le texte et la fiabilité du document. Une génération Chromium serveur ajouterait une infrastructure et le transfert de données. Un moteur maison reporterait le travail sur pagination/polices. Ces alternatives ne sont pas interdites à vie ; un échec mesuré en L02 pourrait conduire à reconsidérer le moteur.

## Points à prouver

Worker avec build statique, polices statiques licenciées, recto/verso, tailles mm/pt, reçu de hauteur automatique, pagination, boîtes d'impression et reprise après timeout. Un post-traitement type `pdf-lib` est autorisé seulement s'il comble une capacité effectivement manquante, avec licence/version et tests adaptés.

## Limites de promesse

Pas de CMJN/PDF-X/PDF-UA ni de précision imprimante garantie. L'aperçu numérique n'est pas un soft proof colorimétrique. Les instructions utilisateur expliquent l'échelle 100 %, les réglages duplex et les zones imprimables du matériel.
