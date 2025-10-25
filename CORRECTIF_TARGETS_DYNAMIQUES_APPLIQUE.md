# ✅ CORRECTIF TARGETS DYNAMIQUES APPLIQUÉ

**Date**: 2025-01-20  
**Objectif**: Supprimer les effectifs codés en dur (28) et calculer automatiquement les targets depuis le nombre réel d'élèves

---

## 🎯 PROBLÈME IDENTIFIÉ

### Symptômes
- **6°3 bloquée à 10/28** au lieu de 10/24
- **6°1 à 26/28** au lieu de 26/24
- **1 élève non placé** alors que toutes les classes devraient être complètes
- Logs affichant `capacity: 28` pour toutes les classes

### Cause racine
Les **effectifs cibles étaient codés en dur à 28** dans plusieurs endroits :
1. `Code.gs` : `DEFAULT_CAPACITY: 28`
2. `OptiConfig_System.gs` : Lecture de `_STRUCTURE.capacity` (fixé à 28)
3. Aucun calcul automatique basé sur le nombre réel d'élèves

### Conséquence
Avec **121 élèves** et **5 classes**, le système essayait de placer **140 élèves** (5 × 28), ce qui est impossible.

**Résultat attendu** : 121 ÷ 5 = **24.2** → 4 classes à 24 + 1 classe à 25

---

## 🔧 SOLUTION IMPLÉMENTÉE

### 1. Fonction `computeTargetsFromUI_()` créée

**Fichier** : `OptiConfig_System.gs` (lignes 284-310)

```javascript
/**
 * ✅ CORRECTIF TARGETS DYNAMIQUES
 * Calcule les effectifs cibles équitables depuis le nombre total d'élèves
 * @param {Array<string>} classes - Liste des classes (ex: ["6°1", "6°2", ...])
 * @param {number} totalStudents - Nombre total d'élèves
 * @returns {Object} - { "6°1": 24, "6°2": 25, ... }
 */
function computeTargetsFromUI_(classes, totalStudents) {
  const k = classes.length;
  if (k <= 0) throw new Error("Aucune classe UI.");
  if (totalStudents < 0) throw new Error("Total élèves négatif.");
  
  const avg = Math.floor(totalStudents / k);
  let rem = totalStudents - avg * k; // nombre de classes à avg+1

  const targets = {};
  for (const cls of classes) {
    targets[cls] = avg;
  }
  
  // Attribuer +1 aux 'rem' premières classes
  for (let i = 0; i < classes.length && rem > 0; i++, rem--) {
    targets[classes[i]] += 1;
  }
  
  return targets;
}
```

**Exemples** :
- **121 élèves ÷ 5 classes** → `{ "6°1": 25, "6°2": 24, "6°3": 24, "6°4": 24, "6°5": 24 }`
- **120 élèves ÷ 5 classes** → `{ "6°1": 24, "6°2": 24, "6°3": 24, "6°4": 24, "6°5": 24 }`
- **119 élèves ÷ 5 classes** → `{ "6°1": 24, "6°2": 24, "6°3": 24, "6°4": 24, "6°5": 23 }`

---

### 2. Modification de `getOptimizationContext_V2()`

**Fichier** : `OptiConfig_System.gs` (lignes 232-262)

**Avant** :
```javascript
// Effectif : override _OPTI_CONFIG > _STRUCTURE > fallback 25
const override = kvGet_('targets.override.' + classe, 'GLOBAL', null);
if (override) {
  targetsByClass[classe] = Number(override);
} else if (structureRules[classe] && structureRules[classe].capacity) {
  targetsByClass[classe] = structureRules[classe].capacity; // ❌ 28 en dur
} else {
  targetsByClass[classe] = 25; // ❌ Fallback arbitraire
}
```

**Après** :
```javascript
// ✅ CORRECTIF TARGETS DYNAMIQUES : Calculer depuis le nombre réel d'élèves
const totalStudents = countStudentsFromBaseopti_();
logLine('INFO', '  📊 Total élèves dans _BASEOPTI: ' + totalStudents);

let targetsByClass = {};

if (totalStudents > 0) {
  // Calcul équitable : répartir les élèves sur toutes les classes
  targetsByClass = computeTargetsFromUI_(allClasses, totalStudents);
  logLine('INFO', '  ✅ Targets calculées automatiquement (répartition équitable)');
  
  // Afficher les targets calculées
  allClasses.forEach(function(classe) {
    logLine('INFO', '  📊 ' + classe + ' effectif = ' + targetsByClass[classe] + ' (calculé depuis total=' + totalStudents + ')');
  });
} else {
  // Fallback si _BASEOPTI est vide : utiliser _STRUCTURE ou 25
  // (code de fallback conservé pour compatibilité)
}
```

---

### 3. Suppression de `DEFAULT_CAPACITY: 28`

**Fichier** : `Code.gs` (ligne 7)

**Avant** :
```javascript
DEFAULT_CAPACITY: 28,
```

**Après** :
```javascript
DEFAULT_CAPACITY: null, // ✅ PLUS DE VALEUR EN DUR - Calculé dynamiquement
```

---

## 📊 RÉSULTAT ATTENDU

### Avec 121 élèves et 5 classes

