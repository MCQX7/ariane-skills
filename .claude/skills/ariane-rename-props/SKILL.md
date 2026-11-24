---
name: ariane-rename-props
description: Étape d'Ariane, appelée par ariane-orchestrator. Renomme les propriétés de composants Figma vers une convention AI-ready (camelCase, préfixes show/is/has, traduction des concepts). À utiliser dès que l'utilisateur veut renommer, normaliser ou "mettre à plat" les props d'un ou plusieurs masters (et le NOM du master lui-même, set ou composant sans variantes), nettoyer le nommage des propriétés Figma, ou passe un lien de section/composant Figma avec une intention d'AI-readiness. NE PAS confondre avec ariane-rename-layers (calques et structure de l'arbre) ni avec ariane-describe-components (descriptions rédigées des masters) — ce skill agit sur les PROPRIÉTÉS et le NOM DU MASTER, jamais sur les calques ni sur les descriptions. Si la demande ne précise pas quoi traiter (calques, props ou descriptions), laisser ariane-orchestrator prendre la main.
user-invocable: false
---

# Figma — Renommage des props (AI-ready)
<!-- version: v1.26 -->

Renomme les **propriétés** de composants Figma (Boolean, Text, dimensions et options de variant) **et le NOM du master** via le MCP Figma (`use_figma` / Plugin API). **Ne touche pas aux layers internes** (autre périmètre) **ni aux instances**.

## Objectif — pourquoi ce skill existe
**But global (tronc commun aux deux skills `ariane-rename-props` et `ariane-rename-layers` — IDENTIQUE)** : rendre le design system **AI-READY** — lisible et prédictible par un agent IA (ou un développeur) **sans voir le rendu**. Un nom AI-ready est :
- **SÉMANTIQUE** : il dit la **FONCTION**, jamais la position (`priceSection`, pas `Bottom`) ;
- **EN ANGLAIS** ;
- **CONVENTIONNEL** : casse cohérente (camelCase pour les calques, PascalCase pour les masters) ;
- **DÉTERMINISTE** : le même élément reçoit **toujours le même nom** entre runs et entre écrans ;
- **STRUCTURELLEMENT EXPLICITE** : `Section` / `Container` / `Block` expriment la hiérarchie.

**Contribution de CE skill (props)** : rendre les **PROPRIÉTÉS de composants** (`Boolean` `show`/`is`/`has`, `Text` à suffixe `Label`/`Value`, `INSTANCE_SWAP`, dimensions et options de variant) **et le NOM du master** lisibles ainsi — en se **SUBORDONNANT aux noms de calques déjà posés par `ariane-rename-layers`** (le layer fait foi, cf. « Subordination au layer »).

**Se servir de l'objectif pour trancher** : sur un cas ambigu, préférer le nom qui **aide le plus une IA à comprendre la propriété**. En cas de doute irréductible, **l'arbitrage (demander) vaut mieux que la supposition**.

## Entrée
Lien Figma d'une **section** (contenant un ou plusieurs masters) ou d'un **composant** : `$ARGUMENTS`. Si aucun lien n'est fourni, le demander avant toute action.

## Prérequis à rappeler à l'utilisateur
- **Prérequis communs — lire `${CLAUDE_SKILL_DIR}/../ariane-referentiels/prerequis-communs.md`** et les rappeler à l'utilisateur : filet de sécurité (branche ou historique des versions selon la cible, jamais créé par l'étape), question du filet en appel direct, skills à jour, connecteur Figma officiel. Ce fichier fait foi pour ces quatre points ; ce `SKILL.md` n'y ajoute que ce qui est propre à cette étape. **Introuvable ou illisible → ARRÊT**, comme pour un référentiel : s'arrêter avant toute lecture ou écriture Figma, dire le chemin essayé, et rappeler que `ariane-referentiels/` s'installe à côté des skills (README, installation).

## Mécanismes d'écriture (validés)
| Cas | Outil | Cible |
|---|---|---|
| Boolean / Text | `editComponentProperty({ name })` | clé `nom#id` |
| Dimension de variant | `editComponentProperty({ name })` | nom nu (ex. `Format`) |
| Option de variant | réécriture de `node.name` des variantes | nom des nodes enfants |
| Nom du master | `node.name` (ou `set()`) sur le master (`COMPONENT_SET`, ou `COMPONENT` hors set) | le node master |

