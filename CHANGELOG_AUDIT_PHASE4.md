# Changelog - Audit & Sécurisation Phase 4

## Date : 19 octobre 2025

## Résumé
Ajout de deux améliorations majeures pour finaliser le système d'optimisation V14I :
1. **Vérification des quotas** : L'audit vérifie maintenant non seulement l'offre (LV2/OPT autorisées) mais aussi le respect des quotas numériques
2. **Sécurisation Phase 4** : Les swaps respectent désormais les contraintes FIXE/PERMUT/Offre pour ne jamais détruire la structure posée en P1/P2/P3

---

## 1. Vérification des Quotas

### Fonction `buildOfferWithQuotas_(ctx)`
**Fichier** : `Orchestration_V14I.gs` (lignes ~1945-1972)

**Rôle** : Remplace l'ancienne `buildOfferFromQuotas_` en ajoutant la remontée des quotas numériques.

**Structure retournée** :
```javascript
{
  "6°1": {
    LV2: ["ITA", "ESP"],           // Liste des LV2 autorisées
    OPT: ["CHAV", "LAT"],          // Liste des OPT autorisées
    quotas: {                       // Quotas numériques attendus
      ITA: 6,
      CHAV: 10,
      ESP: 5
    }
  },
  // ... autres classes
}
```

**Logique** :
- Initialise depuis `ctx.cacheSheets`
- Parse `ctx.quotas` (lu depuis _STRUCTURE)
- Classifie automatiquement en LV2 ou OPT selon heuristique (CHAV/LAT/GRE = OPT, reste = LV2)

---

### Fonction `auditCacheAgainstStructure_(ctx)`
**Fichier** : `Orchestration_V14I.gs` (lignes ~1978-2164)

**Rôle** : Audite chaque onglet CACHE contre la structure attendue et remonte les violations.

**Vérifications effectuées** :
1. **Parité** : Compte F/M et calcule |F-M|
2. **LV2** : Vérifie que chaque LV2 présente est autorisée dans l'offre
3. **OPT** : Vérifie que chaque OPT présente est autorisée dans l'offre
4. **Codes D** : Détecte les doublons (même code D dans la même classe)
5. **Codes A** : Détecte les groupes incomplets (1 seul élève avec un code A)
6. **QUOTAS** : Compare le réalisé vs attendu pour chaque quota défini

**Structure retournée** :
```javascript
{
  "6°1": {
    total: 25,
    F: 13,
    M: 12,
    LV2: { ITA: 6, ESP: 5 },
    OPT: { CHAV: 10 },
    FIXE: 8,
    PERMUT: 12,
    LIBRE: 5,
    violations: {
      LV2: [],                    // Ex: ["ALL non autorisée (3 élèves)"]
      OPT: [],                    // Ex: ["LAT non autorisée (2 élèves)"]
      D: [],                      // Ex: ["Code D=D5 en double"]
      A: [],                      // Ex: ["Groupe A=A3 incomplet (1 seul élève)"]
      QUOTAS: []                  // Ex: ["ITA: attendu=6, réalisé=4"]
    }
  },
  // ... autres classes
}
```

**Logs générés** :
```
📦 Classe 6°1 — Total=25, F=13, M=12, |F-M|=1
   Offre attendue: LV2=[ITA,ESP], OPT=[CHAV]
   LV2 réalisées: {"ITA":6,"ESP":5}
   OPT réalisées: {"CHAV":10}
   Mobilité: FIXE=8, PERMUT=12, LIBRE=5
   ❌ Violations QUOTAS (1): ITA: attendu=6, réalisé=4
```

---

### Intégration dans `runOptimizationV14FullI`
**Fichier** : `Orchestration_V14I.gs` (ligne ~231)

L'audit est appelé après l'ouverture des onglets CACHE et avant le retour de la réponse :
```javascript
const cacheAudit = auditCacheAgainstStructure_(ctx);
```

Le résultat est ajouté à la réponse JSON (ligne ~253) :
```javascript
cacheAudit: cacheAudit || {},  // ✅ Audit de conformité par classe
```

---

### Affichage UI
**Fichier** : `OptimizationPanel.html` (lignes ~1048-1050)

Ajout de l'affichage des violations QUOTAS dans la console :
```javascript
if (a.violations.QUOTAS && a.violations.QUOTAS.length > 0) {
  console.warn(`❌ ${cls} - Violations QUOTAS (${a.violations.QUOTAS.length}):`, a.violations.QUOTAS);
}
```

