# 🔍 AUDIT - Phase 4 Scores & Poids

## ✅ RÉSULTAT: PARTIELLEMENT CÂBLÉS

### 📊 Statut des Sliders

| Slider | ID HTML | Lu par UI? | Transmis Backend? | Nom Backend | Statut |
|--------|---------|------------|-------------------|-------------|--------|
| **COM** | `sliderCOM` | ✅ OUI | ✅ OUI | `com1` | ✅ **CÂBLÉ** |
| **TRA** | `sliderTRA` | ✅ OUI | ✅ OUI | `tra4` | ✅ **CÂBLÉ** |
| **PART** | `sliderPART` | ✅ OUI | ✅ OUI | `part4` | ✅ **CÂBLÉ** |
| **ABS** | `sliderABS` | ✅ OUI | ❌ **NON** | *(absent)* | ❌ **NON CÂBLÉ** |
| **Max Swaps** | `sliderMaxSwaps` | ✅ OUI | ✅ OUI | `maxSwaps` | ✅ **CÂBLÉ** |
| **Durée** | `sliderRuntime` | ✅ OUI | ⚠️ Partiel | *(non utilisé)* | ⚠️ **IGNORÉ** |
| **Parité** | `sliderParity` | ✅ OUI | ⚠️ Partiel | *(non utilisé)* | ⚠️ **IGNORÉ** |

---

## 📍 Code Actuel (Ligne 1900-1908)

### Frontend (OptimizationPanel.html)

```javascript
const poidsOverride = {
  tetesDeClasse: 3.0,
  niveau1: 2.5,
  distribution: 1.5,
  com1: parseFloat(document.getElementById('sliderCOM').value),    // ✅ CÂBLÉ
  tra4: parseFloat(document.getElementById('sliderTRA').value),    // ✅ CÂBLÉ
  part4: parseFloat(document.getElementById('sliderPART').value),  // ✅ CÂBLÉ
  garantieTete: 1000
};
// ❌ ABS manquant!
```

### Backend (Phase4_Optimisation_V15.gs)

```javascript
const poids = { 
  tetesDeClasse: 3.0, 
  niveau1: 2.5, 
  distribution: 1.5, 
  com1: 0,    // ✅ Utilisé
  tra4: 0,    // ✅ Utilisé
  part4: 0,   // ✅ Utilisé
  garantieTete: 1000 
};

// ❌ ABS n'existe pas dans le backend!
```

---

## ❌ Problèmes Identifiés

### 1. **ABS (Absences) NON CÂBLÉ**

**Problème**: Le slider existe dans l'UI mais:
- ❌ N'est PAS lu lors du lancement
- ❌ N'est PAS transmis au backend
- ❌ N'existe PAS dans le backend

**Impact**: L'utilisateur pense pouvoir ajuster les absences mais **ça ne fait rien**.

---

### 2. **Durée Maximale IGNORÉE**

**Problème**: Le slider `sliderRuntime` est lu mais:
- ⚠️ Transmis dans `config.runtimeSec`
- ❌ Mais NON utilisé par le backend
- Le backend utilise un timeout fixe

**Impact**: L'utilisateur pense pouvoir limiter la durée mais **ça ne fait rien**.

---

### 3. **Tolérance Parité IGNORÉE**

**Problème**: Le slider `sliderParity` est lu mais:
- ⚠️ Transmis dans `config.parityTolerance`
- ❌ Mais le backend utilise une valeur fixe (2)

**Code Backend**:
```javascript
// Parité OK si |F-M| <= tolérance
if (Math.abs(F - M) <= 2) parityOk++;  // ❌ Valeur fixe!
```

**Impact**: L'utilisateur pense pouvoir ajuster la tolérance mais **ça ne fait rien**.

---

## ✅ Ce Qui Fonctionne

### Sliders Câblés Correctement

1. **COM (Comportement)** ✅
   - Lu: `sliderCOM`
   - Transmis: `com1`
   - Utilisé: Backend calcule `estCom1` et équilibre

2. **TRA (Travail)** ✅
   - Lu: `sliderTRA`
   - Transmis: `tra4`
   - Utilisé: Backend calcule `estTra4` et équilibre

3. **PART (Participation)** ✅
   - Lu: `sliderPART`
   - Transmis: `part4`
   - Utilisé: Backend calcule `estPart4` et équilibre

4. **Max Swaps** ✅
   - Lu: `sliderMaxSwaps`
   - Transmis: `maxSwaps`
   - Utilisé: Backend limite le nombre de permutations

---

## 🔧 Corrections Nécessaires

### Option 1: Supprimer les Sliders Inutiles (Recommandé)

```diff
- <!-- ABS -->
- <div class="mb-6">
-   <label>Absences (ABS)</label>
-   <input type="range" id="sliderABS" ...>
- </div>

- <!-- Durée maximale -->
- <div class="mb-6">
-   <label>Durée maximale</label>
-   <input type="range" id="sliderRuntime" ...>
- </div>

- <!-- Tolérance parité -->
- <div class="mb-6">
-   <label>Tolérance parité</label>
-   <input type="range" id="sliderParity" ...>
- </div>
```

### Option 2: Implémenter dans le Backend (Complexe)

**Pour ABS**:
```javascript
// Backend: Ajouter abs4 dans les poids
const poids = { 
  tetesDeClasse: 3.0, 
  niveau1: 2.5, 
  distribution: 1.5, 
  com1: 0, 
  tra4: 0, 
  part4: 0,
  abs4: 0,  // ✅ NOUVEAU
  garantieTete: 1000 
};

// Classifier les élèves
classifierEleves(students, ["com1", "tra4", "part4", "abs4"]);
```

**Pour Durée**:
```javascript
// Backend: Utiliser runtimeSec pour timeout
const startTime = Date.now();
const maxDuration = config.runtimeSec * 1000; // ms

while (Date.now() - startTime < maxDuration) {
  // Optimisation...
}
```

**Pour Parité**:
```javascript
// Backend: Utiliser parityTolerance
const tolerance = config.parityTolerance || 2;
if (Math.abs(F - M) <= tolerance) parityOk++;
```

---

## 📊 Recommandation

### Solution Immédiate: **Supprimer les 3 Sliders Inutiles**

**Raisons**:
1. ✅ Plus honnête avec l'utilisateur
2. ✅ Interface plus claire (moins d'options)
3. ✅ Pas de risque de confusion
4. ✅ Pas de développement backend nécessaire

**Garder uniquement**:
- ✅ COM
- ✅ TRA
- ✅ PART
- ✅ Max Swaps

---

## ✅ Actions

1. **SUPPRIMER** les sliders ABS, Durée, Parité
2. **GARDER** COM, TRA, PART, Max Swaps
3. **DOCUMENTER** que ces 4 critères sont les seuls configurables

---

**Voulez-vous que je supprime les 3 sliders inutiles?** 🔧
