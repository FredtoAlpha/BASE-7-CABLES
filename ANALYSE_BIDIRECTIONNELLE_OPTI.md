# 🔄 ANALYSE BIDIRECTIONNELLE INTERFACE ↔ BACKEND OPTI

## 📊 RÉSUMÉ EXÉCUTIF

### ✅ CE QUI EXISTE DÉJÀ

#### Backend → Interface (Fonctions disponibles)
1. **`getOptiConfigForUI()`** - Récupère la config depuis `_OPTI_CONFIG`
2. **`saveOptiConfigFromUI(config)`** - Sauvegarde la config depuis l'UI
3. **`initOptiConfig()`** - Initialise `_OPTI_CONFIG` avec valeurs par défaut
4. **`phase1Stream()`** - Phase 1 Options/LV2
5. **`phase2Stream()`** - Phase 2 DISSO/ASSO
6. **`phase3Stream()`** - Phase 3 Effectifs/Parité
7. **`phase4Stream()`** - Phase 4 Swaps
8. **`auditStream()`** - Audit final avec scores
9. **`openCacheTabsStream()`** - Ouvre/vide les onglets CACHE
10. **`getCacheSnapshotStream()`** - Snapshot live des CACHE

#### Interface → Backend (Paramètres disponibles dans OptimizationPanel.html)
1. **Structure**
   - ✅ Nombre de classes
   - ✅ Capacité par classe
   - ✅ Total élèves

2. **Options/LV2**
   - ✅ Détection automatique
   - ✅ Configuration par classe (LV2/OPT)

3. **Contraintes**
   - ✅ DISSO (séparation)
   - ✅ ASSO (regroupement)
   - ✅ Mobilité (FIXE/SPEC)
   - ✅ Options/LV2

4. **Scores**
   - ✅ Poids COM
   - ✅ Poids TRA
   - ✅ Poids PART
   - ✅ Poids ABS
   - ✅ Max swaps

---

## ❌ CE QUI MANQUE (GAPS IDENTIFIÉS)

### 🔴 BACKEND → INTERFACE (Données non récupérées)

#### Depuis `_OPTI_CONFIG` (OptiConfig_System.gs)
```javascript
// CES PARAMÈTRES EXISTENT DANS LE BACKEND MAIS PAS DANS L'INTERFACE :

1. ❌ mode.selected          // Mode de travail (TEST/PROD/CACHE/FIN)
2. ❌ swaps.runtime          // Durée maximale (runtimeSec) - défaut: 180s
3. ❌ parity.tolerance       // Tolérance parité - défaut: 2
4. ❌ targets.byClass        // Effectifs cibles par classe
5. ❌ offers.byClass         // Quotas LV2/OPT par classe
```

**IMPACT** : L'interface ne peut pas afficher/modifier ces paramètres critiques !

---

### 🔴 INTERFACE → BACKEND (Données non envoyées)

#### Depuis OptimizationPanel.html
```javascript
// CES DONNÉES SONT DANS L'INTERFACE MAIS NE SONT PAS ENVOYÉES AU BACKEND :

1. ❌ Mode de travail        // Pas de sélecteur dans l'interface
2. ❌ Durée maximale         // Pas de slider dans l'interface
3. ❌ Tolérance parité       // Pas de slider dans l'interface
4. ❌ Contraintes activées   // Les toggles ne sont pas envoyés
```

**IMPACT** : Le backend ne reçoit pas tous les paramètres configurés dans l'UI !

---

## 🔧 PLAN DE FUSION

### ÉTAPE 1 : Ajouter les paramètres manquants dans OptimizationPanel.html

#### A. Onglet "Structure" - Ajouter :
```html
<!-- Mode de travail -->
<div class="mb-4">
  <label class="block text-sm font-medium mb-2">Mode de travail</label>
  <select id="modeSelected" class="w-full px-3 py-2 border rounded">
    <option value="TEST">TEST (brouillon)</option>
    <option value="CACHE">CACHE (optimisation)</option>
    <option value="FIN">FIN (finalisé)</option>
    <option value="PROD">PROD (production)</option>
  </select>
</div>
```

