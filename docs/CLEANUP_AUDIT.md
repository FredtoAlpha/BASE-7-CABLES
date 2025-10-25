# Audit des fichiers inutilisés et centralisation de la documentation

## Résumé exécutif
Cette note recense les fichiers identifiés comme non utilisés dans l'état actuel du dépôt et propose une stratégie pour regrouper la documentation Markdown sur un périmètre maîtrisé. L'objectif est de préparer un nettoyage sans risquer la suppression de contenus encore utiles à l'équipe.

## Fichiers candidats à l'archivage
| Fichier | Type | Raison du classement comme inutilisé |
| --- | --- | --- |
| `CodesAlgorithm.html` | HTML (Apps Script) | N'inclut qu'un partiel `algorithms/Phase1/CodesAlgorithm` absent du dépôt, ce qui génère une erreur silencieuse lors du chargement côté client. |
| `OptionsAlgorithm.html` | HTML (Apps Script) | Wrapper identique pointant vers `algorithms/Phase1/OptionsAlgorithm`, alors qu'aucun dossier `algorithms/` n'est versionné. |
| `OptimizationAlgorithm.html` | HTML (Apps Script) | Contient uniquement l'inclusion `algorithms/Phase4/OptimizationAlgorithm`, inexistante dans le projet. |
| `ParityAlgorithm.html` | HTML (Apps Script) | Fait référence à `algorithms/Phase1/ParityAlgorithm` qui n'est pas fourni, empêchant l'initialisation des scripts de parité du pipeline LEGACY. |
| `TEST_MODULES.html` | HTML (banc de test) | Page autonome servant de laboratoire aux modules refactorisés (`InterfaceV2_*`). Elle n'est reliée à aucun menu ni orchestrateur et peut être déplacée hors du cœur applicatif. |

> **Recommandation** : déplacer ces fichiers dans un dossier `archive/` ou les supprimer après confirmation fonctionnelle. Leur présence actuelle entretient une dette technique car ils promettent des modules inexistants.

## Centraliser la documentation Markdown
Le dépôt contient plusieurs dizaines de notes `.md` (audits, hotfix, guides) à la racine. Pour réduire le bruit et accélérer la recherche :

1. **Créer une arborescence dédiée** (ex. `docs/`) contenant :
   - `docs/reference/` pour les guides encore d'actualité.
   - `docs/archive/` pour les comptes-rendus historiques.
   - `docs/checklists/` pour les procédures opérationnelles récurrentes.
2. **Ajouter un index** (`docs/README.md`) listant les documents essentiels et les archiver (lien + description). Cela facilite la découverte tout en laissant le contenu accessible.
3. **Migrer progressivement** chaque fichier Markdown depuis la racine vers la catégorie adaptée. Une fois le déplacement effectué, mettre à jour les liens internes éventuels.
4. **Mettre en place une revue périodique** (par exemple en fin de sprint) pour décider si un nouveau document reste en référence ou part en archive.

## Étapes recommandées
1. Valider auprès de l'équipe que les fichiers HTML ci-dessus ne sont plus invoqués depuis des scénarios externes (anciens liens, bookmarks).
2. Créer la structure de dossiers pour la documentation et rédiger l'index.
3. Déplacer les fichiers inutilisés dans `archive/` ou les supprimer, puis ajuster `appsscript.json` s'ils avaient été déclarés (ce n'est pas le cas actuellement).
4. Documenter dans le `README` principal la nouvelle politique de classement pour éviter toute régression organisationnelle.

Cette approche permet de clarifier rapidement le dépôt sans perte d'information et en conservant un historique structuré.