Intégrité garantie par les IDs (prop ou variante) → **read-back sur la DÉFINITION seule, jamais de scan d'instances.**

**Timeout `use_figma` — NON ATOMIQUE.** Un script tué par `internal timeout` a **déjà écrit** tout ce qui précède sa mort (contrairement à une erreur levée, qui annule tout). Le rejouer crée des **doublons** (ex. `addComponentProperty` repassé → `showEdit2`). **Ne JAMAIS le rejouer tel quel** : relire `componentPropertyDefinitions` et les noms de variantes, puis écrire un script de **reprise**. Découper préventivement : création de props dans un appel, bindings dans un autre, ~5 variantes par appel.

## Règles de nommage
- `camelCase`. Structure anglaise ; concept métier **traduit** si terme générique, **gardé** si nom propre / produit / marque. **Aucune correspondance métier n'est codée ici : le glossaire (Phase 1, étape 0) est l'unique source de vérité.**
- **Boolean** : `show` (visibilité) / `is` (état) / `has` (possession, rare).
- **Text** : suffixe selon le contenu — `…Value` (**toute valeur, monétaire ou non** : prix, montant, date, durée, quantité, chiffre ; le complément dit laquelle, `priceValue`) · `…Label` (**libellé / texte descriptif**). Vocabulaire **structurel** défini ici (PAS dans le glossaire métier) ; `…Value` ↔ rôle `value` du skill `ariane-rename-layers` (vocabulaire partagé entre les deux skills). **⚠️ La subordination au layer PRIME (cf. § « Subordination au layer ») : si la prop pilote un calque DÉJÀ NOMMÉ en convention, reprendre le nom du calque tel quel — cette règle de suffixe ne s'applique qu'EN L'ABSENCE de calque-source.**
- **Dimension de variant** : `camelCase` (`Format → format`).
- **Option de variant** : casse + traduction selon le glossaire, **même règle** générique/propre ; un nom de produit reste tel quel. **⚠️ DÉTERMINISTE si couverte par le glossaire** : si une option (ou dimension) de variant a **DÉJÀ une entrée** au glossaire pour le couple **(dimension + valeur source)**, props l'applique **DIRECTEMENT**, **JAMAIS en arbitrage** (ex. une option `Selected` dont le glossaire donne `selected` → appliquée seule). L'arbitrage sur une option n'est légitime **QUE si AUCUNE entrée de glossaire ne la couvre**. Cohérent avec la subordination au layer : ce qui est déjà tranché par une source de vérité n'est pas arbitré.
- **Une valeur qui nomme un modèle ou un produit** (un modèle d'appareil, une version) alors que ses variantes se distinguent par **une caractéristique** (une encoche, un bouton, une taille d'écran) : lire ce qui change dans l'arbre entre les variantes, puis nommer la **caractéristique** — la dimension la dit, les valeurs suivent (`on` / `off` pour une caractéristique présente ou absente, dimension on/off sans préfixe, `conventions-nommage.md`). La caractéristique ne se lit pas → arbitrage.
- **Une valeur qui ne fait que numéroter des dessins** (`1` / `2`, `V1` / `V2`, `Style 1`), quand les variantes se distinguent par leur dessin : ce numéro n'est pas une donnée. Lire ce qui change dans l'arbre entre les variantes, puis nommer **ce qu'on voit**, en un mot par valeur (une forme, un trait, un remplissage). Un nombre qui **compte** ou **mesure** (un nombre d'éléments, une taille) reste tel quel. Le dessin ne se lit pas → arbitrage.
- **Coquille évidente → CORRIGÉE SEULE** (prop, dimension, option ou nom du master) : une faute de frappe dont la correction ne fait **aucun doute** (`succes` → `success`) est **déterministe** — ni arbitrage, ni entrée de glossaire (l'orthographe n'est pas une convention). Elle figure dans la table des déterministes. **Arbitrage UNIQUEMENT** si la coquille admet **plusieurs lectures**.
- **Nom du master** : deux parties — **CASSE déterministe** (PascalCase, convention master) + **CHOIX du nom interprétatif → ARBITRAGE** (cf. § « Nommage du master »). Master **déjà** en PascalCase EN sémantiquement correct → **ne rien changer**. Ne vaut que pour un **master** au sens du § « Nommage du master », jamais une variante ni une instance.
- **Ciblage** : `nom#id` pour Boolean/Text (gère les homonymes par ID distinct), nom nu pour les dimensions, `node.name` pour les options.

