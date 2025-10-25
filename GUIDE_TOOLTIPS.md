# 📖 GUIDE DES TOOLTIPS (INFOBULLES)

## Qu'est-ce qu'un tooltip ?

Un **tooltip** (infobulle en français) est une petite fenêtre qui apparaît quand vous **passez la souris** sur un élément de l'interface.

---

## 🎯 OÙ VOIR LES TOOLTIPS ?

### 1. Sur les boutons d'action

**Passez la souris sur** :
- ✅ Bouton "Optimiser" → Affiche "Lancer l'optimisation automatique"
- ✅ Bouton "Sauvegarder" → Affiche "Enregistrer les modifications"
- ✅ Bouton "Annuler" → Affiche "Annuler la dernière action"
- ✅ Bouton "Refaire" → Affiche "Refaire l'action annulée"

### 2. Sur les badges de mobilité

**Passez la souris sur** :
- ✅ Badge **FIXE** → Affiche "Élève bloqué dans sa classe (option unique)"
- ✅ Badge **PERMUT** → Affiche "Peut permuter avec un autre élève (2 classes possibles)"
- ✅ Badge **CONDI** → Affiche "Peut bouger sous conditions (contraintes D/A)"
- ✅ Badge **LIBRE** → Affiche "Peut aller dans n'importe quelle classe"

### 3. Sur les indicateurs de phase

**Passez la souris sur** :
- ✅ Phase 1 → Affiche "Répartition LV2/Options"
- ✅ Phase 2 → Affiche "Dissociations/Associations"
- ✅ Phase 3 → Affiche "Équilibrage effectifs et parité"
- ✅ Phase 4 → Affiche "Optimisation par swaps"

### 4. Sur les codes D et A

**Passez la souris sur** :
- ✅ Code **D2** → Affiche "Dissociation : Ne peut pas être avec un autre D2"
- ✅ Code **A5** → Affiche "Association : Doit rester avec le groupe A5"

---

## 🔍 COMMENT UTILISER LES TOOLTIPS ?

