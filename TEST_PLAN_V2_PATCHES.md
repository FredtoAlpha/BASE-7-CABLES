# PLAN DE TEST - SYSTÈME V2 AVEC PATCHES

## Objectif
Valider que les 3 patches appliqués fonctionnent correctement dans le système V2.

---

## PATCH 1 : createBaseOpti_() + Utilitaires (BASEOPTI_System.gs)

### Vérifications appliquées ✅
- [x] Fonction `createBaseOpti_()` mise à jour (lignes 99-139)
- [x] En-têtes normalisés : `["_ID","NOM","PRENOM","SEXE","LV2","OPT","A","D","_SOURCE_CLASS","_TARGET_CLASS","_PLACED"]`
- [x] ID stable : `NOM|PRENOM|SEXE|SRC|ROW`
- [x] Utilitaires ajoutés : `getBaseOptiSheet_()`, `readBaseOpti_()`, `upsertBaseOpti_()`, `normalizeStudentRow_()`, `buildStableId_()`, `indexer_()`, `getSheetByNameSafe_()` (lignes 402-493)

### Test manuel 1.1 - Création _BASEOPTI
**Action** : Lancer `openCacheTabsStream()` depuis l'UI Optimisation

**Attendu** :
```
🆕 Initialisation contexte V2 (depuis _OPTI_CONFIG)...
🔧 STREAM CTX (V2): levels=["6°1","6°2","6°3","6°4","6°5"]
📊 Effectifs cibles: {"6°1":24,"6°2":25,...}
🧹 Initialisation onglets CACHE (vides)...
🎯 Création de _BASEOPTI depuis TEST...
✅ _BASEOPTI créé : 121 élèves
```

**Vérification** :
1. Afficher l'onglet `_BASEOPTI` (s'il est caché, le révéler temporairement)
2. Vérifier les colonnes : `_ID`, `NOM`, `PRENOM`, `SEXE`, `LV2`, `OPT`, `A`, `D`, `_SOURCE_CLASS`, `_TARGET_CLASS`, `_PLACED`
3. Vérifier un ID stable : doit ressembler à `DUPONT|JEAN|M|6°1TEST|2`
4. Compter le nombre d'élèves : doit correspondre au total des onglets sources (TEST)

### Test manuel 1.2 - IDs stables uniques
**Action** : Exécuter ce script dans Apps Script Editor :
```javascript
function testStableIds() {
  const sh = SpreadsheetApp.getActive().getSheetByName('_BASEOPTI');
  if (!sh) {
    Logger.log('❌ _BASEOPTI introuvable');
    return;
  }

  const values = sh.getDataRange().getValues();
  const ids = new Set();
  let duplicates = 0;

  for (let i = 1; i < values.length; i++) {
    const id = values[i][0]; // Colonne _ID
    if (ids.has(id)) {
      duplicates++;
      Logger.log('⚠️ ID dupliqué: ' + id);
    }
    ids.add(id);
  }

  Logger.log('✅ Total IDs: ' + ids.size);
  Logger.log('⚠️ Duplicatas: ' + duplicates);
}
```

**Attendu** :
```
✅ Total IDs: 121
⚠️ Duplicatas: 0
```

---

## PATCH 2 : getClassNeedsFromCache_() Enrichie (BASEOPTI_System.gs)

### Vérifications appliquées ✅
- [x] Fonction `getClassNeedsFromCache_()` mise à jour (lignes 318-368)
- [x] Retourne : `{ current, target, need, F, M, parityDelta, offers }`
- [x] Helper `resolveTargets_()` pour hiérarchie (lignes 358-368)

### Test manuel 2.1 - Retour enrichi avec parité
**Action** : Exécuter après Phase 3 terminée :
```javascript
function testClassNeeds() {
  const ctx = optStream_init_V2();
  const needs = getClassNeedsFromCache_(ctx);

  Logger.log('📊 Besoins par classe:');
  for (const classe in needs) {
    const info = needs[classe];
    Logger.log(classe + ': ' + info.current + '/' + info.target +
               ' (besoin: ' + info.need + ') | ' +
               info.F + 'F/' + info.M + 'M (Δ=' + info.parityDelta + ')');
  }
}
```

