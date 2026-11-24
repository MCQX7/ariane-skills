---
name: ariane-describe-components
description: Étape d'Ariane, appelée par ariane-orchestrator ; si la demande ne précise pas quoi traiter, laisser ariane-orchestrator prendre la main. Rédige, AUDITE et écrit les descriptions FR des masters Figma (métadonnées) pour les rendre trouvables et désambiguïsés par un LLM. À utiliser dès que l'utilisateur veut créer, générer ou compléter les descriptions de composants, VÉRIFIER si des descriptions existantes sont encore À JOUR ou PÉRIMÉES après une évolution du composant, rendre la librairie "AI-ready" côté descriptions, ou passe un lien de section/librairie Figma avec une intention de documentation des composants. NE PAS confondre avec ariane-rename-layers (calques) ni ariane-rename-props (propriétés et nom du master) — ce skill n'écrit que des DESCRIPTIONS, au niveau du master uniquement, et suppose le renommage déjà fait.
user-invocable: false
---
<!-- version: v1.19 -->
 
# Figma — Descriptions des masters (AI-ready)
 
Rédige et écrit les **descriptions** des **masters** via le MCP Figma (`use_figma`). Descriptions en **français**. **PÉRIMÈTRE** : un **MASTER** = un `COMPONENT_SET`, **ou** un `COMPONENT` **hors set** (composant sans variantes). **JAMAIS une VARIANTE** (un `COMPONENT` enfant d'un set) ni une **instance**. Un composant sans variantes est un **master à part entière** et se décrit comme un set. Ne touche ni aux layers ni aux props (autres périmètres).
 
## Entrée
Lien Figma d'une **section** ou **librairie** (contenant un ou plusieurs masters) ou d'un **master** : `$ARGUMENTS`. Si aucun lien n'est fourni, le demander avant toute action.
 
## Prérequis à rappeler à l'utilisateur
- Les composants cibles ont déjà été traités par `ariane-rename-layers` et `ariane-rename-props`. Si ce n'est pas le cas → STOP, le signaler (on ne décrit pas une structure qui va changer). **Lancé via `ariane-orchestrator`, ce prérequis est garanti par construction** — l'orchestrateur place ce skill en dernier, derrière une jointure qui exige props 100 % propre. En appel direct, c'est à vérifier.
- **Prérequis communs — lire `${CLAUDE_SKILL_DIR}/../ariane-referentiels/prerequis-communs.md`** et les rappeler à l'utilisateur : filet de sécurité (branche ou historique des versions selon la cible, jamais créé par l'étape), question du filet en appel direct, skills à jour, connecteur Figma officiel. Ce fichier fait foi pour ces quatre points ; ce `SKILL.md` n'y ajoute que ce qui est propre à cette étape. **Introuvable ou illisible → ARRÊT**, comme pour un référentiel : s'arrêter avant toute lecture ou écriture Figma, dire le chemin essayé, et rappeler que `ariane-referentiels/` s'installe à côté des skills (README, installation).
- **Glossaire métier** accessible : `${CLAUDE_SKILL_DIR}/../ariane-referentiels/` (`conventions-nommage.md` et `lexique-mission.md`) — source unique du vocabulaire FR canonique. **RÉFÉRENTIEL INTROUVABLE → ARRÊT, sans exception.** Les référentiels vivent dans le dossier `ariane-referentiels/`, voisin du dossier de ce skill (`${CLAUDE_SKILL_DIR}/../ariane-referentiels/`). Si l'un des fichiers à charger est introuvable ou illisible : **s'arrêter avant toute lecture ou écriture Figma**, dire quel fichier manque et le chemin essayé, et rappeler que `ariane-referentiels/` s'installe à côté des skills (README, installation). **Ne JAMAIS continuer sans**, ni le remplacer par des traductions au jugé : le nommage divergerait d'un run à l'autre.
- **Cadre de mission** : `${CLAUDE_SKILL_DIR}/../ariane-referentiels/cadre-mission.md` — règles du produit et réponses d'usage déjà données, sources possibles de la ligne `Règles` et de l'`Usage`. Absent → arrêt, comme un référentiel ; vide → rien à en tirer.
- **Journal des descriptions** : `${CLAUDE_SKILL_DIR}/../ariane-referentiels/journal-descriptions.md` — la mémoire des descriptions validées d'une passe à l'autre, même après un /clear (§ Voisins). Donnée de mission, comme le lexique. **Absent → le traiter comme vide** et le créer à la première écriture (ce n'est pas un référentiel : son absence n'arrête rien).
## Mécanisme d'écriture (validé)
| Cas | Outil | Cible |
|---|---|---|
| Description de master | setter `node.description` (string) | nœud `COMPONENT_SET`, ou `COMPONENT` hors set |

