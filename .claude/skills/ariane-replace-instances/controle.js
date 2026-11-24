// Ariane — contrôle des instances de la proposition (étape ariane-replace-instances). SCRIPT FIXE : se colle tel quel ;
// seule la ligne PARAMÈTRES change. LECTURE SEULE.
// NOUVEAU : id du set de la proposition. ANCIEN : id du set remplacé (pour compter ce qui reste). IDS : ids à contrôler
// ([] = toutes les instances de la proposition, hors pages « Ariane — » de répétition). L'id d'une instance ne change
// pas à l'échange : il fait le lien avec le relevé (page, écran). DEBUT : 0, puis `suite` tant qu'il n'est pas null.
// Rend, par instance : variante, taille, signature de ses écarts avec sa variante, débordements ; par signature, le
// détail des écarts (à comparer aux remises de la table : tout autre écart est un défaut) ; et les anciennes restantes.
// PARAMÈTRES
const NOUVEAU = '0:0'; const ANCIEN = '0:0'; const IDS = []; const DEBUT = 0;

const T0 = Date.now(), BUDGET = 20000;
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(NOUVEAU), vieux = await figma.getNodeByIdAsync(ANCIEN);
if (!set || NOUVEAU === '0:0') return { erreur: 'PARAMÈTRES : NOUVEAU' };
const nomComp = m => (m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name + ' / ' + m.name : m.name) : '?');
const lie = d => !!(d && d.boundVariables && d.boundVariables.value);
// Bloc commun à releve.js, echange.js, controle.js et etat.js : le garder identique (sinon les signatures divergent).
const code = s => s.replace(/%/g, '%25').replace(/\//g, '%2F').replace(/#/g, '%23');
const cle = (n, parent) => { const memes = parent ? parent.children.filter(c => c.name === n.name) : [n]; return memes.length > 1 ? code(n.name) + '#' + memes.indexOf(n) : code(n.name); };
async function ecarts(inst, ref0) {
  const out = [];
  async function walk(a, b, chemin) {
    if (a.visible !== b.visible) out.push(chemin + ' | visible=' + a.visible);
    if (a.type === 'TEXT' && b.type === 'TEXT' && a.characters !== b.characters) out.push(chemin + ' | texte=' + JSON.stringify(a.characters.replace(/\s+/g, ' ').slice(0, 60)));
    let ref = b;
    if (a.type === 'INSTANCE' && b.type === 'INSTANCE') {
      const pa = a.componentProperties, pb = b.componentProperties;
      for (const [k, d] of Object.entries(pa)) {
        if (lie(d) || d.type === 'TEXT') continue;
        if (!pb[k] || pb[k].value !== d.value) out.push(chemin + ' | ' + k.split('#')[0] + '=' + d.value);
      }
      for (const [k, d] of Object.entries(pa)) if (d.type === 'TEXT' && pb[k] && pb[k].value !== d.value) out.push(chemin + ' | ' + k.split('#')[0] + '=' + JSON.stringify(String(d.value).slice(0, 60)));
      const ma = await a.getMainComponentAsync(), mb = await b.getMainComponentAsync();
      if (ma && mb && ma.id !== mb.id) {
        if (!(ma.parent && mb.parent && ma.parent.id === mb.parent.id && ma.parent.type === 'COMPONENT_SET')) { out.push(chemin + ' | composant=' + nomComp(ma)); return; }
        const meme = 'children' in a && 'children' in b && a.children.length === b.children.length && a.children.every((c, j) => c.name === b.children[j].name && c.type === b.children[j].type);
        if (!meme) ref = ma;
      }
    }
    if (!('children' in a) || !('children' in ref)) return;
    for (let k = 0; k < a.children.length; k++) {
      const c = a.children[k], d = ref.children[k];
      if (!d || d.name !== c.name || d.type !== c.type) { out.push(chemin + '/' + cle(c, a) + ' | structure'); continue; }
      await walk(c, d, chemin + '/' + cle(c, a));
    }
  }
  await walk(inst, ref0 || await inst.getMainComponentAsync(), '');
  return out;
}
const sansTextes = e => e.filter(x => !/ \| (texte=|[^=|]*=")/.test(x));
const hache = s => { let h = 5381; for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) | 0; return (h >>> 0).toString(36); };
const trouve = (racine, chemin) => {
  let n = racine;
  for (const seg of chemin.split('/').filter(Boolean)) {
    const [nom, idx] = seg.split('#');
    const memes = (n.children || []).filter(c => c.name === nom);
    n = memes[idx ? +idx : 0];
    if (!n) return null;
  }
  return n;
};
const vprops = n => { const o = {}; for (const [k, d] of Object.entries(n.variantProperties || {})) o[k] = d; return o; };
const debordements = inst => {
  const out = [];
  for (const n of inst.findAll(() => true)) {
    let vis = true; for (let p = n; p && p.id !== inst.id; p = p.parent) if (!p.visible) { vis = false; break; }
    if (!vis || !n.absoluteBoundingBox || !n.parent || !n.parent.absoluteBoundingBox) continue;
    const a = n.absoluteBoundingBox, b = n.parent.absoluteBoundingBox;
    if (!a.width || !a.height) continue;
    if (a.x < b.x - 1 || a.y < b.y - 1 || a.x + a.width > b.x + b.width + 1 || a.y + a.height > b.y + b.height + 1) out.push(n.name + (n.parent.clipsContent ? ' rogné par ' : ' déborde de ') + n.parent.name);
  }
  const p = inst.parent;
  if (p && p.absoluteBoundingBox && inst.absoluteBoundingBox) {
    const a = inst.absoluteBoundingBox, b = p.absoluteBoundingBox;
    if (a.x + a.width > b.x + b.width + 1 || a.y + a.height > b.y + b.height + 1) out.push('l’instance dépasse ' + p.name);
  }
  return out;
};

let liste = [];
if (IDS.length) for (const id of IDS) { const n = await figma.getNodeByIdAsync(id); if (n) liste.push(n); }
else for (const v of (set.type === 'COMPONENT_SET' ? set.children : [set])) for (const i of await v.getInstancesAsync()) liste.push(i);
liste.sort((a, b) => (a.id < b.id ? -1 : 1));
let anciennes = null;
if (vieux && DEBUT === 0) { anciennes = { ecran: 0, dansMaster: 0, dansInstance: 0 }; for (const v of (vieux.type === 'COMPONENT_SET' ? vieux.children : [vieux])) for (const i of await v.getInstancesAsync()) { let cas = 'ecran'; let pgA = null; for (let p = i.parent; p; p = p.parent) if (p.type === 'PAGE') { pgA = p.name.trim(); break; } if (pgA && pgA.startsWith('Ariane —')) continue; for (let p = i.parent; p; p = p.parent) { if (p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') { cas = 'dansMaster'; break; } if (p.type === 'INSTANCE') cas = 'dansInstance'; } anciennes[cas]++; } }
const instances = [], combos = {};
let k = DEBUT;
for (; k < liste.length; k++) {
  if (Date.now() - T0 > BUDGET) break;
  const i = liste[k];
  const m = await i.getMainComponentAsync();
  if (!m || (m.parent ? m.parent.id : m.id) !== set.id && m.id !== set.id) { instances.push([i.id, 'pas une instance de la proposition']); continue; }
  const e = await ecarts(i);
  let pg = null; for (let p = i.parent; p; p = p.parent) if (p.type === 'PAGE') { pg = p.name.trim(); break; }
  if (!IDS.length && pg && pg.startsWith('Ariane —')) continue;
  const sig = hache(m.name + '||' + sansTextes(e).join('\n'));
  if (!combos[sig]) combos[sig] = { variante: m.name, n: 0, exemple: i.id, ecarts: sansTextes(e) };
  combos[sig].n++;
  const deb = debordements(i);
  instances.push([i.id, pg, m.name, Math.round(i.width) + 'x' + Math.round(i.height), sig, deb.length ? deb.slice(0, 4).concat(deb.length > 4 ? ['… ' + deb.length + ' en tout'] : []) : [], e.filter(x => !sansTextes([x]).length)]);
}
return { total: liste.length, lus: k - DEBUT, suite: k < liste.length ? k : null, anciennes, colonnes: 'id, page, variante, taille, signature, débordements, textes (hors signature)', instances, combos };