**Attendu** :
```
📊 Besoins par classe:
6°1: 24/24 (besoin: 0) | 12F/12M (Δ=0)
6°2: 25/25 (besoin: 0) | 13F/12M (Δ=1)
6°3: 24/24 (besoin: 0) | 12F/12M (Δ=0)
6°4: 24/24 (besoin: 0) | 12F/12M (Δ=0)
6°5: 24/24 (besoin: 0) | 12F/12M (Δ=0)
```

### Test manuel 2.2 - Hiérarchie effectifs
**Action** :
1. Ajouter un override dans `_OPTI_CONFIG` : `targets.override.6°1 = 26`
2. Relancer le contexte et vérifier

```javascript
function testTargetsHierarchy() {
  // 1. Ajouter override
  kvSet_('targets.override.6°1', '26');

  // 2. Construire contexte
  const ctx = optStream_init_V2();

  // 3. Vérifier
  Logger.log('✅ Effectif 6°1 depuis ctx.targets: ' + ctx.targets['6°1']);
  Logger.log('   (Attendu: 26 depuis _OPTI_CONFIG override)');
}
```

**Attendu** :
```
✅ Effectif 6°1 depuis ctx.targets: 26
   (Attendu: 26 depuis _OPTI_CONFIG override)
```

---

## PATCH 3 : Mini-gardien Phase 4 (Orchestration_V14I_Stream.gs)

### Vérifications appliquées ✅
- [x] Fonction `Phase4_optimizeSwaps_Guarded_()` ajoutée (lignes 1033-1072)
- [x] Fonction `isSwapAllowed_()` avec 3 checks (lignes 1074-1098)
- [x] Helpers : `matchesClassOffer_()`, `respectsQuotasAfterSwap_()`, `countRealized_()`, `wouldBreakGroupA_()` (lignes 1100-1170)
- [x] `phase4Stream()` modifié pour appeler la version gardée (ligne 592)

### Test manuel 3.1 - Phase 4 avec gardien actif
**Action** : Lancer Phase 4 via l'UI Optimisation après Phase 3

**Attendu dans les logs** :
```
🆕 Initialisation contexte V2 (depuis _OPTI_CONFIG)...
📌 Phase 4: Optimisation par swaps...
  📊 Quotas actuels:
    6°1: ITA=6, ESP=8, ALL=2, CHAV=3
    6°2: ITA=6, ESP=7, ALL=3, CHAV=4
    ...
  🔒 Mini-gardien actif
  ❌ Swap rejeté: s1 (LV2=ITA) → 6°3 (ITA non offerte)
  ✅ Swap validé: s2 (LV2=ESP) ↔ s3 (LV2=ESP)
✅ Phase 4 terminée: 12 swaps appliqués
```

### Test manuel 3.2 - Rejet swap hors offre
**Action** : Ajouter des logs de debug dans `isSwapAllowed_()` pour tracer les rejets

