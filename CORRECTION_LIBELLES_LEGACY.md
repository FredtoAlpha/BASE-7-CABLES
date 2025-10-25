# ✅ CORRECTION - Libellés Menu LEGACY

**Date** : 22 octobre 2025  
**Statut** : ✅ Libellés corrigés

---

## 🎯 **PROBLÈME**

### Utilisateur
```
"n'importe quoi pourquoi le menu LEGACY parle d'opti ?"
```

### Erreur Identifiée

Le menu LEGACY utilisait le terme **"Optimisation"** pour la Phase 4, ce qui prêtait à confusion avec le **pipeline OPTI V2**.

#### Avant (Incorrect)
```
⚙️ LEGACY Pipeline
  🔄 5️⃣ Phase 4 - Optimisation Swaps  ❌ TROMPEUR
```

**Problème** : 
- "Optimisation" fait référence au pipeline OPTI V2 (InterfaceV2)
- La Phase 4 LEGACY fait de l'**équilibrage de scores** par swaps
- Ce n'est PAS la même chose que l'optimisation V2

---

## ✅ **CORRECTION APPLIQUÉE**

### Fichier : `Code.gs`

#### 1. Menu LEGACY (Ligne 34)

**Avant**
```javascript
.addItem('🔄 5️⃣ Phase 4 - Optimisation Swaps', 'legacy_runPhase4')
```

**Après**
```javascript
.addItem('🔄 5️⃣ Phase 4 - Équilibrage Scores', 'legacy_runPhase4')
```

---

#### 2. Commentaire Menu (Ligne 27)

**Avant**
```javascript
// Menu LEGACY (Pipeline BASEOPTI manuel)
```

**Après**
```javascript
// Menu LEGACY (Pipeline BASEOPTI manuel - phases 1-2-3-4)
```

---

#### 3. Fonction legacy_runPhase4() (Lignes 254-272)

**Avant**
```javascript
/**
 * Lance Phase 4 - Optimisation Swaps
 */
function legacy_runPhase4() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Phase 4 en cours...', 'Optimisation Swaps', -1);
  // ...
  ui.alert('✅ Phase 4 Terminée', result.message || 'Optimisation terminée', ui.ButtonSet.OK);
}
```

**Après**
```javascript
/**
 * Lance Phase 4 - Équilibrage Scores
 */
function legacy_runPhase4() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Phase 4 en cours...', 'Équilibrage Scores', -1);
  // ...
  ui.alert('✅ Phase 4 Terminée', result.message || 'Équilibrage scores terminé', ui.ButtonSet.OK);
}
```

---

#### 4. Fonction legacy_runAllPhases() (Lignes 311-318)

**Avant**
```javascript
SpreadsheetApp.getActiveSpreadsheet().toast('Phase 4/4...', 'Optimisation Swaps', -1);
// ...
ui.alert(
  '✅ Toutes les Phases Terminées',
  `Optimisation complète réussie en ${duration}s\n\n` +
  'Résultats disponibles dans _BASEOPTI',
  ui.ButtonSet.OK
);
```

**Après**
```javascript
SpreadsheetApp.getActiveSpreadsheet().toast('Phase 4/4...', 'Équilibrage Scores', -1);
// ...
ui.alert(
  '✅ Toutes les Phases Terminées',
  `Pipeline BASEOPTI complet en ${duration}s\n\n` +
  'Résultats disponibles dans _BASEOPTI',
  ui.ButtonSet.OK
);
```

---

## 📊 **COMPARAISON AVANT/APRÈS**

### Menu LEGACY

#### AVANT (Trompeur)
```
┌─────────────────────────────────────────┐
│ ⚙️ LEGACY Pipeline                      │
├─────────────────────────────────────────┤
│ 🔄 5️⃣ Phase 4 - Optimisation Swaps  ❌  │
└─────────────────────────────────────────┘
```

#### APRÈS (Clair)
```
┌─────────────────────────────────────────┐
│ ⚙️ LEGACY Pipeline                      │
├─────────────────────────────────────────┤
│ 🔄 5️⃣ Phase 4 - Équilibrage Scores  ✅  │
└─────────────────────────────────────────┘
```

---

### Messages Utilisateur

#### AVANT (Trompeur)
```
Toast : "Phase 4 en cours... Optimisation Swaps"
Alert : "Optimisation terminée"
Alert : "Optimisation complète réussie en 3.2s"
```

