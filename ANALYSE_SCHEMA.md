# 🔍 ANALYSE DU SCHÉMA _BASEOPTI

## BASE_SCHEMA actuel

```javascript
const BASE_SCHEMA = [
  "ID_ELEVE",        // A (1)
  "NOM",             // B (2)
  "PRENOM",          // C (3)
  "NOM & PRENOM",    // D (4)
  "SEXE",            // E (5)
  "LV2",             // F (6)
  "OPT",             // G (7)
  "COM",             // H (8)
  "TRA",             // I (9)
  "PART",            // J (10)
  "ABS",             // K (11)
  "DISPO",           // L (12)
  "ASSO",            // M (13)
  "DISSO",           // N (14)
  "SOURCE",          // O (15)
  "FIXE",            // P (16) ✅
  "CLASSE_FINAL",    // Q (17)
  "CLASSE_DEF",      // R (18)
  "MOBILITE",        // S (19) ❌ DEVRAIT ÊTRE EN T !
  "SCORE F",         // T (20)
  "SCORE M",         // U (21)
  "GROUP",           // V (22)
  "_ID",             // W (23)
  "_PLACED",         // X (24)
  "_TARGET_CLASS"    // Y (25)
];
```

## ❌ PROBLÈME IDENTIFIÉ

**MOBILITÉ est en colonne S (19) au lieu de T (20) !**

Il manque une colonne entre **CLASSE_DEF** (R) et **MOBILITE** (S).

## 🔍 SCHÉMA ATTENDU (d'après Code.gs)

```javascript
const header = [
  'ID_ELEVE','NOM','PRENOM','NOM & PRENOM','SEXE','LV2','OPT','COM','TRA','PART','ABS',
  'DISPO','ASSO','DISSO','SOURCE','FIXE','CLASSE_FINALE','CLASSE DEF','','MOBILITE','SCORE F','SCORE M','GROUP'
];
```

**Remarquez** : Il y a **une colonne vide ''** entre **'CLASSE DEF'** et **'MOBILITE'** !

## ✅ CORRECTION À APPLIQUER

```javascript
const BASE_SCHEMA = [
  "ID_ELEVE", "NOM", "PRENOM", "NOM & PRENOM", "SEXE", "LV2", "OPT",
  "COM", "TRA", "PART", "ABS", "DISPO", "ASSO", "DISSO",
  "SOURCE", "FIXE", "CLASSE_FINAL", "CLASSE_DEF", 
  "",              // ← COLONNE VIDE MANQUANTE !
  "MOBILITE",      // ← Maintenant en colonne T
  "SCORE F", "SCORE M", "GROUP", 
  "_ID", "_PLACED", "_TARGET_CLASS"
];
```

## 📊 COMPARAISON

| Colonne | Actuel | Attendu | Statut |
|---------|--------|---------|--------|
| P | FIXE | FIXE | ✅ OK |
| Q | CLASSE_FINAL | CLASSE_FINALE | ⚠️ Nom différent |
| R | CLASSE_DEF | CLASSE DEF | ✅ OK |
| S | MOBILITE | **(vide)** | ❌ DÉCALAGE |
| T | SCORE F | MOBILITE | ❌ DÉCALAGE |
| U | SCORE M | SCORE F | ❌ DÉCALAGE |
| V | GROUP | SCORE M | ❌ DÉCALAGE |

**Tout est décalé d'une colonne à partir de S !**