Write : `getNodeByIdAsync(setId)` → `node.description = "<texte validé>"`.
Read-back : getter `node.description`, dans un appel `use_figma` distinct.
Champ plain-text (ne pas utiliser `descriptionMarkdown` — règle texte brut).
Écriture atomique, pas de `setCurrentPageAsync` requis pour le write lui-même.
Validé sur COMPONENT_SET réel (read-back strict + code points).
⚠️ GOTCHA APOSTROPHE : l'apostrophe droite `'` (U+0027) est HTML-échappée en `&#39;` à l'écriture (corruption : le read-back renvoie `d&#39;une`, +4 car./apostrophe). TOUJOURS utiliser l'apostrophe typographique `'` (U+2019) — non échappée ET correcte en français. Le read-back strict (===  + code points) DOIT détecter cet écart ; ne pas conclure sur une chaîne sans apostrophe (le test de preuve initial en était dépourvu, d'où faux OK). Validé sur un run réel.
 
## Modèle de contenu
Texte brut (pas de markdown — compatibilité agent Figma). **Court : une ligne n'apparaît que si elle a quelque chose de vrai à dire**, une ligne par étiquette, toujours dans cet ordre. `Rôle` est **toujours présent** ; `Usage` aussi, **sauf** pour un composant de construction ou une pièce proposée au choix, et sauf si le designer ne le confirme pas (la ligne est alors absente, avec sa raison) ; les autres lignes dépendent de **faits** (lus dans le fichier, trouvés, ou donnés par le designer), jamais du jugement de la passe. **Toute ligne absente est justifiée dans la proposition** (« `Éviter` : aucun voisin trouvé (recherche faite) » ou « recherche non faite : <raison> », « `Règles` : aucune donnée ») : une absence n'est jamais un oubli silencieux.

