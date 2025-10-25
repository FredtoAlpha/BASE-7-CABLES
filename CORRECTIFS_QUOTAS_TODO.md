# Correctifs à Appliquer - Verrouillage Quotas

## Problème Identifié
Les logs montrent que Phase 1 place correctement (ITA=6, CHAV=10) mais Phase 3 et 4 cassent tout:
- 6°1 devrait avoir ITA=6, mais l'audit trouve ITA=1 + CHAV=1 (!!)
- 6°3 devrait avoir CHAV=10, l'audit en lit 8
- D'autres classes reçoivent de l'ITA alors qu'elles n'en offrent pas

## ✅ Modifications Déjà Appliquées

### 1. Fonction `isMoveAllowed_` (ligne ~1546)
✅ Créée - Garde-fou universel qui vérifie:
- FIXE (jamais bouge)
- Offre LV2/OPT de la classe cible
- Quotas en temps réel (ne pas dépasser)
- Mobilité (PERMUT/LIBRE uniquement)

### 2. Fonction `computeCountsFromState_` (ligne ~1543)
✅ Créée - Calcule les compteurs LV2/OPT actuels depuis classesState

### 3. Mise à jour `isSwapValid_` (ligne ~1614)
✅ Modifiée - Utilise maintenant `isMoveAllowed_` avec counts

### 4. Mise à jour `findBestSwap_` (ligne ~1487)
✅ Modifiée - Reçoit et passe counts à isSwapValid_

### 5. Mise à jour `runSwapEngineV14_withLocks_` (ligne ~1419)
✅ Modifiée - Calcule counts avant chaque recherche de swap

## ⚠️ Modifications À FAIRE MANUELLEMENT

### 1. Créer la fonction `Phase2I_applyDissoAsso_`

**Emplacement**: Après la fonction `assignLV2ToClass_` (ligne ~883)

```javascript
// ===================================================================
// 6. PHASE 2I : APPLICATION CODES DISSO/ASSO
// ===================================================================

/**
 * Phase 2I : Applique les codes DISSO et ASSO
 * LIT : depuis CACHE (résultats Phase 1I)
 * ÉCRIT : uniquement CACHE
 */
function Phase2I_applyDissoAsso_(ctx) {
  const warnings = [];

  // Lire depuis CACHE (résultats Phase 1I)
  const classesState = readElevesFromCache_(ctx);

  // Verrouiller les attributs Options/LV2 placés en Phase 1I
  lockAttributes_(classesState, { options: true, lv2: true });

  // Appliquer DISSO (séparer codes D entre classes)
  const movedD = applyDisso_(classesState, ctx);

  // Appliquer ASSO (regrouper codes A)
  const movedA = applyAsso_(classesState, ctx);

  // Écrire dans CACHE
  writeAllClassesToCACHE_(ctx, classesState);

  return {
    ok: true,
    warnings,
    counts: { disso: movedD, asso: movedA }
  };
}
```

### 2. Créer la fonction `repairQuotasAfterPhase1_`

**Emplacement**: Juste AVANT la section Phase 2I (avant la fonction Phase2I_applyDissoAsso_)

