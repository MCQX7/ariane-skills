---
name: ariane-rename-layers
description: Étape d'Ariane, appelée par ariane-orchestrator ; si la demande ne précise pas quoi traiter, laisser ariane-orchestrator prendre la main. Nettoie la STRUCTURE et le NOMMAGE des layers éditables (frames, groups, textes, formes hors instance) d'un écran ou fichier Figma vers une convention AI-ready (camelCase EN, nommage par rôle, anti-bruit), et RESTRUCTURE activement (collapse des frames coquilles sans effet sur le rendu). À utiliser dès que l'utilisateur veut renommer ou nettoyer des calques/frames/groups, retirer le bruit (Frame 1234, Group 5, noms FR, Title Case, espaces), supprimer les cadres inutiles ou aplatir les frames d'un écran sur-imbriqué, ou passe un lien Figma avec une intention de clean d'arborescence/structure. NE PAS confondre avec ariane-rename-props (propriétés de composants et nom du master), ni avec ariane-check-component (contrôle en lecture seule) ou ariane-rebuild-component (refonte d'un composant).
user-invocable: false
---

# Figma — Renommage des layers (AI-ready)
<!-- version: v2.22 -->

Nettoie la **structure** et le **nommage** des layers **éditables** (FRAME / GROUP / TEXT / formes hors instance) d'un écran ou fichier Figma, en **deux passes**, structure **toujours** avant nommage : (1) **collapse** des frames coquilles prouvées sans effet sur le rendu ; (2) **renommage** AI-ready. Ne touche **jamais** aux propriétés de composants (périmètre de `ariane-rename-props`) ni aux instances (exceptions : § Tri technique).

## Objectif — pourquoi ce skill existe
**But commun aux skills `ariane-rename-layers` et `ariane-rename-props`** : rendre le design system **AI-ready** — lisible et prédictible par un agent IA (ou un développeur) **sans voir le rendu**. Un nom AI-ready est :
- **sémantique** : il dit la **fonction**, jamais la position (`priceSection`, pas `Bottom`) ;
- **en anglais** ;
- **conventionnel** : camelCase pour les calques, PascalCase pour les masters (un master n'est pas renommé ici) ;
- **déterministe** : le même élément reçoit **toujours le même nom**, entre runs et entre écrans ;
- **structurellement explicite** : `Section` / `Container` / `Block` expriment la hiérarchie.

Ce skill rend ainsi lisibles les **calques éditables**, et nettoie la structure pour que la hiérarchie reflète le **sens**, pas des artefacts de maquettage. **Sur un cas ambigu**, préférer le nom qui aide le plus une IA à comprendre la fonction de l'élément ; en cas de doute irréductible, **demander vaut mieux que supposer**.

## Entrée
Lien Figma d'un écran, d'une section ou d'un fichier : `$ARGUMENTS`. Si aucun lien n'est fourni, le demander avant toute action.

## Fichiers qui font foi — introuvable → ARRÊT
Ce skill lit des fichiers qui font foi pour leur sujet : `${CLAUDE_SKILL_DIR}/../ariane-referentiels/prerequis-communs.md`, les trois référentiels (§ Sources du vocabulaire), et, selon le cas, `board-documentation.md`, `modes-de-sortie.md`, `lot-multi-ecrans.md` et la sonde `sonde-cadres.js` (dans `${CLAUDE_SKILL_DIR}/`). **L'un d'eux introuvable ou illisible → ARRÊT, sans exception** : s'arrêter avant toute lecture ou écriture Figma (ou, pour un fichier lu en cours de run, avant d'aller plus loin), dire quel fichier manque et le chemin essayé, et rappeler que `ariane-referentiels/` s'installe à côté des skills (README, installation). **Ne jamais continuer sans, ni le remplacer au jugé** : le nommage divergerait d'un run à l'autre.

## Prérequis à rappeler à l'utilisateur
- **Lire `prerequis-communs.md`** et rappeler ce qu'il dit : filet de sécurité (branche ou historique des versions selon la cible, jamais créé par l'étape), question du filet en appel direct, skills à jour, connecteur Figma officiel. Ce fichier fait foi pour ces quatre points ; ce `SKILL.md` n'y ajoute que ce qui est propre à cette étape.
- **La Passe 1 applique les collapses prouvés inertes d'office**, sans confirmation ni arbitrage préalable : la preuve de la sonde est le garde-fou ; la branche isole le fichier principal, l'historique des versions de Figma permet de revenir en arrière (le designer y nomme un point de retour s'il le veut — l'étape ne sait pas le faire).

## Sources du vocabulaire (lecture seule)
**Quatre sources distinctes, jamais mélangées** :
- `${CLAUDE_SKILL_DIR}/../ariane-referentiels/conventions-nommage.md` (`[[conventions-nommage]]`) — **règles de construction** et **vocabulaire d'interface** FR→EN. **Permanent.**
- `${CLAUDE_SKILL_DIR}/../ariane-referentiels/lexique-mission.md` (`[[lexique-mission]]`) — vocabulaire du **domaine** et **noms de produits**. **Se vide** au changement de mission.
- `${CLAUDE_SKILL_DIR}/../ariane-referentiels/patterns-ui.md` (`[[patterns-ui]]`) — **noms canoniques des patterns UI** (card, modal, stepper, badge…), table partagée avec `ariane-rename-props` (§ Patterns UI).
- Le **vocabulaire de rôles** propre à ce skill (Section / Container / Block / Wrapper, rôles TEXT) — **ici**, dans ce `SKILL.md`.

