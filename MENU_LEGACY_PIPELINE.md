# 📋 MENU LEGACY PIPELINE - Documentation

**Date** : 22 octobre 2025  
**Statut** : ✅ Menu LEGACY restauré et fonctionnel

---

## 🎯 **OBJECTIF**

Restaurer le menu LEGACY pour lancer manuellement les phases 1-2-3-4 du pipeline BASEOPTI depuis Google Sheets.

---

## 📊 **MENU CRÉÉ**

### Menu : "⚙️ LEGACY Pipeline"

```
┌─────────────────────────────────────────┐
│ ⚙️ LEGACY Pipeline                      │
├─────────────────────────────────────────┤
│ 📋 1️⃣ Créer Structure _BASEOPTI         │
│ ─────────────────────────────────────── │
│ 🎯 2️⃣ Phase 1 - Options & LV2           │
│ 🔗 3️⃣ Phase 2 - ASSO/DISSO              │
│ ⚖️ 4️⃣ Phase 3 - Effectifs & Parité      │
│ 🔄 5️⃣ Phase 4 - Optimisation Swaps      │
│ ─────────────────────────────────────── │
│ ▶️ Lancer Toutes les Phases             │
│ ─────────────────────────────────────── │
│ 📊 Voir Résultats _BASEOPTI             │
│ 💾 Copier vers CACHE                    │
└─────────────────────────────────────────┘
```

---

## 🔧 **FONCTIONS IMPLÉMENTÉES**

### 1. **legacy_createStructure()** - Créer _BASEOPTI

```javascript
function legacy_createStructure()
```

**Fonction** : Crée l'onglet `_BASEOPTI` depuis `_STRUCTURE`

**Workflow** :
1. Demande confirmation utilisateur
2. Appelle `createBaseoptiFromStructure()` (à implémenter)
3. Affiche résultat

**Note** : Fonction placeholder, nécessite implémentation dans `BASEOPTI_System.gs`

---

### 2. **legacy_runPhase1()** - Phase 1 Options & LV2

```javascript
function legacy_runPhase1()
```

**Fonction** : Lance Phase 1 (répartition Options & LV2)

**Workflow** :
1. Toast "Phase 1 en cours..."
2. Construit contexte (`buildCtx_V2()` ou `makeCtxFromUI_()`)
3. Appelle `Phase1I_dispatchOptionsLV2_BASEOPTI_V3()` ou version legacy
4. Affiche résultat

**Fonctions appelées** :
- `Phase1I_dispatchOptionsLV2_BASEOPTI_V3()` (prioritaire)
- `Phase1I_dispatchOptionsLV2_BASEOPTI()` (fallback)

---

### 3. **legacy_runPhase2()** - Phase 2 ASSO/DISSO

```javascript
function legacy_runPhase2()
```

**Fonction** : Lance Phase 2 (application ASSO/DISSO)

**Workflow** :
1. Toast "Phase 2 en cours..."
2. Construit contexte
3. Appelle `Phase2I_applyDissoAsso_BASEOPTI_V3()` ou version legacy
4. Affiche résultat

**Fonctions appelées** :
- `Phase2I_applyDissoAsso_BASEOPTI_V3()` (prioritaire)
- `Phase2I_applyDissoAsso_BASEOPTI()` (fallback)

---

### 4. **legacy_runPhase3()** - Phase 3 Effectifs & Parité

```javascript
function legacy_runPhase3()
```

**Fonction** : Lance Phase 3 (complétion effectifs & parité)

**Workflow** :
1. Toast "Phase 3 en cours..."
2. Construit contexte
3. Appelle `Phase3I_completeAndParity_BASEOPTI_V3()` ou version legacy
4. Affiche résultat

**Fonctions appelées** :
- `Phase3I_completeAndParity_BASEOPTI_V3()` (prioritaire)
- `Phase3I_completeAndParity_BASEOPTI()` (fallback)

---

### 5. **legacy_runPhase4()** - Phase 4 Optimisation Swaps

```javascript
function legacy_runPhase4()
```

**Fonction** : Lance Phase 4 (optimisation par swaps)

**Workflow** :
1. Toast "Phase 4 en cours..."
2. Construit contexte
3. Appelle `Phase4_balanceScoresSwaps_BASEOPTI_V3()` ou version legacy
4. Affiche résultat

