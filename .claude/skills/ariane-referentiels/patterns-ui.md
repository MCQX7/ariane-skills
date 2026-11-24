---
name: patterns-ui
description: Table de patterns UI conventionnels — vocabulaire STRUCTUREL PARTAGÉ par ariane-rename-props ET ariane-rename-layers. Source de vérité unique des noms canoniques de patterns d'interface (card, modal, stepper…). Distincte des conventions de nommage (règles de construction + vocabulaire d'interface) et du lexique de mission (domaine + produits). Lue par les deux skills : layers en tire racines et patterns des calques, props la section Icônes.
metadata:
  type: reference
---

# Patterns UI — vocabulaire structurel partagé

Table des **noms canoniques** des patterns d'interface reconnaissables. Objectif :
**déterminisme** — un même pattern reçoit TOUJOURS le même nom, quel que soit le run,
le skill ou la session. Supprime les noms inventés au cas par cas (ex. `offerBlock`
pour une card → doit être `cardContainer`).

**PARTAGÉE** par `ariane-rename-props` et `ariane-rename-layers`. Chacun l'applique dans
son périmètre : layers nomme des **calques**, props nomme des **propriétés**. Le
vocabulaire reste cohérent entre les deux (pas de divergence).

**Ce fichier ≠ référentiels de traduction.** Cette table porte le vocabulaire
**structurel** (card→cardContainer). Les traductions FR→EN vivent ailleurs, en deux
fichiers : `conventions-nommage.md` (règles et vocabulaire d'interface,
**permanent**) et `lexique-mission.md` (domaine et produits, **se vide** au
changement de mission). Les trois ne se mélangent jamais.

## Principe — la table fournit la RACINE, pas (toujours) le suffixe

Pour chaque pattern, la table donne sa **RACINE sémantique** (`card`, `step`, `heading`…)
et son **critère de RECONNAISSANCE**. Le **SUFFIXE structurel** (`…Container` / `…Block` /
nom nu) est déterminé par l'**ALGORITHME DE SUFFIXE** de `ariane-rename-layers` (**source
unique** ; imbrication + homogénéité + cascade prod / exception master — voir le skill),
**SAUF** :
- **Catégorie 1 — Containers intrinsèques** : toujours `…Container` (regroupent de la structure par nature).
- **Catégorie 3 — Atomiques** : toujours **nom nu**, quel que soit le contenu.
- **Catégorie 2 — Racines à suffixe variable** : suffixe donné par l'algorithme.

## Reconnaissance des patterns — niveaux de confiance + anti-imbrication

### Règle A — Gradation de confiance de la reconnaissance (générique, TOUS patterns)

La reconnaissance d'un pattern a **deux niveaux de confiance** :

- **RECONNAISSANCE CERTAINE** → **DÉTERMINISTE** (nom canonique appliqué directement).
  Déclencheurs — au moins l'un des deux :
  - le **NOM SOURCE** du calque, traduit par les référentiels, est **égal** au nom du
    pattern — à la casse, aux accents et au pluriel près (calque nommé « Card »,
    « Modals », « Bandeau » → `banner`…) ; un nom qui le contient avec d'autres mots
    ne suffit pas, **OU**
  - un **critère structurel SANS AMBIGUÏTÉ** (ex. stepper = étapes numérotées/ordonnées).
- **RECONNAISSANCE SEULEMENT PLAUSIBLE** → **NE PAS SUPPOSER le pattern.**
  Le pattern est déduit d'un **critère VISUEL SEUL et ambigu** (ex. « ce conteneur a un
  fond + du contenu groupé → c'est peut-être une card ») alors que le **nom source ne
  confirme rien**. Dans ce cas :
  1. traiter le calque comme un **regroupement structurel neutre** — nom par
     **fonction / contexte**, suffixe `…Container`/`…Block` selon la règle d'imbrication ;
  2. si le nom reste **interprétatif**, **PASSER EN ARBITRAGE** (ne jamais trancher seul).

**PRINCIPE : demander vaut mieux que supposer.** Un **pattern intrinsèque (catégorie 1)**
ne doit **JAMAIS** être déduit d'un **seul aspect visuel** — il faut un **signal net**
(nom source **OU** critère structurel non ambigu).

> **Les critères de reconnaissance listés plus bas sont CONSERVÉS** (card = paint +
> contenu groupé hétérogène, banner = bandeau pleine largeur, stepper = étapes
> numérotées…). La règle A ne les supprime pas : un critère
> **visuel seul** suffit à *évoquer* un pattern mais **pas à trancher en déterministe** —
> il faut le **nom source** ou un **critère structurel non ambigu**. À défaut → arbitrage.

