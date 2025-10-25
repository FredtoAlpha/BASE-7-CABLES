# 🔄 GUIDE: LES DEUX PIPELINES DE RÉPARTITION

**Date**: 21 octobre 2025  
**Objectif**: Clarifier l'utilisation des deux systèmes parallèles

---

## 🎯 RÉPONSE RAPIDE

**OUI**, vous avez **DEUX pipelines complètement indépendants** :

1. **Pipeline LEGACY** - Via menu Google Sheets
2. **Pipeline OPTI V2** - Via InterfaceV2 (interface web)

**OUI**, ils peuvent fonctionner en parallèle et se juxtaposer.  
**OUI**, vous pouvez lancer l'un puis corriger avec l'autre.

---

## 📊 COMPARAISON DES DEUX PIPELINES

| Aspect | Pipeline LEGACY | Pipeline OPTI V2 |
|--------|----------------|------------------|
| **Interface** | Menu Google Sheets | InterfaceV2.html (web) |
| **Configuration** | Onglet `_STRUCTURE` | Onglet `_OPTI_CONFIG` |
| **Déclenchement** | Menu personnalisé Sheets | Bouton "Mode Direct Live" |
| **Pool élèves** | Lit directement TEST/CACHE | Crée `_BASEOPTI` (pool) |
| **Phases** | Anciennes fonctions | Fonctions BASEOPTI V3 |
| **Paramètres** | Limités (fallbacks) | Complets (UI config) |
| **Contexte** | `makeCtxFromUI_()` | `buildCtx_V2()` |
| **Résultats** | Écrit dans ...CACHE | Écrit dans ...CACHE |
| **Utilisateurs** | Utilisateurs Sheets | Utilisateurs web |

---

## 🔵 PIPELINE 1: LEGACY (Google Sheets)

### Quand l'utiliser ?
- ✅ Vous travaillez directement dans Google Sheets
- ✅ Vous voulez une interface simple et familière
- ✅ Vous n'avez pas besoin de paramètres avancés
- ✅ Vous utilisez le système depuis longtemps

### Comment ça marche ?

```
┌─────────────────────────────────────────┐
│  1. Ouvrir Google Sheets                │
│  2. Configurer _STRUCTURE               │
│     - Effectifs par classe              │
│     - Quotas LV2/OPT                    │
│  3. Menu personnalisé > Lancer          │
│  4. Le système lit _STRUCTURE           │
│  5. Exécute les phases                  │
│  6. Résultats dans ...CACHE             │
└─────────────────────────────────────────┘
```

### Configuration

**Onglet `_STRUCTURE`** :
```
CLASSE | EFFECTIF | LV2_ITA | LV2_ESP | OPT_CHAV | ...
6°1    | 25       | 6       | 0       | 0        | ...
6°2    | 24       | 0       | 0       | 0        | ...
6°3    | 24       | 0       | 0       | 10       | ...
```

### Fonctions backend
```javascript
// Orchestration_V14I.gs
makeCtxFromUI_(options)           // Construit le contexte
readQuotasFromUI_()               // Lit quotas depuis _STRUCTURE
readTargetsFromUI_()              // Lit effectifs depuis _STRUCTURE
runOptimizationV14FullI(options)  // Lance l'optimisation
```

### Avantages
- ✅ **Simple** - Pas besoin d'interface web
- ✅ **Stable** - Utilisé depuis longtemps
- ✅ **Autonome** - Fonctionne seul

### Limites
- ⚠️ **Paramètres limités** - Pas de poids configurables
- ⚠️ **Pas de pool centralisé** - Lit directement les sources
- ⚠️ **Interface basique** - Pas de visualisation avancée

---

## 🟢 PIPELINE 2: OPTI V2 (InterfaceV2)

### Quand l'utiliser ?
- ✅ Vous voulez une interface moderne et visuelle
- ✅ Vous avez besoin de paramètres avancés (poids, runtime, etc.)
- ✅ Vous voulez voir les résultats en temps réel (streaming)
- ✅ Vous voulez un pool centralisé `_BASEOPTI`

### Comment ça marche ?

```
┌─────────────────────────────────────────┐
│  1. Ouvrir InterfaceV2.html             │
│  2. Onglet "Optimisation"               │
│  3. Configurer les paramètres           │
│     - Mode (TEST/CACHE/FIN)             │
│     - Poids (COM, TRA, PART, ABS)       │
│     - Max swaps, Runtime, Parité        │
│  4. Cliquer "Mode Direct Live"          │
│  5. Le système crée _BASEOPTI           │
│  6. Exécute les phases BASEOPTI V3      │
│  7. Résultats dans ...CACHE             │
│  8. Affichage streaming temps réel      │
└─────────────────────────────────────────┘
```

### Configuration