Ce texte est lu par les agents : quand un agent lit un écran pour le coder, Figma lui joint la description de chaque composant posé (et des composants qu'il contient) ; quand il cherche un composant, la recherche lit la description (constaté dans Figma).

- `Rôle :` ce qu'est le composant, en une ligne qui **commence par le terme FR canonique** des référentiels (`conventions-nommage.md`, `lexique-mission.md`), écrit littéralement — c'est le pont entre les demandes en français et les noms en anglais, et le début est ce que l'aperçu et les résultats de recherche montrent.
- `Usage :` **quand on utilise ce composant** : une phrase qui décrit la situation où on le choisit (« pour afficher… », « quand… »). Pas ce qu'il affiche, pas une règle, pas où ne pas le mettre. Savoir produit : se demande (§ Faits NON LISIBLES) ; la réponse proposée suit cette même forme.
- `Éviter :` le ou les **voisins** — un composant de même rôle qu'on pourrait poser **à la place** —, avec le critère qui les départage (« `Link` : quand l'action est une navigation »). **Jamais** une pièce que ce composant embarque (elle est dans `Contient`), **jamais** un composant qui l'embarque (il est dans `Vit dans`). Un voisin n'est cité que s'il est **trouvé** (§ Voisins) sous son nom exact et que le designer a validé la frontière. Renvoi **croisé** : chaque description de la paire pointe l'autre.
- `Règles :` ce que le panneau de droite **permet** de régler mais que le produit **interdit**, et que la construction ne peut pas bloquer (Figma n'a pas de réglage conditionnel) — une combinaison à ne pas faire dans un parcours, une valeur par défaut qui surprend, une dépendance. **Source obligatoire** : une réponse du designer, une règle du produit écrite dans `cadre-mission.md`, la ligne « Pour la description » du contrôle d'Ariane quand la chaîne passe sur une copie qu'il a planifiée (l'orchestrateur la transmet), ou une note écrite par le DS (description existante, annotation). Sur une copie, cette ligne dit aussi ce qu'un lecteur neuf prendrait pour un défaut et qui est voulu (variantes identiques qui complètent la grille, contenu figé par le produit, ce qui se garde au changement d'état) : elle s'écrit dans `Règles`. **Jamais déduite** de l'absence d'une combinaison dans le set. **Un élément au nom d'ancienne version** (old, legacy, v1, déprécié…), valeur, propriété ou pièce : la ligne le dit — une ancienne version, gardée en attendant la décision du DS —, sans juger s'il sert encore. La plupart des composants n'en ont pas.
- `Contient :` les composants embarqués — **liste lue, pas rédigée** : le nom exact du composant source de chaque instance posée dans les variantes (hors intérieur d'instance), **sans doublon**, dans l'**ordre de première apparition** en lisant les variantes dans l'ordre du set. Jamais de précision entre parenthèses : un composant posé plusieurs fois, à quelque rôle que ce soit, n'apparaît qu'une fois. Pas de condition (« selon la variante ») : la liste vaut pour le set.
- `Vit dans :` **lu** : les masters du fichier qui posent **directement** une instance de ce composant, par ordre alphabétique — même frontière que `Contient` : instances posées dans les variantes d'un master, hors intérieur d'instance ; un échange d'instance n'est pas suivi — sauf pour une **pièce proposée au choix**, dont `Vit dans` nomme le master qui la propose dans ses valeurs préférées. Se lit en relevant les instances du composant dans le fichier et en remontant au master qui contient chacune, **une seule fois pour toute la passe**. **Seuls les masters des pages vivantes du fichier s'y citent** : celles que `cadre-mission.md` nomme, ou à défaut toutes, sauf les pages d'archives ou de corbeille ; un master d'une page de travail en cours ou dépréciée n'est pas une source, et le citer y renverrait. Un ancien en attente de migration et les composants de sa planche (`conventions-nommage.md`) ne s'y citent pas non plus : on ne les pose plus. Aucun lisible dans le fichier → ligne omise. La ligne suit les masters qui changent de nom ou sont remplacés (`ariane-rename-props`, a1 ; route « validation » de l'orchestrateur).
- `Alias :` quelques autres noms **logiques et convenus** du même objet : les équivalences déjà écrites dans `patterns-ui.md` pour son pattern (« modal / dialog »), puis, au plus, quelques noms usuels **déduits**, chacun marqué « déduit » dans la proposition et arbitré par le designer. Pas de prétention à couvrir toutes les façons de dire ; pas d'alias pour un composant de construction.

**Classement atome / structurel (déterministe)** : `Contient` non vide → *structurel* ; vide → *atome*. Aucune question.
 
