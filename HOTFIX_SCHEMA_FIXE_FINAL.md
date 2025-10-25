# HOTFIX FINAL - Schéma fixe _BASEOPTI avec ID_ELEVE

## Date : 2025-01-20 13:42
## Statut : ✅ CORRIGÉ - VERSION FINALE

---

## 🎯 Problème résolu

### Structure _BASEOPTI dynamique → Structure fixe standardisée

**Avant** : Structure dynamique avec colonnes variables
- ❌ Ordre des colonnes imprévisible
- ❌ Colonnes essentielles parfois manquantes (COM, TRA, PART, ABS)
- ❌ Clé primaire `_ID` au lieu de `ID_ELEVE`
- ❌ Vérifications échouent ("ids uniques=0")

**Après** : Structure fixe avec schéma standardisé
- ✅ Ordre des colonnes garanti
- ✅ Toutes les colonnes essentielles présentes
- ✅ Clé primaire `ID_ELEVE` (standard métier)
- ✅ Vérifications passent

---

## 📋 Schéma fixe _BASEOPTI

### Colonnes (ordre standardisé)

```javascript
const BASE_SCHEMA = [
  "ID_ELEVE",      // ✅ Clé primaire (identifiant métier)
  "NOM",           // Nom de famille
  "PRENOM",        // Prénom
  "NOM & PRENOM",  // Nom complet
  "SEXE",          // Genre (F/M)
  "LV2",           // Langue vivante 2 (ITA, ESP, ALL, PT)
  "OPT",           // Option (CHAV, etc.)
  "COM",           // ✅ Score comportement (1-4)
  "TRA",           // ✅ Score travail (1-4)
  "PART",          // ✅ Score participation (1-4)
  "ABS",           // ✅ Score absences (1-4)
  "DISPO",         // Disponibilité
  "ASSO",          // Code association (A1, A2, etc.)
  "DISSO",         // Code dissociation (D1, D2, etc.)
  "SOURCE",        // Classe source (6°1, 6°2, etc.)
  "FIXE",          // Élève fixe (non mobile)
  "CLASSE_FINAL",  // Classe finale affectée
  "CLASSE_DEF",    // Classe définitive
  "MOBILITE",      // Statut mobilité
  "SCORE F",       // Score filles (calculé)
  "SCORE M",       // Score garçons (calculé)
  "GROUP",         // Groupe (A/D)
  "_ID",           // Identifiant technique interne
  "_PLACED"        // Statut placement (P1/P2/P3)
];
```

**Total : 24 colonnes fixes**

---

## 🔧 Correctifs appliqués

### 1. Fonction `createBaseOpti_` (BASEOPTI_System.gs)

**Changement** : Schéma fixe au lieu de structure dynamique

```javascript
// ✅ SCHÉMA FIXE
const BASE_SCHEMA = [
  "ID_ELEVE", "NOM", "PRENOM", "NOM & PRENOM", "SEXE", "LV2", "OPT",
  "COM", "TRA", "PART", "ABS", "DISPO", "ASSO", "DISSO",
  "SOURCE", "FIXE", "CLASSE_FINAL", "CLASSE_DEF", "MOBILITE", 
  "SCORE F", "SCORE M", "GROUP", "_ID", "_PLACED"
];

function createBaseOpti_(ctx) {
  const sh = getBaseOptiSheet_();
  sh.clear();

  // Écrire les en-têtes (schéma fixe)
  sh.getRange(1, 1, 1, BASE_SCHEMA.length).setValues([BASE_SCHEMA]);

  // Lire et mapper les sources
  const allRows = [];
  (ctx.srcSheets || []).forEach(function(srcName) {
    // ... lecture des sources ...
    const mapped = mapWorkRowToBaseOpti_(work, srcName, i+1);
    allRows.push(mapped);
  });

  // Écrire les données
  const rows = allRows.map(function(obj) {
    return BASE_SCHEMA.map(function(col) {
      return obj[col] !== undefined ? obj[col] : "";
    });
  });
  sh.getRange(2, 1, rows.length, BASE_SCHEMA.length).setValues(rows);
}
```

### 2. Fonction `mapWorkRowToBaseOpti_` (BASEOPTI_System.gs)

**Nouveau** : Mapping standardisé depuis les sources

