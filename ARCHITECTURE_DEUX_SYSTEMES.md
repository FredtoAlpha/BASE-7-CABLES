# 🏗️ ARCHITECTURE DEUX SYSTÈMES EN PARALLÈLE

Ce projet utilise **DEUX SYSTÈMES D'OPTIMISATION** qui cohabitent sans conflit.

---

## 📊 **VUE D'ENSEMBLE**

| Aspect | SYSTÈME LEGACY | SYSTÈME NOUVEAU (V2) |
|--------|----------------|----------------------|
| **Interface** | Google Sheets classique | UI Optimisation (InterfaceV2) |
| **Configuration** | `_STRUCTURE` | `_OPTI_CONFIG` |
| **Contexte** | `makeCtxFromUI_()`, `buildCtx_()` | `getOptimizationContext_V2()`, `buildCtx_V2()` |
| **Phases** | Phases anciennes | Phases BASEOPTI |
| **Endpoints** | Pas de streaming | Endpoints streaming (`openCacheTabsStream`, etc.) |
| **Pool élèves** | Lit directement depuis TEST/CACHE/FIN | Utilise `_BASEOPTI` (pool centralisé) |
| **Statut** | ✅ Maintenu (ne pas toucher) | ✅ Actif (développement en cours) |

---

## 🔵 **SYSTÈME LEGACY**

### Fichiers concernés :
- `Orchestration_V14I.gs`
- `_STRUCTURE` (onglet Google Sheets)
- Phases anciennes (si elles existent)

### Pipeline :
```
Interface Google Sheets classique
         ↓
    _STRUCTURE
         ↓
makeCtxFromUI_() / readQuotasFromUI_() / readTargetsFromUI_()
         ↓
   buildCtx_()
         ↓
   Phases anciennes
         ↓
    Résultats CACHE
```

### Fonctions principales :
```javascript
makeCtxFromUI_()           // Lit l'interface Google Sheets
readQuotasFromUI_()        // Lit quotas depuis _STRUCTURE
readTargetsFromUI_()       // Lit effectifs depuis _STRUCTURE
buildCtx_()                // Construit le contexte legacy
```

### Caractéristiques :
- ✅ **Ne PAS modifier** ce système
- ✅ Lit uniquement depuis `_STRUCTURE`
- ✅ Pas de pool centralisé `_BASEOPTI`
- ✅ Pas d'endpoints streaming

---

## 🟢 **SYSTÈME NOUVEAU (V2)**

### Fichiers concernés :
- `OptiConfig_System.gs` (NOUVEAU)
- `Orchestration_V14I_Stream.gs` (modifié pour V2)
- `BASEOPTI_System.gs`
- `Phases_BASEOPTI.gs`
- `_OPTI_CONFIG` (onglet Google Sheets, caché)
- `_BASEOPTI` (onglet Google Sheets, caché)

### Pipeline :
```
UI Optimisation (InterfaceV2)
         ↓
    _OPTI_CONFIG
         ↓
getOptimizationContext_V2() / buildCtx_V2()
         ↓
optStream_init_V2()
         ↓
   Phases BASEOPTI
   - Phase1I_dispatchOptionsLV2_BASEOPTI()
   - Phase2I_applyDissoAsso_BASEOPTI()
   - Phase3I_completeAndParity_BASEOPTI()
   - Phase4_balanceScoresSwaps_()
         ↓
    Résultats CACHE
```

### Fonctions principales :

#### **1. Configuration (_OPTI_CONFIG)**

```javascript
ensureConfigSheet_()           // Crée _OPTI_CONFIG si absent
kvSet_(key, value, scope)      // Écrit une clé/valeur
kvGet_(key, scope, default)    // Lit une clé/valeur
kvGetAll_()                    // Lit toutes les clés/valeurs

saveOptimizationProfileFromUI(payload)   // Sauvegarde depuis UI
getOptimizationProfileFromUI()           // Récupère pour affichage UI
```

#### **2. Contexte d'optimisation**

```javascript
getOptimizationContext_V2()    // Construit contexte depuis _OPTI_CONFIG
buildCtx_V2(options)           // Construit contexte complet pour phases
optStream_init_V2(args)        // Initialise contexte pour endpoints streaming
```

#### **3. Endpoints streaming**

```javascript
openCacheTabsStream()          // Ouvre CACHE + crée _BASEOPTI
phase1Stream()                 // Phase 1 : Options & LV2
phase2Stream()                 // Phase 2 : Codes DISSO/ASSO
phase3Stream()                 // Phase 3 : Effectifs & Parité
phase4Stream()                 // Phase 4 : Swaps
auditStream()                  // Audit final
```

### Caractéristiques :
- ✅ **Système actif** (développement en cours)
- ✅ Lit depuis `_OPTI_CONFIG` (priorité 1) et `_STRUCTURE` (fallback)
- ✅ Utilise pool centralisé `_BASEOPTI`
- ✅ Endpoints streaming sans paramètres
- ✅ Configuration flexible (poids, effectifs, quotas)

---

## 🔄 **HIÉRARCHIE DE LECTURE (SYSTÈME V2)**

### **Pour EFFECTIFS** :
```
1. _OPTI_CONFIG.targets.override.<classe>  (override temporaire)
2. _STRUCTURE.EFFECTIF                     (plan établissement)
3. Fallback calculé : ceil(total / nbClasses)
```

### **Pour QUOTAS LV2/OPT** :
```
1. _STRUCTURE.OPTIONS                      (plan établissement)
2. Fallback : {} (aucune contrainte)
```

