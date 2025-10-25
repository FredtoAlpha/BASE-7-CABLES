# 🏗️ ARCHITECTURE : DEUX PIPELINES INDÉPENDANTS

## 📋 VUE D'ENSEMBLE

Le système dispose de **DEUX pipelines complètement indépendants** :

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE CLASSIQUE                           │
│                 (Google Sheets direct)                          │
├─────────────────────────────────────────────────────────────────┤
│ Interface    : Google Sheets directement                        │
│ Configuration: _STRUCTURE                                       │
│ Contexte     : makeCtxFromUI_() [Orchestration_V14I.gs]       │
│ Phases       : Legacy (Orchestration_V14I.gs)                  │
│ Utilisateurs : Utilisateurs Google Sheets                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PIPELINE OPTI                               │
│                (InterfaceV2 indépendant)                        │
├─────────────────────────────────────────────────────────────────┤
│ Interface    : InterfaceV2.html                                 │
│ Configuration: _OPTI_CONFIG                                     │
│ Contexte     : buildCtx_V2() [OptiConfig_System.gs]           │
│ Phases       : BASEOPTI V3 (Phases_BASEOPTI_V3_COMPLETE.gs)   │
│ Orchestration: OPTI_Pipeline_Independent.gs                    │
│ Module UI    : InterfaceV2_Module_OPTI.html                    │
│ Utilisateurs : Utilisateurs InterfaceV2                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 PIPELINE CLASSIQUE (Google Sheets)

### Fichiers

- **Interface** : Google Sheets directement
- **Configuration** : `_STRUCTURE` (onglet Google Sheets)
- **Orchestration** : `Orchestration_V14I.gs`
- **Contexte** : `makeCtxFromUI_()` (ligne 295)
- **Phases** : 
  - `Phase1I_dispatchOptionsLV2_()`
  - `Phase2I_applyDissoAsso_()`
  - `Phase3I_completeAndParity_()`
  - `Phase4_balanceScoresSwaps_()`

### Flux d'exécution

```
Google Sheets
    ↓
runOptimizationV14FullI(options)
    ↓
makeCtxFromUI_(options)
    ↓ lit depuis
_STRUCTURE
    ↓ construit
ctx = {
  quotas: depuis _STRUCTURE,
  targets: depuis _STRUCTURE,
  tolParite: depuis _STRUCTURE ou fallback,
  maxSwaps: depuis options ou fallback 500
}
    ↓ exécute
Phase1I → Phase2I → Phase3I → Phase4
```

### Caractéristiques

- ✅ **Stable** : Utilisé depuis longtemps
- ✅ **Autonome** : Fonctionne sans InterfaceV2
- ✅ **Configuration** : Via `_STRUCTURE` (Google Sheets)
- ⚠️ **Limitations** : 
  - Pas de configuration avancée (weights, runtimeSec)
  - Utilise des fallbacks pour les paramètres manquants

---

## 🚀 PIPELINE OPTI (InterfaceV2)

### Fichiers

- **Interface** : `InterfaceV2.html`
- **Module UI** : `InterfaceV2_Module_OPTI.html`
- **Configuration** : `_OPTI_CONFIG` (onglet caché Google Sheets)
- **Système config** : `OptiConfig_System.gs`
- **Orchestration** : `OPTI_Pipeline_Independent.gs`
- **Contexte** : `buildCtx_V2()` (OptiConfig_System.gs:429)
- **Phases** : 
  - `initOptimization_V3()` (BASEOPTI_Architecture_V3.gs)
  - `Phase1I_dispatchOptionsLV2_BASEOPTI_V3()` (Phases_BASEOPTI_V3_COMPLETE.gs)
  - `Phase2I_applyDissoAsso_BASEOPTI_V3()` (Phases_BASEOPTI_V3_COMPLETE.gs)
  - `Phase3I_completeAndParity_BASEOPTI_V3()` (Phases_BASEOPTI_V3_COMPLETE.gs)
  - `Phase4_balanceScoresSwaps_BASEOPTI_V3()` (Phases_BASEOPTI_V3_COMPLETE.gs)

### Flux d'exécution

```
InterfaceV2.html
    ↓ bouton OPTI
OptiModule.runOptimization()
    ↓ appelle
google.script.run.runOptimizationOPTI(options)
    ↓ [Backend]
OPTI_Pipeline_Independent.gs → runOptimizationOPTI()
    ↓
buildCtx_V2(options)
    ↓ lit depuis
_OPTI_CONFIG
    ↓ construit
ctx = {
  quotas: depuis _OPTI_CONFIG,
  targets: depuis _OPTI_CONFIG,
  tolParite: depuis _OPTI_CONFIG,
  maxSwaps: depuis _OPTI_CONFIG,
  weights: depuis _OPTI_CONFIG,
  runtimeSec: depuis _OPTI_CONFIG
}
    ↓ exécute
INIT V3 → Phase1 V3 → Phase2 V3 → Phase3 V3 → Phase4 V3
```

