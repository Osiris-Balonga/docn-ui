# ADR 0004 — Registre shadcn, pas de CLI propriétaire

Date : 2026-08-28. Statut : choix proposé, preuve exigée en L07.

## Décision

Les composants/templates PDF sont des sources copiées dans le projet utilisateur par le CLI shadcn. L'application et le registre dérivent du même code. Le package de workspace n'est pas une dépendance runtime distribuée.

## Conséquences

Le format officiel de registre est validé, les dépendances transverses sont qualifiées et les binaires ont un chemin d'installation explicite. Le consommateur garde ses modifications ; une mise à jour ne force pas leur écrasement.

Une URL JSON suffit ; aucun namespace officiel ni package npm `docn-ui` n'est supposé possédé. L'absence de nom de domaine ne bloque pas les essais sur un serveur local. Une installation réelle est testée avant d'ajouter toutes les familles.

## Alternative

Un package npm serait plus simple à mettre à jour mais moins proche de la propriété du code souhaitée. Une CLI dédiée dupliquerait résolution, installation et commandes ; ne l'envisager qu'après preuve d'une limite du CLI shadcn et accord sur son coût.
