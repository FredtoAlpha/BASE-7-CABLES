# 📚 GUIDE COMPLET : Pipelines et Cas d'Usage Métiers

## Date : 21 octobre 2025, 22:07
## Version : 1.0

---

## 🎯 OBJECTIF DE CE GUIDE

Ce document clarifie **quand et comment utiliser** les différents pipelines d'optimisation, en s'appuyant sur des **cas d'usage métiers concrets** pour montrer la valeur immédiate de chaque approche.

---

## 📊 VUE D'ENSEMBLE : Deux Pipelines, Deux Usages

### Pipeline LEGACY (Menu Google Sheets)
- **Configuration** : `_STRUCTURE`
- **Source** : Onglets TEST/FIN/CACHE
- **Usage** : Optimisation ponctuelle, tests rapides
- **Interface** : Menu Google Sheets

### Pipeline OPTI (Interface V2)
- **Configuration** : `_OPTI_CONFIG`
- **Source** : `_BASEOPTI` (généré automatiquement)
- **Usage** : Optimisation complète, production
- **Interface** : InterfaceV2.html (web app)

---

## 🔧 COMPARAISON DÉTAILLÉE

| Critère | Pipeline LEGACY | Pipeline OPTI |
|---------|-----------------|---------------|
| **Feuille de config** | `_STRUCTURE` | `_OPTI_CONFIG` |
| **Source de données** | Onglets TEST/FIN/CACHE | `_BASEOPTI` |
| **Initialisation** | `optStream_init()` | `optStream_init_V2()` |
| **Quotas LV2/OPT** | Colonne OPTIONS dans `_STRUCTURE` | Colonnes dédiées dans `_OPTI_CONFIG` |
| **Effectifs cibles** | Colonne EFFECTIF dans `_STRUCTURE` | Colonne TARGET dans `_OPTI_CONFIG` |
| **Poids d'optimisation** | Codés en dur dans le script | Configurables dans `_OPTI_CONFIG` |
| **Tolérance parité** | Codée en dur (2) | Configurable dans `_OPTI_CONFIG` |
| **Max swaps** | Codé en dur (30) | Configurable dans `_OPTI_CONFIG` |
| **Interface** | Menu Google Sheets | Web app moderne (InterfaceV2.html) |
| **Logs** | Console Apps Script | Console navigateur + Apps Script |
| **Audit** | Basique | Complet (5 sections) |
| **Auto-save** | Non | Oui (toutes les 60s) |
| **Mode CACHE** | Manuel | Automatique après optimisation |
| **Mobilité** | Calculée | Calculée + préservée |

---

## 📋 `_STRUCTURE` vs `_OPTI_CONFIG` : Quand utiliser quoi ?

### `_STRUCTURE` (Pipeline LEGACY)

**Format** :
```
| CLASSE_DEST | EFFECTIF | OPTIONS           |
|-------------|----------|-------------------|
| 6°1         | 25       | ITA=6,CHAV=10     |
| 6°2         | 24       | ITA=5,CHAV=12     |
| 6°3         | 24       | ESP=24            |
```

**Avantages** :
- ✅ Simple et compact
- ✅ Facile à éditer manuellement
- ✅ Bon pour tests rapides

**Inconvénients** :
- ❌ Format texte (ITA=6,CHAV=10) difficile à parser
- ❌ Pas de configuration des poids d'optimisation
- ❌ Pas de configuration de la tolérance parité
- ❌ Pas de colonnes dédiées par option

**Quand l'utiliser** :
- Tests rapides via le menu Google Sheets
- Prototypage de nouvelles configurations
- Vérification manuelle des résultats

### `_OPTI_CONFIG` (Pipeline OPTI)