### Règle B — Anti-imbrication des containers intrinsèques (catégorie 1)

Un pattern de **CATÉGORIE 1** (tableau ci-dessous) **ne se réimbrique JAMAIS dans un
ancêtre portant le MÊME pattern** ; le master lui-même ne compte pas comme ancêtre. Ex. : un `cardContainer` ne peut pas
contenir un autre `cardContainer` ; si un ancêtre est déjà `cardContainer`, l'enfant
reçoit un **nom structurel neutre** (par fonction), pas le même pattern.

**PÉRIMÈTRE** : cette anti-imbrication vaut **UNIQUEMENT pour la catégorie 1**. Elle ne
s'applique **PAS** à la **catégorie 2** (racines à suffixe variable), où la réimbrication
du même mot est **LÉGITIME** (ex. `stepperContainer > stepContainer > stepBlock` est
normal — un stepper contient des steps).

## Règles d'application (valent pour les deux skills)

- **Suffixe par type structurel (cf. Principe ci-dessus)** : le suffixe est donné par
  l'**ALGORITHME DE SUFFIXE** de `ariane-rename-layers` (**source unique** — ne pas le
  recopier). Exceptions figées rappelées ici : **Catégorie 1** (toujours `…Container`),
  **Catégorie 3** (toujours nu).
- **JAMAIS sur une instance** : le vocabulaire s'applique aux **layers éditables** —
  surtout dans les **masters** (pages de composants), et dans les frames de prod
  assemblées à la main. Une **instance** d'un composant n'est JAMAIS renommée
  (frontière anti-instance, prioritaire ; seule exception, le nom des instances exposées
  sœurs d'un master, cf. `ariane-rename-layers`). Un pattern rencontré comme instance en prod
  est laissé tel quel.
- **Reconnaissance — Règle A, seule source** : le nom source ou un critère structurel
  sans ambiguïté **tranche** (nom canonique appliqué directement, sans arbitrage) ; un
  critère visuel de la colonne « Reconnaissance » (paint, pleine largeur…) **évoque**
  seulement le pattern — nom par fonction, puis arbitrage si le nom reste interprétatif.
- **Cascade & suffixe (`Section > Container > Container|Block`)** : toute la décision
  `…Container` / `…Block` / nom nu — y compris « jamais un `…Block` directement sous une
  Section » (écran de prod) et son **inapplicabilité dans un master** — est régie par
  l'**ALGORITHME DE SUFFIXE** de `ariane-rename-layers` (**source unique**). Ne pas
  redupliquer la règle ici.

## Catégorie 1 — Containers intrinsèques (toujours `…Container`)

Patterns qui regroupent de la structure **par nature** → suffixe `Container` **figé**.

| Pattern | Nom canonique | Reconnaissance |
|---|---|---|
| card | `cardContainer` | conteneur avec un paint (fill/stroke/ombre) groupant des éléments hétérogènes (titre + texte + actions…) |
| modal / dialog | `modalContainer` | correspondance de nom |
| banner | `bannerContainer` | conteneur pleine largeur, bandeau d'accroche en tête de zone |
| accordion | `accordionContainer` | correspondance de nom |
| carousel | `carouselContainer` | correspondance de nom |
| tabs | `tabsContainer` | barre d'onglets (items répétés de type onglet) |
| toolbar | `toolbarContainer` | correspondance de nom |
| nav | `navContainer` | correspondance de nom |
| header | `headerContainer` | correspondance de nom |
| footer | `footerContainer` | correspondance de nom |
| sidebar | `sidebarContainer` | correspondance de nom |
| stepper | `stepperContainer` | conteneur d'étapes numérotées/ordonnées (items répétés de type step) |
| form | `formContainer` | correspondance de nom |
| field | `fieldContainer` | groupe label + contrôle (+ aide/erreur) |
| breadcrumb | `breadcrumbContainer` | correspondance de nom |
| pagination | `paginationContainer` | correspondance de nom |
| alert | `alertContainer` | correspondance de nom |
| toast | `toastContainer` | correspondance de nom |
| empty state | `emptyStateContainer` | zone affichée en l'absence de contenu (message « aucun … ») |
| search | `searchContainer` | correspondance de nom |
| dropdown | `dropdownContainer` | conteneur d'un déroulant (contient le `select` + la liste d'options) |