**Logs attendus** :
```
[INFO] 📊 Total élèves dans _BASEOPTI: 121
[INFO] ✅ Targets calculées automatiquement (répartition équitable)
[INFO] 📊 6°1 effectif = 25 (calculé depuis total=121)
[INFO] 📊 6°2 effectif = 24 (calculé depuis total=121)
[INFO] 📊 6°3 effectif = 24 (calculé depuis total=121)
[INFO] 📊 6°4 effectif = 24 (calculé depuis total=121)
[INFO] 📊 6°5 effectif = 24 (calculé depuis total=121)
```

**Résultat final** :
```
6°1 (25 élèves, 13F/12M) - LV2: ITA=6
6°2 (24 élèves, 12F/12M)
6°3 (24 élèves, 12F/12M) - OPT: CHAV=10
6°4 (24 élèves, 12F/12M)
6°5 (24 élèves, 12F/12M)

Total: 121 élèves placés
Élèves non placés: 0 ✅
```

---

## 🎯 AVANTAGES

### 1. Adaptabilité totale
- **121 élèves** → 25+24+24+24+24
- **120 élèves** → 24+24+24+24+24
- **119 élèves** → 24+24+24+24+23
- **140 élèves** → 28+28+28+28+28

### 2. Plus de "28" codé en dur
- Fonctionne avec **n'importe quel nombre d'élèves**
- Fonctionne avec **n'importe quel nombre de classes**

### 3. Répartition équitable garantie
- Écart maximum de **1 élève** entre classes
- Les classes avec +1 sont les premières dans l'ordre UI

### 4. Compatibilité avec quotas
- Les quotas LV2/OPT restent respectés (ITA=6, CHAV=10)
- La répartition équitable s'applique **après** les quotas

---

## 🔍 VALIDATION

### Test 1 : 121 élèves / 5 classes

**Commande** :
```javascript
computeTargetsFromUI_(["6°1", "6°2", "6°3", "6°4", "6°5"], 121)
```

**Résultat attendu** :
```javascript
{
  "6°1": 25,
  "6°2": 24,
  "6°3": 24,
  "6°4": 24,
  "6°5": 24
}
```

**Total** : 25 + 24 + 24 + 24 + 24 = **121** ✅

---

### Test 2 : 120 élèves / 5 classes

**Commande** :
```javascript
computeTargetsFromUI_(["6°1", "6°2", "6°3", "6°4", "6°5"], 120)
```

**Résultat attendu** :
```javascript
{
  "6°1": 24,
  "6°2": 24,
  "6°3": 24,
  "6°4": 24,
  "6°5": 24
}
```

**Total** : 24 × 5 = **120** ✅

---

### Test 3 : 121 élèves / 6 classes

**Commande** :
```javascript
computeTargetsFromUI_(["6°1", "6°2", "6°3", "6°4", "6°5", "6°6"], 121)
```

**Résultat attendu** :
```javascript
{
  "6°1": 21,
  "6°2": 20,
  "6°3": 20,
  "6°4": 20,
  "6°5": 20,
  "6°6": 20
}
```

**Total** : 21 + 20 + 20 + 20 + 20 + 20 = **121** ✅

---

## 🚀 IMPACT SUR LES AUTRES PHASES

### Phase 1 (Quotas LV2/OPT)
- ✅ **Aucun impact** : Les quotas restent respectés
- Les 6 ITA vont en 6°1, les 10 CHAV vont en 6°3

### Phase 2 (Codes A/D)
- ✅ **Correctif appliqué** : Lit maintenant `A` et `D` au lieu de `CODE_A` et `CODE_D`
- Les groupes ASSO/DISSO seront détectés correctement

### Phase 3 (Effectifs & Parité)
- ✅ **Utilise `ctx.targets`** calculés dynamiquement
- Complète chaque classe jusqu'à son target réel (24 ou 25)
- Plus de blocage à "10/28" pour 6°3

### Phase 4 (Swaps)
- ✅ **Aucun impact** : Optimise sur les targets corrects
- Peut maintenant appliquer des swaps car les effectifs sont cohérents

---

## 📝 CHECKLIST DE VALIDATION

### Avant le prochain run

- [x] `computeTargetsFromUI_()` créée
- [x] `getOptimizationContext_V2()` modifiée
- [x] `DEFAULT_CAPACITY: 28` supprimé
- [x] Phase 2 lit `A` et `D` au lieu de `CODE_A` et `CODE_D`

### Après le prochain run

- [ ] Logs affichent `Total élèves dans _BASEOPTI: 121`
- [ ] Logs affichent `effectif = 24` ou `effectif = 25` (pas 28)
- [ ] Toutes les classes complètes (current == target)
- [ ] 0 élève non placé
- [ ] Quotas respectés (ITA=6, CHAV=10)

---

## 🎯 CONCLUSION

**Statut** : ✅ **CORRECTIF APPLIQUÉ**

**Fichiers modifiés** :
1. `OptiConfig_System.gs` : +50 lignes (fonction + intégration)
2. `Code.gs` : 1 ligne modifiée

**Bénéfices** :
- ✅ Plus de "28" codé en dur
- ✅ Répartition équitable automatique
- ✅ Adaptabilité totale (n élèves, m classes)
- ✅ Compatible avec quotas LV2/OPT

**Prochaine étape** : Tester en Mode Direct Live avec 121 élèves / 5 classes

---

**Auteur** : Cascade AI  
**Date** : 2025-01-20  
**Référence** : PLAN_ACTION_CANARY_TO_PROD.md