Les trois fichiers se chargent **avant tout nommage** — les mêmes que `ariane-rename-props`. Dans ce `SKILL.md`, **« glossaire »** désigne conventions + lexique pris ensemble ; aucun n'est prioritaire par défaut, la précédence ci-dessous tranche.
- **Toute traduction FR→EN passe par le glossaire** (prix→price, panier→cart…). **Jamais au jugé** — rester cohérent avec les props.
- **PRÉCÉDENCE — la RÈGLE et le JETON ne se comportent pas pareil :**
  - **Règle de construction** (comment le nom se forme : suffixes de rôle, casse, `has`/`show`, « fonction pas apparence », « + » → `Plus`) → **les conventions gagnent toujours**. Une entrée de lexique ne suspend pas une règle de construction — c'est la garantie anti-oscillation (si le lexique disait `dateLabel`, la règle « une date est une `Value` » l'emporte).
  - **Jeton** (quel mot désigne un concept : `inverted`, `compact`…) → **le lexique gagne**, le plus spécifique l'emporte. Un jeton du socle est un **défaut maison** ; si la mission en porte un autre pour le même concept, c'est celui de la mission qui s'applique, pour tous les runs suivants de cette mission.
  - **Test** : la contradiction porte-t-elle sur la **forme** du nom (→ conventions), ou sur le **mot** choisi (→ lexique) ?
- **Correspondance à une entrée — à la lettre, jamais au sens.** Une entrée s'applique à un terme source qui lui est **égal** (à la casse, aux accents, au pluriel et à un emoji près) ou qui figure dans ses **variantes listées** ; rien d'autre ne la déclenche — ni un mot en commun, ni un sens voisin, ni une abréviation non listée. Un libellé fait de plusieurs termes **se découpe** : chaque entrée s'applique à la partie qui lui est égale, le reste se nomme par ses propres mots (référentiels, puis règles de construction). Un terme qui ressemble seulement à une entrée **n'en hérite pas** ; si une question se pose pour lui, l'entrée y figure **en option, jamais en recommandation**, et la réponse qui l'y rattache se propose comme **variante listée** de l'entrée.
- Ce skill **n'écrit jamais** dans ces fichiers. Terme **absent du glossaire**, ou pattern absent de la table → `❓`, **remonté à l'utilisateur**. Un terme n'entre dans un référentiel que par une ligne **proposée** (par `ariane-rename-props` ou `ariane-describe-components`), **si elle vaut comme règle**, et **validée par le designer**.

## Patterns UI — la table d'abord
**Avant de nommer un conteneur ou un élément, vérifier d'abord s'il correspond à un pattern de la table** `patterns-ui.md`. Un pattern reconnu est nommé par son **nom canonique** (`stepper` → `stepperContainer`), **jamais** par un synonyme descriptif (`stepsContainer`). **La table prime sur tout exemple de ce SKILL.md** : les exemples d'ici sont illustratifs, jamais une vérité concurrente aux sources.
- **Reconnaissance certaine → nom canonique appliqué directement**, jamais proposé : **nom source** correspondant (calque nommé « Card », « Modal »…) **ou critère structurel non ambigu** (stepper = étapes numérotées/ordonnées).
- **Pattern seulement plausible** — critère **visuel seul et ambigu**, non confirmé par le nom (« fond + contenu groupé → peut-être une card », Règle A de la table) → **ne pas supposer le pattern** : nommer par fonction et imbrication, puis proposer si le nom reste interprétatif (§ Déterministe seul vs proposition contextualisée).
- La **proposition contextualisée** ne vaut que pour les conteneurs qui ne correspondent à **aucun** pattern de la table, ou à un pattern seulement plausible.
- La table s'applique aux **layers éditables**, **jamais à une instance** (seule exception, le nom des instances exposées sœurs, § Tri technique) ; un pattern rencontré comme instance reste tel quel.
- La table fournit la **racine**, pas un suffixe figé (§ Vocabulaire structurel, « Racine vs suffixe »). Aucun exemple de ce fichier ne nomme un pattern que la table couvre.

## Mécanisme d'écriture
| Cas | Outil | Cible |
|---|---|---|
| FRAME / GROUP / TEXT / forme éditable hors instance | `node.name = "<nouveauNom>"` | le node lui-même |
| Collapse (passe structure) | **la sonde** `sonde-cadres.js`, script fixe (Passe 1) : preuve sur une copie, suppression sur l'original une fois prouvé, revérification | la frame coquille |

Read-back sur le `node.name` après écriture (nommage) ; read-back **géométrique** fait par la sonde (structure).

**Timeout `use_figma` — NON ATOMIQUE.** Un script tué par `internal timeout` a **déjà écrit** tout ce qui précède sa mort (contrairement à une erreur levée, qui annule tout). **Ne jamais le rejouer tel quel** : relire l'état réel, puis écrire un script de **reprise**. Découper préventivement (collapse et nommage dans des appels distincts, lots de ~5 variantes pour le nommage, traversée `children` à profondeur bornée plutôt que `query` sur des arbres d'instances profonds). La sonde, elle, s'arrête d'elle-même avant le délai et rend `suite`.

**Ciblage des nodes** : par **nom + contexte** (type, rôle, sous-arbre), **pas** par chemin ou index absolu. Plusieurs nodes de même nom (deux `Content`) → **désambiguïser par le parent ou le sous-arbre**, jamais deviner. Objectif : **zéro appel correctif « NOT FOUND »**.