## Règles de rédaction (NE PAS faire)
- Ne pas paraphraser le nom du composant ni re-lister les props (déjà lisibles par l'API). Si une prop est incompréhensible par son nom seul → ne pas la documenter ici, la flagger comme candidate à un re-rename côté props.
- Ne pas énumérer les variantes (univers/device déjà parlants).
- Ne pas écrire de recettes de page ("s'utilise dans un écran de login avec X et Y") : ce savoir vit dans la couche composition, pas ici.
- Ne pas ajouter de traduction littérale du nom : le terme FR canonique dans le Rôle suffit.
- **Correspondance à une entrée — à la lettre, jamais au sens.** Une entrée s'applique à un terme source qui lui est **égal** (à la casse, aux accents, au pluriel et à un emoji près) ou qui figure dans ses **variantes listées** ; rien d'autre ne la déclenche — ni un mot en commun, ni un sens voisin, ni une abréviation non listée. Un libellé fait de plusieurs termes **se découpe** : chaque entrée s'applique à la partie qui lui est égale, le reste se nomme par ses propres mots (référentiels, puis règles de construction). Un terme qui ressemble seulement à une entrée **n'en hérite pas** ; si une question se pose pour lui, l'entrée y figure **en option, jamais en recommandation**, et la réponse qui l'y rattache se propose comme **variante listée** de l'entrée.
- Ne pas inventer un terme absent des deux référentiels → flag ❓, arbitrage, puis **proposition** de reversement **au bon fichier**, **seulement si la réponse vaut comme règle** (un terme qui servira ailleurs ; un nom propre à un seul composant vit dans le fichier Figma) : une règle ou un terme d'interface → conventions ; un terme du domaine ou un nom de produit → lexique de mission. En cas de doute, le lexique. **Rien ne s'écrit dans un référentiel sans la validation explicite du designer** : en fin de run, afficher les lignes proposées (telles qu'elles seraient écrites, avec leur fichier), demander une fois leur validation, n'écrire que les lignes validées ; sans réponse, rien n'est écrit, les lignes restent dans le récapitulatif sous « À verser au référentiel après validation ».
  **Avant tout ajout** (même règle que `ariane-rename-props`) : une entrée qui couvre déjà le terme et **concorde** → ne rien ajouter ; une entrée qui le **contredit** → ne pas empiler, **signaler le conflit** et demander quelle valeur garder. **Trace** : afficher chaque ligne ajoutée, telle qu'écrite, avec le nom du fichier.
- **Composant de construction** (nom préfixé `.` ou `_`, cf. `[[conventions-nommage]]` § « Composant de construction ») : **ne pas skipper**, et **ne PAS le décrire comme déprécié** — il n'est pas mort, il est **privé**. Sa description se limite à `Rôle` (ce qu'il est ET son statut : brique interne **non publiée**, à ne pas appeler directement) et `Vit dans` (les masters qui l'utilisent, s'ils sont lisibles dans le fichier). Une description existante de composant de construction s'audite sur ces deux lignes ; ses autres lignes sont **proposées au retrait**, jamais retirées d'office. Ni `Usage`, ni `Éviter`, ni `Alias`, ni question : un agent qui code le master lit cette ligne et sait qu'il ne doit pas appeler la brique seule.
- **Pièce proposée au choix** (un composant **publié** qu'un master propose par un échange d'instance — une de ses valeurs préférées —, nommé sous lui, `Master/Contenu/Nom`) : même forme que le composant de construction, `Rôle` et `Vit dans` seulement. Le `Rôle` dit ce qu'elle est et son statut : contenu de `<master>`, **à choisir depuis `<master>`, à ne pas poser seul** (posée seule, elle n'a ni la taille ni l'état que porte le master). Elle est publiée pour que l'échange marche dans la librairie publiée : sa description est la seule garde contre un usage direct.
## Faits NON LISIBLES dans le fichier — DEMANDER avant de rédiger, jamais supposer

Trois éléments du modèle de contenu — `Usage`, la **frontière métier** d'un `Éviter` et les `Règles` — reposent sur du savoir **produit**, absent des métadonnées **et** du visuel (`Contient`, `Vit dans` et l'existence d'un voisin, eux, se lisent ou se trouvent). Les inférer produit des descriptions fausses qu'il faut réécrire ensuite, et **une description fausse est PIRE qu'absente** : elle devient la source de vérité lue par les agents et se propage.

**Catégories concernées (liste ouverte) :**
- **Contexte d'usage** : dans quels parcours / écrans le composant apparaît, et dans lesquels il ne doit **PAS** apparaître.
- **Règles métier derrière la structure** : pourquoi la composition diffère d'une variante à l'autre, pourquoi une combinaison d'axes est absente.
- **Intentionnalité** : une matrice trouée, un état manquant, une prop inerte sont-ils un **CHOIX** métier ou un **DÉFAUT** ? La réponse inverse le sens de la description.
- **Frontière avec un voisin** : un voisin trouvé (§ Voisins) est-il à différencier, et par quel critère.

**Où vont les réponses** : un contexte d'usage → `Usage` ; une interdiction ou une dépendance que la construction ne bloque pas → `Règles` ; une frontière avec un voisin → `Éviter`. Une réponse qui ne relève d'aucune des trois ne s'écrit pas.

**PIÈGE IDENTIFIÉ — ne JAMAIS déduire le contexte d'usage des consommateurs TECHNIQUES.** Savoir quel composant instancie la cible ne dit **rien** du parcours produit. Motif d'erreur : un consommateur vit sur un écran donné, on en conclut que le composant qu'il contient appartient au parcours de cet écran. Or un composant réutilisable est instancié par des parents qui n'ont, eux, aucune raison de partager son contexte d'usage. **Le graphe de dépendances et le parcours produit sont deux informations sans rapport.**

**FORME DES QUESTIONS :**
- **UN SEUL LOT**, posé **APRÈS** les lectures et **AVANT** la rédaction. Jamais après avoir écrit.
- **Toujours des propositions pré-remplies**, déduites du nom, des composants internes, du visuel et du contexte — jamais de question à blanc. L'utilisateur valide ou corrige d'un mot. Une proposition est une **hypothèse** : elle porte l'étiquette « déduit » et ne s'écrit qu'une fois validée.
- **Ne demander que l'indécidable.** Ce qui se lit dans les métadonnées ou sur le screenshot se tranche **seul** — ne pas être frileux, ne pas tout arbitrer.

## Voisins — les trouver, même après un /clear
Le designer traite souvent les composants **un par un**, avec des sessions fermées entre deux : la passe doit pouvoir se dire « ce composant ressemble à un autre déjà vu, il faut peut-être les différencier ». Pour chaque master (hors composant de construction et pièce proposée au choix), chercher les voisins dans **trois sources**, toutes en lecture :
1. **Le fichier** : tous les masters de ses pages vivantes, même frontière que `Vit dans` (le relevé fait pour `Vit dans` les parcourt déjà). Un voisin vu dans le fichier est un candidat comme les autres, jugé par les mêmes critères — jamais une remarque à part.
2. **La librairie** : la recherche de librairie du connecteur officiel, avec le terme FR canonique du `Rôle`, le nom du pattern (`patterns-ui.md`) et le nom du composant. Elle lit les descriptions **publiées** : un composant décrit lors d'une session précédente et publié remonte par les mots de sa description.
3. **Le journal** (`ariane-referentiels/journal-descriptions.md`) : les composants déjà décrits et validés, publiés ou non.

**Critères de ressemblance, fixes** — un candidat est un voisin possible s'il remplit **au moins deux** de : même pattern dans `patterns-ui.md` ; même terme FR canonique en tête du `Rôle` ; des propriétés en commun (même nom ou même jeu de valeurs) pour au moins la moitié des propriétés du composant qui en a le moins ; au moins un composant interne en commun ; un mot entier en commun dans les deux noms (hors préfixe de marque ou de produit). Ni une pièce embarquée, ni un composant qui embarque la cible, ni un **composant de construction** (jamais candidat). Pour un candidat vu **seulement dans la librairie**, ne juger que les critères lisibles dans le résultat de recherche (terme du `Rôle`, mot du nom, pattern si sa description le dit) — aucun import ni lecture profonde — et dire dans la proposition lesquels n'ont pas pu être évalués. **Examiner tous les résultats** des recherches, pas seulement les premiers.

**Ce qu'on en fait** : un voisin possible **ne s'écrit jamais d'office**. Il part au lot de questions, avec la proposition : « ressemble à `X` (critères remplis) — à différencier ? Critère proposé : … ». Un voisin que le journal marque déjà « à différencier » (avec son critère) se reprend sans reposer la question ; un candidat que le journal marque « écarté » n'est pas reposé. Validé → `Éviter` des deux côtés, **dans la cible** : la cible reçoit le renvoi ; si le voisin est **dans la cible** lui aussi et a déjà une description sans le renvoi, proposer d'**ajouter cette seule ligne** à sa description (écrite au même GO). **Hors de la cible** — ailleurs dans le fichier, dans une autre planche ou une autre copie, dans la librairie —, le renvoi **ne s'écrit jamais** : il se signale dans la sortie finale (« à ajouter quand `X` passera dans Ariane »), comme le veut le fichier commun des prérequis (une étape n'écrit que dans sa cible).

**Le renvoi manquant** : chercher aussi, dans la librairie et dans les lignes `voisins` du journal, les descriptions qui **citent** le nom de la cible (« Éviter : … préférer `<cible>` »). Si l'une la cite et que la cible ne la cite pas en retour, le signaler et proposer le renvoi. La recherche classe par pertinence : elle peut rater un cas — c'est un signal, pas une garantie.

**Le journal** — une ligne par master validé, ajoutée après le read-back réussi (étape 12), jamais avant le GO :
`- <lien Figma> · <nom exact> · <pattern ou « — »> · Rôle : <ligne Rôle> · propriétés : <noms> · contient : <noms ou « — »> · voisins : <nom (critère)> · écartés : <noms> · <AAAA-MM-JJ>`
Sur la ligne d'une **copie** (construite par `ariane-rebuild-component` à la place d'un original), ajouter `· remplace : <lien du master d'origine>` avant la date : c'est par elle qu'un composant traité plus tard, qui pose encore l'original devenu ancien, retrouve sa nouvelle version (`conventions-nommage.md`, composant en attente de migration). Listes séparées par `, ` ; pas de `·` dans une valeur ; `—` pour une liste vide. **La clé est le lien** (l'identifiant du nœud), pas le nom, qui peut changer au renommage : un master déjà présent voit sa ligne **remplacée**, pas dupliquée. Le journal ne dit rien que la description validée et les arbitrages du lot ne disent : il sert à retrouver, pas à décider. Une ligne dont le master n'est plus lisible, ou dont le nom a changé, **se signale** et ne sert pas de preuve.

