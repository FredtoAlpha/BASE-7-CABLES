# 🚨 BUGFIX CRITIQUE - Colonnes FIXE/MOBILITE Effacées

## 📋 Symptôme Observé

Après l'optimisation :
- ✅ Les élèves ITA sont bien concentrés en 6°3
- ✅ Les élèves CHAV sont bien concentrés en 6°4
- ✅ Les colonnes P (FIXE) et T (MOBILITE) sont remplies dans CACHE
- ❌ **MAIS** après "Publier", ces colonnes sont **effacées**
- ❌ InterfaceV2 permet de déplacer les élèves ITA et CHAV manuellement

---

## 🔍 Diagnostic - La Chaîne Complète

### Étape 1 : Calcul de la Mobilité ✅
```javascript
// computeMobilityFlags_() dans Mobility_System.gs
// Calcule correctement :
eleve.mobility = 'FIXE'  // Pour élèves avec 1 seule classe
eleve.fixe = 'X'
```

### Étape 2 : Écriture dans CACHE ✅
```javascript
// Les colonnes P (FIXE) et T (MOBILITE) sont bien écrites
6°3CACHE :
  ID    | NOM    | PRENOM | ... | FIXE | MOBILITE
  E001  | DUPONT | Jean   | ... | X    | FIXE
```

### Étape 3 : Publication ❌
```javascript
// L'utilisateur clique "Publier"
// → Appelle saveElevesCache(classMap)
// → Appelle saveElevesGeneric(classMap, { suffix: 'CACHE' })
```

### Étape 4 : Construction de l'Index ❌
```javascript
// buildStudentIndex_() scanne les onglets
// Ordre de scan : TEST, CACHE, FIN (ordre alphabétique des onglets)

// Exemple pour élève E001 :
1. Scanne 6°1TEST :
   index["E001"] = [ID, NOM, PRENOM, ...]  // 15 colonnes, pas de FIXE/MOBILITE

2. Scanne 6°3CACHE :
   index["E001"] = [ID, NOM, PRENOM, ..., FIXE, MOBILITE]  // 20 colonnes ✅

3. Scanne 6°5FIN :
   index["E001"] = [ID, NOM, PRENOM, ...]  // 15 colonnes, pas de FIXE/MOBILITE ❌

// ❌ PROBLÈME : La dernière occurrence écrase la bonne !
```

### Étape 5 : Écriture dans CACHE ❌
```javascript
// saveElevesGeneric utilise l'index incomplet
sh.clear();  // Efface tout
sh.setValues([header, ...rowData]);  // Écrit depuis index

// Résultat : Les colonnes P/T sont vides car index["E001"] n'a que 15 colonnes
```

### Étape 6 : Conséquence ❌
```javascript
// InterfaceV2 lit CACHE
// Pas de FIXE/MOBILITE → Tous les élèves = LIBRE
// Permet de déplacer ITA et CHAV manuellement
```

---

## 🚨 **LA FONCTION COUPABLE**

### **`buildStudentIndex_()`** (Code.gs ligne 482)

#### Code AVANT (Bug)
```javascript
function buildStudentIndex_() {
  const index = {};
  
  sheets.forEach(sh => {
    // ...
    for (let r = 1; r < data.length; r++) {
      const id = _eleves_s(data[r][colId]);
      if (id) index[id] = data[r];  // ❌ Écrase systématiquement
    }
  });
  
  return { header, rows: index };
}
```

**Problème** :
- Écrase `index[id]` à chaque occurrence
- Si le dernier onglet scanné est TEST ou FIN (sans FIXE/MOBILITE), l'index perd ces colonnes
- `saveElevesGeneric` écrit ensuite cet index incomplet dans CACHE

---

## ✅ **SOLUTION IMPLÉMENTÉE**

### Priorité aux Lignes les Plus Complètes

**Fichier** : `Code.gs` (lignes 502-508)

#### Code APRÈS (Corrigé)
```javascript
function buildStudentIndex_() {
  const index = {};
  
  sheets.forEach(sh => {
    // ...
    for (let r = 1; r < data.length; r++) {
      const id = _eleves_s(data[r][colId]);
      if (id) {
        // ✅ CORRECTION CRITIQUE : Garder la version la plus complète
        // Ne pas écraser si la nouvelle ligne est plus courte
        if (!index[id] || data[r].length > index[id].length) {
          index[id] = data[r];
        }
      }
    }
  });
  
  return { header, rows: index };
}
```

**Logique** :
1. Si l'élève n'est pas encore dans l'index → Ajouter
2. Si la nouvelle ligne a **plus de colonnes** que l'ancienne → Remplacer (version plus complète)
3. Si la nouvelle ligne a **moins de colonnes** → **Ne pas écraser** (garder la version complète)

---

## 📊 **Comparaison Avant/Après**

### Scénario : Élève E001 avec FIXE/MOBILITE

#### AVANT (Bug)

| Ordre Scan | Onglet | Colonnes | Action | Résultat Index |
|------------|--------|----------|--------|----------------|
| 1 | `6°1TEST` | 15 (pas FIXE/MOB) | `index["E001"] = ligne` | 15 colonnes |
| 2 | `6°3CACHE` | 20 (avec FIXE/MOB) | `index["E001"] = ligne` ✅ | 20 colonnes ✅ |
| 3 | `6°5FIN` | 15 (pas FIXE/MOB) | `index["E001"] = ligne` ❌ | 15 colonnes ❌ |

