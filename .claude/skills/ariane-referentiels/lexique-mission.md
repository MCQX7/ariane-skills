---
name: lexique-mission
description: "Lexique du DOMAINE de la mission en cours — traductions FR→EN dont le sens dépend du métier, noms de produits, options de variant propres au projet. PARTAGÉ par ariane-rename-props ET ariane-rename-layers, lu aussi par ariane-describe-components. Lu en étape 0 ; ne porte que des règles, enrichi seulement par des lignes validées par le designer. SE VIDE à chaque changement de mission, contrairement aux conventions de nommage."
metadata:
  type: reference
---

# Lexique de mission

Vocabulaire **propre au domaine de la mission en cours**. Lu en étape 0
(appliquer sans re-flaguer ce qui est présent ; `❓` + demander si absent). Il
porte des **règles** — un terme, une construction, une option qui servent
ailleurs —, pas le journal des arbitrages : un nom propre à un seul composant
vit dans le fichier Figma. Il ne s'enrichit que d'une ligne **proposée** par un
skill et **validée explicitement par le designer**.

> [!WARNING]
> **Ce fichier se vide au changement de mission.** Il ne contient que ce qui
> perd son sens hors du domaine courant. Les règles de construction et le
> vocabulaire d'interface vivent dans `conventions-nommage.md`, qui lui
> est conservé — voir la règle de routage qui y figure.

Vide au départ : il se remplit au fil des runs, des lignes proposées par les
skills et validées par le designer. On peut aussi y écrire d'avance les mots
du métier et les noms de produits qu'on connaît déjà.

## Concepts du domaine

Chaque **mot** tranché par le designer reste ici, pour ne jamais être redemandé. Un **nom de composant** validé n'y entre pas : il vit dans le fichier Figma, et Ariane garde un nom déjà propre.

Une ligne par mot : `- \`<mot source>\` → **<motAnglais>** — <précision, exemple de nom obtenu>`.

## Noms de dimensions et de masters

Les noms de propriétés de variante et de masters propres au domaine, quand le mot seul ne suffit pas.

## Anatomie de la marque

Pièces du logo et de l'identité de la marque. Traductions justes, mais **propres à ce
client** — elles ne se présenteront pas ailleurs (cf. test de routage des
conventions).

## Noms de produits

Gardés tels quels, en camelCase (PascalCase dans un nom de composant). Une ligne
par produit : `- <nom affiché> → \`<nomEnCamelCase>\``.

## Options de variant

Les valeurs de variante propres au projet : `- \`<propriété>\` : <valeur source> → \`<valeur>\``.

---

Skills associés : `ariane-rename-props` (props, **propose** ici des lignes, écrites après validation du designer),
`ariane-describe-components` (descriptions, **propose** ici les termes tranchés, écrits après validation du designer) et
`ariane-rename-layers` (layers/textes, **lecture seule** — il propose les `❓`
absents, il n'écrit jamais).

## Gabarit des planches de documentation

Noms du décor des planches de documentation de ce design system (lu par `ariane-rename-layers`, régime « board de documentation »). Dépend du gabarit de la mission : se vide avec le reste du lexique.

| nom (chemin) | → proposé |
|---|---|