**Format** :
```
| CLASSE | TARGET | ITA | CHAV | ESP | ALL | POIDS_COM | POIDS_TRA | POIDS_PART | TOL_PARITE | MAX_SWAPS |
|--------|--------|-----|------|-----|-----|-----------|-----------|------------|------------|-----------|
| 6°1    | 25     | 6   | 10   | 0   | 0   | 2.5       | 1.5       | 1.0        | 2          | 50        |
| 6°2    | 24     | 5   | 12   | 0   | 0   | 2.5       | 1.5       | 1.0        | 2          | 50        |
| 6°3    | 24     | 0   | 0    | 24  | 0   | 2.5       | 1.5       | 1.0        | 2          | 50        |
```

**Avantages** :
- ✅ Colonnes dédiées par option (facile à lire/écrire)
- ✅ Configuration complète des poids d'optimisation
- ✅ Configuration de la tolérance parité
- ✅ Configuration du nombre max de swaps
- ✅ Validation automatique des quotas
- ✅ Intégration avec l'interface web

**Inconvénients** :
- ❌ Plus verbeux (plus de colonnes)
- ❌ Nécessite une interface pour éditer confortablement

**Quand l'utiliser** :
- Production (optimisation finale)
- Optimisation complète avec tous les critères
- Utilisation de l'interface web InterfaceV2.html
- Besoin de traçabilité et d'audit

---

## 🎭 CAS D'USAGE MÉTIERS ILLUSTRÉS

### 📖 Cas 1 : Premier test rapide (Pipeline LEGACY)

**Contexte** :
Marie, principale adjointe, vient de recevoir les listes d'élèves de 6ème. Elle veut **tester rapidement** si l'optimisation fonctionne avant de s'engager dans une configuration complète.

**Parcours utilisateur** :

1. **Préparation** (5 min)
   - Marie ouvre le fichier Google Sheets
   - Elle remplit `_STRUCTURE` avec les classes et quotas :
     ```
     6°1 | 25 | ITA=6,CHAV=10
     6°2 | 24 | ITA=5,CHAV=12
     6°3 | 24 | ESP=24
     ```
   - Elle copie les élèves dans les onglets `6°1TEST`, `6°2TEST`, `6°3TEST`

2. **Lancement** (1 clic)
   - Menu **Optimisation** → **Phase 1 : Options & LV2**
   - Attendre 10 secondes

3. **Résultat** (immédiat)
   - Les élèves avec ITA sont placés dans les classes qui offrent ITA
   - Les élèves avec CHAV sont placés dans les classes qui offrent CHAV
   - Les élèves sans option sont répartis équitablement

4. **Vérification** (2 min)
   - Marie ouvre les onglets TEST pour vérifier visuellement
   - Elle compte manuellement les élèves par classe

**Valeur immédiate** :
- ✅ Test rapide sans configuration complexe
- ✅ Validation du principe d'optimisation
- ✅ Pas besoin d'interface web

**Limites** :
- ❌ Pas d'audit automatique
- ❌ Pas de sauvegarde automatique
- ❌ Pas de traçabilité

---

### 📖 Cas 2 : Optimisation complète pour la rentrée (Pipeline OPTI)

**Contexte** :
Marie a validé le principe. Elle doit maintenant créer les **classes définitives** pour la rentrée, avec tous les critères (parité, scores, groupes, etc.).

**Parcours utilisateur** :

1. **Configuration** (15 min)
   - Marie ouvre l'interface web **InterfaceV2.html**
   - Elle clique sur **"Nouvelle optimisation"**
   - Elle remplit `_OPTI_CONFIG` via l'interface :
     - Classes : 6°1, 6°2, 6°3, 6°4, 6°5
     - Effectifs cibles : 25, 24, 24, 24, 24
     - Quotas ITA : 6, 5, 0, 0, 0
     - Quotas CHAV : 10, 12, 0, 0, 0
     - Poids COM : 2.5 (important)
     - Poids TRA : 1.5 (moyen)
     - Poids PART : 1.0 (faible)
     - Tolérance parité : 2 élèves
     - Max swaps : 50

2. **Import des données** (5 min)
   - Marie importe les élèves depuis un fichier CSV
   - L'interface valide automatiquement les données
   - Les scores COM/TRA/PART/ABS sont calculés automatiquement

