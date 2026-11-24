---
name: ariane-orchestrator
description: "Point d'entrée d'Ariane (fichiers Figma lisibles par une IA). Prend en charge, sans que l'utilisateur choisisse une étape : (1) le nommage GLOBAL d'un écran de prod ou d'une planche de composants (« mets ça au propre », « rends ça AI-ready », « renomme tout ») : calques, propriétés, descriptions ; (2) le CONTRÔLE d'un composant, d'une planche ou de plusieurs liens (« vérifie ce composant », « contrôle ces planches », « est-il bien construit ? ») : lecture seule ; (3) la PROPOSITION corrigée (« construis la proposition », « applique le plan sur une copie »), puis son nommage ; (4) la VALIDATION d'une copie (« la copie est validée », « fais la bascule ») : la copie prend la place, l'original part en attente de migration ; (5) le REMPLACEMENT de l'ancien composant par la proposition dans les écrans, seulement sur demande explicite. Sur une demande Figma non ciblée, c'est ce skill qui prend, jamais les étapes seules."
---

# Ariane — Orchestrateur (nommage, contrôle, proposition, remplacement)
<!-- version: v1.21 -->

Coordonne le nommage AI-ready d'une **sélection Figma entière** en enchaînant les trois étapes de nommage dans le bon ordre, et route les demandes de contrôle, de proposition et de remplacement vers leur étape. **Ne renomme rien lui-même** : il détecte la cible, lance `ariane-rename-layers` puis (si pertinent) `ariane-rename-props` et `ariane-describe-components`, et vérifie entre chaque étape. Les trois skills appelés **restent la seule source de vérité** de leurs règles respectives.

## Objectif — pourquoi ce skill existe
Même objectif que les étapes : un nommage sémantique, en anglais, conventionnel et déterministe entre runs. **L'orchestrateur ne tranche que la séquence et la cible** — layers, props et describe dans le bon ordre, props et describe **seulement là où il existe des masters** ; il ne tranche aucun nom. En cas de doute irréductible, demander plutôt que supposer.

## Avant toute route
**Skills à jour** : `git fetch` puis `git pull --ff-only` sur le dépôt des skills, avant le contrôle comme avant la chaîne — un clone en retard pose en arbitrage ce que la version à jour tranche seule.
**Connecteur Figma** : toutes les lectures et écritures Figma passent par le **connecteur Figma officiel** (serveur MCP officiel de Figma, `mcp.figma.com`), jamais par un autre serveur Figma (figma-console, par exemple) pour ce que l'officiel sait faire. Le rappeler à chaque étape chargée.

