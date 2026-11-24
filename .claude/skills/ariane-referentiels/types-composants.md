---
name: types-composants
description: Référentiel PERMANENT des types de composants courants — pour chacun, sa fonction (ce qu'elle permet, ce qu'elle interdit), ses propriétés habituelles et la façon dont les grands design systems publics le construisent, sources à l'appui ; plus les principes de construction d'un composant dans Figma et de modélisation de ses propriétés (états, nombre, choix unique). Lu par ariane-check-component pour juger la fonction et la construction d'un composant. Indépendant de toute mission ; aucun terme client.
metadata:
  type: reference
---

# Types de composants — fonction et construction

Relevé du **9 octobre 2026**, complété le **16 octobre 2026** pour la construction Figma des éléments courants (Untitled UI, GitLab Pajamas, Primer et Figma SDS par leurs fichiers Code Connect, Gestalt, Compound), à partir de la documentation publique de Figma et de design systems publics : Material 3 (docs de code Material Web et Android), Carbon (IBM), Polaris (Shopify, composants web), Atlassian, Fluent 2 (Microsoft), Primer (GitHub), Spectrum (Adobe : React Spectrum et Spectrum Design Data), Apple Human Interface Guidelines, et quelques systèmes plus petits quand ils documentent la construction Figma (GitLab Pajamas, Compound de Phoenix Group, Washington Post) ; pour la modélisation des propriétés (P8), aussi MUI, React Aria, GOV.UK et Nathan Curtis. Les noms canoniques des patterns vivent dans `patterns-ui.md` ; ce fichier dit **comment un type fonctionne et se construit**.

## Comment s'en servir

1. **Reconnaître le type** du composant contrôlé — par son nom, sa capture, sa structure — et lire sa fiche (§ Fiches). Un composant qui ne correspond à aucune fiche se juge par les **principes** seuls (§ Principes), et le contrôle le dit.
2. **Juger la fonction** : chaque propriété réglable et chaque combinaison réglable doivent correspondre à un usage que la fonction du type **permet**. Ce que la fonction **interdit** ne doit pas pouvoir se régler.
3. **Juger la construction** : est-ce celle que les systèmes publics donnent pour cette fonction, avec le bon outil pour chaque différence (§ Principes) ?
4. **Recommander une construction**, argumentée par le principe et les systèmes qui la fondent. Il y a souvent plusieurs bonnes constructions : en recommander **une**, cohérente de bout en bout ; l'autre voie (règle de documentation, modes de variables) se dit en une ligne.

**Ce que ce fichier ne fait pas** : il ne dit pas quels états, quelles propriétés ou quelles variantes un composant **devrait avoir**. Une propriété habituelle absente n'est **jamais** un défaut : la complétude reste hors du contrôle. Le modèle de propriétés d'une fiche sert à reconnaître le type et à proposer une cible, pas à réclamer ce qui manque.

**Quand les sources divergent**, la fiche le dit : aucune des constructions en concurrence n'est un défaut à elle seule. Seul compte qu'elle porte la fonction sans état interdit, sans information portée deux fois, sans niveau inutile.

## Principes de construction

### P1 — Un outil par nature de différence
Figma distingue cinq types de propriétés ; chaque différence entre deux rendus se porte par l'outil qui lui correspond.
- **Propriété de variante** : états, types, tailles — les différences qui changent l'apparence ou la structure (Figma, *Explore component properties* ; *Creating and organizing variants*). Primer : une variante quand le changement n'est **que du style** ; un **composant séparé** quand la fonction change.
- **Propriété booléenne** : montrer ou cacher un élément facultatif, au lieu de variantes pour chaque combinaison d'éléments (Figma, *Component property fundamentals*). Limite citée par Compound : si cacher l'élément change l'espacement, une variante est nécessaire.
- **Propriété texte** : le contenu à remplir (Figma).
- **Propriété d'échange d'instance** : remplacer un élément imbriqué (une icône, un visuel) parmi des choix approuvés — Figma déconseille une variante par icône.
- **Slot** : une zone de contenu libre ou répété (listes, cartes, modales) ; réduit les variantes et les calques masqués (Figma, *Use slots* ; Nathan Curtis, *Slots in Design Systems*). Annoncé en bêta ouverte le 05/03/2026 (blog et forum Figma) ; les pages d'aide lues le 09/10/2026 le disent « Available in Figma Design on all plans ». Réglages : valeurs préférées, « Only allow preferred instances », nombre minimum et maximum de calques — qui **guident** sans interdire (« designed to guide your team, not restrict them »). Limites : pas de slot sur le calque racine d'un composant ; les propriétés de composant ne s'appliquent pas aux calques posés dans un slot.
- **Valeurs préférées** d'un échange d'instance ou d'un slot : la liste des composants proposés dans le panneau (Figma ; GitLab : « always provide basic or example sub-component options … as preferred values » ; Compound ; Joey Banks). Sans elles, le panneau propose toute la librairie.
- **Modes de variables** : changer de contexte sans dupliquer — clair/sombre, contraste, langue, tailles d'appareil (Figma, *Modes for variables*) ; collections étendues pour plusieurs marques (aide Figma). Primer et Fluent portent clair/sombre par modes.