### Caractéristiques

- ✅ **Indépendant** : Ne touche PAS `_STRUCTURE`
- ✅ **Configurable** : Tous les paramètres dans `_OPTI_CONFIG`
- ✅ **UI moderne** : Panneau de configuration dans InterfaceV2
- ✅ **Architecture V3** : Utilise `_BASEOPTI` comme source unique
- ✅ **Paramètres avancés** :
  - `weights` : Poids des critères (parité, COM, TRA, PART, ABS)
  - `maxSwaps` : Nombre max de swaps Phase 4
  - `runtimeSec` : Budget temps Phase 4
  - `parityTolerance` : Tolérance écart F/M

---

## 🔗 CONNEXIONS UI ↔ BACKEND

### Pipeline OPTI

#### 1. Chargement configuration

```javascript
// UI → Backend
OptiModule.loadConfig()
    ↓ appelle
google.script.run.getOptiConfigForUI()
    ↓ [Backend]
getOptiConfigForUI() [OPTI_Pipeline_Independent.gs:118]
    ↓ appelle
getOptimizationContext_V2() [OptiConfig_System.gs:184]
    ↓ lit
_OPTI_CONFIG (kvGet_)
    ↓ retourne
{
  mode, weights, maxSwaps, runtimeSec,
  parityTolerance, targets, quotas
}
```

#### 2. Sauvegarde configuration

```javascript
// UI → Backend
OptiModule.saveConfig(config)
    ↓ appelle
google.script.run.saveOptiConfigFromUI(config)
    ↓ [Backend]
saveOptiConfigFromUI(config) [OPTI_Pipeline_Independent.gs:145]
    ↓ écrit
_OPTI_CONFIG (kvSet_)
```

#### 3. Lancement optimisation

```javascript
// UI → Backend
OptiModule.runOptimization()
    ↓ appelle
google.script.run.runOptimizationOPTI(options)
    ↓ [Backend]
runOptimizationOPTI(options) [OPTI_Pipeline_Independent.gs:47]
    ↓ construit contexte
buildCtx_V2(options) [OptiConfig_System.gs:429]
    ↓ exécute phases
initOptimization_V3(ctx)
Phase1I_dispatchOptionsLV2_BASEOPTI_V3(ctx)
Phase2I_applyDissoAsso_BASEOPTI_V3(ctx)
Phase3I_completeAndParity_BASEOPTI_V3(ctx)
Phase4_balanceScoresSwaps_BASEOPTI_V3(ctx)
    ↓ retourne
{
  success, phases, nbSwaps, durationSec,
  writeSuffix, sourceSuffix
}
```

---

## 📦 STRUCTURE `_OPTI_CONFIG`

### Format

```
| KEY                  | VALUE                              | SCOPE  | UPDATED_AT |
|----------------------|------------------------------------|--------|------------|
| mode.selected        | TEST                               | GLOBAL | 2025-01-20 |
| weights              | {"parity":0.3,"com":0.4,...}       | GLOBAL | 2025-01-20 |
| parity.tolerance     | 2                                  | GLOBAL | 2025-01-20 |
| swaps.max            | 500                                | GLOBAL | 2025-01-20 |
| swaps.runtime        | 180                                | GLOBAL | 2025-01-20 |
| targets.byClass      | {"6°1":25,"6°2":25,...}            | GLOBAL | 2025-01-20 |
| targets.override.6°1 | 26                                 | GLOBAL | 2025-01-20 |
| offers.byClass       | {"6°1":{"ITA":6},...}              | GLOBAL | 2025-01-20 |
```

### Fonctions d'accès

- `kvSet_(key, value, scope)` - Écrire une clé
- `kvGet_(key, scope, defaultValue)` - Lire une clé
- `kvGetAll_()` - Lire toutes les clés

---

## 🎨 MODULE UI OPTI

### Fichier : `InterfaceV2_Module_OPTI.html`

### Fonctions principales

```javascript
OptiModule = {
  init()                    // Initialise le module
  loadConfig()              // Charge config depuis _OPTI_CONFIG
  saveConfig(config)        // Sauvegarde config dans _OPTI_CONFIG
  openOptiPanel()           // Ouvre le panneau de configuration
  runOptimization()         // Lance l'optimisation OPTI
  displayResults(result)    // Affiche les résultats
}
```

