// Ariane — sonde des cadres, passe 1 d'ariane-rename-layers. SCRIPT FIXE : se colle tel quel dans
// use_figma ; seule la ligne PARAMÈTRES change. Ne rien réécrire ni « adapter » du reste.
// RACINES : ids des racines à traiter — un set (ses variantes, dans l'ordre du set), une variante,
// un composant ou un artboard d'écran. DEBUT : [index de racine, id du cadre ou null, 0] ; reprendre avec
// le champ `suite` du retour précédent tant qu'il n'est pas null. APPLIQUER : false = essai à blanc, rien d'écrit.
// UN SET SE TRANCHE EN ENTIER : un cadre se supprime dans toutes les variantes traitées du set ou dans aucune. Le même
// cadre (même chemin de noms depuis la variante, même rang parmi les frères de même nom) est prouvé dans chaque variante
// où il existe ; un seul qui a un effet, ou qui n'est pas une coquille, et il reste partout — sinon la structure devient
// inégale d'une variante à l'autre. Un cadre qu'une instance du composant, posée ailleurs, règle (le masque, le
// recolore…) est gardé : le supprimer casserait ce réglage.
// PARAMÈTRES
const RACINES = ['0:0']; const DEBUT = [0, null, 0]; const APPLIQUER = true;

const T0 = Date.now(), BUDGET = 20000, TOL = 0.5, MARQUE = '__ariane_sonde__';
// les copies d'essai se posent sur la page de la cible : s'y placer d'abord
{ let pg = await figma.getNodeByIdAsync(RACINES[0]); while (pg && pg.type !== 'PAGE') pg = pg.parent; if (pg && pg.id !== figma.currentPage.id) await figma.setCurrentPageAsync(pg); }
for (const n of figma.currentPage.children) if (n.name === MARQUE) n.remove();
const get = id => figma.getNodeByIdAsync(id);
const polices = new Set();
async function chargerPolices(r) {
  for (const t of r.findAllWithCriteria({ types: ['TEXT'] })) {
    let fs; try { fs = t.getRangeAllFontNames(0, t.characters.length); } catch (e) { fs = t.fontName === figma.mixed ? [] : [t.fontName]; }
    for (const f of fs) { const k = f.family + '|' + f.style; if (!polices.has(k)) { await figma.loadFontAsync(f); polices.add(k); } }
  }
}
const enFlux = p => 'layoutMode' in p && p.layoutMode && p.layoutMode !== 'NONE';
const ouvrir = n => n.type !== 'INSTANCE' && n.type !== 'COMPONENT_SET' && 'children' in n;
// Un cadre qui dessine quelque chose (ou porte un comportement) n'est jamais une coquille.
function effetPropre(n) {
  const vis = a => Array.isArray(a) && a.some(p => p.visible !== false);
  if ('fills' in n && vis(n.fills)) return 'fond';
  if ('strokes' in n && vis(n.strokes)) return 'contour';
  if ('effects' in n && vis(n.effects)) return 'effet';
  if (n.opacity !== 1) return 'opacité';
  if (n.blendMode && n.blendMode !== 'PASS_THROUGH' && n.blendMode !== 'NORMAL') return 'fusion';
  if (n.isMask) return 'masque';
  if (n.reactions && n.reactions.length) return 'interaction';
  if (Object.keys(n.componentPropertyReferences || {}).some(k => k !== 'visible')) return 'propriété liée';
  return null;
}
// Liste FIXE : tous les cadres éditables (hors artboard et ses enfants directs, position absolue,
// intérieur d'instance, master imbriqué), du plus profond au moins profond, dans l'ordre du document.
function candidats(r) {
  const out = []; let i = 0; const artboard = r.type !== 'COMPONENT';
  (function rec(n, d) {
    for (const c of n.children) {
      if (c.type === 'INSTANCE' || c.type === 'COMPONENT' || c.type === 'COMPONENT_SET') continue;
      if ((c.type === 'FRAME' || c.type === 'GROUP') && !(artboard && d === 0) && c.layoutPositioning !== 'ABSOLUTE') out.push({ id: c.id, d, i: i++ });
      if ('children' in c) rec(c, d + 1);
    }
  })(r, 0);
  return out.sort((a, b) => b.d - a.d || a.i - b.i).map(o => o.id);
}
function chemin(r, n) { const p = []; while (n.id !== r.id) { p.unshift(n.parent.children.indexOf(n)); n = n.parent; } return p.join('.'); }
function suivre(r, p) { let n = r; if (p) for (const i of p.split('.')) n = n.children[+i]; return n; }
function sousArbre(n, out = []) { for (const c of n.children) { out.push(c); if (ouvrir(c)) sousArbre(c, out); } return out; }
// Mesure de la racine entière : chaque calque hors intérieur d'instance, affiché ou non ; sa boîte
// relative à la racine s'il est affiché (la boîte d'un calque masqué n'est pas à jour) ; ses modes de
// dimensionnement. Clé : chemin (par = true) ou id.
function mesurer(r, par) {
  const o = r.absoluteBoundingBox, m = { _r: [r.width, r.height] };
  (function rec(n, vis) {
    for (const c of n.children) {
      const v = vis && c.visible, e = { v, p: c.layoutPositioning };
      if (v && c.absoluteBoundingBox) { const b = c.absoluteBoundingBox; e.b = [b.x - o.x, b.y - o.y, b.width, b.height]; }
      try { e.s = c.layoutSizingHorizontal + '/' + c.layoutSizingVertical; } catch (x) {}
      if (c.type === 'TEXT') e.t = c.textAutoResize;
      m[par ? chemin(r, c) : c.id] = e;
      if (ouvrir(c)) rec(c, v);
    }
  })(r, true);
  return m;
}
function ecart(a, b, sauf) {
  if (Math.abs(a._r[0] - b._r[0]) > TOL || Math.abs(a._r[1] - b._r[1]) > TOL) return 'taille de la racine';
  for (const k in a) {
    if (k === '_r' || k === sauf) continue;
    const x = a[k], y = b[k];
    if (!y) return 'calque disparu';
    if (x.v !== y.v) return 'affichage';
    if (x.s !== y.s || x.t !== y.t || x.p !== y.p) return 'dimensionnement';
    if (x.b && y.b) for (let i = 0; i < 4; i++) if (Math.abs(x.b[i] - y.b[i]) > TOL) return 'position ou taille';
  }
  return null;
}
function copier(r) {
  const c = r.type === 'COMPONENT' ? r.createInstance().detachInstance() : r.clone();
  figma.currentPage.appendChild(c); c.name = MARQUE; c.x = r.absoluteBoundingBox.x; c.y = r.absoluteBoundingBox.y - 100000;
  return c;
}
// Remonte les enfants dans le parent à la place de la coquille, ordre gardé ; hors flux, position absolue gardée.
function aplatir(s) {
  const p = s.parent, i = p.children.indexOf(s), kids = [...s.children];
  const abs = kids.map(k => [k.absoluteTransform[0][2], k.absoluteTransform[1][2]]);
  kids.forEach((k, j) => {
    p.insertChild(i + j, k);
    if (!enFlux(p) || k.layoutPositioning === 'ABSOLUTE') { k.x += abs[j][0] - k.absoluteTransform[0][2]; k.y += abs[j][1] - k.absoluteTransform[1][2]; }
  });
}
// Preuve sur une COPIE de la racine : l'état affiché, puis chaque état où un calque piloté par une
// propriété ou masqué (la coquille, un de ses descendants, un frère) est inversé ; un ancêtre masqué est
// affiché pour la mesure. Retour : null (inerte partout) | { etat: 'affiché' | 'inversé', motif }.
function prouver(r, s0) {
  const ps = chemin(r, s0), leviers = [];
  for (const n of [s0, ...sousArbre(s0), ...s0.parent.children.filter(x => x !== s0)])
    if ((n.componentPropertyReferences || {}).visible || !n.visible) leviers.push(chemin(r, n));
  const c = copier(r);
  try {
    const s = suivre(c, ps);
    for (let a = s.parent; a.id !== c.id; a = a.parent) if (!a.visible) a.visible = true;
    const lv = leviers.map(p => suivre(c, p));
    const avant = [mesurer(c)];
    for (const n of lv) { n.visible = !n.visible; avant.push(mesurer(c)); n.visible = !n.visible; }
    if (s.clipsContent) {
      const b = s.absoluteBoundingBox;
      for (const d of sousArbre(s)) { const e = d.visible && d.absoluteBoundingBox; if (e && (e.x < b.x - TOL || e.y < b.y - TOL || e.x + e.width > b.x + b.width + TOL || e.y + e.height > b.y + b.height + TOL)) return { etat: 'affiché', motif: 'rognage' }; }
    }
    const sid = s.id; aplatir(s); if (!s.removed) s.remove();
    const apres = [mesurer(c)];
    for (const n of lv) { if (n.removed) { apres.push(apres[0]); continue; } n.visible = !n.visible; apres.push(mesurer(c)); n.visible = !n.visible; }
    for (let k = 0; k < avant.length; k++) { const e = ecart(avant[k], apres[k], sid); if (e) return { etat: k ? 'inversé' : 'affiché', motif: e }; }
    return null;
  } finally { c.remove(); }
}
function capter(kids) {
  return kids.map(k => { const e = { k, w: k.width, h: k.height, x: k.x, y: k.y, p: k.layoutPositioning };
    try { e.sh = k.layoutSizingHorizontal; e.sv = k.layoutSizingVertical; } catch (x) {}
    if (k.type === 'TEXT') e.t = k.textAutoResize; return e; });
}
function remettre(s, cap, vis) {
  cap.forEach((e, j) => s.insertChild(j, e.k));
  for (const e of cap) {
    const k = e.k;
    if (e.t) k.textAutoResize = e.t;
    if (k.layoutPositioning !== e.p) try { k.layoutPositioning = e.p; } catch (x) {}
    if ((k.type !== 'TEXT' || e.t === 'NONE') && (e.sh === 'FIXED' || !enFlux(s))) try { k.resize(e.w, e.h); } catch (x) {}
    try { if (e.sh) { k.layoutSizingHorizontal = e.sh; k.layoutSizingVertical = e.sv; } } catch (x) {}
    if (!enFlux(s) || e.p === 'ABSOLUTE') { k.x = e.x; k.y = e.y; }
  }
  s.visible = vis;
}
const ids = [];
for (const id of RACINES) { const n = await get(id); if (n.type === 'COMPONENT_SET') n.children.forEach(v => ids.push(v.id)); else ids.push(id); }
const noeuds = []; for (const id of ids) noeuds.push(await get(id));
const setDe = r => (r && r.type === 'COMPONENT' && r.parent && r.parent.type === 'COMPONENT_SET') ? r.parent.id : null;
// clé d'un cadre dans sa variante : les noms depuis la variante, avec le rang parmi les frères de même nom
const SEP = '\u0001';
function cle(r, n) { const p = []; while (n.id !== r.id) { const fr = n.parent.children.filter(x => x.name === n.name); p.unshift(n.name + SEP + fr.indexOf(n)); n = n.parent; } return p.join(SEP + SEP); }
function trouver(r, k) { let n = r; for (const pas of k.split(SEP + SEP)) { const [nom, rg] = pas.split(SEP); if (!('children' in n) || n.type === 'INSTANCE') return null; n = n.children.filter(x => x.name === nom)[+rg]; if (!n) return null; } return n; }
// le même cadre dans les autres variantes traitées du même set
function homologues(ri, s) {
  const st = setDe(noeuds[ri]); if (!st) return [];
  const k = cle(noeuds[ri], s), out = [];
  for (let rj = 0; rj < noeuds.length; rj++) { if (rj === ri || setDe(noeuds[rj]) !== st) continue; const h = trouver(noeuds[rj], k); if (h && !h.removed) out.push({ rj, w: noeuds[rj], h }); }
  return out;
}
// un cadre qu'une instance de ce composant, posée ailleurs, règle (le masque, le recolore…) n'est pas une coquille :
// le supprimer casserait ce réglage. L'id d'un calque surchargé dans une instance finit par « ;<id du calque> ».
const instancesDe = new Map();
async function regleDehors(r, s) {
  if (r.type !== 'COMPONENT') return false;
  if (!instancesDe.has(r.id)) { let l = []; try { l = await r.getInstancesAsync(); } catch (e) {} instancesDe.set(r.id, l); }
  for (const i of instancesDe.get(r.id)) { let o = []; try { o = i.overrides || []; } catch (e) {} if (o.some(x => x.id === s.id || x.id.endsWith(';' + s.id))) return true; }
  return false;
}
const fideles = new Map();
async function fidele(w) { if (!fideles.has(w.id)) { await chargerPolices(w); const c = copier(w); fideles.set(w.id, !ecart(mesurer(w, true), mesurer(c, true), null)); c.remove(); } return fideles.get(w.id); }
// un cadre homologue est-il une coquille à prouver ? (mêmes critères que la liste fixe)
function coquille(h) { if (h.type !== 'FRAME' && h.type !== 'GROUP') return 'pas un cadre'; if (h.layoutPositioning === 'ABSOLUTE') return 'position absolue'; if (!h.children.length) return 'vide'; const e = effetPropre(h); return e; }
const rapport = []; let suite = null, stop = false;
for (let ri = DEBUT[0]; ri < ids.length && !stop && !suite; ri++) {
  const r = await get(ids[ri]);
  const out = { racine: r.id, nom: r.name, sondes: 0, supprimes: [], trompeuses: [], conserves: 0, ecartes: [], gardesPourLeSet: [] };
  rapport.push(out);
  await chargerPolices(r);
  if (!(await fidele(r))) { const c0 = copier(r); const fid = ecart(mesurer(r, true), mesurer(c0, true), null); c0.remove(); out.arret = 'copie infidèle (' + fid + ') : rien sondé, tout conservé'; continue; }
  const liste = candidats(r);
  const ci0 = ri === DEBUT[0] && DEBUT[1] ? Math.max(0, liste.indexOf(DEBUT[1])) : 0;
  for (let ci = ci0; ci < liste.length; ci++) {
    if (Date.now() - T0 > BUDGET) { suite = [ri, liste[ci], 0]; break; }
    const sid = liste[ci], s = await get(sid);
    if (!s || s.removed) continue;
    const reprise = ri === DEBUT[0] && sid === DEBUT[1] ? (DEBUT[2] || 0) : 0;
    if (!reprise) out.sondes++;
    if (!s.children.length) { out.ecartes.push(s.name + ' (vide)'); continue; }
    const eff = effetPropre(s); if (eff) { out.ecartes.push(s.name + ' (' + eff + ')'); continue; }
    if (await regleDehors(r, s)) { out.ecartes.push(s.name + ' (réglé par une instance posée ailleurs)'); continue; }
    const homs = homologues(ri, s);
    const avantMoi = homs.find(x => x.rj < ri);
    if (avantMoi) { out.gardesPourLeSet.push(s.name + ' (gardé comme dans ' + avantMoi.w.name + ')'); continue; }
    if (!reprise) {
      const pr = prouver(r, s);
      if (pr && pr.etat === 'affiché') { out.conserves++; continue; }
      if (pr) { out.trompeuses.push({ id: sid, nom: s.name, motif: 'état inversé : ' + pr.motif }); continue; }
    }
    // le même cadre dans les autres variantes du set : prouvé dans chacune, sinon gardé partout
    let refus = null, hi = Math.max(0, reprise - 1);
    for (; hi < homs.length; hi++) {
      if (Date.now() - T0 > BUDGET) { suite = [ri, sid, hi + 1]; break; }
      const { w, h } = homs[hi];
      const pas = coquille(h) || (await regleDehors(w, h) ? 'réglé par une instance posée ailleurs' : null); if (pas) { refus = w.name + ' : ' + pas; break; }
      if (!(await fidele(w))) { refus = w.name + ' : copie infidèle'; break; }
      const ph = prouver(w, h); if (ph) { refus = w.name + ' : ' + (ph.etat === 'affiché' ? 'effet réel' : 'état inversé, ' + ph.motif); break; }
    }
    if (suite) break;
    if (refus) { out.gardesPourLeSet.push(s.name + ' (gardé dans tout le set — ' + refus + ')'); continue; }
    if (!APPLIQUER) { out.supprimes.push({ id: sid, nom: s.name, variantes: 1 + homs.length, essai: true }); continue; }
    // application au groupe entier ; un écart sur l'original remet en place tout le groupe
    const faits = []; let ko = null;
    for (const { w: rr, h: ss } of [{ w: r, h: s }, ...homs]) {
      const avant = mesurer(rr), vis = ss.visible, groupe = ss.type === 'GROUP', nom = ss.name, ssid = ss.id, par = ss.parent, idx = par.children.indexOf(ss);
      const cap = capter([...ss.children]);
      aplatir(ss); if (!groupe) ss.visible = false;
      faits.push({ rr, ss, avant, vis, groupe, nom, ssid, par, idx, cap });
      const e = ecart(avant, mesurer(rr), ssid); if (e) { ko = { nom, ou: rr.name, e }; break; }
    }
    if (!ko) { const nom0 = faits[0].nom; for (const f of faits) if (!f.ss.removed) f.ss.remove(); out.supprimes.push({ id: sid, nom: nom0, variantes: faits.length }); continue; }
    for (const f of faits.reverse()) {
      if (f.groupe) figma.group(f.cap.map(x => x.k), f.par, f.idx).name = f.nom; else remettre(f.ss, f.cap, f.vis);
      const rk = ecart(f.avant, mesurer(f.rr), f.ssid);
      if (rk) { out.arret = 'REMISE EN PLACE KO sur « ' + f.nom + ' » dans ' + f.rr.name + ' (' + rk + ') : STOP, relire ce calque'; stop = true; }
    }
    out.trompeuses.push({ id: sid, nom: faits[faits.length - 1].nom, motif: 'écart sur l’original dans ' + ko.ou + ' : ' + ko.e });
    if (stop) break;
  }
}
return { rapport, suite, duree_ms: Date.now() - T0 };
