---
name: conventions-nommage
description: Conventions de nommage PERMANENTES, indépendantes du domaine — règles de construction (suffixes, booléens, acronymes, « + »), vocabulaire d'interface FR→EN, dimensions et options standard. PARTAGÉ par ariane-rename-props ET ariane-rename-layers, lu aussi par ariane-describe-components. Survit à un changement de mission, contrairement au lexique métier. NE contient PAS de terme propre à un domaine ni de nom de produit — ceux-ci vivent dans le lexique de mission.
metadata:
  type: reference
---

# Conventions de nommage — socle permanent

Ce fichier porte ce qui **ne change pas d'une mission à l'autre** : des règles de
construction et du vocabulaire d'interface. Il est **conservé tel quel** au
démarrage d'un nouveau projet.

Son pendant est le **lexique de mission** (`lexique-mission.md`), qui porte
le vocabulaire propre au domaine et **se vide** à chaque changement de mission.

> [!IMPORTANT]
> **Règle de routage — où écrire une décision nouvelle. UN SEUL TEST :**
>
> **Ce terme appartient-il au vocabulaire du MÉTIER DE DESIGNER, ou décrit-il
> quelque chose de CE CLIENT — son produit, sa marque, ses écrans ?**
>
> - métier de designer → **ici** (`lettrage`, `lumière`, `page tampon`, `bandeau`,
>   `vignette`, et toutes les règles de construction) ;
> - propre au client → **`lexique-mission.md`** (`licorne`, `corne` —
>   l'anatomie d'une mascotte de marque ; `sinistre`, `franchise` — un domaine métier ; tout nom de
>   produit).
>
> ⚠️ **Le test ne porte PAS sur la justesse de la traduction.** `licorne → unicorn`
> est une traduction impeccable — elle n'a pourtant rien à faire ici, parce que
> le mot décrit la mascotte d'un client. C'est l'appartenance du TERME qui tranche,
> pas la généralité de sa traduction.
>
> **Cas particulier — une décision qui CORRIGE un jeton déjà présent ici.** Si un
> arbitrage remplace un jeton du socle par un autre pour le même concept
> (ex. « pas `inverted`, chez ce client c'est `onDark` »), la correction va au
> **lexique de mission**, PAS ici : c'est une préférence de ce client, pas une
> évolution de la convention maison. Le lexique l'emporte alors sur le socle pour
> toute la mission (cf. règle de PRÉCÉDENCE des deux skills). Écrire dans le socle
> **uniquement** si tu juges que ton défaut lui-même était mauvais — auquel cas
> dis-le explicitement.
>
> En cas de doute : le lexique. Une entrée trop spécifique placée ici pollue le
> socle de toutes les missions suivantes ; l'inverse ne coûte qu'une recopie au
> prochain projet.

## Règles de construction

- **Règle « + » (déterministe)** : tout `+` final d'un nom de produit ou de
  marque s'écrit **`Plus`** en camelCase — jamais conservé comme symbole.
  Ex. `Offre +` → `offrePlus`, `Premium+` → `premiumPlus`.
- **`has` vs `show`** : `has` marque la **possession d'une donnée**, `show` la
  **visibilité d'un calque**. Les deux ne sont pas interchangeables.
  Ex. `hasDiscount` (la remise existe) ≠ `showDiscount` (le bloc est affiché).
  Une prop déjà nommée `hasX` est **conforme, laissée telle quelle**.
- **Acronymes** : quand un référentiel donne le **nom complet** d'un acronyme,
  c'est ce nom qui s'écrit, partout, à la place de l'acronyme — c'est un choix de
  mot (un jeton), le lexique l'emporte. Sinon, l'acronyme est gardé en
  **MAJUSCULES** quand la **source est l'acronyme lui-même**. Mais dans une
  **dimension d'énumération**, les options s'écrivent en **noms complets
  camelCase** — motif : homogénéité de casse à l'intérieur d'un même enum, et
  lisibilité par un agent, un acronyme n'étant pas résoluble sans glossaire.
- **Suffixe `Value` pour toute valeur, monétaire ou non** : une **date**, un
  **nombre** et un **prix** sont des valeurs, pas des étiquettes → `dateValue`,
  `numberValue`, `priceValue`. Jamais `dateLabel` ni `numberLabel`, ni de suffixe
  `Amount` (il se lit aussi comme une quantité) — source d'oscillation connue, tranchée
  identiquement par `ariane-rename-props` et `ariane-rename-layers`.
- **Nom de master qui commence par un chiffre** : un nom PascalCase ne commence pas
  par un chiffre ; le nom dit ce que le nombre signifie (`404` → `NotFound`).
- **Construction `hors X`** → **`withoutX`**. Ex. `Hors options` →
  `showWithoutOptions`.
- **Noms composés (déterministe)** — un libellé fait de plusieurs éléments :
  - les **liaisons** (`&`, `et`, `ou`, `/`) et les **articles et prépositions**
    (`de`, `du`, `des`, `à`, `le`, `la`, `les`) **tombent** ;
  - les éléments **reliés par une liaison** gardent l'**ordre source**
    (`Prix & options` → `priceOptions`) ; **à l'intérieur d'un élément**, l'ordre
    est celui de l'anglais, le complément avant le nom (`Option livraison express`
    → `expressDeliveryOption`) ;
  - un **signe** s'écrit par son nom (`+` → `plus`, `-` → `minus`) et se place
    comme un complément : `Zoom + ou -` → `plusMinusZoom`. La règle « + »
    ci-dessus reste celle du `+` final d'un nom de produit ;
  - **pluriel** : seul le **dernier terme** suit la règle du pluriel du calque ;
    ceux qui le précèdent passent au **singulier**, comme en anglais
    (`star rating`, pas `stars rating`) : `Étoiles & note` → `starRating`.