## Tri technique préalable (signal, pas au jugé)
- `type === "INSTANCE"` (lib **ou** locale) → **lecture seule** : à la traversée, s'arrêter dessus sans descendre ; jamais renommée ni collapsée, et rien de ce qu'elle contient n'est touché — une frame éditable imbriquée dans une instance est **intouchable** (override interdit). Deux exceptions, sur le **seul nom** d'instances posées **dans un master ou un composant de construction local** (jamais dans un écran) :
  - **Le nom d'une instance est celui de son composant** : le nom que Figma lui donne, qui suit un échange (une place qui montre `AvatarSmall` s'appelle `AvatarSmall`, et change de nom quand on échange). Un nom posé à la main (un ancien nom resté après une copie, un nom de rôle) se retire, pour revenir à celui du composant — sauf pour les instances exposées sœurs, ci-dessous.
  - **Instances exposées sœurs** : quand **plusieurs instances exposées** (`isExposedInstance`) viennent du **même composant** sous le même parent de composant, le panneau de droite les montre sous leur nom de calque, toutes pareilles. Elles reçoivent alors un **nom sémantique** en camelCase : **ce qui les distingue + leur rôle**. Ce qui les distingue se lit dans l'ordre : le **texte qu'elles affichent** quand il diffère d'une sœur à l'autre **et que chaque sœur garde le même texte dans toutes les variantes** (un libellé : « Enregistrer » → `saveButton`, « Annuler » → `cancelButton`, traduit par le glossaire), sinon leur **position** (`firstItem`, `secondItem`). Le nom se décide **une fois pour tout le set** : un texte qui change d'une variante à l'autre ne nomme pas la sœur, sa position la nomme. Le rôle est le même pour toutes les sœurs. Une instance qui porte **déjà** un nom de cette forme **se garde**. Un même élément porte le **même nom dans toutes les variantes et tous les composants** où il apparaît (sinon ses réglages se perdent au changement de variante). Une instance non exposée, ou seule de son composant, garde son nom.
- `COMPONENT` / `COMPONENT_SET` imbriqué → PascalCase, **non renommé** par ce skill. Les layers propres d'un master local sont éditables ; ses enfants `INSTANCE` ne le sont pas.
- `FRAME` / `GROUP` / `TEXT` hors instance → **périmètre éditable**, en **camelCase EN**.
- **Formes** (`RECTANGLE`, `ELLIPSE`, `LINE`, `VECTOR`, `POLYGON`, `STAR`, `BOOLEAN_OPERATION`) hors instance → périmètre éditable, **nommage seul** : jamais collapsées, ce ne sont pas des conteneurs (§ Formes).

