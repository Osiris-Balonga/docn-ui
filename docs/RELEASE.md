# Git, CI et livraison

Plan de procédure ; aucun hébergement, remote ou workflow n'est encore configuré. Voir [ADR 0002](adr/0002-git-release.md).

## Commits et revue

Une branche par lot, moins de responsabilités possible par commit. Les lockfiles et composants shadcn générés peuvent être volumineux ; isoler ces changements des comportements métier. La fiche de lot fixe les commits, pas un quota de lignes.

À la fin d'un lot, joindre les preuves ciblées, la liste des exigences satisfaites, les limites et tout changement d'ADR. Pas de merge sans accord. Pas de commit de rapports HTML/PDF générés, secrets ou assets non licenciés.

## CI progressive

L01 : `quality`, `unit-tests`, `build`. Le job historique `unit-tests` peut garder ce nom, mais son contenu documenté couvre unit/components/integration une seule fois. L02 ajoute `pdf-tests`, L07 `consumer-tests`, L06 un premier `e2e-chromium`. Étendre la couverture de ces jobs sans multiplier des suites miroir.

L15 rend les exigences finales explicites :

- `quality` : format/lint/types.
- `unit-tests` : trois projets légers, avec couverture diagnostique en une exécution.
- `pdf-tests` : suite PDF réelle et références visuelles sélectionnées, sorties partagées.
- `consumer-tests` : installations externes sur changements de distribution ; obligatoire sur release.
- `build` : build statique, manifest/hashes/assets ; une fois par candidat.
- `e2e-chromium` : dépend du build, télécharge et vérifie le même artefact, ne reconstruit pas.
- `release-policy` : seulement pour la promotion `dev -> main`, SHA candidat et autorisation vérifiés.

Permissions minimales `contents: read`, actions de provenance vérifiée épinglées, pas de secrets sur PR de fork. Annuler les runs supplantés d'une PR. Tests lourds séquentiels sur petits runners, pas de relance automatique qui masque la flakiness. Maintenir des noms stables pour les protections ; ne pas exiger un check qui n'a jamais tourné.

Les filtres de chemins peuvent éviter consumer/PDF/browser pour de la documentation de planification seule. Ils doivent être testés pour les dépendances partagées : lockfile, fonts, moteur ou registry imposent les contrôles concernés. Une release n'emploie pas ces exemptions.

## Hébergement

Par défaut technique : build statique portable (`apps/www/out`). L'hébergeur reste à confirmer ; Vercel, serveur statique ou autre sont possibles. Ne pas configurer de fournisseur uniquement parce qu'un plugin est disponible.

L15 prévoit une preview si la destination est autorisée, sinon une procédure et une validation HTTP locale clairement marquée. `SITE_URL` contrôle canonical, sitemap et registre ; le build release refuse une URL placeholder. Les previews ne sont pas indexées.

Cache long pour assets hashés et registre versionné immuable ; HTML/catalogue courant revalidables. Les JSON de registre/archives publiques nécessaires à un consommateur sont accessibles sans session ; CORS configuré si nécessaire pour les usages documentés, pas une autorisation générale d'exfiltration.

Headers : MIME corrects, `nosniff`, Referrer-Policy, CSP dérivée du build réel, worker-src et font-src locaux. Les besoins `blob:` et scripts inline Next sont mesurés, pas supprimés par un `unsafe-*` global par facilité. Les headers d'un export statique sont appliqués par l'hébergeur. TLS obligatoire pour la publication.

## Licence et attribution

Proposer une licence permissive pour le code uniquement après confirmation de l'auteur ; ne pas attribuer un nom depuis la machine Windows. Chaque police/image/dépendance a sa provenance et sa licence. Pas de copie du code ou des assets PDFx pendant cette planification. Toute réutilisation future respecte sa licence et conserve les mentions requises.

## Release v1.0.0

1. Tous les lots précédents vérifiés et intégrés, preuve du SHA candidat.
2. QA fonctionnelle/visuelle et limites documentées ; aucun résultat matériel inventé.
3. Licence, identité, remote, URL et autorisation de publication confirmés.
4. Branche release depuis `dev` ; version du catalogue/registre et changelog cohérents. Aucune publication npm nécessaire en V1.
5. Validation complète et preview du candidat exact ; régler les défauts avec commits séparés et relancer uniquement les preuves invalidées, plus la validation finale du SHA retenu.
6. Promotion autorisée `dev -> main`, conservation du lien de filiation du candidat et déploiement de l'artefact qualifié.
7. Vérifier le public : liens profonds, source, workers, polices, téléchargement, registre et une installation depuis l'URL publique.
8. Tag annoté et release sur `main` uniquement après confirmation ; enregistrer tag/SHA/URL, contrôles et limitations.

## Rollback

Garder un manifeste et l'artefact du déploiement précédent. Restaurer la version de site et son catalogue courant, sans réécrire les items de registre déjà publiés. Une correction incompatible crée une nouvelle version. Une première release sans précédent documente retrait/maintenance et test de restauration sur preview ; ne pas prétendre avoir testé un rollback de production inexistant.