3. **Lancement de l'optimisation** (1 clic)
   - Marie clique sur **"Lancer l'optimisation"**
   - L'interface affiche la progression en temps réel :
     ```
     📌 Phase 1/4 — Options & LV2…
     ✅ Phase 1: ITA=11, CHAV=22
     📌 Phase 2/4 — Codes DISSO/ASSO…
     ✅ Phase 2: 7 DISSO, 16 ASSO
     📌 Phase 3/4 — Effectifs & Parité…
     ✅ Phase 3: 121 élèves placés
     📌 Phase 4/4 — Swaps COM/TRA/PART/ABS…
     ✅ Phase 4: 50 swaps appliqués
     ```

4. **Résultats** (automatique)
   - Les onglets CACHE s'ouvrent automatiquement
   - L'interface affiche le rapport d'audit complet :
     ```
     📋 RÉPARTITION PAR CLASSE
     6°1 : 25 élèves (13F / 12M = 52.0% F)
     6°2 : 24 élèves (12F / 12M = 50.0% F)
     ...
     
     📊 RESPECT DES QUOTAS
     ✅ ITA : 11 / 11 (quota respecté)
     ✅ CHAV : 22 / 22 (quota respecté)
     
     🔗 CODES ASSO/DISSO
     ✅ A2 : 5 élèves → 6°1(5) (groupe intact)
     ✅ D1 : 2 élèves → 6°1(1), 6°2(1) (séparés)
     
     📈 MÉTRIQUES DE QUALITÉ
     Amélioration variance : 21.2%
     ```

5. **Validation** (5 min)
   - Marie clique sur **"Appliquer"**
   - Les onglets CACHE sont sauvegardés automatiquement
   - Le badge affiche **"MODE CACHE"**
   - Marie peut modifier manuellement quelques élèves si besoin
   - L'auto-save sauvegarde automatiquement toutes les 60 secondes

6. **Export** (1 clic)
   - Marie clique sur **"Exporter en PDF"**
   - Elle obtient les listes de classes prêtes à imprimer

**Valeur immédiate** :
- ✅ Optimisation complète avec tous les critères
- ✅ Audit automatique et détaillé
- ✅ Sauvegarde automatique (pas de perte de données)
- ✅ Traçabilité complète (logs, rapport, export)
- ✅ Interface moderne et intuitive
- ✅ Gain de temps : 2h → 30 min

**Avantages par rapport au Pipeline LEGACY** :
- ✅ Configuration centralisée dans `_OPTI_CONFIG`
- ✅ Poids d'optimisation ajustables
- ✅ Tolérance parité configurable
- ✅ Audit complet automatique
- ✅ Pas de manipulation manuelle des onglets

---

### 📖 Cas 3 : Ajustements après optimisation (Pipeline OPTI)

**Contexte** :
Marie a lancé l'optimisation complète. Elle remarque que **deux élèves** doivent être échangés pour des raisons pédagogiques non prises en compte par l'algorithme.

**Parcours utilisateur** :

1. **Modification manuelle** (2 min)
   - Marie ouvre l'interface web
   - Elle est déjà en mode CACHE (badge orange)
   - Elle glisse-dépose l'élève A de 6°1 vers 6°2
   - Elle glisse-dépose l'élève B de 6°2 vers 6°1
   - L'interface recalcule automatiquement les métriques

2. **Sauvegarde automatique** (automatique)
   - Après 60 secondes, l'auto-save sauvegarde les modifications
   - Message : **"💾 Auto-save: 5 classes sauvegardées"**
   - Les colonnes FIXE/MOBILITE sont préservées

3. **Vérification** (1 min)
   - Marie vérifie que les métriques sont toujours bonnes
   - Parité : toujours équilibrée
   - Quotas : toujours respectés

**Valeur immédiate** :
- ✅ Modifications manuelles possibles
- ✅ Sauvegarde automatique (pas de perte)
- ✅ Métriques recalculées en temps réel
- ✅ Contraintes préservées (FIXE/MOBILITE)

