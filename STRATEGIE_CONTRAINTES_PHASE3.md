# 🎯 STRATÉGIE - Contraintes Phase 3 (Câblage Futur)

## 📋 Contexte

Les 4 contraintes de Phase 3 sont actuellement **TOUJOURS ACTIVES** (hard-codées dans le backend).
L'objectif est de permettre aux admins de les **activer/désactiver** selon leurs besoins pédagogiques.

---

## 🔍 Analyse des Contraintes

### 1. **Options/LV2** 🎓

**Nature**: ⚠️ **OBLIGATION RÉGLEMENTAIRE**

**Description**: Les élèves doivent être placés dans des classes proposant leur option/LV2

**Statut Recommandé**: 
- ✅ **TOUJOURS ACTIF** (non désactivable)
- 🔒 **Masquer le toggle** ou le désactiver

**Raison**: 
- Impossible de placer un élève ITA dans une classe sans ITA
- Violation des quotas → répartition invalide

---

### 2. **Dissociations (Code D)** 🚫

**Nature**: ⚠️ **PÉDAGOGIQUE CRITIQUE**

**Description**: Séparer les élèves avec même code D dans des classes différentes

**Cas d'Usage**:
- Élèves en conflit
- Frères/sœurs à séparer
- Problèmes comportementaux

**Statut Recommandé**: 
- ⚠️ **DÉSACTIVABLE** (avec warning fort)
- 🎯 **Cas d'usage**: Profs qui veulent ignorer certains codes D

**Warning à Afficher**:
```
⚠️ ATTENTION: Désactiver les dissociations peut placer des élèves 
en conflit dans la même classe. Êtes-vous sûr?
```

**Implémentation Backend**:
```javascript
function applyDisso_(classesState, ctx) {
  if (ctx.constraints?.dissociations === false) {
    logLine('WARNING', '⚠️ Dissociations désactivées par l\'utilisateur');
    return 0;
  }
  // Code existant...
}
```

---

### 3. **Associations (Code A)** 👥

**Nature**: ⚠️ **PÉDAGOGIQUE CRITIQUE**

**Description**: Regrouper les élèves avec même code A dans la même classe

**Cas d'Usage**:
- Groupes d'amis
- Élèves à besoins spécifiques
- Binômes pédagogiques

**Statut Recommandé**: 
- ⚠️ **DÉSACTIVABLE** (avec warning fort)
- 🎯 **Cas d'usage**: Profs qui veulent casser certains groupes

**Warning à Afficher**:
```
⚠️ ATTENTION: Désactiver les associations peut séparer des groupes 
d'élèves qui doivent rester ensemble. Êtes-vous sûr?
```

**Implémentation Backend**:
```javascript
function applyAsso_(classesState, ctx) {
  if (ctx.constraints?.associations === false) {
    logLine('WARNING', '⚠️ Associations désactivées par l\'utilisateur');
    return 0;
  }
  // Code existant...
}
```

---

### 4. **Mobilité (FIXE/SPEC)** 🔒

**Nature**: ⚠️ **COMPLEXE** (lié aux codes D/A ET aux options)

**Description**: Ne pas déplacer les élèves FIXE et SPEC

**Problème Identifié**:
> "Si on coche LV2 et options, il y a des fixes... 
> La mobilité c'est encore une fois les codes D et A..."

**Analyse**:
- **FIXE** = Élève qui ne doit PAS bouger (déjà bien placé)
- **SPEC** = Élève avec besoins spécifiques (placement manuel)
- **Conflit**: Si FIXE a un code D/A, que faire?

**Cas Problématiques**:

| Situation | Mobilité ON | Mobilité OFF |
|-----------|-------------|--------------|
| FIXE avec code D | ❌ Reste → Violation D | ✅ Bouge → Respecte D |
| FIXE avec option manquante | ❌ Reste → Pas d'option | ✅ Bouge → A son option |
| SPEC avec code A | ❌ Reste → Groupe séparé | ✅ Bouge → Groupe réuni |

**Statut Recommandé**: 
- ⚠️ **DÉSACTIVABLE** (avec warning + explication)
- 🎯 **Cas d'usage**: Quand FIXE/SPEC ont des codes D/A conflictuels

**Warning à Afficher**:
```
⚠️ ATTENTION: Désactiver la mobilité permet de déplacer les élèves 
FIXE/SPEC pour respecter les codes D/A et les options. 

Cela peut être nécessaire si:
- Un élève FIXE a un code D conflictuel
- Un élève FIXE n'a pas son option dans sa classe actuelle
- Un élève SPEC doit rejoindre son groupe (code A)

Continuer?
```

**Implémentation Backend**:
```javascript
function canMoveStudent(student, ctx) {
  const mobilite = String(student.MOBILITE || '').toUpperCase();
  
  // Si mobilité désactivée, tout le monde peut bouger
  if (ctx.constraints?.mobilite === false) {
    return true;
  }
  
  // Si mobilité activée, respecter FIXE/SPEC
  if (mobilite === 'FIXE' || mobilite === 'SPEC') {
    return false;
  }
  
  return true;
}
```