---

## 2. Sécurisation Phase 4

### Fonction `eligibleForSwap_(eleve, clsCible, offer)`
**Fichier** : `Orchestration_V14I.gs` (lignes ~1538-1571)

**Rôle** : Vérifie si un élève peut être déplacé vers une classe cible.

**Vérifications** :
1. **FIXE** : Refuse si `FIXE = 'FIXE' | 'X' | 'OUI' | '1'`
2. **MOBILITE** : Refuse si mobilité n'est ni PERMUT ni LIBRE (sauf vide)
3. **LV2** : Refuse si la LV2 de l'élève n'est pas dans l'offre de la classe cible
4. **OPT** : Refuse si l'OPT de l'élève n'est pas dans l'offre de la classe cible

**Exemple** :
```javascript
// Élève avec ITA + CHAV + MOBILITE=PERMUT(6°1,6°3)
eligibleForSwap_(eleve, "6°1", offer) // true si 6°1 offre ITA+CHAV
eligibleForSwap_(eleve, "6°2", offer) // false si 6°2 n'offre pas ITA
eligibleForSwap_(eleve, "6°4", offer) // false car 6°4 pas dans PERMUT
```

---

### Fonction `isSwapValid_(eleve1, classe1, eleve2, classe2, locks, classesState, offer)`
**Fichier** : `Orchestration_V14I.gs` (lignes ~1576-1611)

**Rôle** : Vérifie si un swap entre deux élèves est valide.

**Vérifications** :
1. Appelle `eligibleForSwap_` pour les deux élèves
2. Si `locks.keepDisso` : vérifie que les codes D ne créent pas de conflit

**Exemple** :
```javascript
// Swap entre élève1 (6°1 → 6°2) et élève2 (6°2 → 6°1)
if (!eligibleForSwap_(eleve1, "6°2", offer)) return false;
if (!eligibleForSwap_(eleve2, "6°1", offer)) return false;
// + vérification codes D
```

---

### Intégration dans Phase 4
**Fichier** : `Orchestration_V14I.gs`

**Modifications** :
1. **Ligne ~1416** : Construction de l'offre au début du moteur de swaps
   ```javascript
   const offer = buildOfferWithQuotas_(ctx);
   ```

2. **Ligne ~1405** : Ajout du paramètre `ctx` à `runSwapEngineV14_withLocks_`
   ```javascript
   function runSwapEngineV14_withLocks_(classesState, options, locks, warnings, ctx)
   ```

3. **Ligne ~1426** : Passage de `offer` à `findBestSwap_`
   ```javascript
   const bestSwap = findBestSwap_(classesState, currentScores, primary, locks, offer);
   ```

4. **Ligne ~1484** : Ajout du paramètre `offer` à `findBestSwap_`
   ```javascript
   function findBestSwap_(classesState, currentScores, primary, locks, offer)
   ```

5. **Ligne ~1503** : Passage de `offer` à `isSwapValid_`
   ```javascript
   if (!isSwapValid_(eleve1, niveau1, eleve2, niveau2, locks, classesState, offer))
   ```

---

## Impact

### Avant
- ❌ L'audit vérifiait l'offre mais pas les quotas numériques
- ❌ Phase 4 pouvait déplacer des élèves FIXE
- ❌ Phase 4 pouvait violer les offres LV2/OPT
- ❌ Phase 4 pouvait ignorer les contraintes de mobilité

### Après
- ✅ L'audit détecte les écarts entre quotas attendus et réalisés
- ✅ Phase 4 respecte FIXE (élèves marqués ne bougent jamais)
- ✅ Phase 4 respecte PERMUT (élèves ne vont que dans classes autorisées)
- ✅ Phase 4 respecte l'offre (LV2/OPT compatibles avec classe cible)
- ✅ Phase 4 respecte les codes D (pas de conflit après swap)

---

## Sanity Check

### Logs Apps Script
Après un run, vérifier en bas des logs :
```
📦 Classe 6°1 — Total=25, F=13, M=12, |F-M|=1
   Offre attendue: LV2=[ITA,ESP], OPT=[CHAV]
   LV2 réalisées: {"ITA":6,"ESP":5}
   OPT réalisées: {"CHAV":10}
   Mobilité: FIXE=8, PERMUT=12, LIBRE=5
   ❌ Violations QUOTAS (1): ITA: attendu=6, réalisé=4
```