```javascript
// ===================================================================
// 5B. RÉPARATION QUOTAS POST-PHASE 1
// ===================================================================

/**
 * Répare les quotas après Phase 1 pour forcer l'atteinte des cibles
 * Déplace les élèves en surplus vers les classes en déficit
 */
function repairQuotasAfterPhase1_(ctx) {
  logLine('INFO', '🔧 Réparation quotas post-Phase 1...');
  
  const offer = buildOfferWithQuotas_(ctx);
  const classesState = readElevesFromCache_(ctx);
  const counts = computeCountsFromState_(classesState);
  
  // 1) Construire déficits/surplus par libellé
  const need = [];   // { key:'ITA', cls:'6°1', deficit: +n }
  const give = [];   // { key:'ITA', cls:'6°5', surplus: +n, candidates:[eleves mobiles] }
  
  // Identifier les déficits
  Object.keys(offer).forEach(function(cls) {
    const q = offer[cls].quotas || {};
    Object.keys(q).forEach(function(key) {
      const target = q[key] || 0;
      const realized = (counts[cls].LV2[key] || 0) + (counts[cls].OPT[key] || 0);
      const delta = target - realized;
      if (delta > 0) {
        need.push({ key: key, cls: cls, deficit: delta });
        logLine('INFO', '  📉 Déficit: ' + cls + '/' + key + ' = ' + delta);
      }
    });
  });
  
  // Identifier les surplus et candidats mobiles
  Object.keys(classesState).forEach(function(cls) {
    const eleves = classesState[cls];
    eleves.forEach(function(e) {
      const lv2 = String(e.LV2 || e.lv2 || '').trim().toUpperCase();
      const opt = String(e.OPT || e.opt || '').trim().toUpperCase();
      const keys = [lv2, opt].filter(Boolean);
      
      keys.forEach(function(key) {
        const offHere = offer[cls] || { LV2: [], OPT: [], quotas: {} };
        const qHere = offHere.quotas || {};
        const realizedHere = (counts[cls].LV2[key] || 0) + (counts[cls].OPT[key] || 0);
        const targetHere = qHere[key] || 0;
        
        // Surplus = (réalisé > cible) OU (classe qui n'offre pas ce key)
        const notOffered = (offHere.LV2.indexOf(key) === -1 && offHere.OPT.indexOf(key) === -1);
        const isSurplus = notOffered || (targetHere > 0 && realizedHere > targetHere);
        
        if (isSurplus) {
          const fixe = String(e.FIXE || e.fixe || '').trim().toUpperCase();
          const canMove = !(fixe === '1' || fixe === 'OUI' || fixe === 'X' || fixe === 'FIXE');
          
          if (canMove) {
            let bucket = give.find(function(g) { return g.key === key && g.cls === cls; });
            if (!bucket) {
              bucket = { key: key, cls: cls, surplus: 0, candidates: [] };
              give.push(bucket);
            }
            bucket.surplus += 1;
            bucket.candidates.push(e);
          }
        }
      });
    });
  });
  
  // 2) Greedy : pour chaque besoin, tirer dans un surplus compatible
  let totalMoved = 0;
  need.forEach(function(n) {
    let remaining = n.deficit;
    const sources = give.filter(function(g) { return g.key === n.key && g.surplus > 0; });
    
    for (let s of sources) {
      // Trier candidats : LIBRE d'abord, puis PERMUT, puis groupes A en dernier
      s.candidates.sort(function(a, b) {
        const rankA = (a.mobi === 'LIBRE' ? 0 : (a.mobi && a.mobi.indexOf('PERMUT') >= 0 ? 1 : 2)) + (a.A ? 10 : 0);
        const rankB = (b.mobi === 'LIBRE' ? 0 : (b.mobi && b.mobi.indexOf('PERMUT') >= 0 ? 1 : 2)) + (b.A ? 10 : 0);
        return rankA - rankB;
      });
      
      while (remaining > 0 && s.candidates.length > 0) {
        const cand = s.candidates.shift();
        
        // Garde-fous finaux
        if (!isMoveAllowed_(cand, n.cls, offer, counts, {})) continue;
        
        // ✅ Appliquer le move
        moveEleveToClass_(classesState, cand, s.cls, n.cls);
        
        // Mettre à jour counts
        const lv2 = String(cand.LV2 || cand.lv2 || '').trim().toUpperCase();
        const opt = String(cand.OPT || cand.opt || '').trim().toUpperCase();
        
        if (lv2 && lv2 !== 'ANG') {
          counts[s.cls].LV2[lv2] = Math.max(0, (counts[s.cls].LV2[lv2] || 0) - 1);
          counts[n.cls].LV2[lv2] = (counts[n.cls].LV2[lv2] || 0) + 1;
        }
        if (opt) {
          counts[s.cls].OPT[opt] = Math.max(0, (counts[s.cls].OPT[opt] || 0) - 1);
          counts[n.cls].OPT[opt] = (counts[n.cls].OPT[opt] || 0) + 1;
        }
        
        s.surplus -= 1;
        remaining -= 1;
        totalMoved += 1;
        
        logLine('INFO', '  ✅ Réparation: ' + cand.Nom + ' ' + cand.Prenom + ' (' + n.key + ') : ' + s.cls + ' → ' + n.cls);
      }
      
      if (remaining <= 0) break;
    }
    
    if (remaining > 0) {
      logLine('WARN', '  ⚠️ Réparation quotas incomplète pour ' + n.cls + '/' + n.key + ': déficit résiduel=' + remaining);
    }
  });
  
  // Écrire dans CACHE
  writeAllClassesToCACHE_(ctx, classesState);
  
  logLine('INFO', '✅ Réparation quotas terminée: ' + totalMoved + ' élèves déplacés');
  return { moved: totalMoved };
}
```

### 3. Appeler `repairQuotasAfterPhase1_` dans le pipeline

**Emplacement**: Dans `runOptimizationV14FullI`, après Phase 1I et AVANT Phase 2I (ligne ~180)

