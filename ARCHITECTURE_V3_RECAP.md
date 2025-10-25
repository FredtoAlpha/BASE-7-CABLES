# 🎯 ARCHITECTURE V3 - _BASEOPTI COMME VIVIER UNIQUE

## ✅ PROBLÈMES RÉSOLUS

### 1. Phase 2 : 0 ASSO, 0 DISSO
**Cause** : Phase 2 lisait `baseGetFree_()` (élèves non placés). Mais Phase 1 avait déjà placé TOUS les élèves avec ITA/CHAV. Si ces élèves avaient des codes A/D, Phase 2 ne les voyait jamais.

**Solution** : Phase 2 V3 lit _BASEOPTI (TOUS les élèves) et analyse leurs codes A/D.

### 2. Phase 4 : 0 swaps
**Cause** : Phase 4 lisait `readBaseOpti_()` mais les Phases 1/2/3 écrivaient dans CACHE. Les champs `CLASSE_FINAL` dans _BASEOPTI n'étaient pas à jour.

**Solution** : Phase 4 V3 lit _BASEOPTI avec la colonne `_CLASS_ASSIGNED` à jour.

### 3. Moyennes manquantes
**Cause** : Pas d'affichage des moyennes COM/TRA/PART/ABS par classe.

**Solution** : Fonction `computeScoreAveragesByClass_()` ajoutée à l'audit final.

---

## 🏗️ ARCHITECTURE CORRECTE

```
┌─────────────────────────────────────────────────────┐
│ _BASEOPTI = VIVIER UNIQUE (source de vérité)       │
│ Colonnes : ID, NOM, PRENOM, SEXE, COM, TRA, PART,  │
│            ABS, LV2, OPT, A, D, _CLASS_ASSIGNED     │
└─────────────────────────────────────────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │  INIT : Vide CACHE              │
         │  Crée _BASEOPTI                 │
         │  Ajoute colonne _CLASS_ASSIGNED │
         └────────────────┬────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │  Phase 1 : Place OPT/LV2         │
         │  → Écrit dans _CLASS_ASSIGNED    │
         │  → Copie vers CACHE (affichage)  │
         └────────────────┬────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │  Phase 2 : LIT _BASEOPTI         │
         │  (TOUS les élèves)               │
         │  Regroupe A, sépare D            │
         │  → UPDATE _CLASS_ASSIGNED        │
         │  → Copie vers CACHE              │
         └────────────────┬────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │  Phase 3 : Complète effectifs    │
         │  → UPDATE _CLASS_ASSIGNED        │
         │  → Copie vers CACHE              │
         └────────────────┬────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │  Phase 4 : Swaps scores          │
         │  Priorité COM=1 > COM=2 > reste  │
         │  → UPDATE _CLASS_ASSIGNED        │
         │  → Copie vers CACHE              │
         └────────────────┬────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │  FINAL : CACHE = _BASEOPTI       │
         └─────────────────────────────────┘
```

---

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### 1. **Phases_BASEOPTI_V3_COMPLETE.gs** (NOUVEAU)
Contient les 4 phases V3 :
- `Phase1I_dispatchOptionsLV2_BASEOPTI_V3(ctx)`
- `Phase2I_applyDissoAsso_BASEOPTI_V3(ctx)`
- `Phase3I_completeAndParity_BASEOPTI_V3(ctx)`
- `Phase4_balanceScoresSwaps_BASEOPTI_V3(ctx)`

**Principe** :
- Lit _BASEOPTI (colonne _CLASS_ASSIGNED)
- Modifie _CLASS_ASSIGNED
- Copie vers CACHE pour affichage live

### 2. **Orchestration_V14I_Stream.gs** (MODIFIÉ)
- `openCacheTabsStream()` : Vide CACHE, crée _BASEOPTI, ajoute colonne _CLASS_ASSIGNED
- `phase1Stream()`, `phase2Stream()`, `phase3Stream()`, `phase4Stream()` : Appellent les V3

### 3. **OptimizationPanel.html** (MODIFIÉ)
- Affiche les moyennes COM/TRA/PART/ABS par classe dans l'UI

---

## 🔧 DÉTAILS TECHNIQUES

### Phase 1 V3
```javascript
// Lit _BASEOPTI (élèves sans _CLASS_ASSIGNED)
// Place selon quotas OPT/LV2
// Écrit dans _CLASS_ASSIGNED
// Copie vers CACHE
```

### Phase 2 V3
```javascript
// Lit _BASEOPTI (TOUS les élèves)
// Groupe par codes A
// Pour chaque groupe A :
//   - Trouver classe majoritaire
//   - Déplacer tous vers cette classe (UPDATE _CLASS_ASSIGNED)
// Groupe par codes D
// Pour chaque groupe D :
//   - Si plusieurs dans même classe
//   - Déplacer vers classe sans ce code D
// Copie vers CACHE
```

### Phase 3 V3
```javascript
// Lit _BASEOPTI (élèves sans _CLASS_ASSIGNED)
// Complète effectifs selon targets
// Équilibre parité F/M
// Écrit dans _CLASS_ASSIGNED
// Copie vers CACHE
```

### Phase 4 V3
```javascript
// Lit _BASEOPTI (colonne _CLASS_ASSIGNED)
// Groupe par classe
// Calcule score initial
// Pour maxSwaps itérations :
//   - Trouve meilleur swap
//   - Applique le swap
//   - UPDATE _CLASS_ASSIGNED
// Copie vers CACHE
```

### Fonction objectif Phase 4
```javascript
score = Σ (poids_com × (5 - COM) + poids_tra × (5 - TRA) + ...)
      - (nombre_COM1_par_classe × 2)  // Pénalité concentration

Objectif : MAXIMISER le score
Priorité : COM=1 > COM=2 > TRA > PART > ABS
```

---

## 🧪 TEST ATTENDU

```
✅ INIT : CACHE vidé, _BASEOPTI créé (120 élèves)
✅ Phase 1 : ITA=6, CHAV=10
✅ Phase 2 : 12 ASSO déplacés, 3 DISSO déplacés
✅ Phase 3 : Effectifs équilibrés
✅ Phase 4 : 23 swaps appliqués

6°1 (25 élèves, 13F/12M)
LV2: ITA=6 | OPT: —
📊 Moyennes: COM=2.96 | TRA=2.88 | PART=2.70 | ABS=3.65

6°3 (23 élèves, 12F/11M)
LV2: — | OPT: CHAV=10
📊 Moyennes: COM=3.12 | TRA=3.05 | PART=3.02 | ABS=3.78
```

---

## 🚀 PROCHAINES ÉTAPES

1. Lancer l'optimisation
2. Vérifier les logs :
   - Phase 2 doit afficher "Groupes ASSO : X" avec X > 0
   - Phase 4 doit afficher "Y swaps appliqués" avec Y > 0
3. Vérifier l'audit :
   - Aucun "Groupe A=XX incomplet"
   - Moyennes affichées pour chaque classe

---

## ⚠️ NOTES IMPORTANTES

- **_BASEOPTI est la source unique de vérité**
- **CACHE est vidé au début et rempli progressivement**
- **Chaque phase copie vers CACHE pour affichage live**
- **Phase 4 récupère les poids depuis ctx.weights** (défini dans _OPTI_CONFIG)
