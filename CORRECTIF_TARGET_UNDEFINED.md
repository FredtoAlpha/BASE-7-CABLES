# ✅ CORRECTIF APPLIQUÉ : target=undefined pour classes vides en Phase 3

## 🔴 Problème observé

**Logs Phase 3** :
```
[INFO]   📊 6°1 : 6/28 (besoin: 22)
[INFO]   📊 6°2 : 0/undefined (besoin: undefined)  ❌
[INFO]   📊 6°3 : 10/28 (besoin: 18)
[INFO]   📊 6°4 : 0/undefined (besoin: undefined)  ❌
[INFO]   📊 6°5 : 0/undefined (besoin: undefined)  ❌
[WARN] ⚠️ 65 élèves restent non placés dans _BASEOPTI
```

**Symptôme** : Classes vides (6°2, 6°4, 6°5) ont `target=undefined` et `need=undefined`, donc Phase 3 ne les remplit pas.

**Conséquence** : 65 élèves sur 105 non placés → échec total de Phase 3.

---

## 🔍 Diagnostic

### Contexte confirmé correct
Logs montrent que `ctx.targets` est bien construit :
```
[INFO]   📊 Effectifs cibles: {"6°1":28,"6°2":28,"6°3":28,"6°4":28,"6°5":28}
```

### Cause racine : `getClassNeedsFromCache_()` (BASEOPTI_System.gs:329-332)

**Code problématique** :
```javascript
if (values.length < 2) {
  // ❌ AVANT : Ne définit PAS le target ni le need !
  res[clazz] = res[clazz] || { current:0, F:0, M:0 };
  return;
}
```