### P2 — Les signes qu'on a pris le mauvais outil
Les deux premiers sont posés par Figma comme règles ; les suivants sont des **pistes** (une construction à envisager, pas un défaut établi).
- Des variantes qui ne diffèrent **que par une icône ou un visuel** → un échange d'instance (Figma).
- Des variantes qui ne diffèrent **que par un texte** → une propriété texte.
- Des variantes qui ne diffèrent **que par une couleur de thème ou de marque** → elles se multiplient et se maintiennent partout ; Figma cite les modes de variables (les sources ne disent pas que les modes **remplacent** toujours ces variantes : c'est une piste, pas une règle).
- Des **calques masqués** pour chaque nombre possible d'éléments → un slot (Figma, blog *slots*).
- Une **explosion de combinaisons** (« an unmanageable number of permutations ») → propriétés séparées et combinables, instances imbriquées, slots (Figma).
- Des propriétés qui imitent un slot → un slot (Figma, *slots, instance swaps, and variants*). La page Figma de migration nomme les substituts : composants ou calques nommés « Slot », cadres de remplacement (« Insert here »), échange d'instance de remplacement.

### P3 — Une information à un seul endroit, au niveau le plus haut
- Une même information portée deux fois (deux propriétés qui se recopient ; un choix fait sur le master **et** répété par le choix du composant imbriqué) peut se contredire et se lit à deux endroits.
- Les propriétés vivent au niveau que l'utilisateur appelle : Primer « favor component properties over nesting » ; GitLab Pajamas : l'espacement et les contrôles fonctionnels vont dans le composant principal, pas dans le sous-composant ; Figma permet d'**exposer** les propriétés d'une instance imbriquée au niveau supérieur.
- Propriétés et valeurs alignées sur le code (Figma, Primer, Fluent, Washington Post) : c'est ce qui rend le composant lisible par un humain comme par une IA.

### P4 — Chaque niveau d'imbrication doit apporter quelque chose
- **Justifié** : une vraie pièce — un composant de base partagé par plusieurs composants (Figma, *Component architecture*), un élément répété (les items d'une liste, d'un groupe), une pièce publiée et réutilisée (une icône, un bouton), un contenu échangeable dans un conteneur (P5).
- **En trop** : un niveau qui n'enveloppe qu'un autre composant sans rendu propre, ou qui ne fait que répéter un choix déjà fait au-dessus (P3).
- **Les sources divergent sur la profondeur** : Figma encourage les composants de base ; GitLab Pajamas a retiré les siens et dit d'éviter l'imbrication (les surcharges se conservent moins bien en profondeur) ; Fluent 2 ne descend pas sous deux niveaux. L'imbrication n'est donc pas un défaut en soi : chaque niveau se juge à ce qu'il apporte.

### P5 — Un conteneur qui porte la forme, un contenu échangé
- Un conteneur porte ce qui est commun (taille, forme, marges, fond) et reçoit un contenu choisi parmi plusieurs : par échange d'instance (l'icône imbriquée et échangeable, Figma) ou par slots (Fluent Card : taille et orientation sur la carte, contenu dans ses slots ; Polaris Section).
- C'est une alternative aux variantes par contenu quand les contenus sont nombreux ou évoluent : ajouter un contenu ne touche pas au conteneur. Aucune source ne l'érige en règle : c'est une construction possible parmi d'autres.

### P6 — Ce que la fonction interdit ne doit pas pouvoir se régler
- **Deux propriétés distinctes se combinent toujours** : d'après des messages de la communauté Figma (source de second rang, à la date du relevé), il n'existe ni propriété conditionnelle ni exclusivité entre éléments d'un groupe. Une combinaison interdite par la fonction ne s'empêche donc que **par la structure**.
- **États exclusifs** d'un même élément (par défaut, sélectionné, désactivé, en erreur…) : une seule propriété dont les valeurs sont ces états, plutôt que des booléens qui se combinent (P8).
- **Choix exclusif entre éléments d'un groupe** (un seul actif) : en code, la sélection se porte sur le **groupe** chez Spectrum et Material (règles « une seule sélection », « sélection obligatoire » sur le groupe) ; Primer la porte sur chaque élément, mais en code un élément sélectionné désélectionne les autres. **Dans Figma**, un état actif réglable sur chaque élément laisse en activer plusieurs. Une propriété du groupe qui désigne l'élément actif est **une** façon de rendre cet état impossible ; d'autres existent (par exemple un groupe construit en variantes, une par élément actif). Le contrôle en propose une, sans dire que c'est la seule.
- **Exclusions mutuelles documentées** : l'erreur remplace le texte d'aide (Material, Carbon) et l'indicateur « valide » (Spectrum) ; désactivé et lecture seule sont deux états distincts (Carbon : lecture seule reste focalisable).
- Quand la fonction ne se lit pas (on ne sait pas si plusieurs éléments peuvent être actifs, si deux états peuvent coexister), c'est une **question** au design system, pas un défaut.

### P7 — Lisible par un humain comme par une IA
- Propriétés au niveau le plus haut, nommées comme dans le code, valeurs énumérées et cohérentes (Figma, Primer, Fluent, Washington Post).
- Les propriétés du kit Figma reprennent celles du composant codé : Washington Post (« match the coded API … as close as possible »), Fluent 2 (« the properties available in the UI kits map to the code »), Compound, Primer ; Code Connect relie chaque propriété Figma à une prop du code (une liste à une liste, un oui / non à un booléen, un texte à une chaîne). Une propriété Figma sans équivalent dans un modèle de props cohérent — un état éclaté en oui / non, une combinaison qui n'a pas de sens — n'a rien à quoi se relier. Les pages Figma sur son serveur MCP ne parlent pas des propriétés elles-mêmes : cette règle se déduit de la parité avec le code, elle n'est pas écrite par Figma.
- Une propriété n'existe que si un attribut doit vraiment se régler, et dit une intention plutôt qu'un style (GitLab Pajamas : « only use a property when an attribute should be explicitly configurable »).
- Ordre des propriétés : les variantes d'abord (Figma les affiche toujours au-dessus) ; Compound et Primer fixent un ordre (variante, taille, état, puis échanges, booléens, textes).
- Une description sur le composant (Figma).