### Étape 1 : Passer la souris
1. **Déplacez votre souris** sur un élément (bouton, badge, etc.)
2. **Attendez 0.5 seconde** (délai d'apparition)
3. **Le tooltip apparaît** automatiquement

### Étape 2 : Lire l'information
- Le tooltip affiche une **description courte** de l'élément
- Il peut contenir des **icônes** pour clarifier
- Il peut afficher des **données dynamiques** (ex: nombre de swaps)

### Étape 3 : Fermer le tooltip
- **Déplacez la souris** ailleurs
- Le tooltip **disparaît automatiquement**

---

## 🎨 APPARENCE DES TOOLTIPS

### Design
```
┌─────────────────────────────────────┐
│ 💡 Lancer l'optimisation automatique│
└─────────────────────────────────────┘
```

### Caractéristiques
- ✅ Fond sombre avec texte blanc
- ✅ Bordure arrondie
- ✅ Ombre portée pour le relief
- ✅ Animation d'apparition fluide
- ✅ Positionnement intelligent (évite les bords de l'écran)

---

## 📊 TOOLTIPS DANS LE MODULE ANALYTIQUE

### Sur les métriques
**Passez la souris sur** :
- ✅ "Variance effectifs" → Affiche "Plus c'est bas, mieux c'est"
- ✅ "Parité F/M" → Affiche "Pourcentage de filles dans l'établissement"
- ✅ "Quotas" → Affiche "Respect des limites LV2/Options"

### Sur les zones de risque
**Passez la souris sur** :
- ✅ Badge **HIGH** → Affiche "Risque élevé : action immédiate requise"
- ✅ Badge **MEDIUM** → Affiche "Risque moyen : surveillance recommandée"

---

## 🔧 CONFIGURATION TECHNIQUE

### Bibliothèque utilisée
- **Tippy.js** : Bibliothèque moderne de tooltips
- **Version** : Latest (CDN)
- **Documentation** : https://atomiks.github.io/tippyjs/

### Fichier de configuration
- **`TooltipRegistry.html`** : Gestionnaire centralisé des tooltips
- **Initialisation** : Automatique au chargement de la page

### Paramètres par défaut
```javascript
{
  theme: 'dark',              // Thème sombre
  placement: 'top',           // Position au-dessus de l'élément
  arrow: true,                // Flèche pointant vers l'élément
  delay: [500, 0],            // Délai d'apparition : 500ms
  duration: [200, 150],       // Durée d'animation
  animation: 'shift-away',    // Animation d'apparition
  maxWidth: 300               // Largeur maximale
}
```

---

## 🎯 EXEMPLES D'UTILISATION

### Exemple 1 : Bouton avec tooltip simple
```html
<button data-tooltip="Lancer l'optimisation">
  Optimiser
</button>
```

**Résultat** : Quand vous passez la souris sur le bouton, le tooltip "Lancer l'optimisation" apparaît.

### Exemple 2 : Badge avec tooltip détaillé
```html
<span class="badge-fixe" data-tooltip="Élève FIXE : Une seule classe possible">
  FIXE
</span>
```

**Résultat** : Quand vous passez la souris sur le badge, le tooltip explique ce qu'est un élève FIXE.

### Exemple 3 : Icône avec tooltip
```html
<i class="fas fa-info-circle" data-tooltip="Plus d'informations sur cette fonctionnalité"></i>
```

**Résultat** : Quand vous passez la souris sur l'icône, le tooltip donne plus d'informations.

---

## 🐛 DÉPANNAGE

### Problème : Les tooltips ne s'affichent pas

**Causes possibles** :
1. ❌ `TooltipRegistry.html` n'est pas inclus dans `InterfaceV2.html`
2. ❌ La bibliothèque Tippy.js n'est pas chargée
3. ❌ L'attribut `data-tooltip` est manquant
4. ❌ JavaScript est désactivé dans le navigateur

**Solutions** :
1. ✅ Vérifier que `<?!= include('TooltipRegistry'); ?>` est présent dans `InterfaceV2.html`
2. ✅ Vérifier que le CDN Tippy.js est accessible
3. ✅ Ajouter l'attribut `data-tooltip="..."` sur l'élément
4. ✅ Activer JavaScript dans le navigateur

### Problème : Les tooltips s'affichent au mauvais endroit

**Cause** : Conflit de positionnement avec d'autres éléments

**Solution** : Utiliser l'attribut `data-tooltip-placement` :
```html
<button data-tooltip="Mon tooltip" data-tooltip-placement="bottom">
  Bouton
</button>
```

Valeurs possibles : `top`, `bottom`, `left`, `right`, `auto`

---

## 📝 BONNES PRATIQUES

### ✅ À FAIRE

1. **Texte court et clair** : Maximum 1-2 lignes
2. **Informations utiles** : Expliquer ce que fait l'élément
3. **Cohérence** : Utiliser le même style partout
4. **Accessibilité** : Les tooltips ne doivent pas être la seule source d'information

### ❌ À ÉVITER

1. **Texte trop long** : Éviter les paragraphes
2. **Informations évidentes** : Ne pas répéter le texte du bouton
3. **Tooltips partout** : Seulement sur les éléments qui en ont besoin
4. **Informations critiques** : Ne pas mettre d'infos essentielles uniquement dans un tooltip

---

## 🎓 EXEMPLES DANS L'INTERFACE

### Dans l'interface de répartition

```
┌─────────────────────────────────────────────────────────┐
│ [Optimiser] [Sauvegarder] [Annuler] [Refaire]          │
│     ↑           ↑            ↑         ↑                │
│  Tooltip 1   Tooltip 2   Tooltip 3  Tooltip 4          │
└─────────────────────────────────────────────────────────┘

Tooltip 1: "Lancer l'optimisation automatique"
Tooltip 2: "Enregistrer les modifications dans Google Sheets"
Tooltip 3: "Annuler la dernière action (Ctrl+Z)"
Tooltip 4: "Refaire l'action annulée (Ctrl+Y)"
```

### Sur une carte élève

```
┌────────────────────────────┐
│ DUPONT Jean                │
│ [FIXE] [D2] [ITA]         │
│   ↑     ↑     ↑           │
│   T1    T2    T3          │
└────────────────────────────┘

T1: "Élève FIXE : Une seule classe possible"
T2: "Dissociation D2 : Ne peut pas être avec un autre D2"
T3: "LV2 Italien : Classe limitée aux quotas ITA"
```

---

## 🚀 FONCTIONNALITÉS AVANCÉES

### Tooltips dynamiques

Les tooltips peuvent afficher des **données en temps réel** :

```javascript
// Exemple : Tooltip avec nombre de swaps
const button = document.getElementById('btnOptimize');
button.setAttribute('data-tooltip', `Lancer l'optimisation (${nbSwaps} swaps max)`);
```

### Tooltips avec HTML

Les tooltips peuvent contenir du **HTML formaté** :

```javascript
// Exemple : Tooltip avec liste
const tooltip = `
  <strong>Options disponibles :</strong>
  <ul>
    <li>ITA : 3 places</li>
    <li>ALL : 5 places</li>
    <li>ESP : Illimité</li>
  </ul>
`;
element.setAttribute('data-tooltip', tooltip);
```

---

## 📊 STATISTIQUES D'UTILISATION

### Éléments avec tooltips dans l'interface

- ✅ **Boutons d'action** : ~15 tooltips
- ✅ **Badges de mobilité** : ~4 tooltips (FIXE, PERMUT, CONDI, LIBRE)
- ✅ **Codes D/A** : ~2 tooltips
- ✅ **Indicateurs de phase** : ~4 tooltips
- ✅ **Métriques analytiques** : ~8 tooltips
- ✅ **Icônes d'aide** : ~10 tooltips

**Total** : ~43 tooltips dans l'interface

---

## ✅ RÉSUMÉ

### Qu'est-ce qu'un tooltip ?
Une **petite fenêtre d'aide** qui apparaît quand vous passez la souris sur un élément.

### Comment les voir ?
1. **Passez la souris** sur un bouton, badge ou icône
2. **Attendez 0.5 seconde**
3. **Le tooltip apparaît** automatiquement

### Où les trouver ?
- ✅ Boutons d'action (Optimiser, Sauvegarder, etc.)
- ✅ Badges de mobilité (FIXE, PERMUT, CONDI, LIBRE)
- ✅ Codes D/A (Dissociation, Association)
- ✅ Indicateurs de phase (Phase 1, 2, 3, 4)
- ✅ Métriques analytiques (Variance, Parité, Quotas)

### Pourquoi c'est utile ?
- ✅ **Aide contextuelle** : Explique ce que fait chaque élément
- ✅ **Apprentissage** : Comprendre l'interface sans documentation
- ✅ **Efficacité** : Informations rapides sans cliquer

**Les tooltips sont là pour vous aider ! Passez la souris partout pour découvrir les fonctionnalités cachées.** 💡
