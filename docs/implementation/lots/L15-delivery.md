# L15 — CI finale et préparation du déploiement

Statut initial : **planned**. Branche : `ci/release-delivery`.

Dépendances : L14. Exigences : NFR-06, NFR-09, NFR-10.

## Lecture et entrée

Lire [le plan maître](../../../IMPLEMENTATION_PLAN.md) et [les règles agent](../../../AGENTS.md). Le lot précédent doit être vérifié selon le mode Git choisi. Références : [référence 1](../../RELEASE.md), [référence 2](../../TESTING.md), [référence 3](../../adr/0002-git-release.md).

## Périmètre et fichiers

Rendre les validations et la publication reproductibles, sans publier tant que les autorisations/destinations sont inconnues.

Fichiers/responsabilités cibles : .github/workflows, tooling/build, configuration hébergeur si autorisée, docs/RELEASE.md.

## Stories et commits dans l'ordre

### L15-S01 — `ci: gate releases with scoped checks and one build artifact`

- [ ] Finaliser quality/unit-tests/pdf-tests/consumer-tests/build/e2e-chromium et release-policy ; vérifier les chemins de dépendances partagées.
- [ ] Épingler actions, permissions et environnements ; un seul build consommé par E2E/deploy, SHA/manifest vérifiés.
- [ ] Tests lourds séparés, pas de validate:full relancé dans chaque job, aucun secret exposé aux forks.
- [ ] Documenter protections disponibles sans les prétendre actives si GitHub n'est pas configuré.

**Acceptation :** Le graphe CI explique quelle suite tourne et quel artefact sera déployé ; aucune preuve omise par filtre incorrect.

**Vérification ciblée :** Simulation des déclencheurs/commandes locales ; run CI réel seulement avec remote autorisé.

### L15-S02 — `build(site): prepare portable static deployment and registry caching`

- [ ] Configurer SITE_URL et assets du vrai build ; chemins profonds et MIME JSON/fonts/workers corrects.
- [ ] Cache distinct HTML/catalogue courant vs assets/version immuable, headers validés, preview non indexable.
- [ ] Créer commande/procédure de preview locale ; adapter hébergeur seulement après choix explicite.
- [ ] Vérifier registre depuis HTTP, pas seulement fichiers locaux ; placeholder de domaine interdit en release.

**Acceptation :** La version construite fonctionne derrière un serveur statique et ses commandes d'installation ciblent l'origine correcte.

**Vérification ciblée :** Smoke HTTP local ou preview autorisée : page profonde, PDF, worker, fonts, registre ; vérifier les headers de l'environnement réellement testé.

### L15-S03 — `docs(release): document publication approval and rollback procedure`

- [ ] Renseigner décisions encore nécessaires : auteur/licence, remote/visibilité, domaine/hébergeur et permission publication.
- [ ] Conserver procédure release/rollback de l'artefact, immutabilité des anciens items et matrice de compatibilité.
- [ ] Préparer checklist L16 et ressources disponibles, ne pas créer compte/domaine/tag en avance.

**Acceptation :** Le mainteneur peut identifier exactement ce qu'il doit autoriser ; tout le développement local est terminé indépendamment de ces décisions.

**Vérification ciblée :** Revue de procédure et test de restauration en preview si disponible ; aucun claim de rollback production avant première release.

## Critère de sortie

Pipeline prêt ; preview vérifiée si autorisée, sinon état local précis. L16 attend les autorisations réellement manquantes.

Compléter [l'état](../status.json) et créer `docs/qa/L15.md` depuis le [modèle](../templates/QA_REPORT.md). Indiquer les commits réels, contrôles effectués et éventuels écarts. Pas de suite supplémentaire sans risque distinct à couvrir.

## Hors périmètre

Pas d'achat, compte, push, merge, domaine ou package publié sans accord explicite.