**Onglet `_OPTI_CONFIG`** (caché) :
```
KEY                  | VALUE
─────────────────────┼──────────────────────
mode.selected        | TEST
weights              | {"com":0.4,"tra":0.1,...}
swaps.max            | 50
swaps.runtime        | 180
parity.tolerance     | 2
targets.byClass      | {"6°1":25,"6°2":24,...}
offers.byClass       | {"6°1":{"ITA":6},...}
```

### Fonctions backend
```javascript
// OptiConfig_System.gs
getOptimizationContext_V2()       // Lit depuis _OPTI_CONFIG
buildCtx_V2(options)              // Construit le contexte V2

// Orchestration_V14I_Stream.gs
openCacheTabsStream()             // Crée _BASEOPTI
phase1Stream()                    // Phase 1 streaming
phase2Stream()                    // Phase 2 streaming
phase3Stream()                    // Phase 3 streaming
phase4Stream()                    // Phase 4 streaming
auditStream()                     // Audit final

// Phases_BASEOPTI_V3_COMPLETE.gs
Phase1I_dispatchOptionsLV2_BASEOPTI_V3()
Phase2I_applyDissoAsso_BASEOPTI_V3()
Phase3I_completeAndParity_BASEOPTI_V3()
Phase4_balanceScoresSwaps_BASEOPTI_V3()
```

### Avantages
- ✅ **Interface moderne** - UI web intuitive
- ✅ **Paramètres avancés** - Poids, runtime, parité configurables
- ✅ **Pool centralisé** - `_BASEOPTI` évite les problèmes de migration
- ✅ **Streaming** - Résultats en temps réel
- ✅ **Visualisation** - Dashboard avec graphiques

### Limites
- ⚠️ **Plus complexe** - Nécessite de comprendre l'interface
- ⚠️ **Plus récent** - Moins testé que le legacy

---

## 🔄 FONCTIONNEMENT EN PARALLÈLE

### Les deux pipelines sont-ils indépendants ?

**OUI, complètement !**

```
Pipeline LEGACY                Pipeline OPTI V2
     ↓                              ↓
_STRUCTURE                     _OPTI_CONFIG
     ↓                              ↓
makeCtxFromUI_()              buildCtx_V2()
     ↓                              ↓
Phases Legacy                 Phases BASEOPTI V3
     ↓                              ↓
   ...CACHE ←──────────────────→ ...CACHE
```

### Peuvent-ils se marcher dessus ?

**NON, ils sont isolés !**

| Aspect | Isolation |
|--------|-----------|
| Configuration | ✅ `_STRUCTURE` ≠ `_OPTI_CONFIG` |
| Fonctions | ✅ Noms différents (`makeCtxFromUI_` vs `buildCtx_V2`) |
| Phases | ✅ Fichiers séparés |
| Résultats | ⚠️ Même destination (...CACHE) mais pas en même temps |

### Puis-je lancer l'un puis l'autre ?

**OUI, c'est même recommandé !**

#### Scénario 1: Legacy puis OPTI V2
```
1. Lancer Pipeline LEGACY via menu Sheets
   → Résultats dans 6°1CACHE, 6°2CACHE, etc.
2. Consulter les résultats
3. Si besoin d'ajustements fins:
   → Ouvrir InterfaceV2
   → Configurer poids/paramètres
   → Lancer Pipeline OPTI V2
   → Résultats écrasent les précédents dans ...CACHE
```

#### Scénario 2: OPTI V2 puis Legacy
```
1. Lancer Pipeline OPTI V2 via InterfaceV2
   → Résultats dans 6°1CACHE, 6°2CACHE, etc.
2. Consulter les résultats
3. Si besoin de simplifier:
   → Revenir à Google Sheets
   → Lancer Pipeline LEGACY
   → Résultats écrasent les précédents dans ...CACHE
```

### Puis-je corriger avec l'un ce que l'autre a fait ?

**OUI, exactement !**

**Exemple concret** :
```
1. Pipeline LEGACY place 121 élèves
   → Parité: 6°1 = 15F/10M (Δ=5) ❌

2. Vous n'êtes pas satisfait de la parité

3. Ouvrir InterfaceV2
   → Configurer parity.tolerance = 1 (strict)
   → Lancer Pipeline OPTI V2

4. Pipeline OPTI V2 optimise
   → Parité: 6°1 = 13F/12M (Δ=1) ✅

5. Résultats finaux dans ...CACHE
```

---

## 🎯 QUEL PIPELINE CHOISIR ?

### Utilisez Pipeline LEGACY si :
- ✅ Vous êtes à l'aise avec Google Sheets
- ✅ Vous n'avez pas besoin de paramètres avancés
- ✅ Vous voulez une solution simple et rapide
- ✅ Vous faites une première répartition basique

### Utilisez Pipeline OPTI V2 si :
- ✅ Vous voulez optimiser finement (poids COM/TRA/PART/ABS)
- ✅ Vous voulez contrôler le temps d'exécution (runtime)
- ✅ Vous voulez une parité stricte (tolerance configurable)
- ✅ Vous voulez voir les résultats en temps réel
- ✅ Vous voulez un pool centralisé `_BASEOPTI`

