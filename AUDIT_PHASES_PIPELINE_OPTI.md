# 🔍 AUDIT COMPLET : TOUTES LES PHASES SUR PIPELINE OPTI

## ❌ PROBLÈME IDENTIFIÉ

**Orchestration_V14I.gs** (pipeline CLASSIQUE) utilise les **MAUVAISES VERSIONS** des phases :

```javascript
// ❌ ACTUELLEMENT (Orchestration_V14I.gs)
Phase1I_dispatchOptionsLV2_(ctx)           // ❌ Lit depuis CACHE/TEST
Phase2I_applyDissoAsso_(ctx)               // ❌ Lit depuis CACHE
Phase3I_completeAndParity_(ctx)            // ❌ Lit depuis CACHE
Phase4_balanceScoresSwaps_(ctx)            // ❌ Lit depuis CACHE
```

**Ces versions NE LISENT PAS depuis `_BASEOPTI`** !

---

## ✅ VERSIONS CORRECTES (Pipeline OPTI)

```javascript
// ✅ VERSIONS V3 (OPTI_Pipeline_Independent.gs)
Phase1I_dispatchOptionsLV2_BASEOPTI_V3(ctx)    // ✅ Lit/écrit _BASEOPTI
Phase2I_applyDissoAsso_BASEOPTI_V3(ctx)        // ✅ Lit/écrit _BASEOPTI
Phase3I_completeAndParity_BASEOPTI_V3(ctx)     // ✅ Lit/écrit _BASEOPTI
Phase4_balanceScoresSwaps_BASEOPTI_V3(ctx)     // ✅ Lit/écrit _BASEOPTI
```

---

## 📊 COMPARAISON DÉTAILLÉE

### Phase 1 : Options & LV2

| Version | Fichier | Lit depuis | Écrit dans | Utilise _BASEOPTI |
|---------|---------|------------|------------|-------------------|
| `Phase1I_dispatchOptionsLV2_()` | Orchestration_V14I.gs:818 | CACHE/TEST | CACHE | ❌ NON |
| `Phase1I_dispatchOptionsLV2_BASEOPTI_V3()` | Phases_BASEOPTI_V3_COMPLETE.gs:31 | _BASEOPTI | _BASEOPTI + CACHE | ✅ OUI |

**Problème** : La version legacy lit depuis les onglets CACHE/TEST, pas depuis `_BASEOPTI`.

### Phase 2 : DISSO/ASSO

| Version | Fichier | Lit depuis | Écrit dans | Utilise _BASEOPTI |
|---------|---------|------------|------------|-------------------|
| `Phase2I_applyDissoAsso_()` | Orchestration_V14I.gs:??? | CACHE | CACHE | ❌ NON |
| `Phase2I_applyDissoAsso_BASEOPTI_V3()` | Phases_BASEOPTI_V3_COMPLETE.gs:113 | _BASEOPTI | _BASEOPTI + CACHE | ✅ OUI |

**Problème** : La version legacy lit depuis CACHE, donc si les codes DISSO ne sont pas dans CACHE après Phase 1, ils sont perdus.

### Phase 3 : Effectifs & Parité

| Version | Fichier | Lit depuis | Écrit dans | Utilise _BASEOPTI |
|---------|---------|------------|------------|-------------------|
| `Phase3I_completeAndParity_()` | Orchestration_V14I.gs:1162 | CACHE | CACHE | ❌ NON |
| `Phase3I_completeAndParity_BASEOPTI_V3()` | Phases_BASEOPTI_V3_COMPLETE.gs:258 | _BASEOPTI | _BASEOPTI + CACHE | ✅ OUI |

**Problème** : La version legacy lit depuis CACHE, pas depuis `_BASEOPTI`.

### Phase 4 : Swaps

| Version | Fichier | Lit depuis | Écrit dans | Utilise _BASEOPTI |
|---------|---------|------------|------------|-------------------|
| `Phase4_balanceScoresSwaps_()` | Orchestration_V14I.gs:1532 | CACHE | CACHE | ❌ NON |
| `Phase4_balanceScoresSwaps_BASEOPTI_V3()` | Phases_BASEOPTI_V3_COMPLETE.gs:518 | _BASEOPTI | _BASEOPTI + CACHE | ✅ OUI |