## Catégorie 2 — Racines à suffixe variable (racine + suffixe selon imbrication)

Patterns dont le **type structurel dépend de ce qu'ils imbriquent**. La table fournit la
**RACINE** ; le **suffixe** (`…Container` / `…Block`) est donné par l'**algorithme de
suffixe** de `ariane-rename-layers`, jamais par cette table.

| Racine | Reconnaissance | Noms possibles (suffixe : algorithme) |
|---|---|---|
| `step` | une étape d'un `stepperContainer` | `stepContainer` · `stepBlock` |
| `heading` | titre SEUL, éventuellement + ornement non-textuel court (icône/badge) — aucun autre contenu | `headingContainer` · `headingBlock` |
| `text` | titre + AU MOINS UN autre élément TEXTUEL (description, caption, valeur, ou bloc entièrement textuel type `addressBlock`) | `textContainer` · `textBlock` |
| `content` | titre + AU MOINS UN élément NON-TEXTUEL (image, média, illustration) ; si ambigu → arbitrage | `contentContainer` · `contentBlock` |
| `item` | un enfant répété d'un conteneur d'items (`…Container`) | `itemContainer` · `itemBlock` |
| `slide` | un enfant d'un `carouselContainer` | `slideContainer` · `slideBlock` |
| `tab` | un enfant d'un `tabsContainer` | `tabContainer` · `tabBlock` |
| `accordionPanel` | un panneau d'un `accordionContainer` | `accordionPanelContainer` · `accordionPanelBlock` |

> **Racines désambiguïsées** : `step`≠`stepper`, `tab`≠`tabs` (singulier/pluriel) ; le panneau
> d'accordéon utilise la racine **`accordionPanel`** pour ne pas entrer en collision avec
> `accordionContainer` (l'accordéon entier, Catégorie 1).
>
> **`heading` vs `text` vs `content` (bascule DÉTERMINISTE, pas visuelle)** : `heading` porte
> UN TITRE (± ornement non-textuel court : icône/badge), **SANS** aucun autre contenu ; `text`
> = TITRE + AU MOINS UN autre élément **TEXTUEL** (description, caption, valeur, ou bloc
> entièrement textuel type `addressBlock`) ; `content` = TITRE + AU MOINS UN élément **NON-TEXTUEL**
> (image, média, illustration). **Critère (déterministe)** : la bascule suit la **NATURE des
> éléments voisins du titre** — titre seul (± ornement non-textuel) reste `heading` ; tout
> élément voisin textuel → `text` ; présence d'un élément non-textuel → `content` (si ambigu →
> arbitrage). Le **suffixe** suit l'algorithme de suffixe.

## Catégorie 3 — Atomiques (nom nu, pas de suffixe)

| Pattern | Nom canonique | Note |
|---|---|---|
| badge | `badge` | |
| chip | `chip` | |
| tag | `tag` | |
| avatar | `avatar` | |
| tooltip | `tooltip` | |
| divider | `divider` | séparateur |
| progress | `progress` | barre/indicateur de progression |
| skeleton | `skeleton` | placeholder de chargement |
| select | `select` | l'élément de déclenchement, dans un `dropdownContainer` |
| checkbox | `checkbox` | |
| radio | `radio` | |
| toggle | `toggle` | |
| champ de saisie | `inputField` | l'élément de saisie, dans un `fieldContainer` |

> Les form controls (select, checkbox, radio, toggle, champ de saisie) sont le plus
> souvent des **composants** : nommés dans leur master, jamais en tant qu'instance posée
> en prod. Numérotés, ils restent nus (`chip1`, `chip2`).

## Icônes — cas particulier (rôle ≠ renommage d'instance)

- Un **master d'icône** garde sa sémantique propre (`Icon/Home`, `Icon/Back`…) — il
  n'est JAMAIS renommé en `leadingIcon`/`trailingIcon` (ce serait perdre ce qu'il EST).
- Le **rôle** leading/trailing s'exprime sur le composant qui accueille l'icône
  (ex. Button) via une **propriété booléenne** : `showLeadingIcon` / `showTrailingIcon`
  → **périmètre du skill `ariane-rename-props`**.
- Le **renommage de l'instance d'icône** à l'intérieur d'un master (pour « coller » au
  rôle) reste un **arbitrage manuel du designer** — le skill ne renomme pas d'instance,
  même dans un master.
- `leadingIcon` / `trailingIcon` figurent ici comme **noms de rôle de référence**, PAS
  comme renommage de layer appliqué par le skill layers.
