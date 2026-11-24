// Ariane — lecture fixe d'une cible de contrôle (étape ariane-check-component). SCRIPT FIXE : se colle tel quel dans
// l'outil d'exécution du connecteur Figma officiel ; seule la ligne PARAMÈTRES change. LECTURE SEULE : n'écrit rien.
// CIBLE : id du nœud reçu (planche, section, set ou composant). DEBUT : 0, puis `suite` tant qu'il n'est pas null.
// VERIF : true pour la vérification d'une copie (construction, orchestrateur) : sortie courte, sans le lieu, les cas
// pratiques ni les pièces — seulement les faits que la copie doit tenir. false pour le contrôle.
// Le code se passe tel quel ; les lignes de commentaire peuvent être retirées, jamais une ligne de code.
// La recherche du même dessin est un script à part, `meme-dessin.js`, passé après celui-ci.
// Rend les FAITS que le contrôle juge ensuite, les mêmes à chaque passe :
//  - lieu : chaque master de la cible (local) et chaque master posé en instance sans être dans le fichier (librairie) ;
//    pour un master local : combien d'instances dans le fichier, posées où (dans quels autres composants, directement
//    sur quelles pages, ou à l'intérieur des instances d'un autre composant), et s'il n'est utilisé par aucune ;
//  - panneau : les propriétés du master (valeurs, défaut), les instances exposées et leurs propriétés, par variante ;
//  - sansEffet : chaque propriété du master (on/off, texte, échange) appliquée à aucun calque, dans aucune variante ;
//  - appliqueeSeulementDans : une propriété du master appliquée dans certaines variantes seulement (Figma ne la montre
//    au panneau que dans celles-là : un verrou, pas un défaut) ;
//  - valeursIdentiques : deux valeurs d'une propriété de variante dont les variantes sont identiques — opacité comprise
//    (celle de chaque calque, de la variante, des fonds et des contours) : un état qui ne change que la transparence
//    (un désactivé à 50 %) n'est pas identique ;
//  - changeDeNom : une instance exposée — reconnue par le composant dont elle vient et son rang — qui ne porte pas le même
//    nom d'une variante à l'autre : ce qu'on règle sur elle se perd au changement de variante (constaté dans Figma) ;
//  - changeDeParent : la même, nom gardé, posée dans un autre cadre d'une variante à l'autre : Figma retrouve le réglage
//    (constaté), mais la structure n'est pas la même d'une variante à l'autre ;
//  - memeChoix : un réglage du panneau (propriété de variante du master, ou d'une pièce exposée à toute profondeur) dont au
//    moins deux valeurs recoupent celles d'un autre réglage, ou les libellés d'une pièce répétée (des onglets), ou dont la
//    valeur posée est déjà donnée par le nom du master — mots comparés sans casse, accents, espaces ni signes ; une valeur
//    qui ne dit rien seule (oui / non, un chiffre, une taille en une ou deux lettres), la même pièce répétée et un réglage
//    relié à une variable ne comptent pas. Un indice : chacun se juge (même information réglable à deux endroits ?) ;
//  - combinaisons : combinaisons des propriétés de variante que le panneau propose et qu'aucune variante ne porte
//    (comptées quel que soit le nombre de variantes), et pairesAbsentes : deux valeurs de deux propriétés qu'aucune
//    variante ne porte ensemble (là où la grille est trouée) ;
//  - sansContenu : une valeur d'une propriété de variante dont les variantes ne montrent aucun contenu (ni texte, ni
//    image, ni dessin vectoriel, à toute profondeur) alors que d'autres valeurs en montrent ;
//  - montrableSansChoix : une instance posée dans les variantes, qu'un on/off montre ou cache, dont le contenu ne se
//    choisit par aucun échange d'instance (une icône qu'on peut afficher mais pas changer) ;
//  - identiquesSur : une valeur d'une propriété de variante dont les variantes sont identiques quelle que soit la valeur
//    d'une autre propriété (un chargement le même pour tous les thèmes) — même comparaison, opacité comprise ;
//  - pieces : chaque composant posé dans les variantes du master (pour un master de librairie posé, lu dans une instance), à tous les niveaux, avec à qui il sert (local ou de
//    librairie, les autres masters du fichier qui le posent, ses instances posées hors de tout composant) ; une pièce
//    locale qui ne porte qu'un fond (ni texte, ni image, ni dessin vectoriel, dans aucune variante, et des instances de
//    pièces qui ne portent elles-mêmes qu'un fond) le dit ;
//  - casPratiques : par master posé dans la cible, chaque réglage libre (texte, on/off, de lui ou de ses pièces exposées)
//    qui change d'un cas pratique à l'autre, cas par cas, à côté des trois propriétés de variante qui distinguent le plus les cas.
//    Et regleALaMain : ce que les cas changent dans leurs calques sans passer par le panneau (un texte, une pièce
//    échangée à la main, hors propriété et hors instance exposée), avec le nombre de cas et les valeurs.
// PARAMÈTRES
const CIBLE = '0:0'; const DEBUT = 0; const VERIF = false;