## Définition de « CONFORME » (prop) — référence UNIQUE
Cette définition est la **SEULE**. Le **tri déterministe** (Phase 1, étape 3) **ET** tout court-circuit « déjà nommée / ne rien changer » s'y réfèrent — **jamais** au seul camelCase.
Une propriété est **CONFORME** seulement si **TOUT** est vrai :
1. **Format** : `camelCase`.
2. **Rôle valide selon le TYPE :**
   - **TEXT** → **suffixe de rôle OBLIGATOIRE** parmi `…Label` / `…Value` / `…Caption`. Une prop TEXT **NUE** (`label`, `title`, `value`, `date`…) = **NON conforme, MÊME en camelCase**.
   - **BOOLEAN** → **préfixe** `show` / `is` / `has`.
   - **INSTANCE_SWAP · dimension · option de variant** → conventions existantes (camelCase + glossaire) — **inchangées**.
- **camelCase ≠ conforme** : une prop TEXT/BOOLEAN sans rôle valide est du camelCase mais reste **NON conforme**.
- **Une prop NON conforme est TRAITÉE** (renommée — **subordonnée au nom du calque piloté** si présent, cf. « Subordination au layer » ; sinon suffixe/préfixe de rôle), **JAMAIS court-circuitée** au seul motif « déjà camelCase ».

## Subordination au layer — LE LAYER FAIT FOI (prime sur la règle structurelle props)
`ariane-rename-layers` passe **en amont** et **fait foi** ; `ariane-rename-props` est l'**aval qui s'aligne**.
- **Calage (déterministe, AUCUN arbitrage)** : quand une propriété **pilote un calque DÉJÀ NOMMÉ** par `ariane-rename-layers` (TEXT/BOOLEAN/INSTANCE_SWAP lié à ce calque ; un concept voisin sans liaison ne compte pas) — props **ADOPTE le nom du calque tel quel** et **n'applique PAS** sa propre règle structurelle concurrente (suffixe `…Value`/`…Label`…). Ex. calque `titleLabel` piloté par une prop texte → prop **`titleLabel`**, même si la prop s'appelait « Texte ».
- **MISE EN ŒUVRE (avant de nommer une prop)** : identifier le **calque piloté**, lire son nom ; **s'il est déjà en convention** (camelCase EN, non brut / non FR) → **reprendre ce nom**, point final (déterministe). Si le calque est encore en nom brut/FR (layers pas encore passé) → appliquer les règles props normales.
- **DEUX PROPRIÉTÉS PILOTENT LE MÊME CALQUE** (le calage donnerait deux fois le même nom) : prend le nom du calque celle dont le **nom source correspond au calque** (même nom source) ; à défaut, la **première dans l'ordre des définitions**. L'autre garde **son nom source traduit**, avec son préfixe ou son suffixe. Homonyme `⚠️` seulement si une collision demeure.
- **PÉRIMÈTRE — le calage vaut UNIQUEMENT là où il existe un calque correspondant.** Sinon, props applique **ses propres règles** et l'arbitrage reste légitime pour le vraiment libre :
  - **booléens d'état / visibilité** (`showAlert`, `showPromo`, `isActive`, `hasX`) — pas de calque-source → règle `show`/`is`/`has` ;
  - **dimensions & options de variant** (`device`/`state`/`type`…) → règles props + glossaire ;
  - **INSTANCE_SWAP libres** (`productThumbnail`, `customVisual`) → nom interprétatif → arbitrage légitime.
- **PRINCIPE** : si une convention change dans `ariane-rename-layers`, props **suit sans modification** (il relit le nom du calque ; il ne maintient pas de table concurrente).

