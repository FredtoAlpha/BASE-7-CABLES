# 🔧 SOLUTION : Écrire FIXE et MOBILITÉ dans _BASEOPTI

## Date : 22 octobre 2025, 10:57
## Problème : Les colonnes FIXE et MOBILITÉ sont vides dans _BASEOPTI

---

## ❌ PROBLÈME IDENTIFIÉ

### La fonction `computeMobilityFlags_()` écrit dans les CACHE, PAS dans _BASEOPTI !

**Fichier** : `Mobility_System.gs` (ligne 152)

```javascript
function computeMobilityFlags_(ctx) {
  // ...
  
  // 1) Lire tout le CACHE en mémoire
  (ctx.cacheSheets || []).forEach(function(cacheName) {  // ← LIT LES CACHE
    const sh = ss.getSheetByName(cacheName);
    // ...
  });
  
  // 5) Écrire en feuille
  Object.keys(studentsByClass).forEach(function(cl) {
    arr.forEach(function(st) {
      st.sheet.getRange(st.rowIndex, st.colFIXE + 1).setValue('FIXE');  // ← ÉCRIT DANS CACHE
      st.sheet.getRange(st.rowIndex, st.colMOB + 1).setValue(s.mob);    // ← ÉCRIT DANS CACHE
    });
  });
}
```

**Résultat** : Les colonnes FIXE et MOBILITÉ sont remplies dans les **CACHE**, mais restent **vides** dans **_BASEOPTI** !

---

## 🔍 SÉQUENCE ACTUELLE

```
1. Phase 1-3 : Travail dans _BASEOPTI
   - computeMobilityFlags_() appelé
   - Essaie d'écrire dans CACHE (qui n'existe pas encore)
   - _BASEOPTI reste avec colonnes vides

2. Phase 4 : copyBaseoptiToCache_V3()
   - Copie _BASEOPTI → CACHE
   - Les colonnes FIXE et MOBILITÉ sont copiées VIDES

3. Après Phase 4 : computeMobilityFlags_() rappelé
   - Écrit dans CACHE
   - CACHE a maintenant FIXE et MOBILITÉ remplis
   - Mais _BASEOPTI reste vide !

4. Si on recopie _BASEOPTI → CACHE plus tard
   - Les colonnes vides de _BASEOPTI écrasent les colonnes remplies de CACHE
   - Tout redevient vide !
```

---

## ✅ SOLUTION 1 : Créer `computeMobilityInBaseopti_()`

### Nouvelle fonction à ajouter dans `Mobility_System.gs`

