# Distribution du code

## Décision

Réutiliser le registre et le CLI shadcn. Ne pas créer `docn-cli` en V1. La commande complète réelle est générée depuis l'URL de registre configurée et la version du CLI qualifiée, jamais depuis un domaine supposé. L'usage par namespace dépend d'une configuration utilisateur ou d'un enregistrement approuvé ; le lien JSON direct suffit pour lancer le produit.

Le registre distribue des composants PDF, pas des composants UI du site. Aucun `Button`, DOM, CSS de site ou dépendance Next n'est requis par un template installé.

## Organisation

Un manifeste de sources référence `packages/documents/src`. Un générateur crée : catalogue, fichiers JSON par item, source affichable et manifest d'assets. Utiliser des IDs `docn-*` pour les briques afin de ne pas entrer en collision avec `text`, `table` ou les primitives shadcn.

Les éléments de template sont `registry:block` ; helpers `registry:lib`/`registry:component` selon le schéma officiel. Chaque fichier possède un type et, si requis, un `target` explicite. Cible : sous-dossier `docn` dans les aliases du projet consommateur, jamais remplacer les composants UI existants.

Dépendances entre éléments du même registre par URLs qualifiées et versionnées ou namespace configuré ; un nom nu peut viser le registre shadcn par défaut. Les imports internes sont réécrits par un mécanisme testé (AST ou transformation strictement bornée), pas un remplacement global aveugle de chaînes.

## Assets et autonomie

Les polices binaires ne doivent pas être glissées dans un champ JSON de code sans convention supportée. Distribuer un asset manifest versionné et un petit outil explicite de récupération, ou un mécanisme de packaging vérifié par L07. L'outil, s'il est nécessaire, fait partie du code visible installé ; pas de postinstall caché.

Contrat minimal du récupérateur : HTTPS vers l'origine configurée, tailles bornées, SHA-256 attendu, chemins relatifs autorisés sous un répertoire d'assets connu, refus de traversal/symlinks sortants, pas d'écrasement silencieux. En tests, serveur loopback autorisé explicitement. Les licences sont récupérées avec les assets. Il doit être possible de copier les fichiers manuellement.

Une fois installé et les assets locaux préparés, le rendu ne dépend plus du site docn-ui. L'exemple browser sert les polices de son `public` local ; l'exemple Node utilise son propre résolveur de chemins. L'échec de récupération ne doit pas produire un PDF dans une police de remplacement silencieuse.

## Validation et sécurité

- Valider le JSON avec une version locale du schéma officiel, mise à jour contrôlée ; aucune requête réseau nécessaire pour valider une PR.
- Résoudre le graphe : IDs uniques, dépendances existantes, pas de cycle, chemins admissibles, licences et versions.
- Inspecter la fermeture transitive des fichiers : aucun import `@docn/...`, `workspace:*`, `apps/www`, alias de build privé ou référence absolue à la machine auteur.
- Ne pas exécuter de scripts du registre pendant la génération. La commande shadcn est une installation de code source : l'utilisateur peut consulter les fichiers avant installation.
- Modification locale du consommateur : la procédure de mise à jour montre les diffs et n'emploie jamais `--overwrite` par défaut.
- Un changement incompatible produit une version majeure documentée. Ne pas remplacer le contenu d'un chemin `/r/v1.0.0/...` déjà publié.

## Versions et exemples de chemins

Chemins de contrat : `/r/registry.json` pour le catalogue courant et `/r/v1.0.0/<item>.json` pour les fichiers immuables après release. L'environnement local utilise une version de développement clairement nommée, pas `v1.0.0` avant publication. Les dépendances d'un item versionné pointent sur la même release.

Les domaines dans les exemples de documentation restent des placeholders non présentés comme commandes prêtes à copier avant configuration de `SITE_URL`. Les exemples locaux réellement exécutables utilisent l'origine du serveur de test.

## Preuve de consommation

Deux projets temporaires hors monorepo et sans résolution de ses node_modules : React/Vite et Node/TypeScript. Installer par le vrai CLI shadcn épinglé, pas par une copie maison qui masquerait un défaut du registre. Tester init/prérequis, installation transitive, assets locaux et rendu final.

Le contrôle statique parcourt tous les items. Les installations coûteuses utilisent un échantillon couvrant les graphes différents : carte, facture, planche. Ne pas réinstaller quinze fois la même fermeture de dépendances. Les tests sont déclenchés lorsque la distribution change et aux jalons G3/G5 ; les tests unitaires du formulaire ne doivent jamais lancer le CLI ou un téléchargement npm.