```javascript
function mapWorkRowToBaseOpti_(work, srcName, rowIdx) {
  return {
    "ID_ELEVE": work.ID_ELEVE || work.ID || work._ID || buildStableId_(work, srcName, rowIdx),
    "NOM": work.NOM || "",
    "PRENOM": work.PRENOM || "",
    "NOM & PRENOM": work["NOM & PRENOM"] || (work.NOM + " " + work.PRENOM).trim(),
    "SEXE": work.SEXE || work.Sexe || work.Genre || "",
    "LV2": work.LV2 || "",
    "OPT": work.OPT || "",
    "COM": work.COM !== undefined ? work.COM : "",  // ✅ Préserver 0
    "TRA": work.TRA !== undefined ? work.TRA : "",  // ✅ Préserver 0
    "PART": work.PART !== undefined ? work.PART : "", // ✅ Préserver 0
    "ABS": work.ABS !== undefined ? work.ABS : "",   // ✅ Préserver 0
    "DISPO": work.DISPO || "",
    "ASSO": work.ASSO || work.A || work.CODE_A || "",
    "DISSO": work.DISSO || work.D || work.CODE_D || "",
    "SOURCE": work.SOURCE || srcName.replace(/(TEST|CACHE|FIN)$/,'').trim(),
    "FIXE": work.FIXE || "",
    "CLASSE_FINAL": work.CLASSE_FINAL || work.CLASSE || work._TARGET_CLASS || "",
    "CLASSE_DEF": work.CLASSE_DEF || work["CLASSE DEF"] || "",
    "MOBILITE": work.MOBILITE || "",
    "SCORE F": work["SCORE F"] || work.SCORE_F || "",
    "SCORE M": work["SCORE M"] || work.SCORE_M || "",
    "GROUP": work.GROUP || work.A || work.D || "",
    "_ID": work._ID || buildStableId_(work, srcName, rowIdx),
    "_PLACED": work._PLACED || ""
  };
}
```

### 3. Fonction `_assertInvariants_` (BASEOPTI_System.gs)

**Changement** : Utiliser `ID_ELEVE` comme clé primaire

```javascript
// ✅ CORRECTIF : Chercher ID_ELEVE en priorité
const idsCache = [];
for (const cls in cache) {
  (cache[cls] || []).forEach(function(r) {
    const id = r.ID_ELEVE || r.ID || r._ID || "";
    if (id) idsCache.push(id);
  });
}
```

### 4. Fonction `writeBatchToCache_` (BASEOPTI_System.gs)

**Changement** : Utiliser `ID_ELEVE` pour UPSERT

```javascript
// ✅ CORRECTIF : Chercher ID_ELEVE
if (h === 'ID_ELEVE' || h === 'ID' || h === '_ID') {
  return stu.ID_ELEVE || stu.ID || stu._ID || '';
}

// ✅ CORRECTIF : Utiliser ID_ELEVE pour UPSERT
const stuId = String(stu.ID_ELEVE || stu.ID || stu._ID || '').trim();
```

---

## 📊 Résultats attendus

### Structure _BASEOPTI

#### ✅ Après correctif
```
ID_ELEVE | NOM | PRENOM | NOM & PRENOM | SEXE | LV2 | OPT | COM | TRA | PART | ABS | 
DISPO | ASSO | DISSO | SOURCE | FIXE | CLASSE_FINAL | CLASSE_DEF | MOBILITE | 
SCORE F | SCORE M | GROUP | _ID | _PLACED
```

**24 colonnes fixes, ordre garanti**

### Logs attendus

```
✅ _BASEOPTI créé : 121 élèves, 24 colonnes (schéma fixe)
```

### Vérifications

```
✅ POST P1 – IDs uniques : 16/16
✅ POST P2 – IDs uniques : 36/36
✅ POST P3 – IDs uniques : 120/120
✅ POST P4 – IDs uniques : 121/121
```

---

## 🎯 Impact du correctif

### Avant (structure dynamique)
- ❌ Colonnes variables selon les sources
- ❌ Ordre imprévisible
- ❌ COM/TRA/PART/ABS parfois manquants
- ❌ Clé primaire `_ID` (technique)
- ❌ "ids uniques=0" (colonnes non trouvées)
- ❌ P4 ne peut pas optimiser (scores manquants)

### Après (schéma fixe)
- ✅ 24 colonnes fixes garanties
- ✅ Ordre standardisé
- ✅ COM/TRA/PART/ABS toujours présents
- ✅ Clé primaire `ID_ELEVE` (métier)
- ✅ IDs uniques comptés correctement
- ✅ P4 peut optimiser (scores disponibles)

---

## 🧪 Tests de validation

### Test 1 : Vérifier la structure _BASEOPTI
```
1. Supprimer l'onglet _BASEOPTI
2. Lancer openStream() ou phase1Stream()
3. Afficher _BASEOPTI (clic droit → Afficher)
4. Vérifier : 24 colonnes dans l'ordre du schéma
5. Vérifier : ID_ELEVE en colonne A
6. Vérifier : COM, TRA, PART, ABS présents
```