### Utilisez les DEUX si :
- ✅ Vous voulez une première passe rapide (Legacy)
- ✅ Puis une optimisation fine (OPTI V2)
- ✅ Vous voulez comparer les résultats
- ✅ Vous voulez itérer jusqu'à satisfaction

---

## 🛠️ WORKFLOW RECOMMANDÉ

### Approche itérative (recommandée)

```
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 1: Première répartition (Pipeline LEGACY)        │
├─────────────────────────────────────────────────────────┤
│ 1. Configurer _STRUCTURE (effectifs, quotas)           │
│ 2. Lancer Pipeline LEGACY via menu Sheets              │
│ 3. Consulter résultats dans ...CACHE                   │
│ 4. Vérifier: quotas OK, effectifs OK                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 2: Optimisation fine (Pipeline OPTI V2)          │
├─────────────────────────────────────────────────────────┤
│ 1. Ouvrir InterfaceV2                                   │
│ 2. Configurer poids (COM=0.4, parité=0.3, etc.)        │
│ 3. Configurer parité stricte (tolerance=1)             │
│ 4. Lancer Pipeline OPTI V2                             │
│ 5. Consulter résultats optimisés dans ...CACHE         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ÉTAPE 3: Validation finale                             │
├─────────────────────────────────────────────────────────┤
│ 1. Vérifier tous les critères                          │
│ 2. Si besoin, ajuster paramètres et relancer OPTI V2   │
│ 3. Finaliser dans ...FIN                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 DIAGNOSTIC: QUEL PIPELINE A ÉTÉ UTILISÉ ?

### Comment savoir quel pipeline a généré les résultats ?

#### Indices dans les logs
```javascript
// Pipeline LEGACY
"[INFO] makeCtxFromUI_: contexte créé"
"[INFO] Phase1I_dispatchOptionsLV2_: ..."

// Pipeline OPTI V2
"[INFO] buildCtx_V2: contexte V2 créé"
"[INFO] _BASEOPTI créé : 121 élèves"
"[INFO] Phase1I_dispatchOptionsLV2_BASEOPTI_V3: ..."
```

#### Indices dans les onglets
```
Pipeline LEGACY:
- Pas d'onglet _BASEOPTI
- Pas d'onglet _OPTI_CONFIG

Pipeline OPTI V2:
- Onglet _BASEOPTI existe (caché)
- Onglet _OPTI_CONFIG existe (caché)
```

---

## ❓ FAQ

### Q1: Les deux pipelines donnent-ils les mêmes résultats ?
**R**: Presque, mais pas exactement.
- Les **quotas LV2/OPT** seront respectés par les deux
- Les **effectifs** seront identiques
- La **parité** peut différer (OPTI V2 plus strict)
- Les **scores COM/TRA/PART/ABS** seront mieux optimisés avec OPTI V2

### Q2: Puis-je supprimer un des deux pipelines ?
**R**: Non recommandé.
- Le **Pipeline LEGACY** est stable et simple
- Le **Pipeline OPTI V2** est puissant mais plus complexe
- Garder les deux offre flexibilité et sécurité

### Q3: Lequel est le plus rapide ?
**R**: Dépend.
- **Pipeline LEGACY**: Plus rapide pour une première passe
- **Pipeline OPTI V2**: Plus lent (optimisation Phase 4) mais meilleurs résultats

### Q4: Puis-je utiliser les deux en même temps ?
**R**: Non, pas simultanément.
- Lancer l'un, attendre qu'il finisse
- Puis lancer l'autre si besoin
- Les résultats s'écrasent dans ...CACHE

### Q5: Les "doublons" dans le code sont-ils un problème ?
**R**: Non, c'est voulu !
- Les fonctions sont dupliquées pour **isoler** les deux pipelines
- Cela évite qu'une modification casse l'autre système
- C'est une **bonne pratique** d'architecture

---

## ✅ CONCLUSION

Vous disposez de **DEUX outils complémentaires** :

1. **Pipeline LEGACY** = Marteau 🔨
   - Simple, direct, efficace
   - Pour une première répartition rapide

2. **Pipeline OPTI V2** = Scalpel 🔬
   - Précis, configurable, puissant
   - Pour une optimisation fine

**Utilisez-les ensemble** pour obtenir les meilleurs résultats !

```
Legacy (rapide) → OPTI V2 (précis) → Résultat optimal ✅
```

---

**Questions ?** Consultez :
- `ARCHITECTURE_DEUX_PIPELINES.md` - Détails techniques
- `ARCHITECTURE_DEUX_SYSTEMES.md` - Cohabitation des systèmes
- `BASEOPTI_README.md` - Documentation BASEOPTI