```javascript
function isSwapAllowed_(ctx, s1, fromClass, s2, toClass) {
  if (!s1 || !s2) {
    logLine('DEBUG', '❌ Swap rejeté: élève(s) null');
    return false;
  }

  const offers = (ctx.offersByClass || ctx.offers || {});
  const quotas = (ctx.quotas || {});

  // 1) Respect de l'offre
  const okOffer1 = matchesClassOffer_(offers[toClass], s1);
  const okOffer2 = matchesClassOffer_(offers[fromClass], s2);
  if (!okOffer1) {
    logLine('DEBUG', '❌ Swap rejeté: s1 (' + s1.NOM + ', LV2=' + s1.LV2 + ') → ' + toClass + ' (offre non compatible)');
    return false;
  }
  if (!okOffer2) {
    logLine('DEBUG', '❌ Swap rejeté: s2 (' + s2.NOM + ', LV2=' + s2.LV2 + ') → ' + fromClass + ' (offre non compatible)');
    return false;
  }

  // 2) Quotas
  if (!respectsQuotasAfterSwap_(ctx, quotas, s1, fromClass, toClass)) {
    logLine('DEBUG', '❌ Swap rejeté: s1 casserait quota dans ' + fromClass);
    return false;
  }
  if (!respectsQuotasAfterSwap_(ctx, quotas, s2, toClass, fromClass)) {
    logLine('DEBUG', '❌ Swap rejeté: s2 casserait quota dans ' + toClass);
    return false;
  }

  // 3) Groupes A
  if (ctx.lockGroupsA) {
    if (wouldBreakGroupA_(s1, fromClass, toClass)) {
      logLine('DEBUG', '❌ Swap rejeté: s1 casserait groupe A');
      return false;
    }
    if (wouldBreakGroupA_(s2, toClass, fromClass)) {
      logLine('DEBUG', '❌ Swap rejeté: s2 casserait groupe A');
      return false;
    }
  }

  logLine('DEBUG', '✅ Swap validé: ' + s1.NOM + ' ↔ ' + s2.NOM);
  return true;
}
```

**Attendu** : Voir des traces de rejets et validations dans les logs Apps Script

---

## TEST INTÉGRAL : "Mode Direct Live" complet

### Checklist complète (8 points de validation utilisateur)

#### Point 1 : Init V2 = zéro dépendance legacy ✅
- [ ] Logs montrent `🆕 Initialisation contexte V2 (depuis _OPTI_CONFIG)...`
- [ ] Pas de référence à `makeCtxFromUI_()` ou `readQuotasFromUI_()`
- [ ] Contexte construit depuis `buildCtx_V2()`

#### Point 2 : Cycle de vie _BASEOPTI ✅
- [ ] Créé au début (openCacheTabsStream)
- [ ] Colonnes normalisées : A/D au lieu de CODE_A/CODE_D
- [ ] IDs stables uniques (pas de doublons)

#### Point 3 : Ouverture CACHE sans perte de données ✅
- [ ] En-têtes préservés (ligne 1 intacte)
- [ ] Seules les lignes élèves (≥2) vidées
- [ ] Pas d'effacement total (`sh.clear()`)

#### Point 4 : Hiérarchie quotas & effectifs ✅
- [ ] Effectifs lus depuis `_STRUCTURE` (priorité)
- [ ] Overrides `_OPTI_CONFIG` pris en compte si présents
- [ ] Fallback 25 si aucune config

#### Point 5 : Phase 2 ASSO/DISSO respectée ✅
- [ ] Codes A appliqués (consolidation groupes)
- [ ] Codes D respectés (séparations)
- [ ] Logs : `X ASSO, Y DISSO appliqués`

#### Point 6 : Phase 3 parité & effectifs ✅
- [ ] Toutes les classes remplies à leur target
- [ ] Parité respectée (écart F/M ≤ tolérance)
- [ ] Logs : `6°1 : 24/24 (besoin: 0) | 12F/12M`

#### Point 7 : Phase 4 swaps + mini-gardien ✅
- [ ] Swaps ≤ ctx.maxSwaps
- [ ] Aucun quota cassé dans l'audit final
- [ ] Logs de rejets si swap hors offre ou casse quota

#### Point 8 : Séparation UI/Backend ✅
- [ ] UI Optimisation appelle `openCacheTabsStream()`, `phase1Stream()`, etc.
- [ ] Pas de paramètres envoyés (lecture depuis `_OPTI_CONFIG`)
- [ ] Ancien système legacy toujours fonctionnel indépendamment

---

## RÉSULTATS ATTENDUS

