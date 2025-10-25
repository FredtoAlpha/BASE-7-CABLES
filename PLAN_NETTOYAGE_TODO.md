# 🧹 PLAN DE NETTOYAGE DES TODO

## Date : 21 octobre 2025, 22:38
## Version : 1.0

---

## 🎯 OBJECTIF

Nettoyer les TODO obsolètes (legacy) et conserver uniquement ceux qui représentent des fonctionnalités réellement manquantes.

---

## 📊 INVENTAIRE COMPLET DES TODO

### ❌ TODO À ÉLIMINER (Legacy obsolètes)

#### 1. `Orchestration_V14I.gs` - Ligne 310
```javascript
// TODO : adapter selon la cellule réelle dans votre interface
// Exemple : chercher une cellule avec "Mode de travail"
try {
  const value = uiSheet.getRange('B2').getValue(); // Adapter !
```

**Raison** : L'architecture actuelle utilise `_OPTI_CONFIG` via `buildCtx_V2()`. Cette lecture manuelle de cellule UI est obsolète.

**Action** : Supprimer le TODO et documenter que la fonction est legacy.

---

#### 2. `Orchestration_V14I.gs` - Ligne 324
```javascript
function readNiveauxFromUI_() {
  // TODO : adapter selon votre interface
  // Par défaut : tous les niveaux 6°
  return ['6°1', '6°2', '6°3', '6°4', '6°5'];
}
```

**Raison** : Les niveaux sont maintenant lus depuis `_OPTI_CONFIG`. Cette fonction legacy retourne des valeurs codées en dur.

**Action** : Supprimer le TODO et marquer la fonction comme `@deprecated`.

---

#### 3. `Orchestration_V14I.gs` - Ligne 474
```javascript
function readParityToleranceFromUI_() {
  // TODO : adapter selon votre interface
  return 2;
}
```

**Raison** : La tolérance de parité est maintenant lue depuis `_OPTI_CONFIG` (colonne `TOL_PARITE`).

**Action** : Supprimer le TODO et marquer la fonction comme `@deprecated`.

---

#### 4. `Orchestration_V14I.gs` - Ligne 482
```javascript
function readMaxSwapsFromUI_() {
  // TODO : adapter selon votre interface
  return 500;
}
```

**Raison** : Le max swaps est maintenant lu depuis `_OPTI_CONFIG` (colonne `MAX_SWAPS`).

**Action** : Supprimer le TODO et marquer la fonction comme `@deprecated`.

---

#### 5. `Orchestration_V14I.gs` - Ligne 491
```javascript
function readClassAuthorizationsFromUI_() {
  // TODO : adapter selon votre interface
  return {
    ITA: ["6°1"],
    CHAV: ["6°3"],
```

**Raison** : Les autorisations de classes sont maintenant calculées depuis `_OPTI_CONFIG` (colonnes ITA, CHAV, etc.).

**Action** : Supprimer le TODO et marquer la fonction comme `@deprecated`.

---

#### 6. `Orchestration_V14I.gs` - Ligne 541
```javascript
try {
  // TODO : adapter selon la cellule réelle du sélecteur de mode
  uiSheet.getRange('B2').setValue('CACHE');
} catch (e) {
```

**Raison** : Le mode est maintenant géré par l'interface web (localStorage) et non par une cellule Google Sheets.

**Action** : Supprimer le TODO et documenter que cette fonction est legacy.

---

#### 7. `Phase4UI.html` - Ligne 8830
```javascript
// TODO: Implémenter l'application réelle des swaps dans l'interface
// Pour l'instant, juste recharger les données
toast(`Application de ${swaps.length} échanges...`, 'info');
```

**Raison** : `Phase4UI.html` est l'ancienne interface, remplacée par `InterfaceV2.html`. Ce TODO est un doublon.

**Action** : Supprimer ce TODO (le même existe dans InterfaceV2_CoreScript.html et doit être conservé).

---

### ✅ TODO À CONSERVER (Fonctionnalités manquantes)