### P8 — Modéliser les propriétés comme un design system
Ce que les systèmes publics font de leurs propriétés, et les règles qu'Ariane en tire. Une règle d'Ariane qu'aucune source ne porte est dite comme telle.
- **Un oui / non pour deux valeurs, une liste au-delà.** MUI : un booléen quand deux valeurs suffisent, une énumération sinon, ou si d'autres valeurs peuvent venir ; l'énumération « empêche d'utiliser une combinaison invalide » et borne le nombre de propriétés. *Ce qu'Ariane en tire* : deux booléens qui s'excluent (`primary`, `secondary`) laissent régler les deux à la fois ; une seule liste l'empêche. Dans Figma, un booléen ne fait que montrer ou cacher un calque (Figma, *Explore component properties*) : un oui / non qui change tout le rendu est une propriété de variante à deux valeurs.
- **Les états : les sources les rangent en familles ; la règle d'Ariane en fait une seule liste.** WAI-ARIA (1.2, 2023), MDN, Spectrum (modèle d'état), React Aria, Headless UI et Nathan Curtis (*The Sorry State of States*, 2024) distinguent : **l'interaction** (survol, appui, focus — passagère, elle vient de l'utilisateur ; MDN « user action pseudo-classes »), **la disponibilité** (désactivé, lecture seule, en attente), **la sélection ou la valeur** (`aria-checked` vrai / faux / mixte, `aria-selected`, `aria-pressed`, `aria-expanded`, `aria-current`), **la validation** (`aria-invalid` ; erreur, succès). Dans une famille, les valeurs s'excluent ; d'une famille à l'autre, elles se combinent — un onglet sélectionné et survolé, une case cochée et désactivée (Headless UI `data-checked:data-disabled` ; tutoriel Figma du bouton : `state` séparé de `status`). Les kits Figma mettent presque tous **désactivé** dans la liste d'état avec l'interaction (Curtis : 9 kits sur 10 ; Primer, GitLab, Untitled UI : default, hover, focused, disabled, loading) ; GitLab, Compound et Untitled UI gardent **sélectionné** à part (« Kits that collapse the two into one “active” state force designers to fake the combination later », Untitled UI). Spectrum fixe une **précédence** quand deux états sont actifs (information, sans règle dans le contrôle) (désactivé 100, lecture seule 90, indéterminé 85, sélectionné 80, validation 75, appui 70, focus 60, survol 50). **Une absence ne prouve pas une exclusion** : aucun des dix kits examinés par Curtis ne montre « readonly + focus » ni « hover + error », pourtant valides en code. **Règle d'Ariane** (un rangement par familles a été essayé puis retiré : il laissait « désactivé » et « sélectionné » en deux oui / non qui se combinent) : tous les états d'un composant sont les valeurs d'**une seule liste**, comme dans la plupart des kits Figma ; seuls deux états qu'une variante du fichier **montre** ensemble restent dans deux listes. Un oui / non d'état seul, sans autre état sur le composant, reste un oui / non (une liste à deux valeurs, MUI). Pour une IA : un état d'interaction n'existe pas en code comme prop (« Nobody writes `<Button state="hover">` », Goodridge, 2026) ; Code Connect relie la liste Figma aux props réelles.
- **Des éléments du même genre se règlent par leur nombre.** **Règle d'Ariane**, **contredite par les sources** : Nathan Curtis (*Figma Slots for Repeating Items*, 23/01/2026) range « an enum Count prop to display 1, 2 or 3 actions » parmi les anti-motifs (« This is composition, not configuration »), et Figma pousse le slot (« three visible rows but … seven more hidden just in case »). En code, un nombre n'existe que pour des éléments générés à l'identique (MUI Rating `max`, Pagination `count`) ; des éléments de contenu passent par les enfants. Ce qui appuie la règle : une liste n'offre que les nombres prévus, là où trois oui / non laissent régler « le troisième sans le deuxième » (MUI : l'énumération « prevents an invalid combination »), et un slot ne fait que guider. Des éléments **du même genre** sont interchangeables, jouent le même rôle et se remplissent dans l'ordre ; deux éléments de rôles différents, ou deux emplacements distincts (icône avant, icône après), restent des oui / non. Nombre borné (des oui / non le bornent déjà) → une liste ; contenu libre qu'aucun réglage ne borne → un slot. Relevé du 16/10/2026 : Primer et Figma SDS (Code Connect) posent les éléments répétés (segments, onglets, lignes, boutons) en instances enfants, sans propriété de nombre ; seul un kit tiers (Platform.uno) a un nombre en propriété de variante.
- **Un choix unique dans un groupe se porte sur le groupe ou sur chaque élément** — les sources se partagent en code : sur le groupe chez Spectrum et React Aria (valeur choisie, mode de sélection), sur chaque élément chez Material Web, Primer et GOV.UK. Aucune source officielle ne décrit comment un kit Figma l'exprime. Dans Figma, un état « sélectionné » réglable élément par élément laisse en activer plusieurs (P6) : une liste sur le groupe qui désigne l'élément actif est une façon de l'empêcher.
- **Pas de seuil de variantes.** Aucune source ne fixe un nombre limite ; Figma : « You don't need to have a component for every possible combination », mais un grand set ralentit l'import. Le skill officiel de Figma qui génère des librairies (`figma-generate-library`) découpe au-delà de 30 combinaisons : consigne d'un outil d'écriture, non retenue (Ariane ne fixe pas de seuil) ; Untitled UI publie 940 variantes de bouton. Ce qui réduit les variantes : booléens pour les éléments facultatifs, échange d'instance pour un contenu, slots, propriétés imbriquées exposées (Figma, Nathan Curtis, Compound). Le nombre de variantes d'un set est au plus le produit du nombre de valeurs de ses propriétés de variante ; il se compte sur les rendus que le set contient.
- **Une propriété qui suit toujours une autre porte deux fois la même information** — **règle d'Ariane** : dans un set Figma, deux propriétés dont une valeur va toujours avec une valeur de l'autre peuvent se contredire. En code, deux options proches peuvent rester distinctes parce que leurs comportements diffèrent : React Aria et Spectrum gardent `isPending` à côté de `isDisabled` (un bouton en attente reste focalisable). Le défaut est la recopie, pas l'existence de deux états voisins.
- **La variante par défaut** est la première du set, en haut à gauche ; c'est ce qu'on obtient à l'insertion (Figma). Elle doit être la plus courante — **règle d'Ariane** : l'état de repos tient lieu de cas le plus courant, la sélection ne se juge pas (GitLab ; Curtis, *The Figma Component Review* : « When I insert an instance, is the default correct? » ; Primer).
- **Un élément garde sa place et son nom d'une variante à l'autre**, sinon les surcharges se perdent quand on change de variante (Figma : « The layer names of the current instance and the variant … must match » ; support Figma : « the layer hierarchy must be the same » ; Primer ; Code Connect).
- **Changements cassants** : retirer ou renommer une propriété, réorganiser les variantes de façon que les instances existantes se résolvent autrement (aide Figma, *Tips for component management*) ; ajouter ou retirer un calque qui a des enfants (Primer) ; fusionner en booléen fait perdre les liens de prototype (aide Figma).
- **Variables qui disent leur usage** : « A variable called blue-500 tells agents nothing about when to apply it; color/brand/primary does » (aide Figma, IA) ; Curtis : le style le plus spécifique sémantiquement.
- **Composants de construction** : Figma (*Component architecture*) part d'un composant de base non publié ; GitLab Pajamas a retiré les siens (« base components are no longer used ») parce que les surcharges se conservent moins bien en profondeur ; Fluent 2 ne descend pas sous deux niveaux ; Primer préfère les propriétés à l'imbrication (cf. P4). Aucune source ne traite d'un composant qui n'en enveloppe qu'un autre : P3 et P4 suffisent à le juger.

### P9 — Un élément posé plusieurs fois a son propre composant de construction
- **Ce que font les systèmes** : un composant pour l'élément répété (segment, onglet, item, chip d'un groupe), qui porte **ses** états, son libellé et ce qui ne dépend que de lui ; le composant parent le pose autant de fois qu'il faut et porte le reste. Figma, tutoriel de la liste : l'élément porte `state` (par défaut, sélectionné), ses booléens, son échange d'instance et son libellé, la liste porte le reste (aide Figma, *Create a reusable list component*) ; Untitled UI, onglets : une base d'onglet partagée qui porte l'état courant ; praticiens : « avoid creating any state or properties already in sub-components ».
- **L'état actif vit sur l'élément** dans ces kits (Figma, Untitled UI ; forum Figma, 2025 : pas de réglage unique « actif » sur le parent sans exposer chaque élément).
- **Anti-modèle** : un composant d'élément **par valeur** du parent (par marque, par thème, par taille) qui ne diffère que par des valeurs ; Spectrum S2 est revenu d'un composant par taille et style à un seul set avec des propriétés. Les valeurs propres à une valeur du parent (une couleur de marque) se posent par le parent sur l'instance, **reliées à des variables**, ou par des **modes de variables** (aide Figma, *Modes for variables* ; Primer) — la seconde voie est la plus courante dans les sources, la première est valable (valeur reliée au système). **Limite** : quand une instance change de variante, Figma ne garde une surcharge que si la propriété surchargée a **la même valeur** dans les deux variantes source (« The layer names of the current instance and the variant … must match », P8 ; comportement constaté dans un fichier) ; sinon la valeur de la nouvelle variante l'emporte. Pour un élément dont l'état change à l'usage (panneau, Cmd-clic, prototype cliquable) et dont l'état change les couleurs, une couleur de marque posée en surcharge par le parent se perd donc au changement d'état ; un composant d'élément par marque, sans propriété de marque, ou les modes de variables, sont alors les constructions qui tiennent (règle d'Ariane).
- **Niveaux** : les sources s'arrêtent le plus souvent à deux niveaux sous le composant qu'on appelle (Fluent 2 ; Curtis juge trois niveaux « brittle ») ; aucune ne fixe un maximum.

