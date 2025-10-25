# 📋 GUIDE DE VALIDATION - CORRECTION PARITÉ ADAPTATIVE

## 🎯 Objectif
Valider que la correction de la régression de parité fonctionne correctement et produit les résultats attendus.

---

## ✅ ÉTAPE 1 : Tests Unitaires (Optionnel mais Recommandé)

### 1.1 Exécuter le Script de Test

1. Ouvrir **Google Apps Script** dans votre projet
2. Ouvrir le fichier `TEST_PARITE_ADAPTATIVE.gs`
3. Sélectionner la fonction `testParityTargets` dans le menu déroulant
4. Cliquer sur **Exécuter** (▶️)
5. Consulter les logs (Ctrl+Entrée ou menu Affichage > Journaux)

### 1.2 Résultats Attendus

```
=== TEST 1: Cas Réel (66F + 55M) ===
Ratio global: 66F + 55M = 54.5% F

Cibles par classe:
  ✅ 6°1: Actuel 16F/9M (Δ=+7), Cible 13F/11M (Δ=+2), Écart=5
  ✅ 6°2: Actuel 13F/11M (Δ=+2), Cible 13F/11M (Δ=+2), Écart=0
  ✅ 6°3: Actuel 13F/11M (Δ=+2), Cible 13F/11M (Δ=+2), Écart=0
  ✅ 6°4: Actuel 12F/12M (Δ=0), Cible 13F/12M (Δ=+1), Écart=1
  ✅ 6°5: Actuel 12F/12M (Δ=0), Cible 14F/11M (Δ=+3), Écart=3

Vérification: Somme cibles = 66F + 55M (attendu: 66F + 55M)
✅ TEST RÉUSSI: Les cibles sont cohérentes
```

**Interprétation** :
- ✅ La classe 6°1 a un écart de 5 par rapport à sa cible → L'optimisation devrait corriger cela
- ✅ Les cibles totalisent bien 66F + 55M → Conservation du total

---

## ✅ ÉTAPE 2 : Test sur Données Réelles

### 2.1 Préparer un Jeu de Données de Test

**Option A : Utiliser vos données actuelles**
- Faire une **copie de sauvegarde** de votre fichier Google Sheets
- Travailler sur la copie pour les tests

**Option B : Créer un jeu de données minimal**
```
Onglet _BASEOPTI :
- 121 élèves répartis en 5 classes
- 66 élèves avec SEXE = 'F'
- 55 élèves avec SEXE = 'M'
- Distribution initiale déséquilibrée (ex: 6°1 avec 16F/9M)
```

### 2.2 Exécuter l'Optimisation

1. Ouvrir votre interface d'optimisation
2. Sélectionner le niveau à optimiser (ex: 6°)
3. Configurer les poids :
   ```
   - Parité : 0.3 (ou plus pour prioriser la parité)
   - COM : 0.4
   - TRA : 0.1
   - PART : 0.1
   - ABS : 0.1
   ```
4. Lancer l'optimisation (Phase 4)

### 2.3 Vérifier les Logs

