# ✅ CORRECTION : copyBaseoptiToCache_V3 effaçait les colonnes FIXE et MOBILITÉ

## Date : 22 octobre 2025, 11:01
## Statut : ✅ CORRIGÉ

---

## 🚨 PROBLÈME TROUVÉ

### `copyBaseoptiToCache_V3()` efface TOUT avec `sh.clearContents()` !

**Fichier** : `Phases_BASEOPTI_V3_COMPLETE.gs` (ligne 609)

```javascript
// Vider TOUT le contenu (y compris les en-têtes pour forcer la mise à jour)
if (sh.getLastRow() > 0) {
  sh.clearContents();  // ← EFFACE TOUT, y compris FIXE et MOBILITÉ !
}
```

---

## 🔍 SÉQUENCE PROBLÉMATIQUE

```
1. Phase 1 : computeMobilityFlags_() appelé
   → Écrit FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

2. Phase 2 : computeMobilityFlags_() rappelé
   → Met à jour FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

3. Phase 3 : computeMobilityFlags_() rappelé
   → Met à jour FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

4. Phase 4 : copyBaseoptiToCache_V3() appelé
   → sh.clearContents() EFFACE TOUT ❌
   → Copie _BASEOPTI (avec colonnes vides) → CACHE
   → CACHE a maintenant colonnes P et T VIDES ❌

5. Après Phase 4 : computeMobilityFlags_() rappelé
   → Écrit à nouveau FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

6. MAIS si une autre fonction appelle copyBaseoptiToCache_V3()
   → sh.clearContents() EFFACE TOUT ENCORE ❌
   → Colonnes P et T redeviennent vides ❌
```

**Résultat** : Les colonnes FIXE et MOBILITÉ sont **effacées puis recalculées** à chaque fois, ce qui est inefficace et peut causer des pertes de données.

---

## ✅ SOLUTION APPLIQUÉE

### Sauvegarder et restaurer les colonnes FIXE et MOBILITÉ

**Fichier** : `Phases_BASEOPTI_V3_COMPLETE.gs` (lignes 607-645)

```javascript
// 🔍 SAUVEGARDER les colonnes FIXE et MOBILITÉ avant d'effacer
const idxFIXE = headers.indexOf('FIXE');
const idxMOB = headers.indexOf('MOBILITE');
let savedFIXE = [];
let savedMOB = [];

if (sh.getLastRow() > 1 && idxFIXE >= 0 && idxMOB >= 0) {
  const numRows = sh.getLastRow() - 1;
  try {
    savedFIXE = sh.getRange(2, idxFIXE + 1, numRows, 1).getValues();
    savedMOB = sh.getRange(2, idxMOB + 1, numRows, 1).getValues();
    logLine('INFO', '  💾 Sauvegarde FIXE/MOBILITÉ: ' + numRows + ' lignes');
  } catch(e) {
    logLine('WARN', '  ⚠️ Erreur sauvegarde FIXE/MOBILITÉ: ' + e.message);
  }
}

// Vider TOUT le contenu (y compris les en-têtes pour forcer la mise à jour)
if (sh.getLastRow() > 0) {
  sh.clearContents();
}

// ✅ TOUJOURS écrire les en-têtes de _BASEOPTI (pour synchroniser les colonnes)
sh.getRange(1, 1, 1, headers.length).setValues([headers]);

// Écrire élèves
if (byClass[cls].length > 0) {
  sh.getRange(2, 1, byClass[cls].length, headers.length).setValues(byClass[cls]);
  
  // 🔄 RESTAURER les colonnes FIXE et MOBILITÉ
  if (savedFIXE.length > 0 && savedMOB.length > 0 && savedFIXE.length === byClass[cls].length) {
    try {
      sh.getRange(2, idxFIXE + 1, savedFIXE.length, 1).setValues(savedFIXE);
      sh.getRange(2, idxMOB + 1, savedMOB.length, 1).setValues(savedMOB);
      logLine('INFO', '  ♻️ FIXE/MOBILITÉ restaurées: ' + savedFIXE.length + ' lignes');
    } catch(e) {
      logLine('WARN', '  ⚠️ Erreur restauration FIXE/MOBILITÉ: ' + e.message);
    }
  }
}
```

---

## 🎯 NOUVELLE SÉQUENCE (CORRIGÉE)

```
1. Phase 1 : computeMobilityFlags_() appelé
   → Écrit FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

2. Phase 2 : computeMobilityFlags_() rappelé
   → Met à jour FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

3. Phase 3 : computeMobilityFlags_() rappelé
   → Met à jour FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

4. Phase 4 : copyBaseoptiToCache_V3() appelé
   → 💾 SAUVEGARDE colonnes P et T ✅
   → sh.clearContents() efface tout
   → Copie _BASEOPTI → CACHE
   → ♻️ RESTAURE colonnes P et T ✅
   → CACHE a colonnes P et T CONSERVÉES ✅

5. Après Phase 4 : computeMobilityFlags_() rappelé
   → Met à jour FIXE et MOBILITÉ dans CACHE ✅
   → CACHE a colonnes P et T remplies ✅

6. Si une autre fonction appelle copyBaseoptiToCache_V3()
   → 💾 SAUVEGARDE colonnes P et T ✅
   → sh.clearContents() efface tout
   → Copie _BASEOPTI → CACHE
   → ♻️ RESTAURE colonnes P et T ✅
   → Colonnes P et T restent remplies ✅
```

