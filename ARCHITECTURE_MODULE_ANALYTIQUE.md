# 📊 ARCHITECTURE : Module Analytique et Tableaux de Bord

## Date : 21 octobre 2025, 23:18
## Version : 1.0

---

## 🎯 OBJECTIFS PRODUIT

### Vision

Fournir un **outil de pilotage stratégique** basé sur `_OPTI_CONFIG` pour :

1. ✅ **Vision consolidée** : Afficher la situation actuelle (effectifs, parités, quotas)
2. ✅ **Suivi historique** : Conserver les instantanés des optimisations
3. ✅ **Zones de risque** : Identifier les dépassements de quotas, problèmes de parité
4. ✅ **Gouvernance** : Alimenter les conseils pédagogiques avec des données fiables

### Distinction claire

| Outil | Usage | Public | Données |
|-------|-------|--------|---------|
| **Panneau Statistiques** (existant) | Opérationnel, temps réel | Enseignants, CPE | Colonnes affichées, cartes élèves |
| **Tableaux de Bord** (nouveau) | Pilotage, historique | Direction, conseils | `_OPTI_CONFIG`, snapshots, historique |

⚠️ **IMPORTANT** : Le panneau statistiques existant **NE SERA PAS TOUCHÉ**.

---

## 🏗️ POSITIONNEMENT : MENU PARAMÈTRES

### Choix recommandé

**Entrée dans le menu Paramètres**, section "Données", pour regrouper les fonctions avancées sans encombrer la navigation principale.

### Structure de navigation

```
⚙️ PARAMÈTRES
├── 📊 Données
│   ├── Import élèves (existant)
│   ├── Export élèves (existant)
│   └── 📈 Tableaux de bord analytiques (🆕 NOUVEAU)
│       ├── Vue "Équipe pédagogique"
│       ├── Vue "Direction"
│       └── Exports (PDF/CSV)
├── 👥 Groupes
│   └── Gestion des groupes (existant)
└── ⚙️ Configuration
    └── Paramètres généraux (existant)
```

### Avantages de ce choix

1. ✅ **Cohérence fonctionnelle** : Regroupe les fonctions avancées (import/export/analytics)
2. ✅ **Public ciblé** : Direction et conseils pédagogiques accèdent naturellement via Paramètres
3. ✅ **Navigation épurée** : Barre d'actions principale reste dédiée aux outils opérationnels quotidiens
4. ✅ **Évolutivité** : Facile d'ajouter d'autres outils analytiques dans la même section
5. ✅ **Isolation** : Développement et tests indépendants du reste de l'interface

---

## 📦 SOURCES DE DONNÉES

### 1. `_OPTI_CONFIG` (Configuration et paramètres)

Clés utilisées : `mode.selected`, `targets.byClass`, `quotas`, `weights`, `swaps.max`, `parity.tolerance`

### 2. `...CACHE` (Résultats finaux)

Affectations finales, effectifs réels, parité F/M, quotas atteints

### 3. `_ANALYTICS_LOG` (🆕 Historique)

Snapshots horodatés avec métriques globales

---

## 🔧 EXTRACTEUR CENTRAL

Fonction `buildAnalyticsSnapshot()` qui lit toutes les sources et retourne un objet JSON normalisé.

---

## 💾 PERSISTANCE

Feuille `_ANALYTICS_LOG` avec colonnes : TIMESTAMP, USER, PIPELINE, MODE, métriques globales, SNAPSHOT_JSON

---

## 🎨 TABLEAUX DE BORD

### Vue "Équipe pédagogique"
- Cartes effectif vs cible par classe
- Jauges de quotas LV2/OPT
- Camembert parité globale

### Vue "Direction"
- Évolution historique des effectifs
- Heatmap des zones de risque
- Graphiques d'impact des optimisations

---

## 📅 ROADMAP (4 SEMAINES)

**Semaine 1** : Cartographie des clés `_OPTI_CONFIG`, schéma contractuel
**Semaine 2** : Implémentation `buildAnalyticsSnapshot()` et `_ANALYTICS_LOG`
**Semaine 3** : Conception UX/UI des dashboards
**Semaine 4** : Intégration front, tests, exports

---

## ✅ BÉNÉFICES

- **Pilotage renforcé** : Indicateurs à jour pour la direction
- **Transparence** : Suivi des effets des optimisations
- **Capitalisation** : Base de connaissance pour les rentrées suivantes

---

Voir fichier complet pour le code détaillé de `buildAnalyticsSnapshot()` et la structure complète.