#### B. Onglet "Scores" - Ajouter :
```html
<!-- Durée maximale -->
<div class="mb-6">
  <div class="flex justify-between items-center mb-2">
    <label class="font-bold">
      <i class="fas fa-clock mr-2"></i>Durée maximale (secondes)
    </label>
    <span id="runtimeSec" class="font-bold text-lg">180</span>
  </div>
  <input type="range" id="sliderRuntime" class="w-full" 
         min="30" max="600" step="30" value="180"
         oninput="OptimizationPanel.updateRuntime(this.value)">
  <p class="text-xs text-gray-600 mt-1">Budget temps pour la Phase 4</p>
</div>

<!-- Tolérance parité -->
<div class="mb-6">
  <div class="flex justify-between items-center mb-2">
    <label class="font-bold">
      <i class="fas fa-balance-scale mr-2"></i>Tolérance parité (F/M)
    </label>
    <span id="parityTolerance" class="font-bold text-lg">2</span>
  </div>
  <input type="range" id="sliderParity" class="w-full" 
         min="0" max="5" step="1" value="2"
         oninput="OptimizationPanel.updateParity(this.value)">
  <p class="text-xs text-gray-600 mt-1">Écart max autorisé entre F et M</p>
</div>
```

---

### ÉTAPE 2 : Charger les paramètres depuis le backend

#### Dans `OptimizationPanel.loadConfiguration()` :
```javascript
async loadConfiguration() {
  try {
    // NOUVEAU : Charger depuis _OPTI_CONFIG
    const config = await new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getOptiConfigForUI();
    });
    
    if (config.success) {
      const c = config.config;
      
      // Pré-remplir les champs
      document.getElementById('modeSelected').value = c.mode || 'TEST';
      document.getElementById('sliderRuntime').value = c.runtimeSec || 180;
      document.getElementById('runtimeSec').textContent = c.runtimeSec || 180;
      document.getElementById('sliderParity').value = c.parityTolerance || 2;
      document.getElementById('parityTolerance').textContent = c.parityTolerance || 2;
      document.getElementById('sliderMaxSwaps').value = c.maxSwaps || 50;
      document.getElementById('maxSwaps').textContent = c.maxSwaps || 50;
      
      // Poids
      if (c.weights) {
        document.getElementById('sliderCOM').value = c.weights.com || 0.4;
        document.getElementById('poidsCOM').textContent = (c.weights.com || 0.4).toFixed(1);
        document.getElementById('sliderTRA').value = c.weights.tra || 0.1;
        document.getElementById('poidsTRA').textContent = (c.weights.tra || 0.1).toFixed(1);
        document.getElementById('sliderPART').value = c.weights.part || 0.1;
        document.getElementById('poidsPART').textContent = (c.weights.part || 0.1).toFixed(1);
        document.getElementById('sliderABS').value = c.weights.abs || 0.1;
        document.getElementById('poidsABS').textContent = (c.weights.abs || 0.1).toFixed(1);
      }
      
      // Targets et quotas
      this.currentConfig = {
        targets: c.targets || {},
        quotas: c.quotas || {}
      };
    }
  } catch (error) {
    console.error('Erreur chargement configuration:', error);
  }
}
```

---

### ÉTAPE 3 : Envoyer TOUS les paramètres au backend

#### Dans `OptimizationPanel.runOptimizationStreaming()` :
```javascript
async runOptimizationStreaming() {
  try {
    // NOUVEAU : Sauvegarder la config AVANT de lancer l'optimisation
    const config = {
      mode: document.getElementById('modeSelected').value,
      weights: {
        com: parseFloat(document.getElementById('sliderCOM').value),
        tra: parseFloat(document.getElementById('sliderTRA').value),
        part: parseFloat(document.getElementById('sliderPART').value),
        abs: parseFloat(document.getElementById('sliderABS').value),
        parity: 0.3  // Fixe pour l'instant
      },
      maxSwaps: parseInt(document.getElementById('sliderMaxSwaps').value),
      runtimeSec: parseInt(document.getElementById('sliderRuntime').value),
      parityTolerance: parseInt(document.getElementById('sliderParity').value),
      targets: this.currentConfig.targets || {},
      quotas: this.classOptionsConfig || {}
    };
    
    // Sauvegarder dans _OPTI_CONFIG
    await gs('saveOptiConfigFromUI', config);
    console.log('✅ Configuration sauvegardée dans _OPTI_CONFIG');
    
    // Lancer les phases
    await gs('openCacheTabsStream');
    await gs('phase1Stream');
    await gs('phase2Stream');
    await gs('phase3Stream');
    await gs('phase4Stream');
    const audit = await gs('auditStream');
    
    // Afficher les résultats
    this.displayStreamingResults(audit);
    
  } catch (error) {
    console.error('Erreur optimisation:', error);
  }
}
```

---

## 🎯 RÉSULTAT ATTENDU

### Flux complet Interface → Backend → Interface

