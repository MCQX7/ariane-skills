// Ariane — essai des réglages au changement de variante (étape ariane-rebuild-component). SCRIPT FIXE : se colle tel
// quel dans l'outil d'exécution du connecteur Figma officiel ; seule la ligne PARAMÈTRES change.
// ÉCRIT SEULEMENT DES INSTANCES TEMPORAIRES de la copie, DANS la planche de proposition, et les RETIRE avant de rendre
// (même en cas d'erreur). Ne touche ni l'original ni les composants.
// SET : id du set de variantes de la copie (le master de la proposition) ; PLANCHE : id de la planche de proposition.
// Ce qu'il fait, pour chaque valeur de départ de chaque propriété de variante du master : il pose une instance, choisit
// par chaque échange d'instance (du master et des pièces exposées) un autre contenu que celui par défaut, règle sur
// chaque instance exposée une valeur qui n'est pas celle par défaut (propriété de variante, texte, on/off), puis passe
// le master par chaque autre valeur de cette propriété et relit ces réglages. Une pièce exposée se reconnaît de deux
// façons, chacune relue : par son IDENTITÉ — le composant dont elle vient et son rang parmi les pièces exposées de ce
// composant (une pièce qui change de cadre reste la même pièce) — et par son NOM de calque et son chemin (deux composants
// différents posés au même endroit sous le même nom, que Figma relie par ce nom). Un réglage qui ne se retrouve pas alors
// que la pièce est toujours là est une PERTE (la valeur retombe à celle par défaut, ou le contenu choisi est perdu).
// Rend : pertes (au plus 20), essais faits, et ce qui n'a pas pu être essayé.
// TEXTES : false pour l'essai ci-dessus ; true pour l'essai des TEXTES MODIFIÉS (second appel, mêmes SET et PLANCHE) :
// pour chaque paire de valeurs de chaque propriété de variante, un texte que les variantes changent d'une valeur à
// l'autre (un prix qui suit une option) est modifié sur une instance — par sa propriété texte s'il en a une, sinon à la
// main dans les calques —, puis l'instance passe à l'autre valeur. Figma garde un texte modifié au changement de
// variante quand le calque porte le même nom au même endroit : s'il reste tel quel, il ne suit plus le réglage. Rend
// figesAuPanneau (texte réglé par une propriété) et figesALaMain (texte modifié dans les calques).
// PARAMÈTRES
const SET = '0:0'; const PLANCHE = '0:0'; const TEXTES = false;