---

### 📖 Cas 4 : Comparaison de plusieurs scénarios (Pipeline OPTI)

**Contexte** :
Marie hésite entre deux stratégies :
- **Scénario A** : Privilégier l'équilibre des scores COM (poids 3.0)
- **Scénario B** : Privilégier la parité F/M (tolérance 1)

**Parcours utilisateur** :

1. **Scénario A** (10 min)
   - Marie configure `_OPTI_CONFIG` avec POIDS_COM=3.0
   - Elle lance l'optimisation
   - Elle exporte le rapport d'audit en JSON
   - Elle note : Variance COM=2.1, Parité écart-type=3.2

2. **Scénario B** (10 min)
   - Marie modifie `_OPTI_CONFIG` avec POIDS_COM=2.5, TOL_PARITE=1
   - Elle lance l'optimisation
   - Elle exporte le rapport d'audit en JSON
   - Elle note : Variance COM=2.8, Parité écart-type=1.5

3. **Comparaison** (5 min)
   - Marie compare les deux rapports JSON
   - Elle décide que le Scénario B est meilleur
   - Elle applique les résultats du Scénario B

**Valeur immédiate** :
- ✅ Comparaison objective de plusieurs scénarios
- ✅ Exports JSON pour analyse
- ✅ Décision éclairée basée sur des métriques

---

### 📖 Cas 5 : Optimisation multi-niveaux (Pipeline OPTI)

**Contexte** :
Marie doit optimiser **3 niveaux** (6ème, 5ème, 4ème) en même temps, avec des contraintes différentes pour chaque niveau.

**Parcours utilisateur** :

1. **Configuration par niveau** (30 min)
   - Marie crée 3 configurations dans `_OPTI_CONFIG` :
     - 6ème : 5 classes, ITA/CHAV, poids COM=2.5
     - 5ème : 4 classes, ALL/ESP, poids TRA=2.5
     - 4ème : 4 classes, LAT/GRE, poids PART=2.5

2. **Lancement séquentiel** (3 clics)
   - Marie lance l'optimisation pour la 6ème
   - Elle attend la fin et applique les résultats
   - Elle lance l'optimisation pour la 5ème
   - Elle attend la fin et applique les résultats
   - Elle lance l'optimisation pour la 4ème
   - Elle attend la fin et applique les résultats

3. **Audit global** (5 min)
   - Marie exporte les 3 rapports d'audit
   - Elle vérifie que tous les quotas sont respectés
   - Elle vérifie que toutes les parités sont équilibrées

**Valeur immédiate** :
- ✅ Optimisation multi-niveaux possible
- ✅ Configurations différentes par niveau
- ✅ Audit global pour validation

---

## 🔀 MIGRATION : De LEGACY vers OPTI

### Pourquoi migrer ?

Si vous utilisez actuellement le Pipeline LEGACY et que vous rencontrez ces problèmes :
- ❌ Pas d'audit automatique
- ❌ Pas de sauvegarde automatique
- ❌ Pas de traçabilité
- ❌ Manipulation manuelle des onglets
- ❌ Poids d'optimisation codés en dur

**→ Il est temps de migrer vers le Pipeline OPTI !**

### Comment migrer ?

**Étape 1 : Créer `_OPTI_CONFIG`** (10 min)

1. Créer un nouvel onglet nommé `_OPTI_CONFIG`
2. Copier les en-têtes :
   ```
   CLASSE | TARGET | ITA | CHAV | ESP | ALL | POIDS_COM | POIDS_TRA | POIDS_PART | TOL_PARITE | MAX_SWAPS
   ```
3. Remplir les données depuis `_STRUCTURE` :
   - CLASSE → CLASSE_DEST
   - TARGET → EFFECTIF
   - ITA/CHAV/ESP/ALL → Parser la colonne OPTIONS
   - POIDS_* → Valeurs par défaut (2.5, 1.5, 1.0)
   - TOL_PARITE → 2
   - MAX_SWAPS → 50