---

## 🎯 Stratégie de Câblage

### Phase 1: Options/LV2 (Immédiat)

**Action**: 
- ✅ Masquer le toggle (toujours actif)
- ✅ Ajouter texte: "Toujours actif (obligation réglementaire)"

**Code**:
```html
<div class="bg-yellow-50 p-4 rounded opacity-60">
  <div class="flex justify-between items-center mb-2">
    <label class="font-bold">
      <i class="fas fa-graduation-cap text-yellow-600 mr-2"></i>Respecter les options/LV2
    </label>
    <span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-semibold">
      TOUJOURS ACTIF
    </span>
  </div>
  <p class="text-xs text-gray-600">Obligation réglementaire - Non désactivable</p>
</div>
```

---

### Phase 2: Dissociations + Associations (Court terme)

**Action**:
- ✅ Câbler les toggles
- ✅ Ajouter warnings
- ✅ Modifier backend

**Frontend** (OptimizationPanel.html):
```javascript
// Ligne 1625
constraints: {
  dissociations: document.getElementById('constraintDisso')?.checked ?? true,
  associations: document.getElementById('constraintAsso')?.checked ?? true,
  mobilite: true,  // Toujours actif pour l'instant
  options: true    // Toujours actif
}
```

**Backend** (Phases_BASEOPTI_V3_COMPLETE.gs):
```javascript
function applyDisso_(classesState, ctx) {
  if (ctx.constraints?.dissociations === false) {
    logLine('WARNING', '⚠️ Dissociations désactivées - Risque de conflits');
    return 0;
  }
  // Code existant...
}

function applyAsso_(classesState, ctx) {
  if (ctx.constraints?.associations === false) {
    logLine('WARNING', '⚠️ Associations désactivées - Groupes séparés');
    return 0;
  }
  // Code existant...
}
```

---

### Phase 3: Mobilité (Moyen terme)

**Action**:
- ⚠️ Câbler avec logique complexe
- ⚠️ Gérer les conflits FIXE + codes D/A
- ⚠️ Ajouter modal d'explication

**Logique Recommandée**:
```javascript
// Priorité des contraintes:
// 1. Options/LV2 (TOUJOURS)
// 2. Codes D/A (si activés)
// 3. Mobilité (si activée)

if (mobiliteActive && student.MOBILITE === 'FIXE') {
  // Vérifier si FIXE a des conflits
  const hasCodeD = student.D && hasConflictD(student);
  const hasCodeA = student.A && groupSeparated(student);
  const missingOption = !classHasOption(student.classe, student.LV2);
  
  if (hasCodeD || hasCodeA || missingOption) {
    logLine('WARNING', `FIXE ${student.NOM} a un conflit - Déplacement nécessaire`);
    return true; // Autoriser le déplacement
  }
  
  return false; // Respecter FIXE
}
```

---

## 📊 Matrice de Décision

| Contrainte | Priorité | Désactivable? | Complexité | Timeline |
|------------|----------|---------------|------------|----------|
| **Options/LV2** | 🔴 CRITIQUE | ❌ NON | ⭐ Facile | ✅ Immédiat |
| **Dissociations** | 🟠 HAUTE | ✅ OUI | ⭐⭐ Moyen | 📅 Court terme |
| **Associations** | 🟠 HAUTE | ✅ OUI | ⭐⭐ Moyen | 📅 Court terme |
| **Mobilité** | 🟡 MOYENNE | ✅ OUI | ⭐⭐⭐ Complexe | 📅 Moyen terme |

---

## ✅ Recommandation Finale

### Implémentation Progressive

**Étape 1** (Immédiat):
- ✅ Désactiver toggle Options/LV2
- ✅ Ajouter texte "Toujours actif"

**Étape 2** (Court terme - 1-2h):
- ✅ Câbler Dissociations
- ✅ Câbler Associations
- ✅ Ajouter warnings

**Étape 3** (Moyen terme - 3-4h):
- ✅ Câbler Mobilité
- ✅ Gérer conflits FIXE
- ✅ Ajouter modal explicatif

---

## 🎓 Notes Pédagogiques

### Cas d'Usage Réels

**Scénario 1**: Prof veut ignorer code D
```
Situation: Deux élèves ont code D mais le prof pense qu'ils peuvent être ensemble
Action: Désactiver Dissociations
Résultat: Les deux élèves peuvent être dans la même classe
```

**Scénario 2**: Prof veut casser un groupe A
```
Situation: Groupe d'élèves avec code A mais trop fusionnels
Action: Désactiver Associations
Résultat: Le groupe peut être séparé
```

**Scénario 3**: Élève FIXE mal placé
```
Situation: Élève FIXE en 6°1 mais a ITA (proposé en 6°2)
Action: Désactiver Mobilité
Résultat: L'élève peut être déplacé en 6°2 pour avoir son option
```

---

**Document de référence pour le câblage futur des contraintes Phase 3** 📚