**Problème** : La version legacy lit depuis CACHE, pas depuis `_BASEOPTI`.

---

## 🎯 SOLUTION : BRANCHER TOUT SUR PIPELINE OPTI

### Option 1 : Modifier Orchestration_V14I.gs (RECOMMANDÉ)

Remplacer **TOUTES** les phases par les versions V3 dans `Orchestration_V14I.gs`.

### Option 2 : Utiliser uniquement OPTI_Pipeline_Independent.gs

Abandonner `Orchestration_V14I.gs` et utiliser uniquement `runOptimizationOPTI()`.

---

## 🔧 CORRECTIONS À APPORTER

### Fichier : `Orchestration_V14I.gs`

#### Ligne 154 : Phase 1

**AVANT** :
```javascript
const p1 = Phase1I_dispatchOptionsLV2_(ctx);
```

**APRÈS** :
```javascript
const p1 = Phase1I_dispatchOptionsLV2_BASEOPTI_V3(ctx);
```

#### Ligne 183 : Phase 2

**AVANT** :
```javascript
const p2 = Phase2I_applyDissoAsso_(ctx);
```

**APRÈS** :
```javascript
const p2 = Phase2I_applyDissoAsso_BASEOPTI_V3(ctx);
```

#### Ligne 195 : Phase 3

**AVANT** :
```javascript
const p3 = Phase3I_completeAndParity_(ctx);
```

**APRÈS** :
```javascript
const p3 = Phase3I_completeAndParity_BASEOPTI_V3(ctx);
```

#### Ligne 207 : Phase 4

**AVANT** :
```javascript
const p4 = Phase4_balanceScoresSwaps_(ctx);
```

**APRÈS** :
```javascript
const p4 = Phase4_balanceScoresSwaps_BASEOPTI_V3(ctx);
```

---

## 📋 MODIFICATIONS SUPPLÉMENTAIRES

### 1. Ajouter l'INIT V3 avant Phase 1

**Ajouter après la ligne 147** :

```javascript
// ===== INIT : VIDER CACHE ET CRÉER _BASEOPTI =====
logLine('INFO', '\n🔧 INIT : Préparation _BASEOPTI...');
const initResult = initOptimization_V3(ctx);
if (!initResult.ok) {
  logLine('ERROR', '❌ INIT échoué');
  return { success: false, error: 'INIT échoué' };
}
logLine('INFO', '✅ INIT terminé : ' + initResult.total + ' élèves dans _BASEOPTI');
```

### 2. Modifier le contexte pour utiliser buildCtx_V2

**Ligne 116** :

**AVANT** :
```javascript
const ctx = makeCtxFromUI_(options);
```

**APRÈS** :
```javascript
// ✅ Utiliser buildCtx_V2 pour lire depuis _OPTI_CONFIG
const ctx = buildCtx_V2(options);
```

**OU** garder `makeCtxFromUI_` mais le modifier pour lire depuis `_OPTI_CONFIG` (voir section suivante).

---

## 🔄 ALTERNATIVE : Modifier makeCtxFromUI_

Si vous voulez garder `makeCtxFromUI_` mais le faire lire depuis `_OPTI_CONFIG` :

**Fichier** : `Orchestration_V14I.gs`, ligne 295

**AVANT** :
```javascript
function makeCtxFromUI_(options) {
  const ss = getActiveSS_();
  const modeSrc = (options && options.sourceFamily) ? String(options.sourceFamily).trim() : (readModeFromUI_() || 'TEST');
  const writeTarget = 'CACHE';
  const niveaux = readNiveauxFromUI_() || ['6°1', '6°2', '6°3', '6°4', '6°5'];
  const srcSheets = makeSheetsList_(niveaux, modeSrc);
  const cacheSheets = makeSheetsList_(niveaux, writeTarget);
  
  // ❌ LIT DEPUIS _STRUCTURE
  const quotas = readQuotasFromUI_();
  const targets = readTargetsFromUI_();
  const tolParite = readParityToleranceFromUI_() || 2;
  const maxSwaps = (options && options.maxSwaps) ? parseInt(options.maxSwaps) : (readMaxSwapsFromUI_() || 500);
  
  return {
    ss, modeSrc, writeTarget, niveaux, srcSheets, cacheSheets,
    quotas, targets, tolParite, maxSwaps,
    autorisations: readClassAuthorizationsFromUI_()
  };
}
```

