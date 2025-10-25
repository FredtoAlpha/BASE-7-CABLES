# 🎥 VIEWER LIVE INTÉGRÉ - PRÊT !

## ✅ Ce Qui a Été Ajouté

### Backend (Apps Script)

**Nouvelle fonction `getCacheSnapshot(opts)`** dans `Orchestration_V14I_Stream.gs`:
```javascript
// Retourne un snapshot JSON des classes …CACHE
{
  classes: {
    "6°1": {
      total: 25,
      F: 13,
      M: 12,
      LV2: { ITA: 6 },
      OPT: {},
      rows: [
        { nom: "Dupont", prenom: "Jean", lv2: "ITA", opt: "", a: "A3", d: "" },
        // ... 10 premières lignes
      ]
    },
    "6°2": { ... },
    ...
  },
  audit: { ... } // optionnel
}
```

**Amélioration `openCacheTabsStream(opts)`**:
- ✅ `sh.showSheet()` - Affiche l'onglet
- ✅ `ss.setActiveSheet(sh)` - Active visuellement
- ✅ `SpreadsheetApp.flush()` - Force le rendu
- ✅ `Utilities.sleep(200)` - Laisse respirer

### Frontend (OptimizationPanel.html)

**Nouveau bloc UI "Aperçu live des …CACHE"**:
```html
<div id="live-view" class="mt-4 hidden">
  <div class="text-sm font-semibold text-gray-700 mb-2">
    <i class="fas fa-eye mr-2"></i>Aperçu live des …CACHE
  </div>
  <div id="live-cards" class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto"></div>
</div>
```

**Nouvelles fonctions JS**:
- ✅ `renderLiveSnapshot(snap)` - Affiche les cartes par classe
- ✅ `refreshLiveSnapshot(ctx)` - Appelle le serveur et rafraîchit

**Intégration dans `runOptimizationStreaming()`**:
```javascript
// Après CHAQUE phase:
await tick(200);
await refreshLiveSnapshot(ctx);
```

## 🎬 Ce Que Vous Allez Voir Maintenant

### Dans le Panneau "Aperçu live des …CACHE"

**Après ouverture (Étape 0)**:
```
6°1 (0 élèves, 0F/0M)
LV2: — | OPT: —

6°2 (0 élèves, 0F/0M)
LV2: — | OPT: —

...
```

**Après Phase 1**:
```
6°1 (25 élèves, 13F/12M)
LV2: ITA=6 | OPT: —
• Dupont Jean — LV2:ITA OPT:— A:A3 D:—
• Martin Sophie — LV2:ITA OPT:— A:A3 D:—
• Bernard Luc — LV2:ITA OPT:— A:A5 D:—
...

6°3 (25 élèves, 12F/13M)
LV2: — | OPT: CHAV=10
• Lefebvre Marie — LV2:— OPT:CHAV A:A4 D:—
• Moreau Pierre — LV2:— OPT:CHAV A:A4 D:—
...
```

**Après Phase 2**:
```
6°1 (25 élèves, 13F/12M)
LV2: ITA=6 | OPT: —
• Dupont Jean — LV2:ITA OPT:— A:A3 D:—
• Martin Sophie — LV2:ITA OPT:— A:A3 D:—
• Nouveau Élève — LV2:— OPT:— A:A3 D:—  ← Arrivé via ASSO
...
```

**Après Phase 3**:
```
6°1 (25 élèves, 13F/12M)  ← Effectifs équilibrés
LV2: ITA=6 | OPT: —
...
```

**Après Phase 4**:
```
6°1 (25 élèves, 13F/12M)
LV2: ITA=6 | OPT: —
• Dupont Jean — LV2:ITA OPT:— A:A3 D:—  ← Peut avoir swappé
...
```

## 📊 Différence Avant/Après

### Avant (Juste des Logs)
```
Mode Direct Live
✅ Terminé en 58.21s !
19:41:51 - 📂 Ouverture des onglets CACHE…
19:41:58 - 📌 Phase 1/4 — Options & LV2…
19:42:13 - ✅ Phase 1: ITA=6, CHAV=10
...

❌ Aucune visualisation des données
❌ Aucune idée de ce qui se passe réellement
❌ Obligation d'aller chercher les onglets CACHE manuellement
```

