# 🔒 IMPLÉMENTATION : ScriptLock pour runOptimizationOPTI

## Date : 21 octobre 2025, 22:50
## Version : 1.0

---

## 🎯 OBJECTIF

Empêcher les lancements concurrents du pipeline OPTI indépendant en utilisant un **ScriptLock** avec libération systématique dans un bloc `finally`.

---

## ❓ POURQUOI UN SCRIPTLOCK ?

### Problème sans verrou

Le pipeline indépendant déclenché depuis InterfaceV2 peut être lancé par **plusieurs utilisateurs en parallèle**. Sans verrou :

- ❌ **Deux optimisations simultanées** partagent les mêmes ressources
- ❌ **Écrasements silencieux** dans `_BASEOPTI` et les feuilles `...CACHE`
- ❌ **États incohérents** dans les propriétés du document
- ❌ **Résultats imprévisibles** pour tous les utilisateurs

### Solution avec ScriptLock

Un `ScriptLock` garantit qu'**une seule optimisation s'exécute à la fois** :

- ✅ **Exclusivité** : Un seul utilisateur peut lancer l'optimisation
- ✅ **Refus immédiat** : Les autres utilisateurs reçoivent un message clair
- ✅ **Pas d'interférence** : Chaque optimisation s'exécute de manière isolée
- ✅ **Cohérence** : Les ressources partagées ne sont jamais corrompues

---

## 📍 OÙ PLACER LE VERROU ?

### 1. Au tout début de `runOptimizationOPTI`

**AVANT** toute opération (construction du contexte, vidage des caches, etc.).

```javascript
function runOptimizationOPTI(options) {
  const startTime = new Date();
  
  // 🔒 ACQUÉRIR LE VERROU EN PREMIER
  const lock = LockService.getScriptLock();
  
  try {
    const hasLock = lock.tryLock(30000); // Timeout 30s
    
    if (!hasLock) {
      // ❌ VERROU OCCUPÉ
      return {
        success: false,
        locked: true,
        error: 'Une optimisation est déjà en cours.'
      };
    }
    
    // ✅ VERROU ACQUIS : Continuer l'optimisation
    // ...
  }
}
```

### 2. Gestion du refus

Si `tryLock()` échoue :

1. **Logger l'événement** pour le support
2. **Retourner une réponse `locked: true`** au front-end
3. **Ne démarrer AUCUNE phase** du pipeline

```javascript
if (!hasLock) {
  logLine('WARN', '🔒 PIPELINE OPTI VERROUILLÉ : Une optimisation est déjà en cours');
  logLine('WARN', '   → Un autre utilisateur a lancé l\'optimisation');
  logLine('WARN', '   → Veuillez attendre la fin de l\'optimisation en cours');
  
  return {
    success: false,
    ok: false,
    locked: true,
    error: 'Une optimisation est déjà en cours. Veuillez patienter.',
    message: 'Pipeline verrouillé : une autre optimisation est en cours d\'exécution.'
  };
}
```

---

## 🛡️ POURQUOI UN BLOC `finally` ?

### Problème sans `finally`

Sans bloc `finally`, le verrou peut rester retenu dans plusieurs cas :

- ❌ **Erreur dans une phase** : Exception non capturée
- ❌ **Return anticipé** : Sortie prématurée de la fonction
- ❌ **Exception inattendue** : Erreur système Google Apps Script

**Conséquence** : Le verrou reste retenu jusqu'au **timeout Google Apps Script (~30s)**, bloquant tous les lancements suivants.

### Solution avec `finally`

Le bloc `finally` garantit que le verrou est **TOUJOURS libéré**, quoi qu'il arrive :

```javascript
try {
  // Acquisition du verrou
  const hasLock = lock.tryLock(30000);
  
  if (!hasLock) {
    return { locked: true };
  }
  
  // Exécution des phases
  // ...
  
  return { success: true };
  
} catch (e) {
  // Gestion des erreurs
  return { success: false, error: e.message };
  
} finally {
  // 🔓 LIBÉRATION GARANTIE
  if (lock && lock.hasLock()) {
    lock.releaseLock();
    logLine('INFO', '🔓 Verrou libéré');
  }
}
```