### Logs complets (exemple)
```
=== Mode Direct Live (V2) ===
🆕 Initialisation contexte V2 (depuis _OPTI_CONFIG)...
🔧 STREAM CTX (V2): levels=["6°1","6°2","6°3","6°4","6°5"]
  📊 Effectifs cibles: {"6°1":24,"6°2":25,"6°3":24,"6°4":24,"6°5":24}
  📌 Quotas: {"6°1":{"ITA":6,"ESP":8,"ALL":2,"CHAV":3},...}
  ⚖️ Poids: {"parity":0.3,"com":0.4,"tra":0.1,"part":0.1,"abs":0.1}

🧹 Initialisation onglets CACHE (vides)...
  🧹 6°1CACHE : 28 lignes vidées (en-tête conservé)
  🧹 6°2CACHE : 26 lignes vidées (en-tête conservé)
  ...

🎯 Création de _BASEOPTI depuis TEST...
✅ _BASEOPTI créé : 121 élèves

📌 Phase 1: Options & LV2...
  ✅ ITA: 30 élèves placés (quota: 30)
  ✅ ESP: 40 élèves placés (quota: 40)
  ✅ ALL: 15 élèves placés (quota: 15)
  ✅ CHAV: 12 élèves placés (quota: 12)
✅ Phase 1 terminée: 97 élèves placés

📌 Phase 2: Codes DISSO/ASSO...
  ✅ 15 codes ASSO appliqués
  ✅ 5 codes DISSO respectés
✅ Phase 2 terminée: 102 élèves placés

📌 Phase 3: Effectifs & Parité...
  📊 6°1 : 18/24 (besoin: 6) → remplissage...
  📊 6°2 : 20/25 (besoin: 5) → remplissage...
  ...
  ✅ 6°1 : 24/24 (besoin: 0) | 12F/12M (Δ=0)
  ✅ 6°2 : 25/25 (besoin: 0) | 13F/12M (Δ=1)
  ✅ 6°3 : 24/24 (besoin: 0) | 12F/12M (Δ=0)
  ✅ 6°4 : 24/24 (besoin: 0) | 12F/12M (Δ=0)
  ✅ 6°5 : 24/24 (besoin: 0) | 12F/12M (Δ=0)
✅ Phase 3 terminée: 121 élèves placés

📌 Phase 4: Optimisation par swaps...
  🔒 Mini-gardien actif
  ❌ Swap rejeté: DUPONT (LV2=ITA) → 6°3 (ITA non offerte)
  ✅ Swap validé: MARTIN ↔ BERNARD (amélioration COM)
  ...
✅ Phase 4 terminée: 12 swaps appliqués

📊 Audit final:
  ✅ Tous les quotas respectés
  ✅ Parité: écart max = 1
  ✅ Effectifs: 100% des classes à target
  ✅ Codes ASSO/DISSO: conformes

✅ Mode Direct Live terminé en 45.2s
```

---

## VALIDATION FINALE

- [ ] **Patch 1** : _BASEOPTI créé avec structure normalisée
- [ ] **Patch 2** : `getClassNeedsFromCache_()` retourne parité + besoins
- [ ] **Patch 3** : Mini-gardien rejette les swaps destructeurs
- [ ] **Intégration** : Système V2 complet fonctionnel
- [ ] **Legacy** : Ancien système toujours opérationnel indépendamment

---

## PROCHAINES ÉTAPES (si tout ✅)

1. **UI Panel** : Créer interface pour éditer `_OPTI_CONFIG` (poids, effectifs, mode)
2. **Phase 4 Score** : Implémenter harmonisation scores (COM, TRA, PART, ABS) avec poids
3. **LockService** : Ajouter verrou anti-concurrence
4. **Audit enrichi** : Afficher source config dans l'audit (STRUCTURE vs _OPTI_CONFIG)
5. **Documentation** : Ajouter exemples d'utilisation dans ARCHITECTURE_DEUX_SYSTEMES.md
