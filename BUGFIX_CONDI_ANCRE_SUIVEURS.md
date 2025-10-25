# 🚨 BUGFIX CRITIQUE - Distinction Ancre/Suiveurs avec CONDI

## 📋 Symptôme Observé

### Scénario
```
Groupe A6 (6 élèves) :
  E001 : CHAV, ASSO=A6  → Élève "ANCRE" (bloque le groupe)
  E002-E006 : ASSO=A6   → Élèves "SUIVEURS"

Quotas :
  6°4 : CHAV=10
  Autres classes : Pas de CHAV

Attendu :
  E001 : FIXE (car CHAV unique)
  E002-E006 : CONDI (conditionnés par E001)
  Tout le groupe en 6°4

Résultat AVANT correction :
  E001 : GROUPE_FIXE(A6→6°4) → Normalisé en FIXE ✅
  E002-E006 : GROUPE_FIXE(A6→6°4) → Normalisé en FIXE ❌
  Phase 4 : Tous FIXE → Ne peuvent JAMAIS bouger
```

---

## 🔍 Diagnostic - Tous Marqués FIXE

### Problème dans Mobility_System.gs

#### Code AVANT (Bug)
```javascript
// Ligne 293
if (g.status === 'FIXE') {
    return { fix: true, mob: 'GROUPE_FIXE(' + st.A + '→' + g.pin + ')' };
}
```

**Résultat** :
- TOUS les élèves du groupe reçoivent `GROUPE_FIXE(A6→6°4)`
- TOUS sont marqués `fix: true`
- Phase 4 normalise en `FIXE`
- Impossible de les déplacer, même en groupe

### Logique Correcte

| Élève | Option | Allow | Groupe | Statut Attendu | Raison |
|-------|--------|-------|--------|----------------|--------|
| E001 | CHAV | [6°4] | A6 | **FIXE** | Option unique → Ancre |
| E002 | - | [6°1,6°2,6°3,6°4,6°5] | A6 | **CONDI** | Suit E001 |
| E003 | - | [6°1,6°2,6°3,6°4,6°5] | A6 | **CONDI** | Suit E001 |
| E004 | - | [6°1,6°2,6°3,6°4,6°5] | A6 | **CONDI** | Suit E001 |
| E005 | - | [6°1,6°2,6°3,6°4,6°5] | A6 | **CONDI** | Suit E001 |
| E006 | - | [6°1,6°2,6°3,6°4,6°5] | A6 | **CONDI** | Suit E001 |

---

## ✅ **SOLUTION IMPLÉMENTÉE**

### Correction 1 : Mobility_System.gs (Lignes 294-306)

#### Avant (Bug)
```javascript
if (g.status === 'FIXE') {
    return { fix: true, mob: 'GROUPE_FIXE(' + st.A + '→' + g.pin + ')' };
}
```

#### Après (Corrigé)
```javascript
if (g.status === 'FIXE') {
    // ✅ CORRECTION CRITIQUE : Distinguer l'ancre des suiveurs
    // Vérifier si CET élève a une contrainte individuelle (LV2/OPT unique)
    const individualAllow = st.allow.slice();
    if (individualAllow.length === 1) {
        // C'est l'ANCRE (ex: élève avec CHAV qui bloque tout le groupe)
        return { fix: true, mob: 'FIXE' };
    } else {
        // C'est un SUIVEUR (conditionné par l'ancre)
        return { fix: false, mob: 'CONDI(' + st.A + '→' + g.pin + ')' };
    }
}
```

**Logique** :
1. Si le groupe est FIXE (une seule classe commune)
2. Vérifier si CET élève a `allow.length === 1` (option unique)
3. Si OUI → C'est l'ANCRE → `FIXE`
4. Si NON → C'est un SUIVEUR → `CONDI(A6→6°4)`

---

### Correction 2 : Phase4_Optimisation_V15.gs (Lignes 2244-2257)

#### Avant (Bug)
```javascript
if (mobilite.startsWith('GROUPE_FIXE')) {
    mobilite = 'FIXE';
} else if (mobilite.startsWith('GROUPE_PERMUT')) {
    mobilite = 'PERMUT';
}
// ❌ CONDI(...) n'est pas reconnu → Devient LIBRE
```

#### Après (Corrigé)
```javascript
// ✅ CORRECTION CRITIQUE : Normaliser les formats GROUPE_FIXE/GROUPE_PERMUT/CONDI
// Mobility_System écrit :
// - "FIXE" pour ancre (élève avec option unique)
// - "CONDI(A6→6°1)" pour suiveurs (conditionnés par l'ancre)
// - "GROUPE_PERMUT(D3→6°2,6°4)" pour groupes avec plusieurs classes
if (mobilite.startsWith('GROUPE_FIXE')) {
    mobilite = 'FIXE';
} else if (mobilite.startsWith('CONDI')) {
    mobilite = 'CONDI';  // ✅ Garder CONDI
} else if (mobilite.startsWith('GROUPE_PERMUT')) {
    mobilite = 'PERMUT';
}
```

---

## 📊 **Comparaison Avant/Après**

