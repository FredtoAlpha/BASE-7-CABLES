# 🎨 Design Moderne - Assistant d'Optimisation en 4 Phases

## 🎯 Objectif

Transformer le panneau d'optimisation actuel (600px, onglets horizontaux) en un **assistant guidé moderne** (900px, navigation latérale) pour faciliter l'utilisation par un admin novice.

---

## 📐 Layout Principal

### Structure Flex Horizontale

```
┌─────────────────────────────────────────────────────────┐
│  [Navigation Latérale]  │  [Contenu Principal]          │
│       (w-1/4)           │       (w-3/4)                  │
│       250px             │       650px                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Navigation Latérale (Gauche - 250px)

### Header
- **Icône** : Gradient circle avec icône magic
- **Titre** : "Assistant d'Optimisation"
- **Sous-titre** : "Guidé en 4 étapes"

### Liste des Phases (Verticale)

```
┌──────────────────────────┐
│ ✓ Phase 1: Structure     │ ← Validée (vert)
├──────────────────────────┤
│ → Phase 2: Options       │ ← Active (bleu)
├──────────────────────────┤
│   Phase 3: Contraintes   │ ← À venir (gris)
├──────────────────────────┤
│   Phase 4: Lancement     │ ← À venir (gris)
└──────────────────────────┘
```

### États Visuels

| État | Icône | Couleur | Border |
|------|-------|---------|--------|
| **Validée** | ✓ check-circle | Vert | border-green-500 |
| **Active** | → arrow-right | Bleu | border-blue-500 bg-blue-50 |
| **À venir** | ○ circle | Gris | border-gray-300 |
| **Erreur** | ⚠ exclamation | Rouge | border-red-500 |

### Barre de Progression Verticale
- Ligne verticale connectant les phases
- Segments colorés selon l'état

---

## 📄 Contenu Principal (Droite - 650px)

### Header Contextuel
```html
<div class="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg mb-6">
  <h3 class="text-xl font-bold">Phase X: [Titre]</h3>
  <p class="text-sm text-gray-600">[Description de l'étape]</p>
  <div class="mt-2 flex items-center gap-2">
    <div class="flex-1 h-2 bg-gray-200 rounded-full">
      <div class="h-2 bg-blue-500 rounded-full" style="width: X%"></div>
    </div>
    <span class="text-xs font-medium">X/4</span>
  </div>
</div>
```

### Zone de Contenu
- **Hauteur** : `calc(100vh - 200px)`
- **Overflow** : `overflow-y-auto`
- **Padding** : `p-6`

### Footer avec Actions
```html
<div class="border-t bg-white p-4 flex justify-between">
  <button class="btn-secondary">← Précédent</button>
  <button class="btn-primary">Suivant →</button>
</div>
```

---

## 🔢 Les 4 Phases

### Phase 1: Structure & Effectifs

**Objectif** : Définir la structure de base

**Contenu** :
- 📊 Total élèves (lecture seule, grand, coloré)
- 🏫 Nombre de classes (slider + input)
- 🎯 Répartition cible (cards avec effectifs)
- ⚙️ Mode de travail (select avec icônes)

**Validation** :
- Total élèves > 0
- Nombre de classes entre 2 et 10
- Répartition calculée

**CTA** : "Valider la structure →"

---

### Phase 2: Options & LV2

**Objectif** : Configurer les quotas d'options

**Contenu** :
1. **Détection automatique** (bouton primaire)
2. **Stats détectées** (badges colorés avec compteurs)
3. **Distribution automatique** (bouton magic)
4. **Table de configuration** (grid responsive)
   - Colonnes : Classe | Option1 | Option2 | ... | Total
   - Inputs avec validation temps réel

**Validation** :
- Au moins 1 option détectée
- Quotas cohérents (somme = total)

**CTA** : "Valider les options →"

---

### Phase 3: Contraintes

**Objectif** : Activer/désactiver les règles

**Contenu** :
- **Cards avec toggles** (4 contraintes)
  - Dissociations (rouge)
  - Associations (vert)
  - Mobilité (violet)
  - Options/LV2 (jaune)

**Layout** : Grid 2x2 sur desktop, 1 col sur mobile

**Validation** : Aucune (optionnel)

**CTA** : "Configurer les scores →"

---

### Phase 4: Lancement & Résultats

**Objectif** : Ajuster les poids et lancer

**Contenu** :

#### Sous-onglets (tabs horizontaux)
1. **Scores** : Sliders pour poids (COM, TRA, PART, ABS)
2. **Paramètres** : Max swaps, durée, tolérance parité
3. **Résultats** : Logs live + aperçu CACHE

#### Layout Résultats
```
┌─────────────────────────────────────┐
│  [Statut Live]                      │
├─────────────────────────────────────┤
│  [Logs] (scrollable)                │
├─────────────────────────────────────┤
│  [Aperçu Classes] (grid 2 cols)     │
└─────────────────────────────────────┘
```

**CTA** : "🚀 Lancer l'optimisation"

---

## 🎨 Palette de Couleurs

| Élément | Couleur |
|---------|---------|
| **Navigation bg** | bg-gray-50 |
| **Phase active** | bg-blue-50 border-blue-500 |
| **Phase validée** | text-green-600 |
| **Header gradient** | from-purple-50 to-indigo-50 |
| **Bouton primaire** | bg-blue-600 hover:bg-blue-700 |
| **Bouton succès** | bg-green-600 hover:bg-green-700 |

---

## 🔄 Navigation & État

### Objet de Configuration

```javascript
const PHASES = {
  structure: {
    id: 1,
    title: 'Structure & Effectifs',
    icon: 'fa-sitemap',
    description: 'Définissez le nombre de classes et la répartition cible',
    validate: () => validateStructure(),
    nextPhase: 'options'
  },
  options: {
    id: 2,
    title: 'Options & LV2',
    icon: 'fa-graduation-cap',
    description: 'Configurez les quotas d\'options par classe',
    validate: () => validateOptions(),
    nextPhase: 'constraints',
    prevPhase: 'structure'
  },
  constraints: {
    id: 3,
    title: 'Contraintes',
    icon: 'fa-shield-alt',
    description: 'Activez les règles de répartition',
    validate: () => true, // Optionnel
    nextPhase: 'launch',
    prevPhase: 'options'
  },
  launch: {
    id: 4,
    title: 'Lancement & Résultats',
    icon: 'fa-rocket',
    description: 'Ajustez les paramètres et lancez l\'optimisation',
    validate: () => true,
    prevPhase: 'constraints'
  }
};
```

### État Global

```javascript
this.wizardState = {
  currentPhase: 'structure',
  validatedPhases: [], // ['structure', 'options']
  canProceed: false,
  data: {
    structure: {},
    options: {},
    constraints: {},
    scores: {}
  }
};
```

---

## 📱 Responsive

| Breakpoint | Layout |
|------------|--------|
| **Desktop (>1024px)** | Flex horizontal (250px + 650px) |
| **Tablet (768-1024px)** | Navigation collapsible |
| **Mobile (<768px)** | Stack vertical, navigation en drawer |

---

## ✨ Animations

1. **Transition de phase** : Fade + slide
2. **Validation** : Checkmark bounce
3. **Erreur** : Shake + border rouge
4. **Progression** : Barre qui se remplit

---

## 🚀 Implémentation

### Étapes

1. ✅ Modifier `createPanel()` pour layout flex
2. ⏳ Créer composant `NavigationSidebar`
3. ⏳ Créer composant `PhaseContent`
4. ⏳ Implémenter logique de navigation
5. ⏳ Migrer contenu des onglets vers phases
6. ⏳ Ajouter animations
7. ⏳ Tester & déployer

---

**Prêt à implémenter?** 🎨✨
