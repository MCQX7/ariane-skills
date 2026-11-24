// Ariane — recherche du même dessin (étape ariane-check-component), APRÈS la lecture fixe. SCRIPT FIXE : le code se
// passe tel quel à l'outil d'exécution du connecteur Figma officiel ; seule la ligne PARAMÈTRES change (les lignes de
// commentaire peuvent être retirées, jamais une ligne de code). LECTURE SEULE : n'écrit rien.
// CIBLE : id du nœud contrôlé (le même que pour la lecture fixe). DEBUT : 0, puis `suite` tant qu'il n'est pas null ;
// les listes `memeDessin` se cumulent d'un appel à l'autre.
// Rend memeDessin : une variante d'un composant de la cible qui a le même dessin (même arbre de calques, sans entrer dans
// les instances, mêmes couleurs et même typographie — variables, styles, valeurs brutes ; la racine comprise) qu'une
// variante d'un autre composant de la page — noms de propriétés et de variantes mis à part ; marges, espacements et
// arrondis mis à part : une copie qui a dérivé reste une copie. Seules les variantes d'au moins deux calques et deux
// liaisons comptent. Le budget court après le chargement de la page, qui se refait à chaque appel.
// PARAMÈTRES
const CIBLE = '0:0'; const DEBUT = 0;

const T0 = Date.now(), BUDGET = 22000;
const racine = await figma.getNodeByIdAsync(CIBLE);
if (!racine || CIBLE === '0:0') return { erreur: 'PARAMÈTRES : CIBLE doit être l’id du nœud contrôlé' };
const estMaster = n => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET'));
const masters = estMaster(racine) ? [racine] : racine.findAll(estMaster);
{
  let page = racine; while (page && page.type !== 'PAGE') page = page.parent;
  const couleur = n => { try { return (n.fills || []).filter(f => f.visible !== false && f.type === 'SOLID').map(f => [f.color.r, f.color.g, f.color.b, f.opacity == null ? 1 : f.opacity].map(x => Math.round(x * 100)).join('.')).join('+'); } catch (e) { return ''; } };
  const sig = v => { const t = []; let liens = 0, enfants = 0; const pile = [[v, 0]]; while (pile.length) { const [n, d] = pile.pop(); const bv = n.boundVariables || {}; const ids = Object.keys(bv).filter(k => /fill|stroke|font|lineHeight|letterSpacing|textStyle/i.test(k)).sort().map(k => k + ':' + JSON.stringify(bv[k]).replace(/[^A-Za-z0-9:]/g, '')).join(','); const st = [n.fillStyleId, n.strokeStyleId, n.textStyleId, n.effectStyleId].filter(x => typeof x === 'string' && x).join(','); if (ids || st) liens++; if (n.id !== v.id) enfants++; t.push(d + (n.id === v.id ? 'RACINE' : n.type) + '{' + ids + '}' + st + '#' + couleur(n)); if ('children' in n && n.type !== 'INSTANCE') for (const c of n.children) pile.push([c, d + 1]); } return enfants >= 2 && liens >= 2 ? t.join('|') : null; };
  const proprio = c => c.parent && c.parent.type === 'COMPONENT_SET' ? c.parent : c;
  const dansCible = new Set(masters.map(m => m.id));
  const cibles = new Map(), largeurs = new Set();
  for (const m of masters) for (const c of (m.type === 'COMPONENT_SET' ? m.children.filter(v => v.type === 'COMPONENT') : [m])) { const s = sig(c); if (!s) continue; (cibles.get(s) || cibles.set(s, []).get(s)).push(c); largeurs.add(c.children.length); }
  const memeDessin = [], vus = new Set();
  const note = (c, o) => { const cle = proprio(c).name + ' ' + c.name + ' ≈ ' + proprio(o).name + ' ' + o.name; if (vus.has(cle) || memeDessin.length >= 12) return; vus.add(cle); memeDessin.push(cle + (dansCible.has(proprio(o).id) ? '' : ' (hors de la cible)')); };
  if (DEBUT === 0) for (const groupe of cibles.values()) for (const c of groupe) for (const o of groupe) if (proprio(o).id !== proprio(c).id) note(c, o);
  const tous = page.findAllWithCriteria({ types: ['COMPONENT'] });
  const T1 = Date.now(); // le budget court après le chargement de la page, qui se refait à chaque appel
  let j = DEBUT;
  for (; j < tous.length; j++) {
    if (j > DEBUT && Date.now() - T1 > BUDGET) break;
    const o = tous[j]; if (dansCible.has(proprio(o).id) || !largeurs.has(o.children.length)) continue;
    const s = sig(o); if (!s || !cibles.has(s)) continue;
    for (const c of cibles.get(s)) note(c, o);
  }
  return { cible: racine.name, dessin: true, composantsDeLaPage: tous.length, lus: j - DEBUT, suite: j < tous.length ? j : null, memeDessin };
}