**Rechercher dans les logs** (Ctrl+F dans l'éditeur de scripts) :

#### A. Calcul des Cibles (au début de Phase 4)
```
Moteur V14: Parité globale calculée: 66F / 55M (54.5% F)
Moteur V14: Cibles de parité par classe:
  6°1: cible 13F / 11M (delta=2)
  6°2: cible 13F / 11M (delta=2)
  6°3: cible 13F / 11M (delta=2)
  6°4: cible 13F / 12M (delta=1)
  6°5: cible 14F / 11M (delta=3)
```

**✅ Validation** : Les cibles doivent totaliser le nombre exact de F et M

#### B. Rapport Final (à la fin de Phase 4)
```
🚻 PARITÉ F/M PAR CLASSE (avec cibles adaptatives) :
  ✅ 6°1: 13F / 11M (Δ=+2, cible Δ=+2, écart=0)
  ✅ 6°2: 13F / 11M (Δ=+2, cible Δ=+2, écart=0)
  ✅ 6°3: 13F / 11M (Δ=+2, cible Δ=+2, écart=0)
  ✅ 6°4: 13F / 12M (Δ=+1, cible Δ=+1, écart=0)
  ✅ 6°5: 14F / 11M (Δ=+3, cible Δ=+3, écart=0)
```

**✅ Validation** : 
- Toutes les classes doivent avoir un écart ≤ 2 par rapport à leur cible
- Pas de classe "poubelle" avec un écart extrême (ex: Δ=+7)

---

## ✅ ÉTAPE 3 : Comparaison Avant/Après

### 3.1 Métriques à Comparer

| Métrique | Avant Correction | Après Correction | Objectif |
|----------|------------------|------------------|----------|
| **Classe avec écart max** | 6°1: 16F/9M (Δ=+7) | 6°1: 13F/11M (Δ=+2) | Réduction |
| **Variance des écarts** | Élevée (0,2,2,7,0) | Faible (2,2,2,1,3) | Réduction |
| **Classes "parfaites"** | 2 classes (12F/12M) | 0 classes | Élimination |
| **Écart moyen aux cibles** | ~2.0 | ~0.0 | Proche de 0 |

### 3.2 Visualisation

**Avant Correction** :
```
6°1: ████████████████ (16F) ████████ (9M)   Δ=+7 ❌
6°2: █████████████ (13F) ███████████ (11M)  Δ=+2 ✅
6°3: █████████████ (13F) ███████████ (11M)  Δ=+2 ✅
6°4: ████████████ (12F) ████████████ (12M)  Δ=0  ✅ (fausse perfection)
6°5: ████████████ (12F) ████████████ (12M)  Δ=0  ✅ (fausse perfection)
```

**Après Correction** :
```
6°1: █████████████ (13F) ███████████ (11M)  Δ=+2 ✅
6°2: █████████████ (13F) ███████████ (11M)  Δ=+2 ✅
6°3: █████████████ (13F) ███████████ (11M)  Δ=+2 ✅
6°4: █████████████ (13F) ████████████ (12M) Δ=+1 ✅
6°5: ██████████████ (14F) ███████████ (11M) Δ=+3 ✅
```

---

## ✅ ÉTAPE 4 : Cas Limites à Tester

### 4.1 Cas 1 : Ratio Parfait 50/50
**Données** : 60F + 60M  
**Attendu** : Toutes les classes avec Δ=0 (12F/12M partout)  
**Validation** : Le système doit se comporter comme avant (pas de régression)

### 4.2 Cas 2 : Ratio Extrême (80% F)
**Données** : 80F + 20M  
**Attendu** : Toutes les classes avec Δ≈+12 (16F/4M)  
**Validation** : Pas de classe avec 20F/0M ou 12F/8M

### 4.3 Cas 3 : Données Manquantes
**Données** : 50% des élèves sans sexe renseigné  
**Attendu** : Calcul sur les données connues uniquement  
**Validation** : Pas d'erreur, message dans les logs

### 4.4 Cas 4 : Classes de Tailles Différentes
**Données** : Classes de 20, 24, 25, 28, 24 élèves  
**Attendu** : Cibles proportionnelles à la taille de chaque classe  
**Validation** : Ratio F/M similaire dans toutes les classes

---

## ✅ ÉTAPE 5 : Vérification des Swaps

### 5.1 Logs de Swaps à Analyser

**Rechercher** : `respecteContraintes: REJET - Parité violée`

**Avant Correction** :
```
respecteContraintes: REJET - Parité violée (Δ 6°1: 8, 6°2: 1, Tol: 2)
```
→ Rejet car |F-M| > 2, même si c'est proche de la cible

**Après Correction** :
```
respecteContraintes: REJET - Parité violée (Δ 6°1: 4, 6°2: 0, Tol: 2) [Cible 6°1: Δ=+2] [Cible 6°2: Δ=+2]
```
→ Rejet car écart à la cible > 2, avec affichage des cibles

### 5.2 Validation
- ✅ Les rejets doivent être **moins nombreux** après correction
- ✅ Les swaps doivent **converger vers les cibles** (pas vers 50/50)
- ✅ Pas de blocage de l'optimisation

---

## ✅ ÉTAPE 6 : Performance

### 6.1 Métriques à Surveiller

| Métrique | Avant | Après | Tolérance |
|----------|-------|-------|-----------|
| **Temps d'exécution** | ~30s | ~30s | ±10% |
| **Nombre de swaps évalués** | ~1000 | ~1000 | ±20% |
| **Nombre de swaps appliqués** | ~50 | ~50 | ±30% |

### 6.2 Validation
- ✅ Pas de dégradation significative des performances
- ✅ Convergence en un nombre raisonnable d'itérations

---

## ❌ PROBLÈMES POTENTIELS ET SOLUTIONS

### Problème 1 : Aucun Swap Appliqué
**Symptôme** : `0 swaps appliqués`  
**Cause** : Contraintes trop strictes  
**Solution** : Augmenter `PARITE_TOLERANCE` de 2 à 3 ou 4

### Problème 2 : Cibles Incohérentes
**Symptôme** : Somme des cibles ≠ total F/M  
**Cause** : Bug dans l'arrondi banquier  
**Solution** : Vérifier les logs du calcul des cibles

### Problème 3 : Classe Poubelle Persiste
**Symptôme** : Une classe garde un écart extrême  
**Cause** : Élèves FIXE ou contraintes bloquantes  
**Solution** : Vérifier la mobilité des élèves dans cette classe

### Problème 4 : Erreur JavaScript
**Symptôme** : `TypeError: Cannot read property 'targets' of undefined`  
**Cause** : `parityTargets` non passé à une fonction  
**Solution** : Vérifier tous les appels de fonction

---

## 📊 CHECKLIST DE VALIDATION FINALE

- [ ] Tests unitaires passent (4/4)
- [ ] Logs montrent le calcul des cibles
- [ ] Rapport final affiche les cibles et écarts
- [ ] Aucune classe avec écart > 4 par rapport à sa cible
- [ ] Variance des écarts réduite par rapport à avant
- [ ] Pas de régression sur cas 50/50
- [ ] Performance acceptable (< 60s)
- [ ] Pas d'erreur JavaScript
- [ ] Documentation à jour

---

## 🎉 CRITÈRES DE SUCCÈS

### ✅ Succès Total
- Toutes les classes ont un écart ≤ 2 par rapport à leur cible
- Variance des écarts < 1.0
- Pas de classe "poubelle"
- Temps d'exécution < 60s

### ⚠️ Succès Partiel
- Toutes les classes ont un écart ≤ 4 par rapport à leur cible
- Variance des écarts < 2.0
- Amélioration visible par rapport à avant

### ❌ Échec
- Une ou plusieurs classes avec écart > 4
- Variance des écarts > 3.0
- Pas d'amélioration par rapport à avant
- Erreurs JavaScript

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :

1. **Vérifier les logs** : Rechercher les messages d'erreur
2. **Exécuter les tests unitaires** : Identifier le problème
3. **Comparer avec la documentation** : `CORRECTION_PARITE_ADAPTATIVE.md`
4. **Vérifier les signatures de fonctions** : Tous les paramètres sont-ils passés ?

---

**Document créé le 22 octobre 2025**  
**Version** : 1.0
