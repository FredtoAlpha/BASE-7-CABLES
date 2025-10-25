# MENU LEGACY PIPELINE - Documentation Finale

Date : 23 octobre 2025
Statut : Menu LEGACY corrige et fonctionnel

## WORKFLOW LEGACY REEL

1. Classes Sources : 6°1, 6°2, 6°3, etc. (Onglets avec eleves bruts)
2. Pipeline LEGACY (Phases 1-2-3-4) lit depuis 6°1, 6°2, 6°3 et cree onglets TEST
3. Onglets TEST crees : 6°1TEST, 6°2TEST, 6°3TEST
4. InterfaceV2 peut lire depuis TEST, CACHE ou SOURCE

## MENU LEGACY

- Voir Classes Sources (6°1, 6°2...)
- Configurer _STRUCTURE
- Creer Onglets TEST (Pipeline Complet)
- Phases Individuelles (Phase 1, 2, 3, 4)
- Voir Resultats TEST

## WORKFLOW COMPLET

Etape 1 : Voir Classes Sources
Etape 2 : Configurer _STRUCTURE
Etape 3 : Creer Onglets TEST (lance phases 1-2-3-4)
Etape 4 : Voir Resultats TEST
Etape 5 : Utiliser InterfaceV2 pour lire depuis TEST

## FONCTIONS LEGACY

1. legacy_viewSourceClasses() - Affiche onglets sources
2. legacy_openStructure() - Ouvre _STRUCTURE
3. legacy_runFullPipeline() - Lance phases 1-2-3-4 et cree TEST
4. legacy_runPhase1() - Phase 1 individuelle
5. legacy_runPhase2() - Phase 2 individuelle
6. legacy_runPhase3() - Phase 3 individuelle
7. legacy_runPhase4() - Phase 4 individuelle
8. legacy_viewTestResults() - Affiche onglets TEST