### P10 — Ce que la construction ne peut empêcher qu'à grand coût s'écrit dans la documentation
- **Ce que font les systèmes** : l'exclusivité dans un groupe s'écrit en règle d'usage — Carbon, onglets : « Only one tab can be selected at a time » ; content switcher : « there should always be one selected » ; GitLab, segmented control : « only one can be selected and active », « There must always be one option active ». Figma ne verrouille pas tout : « component properties don't restrict access to other layers », les limites d'un slot « guide your team, not restrict them ».
- **Règle d'Ariane** : une combinaison que la fonction interdit se rend impossible **par la construction** quand ça n'ajoute ni propriété de variante ni niveau ; sinon la recommandation est une **règle de documentation** — une phrase courte et normative, dans la description du composant (lue par les IA) —, et la construction qui l'empêcherait est donnée en une ligne, avec son nombre de variantes.

### P11 — La profondeur suit la nature du composant ; ce qui ne se règle pas est un choix
- **Ce que disent les sources** : Figma présente le composant de base (« building block ») comme une construction normale, pour qu'un changement se propage (*Component architecture*) ; Joey Banks (*Baseline #3 – Base Components*, 25/01/2022) ne la justifie que si ses changements arrivent vraiment, et cite « usability over maintainability » : les bases « often create a worse experience for the designers using them » ; GitLab Pajamas les a retirées, Primer préfère les propriétés à l'imbrication (P4). Aucune source publique n'oppose en ces termes un élément simple et un assemblage, et aucune ne fixe de profondeur maximale.
- **Règle d'Ariane** : un **élément simple** (bouton, chip, tag, badge, interrupteur, case, radio, champ, message, vignette) a **un seul niveau** — un composant de construction qui porte une partie de son dessin est un niveau de trop ; un **assemblage** (groupe, sélecteur à segments, liste, carte, bandeau, module métier) a normalement des composants de construction (P9, P5). Les contenus posés (icônes, visuels, logos, composants publiés par ailleurs) ne sont pas des niveaux.
- **Figma expose une instance imbriquée tout ou rien** : « Currently it's everything or nothing » (forum Figma, *Expose/hide nested instances at component property level*, ouvert le 22/09/2022, toujours ouvert) ; les contournements décrits par la communauté sont un composant séparé, des valeurs préférées, ou la documentation. Un composant séparé qui retire des réglages est donc un **verrou**, pas un doublon.
- **Les combinaisons absentes sont admises** : « You don't need to have a component for every possible combination of properties and values » (aide Figma, *Create and use variants*). Ce qui se passe quand on choisit une combinaison absente n'est décrit que par la communauté (l'instance prend une autre variante) : la règle d'usage s'écrit dans la description (P10).
- **Règle d'Ariane** : une absence (propriété, propriété texte, variante, combinaison, échange) et un contenu figé sont des **choix**, jamais des défauts ; seul ce qui se règle de travers depuis le panneau du master en est un. Les checklists publiées (Carbon, *Component checklist*) ne hiérarchisent pas ; les grilles d'audit qui le font rangent par effet sur l'usage — c'est ce que fait le contrôle : le nettoyage (liaison aux variables, tailles) ne change pas le verdict.

## Fiches

Chaque fiche : **fonction**, ce qu'elle **permet** ; **Interdit (réglable)** — une combinaison de propriétés qu'on peut régler et que la fonction exclut, **base d'un défaut seulement si plusieurs systèmes la partagent (une source unique donne une question au DS, cf. le contrôle)** ; **Règles d'usage** — ce qui relève du contenu, du comportement ou de l'accessibilité, **hors contrôle** (jamais défaut, jamais question) ; **propriétés habituelles** (nom générique, nature) ; **construction** quand une source la décrit ; **divergences**. Les kits Figma des grands systèmes ne publient presque jamais leur construction : quand la fiche dit « non documentée », ce sont les principes qui s'appliquent.

### Bouton
- **Fonction** : déclencher une action et dire ce qui va se passer ; pas de navigation (un lien) — Carbon, Fluent, Atlassian.
- **Permet** : une hiérarchie (un seul bouton fort par groupe : Carbon, Primer, Fluent) ; chargement ; désactivé (déconseillé par Atlassian et Primer, qui proposent un « inactif » focalisable).
- **Interdit (réglable)** : le bouton icône seule en variante danger (Carbon).
- **Propriétés** : hiérarchie / variante (choix) ; taille (choix) ; désactivé ; chargement ; sélectionné (seulement pour un bouton bascule) ; icône avant, icône après (échangeables) ; libellé (texte) ; pleine largeur.
- **Construction Figma** (relevé du 16/10/2026) : un seul set à plat, sans base imbriquée — Untitled UI (940 variantes sur quatre propriétés : hiérarchie, taille, état, icône seule ; états default, hover, focused, disabled, loading), GitLab Pajamas (`State` : rest, hover, focus, active, disabled ; `Is selected` à part ; « Avoid base components to reduce issues with override persistence »), Primer (`state` en liste ; booléens suffixés « ? »). L'icône : un booléen pour l'afficher, un échange d'instance pour la choisir (Untitled UI, Compound, Primer). La taille est une propriété de variante partout (Carbon essaie de la passer en modes de variables). Le désactivé est une valeur de la liste d'états (Untitled UI, GitLab, Primer ; 9 kits sur 10 selon Curtis), multipliée par chaque hiérarchie et chaque couleur.
- **Divergences** : le nom de la hiérarchie (variant, appearance, kind) ; le chargement remplace le libellé (Atlassian, Polaris) ou seulement l'icône (Primer).
- Sources : https://carbondesignsystem.com/components/button/usage/ · https://atlassian.design/components/button/examples · https://primer.style/product/components/button/ · https://fluent2.microsoft.design/components/web/react/core/button/usage · https://shopify.dev/docs/api/app-home/polaris-web-components/actions/button

### Bouton icône
- **Fonction** : une action courante et reconnaissable quand la place manque (Atlassian).
- **Permet** : une variante bascule, sélectionnée ou non, l'icône changeant de style (Material).
- **Interdit (réglable)** : rien de documenté.
- **Règles d'usage** : un nom accessible (tous) ; pas d'icône ambiguë ni réutilisée pour plusieurs sens (Atlassian).
- **Propriétés** : icône (échangeable) ; variante et taille comme le bouton ; libellé accessible (texte) ; sélectionné (bascule seulement).
- **Construction** : non documentée.
- Sources : https://atlassian.design/components/button/icon-button/usage · https://primer.style/product/components/icon-button/ · https://raw.githubusercontent.com/material-components/material-web/main/docs/components/icon-button.md

### Icône et son conteneur de taille
- **Fonction** : exprimer un concept, seule ou à côté d'un texte.
- **Permet** : quelques tailles fixes (Carbon 16, 20, 24, 32 ; Atlassian 16 et 12) ; un style plein pour l'état sélectionné (Fluent, Apple).
- **Interdit (réglable)** : rien de documenté.
- **Règles d'usage** : l'icône ne porte pas ses propres marges, le composant autour règle l'espace (Atlassian : « spacing-neutral »).
- **Propriétés** : taille (choix) ; le glyphe (échangeable) ; libellé accessible quand aucun texte ne l'accompagne.
- **Construction** : l'icône imbriquée et échangeable (Figma) ; un conteneur qui porte la taille et la cible tactile, avec l'icône centrée (Carbon, Material) — cf. P5.
- Sources : https://carbondesignsystem.com/elements/icons/usage/ · https://atlassian.design/components/icon/usage · https://fluent2.microsoft.design/iconography · https://help.figma.com/hc/en-us/articles/39723486706455-Components-collection-Nesting-instances-fundamentals

### Chip, tag
- **Le mot recouvre trois fonctions distinctes** — à identifier d'abord : **étiquette inerte** (Carbon lecture seule, Atlassian, Primer Label), **filtre sélectionnable** (Material filter, Carbon sélectionnable, Polaris cliquable), **valeur supprimable** (Material input, Fluent, Carbon fermable).
- **Interdit (réglable)** : plusieurs fonctions sur un même tag, par exemple sélectionnable et supprimable à la fois (Carbon).
- **Règles d'usage** : pas un lien (Carbon) ; pas pour un statut (Atlassian : un lozenge).
- **Propriétés** : sélectionné (filtre) ; supprimable (valeur) ; désactivé ; icône ou avatar en tête (échangeable) ; taille ; couleur (étiquette).
- **Construction Figma** (relevé du 16/10/2026) : un composant par élément, variantes à plat — Untitled UI : tags 210 variantes (trois tailles, parties optionnelles : point, avatar, compteur, croix, case), la case cochée / non cochée comme variante du même composant ; « The close X, count, and checkbox are their own sub-components with hover, focused, and disabled states » : seules les **parties posées** (croix, compteur, case) sont des sous-composants, jamais le dessin du chip. Gestalt (Tag) : taille, désactivé, erreur, avertissement en variantes. GitLab (badge) : la couleur par une valeur `variant`, ses propriétés passées aux variables (2024). Forum Figma (praticien) : le sélectionné en propriété de variante, les couleurs par variables. **Le désactivé identique d'une couleur à l'autre : aucune source ne dit ce qu'un kit en fait** ; Untitled UI garde le désactivé dans la liste d'états, multiplié par chaque couleur. En code, chaque chip filtre porte son état, et le **groupe** porte la règle « une seule » ou « au moins une » (Material) ; par défaut, plusieurs chips filtres peuvent être actives.
- Sources : https://raw.githubusercontent.com/material-components/material-web/main/docs/components/chip.md · https://carbondesignsystem.com/components/tag/usage/ · https://atlassian.design/components/tag/usage · https://fluent2.microsoft.design/components/web/react/core/tag/usage

### Contrôle segmenté, sélecteur de quelques options
- **Fonction** : choisir **une** valeur parmi un petit ensemble d'options proches, appliquée immédiatement (Primer) ; basculer entre vues d'un même contenu (Carbon).
- **Permet** : texte **ou** icônes (pas un mélange : Apple, Carbon) ; segments de largeur égale.
- **Interdit (réglable)** : plusieurs segments actifs quand il représente un choix (Primer « mutually exclusive » ; Carbon « only one … at a time and there should always be one selected »).
- **Règles d'usage** : ne pas mêler segments d'action et segments de sélection (Apple) ; pas de menu dans un segment (Primer) ; pas pour un choix binaire (Carbon : un interrupteur).
- **Propriétés** : sur le groupe — l'élément sélectionné, taille, pleine largeur ; sur chaque segment — libellé ou icône, désactivé.
- **Construction Figma** (relevé du 16/10/2026) : Primer (Code Connect) — le conteneur n'a que `size` et ses segments en **instances enfants**, sans propriété de nombre ; le segment est un composant à part (`label` en texte, `state` en liste, icône en booléen et échange d'instance). Le nombre en propriété de variante (« Item count 1 à 5 ») n'existe que dans un kit tiers (Platform.uno). Aucun kit ne garantit un seul segment actif ; le forum Figma (2025) dit que Figma ne sait pas le garantir entre éléments frères. En code, sélection portée par le groupe (Spectrum, Material) ou par chaque segment (Primer). Dans Figma, cf. P6 : une propriété du groupe est une façon d'empêcher deux segments actifs. Apple, sur macOS, admet une sélection multiple : dans ce cas ce n'est plus un choix unique.
- **Divergences** : nombre maximal d'options (5 chez Primer, 5 à 7 chez Apple).
- Sources : https://primer.style/product/components/segmented-control/ · https://developer.apple.com/tutorials/data/design/human-interface-guidelines/segmented-controls.json · https://carbondesignsystem.com/components/content-switcher/usage/ · https://react-spectrum.adobe.com/react-spectrum/ActionGroup.html · https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/ToggleButtonGroup.md