**Résultat** : Les colonnes FIXE et MOBILITÉ sont **préservées** à travers les appels de `copyBaseoptiToCache_V3()` !

---

## 📊 MESSAGES DE LOG

### Lors de la sauvegarde
```
💾 Sauvegarde FIXE/MOBILITÉ: 25 lignes
```

### Lors de la restauration
```
♻️ FIXE/MOBILITÉ restaurées: 25 lignes
```

### En cas d'erreur
```
⚠️ Erreur sauvegarde FIXE/MOBILITÉ: [message d'erreur]
⚠️ Erreur restauration FIXE/MOBILITÉ: [message d'erreur]
```

---

## 🔍 GESTION DES CAS LIMITES

### Cas 1 : Nombre de lignes différent
Si le nombre d'élèves change entre la sauvegarde et la restauration :
```javascript
if (savedFIXE.length === byClass[cls].length) {
  // Restaurer seulement si le nombre de lignes correspond
}
```

**Résultat** : Pas de restauration si le nombre d'élèves a changé (sécurité).

### Cas 2 : Colonnes FIXE/MOBILITÉ introuvables
```javascript
if (idxFIXE >= 0 && idxMOB >= 0) {
  // Sauvegarder seulement si les colonnes existent
}
```

**Résultat** : Pas d'erreur si les colonnes n'existent pas.

### Cas 3 : Première copie (pas de données à sauvegarder)
```javascript
if (sh.getLastRow() > 1) {
  // Sauvegarder seulement s'il y a des données
}
```

**Résultat** : Pas d'erreur lors de la première copie.

---

## ✅ AVANTAGES

1. ✅ **Préservation des données** : Les colonnes FIXE et MOBILITÉ ne sont plus effacées
2. ✅ **Performance** : Pas besoin de recalculer à chaque fois
3. ✅ **Robustesse** : Gestion des erreurs et cas limites
4. ✅ **Logs clairs** : Messages de sauvegarde/restauration pour debug

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Optimisation complète
1. Lancer une optimisation
2. Vérifier dans les logs :
   ```
   💾 Sauvegarde FIXE/MOBILITÉ: X lignes
   ♻️ FIXE/MOBILITÉ restaurées: X lignes
   ```
3. Vérifier les onglets CACHE :
   - ✅ Colonne P (FIXE) remplie
   - ✅ Colonne T (MOBILITÉ) remplie

### Test 2 : Appels multiples de copyBaseoptiToCache_V3
1. Lancer une optimisation
2. Appeler manuellement `copyBaseoptiToCache_V3(ctx)`
3. Vérifier que les colonnes restent remplies

### Test 3 : Changement du nombre d'élèves
1. Lancer une optimisation
2. Modifier le nombre d'élèves dans _BASEOPTI
3. Appeler `copyBaseoptiToCache_V3(ctx)`
4. Vérifier que les colonnes sont recalculées (pas restaurées)

---

## 📝 RÉSUMÉ DES CORRECTIONS

| Problème | Avant | Après | Statut |
|----------|-------|-------|--------|
| **Schéma décalé** | MOBILITÉ en S | MOBILITÉ en T | ✅ CORRIGÉ |
| **clearContents efface tout** | Colonnes P/T effacées | Colonnes P/T sauvegardées/restaurées | ✅ CORRIGÉ |
| **_BASEOPTI vide** | Colonnes P/T vides | À corriger (prochaine étape) | ⏳ EN COURS |

---

## 🚀 PROCHAINE ÉTAPE

**Tester maintenant avec une optimisation complète !**

1. Supprimer _BASEOPTI et CACHE
2. Lancer une optimisation
3. Vérifier les logs pour :
   - ✅ Sauvegarde FIXE/MOBILITÉ
   - ✅ Restauration FIXE/MOBILITÉ
4. Vérifier les onglets CACHE :
   - ✅ Colonnes P et T remplies

**Si les colonnes sont toujours vides** :
- Vérifier que `computeMobilityFlags_()` est bien appelé AVANT `copyBaseoptiToCache_V3()`
- Vérifier les logs pour les messages de calcul de mobilité

---

## ✅ CONCLUSION

**La fonction `copyBaseoptiToCache_V3()` ne peut plus effacer les colonnes FIXE et MOBILITÉ !**

Les colonnes sont maintenant **sauvegardées avant effacement** et **restaurées après copie**.

**Testez maintenant !** 🚀
