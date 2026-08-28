# Preuves de validation

Rapports disponibles : [L00 — gouvernance locale](L00.md) et [L00G — GitHub et Project vérifiés](L00G.md). Aucun test applicatif exécuté à ce stade ; uniquement les contrôles ciblés de gouvernance.

Aucun rapport applicatif ne doit être déclaré réussi pendant la planification. Créer `Lxx.md` à partir du [modèle](../implementation/templates/QA_REPORT.md) lors de l'exécution du lot.

Commiter les synthèses légères, liens et décisions. Conserver PDF générés, captures et rapports complets dans `.artifacts/` ignoré ou comme artefacts CI. Ne pas inclure de données personnelles dans les fixtures ou captures.

Une reprise doit pouvoir déterminer le SHA testé, le périmètre réel et ce qui reste non vérifié sans relancer aveuglément toutes les suites.
