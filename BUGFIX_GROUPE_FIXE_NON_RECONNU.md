# 🚨 BUGFIX CRITIQUE - GROUPE_FIXE Non Reconnu par Phase 4

## 📋 Symptôme Observé

### Scénario
```
6 élèves avec code ASSO A2 (doivent rester ensemble)
1 de ces élèves a ITA (présent uniquement en 6°3)

Attendu : Tout le groupe A2 doit aller en 6°3
Résultat : Le groupe A2 est dispersé dans plusieurs classes ❌
```

---

## 🔍 Diagnostic - Problème de "Traduction"

### Deux Modules Qui Ne Parlent Pas la Même Langue

#### Le Producteur : Phase 2 (ASSO/DISSO)
```javascript
// Phase2I_DissoAsso.gs écrit des messages descriptifs :
eleve.mobility = "GROUPE_FIXE(A6→6°1)"
eleve.mobility = "GROUPE_PERMUT(D3→6°2,6°4)"
```

**Intention** : Documenter **pourquoi** le groupe est fixé et **où** il doit aller

#### Le Consommateur : Phase 4 (Optimisation)
```javascript
// Phase4_Optimisation_V15.gs attend des mots-clés simples :
if (mobilite === 'FIXE') {  // ❌ Comparaison stricte
    // Ne pas déplacer
}
```

**Problème** : `"GROUPE_FIXE(A6→6°1)" !== "FIXE"` → L'élève est considéré comme LIBRE !

---

## 🚨 **LA CHAÎNE DE L'ÉCHEC**

### Étape par Étape

```
1. Phase 1 : Élève E001 a ITA → Placé en 6°3 ✅

2. Phase 2 (ASSO/DISSO) :
   - Détecte : E001 fait partie du groupe A2
   - Conclut : Tout le groupe A2 doit aller en 6°3
   - Écrit : eleve.mobility = "GROUPE_FIXE(A2→6°3)" ✅

3. Phase 4 (Optimisation) :
   - Lit : mobilite = "GROUPE_FIXE(A2→6°3)"
   - Compare : "GROUPE_FIXE(...)" === "FIXE" ? ❌ FALSE
   - Conclut : mobilite = "LIBRE" (par défaut) ❌
   - Autorise : Déplacement des élèves A2 ❌

4. Résultat :
   - Le groupe A2 est dispersé ❌
   - L'élève ITA reste en 6°3 ✅
   - Les autres élèves A2 sont déplacés ailleurs ❌
```

---

## 🔍 **CODE PROBLÉMATIQUE**

### Ligne 2243 : Normalisation Stricte
```javascript
// Phase4_Optimisation_V15.gs ligne 2243
let mobilite = String(mobValue || 'LIBRE').trim().toUpperCase();
if (!['FIXE', 'PERMUT', 'CONDI', 'SPEC', 'LIBRE'].includes(mobilite)) {
    mobilite = 'LIBRE';  // ❌ GROUPE_FIXE devient LIBRE !
}
```

### Ligne 5115 : Même Problème
```javascript
// Phase4_Optimisation_V15.gs ligne 5115
const mobRaw = String(row[INDICES_COLONNES.MOBILITE - 1] || 'LIBRE').trim().toUpperCase();
stu.mobilite = ['FIXE', 'PERMUT', 'CONDI', 'SPEC', 'LIBRE'].includes(mobRaw) ? mobRaw : 'LIBRE';
// ❌ GROUPE_FIXE n'est pas dans la liste → LIBRE
```

### Ligne 1472 : Vérification Stricte
```javascript
// Phase4_Optimisation_V15.gs ligne 1472
if (mobilite1 === 'FIXE' || mobilite2 === 'FIXE') {
    // Ne pas échanger
    return false;
}
// ❌ "GROUPE_FIXE(...)" !== "FIXE" → Autorise l'échange
```

---

## ✅ **SOLUTION IMPLÉMENTÉE**

### Normalisation Intelligente des Formats

**Fichier** : `Phase4_Optimisation_V15.gs` (lignes 2244-2253 et 5116-5121)

