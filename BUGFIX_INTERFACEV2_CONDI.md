# 🚨 BUGFIX CRITIQUE - InterfaceV2 Ne Bloquait Pas CONDI

## 📋 Symptôme Observé

### Logs Utilisateur
```
🖱️ Drag started: ECOLE°61012  ← Élève A6 CHAV (CONDI)
🖱️ Drag move: ECOLE°61012 from 6°4 to 6°3  ← AUTORISÉ ❌
✅ saveCacheData succès

🖱️ Drag started: ECOLE°61001  ← Simple CHAV (FIXE)
🖱️ Drag move: ECOLE°61001 from 6°4 to 6°3  ← BLOQUÉ ✅
```

**Problème** : L'élève A6 CHAV (qui devrait être CONDI) a pu être déplacé, alors que le simple CHAV (FIXE) a été bloqué.

---

## 🔍 Diagnostic - canMove() Ne Vérifie Pas CONDI

### Code AVANT (Bug)

**Fichier** : `InterfaceV2_CoreScript.html` (ligne 407)

```javascript
function canMove(eleveId, srcClasse, dstClasse) {
  if (STATE.adminMode || srcClasse === dstClasse) return { ok: true };

  const e = STATE.students[eleveId];

  /* 🔒 FIXE : jamais de déplacement */
  if (e.mobilite === 'FIXE')
    return { ok:false, reason:`${e.nom} est FIXE dans sa classe` };

  /* 🔒 PERMUT : BLOQUÉ EN DRAG&DROP NORMAL */
  if (e.mobilite === 'PERMUT')
    return { ok:false, reason:`${e.nom} est PERMUT - utilisez le mode SWAP` };

  /* 🔒 SPEC : même règle que FIXE  (option prioritaire) */
  if (e.mobilite === 'SPEC')
    return { ok:false, reason:`${e.nom} est SPEC (option obligatoire)` };

  // ❌ PAS DE VÉRIFICATION POUR CONDI !
  // Résultat : CONDI est autorisé à bouger
}
```

**Problème** : La fonction vérifie `FIXE`, `PERMUT`, `SPEC`, mais **PAS** `CONDI` !

---

## ✅ **SOLUTION IMPLÉMENTÉE**

### Correction 1 : canMove() - Bloquer CONDI

**Fichier** : `InterfaceV2_CoreScript.html` (lignes 418-420)

```javascript
/* 🔒 CONDI : jamais de déplacement individuel (conditionné par le groupe) */
if (e.mobilite === 'CONDI')
  return { ok:false, reason:`${e.nom} est CONDI (groupe A${e.asso}) - utilisez le mode Admin` };
```

### Correction 2 : canSwap() - Bloquer CONDI

**Fichier** : `InterfaceV2_CoreScript.html` (lignes 534-536)

```javascript
// CONDI : jamais déplaçables (conditionnés par le groupe)
if (eleve1.mobilite === 'CONDI' || eleve2.mobilite === 'CONDI') {
  return { ok: false, reason: 'CONDI ne peut pas bouger (groupe ASSO)' };
}
```

---

## 📊 **Comparaison Avant/Après**

### Scénario : Élève A6 CHAV (CONDI)

#### AVANT (Bug)

| Action | Vérification | Résultat |
|--------|--------------|----------|
| Drag élève A6 CHAV | `canMove()` vérifie FIXE, PERMUT, SPEC | ❌ Pas de vérification CONDI |
| `e.mobilite === 'CONDI'` | Non vérifié | ❌ Autorisé à bouger |
| Déplacement | Autorisé | ❌ Groupe A6 cassé |

#### APRÈS (Corrigé)

| Action | Vérification | Résultat |
|--------|--------------|----------|
| Drag élève A6 CHAV | `canMove()` vérifie FIXE, CONDI, PERMUT, SPEC | ✅ Vérification CONDI |
| `e.mobilite === 'CONDI'` | Vérifié | ✅ Bloqué |
| Message | "est CONDI (groupe A6) - utilisez le mode Admin" | ✅ Clair |

---

## 🎯 **Statuts de Mobilité Bloqués**

### Drag & Drop Normal (canMove)

| Statut | Bloqué ? | Message | Raison |
|--------|----------|---------|--------|
| **FIXE** | ✅ Oui | "est FIXE dans sa classe" | Ancre avec option unique |
| **CONDI** | ✅ Oui | "est CONDI (groupe A6) - utilisez le mode Admin" | Suiveur conditionné |
| **PERMUT** | ✅ Oui | "est PERMUT - utilisez le mode SWAP" | Nécessite swap |
| **SPEC** | ✅ Oui | "est SPEC (option obligatoire)" | Option prioritaire |
| **LIBRE** | ❌ Non | - | Peut bouger librement |