## Chaque mot de la description se vérifie dans le fichier
Avant la proposition, relire chaque ligne contre le composant tel qu'il est **maintenant** (après le renommage des calques et des propriétés) : chaque propriété, valeur ou calque cité existe sous ce nom exact ; chaque affirmation — ce qu'un réglage fait, pour quelles valeurs il vaut, un mode de variables suivi, une pièce posée — se lit dans les variantes. Un réglage dont le nom ne dit pas tout se décrit par ce qu'il montre (`showFallbackName` : le nom du produit, qui remplace son logo quand l'image ne se charge pas). Une affirmation qui ne se vérifie pas sort de la description.

## Descriptions existantes — AUDIT D'ACTUALITÉ (avant toute réécriture)

**Sur une copie construite par Ariane** (planche « (proposition) »), la description vient de l'original : elle est **OBSOLÈTE** dès qu'elle cite une propriété, une valeur, un calque ou un composant absent de la copie.

Un composant évolue ; sa description se périme **en silence**. Une description
périmée est aussi nuisible qu'une description inventée : elle est lue comme
vraie par les agents. Une description existante n'est donc ni écrasée d'office,
ni conservée d'office — elle est **confrontée au fichier**.

**FRONTIÈRE — n'auditer QUE ce qui est vérifiable dans le fichier :**

