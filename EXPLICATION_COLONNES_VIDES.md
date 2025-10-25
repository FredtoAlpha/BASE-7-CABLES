# 🔍 EXPLICATION : Colonnes P (FIXE) et T (MOBILITÉ) vides

## Date : 22 octobre 2025, 10:44
## Problème : Les colonnes FIXE et MOBILITÉ sont vides dans les onglets CACHE après optimisation

---

## ❌ CAUSE RACINE

### 1. **_BASEOPTI contient les colonnes mais elles sont VIDES**

Le schéma `BASE_SCHEMA` dans `BASEOPTI_System.gs` inclut bien les colonnes :
```javascript
const BASE_SCHEMA = [
  "ID_ELEVE", "NOM", "PRENOM", "NOM & PRENOM", "SEXE", "LV2", "OPT",
  "COM", "TRA", "PART", "ABS", "DISPO", "ASSO", "DISSO",
  "SOURCE", "FIXE", "CLASSE_FINAL", "CLASSE_DEF", "MOBILITE",  // ← Colonnes P et T
  "SCORE F", "SCORE M", "GROUP",
  "_ID", "_PLACED", "_TARGET_CLASS"
];
```

**MAIS** : Lors de la création de `_BASEOPTI`, ces colonnes sont créées **VIDES** car :
- Elles ne sont pas remplies à la source (données importées)
- Elles doivent être **calculées** après l'optimisation

### 2. **copyBaseoptiToCache_V3 copie les données TELLES QUELLES**

**Fichier** : `Phases_BASEOPTI_V3_COMPLETE.gs` (ligne 535-628)

```javascript
function copyBaseoptiToCache_V3(ctx) {
  // ...
  
  // Ligne 613 : Copie les en-têtes de _BASEOPTI
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Ligne 617 : Copie les données de _BASEOPTI (y compris les colonnes vides)
  sh.getRange(2, 1, byClass[cls].length, headers.length).setValues(byClass[cls]);
}
```

**Résultat** : Les colonnes FIXE et MOBILITE sont copiées **vides** depuis `_BASEOPTI` vers les onglets CACHE.

### 3. **computeMobilityFlags_ DEVRAIT être appelé APRÈS la copie**

**Fichier** : `Phases_BASEOPTI_V3_COMPLETE.gs` (ligne 963-973)

```javascript
// Copier vers CACHE
copyBaseoptiToCache_V3(ctx);

// ✅ CORRECTION CRITIQUE : Recalculer la mobilité APRÈS la copie vers CACHE
// Car copyBaseoptiToCache_V3 efface les colonnes FIXE/MOBILITE (elles sont vides dans _BASEOPTI)
if (typeof computeMobilityFlags_ === 'function') {
  logLine('INFO', '🔒 Recalcul des statuts de mobilité après copie CACHE...');
  computeMobilityFlags_(ctx);
  logLine('INFO', '✅ Colonnes FIXE et MOBILITE restaurées dans les onglets CACHE');
} else {
  logLine('WARN', '⚠️ computeMobilityFlags_ non disponible (vérifier que Mobility_System.gs est chargé)');
}
```

**MAIS** : Si cette fonction **n'est PAS appelée** ou **échoue silencieusement**, les colonnes restent vides !

---

## 🔍 CAUSES POSSIBLES

### Cause 1 : `computeMobilityFlags_` n'est PAS appelé

**Vérification** : Cherchez dans les logs :
```
🔒 Recalcul des statuts de mobilité après copie CACHE...
✅ Colonnes FIXE et MOBILITE restaurées dans les onglets CACHE
```

**Si ces messages n'apparaissent PAS** → La fonction n'est pas appelée !

**Raisons possibles** :
- Le code n'est pas exécuté (condition `if` non remplie)
- Le fichier `Mobility_System.gs` n'est pas chargé
- La fonction n'existe pas dans le scope

### Cause 2 : `computeMobilityFlags_` échoue silencieusement

**Vérification** : Cherchez dans les logs :
```
ERROR: ...
```

**Si une erreur apparaît** → La fonction est appelée mais échoue !

**Raisons possibles** :
- Erreur dans le calcul de la mobilité
- Colonnes manquantes dans les onglets CACHE
- Problème avec `ctx.cacheSheets`

### Cause 3 : `computeMobilityFlags_` est appelé mais ne remplit pas les colonnes

**Vérification** : Vérifiez que la fonction écrit bien dans les colonnes :

```javascript
// Ligne 164-165 de Mobility_System.gs
const colFIXE = ensureColumn_(sh, 'FIXE');
const colMOB = ensureColumn_(sh, 'MOBILITE');
```

**Si `ensureColumn_` ne fonctionne pas** → Les colonnes ne sont pas créées/trouvées !

---

## 🔧 SOLUTIONS

### Solution 1 : Vérifier que `computeMobilityFlags_` est bien appelé

**Ajouter des logs de debug** dans `Phases_BASEOPTI_V3_COMPLETE.gs` (ligne 967) :

```javascript
if (typeof computeMobilityFlags_ === 'function') {
  logLine('INFO', '🔒 Recalcul des statuts de mobilité après copie CACHE...');
  logLine('INFO', '   ctx.cacheSheets: ' + JSON.stringify(ctx.cacheSheets));
  logLine('INFO', '   typeof computeMobilityFlags_: ' + typeof computeMobilityFlags_);
  
  try {
    computeMobilityFlags_(ctx);
    logLine('INFO', '✅ Colonnes FIXE et MOBILITE restaurées dans les onglets CACHE');
  } catch (error) {
    logLine('ERROR', '❌ Erreur dans computeMobilityFlags_: ' + error.message);
    logLine('ERROR', '   Stack: ' + error.stack);
  }
} else {
  logLine('WARN', '⚠️ computeMobilityFlags_ non disponible');
  logLine('WARN', '   typeof computeMobilityFlags_: ' + typeof computeMobilityFlags_);
}
```

