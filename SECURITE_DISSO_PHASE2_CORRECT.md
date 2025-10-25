# 🔒 SÉCURITÉ DISSO EN PHASE 2 (VERSION CORRECTE)

## 🎯 RÈGLE ABSOLUE

**LV2/OPT = CONTRAINTE ABSOLUE**

Phase 1 place les élèves selon LV2/OPT **SANS VÉRIFIER** les codes DISSO.  
Phase 2 tente de séparer les codes DISSO **SI ET SEULEMENT SI** cela ne viole pas les contraintes LV2/OPT.

---

## 📋 LOGIQUE CORRECTE

### Phase 1 : LV2/OPT = PRIORITÉ ABSOLUE ✅

```
Élève A : LV2=ITA, DISSO=D1
Élève B : LV2=ITA, DISSO=D1
ITA proposé uniquement en 6°1

Phase 1 :
  ✅ Élève A placé en 6°1 (ITA)
  ✅ Élève B placé en 6°1 (ITA)
  ✅ PAS DE VÉRIFICATION DISSO
```

**Résultat Phase 1** : Les 2 élèves D1 sont en 6°1 (c'est normal et attendu)

### Phase 2 : DISSO = SÉCURITÉ SI POSSIBLE ✅

```
Phase 2 détecte : 2 élèves D1 en 6°1

Tentative de séparation :
  1. Chercher une classe qui propose ITA ET sans D1
     → Aucune autre classe ne propose ITA
  
  2. 🔒 CONTRAINTE LV2/OPT ABSOLUE
     → Impossible de déplacer sans violer ITA
  
  3. ⚠️ ACCEPTER LE DOUBLON
     → Les 2 élèves D1 restent en 6°1
```

**Résultat Phase 2** : Les 2 élèves D1 restent en 6°1 (contrainte impossible)

---

## 🛠️ IMPLÉMENTATION

### Fonction : `findClassWithoutCodeD_V3()`

**Fichiers** :
- `Phases_BASEOPTI_V3_COMPLETE.gs`, ligne 302
- `BASEOPTI_Architecture_V3.gs`, ligne 358

```javascript
function findClassWithoutCodeD_V3(data, headers, codeD, indicesWithD, eleveIdx, ctx) {
  // Récupérer LV2/OPT de l'élève
  const eleveLV2 = String(data[eleveIdx][idxLV2] || '').trim().toUpperCase();
  const eleveOPT = String(data[eleveIdx][idxOPT] || '').trim().toUpperCase();

  // Classes déjà occupées par ce code DISSO
  const classesWithD = new Set();
  indicesWithD.forEach(function(idx) {
    const cls = String(data[idx][idxAssigned] || '').trim();
    if (cls) classesWithD.add(cls);
  });

  // 🔒 PRIORITÉ 1 : Trouver une classe qui propose LV2/OPT ET sans code DISSO
  if (eleveLV2 || eleveOPT) {
    for (const cls of Array.from(allClasses)) {
      if (classesWithD.has(cls)) continue; // Déjà un élève avec ce code DISSO

      // Vérifier si cette classe propose LV2/OPT de l'élève
      const quotas = (ctx && ctx.quotas && ctx.quotas[cls]) || {};
      
      let canPlace = false;
      if (eleveLV2 && ['ITA', 'ESP', 'ALL', 'PT'].indexOf(eleveLV2) >= 0) {
        canPlace = (quotas[eleveLV2] !== undefined && quotas[eleveLV2] > 0);
      } else if (eleveOPT) {
        canPlace = (quotas[eleveOPT] !== undefined && quotas[eleveOPT] > 0);
      }

      if (canPlace) {
        return cls; // ✅ Classe compatible trouvée
      }
    }

    // ⚠️ Aucune classe compatible trouvée
    return null; // ❌ Impossible de déplacer sans violer LV2/OPT
  }

  // 🔒 PRIORITÉ 2 : Si pas de LV2/OPT spécifique, n'importe quelle classe sans code DISSO
  for (const cls of allClasses) {
    if (!classesWithD.has(cls)) {
      return cls;
    }
  }

  return null; // Aucune classe disponible
}
```

---

## 📊 SCÉNARIOS

### Scénario 1 : Séparation possible ✅

```
Élève A : LV2=ITA, DISSO=D1 → Placé en 6°1 (Phase 1)
Élève B : LV2=ITA, DISSO=D1 → Placé en 6°1 (Phase 1)

ITA proposé en 6°1 ET 6°2

Phase 2 :
  1. Détecte 2 D1 en 6°1
  2. Cherche classe avec ITA sans D1 → 6°2 ✅
  3. Déplace Élève B en 6°2

Résultat : Élève A en 6°1, Élève B en 6°2 ✅
```

### Scénario 2 : Séparation impossible (contrainte LV2) ❌→✅

```
Élève A : LV2=ITA, DISSO=D1 → Placé en 6°1 (Phase 1)
Élève B : LV2=ITA, DISSO=D1 → Placé en 6°1 (Phase 1)

ITA proposé UNIQUEMENT en 6°1

Phase 2 :
  1. Détecte 2 D1 en 6°1
  2. Cherche classe avec ITA sans D1 → Aucune ❌
  3. 🔒 CONTRAINTE LV2 ABSOLUE
  4. ⚠️ Laisse les 2 élèves en 6°1

Résultat : Élève A en 6°1, Élève B en 6°1 ⚠️ (accepté)
```

### Scénario 3 : Élève sans LV2/OPT spécifique ✅

```
Élève A : LV2="", OPT="", DISSO=D1 → Placé en 6°1 (Phase 3)
Élève B : LV2="", OPT="", DISSO=D1 → Placé en 6°1 (Phase 3)

Phase 2 :
  1. Détecte 2 D1 en 6°1
  2. Pas de contrainte LV2/OPT
  3. Cherche n'importe quelle classe sans D1 → 6°2 ✅
  4. Déplace Élève B en 6°2

Résultat : Élève A en 6°1, Élève B en 6°2 ✅
```

---

## 📝 LOGS ATTENDUS

### Cas 1 : Séparation réussie

```
📌 PHASE 2 V3 - Codes ASSO/DISSO
🚫 Groupes DISSO : 1
  🚫 D=D1 : 2 élèves à séparer
    ⚠️ 6°1 contient 2 D=D1
        ✅ Classe 6°2 compatible (propose ITA)
      ✅ MARTIN Jean : 6°1 → 6°2
✅ PHASE 2 V3 terminée : 0 ASSO, 1 DISSO
```

### Cas 2 : Séparation impossible (contrainte LV2)

```
📌 PHASE 2 V3 - Codes ASSO/DISSO
🚫 Groupes DISSO : 1
  🚫 D=D1 : 2 élèves à séparer
    ⚠️ 6°1 contient 2 D=D1
        ⚠️ Aucune classe sans D=D1 ne propose ITA
        🔒 CONTRAINTE LV2/OPT ABSOLUE : élève reste dans sa classe (doublon DISSO accepté)
      ⚠️ MARTIN Jean reste en 6°1 (contrainte LV2/OPT absolue)
✅ PHASE 2 V3 terminée : 0 ASSO, 0 DISSO
```

---

## 🎯 AVANTAGES DE CETTE APPROCHE

### ✅ Respect de la hiérarchie des contraintes

1. **LV2/OPT** = Contrainte absolue (Phase 1)
2. **DISSO** = Contrainte secondaire (Phase 2, si possible)

### ✅ Transparence

Les logs indiquent clairement :
- Quand un élève est déplacé
- Quand un élève reste (contrainte impossible)
- Pourquoi (LV2/OPT absolue)

### ✅ Pas de violation silencieuse

Si un doublon DISSO ne peut pas être évité, il est **accepté** et **loggé**, pas ignoré.

---

## ⚠️ CAS LIMITES ACCEPTÉS

### Cas 1 : Une seule classe pour une option

```
2 élèves D1 font ITA
ITA uniquement en 6°1
→ Les 2 élèves D1 restent en 6°1 ✅ (accepté)
```

### Cas 2 : Toutes les classes ont déjà un D1

```
6 élèves D1 font ITA
ITA en 6°1, 6°2, 6°3, 6°4, 6°5 (5 classes)
→ 5 élèves placés (1 par classe)
→ 6ème élève placé en Phase 3 dans une classe avec déjà un D1 ✅ (accepté)
```

**C'est acceptable** car :
- La contrainte LV2/OPT est respectée
- On a minimisé les doublons (5/6 classes OK)
- C'est une contrainte physique (pas assez de classes)

---

## 🔄 INTERACTION ENTRE PHASES

### Phase 1 : Placement LV2/OPT

```
✅ Place TOUS les élèves selon LV2/OPT
❌ NE VÉRIFIE PAS les codes DISSO
```

### Phase 2 : Séparation DISSO (si possible)

```
✅ Détecte les doublons DISSO
✅ Tente de séparer SI classe compatible (LV2/OPT)
⚠️ Accepte les doublons SI contrainte impossible
```

### Phase 3 : Effectifs

```
✅ Place les élèves restants
❌ NE VÉRIFIE PAS les codes DISSO
```

---

## 📊 RÉSUMÉ

| Aspect | Description |
|--------|-------------|
| **Priorité** | LV2/OPT > DISSO |
| **Phase 1** | Place selon LV2/OPT (ignore DISSO) |
| **Phase 2** | Sépare DISSO si compatible LV2/OPT |
| **Cas limite** | Doublon DISSO accepté si contrainte impossible |
| **Logs** | Avertissements clairs pour traçabilité |

---

## ✅ MODIFICATIONS APPORTÉES

### Fichiers modifiés

1. **Phases_BASEOPTI_V3_COMPLETE.gs**
   - Ligne 302 : Fonction `findClassWithoutCodeD_V3()` améliorée
   - Ligne 230 : Appel avec `eleveIdx` et `ctx`
   - Ligne 237 : Log WARN au lieu de ERROR

2. **BASEOPTI_Architecture_V3.gs**
   - Ligne 358 : Fonction `findClassWithoutCodeD_V3()` améliorée
   - Ligne 292 : Appel avec `eleveIdx` et `ctx`
   - Ligne 299 : Log WARN au lieu de ERROR

### Logique ajoutée

- ✅ Vérification LV2/OPT avant déplacement
- ✅ Priorité 1 : Classe avec LV2/OPT ET sans DISSO
- ✅ Priorité 2 : Classe sans DISSO (si pas de LV2/OPT)
- ✅ Retour `null` si impossible (contrainte LV2/OPT)
- ✅ Logs explicites pour traçabilité

---

**FIN DE LA DOCUMENTATION**