| Affirmation | Auditable ? | Source de vérification |
|---|---|---|
| ligne `Contient :` | ✅ | instances réellement embarquées |
| mention d'une variante ou d'un axe | ✅ | `componentPropertyDefinitions` du master |
| renvoi à un voisin (`Éviter : … préférer X`) | ✅ | existence du composant X dans la librairie, et renvoi en retour de X (§ Voisins) |
| ligne `Vit dans :` | ✅ | masters du fichier qui posent directement le composant |
| mention « non publié / construction » | ✅ | préfixe du nom (`.` ou `_`) |
| ligne `Rôle :` | ⚠️ partiellement | le terme FR canonique doit exister dans les référentiels |
| ligne `Usage :` | ❌ | savoir **produit** — hors fichier |
| ligne `Règles :` | ❌ | savoir **produit** — hors fichier |
| ligne `Alias :` | ❌ | arbitrage du designer — hors fichier |
| frontière métier d'un `Éviter :` | ❌ | savoir **produit** — hors fichier |

> [!WARNING]
> **Ne JAMAIS déclarer obsolète une ligne non auditable.** `Usage` et la
> justification métier d'un `Éviter` ne se vérifient pas dans Figma : si elles
> paraissent douteuses, elles vont au **lot de questions (étape 6)**, jamais au
> verdict d'audit. Confondre « je ne peux pas vérifier » et « c'est faux » fait
> perdre du savoir validé.

**VERDICT — trois états, la contradiction toujours CITÉE :**