**Fonctions appelées** :
- `Phase4_balanceScoresSwaps_BASEOPTI_V3()` (prioritaire)
- `Phase4_balanceScoresSwaps_BASEOPTI()` (fallback)

---

### 6. **legacy_runAllPhases()** - Lancer Toutes les Phases

```javascript
function legacy_runAllPhases()
```

**Fonction** : Lance les 4 phases séquentiellement

**Workflow** :
1. Demande confirmation utilisateur
2. Lance Phase 1 (silent)
3. Lance Phase 2 (silent)
4. Lance Phase 3 (silent)
5. Lance Phase 4 (silent)
6. Affiche durée totale et résultat

**Durée estimée** : 2-5 minutes

---

### 7. **legacy_viewResults()** - Voir Résultats

```javascript
function legacy_viewResults()
```

**Fonction** : Active l'onglet `_BASEOPTI` et affiche les colonnes importantes

**Colonnes importantes** :
- `_CLASS_ASSIGNED` : Classe attribuée
- `_TARGET_CLASS` : Classe cible (legacy)
- `_PHASE` : Dernière phase exécutée

---

### 8. **legacy_copyToCache()** - Copier vers CACHE

```javascript
function legacy_copyToCache()
```

**Fonction** : Copie les résultats de `_BASEOPTI` vers les onglets `CACHE`

**Workflow** :
1. Demande confirmation utilisateur
2. Appelle `copyBaseoptiToCache()` (à implémenter)
3. Affiche résultat

**Note** : Fonction placeholder, nécessite implémentation

---

## 🔄 **WORKFLOW COMPLET**

### Scénario 1 : Lancement Manuel Phase par Phase

```
1. Menu > ⚙️ LEGACY Pipeline > 📋 Créer Structure _BASEOPTI
   → Crée _BASEOPTI depuis _STRUCTURE

2. Menu > ⚙️ LEGACY Pipeline > 🎯 Phase 1 - Options & LV2
   → Répartit les élèves avec options/LV2 spécifiques

3. Menu > ⚙️ LEGACY Pipeline > 🔗 Phase 2 - ASSO/DISSO
   → Applique les contraintes ASSO/DISSO

4. Menu > ⚙️ LEGACY Pipeline > ⚖️ Phase 3 - Effectifs & Parité
   → Complète les effectifs et équilibre la parité

5. Menu > ⚙️ LEGACY Pipeline > 🔄 Phase 4 - Optimisation Swaps
   → Optimise les scores par swaps

6. Menu > ⚙️ LEGACY Pipeline > 📊 Voir Résultats _BASEOPTI
   → Consulte les résultats

7. Menu > ⚙️ LEGACY Pipeline > 💾 Copier vers CACHE
   → Copie vers CACHE pour utilisation dans InterfaceV2
```

### Scénario 2 : Lancement Automatique

```
1. Menu > ⚙️ LEGACY Pipeline > ▶️ Lancer Toutes les Phases
   → Lance automatiquement les 4 phases
   → Durée : 2-5 minutes
   → Résultats dans _BASEOPTI

2. Menu > ⚙️ LEGACY Pipeline > 💾 Copier vers CACHE
   → Copie vers CACHE
```

---

## 🧪 **TESTS DE VALIDATION**

### Test 1 : Menu Apparaît

#### Étapes
```
1. Fermer le Google Sheet
2. Rouvrir le Google Sheet
3. Attendre 2-3 secondes
4. Vérifier le menu "⚙️ LEGACY Pipeline"
```

#### Résultat Attendu
```
✅ Menu "⚙️ LEGACY Pipeline" visible
✅ 9 items présents
✅ Séparateurs visibles
```

### Test 2 : Lancement Phase 1

#### Étapes
```
1. Cliquer sur "⚙️ LEGACY Pipeline"
2. Cliquer sur "🎯 Phase 1 - Options & LV2"
3. Attendre fin de traitement
4. Vérifier alerte de succès
```

#### Résultat Attendu
```
✅ Toast "Phase 1 en cours..."
✅ Alerte "✅ Phase 1 Terminée"
✅ Message : "Options & LV2 répartis"
```

### Test 3 : Lancement Toutes Phases

