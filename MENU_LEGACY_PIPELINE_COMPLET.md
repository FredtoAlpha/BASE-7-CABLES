# 📋 MENU LEGACY PIPELINE COMPLET - Documentation Finale

**Date** : 22 octobre 2025  
**Statut** : ✅ Pipeline LEGACY complet et indépendant

---

## 🎯 **CLARIFICATION IMPORTANTE**

### LEGACY = Pipeline COMPLET Indépendant

**LEGACY n'est PAS** un simple lanceur de phases BASEOPTI.  
**LEGACY EST** un pipeline complet indépendant avec :
1. Configuration manuelle (_STRUCTURE)
2. Ses propres phases (Phase1I_, Phase2I_, Phase3I_, Phase4_)
3. Sa propre finalisation (TEST ou FIN)

---

## 📊 **MENU LEGACY FINAL**

```
┌─────────────────────────────────────────┐
│ ⚙️ LEGACY Pipeline                      │
├─────────────────────────────────────────┤
│ 📋 Configurer _STRUCTURE                │
│ ─────────────────────────────────────── │
│ ▶️ Lancer Pipeline Complet              │
│ ─────────────────────────────────────── │
│ 🔧 Phases Individuelles ▶               │
│   ├─ 🎯 Phase 1 - Options & LV2         │
│   ├─ 🔗 Phase 2 - ASSO/DISSO            │
│   ├─ ⚖️ Phase 3 - Effectifs & Parité    │
│   └─ 🔄 Phase 4 - Équilibrage Scores    │
│ ─────────────────────────────────────── │
│ 📊 Voir Résultats CACHE                 │
│ 📄 Finaliser → TEST/FIN                 │
└─────────────────────────────────────────┘
```

---

## 🔄 **WORKFLOW LEGACY COMPLET**

### Étape 1 : Configuration _STRUCTURE

```
Menu > ⚙️ LEGACY Pipeline > 📋 Configurer _STRUCTURE
  → Ouvre l'onglet _STRUCTURE
  → Configuration manuelle :
    • Capacités des classes
    • Quotas ITA, ESP, CHAV, etc.
```

### Étape 2 : Lancement Pipeline

```
Menu > ⚙️ LEGACY Pipeline > ▶️ Lancer Pipeline Complet
  → Appelle runOptimizationV14FullI()
  → Lance automatiquement :
    1. Phase 1 LEGACY (Phase1I_dispatchOptionsLV2_)
    2. Phase 2 LEGACY (Phase2I_applyDissoAsso_)
    3. Phase 3 LEGACY (Phase3I_completeAndParity_)
    4. Phase 4 LEGACY (Phase4_balanceScoresSwaps_)
  → Résultats dans onglets CACHE
```

### Étape 3 : Vérification Résultats

```
Menu > ⚙️ LEGACY Pipeline > 📊 Voir Résultats CACHE
  → Affiche les onglets CACHE
  → Vérification manuelle
```

### Étape 4 : Finalisation

```
Menu > ⚙️ LEGACY Pipeline > 📄 Finaliser → TEST/FIN
  → Choix : TEST ou FIN
  → Appelle finalizeClasses(disposition, 'CACHE')
  → Crée onglets <classe>TEST ou <classe>FIN
  → Formatage professionnel appliqué
```

---

## 🔧 **FONCTIONS LEGACY**

### 1. **legacy_openStructure()** - Configuration

```javascript
function legacy_openStructure()
```

**Action** : Ouvre l'onglet `_STRUCTURE` pour configuration manuelle

**Workflow** :
1. Vérifie existence de `_STRUCTURE`
2. Active l'onglet
3. Affiche instructions

---

### 2. **legacy_runFullPipeline()** - Pipeline Complet

```javascript
function legacy_runFullPipeline()
```

**Action** : Lance le pipeline LEGACY complet

**Workflow** :
1. Demande confirmation
2. Appelle `runOptimizationV14FullI(options)`
3. Lance les 4 phases automatiquement
4. Sauvegarde dans CACHE
5. Affiche durée et résultat

**Fonctions appelées** :
- `runOptimizationV14FullI()` (Orchestration_V14I.gs)

---

### 3. **legacy_runPhase1()** - Phase 1 Individuelle

```javascript
function legacy_runPhase1()
```

**Action** : Lance Phase 1 LEGACY uniquement

**Workflow** :
1. Construit contexte avec `makeCtxFromUI_()`
2. Appelle `Phase1I_dispatchOptionsLV2_(ctx)`
3. Résultats dans CACHE

**Fonctions appelées** :
- `makeCtxFromUI_()` (Orchestration_V14I.gs)
- `Phase1I_dispatchOptionsLV2_(ctx)` (Orchestration_V14I.gs)

---

### 4. **legacy_runPhase2()** - Phase 2 Individuelle

```javascript
function legacy_runPhase2()
```

**Action** : Lance Phase 2 LEGACY uniquement

**Fonctions appelées** :
- `makeCtxFromUI_()` (Orchestration_V14I.gs)
- `Phase2I_applyDissoAsso_(ctx)` (Phase2I_DissoAsso.gs)