**Résultat** : Index final = 15 colonnes (sans FIXE/MOBILITE) ❌

#### APRÈS (Corrigé)

| Ordre Scan | Onglet | Colonnes | Action | Résultat Index |
|------------|--------|----------|--------|----------------|
| 1 | `6°1TEST` | 15 (pas FIXE/MOB) | `index["E001"] = ligne` | 15 colonnes |
| 2 | `6°3CACHE` | 20 (avec FIXE/MOB) | `20 > 15` → Remplacer ✅ | 20 colonnes ✅ |
| 3 | `6°5FIN` | 15 (pas FIXE/MOB) | `15 < 20` → **Ne pas écraser** ✅ | 20 colonnes ✅ |

**Résultat** : Index final = 20 colonnes (avec FIXE/MOBILITE) ✅

---

## 🧪 **Test de Validation**

### Avant Correction
```
1. Optimisation → ITA concentré en 6°3
2. Colonnes P/T remplies dans 6°3CACHE
3. Clic "Publier"
4. buildStudentIndex_() scanne :
   - 6°1TEST (15 col) → index["E001"] = 15 col
   - 6°3CACHE (20 col) → index["E001"] = 20 col ✅
   - 6°5FIN (15 col) → index["E001"] = 15 col ❌
5. saveElevesGeneric écrit index (15 col)
6. 6°3CACHE : Colonnes P/T vides ❌
7. InterfaceV2 : Peut déplacer ITA ❌
```

### Après Correction
```
1. Optimisation → ITA concentré en 6°3
2. Colonnes P/T remplies dans 6°3CACHE
3. Clic "Publier"
4. buildStudentIndex_() scanne :
   - 6°1TEST (15 col) → index["E001"] = 15 col
   - 6°3CACHE (20 col) → 20 > 15 → index["E001"] = 20 col ✅
   - 6°5FIN (15 col) → 15 < 20 → Ne pas écraser ✅
5. saveElevesGeneric écrit index (20 col)
6. 6°3CACHE : Colonnes P/T préservées ✅
7. InterfaceV2 : ITA = FIXE, ne peut pas déplacer ✅
```

---

## 🎯 **Avantages de la Solution**

### ✅ **Préservation Automatique**
- Garde toujours la version **la plus complète**
- Pas besoin de spécifier l'ordre de priorité des onglets
- Fonctionne quel que soit l'ordre de scan

### ✅ **Robustesse**
- Si un onglet a plus de colonnes (ex: colonnes personnalisées), elles sont préservées
- Si un onglet a moins de colonnes, il n'écrase pas les données existantes

### ✅ **Compatibilité**
- Fonctionne avec TEST, CACHE, FIN
- Fonctionne même si de nouvelles colonnes sont ajoutées plus tard

---

## 📋 **Cas d'Usage**

### Cas 1 : Élève avec FIXE/MOBILITE
```javascript
// CACHE a 20 colonnes (avec P/T)
// TEST a 15 colonnes (sans P/T)
// FIN a 15 colonnes (sans P/T)

// Résultat : index garde les 20 colonnes de CACHE ✅
```

### Cas 2 : Élève avec Colonnes Personnalisées
```javascript
// CACHE a 25 colonnes (avec colonnes custom)
// TEST a 15 colonnes
// FIN a 15 colonnes

// Résultat : index garde les 25 colonnes de CACHE ✅
```

### Cas 3 : Élève Uniquement dans TEST
```javascript
// TEST a 15 colonnes
// Pas dans CACHE ni FIN

// Résultat : index garde les 15 colonnes de TEST ✅
```

---

## 🚀 **Impact de la Correction**

### Avant (Bug)
```
Optimisation → ✅ Fonctionne
Colonnes P/T → ✅ Remplies
Publication → ❌ Efface P/T
InterfaceV2 → ❌ Permet déplacement ITA/CHAV
```

### Après (Corrigé)
```
Optimisation → ✅ Fonctionne
Colonnes P/T → ✅ Remplies
Publication → ✅ Préserve P/T
InterfaceV2 → ✅ Bloque déplacement ITA/CHAV
```

---

## 📝 **Fichiers Modifiés**

| Fichier | Lignes | Modification |
|---------|--------|--------------|
| `Code.gs` | 502-508 | ✅ Ajout condition `data[r].length > index[id].length` |

**Total : 1 fichier modifié, 6 lignes ajoutées**

---

## 🎉 **Résultat Final**

### ✅ **Problème Résolu**

1. ✅ `buildStudentIndex_()` garde la version la plus complète
2. ✅ Les colonnes FIXE/MOBILITE sont préservées après publication
3. ✅ InterfaceV2 respecte le statut FIXE des élèves
4. ✅ Les élèves ITA/CHAV ne peuvent plus être déplacés manuellement

### 🎯 **Comportement Attendu**

```
Élève ITA avec 1 seule classe (6°3) :
  → Phase 1 : Place en 6°3
  → Mobilité : FIXE
  → CACHE : Colonne P = "X", Colonne T = "FIXE"
  → Publication : Colonnes préservées ✅
  → InterfaceV2 : Bouton déplacer désactivé ✅
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Bug critique corrigé  
**Priorité** : 🚨 URGENT