#### Avant (Bug)
```javascript
// Ligne 2243
let mobilite = String(mobValue || 'LIBRE').trim().toUpperCase();
if (!['FIXE', 'PERMUT', 'CONDI', 'SPEC', 'LIBRE'].includes(mobilite)) {
    mobilite = 'LIBRE';  // ❌ GROUPE_FIXE → LIBRE
}
```

#### Après (Corrigé)
```javascript
// Lignes 2244-2253
let mobilite = String(mobValue || 'LIBRE').trim().toUpperCase();

// ✅ CORRECTION CRITIQUE : Normaliser les formats GROUPE_FIXE/GROUPE_PERMUT
// Phase 2 (ASSO/DISSO) écrit "GROUPE_FIXE(A6→6°1)" ou "GROUPE_PERMUT(D3→6°2,6°4)"
// Phase 4 doit les reconnaître comme FIXE ou PERMUT
if (mobilite.startsWith('GROUPE_FIXE')) {
    mobilite = 'FIXE';
} else if (mobilite.startsWith('GROUPE_PERMUT')) {
    mobilite = 'PERMUT';
} else if (!['FIXE', 'PERMUT', 'CONDI', 'SPEC', 'LIBRE'].includes(mobilite)) {
    mobilite = 'LIBRE';
}
```

---

## 📊 **Comparaison Avant/Après**

### Scénario : Groupe A2 avec 1 Élève ITA

#### AVANT (Bug)

| Étape | Action | Résultat |
|-------|--------|----------|
| Phase 1 | Élève E001 (ITA) → 6°3 | ✅ Placé |
| Phase 2 | Groupe A2 → `GROUPE_FIXE(A2→6°3)` | ✅ Écrit |
| Phase 4 Lecture | `"GROUPE_FIXE(...)" !== "FIXE"` | ❌ Non reconnu |
| Phase 4 Normalisation | `mobilite = "LIBRE"` | ❌ Devient LIBRE |
| Phase 4 Swap | Autorise déplacement élèves A2 | ❌ Groupe cassé |
| **Résultat** | E001 en 6°3, autres A2 dispersés | ❌ BUG |

#### APRÈS (Corrigé)

| Étape | Action | Résultat |
|-------|--------|----------|
| Phase 1 | Élève E001 (ITA) → 6°3 | ✅ Placé |
| Phase 2 | Groupe A2 → `GROUPE_FIXE(A2→6°3)` | ✅ Écrit |
| Phase 4 Lecture | `mobilite.startsWith('GROUPE_FIXE')` | ✅ Reconnu |
| Phase 4 Normalisation | `mobilite = "FIXE"` | ✅ Normalisé |
| Phase 4 Swap | Bloque déplacement élèves A2 | ✅ Groupe préservé |
| **Résultat** | Tout le groupe A2 en 6°3 | ✅ OK |

---

## 🧪 **Tests de Validation**

### Test 1 : Groupe ASSO avec Option Unique

#### Configuration
```
Élèves :
  E001 : ITA, ASSO=A2
  E002 : ASSO=A2
  E003 : ASSO=A2
  E004 : ASSO=A2
  E005 : ASSO=A2
  E006 : ASSO=A2

Quotas :
  6°3 : ITA=6
  Autres classes : Pas d'ITA
```

#### Avant Correction
```
Phase 1 : E001 → 6°3 (ITA)
Phase 2 : Groupe A2 → GROUPE_FIXE(A2→6°3)
Phase 4 : Ne reconnaît pas GROUPE_FIXE
Résultat :
  6°3 : E001 (ITA) ✅
  6°1 : E002, E003 ❌
  6°2 : E004, E005 ❌
  6°4 : E006 ❌
```

#### Après Correction
```
Phase 1 : E001 → 6°3 (ITA)
Phase 2 : Groupe A2 → GROUPE_FIXE(A2→6°3)
Phase 4 : Reconnaît GROUPE_FIXE → FIXE
Résultat :
  6°3 : E001, E002, E003, E004, E005, E006 ✅
  Autres classes : Aucun élève A2 ✅
```

### Test 2 : Groupe DISSO avec PERMUT

#### Configuration
```
Élèves :
  E007 : CHAV, DISSO=D3
  E008 : DISSO=D3

Quotas :
  6°2 : CHAV=5
  6°4 : CHAV=5
```

