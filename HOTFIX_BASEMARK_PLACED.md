# HOTFIX - baseMarkPlaced_ incompatible avec schéma fixe

## Date : 2025-01-20 14:22
## Statut : ✅ CORRIGÉ

---

## 🐛 Problème observé

### Erreur lors de Phase 1

```
14:19:42 - 📂 Ouverture des onglets CACHE…
14:20:19 - 📌 Phase 1/4 — Options & LV2…
14:20:27 - ❌ Erreur: Error: Colonnes _ID/_PLACED/_TARGET_CLASS introuvables dans _BASEOPTI
```

---

## 🔍 Cause racine

### Bug dans `baseMarkPlaced_()` (BASEOPTI_System.gs, ligne 343)

La fonction utilisait `indexOf()` pour chercher les colonnes par leur nom exact :

```javascript
// ❌ CODE BUGUÉ
const idxId = head.indexOf('_ID');
const idxPlaced = head.indexOf('_PLACED');
const idxTarget = head.indexOf('_TARGET_CLASS');

if (idxId === -1 || idxPlaced === -1 || idxTarget === -1) {
  throw new Error('Colonnes _ID/_PLACED/_TARGET_CLASS introuvables dans _BASEOPTI');
}
```

**Problème** : Avec le nouveau schéma fixe, les colonnes sont :
- `ID_ELEVE` (au lieu de `_ID`)
- `_PLACED` (OK)
- `CLASSE_FINAL` (au lieu de `_TARGET_CLASS`)

La fonction cherchait les anciens noms et ne les trouvait pas → erreur.

---

## ✅ Correctif appliqué

### Utiliser `resolveHeader_()` pour compatibilité

```javascript
// ✅ CODE CORRIGÉ
const hId = resolveHeader_("ID_ELEVE", head) || resolveHeader_("_ID", head);
const hPlaced = resolveHeader_("_PLACED", head);
const hTarget = resolveHeader_("CLASSE_FINAL", head) || resolveHeader_("_TARGET_CLASS", head);

if (!hId || !hPlaced || !hTarget) {
  logLine('ERROR', '❌ Colonnes introuvables dans _BASEOPTI');
  logLine('ERROR', '   En-têtes disponibles: ' + head.join(', '));
  throw new Error('Colonnes ID/PLACED/TARGET introuvables dans _BASEOPTI');
}

const idxId = hId.idx;
const idxPlaced = hPlaced.idx;
const idxTarget = hTarget.idx;
```

**Changements** :
1. Utiliser `resolveHeader_()` au lieu de `indexOf()`
2. Chercher `ID_ELEVE` en priorité, puis `_ID` en fallback
3. Chercher `CLASSE_FINAL` en priorité, puis `_TARGET_CLASS` en fallback
4. Log des en-têtes disponibles en cas d'erreur (pour debug)

---

## 🎯 Résultats attendus

### Avant correctif
```
❌ Erreur: Colonnes _ID/_PLACED/_TARGET_CLASS introuvables dans _BASEOPTI
```

### Après correctif
```
✅ 6 élèves marqués P1 → 6°1
✅ 10 élèves marqués P1 → 6°3
```

---

## 🧪 Tests de validation

### Test 1 : Vérifier le correctif
```
1. Supprimer _BASEOPTI
2. Lancer phase1Stream()
3. ✅ Vérifier : Pas d'erreur "Colonnes introuvables"
4. ✅ Vérifier : "✅ X élèves marqués P1 → 6°Y"
```

### Test 2 : Vérifier les autres phases
```
1. Lancer phase2Stream()
2. ✅ Vérifier : "✅ X élèves marqués P2 → 6°Y"
3. Lancer phase3Stream()
4. ✅ Vérifier : "✅ X élèves marqués P3 → 6°Y"
```

### Test 3 : Vérifier _BASEOPTI
```
1. Afficher _BASEOPTI
2. ✅ Vérifier : Colonne _PLACED remplie (P1, P2, P3)
3. ✅ Vérifier : Colonne CLASSE_FINAL remplie (6°1, 6°2, etc.)
```

---

## 📊 Impact du correctif

### Avant (avec bug)
- ❌ Phase 1 crash immédiatement
- ❌ Erreur "Colonnes introuvables"
- ❌ Aucun élève marqué comme placé
- ❌ Pipeline bloqué dès P1

### Après (corrigé)
- ✅ Phase 1 s'exécute normalement
- ✅ Colonnes trouvées via resolveHeader_()
- ✅ Élèves marqués correctement
- ✅ Pipeline P1→P2→P3→P4 fonctionnel

---

## 🔗 Correctifs connexes

Ce correctif complète les hotfixes précédents :
1. ✅ **HOTFIX_COUNTS_UNDEFINED** : ReferenceError P4
2. ✅ **HOTFIX_ELEVE_MANQUANT** : CACHE vide + élève manquant
3. ✅ **HOTFIX_BASEOPTI_STRUCTURE** : Structure dynamique → fixe
4. ✅ **HOTFIX_SCHEMA_FIXE_FINAL** : Schéma fixe avec ID_ELEVE
5. ✅ **DEPLOIEMENT_SECURISE** : Couche de compatibilité
6. ✅ **HOTFIX_BASEMARK_PLACED** : baseMarkPlaced_ compatible (ce document)

---

## 📝 Leçon apprise

### Principe : Toujours utiliser les getters/resolvers

**❌ Mauvaise pratique** :
```javascript
const idx = headers.indexOf('_ID');  // Nom exact requis
```

**✅ Bonne pratique** :
```javascript
const h = resolveHeader_("ID_ELEVE", headers);  // Cherche variantes
const idx = h ? h.idx : -1;
```

**Avantages** :
- Tolérance aux variantes (ID_ELEVE, ID, _ID)
- Tolérance aux typos (LASSE_FINAL → CLASSE_FINAL)
- Migration progressive sans casser le code
- Logs détaillés en cas d'erreur

---

## ✅ Conclusion

**Le bug est corrigé.**

La fonction `baseMarkPlaced_()` utilise maintenant `resolveHeader_()` pour trouver les colonnes, garantissant la compatibilité avec le nouveau schéma fixe.

**Impact attendu :**
- ✅ Phase 1 s'exécute sans erreur
- ✅ Élèves marqués correctement dans _BASEOPTI
- ✅ Pipeline P1→P2→P3→P4 fonctionnel
- ✅ Compatibilité ancien/nouveau schéma préservée

---

**Version** : 1.0  
**Date** : 2025-01-20  
**Statut** : ✅ CORRIGÉ - PRÊT POUR TEST
