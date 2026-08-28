# Démarrer ou reprendre l'implémentation

## État actuel

Démarrage local autorisé le 2026-08-28 ; L00 vérifié localement. `main` contient le commit documentaire initial `37d29f056bccb192edf30b889134d215b572968b` ; `dev` a été créée sur ce commit et reçoit la trace de validation. Aucun remote, code applicatif, test de produit exécuté ou service publié. Le plan comprend 17 lots et 56 stories, avec leurs commits prévus. Consulter [status.json](status.json) et le [rapport L00](../qa/L00.md) avant de reprendre ; le prochain lot est [L01](lots/L01-bootstrap.md), sur sa branche prévue à partir du HEAD vérifié de `dev`.

## Instruction à donner à un agent

> Lis AGENTS.md, IMPLEMENTATION_PLAN.md et docs/implementation/status.json. Implémente le prochain lot admissible en suivant sa fiche, ses stories et ses commits. Garde shadcn/ui pour le site et les composants PDF séparés. Ajoute uniquement les tests justifiés par un risque non couvert, avec les commandes de périmètre de docs/TESTING.md. Vérifie le résultat, mets à jour l'état et le rapport QA, puis indique les commits et le prochain lot. Ne touche pas à paint-3d et ne publie rien sans autorisation.

Pour demander plusieurs lots locaux d'un coup, préciser les IDs et autoriser explicitement leur enchaînement local. L'agent doit garder une séparation des commits/branches et des preuves. Cette documentation n'est pas, à elle seule, cette autorisation.

## Procédure initiale L00 (déjà exécutée)

1. Vérifier que le dossier actif est `docn-ui` et inspecter les fichiers/Git.
2. Lire les [règles](../../AGENTS.md) et le [plan](../../IMPLEMENTATION_PLAN.md).
3. Lire [status.json](status.json) : initialement tous les lots sont `planned`.
4. Ouvrir [L00](lots/L00-governance.md), puis ses références seulement.
5. Mettre L00 `in_progress` lorsque le travail est effectivement lancé ; créer ses commits sans inventer les résultats.
6. Rédiger `docs/qa/L00.md` avec le [modèle](templates/QA_REPORT.md), puis enregistrer le statut réellement atteint.

## Reprise après interruption

Comparer l'état JSON à Git et au dernier rapport. Si une story est partiellement écrite, examiner les changements avant de l'exécuter à nouveau. Ne pas supposer qu'une case cochée prouve un test. Reprendre la première acceptation manquante, pas tout le lot depuis zéro.

## Guide rapide des vérifications

Fonction pure → `test:unit`. Interaction UI → `test:components`. Coordination de modules → `test:integration`. Document réel → `test:pdf`. Code installé → `test:consumers`. Parcours navigateur → `test:e2e`. Régression visuelle choisie → `test:visual`.

Ces commandes seront activées au fil des lots : les exécuter aujourd'hui n'est pas possible, car aucun package applicatif n'est encore créé. Le [contrat complet](../TESTING.md) indique comment éviter la double collecte et quand une validation complète est justifiée.
