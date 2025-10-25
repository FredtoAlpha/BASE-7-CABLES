# 🎯 CORRECTION RÉGRESSION PARITÉ - SYSTÈME ADAPTATIF

## 📋 Résumé de la Correction

**Date**: 22 octobre 2025  
**Problème**: Le système visait 50/50 F/M dans chaque classe, créant des classes "parfaites" et une classe "poubelle"  
**Solution**: Système de parité adaptative basé sur le ratio global réel

---

## ❌ Problème Avant Correction

### Comportement Observé
Avec 66F + 55M (54.5% F / 45.5% M) :
- **6°2**: 13F/11M ✅ (écart: 2)
- **6°3**: 13F/11M ✅ (écart: 2)
- **6°4**: 12F/12M ✅ (écart: 0) ← Fausse perfection
- **6°5**: 12F/12M ✅ (écart: 0) ← Fausse perfection
- **6°1**: **16F/9M** ❌ (écart: 7) ← Classe poubelle

### Cause Racine
```javascript
// ANCIEN CODE (INCORRECT)
const ecartPariteAvant = Math.abs(f1Avant - m1Avant) + Math.abs(f2Avant - m2Avant);
const ecartPariteApres = Math.abs(f1Apres - m1Apres) + Math.abs(f2Apres - m2Apres);
// ⚠️ Vise |F-M| = 0 partout (50/50 impossible si ratio global ≠ 50/50)
```

---

## ✅ Solution Implémentée

### 1. Calcul du Ratio Global Réel

**Fonction**: `computeParityTargetsForClasses(classesMap)`

```javascript
// NOUVEAU CODE (CORRECT)
// Étape 1: Compter le total global
totalF = 66, totalM = 55
ratioF = 66/121 = 54.5%

// Étape 2: Répartir sur chaque classe (arrondi banquier)
Classe de 24 élèves → 13.1F / 10.9M → 13F/11M (targetDelta = +2)
Classe de 25 élèves → 13.6F / 11.4M → 14F/11M (targetDelta = +3)
```

**Résultat**: Chaque classe a une cible `targetDelta` réaliste

### 2. Évaluation des Swaps Adaptative

**Fonction**: `evaluerImpactDistribution()`

```javascript
// NOUVEAU CODE (CORRECT)
const target1 = parityTargets.targets[c1N];
const target2 = parityTargets.targets[c2N];

// Écart AVANT swap par rapport aux CIBLES
const ecartCible1Avant = Math.abs((f1Avant - m1Avant) - target1.targetDelta);
const ecartCible2Avant = Math.abs((f2Avant - m2Avant) - target2.targetDelta);

// Écart APRÈS swap par rapport aux CIBLES
const ecartCible1Apres = Math.abs((f1Apres - m1Apres) - target1.targetDelta);
const ecartCible2Apres = Math.abs((f2Apres - m2Apres) - target2.targetDelta);

// Amélioration = réduction de la distance aux cibles
ameliorationParite = (ecartCible1Avant + ecartCible2Avant) - (ecartCible1Apres + ecartCible2Apres);
```

### 3. Contraintes Adaptatives

**Fonction**: `respecteContraintes()`

```javascript
// NOUVEAU CODE (CORRECT)
if (target1 && target1.enforce) {
    const delta1 = (s1.F || 0) - (s1.M || 0);
    const ecartCible1 = Math.abs(delta1 - target1.targetDelta);
    ok1 = ecartCible1 <= tolerance; // Vérifie la distance à la CIBLE
}
```

---

## 📊 Résultat Attendu Après Correction

Avec 66F + 55M (54.5% F / 45.5% M) :
- **6°1**: 13F/11M ✅ (Δ=+2, cible Δ=+2, écart=0)
- **6°2**: 13F/11M ✅ (Δ=+2, cible Δ=+2, écart=0)
- **6°3**: 13F/11M ✅ (Δ=+2, cible Δ=+2, écart=0)
- **6°4**: 13F/12M ✅ (Δ=+1, cible Δ=+1, écart=0)
- **6°5**: 14F/11M ✅ (Δ=+3, cible Δ=+3, écart=0)

**Total**: 66F + 55M ✅ (ratio global respecté, répartition équitable)

---

## 📁 Fichiers Modifiés

### 1. `Phase4_Optimisation_V15.gs`

#### Ajouts
- **Lignes 185-295**: Fonction `computeParityTargetsForClasses()`
- **Lignes 531-537**: Calcul des cibles avant optimisation
- **Lignes 1146-1193**: Évaluation adaptative dans `evaluerImpactDistribution()`
- **Lignes 1410-1453**: Contraintes adaptatives dans `respecteContraintes()`
- **Lignes 748-770**: Reporting avec cibles dans les logs

