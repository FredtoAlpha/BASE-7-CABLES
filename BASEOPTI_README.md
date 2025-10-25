# 🎯 SYSTÈME BASEOPTI - Architecture & Fonctionnement

## ✅ Implémentation terminée !

Le système **BASEOPTI** est maintenant intégré dans votre pipeline d'optimisation "Direct Live".

---

## 📋 Architecture

### 1. **_BASEOPTI : Pool centralisé**

Un nouvel onglet `_BASEOPTI` (caché par l'underscore) est créé **au début de chaque optimisation**
depuis les onglets sources choisis par l'utilisateur (TEST, CACHE, FIN, etc.).

#### Colonnes de _BASEOPTI :
```
_ID | NOM | PRENOM | SEXE | CLASSE_SRC | LV2 | OPT | CODE_A | CODE_D | _PLACED | _TARGET_CLASS | _PHASE_TS
```

- **_PLACED** : `""` (libre) | `"P1"` | `"P2"` | `"P3"` — Statut de placement
- **_TARGET_CLASS** : Classe de destination (`"6°1"`, `"6°2"`, etc.)
- **_PHASE_TS** : Timestamp du dernier placement
- **CLASSE_SRC** : Classe d'origine (ex: `"6°1"` depuis `6°1TEST`)

---

## 🔄 Pipeline d'optimisation

### **Étape 0 : Ouverture + Création BASEOPTI**
```javascript
openCacheTabsStream()
  ├─ Crée _BASEOPTI depuis les sources (ex: 6°1TEST, 6°2TEST...)
  ├─ Fusionne tous les élèves dans un pool unique
  └─ Ouvre les onglets ...CACHE (vides)
```

**Résultat** :
- ✅ `_BASEOPTI` créé avec 121 élèves (exemple)
- ✅ Onglets CACHE prêts (vides)

---

### **Phase 1 : Options & LV2** _(version BASEOPTI)_
```javascript
Phase1I_dispatchOptionsLV2_BASEOPTI(ctx)
  ├─ Lit les élèves libres dans _BASEOPTI (_PLACED="")
  ├─ Filtre selon OPT/LV2 (ITA, CHAV, ESP, ALL, PT)
  ├─ Place selon quotas _STRUCTURE
  ├─ Écrit dans ...CACHE
  └─ Marque dans _BASEOPTI : _PLACED="P1", _TARGET_CLASS="6°1"
```

**Exemple** :
- `6°1` : quota ITA=6 → **6 élèves ITA** placés depuis _BASEOPTI
- `6°3` : quota CHAV=10 → **10 élèves CHAV** placés depuis _BASEOPTI

**✅ Garantie** : Les élèves ITA vont **uniquement** dans les classes avec quota ITA > 0

---

### **Phase 2 : Codes ASSO/DISSO** _(version BASEOPTI)_
```javascript
Phase2I_applyDissoAsso_BASEOPTI(ctx)
  ├─ Lit les élèves libres dans _BASEOPTI (_PLACED="")
  ├─ Regroupe par CODE_A (ASSO)
  ├─ RÈGLE CRITIQUE : Si groupe A10 contient 1 élève CHAV
  │  → TOUS les élèves A10 vont en classe CHAV
  ├─ Sépare par CODE_D (DISSO)
  │  → Assure que 2 élèves D5 vont dans des classes différentes
  └─ Marque dans _BASEOPTI : _PLACED="P2"
```

**Règle critique** :
> **Si un groupe ASSO (CODE_A) contient un élève avec OPT/LV2 contraignant**
> **→ TOUS les élèves du groupe suivent la même contrainte**

Exemples :
- Groupe `A10` : 1 CHAV + 2 neutres → **les 3 vont en classe CHAV**
- Groupe `A7` : 1 ITA + 2 neutres → **les 3 vont en classe ITA**

---

### **Phase 3 : Compléter effectifs & Parité** _(version BASEOPTI)_
```javascript
Phase3I_completeAndParity_BASEOPTI(ctx)
  ├─ Lit les élèves encore libres dans _BASEOPTI (_PLACED="")
  ├─ Calcule les besoins par classe (effectif cible - élèves déjà placés)
  ├─ Complète chaque classe en alternant F/M pour équilibrer parité
  └─ Marque dans _BASEOPTI : _PLACED="P3"
```

**Résultat** :
- ✅ Toutes les classes atteignent leur effectif cible (ex: 25 élèves)
- ✅ Parité F/M respectée (tolérance ±1)
- ✅ Tous les élèves sont placés

---

### **Phase 4 : Swaps (optimisation COM)** _(avec mini-gardien)_
```javascript
Phase4_balanceScoresSwaps_(ctx)
  ├─ Lit depuis ...CACHE (résultats P1/P2/P3)
  ├─ Mini-gardien : Bloque tout swap qui casserait une contrainte LV2/OPT
  └─ Applique swaps pour optimiser COM/parité
```

**Mini-gardien** :
- ❌ Refuse un swap qui déplacerait un élève ITA vers une classe sans quota ITA
- ❌ Refuse un swap qui déplacerait un élève CHAV vers une classe sans quota CHAV
- ✅ Accepte uniquement les swaps "neutres" (élèves sans OPT/LV2 spécifiques)

---

### **Fin : Audit + Ouverture auto**
```javascript
auditStream() + openCacheTabs_()
  ├─ Audit conformité LV2/OPT/A/D
  └─ Ouvre automatiquement les onglets CACHE pour visualisation
```

**Résultat final** :
- ✅ Onglets CACHE affichés automatiquement
- ✅ Audit disponible
- ✅ `_BASEOPTI` conservé pour traçabilité

---

## 🎯 Avantages du système BASEOPTI

### ✅ **Avant (problème)**
```
6°1TEST (25 élèves) → 6°1CACHE (25 élèves)
  ❌ Les 25 élèves restent dans la même classe
  ❌ Les ITA ne peuvent pas "migrer" vers la classe ITA
  ❌ Pas de vraie répartition intelligente
```

### ✅ **Après (BASEOPTI)**
```
Pool unique (121 élèves) → Répartition intelligente
  ✅ Les 6 ITA vont dans la classe avec quota ITA=6
  ✅ Les 10 CHAV vont dans la classe avec quota CHAV=10
  ✅ Les groupes ASSO respectent les contraintes OPT/LV2
  ✅ Phase 3 complète avec les élèves neutres restants
```

---

## 📂 Fichiers créés

1. **`BASEOPTI_System.gs`** (331 lignes)
   - Utilitaires de base
   - Création de _BASEOPTI
   - Sélecteurs (baseGetFree_, baseMarkPlaced_)
   - Helpers d'écriture vers CACHE

2. **`Phases_BASEOPTI.gs`** (382 lignes)
   - Phase 1 : `Phase1I_dispatchOptionsLV2_BASEOPTI()`
   - Phase 2 : `Phase2I_applyDissoAsso_BASEOPTI()`
   - Phase 3 : `Phase3I_completeAndParity_BASEOPTI()`

3. **`Orchestration_V14I_Stream.gs`** (modifié)
   - `openCacheTabsStream()` : Crée _BASEOPTI
   - `phase1Stream()`, `phase2Stream()`, `phase3Stream()` : Utilisent versions BASEOPTI
   - `runOptimizationStreaming()` : Ouvre onglets CACHE à la fin

---

## 🚀 Utilisation

### Interface utilisateur

1. **Choisir le mode** : TEST / CACHE / FIN
2. **Cliquer sur "Mode Direct Live"**
3. **Observer le pipeline** :
   - 📂 Ouverture CACHE + création _BASEOPTI
   - 📌 Phase 1 : Placement ITA/CHAV/LV2
   - 📌 Phase 2 : Codes ASSO/DISSO
   - 📌 Phase 3 : Complétion effectifs
   - 📌 Phase 4 : Swaps
   - 📊 Audit final
   - ✅ Onglets CACHE ouverts automatiquement

### Résultat attendu

```
📊 Résultats de l'Optimisation
Optimisation réussie en 83.90s
Phase 1: ITA=6, CHAV=10
Phase 2: 15 regroupements
Phase 3: Effectifs équilibrés
Phase 4: 9 swaps

6°1 (25 élèves, 13F/12M)
LV2: ITA=6 | OPT: —
✅ ITA: attendu=6, réalisé=6

6°3 (25 élèves, 12F/13M)
LV2: — | OPT: CHAV=10
✅ CHAV: attendu=10, réalisé=10
```

---

## 🔍 Debug & Audit

### Consulter _BASEOPTI

L'onglet `_BASEOPTI` reste accessible après l'optimisation pour audit :

- **Élèves placés en P1** : Filtre `_PLACED = "P1"` → élèves avec OPT/LV2
- **Élèves placés en P2** : Filtre `_PLACED = "P2"` → groupes ASSO/DISSO
- **Élèves placés en P3** : Filtre `_PLACED = "P3"` → complétion effectifs
- **Élèves non placés** : Filtre `_PLACED = ""` → devrait être vide à la fin

### Logs Apps Script

Tous les logs sont disponibles dans **Exécutions** :
```
🎯 Création de _BASEOPTI depuis TEST...
✅ _BASEOPTI créé : 121 élèves
📌 PHASE 1 (BASEOPTI) - Options & LV2
  ✅ 6°1 : 6 × ITA (quota=6)
  ✅ 6°3 : 10 × CHAV (quota=10)
✅ PHASE 1 terminée : ITA=6, CHAV=10
```

---

## ✅ Tests recommandés

1. **Lancer "Mode Direct Live"** depuis TEST
2. **Vérifier** :
   - ✅ _BASEOPTI créé avec tous les élèves
   - ✅ Phase 1 : ITA/CHAV correctement placés
   - ✅ Phase 2 : Groupes ASSO respectent OPT/LV2
   - ✅ Phase 3 : Toutes les classes complétées
   - ✅ Onglets CACHE ouverts automatiquement
3. **Consulter _BASEOPTI** pour audit

---

## 📞 Support

Si un problème survient :
1. Consulter les logs Apps Script (Exécutions)
2. Vérifier l'onglet `_BASEOPTI`
3. Vérifier les quotas dans `_STRUCTURE`

**Le système est maintenant prêt à l'emploi !** 🎉