**Étape 2 : Tester** (5 min)

1. Ouvrir l'interface web **InterfaceV2.html**
2. Lancer une optimisation de test
3. Vérifier que les résultats sont cohérents

**Étape 3 : Basculer** (1 min)

1. Utiliser uniquement l'interface web pour les optimisations
2. Garder `_STRUCTURE` pour référence (mais ne plus l'utiliser)

---

## 📊 TABLEAU DE DÉCISION

| Situation | Pipeline recommandé | Raison |
|-----------|---------------------|--------|
| Premier test rapide | LEGACY | Simple, pas de configuration complexe |
| Optimisation de production | OPTI | Audit complet, sauvegarde auto, traçabilité |
| Comparaison de scénarios | OPTI | Exports JSON, métriques détaillées |
| Optimisation multi-niveaux | OPTI | Configuration par niveau |
| Ajustements manuels fréquents | OPTI | Auto-save, préservation des contraintes |
| Besoin d'audit détaillé | OPTI | Rapport complet (5 sections) |
| Besoin de traçabilité | OPTI | Logs complets, exports |
| Utilisation par non-techniciens | OPTI | Interface web intuitive |

---

## 🎓 BONNES PRATIQUES

### Pour le Pipeline LEGACY

1. ✅ Utiliser pour les **tests rapides** uniquement
2. ✅ Toujours vérifier manuellement les résultats
3. ✅ Ne pas utiliser pour la production
4. ✅ Migrer vers OPTI dès que possible

### Pour le Pipeline OPTI

1. ✅ Toujours remplir `_OPTI_CONFIG` complètement
2. ✅ Tester avec un petit échantillon avant la production
3. ✅ Exporter le rapport d'audit après chaque optimisation
4. ✅ Utiliser l'auto-save (ne pas désactiver)
5. ✅ Cliquer sur "Appliquer" après chaque optimisation
6. ✅ Vérifier le badge de mode (doit être "MODE CACHE")
7. ✅ Archiver les rapports d'audit pour historique

---

## 🚀 RÉCAPITULATIF

### Pipeline LEGACY (Menu Google Sheets)
- **Quand** : Tests rapides, prototypage
- **Config** : `_STRUCTURE` (format texte)
- **Interface** : Menu Google Sheets
- **Audit** : Basique
- **Sauvegarde** : Manuelle

### Pipeline OPTI (Interface V2)
- **Quand** : Production, optimisation complète
- **Config** : `_OPTI_CONFIG` (colonnes dédiées)
- **Interface** : Web app moderne
- **Audit** : Complet (5 sections)
- **Sauvegarde** : Automatique (60s)

### Recommandation générale

**Utilisez le Pipeline OPTI pour tout ce qui est important.**

Le Pipeline LEGACY est conservé pour la compatibilité et les tests rapides, mais le Pipeline OPTI offre une expérience utilisateur supérieure et une fiabilité accrue.

---

## 📚 DOCUMENTS ASSOCIÉS

- `CORRECTION_MOBILITE_CACHE.md` : Préservation des colonnes FIXE/MOBILITE
- `FINALISATION_PHASE4_AUDITS.md` : Audits étendus de fin d'optimisation
- `CORRECTION_FINALE_CACHE_NAVIGATEUR.md` : Gestion du cache navigateur
- `CORRECTION_BADGE_MODE.md` : Affichage du mode CACHE

---

## ✅ CONCLUSION

Ce guide vous permet de choisir le bon pipeline selon votre situation. En règle générale :

- **Tests rapides** → Pipeline LEGACY
- **Production** → Pipeline OPTI

Le Pipeline OPTI offre une **valeur immédiate** grâce à :
- ✅ Interface moderne et intuitive
- ✅ Audit complet automatique
- ✅ Sauvegarde automatique
- ✅ Traçabilité complète
- ✅ Gain de temps significatif

**Migrez vers le Pipeline OPTI dès que possible pour bénéficier de tous ces avantages !** 🚀