const T0 = Date.now(), BUDGET = 22000;
const set = await figma.getNodeByIdAsync(SET);
if (!set || set.type !== 'COMPONENT_SET') return { erreur: 'PARAMÈTRES : SET doit être l’id d’un set de variantes' };
let page = set; while (page && page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);
const defs = set.componentPropertyDefinitions;
const axes = Object.keys(defs).filter(k => defs[k].type === 'VARIANT');
const nomBase = k => k.split('#')[0];
const pertes = [], nonEssaye = []; let essais = 0;
const planche = await figma.getNodeByIdAsync(PLANCHE);
if (!planche || PLANCHE === '0:0') return { erreur: 'PARAMÈTRES : PLANCHE doit être l’id de la planche de proposition' };
// les composants du fichier par clé : une valeur préférée d'un échange d'instance se donne par sa clé
const parCle = new Map();
for (const c of page.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] })) parCle.set(c.key, c.type === 'COMPONENT_SET' ? (c.defaultVariant || c.children[0]) : c);
const source = m => (m && m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
// les pièces que le panneau montre : instances exposées dont chaque instance au-dessus est elle-même exposée
const chemin = (n, inst) => { const c = []; for (let q = n; q && q.id !== inst.id; q = q.parent) c.unshift(q.name); return c.join(' / '); };
const auPanneau = (n, inst) => { for (let q = n.parent; q && q.id !== inst.id; q = q.parent) if (q.type === 'INSTANCE' && !q.isExposedInstance) return false; return true; };
// chaque pièce exposée avec son identité : « composant source #rang », dans l'ordre du document
const pieces = async inst => {
  const out = [], rang = {};
  for (const e of inst.findAll(n => n.type === 'INSTANCE' && n.isExposedInstance && auPanneau(n, inst))) {
    const m = await e.getMainComponentAsync(); const s = source(m); const nom = s ? s.name : '?';
    rang[nom] = (rang[nom] || 0) + 1; out.push({ e, m, id: nom + ' #' + rang[nom], ou: chemin(e, inst) });
  }
  return out;
};
// relit les réglages : ceux du master (échanges d'instance) et ceux de chaque pièce exposée, par identité
const lit = async inst => {
  const r = {};
  for (const [k, d] of Object.entries(inst.componentProperties)) if (d.type === 'INSTANCE_SWAP') r['master › ' + nomBase(k)] = { v: String(d.value), ou: '(master)' };
  for (const p of await pieces(inst)) { let cp = {}; try { cp = p.e.componentProperties; } catch (x) {} for (const [k, d] of Object.entries(cp)) { r[p.id + ' › ' + nomBase(k)] = { v: String(d.value), ou: p.ou }; r['calque ' + p.ou + ' › ' + nomBase(k)] = { v: String(d.value), ou: p.ou }; } }
  return r;
};
// une autre valeur d'échange que l'actuelle : la première valeur préférée lisible dans le fichier
const autreContenu = (pd, actuel) => {
  for (const pv of (pd && pd.preferredValues) || []) { const c = parCle.get(pv.key); if (c && c.id !== actuel) return c.id; }
  return undefined;
};
// choisit par chaque échange d'instance un autre contenu (le master d'abord, puis chaque pièce exposée), puis règle
// sur chaque pièce exposée une valeur qui n'est pas celle par défaut ; rend ce qui a été réglé
const regle = async inst => {
  const fait = {};
  for (const [k, d] of Object.entries(inst.componentProperties)) if (d.type === 'INSTANCE_SWAP') {
    const val = autreContenu(defs[k], d.value);
    if (val === undefined) { nonEssaye.push('master › ' + nomBase(k) + ' : aucune autre valeur préférée lisible dans le fichier'); continue; }
    try { inst.setProperties({ [k]: val }); if (String(inst.componentProperties[k].value) === val) fait['master › ' + nomBase(k)] = val; } catch (x) { nonEssaye.push('master › ' + nomBase(k) + ' : ' + String(x).slice(0, 60)); }
  }
  for (const tour of ['INSTANCE_SWAP', 'AUTRES']) for (const p of await pieces(inst)) {
    const e = p.e; let cp = {}; try { cp = e.componentProperties; } catch (x) { continue; }
    const m = await e.getMainComponentAsync(); if (!m) continue;
    const pdefs = source(m).componentPropertyDefinitions;
    for (const [k, d] of Object.entries(cp)) {
      if ((tour === 'INSTANCE_SWAP') !== (d.type === 'INSTANCE_SWAP')) continue;
      const pd = pdefs[k] || pdefs[nomBase(k)]; let val;
      if (d.type === 'VARIANT' && pd && pd.variantOptions) val = pd.variantOptions.find(o => o !== d.value);
      else if (d.type === 'BOOLEAN') val = !d.value;
      else if (d.type === 'TEXT') val = 'Essai Ariane';
      else if (d.type === 'INSTANCE_SWAP') { val = autreContenu(pd, d.value); if (val === undefined) { nonEssaye.push(p.id + ' › ' + nomBase(k) + ' : aucune autre valeur préférée lisible dans le fichier'); continue; } }
      if (val === undefined) continue;
      try {
        if (d.type === 'TEXT') { const t = e.findAll(n => n.type === 'TEXT' && n.componentPropertyReferences && n.componentPropertyReferences.characters === k)[0]; if (t) for (const f of t.getRangeAllFontNames(0, t.characters.length)) await figma.loadFontAsync(f); }
        e.setProperties({ [k]: val });
        const relu = String(e.componentProperties[k] ? e.componentProperties[k].value : '');
        if (relu === String(val)) { fait[p.id + ' › ' + nomBase(k)] = String(val); fait['calque ' + p.ou + ' › ' + nomBase(k)] = String(val); }
      } catch (x) { nonEssaye.push(p.id + ' › ' + nomBase(k) + ' : ' + String(x).slice(0, 60)); }
    }
  }
  return fait;
};
// Figma demande les polices chargées pour poser une instance dans la planche
const polices = new Set(); for (const t of planche.findAll(n => n.type === 'TEXT')) { try { for (const f of t.getRangeAllFontNames(0, t.characters.length)) polices.add(JSON.stringify(f)); } catch (x) {} }
for (const f of polices) { try { await figma.loadFontAsync(JSON.parse(f)); } catch (x) {} }
const base = set.defaultVariant || set.children[0];
const pose = () => { const x = base.createInstance(); planche.appendChild(x); if (planche.layoutMode && planche.layoutMode !== 'NONE') x.layoutPositioning = 'ABSOLUTE'; x.x = 0; x.y = 0; return x; };
if (TEXTES) {
  // chaque texte d'une instance par son chemin de calques (rang ajouté quand deux frères portent le même nom)
  const textes = inst => { const r = {}; for (const t of inst.findAll(n => n.type === 'TEXT')) { let c = chemin(t, inst), k = 1; while ((c + (k > 1 ? ' #' + k : '')) in r) k++; r[c + (k > 1 ? ' #' + k : '')] = t; } return r; };
  // la propriété texte qui règle ce calque, et l'instance qui la porte (le master posé ou une pièce)
  const proprio = (t, inst) => { const ref = t.componentPropertyReferences && t.componentPropertyReferences.characters; if (!ref) return null; for (let q = t.parent; q; q = q.parent) { if (q.type === 'INSTANCE') { try { if (ref in q.componentProperties) return { q, ref }; } catch (x) {} } if (q.id === inst.id) break; } return null; };
  const figesAuPanneau = [], figesALaMain = []; let essaisTextes = 0;
  for (const ax of axes) {
    const vals = defs[ax].variantOptions;
    for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) {
      if (Date.now() - T0 > BUDGET) { nonEssaye.push('budget de temps atteint : textes arrêtés à ' + ax + '=' + vals[i]); break; }
      const a = pose(), b = pose();
      try {
        try { a.setProperties({ [ax]: vals[i] }); b.setProperties({ [ax]: vals[j] }); } catch (x) { continue; }
        if (a.componentProperties[ax].value !== vals[i] || b.componentProperties[ax].value !== vals[j]) continue; // combinaison absente
        const ta = textes(a), tb = textes(b);
        const suivent = Object.keys(ta).filter(c => c in tb && ta[c].characters !== tb[c].characters);
        const avant = {}, comment = {};
        for (const c of suivent) {
          const t = ta[c]; avant[c] = [ta[c].characters, tb[c].characters];
          try {
            for (const f of t.getRangeAllFontNames(0, t.characters.length)) await figma.loadFontAsync(f);
            const p = proprio(t, a);
            if (p) { p.q.setProperties({ [p.ref]: 'Essai Ariane' }); comment[c] = 'panneau'; } else { t.characters = 'Essai Ariane'; comment[c] = 'main'; }
          } catch (x) { nonEssaye.push('texte ' + c + ' : ' + String(x).slice(0, 60)); }
        }
        const modifies = suivent.filter(c => comment[c] && ta[c].characters === 'Essai Ariane');
        if (!modifies.length) continue;
        a.setProperties({ [ax]: vals[j] }); essaisTextes++;
        const tr = textes(a);
        for (const c of modifies) if (tr[c] && tr[c].characters === 'Essai Ariane') (comment[c] === 'panneau' ? figesAuPanneau : figesALaMain).push(c + ' : « ' + avant[c][0].slice(0, 24) + ' » en ' + ax + '=' + vals[i] + ', « ' + avant[c][1].slice(0, 24) + ' » en ' + ax + '=' + vals[j] + ' ; modifié, il reste tel quel en passant à ' + ax + '=' + vals[j]);
      } finally { a.remove(); b.remove(); }
    }
  }
  return { set: set.name, essaisTextes, figesAuPanneau: [...new Set(figesAuPanneau)].slice(0, 20), figesALaMain: [...new Set(figesALaMain)].slice(0, 20), nonEssaye: [...new Set(nonEssaye)].slice(0, 10) };
}
for (const ax of axes) {
  for (const depart of defs[ax].variantOptions) for (const vers of defs[ax].variantOptions) {
    if (vers === depart) continue;
    if (Date.now() - T0 > BUDGET) { nonEssaye.push('budget de temps atteint : essais arrêtés à ' + ax + '=' + depart); break; }
    const inst = base.createInstance(); planche.appendChild(inst); if (planche.layoutMode && planche.layoutMode !== 'NONE') inst.layoutPositioning = 'ABSOLUTE'; inst.x = 0; inst.y = 0;
    try {
      try { inst.setProperties({ [ax]: depart }); } catch (x) { continue; }
      if (inst.componentProperties[ax].value !== depart) continue; // combinaison absente : relevée par la lecture fixe
      const fait = await regle(inst); if (!Object.keys(fait).length) continue;
      const avant = await lit(inst);
      try { inst.setProperties({ [ax]: vers }); } catch (x) { continue; }
      if (inst.componentProperties[ax].value !== vers) continue;
      essais++;
      const r = await lit(inst);
      for (const [cle, val] of Object.entries(fait)) if (cle in r && r[cle].v !== val) pertes.push(cle + ' : réglé « ' + val + ' » en ' + ax + '=' + depart + (avant[cle] ? ' (sous ' + avant[cle].ou + ')' : '') + ', retombe à « ' + r[cle].v + ' » en ' + ax + '=' + vers + ' (sous ' + r[cle].ou + ')');
    } finally { inst.remove(); }
  }
}
return { set: set.name, essais, pertes: [...new Set(pertes)].slice(0, 20), nombreDePertes: new Set(pertes).size, nonEssaye: [...new Set(nonEssaye)].slice(0, 10) };