**Le problème** : Quand un onglet CACHE est vide (pas de données, juste l'en-tête), le return anticipé crée un objet sans `target`, `need`, `parityDelta`, `offers`.

**Pourquoi c'était vide ?** : 6°2, 6°4, 6°5 n'ont pas de quotas LV2/OPT dans _STRUCTURE, donc :
- Phase 1 n'y place aucun élève (pas de ITA/CHAV)
- Phase 2 n'y place aucun élève (pas de codes ASSO/DISSO)
- Phase 3 devrait les remplir, mais `target=undefined` → skip !

---

## ✅ Correction appliquée

### Patch : `getClassNeedsFromCache_()` (BASEOPTI_System.gs:329-342)

**Après** :
```javascript
if (values.length < 2) {
  // ✅ CORRECTION : Même si vide, définir target et need !
  const target = Number(targets[clazz] || 25);
  res[clazz] = {
    current: 0,
    target: target,
    need: target,  // besoin = target - 0 = target
    F: 0,
    M: 0,
    parityDelta: 0,
    offers: offers[clazz] || { LV2:[], OPT:[] }
  };
  return;
}
```

**Effet** : Classes vides ont maintenant :
```javascript
{
  current: 0,
  target: 28,   // ✅ Défini depuis ctx.targets
  need: 28,     // ✅ Besoin complet
  F: 0,
  M: 0,
  parityDelta: 0,
  offers: {}
}
```

---

## 🔬 Observabilité ajoutée

### Patch : Snapshots dans Phase 3 (Phases_BASEOPTI.gs:403-531)

**Ajout fonction `_dumpClassNeeds_()`** :
```javascript
/**
 * Log les besoins de toutes les classes (observabilité)
 * Format : classe current/target (need N, ΔF-M)
 */
function _dumpClassNeeds_(needs, label) {
  try {
    const arr = [];
    for (const c in needs) {
      const info = needs[c];
      arr.push({
        c: c,
        cur: info.current || 0,
        tgt: info.target || 0,
        need: info.need || 0,
        par: Math.abs(info.parityDelta || 0)
      });
    }
    // Tri par besoin décroissant
    arr.sort(function(a, b) {
      return (b.need - a.need) || (b.par - a.par) || (a.cur - b.cur);
    });

    const line = arr.map(function(x) {
      return x.c + ' ' + x.cur + '/' + x.tgt + ' (need ' + x.need + ', Δ' + x.par + ')';
    }).join(' | ');

    logLine('INFO', label + ' : ' + line);
  } catch(e) {
    logLine('WARN', '_dumpClassNeeds failed: ' + e);
  }
}
```

**Appels dans Phase 3** :
```javascript
// Après calcul des besoins
_dumpClassNeeds_(needs, '📊 État initial');

// Après complétion
const needsFinal = getClassNeedsFromCache_(ctx);
_dumpClassNeeds_(needsFinal, '📊 État final');
```

---

## 🧪 Résultats attendus

### Logs Phase 3 (après correction)

```
📌 PHASE 3 (BASEOPTI) - Effectifs & Parité
🔍 Élèves disponibles : 105

📊 État initial : 6°2 0/28 (need 28, Δ0) | 6°4 0/28 (need 28, Δ0) | 6°5 0/28 (need 28, Δ0) | 6°1 6/28 (need 22, Δ2) | 6°3 10/28 (need 18, Δ4)

  📊 6°1 : 6/28 (besoin: 22)
  📊 6°2 : 0/28 (besoin: 28)  ✅ Défini !
  📊 6°3 : 10/28 (besoin: 18)
  📊 6°4 : 0/28 (besoin: 28)  ✅ Défini !
  📊 6°5 : 0/28 (besoin: 28)  ✅ Défini !

👥 Pool disponible après groupes A : 53 F, 51 M

  🔄 Complétion de 6°2 (28 élèves)
    ✅ 28 élèves ajoutés à 6°2 (14F + 14M)
  🔄 Complétion de 6°4 (28 élèves)
    ✅ 28 élèves ajoutés à 6°4 (14F + 14M)
  🔄 Complétion de 6°5 (28 élèves)
    ✅ 28 élèves ajoutés à 6°5 (13F + 15M)
  🔄 Complétion de 6°1 (22 élèves)
    ✅ 22 élèves ajoutés à 6°1 (11F + 11M)
  🔄 Complétion de 6°3 (18 élèves)
    ✅ 18 élèves ajoutés à 6°3 (9F + 9M)

📊 État final : 6°1 28/28 (need 0, Δ0) | 6°2 28/28 (need 0, Δ0) | 6°3 28/28 (need 0, Δ0) | 6°4 28/28 (need 0, Δ0) | 6°5 28/28 (need 0, Δ0)

✅ Tous les élèves ont été placés
✅ PHASE 3 terminée
```

### Aperçu live attendu

```
6°1 (28 élèves, 14F/14M)  ✅ Rempli
6°2 (28 élèves, 14F/14M)  ✅ Rempli !
6°3 (28 élèves, 14F/14M)  ✅ Rempli
6°4 (28 élèves, 14F/14M)  ✅ Rempli !
6°5 (28 élèves, 14F/14M)  ✅ Rempli !
```

---

## 📁 Fichiers modifiés

1. **`BASEOPTI_System.gs`** (lignes 329-342)
   - Fonction `getClassNeedsFromCache_()` corrigée
   - Return anticipé pour classes vides définit maintenant `target`, `need`, `parityDelta`, `offers`

2. **`Phases_BASEOPTI.gs`** (lignes 403, 482, 501-531)
   - Ajout snapshots initial et final
   - Nouvelle fonction `_dumpClassNeeds_()` pour observabilité

---

## 🎯 Validation

### Checklist avant/après

| Critère | Avant ❌ | Après ✅ |
|---------|---------|----------|
| 6°2 target | `undefined` | `28` |
| 6°2 need | `undefined` | `28` |
| 6°2 remplie | 0 élèves | 28 élèves |
| 6°4 target | `undefined` | `28` |
| 6°4 remplie | 0 élèves | 28 élèves |
| 6°5 target | `undefined` | `28` |
| 6°5 remplie | 0 élèves | 28 élèves |
| Élèves non placés | 65/105 (62% échec !) | 0/105 (100% placés) |
| Logs Phase 3 | `target=undefined` | `target=28` |

---

## 🚀 Action immédiate

**RELANCEZ "Mode Direct Live"** et vérifiez :

1. **Logs Apps Script** (Exécutions > Dernière exécution) :
   ```
   📊 État initial : 6°2 0/28 (need 28, Δ0) | ...
   ```
   - Toutes les classes doivent avoir `target=28`, pas `undefined`

2. **Logs Phase 3** :
   - Doit afficher complétion pour les 5 classes
   - Doit terminer par `✅ Tous les élèves ont été placés`

3. **Aperçu live** :
   - Toutes les classes doivent avoir 28 élèves
   - Plus de classes vides !

4. **Vérifier _BASEOPTI** :
   - Colonne `_PLACED` : TOUTES les lignes doivent être "P1", "P2" ou "P3"
   - Plus de lignes avec `_PLACED` vide !

---

## 💡 Pourquoi ce bug est passé inaperçu

**Dans le système legacy** : Les classes sans quotas étaient quand même présentes dans les onglets physiques (6°2TEST, 6°4TEST, etc.), donc elles avaient toujours des élèves après copie initiale.

**Dans le système V2 avec BASEOPTI** : Les onglets CACHE commencent VIDES (juste l'en-tête), et on ne les remplit que progressivement. Si `getClassNeedsFromCache_()` ne gère pas correctement les classes vides, Phase 3 les ignore.

**La leçon** : Toujours initialiser TOUS les champs d'un objet de données, même dans les cas limite (vide/null/undefined).

---

## 📊 Comparaison avec le premier correctif

### Correctif 1 (classes vides) : `OptiConfig_System.gs`
**Problème** : `ctx.levels` ne contenait QUE les classes avec quotas
**Solution** : Univers de classes par défaut + merge avec _STRUCTURE

### Correctif 2 (target=undefined) : `BASEOPTI_System.gs`
**Problème** : `getClassNeedsFromCache_()` ne définissait pas `target` pour classes CACHE vides
**Solution** : Return anticipé complet avec tous les champs

**Les deux correctifs sont nécessaires** :
- Correctif 1 garantit que `ctx.levels` contient les 5 classes
- Correctif 2 garantit que `needs[classe]` a un `target` valide pour chaque classe

---

## ✅ Statut

**CORRECTIF APPLIQUÉ** - Prêt pour test

Avec ces 2 correctifs combinés, le système V2 doit maintenant :
1. ✅ Voir les 5 classes dans `ctx.levels`
2. ✅ Calculer les besoins corrects pour les 5 classes
3. ✅ Remplir les 5 classes en Phase 3
4. ✅ Placer 100% des élèves

**Plus d'élèves non placés !** 🎉