### Composant de construction (non publié) — marqueur `.`

Un master qui n'a **pas vocation à être appelé par les designers** dans la
librairie — typiquement une **brique interne à un autre master** — porte un
**point en tête de nom** : **`.NomDuComposant`**. Dans Figma ce préfixe
**retire le master de la publication** : il reste utilisable dans le fichier,
mais disparaît du panneau Assets des consommateurs.

- **Forme canonique** : `.` + le nom **normalisé par la règle de nommage du
  master** (PascalCase EN, glossaire pour les termes FR). Tout autre marqueur
  rencontré en source (`_`, ou un échafaudage type `_base_` / `_att_`) est
  **normalisé en `.`** — **sauf un composant en attente de migration** (section
  suivante), dont le `_` ne se touche jamais.
- **Le CHOIX DU NOM reste ARBITRÉ**, exactement comme pour n'importe quel
  master : cette règle fixe le **marqueur**, **pas** le nom.
- **LE MARQUEUR NE S'INVENTE JAMAIS.** Un master **sans** marqueur en source ne
  reçoit **pas** de point de la propre initiative d'un skill — poser un point
  **dépublie** le composant chez tous les consommateurs, c'est une **décision du
  designer**, jamais l'effet de bord d'un run de nommage. Symétriquement, un
  marqueur **présent** n'est **jamais retiré** d'office. Un skill **détecte** et
  **propose** ; il ne décide pas du statut de publication.
- **UNE PIÈCE PROPOSÉE AU CHOIX NE SE CACHE PAS.** Une pièce qu'un master propose par un **échange d'instance** (un contenu, un visuel par valeur) ne porte **pas** le marqueur : un composant caché à la publication ne peut pas être une valeur d'échange pour qui utilise la librairie publiée — le choix disparaît du panneau (forum Figma, fils sur les valeurs préférées et les composants cachés, 2023–2026 ; aucune réponse officielle contraire). Elle se nomme **sous le master** (`Master/Contenu/Nom`), pour se ranger avec lui dans les assets, et sa description dit qu'elle se choisit depuis le master et ne se pose pas seule. Publier ou dépublier reste une décision du designer : le contrôle le **propose** dans son plan.
- **TRAITÉ NORMALEMENT PAR AILLEURS** : un composant de construction n'est pas un
  composant mort. Ses **calques sont renommés**, ses **coquilles collapsées**,
  ses **props revues**, sa **description écrite** — comme tout autre master.

