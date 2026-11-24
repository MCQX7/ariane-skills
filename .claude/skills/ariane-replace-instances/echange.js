// Ariane — échange d'instances vers la proposition (étape ariane-replace-instances). SCRIPT FIXE : se colle tel quel ;
// seule la ligne PARAMÈTRES change. ÉCRIT dans le fichier : seulement sur les instances d'IDS (sur une branche).
// ANCIEN : id du set (ou du composant) remplacé. NOUVEAU : id du set de la proposition.
// IDS : ids des instances de l'ancien à échanger (une page à la fois, quelques dizaines au plus par appel).
// TABLE : la table de correspondance validée par le designer :
//   variantes : liste ordonnée de règles { de: {propriété: valeur | '*'}, vers: {propriété: valeur | '=propriétéAncienne'} } ;
//               la première qui correspond donne la variante cible ;
//   variantesParSignature : { signature: {propriété: valeur} } — exception pour une signature (un réglage fait à la
//               main qui correspond à une autre variante de la proposition) ;
//   remises   : { signature: [ { chemin, prop, valeur } | { chemin, visible } | { chemin, texte } ] } — chemin DANS LA
//               PROPOSITION, tel que le rendent etat.js et controle.js ('' = l'instance elle-même) ;
//   remisesParInstance : { id: [ même forme ] } — un texte saisi propre à une instance, par exemple ;
//   signatures: { id: signature } — OBLIGATOIRE pour chaque id : celle du relevé, revérifiée avant l'échange.
// LARGEUR : 'COMME_AVANT' (la largeur et son mode d'avant sont reposés) ou 'REMPLIR' (remplissage du conteneur quand le
//   parent est en mise en page automatique, sinon comme avant) — c'est une décision de la table, pas une règle.
// GARDER_TEXTES : true = les propriétés texte de l'ancienne instance sont reposées sur les propriétés texte de même nom.
// REALIGNER : true = une pièce imbriquée dont une propriété reliée à une variable a basculé avec le mode de l'écran
//   reprend les autres réglages et la taille qu'elle a dans la variante cible ; fait avant les remises, qui gardent le
//   dernier mot.
// Rend, par instance : vert (conforme), orange (écart listé, on continue) ou rouge (arrêt : les suivantes ne sont pas
// faites ; « modifiée » dit si l'échange avait déjà eu lieu — à traiter avant toute relance).
// PARAMÈTRES
const ANCIEN = '0:0'; const NOUVEAU = '0:0'; const IDS = []; const TABLE = { variantes: [], variantesParSignature: {}, remises: {}, remisesParInstance: {}, signatures: {} }; const LARGEUR = 'COMME_AVANT'; const GARDER_TEXTES = true; const REALIGNER = true;

const T0 = Date.now(), BUDGET = 25000;
figma.skipInvisibleInstanceChildren = false;
const set = await figma.getNodeByIdAsync(NOUVEAU), vieux = await figma.getNodeByIdAsync(ANCIEN);
if (!set || !vieux || NOUVEAU === '0:0' || ANCIEN === '0:0' || !IDS.length) return { erreur: 'PARAMÈTRES non remplis' };
const anciennesIds = new Set((vieux.type === 'COMPONENT_SET' ? vieux.children : [vieux]).map(v => v.id));
const cibles = set.type === 'COMPONENT_SET' ? set.children : [set];
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
    const [nomCode, idx] = seg.split('#'); const nom = decodeURIComponent(nomCode);
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