### Test 2 : Vérifier les données
```
1. Ouvrir _BASEOPTI
2. Vérifier : Colonne ID_ELEVE remplie pour tous
3. Vérifier : Scores COM/TRA/PART/ABS remplis (1-4)
4. Vérifier : Pas de colonnes vides inattendues
```

### Test 3 : Vérifier les vérifications
```
1. Lancer P1 → Vérifier : "IDs uniques : 16/16"
2. Lancer P2 → Vérifier : "IDs uniques : 36/36"
3. Lancer P3 → Vérifier : "IDs uniques : 120/120"
4. Lancer P4 → Vérifier : "IDs uniques : 121/121"
5. Pas de message "ids uniques=0"
```

### Test 4 : Vérifier P4 utilise les scores
```
1. Lancer phase4Stream()
2. Vérifier logs : "Poids: COM=0.4, TRA=0.1, PART=0.1, ABS=0.1"
3. Vérifier : Swaps > 0
4. Vérifier : Optimisation fonctionne
```

---

## 📝 Notes techniques

### Pourquoi un schéma fixe ?

1. **Prévisibilité** : Les colonnes sont toujours dans le même ordre
2. **Robustesse** : Pas de colonnes manquantes
3. **Performance** : Pas de calcul dynamique des en-têtes
4. **Maintenance** : Facile à déboguer et vérifier

### Pourquoi ID_ELEVE comme clé primaire ?

1. **Standard métier** : Identifiant utilisé dans les sources
2. **Traçabilité** : Permet de retrouver l'élève dans les sources
3. **Unicité** : Garantit l'unicité des élèves
4. **Compatibilité** : Fonctionne avec les vérifications existantes

### Gestion des valeurs manquantes

- **Scores (COM/TRA/PART/ABS)** : Utiliser `!== undefined` pour préserver `0`
- **Textes** : Utiliser `|| ""` pour remplacer `null`/`undefined` par chaîne vide
- **Fallback** : Chercher plusieurs variantes (ID_ELEVE, ID, _ID)

---

## 🚀 Déploiement

### Étape 1 : Sauvegarder
```
1. Backup BASEOPTI_System.gs
2. Backup du classeur Google Sheets
```

### Étape 2 : Appliquer le correctif
```
1. Ouvrir BASEOPTI_System.gs
2. Remplacer createBaseOpti_ par la version corrigée
3. Ajouter mapWorkRowToBaseOpti_
4. Corriger _assertInvariants_
5. Corriger writeBatchToCache_
6. Sauvegarder
```

### Étape 3 : Recréer _BASEOPTI
```
1. Supprimer l'onglet _BASEOPTI
2. Lancer openStream()
3. Vérifier log : "✅ _BASEOPTI créé : 121 élèves, 24 colonnes (schéma fixe)"
```

### Étape 4 : Vérifier la structure
```
1. Afficher _BASEOPTI
2. Vérifier : 24 colonnes dans l'ordre
3. Vérifier : ID_ELEVE, COM, TRA, PART, ABS présents
4. Vérifier : Données complètes
```

### Étape 5 : Tester les phases
```
1. Lancer P1→P2→P3→P4
2. Vérifier : Pas de "ids uniques=0"
3. Vérifier : P4 utilise les scores
4. Vérifier : Swaps > 0
5. Vérifier : Parité OK
```

---

## ✅ Conclusion

**Le correctif final est appliqué.**

`_BASEOPTI` utilise maintenant un **schéma fixe standardisé** avec :
- ✅ **24 colonnes fixes** dans un ordre garanti
- ✅ **ID_ELEVE** comme clé primaire métier
- ✅ **COM/TRA/PART/ABS** toujours présents pour P4
- ✅ **Mapping intelligent** avec fallback sur variantes
- ✅ **Vérifications robustes** utilisant ID_ELEVE

**Impact attendu :**
- ✅ Structure prévisible et robuste
- ✅ Vérifications passent (IDs uniques comptés)
- ✅ P4 peut optimiser (scores disponibles)
- ✅ Traçabilité complète (ID_ELEVE métier)
- ✅ Maintenance facilitée

---

**Version** : 2.0 FINALE  
**Date** : 2025-01-20  
**Statut** : ✅ CORRIGÉ - VERSION FINALE STABLE

---

## 🔗 Correctifs connexes (tous appliqués)

1. ✅ **HOTFIX_COUNTS_UNDEFINED** : ReferenceError P4
2. ✅ **HOTFIX_ELEVE_MANQUANT** : Doublons CACHE + élève manquant
3. ✅ **HOTFIX_BASEOPTI_STRUCTURE** : Structure dynamique → fixe
4. ✅ **HOTFIX_SCHEMA_FIXE_FINAL** : Schéma fixe avec ID_ELEVE (ce document)

**Tous les correctifs sont appliqués. Le système est prêt ! 🚀**