### Après (Avec Viewer Live)
```
Mode Direct Live
✅ Terminé en 58.21s !
19:41:51 - 📂 Ouverture des onglets CACHE…
19:41:58 - 📌 Phase 1/4 — Options & LV2…
19:42:13 - ✅ Phase 1: ITA=6, CHAV=10

Aperçu live des …CACHE
┌─────────────────────────────────────────┐
│ 6°1 (25 élèves, 13F/12M)                │
│ LV2: ITA=6 | OPT: —                     │
│ • Dupont Jean — LV2:ITA OPT:— A:A3 D:—  │
│ • Martin Sophie — LV2:ITA OPT:— A:A3... │
│ ...                                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 6°3 (25 élèves, 12F/13M)                │
│ LV2: — | OPT: CHAV=10                   │
│ • Lefebvre Marie — LV2:— OPT:CHAV A:... │
│ ...                                      │
└─────────────────────────────────────────┘

✅ Visualisation en temps réel
✅ Vous voyez les ITA aller dans 6°1
✅ Vous voyez les CHAV aller dans 6°3
✅ Vous voyez les élèves bouger entre phases
```

## 🎯 Test Immédiat

### 1. Recharger Google Sheets
```
Appuyer sur F5
Attendre le chargement complet
```

### 2. Ouvrir le panneau
```
Menu > Optimisation Automatique
```

### 3. Lancer l'optimisation
```
Cliquer sur "Lancer l'optimisation (Live)"
```

### 4. Observer le viewer live
```
Regarder le bloc "Aperçu live des …CACHE"
Les cartes vont se mettre à jour après chaque phase:
- Étape 0: Cartes vides (0 élèves)
- Phase 1: ITA dans 6°1, CHAV dans 6°3
- Phase 2: Codes A/D bougent
- Phase 3: Effectifs se complètent
- Phase 4: Swaps s'appliquent
```

## 🔍 Vérification des Contraintes

**Le viewer affiche maintenant**:
- ✅ **Effectifs par classe**: Total, F/M
- ✅ **LV2 réalisées**: ITA=6, CHAV=10, etc.
- ✅ **OPT réalisées**: CHAV=10, etc.
- ✅ **Aperçu élèves**: 10 premières lignes avec LV2, OPT, A, D

**Vous pourrez vérifier**:
- ✅ Les ITA vont bien dans 6°1 (pas dans 6°4/6°5)
- ✅ Les CHAV vont bien dans 6°3 (pas ailleurs)
- ✅ Les quotas sont respectés (ITA=6, CHAV=10)
- ✅ Les groupes A/D sont cohérents

## 🐛 Dépannage

### Le viewer ne s'affiche pas
**Symptôme**: Le bloc "Aperçu live des …CACHE" reste caché
**Solution**:
1. Ouvrir la console (F12)
2. Chercher les erreurs `getCacheSnapshot`
3. Vérifier que la fonction existe dans Apps Script

### Les cartes restent vides
**Symptôme**: Les cartes affichent "0 élèves" même après Phase 1
**Solution**:
1. Vérifier les logs Apps Script (Exécutions > Logs)
2. Chercher "Phase 1I stats"
3. Vérifier que les onglets CACHE sont bien écrits

### Erreur "Cannot read property 'map' of undefined"
**Symptôme**: Erreur dans la console
**Solution**:
1. Le contexte `ctx` n'a pas les bons niveaux
2. Vérifier que `openInfo.opened` contient bien les noms
3. Ajouter un `console.log('ctx:', ctx)` pour débugger

## 📋 Checklist Finale

- [ ] Recharger Google Sheets (F5)
- [ ] Ouvrir le panneau "Optimisation Automatique"
- [ ] Cliquer sur "Lancer l'optimisation (Live)"
- [ ] Observer le bloc "Aperçu live des …CACHE" apparaître
- [ ] Vérifier que les cartes se mettent à jour après chaque phase
- [ ] Vérifier que 6°1 a ITA=6 après Phase 1
- [ ] Vérifier que 6°3 a CHAV=10 après Phase 1
- [ ] Vérifier que 6°4 et 6°5 n'ont PAS d'ITA

## 🎉 Résultat Final

**Vous voyez maintenant**:
- ✅ Les onglets CACHE s'ouvrir dans Sheets (si vous êtes sur l'onglet)
- ✅ Les données apparaître dans le panneau en temps réel
- ✅ Les ITA aller dans 6°1 (pas ailleurs)
- ✅ Les CHAV aller dans 6°3 (pas ailleurs)
- ✅ Les élèves bouger entre phases
- ✅ Les effectifs s'équilibrer
- ✅ Les swaps s'appliquer

**Plus besoin d'aller chercher les onglets CACHE manuellement !**

**Le viewer live affiche tout dans le panneau !** 🎥✨

---

## 📚 Fichiers Modifiés

- `Orchestration_V14I_Stream.gs` - Ajout de `getCacheSnapshot()`
- `OptimizationPanel.html` - Ajout du viewer live + `refreshLiveSnapshot()`
- 55 fichiers déployés avec `clasp push`

**Tout est prêt ! Testez maintenant !** 🚀
