// Ariane — état visible d'instances ou de variantes (étape ariane-replace-instances). SCRIPT FIXE : se colle tel quel ;
// seule la ligne PARAMÈTRES change. LECTURE SEULE.
// IDS : ids de nœuds — une instance exemple par signature du relevé, et les variantes cibles de la proposition. Le retour
// du connecteur est limité en taille : deux ou trois ids par appel.
// Rend, pour chacun : ses pièces visibles dans l'ordre, avec leur CHEMIN (celui qu'attendent les remises d'echange.js),
// leur composant source et leurs réglages non reliés à une variable ; et ses textes visibles avec leur chemin. Sert à
// écrire la table : ce que montre l'ancienne, ce que montre la cible par défaut ; seules les différences se remettent.
// PARAMÈTRES
const IDS = [];

figma.skipInvisibleInstanceChildren = false;
// Bloc commun à releve.js, echange.js, controle.js et etat.js : le garder identique (sinon les signatures divergent).
const code = s => s.replace(/%/g, '%25').replace(/\//g, '%2F').replace(/#/g, '%23');
const cle = (n, parent) => { const memes = parent ? parent.children.filter(c => c.name === n.name) : [n]; return memes.length > 1 ? code(n.name) + '#' + memes.indexOf(n) : code(n.name); };
const nomComp = m => (m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name) : '?');
const lie = d => !!(d && d.boundVariables && d.boundVariables.value);
const out = {};
for (const id of IDS) {
  const r = await figma.getNodeByIdAsync(id);
  if (!r) { out[id] = 'introuvable'; continue; }
  const pieces = [], textes = [];
  async function walk(n, chemin) {
    if (n.visible === false) return;
    if (n.id !== r.id && n.type === 'INSTANCE') {
      const m = await n.getMainComponentAsync();
      const p = Object.entries(n.componentProperties).filter(([, d]) => !lie(d)).map(([k, d]) => k.split('#')[0] + '=' + (typeof d.value === 'string' ? d.value.slice(0, 40) : d.value)).join(', ');
      pieces.push(chemin + ' ⇐ ' + nomComp(m) + (p ? ' {' + p + '}' : ''));
    }
    if (n.type === 'TEXT' && n.characters.trim()) textes.push(chemin + ' : ' + n.characters.replace(/\s+/g, ' ').trim().slice(0, 80));
    if ('children' in n) for (const c of n.children) await walk(c, chemin + '/' + cle(c, n));
  }
  await walk(r, '');
  out[id] = { nom: r.name, taille: Math.round(r.width) + 'x' + Math.round(r.height), pieces, textes };
}
return out;
