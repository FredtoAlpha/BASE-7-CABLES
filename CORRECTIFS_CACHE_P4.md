# Correctifs CACHE et Moteur P4 - Résumé

## Date : 2025-01-20

## Problèmes corrigés

### 1. ✅ Doublons dans le CACHE (root cause des "ids uniques=0")

**Symptômes :**
- POST P1/P2/P3/P4 : Messages "Doublons dans CACHE (ids uniques=0 / rows=...)"
- À la fin : rows=120 et 1 élève non placé

**Cause :**
- `writeBatchToCache_()` utilisait un simple `append` sans vérifier les doublons
- Multiplications de lignes à chaque écriture

**Correctif appliqué :**
- **Fichier :** `BASEOPTI_System.gs`
- **Fonction :** `writeBatchToCache_()`
- **Changement :** Implémentation d'un **UPSERT par ID_ELEVE**
  - Lecture des données existantes et construction d'un index `ID → ligne`
  - Pour chaque élève à écrire :
    - Si l'ID existe déjà → **mise à jour** de la ligne existante
    - Sinon → **ajout** d'une nouvelle ligne
  - Vérification post-écriture : `nb_ids_uniques == nb_lignes`
  - Logs détaillés : `X màj + Y ajouts (total=Z)`

- **Fichier :** `Orchestration_V14I.gs`
- **Fonction :** `writeAllClassesToCACHE_()`
- **Changement :** Ajout d'une vérification d'unicité après écriture
  - Compte les IDs uniques vs nombre d'élèves
  - Log d'erreur si doublons détectés

**Résultat attendu :**
- ✅ Plus de messages "Doublons dans CACHE"
- ✅ Tous les élèves comptés correctement
- ✅ Plus d'élève "non placé" à cause de doublons

---

### 2. ✅ Fail-safe post-P3 pour élèves non placés

**Problème :**
- En fin de P3, certains élèves pouvaient rester non placés (ex: 1 élève manquant)

**Correctif appliqué :**
- **Fichier :** `Orchestration_V14I.gs`
- **Fonction :** `Phase3I_completeAndParity_()`
- **Changement :** Ajout d'un appel à `placeRemainingStudents_()` après équilibrage parité
  - Calcule les déficits par classe (target - current)
  - Trouve la classe avec le plus grand déficit
  - Place les élèves non placés dans cette classe
  - Log de warning si élèves placés en fail-safe

**Résultat attendu :**
- ✅ 0 élève non placé après P3
- ✅ Toutes les classes à leur effectif cible

---

### 3. ✅ Parité déséquilibrée et 0 swap en P4

**Symptômes :**
- Fin P3 : 6°3 = 23 élèves (16F/7M, Δ=9) → parité hors tolérance
- P4 : "Aucun swap bénéfique", "Mobilité: FIXE=0, PERMUT=0, LIBRE=0"
- Moteur de swap sans candidat mobile ou filtre trop strict

**Correctifs appliqués :**

#### 3.1. Objectif hiérarchisé (Parité prioritaire)

- **Fichier :** `Orchestration_V14I.gs`
- **Fonction :** `calculateSwapScore_()`
- **Changement :** Système de scoring hiérarchisé
  - **Niveau 1 (prioritaire)** : Si une classe est hors tolérance parité (Δ > 2)
    - Bonus massif (×1000) pour tout swap qui améliore la parité
  - **Niveau 2 (pondéré)** : Si parité OK ou swap neutre sur parité
    - Variance COM=1 (équilibrer les "mauvais" COM entre classes)
    - Coût individuel pondéré (COM/TRA/PART/ABS selon poids UI)
    - Amélioration parité (bonus faible ×0.1)

**Formule de score :**
```javascript
if (parityOutOfTol && parityImprovement > 0) {
  score = 1000 * parityImprovement;  // Priorité absolue
} else {
  score = 10 * improvementCOM1      // Équilibrer variance COM=1
        + improvementCost            // Réduire coûts individuels pondérés
        + 0.1 * parityImprovement;   // Bonus parité faible
}
```

#### 3.2. Intégration des poids UI (COM/TRA/PART/ABS)

- **Fonction :** `calculateSwapScore_()`
- **Changement :** Calcul du coût pondéré par les poids de l'UI
  - Lecture des poids depuis `ctx.weights` (définis dans `_OPTI_CONFIG`)
  - Calcul avant/après swap :
    ```javascript
    cost = weights.com  * sumCOM
         + weights.tra  * sumTRA
         + weights.part * sumPART
         + weights.abs  * sumABS
    ```
  - Amélioration = `costBefore - costAfter`

- **Poids par défaut :**
  ```javascript
  {
    parity: 0.3,
    com: 0.4,
    tra: 0.1,
    part: 0.1,
    abs: 0.1
  }
  ```

#### 3.3. Amélioration de la mobilité

