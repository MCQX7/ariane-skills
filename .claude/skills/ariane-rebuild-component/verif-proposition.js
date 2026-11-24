// Ariane — vérification d'une proposition (planche, ou set posé seul), étape 4 d'ariane-rebuild-component. SCRIPT FIXE :
// se colle tel quel dans use_figma ; seule la ligne PARAMÈTRES change. Ne rien réécrire ni « adapter » du reste.
// LECTURE SEULE : n'écrit rien dans le fichier.
// PROPOSITION : id de la copie ; ORIGINAL : id de l'original. Chacun peut être une planche (cadre ou section) ou un
// component set / un composant posé seul : le script prend les sets et composants du nœud reçu (le nœud lui-même s'il en
// est un). Pour un set ou un composant posé seul, ses pièces rangées hors de lui comptent avec lui : côté copie, les
// composants locaux qu'il pose (à toute profondeur) et dont le nom porte « (proposition) » ; côté original, ceux qu'il
// pose et qui sont des pièces — marqueur `.` ou `_`, ou posés seulement par l'original (et par la copie, si elle
// l'appelle encore). `perimetre` dit ce qui a été pris de chaque côté.
// DEBUT : 0, puis le champ `suite` du retour précédent tant qu'il n'est pas null (les listes se cumulent à la main).
// DESSIN : false pour la vérification ; true pour la COMPARAISON DU DESSIN (appel à part, mêmes ids, DEBUT = 0 puis
// `suite`) : chaque cas pratique de la proposition (instance d'un composant de la copie, posée dans la planche hors des
// composants) face à celui de même rang dans l'original ; ou, si PAIRES n'est pas vide, chaque paire [id dans l'original,
// id dans la proposition] qu'elle donne (une variante de l'original face à une instance temporaire de la copie réglée
// pareil). Pour chacun, ce qui s'affiche — textes (contenu, police, taille, couleur), fonds, contours, effets, images —
// avec sa place et sa taille au pixel près, relatives au cas, et l'opacité : celle de chaque calque multipliée par celle
// de ses parents jusqu'au cas, et celle de chaque peinture (couleur, image, dégradé). Rend chaque cas qui diffère : ce
// que l'original montre et la proposition non (`manque`), et l'inverse (`enPlus`). 0 écart attendu. Un texte dont seul
// le contenu change (même place, même police, même couleur) sort à part (`contenus`) : une valeur, pas un dessin.
// Aucun cas pratique d'un côté ni de l'autre (un set posé seul, par exemple) n'est pas une erreur : rien n'est comparé,
// et `nonFait` le dit — le rendu des variantes se compare alors avec PAIRES.
// nonFait : ce qui n'a pas pu être vérifié, et pourquoi. Rien ne se saute en silence : chaque ligne se reprend dans le
// compte rendu.
// PARAMÈTRES
const PROPOSITION = '0:0'; const ORIGINAL = '0:0'; const DEBUT = 0; const DESSIN = false; const PAIRES = [];