### Onglets
- **Fonction** : regrouper du contenu apparenté en catégories sans quitter la page (Carbon, Atlassian) ; sur mobile, naviguer entre sections (Apple).
- **Interdit (réglable)** : plus d'un onglet actif (Carbon).
- **Règles d'usage** : pas de contrôles complexes dans un onglet (Atlassian) ; pas pour filtrer un même contenu (Carbon : un contrôle segmenté) ; un seul format, texte seul ou texte + icône, dans une barre (Fluent).
- **Propriétés** : sur la barre — l'onglet actif, variante, orientation ; sur l'onglet — libellé, icône (échangeable), désactivé, badge.
- **Construction Figma** (relevé du 16/10/2026) : Primer et Figma SDS (Code Connect) — la barre pose ses onglets en instances enfants, sans nombre ; l'onglet porte `label` et `state` (selected, default, hover, focus). Untitled UI : une base d'onglet avec `Current` à chaque taille, un booléen « Full width » (les onglets se partagent la largeur ou épousent leur libellé). En code, actif porté par la barre (Spectrum) ou par l'onglet (Material, Primer). Forum Figma : barre avec onglets en slots, booléen « sélectionné » par onglet — sans exclusivité (cf. P6).
- **Divergences** : désactiver un onglet est permis (Carbon), interdit pour une barre d'onglets (Apple).
- Sources : https://carbondesignsystem.com/components/tabs/usage/ · https://atlassian.design/components/tabs/usage · https://fluent2.microsoft.design/components/web/react/core/tablist/usage · https://react-spectrum.adobe.com/react-spectrum/Tabs.html · https://raw.githubusercontent.com/material-components/material-web/main/docs/components/tabs.md