#### Avant Correction
```
Phase 2 : Groupe D3 → GROUPE_PERMUT(D3→6°2,6°4)
Phase 4 : Ne reconnaît pas GROUPE_PERMUT
Résultat :
  E007 et E008 peuvent être dans la même classe ❌
```

#### Après Correction
```
Phase 2 : Groupe D3 → GROUPE_PERMUT(D3→6°2,6°4)
Phase 4 : Reconnaît GROUPE_PERMUT → PERMUT
Résultat :
  E007 et E008 ne peuvent pas être échangés ensemble ✅
  Contrainte DISSO respectée ✅
```

---

## 🎯 **Formats Reconnus**

### Formats Écrits par Phase 2
```javascript
"GROUPE_FIXE(A6→6°1)"           → Normalisé en "FIXE"
"GROUPE_FIXE(A2→6°3)"           → Normalisé en "FIXE"
"GROUPE_PERMUT(D3→6°2,6°4)"     → Normalisé en "PERMUT"
"GROUPE_PERMUT(D5→6°1,6°3,6°5)" → Normalisé en "PERMUT"
```

### Formats Standards (Inchangés)
```javascript
"FIXE"   → Reste "FIXE"
"PERMUT" → Reste "PERMUT"
"CONDI"  → Reste "CONDI"
"SPEC"   → Reste "SPEC"
"LIBRE"  → Reste "LIBRE"
```

### Formats Invalides
```javascript
"BLOQUE"        → Devient "LIBRE"
"GROUPE_A6"     → Devient "LIBRE"
"FIXE_CUSTOM"   → Devient "LIBRE" (ne commence pas par GROUPE_FIXE)
""              → Devient "LIBRE"
```

---

## 📝 **Fichiers Modifiés**

| Fichier | Lignes | Modification |
|---------|--------|--------------|
| `Phase4_Optimisation_V15.gs` | 2244-2253 | ✅ Normalisation GROUPE_FIXE/GROUPE_PERMUT |
| `Phase4_Optimisation_V15.gs` | 5116-5121 | ✅ Normalisation GROUPE_FIXE/GROUPE_PERMUT |

**Total : 1 fichier modifié, 2 blocs de code corrigés**

---

## 🎉 **Résultat Final**

### ✅ **Problème Résolu**

1. ✅ Phase 4 reconnaît maintenant `GROUPE_FIXE(...)` comme `FIXE`
2. ✅ Phase 4 reconnaît maintenant `GROUPE_PERMUT(...)` comme `PERMUT`
3. ✅ Les groupes ASSO avec option unique restent ensemble
4. ✅ Les groupes DISSO avec option unique respectent les contraintes
5. ✅ La logique "élève avec option bloque le groupe" fonctionne

### 🎯 **Comportement Attendu**

```
Groupe A2 (6 élèves) dont 1 avec ITA (uniquement en 6°3) :
  → Phase 1 : Place l'élève ITA en 6°3
  → Phase 2 : Détecte que tout le groupe A2 doit aller en 6°3
  → Phase 2 : Écrit GROUPE_FIXE(A2→6°3) pour tous les élèves A2
  → Phase 4 : Normalise GROUPE_FIXE → FIXE
  → Phase 4 : Ne déplace aucun élève du groupe A2
  → Résultat : Tout le groupe A2 en 6°3 ✅
```

---

## 💡 **Leçons Apprises**

### 1. **Formats Extensibles**
```javascript
// Au lieu de comparer strictement :
if (mobilite === 'FIXE') { }

// Utiliser des préfixes :
if (mobilite === 'FIXE' || mobilite.startsWith('GROUPE_FIXE')) { }
```

### 2. **Normalisation Centralisée**
```javascript
// Normaliser dès la lecture
if (mobilite.startsWith('GROUPE_FIXE')) {
    mobilite = 'FIXE';
}
// Ensuite, utiliser la valeur normalisée partout
```

### 3. **Documentation des Formats**
```javascript
// Documenter les formats acceptés
// Phase 2 écrit : "GROUPE_FIXE(A6→6°1)"
// Phase 4 normalise : "FIXE"
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Bug critique corrigé  
**Priorité** : 🚨 URGENT