#### 1. `InterfaceV2_CoreScript.html` - Ligne 6628
```javascript
// TODO: Implémenter l'application réelle des swaps dans l'interface
// Pour l'instant, juste recharger les données
toast(`Application de ${swaps.length} échanges...`, 'info');
```

**Raison** : Fonctionnalité réellement manquante. Le bouton "Appliquer les échanges" ne fait qu'un toast + reload.

**Action** : **CONSERVER** ce TODO jusqu'à implémentation.

**Implémentation future** :
```javascript
async function applySwaps(swaps) {
  for (const swap of swaps) {
    // 1. Lire les élèves concernés
    const stu1 = await getStudent(swap.id1);
    const stu2 = await getStudent(swap.id2);
    
    // 2. Échanger les classes
    stu1.classe = swap.cls2;
    stu2.classe = swap.cls1;
    
    // 3. Sauvegarder
    await saveStudent(stu1);
    await saveStudent(stu2);
  }
  
  // 4. Recharger l'interface
  await loadData({ mode: STATE.currentMode, force: true });
}
```

---

#### 2. `BASEOPTI_Architecture_V3.gs` - Ligne 470
```javascript
// TODO: Implémenter swaps basés sur scores
// Lire _BASEOPTI, calculer scores par classe, faire swaps

return { ok: true, swaps: 0 };
```

**Raison** : Phase 4 V3 est un stub. La vraie optimisation basée sur les scores n'est pas implémentée.

**Action** : **CONSERVER** ce TODO jusqu'à implémentation.

**Note** : La Phase 4 complète existe déjà dans `Phases_BASEOPTI_V3_COMPLETE.gs` (fonction `Phase4_balanceScoresSwaps_BASEOPTI_V3`). Ce TODO peut être résolu en redirigeant vers cette fonction.

**Résolution rapide possible** :
```javascript
function Phase4_V3(ctx, weights, maxSwaps) {
  // ✅ RÉSOLU : Utiliser la Phase 4 complète
  return Phase4_balanceScoresSwaps_BASEOPTI_V3(ctx, weights, maxSwaps);
}
```

---

#### 3. `Phase4_BASEOPTI_V2.gs` - Ligne 488
```javascript
function isSwapFeasible_(stu1, stu2, cls1, cls2, ctx) {
  // Vérifier quotas LV2/OPT
  // TODO: Implémenter vérification des quotas
```

**Raison** : Fonctionnalité réellement manquante. La vérification des quotas n'est pas implémentée.

**Action** : **CONSERVER** ce TODO jusqu'à implémentation.

**Implémentation future** :
```javascript
function isSwapFeasible_(stu1, stu2, cls1, cls2, ctx) {
  // Vérifier quotas LV2/OPT
  const lv2_1 = String(stu1.LV2 || '').trim().toUpperCase();
  const lv2_2 = String(stu2.LV2 || '').trim().toUpperCase();
  const opt_1 = String(stu1.OPT || '').trim().toUpperCase();
  const opt_2 = String(stu2.OPT || '').trim().toUpperCase();
  
  // Vérifier que cls2 accepte lv2_1 et opt_1
  if (lv2_1 && lv2_1 !== 'ESP' && lv2_1 !== 'ANG') {
    const quota_lv2_cls2 = ctx.quotas[cls2]?.[lv2_1] || 0;
    const current_lv2_cls2 = countStudentsWithLV2(cls2, lv2_1, ctx);
    if (current_lv2_cls2 >= quota_lv2_cls2) {
      return false; // Quota dépassé
    }
  }
  
  if (opt_1) {
    const quota_opt_cls2 = ctx.quotas[cls2]?.[opt_1] || 0;
    const current_opt_cls2 = countStudentsWithOPT(cls2, opt_1, ctx);
    if (current_opt_cls2 >= quota_opt_cls2) {
      return false; // Quota dépassé
    }
  }
  
  // Même vérification pour stu2 → cls1
  // ...
  
  return true;
}
```

---

#### 4. `groupsModuleComplete.html` - Ligne 1641
```javascript
function exportToPDF() {
  showToast('Export PDF en développement', 'info');
  // TODO: Implémenter export PDF
}
```

**Raison** : Fonctionnalité réellement manquante. L'export PDF n'est pas implémenté.