**Remplacer**:
```javascript
    // ✅ Calcul mobilité après Phase 1I
    computeMobilityFlags_(ctx);

    // ===== PHASE 2I : DISSO/ASSO =====
    logLine('INFO', '\n📌 PHASE 2I : Application codes DISSO/ASSO...');
```

**Par**:
```javascript
    // ✅ Calcul mobilité après Phase 1I
    computeMobilityFlags_(ctx);

    // ===== RÉPARATION QUOTAS POST-PHASE 1 =====
    logLine('INFO', '\n🔧 Réparation quotas post-Phase 1...');
    const pRepair = repairQuotasAfterPhase1_(ctx);
    logLine('INFO', '✅ Réparation quotas terminée: ' + pRepair.moved + ' élèves déplacés');
    forceCacheInUIAndReload_(ctx);

    // ===== PHASE 2I : DISSO/ASSO =====
    logLine('INFO', '\n📌 PHASE 2I : Application codes DISSO/ASSO...');
```

### 4. Intégrer `isMoveAllowed_` dans Phase 3I (Parité)

**Fichier**: Chercher la fonction qui gère l'équilibrage de parité (probablement dans un autre fichier ou à créer)

**À faire**: Avant chaque déplacement d'élève pour équilibrer la parité, appeler:
```javascript
const offer = buildOfferWithQuotas_(ctx);
const counts = computeCountsFromState_(classesState);

// Avant de déplacer un élève
if (!isMoveAllowed_(eleve, classeCible, offer, counts, {})) {
  continue; // Skip ce déplacement
}

// Après le déplacement, mettre à jour counts
// ... (voir exemple dans repairQuotasAfterPhase1_)
```

## Résultats Attendus Après Corrections

### Logs d'audit
```
📦 Classe 6°1 — Total=25, F=13, M=12
   Offre attendue: LV2=[ITA], OPT=[]
   LV2 réalisées: {"ITA":6}  ← ✅ Était 1, maintenant 6
   OPT réalisées: {}          ← ✅ Plus de CHAV ici
   ❌ Violations QUOTAS: []   ← ✅ Plus de violations

📦 Classe 6°3 — Total=25, F=12, M=13
   Offre attendue: LV2=[], OPT=[CHAV]
   LV2 réalisées: {}
   OPT réalisées: {"CHAV":10} ← ✅ Était 8, maintenant 10
   ❌ Violations QUOTAS: []   ← ✅ Plus de violations
```

### Comportement Phase 4
- Les élèves FIXE ne bougent plus
- Les swaps respectent l'offre LV2/OPT
- Les quotas ne sont jamais dépassés
- Les violations A/D diminuent fortement

## Ordre d'Exécution

1. ✅ `isMoveAllowed_`, `computeCountsFromState_` → Déjà fait
2. ✅ Mise à jour Phase 4 (swaps) → Déjà fait
3. ⚠️ Créer `Phase2I_applyDissoAsso_` → À faire
4. ⚠️ Créer `repairQuotasAfterPhase1_` → À faire
5. ⚠️ Appeler `repairQuotasAfterPhase1_` dans le pipeline → À faire
6. ⚠️ Intégrer `isMoveAllowed_` dans Phase 3I → À faire

## Test Rapide

Après avoir appliqué toutes les modifications:
1. Lancer une optimisation
2. Vérifier les logs Apps Script:
   - Doit afficher "🔧 Réparation quotas post-Phase 1..."
   - Doit afficher "✅ Réparation: [nom] (ITA) : 6°5 → 6°1"
3. Vérifier l'audit final:
   - 6°1: ITA=6 (pas 1)
   - 6°3: CHAV=10 (pas 8)
   - Aucune violation QUOTAS

## Fichiers à Modifier

1. **Orchestration_V14I.gs** (principal)
   - Ajouter `Phase2I_applyDissoAsso_` (ligne ~883)
   - Ajouter `repairQuotasAfterPhase1_` (avant Phase 2I)
   - Appeler `repairQuotasAfterPhase1_` dans pipeline (ligne ~180)

2. **ParityAlgorithm** ou équivalent (si existe)
   - Intégrer `isMoveAllowed_` avant chaque déplacement

## Notes Importantes

- `isMoveAllowed_` est la fonction centrale - elle doit être appelée PARTOUT où un élève bouge
- `counts` doit être mis à jour après CHAQUE mouvement pour rester synchronisé
- La réparation quotas doit s'exécuter APRÈS Phase 1 et AVANT Phase 2/3/4
- Ne jamais modifier FIXE/MOBILITE après Phase 1 (seulement les lire)