### Solution 2 : Vérifier que `Mobility_System.gs` est chargé

**Ajouter un log au début de `Mobility_System.gs`** :

```javascript
// Au début du fichier
logLine('INFO', '✅ Mobility_System.gs chargé');
```

**Vérifier dans les logs** que ce message apparaît au démarrage.

### Solution 3 : Forcer l'appel de `computeMobilityFlags_`

**Modifier `Phases_BASEOPTI_V3_COMPLETE.gs` (ligne 967)** :

```javascript
// AVANT (avec condition)
if (typeof computeMobilityFlags_ === 'function') {
  computeMobilityFlags_(ctx);
}

// APRÈS (sans condition, avec gestion d'erreur)
try {
  computeMobilityFlags_(ctx);
  logLine('INFO', '✅ Colonnes FIXE et MOBILITE restaurées');
} catch (error) {
  logLine('ERROR', '❌ Erreur mobilité: ' + error.message);
  throw error; // Arrêter l'optimisation si la mobilité échoue
}
```

### Solution 4 : Vérifier `ensureColumn_`

**Vérifier que la fonction `ensureColumn_` existe et fonctionne** :

```javascript
function ensureColumn_(sh, colName) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  let idx = headers.indexOf(colName);
  
  if (idx === -1) {
    // Colonne n'existe pas, l'ajouter
    idx = headers.length;
    sh.getRange(1, idx + 1).setValue(colName);
    logLine('INFO', '  ➕ Colonne ' + colName + ' ajoutée à l\'index ' + idx);
  }
  
  return idx;
}
```

---

## 🧪 TESTS DE DIAGNOSTIC

### Test 1 : Vérifier les logs

**Lancer une optimisation et chercher dans les logs** :

```
✅ À chercher :
🔒 Recalcul des statuts de mobilité après copie CACHE...
✅ Colonnes FIXE et MOBILITE restaurées dans les onglets CACHE

❌ Si absent :
⚠️ computeMobilityFlags_ non disponible
```

### Test 2 : Vérifier _BASEOPTI

**Ouvrir l'onglet `_BASEOPTI`** et vérifier :
- ✅ Colonne P existe (FIXE)
- ✅ Colonne T existe (MOBILITE)
- ❌ Colonnes P et T sont **vides** (normal avant calcul)

### Test 3 : Vérifier les onglets CACHE

**Ouvrir un onglet CACHE (ex: `6°1CACHE`)** et vérifier :
- ✅ Colonne P existe (FIXE)
- ✅ Colonne T existe (MOBILITE)
- ❌ Colonnes P et T sont **vides** (PROBLÈME !)
- ✅ Colonnes P et T sont **remplies** (OK !)

### Test 4 : Vérifier manuellement

**Exécuter manuellement `computeMobilityFlags_`** :

1. Ouvrir l'éditeur de script
2. Créer une fonction de test :
```javascript
function testComputeMobility() {
  const ss = SpreadsheetApp.getActive();
  const ctx = {
    ss: ss,
    cacheSheets: ['6°1CACHE', '6°2CACHE', '6°3CACHE', '6°4CACHE', '6°5CACHE'],
    quotas: {} // À remplir si nécessaire
  };
  
  computeMobilityFlags_(ctx);
  
  Logger.log('✅ Test terminé, vérifiez les onglets CACHE');
}
```
3. Exécuter `testComputeMobility()`
4. Vérifier les onglets CACHE

---

## 📊 SÉQUENCE NORMALE

### Séquence attendue

```
1. Optimisation démarre
2. _BASEOPTI créé avec colonnes FIXE et MOBILITE (vides)
3. Phases 1-4 s'exécutent
4. copyBaseoptiToCache_V3() copie _BASEOPTI → CACHE (colonnes vides)
5. computeMobilityFlags_() calcule et remplit FIXE et MOBILITE
6. Onglets CACHE ont maintenant FIXE et MOBILITE remplis
7. Optimisation terminée
```

### Séquence actuelle (problème)

```
1. Optimisation démarre
2. _BASEOPTI créé avec colonnes FIXE et MOBILITE (vides)
3. Phases 1-4 s'exécutent
4. copyBaseoptiToCache_V3() copie _BASEOPTI → CACHE (colonnes vides)
5. ❌ computeMobilityFlags_() N'EST PAS APPELÉ ou ÉCHOUE
6. ❌ Onglets CACHE ont FIXE et MOBILITE VIDES
7. Optimisation terminée
```

---

## ✅ RÉSUMÉ

**Problème** : Colonnes P (FIXE) et T (MOBILITÉ) vides dans les onglets CACHE

**Cause** : `computeMobilityFlags_()` n'est pas appelé ou échoue silencieusement après `copyBaseoptiToCache_V3()`

**Solution** : 
1. Vérifier les logs pour confirmer que `computeMobilityFlags_()` est appelé
2. Ajouter des logs de debug pour tracer l'exécution
3. Forcer l'appel avec gestion d'erreur explicite
4. Vérifier que `Mobility_System.gs` est bien chargé

**Prochaine étape** : Exécuter une optimisation et **copier-coller les logs complets** pour diagnostic.