**Avantages** :

- ✅ **Exécution garantie** : `finally` s'exécute même après `return` ou `throw`
- ✅ **Pas de fuite de verrou** : Le verrou est toujours libéré
- ✅ **Disponibilité immédiate** : Le pipeline est disponible pour le prochain utilisateur

---

## 🔄 EFFETS SUR LES PHASES ET L'UI

### Sur les phases

- ✅ **Aucun changement** : Chaque phase conserve son fonctionnement habituel
- ✅ **Séquencement** : Le verrou ne bloque pas l'exécution, il séquence les lancements
- ✅ **Isolation** : Chaque optimisation s'exécute de manière isolée

### Sur l'UI

- ✅ **Message clair** : L'interface affiche un toast d'attente
- ✅ **Bouton réactivé** : L'utilisateur peut réessayer après quelques instants
- ✅ **Pas de confusion** : Le message explique clairement la situation

---

## 📊 IMPLÉMENTATION COMPLÈTE

### Backend : `OPTI_Pipeline_Independent.gs`

```javascript
function runOptimizationOPTI(options) {
  const startTime = new Date();
  
  // ===================================================================
  // 🔒 SCRIPTLOCK : EMPÊCHER LES LANCEMENTS CONCURRENTS
  // ===================================================================
  const lock = LockService.getScriptLock();
  
  try {
    // Tentative d'acquisition du verrou (timeout 30s)
    const hasLock = lock.tryLock(30000);
    
    if (!hasLock) {
      // ❌ VERROU OCCUPÉ
      logLine('WARN', '🔒 PIPELINE OPTI VERROUILLÉ : Une optimisation est déjà en cours');
      logLine('WARN', '   → Un autre utilisateur a lancé l\'optimisation');
      logLine('WARN', '   → Veuillez attendre la fin de l\'optimisation en cours');
      
      return {
        success: false,
        ok: false,
        locked: true,
        error: 'Une optimisation est déjà en cours. Veuillez patienter.',
        message: 'Pipeline verrouillé : une autre optimisation est en cours d\'exécution.'
      };
    }
    
    // ✅ VERROU ACQUIS
    logLine('INFO', '='.repeat(80));
    logLine('INFO', '🚀 LANCEMENT PIPELINE OPTI INDÉPENDANT (depuis InterfaceV2)');
    logLine('INFO', '🔒 Verrou acquis : optimisation exclusive démarrée');
    logLine('INFO', '='.repeat(80));

    // ✅ CONSTRUIRE LE CONTEXTE
    const ctx = buildCtx_V2(options);
    
    // ... (exécution des phases)
    
    // ✅ SYNCHRONISATION UI
    if (ok && typeof forceCacheInUIAndReload_ === 'function') {
      logLine('INFO', '🔄 Synchronisation UI : basculement vers onglets CACHE...');
      forceCacheInUIAndReload_(ctx);
      logLine('INFO', '✅ UI synchronisée : onglets CACHE activés');
    }

    return {
      success: ok,
      ok: ok,
      phases: phasesOut,
      nbSwaps: p4.swapsApplied || 0,
      // ...
    };

  } catch (e) {
    logLine('ERROR', '❌ Erreur pipeline OPTI : ' + e.message);
    logLine('ERROR', e.stack);
    
    return {
      success: false,
      ok: false,
      error: e.message,
      stack: e.stack
    };
    
  } finally {
    // ===================================================================
    // 🔓 LIBÉRATION DU VERROU : TOUJOURS EXÉCUTÉ
    // ===================================================================
    try {
      if (lock && lock.hasLock()) {
        lock.releaseLock();
        logLine('INFO', '🔓 Verrou libéré : pipeline OPTI disponible pour d\'autres utilisateurs');
      }
    } catch (releaseError) {
      logLine('ERROR', '⚠️ Erreur lors de la libération du verrou : ' + releaseError.message);
    }
  }
}
```

### Frontend : `OptimizationPanel.html`