## Route « contrôle » — avant tout le reste
Une demande de **contrôle** — « vérifie ce composant », « contrôle ce composant », « est-il bien construit ? », « je peux le passer dans Ariane ? », « contrôle ces planches » — pour un composant, une planche ou plusieurs liens — part vers **`ariane-check-component` seul** : charger ce skill sur la cible donnée — un lien ou plusieurs — et rendre sa sortie telle quelle. **Ni détection de cible, ni filet de sécurité, ni chaîne** : le contrôle est en lecture seule, il n'écrit rien. Ensuite, dans cet ordre : (1) **si la sortie pose une question d'usage** (section « La question avant le plan »), la poser au designer, la sortie déjà montrée — les constructions proposées en choix, la recommandée en premier, chacune avec ce qu'elle change ; sur un lot, toutes ensemble, à la fin du lot ; (2) compléter le plan de ce composant avec `Réponse d'usage : <composant> — <sa réponse>`, **dans la même session, à partir de la lecture déjà faite** : on ne relit dans le fichier que ce que la réponse demande, jamais toute la cible (le designer attend) ; la nouvelle section de ce composant remplace l'ancienne (ce n'est pas une chaîne : le contrôle reste en lecture seule) ; (3) **demander la suite** (sur un lot : une fois, à la fin du lot, sans pause entre les composants), chaque choix disant ce qu'il fait : construire la proposition (une copie corrigée au-dessus de l'original, d'après ce plan — le lancer vaut validation, le designer peut d'abord le corriger ; puis calques, propriétés et descriptions s'écrivent sur la copie, sauf « sans le renommage » ; l'original ne bouge pas) — seulement si le verdict d'un composant est négatif (aujourd'hui « À reprendre ») ; renommer (calques, puis propriétés, puis descriptions : écrit dans le fichier, dans une branche si c'est une librairie publiée) ; s'arrêter là (rien n'est écrit). Rien ne se lance sans réponse.

## Route « proposition » — après un contrôle
Une demande de **construire la proposition** d'un composant ou d'une planche — « construis la proposition », « refais ce composant au propre », « applique le plan sur une copie » — part vers **`ariane-rebuild-component`**, avec le lien donné : il demande lui-même le filet et le plan du contrôle, construit la proposition au-dessus de l'original, dans une planche de même forme, en appliquant le plan et l'annexe, et rend son compte rendu. **Puis la chaîne de nommage passe sur la planche de proposition** — calques, propriétés, descriptions (Étapes 1 à 4, mêmes jointures), avec le lien de la planche de proposition, **sur tous ses composants, pièces dupliquées comprises** : une pièce que le contrôle traite dans sa propre section garde cette section pour l'original, et sa copie prend dans cette chaîne les noms et la description qu'elle prévoit — la copie ne garde jamais un ancien nom, sans reproposer le contrôle ni redemander le filet (celui de la construction le couvre) : la copie est livrée complète, jusqu'à sa description, qui dit aussi ce que la construction ne peut pas montrer : la ligne « Pour la description » du contrôle est transmise à l'étape des descriptions. La chaîne de nommage ne démarre pas tant que le compte rendu de la construction porte une question ❓ : elle se pose d'abord au designer. **Après les descriptions, la vérification se repasse sur la copie** — la lecture fixe du contrôle, l'essai des réglages et la relecture de l'annexe, tels que les décrit `ariane-rebuild-component` (étape 4) : la passe des calques retire des cadres et renomme des instances, et ce qui était vérifié peut avoir changé ; un écart se reprend sur la copie avant le récapitulatif, qui donne ce dernier résultat — et, pour ce qui reste à faire à la main sur la copie, sa section « Reste à faire à la main » à jour, jamais l'annexe du contrôle. Le designer peut demander de s'arrêter après la construction (« sans le renommage »). **Un retour du designer sur une copie déjà construite** s'applique **sur cette copie**, jamais sur une nouvelle : la session la reprend avec son plan et le retour (qui remplace ce qu'il contredit dans le plan), suit `ariane-rebuild-component` pour ce qui change, repasse toute sa vérification sur la planche entière, puis calques, propriétés et descriptions au moins sur ce qui a changé ; la planche reste juste au-dessus de l'original. **Plusieurs planches d'un même lot** : les propositions se construisent dans l'ordre du contrôle (un composant posé par d'autres avant les assemblages qui le posent), chacune avec la liste des propositions déjà construites, pour que chaque assemblage pose la proposition de ses voisins.

## Route « validation » — quand le designer valide une copie
Une demande de **valider une proposition** — « la copie est validée », « fais la bascule », « remplace l'original par la copie » — part ici, avec le lien de la planche de proposition. Le filet est celui de la construction (une branche de la librairie) ; sans branche connue, la demander. Dans cet ordre, en relisant après chaque étape :
1. **La copie prend le nom propre** : « (proposition) » disparaît partout — planche, titre de son en-tête de documentation, master, composants de construction de la copie, instances (cas pratiques compris), descriptions. Le nom de chaque master de la copie est vérifié libre dans le fichier hors de l'original (sinon : arrêt et question).
2. **L'original devient un ancien** (`conventions-nommage.md`, composant en attente de migration) : `_` en tête du nom de chaque master de sa planche et « (ancien) » à la fin (`_<Nom> (ancien)`) ; **tous les composants de sa planche** passent au marqueur de migration : ses composants de construction aussi — ceux qu'il pose seul, ou rangés dans sa planche — prennent le `_` (un `.` est remplacé par `_`, un `_` reste), et gardent leur nom ; sa planche, et le titre de son en-tête de documentation, s'appellent « <nom> (ancien) ».
3. **L'ancien part à part** : sa planche va sur la page des composants en attente de migration (« En attente de migration », créée si elle manque, juste après les pages de composants), sans recouvrir ce qui s'y trouve ; **la copie prend la place** de l'original sur sa page.
4. **Les descriptions du fichier suivent** : une description qui cite l'original ou un composant de sa planche (`Éviter`, `Règles`) cite à sa place le composant de la copie qui le remplace ; un `Vit dans` qui le cite le perd (un ancien ne s'y cite pas, `ariane-describe-components`) ; chaque composant que la copie pose a, dans son `Vit dans`, le master de la copie qui le pose.
5. **Le journal des descriptions** : la ligne de la copie prend son nom propre et porte `remplace : <lien de l'ancien>` (l'ajouter s'il manque).
6. **Relecture** : plus aucun « (proposition) » dans le fichier, et aucune description ne cite plus l'original ; l'ancien et ses composants de construction portent leur `_` ; **le nombre d'instances de l'ancien est le même avant et après** (aucune n'est détachée ni échangée : c'est la migration, plus tard, qui les bascule).
Le récapitulatif dit ce qui a été renommé et déplacé, et les instances de l'ancien qui restent à migrer (où elles sont posées).