### Console Front
Ouvrir la console navigateur après optimisation :
```javascript
console.table(result.cacheAudit)
// Affiche tableau par classe avec total, F, M, LV2, OPT, violations

console.warn("❌ 6°1 - Violations QUOTAS (1):", ["ITA: attendu=6, réalisé=4"])
```

### Vérification manuelle
1. Ouvrir un onglet CACHE (ex: `6°1CACHE`)
2. Vérifier colonne FIXE : élèves marqués FIXE ne doivent pas avoir bougé
3. Vérifier colonne MOBILITE : cohérence avec les mouvements
4. Compter LV2/OPT : doivent correspondre aux quotas _STRUCTURE

---

## Notes Techniques

### Classification LV2 vs OPT
La fonction `buildOfferWithQuotas_` utilise une heuristique simple :
- **OPT** : CHAV, LAT, GRE, OPT, ITA_OPT
- **LV2** : tout le reste (ITA, ESP, ALL, PT, CHI, etc.)

Si votre structure utilise d'autres codes, ajuster ligne ~1963 :
```javascript
if (K === 'CHAV' || K === 'LAT' || K === 'GRE' || K === 'OPT' || K === 'ITA_OPT') {
  res[cls].OPT.push(K === 'ITA_OPT' ? 'ITA' : K);
} else {
  res[cls].LV2.push(K);
}
```

### Performance Phase 4
Avec les nouvelles vérifications, Phase 4 peut être légèrement plus lente car :
- Chaque swap candidat appelle `eligibleForSwap_` (2 fois)
- Chaque `eligibleForSwap_` vérifie FIXE + MOBILITE + LV2 + OPT

Pour optimiser si nécessaire :
- Pré-calculer les élèves éligibles au début de Phase 4
- Filtrer les élèves FIXE avant la boucle de swaps
- Cacher les résultats de `eligibleForSwap_` si appelé plusieurs fois pour le même élève

---

## Fichiers Modifiés

1. **Orchestration_V14I.gs**
   - Ajout `buildOfferWithQuotas_` (lignes ~1945-1972)
   - Ajout `auditCacheAgainstStructure_` (lignes ~1978-2164)
   - Ajout `eligibleForSwap_` (lignes ~1538-1571)
   - Modification `isSwapValid_` (lignes ~1576-1611)
   - Modification `runSwapEngineV14_withLocks_` (signature + ligne ~1416)
   - Modification `findBestSwap_` (signature + ligne ~1503)
   - Modification `runOptimizationV14FullI` (ligne ~231 + ~253)

2. **OptimizationPanel.html**
   - Ajout affichage violations QUOTAS (lignes ~1048-1050)

---

## Tests Recommandés

1. **Test audit sans violations**
   - Structure : 6°1 offre ITA=6, CHAV=10
   - Résultat attendu : violations.QUOTAS = []

2. **Test audit avec violations quotas**
   - Structure : 6°1 offre ITA=6
   - Réalisé : 4 élèves ITA
   - Résultat attendu : violations.QUOTAS = ["ITA: attendu=6, réalisé=4"]

3. **Test Phase 4 avec élève FIXE**
   - Marquer un élève FIXE dans colonne FIXE
   - Lancer Phase 4
   - Vérifier que l'élève n'a pas bougé

4. **Test Phase 4 avec PERMUT**
   - Élève avec MOBILITE=PERMUT(6°1,6°3)
   - Lancer Phase 4
   - Vérifier que l'élève reste en 6°1 ou 6°3 (jamais 6°2/6°4/6°5)

5. **Test Phase 4 avec offre incompatible**
   - Élève avec ITA en 6°1
   - 6°2 n'offre pas ITA
   - Lancer Phase 4
   - Vérifier que l'élève ne va jamais en 6°2

---

## Prochaines Étapes (Optionnel)

1. **Affichage UI enrichi**
   - Tableau visuel des violations par classe
   - Indicateurs colorés (vert = OK, rouge = violations)

2. **Export audit**
   - Bouton pour exporter l'audit en CSV/Excel
   - Rapport PDF avec graphiques

3. **Optimisation performance**
   - Cache des élèves éligibles
   - Parallélisation des vérifications

4. **Gestion groupes A**
   - Swap de groupe complet (tous les membres A ensemble)
   - Détection conflits A + FIXE

---

## Auteur
Cascade AI - 19 octobre 2025