const T0 = Date.now(), BUDGET = 22000;
figma.skipInvisibleInstanceChildren = false;
const racine = await figma.getNodeByIdAsync(CIBLE);
if (!racine || CIBLE === '0:0') return { erreur: 'PARAMÈTRES : CIBLE doit être l’id du nœud à contrôler' };
const estMaster = n => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET'));
const masters = estMaster(racine) ? [racine] : racine.findAll(estMaster);
const nomM = m => (m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name) : '?');
const lie = d => !!(d && d.boundVariables && d.boundVariables.value);
const norm = x => String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
// une valeur qui ne dit rien à elle seule (oui / non, un chiffre, une taille en une ou deux lettres) ne compte pas
const GENERIQUES = new Set(['on', 'off', 'true', 'false', 'yes', 'no', 'oui', 'non', 'default', 'defaut', 'none', 'aucun', 'vide', 'empty']);
const parlante = x => { const n = norm(x); return n.length > 2 && !/^\d+$/.test(n) && !GENERIQUES.has(n); };

// Masters posés en instance dans la cible sans être dans le fichier (librairie), une fois chacun.
const distants = {};
if (DEBUT === 0 && !VERIF && !estMaster(racine)) for (const i of racine.findAll(n => n.type === 'INSTANCE')) {
  let dansInst = false; for (let p = i.parent; p && p.id !== racine.id; p = p.parent) if (p.type === 'INSTANCE' || p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') { dansInst = true; break; }
  if (dansInst) continue;
  const m = await i.getMainComponentAsync();
  if (m && m.remote) { const k = nomM(m); distants[k] = distants[k] || { n: 0, cle: (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.key : m.key), exemple: i }; distants[k].n++; }
}

// Pièces d'un master de librairie posé : lues dans une de ses instances (sa source n'est pas dans le fichier).
for (const d of Object.values(distants)) {
  const vus = {};
  for (const n of d.exemple.findAll(x => x.type === 'INSTANCE')) { const m = await n.getMainComponentAsync(); if (!m) continue; const k = nomM(m); vus[k] = vus[k] || { librairie: !!m.remote, exposee: false }; if (n.isExposedInstance) vus[k].exposee = true; }
  d.pieces = Object.entries(vus).map(([k, v]) => k + (v.librairie ? ' (librairie)' : ' (local)') + (v.exposee ? ' — exposée' : ''));
  delete d.exemple;
}

// Cas pratiques : les instances posées dans la cible (hors composants), par master. Pour chacune, ses réglages et ceux
// des pièces exposées (rangés par composant source, pas par nom de calque) ; puis, pour chaque réglage libre (texte,
// on/off) qui change d'un cas à l'autre, sa valeur cas par cas, à côté des trois propriétés de variante qui distinguent le plus
// les cas (une marque, un type) — pour voir un réglage que le produit fixe par valeur (§ A1).
const casPratiques = {};
if (DEBUT === 0 && !VERIF && !estMaster(racine)) {
  const parMaster = {}, mainParMaster = {};
  for (const i of racine.findAll(n => n.type === 'INSTANCE')) {
    let libre = true; for (let p = i.parent; p && p.id !== racine.id; p = p.parent) if (p.type === 'INSTANCE' || p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') { libre = false; break; }
    if (!libre) continue;
    const m = await i.getMainComponentAsync(); if (!m) continue;
    const reg = {};
    const lit = (n, pre) => { try { for (const [c, d] of Object.entries(n.componentProperties)) if (!lie(d) && d.type !== 'INSTANCE_SWAP') reg[pre + c.split('#')[0]] = { t: d.type, v: String(d.value) }; } catch (e) {} };
    lit(i, '');
    for (const e of i.findAll(n => n.type === 'INSTANCE' && n.isExposedInstance)) { const me = await e.getMainComponentAsync(); lit(e, nomM(me) + ' › '); }
    // Réglé à la main : un texte ou une pièce changés dans les calques du cas, sans propriété ni instance exposée.
    const main = {}, desc = new Map(i.findAll(() => true).map(n => [n.id, n]));
    const chemin = n => { const c = []; for (let q = n; q && q.id !== i.id; q = q.parent) c.unshift(q.name); return c.join(' › '); };
    const exposee = n => { for (let q = n; q && q.id !== i.id; q = q.parent) if (q.type === 'INSTANCE' && q.isExposedInstance) return true; return false; };
    for (const o of (i.overrides || [])) {
      const n = desc.get(o.id); if (!n || exposee(n)) continue; const f = o.overriddenFields || [], r = n.componentPropertyReferences || {};
      if (n.type === 'TEXT' && f.includes('characters') && !r.characters) main[chemin(n) + ' (texte)'] = n.characters.replace(/\s+/g, ' ').slice(0, 24);
      else if (n.type === 'INSTANCE' && (f.includes('mainComponent') || f.includes('componentProperties')) && !r.mainComponent) { let v = ''; try { v = Object.entries(n.componentProperties).map(([k, d]) => k.split('#')[0] + '=' + String(d.value).slice(0, 14)).join(', '); } catch (e) {} main[chemin(n) + ' (pièce)'] = v.slice(0, 60); }
    }
    (parMaster[nomM(m)] = parMaster[nomM(m)] || []).push(reg); (mainParMaster[nomM(m)] = mainParMaster[nomM(m)] || []).push(main);
  }
  for (const [nom, liste] of Object.entries(parMaster)) {
    if (liste.length < 2) continue;
    const cles = [...new Set(liste.flatMap(r => Object.keys(r)))];
    const varie = c => new Set(liste.map(r => (r[c] || {}).v)).size >= 2;
    const axes = cles.filter(c => liste.every(r => r[c]) && liste[0][c].t === 'VARIANT' && varie(c)).sort((a, b) => new Set(liste.map(r => r[b].v)).size - new Set(liste.map(r => r[a].v)).size);
    const axe = axes[0], axesLus = axes.slice(0, 3);
    const libres = cles.filter(c => liste.some(r => r[c] && (r[c].t === 'TEXT' || r[c].t === 'BOOLEAN')) && varie(c));
    casPratiques[nom] = { instances: liste.length, axe: axe || null,
      axesLus, reglagesLibresQuiVarient: libres.slice(0, 14).map(c => c + ' : ' + liste.map(r => (axesLus.length ? axesLus.map(a => r[a].v).join('/') + '=' : '') + (r[c] ? r[c].v.slice(0, 24) : '—')).join(' | ')) };
    const mains = mainParMaster[nom] || [], cm = [...new Set(mains.flatMap(r => Object.keys(r)))];
    const aLaMain = cm.filter(c => new Set(mains.filter(r => c in r).map(r => r[c])).size >= 2 || mains.filter(r => c in r).length >= 2);
    if (aLaMain.length) casPratiques[nom].regleALaMain = aLaMain.slice(0, 12).map(c => c + ' : ' + mains.filter(r => c in r).length + ' cas sur ' + mains.length + ' — ' + [...new Set(mains.filter(r => c in r).map(r => r[c]))].slice(0, 4).join(' | '));
  }
}

const sortie = []; let k = DEBUT;
for (; k < masters.length; k++) {
  if (k > DEBUT && Date.now() - T0 > BUDGET) break; // au moins un master par appel : la reprise avance toujours
  const ma = masters[k];
  const variantes = ma.type === 'COMPONENT_SET' ? ma.children.filter(v => v.type === 'COMPONENT') : [ma];
  let defs = {}; try { defs = ma.componentPropertyDefinitions; } catch (e) {}
  const proprietes = Object.entries(defs).map(([c, d]) => c.split('#')[0] + ' : ' + d.type + (d.variantOptions ? ' [' + d.variantOptions.join(' / ') + ']' : '') + ' défaut ' + JSON.stringify(d.defaultValue));
  // lieu
  const poses = { total: 0, dansComposants: {}, pages: {} };
  if (!VERIF) for (const v of variantes) for (const i of await v.getInstancesAsync()) {
    poses.total++;
    let comp = null, page = null, viaInstance = false;
    for (let p = i.parent; p; p = p.parent) { if (!comp && !viaInstance && p.type === 'INSTANCE') viaInstance = true; if (!comp && (p.type === 'COMPONENT' || p.type === 'COMPONENT_SET')) comp = p.type === 'COMPONENT' && p.parent && p.parent.type === 'COMPONENT_SET' ? p.parent.name : p.name; if (p.type === 'PAGE') { page = p.name.trim(); break; } }
    if (comp && !viaInstance) poses.dansComposants[comp] = (poses.dansComposants[comp] || 0) + 1;
    else if (!viaInstance) poses.pages[page] = (poses.pages[page] || 0) + 1;
    else poses.viaInstances = (poses.viaInstances || 0) + 1;
  }
  // panneau et sans effet
  const cles = Object.keys(defs).filter(c => defs[c].type !== 'VARIANT');
  const sansEffet = {}; const exposees = {}; const chemins = {}; const montrables = {}; const memeChoix = new Set();
  for (const v of variantes) {
    const vues = new Set(), rangs = {};
    const pile = [[v, '']];
    while (pile.length) {
      const [n, ch] = pile.pop();
      const refs = n.componentPropertyReferences;
      if (refs) for (const r of Object.values(refs)) vues.add(r);
      if (n.type === 'INSTANCE' && n.id !== v.id && refs && refs.visible && !refs.mainComponent && defs[refs.visible] && defs[refs.visible].type === 'BOOLEAN') {
        const m = await n.getMainComponentAsync(); const cle = n.name + ' ⇐ ' + nomM(m) + ' (montré par ' + refs.visible.split('#')[0] + ')';
        montrables[cle] = (montrables[cle] || 0) + 1;
      }
      if (n.type === 'INSTANCE' && n.isExposedInstance && n.id !== v.id) {
        const m = await n.getMainComponentAsync();
        const e = exposees[n.name] = exposees[n.name] || { composant: nomM(m), dans: 0, proprietes: new Set() };
        e.dans++;
        let pdefs = {}; try { const s = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m; pdefs = s ? s.componentPropertyDefinitions : {}; } catch (x) {}
        try { for (const [c, d] of Object.entries(n.componentProperties)) e.proprietes.add(c.split('#')[0] + ' : ' + d.type + (d.type === 'VARIANT' && pdefs[c] && pdefs[c].variantOptions ? ' [' + pdefs[c].variantOptions.join(' / ') + ']' : '') + (lie(d) ? ' (relié à une variable)' : '')); } catch (x) {}
        rangs[nomM(m)] = (rangs[nomM(m)] || 0) + 1;
        const nom = 'pièce exposée : ' + nomM(m) + (rangs[nomM(m)] > 1 ? ' #' + rangs[nomM(m)] : ''), ou = (ch ? ch + '/' : '') + n.name; (chemins[nom] = chemins[nom] || {})[ou] = (chemins[nom][ou] || 0) + 1;
      }
      if ('children' in n && n.type !== 'INSTANCE') for (const c of n.children) pile.push([c, ch ? ch + '/' + n.name : (n.id === v.id ? '' : n.name)]);
    }
    for (const c of cles) if (!vues.has(c)) (sansEffet[c.split('#')[0]] = sansEffet[c.split('#')[0]] || []).push(v.name);
    // mêmes choix : les réglages du panneau de cette variante, comparés entre eux, aux libellés des pièces répétées et au nom
    if (variantes.indexOf(v) % Math.ceil(variantes.length / 120) === 0) {
      const reglages = [], vpv = v.variantProperties || {};
      for (const ax of Object.keys(defs).filter(c => defs[c].type === 'VARIANT')) reglages.push({ qui: 'master › ' + ax.split('#')[0], src: 'master ' + ax, vals: defs[ax].variantOptions, pose: vpv[ax] });
      const pile2 = [...v.children], panneau = [];
      while (pile2.length) { const n = pile2.pop(); if (n.type === 'INSTANCE') { if (n.isExposedInstance) { panneau.push(n); pile2.push(...n.children); } continue; } if ('children' in n) pile2.push(...n.children); }
      for (const p of panneau) {
        const m = await p.getMainComponentAsync(); const s = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m;
        let pdefs = {}; try { pdefs = s ? s.componentPropertyDefinitions : {}; } catch (x) {}
        try { for (const [c, d] of Object.entries(p.componentProperties)) if (d.type === 'VARIANT' && !lie(d) && pdefs[c] && pdefs[c].variantOptions && pdefs[c].variantOptions.length >= 2) reglages.push({ qui: 'pièce exposée ' + p.name + ' › ' + c.split('#')[0], src: nomM(m) + ' ' + c, vals: pdefs[c].variantOptions, pose: d.value, piece: true }); } catch (x) {}
      }
      const groupes = {};
      for (const i of v.findAll(n => n.type === 'INSTANCE')) {
        let lib = null; try { for (const d of Object.values(i.componentProperties)) if (d.type === 'TEXT') { lib = String(d.value); break; } } catch (x) {}
        if (lib === null) { const t = i.findOne(n => n.type === 'TEXT'); if (t) lib = t.characters; }
        if (lib) (groupes[i.name] = groupes[i.name] || new Set()).add(lib);
      }
      for (const [nom, libs] of Object.entries(groupes)) if (libs.size >= 2) reglages.push({ qui: 'libellés des pièces ' + nom, src: 'libellés ' + nom, vals: [...libs], libelles: true });
      const segments = nomM(v).split('/').map(norm).filter(Boolean);
      for (let a = 0; a < reglages.length; a++) {
        const A = reglages[a];
        if (A.piece && A.pose && parlante(A.pose) && segments.includes(norm(A.pose))) memeChoix.add(A.qui + ' [' + A.vals.join(' / ') + '] posé « ' + A.pose + ' », valeur déjà donnée par le nom du master');
        for (let b = a + 1; b < reglages.length; b++) {
          const B = reglages[b]; if ((A.libelles && B.libelles) || A.src === B.src) continue; // la même pièce répétée n'est pas un second endroit
          const nb = new Set(B.vals.map(norm)), communes = A.vals.filter(x => parlante(x) && nb.has(norm(x)));
          if (communes.length >= 2) memeChoix.add(A.qui + ' [' + A.vals.slice(0, 8).join(' / ') + '] et ' + B.qui + ' [' + B.vals.slice(0, 8).join(' / ') + '] — valeurs communes : ' + communes.slice(0, 6).join(', '));
        }
      }
    }
  }
  const sansEffetListe = [], appliqueeSeulementDans = [];
  for (const [p, vs] of Object.entries(sansEffet)) {
    if (vs.length === variantes.length) { sansEffetListe.push(p + ' : appliquée à aucun calque, dans aucune variante'); continue; }
    const agit = variantes.filter(v => !vs.includes(v.name)).map(v => v.name);
    appliqueeSeulementDans.push(p + ' : appliquée dans ' + agit.length + ' variante(s) sur ' + variantes.length + ' — ' + agit.slice(0, 6).join(' ; ') + (agit.length > 6 ? ' ; …' : ''));
  }
  const plusieurs = Object.entries(chemins).filter(([, cs]) => Object.keys(cs).length > 1);
  const dit = ([nom, cs]) => nom + ' — chemins : ' + Object.entries(cs).map(([c, n]) => (c || '(racine)') + ' ×' + n).join(' | ');
  const nomsDe = cs => new Set(Object.keys(cs).map(c => c.split('/').pop()));
  const changeDeNom = plusieurs.filter(([, cs]) => nomsDe(cs).size > 1).map(dit);
  const changeDeParent = plusieurs.filter(([, cs]) => nomsDe(cs).size === 1).map(dit);
  // valeurs identiques et combinaisons
  const valeursIdentiques = [], combinaisons = {}, identiquesSur = [], sansContenu = [], nonCalcule = [];
  if (ma.type === 'COMPONENT_SET') {
    // combinaisons : comptées quel que soit le nombre de variantes (seules les propriétés de variante sont lues)
    const vp = v => v.variantProperties || {};
    const axes = Object.keys(defs).filter(c => defs[c].type === 'VARIANT');
    let total = 1; for (const ax of axes) total *= defs[ax].variantOptions.length;
    const existe = new Set(variantes.map(v => axes.map(a => vp(v)[a]).join('|')));
    combinaisons.proposees = total; combinaisons.existantes = variantes.length; combinaisons.absentes = total - existe.size;
    if (total > existe.size) {
      const manque = []; let pas = 0; const rec = (i, acc) => { if (manque.length >= 8 || ++pas > 200000) return; if (i === axes.length) { const s = acc.join('|'); if (!existe.has(s)) manque.push(axes.map((a, j) => a + '=' + acc[j]).join(', ')); return; } for (const val of defs[axes[i]].variantOptions) rec(i + 1, [...acc, val]); };
      rec(0, []); combinaisons.exemplesAbsentes = manque;
      const paires = new Set(); for (const v of variantes) for (let a = 0; a < axes.length; a++) for (let b = a + 1; b < axes.length; b++) paires.add(axes[a] + '=' + vp(v)[axes[a]] + ' & ' + axes[b] + '=' + vp(v)[axes[b]]);
      // rangées par couple de propriétés, pour que chaque trou se voie (« inverted × level : on/secondary, … »)
      const pa = []; for (let a = 0; a < axes.length; a++) for (let b = a + 1; b < axes.length; b++) { const l = []; for (const x of defs[axes[a]].variantOptions) for (const y of defs[axes[b]].variantOptions) if (!paires.has(axes[a] + '=' + x + ' & ' + axes[b] + '=' + y)) l.push(x + '/' + y); if (l.length) pa.push(axes[a] + ' × ' + axes[b] + ' : ' + l.slice(0, 10).join(', ') + (l.length > 10 ? ' … (' + l.length + ')' : '')); }
      if (pa.length) combinaisons.pairesAbsentes = pa;
    }
  }
  if (ma.type === 'COMPONENT_SET' && variantes.length > 400) nonCalcule.push('valeursIdentiques, identiquesSur et sansContenu non calculés au-delà de 400 variantes (' + variantes.length + ') : les relire par lots');
  if (ma.type === 'COMPONENT_SET' && variantes.length <= 400) {
    // l'empreinte d'une variante : chaque calque avec son opacité (celle des parents jusqu'à la variante y est, calque par
    // calque), ses fonds et ses contours (opacité de chaque peinture comprise) ; la variante avec la sienne. Deux variantes
    // qui ne diffèrent que par l'opacité (un désactivé à 50 %) ne sont pas identiques.
    const emp = v => { const t = []; const pile = [v]; while (pile.length) { const n = pile.pop(); if (n.id !== v.id) t.push([n.type, n.name, n.visible, Math.round(n.width), Math.round(n.height), n.type === 'TEXT' ? n.characters : '', JSON.stringify(n.fills || ''), JSON.stringify(n.boundVariables || {}), n.type === 'INSTANCE' ? JSON.stringify(n.componentProperties) : '', 'op' + (n.opacity == null ? 1 : n.opacity), JSON.stringify(n.strokes || '')].join('~')); if ('children' in n) pile.push(...n.children); } return t.join('|') + Math.round(v.width) + 'x' + Math.round(v.height) + JSON.stringify(v.fills || '') + JSON.stringify(v.strokes || '') + (v.strokeWeight === figma.mixed ? 'mixte' : v.strokeWeight) + JSON.stringify(v.effects || '') + JSON.stringify(v.boundVariables || {}) + 'op' + (v.opacity == null ? 1 : v.opacity); };
    const vp = v => v.variantProperties || {};
    const axes = Object.keys(defs).filter(c => defs[c].type === 'VARIANT');
    const empreintes = new Map(variantes.map(v => [v.id, emp(v)]));
    for (const ax of axes) {
      const vals = defs[ax].variantOptions;
      for (let a = 0; a < vals.length; a++) for (let b = a + 1; b < vals.length; b++) {
        let paires = 0, egales = 0;
        for (const v of variantes) if (vp(v)[ax] === vals[a]) {
          const w = variantes.find(x => vp(x)[ax] === vals[b] && axes.every(o => o === ax || vp(x)[o] === vp(v)[o]));
          if (w) { paires++; if (empreintes.get(v.id) === empreintes.get(w.id)) egales++; }
        }
        if (paires && egales === paires) valeursIdentiques.push(ax + ' : ' + vals[a] + ' et ' + vals[b] + ' (' + paires + ' paires de variantes identiques)');
      }
    }
    for (const ax of axes) for (const val of defs[ax].variantOptions) for (const autre of axes) {
      if (autre === ax) continue;
      const groupes = {};
      for (const v of variantes) if (vp(v)[ax] === val) { const cle = axes.filter(o => o !== autre).map(o => vp(v)[o]).join('|'); (groupes[cle] = groupes[cle] || []).push(v); }
      const comparables = Object.values(groupes).filter(g => g.length >= 2);
      if (comparables.length && comparables.every(g => g.every(v => empreintes.get(v.id) === empreintes.get(g[0].id)))) {
        const n = defs[autre].variantOptions.length, vus = Math.max(...comparables.map(g => g.length));
        identiquesSur.push(ax + '=' + val + ' : variantes identiques quelle que soit ' + autre + ' (' + comparables.length + ' groupe(s), ' + vus + ' valeur(s) de ' + autre + ' sur ' + n + ')');
      }
    }
    // une valeur dont les variantes ne montrent aucun contenu (ni texte, ni image, ni dessin vectoriel, à toute
    // profondeur, calques affichés seulement) alors que d'autres valeurs de la même propriété en montrent
    const VECT = ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE'];
    const affiche = (n, v) => { for (let q = n; q && q.id !== v.id; q = q.parent) if (q.visible === false) return false; return true; };
    const image = n => Array.isArray(n.fills) && n.fills.some(f => f.type === 'IMAGE' && f.visible !== false);
    const contenu = v => image(v) || v.findAll(n => (n.type === 'TEXT' || VECT.includes(n.type) || image(n)) && affiche(n, v)).length > 0;
    const aContenu = new Map(variantes.map(v => [v.id, contenu(v)]));
    for (const ax of axes) {
      const vides = defs[ax].variantOptions.filter(val => { const vs = variantes.filter(v => vp(v)[ax] === val); return vs.length && vs.every(v => !aContenu.get(v.id)); });
      const pleines = defs[ax].variantOptions.filter(val => variantes.some(v => vp(v)[ax] === val && aContenu.get(v.id)));
      if (pleines.length) for (const val of vides) sansContenu.push(ax + '=' + val + ' : aucun texte, aucune image, aucun dessin vectoriel affichés (seulement des fonds et des formes), alors que ' + pleines.slice(0, 4).join(', ') + ' en montrent');
    }
  }
  // pièces : chaque composant posé dans les variantes, à tous les niveaux, et à qui il sert
  const sources = {};
  if (!VERIF) for (const v of variantes) for (const i of v.findAll(n => n.type === 'INSTANCE')) {
    const m = await i.getMainComponentAsync(); if (!m) continue;
    const s = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m;
    if (!sources[s.id]) sources[s.id] = { nom: s.name, src: s, exposee: false };
    if (i.isExposedInstance) sources[s.id].exposee = true;
  }
  const pieces = [];
  // une pièce ne porte qu'un fond : ni texte ni dessin vectoriel dans aucune variante, et ses instances ne posent que des
  // pièces locales qui elles-mêmes ne portent qu'un fond (un squelette qui recolore une base)
  const VECTP = ['TEXT', 'VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE'];
  const memoFond = new Map();
  const fondSeulDe = async c => {
    if (memoFond.has(c.id)) return memoFond.get(c.id); memoFond.set(c.id, false);
    if (c.remote) return false;
    const vs = c.type === 'COMPONENT_SET' ? c.children.filter(x => x.type === 'COMPONENT') : [c];
    let ok = vs.every(x => !x.findOne(n => VECTP.includes(n.type) || (Array.isArray(n.fills) && n.fills.some(f => f.type === 'IMAGE'))));
    if (ok) for (const x of vs) { for (const i of x.findAll(n => n.type === 'INSTANCE')) { const m = await i.getMainComponentAsync(); if (!m || !(await fondSeulDe(m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m))) { ok = false; break; } } if (!ok) break; }
    memoFond.set(c.id, ok); return ok;
  };
  for (const { nom, src, exposee } of Object.values(sources)) {
    if (Date.now() - T0 > BUDGET) { pieces.push('… (lecture des pièces interrompue : budget)'); break; }
    if (src.remote) { pieces.push(nom + ' (librairie)' + (exposee ? ' — exposée' : '')); continue; }
    const vsp = src.type === 'COMPONENT_SET' ? src.children.filter(x => x.type === 'COMPONENT') : [src];
    let pdefs = {}; try { pdefs = src.componentPropertyDefinitions; } catch (e) {}
    const fondSeul = await fondSeulDe(src);
    const autres = new Set(); let horsComposant = 0;
    const vs = src.type === 'COMPONENT_SET' ? src.children.filter(x => x.type === 'COMPONENT') : [src];
    for (const x of vs) for (const i of await x.getInstancesAsync()) {
      let haut = null; for (let p = i.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'COMPONENT' || p.type === 'COMPONENT_SET') haut = p;
      if (!haut) { horsComposant++; continue; }
      const hn = haut.type === 'COMPONENT' && haut.parent && haut.parent.type === 'COMPONENT_SET' ? haut.parent : haut;
      if (hn.id !== ma.id && hn.id !== src.id && !sources[hn.id]) autres.add(hn.name);
    }
    pieces.push(nom + ' (local)' + (exposee ? ' — exposée' : '') + (fondSeul ? ' — NE PORTE QU’UN FOND (ni texte, ni image, ni dessin vectoriel ; propriétés : ' + (Object.keys(pdefs).map(c => c.split('#')[0] + ' ' + pdefs[c].type).join(', ') || 'aucune') + ')' : '') + ' — posée aussi par : ' + (autres.size ? [...autres].slice(0, 8).join(', ') : 'aucun autre master (hors ses propres pièces)') + ' — instances hors de tout composant : ' + horsComposant);
  }
  sortie.push({ master: ma.name, id: ma.id, type: ma.type, variantes: variantes.length, proprietes,
    lieu: VERIF ? 'non lu (VERIF)' : { local: !ma.remote, instancesDansLeFichier: poses.total, poseDansDesComposants: poses.dansComposants, poseSurLesPages: poses.pages, viaDesInstancesDautresComposants: poses.viaInstances || 0, utiliseParAucune: poses.total === 0 },
    exposees: Object.entries(exposees).slice(0, 20).map(([n, e]) => n + ' ⇐ ' + e.composant + ' (dans ' + e.dans + ' variante(s)) : ' + [...e.proprietes].slice(0, 12).join(', ')),
    pieces: VERIF ? 'non lues (VERIF)' : pieces.slice(0, 30), sansEffet: sansEffetListe.slice(0, 20), appliqueeSeulementDans: appliqueeSeulementDans.slice(0, 20), valeursIdentiques: valeursIdentiques.slice(0, 12), identiquesSur: identiquesSur.slice(0, 12), changeDeNom: changeDeNom.slice(0, 12), changeDeParent: changeDeParent.slice(0, 12), memeChoix: [...memeChoix].slice(0, 12),
    sansContenu: sansContenu.slice(0, 12), montrableSansChoix: Object.entries(montrables).slice(0, 12).map(([c, n]) => c + ' — dans ' + n + ' variante(s), aucun échange d’instance'), ...(nonCalcule.length ? { nonCalcule } : {}),
    combinaisons: Array.isArray(combinaisons) ? combinaisons.slice(0, 20).concat(combinaisons.length > 20 ? ['… et ' + (combinaisons.length - 20) + ' autres'] : []) : combinaisons,
    tronque: pieces.length > 30 || sansEffetListe.length > 20 || appliqueeSeulementDans.length > 20 || (Array.isArray(combinaisons) && combinaisons.length > 20) });
}
return { cible: racine.name, masters: masters.length, lus: k - DEBUT, suite: k < masters.length ? k : null, mastersDeLibrairiePosesDansLaCible: distants, memeDessin: 'script à part : meme-dessin.js', casPratiques, sortie };