### **Pour POIDS/PARAMÈTRES TECHNIQUES** :
```
1. _OPTI_CONFIG.weights                    (configuration UI)
2. Fallback : { parity:0.3, com:0.4, groupA:0.2, dist:0.1 }
```

---

## 📋 **STRUCTURE _OPTI_CONFIG**

### Format :

| KEY | VALUE | SCOPE | UPDATED_AT |
|-----|-------|-------|------------|
| `mode.selected` | `TEST` | GLOBAL | 2025-01-20 08:00 |
| `weights` | `{"com":0.4,"tra":0.2,"part":0.2,"abs":0.2}` | GLOBAL | 2025-01-20 08:00 |
| `parity.tolerance` | `2` | GLOBAL | 2025-01-20 08:00 |
| `swaps.max` | `50` | GLOBAL | 2025-01-20 08:00 |
| `baseopti.enabled` | `true` | GLOBAL | 2025-01-20 08:00 |
| `targets.override.6°1` | `26` | GLOBAL | 2025-01-20 08:10 |

### Clés prédéfinies :

- **`mode.selected`** : Mode source (TEST/CACHE/FIN)
- **`weights`** : Poids pour Phase 4 (JSON: {com, tra, part, abs, parity})
- **`parity.tolerance`** : Tolérance parité (2 par défaut)
- **`swaps.max`** : Nombre max de swaps en Phase 4
- **`targets.override.<classe>`** : Effectif cible override par classe
- **`targets.byClass`** : Effectifs cibles JSON (toutes classes)
- **`offers.byClass`** : Quotas LV2/OPT JSON (toutes classes)

---

## 🔀 **COHABITATION DES DEUX SYSTÈMES**

### **Isolation totale** :

1. **Fichiers séparés** :
   - Legacy : `Orchestration_V14I.gs`
   - V2 : `OptiConfig_System.gs`, `Orchestration_V14I_Stream.gs`

2. **Fonctions différentes** :
   - Legacy : `makeCtxFromUI_()`, `buildCtx_()`, `readQuotasFromUI_()`
   - V2 : `getOptimizationContext_V2()`, `buildCtx_V2()`, `optStream_init_V2()`

3. **Onglets de configuration séparés** :
   - Legacy : `_STRUCTURE`
   - V2 : `_OPTI_CONFIG` + `_STRUCTURE` (fallback)

4. **Pas de conflit** :
   - Les deux systèmes peuvent tourner en parallèle
   - Chaque système lit sa propre configuration
   - Les résultats sont écrits dans les mêmes onglets CACHE (mais à des moments différents)

---

## 🚀 **UTILISATION**

### **Pour utiliser le SYSTÈME LEGACY** :
```javascript
// Dans Orchestration_V14I.gs
const ctx = makeCtxFromUI_({ sourceFamily: 'TEST' });
// Utiliser les phases anciennes
```

### **Pour utiliser le SYSTÈME NOUVEAU (V2)** :
```javascript
// Depuis l'UI Optimisation
google.script.run.openCacheTabsStream();
google.script.run.phase1Stream();
google.script.run.phase2Stream();
google.script.run.phase3Stream();
google.script.run.phase4Stream();
google.script.run.auditStream();

// Ou manuellement dans Apps Script
const ctx = optStream_init_V2();
Phase1I_dispatchOptionsLV2_BASEOPTI(ctx);
Phase2I_applyDissoAsso_BASEOPTI(ctx);
Phase3I_completeAndParity_BASEOPTI(ctx);
Phase4_balanceScoresSwaps_(ctx);
```

---

## 📝 **MODIFICATIONS À ÉVITER**

### ❌ **NE PAS FAIRE** :

1. ❌ Modifier `makeCtxFromUI_()` (legacy)
2. ❌ Modifier `readQuotasFromUI_()` (legacy)
3. ❌ Modifier `readTargetsFromUI_()` (legacy)
4. ❌ Supprimer `_STRUCTURE`
5. ❌ Mélanger les deux systèmes dans le même pipeline

### ✅ **FAIRE** :

1. ✅ Créer de nouvelles fonctions avec suffixe `_V2`
2. ✅ Utiliser `_OPTI_CONFIG` pour le système V2
3. ✅ Maintenir l'isolation entre les deux systèmes
4. ✅ Tester chaque système indépendamment

---

## 🧪 **TESTS RECOMMANDÉS**

### **Test SYSTÈME LEGACY** :
1. Utiliser l'interface Google Sheets classique
2. Configurer `_STRUCTURE`
3. Lancer l'optimisation via le système legacy
4. Vérifier que les résultats sont corrects

### **Test SYSTÈME NOUVEAU (V2)** :
1. Utiliser l'UI Optimisation (InterfaceV2)
2. Configurer les poids, effectifs, quotas
3. Cliquer sur "Mode Direct Live"
4. Vérifier que `_OPTI_CONFIG` est créé et rempli
5. Vérifier que les phases BASEOPTI fonctionnent
6. Vérifier que les effectifs respectent `_OPTI_CONFIG` puis `_STRUCTURE` puis fallback

### **Test COHABITATION** :
1. Lancer le système legacy
2. Noter les résultats
3. Lancer le système V2
4. Vérifier qu'aucun conflit n'existe
5. Comparer les résultats

---

## 📞 **SUPPORT**

En cas de problème :
1. Vérifier quel système vous utilisez (legacy ou V2)
2. Consulter les logs Apps Script (Exécutions)
3. Vérifier l'onglet de configuration (`_STRUCTURE` ou `_OPTI_CONFIG`)
4. Vérifier que vous utilisez les bonnes fonctions

**La cohabitation est garantie si vous respectez l'isolation entre les deux systèmes !** 🎉