const T0 = Date.now(), BUDGET = 20000;
figma.skipInvisibleInstanceChildren = false;
const planche = await figma.getNodeByIdAsync(PROPOSITION);
const origine = await figma.getNodeByIdAsync(ORIGINAL);
if (!planche) return { erreur: 'planche de proposition introuvable : ' + PROPOSITION };
if (PROPOSITION === ORIGINAL || PROPOSITION === '0:0' || ORIGINAL === '0:0' || !origine) return { erreur: 'PARAMÈTRES non remplis : PROPOSITION et ORIGINAL doivent être les ids des deux planches (ou des deux sets)' };
const RECUS = ['FRAME', 'SECTION', 'GROUP', 'COMPONENT_SET', 'COMPONENT'];
if (!RECUS.includes(planche.type)) return { erreur: 'PROPOSITION doit être une planche (cadre ou section) ou un set / composant, pas : ' + planche.type };
const dans = (n, racine) => { for (let p = n; p; p = p.parent) if (p.id === racine.id) return true; return false; };
const nonFait = [];
// le périmètre de chaque côté : le nœud reçu, plus, pour un set ou un composant posé seul, ses pièces rangées hors de lui
const estMaster = n => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET'));
const proprio = m => (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m);
const atteintes = async racine => {
  const vus = new Map(), file = [racine];
  while (file.length) {
    const c = file.pop();
    for (const x of c.findAllWithCriteria({ types: ['INSTANCE'] })) {
      const m = await x.getMainComponentAsync(); if (!m || m.remote) continue;
      const s = proprio(m); if (s.id === racine.id || dans(s, racine) || vus.has(s.id)) continue;
      vus.set(s.id, s); file.push(s);
    }
  }
  return [...vus.values()];
};
const seul = n => n.type === 'COMPONENT_SET' || n.type === 'COMPONENT';
const racinesProp = [seul(planche) ? proprio(planche) : planche];
if (seul(planche)) for (const s of await atteintes(racinesProp[0])) if (/\(proposition\)/i.test(s.name)) racinesProp.push(s);
const dansProp = n => racinesProp.some(r => dans(n, r));
const racinesOrig = [seul(origine) ? proprio(origine) : origine];
if (seul(origine)) {
  const candidates = await atteintes(racinesOrig[0]), ids = new Set([racinesOrig[0].id, ...candidates.map(c => c.id)]);
  for (const s of candidates) {
    if (/^[._]/.test(s.name)) { racinesOrig.push(s); continue; }
    let seulementOriginal = true;
    for (const v of (s.type === 'COMPONENT_SET' ? s.children.filter(x => x.type === 'COMPONENT') : [s])) {
      for (const x of await v.getInstancesAsync()) {
        if (dansProp(x)) continue;
        let haut = null; for (let p = x.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') haut = proprio(p);
        if (!haut || !ids.has(haut.id)) { seulementOriginal = false; break; }
      }
      if (!seulementOriginal) break;
    }
    if (seulementOriginal) racinesOrig.push(s);
  }
}
const dansOrig = n => racinesOrig.some(r => dans(n, r));
const racineIds = new Set(racinesProp.map(r => r.id));
const chemin = n => { const t = []; for (let p = n; p && !racineIds.has(p.id) && t.length < 5; p = p.parent) t.unshift(p.name); if (racinesProp.length > 1) { let r = n; while (r && !racineIds.has(r.id)) r = r.parent; if (r && r.id !== racinesProp[0].id) t.unshift(r.name); } return t.join(' > '); };
const dit = (n, racines) => ({ recu: seul(n) ? n.type + ' posé seul' : 'planche (' + n.type + ')', nom: n.name, piecesHorsDuSet: racines.slice(1).map(r => r.name) });
const perimetre = { proposition: dit(planche, racinesProp), original: dit(origine, racinesOrig) };
if (seul(origine)) perimetre.original.regle = 'pièces de l’original rangées hors du set : marqueur . ou _, ou posées seulement par l’original ; un autre composant local qu’il pose est jugé comme un composant du DS (partages s’il est posé par la copie)';

if (DESSIN) {
  // les cas pratiques d'une planche : instances de ses propres composants, posées hors des composants, dans l'ordre
  const cas = async (racines, dansCote) => { const l = []; for (const racine of racines) for (const n of racine.findAll(n => { if (n.type !== 'INSTANCE') return false; for (let p = n.parent; p && p.id !== racine.id; p = p.parent) if (p.type === 'INSTANCE' || p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') return false; return true; })) { const m = await n.getMainComponentAsync(); if (m && dansCote(m)) l.push(n); } return l; };
  let A, B;
  if (PAIRES.length) { A = []; B = []; for (const [a, b] of PAIRES) { const na = await figma.getNodeByIdAsync(a), nb = await figma.getNodeByIdAsync(b); if (!na || !nb) return { erreur: 'paire introuvable : ' + a + ' / ' + b }; A.push(na); B.push(nb); } }
  else { A = await cas(racinesOrig, dansOrig); B = await cas(racinesProp, dansProp); }
  if (!A.length && !B.length) { nonFait.push('rendu des cas pratiques : ni l’original ni la proposition n’ont de cas pratique (instance posée dans la planche hors des composants) — rien n’est comparé ; pour comparer le dessin des variantes, repasser avec PAIRES (une variante de l’original, une instance temporaire de la copie réglée pareil)'); return { dessin: true, cas: 0, compares: 0, suite: null, identiques: 0, differents: [], contenusSeuls: [], perimetre, nonFait, verdict: 'aucun cas pratique : rien comparé (voir nonFait)' }; }
  if (!A.length) return { erreur: 'aucun cas pratique dans la planche : donner PAIRES (une variante de l’original, une instance de la copie réglée pareil)' };
  if (A.length !== B.length) return { erreur: 'appariement impossible : ' + A.length + ' cas pratiques dans l’original, ' + B.length + ' dans la proposition — comparer les cas un par un' };
  const r = v => Math.round(v);
  // l'opacité d'une peinture, quel que soit son type ; pour un dégradé, aussi celle de ses arrêts quand l'un est transparent
  const opP = p => (p.opacity != null && p.opacity < 1 ? '@' + Math.round(p.opacity * 100) : '') + (Array.isArray(p.gradientStops) && p.gradientStops.some(s => s.color && s.color.a < 1) ? '[' + p.gradientStops.map(s => Math.round((s.color ? s.color.a : 1) * 100)).join('/') + ']' : '');
  const peint = p => p.type === 'SOLID' ? '#' + [p.color.r, p.color.g, p.color.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('') + opP(p) : p.type === 'IMAGE' ? 'image' + opP(p) : p.type.toLowerCase() + opP(p);
  // l'arrondi rendu : plafonné à la demi-taille ; un cercle vaut un carré arrondi au maximum (même dessin)
  const rayon = n => { if (!('cornerRadius' in n) && n.type !== 'ELLIPSE') return ''; const m = Math.min(n.width, n.height) / 2; if (n.type === 'ELLIPSE') return Math.abs(n.width - n.height) < 0.5 ? ' r' + r(m) : ' ovale'; const c = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map(x => r(Math.min(x || 0, m))); return c.every(x => x === c[0]) ? (c[0] ? ' r' + c[0] : '') : ' r' + c.join('/'); };
  const dessin = c => {
    const o = c.absoluteBoundingBox, out = [];
    const pile = [[c, 1]];
    while (pile.length) {
      const [n, op] = pile.pop();
      if (n.visible === false) continue;
      const opa = op * (n.opacity == null ? 1 : n.opacity); if (opa === 0) continue;
      // l'opacité cumulée se dit même pour un calque sans boîte (elle était perdue avec sa place)
      const bb = n.absoluteBoundingBox; const ou = (bb ? ' @' + r(bb.x - o.x) + ',' + r(bb.y - o.y) + ' ' + r(bb.width) + '×' + r(bb.height) : '') + (opa < 1 ? ' op' + Math.round(opa * 100) : '');
      const vis = l => Array.isArray(l) ? l.filter(p => p.visible !== false) : [];
      if (n.type === 'TEXT') {
        const f = n.fontName === figma.mixed ? 'mixte' : n.fontName.family + ' ' + n.fontName.style, t = n.fontSize === figma.mixed ? 'mixte' : n.fontSize;
        out.push('texte « ' + n.characters.replace(/\s+/g, ' ').slice(0, 30) + ' » ' + f + ' ' + t + ' ' + vis(n.fills).map(peint).join('+') + ou);
      } else if (vis(n.fills).length) out.push('fond ' + vis(n.fills).map(peint).join('+') + rayon(n) + ou);
      if (vis(n.strokes).length && n.strokeWeight !== 0) out.push('contour ' + vis(n.strokes).map(peint).join('+') + ' ' + (n.strokeWeight === figma.mixed ? 'mixte' : n.strokeWeight) + ou);
      for (const e of vis(n.effects || [])) out.push('effet ' + e.type.toLowerCase() + ' ' + (e.radius || 0) + (e.color ? ' ' + peint({ type: 'SOLID', color: e.color, opacity: e.color.a }) : '') + ou);
      if ('children' in n) for (const k of n.children) pile.push([k, opa]);
    }
    return out;
  };
  const differents = [], contenusSeuls = []; let k = DEBUT;
  for (; k < A.length; k++) {
    if (k > DEBUT && Date.now() - T0 > BUDGET) break;
    const a = dessin(A[k]), b = dessin(B[k]);
    const compte = l => { const m = new Map(); for (const x of l) m.set(x, (m.get(x) || 0) + 1); return m; };
    const ca = compte(a), cb = compte(b), manque = [], enPlus = [];
    for (const [x, n] of ca) for (let i = (cb.get(x) || 0); i < n; i++) manque.push(x);
    for (const [x, n] of cb) for (let i = (ca.get(x) || 0); i < n; i++) enPlus.push(x);
    // un texte à la même place, même police, même couleur, dont seul le contenu change : un contenu, pas un dessin
    const sansContenu = x => x.startsWith('texte « ') ? x.replace(/« .*? »/, '«»').replace(/@(-?\d+,-?\d+) \d+×(\d+)/, '@$1 $2') : null;
    const contenus = [];
    for (let i = manque.length - 1; i >= 0; i--) { const c = sansContenu(manque[i]); if (!c) continue; const j = enPlus.findIndex(y => sansContenu(y) === c); if (j < 0) continue; contenus.push(manque[i].match(/« (.*?) »/)[1] + ' → ' + enPlus[j].match(/« (.*?) »/)[1]); manque.splice(i, 1); enPlus.splice(j, 1); }
    const ta = r(A[k].width) + '×' + r(A[k].height), tb = r(B[k].width) + '×' + r(B[k].height);
    if (manque.length || enPlus.length || ta !== tb) differents.push({ rang: k, original: A[k].name + ' (' + A[k].id + ')', proposition: B[k].name + ' (' + B[k].id + ')', taille: ta === tb ? ta : ta + ' → ' + tb, manque: manque.slice(0, 6), enPlus: enPlus.slice(0, 6), ecarts: manque.length + enPlus.length, ...(contenus.length ? { contenus } : {}) });
    else if (contenus.length) contenusSeuls.push({ rang: k, proposition: B[k].name + ' (' + B[k].id + ')', contenus });
  }
  return { dessin: true, cas: A.length, compares: k - DEBUT, suite: k < A.length ? k : null, identiques: (k - DEBUT) - differents.length - contenusSeuls.length, differents: differents.slice(0, 15), contenusSeuls: contenusSeuls.slice(0, 15), perimetre, nonFait, verdict: k < A.length ? 'incomplet : relancer avec DEBUT = suite' : differents.length ? 'ÉCART DE DESSIN' : 'même dessin' };
}

// 1. Liens vers l'ancien : toute instance de la copie (cas pratiques et instances imbriquées compris)
//    doit pointer vers un composant de la copie, ou vers un composant de librairie.
//    Un composant du fichier hors de l'original est rangé à part (partages) : légitime s'il a sa propre planche.
const instances = racinesProp.flatMap(r => r.findAllWithCriteria({ types: ['INSTANCE'] }));
const liensAnciens = [], partages = [], sansMaster = [];
let i = DEBUT;
for (; i < instances.length; i++) {
  if (Date.now() - T0 > BUDGET) break;
  const inst = instances[i];
  const m = await inst.getMainComponentAsync();
  if (!m) { sansMaster.push(chemin(inst)); continue; }
  if (m.remote || dansProp(m)) continue;
  const maitre = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name + ' / ' + m.name : m.name;
  if (origine && dansOrig(m)) liensAnciens.push({ instance: chemin(inst), pointeVers: maitre, ou: 'planche d\'origine' });
  else partages.push({ instance: chemin(inst), pointeVers: maitre, ou: 'ailleurs dans le fichier' });
}
const suite = i < instances.length ? i : null;

// 2. Réglages sans effet (au premier appel seulement) : une propriété booléenne, texte ou d'échange
//    d'instance qu'aucun calque d'une variante n'utilise ne fait rien dans cette variante. Les calques
//    des instances imbriquées comptent (un texte d'une pièce relié à la propriété du master).
const sansEffet = [], textesMasques = [], nomsSansProposition = [];
if (DEBUT === 0) {
  const masters = racinesProp.flatMap(r => estMaster(r) ? [r] : r.findAll(n => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET'))));
  if (!masters.length) nonFait.push('réglages sans effet, textes masqués, noms « (proposition) » : aucun set ni composant trouvé dans PROPOSITION (' + planche.name + ')');
  for (const ma of masters) {
    if (!/\(proposition\)/i.test(ma.name)) nomsSansProposition.push(ma.name);
    const variantes = ma.type === 'COMPONENT_SET' ? ma.children.filter(v => v.type === 'COMPONENT') : [ma];
    let defs; try { defs = ma.componentPropertyDefinitions; } catch (e) { nonFait.push('réglages sans effet de ' + ma.name + ' : propriétés illisibles (' + String(e).slice(0, 60) + ')'); continue; }
    const cles = Object.keys(defs).filter(k => defs[k].type !== 'VARIANT');
    if (!cles.length) continue;
    const utilise = new Map(cles.map(k => [k, []]));
    for (const v of variantes) {
      const vues = new Set();
      const pile = [v];
      while (pile.length) {
        const n = pile.pop();
        const refs = n.componentPropertyReferences;
        if (refs) for (const r of Object.values(refs)) vues.add(r);
        if ('children' in n) pile.push(...n.children);
      }
      for (const k of cles) if (!vues.has(k)) utilise.get(k).push(v.name);
    }
    // Un texte d'une pièce exposée que la variante masque (sans on/off pour le rallumer) s'affiche au panneau sans effet.
    for (const v of variantes) for (const e of v.findAll(n => n.type === 'INSTANCE' && n.isExposedInstance)) {
      let props; try { props = e.componentProperties; } catch (x) { continue; }
      for (const [k, d] of Object.entries(props)) if (d.type === 'TEXT') {
        const cible = e.findOne(n => n.componentPropertyReferences && n.componentPropertyReferences.characters === k);
        if (!cible) continue;
        for (let q = cible; q && q.id !== e.id; q = q.parent) if (q.visible === false && !(q.componentPropertyReferences && q.componentPropertyReferences.visible)) { textesMasques.push({ master: ma.name, variante: v.name, piece: e.name, texte: k.split('#')[0] }); break; }
      }
    }
    for (const [k, sans] of utilise) if (sans.length) sansEffet.push({ master: ma.name, propriete: k.split('#')[0], type: defs[k].type, sansEffetDans: sans.length === variantes.length ? 'toutes les variantes' : sans, variantes: variantes.length });
  }
}

// 3. Écarts avec l'original (au premier appel). `perdus` : ce que l'original porte quelque part et que la
//    proposition ne porte nulle part (largeur ou hauteur min/max, ombre, variable reliée, instance exposée). `nouveauxNonRelies` :
//    une valeur brute (couleur, marge, espacement, rayon, contour, texte sans style) présente dans la proposition
//    et brute nulle part dans l'original. `tailles` : les tailles des instances posées hors des composants (cas
//    pratiques), comptées par taille dans chaque planche ; une taille qui n'a pas le même compte des deux côtés.
//    Un set posé seul n'a pas de cas pratique : rien à compter, ce n'est pas un écart.
const ecarts = { perdus: [], nouveauxNonRelies: [], tailles: [] };
if (DEBUT === 0) {
  const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  const NUM = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'counterAxisSpacing', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'strokeWeight'];
  // un composant posé seul compte lui-même (ses fonds, ses marges) ; une planche ou un set, seulement ce qu'ils contiennent
  const releve = racines => {
    const r = { perdables: new Set(), variables: new Set(), bruts: new Set(), tailles: new Map() };
    for (const racine of racines) for (const n of (racine.type === 'COMPONENT' ? [racine] : []).concat(racine.findAll(() => true))) {
      if (n.type === 'INSTANCE' && n.isExposedInstance) r.perdables.add('exposition ' + n.name);
      for (const k of ['minWidth', 'maxWidth', 'minHeight', 'maxHeight']) if (k in n && typeof n[k] === 'number') r.perdables.add(k + ' ' + Math.round(n[k]));
      if ('effects' in n && Array.isArray(n.effects)) for (const e of n.effects) if (e.visible !== false) r.perdables.add(typeof n.effectStyleId === 'string' && n.effectStyleId ? 'style d\'effet ' + n.effectStyleId : 'effet ' + e.type + ' ' + (e.radius || 0) + (e.color ? ' ' + hex(e.color) : ''));
      const bv = n.boundVariables || {};
      for (const v of Object.values(bv)) for (const a of [].concat(v)) if (a && a.id) r.variables.add(a.id);
      for (const champ of ['fills', 'strokes']) if (champ in n && Array.isArray(n[champ])) {
        const style = champ === 'fills' ? n.fillStyleId : n.strokeStyleId;
        for (const p of n[champ]) {
          if (p.boundVariables && p.boundVariables.color) r.variables.add(p.boundVariables.color.id);
          else if (p.type === 'SOLID' && p.visible !== false && !style) r.bruts.add('couleur ' + hex(p.color));
        }
      }
      for (const k of NUM) if (k in n && typeof n[k] === 'number' && n[k] > 0 && !bv[k]) r.bruts.add(k + ' ' + n[k]);
      if (n.type === 'TEXT' && !n.textStyleId && typeof n.fontSize === 'number') r.bruts.add('texte ' + n.fontSize + ' px sans style');
      if (n.type === 'INSTANCE') {
        let pose = true;
        for (let p = n.parent; p && p.id !== racine.id; p = p.parent) if (p.type === 'INSTANCE' || p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') { pose = false; break; }
        if (seul(racine)) pose = false; // tout ce qu'un set ou un composant contient fait partie de lui
        if (pose) { const k = Math.round(n.width) + '×' + Math.round(n.height); const t = r.tailles.get(k) || { n: 0, ex: n.name }; t.n++; r.tailles.set(k, t); }
      }
    }
    return r;
  };
  const a = releve(racinesOrig), b = releve(racinesProp);
  for (const x of a.perdables) if (!b.perdables.has(x)) ecarts.perdus.push(x);
  for (const id of a.variables) if (!b.variables.has(id)) { const v = await figma.variables.getVariableByIdAsync(id); ecarts.perdus.push('variable ' + (v ? v.name : id)); }
  for (const x of b.bruts) if (!a.bruts.has(x)) ecarts.nouveauxNonRelies.push(x);
  for (const k of new Set([...a.tailles.keys(), ...b.tailles.keys()])) {
    const na = a.tailles.get(k), nb = b.tailles.get(k);
    if ((na ? na.n : 0) !== (nb ? nb.n : 0)) ecarts.tailles.push({ taille: k, original: na ? na.n : 0, proposition: nb ? nb.n : 0, exemple: (na || nb).ex });
  }
  perimetre.casPratiques = { original: [...a.tailles.values()].reduce((s, t) => s + t.n, 0), proposition: [...b.tailles.values()].reduce((s, t) => s + t.n, 0) };
}

return { instancesVues: i - DEBUT, instancesTotal: instances.length, suite, liensAnciens, partages, sansMaster, sansEffet, textesMasques, nomsSansProposition, ecarts, perimetre, nonFait,
  verdict: suite !== null ? 'incomplet : relancer avec DEBUT = suite' : (liensAnciens.length || sansMaster.length ? 'ÉCHEC : la proposition appelle encore l\'ancien' : nomsSansProposition.length ? 'ÉCHEC : masters non renommés « (proposition) »' : 'aucun lien vers l\'ancien') };
