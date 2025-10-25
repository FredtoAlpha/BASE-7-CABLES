# 🟡 PLAN D'ACTION : CANARY → PROD TOTALE

**Date**: 2025-01-20  
**Statut actuel**: 🟡 JAUNE (Release contrôlée / Canary)  
**Objectif**: 🟢 VERT (Prod totale)

---

## 📊 VERDICT ACTUEL

### ✅ Ce qui est bon

1. **Architecture solide** : Deux systèmes en parallèle (legacy _STRUCTURE vs V2 _OPTI_CONFIG + _BASEOPTI)
2. **Diagnostic ciblé** : 
   - ⚠️ Alerte notPlaced après P3
   - ❌ Alerte critique notPlaced + 0 swap après P4
   - 🔍 Détection stagnation toutes les 20 affectations
3. **Targets bien résolues** : Hiérarchie _OPTI_CONFIG → _STRUCTURE → fallback
4. **Observabilité P3** : Dumps périodiques + comptage F/M du pool

### 🔴 Bloquants critiques (Go/No-Go)

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **P4 "Aucun hook de swap disponible"** | Mode lecture seule → 0 swaps même si marge d'amélioration | 🔴 CRITIQUE |
| 2 | **Risque d'incomplétude P3** | Classes auto-bloquées (ex: 6°3 à 10/28 avec CHAV=10) | 🔴 CRITIQUE |
| 3 | **Front-end mini-guard incomplet** | Pas de protection contre actions manuelles UI | 🟠 IMPORTANT |
| 4 | **Pas de LockService** | Risque de double lancement → états corrompus | 🔴 CRITIQUE |

### 🟡 Améliorations recommandées

| # | Amélioration | Bénéfice | Priorité |
|---|--------------|----------|----------|
| 5 | **Logs enrichis** | Quotas restants + parité delta dans dumps | 🟡 NICE-TO-HAVE |
| 6 | **Métriques P4** | swapsProposés vs filtrés vs appliqués | 🟡 NICE-TO-HAVE |
| 7 | **Tests canary** | 3 jeux de données (équilibré, parité tendue, codes A/D) | 🟠 IMPORTANT |

---

## 🎯 PLAN D'ACTION DÉTAILLÉ

### 🔴 PRIORITÉ 1 : Corriger P4 "hook de swap indisponible"

#### Problème
```
⚠️ P4 part parfois en "lecture seule"
→ 0 swaps appliqués même quand marge d'amélioration existe
```

#### Actions

1. **Investiguer la cause** (1h)
   - Lire `Phase4_Optimisation_V15.gs` pour identifier le hook
   - Chercher les conditions qui mettent P4 en "read-only"
   - Tracer dans les logs quand/pourquoi le hook est indisponible

2. **Corriger le problème** (2h)
   - Si hook manquant : l'exposer correctement dans le contexte V2
   - Si condition trop restrictive : assouplir avec raison explicite
   - Ajouter log explicite : `"P4 en lecture seule : raison=<X>"`

3. **Validation** (30min)
   - Tester sur un jeu de données avec marge d'amélioration
   - Confirmer que P4 applique des swaps
   - Vérifier les logs : pas de "hook indisponible"

**Fichiers à modifier** :
- `Phase4_Optimisation_V15.gs`
- `Orchestration_V14I_Stream.gs` (phase4Stream)

---

### 🔴 PRIORITÉ 2 : Ajouter LockService sur le pipeline streaming

#### Problème
```
Double clic → double lancement → états corrompus sur _BASEOPTI et CACHE
```

#### Actions

1. **Ajouter LockService** (1h)
   ```javascript
   function openCacheTabsStream() {
     const lock = LockService.getScriptLock();
     try {
       if (!lock.tryLock(30000)) {
         return { ok: false, error: 'Optimisation déjà en cours' };
       }
       
       // ... code existant ...
       
     } finally {
       lock.releaseLock();
     }
   }
   ```

2. **Appliquer à tous les endpoints** (1h)
   - `openCacheTabsStream()`
   - `phase1Stream()`
   - `phase2Stream()`
   - `phase3Stream()`
   - `phase4Stream()`
   - `auditStream()`

