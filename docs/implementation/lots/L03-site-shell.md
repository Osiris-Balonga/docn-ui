# L03 — Interface shadcn et navigation

Statut initial : **planned**. Branche : `feat/shadcn-site-shell`.

Dépendances : L02. Exigences : NFR-02 ; socle FR-01, FR-02, FR-15.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../../DESIGN.md), [référence 2](../../TESTING.md).

## Périmètre et fichiers

Une coque crédible de documentation, responsive, avec identité docn-ui. Les pages de contenu arriveront dans leurs lots ; aucun bouton non fonctionnel présenté comme disponible.

Fichiers/responsabilités cibles : apps/www/src/app, components/ui, features/docs, styles, navigation.

## Stories et commits dans l'ordre

### L03-S01 — `feat(ui): establish docn-ui tokens and accessible navigation`

- [ ] Fixer palette neutre, tailles, rayons, focus, polices locales et modes clair/sombre/system selon DESIGN.
- [ ] Composer en-tête, navigation latérale et Sheet mobile avec primitives shadcn ; ajouter skip link et repères sémantiques.
- [ ] N'ajouter que les routes prêtes ; homepage concise avec statut de développement si catalogue incomplet.

**Acceptation :** Navigation et thème fonctionnent au clavier, pas de saut de contenu ou de contraste illisible entre modes.

**Vérification ciblée :** Inspection responsive ciblée et un test de composition navigation/focus, pas de tests unitaires des primitives.

### L03-S02 — `feat(docs): add searchable navigation and content layouts`

- [ ] Créer index léger de pages connues, palette Command/Dialog et raccourci Ctrl/Cmd+K.
- [ ] Restaurer le focus à fermeture ; gérer aucune correspondance, éviter raccourci qui intercepte la saisie métier.
- [ ] Ajouter layout de lecture/code et fil d'Ariane ; installer seulement les composants shadcn utilisés.

**Acceptation :** Rechercher une page connue puis ouvrir/fermer au clavier fonctionne ; index sans import du moteur PDF.

**Vérification ciblée :** pnpm test:components navigation ; inspection du graphe de bundle sur route de docs.

### L03-S03 — `test(ui): verify shell keyboard flow and responsive states`

- [ ] Consolider les contrôles dans la suite navigation existante ; ajouter axe sur la coque et état Sheet ouvert si risque non couvert.
- [ ] Capturer les quatre viewports du DESIGN en clair/sombre représentatifs ; vérifier zoom 200 % et réduction de mouvement manuellement.
- [ ] Noter les défauts résolus et captures réelles ; ne pas créer un snapshot pour chaque composant.

**Acceptation :** Coque utilisable à 375 px, sans débordement global, focus visible et ordre logique.

**Vérification ciblée :** pnpm test:components navigation ; contrôles visuels ciblés ; pnpm validate.

## Critère de sortie

La coque est prête à recevoir les fiches réelles. Les screenshots ne se substituent pas à la navigation fonctionnelle.

Compléter [l'état](../status.json) et créer `docs/qa/L03.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de fausse grille de quinze templates, compte utilisateur ou tableaux de bord.