## Vocabulaire structurel (emboîtable selon le contenu, pas un escalier fixe)
- **Section** : zone de 1er niveau d'un écran. **Règle ferme : parmi les frames de la racine d'un écran, la PLUS GRANDE (bounding box) se nomme toujours `mainSection`** — pas « la première » : on tranche à la **taille**, seul, sans proposer. Les autres zones de 1er niveau se nomment par leur fonction (ci-dessous).
- **`mainContainer`** : **règle ferme** — dans un master (`COMPONENT` / `COMPONENT_SET`), le conteneur racine le plus englobant, enfant direct du master, se nomme **toujours `mainContainer`**, tranché seul. `mainSection` = racine d'un **écran** ; `mainContainer` = racine interne d'un **master**. Il n'existe **que** s'il y a **un conteneur racine unique qui enveloppe la structure** du master (un `…Container` imbriquant d'autres containers/blocks) ; il n'est **jamais forcé**. Un enfant direct qui n'est qu'une **section** — notamment un `…Block` de feuilles posé **à côté** d'une instance de contenu ou d'autres sections — n'est **jamais** `mainContainer` : il suit fonction + algorithme (`ProductCard` = `[instance de contenu + frame de 2 boutons]` → la frame est **`actionBlock`**). Plusieurs frames racines pairs → **aucun** n'est `mainContainer`.
- **Container** : regroupement interne (peut contenir Wrapper / Block / autre Container). **Block** : unité de contenu cohérente. **Wrapper** : enrobage (toléré, non imposé).
- **ALGORITHME DE SUFFIXE — Container vs Block vs nom nu (déterministe, tout frame éditable). Dérouler dans l'ordre, s'arrêter au 1ᵉʳ match.** Les règles fermes `mainSection` et `mainContainer` passent **avant** : la racine d'un écran ou d'un master garde ce nom même si elle évoque un pattern. Dans un set, la **cohérence entre variantes** passe avant tout (ci-dessous).
  1. **Pattern de catégorie 1** de la table (`nav`, `card`, `alert`, `stepper`, `header`, `footer`, `banner`…) → **`…Container`** figé. **STOP.**
  2. **Pattern de catégorie 3** de la table (`badge`, `divider`, `chip`, `tooltip`…) → **nom nu**, sans suffixe. **STOP.**
  3. **Frame dans un master** → **pas de cascade Section** : aller directement à l'étape 5. Un `…Block` haut dans l'arbre d'un master est **légitime** (`optionTextBlock`).
  4. **Écran de prod — cascade `Section > Container > Container|Block`** : un frame **enfant direct d'une `Section`** (`mainSection` ou autre Section de 1er niveau) → **`…Container`**. **STOP.** Jamais un `…Block` directement sous une Section.
  5. **Imbrication, tranchée au nom des enfants.** D'abord **écarter du calcul les instances dont le nom contient `icon`** (insensible à la casse) : elles ne comptent ni en 5a ni en 5b (et restent nommées normalement). Sur le reste :
     - **5a — enfant structurel → `…Container`. STOP.** Au moins un enfant est **une frame/group éditable**, ou **une instance dont le nom se termine par `Block` ou `Container`** (`TimeSlotBlock`, `tableRowBlock`, `SizeChipsBlock`). Critère = le **suffixe** du nom, insensible à la casse, **pas** une sous-chaîne (`unblockButton`, `containerLabel` ne comptent pas).
     - **5b — sinon, homogénéité.** **`…Block`** si les enfants sont **homogènes** : uniquement du `TEXT`, **ou** uniquement des instances **du même composant**, **ou** uniquement des formes de même nature. **`…Container`** sinon (`TEXT` + instances, **ou** instances de composants **différents**).
     - Exemples : `timeSlotsContainer` (enfants `TimeSlotBlock`, 5a) · `sizeSelectorContainer` (enfants `…Block`, 5a) · `tableRowsContainer` (enfants `tableRowBlock`, 5a) · `actionBlock` (enfants « Buttons », aucun suffixe structurel → 5b, même composant) · `thumbnailsBlock` (instances du même composant, 5b) · 3 `TEXT` → `textBlock` · `TEXT` + instances de composants différents → `…Container` · `TEXT` + icône → `textBlock` (icône écartée).
- **Racine vs suffixe** : la **racine sémantique** (`step`, `heading`, `item`, `slide`…) vient de la table de patterns ou du contexte ; le **suffixe suit toujours l'algorithme** (imbrication et homogénéité, bornées par la cascade en prod). Ex. `stepContainer` (imbrique `stepBlock`) > `stepBlock` (n'imbrique que `titleLabel` + `descriptionLabel`) ; un groupe titre + date + prix imbriquant `priceContainer` → `textContainer`, le même groupe ne contenant que des TEXT → `textBlock`.
- **Nommage par FONCTION, jamais par POSITION** : une zone dont le contenu relève d'une fonction identifiable au glossaire est nommée **par cette fonction** — la barre du bas contenant le prix → **`priceSection`** (via `prix→price`), **pas** `bottomSection`. `top`, `bottom`, `left`, `right` ne sont tolérés qu'en **dernier recours**, faute de toute fonction repérable.
- **Conteneur d'items répétés — pluriel conditionnel** : pluriel **seulement si la racine désigne l'item répété** (`thumbnail` → `thumbnailsBlock`, `timeSlot` → `timeSlotsContainer`, `tableRow` → `tableRowsContainer`). Si elle désigne le **widget, la fonction ou le concept** qui contient les items → **singulier** (`sizeSelector` = 1 sélecteur de N chips ; `action` = la zone call-to-action de N boutons ; `totalPrice` = 1 prix en plusieurs fragments texte). Test : « la racine est-elle le nom de l'item répété ? »
- **Numérotation — `<racine><n><qualificatifs…><Suffixe>`, un seul régime** : chiffres `1/2/3`, **jamais nus** — le numéro s'insère **après la racine sémantique et avant le suffixe**, qui finit toujours le nom (`product1Container`, `day1Value`, `step1Block`, l'info de l'étape 1 → `step1InfoContainer` ; **pas** `product1`, `stepBlock1`, `stepInfoContainer1`, `stepInfo1`). La racine est celle du nom que le calque **recevrait s'il était seul** — jamais un mot repris d'un cadre supprimé pour l'occasion. Seule exception : un pattern de catégorie 3 reste nu, numéroté (`chip1`). Si une **prop** existante utilise des mots (`dayOne/Two/Three`), ne pas plier le layer aux mots : numéroter en chiffres **et** flaguer la prop (bloc C).
- **Cohérence dans un même run** : un même rôle reçoit la **même construction partout**, quelle que soit la structure laissée par le collapse (pas `step1InfoContainer` côté mobile et `stepInfo1` côté desktop). Numéroter des nœuds devenus frères est légitime ; dropper ou déplacer le suffixe ne l'est pas.
- **Des frères qui jouent le même rôle se nomment en parallèle.** Deux cadres frères qui portent la même chose pour deux valeurs (un par plateforme, un par mode, un par marque) reçoivent la même construction de nom, seule la racine change (`iosContainer` / `androidContainer`) — même si l'algorithme de suffixe donnerait `Block` à l'un et `Container` à l'autre : les deux prennent le suffixe du plus riche.
- **Cohérence entre variantes d'un set — elle prime.** Un cadre ou un texte porte le **même nom dans toutes les variantes où il est au même endroit** (même chemin de noms depuis la variante), y compris là où une règle jugée dans la seule variante (`mainContainer`, suffixe de l'algorithme, numérotation des frères) donnerait autre chose : figé au nom qu'il porte dans les autres variantes, il ne prend ni numéro ni autre suffixe. Seul ce qui s'ajoute dans une variante (un frère de plus) reçoit son propre nom, numéroté à partir de 2. Motif : Figma garde les réglages d'une instance au changement de variante en suivant les noms de calques.
- **Image / vidéo — termes exclusifs** : un élément qui porte des images se nomme avec `image` (`images` au pluriel selon le contenu) ; de la vidéo, `video`. **Jamais** `media`, `illustration` ni aucun synonyme.