## Nommage du master — casse déterministe, choix du nom arbitré
**PÉRIMÈTRE — DÉFINITION DE « MASTER » (référence UNIQUE du skill)** : **MASTER** = un `COMPONENT_SET`, **ou** un `COMPONENT` **hors set** (composant sans variantes). **JAMAIS une VARIANTE** (un `COMPONENT` enfant d'un set) ni une **instance**. Un composant **sans variantes est un master à part entière** — son nom, ses props et sa description se traitent **exactement comme** ceux d'un set. ⚠️ **Lecture des `componentPropertyDefinitions` — NARROWING OBLIGATOIRE** : lire sur le `COMPONENT_SET` quand il y en a un, sinon sur le `COMPONENT` lui-même ; **jamais** sur une variante (la lecture lève une erreur). **JAMAIS** à une instance (frontière anti-instance inchangée). Renommer un master **ne casse aucun lien** : les références Figma suivent l'**ID**, pas le nom (comportement normal, validé).

**Copie d'Ariane** : un suffixe « (proposition) », posé par la construction de la copie (`ariane-rebuild-component`), se garde tel quel en fin de nom ; le nom se travaille sans lui. Il tombe au remplacement de l'original, pas ici.

Le nom du master se compose de **deux parties traitées séparément** :
- **CASSE → DÉTERMINISTE** : **PascalCase** (convention master). Un master déjà en bon PascalCase EN n'est normalisé qu'en **casse** si besoin.
- **CHOIX DU NOM → INTERPRÉTATIF → ARBITRAGE** : le nom sémantique (ex. « Cartes Articles » → `ArticleCard` ? `ArticlesCard` ?) **n'est pas du déterminisme**. Props **PROPOSE** un nom (déduit du **contenu / contexte** + **glossaire métier** pour les termes FR) et le **présente en arbitrage** à valider, avec **« laisser tel quel »**.
- **MARQUEUR DE CONSTRUCTION — PRÉSERVÉ, NORMALISÉ, JAMAIS INVENTÉ.** Si le nom source commence par `.` ou `_`, le master est un **composant de construction** (cf. `[[conventions-nommage]]` § « Composant de construction ») : la proposition **conserve le marqueur** et le **normalise en `.`** (`_base_Foo`, `_att_Foo`, `_Foo` → **`.Foo`**), le nom lui-même restant **arbitré** comme ci-dessus. Props n'**ajoute** JAMAIS un marqueur à un master qui n'en a pas, et ne le **retire** JAMAIS d'office : poser ou ôter un point **change le statut de publication** chez tous les consommateurs — décision du designer, pas d'un run de nommage.

Garde-fous du nommage master :
- **DÉJÀ EN CONVENTION → NE RIEN CHANGER** : nom source déjà en PascalCase EN sémantiquement correct → **pas d'arbitrage inutile** (cohérent avec « ce qui est déjà conforme se garde »).
- **Termes FR → GLOSSAIRE d'abord** : traduire les termes métier FR du nom via le **glossaire** **avant** la mise en PascalCase (ex. master « Cartes Statistiques » → glossaire `statistics` → PascalCase `StatisticsCard`).
- **Subordination au layer NON applicable** : aucun calque parent ne pilote le master → le nom du master suit **cette règle dédiée**, pas la subordination.
- **Variants INCHANGÉS** : les **dimensions** (Device/State/Type) et leurs **options** restent gérées par la règle existante (glossaire, déterministe). Cette section n'ajoute **QUE** le nom du master lui-même.

## Patterns UI — TABLE PARTAGÉE (vocabulaire structurel commun)
Pour tout nommage dérivé d'un **pattern UI conventionnel** (card, modal, stepper, badge, icône leading/trailing…), consulter la table **PARTAGÉE** avec `ariane-rename-layers` :
`${CLAUDE_SKILL_DIR}/../ariane-referentiels/patterns-ui.md` (slug `[[patterns-ui]]`).
- Ce skill l'applique dans **SON périmètre = les PROPRIÉTÉS** : p.ex. le **rôle leading/trailing d'une icône** s'exprime en prop booléenne `showLeadingIcon` / `showTrailingIcon` (cf. section « Icônes » de la table) ; un master d'icône garde sa sémantique (`Icon/Home`), jamais renommé en rôle.
- **DÉTERMINISTE** : un pattern reconnu (nom source ou critère structurel sans ambiguïté, cf. Règle A de la table) → nom canonique **directement**, jamais en arbitrage ; un critère visuel seul ne fait qu'évoquer le pattern. Le `❓` ne vaut que hors-pattern / terme absent.
- **DISTINCTE du glossaire métier** (FR→EN). **Anti-instance INCHANGÉ** : jamais sur une instance ; vaut pour définitions/masters.

## Workflow — UNE porte de validation, obligatoire

### Phase 1 — Lecture (aucune écriture)
0. **Charger les DEUX référentiels de traduction — SOURCE DE VÉRITÉ UNIQUE, PARTAGÉE avec `ariane-rename-layers`.** Chemins (dossier `ariane-referentiels/`, voisin de ce skill) :
   - `${CLAUDE_SKILL_DIR}/../ariane-referentiels/conventions-nommage.md` (slug `[[conventions-nommage]]`) — **règles de construction** (suffixes, `has`/`show`, acronymes, « + ») et **vocabulaire d'interface** FR→EN. **Permanent**, conservé d'une mission à l'autre.
   - `${CLAUDE_SKILL_DIR}/../ariane-referentiels/lexique-mission.md` (slug `[[lexique-mission]]`) — vocabulaire du **domaine** de la mission et **noms de produits**. **Se vide** au changement de mission.
   - **RÉFÉRENTIEL INTROUVABLE → ARRÊT, sans exception.** Les référentiels vivent dans le dossier `ariane-referentiels/`, voisin du dossier de ce skill (`${CLAUDE_SKILL_DIR}/../ariane-referentiels/`). Si l'un des fichiers à charger est introuvable ou illisible : **s'arrêter avant toute lecture ou écriture Figma**, dire quel fichier manque et le chemin essayé, et rappeler que `ariane-referentiels/` s'installe à côté des skills (README, installation). **Ne JAMAIS continuer sans**, ni le remplacer par des traductions au jugé : le nommage divergerait d'un run à l'autre.
   - **PRÉCÉDENCE — distinguer la RÈGLE du JETON, elles ne se comportent pas pareil :**
     - **RÈGLE DE CONSTRUCTION** (comment le nom se forme : suffixes de rôle, casse, `has`/`show`, « fonction pas apparence », « + » → `Plus`) → **les conventions gagnent TOUJOURS**. Une entrée de lexique ne peut pas suspendre une règle de construction — c'est la garantie anti-oscillation (si le lexique disait `dateLabel`, la règle « une date est une `Value` » l'emporte).
     - **JETON** (quel mot désigne un concept : `inverted`, `unicorn`…) → **le LEXIQUE gagne**, le plus spécifique l'emporte. Un jeton du socle est un **défaut maison** ; si la mission en porte un autre pour le même concept, c'est celui de la mission qui s'applique, et pour tous les runs suivants de cette mission.
     - **Test** : la contradiction porte-t-elle sur la **FORME** du nom, ou sur le **MOT** choisi ? Forme → conventions. Mot → lexique.
   - Terme **déjà présent** dans l'un des deux → appliquer le nom validé **sans le re-flaguer**, en **citant** l'entrée et **son fichier**.
   - **Correspondance à une entrée — à la lettre, jamais au sens.** Une entrée s'applique à un terme source qui lui est **égal** (à la casse, aux accents, au pluriel et à un emoji près) ou qui figure dans ses **variantes listées** ; rien d'autre ne la déclenche — ni un mot en commun, ni un sens voisin, ni une abréviation non listée. Un libellé fait de plusieurs termes **se découpe** : chaque entrée s'applique à la partie qui lui est égale, le reste se nomme par ses propres mots (référentiels, puis règles de construction). Un terme qui ressemble seulement à une entrée **n'en hérite pas** ; si une question se pose pour lui, l'entrée y figure **en option, jamais en recommandation**, et la réponse qui l'y rattache se propose comme **variante listée** de l'entrée.
   - Terme **absent des deux** → flag `❓` et demander (ne jamais deviner). Une fois tranché, **proposer** la ligne à verser au **bon** fichier (cf. Sortie finale) — jamais l'écrire sans validation.
   - **Convention d'écriture de ce SKILL.md** : partout ailleurs dans ce fichier, le mot **« glossaire »** désigne **ces deux fichiers pris ensemble**.