### Groupe de boutons radio
- **Fonction** : un choix obligatoire parmi plusieurs options mutuellement exclusives (Carbon, Atlassian, Primer).
- **Interdit (réglable)** : deux options cochées.
- **Règles d'usage** : une radio ne s'utilise pas hors d'un groupe (Spectrum).
- **Propriétés** : sur le groupe — la valeur choisie, désactivé, lecture seule, erreur, requis, orientation ; sur chaque option — libellé, désactivée.
- **Construction** : non documentée. En code, valeur portée par le groupe (Spectrum, Material Android, Primer) ; cf. P6.
- **Divergences** : une option présélectionnée (Atlassian, Primer) ou aucune (Carbon).
- Sources : https://carbondesignsystem.com/components/radio-button/usage/ · https://atlassian.design/components/radio/usage · https://primer.style/product/components/radio-group/ · https://react-spectrum.adobe.com/react-spectrum/RadioGroup.html · https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/RadioButton.md

### Case à cocher et groupe de cases
- **Fonction** : des choix indépendants — zéro, un ou plusieurs (Carbon).
- **Permet** : coché, non coché, **indéterminé** (une case parente partiellement cochée : Carbon, Fluent, Material).
- **Interdit (réglable)** : rien de documenté — **plusieurs cases cochées sont voulues** ; aucune propriété du groupe ne désigne « l'élément actif ».
- **Règles d'usage** : la validation et le « requis » se portent sur le groupe, pas sur une case isolée (Primer).
- **Propriétés** : **état de la case** (coché, non coché, indéterminé — une seule valeur à la fois) ; désactivé ; lecture seule ; erreur ; libellé (texte) ; texte d'aide. Groupe : étiquette, requis, erreur.
- **Construction Figma** (relevé du 16/10/2026) : Untitled UI — 72 variantes, deux tailles, états default, hover, focused, disabled, croisés avec coché, non coché et indéterminé (une propriété à part) ; GitLab — `Is checked` (unchecked, indeterminate, checked) à part de `State` (rest, hover, focus, active, disabled). Coché et désactivé sont donc deux propriétés qui se combinent : une variante les montre ensemble. En code, l'état coché vit sur chaque case, requis et validation sur le groupe (Primer).
- Sources : https://carbondesignsystem.com/components/checkbox/usage/ · https://atlassian.design/components/checkbox/usage · https://primer.style/product/components/checkbox/