```
┌─────────────────────────────────────────────────────────────┐
│                    OPTIMIZATIONPANEL.HTML                    │
│                                                              │
│  📋 Structure                                                │
│    • Nombre de classes                                       │
│    • Capacité par classe                                     │
│    • Mode de travail ⭐ NOUVEAU                             │
│                                                              │
│  🎓 Options/LV2                                             │
│    • Détection automatique                                   │
│    • Configuration par classe                                │
│                                                              │
│  🛡️ Contraintes                                             │
│    • DISSO, ASSO, Mobilité, Options                         │
│                                                              │
│  ⚖️ Scores                                                  │
│    • Poids COM/TRA/PART/ABS                                 │
│    • Max swaps                                               │
│    • Durée maximale ⭐ NOUVEAU                              │
│    • Tolérance parité ⭐ NOUVEAU                            │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ saveOptiConfigFromUI(config)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      _OPTI_CONFIG                            │
│                                                              │
│  KEY                    │ VALUE                              │
│  ──────────────────────┼──────────────────────────────────  │
│  mode.selected          │ TEST                               │
│  weights                │ {"com":0.4,"tra":0.1,...}         │
│  swaps.max              │ 50                                 │
│  swaps.runtime          │ 180                                │
│  parity.tolerance       │ 2                                  │
│  targets.byClass        │ {"6°1":25,"6°2":25,...}           │
│  offers.byClass         │ {"6°1":{"LV2":["ITA"],...},...}   │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ getOptimizationContext_V2()
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASES STREAMING                          │
│                                                              │
│  1. openCacheTabsStream()  → Ouvre/vide CACHE               │
│  2. phase1Stream()         → Options/LV2                     │
│  3. phase2Stream()         → DISSO/ASSO                      │
│  4. phase3Stream()         → Effectifs/Parité                │
│  5. phase4Stream()         → Swaps (maxSwaps, runtimeSec)    │
│  6. auditStream()          → Audit + scores                  │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Résultats
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    OPTIMIZATIONPANEL.HTML                    │
│                     (Onglet Résultats)                       │
│                                                              │
│  ✅ Optimisation réussie en 12.5s                           │
│  📊 Phase 1: ITA=12, CHAV=8                                 │
│  📊 Phase 2: 5 ASSO, 3 DISSO                                │
│  📊 Phase 3: Effectifs équilibrés                           │
│  📊 Phase 4: 23 swaps                                        │
│                                                              │
│  📋 Audit par classe:                                        │
│    • 6°1 (26 élèves, 13F/13M)                               │
│      LV2: ITA=12 | OPT: CHAV=8                              │
│      📊 Moyennes: COM=2.1 | TRA=2.8 | PART=2.5 | ABS=1.2   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 CHECKLIST DE FUSION

### Phase 1 : Analyse ✅
- [x] Identifier toutes les fonctions backend OPTI
- [x] Identifier tous les paramètres UI existants
- [x] Identifier les gaps Backend → Interface
- [x] Identifier les gaps Interface → Backend

### Phase 2 : Ajout des paramètres manquants
- [ ] Ajouter sélecteur "Mode de travail" dans onglet Structure
- [ ] Ajouter slider "Durée maximale" dans onglet Scores
- [ ] Ajouter slider "Tolérance parité" dans onglet Scores
- [ ] Ajouter fonctions updateRuntime() et updateParity()

### Phase 3 : Connexion Backend → Interface
- [ ] Modifier loadConfiguration() pour charger depuis getOptiConfigForUI()
- [ ] Pré-remplir TOUS les champs (mode, runtime, parity, weights, swaps)
- [ ] Afficher les targets et quotas depuis _OPTI_CONFIG

### Phase 4 : Connexion Interface → Backend
- [ ] Modifier runOptimizationStreaming() pour sauvegarder la config AVANT
- [ ] Appeler saveOptiConfigFromUI(config) avec TOUS les paramètres
- [ ] Vérifier que les phases utilisent bien les valeurs sauvegardées

### Phase 5 : Tests
- [ ] Tester chargement config depuis _OPTI_CONFIG
- [ ] Tester sauvegarde config vers _OPTI_CONFIG
- [ ] Tester que phase4Stream() utilise maxSwaps et runtimeSec
- [ ] Tester que phase3Stream() utilise parityTolerance
- [ ] Tester l'audit final avec scores

---

## 🚀 PRÊT À CODER ?

**Tous les liens sont maintenant identifiés !**

Le plan de fusion est complet. On peut maintenant :
1. Ajouter les 3 paramètres manquants dans l'interface
2. Connecter loadConfiguration() → getOptiConfigForUI()
3. Connecter runOptimizationStreaming() → saveOptiConfigFromUI()
4. Vérifier que toutes les phases utilisent les bonnes valeurs

**Validation finale : CHAQUE paramètre de l'UI doit nourrir le backend, et CHAQUE fonction backend doit être appelée depuis l'UI !**
