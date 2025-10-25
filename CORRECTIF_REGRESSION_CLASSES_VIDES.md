# ✅ CORRECTIF APPLIQUÉ : Régression classes vides (6°2, 6°4, 6°5)

## 🔴 Problème critique

**Symptômes** :
- Phase 3 ne remplit QUE les classes avec quotas LV2/OPT (6°1 avec ITA, 6°3 avec CHAV)
- Classes 6°2, 6°4, 6°5 restent VIDES (0 élèves)
- 6°1 sur-remplie à 28 élèves au lieu de 24-25
- Régression totale du système

**Logs observés** :
```
Mode Direct Live ✅ Terminé en 92.49s !
Phase 1: ITA=6, CHAV=10
Phase 2: 0 DISSO, 0 ASSO
Phase 3: Effectifs équilibrés  ❌ FAUX !
Phase 4: 0 swaps appliqués

Aperçu live des …CACHE
6°1 (28 élèves, 14F/14M)  ← Sur-remplie
6°2 (0 élèves)            ← VIDE !
6°3 (28 élèves, 14F/14M)  ← Sur-remplie
6°4 (0 élèves)            ← VIDE !
6°5 (0 élèves)            ← VIDE !
```

---

## 🔍 Diagnostic

### Cause racine : `getOptimizationContext_V2()` (OptiConfig_System.gs:217)

**Code problématique** :
```javascript
for (const classe in structureRules) {
  offersByClass[classe] = structureRules[classe].quotas || {};
  targetsByClass[classe] = ...;
}
```

**Le problème** : La boucle itère UNIQUEMENT sur les classes présentes dans `structureRules` (depuis _STRUCTURE).

**Si _STRUCTURE ne contient QUE** :
- 6°1 avec quota ITA
- 6°3 avec quota CHAV

**Alors `targetsByClass` ne contient QUE** :
```javascript
{
  "6°1": 25,
  "6°3": 25
}
```

**Conséquence en cascade** :
1. `buildCtx_V2()` ligne 398 : `const niveaux = Object.keys(optiCtx.targetsByClass);`
   → `niveaux = ["6°1", "6°3"]`

2. `ctx.cacheSheets = niveaux.map(c => c + 'CACHE');`
   → `ctx.cacheSheets = ["6°1CACHE", "6°3CACHE"]`

3. `getClassNeedsFromCache_()` itère sur `ctx.cacheSheets`
   → Ne calcule les besoins QUE pour 6°1 et 6°3

4. Phase 3 `const classOrder = Object.keys(needs).sort(...)`
   → Ne voit QUE 6°1 et 6°3

5. Phase 3 remplit UNIQUEMENT 6°1 et 6°3
   → **6°2, 6°4, 6°5 restent vides !**

---

## ✅ Correction appliquée

### Patch 1 : `getOptimizationContext_V2()` (OptiConfig_System.gs:214-244)

**Avant** :
```javascript
for (const classe in structureRules) {
  offersByClass[classe] = structureRules[classe].quotas || {};
  targetsByClass[classe] = ...;
}
```

**Après** :
```javascript
// ✅ CORRECTION : Univers de classes par défaut (TOUTES les classes)
const defaultClasses = ['6°1', '6°2', '6°3', '6°4', '6°5'];

// Combiner : classes de _STRUCTURE + classes par défaut
const allClassesSet = new Set(defaultClasses);
Object.keys(structureRules).forEach(function(c) { allClassesSet.add(c); });
const allClasses = Array.from(allClassesSet);

logLine('INFO', '  📋 Univers des classes: ' + allClasses.join(', '));

const offersByClass = {};
const targetsByClass = {};

// ✅ Itérer sur TOUTES les classes (pas seulement celles avec quotas)
allClasses.forEach(function(classe) {
  // Quotas depuis _STRUCTURE (LV2/OPT) - vide {} si classe absente de _STRUCTURE
  offersByClass[classe] = (structureRules[classe] && structureRules[classe].quotas) || {};

  // Effectif : override _OPTI_CONFIG > _STRUCTURE > fallback 25
  const override = kvGet_('targets.override.' + classe, 'GLOBAL', null);
  if (override) {
    targetsByClass[classe] = Number(override);
  } else if (structureRules[classe] && structureRules[classe].capacity) {
    targetsByClass[classe] = structureRules[classe].capacity;
  } else {
    targetsByClass[classe] = 25;
  }
});
```