### Scénario : Groupe A6 avec E001 CHAV

#### AVANT (Bug)

| Élève | Mobility_System Écrit | Phase 4 Normalise | Résultat |
|-------|----------------------|-------------------|----------|
| E001 | `GROUPE_FIXE(A6→6°4)` | `FIXE` | ✅ OK |
| E002 | `GROUPE_FIXE(A6→6°4)` | `FIXE` | ❌ Trop restrictif |
| E003 | `GROUPE_FIXE(A6→6°4)` | `FIXE` | ❌ Trop restrictif |
| E004 | `GROUPE_FIXE(A6→6°4)` | `FIXE` | ❌ Trop restrictif |
| E005 | `GROUPE_FIXE(A6→6°4)` | `FIXE` | ❌ Trop restrictif |
| E006 | `GROUPE_FIXE(A6→6°4)` | `FIXE` | ❌ Trop restrictif |

**Problème** : Tous FIXE → Ne peuvent jamais bouger, même en groupe

#### APRÈS (Corrigé)

| Élève | Allow | Mobility_System Écrit | Phase 4 Normalise | Résultat |
|-------|-------|----------------------|-------------------|----------|
| E001 | [6°4] | `FIXE` | `FIXE` | ✅ Ancre |
| E002 | [6°1,6°2,6°3,6°4,6°5] | `CONDI(A6→6°4)` | `CONDI` | ✅ Suiveur |
| E003 | [6°1,6°2,6°3,6°4,6°5] | `CONDI(A6→6°4)` | `CONDI` | ✅ Suiveur |
| E004 | [6°1,6°2,6°3,6°4,6°5] | `CONDI(A6→6°4)` | `CONDI` | ✅ Suiveur |
| E005 | [6°1,6°2,6°3,6°4,6°5] | `CONDI(A6→6°4)` | `CONDI` | ✅ Suiveur |
| E006 | [6°1,6°2,6°3,6°4,6°5] | `CONDI(A6→6°4)` | `CONDI` | ✅ Suiveur |

**Résultat** : 
- E001 FIXE → Bloqué en 6°4 (correct)
- E002-E006 CONDI → Peuvent bouger SI tout le groupe bouge (correct)

---

## 🎯 **Définition de CONDI**

### Qu'est-ce que CONDI ?

```
CONDI = Conditionnel
      = Élève qui SUIT un autre élève du groupe (l'ancre)
      = Peut bouger SEULEMENT si tout le groupe bouge ensemble
      = Ne peut PAS être échangé individuellement
```

### Logique Phase 4 pour CONDI

```javascript
// Pour un swap E002 (CONDI) ↔ E999 (LIBRE) :

1. Vérifier si E002 est CONDI
2. Si OUI, identifier son groupe (A6)
3. Vérifier si TOUT le groupe A6 peut aller dans la nouvelle classe
4. Si NON → Bloquer le swap
5. Si OUI → Autoriser MAIS déplacer TOUT le groupe
```

**Note** : La logique complète de swap de groupe n'est pas encore implémentée dans Phase 4. Pour l'instant, CONDI bloque les swaps individuels (comme PERMUT).

---

## 🧪 **Tests de Validation**

### Test 1 : Groupe A6 avec 1 Ancre CHAV

#### Configuration
```
Élèves :
  E001 : CHAV, ASSO=A6  → Allow=[6°4]
  E002 : ASSO=A6        → Allow=[6°1,6°2,6°3,6°4,6°5]
  E003 : ASSO=A6        → Allow=[6°1,6°2,6°3,6°4,6°5]
  E004 : ASSO=A6        → Allow=[6°1,6°2,6°3,6°4,6°5]
  E005 : ASSO=A6        → Allow=[6°1,6°2,6°3,6°4,6°5]
  E006 : ASSO=A6        → Allow=[6°1,6°2,6°3,6°4,6°5]

Quotas :
  6°4 : CHAV=10
```

#### Résultat Attendu
```
Mobility_System :
  E001 : FIXE
  E002-E006 : CONDI(A6→6°4)

Phase 4 :
  E001 : FIXE → Ne peut pas bouger
  E002-E006 : CONDI → Ne peuvent pas bouger individuellement
  
Résultat final :
  Tout le groupe A6 en 6°4 ✅
```

### Test 2 : Groupe A7 avec 2 Ancres

#### Configuration
```
Élèves :
  E007 : ITA, ASSO=A7   → Allow=[6°3]
  E008 : CHAV, ASSO=A7  → Allow=[6°4]
  E009 : ASSO=A7        → Allow=[6°1,6°2,6°3,6°4,6°5]

Quotas :
  6°3 : ITA=6
  6°4 : CHAV=10
```

#### Résultat Attendu
```
Mobility_System :
  Groupe A7 : Intersection Allow = [6°3] ∩ [6°4] ∩ [toutes] = ∅
  Status : CONFLIT

Résultat :
  E007 : CONFLIT(A)
  E008 : CONFLIT(A)
  E009 : CONFLIT(A)
  
Message d'erreur : Groupe A7 incompatible (ITA et CHAV dans le même groupe)
```

