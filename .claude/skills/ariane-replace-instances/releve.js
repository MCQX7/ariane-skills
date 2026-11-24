// Ariane — relevé des instances posées d'un composant (étape ariane-replace-instances). SCRIPT FIXE : se colle tel quel
// dans l'outil d'exécution du connecteur Figma officiel ; seule la ligne PARAMÈTRES change. LECTURE SEULE.
// ANCIEN : id du set de variantes (ou du composant) à remplacer. DEBUT : 0, puis le champ `suite` du retour tant qu'il
// n'est pas null (les listes se cumulent à la main). N : instances par appel (le retour du connecteur est limité en
// taille : baisser N si le retour est coupé). DEJA : les signatures déjà détaillées par un lot précédent, qui ne sont
// plus que comptées.
// Les pages dont le nom commence par « Ariane — » (répétition) sont ignorées.
// Rend, par instance : où elle est posée (page, planche de premier niveau, cadre d'écran), sa variante, sa taille, ses modes, et la signature de ses réglages faits à la
// main (différences avec son composant, pièces imbriquées comprises ; les textes saisis sont rendus à part, hors de la
// signature, pour qu'un libellé différent ne fasse pas une signature de plus) ; et, par signature, le détail.
// PARAMÈTRES
const ANCIEN = '0:0'; const DEBUT = 0; const N = 25; const DEJA = [];

const T0 = Date.now(), BUDGET = 20000;
figma.skipInvisibleInstanceChildren = false;
const racine = await figma.getNodeByIdAsync(ANCIEN);
if (!racine || ANCIEN === '0:0') return { erreur: 'PARAMÈTRES : ANCIEN doit être l’id du set ou du composant à remplacer' };
const variantes = racine.type === 'COMPONENT_SET' ? racine.children : [racine];
const toutes = [];
for (const v of variantes) for (const i of await v.getInstancesAsync()) toutes.push(i);
toutes.sort((a, b) => (a.id < b.id ? -1 : 1));

const nomComp = m => (m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name + ' / ' + m.name : m.name) : '?');
const lie = d => !!(d && d.boundVariables && d.boundVariables.value);
// Bloc commun à releve.js, echange.js, controle.js et etat.js : le garder identique (sinon les signatures divergent).
const code = s => s.replace(/%/g, '%25').replace(/\//g, '%2F').replace(/#/g, '%23');
const cle = (n, parent) => { const memes = parent ? parent.children.filter(c => c.name === n.name) : [n]; return memes.length > 1 ? code(n.name) + '#' + memes.indexOf(n) : code(n.name); };
async function ecarts(inst) {
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
  const m = await inst.getMainComponentAsync();
  await walk(inst, m, '');
  return out;
}
const sansTextes = e => e.filter(x => !/ \| (texte=|[^=|]*=")/.test(x));
const hache = s => { let h = 5381; for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) | 0; return (h >>> 0).toString(36); };

const instances = [], combos = {};
let k = DEBUT;
for (; k < toutes.length && k < DEBUT + N; k++) {
  if (Date.now() - T0 > BUDGET) break;
  const i = toutes[k];
  let page = null, ecran = null, cadre = null, cas = 'ecran';
  for (let p = i.parent; p; p = p.parent) {
    if (p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') cas = 'dansMaster';
    else if (p.type === 'INSTANCE' && cas === 'ecran') cas = 'dansInstance';
    if (!cadre && p.type === 'FRAME' && p.parent && (p.parent.type === 'PAGE' || p.parent.type === 'SECTION' || (p.parent.type === 'FRAME' && (!p.parent.layoutMode || p.parent.layoutMode === 'NONE')))) cadre = p.id;
    if (p.parent && p.parent.type === 'PAGE') ecran = p.name + ' ' + p.id;
    if (p.type === 'PAGE') { page = p.name.trim(); break; }
  }
  if (page && page.startsWith('Ariane —')) continue;
  const m = await i.getMainComponentAsync();
  const modes = [];
  for (const [col, mode] of Object.entries(i.resolvedVariableModes || {})) {
    const c = await figma.variables.getVariableCollectionByIdAsync(col);
    if (c && c.defaultModeId !== mode) modes.push(c.name + '=' + ((c.modes.find(x => x.modeId === mode) || {}).name));
  }
  const e = await ecarts(i);
  const sig = hache(m.name + '||' + sansTextes(e).join('\n'));
  if (!combos[sig]) combos[sig] = DEJA.includes(sig) ? { n: 0 } : { variante: m.name, n: 0, exemple: i.id, reglages: sansTextes(e) };
  const textes = e.filter(x => !sansTextes([x]).length);
  combos[sig].n++;
  const p = i.parent;
  instances.push([i.id, page, (ecran || '').split(' ').pop(), cadre, m.name, Math.round(i.width) + 'x' + Math.round(i.height), i.layoutSizingHorizontal, !!(p.layoutMode && p.layoutMode !== 'NONE' && i.layoutPositioning !== 'ABSOLUTE'), cas, modes.join(','), sig, textes]);
}
return { total: toutes.length, lus: k - DEBUT, suite: k < toutes.length ? k : null, colonnes: 'id, page, planche (id), cadre d’écran (à copier pour la répétition), variante, taille, largeur, parentAuto, cas, modes, signature, textes saisis (hors signature)', instances, combos };