### Composant en attente de migration — marqueur `_`

Quand la **copie** d'un composant (construite parce que sa construction devait
changer) est validée, elle prend le nom et la place de l'original, et
l'original devient un **ancien** : un **`_` en tête de nom**, suivi de la
mention **« (ancien) »**, le retire de la publication, et il est rangé à part
avec ses composants de construction. Les écrans et les composants qui le
posent déjà le gardent, figé, jusqu'à leur migration ; personne ne peut plus
le poser.

- **Il se reconnaît** à son `_` et à la mention « (ancien) » — sur son nom pour
  le master, sur la planche qui les range pour ses composants de construction,
  qui passent eux aussi au `_` (un `.` est remplacé par `_`) — et au journal des
  descriptions : la ligne de sa copie porte `remplace : <lien de l'ancien>`.
- **Il ne se touche pas** : ni normalisé en `.`, ni renommé, ni décrit, ni
  contrôlé — ses composants de construction non plus.
- **Un composant qui le pose** passe par une copie, qui pose la nouvelle
  version (`ariane-check-component`, § Essentiel, C8).
- **Une ancienne brique en `_`** (`_base_…`, une pièce que seul son master
  pose) reste un composant de construction, et son `_` se normalise en `.`,
  **sauf** si elle appartient à un ancien : posée par lui seul, ou rangée avec
  lui. Elle part alors avec lui, et ne se touche pas.

## Vocabulaire d'interface FR → EN

Termes génériques, sans dépendance au domaine.

| FR | EN | FR | EN |
|---|---|---|---|
| alerte | `alert` | bandeau | `banner` |
| lien | `link` | bg | `background` |
| vignette | `thumbnail` | jauge | `gauge` |
| horaire | `schedule` | prix | `price` |
| jour | `day` | date | `date` |
| lundi … dimanche | `monday` … `sunday` | mois (janvier …) | `january` … |
| statistiques | `statistics` | récap | `recap` |
| simulateur | `simulator` | historique | `history` |
| sélection | `selection` | favoris | `favorite` |
| supplément | `supplement` | exceptionnel | `exceptional` |
| abonnement | `subscription` | numéro | `number` |
| page tampon | `transition` | lettrage | `wordmark` |
| lumière (halo) | `glow` | curseur de saisie | `typingBar` |
| texte d’aide (`texte helper`) | `helper` | barre d’état | `statusBar` |
| interrupteur | `toggle` | message temporaire | `snackbar` |
| clavier, clavier système | `keyboard` | filtre (voile en dégradé posé sur un visuel) | `overlay` |

- `cta` / `call to action` → **`action`** (racine canonique ; le suffixe suit
  l'algorithme, jamais figé).
- **Champ de saisie** : libellé du champ → **`fieldLabel`** ; texte affiché DANS
  le champ (placeholder **ou** valeur saisie, même prop) → **`inputLabel`**, jamais
  `placeholderLabel` (inexact une fois le champ rempli) ; message d’erreur →
  **`errorLabel`**.
- `nb item` → **`itemCount`** · `selected item` → **`selectedItem`** ·
  `3e item` → **`thirdItem`**. Un réglage nommé `Number` qui compte des éléments
  suit la même règle : **`<élément>Count`** (`actionCount`).

## Dimensions et options standard

- **`device`** (entrée canonique) — sources : `Device`, `💻 Device`, et
  `Variation` **quand les options sont Desktop/Mobile** → `device`.
- **`platform`** — la dimension qui choisit le système d'exploitation (sources :
  `OS`, `Guidelines`, `Platform`, quand les options sont iOS / Android) →
  `platform`, options `ios` / `android`. `device` reste l'appareil (mobile,
  tablette, ordinateur).
