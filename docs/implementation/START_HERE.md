# Démarrer ou reprendre l'implémentation

## État actuel

L00 est vérifié localement. Le mainteneur demande désormais le setup public `Osiris-Balonga/docn-ui` avant le code applicatif : le prochain lot est [L00G](lots/L00G-github-governance.md), puis L01 après sa fusion autorisée. Le plan comprend 18 lots et 60 stories ; les IDs L01–L16 ne changent pas. Lire [GITHUB](../GITHUB.md), [status.json](status.json), [github.json](github.json) et la dernière preuve. Aucun hébergement ni choix de licence implicite.

## Instruction à donner à un agent

Reprise actuelle : dépôt public et Project configurés, PR [#9](https://github.com/Osiris-Balonga/docn-ui/pull/9) en revue. Lire [QA L00G](../qa/L00G.md) et l'[issue #2](https://github.com/Osiris-Balonga/docn-ui/issues/2). Attendre l'accord de fusion, vérifier celle-ci, enregistrer son SHA et passer le lot à merged avant L01. Ne pas refaire le bootstrap, recréer les issues ou pousser sur dev/main. Après fusion, mettre L01 Ready dans le Project et démarrer sa branche depuis origin/dev.

> Lis AGENTS.md, IMPLEMENTATION_PLAN.md et docs/implementation/status.json. Implémente le prochain lot admissible en suivant sa fiche, ses stories et ses commits. Garde shadcn/ui pour le site et les composants PDF séparés. Ajoute uniquement les tests justifiés par un risque non couvert, avec les commandes de périmètre de docs/TESTING.md. Vérifie le résultat, mets à jour l'état, le rapport QA, l'issue et le Status du Project à chaque transition, puis indique les commits et le prochain lot. Ne touche pas à paint-3d et ne publie rien sans autorisation.

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