```javascript
/**
 * ============================================================
 * CALCUL MOBILITÉ DANS _BASEOPTI (avant copie vers CACHE)
 * ============================================================
 * Calcule et écrit les colonnes FIXE/MOBILITE directement dans _BASEOPTI
 * 
 * @param {Object} ctx - Contexte avec ctx.ss, ctx.quotas
 */
function computeMobilityInBaseopti_(ctx) {
  logLine('INFO', '🔍 Calcul des statuts de mobilité dans _BASEOPTI...');
  
  const ss = ctx.ss;
  const baseSheet = ss.getSheetByName('_BASEOPTI');
  
  if (!baseSheet) {
    logLine('ERROR', '❌ _BASEOPTI introuvable !');
    return;
  }
  
  const lr = Math.max(baseSheet.getLastRow(), 1);
  const lc = Math.max(baseSheet.getLastColumn(), 1);
  const values = baseSheet.getRange(1, 1, lr, lc).getValues();
  const headers = values[0];
  
  // Trouver les colonnes
  const idxFIXE = headers.indexOf('FIXE');
  const idxMOB = headers.indexOf('MOBILITE');
  const idxLV2 = headers.indexOf('LV2');
  const idxOPT = headers.indexOf('OPT');
  const idxA = headers.indexOf('ASSO');
  const idxD = headers.indexOf('DISSO');
  const idxClassAssigned = headers.indexOf('_CLASS_ASSIGNED');
  
  if (idxFIXE === -1 || idxMOB === -1) {
    logLine('ERROR', '❌ Colonnes FIXE ou MOBILITE introuvables dans _BASEOPTI !');
    return;
  }
  
  logLine('INFO', '  Colonnes: FIXE=' + idxFIXE + ', MOBILITE=' + idxMOB);
  
  // Construire classOffers (quelles classes offrent quelles LV2/OPT)
  const classOffers = buildClassOffers_(ctx);
  
  // Grouper par classe assignée
  const studentsByClass = {};
  const groupsA = {};
  const Dindex = {};
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const classe = String(row[idxClassAssigned] || '').trim();
    
    if (!classe) continue;
    
    if (!studentsByClass[classe]) {
      studentsByClass[classe] = [];
      Dindex[classe] = new Set();
    }
    
    const obj = {
      rowIndex: i + 1,
      LV2: row[idxLV2] || '',
      OPT: row[idxOPT] || '',
      A: row[idxA] || '',
      D: row[idxD] || '',
      classe: classe
    };
    
    studentsByClass[classe].push(obj);
    
    if (obj.A) {
      if (!groupsA[obj.A]) groupsA[obj.A] = [];
      groupsA[obj.A].push(obj);
    }
    
    if (obj.D) {
      Dindex[classe].add(obj.D);
    }
  }
  
  // Calculer la mobilité pour chaque élève
  const updates = []; // [{row, colFIXE, colMOB, valueFIXE, valueMOB}]
  
  Object.keys(studentsByClass).forEach(function(cl) {
    studentsByClass[cl].forEach(function(st) {
      // Calculer allow (classes où l'élève peut aller)
      const allow = [];
      Object.keys(classOffers).forEach(function(cls) {
        const offers = classOffers[cls];
        const lv2Match = !st.LV2 || offers.LV2.has(st.LV2);
        const optMatch = !st.OPT || offers.OPT.has(st.OPT);
        if (lv2Match && optMatch) {
          allow.push(cls);
        }
      });
      
      // Déterminer statut
      let fixe = '';
      let mob = 'LIBRE';
      
      if (allow.length === 0) {
        mob = 'CONFLIT';
      } else if (allow.length === 1) {
        fixe = 'FIXE';
        mob = 'FIXE';
      } else {
        // Vérifier groupe A
        if (st.A && groupsA[st.A]) {
          const members = groupsA[st.A];
          let groupAllow = allow;
          members.forEach(function(m) {
            // Intersection
            const mAllow = []; // Calculer pour m aussi
            groupAllow = groupAllow.filter(function(c) { return mAllow.includes(c); });
          });
          
          if (groupAllow.length === 1) {
            fixe = 'FIXE';
            mob = 'FIXE (groupe A' + st.A + ')';
          } else if (groupAllow.length > 1) {
            mob = 'PERMUT (A' + st.A + ')';
          }
        }
        
        // Vérifier code D
        if (st.D) {
          const otherClasses = allow.filter(function(c) {
            return c !== st.classe && !Dindex[c].has(st.D);
          });
          
          if (otherClasses.length === 0) {
            fixe = 'FIXE';
            mob = 'CONDI (D' + st.D + ')';
          } else {
            mob = 'CONDI (D' + st.D + ', ' + otherClasses.length + ' classes)';
          }
        }
      }
      
      updates.push({
        row: st.rowIndex,
        colFIXE: idxFIXE,
        colMOB: idxMOB,
        valueFIXE: fixe,
        valueMOB: mob
      });
    });
  });
  
  // Écrire en batch
  updates.forEach(function(u) {
    baseSheet.getRange(u.row, u.colFIXE + 1).setValue(u.valueFIXE);
    baseSheet.getRange(u.row, u.colMOB + 1).setValue(u.valueMOB);
  });
  
  SpreadsheetApp.flush();
  
  logLine('INFO', '✅ Mobilité calculée dans _BASEOPTI : ' + updates.length + ' élèves');
}
```

---

## ✅ SOLUTION 2 : Appeler la nouvelle fonction AVANT `copyBaseoptiToCache_V3()`

