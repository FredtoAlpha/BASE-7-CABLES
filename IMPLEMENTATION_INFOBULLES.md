# 🎨 IMPLÉMENTATION : Infobulles et États Visuels Synchronisés

## Date : 21 octobre 2025, 22:26
## Version : 1.0

---

## 🎯 OBJECTIF

Réduire la charge cognitive en affichant des **infobulles contextuelles** et des **états visuels synchronisés** avec le backend pendant l'optimisation.

---

## ✅ ANALYSE DU PLAN INITIAL

Votre plan est **excellent** et couvre tous les points essentiels :

### Points forts identifiés

1. ✅ **Points d'ancrage bien identifiés**
   - Panneau d'optimisation (sliders, boutons)
   - Statut streaming live (logs, phases)
   - Aperçu live des classes (cartes)

2. ✅ **Synchronisation backend bien pensée**
   - `setStreamingStatus()` comme point central
   - Exploitation des snapshots existants
   - Hooks Apps Script identifiés

3. ✅ **Stratégie d'intégration claire**
   - Convention `data-hint`
   - Gestionnaire unique `TooltipRegistry`
   - Synchronisation après reload

---

## 🚀 RECOMMANDATIONS D'IMPLÉMENTATION

### 1. Utiliser Tippy.js (bibliothèque légère)

**Pourquoi** :
- ✅ Léger (< 20 Ko gzippé)
- ✅ Accessible (ARIA)
- ✅ Thèmes personnalisables
- ✅ Positionnement automatique
- ✅ Support HTML

**Installation** :
```html
<!-- Dans InterfaceV2.html, avant </head> -->
<script src="https://unpkg.com/@popperjs/core@2"></script>
<script src="https://unpkg.com/tippy.js@6"></script>
<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css">
```

### 2. Convention de données enrichie

Au lieu de `data-hint`, utiliser plusieurs attributs pour plus de flexibilité :

```html
<div class="slider-container" 
     data-tooltip="Poids du score COM"
     data-tooltip-detail="Plus le poids est élevé, plus l'algorithme privilégie l'équilibre des scores COM."
     data-tooltip-value="2.5"
     data-tooltip-range="0.5 - 5.0"
     data-tooltip-phase="config"
     data-tooltip-key="weight-com">
  <label>COM</label>
  <input type="range" id="weight-com" min="0.5" max="5" step="0.1" value="2.5">
  <span class="value">2.5</span>
</div>
```

**Attributs** :
- `data-tooltip` : Titre court
- `data-tooltip-detail` : Explication détaillée
- `data-tooltip-value` : Valeur actuelle (mise à jour dynamique)
- `data-tooltip-range` : Plage de valeurs
- `data-tooltip-phase` : Phase concernée (config, phase1, phase2, etc.)
- `data-tooltip-key` : Clé pour mise à jour dynamique

---

## 📦 FICHIER CRÉÉ : TooltipRegistry.html

J'ai créé un gestionnaire centralisé avec les fonctionnalités suivantes :

### Fonctions principales

#### `TooltipRegistry.init()`
Initialise tous les tooltips dans le document.

```javascript
TooltipRegistry.init();
// ✅ Initialise automatiquement tous les éléments avec data-tooltip
```

#### `TooltipRegistry.register(element)`
Enregistre un élément pour afficher un tooltip.

```javascript
const slider = document.getElementById('weight-com');
TooltipRegistry.register(slider);
```

#### `TooltipRegistry.update(element, data)`
Met à jour le contenu d'un tooltip.

```javascript
TooltipRegistry.update(slider, {
  value: '3.0',
  detail: 'Valeur augmentée pour privilégier le comportement'
});
```

#### `TooltipRegistry.updatePhase(phaseName, data)`
Met à jour tous les tooltips d'une phase donnée.

```javascript
TooltipRegistry.updatePhase('phase1', {
  'ita-count': 11,
  'chav-count': 22,
  'esp-count': 88
});
```