---

### 5. **legacy_runPhase3()** - Phase 3 Individuelle

```javascript
function legacy_runPhase3()
```

**Action** : Lance Phase 3 LEGACY uniquement

**Fonctions appelées** :
- `makeCtxFromUI_()` (Orchestration_V14I.gs)
- `Phase3I_completeAndParity_(ctx)` (Orchestration_V14I.gs)

---

### 6. **legacy_runPhase4()** - Phase 4 Individuelle

```javascript
function legacy_runPhase4()
```

**Action** : Lance Phase 4 LEGACY uniquement

**Fonctions appelées** :
- `makeCtxFromUI_()` (Orchestration_V14I.gs)
- `Phase4_balanceScoresSwaps_(ctx)` (Orchestration_V14I.gs)

---

### 7. **legacy_viewCacheResults()** - Voir Résultats

```javascript
function legacy_viewCacheResults()
```

**Action** : Affiche les onglets CACHE

**Workflow** :
1. Cherche tous les onglets `*CACHE`
2. Active le premier
3. Affiche nombre d'onglets trouvés

---

### 8. **legacy_finalizeResults()** - Finalisation

```javascript
function legacy_finalizeResults()
```

**Action** : Crée les onglets TEST ou FIN depuis CACHE

**Workflow** :
1. Demande choix TEST ou FIN
2. Lit les onglets CACHE
3. Construit disposition
4. Appelle `finalizeClasses(disposition, 'CACHE')`
5. Crée onglets formatés

**Fonctions appelées** :
- `finalizeClasses()` (Code.gs)

---

## 🎯 **DIFFÉRENCES LEGACY vs OPTI V2**

| Aspect | LEGACY Pipeline | OPTI V2 Pipeline |
|--------|----------------|------------------|
| **Configuration** | _STRUCTURE (manuelle) | _OPTI_CONFIG (UI) |
| **Contexte** | `makeCtxFromUI_()` | `buildCtx_V2()` |
| **Phases** | Phase1I_, Phase2I_, Phase3I_, Phase4_ | BASEOPTI V3 |
| **Orchestration** | `runOptimizationV14FullI()` | `runOptimizationOPTI()` |
| **Interface** | Menu Google Sheets | InterfaceV2.html |
| **Résultats** | CACHE → TEST/FIN | CACHE → InterfaceV2 |
| **Finalisation** | Manuelle (menu) | Automatique (UI) |
| **Usage** | Secours/Débogage | Production |

---

## 📊 **FLUX COMPLET LEGACY**

```
1. Configuration _STRUCTURE (manuelle)
   ↓
2. Lancer Pipeline Complet
   ↓
3. runOptimizationV14FullI()
   ├─ Phase 1 LEGACY (Phase1I_dispatchOptionsLV2_)
   ├─ Phase 2 LEGACY (Phase2I_applyDissoAsso_)
   ├─ Phase 3 LEGACY (Phase3I_completeAndParity_)
   └─ Phase 4 LEGACY (Phase4_balanceScoresSwaps_)
   ↓
4. Résultats dans CACHE
   ↓
5. Vérification manuelle
   ↓
6. Finalisation → TEST ou FIN
   ↓
7. Onglets <classe>TEST ou <classe>FIN créés
```

---

## 🔧 **FICHIERS IMPLIQUÉS**

### Backend

| Fichier | Fonctions |
|---------|-----------|
| `Code.gs` | Menu + Wrappers LEGACY |
| `Orchestration_V14I.gs` | `runOptimizationV14FullI()`, `makeCtxFromUI_()`, Phase1I_, Phase3I_, Phase4_ |
| `Phase2I_DissoAsso.gs` | `Phase2I_applyDissoAsso_()` |
| `Code.gs` | `finalizeClasses()`, `formatFinSheet()` |

### Configuration

| Onglet | Usage |
|--------|-------|
| `_STRUCTURE` | Configuration manuelle (capacités, quotas) |
| `<classe>TEST` | Onglets source (élèves) |
| `<classe>CACHE` | Résultats intermédiaires |
| `<classe>TEST` ou `<classe>FIN` | Résultats finaux formatés |

---

## 🎉 **RÉSULTAT FINAL**

### ✅ **Pipeline LEGACY Complet**

1. ✅ Configuration _STRUCTURE manuelle
2. ✅ Lancement pipeline complet (`runOptimizationV14FullI`)
3. ✅ Phases individuelles disponibles
4. ✅ Résultats dans CACHE
5. ✅ Finalisation TEST ou FIN
6. ✅ Formatage professionnel
7. ✅ Indépendant d'OPTI V2

### 🎯 **Cas d'Usage**

```
LEGACY Pipeline :
  → Secours si OPTI V2 a un problème
  → Débogage phase par phase
  → Configuration manuelle avancée
  → Tests comparatifs

OPTI V2 Pipeline :
  → Usage normal production
  → Configuration UI moderne
  → Résultats automatiques
  → Drag & drop InterfaceV2
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Pipeline LEGACY complet et indépendant  
**Priorité** : 🟢 Production Ready