### Interrupteur
- **Fonction** : basculer un réglage **avec effet immédiat**, sans validation (toutes les sources).
- **Interdit (réglable)** : plus de deux valeurs, un état mixte (Carbon, Primer, Fluent) ; un état d'erreur (selon Spectrum seulement).
- **Règles d'usage** : pas à la place d'une case à cocher dans un formulaire à valider (Primer, Fluent, Polaris) ; un libellé qui ne change pas selon l'état (Atlassian, Primer).
- **Propriétés** : actif ; désactivé ; lecture seule ; chargement ; taille ; libellé ; icône sur le curseur (Material).
- **Construction Figma** (relevé du 16/10/2026) : Untitled UI — 64 variantes, deux tailles, deux styles, « off and on in default, hover, focus, and disabled states » dans un seul composant. Material 3 a reconstruit le sien pour sa complexité (couches d'état, mouvement).
- Sources : https://carbondesignsystem.com/components/toggle/usage/ · https://atlassian.design/components/toggle/usage · https://primer.style/product/components/toggle-switch/ · https://react-spectrum.adobe.com/react-spectrum/Switch.html

### Liste déroulante
- **Fonction** : choisir dans une liste prédéfinie (Carbon, Atlassian, Polaris) ; montre la valeur courante (Apple). Une liste de **commandes** est un autre composant (Apple : bouton déroulant d'actions).
- **Interdit (réglable)** : rien de documenté.
- **Règles d'usage** : pas pour deux options (Carbon : des radios) ; pas de placeholder à la place du libellé (Carbon, Atlassian).
- **Propriétés** : libellé ; placeholder ; valeur choisie ; sélection multiple (variante chez Carbon) ; désactivé ; requis ; erreur ; texte d'aide ; style ; taille.
- **Construction** : non documentée.
- **Divergences** : seuil d'options (radios jusqu'à 6 chez Primer ; liste dès 4 chez Fluent et Polaris).
- Sources : https://carbondesignsystem.com/components/dropdown/usage/ · https://atlassian.design/components/select/usage · https://primer.style/product/components/select/ · https://shopify.dev/docs/api/app-home/polaris-web-components/forms/select

### Carte
- **Fonction** : contenu et actions sur **un seul sujet** (Material, Fluent).
- **Interdit (réglable)** : rien d'établi.
- **Divergences** : Carbon exclut une action interne dans une tuile entièrement cliquable ; Fluent admet une surface cliquable quand une action est évidente, des actions séparées sinon. Aucune des deux n'est un défaut ; si le composant permet les deux à la fois sans qu'on lise le choix, question au DS.
- **Règles d'usage** : ne pas mélanger des types de cartes dans un groupe (Carbon).
- **Propriétés** : type ou apparence (Material : style seul, même fonction) ; cliquable / sélectionnable / dépliable (Carbon : quatre types, quatre fonctions) ; orientation ; taille (Fluent : largeur et hauteur indépendantes) ; zones de contenu (en-tête, aperçu, corps, pied).
- **Construction** : Figma cite la carte comme cas typique de slot (« variant magnet ») ; Nathan Curtis : le corps est un slot. Fluent : en-tête, aperçu, pied en slots.
- Sources : https://carbondesignsystem.com/components/tile/usage/ · https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/Card.md · https://fluent2.microsoft.design/components/web/react/core/card/usage · https://www.figma.com/blog/supercharge-your-design-system-with-slots/

### Ligne de liste
- **Fonction** : un élément d'une liste — lecture, ou cible d'une action ou d'une sélection.
- **Interdit (réglable)** : plus d'un élément actif **quand la liste est en sélection simple** — en sélection multiple, plusieurs lignes actives sont voulues ; si le mode ne se lit pas dans le fichier, question au DS ; un élément à la fois désactivé et sélectionné ou actif (Primer, Material).
- **Règles d'usage** : une liste à sélection unique ne sert pas quand plusieurs choix sont attendus (Carbon : un tableau).
- **Propriétés** : sur la ligne — type (texte, lien, bouton), désactivé, sélectionné ou actif, variante (danger), taille ; zones : visuel de début, texte principal, texte secondaire, visuel ou action de fin. Le **mode de sélection** se règle sur la liste, pas sur la ligne (Primer).
- **Construction Figma** (relevé du 16/10/2026) : Primer (Code Connect) — la liste pose ses lignes en enfants ; les pièces de début et de fin et la description sont des **composants distincts** (plusieurs versions de description : libellé seul, avec description en bloc ou en ligne, danger) plutôt que des booléens. Figma SDS : `Density` et un titre en booléen sur la liste, la ligne ne porte qu'un texte. Figma et Nathan Curtis : visuels de début et de fin en slots ; Figma : des calques masqués pour chaque nombre d'éléments sont le signe qu'il faut un slot.
- Sources : https://primer.style/product/components/action-list/ · https://carbondesignsystem.com/components/structured-list/usage/ · https://raw.githubusercontent.com/material-components/material-web/main/docs/components/list.md · https://nathanacurtis.substack.com/p/slots-in-design-systems

### Vignette, avatar, image
- **Fonction** : des composants distincts par fonction (Polaris) — avatar (une personne ou une entité, avec repli en initiales), vignette (petit aperçu d'un contenu, avec un placeholder pendant le chargement), image (pleine taille, avec un ratio).
- **Permet** : la forme porte un sens (Atlassian : cercle pour une personne, carré ou hexagone pour une entité ; Primer : carré pour une entité non humaine).
- **Propriétés** : taille (une échelle : Polaris, Primer, Spectrum) ; source de l'image ; repli (initiales, placeholder) ; forme ; texte alternatif ; ratio et cadrage (image).
- **Construction** : non documentée par un grand système ; forum Figma : un échange d'instance ne cible pas une variante, donc des contenus à échanger se construisent en composants séparés. Pour des contenus nombreux dans un même cadre, cf. P5.
- **Divergences** : la forme carrée désigne un groupe (Fluent) ou une entité non humaine (Atlassian, Primer).
- Sources : https://shopify.dev/docs/api/app-home/polaris-web-components/media-and-visuals/thumbnail · https://shopify.dev/docs/api/app-home/polaris-web-components/media-and-visuals/avatar · https://atlassian.design/components/avatar/usage · https://primer.style/product/components/avatar/

### Alerte, bannière, message temporaire
- **Fonction** : informer d'un état ou d'un événement. Les systèmes séparent des **composants distincts par portée et par durée** : toute la page (bannière), une zone (message de section, alerte en ligne), un événement temporaire (toast, snackbar) — Carbon, Atlassian, Fluent, Material.
- **Interdit (réglable)** : (selon le type) une bannière critique fermable (Atlassian, Primer ; Polaris la rend fermable sauf action immédiate requise : divergence).
- **Règles d'usage** : une ou deux actions au plus (Carbon une, Primer et Polaris deux) ; pas de disparition automatique d'une erreur critique (Atlassian) ; une seule bannière à la fois (Primer).
- **Propriétés** : gravité / ton (info, succès, avertissement, erreur) ; fermable ; titre et corps (texte) ; action(s) ; icône liée à la gravité (Primer : non désactivable, sauf info).
- **Construction Figma** (relevé du 16/10/2026) : Primer (Code Connect) — une valeur `Variant` par type (warning, critical, success, info, upsell), titre et corps en textes, titre facultatif, actions et fermeture en **booléens**, boutons en instances enfants ; Figma SDS — `Title` et `Body` en propriétés texte, icône en booléen et échange d'instance, fermeture en booléen, bouton en enfant. Les sources décrivent des composants séparés par portée, pas une propriété « portée ».
- **Divergences** : nombre d'actions ; obligation d'une action pour avertissement et erreur (Fluent).
- Sources : https://carbondesignsystem.com/components/notification/usage/ · https://atlassian.design/components/banner/usage · https://primer.style/product/components/banner/ · https://fluent2.microsoft.design/components/web/react/core/messagebar/usage

### Badge, pastille de statut
- **Le mot ne désigne pas la même fonction** d'un système à l'autre — à identifier d'abord : un **nombre** (Atlassian badge, Primer CounterLabel, Material badge ancré à une icône), un **statut textuel** produit par le système (Polaris badge, Atlassian lozenge), une **métadonnée** de catégorie (Primer Label, Spectrum badge).
- **Interdit (réglable)** : rien de documenté.
- **Règles d'usage** : pas la couleur seule pour porter un statut (Carbon : au moins deux indices parmi couleur, forme, symbole) ; pas de badge pour une étiquette créée par l'utilisateur (Polaris) ; pas de statut dans un tag (Atlassian).
- **Propriétés** : ton ou couleur ; taille ; icône ; libellé ou nombre ; maximum affiché (nombre).
- **Construction Figma** (relevé du 16/10/2026) : Untitled UI — 666 variantes : trois formes, trois tailles, douze couleurs (cinq sémantiques, sept d'accent) en valeurs de variante, sans désactivé ; GitLab — six valeurs `variant` choisies par le sens (« Match the variant to the meaning of the metadata »), propriétés passées aux variables. Material : si un texte et un nombre sont donnés, le texte l'emporte.
- Sources : https://atlassian.design/components/lozenge/usage · https://shopify.dev/docs/api/app-home/polaris-web-components/feedback-and-status-indicators/badge · https://carbondesignsystem.com/patterns/status-indicator-pattern/ · https://primer.style/product/components/label/

### Champ de saisie
- **Fonction** : demander une petite quantité d'information sur une ligne (Apple, Carbon).
- **Interdit (réglable)** : voir les exclusions ci-dessous.
- **Règles d'usage** : pas de placeholder à la place du libellé (Carbon, Atlassian, Apple) ; pas d'éléments interactifs dans le champ (Atlassian) ; éviter un visuel de début et de fin à la fois (Primer).
- **Exclusions** : le message d'erreur **remplace** le texte d'aide (Carbon, Material) et l'indicateur « valide » (Spectrum) ; désactivé et lecture seule sont distincts (Carbon).
- **Propriétés** : libellé ; placeholder ; valeur ; texte d'aide ; erreur et message ; désactivé ; lecture seule ; requis ; taille ; style (Material rempli ou contour, même fonction) ; préfixe, suffixe, icônes.
- **Construction** : non documentée ; la taille est une échelle sur un seul axe.
- Sources : https://carbondesignsystem.com/components/text-input/usage/ · https://atlassian.design/components/textfield/usage · https://primer.style/product/components/text-input/ · https://opensource.adobe.com/spectrum-design-data/components/text-field

### État de chargement (squelette)
- **Fonction** : une version simplifiée d'un contenu pendant son premier chargement.
- **Interdit (réglable)** : rien de documenté.
- **Règles d'usage** : pas de squelette sur les éléments fixes, les toasts, menus, modales (Carbon, Fluent) ; ne pas reproduire les détails du contenu final (Fluent).
- **Construction** : **deux approches coexistent** — un **état** du composant (Carbon : le champ, la tuile ont un état squelette ; les composants d'action n'en ont pas) ou des **composants à part** (Primer, relevé du 16/10/2026 : `SkeletonBox`, `SkeletonText` avec `size` et `lines`, `SkeletonAvatar` ; Atlassian). Aucune n'est un défaut. Ce qui reste réglable pendant le chargement : aucune source ne le dit.
- Sources : https://carbondesignsystem.com/patterns/loading-pattern/ · https://fluent2.microsoft.design/components/web/react/core/skeleton/usage · https://primer.style/product/ui-patterns/loading/

## Sources des principes
- Figma : https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties · https://help.figma.com/hc/en-us/articles/39636407507735-Components-collection-Component-property-fundamentals · https://help.figma.com/hc/articles/38741465279895 · https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma · https://help.figma.com/hc/en-us/articles/15343816063383 · https://www.figma.com/best-practices/component-architecture/ · https://www.figma.com/best-practices/creating-and-organizing-variants/
- Primer : https://primer.style/product/contribute/contributing-to-figma · https://primer.style/guides/figma
- GitLab Pajamas : https://design.gitlab.com/get-started/uik-components
- Fluent 2 : https://fluent2.microsoft.design/get-started/design
- Compound : https://compound.thephoenixgroup.com/latest/figma/components/component-properties-uJbaUrky
- Recherche du 9 octobre 2026, sources principales : WAI-ARIA 1.2 https://www.w3.org/TR/wai-aria-1.2/ · MDN https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes · Curtis https://nathanacurtis.substack.com/p/the-sorry-state-of-states-89dd4668737e · https://nathanacurtis.substack.com/p/figma-slots-for-repeating-items · Figma, astuces https://help.figma.com/hc/en-us/articles/39747637290263 · Figma, IA https://help.figma.com/hc/en-us/articles/38978644498199 · Figma, surcharges https://help.figma.com/hc/en-us/articles/360039150733 · Untitled UI https://www.untitledui.com/components/buttons
- Modélisation des propriétés (P8, relevé du 9 octobre 2026) : MUI https://mui.com/guides/api/ · Spectrum, modèle d'état https://opensource.adobe.com/spectrum-design-data/spec/state-model/ · React Aria https://react-aria.adobe.com/ToggleButtonGroup · GOV.UK https://design-system.service.gov.uk/components/radios/ · Nathan Curtis https://nathanacurtis.substack.com/p/slots-in-design-systems · Figma, blog slots https://www.figma.com/blog/supercharge-your-design-system-with-slots/ · Figma, variantes https://help.figma.com/hc/en-us/articles/360056440594 · Code Connect https://developers.figma.com/docs/code-connect/ · Figma MCP https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/
- Washington Post : https://build.washingtonpost.com/resources/guides/figma-guide
- Forum Figma (messages d'utilisateurs, source de second rang) : https://forum.figma.com/ask-the-community-7/can-i-build-a-nav-with-a-single-variant-44149

## Limites du relevé
- Lu par résumés de pages (les citations sont celles des résumés, pas relues mot à mot sur la page) ; les guidelines de design de Material 3 et de Spectrum n'ont pas pu être lues (seulement leurs docs de code et données) ; Polaris lu dans ses composants web actuels.
- La construction Figma propre à chaque type n'est presque jamais publiée par les grands systèmes : les fiches donnent alors les principes et le constat de code, jamais une construction inventée. Le relevé du 16/10 la lit dans les fichiers Code Connect publiés (Primer, Figma SDS : seules les propriétés reliées au code y figurent) et dans les pages de kits qui la décrivent (Untitled UI, GitLab, Compound) ; les fichiers des kits eux-mêmes ne se lisent pas par le web.
- À relever de nouveau quand une source change (statut des slots incertain au 09/10/2026 : bêta ouverte annoncée le 05/03/2026, aide sans mention de bêta).