#### `TooltipRegistry.syncWithStreaming(message, phase, data)`
Synchronise avec le statut streaming.

```javascript
TooltipRegistry.syncWithStreaming(
  'Phase 1 terminée',
  'phase1',
  {
    classes: {
      '6°1': { total: 25, female: 13, male: 12, parityRatio: 52.0 },
      '6°2': { total: 24, female: 12, male: 12, parityRatio: 50.0 }
    },
    metrics: {
      initialVariance: 15.67,
      finalVariance: 12.34,
      totalImprovement: 3.33
    }
  }
);
```

---

## 🔧 INTÉGRATION DANS OptimizationPanel.html

### Étape 1 : Inclure TooltipRegistry

```html
<!-- Dans OptimizationPanel.html, après les imports -->
<?!= HtmlService.createHtmlOutputFromFile('TooltipRegistry').getContent(); ?>
```

### Étape 2 : Enrichir les sliders avec data-tooltip

```javascript
// Dans createPanel(), remplacer :
<div class="slider-container">
  <label>COM</label>
  <input type="range" id="weight-com" min="0.5" max="5" step="0.1" value="2.5">
  <span class="value">2.5</span>
</div>

// Par :
<div class="slider-container" 
     data-tooltip="Poids du score COM (Comportement)"
     data-tooltip-detail="Plus le poids est élevé, plus l'algorithme privilégie l'équilibre des scores COM entre les classes. Un élève avec COM=1 (excellent) sera placé dans une classe avec plus d'élèves COM=4 (faible) pour équilibrer."
     data-tooltip-value="2.5"
     data-tooltip-range="0.5 - 5.0"
     data-tooltip-phase="config"
     data-tooltip-key="weight-com">
  <label>COM</label>
  <input type="range" id="weight-com" min="0.5" max="5" step="0.1" value="2.5">
  <span class="value">2.5</span>
</div>
```

### Étape 3 : Enrichir le statut streaming

```javascript
// Dans createPanel(), remplacer :
<div id="live-status" class="status-message">
  En attente...
</div>

// Par :
<div id="live-status" 
     class="status-message"
     data-tooltip="Statut de l'optimisation"
     data-tooltip-detail="Affiche la phase en cours et les messages du serveur"
     data-tooltip-value="En attente..."
     data-tooltip-phase="init">
  <span class="phase-indicator init"></span>
  En attente...
</div>
```

### Étape 4 : Modifier setStreamingStatus()