### Mode Swap (canSwap)

| Statut | Bloqué ? | Message | Raison |
|--------|----------|---------|--------|
| **FIXE** | ✅ Oui | "FIXE ne peut pas bouger" | Jamais déplaçable |
| **CONDI** | ✅ Oui | "CONDI ne peut pas bouger (groupe ASSO)" | Groupe doit bouger ensemble |
| **SPEC** | ✅ Oui | "SPEC ne peut pas bouger" | Option prioritaire |
| **PERMUT** | ❌ Non | - | Peut swapper si compatible |
| **LIBRE** | ❌ Non | - | Peut swapper |

---

## 🧪 **Tests de Validation**

### Test 1 : Drag Élève CONDI

#### Configuration
```
E002 : ASSO=A6, mobilite=CONDI(A6→6°4)
Classe actuelle : 6°4
```

#### Avant Correction
```
1. Utilisateur drag E002 vers 6°3
2. canMove() vérifie : FIXE ? Non, PERMUT ? Non, SPEC ? Non
3. Résultat : Autorisé ❌
4. E002 déplacé en 6°3 ❌
5. Groupe A6 cassé ❌
```

#### Après Correction
```
1. Utilisateur drag E002 vers 6°3
2. canMove() vérifie : FIXE ? Non, CONDI ? Oui ✅
3. Message : "E002 est CONDI (groupe A6) - utilisez le mode Admin"
4. Déplacement bloqué ✅
5. Groupe A6 préservé ✅
```

### Test 2 : Swap Élève CONDI

#### Configuration
```
E002 : ASSO=A6, mobilite=CONDI(A6→6°4)
E999 : mobilite=LIBRE
```

#### Avant Correction
```
1. Utilisateur swap E002 ↔ E999
2. canSwap() vérifie : FIXE ? Non, SPEC ? Non
3. Résultat : Autorisé ❌
4. Swap effectué ❌
5. Groupe A6 cassé ❌
```

#### Après Correction
```
1. Utilisateur swap E002 ↔ E999
2. canSwap() vérifie : FIXE ? Non, SPEC ? Non, CONDI ? Oui ✅
3. Message : "CONDI ne peut pas bouger (groupe ASSO)"
4. Swap bloqué ✅
5. Groupe A6 préservé ✅
```

---

## 📝 **Fichiers Modifiés**

| Fichier | Lignes | Modification |
|---------|--------|--------------|
| `InterfaceV2_CoreScript.html` | 418-420 | ✅ Ajout vérification CONDI dans canMove() |
| `InterfaceV2_CoreScript.html` | 534-536 | ✅ Ajout vérification CONDI dans canSwap() |

**Total : 1 fichier modifié, 2 fonctions corrigées**

---

## 🎉 **Résultat Final**

### ✅ **Problème Résolu**

1. ✅ `canMove()` bloque maintenant les élèves CONDI
2. ✅ `canSwap()` bloque maintenant les élèves CONDI
3. ✅ Les élèves CONDI ne peuvent plus être déplacés individuellement
4. ✅ Les groupes ASSO avec ancre sont préservés
5. ✅ Message clair pour l'utilisateur

### 🎯 **Comportement Attendu**

```
Groupe A6 (6 élèves) dont 1 avec CHAV :
  → E001 (CHAV) : FIXE
  → E002-E006 : CONDI(A6→6°4)

Tentative de déplacement :
  → Drag E001 : Bloqué (FIXE) ✅
  → Drag E002 : Bloqué (CONDI) ✅
  → Swap E002 ↔ E999 : Bloqué (CONDI) ✅
  → Mode Admin : Autorisé ✅

Résultat :
  → Groupe A6 reste intact en 6°4 ✅
```

---

## 💡 **Leçons Apprises**

### 1. **Vérifier Tous les Statuts**
```javascript
// Au lieu de vérifier seulement FIXE, PERMUT, SPEC :
if (e.mobilite === 'FIXE') return { ok: false };
if (e.mobilite === 'PERMUT') return { ok: false };
if (e.mobilite === 'SPEC') return { ok: false };

// Ajouter CONDI :
if (e.mobilite === 'CONDI') return { ok: false };
```

### 2. **Messages Clairs**
```javascript
// Message informatif :
return { ok:false, reason:`${e.nom} est CONDI (groupe A${e.asso}) - utilisez le mode Admin` };
// Indique : statut, groupe, et solution
```

### 3. **Cohérence Drag & Swap**
```javascript
// Vérifier CONDI dans les deux fonctions :
// - canMove() pour drag & drop
// - canSwap() pour mode swap
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Bug critique corrigé  
**Priorité** : 🚨 URGENT
