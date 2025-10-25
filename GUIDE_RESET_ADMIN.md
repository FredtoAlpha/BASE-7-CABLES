# 🔒 Guide de Réinitialisation du Menu Admin

## Problème
Le menu Admin est **VERT** et **ouvert** au démarrage, alors qu'il devrait être **ROUGE** et **verrouillé**.

## Cause
Le `localStorage` de votre navigateur contient encore les anciennes données de connexion:
- `adminUnlocked: 'true'`
- `adminForceMode: 'true'` (peut-être)

## Solutions (par ordre de préférence)

### ✅ Solution 1: Via la Console du Navigateur (RAPIDE)

1. Ouvrir votre application Google Apps Script
2. Appuyer sur **F12** pour ouvrir la console
3. Coller ce code et appuyer sur **Entrée**:

```javascript
localStorage.removeItem('adminUnlocked');
localStorage.removeItem('adminForceMode');
location.reload();
```

4. La page se recharge automatiquement
5. Le menu Admin devrait maintenant être **ROUGE** avec "OFF"

---

### ✅ Solution 2: Via le Bouton de Verrouillage (après déploiement)

**IMPORTANT**: Cette solution nécessite que vous ayez déployé les derniers fichiers avec `clasp push`.

1. Ouvrir le menu Admin (actuellement vert)
2. Scroller tout en bas du menu
3. Cliquer sur le bouton **"Verrouiller le menu Admin"** (fond rouge)
4. Le menu se ferme et redevient rouge avec "OFF"

---

### ✅ Solution 3: Effacer tout le localStorage

1. Appuyer sur **F12** → Onglet **Application** (ou **Stockage**)
2. Dans le menu de gauche: **Local Storage** → Sélectionner votre site
3. Clic droit → **Clear** (ou supprimer les clés `adminUnlocked` et `adminForceMode`)
4. Recharger la page (**Ctrl+F5**)

---

### ✅ Solution 4: Fichier HTML de Réinitialisation

**Note**: Cette méthode ne fonctionne que si le fichier est ouvert depuis le même domaine que votre application.

1. Ouvrir le fichier `RESET_ADMIN_SIMPLE.html` dans votre navigateur
2. Cliquer sur **"Réinitialiser maintenant"**
3. Retourner à votre application et recharger (**Ctrl+F5**)

---

## Déploiement des Nouveaux Fichiers

Pour que le bouton "Verrouiller" fonctionne, vous devez déployer:

### Avec clasp (ligne de commande)

```bash
cd "c:\OUTIL 25 26\BASE 6 BRIQUES"
clasp push
```

### Avec l'éditeur Apps Script

1. Ouvrir l'éditeur Apps Script de votre projet
2. Copier-coller manuellement les fichiers modifiés:
   - `InterfaceV2.html` (bouton de verrouillage ajouté)
   - `InterfaceV2_CoreScript.html` (gestionnaire du bouton)
   - `styles-dark-mode.html` (mode sombre corrigé)
   - `AdminPasswordHelper.gs` (récupération mot de passe)
   - `KeyboardShortcuts.html` (raccourcis T/V/H)

---

## Vérification

Après la réinitialisation, vous devriez voir:

✅ Bouton Admin **ROUGE** avec texte "OFF"  
✅ Clic sur Admin → Message "Ce menu est protégé par mot de passe"  
✅ Bouton "Déverrouiller" visible  
✅ Après déverrouillage → Bouton devient **VERT** avec "ON"  
✅ Bouton "Verrouiller le menu Admin" visible en bas du menu  

---

## Logs de Débogage

Ouvrez la console (F12) et vérifiez les logs au chargement:

```
🔐 Admin init - isAdminUnlocked: false
🔐 localStorage.adminUnlocked: null
🔐 localStorage.adminForceMode: null
🔒 Admin verrouillé - Bouton ROUGE
```

Si vous voyez `isAdminUnlocked: true`, c'est que le localStorage n'a pas été effacé.

---

## Support

Si aucune solution ne fonctionne:

1. Vérifier que vous êtes sur le bon domaine (script.google.com)
2. Essayer en navigation privée (Ctrl+Shift+N)
3. Vider complètement le cache du navigateur
4. Redémarrer le navigateur

---

## Fichiers Modifiés dans cette Session

- ✅ `InterfaceV2.html` - Bouton verrouillage + Mode Force toggle
- ✅ `InterfaceV2_CoreScript.html` - Logique Admin + Mode Force
- ✅ `AdminPasswordHelper.gs` - Récupération mot de passe _CONFIG B3
- ✅ `KeyboardShortcuts.html` - Raccourcis T/V/H corrigés
- ✅ `styles-dark-mode.html` - Mode sombre lisible + couleurs scores
- ✅ `RESET_ADMIN_SIMPLE.html` - Utilitaire de réinitialisation