- **À JOUR** — aucune affirmation vérifiable contredite → **CONSERVER TELLE
  QUELLE** ; seule exception, une **ligne qui manque** : le renvoi manquant d'un voisin validé (§ Voisins), ou une ligne que le modèle exige ou qui se lit dans le fichier (`Usage`, `Vit dans`, `Contient`). Elle ne rend pas la description PARTIELLE : elle se propose comme **ajout seul**, le reste mot pour mot. Ne pas réécrire ce qui est juste : une réécriture gratuite détruit
  des nuances validées à la main. Ne pas la compter comme un skip.
- **PARTIELLE** — une partie tient, une autre est contredite → proposer une
  **correction CIBLÉE** de la seule ligne fautive, pas une réécriture complète.
- **OBSOLÈTE** — le rôle décrit ne correspond plus au composant → réécriture
  complète, présentée en diff comme aujourd'hui.

Dans les trois cas, **citer la contradiction** : « `Contient : cardContainer`
— ce composant n'est plus embarqué depuis la v3 du master ». Jamais « obsolète »
sans preuve.

## Descriptions posées sur des VARIANTES — détecter, proposer de remonter
Quand un composant est **transformé en set**, Figma **copie sa description sur chaque variante** et laisse le **set vide**. La description validée existe alors en N exemplaires, au mauvais niveau, et divergera à la prochaine modification.
- **LECTURE** : pour chaque set, lire aussi `description` de **chaque variante** (lecture seule).
- **SIGNAL** : toute variante à description **non vide** → flag `⚠️ description sur variante`, cité dans la table (combien de variantes, texte identique ou non).
- **PROPOSITION** : remonter le texte sur le **set** — il passe par l'**audit d'actualité** comme toute description existante (le texte a pu vieillir avec le passage en set) — et **proposer de vider les variantes**.
- **Écrire sur une variante reste hors périmètre** : les vider n'arrive **QUE sur décision explicite** de l'utilisateur (arbitrage « vider / garder »), jamais d'office.
- **Textes DIFFÉRENTS d'une variante à l'autre** → **pas de fusion automatique** : présenter les versions, l'utilisateur choisit ou compose.

## Workflow — UNE porte de validation, obligatoire
 
