# ✅ CORRECTION : Schéma _BASEOPTI - Colonne MOBILITÉ décalée

## Date : 22 octobre 2025, 10:54
## Statut : ✅ CORRIGÉ

---

## 🚨 PROBLÈME IDENTIFIÉ

**Les colonnes P (FIXE) et T (MOBILITÉ) sont vides dans les onglets CACHE.**

**Cause racine** : La colonne MOBILITÉ était en **colonne S** au lieu de **colonne T** dans `_BASEOPTI` !

---

## 🔍 ANALYSE DU DÉCALAGE

### Schéma AVANT correction

```javascript
const BASE_SCHEMA = [
  "ID_ELEVE", "NOM", "PRENOM", "NOM & PRENOM", "SEXE", "LV2", "OPT",
  "COM", "TRA", "PART", "ABS", "DISPO", "ASSO", "DISSO",
  "SOURCE", "FIXE", "CLASSE_FINAL", "CLASSE_DEF", "MOBILITE",  // ← MOBILITE en S !
  "SCORE F", "SCORE M", "GROUP", 
  "_ID", "_PLACED", "_TARGET_CLASS"
];
```

### Mapping des colonnes AVANT

| Colonne | Nom | Statut |
|---------|-----|--------|
| P | FIXE | ✅ OK |
| Q | CLASSE_FINAL | ✅ OK |
| R | CLASSE_DEF | ✅ OK |
| **S** | **MOBILITE** | ❌ DEVRAIT ÊTRE VIDE |
| T | SCORE F | ❌ DEVRAIT ÊTRE MOBILITE |
| U | SCORE M | ❌ Décalé |
| V | GROUP | ❌ Décalé |

**Résultat** : Toutes les colonnes à partir de S sont décalées d'une position !

---

## ✅ CORRECTION APPLIQUÉE

### Schéma APRÈS correction

```javascript
const BASE_SCHEMA = [
  "ID_ELEVE", "NOM", "PRENOM", "NOM & PRENOM", "SEXE", "LV2", "OPT",
  "COM", "TRA", "PART", "ABS", "DISPO", "ASSO", "DISSO",
  "SOURCE", "FIXE", "CLASSE_FINAL", "CLASSE_DEF", 
  "",  // ← COLONNE VIDE (colonne S) pour alignement avec schéma legacy
  "MOBILITE",  // ← Maintenant en colonne T (au lieu de S)
  "SCORE F", "SCORE M", "GROUP", 
  "_ID", "_PLACED", "_TARGET_CLASS"
];
```

### Mapping des colonnes APRÈS

| Colonne | Nom | Statut |
|---------|-----|--------|
| P | FIXE | ✅ OK |
| Q | CLASSE_FINAL | ✅ OK |
| R | CLASSE_DEF | ✅ OK |
| **S** | **(vide)** | ✅ OK |
| **T** | **MOBILITE** | ✅ CORRIGÉ |
| U | SCORE F | ✅ OK |
| V | SCORE M | ✅ OK |
| W | GROUP | ✅ OK |

**Résultat** : Les colonnes sont maintenant alignées avec le schéma legacy !

---

## 🔍 POURQUOI CETTE COLONNE VIDE ?

### Schéma legacy (Code.gs, ligne 1271)

```javascript
const header = [
  'ID_ELEVE','NOM','PRENOM','NOM & PRENOM','SEXE','LV2','OPT','COM','TRA','PART','ABS',
  'DISPO','ASSO','DISSO','SOURCE','FIXE','CLASSE_FINALE','CLASSE DEF',
  '',  // ← COLONNE VIDE INTENTIONNELLE
  'MOBILITE','SCORE F','SCORE M','GROUP'
];
```

**Raison** : Cette colonne vide existe dans le schéma legacy pour des raisons historiques (peut-être une colonne supprimée ou réservée).

**Impact** : Le `BASE_SCHEMA` doit respecter cet ordre pour que les fonctions qui lisent/écrivent dans `_BASEOPTI` trouvent les bonnes colonnes.

---

## 🔧 FICHIER MODIFIÉ

**Fichier** : `BASEOPTI_System.gs` (lignes 110-119)

**Modification** : Ajout de la colonne vide `""` entre `CLASSE_DEF` et `MOBILITE`

---

## 🎯 IMPACT DE LA CORRECTION

### Avant la correction

1. ❌ `_BASEOPTI` créé avec MOBILITE en colonne S
2. ❌ `copyBaseoptiToCache_V3()` copie le schéma décalé vers CACHE
3. ❌ `computeMobilityFlags_()` cherche MOBILITE en colonne T (introuvable !)
4. ❌ Les colonnes FIXE et MOBILITE restent vides

