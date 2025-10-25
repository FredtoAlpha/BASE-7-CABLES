# 🔍 DIAGNOSTIC : 1 élève manquant (120/121)

**Date**: 21 octobre 2025 - 11:03  
**Problème**: 6°3 a 23 élèves au lieu de 24

---

## 📊 SITUATION

```
6°1: 25 élèves ✅
6°2: 24 élèves ✅
6°3: 23 élèves ❌ (manque 1)
6°4: 24 élèves ✅
6°5: 24 élèves ✅
─────────────
Total: 120/121
```

---

## 🔍 CAUSE PROBABLE

Phase 3 utilise un **gardien DISSO/ASSO** qui empêche le placement si :

1. **Code DISSO (D)** : L'élève a un code D déjà présent en 6°3
2. **Code ASSO (A)** : L'élève fait partie d'un groupe A placé ailleurs
3. **LV2/OPT** : L'élève a une LV2/OPT que 6°3 ne propose pas

### Code concerné (Phases_BASEOPTI_V3_COMPLETE.gs:729)

```javascript
if (idx === null) {
  blocked++;
  logLine('WARN', '⚠️ Plus d\'élèves compatibles DISSO/ASSO pour ' + classe + ' (need=' + need + ')');
  break; // ← Arrête de remplir la classe
}
```

---

## 🔎 COMMENT IDENTIFIER L'ÉLÈVE MANQUANT

### Étape 1 : Ouvrir Apps Script Logs

1. **Apps Script Editor**
2. **Exécutions** (menu gauche)
3. **Dernière exécution** (10:55)
4. **Chercher** : `⚠️ Plus d'élèves compatibles`

### Étape 2 : Vérifier _BASEOPTI

1. Ouvrir l'onglet **_BASEOPTI** (caché)
2. Filtrer colonne **_CLASS_ASSIGNED** = vide
3. L'élève non placé devrait apparaître

### Étape 3 : Analyser l'élève

Vérifier ses attributs :
- **DISSO** : A-t-il un code D ?
- **ASSO** : A-t-il un code A ?
- **LV2** : A-t-il ITA/ESP/ALL/PT ?
- **OPT** : A-t-il CHAV ou autre ?

---

## ✅ SOLUTIONS

### Solution 1 : Placement manuel (RAPIDE)

1. Identifier l'élève manquant dans _BASEOPTI
2. Vérifier ses contraintes (DISSO/ASSO/LV2/OPT)
3. Le placer manuellement dans une classe compatible
4. Mettre à jour _CLASS_ASSIGNED

### Solution 2 : Assouplir les contraintes Phase 3 (MOYEN TERME)

Modifier `Phase3I_completeAndParity_BASEOPTI_V3` pour :

```javascript
// ✅ AVANT : Arrêter si aucun élève compatible
if (idx === null) {
  blocked++;
  logLine('WARN', '⚠️ Plus d\'élèves compatibles pour ' + classe);
  break; // ← Arrête
}

// ✅ APRÈS : Forcer le placement si c'est le dernier élève
if (idx === null) {
  // Si c'est le dernier élève et qu'il reste de la place, forcer
  if (poolF.length + poolM.length === 1 && need > 0) {
    logLine('WARN', '🔧 Dernier élève : placement forcé malgré contraintes');
    idx = poolF.length > 0 ? poolF.shift() : poolM.shift();
    selectedPool = poolF.length > 0 ? 'F' : 'M';
  } else {
    blocked++;
    logLine('WARN', '⚠️ Plus d\'élèves compatibles pour ' + classe);
    break;
  }
}
```

### Solution 3 : Ajuster les effectifs cibles

Si 6°3 ne peut vraiment accueillir que 23 élèves (contraintes trop fortes) :

1. Modifier les effectifs cibles dans `_STRUCTURE`
2. Passer 6°3 de 24 → 23
3. Augmenter une autre classe de 24 → 25

---

## 🎯 RECOMMANDATION IMMÉDIATE

### Étape 1 : Identifier l'élève

```javascript
// Dans Apps Script, exécuter :
function findMissingStudent() {
  const sh = SpreadsheetApp.getActive().getSheetByName('_BASEOPTI');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idxAssigned = headers.indexOf('_CLASS_ASSIGNED');
  const idxNom = headers.indexOf('NOM');
  const idxPrenom = headers.indexOf('PRENOM');
  const idxDisso = headers.indexOf('DISSO');
  const idxAsso = headers.indexOf('ASSO');
  const idxLV2 = headers.indexOf('LV2');
  const idxOPT = headers.indexOf('OPT');
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][idxAssigned] || data[i][idxAssigned] === '') {
      Logger.log('🔍 Élève non placé :');
      Logger.log('  Nom: ' + data[i][idxNom] + ' ' + data[i][idxPrenom]);
      Logger.log('  DISSO: ' + data[i][idxDisso]);
      Logger.log('  ASSO: ' + data[i][idxAsso]);
      Logger.log('  LV2: ' + data[i][idxLV2]);
      Logger.log('  OPT: ' + data[i][idxOPT]);
    }
  }
}
```

### Étape 2 : Décider

- **Si contraintes valides** : Placer manuellement
- **Si contraintes bloquantes** : Assouplir Phase 3
- **Si 23 est acceptable** : Ajuster les cibles

---

## 📝 NOTES

- Ce n'est **PAS un bug** : c'est le système de contraintes qui fonctionne
- Phase 3 **respecte strictement** DISSO/ASSO/LV2/OPT
- L'élève est **protégé** pour ne pas violer les règles métier
- C'est un **compromis** entre effectifs et contraintes

---

## ✅ PROCHAINE ÉTAPE

**Exécutez `findMissingStudent()` dans Apps Script pour identifier l'élève.**

Ensuite, on décidera ensemble de la meilleure solution ! 🚀