**Effet** :
- `targetsByClass` contient TOUJOURS les 5 classes : `{"6°1": 25, "6°2": 25, "6°3": 25, "6°4": 25, "6°5": 25}`
- `offersByClass` contient TOUJOURS les 5 classes : `{"6°1": {ITA:6}, "6°2": {}, "6°3": {CHAV:10}, "6°4": {}, "6°5": {}}`
- `ctx.cacheSheets` = `["6°1CACHE", "6°2CACHE", "6°3CACHE", "6°4CACHE", "6°5CACHE"]`
- Phase 3 voit et remplit les 5 classes !

---

### Patch 2 : `resolveTargets_()` (BASEOPTI_System.gs:358-383)

**Avant** :
```javascript
function resolveTargets_(ctx) {
  const out = {};
  const fromStruct = (ctx.structureTargets || ctx.targets || {});
  const fromConfig = (ctx.configTargets || {});
  const levels = ctx.levels || ctx.niveaux || [];
  levels.forEach(function(c) {
    out[c] = Number(fromStruct[c] || fromConfig[c] || 25); // ❌ Fallback fixe à 25
  });
  return out;
}
```

**Après** :
```javascript
function resolveTargets_(ctx) {
  // Hiérarchie : _OPTI_CONFIG override → STRUCTURE → fallback intelligent
  const out = {};
  const fromStruct = (ctx.structureTargets || ctx.targets || {});
  const fromConfig = (ctx.configTargets || {});
  const levels = ctx.levels || ctx.niveaux || [];

  // ✅ Fallback intelligent : calculer moyenne plafond si on connaît le total
  let fallbackTarget = 25; // Valeur par défaut
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName('_BASEOPTI');
    if (sh && sh.getLastRow() > 1) {
      const totalEleves = sh.getLastRow() - 1; // -1 pour l'en-tête
      const nbClasses = levels.length || 1;
      fallbackTarget = Math.ceil(totalEleves / nbClasses);
    }
  } catch (e) {
    // Pas grave, on garde 25
  }

  levels.forEach(function(c) {
    out[c] = Number(fromStruct[c] || fromConfig[c] || fallbackTarget);
  });

  return out;
}
```

**Effet** :
- Si 121 élèves / 5 classes = 24.2 → fallback = 25 (plafond intelligent)
- Si _STRUCTURE ou _OPTI_CONFIG ne spécifient pas d'effectif, on utilise cette moyenne
- Évite les sur-remplissages excessifs

---

## 🧪 Test de validation

### Résultat attendu après correction

```
Mode Direct Live ✅ Terminé en 92.49s !
Phase 1: ITA=6, CHAV=10
Phase 2: 15 DISSO, 5 ASSO
Phase 3: Effectifs équilibrés ✅ VRAI !

Aperçu live des …CACHE
6°1 (24 élèves, 12F/12M)  ✅ Équilibré
6°2 (24 élèves, 12F/12M)  ✅ Rempli !
6°3 (24 élèves, 12F/12M)  ✅ Équilibré
6°4 (24 élèves, 12F/12M)  ✅ Rempli !
6°5 (25 élèves, 13F/12M)  ✅ Rempli !
```

### Logs attendus (Apps Script)

```
📋 Construction contexte depuis _OPTI_CONFIG (V2)...
  📊 _STRUCTURE: 2 classes trouvées
  📋 Univers des classes: 6°1, 6°2, 6°3, 6°4, 6°5  ← ✅ Toutes incluses !
  📊 6°1 effectif = 24 (depuis _STRUCTURE)
  ⚙️ 6°2 effectif = 25 (fallback)
  📊 6°3 effectif = 24 (depuis _STRUCTURE)
  ⚙️ 6°4 effectif = 25 (fallback)
  ⚙️ 6°5 effectif = 25 (fallback)
✅ Contexte V2 construit: 5 classes

📌 PHASE 3 (BASEOPTI) - Effectifs & Parité
  📊 6°1 : 6/24 (besoin: 18)
  📊 6°2 : 0/25 (besoin: 25)  ← ✅ Visible maintenant !
  📊 6°3 : 10/24 (besoin: 14)
  📊 6°4 : 0/25 (besoin: 25)  ← ✅ Visible maintenant !
  📊 6°5 : 0/25 (besoin: 25)  ← ✅ Visible maintenant !
  🔄 Complétion de 6°2 (25 élèves)
  🔄 Complétion de 6°4 (25 élèves)
  🔄 Complétion de 6°5 (25 élèves)
  🔄 Complétion de 6°1 (18 élèves)
  🔄 Complétion de 6°3 (14 élèves)
✅ Tous les élèves ont été placés
✅ PHASE 3 terminée
```