### Après la correction

1. ✅ `_BASEOPTI` créé avec MOBILITE en colonne T
2. ✅ `copyBaseoptiToCache_V3()` copie le schéma correct vers CACHE
3. ✅ `computeMobilityFlags_()` trouve MOBILITE en colonne T
4. ✅ Les colonnes FIXE et MOBILITE sont remplies correctement

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Vérifier le schéma de _BASEOPTI

1. Supprimer l'onglet `_BASEOPTI` (s'il existe)
2. Lancer une optimisation
3. Ouvrir l'onglet `_BASEOPTI` (le rendre visible)
4. Vérifier les en-têtes :
   - ✅ Colonne P : FIXE
   - ✅ Colonne Q : CLASSE_FINAL
   - ✅ Colonne R : CLASSE_DEF
   - ✅ Colonne S : **(vide)**
   - ✅ Colonne T : MOBILITE
   - ✅ Colonne U : SCORE F
   - ✅ Colonne V : SCORE M

### Test 2 : Vérifier les onglets CACHE

1. Après l'optimisation, ouvrir un onglet CACHE (ex: `6°1CACHE`)
2. Vérifier les en-têtes :
   - ✅ Colonne P : FIXE
   - ✅ Colonne T : MOBILITE
3. Vérifier que les colonnes sont **remplies** :
   - ✅ Colonne P : FIXE, PERMUT, LIBRE, CONDI, SPEC
   - ✅ Colonne T : FIXE, PERMUT, LIBRE, CONDI, SPEC

### Test 3 : Vérifier les logs

Chercher dans les logs :
```
🔒 Recalcul des statuts de mobilité après copie CACHE...
✅ Colonnes FIXE et MOBILITE restaurées dans les onglets CACHE
```

Si ces messages apparaissent, `computeMobilityFlags_()` a été appelé avec succès.

---

## 📊 COMPARAISON AVANT/APRÈS

### AVANT (décalé)

```
_BASEOPTI:
P: FIXE
Q: CLASSE_FINAL
R: CLASSE_DEF
S: MOBILITE ← ERREUR !
T: SCORE F
U: SCORE M

Résultat:
- computeMobilityFlags_() cherche MOBILITE en T
- Ne trouve pas la colonne
- Les colonnes restent vides
```

### APRÈS (corrigé)

```
_BASEOPTI:
P: FIXE
Q: CLASSE_FINAL
R: CLASSE_DEF
S: (vide)
T: MOBILITE ← CORRECT !
U: SCORE F
V: SCORE M

Résultat:
- computeMobilityFlags_() cherche MOBILITE en T
- Trouve la colonne
- Les colonnes sont remplies
```

---

## ✅ RÉSULTAT ATTENDU

Après cette correction et une nouvelle optimisation :

1. ✅ `_BASEOPTI` aura MOBILITE en colonne T
2. ✅ Les onglets CACHE auront MOBILITE en colonne T
3. ✅ `computeMobilityFlags_()` trouvera la colonne et la remplira
4. ✅ Les colonnes P (FIXE) et T (MOBILITE) seront remplies avec :
   - **FIXE** : Élève bloqué dans sa classe (option unique)
   - **PERMUT** : Élève peut permuter avec un autre (groupe A)
   - **LIBRE** : Élève peut aller dans plusieurs classes
   - **CONDI** : Élève avec contraintes (codes D)
   - **SPEC** : Élève avec contraintes spéciales

---

## 🚀 PROCHAINE ÉTAPE

**Relancer une optimisation complète** :

1. Supprimer l'onglet `_BASEOPTI` (pour forcer la recréation)
2. Supprimer les onglets CACHE (pour forcer la recréation)
3. Lancer une optimisation
4. Vérifier que les colonnes P et T sont remplies

**Si les colonnes sont toujours vides après cette correction** :
- Le problème n'est PAS le schéma
- Le problème est que `computeMobilityFlags_()` n'est pas appelé ou échoue
- Il faudra analyser les logs pour trouver la vraie cause

---

## 📝 DOCUMENTS CRÉÉS

1. ✅ **`ANALYSE_SCHEMA.md`** : Analyse détaillée du décalage
2. ✅ **`CORRECTION_SCHEMA_BASEOPTI.md`** : Ce document (correction appliquée)

---

## ✅ CONCLUSION

**Le schéma `BASE_SCHEMA` est maintenant corrigé.**

La colonne MOBILITE est en **colonne T** (au lieu de S), ce qui correspond au schéma legacy.

**Testez maintenant avec une nouvelle optimisation !** 🚀
