/**
 * @fileoverview Ce fichier contient des fonctions utilitaires partagées
 * à travers le projet pour éviter la duplication de code.
 */

// ✅ COUCHE DE COMPATIBILITÉ : Alias pour ancien schéma
const LEGACY_ALIASES = {
  // ID (clé primaire)
  "ID": ["ID_ELEVE", "ID", "_ID"],
  "ID_ELEVE": ["ID_ELEVE", "ID", "_ID"],
  "_ID": ["_ID", "ID_ELEVE", "ID"],

  // Classe finale / déf
  "CLASSE_FINAL": ["CLASSE_FINAL", "CLASSE FINAL", "LASSE_FINAL", "CLASSE", "_TARGET_CLASS"],
  "CLASSE DEF": ["CLASSE_DEF", "CLASSE DEF"],
  "CLASSE_DEF": ["CLASSE_DEF", "CLASSE DEF"],

  // Scores (essentiels pour P4)
  "COM": ["COM"],
  "TRA": ["TRA"],
  "PART": ["PART"],
  "ABS": ["ABS"],

  // Groupes ASSO/DISSO
  "A": ["ASSO", "A", "CODE_A"],
  "ASSO": ["ASSO", "A", "CODE_A"],
  "D": ["DISSO", "D", "CODE_D"],
  "DISSO": ["DISSO", "D", "CODE_D"],

  // Divers
  "SOURCE": ["SOURCE", "_SOURCE_CLASS", "_SOURCE_CLA"],
  "_SOURCE_CLASS": ["SOURCE", "_SOURCE_CLASS", "_SOURCE_CLA"],
  "CLASSE_FINAL": ["CLASSE_FINAL", "CLASSE FINAL", "LASSE_FINAL", "CLASSE", "_TARGET_CLASS", "_TARGET_CLA"],
  "_TARGET_CLASS": ["_TARGET_CLASS", "_TARGET_CLA", "CLASSE_FINAL", "CLASSE FINAL"],
  "_PLACED": ["_PLACED", "PLACED", "MOBILITE"],
  "SEXE": ["SEXE", "Sexe", "Genre", "GENRE"],
  "NOM": ["NOM", "Nom"],
  "PRENOM": ["PRENOM", "Prenom", "Prénom"]
};

/**
 * Lit un onglet et retourne un tableau d'objets
 * ⚠️ FILTRE : Ne garde que les lignes avec un ID valide en colonne A
 */
function readRowsAsObjects_(sh) {
  const rng = sh.getDataRange();
  const values = rng.getValues();
  if (values.length < 2) return [];

  const head = values[0];
  const results = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];

    // ⚠️ IMPÉRATIF : Ignorer les lignes sans ID en colonne A (lignes de stats)
    const idColA = row[0];
    if (!idColA || String(idColA).trim() === '') continue;

    const o = {};
    for (let i = 0; i < head.length; i++) {
      o[head[i]] = row[i];
    }
    results.push(o);
  }

  return results;
}

/**
 * Résout un nom de colonne logique vers le nom physique présent dans les en-têtes
 * @param {string} logicalName - Nom logique de la colonne
 * @param {Array} headers - En-têtes physiques de la feuille
 * @returns {Object|null} {name: string, idx: number} ou null si non trouvé
 */
function resolveHeader_(logicalName, headers) {
  const candidates = LEGACY_ALIASES[logicalName] || [logicalName];
  for (const name of candidates) {
    const idx = headers.indexOf(name);
    if (idx !== -1) {
      return { name: name, idx: idx };
    }
  }
  return null;
}

/**
 * Getters robustes pour accès aux données (compatibilité ancien/nouveau schéma)
 */

function getId_(row, headers) {
  const h = resolveHeader_("ID_ELEVE", headers) || resolveHeader_("ID", headers) || resolveHeader_("_ID", headers);
  return h ? String(row[h.idx] || "").trim() : "";
}

function getScore_(row, headers, scoreKey) {
  const h = resolveHeader_(scoreKey, headers);
  return h ? Number(row[h.idx] || 0) : 0;
}

function getClasseFinal_(row, headers) {
  const h = resolveHeader_("CLASSE_FINAL", headers);
  return h ? String(row[h.idx] || "").trim() : "";
}

function getPlaced_(row, headers) {
  const h = resolveHeader_("_PLACED", headers);
  return h ? String(row[h.idx] || "").trim() : "";
}

function getAsso_(row, headers) {
  const h = resolveHeader_("ASSO", headers);
  return h ? String(row[h.idx] || "").trim() : "";
}

function getDisso_(row, headers) {
  const h = resolveHeader_("DISSO", headers);
  return h ? String(row[h.idx] || "").trim() : "";
}