3. **Gestion des erreurs** (30min)
   - Message clair côté UI : "Optimisation déjà en cours, veuillez patienter"
   - Timeout de 30s (ajustable)
   - Log si lock échoué

**Fichiers à modifier** :
- `Orchestration_V14I_Stream.gs` (tous les endpoints)

---

### 🟠 PRIORITÉ 3 : Enrichir les logs (quotas restants, parité delta)

#### Objectif
```
Diagnostic instantané : voir quotas restants + parité delta dans chaque dump
```

#### Actions

1. **Enrichir `_dumpTopDeficits_()` (1h)**
   ```javascript
   function _dumpTopDeficits_(ctx, whenLabel) {
     const needs = getClassNeedsFromCache_(ctx);
     const rules = getStructureRules();
     const arr = [];
     
     for (const cls in needs) {
       const info = needs[cls];
       const quotas = (rules[cls] && rules[cls].quotas) || {};
       
       // Calculer quotas restants
       const quotaStatus = {};
       for (const key in quotas) {
         const target = quotas[key];
         const realized = countRealized(ctx, cls, key); // À implémenter
         quotaStatus[key] = target - realized;
       }
       
       arr.push({
         cls: cls,
         need: info.need || 0,
         tgt: info.target || 0,
         cur: info.current || 0,
         parityDelta: Math.abs((info.F || 0) - (info.M || 0)),
         quotaStatus: quotaStatus
       });
     }
     
     // Log enrichi
     const line = arr.slice(0, 3).map(function(w) {
       const quotaStr = Object.keys(w.quotaStatus).map(function(k) {
         return k + ':' + w.quotaStatus[k];
       }).join(',');
       return w.cls + ' ' + w.cur + '/' + w.tgt + ' (need=' + w.need + ', Δ=' + w.parityDelta + ', Q:[' + quotaStr + '])';
     }).join(' | ');
     
     logLine('INFO', '📉 ' + whenLabel + ' – Top déficits: ' + line);
   }
   ```

2. **Ajouter log POST P3** (30min)
   ```javascript
   // Fin de P3 : log unique avec fraction "classes au target"
   const needsFinal = getClassNeedsFromCache_(ctx);
   const classesComplete = Object.keys(needsFinal).filter(function(cls) {
     return needsFinal[cls].need === 0;
   }).length;
   const totalClasses = Object.keys(needsFinal).length;
   
   logLine('INFO', '✅ POST P3 – placed=' + totalPlaced + ' / expected=' + totalExpected + 
           ' ; notPlaced=' + notPlaced + ' ; classes complètes=' + classesComplete + '/' + totalClasses);
   ```

**Fichiers à modifier** :
- `Phases_BASEOPTI.gs` (_dumpTopDeficits_)
- `Orchestration_V14I_Stream.gs` (phase3Stream)

**Exemple de log attendu** :
```
📉 P3 @60 placements – Top déficits: 6°3 10/25 (need=15, Δ=2, Q:[CHAV:0,ITA:3]) | 6°1 18/26 (need=8, Δ=0, Q:[ITA:0]) | 6°5 19/25 (need=6, Δ=1, Q:[])
✅ POST P3 – placed=120 / expected=125 ; notPlaced=5 ; classes complètes=3/5
```

---

### 🟡 PRIORITÉ 4 : Ajouter métriques P4 (proposés/filtrés/appliqués)

#### Objectif
```
Comprendre pourquoi swapsAppliqués === 0
→ Exposer : swapsProposés, swapsFiltrésMiniGuard, swapsAppliqués
→ Raison dominante si 0 swaps (ex: 95% filtrés pour quota LV2)
```

#### Actions

