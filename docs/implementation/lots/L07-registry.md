# L07 — Registre et consommation hors monorepo

Statut initial : **planned**. Branche : `feat/shadcn-pdf-registry`.

Dépendances : L06. Exigences : FR-13, FR-14 ; NFR-03, NFR-06, NFR-08, NFR-09 ; G3.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../specs/REGISTRY.md), [référence 2](../../adr/0004-source-distribution.md), [référence 3](../../TESTING.md).

## Périmètre et fichiers

Prouver la distribution avec les cartes existantes avant de multiplier les templates. Le vrai CLI shadcn fait partie de la preuve.

Fichiers/responsabilités cibles : tooling/registry, tooling/assets, tests/consumers, source viewer, apps/www/public/r généré.

## Stories et commits dans l'ordre

### L07-S01 — `feat(registry): generate versioned items from document sources`

- [ ] Manifeste source unique, IDs docn-* et items des cartes ; schéma officiel local épinglé.
- [ ] Construire la fermeture de dépendances, cibler les sous-dossiers docn et réécrire les imports de manière bornée et testée.
- [ ] Valider cycles, chemins, doublons, aliases privés et sources manquantes ; sorties déterministes et ignorées.
- [ ] Version dev explicite ; pas de namespace/domaine prétendument réservé.

**Acceptation :** Tous les fichiers nécessaires sont présents, aucun import du site ou workspace n'est distribué.

**Vérification ciblée :** Unit graphe/transformation ciblé ; pnpm verify:registry. Pas de snapshot de milliers de lignes de JSON.

### L07-S02 — `feat(registry): distribute verified local assets and usage examples`

- [ ] Choisir le mécanisme supporté d'installation des fontes ; si récupérateur, code visible sans auto-exécution.
- [ ] Résoudre destination, hashes, licences et refus d'écrasement ; tests traversal/size limit dans la suite utilitaire existante.
- [ ] Fournir exemples browser et Node avec AssetResolver local et instructions exactes.

**Acceptation :** Après préparation des assets, le rendu n'exige plus le domaine docn-ui ; échec d'asset explicite.

**Vérification ciblée :** pnpm verify:assets ; unit récupérateur ciblé ; pas de téléchargement réseau dans unit.

### L07-S03 — `feat(code): expose complete source and installation instructions`

- [ ] Afficher depuis les mêmes sources la liste de fichiers, code colorisé et copie ; fallback si clipboard indisponible.
- [ ] Commande réelle pointant sur origine configurée/version ; local en dev, URL publique seulement après décision.
- [ ] Documenter prérequis shadcn, dépendances, assets, customisation et mises à jour sans overwrite automatique.

**Acceptation :** L'utilisateur accède au code complet et pas seulement au JSX de la page ; commande locale exécutable.

**Vérification ciblée :** Components source/copy ciblé ; vérifier lien entre source affichée et manifest.

### L07-S04 — `test(registry): install and render templates in isolated consumers`

- [ ] Activer test:consumers, lancer deux projets temporaires hors workspace avec vrai CLI épinglé.
- [ ] Installer une carte et sa fermeture ; exécuter rendu browser et Node avec assets locaux puis vérifier contenu/dimensions.
- [ ] Bloquer le domaine du registre après installation et prouver l'autonomie ; conserver logs expurgés et état d'installation.
- [ ] Ajouter consumer-tests conditionnel aux changements de distribution, obligatoire aux jalons ; vérifier commande all sans duplication.

**Acceptation :** G3 : aucun accès caché aux node_modules/aliases du monorepo ni au domaine docn-ui après installation.

**Vérification ciblée :** pnpm test:consumers ; pnpm verify:registry ; contrôle du PDF consommateur. Ne pas installer séparément les trois cartes partageant le même graphe.

## Critère de sortie

Distribution autonome qualifiée. Tout template ultérieur s'insère dans ce contrat ; ne pas repousser un défaut d'installation à la release.

Compléter [l'état](../status.json) et créer `docs/qa/L07.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas de publication npm, CLI propriétaire, namespace officiel ou écrasement automatique des fichiers utilisateur.