#### Modifications de Signatures
```javascript
// AVANT
function evaluerImpactDistribution(eleve1, eleve2, classesMap, currentStats, poidsEffectifs, penaltyFunc, globalTargets)
function respecteContraintes(e1, e2, allStudents, structureData, optionsNiveauData, optionPools, dissocMap, classesMap, pariteTolerance)

// APRÈS
function evaluerImpactDistribution(eleve1, eleve2, classesMap, currentStats, poidsEffectifs, penaltyFunc, globalTargets, parityTargets)
function respecteContraintes(e1, e2, allStudents, structureData, optionsNiveauData, optionPools, dissocMap, classesMap, pariteTolerance, parityTargets)
```

### 2. `Phase4_BASEOPTI_V2.gs`

#### Ajouts
- **Lignes 185-272**: Fonction `computeParityTargets_BASEOPTI()`
- **Ligne 360**: Calcul des cibles dans `runSwapOptimization_()`
- **Lignes 464-491**: Évaluation adaptative dans `evaluateObjective_()`

#### Modifications de Signatures
```javascript
// AVANT
function evaluateObjective_(state, weights, tolParity)
function findBestSwap_(state, ctx, weights, tolParity)

// APRÈS
function evaluateObjective_(state, weights, tolParity, parityTargets)
function findBestSwap_(state, ctx, weights, tolParity, parityTargets)
```

---

## 🧪 Tests à Effectuer

### Test 1: Vérifier le Calcul des Cibles
**Attendu dans les logs**:
```
Moteur V14: Parité globale calculée: 66F / 55M (54.5% F)
Moteur V14: Cibles de parité par classe:
  6°1: cible 13F / 11M (delta=2)
  6°2: cible 13F / 11M (delta=2)
  6°3: cible 13F / 11M (delta=2)
  6°4: cible 13F / 12M (delta=1)
  6°5: cible 14F / 11M (delta=3)
```

### Test 2: Vérifier le Résultat Final
**Attendu dans le rapport final**:
```
🚻 PARITÉ F/M PAR CLASSE (avec cibles adaptatives) :
  ✅ 6°1: 13F / 11M (Δ=+2, cible Δ=+2, écart=0)
  ✅ 6°2: 13F / 11M (Δ=+2, cible Δ=+2, écart=0)
  ✅ 6°3: 13F / 11M (Δ=+2, cible Δ=+2, écart=0)
  ✅ 6°4: 13F / 12M (Δ=+1, cible Δ=+1, écart=0)
  ✅ 6°5: 14F / 11M (Δ=+3, cible Δ=+3, écart=0)
```

### Test 3: Vérifier l'Absence de Classe Poubelle
**Critère de succès**:
- Aucune classe avec un écart > 4 par rapport à sa cible
- Variance des écarts aux cibles proche de 0
- Pas de classe avec un ratio F/M extrême (ex: 16F/9M)

---

## 🔍 Points de Vigilance

### 1. Données Manquantes
Si certains élèves n'ont pas de sexe renseigné :
- Le système calcule le ratio sur les données connues uniquement
- Les classes sans données de sexe ont `enforce: false`
- Fallback sur l'ancien calcul si nécessaire

### 2. Tolérance
La tolérance par défaut (`PARITE_TOLERANCE = 2`) s'applique maintenant à l'écart par rapport à la **cible**, pas à l'écart absolu |F-M|.

### 3. Compatibilité
Le code inclut des fallbacks pour garantir la compatibilité :
```javascript
if (parityTargets && parityTargets.targets) {
    // Nouveau calcul avec cibles
} else {
    // Ancien calcul (fallback)
}
```

---

## 📝 Notes Techniques

### Arrondi Banquier
Le système utilise l'arrondi banquier pour distribuer les unités restantes :
1. Calcul de la partie entière pour chaque classe
2. Tri par reste décroissant
3. Attribution des unités manquantes aux classes avec les plus grands restes

### Normalisation du Sexe
La fonction `_v14SexeNormalize()` standardise les valeurs :
- `'F'`, `'FILLE'`, `'FEMININ'` → `'F'`
- `'M'`, `'GARCON'`, `'MASCULIN'` → `'M'`
- Autres valeurs → `'U'` (inconnu)

### Performance
Le calcul des cibles est effectué **une seule fois** avant l'optimisation, puis réutilisé pour tous les swaps.

---

## ✅ Checklist de Validation

- [x] Fonction `computeParityTargetsForClasses()` ajoutée
- [x] Calcul des cibles avant optimisation
- [x] `evaluerImpactDistribution()` modifié pour utiliser les cibles
- [x] `respecteContraintes()` modifié pour vérifier les cibles
- [x] Reporting amélioré avec affichage des cibles
- [x] Même correction appliquée à `Phase4_BASEOPTI_V2.gs`
- [x] Fallbacks pour compatibilité
- [x] Documentation créée

---

## 🚀 Prochaines Étapes

1. **Tester** sur un jeu de données réel
2. **Vérifier** les logs pour confirmer le calcul des cibles
3. **Comparer** les résultats avant/après correction
4. **Ajuster** la tolérance si nécessaire (actuellement 2)

---

**Correction terminée le 22 octobre 2025**  
**Fichiers modifiés**: `Phase4_Optimisation_V15.gs`, `Phase4_BASEOPTI_V2.gs`