## Rôles TEXT — liste fermée
Le rôle se choisit au **contenu réel affiché**, **lu en entier** (`characters`, **aucun** `slice`/`substring` pour décider) : un marqueur peut être au début, au milieu ou à la fin, et une lecture partielle fait basculer un cas déterministe en arbitrage. Tronquer n'est permis que pour afficher un récap. On renomme le **calque**, jamais le contenu.
- **`heading`** : titre.
- **`description`** : texte explicatif **rattaché à un titre** (même bloc/container qu'un `heading`).
- **`caption`** : texte **descriptif autonome**, non rattaché à un titre (« 2 articles restants » → `itemsCaption`).
- **`legal`** : mention **réglementaire ou juridique**. Se reconnaît **à la lecture** — ton juridique, valeur contractuelle ou de preuve, mention obligatoire, renvoi d'astérisque ou de numéro (« (1) … »), souvent en bas de page. Marqueurs nets, **qui illustrent sans borner** : « conformément au règlement », « font foi », « Voir règlement », « voir conditions générales », « le montant sera prélevé… ». Ex. « …en cas de litige, seuls les registres du vendeur font foi… » → `legalLabel`. **Un seul marqueur, ou un sens juridique à la lecture, suffit : `legalLabel` tranché seul, jamais en `❓`** — même si aucun marqueur listé n'apparaît ; ne pas être frileux sur le légal. **Signal contextuel**, qui s'ajoute au contenu : un calque, ou une frame parente, dont le nom contient `Disclaimer` / `Légal` / `Legal` / `Mentions` / `CGU` / `Règlement` → lecture intégrale des TEXT qu'il contient et **présomption `legalLabel`**.
- **`value`** : valeur — prix, montant, nombre, date, durée, quantité, ratio, **monétaire ou non** : le suffixe est toujours `Value`, et c'est le complément qui dit de quoi il s'agit (« 4,90 € » → `priceValue`, « 3 articles » → `itemCountValue`). **Une date est toujours une valeur** (« 01/01 », « lundi 9 h », « Modifié le 1er janvier » → `dateValue`, `updateDateValue`), jamais `…Label` (`[[conventions-nommage]]`).
- **`label`** : libellé générique — **défaut** si aucun autre rôle ne s'applique.

**Trancher seul ce que le contenu tranche** : marqueurs clairs → rôle appliqué seul, sans `❓`. `value` vs `label` se tranche au contenu (chiffré, daté, monétaire → `value` ; sinon `label`). `❓` **seulement** si le contenu est ambigu ou vide (placeholder non résolu, texte dynamique indéductible) **et** le rôle réellement indécidable — sauf si une **prop bindée encode le rôle** (`…Value`/`…Label`) : la suivre, même contenu non résolu.

**SUFFIXE DE RÔLE SYSTÉMATIQUE — aucun rôle nu, sans exception.** Le rôle jugé n'est **pas** le nom final : tout TEXT porte **complément sémantique + suffixe de rôle** parmi `Label`, `Caption`, `Value` — `heading` → `titleLabel`, `description` → `descriptionLabel`, `caption` → `<sujet>Caption`, `legal` → `legalLabel`, `value` → `<sujet>Value` (`totalValue`, `priceValue`). **Jamais** `heading`, `title`, `description`, `value` seuls ; **jamais deux rôles cumulés** (`descriptionCaption`). Sans complément dérivable, un complément minimal : `titleLabel`, `descriptionLabel`, `legalLabel`, `infoCaption`.
- **Contenu variable ≠ rôle variable** : un TEXT dont le contenu varie d'un écran à l'autre (nombre, date, coquille de maquette type « : » en trop) mais dont le rôle est constant se nomme par son **rôle** — il est **mutualisable**, pas « par écran ».
- **Singulier/pluriel** déduit du contenu réel (« 2 articles restants » → `itemsCaption`), tranché seul.

## Formes — feuilles graphiques (nommage seul)
Une forme éditable hors instance ne contient rien, elle **dessine**. Elle ne garde jamais le **nom par défaut de Figma** (`Rectangle 12`, `Ellipse 3`, `Oval`, `Line 1`, `Vector`, `Union`…) — du bruit, comme `Frame 1234`.
- **Nom nu** en camelCase EN : ni `Container`/`Block` (elle ne contient rien), ni suffixe de rôle TEXT.
- **Racine = ce que la forme fait dans le composant**, lu sur le contexte (master, parent, frères) : le trait d'un séparateur → `line` ; la pastille d'un indicateur → `dot` ; un aplat de fond → `background` ; un contour → `border` ; une zone d'image → `image`.
- **Ne pas répéter le nom du master** (`line` dans `Divider`, pas `dividerLine`) ; qualifier seulement pour **distinguer des formes sœurs** (`trackLine` / `progressLine`).
- Même régime de décision que les autres calques : rôle lisible sans interprétation → déterministe ; interprétatif → proposition ; indécidable → `❓`.
- **Exclusion — formes qui composent un dessin** (tracés d'une icône, d'une illustration, d'un logo : un master ou un groupe dont le contenu EST le dessin) → **non renommées une à une** ; listées à part dans le récap de couverture, pas comptées comme fautes.

## Définition de « CONFORME » (référence unique)
Cette définition est la **seule** : le contrôle de couverture (Passe 2, étape 9e) **et** le court-circuit « déjà conforme / déjà traité » d'un lot (`lot-multi-ecrans.md`) s'y réfèrent. Un layer éditable est **conforme** seulement si **tout** est vrai :
1. **camelCase EN** ;
2. **suffixe valide selon le type** :
   - **TEXT** → suffixe de rôle `…Label` / `…Value` / `…Caption`. Sans suffixe = **non conforme, même en camelCase** (`title`, `description`, `heading`, `label`, `day`…).
   - **Forme** → nom nu dérivé du rôle (§ Formes) ; un nom par défaut de Figma est non conforme, même passé en minuscules (`oval` ; `line` n'est conforme que parce qu'il dit le rôle).
   - **FRAME / GROUP** → un **pattern de la table** (catégorie 1 en `…Container` ; catégorie 3 nu, `badge`, `divider`), ou un suffixe `…Container` / `…Block` donné par l'algorithme, ou `…Section` (zone de 1er niveau d'un écran : `mainSection`, `priceSection`), ou `…Wrapper`. Un pattern **nu** de catégorie 1 (`header`, `card`, `nav`) est non conforme → `headerContainer`, `cardContainer`.

**camelCase ≠ conforme.** Un layer non conforme est **renommé ou signalé `❓`, jamais sauté** ; un layer éditable laissé non conforme en silence est une **faute**.

## Déterministe seul vs proposition contextualisée
Deux régimes, tranchés par la nature du nom — ni frileux, ni générique, ni question à blanc. **La table de patterns se vérifie d'abord** (§ Patterns UI).
- **Critère objectif → appliquer seul**, sans proposer : nom dérivable d'un signal dur — type, rôle de la liste fermée, glossaire, taille (`mainSection`), ou **description directe de ce que la frame EST**, sans interprétation (`navContainer`, `videoContainer`, `imagesContainer`). Ne pas proposer pour rien.
- **Qualificatif interprétatif → déduire, puis proposer** : un mot qui encode le **but ou le contexte** de la frame et que ni les règles ni le glossaire ne donnent. Le nom se **déduit du contexte, toujours dans le même ordre**, puis se **propose** ; ni appliqué seul, ni demandé à blanc. **La proposition est le nom ainsi déduit** ; l'utilisateur valide ou corrige.
  1. **Un calque déjà nommé de même finalité** — par l'utilisateur, ou plus tôt dans ce run — donne son nom : même rôle dans son parent, même composition (enfants de même nature, dans le même ordre), même mise en page. **Le même nom source ne prouve rien** : deux `Top` de composition ou de but différents sont deux choses différentes, et reçoivent deux noms.
  2. **Sinon**, lire **ce que la frame contient** (le thème dominant de ses enfants), **puis à quoi elle sert** dans son parent et dans l'écran. Le nom dit **cette fonction**, et **s'arrête au premier mot qui la dit sans ambiguïté** dans le fichier : on n'empile pas les mots de contexte, et on n'en change pas d'une passe à l'autre. Ex. un conteneur hors table regroupant le résumé sur la page de confirmation → proposer **`confirmationSummaryContainer`** (sur un fichier qui a d'autres résumés, `summary` seul ne dit pas lequel).
- **Racine `content` — tenter le qualitatif avant le générique.** `content` (titre + élément non textuel, ou contenu mixte) est parfois posé par paresse, parfois le nom honnête. Le nom qualitatif se lit dans **ce contexte seul** — le thème dominant des **enfants** (d'abord) ou du **parent** —, jamais une source externe :
  1. **Thème dominant clair** → nom qualitatif **direct**, sans arbitrage (un `content` qui regroupe les infos de livraison → `deliveryInfo…`).
  2. **Thème plausible mais ambigu** → **arbitrage, avec un nom qualitatif pré-rempli** tiré du parent ou des enfants.
  3. **Contenu réellement divers** → **`content` assumé, directement** : les enfants portent déjà le sens ; ne pas inventer un thème.
  Le suffixe reste celui de l'algorithme.

## Critère de collapse — identité de rendu dans tous les états
Une frame est **collapsable** si et seulement si, en la supprimant et en remontant ses enfants d'un cran (ordre gardé), **rien ne change, dans aucun état du rendu**. **On ne collapse que ce que la sonde a prouvé inerte** ; la suppression n'arrive jamais avant la preuve, jamais à la main ; au moindre doute, le cadre reste. Le skill **ne juge jamais le design** : il préserve l'existant, même si « ça paraît mieux ».
- **Tous les états, pas seulement l'état affiché.** Un master a d'autres rendus : ses propriétés booléennes masquent ou montrent des calques, et un calque masqué peut être réaffiché sur une instance. La preuve vaut dans l'état affiché, puis dans chaque état où un calque **piloté par une propriété ou masqué** — la coquille, un de ses descendants, un frère — est inversé. Ex. : un cadre qui enveloppe une pastille pilotée par `showBadge`, dans une rangée en « space between » : pastille masquée, le cadre vide garde sa place ; sans lui, les frères glissent.
- **Ce qui doit rester identique**, pour chaque calque de la racine (variante ou artboard) hors intérieur d'instance : son affichage, sa **position et sa taille rendues** (tolérance 0,5 px, reflow de texte compris) et ses **modes de dimensionnement** — un mode qui change (ajusté au contenu → fixe) ne se voit pas aujourd'hui, mais changera le rendu dès que le contenu changera.
- **Une frame qui dessine n'est jamais une coquille** : fond, contour, effet, opacité, mode de fusion, masque, interaction de prototype, propriété liée autre que la visibilité, ou rognage qui coupe un enfant.
- Coquilles à **enfant unique comme à enfants multiples**. **Chaînes de coquilles** : elles tombent **en cascade**, une à une, chacune prouvée ; la première frame à effet réel reste (`Top > Heading > Texte` : `Top` et `Heading` tombent, `Texte` reste s'il dispose réellement deux enfants). Une parente devenue coquille après un collapse tombe aussi, prouvée à son tour.
- **Collapse dans un master — autorisé, même preuve.** Bornes : **jamais** renommer ni supprimer le master ou ses variantes ; **jamais** franchir une instance ; les **frames en position absolue** sont exclues (§ Exclusions dures).
  - **Tranché pour tout le set** : un cadre se supprime **dans toutes les variantes du set ou dans aucune**. Le même cadre (même chemin de noms depuis la variante, même rang parmi les frères de même nom) est prouvé dans chaque variante où il existe ; s'il a un effet, ou n'est pas une coquille, dans une seule, il reste partout. Motif : retiré dans certaines variantes seulement, il rend la structure inégale — un développeur ou un agent qui lit les calques ne retrouve plus le même arbre, et la copie vérifiée par la construction ne l'est plus. La sonde le fait (`gardesPourLeSet`).
- **Chaque écran est traité indépendamment**, selon sa propre géométrie : aucune coordination desktop/mobile : leur alignement est un arbitrage manuel du designer, hors périmètre.

## Régime « board de documentation »
**Détection** : une frame est un **board de doc** si son **sous-arbre contient un master local** (`COMPONENT` ou `COMPONENT_SET`, `remote:false`) — un écran de prod ne contient jamais la définition d'un master, seulement des instances. Signaux corroborants (non décisifs) : instances d'un en-tête de documentation, nom de frame == nom d'un master, page bibliothèque/composants.
**Board de doc détecté → lire `${CLAUDE_SKILL_DIR}/board-documentation.md` avant la Passe 2** : il fait foi pour le nommage de ce régime (présentation exclue, scaffolding mappé, masters redirigés). Le collapse, lui, suit le § Critère de collapse.

## Modes de sortie (affichage seulement)
**Lire `${CLAUDE_SKILL_DIR}/modes-de-sortie.md` avant le premier récap de chaque run** : compact par défaut, verbeux sur demande, et ce qui reste toujours affiché (la trace des actions et les points de décision). N'affecte aucune logique.

## Lot de plusieurs écrans
**Cible de plusieurs écrans → lire `${CLAUDE_SKILL_DIR}/lot-multi-ecrans.md` avant la Phase 0** : mutualisation des arbitrages, autonomie sur le déterministe, retour par section, reprise après interruption. Il fait foi pour les lots.

## Workflow — deux passes, structure avant nommage
**Prérequis** : filet adapté à la cible (§ Prérequis).

### Phase 0 — Lecture (aucune écriture)
0. Charger les trois référentiels (§ Sources du vocabulaire).
1. Lister les écrans/nodes cibles ; **tri technique** (instances vs éditables ; masters vs layers).

### PASSE 1 — STRUCTURE (collapse)
2. **Lancer la sonde — `${CLAUDE_SKILL_DIR}/sonde-cadres.js`, SCRIPT FIXE.** Lire le fichier et le passer **tel quel** à `use_figma` (tout son code ; seules les lignes de commentaire peuvent être retirées, jamais une ligne de code, même d'une branche que les paramètres n'exécutent pas), en ne changeant que la ligne `PARAMÈTRES` : `RACINES` = la ou les racines de la cible (un set : son id suffit, ses variantes sont prises dans l'ordre du set ; un écran : l'id de son artboard) ; `DEBUT = [0, null, 0]` ; `APPLIQUER = true`. Tant que le retour porte un champ `suite` non nul, relancer avec `DEBUT` = cette valeur. **Ne jamais réécrire, raccourcir ni « adapter » la sonde, ni sonder, supprimer ou réparer un cadre à la main** : la liste des cadres, la preuve et l'écriture sont les siennes.
   Ce que fait la sonde, pour chaque racine : la **liste fixe** des cadres à sonder — **tous** les `FRAME`/`GROUP` éditables, hors artboard et ses enfants directs, position absolue, intérieur d'instance et master imbriqué, du plus profond au moins profond, dans l'ordre du document ; les cadres qui dessinent ou vides sont **écartés** ; chaque autre cadre est **prouvé sur une copie** de la racine (jamais sur l'original ; la copie, nommée `__ariane_sonde__`, est posée sur la page puis retirée aussitôt), dans tous les états ; prouvé inerte, il est supprimé sur l'original, puis l'original est revérifié — un écart remet tout en place et vérifie la remise. Elle rend, par racine : cadres **sondés**, **supprimés** (avec leur nom et le nombre de variantes où ils partent), **conservés** (effet réel dans l'état affiché), **écartés**, **gardés pour le set**, **trompeuses**, et un éventuel **`arret`**.
3. **`arret` dans le retour → STOP** sur cette racine : ne pas relancer, ne pas la nommer, signaler le calque cité tel quel. Un arrêt « REMISE EN PLACE KO » arrête la sonde pour **toutes** les racines : dire lesquelles n'ont pas été traitées.
4. **Seule question de la Passe 1 — les coquilles « trompeuses »** : celles que la sonde a trouvées inertes dans l'état affiché mais pas dans un état inversé, ou dont la suppression sur l'original a changé le rendu et a été remise en place (son motif dit lequel ; la question le reprend). Menu de sélection interactif : « la frame semble inerte, mais le rendu change quand <calque> est affiché ou masqué » → **« laisser tel quel »** / **« autre / je tape ma réponse »**. Un cadre **conservé** pour un effet dans l'état affiché n'est pas une question. Aucune trompeuse → aucune question.
5. Après application, **enchaîner directement sur la Passe 2**, sans confirmation globale.
6. **Mémoriser les noms des frames supprimées** porteuses de sens (`Heading`) → report de contexte vers la Passe 2.

### PASSE 2 — NOMMAGE (sur l'arbre désormais aplati)
**Mode opératoire — traversée programmatique, jamais de liste manuelle.** Le nommage parcourt le **node-set vivant** : énumérer **tous** les layers éditables par **traversée de l'arbre courant**, et pour **chacun** déterminer son nom puis l'appliquer. **Jamais** dériver l'écriture d'une **liste d'ids transcrite à la main** depuis une sortie metadata : un node présent mais non transcrit resterait en nom brut, en silence. Une liste d'ids est un artefact de travail ; la source est l'arbre courant.
7. **Proposition de nommage** pour chaque node éditable :
   - **Déterministe d'abord** : règles fermes (`mainSection`, `mainContainer`), fonction plutôt que position, glossaire, noms composés et signes (`[[conventions-nommage]]` § « Noms composés »), espaces, casse. **Report de contexte** : réutiliser les noms mémorisés en Passe 1 (survivant d'un `Heading` → `headingBlock`).
   - **Sémantique ensuite** : rôle observé (§ Vocabulaire structurel, § Rôles TEXT), puis le régime de décision (§ Déterministe seul vs proposition contextualisée).
   - **Cohérence prop ↔ layer** : nom cohérent avec la prop sans la copier ; prop mal nommée → bloc C ; divergence = `❓`.
8. **Présenter en sections distinctes :**
   **A. DÉTERMINISTES** — table `| node | actuel | → proposé | règle |`, **affichée en texte**. Pas de « GO » distinct.
   **B. ARBITRAGES** — `❓` et propositions, via **menu de sélection interactif** (un point à la fois ; onglets si plusieurs). **Chaque `❓` y est posé** : rien ne se tranche en silence. Options = actions courtes ; **toujours** « laisser tel quel » + « autre / je tape ma réponse » ; ne pas imposer de rendu textuel. Le **submit** vaut **validation unique** (A + B) et **déclenche l'écriture** — la question le dit (« valider écrit ces noms dans le fichier »). Pas de « GO » textuel, pas de récap pré-écriture. **Sans arbitrage** : une seule confirmation interactive, chaque choix disant ce qui suit (« Appliquer — écrit les noms » / « Revoir — je reprends la table » / « Annuler — rien n'est écrit »). **Aucun nom ne s'écrit avant ce submit.** Sur un lot : propositions regroupées par section et arbitrages mutualisés (`lot-multi-ecrans.md`).
   **C. À REMONTER AU SKILL `ariane-rename-props`** — `prop ciblée | problème | suggestion`. Aucune action ici.
   **D. RÈGLES CANDIDATES (récurrence)** — un même type de cas revenu **3+** fois dans le batch : motif + occurrences + règle proposée + demande de promotion, avec la réserve « peut être local, pas universel ». **Proposer seulement : ce SKILL.md ne se modifie jamais lui-même.**
9. **Écriture du nommage** (déclenchée par le submit) :
   a. `node.name = "<nouveauNom>"` sur les seuls nodes éditables validés, **en parcourant le node-set** (mode opératoire).
   b. **Propagation cross-variants** (master) : un cadre, un texte, une forme ou une instance porte le **même nom dans toutes les variantes** où il est au même endroit, jamais d'orphelin. Une instance exposée qui changerait de nom d'une variante à l'autre perd ses réglages : la lecture fixe du contrôle, repassée sur la copie après la chaîne (orchestrateur), le montre (`changeDeNom`).
   c. **Read-back** des `node.name`, comparés aux noms validés ; tout écart → **stop et remonter**.
   d. **Récapitulatif final** (§ Sortie finale).
   e. **VÉRIFICATION DE COUVERTURE — exécutée et prouvée. Ce qui n'est pas prouvé dans la sortie est réputé non fait.** Sur le **node-set vivant** re-parcouru (jamais une liste mémorisée), au sens de la § Définition de CONFORME :
      1. chaque **TEXT** sans suffixe de rôle → lister (id + nom) ;
      2. chaque **FRAME/GROUP** sans pattern de la table ni suffixe de structure (`…Container`/`…Block`/`…Section`/`…Wrapper`) → lister ;
      3. chaque **forme** (hors dessin) au nom par défaut de Figma → lister ;
      4. chaque **layer** hors camelCase EN → lister.
      **Récap chiffré dans la sortie** : « N layers vérifiés · X TEXT sans suffixe · Y frames en pattern nu · W formes au nom par défaut · Z hors camelCase », listes jointes ; exclusions légitimes (frames de présentation de board, formes de dessin) **listées à part**, pas comptées comme fautes. **Toute liste non vide → la passe n'est pas terminée** : traiter ou signaler `❓` chaque cas. « Couverture OK » n'est valide qu'avec ce récap prouvant 0 non conforme.

## Exclusions dures (signaler, jamais agir)
- **Artboard d'écran** : le frame de 1er niveau d'un écran (nom = identifiant d'écran, selon le schéma propre à l'équipe) n'est **jamais renommé**.
- **Composant de construction (non publié)** — master dont le nom porte un marqueur `.` ou `_` : **traité normalement**, ce n'est **pas** une exclusion (calques renommés, coquilles collapsées). Le marqueur relève du nom du master (→ `ariane-rename-props`, `[[conventions-nommage]]` § « Composant de construction »).
- **Nodes scratch** : screenshots ou rectangles collés, labels de travail (« TODO relire », « Capture d'écran… ») → `❓` ignorer.
- **Frames en position absolue** : ni renommées d'office, ni collapsées (le collapse casserait le positionnement) → `❓`.
- **Items répétés sans container** → `❓` ; ne **jamais** créer de container pour regrouper des frères (ce skill collapse, il ne crée pas : hors périmètre).
- **Détacher un composant** : interdit.
- **Abréviation cryptique ou acronyme inconnu** des référentiels (`ABC`) → `❓`. **Ne jamais traduire ni deviner l'acronyme.** La question recommande le nom bâti sur le **seul contenu** du calque, sans l'acronyme (`ABC & Actions` qui regroupe une liste et des boutons → `listActionContainer`), avec « laisser tel quel » en option.
- **Frame qui usurpe un nom de composant** (frame éditable nommée comme un composant) → `❓`, ne pas trancher.
- **Arbitrage validé — jamais réécrit ni dévié.** Un choix de l'utilisateur qui crée un conflit de noms (deux `heading`) se **signale et se redemande** ; il ne se résout pas en silence (ni `selectHeading` inventé, ni traitement incohérent d'un seul des deux).

## Mode brouillon (idéation / cibles très bruitées)
Sur une cible instable (fichier d'idéation, frames jetables), un **fort taux de `❓` est une sortie légitime**, pas un échec : sans rôle clair, ne pas forcer de nom → laisser tel quel ou `❓`. Dry-run global possible, sans écriture (structure ni nommage) : sonde avec `APPLIQUER = false`.

## Sortie finale
Récapitulatif **après écriture** (compact par défaut — § Modes de sortie ; ces 5 éléments sont la **trace toujours affichée**) : (1) **collapses** : cadres **sondés**, **supprimés** (prouvés inertes dans tous les états), **trompeuses** (`❓`, conservées) ; (2) **renommages appliqués** — table `| Avant | Après | Source |`, déterministes + arbitrages, propagation cross-variants, avec le read-back après écriture ; (3) bloc **« réarchitecture manuelle à prévoir »** (couches de base) ; (4) bloc **« À remonter au skill `ariane-rename-props` »** ; (5) **`❓` restants**.

**Fin de batch** — terminer par cette ligne de rappel (le skill **rappelle seulement**, il ne lance **aucune** commande) :
> 💡 Batch terminé — pense à `/compact` avant le prochain batch (ou `/clear` si tu changes de page/contexte) pour alléger le contexte et réduire le coût.