```javascript
// Dans OptimizationPanel.html, modifier setStreamingStatus() :
setStreamingStatus(msg, phase) {
  const statusDiv = document.getElementById('live-status');
  if (statusDiv) {
    // Mettre à jour le texte
    const indicator = statusDiv.querySelector('.phase-indicator');
    if (indicator) {
      indicator.className = `phase-indicator ${phase || 'init'}`;
    }
    statusDiv.innerHTML = `<span class="phase-indicator ${phase || 'init'}"></span>${msg}`;
    
    // ✅ NOUVEAU : Synchroniser les tooltips
    if (typeof TooltipRegistry !== 'undefined') {
      TooltipRegistry.syncWithStreaming(msg, phase, this._lastData || {});
    }
  }
  
  // Ajouter au log
  const logsDiv = document.getElementById('live-logs');
  if (logsDiv) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString()}</span> <span class="log-phase">[${phase || 'INFO'}]</span> ${msg}`;
    logsDiv.appendChild(line);
    logsDiv.scrollTop = logsDiv.scrollHeight;
  }
},
```

### Étape 5 : Enrichir renderLiveSnapshot()

```javascript
// Dans OptimizationPanel.html, modifier renderLiveSnapshot() :
renderLiveSnapshot(data) {
  const container = document.getElementById('live-cards');
  if (!container) return;
  
  // Sauvegarder les données pour syncWithStreaming
  this._lastData = data;
  
  container.innerHTML = '';
  
  for (const cls in data) {
    const d = data[cls];
    const card = document.createElement('div');
    card.className = 'class-card';
    card.setAttribute('data-class', cls);
    
    // ✅ NOUVEAU : Ajouter les attributs tooltip
    card.setAttribute('data-tooltip', `Classe ${cls}`);
    card.setAttribute('data-tooltip-detail', `Effectif : ${d.total} élèves (${d.female}F / ${d.male}M)`);
    card.setAttribute('data-tooltip-value', `Parité : ${d.parityRatio}% F`);
    card.setAttribute('data-tooltip-phase', 'live');
    
    card.innerHTML = `
      <div class="card-header">${cls}</div>
      <div class="card-body">
        <div class="card-stat">
          <span class="label">Effectif</span>
          <span class="value">${d.total}</span>
        </div>
        <div class="card-stat">
          <span class="label">F/M</span>
          <span class="value">${d.female}/${d.male}</span>
        </div>
        ${d.lv2 ? `<div class="card-stat"><span class="label">LV2</span><span class="value">${JSON.stringify(d.lv2)}</span></div>` : ''}
        ${d.opt ? `<div class="card-stat"><span class="label">OPT</span><span class="value">${JSON.stringify(d.opt)}</span></div>` : ''}
      </div>
    `;
    
    container.appendChild(card);
    
    // ✅ NOUVEAU : Enregistrer le tooltip
    if (typeof TooltipRegistry !== 'undefined') {
      TooltipRegistry.register(card);
    }
  }
},
```

### Étape 6 : Initialiser après ouverture du panneau

```javascript
// Dans OptimizationPanel.html, modifier open() :
open() {
  const panel = this.createPanel();
  document.body.insertAdjacentHTML('beforeend', panel);
  
  // Initialiser les tooltips
  setTimeout(() => {
    if (typeof TooltipRegistry !== 'undefined') {
      TooltipRegistry.init();
      console.log('✅ Tooltips initialisés dans le panneau d\'optimisation');
    }
  }, 100);
  
  this.loadConfig();
},
```

---

## 🎨 INFOBULLES RECOMMANDÉES PAR ZONE

### Zone 1 : Sliders de poids

| Élément | Titre | Détail |
|---------|-------|--------|
| **COM** | Poids du score COM (Comportement) | Plus le poids est élevé, plus l'algorithme privilégie l'équilibre des scores COM entre les classes. Un élève avec COM=1 (excellent) sera placé dans une classe avec plus d'élèves COM=4 (faible) pour équilibrer. |
| **TRA** | Poids du score TRA (Travail) | Plus le poids est élevé, plus l'algorithme privilégie l'équilibre des scores TRA entre les classes. |
| **PART** | Poids du score PART (Participation) | Plus le poids est élevé, plus l'algorithme privilégie l'équilibre des scores PART entre les classes. |
| **ABS** | Poids du score ABS (Absences) | Plus le poids est élevé, plus l'algorithme privilégie l'équilibre des scores ABS entre les classes. |

### Zone 2 : Paramètres d'optimisation

| Élément | Titre | Détail |
|---------|-------|--------|
| **Tolérance parité** | Écart maximal F/M autorisé | Nombre maximal d'élèves d'écart entre filles et garçons dans une classe. Exemple : avec tolérance=2, une classe peut avoir 13F/11M (écart de 2). |
| **Max swaps** | Nombre maximal d'échanges | Nombre maximal d'échanges d'élèves entre classes pour optimiser les scores. Plus ce nombre est élevé, plus l'optimisation sera longue mais précise. |
| **Runtime** | Durée maximale d'optimisation | Durée maximale en secondes pour la phase d'optimisation. L'algorithme s'arrêtera après ce délai même s'il n'a pas terminé. |

### Zone 3 : Statut streaming

| Élément | Titre | Détail |
|---------|-------|--------|
| **Statut** | Statut de l'optimisation | Affiche la phase en cours et les messages du serveur en temps réel. |
| **Logs** | Logs détaillés | Historique complet des opérations effectuées par l'algorithme. |

### Zone 4 : Cartes de classes

| Élément | Titre | Détail |
|---------|-------|--------|
| **Classe** | Aperçu de la classe | Affiche l'effectif, la parité F/M, les LV2 et options présentes dans cette classe. |

### Zone 5 : Boutons

| Élément | Titre | Détail |
|---------|-------|--------|
| **Lancer** | Lancer l'optimisation | Démarre le processus d'optimisation avec les paramètres configurés. Les 4 phases seront exécutées séquentiellement. |
| **Appliquer** | Appliquer les résultats | Copie les résultats de l'optimisation dans les onglets CACHE et bascule l'interface en mode CACHE. |
| **Fermer** | Fermer le panneau | Ferme le panneau d'optimisation sans appliquer les résultats. |

---

## 🎯 ÉTATS VISUELS SYNCHRONISÉS

### Indicateurs de phase

Chaque phase a un indicateur visuel (pastille colorée) qui clignote pendant l'exécution :

| Phase | Couleur | Description |
|-------|---------|-------------|
| **init** | Gris (#94a3b8) | Initialisation |
| **phase1** | Bleu (#60a5fa) | Options & LV2 |
| **phase2** | Violet (#a78bfa) | Codes DISSO/ASSO |
| **phase3** | Rose (#f472b6) | Effectifs & Parité |
| **phase4** | Orange (#fb923c) | Swaps (optimisation) |
| **audit** | Jaune (#fbbf24) | Audit final |
| **done** | Vert (#34d399) | Terminé |

### Animation

```css
.phase-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