### Intégration dans InterfaceV2

Ajouter dans `InterfaceV2.html` :

```html
<!-- Module OPTI -->
<script id="module-opti">
  <?!= include('InterfaceV2_Module_OPTI'); ?>
</script>
```

---

## 🔧 INITIALISATION `_OPTI_CONFIG`

### Fonction : `initOptiConfig()`

Crée `_OPTI_CONFIG` avec valeurs par défaut :

```javascript
{
  mode: 'TEST',
  weights: {
    parity: 0.3,
    com: 0.4,
    tra: 0.1,
    part: 0.1,
    abs: 0.1
  },
  maxSwaps: 500,
  runtimeSec: 180,
  parityTolerance: 2,
  targets: {
    '6°1': 25,
    '6°2': 25,
    '6°3': 25,
    '6°4': 25,
    '6°5': 25
  }
}
```

### Appel

```javascript
// Depuis Google Apps Script
initOptiConfig();

// Ou depuis InterfaceV2
google.script.run.initOptiConfig();
```

---

## ✅ CHECKLIST D'INTÉGRATION

### Backend

- [x] `OPTI_Pipeline_Independent.gs` créé
- [x] `runOptimizationOPTI()` implémenté
- [x] `getOptiConfigForUI()` implémenté
- [x] `saveOptiConfigFromUI()` implémenté
- [x] `initOptiConfig()` implémenté
- [x] Utilise `buildCtx_V2()` (PAS `makeCtxFromUI_()`)
- [x] Lit depuis `_OPTI_CONFIG` (PAS `_STRUCTURE`)

### Frontend

- [x] `InterfaceV2_Module_OPTI.html` créé
- [x] `OptiModule` implémenté
- [x] Panneau de configuration UI
- [x] Connexions `google.script.run`
- [ ] **TODO** : Intégrer dans `InterfaceV2.html`

### Tests

- [ ] **TODO** : Tester `testOptiConfig()`
- [ ] **TODO** : Tester `testOptiPipeline()`
- [ ] **TODO** : Tester UI → Backend
- [ ] **TODO** : Vérifier Phase 4 avec `maxSwaps = 500`

---

## 🚀 PROCHAINES ÉTAPES

### 1. Intégrer le module OPTI dans InterfaceV2

Modifier `InterfaceV2.html` pour inclure le module :

```html
<!-- Après les autres modules -->
<script id="module-opti">
  <?!= include('InterfaceV2_Module_OPTI'); ?>
</script>
```

### 2. Initialiser `_OPTI_CONFIG`

Exécuter dans Google Apps Script :

```javascript
initOptiConfig();
```

### 3. Tester la configuration

```javascript
testOptiConfig();
```

### 4. Tester le pipeline complet

```javascript
testOptiPipeline();
```

### 5. Vérifier l'UI

- Ouvrir InterfaceV2
- Cliquer sur le bouton "OPTI"
- Vérifier que le panneau s'ouvre
- Modifier les paramètres
- Sauvegarder
- Lancer l'optimisation

---

## 📊 COMPARAISON DES PIPELINES

| Critère | Pipeline CLASSIQUE | Pipeline OPTI |
|---------|-------------------|---------------|
| **Interface** | Google Sheets | InterfaceV2.html |
| **Configuration** | `_STRUCTURE` | `_OPTI_CONFIG` |
| **Contexte** | `makeCtxFromUI_()` | `buildCtx_V2()` |
| **Phases** | Legacy | BASEOPTI V3 |
| **Paramètres** | Limités | Complets |
| **Weights** | ❌ Fallback | ✅ Configurables |
| **maxSwaps** | ❌ Fallback 500 | ✅ Configurable |
| **runtimeSec** | ❌ Fallback 180 | ✅ Configurable |
| **UI Config** | ❌ Non | ✅ Oui |
| **Indépendance** | ✅ Oui | ✅ Oui |

---

## 🎯 CONCLUSION

Les deux pipelines sont maintenant **COMPLÈTEMENT INDÉPENDANTS** :

- ✅ **Pipeline CLASSIQUE** : Continue de fonctionner avec `_STRUCTURE`
- ✅ **Pipeline OPTI** : Fonctionne avec `_OPTI_CONFIG`, complètement séparé
- ✅ **Pas d'interférence** : Les deux peuvent coexister sans conflit
- ✅ **UI moderne** : InterfaceV2 a son propre panneau de configuration OPTI

**Prochaine action** : Intégrer `InterfaceV2_Module_OPTI.html` dans `InterfaceV2.html` et tester !