## Route « remplacement » — sur demande explicite seulement
Une demande **explicite** de remplacer, dans les écrans, l'ancien composant par sa proposition — « remplace l'ancien composant par la proposition dans les écrans », « passe les écrans de ce fichier sur le nouveau composant » — part vers **`ariane-replace-instances` seul**, avec les liens donnés. Cette route n'est **jamais** proposée ni enchaînée après une autre étape (contrôle, proposition, renommage) : seul le designer la demande. L'étape s'arrête d'elle-même avant d'écrire dans les écrans.

## Étape 0 — Détection de la cible (déterministe, structurelle)
**Le lien Figma reçu en entrée sert à toute la chaîne** : chaque étape le reçoit de l'orchestrateur, aucune ne le redemande. C'est le chargement par l'outil Skill qui rend lisibles les chemins des référentiels de chaque étape.

Décision prise sur la **structure**, jamais au jugé :
- **Traverser la sélection** ; chercher au moins un `COMPONENT` ou `COMPONENT_SET` **ÉDITABLE, HORS INSTANCE**, dans la descendance (une instance ne compte pas ; un master imbriqué dans une instance ne compte pas).
- **Au moins un trouvé → PLANCHE DE COMPOSANTS** → parcours **layers + props + describe**.
- **Aucun → ÉCRAN DE PROD** → parcours **layers SEUL** (ni props ni describe n'ont de master à traiter).
- **Un master déjà traité** (sa ligne au journal des descriptions, hors copie qui attend sa validation) ne repasse ni le contrôle ni la chaîne de nommage, sauf demande nommée du designer (§ Où vit le composant d'`ariane-check-component`) : l'annonce le dit (« N masters détectés, dont K déjà traités, laissés tels quels »).
- **ANNONCER la décision AVANT d'exécuter**, ex. :
  - « Cible : **planche de composants**, N masters détectés → **layers, puis props, puis describe**. »
  - « Cible : **écran de prod** (aucun master) → **layers seul**. »
- **Contrôle PROPOSÉ en premier** sur une planche de composants : avant layers, demander si l'on contrôle d'abord les masters détectés, avec deux choix qui disent ce qui suit — « Contrôler d'abord » (lecture seule ; je montre le verdict, puis je demande si je continue ou si je m'arrête) ; « Renommer directement » (calques, puis propriétés, puis descriptions, qui écrivent dans le fichier). **Après le contrôle, quel que soit le verdict, poser la question de la route « contrôle »** (« renommer » y vaut : continuer la chaîne). **Jamais d'enchaînement seul après un contrôle.** Ce contrôle n'est **jamais** proposé sur un écran de prod (pas de master à contrôler).
- **Describe est ENCHAÎNÉ par défaut** sur une planche de composants. L'utilisateur peut demander de s'arrêter après props (« sans les descriptions ») — le dire alors explicitement en étape 0.

### Filet de sécurité — annoncé avec la cible, AVANT toute écriture
La détection ci-dessus donne aussi le filet à rappeler :
- **Planche de composants** → **« Si ce fichier est une librairie publiée, travaille dans une BRANCHE Figma. »** Motif : un renommage de master ou de prop est propagé aux consommateurs **à la publication**, et restaurer son propre fichier n'y change plus rien — revenir à une version ne couvre pas ce risque. La branche donne en plus un **diff relisible** de tout le run.
- **Écran de prod** → l'**historique des versions** de Figma suffit (rien ne se propage) ; le designer y nomme un point de retour s'il le veut — Ariane ne sait créer ni branche ni version.

> **LIMITE ASSUMÉE** : l'orchestrateur détecte la présence de **masters**, **PAS** le statut de **publication** d'un fichier. Il **RECOMMANDE** et **demande confirmation** que le filet est en place ; il ne tranche pas à la place de l'utilisateur et ne prétend pas savoir si la librairie est publiée.

## Étape 1 — LAYERS (toujours en premier)
- **Charger le skill** `ariane-rename-layers` (outil Skill) **en lui passant le lien Figma de la cible** reçu en entrée — ne jamais le redemander à l'utilisateur —, puis l'appliquer **INTÉGRALEMENT** sur la **sélection entière** (les deux passes du skill : structure puis nommage).
- **Ne PAS recopier ses règles** — c'est ce skill qui **fait foi** (probe/collapse, patterns, glossaire, rôles TEXT, anti-instance, couverture, etc.).
- En fin de passe : **read-back** (tel que défini par `ariane-rename-layers`).

## Étape 2 — JOINTURE (point de contrôle, isolation des échecs)
Barrière **entre** les deux skills — c'est le seul endroit où l'orchestrateur ajoute de la logique :
- Vérifier que layers a terminé **PROPREMENT** : **couverture OK** (aucun calque éditable laissé en nom brut/FR/non conforme) **et AUCUN `❓` non tranché**.
- **SÉQUENTIEL STRICT** : props **ne démarre QUE si layers est 100 % propre**.
- **S'il reste des `❓` layers → S'ARRÊTER** et demander à l'utilisateur de les trancher **AVANT** props. Raison : `ariane-rename-props` se **subordonne aux noms de calques** ; un calque encore en `❓` ne fournit **pas de nom stable** auquel se subordonner → props partirait sur une base mouvante.
- **Échec ou passe incomplète → ARRÊT NET** avec diagnostic **« ÉCHEC À LA JOINTURE »** : ne pas lancer props, ne pas maquiller en échec global flou. Dire précisément ce qui bloque.

## Étape 3 — PROPS (planche de composants ET jointure OK uniquement)
- **Uniquement** si étape 0 = planche de composants **ET** jointure verte. Sur un écran de prod, cette étape est **sautée** (annoncé en étape 0).
- **Charger le skill** `ariane-rename-props` (outil Skill) **en lui passant le même lien Figma**, puis l'appliquer — **ne PAS recopier ses règles**, ce skill **fait foi** (préfixes show/is/has, suffixes Value/Label, glossaire, nom du master, subordination au layer, options de variant, anti-instance).
- **ORDRE DES MASTERS — du plus IMBRIQUÉ/petit au plus ENGLOBANT/gros** : profondeur d'imbrication **décroissante** ; à défaut de hiérarchie d'imbrication, **taille croissante** (bounding box) ; à égalité, ordre d'apparition dans le fichier (de haut en bas, puis de gauche à droite). Raison : un petit composant imbriqué dans un gros doit être nommé **AVANT**, pour que le gros référence des sous-composants déjà bien nommés — **subordination entre masters**, même logique que layers→props.
- **Subordination aux noms de calques** posés en étape 1 : **inchangée** — c'est une règle de `ariane-rename-props`, l'orchestrateur ne fait que garantir que layers est passé avant.

## Étape 3-bis — SECONDE JOINTURE (props → describe)
Même logique que la première jointure, appliquée à l'entrée de describe :
- Vérifier que props a terminé **PROPREMENT** : **aucun `❓` non tranché**, read-back conforme.
- **SÉQUENTIEL STRICT** : describe **ne démarre QUE si props est 100 % propre**.
- Raison : le prérequis de `ariane-describe-components` est explicite — « on ne décrit pas une structure qui va changer ». Une description rédigée sur des props encore en `❓` serait **fausse dès l'écriture**, et une description fausse est **pire qu'absente** : elle devient la source de vérité lue par les agents.
- **Échec ou passe incomplète → ARRÊT NET**, diagnostic **« ÉCHEC À LA SECONDE JOINTURE »**. Ne pas lancer describe.

## Étape 4 — DESCRIBE (planche de composants ET seconde jointure OK uniquement)
- **Uniquement** si étape 0 = planche de composants **ET** les deux jointures sont vertes. Sur un écran de prod, cette étape est **sautée** (annoncé en étape 0).
- **Charger le skill** `ariane-describe-components` (outil Skill) **en lui passant le même lien Figma**, puis l'appliquer — **ne PAS recopier ses règles**, ce skill **fait foi** (modèle de contenu, classement atome/structurel, lot de questions préalable, audit des descriptions existantes, gotcha apostrophe, read-back).
- **Sa porte de validation lui appartient.** Ce skill impose un **« GO » explicite** avant écriture, et un **lot de questions** avant rédaction : ce sont des **points de décision normaux**, **JAMAIS** un échec de jointure. L'orchestrateur les laisse se dérouler sans les court-circuiter ni les compter comme blocage.
- **ORDRE DES SETS — identique à props** : du plus imbriqué au plus englobant. Raison : la ligne `Contient` d'un set structurel renvoie à des sous-composants qui doivent déjà être nommés **et décrits**.

## Étape 5 — RÉCAP UNIFIÉ
Un seul récapitulatif final, avec le **statut de CHAQUE étape** :
- **Détection** : prod / composants (+ N masters).
- **Contrôle** : verdict par master / non demandé / sauté (écran de prod).
- **Layers** : OK / incomplet + renommages appliqués (table avant/après du skill).
- **Jointure 1** : verte / **ÉCHEC À LA JOINTURE** (avec la cause).
- **Props** : OK / sautée (écran de prod) / bloquée + renommages appliqués.
- **Jointure 2** : verte / **ÉCHEC À LA SECONDE JOINTURE** (avec la cause).
- **Describe** : OK / sautée (écran de prod, ou demande explicite) / bloquée + descriptions écrites, **et le verdict d'audit des descriptions existantes** (à jour / obsolètes / partielles).
- **`❓` restants**, regroupés par étape.
En cas d'échec, **dire OÙ** (layers / jointure 1 / props / jointure 2 / describe) — **jamais** un échec global flou.

## Invariants (impératifs)
- **NE PAS fusionner les skills** : l'orchestrateur les **SÉQUENCE**. Il ne duplique ni ne réécrit leur logique ; il **RENVOIE** à chaque `SKILL.md`, qui reste la **source de vérité**.
- **Ordre layers → props → describe impératif** — jamais l'inverse, jamais en parallèle. Describe est **toujours dernier** : il documente un état stabilisé.
- **Frontière anti-instance et anti-master-interne** : héritée des skills appelés, **jamais contournée** par l'orchestrateur.
- **Isolation des échecs aux JOINTURES**, pas à l'intérieur des skills individuels (chacun gère ses propres erreurs ; l'orchestrateur arbitre le passage de l'un à l'autre).
- **Chaque question à choix dit, pour chaque choix, ce qui se passe ensuite** : ce qui s'écrit, quelle étape suit, ou l'arrêt. Un choix qui déclenche une écriture le dit.
- **Ne JAMAIS confondre une porte de validation avec un échec.** Le « GO » et le lot de questions de describe, comme les arbitrages de layers et props, sont des **points de décision** : l'orchestrateur attend, il ne diagnostique pas un blocage.
- **AUCUNE liberté sur les règles de nommage ni de rédaction** : l'orchestrateur ne décide QUE de la **séquence** et de la **cible** (prod vs composants). Tout jugement de nom appartient aux deux skills de renommage ; tout jugement de contenu de description appartient à `ariane-describe-components`.