```javascript
google.script.run
  .withSuccessHandler(function(result) {
    // ===================================================================
    // 🔒 GESTION DU VERROU : PIPELINE OCCUPÉ
    // ===================================================================
    if (result && result.locked === true) {
      console.warn('🔒 Pipeline verrouillé:', result.message || result.error);
      
      // Afficher un toast d'attente
      if (typeof toast === 'function') {
        toast(
          '⏳ Une optimisation est déjà en cours. Veuillez patienter et réessayer dans quelques instants.',
          'warning',
          5000
        );
      } else {
        alert('⏳ Une optimisation est déjà en cours.\n\nUn autre utilisateur a lancé l\'optimisation.\nVeuillez patienter et réessayer dans quelques instants.');
      }
      
      // Réactiver le bouton
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-redo mr-2"></i>Recalculer';
      }
      
      resolve();
      return;
    }
    
    // ✅ TRAITEMENT NORMAL
    // ...
  })
  .withFailureHandler(function(error) {
    console.error('❌ Erreur:', error);
    reject(error);
  })
  .runOptimizationV14I(optimizationOptions);
```

---

## 🎓 BONNES PRATIQUES COMPLÉMENTAIRES

### 1. Tracer le motif du verrou

Consigner dans les logs qu'un lancement concurrent a été bloqué :

```javascript
logLine('WARN', '🔒 PIPELINE OPTI VERROUILLÉ : Une optimisation est déjà en cours');
logLine('WARN', '   → Un autre utilisateur a lancé l\'optimisation');
logLine('WARN', '   → Veuillez attendre la fin de l\'optimisation en cours');
```

**Avantage** : Facilite le support et le débogage.

### 2. Combiner avec `forceCacheInUIAndReload_`

Après chaque phase réussie, appeler ce helper pour synchroniser l'affichage :

```javascript
if (ok && typeof forceCacheInUIAndReload_ === 'function') {
  logLine('INFO', '🔄 Synchronisation UI : basculement vers onglets CACHE...');
  forceCacheInUIAndReload_(ctx);
  logLine('INFO', '✅ UI synchronisée : onglets CACHE activés');
}
```

**Avantage** : Renforce la cohérence visuelle entre le pipeline OPTI et le pipeline legacy.

### 3. Informer l'utilisateur

Prévoir dans InterfaceV2 un message clair lorsque l'erreur `locked` est reçue :

```javascript
if (result && result.locked === true) {
  toast(
    '⏳ Une optimisation est déjà en cours. Veuillez patienter et réessayer dans quelques instants.',
    'warning',
    5000
  );
}
```

**Avantage** : Encourage l'attente plutôt que les relances multiples.

### 4. Timeout raisonnable

Utiliser un timeout de **30 secondes** pour `tryLock()` :

```javascript
const hasLock = lock.tryLock(30000); // 30s
```

**Raison** :
- ✅ Assez long pour attendre la fin d'une optimisation rapide
- ✅ Assez court pour ne pas bloquer l'utilisateur indéfiniment
- ✅ Cohérent avec le timeout Google Apps Script

---

## 📊 SCÉNARIOS D'UTILISATION

### Scénario 1 : Utilisateur unique

1. **Utilisateur A** lance l'optimisation
2. ✅ **Verrou acquis** : L'optimisation démarre
3. **Phases 1-4** s'exécutent normalement
4. ✅ **Verrou libéré** : Pipeline disponible

**Résultat** : Optimisation réussie, aucun problème.

---

### Scénario 2 : Deux utilisateurs simultanés

1. **Utilisateur A** lance l'optimisation à 10:00:00
2. ✅ **Verrou acquis** par A : L'optimisation démarre
3. **Utilisateur B** lance l'optimisation à 10:00:05
4. ❌ **Verrou occupé** : B reçoit `locked: true`
5. **Message affiché** : "Une optimisation est déjà en cours"
6. **A termine** à 10:00:45
7. ✅ **Verrou libéré** : Pipeline disponible
8. **B réessaie** à 10:00:50
9. ✅ **Verrou acquis** par B : L'optimisation démarre