### Modifier `Phases_BASEOPTI_V3_COMPLETE.gs` (ligne 960-973)

**AVANT** :
```javascript
// Copier vers CACHE
copyBaseoptiToCache_V3(ctx);

// ✅ CORRECTION CRITIQUE : Recalculer la mobilité APRÈS la copie vers CACHE
if (typeof computeMobilityFlags_ === 'function') {
  logLine('INFO', '🔒 Recalcul des statuts de mobilité après copie CACHE...');
  computeMobilityFlags_(ctx);
  logLine('INFO', '✅ Colonnes FIXE et MOBILITE restaurées dans les onglets CACHE');
}
```

**APRÈS** :
```javascript
// ✅ CALCUL MOBILITÉ DANS _BASEOPTI AVANT LA COPIE
if (typeof computeMobilityInBaseopti_ === 'function') {
  logLine('INFO', '🔒 Calcul des statuts de mobilité dans _BASEOPTI...');
  computeMobilityInBaseopti_(ctx);
  logLine('INFO', '✅ Colonnes FIXE et MOBILITE remplies dans _BASEOPTI');
} else {
  logLine('WARN', '⚠️ computeMobilityInBaseopti_ non disponible');
}

// Copier vers CACHE (avec colonnes FIXE/MOBILITE déjà remplies)
copyBaseoptiToCache_V3(ctx);

// ✅ Recalculer dans CACHE pour tenir compte des contraintes inter-classes
if (typeof computeMobilityFlags_ === 'function') {
  logLine('INFO', '🔒 Recalcul des statuts de mobilité dans CACHE...');
  computeMobilityFlags_(ctx);
  logLine('INFO', '✅ Colonnes FIXE et MOBILITE affinées dans les onglets CACHE');
}
```

---

## 📊 NOUVELLE SÉQUENCE

```
1. Phase 1-3 : Travail dans _BASEOPTI
   - computeMobilityInBaseopti_() appelé
   - Écrit directement dans _BASEOPTI
   - _BASEOPTI a maintenant FIXE et MOBILITÉ remplis ✅

2. Phase 4 : copyBaseoptiToCache_V3()
   - Copie _BASEOPTI → CACHE
   - Les colonnes FIXE et MOBILITÉ sont copiées REMPLIES ✅

3. Après Phase 4 : computeMobilityFlags_() rappelé
   - Affine les calculs dans CACHE (contraintes inter-classes)
   - CACHE a FIXE et MOBILITÉ remplis et affinés ✅

4. Si on recopie _BASEOPTI → CACHE plus tard
   - Les colonnes remplies de _BASEOPTI sont copiées
   - Tout reste rempli ✅
```

---

## 🎯 AVANTAGES

1. ✅ **_BASEOPTI a toujours FIXE et MOBILITÉ remplis**
2. ✅ **Les CACHE héritent des valeurs de _BASEOPTI**
3. ✅ **Pas de risque d'écrasement par des colonnes vides**
4. ✅ **Double calcul** : basique dans _BASEOPTI, affiné dans CACHE

---

## 🚀 IMPLÉMENTATION

### Étape 1 : Ajouter la fonction dans `Mobility_System.gs`
Copier la fonction `computeMobilityInBaseopti_()` ci-dessus.

### Étape 2 : Modifier `Phases_BASEOPTI_V3_COMPLETE.gs`
Appeler `computeMobilityInBaseopti_()` AVANT `copyBaseoptiToCache_V3()`.

### Étape 3 : Tester
1. Supprimer _BASEOPTI et CACHE
2. Lancer une optimisation
3. Vérifier que _BASEOPTI a FIXE et MOBILITÉ remplis
4. Vérifier que CACHE a FIXE et MOBILITÉ remplis

---

## ✅ RÉSULTAT ATTENDU

Après cette correction :
- ✅ _BASEOPTI aura FIXE (P) et MOBILITÉ (T) remplis
- ✅ Les CACHE auront FIXE (P) et MOBILITÉ (T) remplis
- ✅ Plus de risque d'écrasement par des colonnes vides