- **Dimensions d'état**, en camelCase : `Active`→`active`, `Expand`→`expand`,
  `Disable`→`disabled`, `State`→`state`, `Type`→`type`, `Hover`→`hover`,
  `Focused`→`focused`.
- **Dimension de rendu sur fond sombre** — une dimension qui bascule un composant
  vers sa déclinaison pour fond sombre (souvent nommée à la **couleur** en
  source : `White`, `Blanc`, `Light on dark`…, ou au **mode** : `Dark mode`)
  s'écrit **`inverted`** : le nom doit dire la **fonction** (déclinaison
  inversée), pas la couleur ni le mode obtenus.
  Options `on`/`off` inchangées. **S'applique aussi à un axe nommé `Theme` dont les
  valeurs sont `Dark`/`Light`, quand ses variantes ne font qu'inverser les couleurs du
  composant pour un fond sombre** (lu dans les variantes) → `inverted` = `on`/`off` ;
  un thème qui change davantage, ou que des modes de variables portent, garde son nom. Et **une VALEUR d'option
  désignant la déclinaison claire au sein d'un axe `style`** (`blanc`, `Blanc`, `White`)
  s'écrit elle aussi **`inverted`** — la règle porte sur la fonction, qu'elle soit
  portée par le nom de l'axe ou par une de ses valeurs.
- **Dimensions on/off — PAS de préfixe booléen (limite connue, assumée).** Une
  dimension de variant à deux options `on`/`off` (`inverted`, `outlined`, ou toute
  autre dimension de style à deux options…) reste **nue** : le préfixe `show`/`is`/`has` est réservé aux props
  de type `BOOLEAN`. Motif : le préfixe et la valeur `on`/`off` se redoublent
  (`isInverted=on`), et préfixer seulement les axes binaires créerait deux familles de
  nommage à côté de `device`, `state`, `type`, `theme`.
  Passer ces axes en vraies props `BOOLEAN` n'est **pas un renommage** : c'est une
  correction de construction (supprimer les variants `on`/`off`, remplacer l'axe par une
  propriété booléenne), que le contrôle recommande et que la construction de la copie
  applique. Le renommage ne la fait pas.
- **Options génériques**, en minuscules : `Desktop`/`Mobile` →
  `desktop`/`mobile` · `On`/`Off` → `on`/`off` · `Empty`/`Half`/`Full` →
  `empty`/`half`/`full` · `Selected`/`Unselected`/`Disabled` →
  `selected`/`unselected`/`disabled` · `Default`/`Disabled` →
  `default`/`disabled` · `Tablette`/`Tablet` → `tablet`.
- **Un axe qui a une valeur `default`** : c'est elle que porte la variante par
  défaut du set (la première), et l'état ordinaire d'un composant s'appelle
  `default`, pas `enabled`.
- **Valeurs purement numériques ou data** : gardées telles quelles
  quand le nombre compte ou mesure (`2`, `3`, `0 %`, `50 %`, `100%`). Un numéro
  qui ne fait que distinguer des dessins (`1` / `2`, `V1` / `V2`) n'est pas une
  donnée : la valeur dit ce qu'on voit (`ariane-rename-props`).

---

Fichiers de référence partagés, **trois sources distinctes à ne jamais
mélanger** :

| Fichier | Contenu | Au changement de mission |
|---|---|---|
| `conventions-nommage.md` (ce fichier) | règles de construction, vocabulaire d'interface | **conservé** |
| `lexique-mission.md` | vocabulaire du domaine, noms de produits | **vidé** |
| `patterns-ui.md` | noms canoniques des patterns d'interface | **conservé** |

Le vocabulaire de **rôles de calques** (Section / Container / Block / Wrapper,
rôles TEXT) vit dans `ariane-rename-layers/SKILL.md`, pas ici.