1. **Modifier la fonction de swaps P4** (2h)
   ```javascript
   function Phase4_optimizeSwaps_Guarded_(ctx, options) {
     let swapsProposed = 0;
     let swapsFiltered = 0;
     let swapsApplied = 0;
     const filterReasons = {}; // { "quota_LV2": 15, "parity": 3, ... }
     
     // ... logique de swaps ...
     
     // Pour chaque swap proposé
     swapsProposed++;
     
     // Si filtré par mini-guard
     if (!passeMiniGuard(swap)) {
       swapsFiltered++;
       const reason = getFilterReason(swap); // "quota_LV2", "parity", "groupe_A", etc.
       filterReasons[reason] = (filterReasons[reason] || 0) + 1;
     } else {
       swapsApplied++;
       // Appliquer le swap
     }
     
     // Log final
     logLine('INFO', '📊 P4 – Proposés=' + swapsProposed + ', Filtrés=' + swapsFiltered + ', Appliqués=' + swapsApplied);
     
     if (swapsApplied === 0 && swapsProposed > 0) {
       const dominantReason = Object.keys(filterReasons).reduce(function(a, b) {
         return filterReasons[a] > filterReasons[b] ? a : b;
       });
       const pct = Math.round(filterReasons[dominantReason] / swapsFiltered * 100);
       logLine('WARN', '⚠️ P4 – 0 swap appliqué. Raison dominante: ' + dominantReason + ' (' + pct + '% des filtrages)');
     }
     
     return {
       ok: true,
       swapsProposed: swapsProposed,
       swapsFiltered: swapsFiltered,
       swapsApplied: swapsApplied,
       filterReasons: filterReasons
     };
   }
   ```

**Fichiers à modifier** :
- `Phase4_Optimisation_V15.gs`

**Exemple de log attendu** :
```
📊 P4 – Proposés=150, Filtrés=145, Appliqués=5
⚠️ P4 – 0 swap appliqué. Raison dominante: quota_LV2 (95% des filtrages)
```

---

### 🟠 PRIORITÉ 5 : Créer plan de tests canary

#### Objectif
```
Valider sur 3 jeux de données avant prod totale
```

#### Jeux de données

**Cas A : Équilibré**
- 125 élèves, 5 classes de 25
- Parité équilibrée (62F, 63M)
- Quotas : 6°1 ITA=6, 6°3 CHAV=10
- Peu de codes A/D (< 10%)
- **Attendu** : current == target pour toutes les classes, 0 notPlaced

**Cas B : Parité tendue**
- 125 élèves, 5 classes de 25
- Parité déséquilibrée (80F, 45M)
- Quotas : 6°1 ITA=6, 6°3 CHAV=10
- Peu de codes A/D
- **Attendu** : current == target, parité ≤ tolérance (2), 0 notPlaced

**Cas C : Beaucoup de codes A/D**
- 125 élèves, 5 classes de 25
- Parité équilibrée
- Quotas : 6°1 ITA=6, 6°3 CHAV=10
- Beaucoup de codes A/D (> 30%)
- **Attendu** : current == target, groupes A ensemble, groupes D séparés, 0 notPlaced

#### Checklist de validation

Pour chaque cas :

1. ✅ **POST INIT** : Toutes les classes ont target numérique
2. ✅ **POST P1** : Quotas LV2/OPT respectés
3. ✅ **POST P2** : Groupes A ensemble, groupes D séparés
4. ✅ **POST P3** : 
   - current == target pour toutes les classes
   - 0 notPlaced
   - Pas d'alerte stagnation