**Résultat** : Pas d'interférence, chaque optimisation s'exécute de manière isolée.

---

### Scénario 3 : Erreur pendant l'optimisation

1. **Utilisateur A** lance l'optimisation
2. ✅ **Verrou acquis** : L'optimisation démarre
3. **Phase 2** échoue avec une exception
4. **Bloc catch** : Erreur loggée et retournée
5. **Bloc finally** : Verrou libéré automatiquement
6. ✅ **Pipeline disponible** : Autre utilisateur peut lancer

**Résultat** : Le verrou est libéré même en cas d'erreur, pas de blocage.

---

### Scénario 4 : Return anticipé

1. **Utilisateur A** lance l'optimisation
2. ✅ **Verrou acquis** : L'optimisation démarre
3. **Phase 1** détecte un problème et fait un `return` anticipé
4. **Bloc finally** : Verrou libéré automatiquement
5. ✅ **Pipeline disponible** : Autre utilisateur peut lancer

**Résultat** : Le verrou est libéré même avec un `return` anticipé.

---

## ✅ AVANTAGES DE CETTE IMPLÉMENTATION

### 1. Sécurité

- ✅ **Pas d'écrasement** : Les ressources partagées sont protégées
- ✅ **Cohérence** : Chaque optimisation s'exécute de manière isolée
- ✅ **Traçabilité** : Tous les événements sont loggés

### 2. Robustesse

- ✅ **Libération garantie** : Le bloc `finally` garantit la libération
- ✅ **Gestion des erreurs** : Même en cas d'exception, le verrou est libéré
- ✅ **Pas de fuite** : Aucun risque de verrou retenu indéfiniment

### 3. Expérience utilisateur

- ✅ **Message clair** : L'utilisateur comprend pourquoi il doit attendre
- ✅ **Bouton réactivé** : L'utilisateur peut réessayer facilement
- ✅ **Pas de confusion** : Le message explique la situation

### 4. Maintenabilité

- ✅ **Code simple** : Pattern classique `try-finally`
- ✅ **Facile à déboguer** : Logs clairs et détaillés
- ✅ **Extensible** : Facile d'ajouter d'autres vérifications

---

## 📚 COMPARAISON AVEC LE PIPELINE LEGACY

| Aspect | Pipeline Legacy | Pipeline OPTI (nouveau) |
|--------|----------------|-------------------------|
| **Verrou** | ✅ Oui (dans `runOptimizationV14I`) | ✅ Oui (dans `runOptimizationOPTI`) |
| **Libération** | ✅ Bloc `finally` | ✅ Bloc `finally` |
| **Message UI** | ✅ Toast d'attente | ✅ Toast d'attente |
| **Synchronisation** | ✅ `forceCacheInUIAndReload_` | ✅ `forceCacheInUIAndReload_` |
| **Logs** | ✅ Détaillés | ✅ Détaillés |

**Conclusion** : Le pipeline OPTI bénéficie des **mêmes garde-fous** que le pipeline legacy.

---

## 🎯 CONCLUSION

L'ajout du ScriptLock avec libération dans `finally` garantit que :

1. ✅ **Une seule optimisation** s'exécute à la fois
2. ✅ **Pas d'interférence** entre utilisateurs
3. ✅ **Libération garantie** du verrou
4. ✅ **Expérience utilisateur claire** avec messages appropriés
5. ✅ **Cohérence** avec le pipeline legacy

**Le pipeline OPTI indépendant est maintenant sécurisé contre les lancements concurrents !** 🔒

---

## 📝 FICHIERS MODIFIÉS

1. ✅ **`OPTI_Pipeline_Independent.gs`** : Ajout du ScriptLock avec `finally`
2. ✅ **`OptimizationPanel.html`** : Gestion de l'erreur `locked` côté front-end

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ **Tester** avec plusieurs utilisateurs simultanés
2. ✅ **Vérifier** que le verrou est bien libéré en cas d'erreur
3. ✅ **Monitorer** les logs pour détecter les tentatives de lancement concurrent
4. ✅ **Documenter** le comportement dans le guide utilisateur