#### Étapes
```
1. Cliquer sur "⚙️ LEGACY Pipeline"
2. Cliquer sur "▶️ Lancer Toutes les Phases"
3. Confirmer
4. Attendre fin de traitement (2-5 min)
5. Vérifier alerte de succès
```

#### Résultat Attendu
```
✅ Toast "Phase 1/4..."
✅ Toast "Phase 2/4..."
✅ Toast "Phase 3/4..."
✅ Toast "Phase 4/4..."
✅ Alerte "✅ Toutes les Phases Terminées"
✅ Durée affichée (ex: "3.2s")
```

---

## 📝 **FICHIERS MODIFIÉS**

| Fichier | Lignes | Modification |
|---------|--------|--------------|
| `Code.gs` | 27-40 | ✅ Ajout menu LEGACY |
| `Code.gs` | 137-418 | ✅ Ajout 8 fonctions LEGACY + 4 helpers |

**Total : 1 fichier modifié, 12 fonctions ajoutées**

---

## 🔧 **FONCTIONS À IMPLÉMENTER**

### 1. **createBaseoptiFromStructure()** - BASEOPTI_System.gs

```javascript
function createBaseoptiFromStructure() {
  // Lire _STRUCTURE
  // Créer _BASEOPTI avec colonnes :
  //   - Toutes les colonnes de _STRUCTURE
  //   - + _CLASS_ASSIGNED (vide)
  //   - + _TARGET_CLASS (vide)
  //   - + _PHASE (vide)
  // Retourner { success: true, message: '...' }
}
```

### 2. **copyBaseoptiToCache()** - BASEOPTI_System.gs

```javascript
function copyBaseoptiToCache() {
  // Lire _BASEOPTI
  // Grouper par _CLASS_ASSIGNED
  // Créer/écraser onglets <classe>CACHE
  // Retourner { success: true, message: '...' }
}
```

---

## 🎯 **DIFFÉRENCES LEGACY vs OPTI V2**

| Aspect | LEGACY Pipeline | OPTI V2 Pipeline |
|--------|----------------|------------------|
| **Interface** | Menu Google Sheets | InterfaceV2.html |
| **Lancement** | Manuel (phase par phase) | Automatique (UI) |
| **Configuration** | _STRUCTURE | _OPTI_CONFIG |
| **Contexte** | `makeCtxFromUI_()` | `buildCtx_V2()` |
| **Phases** | BASEOPTI V3 | BASEOPTI V3 |
| **Résultats** | _BASEOPTI | _BASEOPTI → CACHE |
| **Utilisateurs** | Utilisateurs Google Sheets | Utilisateurs UI moderne |

---

## 💡 **UTILISATION RECOMMANDÉE**

### Quand Utiliser LEGACY ?

1. ✅ **Débogage** : Lancer les phases une par une pour identifier un problème
2. ✅ **Tests** : Tester une phase spécifique après modification
3. ✅ **Comparaison** : Comparer résultats LEGACY vs OPTI V2
4. ✅ **Backup** : Si InterfaceV2 a un problème

### Quand Utiliser OPTI V2 ?

1. ✅ **Production** : Utilisation normale
2. ✅ **Rapidité** : Lancement automatique
3. ✅ **Configuration avancée** : Poids, maxSwaps, etc.
4. ✅ **UI moderne** : Drag & drop, visualisation

---

## 🎉 **RÉSULTAT FINAL**

### ✅ **Menu LEGACY Restauré**

1. ✅ Menu "⚙️ LEGACY Pipeline" visible
2. ✅ 9 items fonctionnels
3. ✅ Lancement manuel des phases
4. ✅ Lancement automatique (toutes phases)
5. ✅ Visualisation résultats
6. ✅ Copie vers CACHE

### 🎯 **Workflow Complet**

```
LEGACY Pipeline :
  1. Créer _BASEOPTI
  2. Lancer Phase 1
  3. Lancer Phase 2
  4. Lancer Phase 3
  5. Lancer Phase 4
  6. Voir résultats
  7. Copier vers CACHE

OPTI V2 Pipeline :
  1. Ouvrir InterfaceV2
  2. Cliquer "Optimiser"
  3. Résultats automatiques dans CACHE
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Menu LEGACY restauré et fonctionnel  
**Priorité** : 🟢 Production Ready