### Test 3 : Groupe A8 sans Ancre

#### Configuration
```
Élèves :
  E010 : ASSO=A8  → Allow=[6°1,6°2,6°3,6°4,6°5]
  E011 : ASSO=A8  → Allow=[6°1,6°2,6°3,6°4,6°5]
  E012 : ASSO=A8  → Allow=[6°1,6°2,6°3,6°4,6°5]
```

#### Résultat Attendu
```
Mobility_System :
  Groupe A8 : Intersection Allow = [6°1,6°2,6°3,6°4,6°5]
  Status : PERMUT (plus de 2 classes)

Résultat :
  E010-E012 : GROUPE_PERMUT(A8→6°1/6°2/6°3/6°4/6°5)
  
Phase 4 normalise :
  E010-E012 : PERMUT
```

---

## 📝 **Formats de Mobilité**

### Formats Écrits par Mobility_System

| Format | Signification | fix | Exemple |
|--------|---------------|-----|---------|
| `FIXE` | Ancre avec option unique | true | Élève CHAV dans groupe A6 |
| `CONDI(A6→6°4)` | Suiveur conditionné | false | Élève sans option dans groupe A6 |
| `GROUPE_PERMUT(A8→6°1/6°2)` | Groupe avec 2+ classes | false | Groupe A8 sans contrainte |
| `PERMUT(6°2,6°4)` | Individuel avec 2 classes | false | Élève CHAV avec 2 classes |
| `LIBRE` | Individuel avec 3+ classes | false | Élève sans option |
| `CONFLIT(A)` | Groupe incompatible | false | Groupe avec ITA+CHAV |

### Formats Normalisés par Phase 4

| Format Original | Normalisé | Action Phase 4 |
|----------------|-----------|----------------|
| `FIXE` | `FIXE` | Bloquer swap |
| `CONDI(A6→6°4)` | `CONDI` | Bloquer swap individuel |
| `GROUPE_FIXE(...)` | `FIXE` | Bloquer swap (legacy) |
| `GROUPE_PERMUT(...)` | `PERMUT` | Vérifier classes compatibles |
| `PERMUT(...)` | `PERMUT` | Vérifier classes compatibles |
| `LIBRE` | `LIBRE` | Autoriser swap |

---

## 📝 **Fichiers Modifiés**

| Fichier | Lignes | Modification |
|---------|--------|--------------|
| `Mobility_System.gs` | 294-306 | ✅ Distinction ancre (FIXE) / suiveurs (CONDI) |
| `Phase4_Optimisation_V15.gs` | 2244-2257 | ✅ Normalisation CONDI(...) → CONDI |
| `Phase4_Optimisation_V15.gs` | 5120-5127 | ✅ Normalisation CONDI(...) → CONDI |

**Total : 2 fichiers modifiés, 3 blocs de code corrigés**

---

## 🎉 **Résultat Final**

### ✅ **Problème Résolu**

1. ✅ Mobility_System distingue ancre (FIXE) et suiveurs (CONDI)
2. ✅ Phase 4 reconnaît et normalise `CONDI(...)`
3. ✅ Les élèves CONDI ne peuvent pas être déplacés individuellement
4. ✅ La logique "élève avec option bloque le groupe" fonctionne correctement

### 🎯 **Comportement Attendu**

```
Groupe A6 (6 élèves) dont 1 avec CHAV (uniquement en 6°4) :
  → Mobility_System :
     - E001 (CHAV) : allow=[6°4] → FIXE
     - E002-E006 : allow=[toutes] → CONDI(A6→6°4)
  
  → Phase 4 :
     - E001 : FIXE → Bloqué en 6°4
     - E002-E006 : CONDI → Bloqués en 6°4 (suivent E001)
  
  → Résultat :
     - Tout le groupe A6 en 6°4 ✅
     - E001 ne peut pas bouger (FIXE) ✅
     - E002-E006 ne peuvent pas bouger individuellement (CONDI) ✅
```

---

## 💡 **Leçons Apprises**

### 1. **Distinguer Ancre et Suiveurs**
```javascript
// Au lieu de marquer tout le groupe FIXE :
if (g.status === 'FIXE') {
    return { fix: true, mob: 'GROUPE_FIXE(...)' };  // ❌ Tous FIXE
}

// Vérifier qui est l'ancre :
if (individualAllow.length === 1) {
    return { fix: true, mob: 'FIXE' };  // ✅ Ancre
} else {
    return { fix: false, mob: 'CONDI(...)' };  // ✅ Suiveur
}
```

### 2. **CONDI vs FIXE**
- **FIXE** : Ne peut JAMAIS bouger (ancre avec contrainte absolue)
- **CONDI** : Peut bouger SI tout le groupe bouge (suiveur conditionné)

### 3. **Normalisation Cohérente**
```javascript
// Reconnaître tous les formats :
if (mobilite.startsWith('CONDI')) {
    mobilite = 'CONDI';  // ✅ Normaliser
}
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Bug critique corrigé  
**Priorité** : 🚨 URGENT