### Phase 1 — Lecture, audit et rédaction (aucune écriture)
L'ordre est celui-ci : **regarder s'il existe déjà une description, juger si elle est périmée, en écrire une, la proposer.**
1. Lister tous les **masters** de la cible (`COMPONENT_SET` **et** `COMPONENT` hors set ; les variantes ne comptent pas).
2. Pour chaque master : `get_metadata` (structure, instances embarquées) + `get_screenshot` (**obligatoire** — sans visuel on devine le rôle, donc interdit).
3. **Regarder s'il existe déjà une description** — sur le master, et sur chaque variante. Toute description de variante non vide → flag et proposition de remontée (cf. « Descriptions posées sur des VARIANTES »).
4. **Juger si elle est périmée — AUDIT D'ACTUALITÉ** (si une description existe) — cf. section dédiée. Confronter **uniquement les affirmations vérifiables dans le fichier** et produire un verdict **À JOUR / PARTIELLE / OBSOLÈTE**, contradiction citée. Une description **À JOUR est CONSERVÉE telle quelle** : passer au master suivant sans rédiger. Ce qui n'est pas auditable (`Usage`, frontière métier d'un `Éviter`) ne produit **jamais** de verdict — cela part au lot de questions.
5. Classer atome/structurel selon la règle déterministe (`Contient` non vide).
5 bis. **Chercher les voisins** dans les trois sources (§ Voisins) et le renvoi manquant.
6. **LOT DE QUESTIONS — obligatoire AVANT toute rédaction.** Rassembler les faits non lisibles dans le fichier (cf. section dédiée) et les poser en **un seul lot**, avec propositions pré-remplies. **Ne rien rédiger avant d'avoir les réponses.** Si rien n'est indécidable, le **dire explicitement** et passer à 7.
7. **En écrire une** : rédiger la description proposée et produire une table :
   `| # | Master | Classement | Description existante | Verdict d'audit | → Description proposée | Flag |`
   Dans la colonne « Description proposée », **chaque ligne porte son origine**, en clair et entre crochets : [lu dans Figma], [déduit — à confirmer], [ta réponse], [existant conservé]. Sous la description, les lignes absentes avec leur raison (« Éviter : aucun voisin trouvé »). **Les crochets et ces raisons ne sont jamais écrits dans Figma** : seule la description elle-même l'est. Sous chaque description figure aussi la **ligne de journal prévue** : le GO la couvre.
   La colonne **Verdict d'audit** porte `—` (pas de description existante), `À JOUR`, `PARTIELLE` ou `OBSOLÈTE`. Sur un `À JOUR`, la colonne « Description proposée » porte **« conservée »** — pas un texte régénéré.
8. Flags : `⚠️` description existante non vide (jamais écrasée sans arbitrage explicite — afficher le diff **et le verdict d'audit**), `⚠️` homonymes inter-univers ou inter-libs (Rôle à qualifier), `❓` terme absent des référentiels ou rôle non ancrable sur le visuel. Ne jamais deviner.
9. **La proposer — STOP.** Montrer la table complète et attendre un "GO" explicite, en disant ce qu'il déclenche (l'écriture des descriptions sur les masters, puis leur ligne au journal). N'écrire rien.
### Phase 2 — Écriture (seulement après le GO)
10. Master par master :
   a. Écrire la description validée sur le **MASTER** (`COMPONENT_SET`, ou `COMPONENT` hors set) — jamais sur une variante.
   b. **Read-back de la description seule**, comparer au texte validé.
   c. Tout écart → stop et remonter avant de continuer (isolation par master).
11. Pas de changement de page pour écrire (cf. Mécanisme d'écriture) : une cible qui couvre plusieurs pages se traite dans la même passe.
12. **Journal** : après le read-back réussi de chaque master, écrire sa ligne au journal (§ Voisins), telle que montrée dans la proposition. Une description conservée À JOUR y entre aussi ; pour elle, la lecture de la description tient lieu de read-back.
## Garde-fous (NE PAS faire)
- Ne pas écrire avant le "GO".
- Ne pas vider la description d'une variante sans **décision explicite** de l'utilisateur (cf. « Descriptions posées sur des VARIANTES »).
- Ne pas écraser une description existante sans arbitrage sur son diff **ni sans verdict d'audit**.
- Ne pas **réécrire une description jugée À JOUR** : la conserver telle quelle. Une réécriture gratuite détruit des nuances validées à la main.
- Ne pas déclarer **obsolète** une ligne **non auditable** (`Usage`, frontière métier d'un `Éviter`, `Règles`, `Alias`) : elle part au lot de questions, jamais au verdict.
- Ne pas écrire un `Éviter` sur un voisin trouvé par ressemblance sans la validation du designer, ni une `Règles` sans sa source, ni un alias « déduit » non validé.
- Ne pas citer en `Éviter` une pièce embarquée ni un composant qui embarque la cible.
- Ne rien écrire hors de la cible : ni la description d'un voisin, ni celle d'une autre planche ou d'une autre copie — un renvoi qui y manque se signale.
- Ne pas écrire dans le journal avant le read-back réussi, ni y mettre ce que la description validée ne dit pas.
- Ne pas décrire un master non passé par rename layers + props.
- Ne pas deviner un terme, un rôle ou un classement → ❓ et demander.
- Ne **JAMAIS** écrire un fait produit inféré « quitte à le corriger après » — contexte d'usage, règle métier, intentionnalité d'un trou de matrice : cf. « Faits NON LISIBLES dans le fichier ». Le corriger après coûte un aller-retour ET laisse une description fausse écrite dans le fichier entre-temps.
- S'arrêter et demander sur tout ❓ ou tout écart au read-back.
## Sortie finale
Récapitulatif numéroté à couverture prouvée : masters traités / **descriptions conservées car À JOUR** / masters skippés (avec raison) / ❓ restants / voisins signalés et renvois ajoutés / renvois à ajouter hors de la cible (signalés, non écrits) / lignes écrites au journal, affichées telles qu'écrites. Les trois verdicts d'audit sont **chiffrés** (N à jour · N partielles · N obsolètes). Les termes arbitrés sont **proposés** au référentiel adéquat (conventions ou lexique de mission), et n'y sont écrits qu'après validation du designer (cf. Garde-fous).