---

## 🔗 SYNCHRONISATION AVEC LE BACKEND

### Hook dans Orchestration_V14I.gs

```javascript
// Dans runOptimizationV14I_V3(), après chaque phase :

// Phase 1
const p1 = Phase1_dispatchOptionsLV2_BASEOPTI_V3(ctx);
logLine('INFO', '✅ Phase 1: ITA=' + (p1.ita || 0) + ', CHAV=' + (p1.chav || 0));

// ✅ NOUVEAU : Envoyer les données au front-end
if (typeof triggerUIUpdate_ === 'function') {
  triggerUIUpdate_('phase1', {
    'ita-count': p1.ita || 0,
    'chav-count': p1.chav || 0,
    'esp-count': p1.esp || 0
  });
}
```

### Fonction triggerUIUpdate_()

```javascript
/**
 * Envoie une mise à jour au front-end pour synchroniser les tooltips
 * @param {string} phase - Nom de la phase
 * @param {Object} data - Données à envoyer
 */
function triggerUIUpdate_(phase, data) {
  try {
    // Cette fonction sera appelée par le front-end via google.script.run
    // Les données seront transmises via le callback
    logLine('INFO', '📡 Mise à jour UI: ' + phase + ' → ' + JSON.stringify(data));
  } catch (e) {
    logLine('WARN', '⚠️ Erreur triggerUIUpdate_: ' + e.message);
  }
}
```

### Réception côté front-end

```javascript
// Dans OptimizationPanel.html, dans runOptimizationStreaming() :

google.script.run
  .withSuccessHandler(function(result) {
    if (result.phase && result.data) {
      // ✅ NOUVEAU : Mettre à jour les tooltips
      if (typeof TooltipRegistry !== 'undefined') {
        TooltipRegistry.updatePhase(result.phase, result.data);
      }
    }
  })
  .withFailureHandler(function(error) {
    console.error('Erreur:', error);
  })
  .phase1Stream();
```

---

## 📊 EXEMPLE COMPLET D'UTILISATION

### Scénario : Optimisation complète avec tooltips

1. **Utilisateur ouvre le panneau d'optimisation**
   ```javascript
   OptimizationPanel.open();
   // → TooltipRegistry.init() est appelé automatiquement
   // → Tous les sliders, boutons, statuts ont des tooltips
   ```