const rapport = []; let arret = null, k = 0;
for (; k < IDS.length; k++) {
  if (Date.now() - T0 > BUDGET) break;
  const id = IDS[k]; let modifiee = false;
  try {
    const i = await figma.getNodeByIdAsync(id);
    if (!i || i.type !== 'INSTANCE') throw new Error('instance introuvable');
    const ancienne = await i.getMainComponentAsync();
    if (!ancienne || !anciennesIds.has(ancienne.id)) throw new Error('pas une instance de l’ancien (déjà échangée ?)');
    for (let p = i.parent; p; p = p.parent) if (p.type === 'COMPONENT' || p.type === 'COMPONENT_SET' || p.type === 'INSTANCE') throw new Error('posée dans un autre composant : à mettre à part');
    const sig = hache(ancienne.name + '||' + sansTextes(await ecarts(i)).join('\n'));
    if (!TABLE.signatures[id]) throw new Error('signature du relevé absente de la table');
    if (TABLE.signatures[id] !== sig) throw new Error('réglages changés depuis le relevé (signature ' + sig + ')');
    const va = vprops(ancienne);
    const regle = TABLE.variantes.find(r => Object.entries(r.de).every(([p, v]) => v === '*' || va[p] === v));
    if (!regle) throw new Error('aucune règle de variante pour ' + ancienne.name);
    const voulu = {}; for (const [p, v] of Object.entries(regle.vers)) voulu[p] = typeof v === 'string' && v.startsWith('=') ? va[v.slice(1)] : v;
    Object.assign(voulu, (TABLE.variantesParSignature || {})[sig] || {});
    const cible = cibles.find(c => Object.entries(voulu).every(([p, v]) => vprops(c)[p] === v));
    if (!cible) throw new Error('variante cible absente : ' + JSON.stringify(voulu));
    const p = i.parent, rang = p.children.indexOf(i), w = i.width, lh = i.layoutSizingHorizontal;
    const auto = p.layoutMode && p.layoutMode !== 'NONE' && i.layoutPositioning !== 'ABSOLUTE';
    const textesAvant = {}; if (GARDER_TEXTES) for (const [kk, d] of Object.entries(i.componentProperties)) if (d.type === 'TEXT') textesAvant[kk.split('#')[0]] = d.value;
    i.swapComponent(cible); modifiee = true;
    i.removeOverrides();
    if (LARGEUR === 'REMPLIR' && auto) i.layoutSizingHorizontal = 'FILL';
    else if (auto && (lh === 'FILL' || lh === 'HUG')) i.layoutSizingHorizontal = lh;
    else { i.resize(w, i.height); }
    if (cible.layoutMode && cible.layoutMode !== 'NONE' && (cible.layoutMode === 'VERTICAL' ? cible.primaryAxisSizingMode : cible.counterAxisSizingMode) === 'AUTO') try { i.layoutSizingVertical = 'HUG'; } catch (e) {}
    let realignes = 0;
    if (REALIGNER) {
      const src = cible.findAll(n => n.type === 'INSTANCE'), dst = i.findAll(n => n.type === 'INSTANCE');
      if (src.length === dst.length) for (let j = 0; j < dst.length; j++) {
        const d = dst[j], s = src[j]; if (d.name !== s.name) continue;
        const sp = s.componentProperties, dp = d.componentProperties;
        const derive = Object.entries(dp).some(([kk, dv]) => lie(dv) && sp[kk] && sp[kk].value !== dv.value);
        if (!derive) continue;
        const maj = {};
        for (const [kk, dv] of Object.entries(dp)) { if (lie(dv) || !sp[kk]) continue; if (sp[kk].value !== dv.value) maj[kk] = sp[kk].value; }
        if (Object.keys(maj).length) d.setProperties(maj);
        for (const ax of ['layoutSizingHorizontal', 'layoutSizingVertical']) if (s[ax] && d[ax] !== s[ax]) try { d[ax] = s[ax]; } catch (e) {}
        realignes++;
      }
    }
    if (GARDER_TEXTES) { const maj = {}; for (const [kk, d] of Object.entries(i.componentProperties)) { const n = kk.split('#')[0]; if (d.type === 'TEXT' && n in textesAvant && textesAvant[n] !== d.value) maj[kk] = textesAvant[n]; } if (Object.keys(maj).length) i.setProperties(maj); }
    const remises = (TABLE.remises[sig] || []).concat((TABLE.remisesParInstance || {})[id] || []);
    const nonFaites = [];
    for (const r of remises) {
      const n = r.chemin ? trouve(i, r.chemin) : i;
      if (!n) { nonFaites.push(r.chemin + ' introuvable'); continue; }
      if ('visible' in r) n.visible = r.visible;
      else if ('texte' in r) { const fonts = n.characters.length ? n.getRangeAllFontNames(0, n.characters.length) : [n.fontName]; await Promise.all(fonts.map(f => figma.loadFontAsync(f))); n.characters = r.texte; }
      else if ('prop' in r) { const kk = Object.keys(n.componentProperties).find(x => x.split('#')[0] === r.prop); if (!kk) nonFaites.push(r.chemin + ' ' + r.prop + ' absente'); else if (String(n.componentProperties[kk].value) !== String(r.valeur)) n.setProperties({ [kk]: r.valeur }); }
    }
    const attendus = new Set(remises.map(r => (r.chemin || '') + ' | ' + ('visible' in r ? 'visible=' + r.visible : 'texte' in r ? 'texte=' + JSON.stringify(String(r.texte).replace(/\s+/g, ' ').slice(0, 60)) : r.prop + '=' + (typeof r.valeur === 'string' && /"/.test(JSON.stringify(r.valeur)) ? r.valeur : r.valeur))));
    const reste = (await ecarts(i, cible)).filter(e => !attendus.has(e) && !remises.some(r => e.startsWith((r.chemin || '') + ' |') && 'texte' in r || (r.chemin && e.startsWith(r.chemin + '/'))) && sansTextes([e]).length);
    const deb = debordements(i);
    const ecartsListe = [...nonFaites, ...reste.slice(0, 6), ...(reste.length > 6 ? ['… ' + reste.length + ' écarts en tout'] : []), ...deb.slice(0, 4), ...(deb.length > 4 ? ['… ' + deb.length + ' débordements en tout'] : [])];
    if (p.children.indexOf(i) !== rang) ecartsListe.push('rang changé');
    rapport.push([id, ecartsListe.length ? 'orange' : 'vert', cible.name, Math.round(i.width) + 'x' + Math.round(i.height), realignes, ecartsListe]);
  } catch (e) { rapport.push([id, 'rouge', String(e.message || e), modifiee ? 'modifiée' : 'non modifiée']); arret = id; k++; break; }
}
return { faits: rapport.length, restants: IDS.slice(k), arret, colonnes: 'id, code, variante cible, taille, pièces réalignées, écarts', rapport, mutatedNodeIds: rapport.filter(r => r[1] !== 'rouge' || r[3] === 'modifiée').map(r => r[0]) };