#### APRÈS (Clair)
```
Toast : "Phase 4 en cours... Équilibrage Scores"
Alert : "Équilibrage scores terminé"
Alert : "Pipeline BASEOPTI complet en 3.2s"
```

---

## 🎯 **CLARIFICATION - LEGACY vs OPTI V2**

### LEGACY Pipeline (Menu ⚙️)

**Objectif** : Lancer manuellement les **4 phases BASEOPTI**

| Phase | Nom | Action |
|-------|-----|--------|
| Phase 1 | Options & LV2 | Répartit élèves avec options/LV2 |
| Phase 2 | ASSO/DISSO | Applique contraintes ASSO/DISSO |
| Phase 3 | Effectifs & Parité | Complète effectifs + parité |
| Phase 4 | **Équilibrage Scores** | Swaps pour équilibrer COM/TRA/PART/ABS |

**Résultat** : Onglet `_BASEOPTI` rempli

---

### OPTI V2 Pipeline (Menu 🎓 > InterfaceV2)

**Objectif** : **Optimisation automatique** avec configuration avancée

| Étape | Nom | Action |
|-------|-----|--------|
| Config | Poids/Quotas | Configure poids COM/TRA/PART/ABS + quotas |
| Lancement | Optimisation | Lance automatiquement les 4 phases + optimisation |
| Résultat | CACHE | Résultats dans onglets CACHE |
| UI | Drag & Drop | Interface moderne avec visualisation |

**Résultat** : Onglets `<classe>CACHE` + Interface V2

---

## 💡 **TERMINOLOGIE CORRECTE**

### ✅ **Termes à Utiliser**

| Contexte | Terme Correct |
|----------|---------------|
| Phase 4 LEGACY | **Équilibrage Scores** |
| Phase 4 LEGACY | **Swaps pour équilibrer** |
| Pipeline LEGACY | **Pipeline BASEOPTI** |
| Pipeline LEGACY | **Phases 1-2-3-4** |

### ❌ **Termes à ÉVITER pour LEGACY**

| Terme | Raison |
|-------|--------|
| ❌ "Optimisation" | Fait référence à OPTI V2 |
| ❌ "Optimisation Swaps" | Confusion avec OPTI V2 |
| ❌ "Optimisation complète" | Confusion avec OPTI V2 |

### ✅ **Termes Réservés à OPTI V2**

| Terme | Contexte |
|-------|----------|
| ✅ "Optimisation" | Pipeline OPTI V2 uniquement |
| ✅ "Optimisation V2" | Pipeline OPTI V2 uniquement |
| ✅ "Configuration Optimisation" | Menu principal |

---

## 📝 **FICHIERS MODIFIÉS**

| Fichier | Lignes | Modification |
|---------|--------|--------------|
| `Code.gs` | 27 | ✅ Commentaire menu clarifié |
| `Code.gs` | 34 | ✅ Libellé menu "Équilibrage Scores" |
| `Code.gs` | 254 | ✅ Commentaire fonction "Équilibrage Scores" |
| `Code.gs` | 259 | ✅ Toast "Équilibrage Scores" |
| `Code.gs` | 272 | ✅ Alert "Équilibrage scores terminé" |
| `Code.gs` | 311 | ✅ Toast "Équilibrage Scores" |
| `Code.gs` | 317 | ✅ Alert "Pipeline BASEOPTI complet" |

**Total : 1 fichier modifié, 7 corrections**

---

## 🎉 **RÉSULTAT FINAL**

### ✅ **Libellés Clairs et Cohérents**

1. ✅ Menu LEGACY : "Équilibrage Scores" (pas "Optimisation")
2. ✅ Toasts : "Équilibrage Scores" (pas "Optimisation Swaps")
3. ✅ Alerts : "Équilibrage scores terminé" (pas "Optimisation terminée")
4. ✅ Alert finale : "Pipeline BASEOPTI complet" (pas "Optimisation complète")

### 🎯 **Distinction Claire**

```
LEGACY Pipeline (⚙️)
  → Phases 1-2-3-4 manuelles
  → Phase 4 = Équilibrage Scores
  → Résultat : _BASEOPTI

OPTI V2 Pipeline (🎓)
  → Optimisation automatique
  → Configuration avancée
  → Résultat : CACHE + InterfaceV2
```

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0  
**Statut** : ✅ Libellés corrigés  
**Priorité** : 🟢 Production Ready