**APRÈS** :
```javascript
function makeCtxFromUI_(options) {
  const ss = getActiveSS_();
  
  // ✅ LIRE DEPUIS _OPTI_CONFIG
  const optiCtx = getOptimizationContext_V2();
  
  const modeSrc = (options && options.sourceFamily) || optiCtx.mode || 'TEST';
  const writeTarget = 'CACHE';
  const niveaux = Object.keys(optiCtx.targetsByClass);
  const srcSheets = makeSheetsList_(niveaux, modeSrc);
  const cacheSheets = makeSheetsList_(niveaux, writeTarget);
  
  return {
    ss,
    modeSrc,
    writeTarget,
    niveaux,
    srcSheets,
    cacheSheets,
    quotas: optiCtx.offersByClass,        // ✅ DEPUIS _OPTI_CONFIG
    targets: optiCtx.targetsByClass,      // ✅ DEPUIS _OPTI_CONFIG
    tolParite: optiCtx.parityTolerance,   // ✅ DEPUIS _OPTI_CONFIG
    maxSwaps: optiCtx.maxSwaps,           // ✅ DEPUIS _OPTI_CONFIG
    weights: optiCtx.weights,             // ✅ DEPUIS _OPTI_CONFIG
    runtimeSec: optiCtx.runtimeSec,       // ✅ DEPUIS _OPTI_CONFIG
    autorisations: readClassAuthorizationsFromUI_()
  };
}
```

---

## ✅ CHECKLIST DE CORRECTION

### Orchestration_V14I.gs

- [ ] Ligne 116 : Remplacer `makeCtxFromUI_` par `buildCtx_V2` OU modifier `makeCtxFromUI_`
- [ ] Ligne 147 : Ajouter `initOptimization_V3(ctx)`
- [ ] Ligne 154 : Remplacer par `Phase1I_dispatchOptionsLV2_BASEOPTI_V3(ctx)`
- [ ] Ligne 183 : Remplacer par `Phase2I_applyDissoAsso_BASEOPTI_V3(ctx)`
- [ ] Ligne 195 : Remplacer par `Phase3I_completeAndParity_BASEOPTI_V3(ctx)`
- [ ] Ligne 207 : Remplacer par `Phase4_balanceScoresSwaps_BASEOPTI_V3(ctx)`

### Vérifications

- [ ] Toutes les phases lisent depuis `_BASEOPTI`
- [ ] Toutes les phases écrivent dans `_BASEOPTI` + CACHE
- [ ] Le contexte lit depuis `_OPTI_CONFIG`
- [ ] `maxSwaps`, `weights`, `runtimeSec` sont bien remplis

---

## 🎯 RÉSULTAT ATTENDU

Après corrections :

1. ✅ **Phase 1** lit/écrit `_BASEOPTI`
2. ✅ **Phase 2** lit/écrit `_BASEOPTI` → **DISSO fonctionnera**
3. ✅ **Phase 3** lit/écrit `_BASEOPTI`
4. ✅ **Phase 4** lit/écrit `_BASEOPTI` → **Swaps fonctionneront**
5. ✅ Tous les paramètres depuis `_OPTI_CONFIG`

---

## 📊 IMPACT

### Avant (Pipeline CLASSIQUE)
```
TEST → Phase1 (CACHE) → Phase2 (CACHE) → Phase3 (CACHE) → Phase4 (CACHE)
       ❌ Pas de _BASEOPTI
       ❌ Pas de _OPTI_CONFIG
       ❌ 0 DISSO
       ❌ 0 swaps
```

### Après (Pipeline OPTI)
```
TEST → INIT (_BASEOPTI) → Phase1 (_BASEOPTI) → Phase2 (_BASEOPTI) → Phase3 (_BASEOPTI) → Phase4 (_BASEOPTI) → CACHE
       ✅ _BASEOPTI source unique
       ✅ _OPTI_CONFIG pour paramètres
       ✅ DISSO appliqués
       ✅ Swaps appliqués
```

---

**FIN DE L'AUDIT**
