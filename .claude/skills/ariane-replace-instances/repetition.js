// Ariane — répétition du remplacement hors des écrans (étape ariane-replace-instances). SCRIPT FIXE : se colle tel quel ;
// seule la ligne PARAMÈTRES change. ÉCRIT seulement sur la page de répétition (créée si elle manque) : les écrans
// d'origine ne bougent pas.
// ECRANS : ids des écrans (cadres de premier niveau) à copier, choisis pour couvrir chaque signature du relevé, en
// bureau et en mobile. ANCIEN : id du set à remplacer. PAGE : nom de la page de répétition.
// Rend, par écran copié : l'id de la copie et la correspondance « instance d'origine → instance copiée » de l'ancien
// (pour passer les copies à echange.js puis controle.js). Les modes de variables de l'écran sont reposés sur la copie ;
// un mode qui n'a pas pu l'être est dit (une copie mobile rendue en bureau tromperait la répétition). La page reste
// dans la branche : au designer de la supprimer avant de fusionner.
// PARAMÈTRES
const ECRANS = []; const ANCIEN = '0:0'; const PAGE = 'Ariane — répétition';

figma.skipInvisibleInstanceChildren = false;
const vieux = await figma.getNodeByIdAsync(ANCIEN);
if (!vieux || !ECRANS.length) return { erreur: 'PARAMÈTRES non remplis' };
const ids = new Set((vieux.type === 'COMPONENT_SET' ? vieux.children : [vieux]).map(v => v.id));
let page = figma.root.children.find(p => p.name === PAGE);
if (!page) { page = figma.createPage(); page.name = PAGE; }
await page.loadAsync();
let x = 0; for (const n of page.children) x = Math.max(x, n.x + n.width + 200);
const out = [], creees = [];
for (const id of ECRANS) {
  const e = await figma.getNodeByIdAsync(id);
  if (!e) { out.push({ ecran: id, erreur: 'introuvable' }); continue; }
  const origines = [];
  for (const i of e.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) origines.push(i.id); }
  const modes = Object.entries(e.resolvedVariableModes || {});
  const c = e.clone();
  try { page.appendChild(c); } catch (err) { c.remove(); out.push({ ecran: id, erreur: 'copie impossible : ' + err.message }); continue; }
  c.x = x; c.y = 0; x += c.width + 200;
  const modesNonPoses = [];
  for (const [col, mode] of modes) { const coll = await figma.variables.getVariableCollectionByIdAsync(col); if (coll) try { c.setExplicitVariableModeForCollection(coll, mode); } catch (err) { modesNonPoses.push(coll.name); } }
  c.name = e.name + ' — répétition';
  const copies = [];
  for (const i of c.findAllWithCriteria({ types: ['INSTANCE'] })) { const m = await i.getMainComponentAsync(); if (m && ids.has(m.id)) copies.push(i.id); }
  creees.push(c.id);
  out.push({ ecran: e.name + ' ' + id, copie: c.id, modesNonPoses, instances: origines.map((o, k) => [o, copies[k] || null]) });
}
return { page: page.id, ecrans: out, createdNodeIds: creees };