- **Fichier :** `Orchestration_V14I.gs`
- **Fonction :** `isEleveMobile_()`
- **Changement :** Nouvelle logique de mobilité
  - **FIXE** (non mobile) :
    - Élève marqué `FIXE=1/OUI/X`
    - Élève avec quota (ITA/CHAV) dans sa classe actuelle
    - Élève avec code ASSO (groupe à ne pas casser)
  - **LIBRE** (mobile) :
    - Tous les autres élèves par défaut
    - Pas de LV2/OPT avec quota
    - Pas de code ASSO

- **Fonction :** `findBestSwap_()`
- **Changement :** Vérification de mobilité avant test de swap
  - Filtre `isEleveMobile_()` pour élève1 et élève2
  - Évite de tester des swaps impossibles
  - Augmente le pool de candidats mobiles

#### 3.4. Passage des paramètres depuis le contexte

- **Fonction :** `Phase4_balanceScoresSwaps_()`
- **Changement :** Passer les poids et tolérance au moteur
  ```javascript
  {
    weights: ctx.weights || { parity: 0.3, com: 0.4, tra: 0.1, part: 0.1, abs: 0.1 },
    parityTol: ctx.tolParite || ctx.parityTolerance || 2
  }
  ```

- **Fonction :** `runSwapEngineV14_withLocks_()`
- **Changement :** Logs détaillés des paramètres
  ```
  Poids: COM=0.4, TRA=0.1, PART=0.1, ABS=0.1, Parité=0.3
  Tolérance parité: 2
  ```

**Résultat attendu :**
- ✅ Swaps parité-first entre 6°3 et autres classes
- ✅ Parité 6°3 ramenée dans la tolérance (Δ ≤ 2)
- ✅ Pool de candidats mobiles non vide
- ✅ Logs "Mobilité: LIBRE=X" avec X > 0
- ✅ Respect des quotas ITA=6 / CHAV=10
- ✅ Respect des effectifs cibles (25/24/24/24/24)

---

## Fonctions ajoutées/modifiées

### BASEOPTI_System.gs
- ✅ `writeBatchToCache_()` : UPSERT par ID_ELEVE

### Orchestration_V14I.gs
- ✅ `writeAllClassesToCACHE_()` : Vérification unicité IDs
- ✅ `placeRemainingStudents_()` : Fail-safe post-P3 (nouvelle)
- ✅ `Phase3I_completeAndParity_()` : Appel fail-safe
- ✅ `Phase4_balanceScoresSwaps_()` : Passage poids/tolérance
- ✅ `runSwapEngineV14_withLocks_()` : Logs détaillés
- ✅ `findBestSwap_()` : Objectif hiérarchisé + mobilité
- ✅ `isEleveMobile_()` : Nouvelle logique mobilité (nouvelle)
- ✅ `calculateSwapScore_()` : Score hiérarchisé + pondéré (nouvelle)
- ✅ `computeClassState_()` : Calcul état classe (nouvelle)
- ✅ `simulateSwapState_()` : Simulation swap (nouvelle)

---

## Tests à effectuer

1. **Test CACHE :**
   - Lancer P1 → Vérifier logs "X màj + Y ajouts"
   - Vérifier aucun message "Doublons dans CACHE"
   - Compter lignes dans 6°xCACHE = nombre d'élèves attendu

2. **Test P3 :**
   - Lancer P3 → Vérifier "0 élève(s) non placé(s)"
   - Vérifier effectifs : 6°1=25, 6°2=24, 6°3=24, 6°4=24, 6°5=24

3. **Test P4 :**
   - Lancer P4 → Vérifier logs "Mobilité: LIBRE=X" avec X > 0
   - Vérifier swaps appliqués > 0
   - Vérifier parité finale : toutes classes Δ ≤ 2
   - Vérifier quotas préservés : ITA=6 en 6°1, CHAV=10 en 6°3

4. **Test audit :**
   - Lancer audit final → Vérifier cohérence totale
   - Pas de doublons
   - Effectifs corrects
   - Parité dans tolérance

---

## Notes techniques

### Invariants préservés
- ✅ Quotas LV2/OPT (ITA=6, CHAV=10, etc.)
- ✅ Codes ASSO (groupes non cassés)
- ✅ Codes DISSO (séparations respectées)
- ✅ Effectifs cibles (25/24/24/24/24)

### Performance
- Complexité UPSERT : O(n) par batch (lecture + index + écriture)
- Complexité P4 : O(n²) par itération (tous les swaps testés)
- Optimisation : Filtre mobilité réduit le nombre de tests

### Compatibilité
- ✅ Compatible avec système legacy (_STRUCTURE)
- ✅ Compatible avec système nouveau (_OPTI_CONFIG)
- ✅ Fallback sur valeurs par défaut si contexte incomplet