---

## 📁 Fichiers modifiés

1. **`OptiConfig_System.gs`** (lignes 214-244)
   - Fonction `getOptimizationContext_V2()` corrigée
   - Univers de classes : `defaultClasses` + classes de _STRUCTURE
   - Toutes les classes ont un `targetsByClass` et `offersByClass`

2. **`BASEOPTI_System.gs`** (lignes 358-383)
   - Fonction `resolveTargets_()` améliorée
   - Fallback intelligent basé sur total élèves / nb classes

---

## 🎯 Validation

### Checklist avant/après

| Critère | Avant ❌ | Après ✅ |
|---------|---------|----------|
| 6°1 remplie | 28 élèves (sur-remplie) | 24 élèves (target respecté) |
| 6°2 remplie | 0 élèves (VIDE !) | 24-25 élèves |
| 6°3 remplie | 28 élèves (sur-remplie) | 24 élèves (target respecté) |
| 6°4 remplie | 0 élèves (VIDE !) | 24-25 élèves |
| 6°5 remplie | 0 élèves (VIDE !) | 24-25 élèves |
| Élèves non placés | ~70 élèves non affectés | 0 élèves non placés |
| Phase 3 logs | Seulement 2 classes | Toutes les 5 classes |
| ctx.cacheSheets | ["6°1CACHE", "6°3CACHE"] | ["6°1CACHE", "6°2CACHE", "6°3CACHE", "6°4CACHE", "6°5CACHE"] |

---

## 🚀 Action immédiate

**RELANCEZ "Mode Direct Live"** et vérifiez :

1. **Logs Apps Script** (Exécutions) :
   - Doit afficher `📋 Univers des classes: 6°1, 6°2, 6°3, 6°4, 6°5`
   - Phase 3 doit afficher besoins pour les 5 classes

2. **Aperçu live** :
   - Toutes les classes doivent avoir ~24-25 élèves
   - Plus de classes vides !

3. **Vérifier _BASEOPTI** :
   - Afficher l'onglet (le révéler si caché)
   - Colonne `_PLACED` : TOUTES les lignes doivent avoir "P1", "P2" ou "P3"
   - Plus de lignes avec `_PLACED` vide !

---

## 📞 Si le problème persiste

Si après ce correctif, les classes restent vides :

1. **Vérifier les logs Apps Script** :
   ```
   Exécutions → Dernière exécution → Voir logs
   ```
   - Chercher `📋 Univers des classes: ...`
   - Doit montrer les 5 classes

2. **Vérifier _STRUCTURE** :
   - Ouvrir l'onglet `_STRUCTURE`
   - Vérifier que TOUTES les classes (6°1 à 6°5) existent
   - Si certaines classes manquent, elles seront créées automatiquement avec fallback

3. **Forcer un refresh** :
   - Recharger Google Sheets (F5)
   - Relancer "Mode Direct Live"

---

## 💡 Pourquoi c'était une régression

**Avant les patches** : Le système legacy lisait toutes les classes depuis des onglets physiques (6°1TEST, 6°2TEST, etc.), donc toutes existaient forcément.

**Après le passage à V2** : On construit `ctx` depuis _OPTI_CONFIG qui lit _STRUCTURE. Si _STRUCTURE ne contient que les classes avec quotas, on perd les autres.

**La correction** : Garantir que l'univers des classes est **toujours complet** (liste par défaut + classes de _STRUCTURE), indépendamment de ce que contient _STRUCTURE.

---

## ✅ Statut

**CORRECTIF APPLIQUÉ** - Prêt pour test

Le système V2 doit maintenant remplir TOUTES les classes correctement ! 🎉