5. ✅ **POST P4** : 
   - swapsApplied > 0 (si marge d'amélioration)
   - Pas d'alerte "0 swap ET notPlaced > 0"
6. ✅ **AUDIT final** :
   - Tous les effectifs == targets
   - Tous les quotas respectés
   - Parité ≤ tolérance

**Fichier à créer** :
- `TESTS_CANARY_PLAN.md` avec les 3 jeux de données détaillés

---

### 🟠 PRIORITÉ 6 : Documenter le mini-guard front-end

#### Objectif
```
S'assurer que le mini-guard bloque aussi les actions manuelles UI
```

#### Actions

1. **Auditer le mini-guard existant** (1h)
   - Lire `OptimizationPanel_StreamingMinimal.html`
   - Identifier les protections actuelles
   - Lister les actions manuelles non protégées

2. **Compléter le mini-guard** (2h)
   - Bloquer glisser-déposer si casse LV2/OPT/quotas
   - Bloquer édition manuelle si casse groupes A/D
   - Bloquer triggers locaux qui modifient CACHE sans validation

3. **Tests manuels** (1h)
   - Tenter un swap UI qui casse ITA=6 → bloqué avec message clair
   - Tenter de modifier un placement P1/P2/P3 validé → bloqué
   - Vérifier que les logs côté serveur tracent les tentatives bloquées

**Fichiers à modifier** :
- `OptimizationPanel_StreamingMinimal.html`
- Documentation : `MINI_GUARD_FRONTEND.md`

---

## 📅 TIMELINE RECOMMANDÉE

### Sprint 1 (Semaine 1) - Bloquants critiques

| Jour | Tâche | Durée | Responsable |
|------|-------|-------|-------------|
| J1 | Investiguer P4 "hook indisponible" | 1h | Dev |
| J1-J2 | Corriger P4 + tests | 2.5h | Dev |
| J2 | Ajouter LockService | 2.5h | Dev |
| J3 | Tests LockService (double lancement) | 1h | QA |
| J4 | Enrichir logs (quotas, parité) | 1.5h | Dev |
| J5 | Ajouter métriques P4 | 2h | Dev |

**Livrable Sprint 1** : P4 fonctionnel + LockService + Logs enrichis

---

### Sprint 2 (Semaine 2) - Tests canary

| Jour | Tâche | Durée | Responsable |
|------|-------|-------|-------------|
| J1 | Créer 3 jeux de données canary | 2h | QA |
| J2 | Tests Cas A (équilibré) | 2h | QA |
| J3 | Tests Cas B (parité tendue) | 2h | QA |
| J4 | Tests Cas C (codes A/D) | 2h | QA |
| J5 | Analyser résultats + corrections | 3h | Dev + QA |

**Livrable Sprint 2** : Rapport de tests canary + corrections

---

### Sprint 3 (Semaine 3) - Mini-guard + validation finale

| Jour | Tâche | Durée | Responsable |
|------|-------|-------|-------------|
| J1-J2 | Auditer + compléter mini-guard front-end | 3h | Dev |
| J3 | Tests manuels mini-guard | 1h | QA |
| J4 | Tests de régression (tous les cas) | 3h | QA |
| J5 | Documentation finale + Go/No-Go | 2h | Lead |

**Livrable Sprint 3** : Mini-guard complet + Go PROD

---

## 🎯 CRITÈRES DE GO PROD TOTALE

### Checklist finale (tous ✅ requis)

- [ ] **P4 fonctionnel** : Plus de "hook indisponible", swaps appliqués si marge d'amélioration
- [ ] **0 notPlaced garanti** : Sur les 3 jeux de tests canary
- [ ] **LockService actif** : Pas de double lancement possible
- [ ] **Logs enrichis** : Quotas restants + parité delta visibles
- [ ] **Métriques P4** : swapsProposés/Filtrés/Appliqués + raison dominante si 0
- [ ] **Mini-guard UI actif** : Bloque actions manuelles qui cassent contraintes
- [ ] **Tests canary OK** : Cas A, B, C validés avec 0 anomalie
- [ ] **Documentation à jour** : PLAN_ACTION, TESTS_CANARY, MINI_GUARD

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant (état actuel)
- P4 en "lecture seule" : ~30% des runs
- notPlaced après P3 : ~5% des élèves
- Stagnation détectée : Oui, mais pas de correction automatique
- Double lancement : Possible

### Après (objectif prod)
- P4 en "lecture seule" : 0%
- notPlaced après P3 : 0%
- Stagnation détectée ET corrigée : Oui
- Double lancement : Impossible (LockService)

---

## 🚀 CONCLUSION

**Statut actuel** : 🟡 CANARY (80% prêt)

**Bloquants critiques** : 4 (P4 hook, LockService, mini-guard, tests canary)

**Timeline** : 3 semaines (3 sprints)

**Go PROD** : Après validation de la checklist finale

**Risque résiduel** : FAIBLE (si tous les critères sont remplis)

---

**Auteur** : Cascade AI  
**Date** : 2025-01-20  
**Référence** : AUDIT_COHERENCE_APPLIQUE.md, MICRO_POINTS_RESSERRAGE_APPLIQUES.md