**Action** : **CONSERVER** ce TODO jusqu'à implémentation.

**Implémentation future** :
```javascript
function exportToPDF() {
  // Utiliser jsPDF ou l'API Google Docs
  google.script.run
    .withSuccessHandler(function(pdfUrl) {
      window.open(pdfUrl, '_blank');
      showToast('PDF généré avec succès', 'success');
    })
    .withFailureHandler(function(error) {
      showToast('Erreur lors de la génération du PDF', 'error');
    })
    .generateGroupsPDF();
}
```

---

## 📝 RÉSUMÉ

### TODO à éliminer (7)

| Fichier | Ligne | Raison |
|---------|-------|--------|
| `Orchestration_V14I.gs` | 310 | Lecture cellule UI obsolète |
| `Orchestration_V14I.gs` | 324 | Niveaux codés en dur (maintenant dans `_OPTI_CONFIG`) |
| `Orchestration_V14I.gs` | 474 | Tolérance parité codée en dur (maintenant dans `_OPTI_CONFIG`) |
| `Orchestration_V14I.gs` | 482 | Max swaps codé en dur (maintenant dans `_OPTI_CONFIG`) |
| `Orchestration_V14I.gs` | 491 | Autorisations classes codées en dur (maintenant dans `_OPTI_CONFIG`) |
| `Orchestration_V14I.gs` | 541 | Écriture cellule UI obsolète |
| `Phase4UI.html` | 8830 | Doublon (même TODO dans InterfaceV2_CoreScript.html) |

### TODO à conserver (4)

| Fichier | Ligne | Raison | Priorité |
|---------|-------|--------|----------|
| `InterfaceV2_CoreScript.html` | 6628 | Application swaps côté client manquante | Moyenne |
| `BASEOPTI_Architecture_V3.gs` | 470 | Phase 4 V3 stub (résolution rapide possible) | Haute |
| `Phase4_BASEOPTI_V2.gs` | 488 | Vérification quotas manquante | Haute |
| `groupsModuleComplete.html` | 1641 | Export PDF manquant | Basse |

---

## 🚀 PLAN D'ACTION

### Phase 1 : Nettoyage immédiat (15 min)

1. ✅ Supprimer les 7 TODO obsolètes
2. ✅ Marquer les fonctions legacy comme `@deprecated`
3. ✅ Ajouter des commentaires explicatifs

### Phase 2 : Résolutions rapides (30 min)

1. ✅ Résoudre le TODO de `BASEOPTI_Architecture_V3.gs` en redirigeant vers `Phase4_balanceScoresSwaps_BASEOPTI_V3`
2. ✅ Documenter les fonctions legacy avec des liens vers les nouvelles fonctions

### Phase 3 : Implémentations futures (à planifier)

1. ⏳ Implémenter l'application des swaps côté client (InterfaceV2_CoreScript.html)
2. ⏳ Implémenter la vérification des quotas (Phase4_BASEOPTI_V2.gs)
3. ⏳ Implémenter l'export PDF (groupsModuleComplete.html)

---

## 📚 DOCUMENTATION DES FONCTIONS LEGACY

Toutes les fonctions legacy seront documentées avec :

```javascript
/**
 * @deprecated Cette fonction est obsolète. Utiliser buildCtx_V2() à la place.
 * @see buildCtx_V2() dans BASEOPTI_Architecture_V3.gs
 * 
 * Lit la tolérance de parité depuis l'interface (legacy).
 * Retourne une valeur codée en dur (2).
 * 
 * ⚠️ LEGACY : Cette fonction ne lit plus l'interface réelle.
 * La tolérance de parité est maintenant lue depuis _OPTI_CONFIG (colonne TOL_PARITE).
 */
function readParityToleranceFromUI_() {
  return 2;
}
```

---

## ✅ CONCLUSION

Après nettoyage :
- ✅ **7 TODO obsolètes supprimés**
- ✅ **4 TODO légitimes conservés**
- ✅ **Fonctions legacy documentées**
- ✅ **Architecture clarifiée**

Le code sera plus propre et les vrais chantiers seront clairement identifiés.