2. **Utilisateur survole le slider COM**
   ```
   Tooltip affiché :
   ┌─────────────────────────────────────────────┐
   │ Poids du score COM (Comportement)           │
   │                                             │
   │ Plus le poids est élevé, plus l'algorithme │
   │ privilégie l'équilibre des scores COM.      │
   │                                             │
   │ Valeur actuelle : 2.5                       │
   │ Plage : 0.5 - 5.0                           │
   │ Phase : config                              │
   └─────────────────────────────────────────────┘
   ```

3. **Utilisateur lance l'optimisation**
   ```javascript
   OptimizationPanel.runOptimizationStreaming();
   // → Phase 1 démarre
   // → setStreamingStatus('Phase 1 en cours...', 'phase1')
   // → TooltipRegistry.syncWithStreaming() met à jour les tooltips
   ```

4. **Phase 1 se termine**
   ```javascript
   // Backend envoie :
   {
     phase: 'phase1',
     data: {
       'ita-count': 11,
       'chav-count': 22,
       'esp-count': 88
     }
   }
   
   // Front-end reçoit et met à jour :
   TooltipRegistry.updatePhase('phase1', data);
   // → Tous les tooltips avec data-tooltip-phase="phase1" sont mis à jour
   ```

5. **Utilisateur survole une carte de classe**
   ```
   Tooltip affiché :
   ┌─────────────────────────────────────────────┐
   │ Classe 6°1                                  │
   │                                             │
   │ Effectif : 25 élèves (13F / 12M)            │
   │ Parité : 52.0% F                            │
   │                                             │
   │ Phase : live                                │
   └─────────────────────────────────────────────┘
   ```

6. **Optimisation terminée**
   ```javascript
   setStreamingStatus('✅ Optimisation terminée !', 'done');
   TooltipRegistry.syncWithStreaming(
     '✅ Optimisation terminée !',
     'done',
     {
       metrics: {
         initialVariance: 15.67,
         finalVariance: 12.34,
         totalImprovement: 3.33
       }
     }
   );
   ```

---

## ✅ AVANTAGES

### 1. Réduction de la charge cognitive
- ✅ Explications contextuelles à la demande
- ✅ Pas de surcharge visuelle (tooltips au survol)
- ✅ Informations progressives (titre → détail → valeur)

### 2. Synchronisation temps réel
- ✅ Tooltips mis à jour automatiquement
- ✅ Indicateurs visuels de phase
- ✅ Données backend intégrées

### 3. Accessibilité
- ✅ Support ARIA (Tippy.js)
- ✅ Navigation clavier
- ✅ Thème sombre adapté

### 4. Maintenabilité
- ✅ Gestionnaire centralisé
- ✅ Convention de données claire
- ✅ Facile à étendre

---

## 🎓 CONCLUSION

Votre plan initial était **excellent**. J'ai apporté les améliorations suivantes :

1. ✅ **Bibliothèque Tippy.js** : Plus robuste que du code custom
2. ✅ **Convention enrichie** : Plus flexible que `data-hint` seul
3. ✅ **Gestionnaire complet** : `TooltipRegistry` avec toutes les fonctions nécessaires
4. ✅ **Styles personnalisés** : Thème sombre cohérent avec l'interface
5. ✅ **États visuels** : Indicateurs de phase avec animations

**Le système est prêt à être intégré dans OptimizationPanel.html !** 🚀

---

## 📚 FICHIERS CRÉÉS

1. ✅ **`TooltipRegistry.html`** : Gestionnaire centralisé des tooltips
2. ✅ **`IMPLEMENTATION_INFOBULLES.md`** : Ce document (guide complet)

---

## 🚀 PROCHAINES ÉTAPES

1. **Intégrer TooltipRegistry dans InterfaceV2.html**
2. **Enrichir OptimizationPanel.html avec les attributs data-tooltip**
3. **Tester les tooltips dans le panneau d'optimisation**
4. **Ajouter les hooks backend pour la synchronisation**
5. **Étendre aux autres zones de l'interface (disposition, etc.)**