1. Lister tous les **masters** de la cible (cf. § « Nommage du master » : `COMPONENT_SET` **et** `COMPONENT` hors set ; les variantes ne comptent pas).
2. Pour chacun, lire `componentPropertyDefinitions` et produire une table :
   `| Composant | Cible | Type | Actuel | → Nouveau | Mécanisme | Flag |`
3. **Séparer déterministes et arbitrages :**
   - **DÉTERMINISTES** (sans ambiguïté : **nom adopté d'un calque déjà nommé — subordination au layer, cf. § dédié**, casse, glossaire — terme présent, préfixe Boolean, suffixe Text `Value`/`Label`, dimensions, options non ambiguës) → **affichés en texte** dans la table (lus par l'utilisateur). Pas de "GO" distinct. **⚠️ Conformité au sens STRICT (cf. « Définition de CONFORME (prop) »)** : une prop TEXT/BOOLEAN **NUE** (camelCase mais sans rôle — ex. `label`) est **NON conforme** → elle est **renommée** (subordonnée au calque si présent), **jamais** classée « déjà conforme ».
   - **ARBITRAGES** : homonyme `⚠️`, traduction/terme **absent ou incertain** `❓`, option de variant ambiguë **(UNIQUEMENT si AUCUNE entrée de glossaire ne couvre le couple dimension+valeur — sinon c'est DÉTERMINISTE, cf. règle « Option de variant »)** → posés **un point à la fois via le MENU DE SÉLECTION INTERACTIF natif** (onglets navigables si plusieurs points). Chaque option = **action claire et courte** ; **toujours** inclure « **laisser tel quel** » et « **autre / je tape ma réponse** ». Ne pas imposer de rendu textuel. **Ne jamais deviner une traduction.** **⚠️ Un cas couvert par un calque déjà nommé (subordination au layer) n'est PAS un arbitrage — il est déterministe ; ne pas le présenter en menu.**
   - **Nom du master** : si le nom source n'est **pas** déjà en convention → **ARBITRAGE** (props propose un nom PascalCase, glossaire pour les termes FR, + « laisser tel quel »). Si **déjà** en PascalCase EN correct → **déterministe (no-op)**, pas de menu.
4. **STOP avant écriture.** Afficher les déterministes (texte) puis poser les arbitrages via le menu interactif. Le **SUBMIT du menu vaut VALIDATION UNIQUE** (déterministes + arbitrages tranchés) et **déclenche DIRECTEMENT la Phase 2** — la question le dit (« valider écrit ces noms dans le fichier »). **NE PAS** demander de "GO" textuel ; **NE PAS** afficher de récap pré-écriture.
   - **Cas SANS arbitrage** (que des déterministes) : poser **une seule confirmation interactive**, chaque choix disant ce qui suit (« Appliquer — écrit les noms » / « Revoir — je reprends la table » / « Annuler — rien n'est écrit »), pas de "GO" textuel.

### Phase 2 — Écriture (déclenchée par le submit / « Appliquer »)
5. Set par set :
   a. `editComponentProperty({ name })` pour Boolean/Text + dimensions de variant.
   a0. **Nom du master** (si validé) : `node.name = <PascalCase validé>` sur le **MASTER** (`COMPONENT_SET`, ou `COMPONENT` hors set) — **jamais** sur une variante ni une instance ; read-back du `node.name`.
   a1. **La présentation suit le nom du master** : quand le master a changé de nom, ce qui affiche son ancien nom sur sa planche prend le nouveau — le **nom de la planche** et le **titre de son en-tête de documentation** (l'instance de documentation qui affiche le nom de la planche : on change sa propriété texte de titre, rien d'autre ; sa description reste telle quelle). Seulement là où le texte est l'ancien nom du master (« (proposition) » ou « (ancien) » compris, gardés) ; read-back. **Les descriptions des autres masters suivent aussi** : chacune qui cite l'ancien nom (`Contient`, `Vit dans`, `Éviter`, `Règles`) le remplace par le nouveau, sans rien changer d'autre ; read-back.
   b. Re-lire les définitions.
   c. Options : réécrire les `node.name` des variantes. Parseur : `split(", ")` → `split("=")` → trim → remplacer uniquement si **dimension ET valeur exactes** (pas substring) → reconstruire. Cibler le nom de dimension **courant** (après l'étape a).
   d. **Read-back de la définition seule**, comparer à la table validée.
   d2. **VÉRIFICATION DE COUVERTURE — SCAN EXÉCUTÉ ET PROUVÉ (fin de passe). PRINCIPE : ce qui n'est pas prouvé dans la sortie est réputé NON fait ; « conforme » sans récap chiffré est INVALIDE.** Re-lire `componentPropertyDefinitions` de CHAQUE master traité, au sens de la « Définition de CONFORME (prop) » (cf. section — **NON redéfinie ici**) :
      - **CHAQUE prop TEXT** : tester le **suffixe de rôle** (`…Label`/`…Value`/`…Caption`) → **lister** les nues (`master.prop`).
      - **CHAQUE prop BOOLEAN** : tester le **préfixe** `show`/`is`/`has` → **lister** celles sans préfixe.
      - **PRODUIRE un RÉCAP CHIFFRÉ** dans la sortie : « N props vérifiées · X TEXT nues (listées) · Y Boolean sans préfixe (listés) ».
      - Toute liste non vide → **traiter** (renommer, subordonner au calque) ou `❓` ; **JAMAIS conclure « conforme »** sans le récap prouvant 0 nue.
   e. Tout écart (rename manqué, collision) → stop et remonter avant de continuer.
   f. Afficher le **RÉCAPITULATIF** (table des renommages appliqués) + read-back **APRÈS écriture** — c'est la **seule trace**, jamais de récap avant.
6. Un seul `setCurrentPageAsync` ; si la cible couvre plusieurs pages, un run par page.

## Garde-fous (NE PAS faire)
- Ne pas écrire avant le **submit** des arbitrages (ou la confirmation « Appliquer ») — validation unique ; aucun récap pré-écriture.
- Ne pas scanner les instances (intégrité garantie par les IDs).
- Ne pas deviner une traduction → flag `❓` et demander.
- Ne pas toucher aux layers.
- Le nom du master ne s'écrit que sur un **MASTER** (`COMPONENT_SET`, ou `COMPONENT` hors set) — jamais une **variante**, une instance ni un calque interne.
- S'arrêter et demander sur tout `❓` ou tout écart au read-back.
- Ne jamais classer une prop « déjà conforme » sur le **seul camelCase** : vérifier le **rôle** (suffixe TEXT `…Label/…Value/…Caption` · préfixe Boolean `show/is/has`) — cf. « Définition de CONFORME (prop) ».

## Sortie finale
Récapitulatif des renommages appliqués + liste des `❓` restants.
**Proposer au référentiel ce qui vaut comme RÈGLE — jamais écrire sans validation.** Un référentiel porte des **règles** (un terme, une construction, une option qui serviront ailleurs), pas le journal des arbitrages : un `❓` tranché ne se propose que si sa réponse s'appliquera à d'autres calques, propriétés ou composants que celui-ci. Un nom propre à un seul composant ne se propose pas : il vit dans le fichier Figma. Un référentiel ne s'enrichit **jamais** sans la validation explicite du designer :
- en fin de run, afficher les **lignes proposées**, chacune **telle qu'elle serait écrite**, avec son fichier (routage ci-dessous), et demander **une fois** au designer de les valider, ligne par ligne (ajouter / corriger / ne pas ajouter) ;
- n'écrire **que** les lignes validées, et seulement après sa réponse ; sans réponse, **rien n'est écrit** : les lignes restent dans le récapitulatif, sous « À verser au référentiel après validation » ;
- un `❓` tranché pendant le run vaut pour **ce run** ; il n'entre au référentiel qu'à la validation de sa ligne.

**ROUTAGE — choisir le fichier AVANT d'écrire (obligatoire, jamais par défaut) :**
- une **règle de construction**, ou une traduction de vocabulaire d'**interface** valable hors de cette mission → `${CLAUDE_SKILL_DIR}/../ariane-referentiels/conventions-nommage.md` ;
- un terme dont le sens dépend du **domaine**, un **nom de produit**, une **option de variant** propre au projet → `${CLAUDE_SKILL_DIR}/../ariane-referentiels/lexique-mission.md`.

En cas de doute : **le lexique**. Une entrée trop spécifique versée dans les conventions pollue le socle de toutes les missions suivantes ; l'inverse ne coûte qu'une recopie au prochain projet. **Ne jamais verser dans les conventions un terme accompagné d'un exemple propre à la mission** — généraliser l'exemple, ou router vers le lexique.

**ANTI-CONTRADICTION — VÉRIFIER AVANT TOUT AJOUT à l'un des deux référentiels** (le mécanisme d'enrichissement ne doit jamais empiler un conflit) :
- Avant d'ajouter une entrée, vérifier qu'aucune entrée existante ne couvre déjà le **même couple (dimension + valeur source)**.
- Entrée équivalente qui **CONCORDE** → **ne rien ajouter** (déjà couvert).
- Entrée existante qui **CONTREDIT** → **NE PAS empiler** ; **SIGNALER le conflit à l'utilisateur** et demander quelle valeur garder. **Jamais d'ajout silencieux contredisant l'existant.**
- **Trace** : afficher chaque ligne ajoutée, telle qu'écrite, avec le nom du fichier.
- **Distinguer les dimensions** : une même valeur source (ex. « Full ») peut être légitime pour des **dimensions différentes** — la vérification porte sur le **couple (dimension + valeur source)**, jamais sur la valeur seule.
