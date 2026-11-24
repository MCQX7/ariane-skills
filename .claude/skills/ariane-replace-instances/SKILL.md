---
name: ariane-replace-instances
description: "Étape d'Ariane, lancée par ariane-orchestrator SEULEMENT sur demande explicite, jamais dans un enchaînement. Remplace, dans les écrans du fichier Figma ouvert, toutes les instances posées d'un ancien composant par sa proposition validée (le composant refait), sans qu'un écran perde ce qui y était choisi ou saisi (branche Figma, table validée par le designer, répétition sur des copies avant toute écriture dans un écran). L'ancien composant n'est jamais supprimé. À utiliser quand l'utilisateur demande « remplace l'ancien composant par la proposition dans les écrans », « passe les écrans de ce fichier sur le nouveau composant ». NE PAS confondre avec la construction de la proposition (ariane-rebuild-component), le contrôle (ariane-check-component) ni le renommage."
user-invocable: false
---

# Figma — Remplacer un composant par sa proposition dans les écrans
<!-- version: v0.3 -->

La proposition (`ariane-rebuild-component`) a été relue et validée. Cette étape la pose **à la place de l'ancien composant** dans les écrans d'un fichier : chaque écran prend le nouveau dessin et **garde ce qui y était choisi ou saisi** (réglages, choix faits à la main dans les pièces imbriquées, textes, éléments masqués, taille). Elle ne se lance **que sur demande explicite** du designer.

## Entrée
- Le lien de l'**ancien** composant (set ou composant) et celui de la **proposition**, dans le même fichier.
- Le **périmètre** : par défaut toutes les pages du fichier ; le designer peut en exclure.

## Ce qui ne se touche jamais
- **L'ancien composant** : il n'est jamais supprimé, ni modifié ; c'est au designer de décider quand.
- **La proposition** : un défaut qu'elle montre pendant la répétition se **soumet** au designer, avec la correction recommandée ; il ne se corrige ni ici sans son go, ni instance par instance.
- **Les écrans** avant que la table et la répétition soient validées.
- **Une instance posée dans un autre composant** (dans un master, ou dans une instance d'un autre composant) : elle appartient à ce composant ; elle se migre dans ce composant, pas instance par instance. Elle est mise à part et dite.
- **Les autres fichiers** : l'étape ne voit que le fichier ouvert et ne fait pas la carte des usages hors de lui. Les copies faites ailleurs par copier-coller (idéation, exploration) ne se migrent pas ; un composant de librairie utilisé dans d'autres fichiers demande une migration par fichier, sur la branche de chacun.
- **Une proposition non validée** : confirmer qu'elle l'est ; sinon s'arrêter et renvoyer au contrôle ou à la construction de la proposition.

## Prérequis
- **Prérequis communs** : lire `${CLAUDE_SKILL_DIR}/../ariane-referentiels/prerequis-communs.md`. Introuvable → **ARRÊT**.
- **Une branche Figma du fichier, toujours** : le connecteur ne sait pas la créer ni la reconnaître ; demander une fois au designer si le lien donné est bien celui de sa branche. Sans confirmation, rien ne s'écrit.
- **Les scripts fixes** de l'étape, dans `${CLAUDE_SKILL_DIR}/` : `releve.js`, `etat.js`, `repetition.js`, `echange.js`, `controle.js`. Chacun se lit et se passe **tel quel** (seules les lignes de commentaire peuvent être retirées, jamais une ligne de code, même d'une branche que les paramètres n'exécutent pas) à l'exécution de script du connecteur officiel, en ne changeant que la ligne qui suit `// PARAMÈTRES` ; quand un retour porte un champ `suite` non nul, relancer avec `DEBUT` = cette valeur et cumuler. Le retour du connecteur est limité en taille : des lots courts (`N` du relevé, deux ou trois ids pour `etat.js`), jamais un emballage écrit en séance autour d'un script. **Jamais de script d'écriture écrit en séance** : un cas que les scripts ne couvrent pas devient une perte dite au designer. Un fichier introuvable → **ARRÊT**.

## Déroulé
1. **Relevé** (`releve.js`, lecture). Pour chaque instance de l'ancien : page, écran, cadre d'écran, variante, taille, remplissage, modes de l'écran, et une **signature** de ses réglages faits à la main ; par signature, le détail. Dire : le total, les instances **mises à part** (dans un autre composant), le nombre de signatures.
2. **Table de correspondance.** Lire avec `etat.js` une instance exemple par signature et chaque variante cible de la proposition : ce que montre l'ancienne, ce que montre la cible par défaut. Écrire la table :
   - **variantes** : pour chaque variante de l'ancien, la variante de la proposition (même valeur quand elle existe) ; une exception par signature quand un réglage fait à la main équivaut à une autre variante de la proposition ;
   - **remises** : par signature, **seulement ce qui diffère** entre ce que montre l'ancienne et ce que montre la cible par défaut — un choix, un élément masqué —, avec le chemin que rend `etat.js` sur la cible ; des pièces répétées qui changent de nom se reprennent par leur rang, pas par leur nom ; un réglage se reprend tel qu'il se **voit**, pas tel qu'il est nommé ; les textes saisis, rendus à part par le relevé, se reposent d'eux-mêmes quand la proposition a une propriété texte du même nom, sinon par instance ;
   - **largeur** : comme avant, ou en remplissage du conteneur quand le designer le décide pour ce composant ;
   - **pertes** : ce qui n'a pas de correspondance, instance par instance.
   Montrer la table en clair au designer (une ligne par signature : combien d'instances, où, ce qui se remet, ce qui se perd). **Arrêt 1** : rien ne s'écrit avant sa validation ; dire que valider lance la répétition, sur des copies.
3. **Répétition, hors des écrans.** `repetition.js` copie sur la page « Ariane — répétition » un cadre d'écran par signature, **en bureau et en mobile** quand les deux existent ; puis `echange.js` sur les instances copiées, avec la table ; puis `controle.js` sur ces copies. Une image de chaque écran d'origine et de sa copie. Lire les codes :
   - **vert** : conforme ;
   - **orange** : un écart reste — un réglage de la table non posé, un écart avec la cible qui n'est pas une remise, un calque qui **déborde** ou est **rogné**, un rang changé ;
   - **rouge** : arrêt — l'instance a changé depuis le relevé, une variante cible manque, une erreur.
   Les codes viennent d'`echange.js` ; `controle.js` rend les écarts de chaque instance avec sa variante, à comparer aux remises de la table — tout autre écart est un défaut. Trier chaque défaut : **de la table** (la corriger, refaire la répétition) ou **de la proposition** (une taille, une mise en page, un réglage de la proposition qui ne tient pas dans un écran) — celui-là se **soumet** au designer avec la correction recommandée dans la proposition, et le remplacement attend. **Arrêt 2** : le designer regarde la page de répétition (qu'il supprimera avant de fusionner) ; dire que valider lance le remplacement dans les écrans.
4. **Remplacement**, page par page : une image de chaque écran touché avant d'écrire (au moins un par signature), puis `echange.js` par lots que le délai du connecteur laisse finir, avec la table et **la signature du relevé de chaque instance** (une instance sans signature, déjà échangée, posée dans un autre composant, ou qui a changé depuis le relevé sort en rouge). Un rouge arrête la page ; un rouge « modifiée » se traite avant toute relance ; les oranges se listent et se règlent avant la page suivante.
5. **Contrôle final** : `controle.js` sur toute la proposition — plus aucune ancienne dans les écrans (hors celles mises à part), chaque signature conforme à la table, aucun débordement ; une image après de chaque écran qui avait un orange et de quelques autres. Puis le compte rendu.

## Pièges connus de Figma (les scripts s'en chargent)
- **L'échange garde les réglages par ressemblance des noms de calques** : avec une construction différente, il en perd et peut en poser un au mauvais endroit. `echange.js` remet donc tout à zéro après l'échange, puis pose la table.
- **Une pièce dont une propriété est reliée à une variable** (sa version suit le mode de l'écran) bascule dans un écran d'un autre mode et perd les réglages que la proposition lui donne : `echange.js` (réglage `REALIGNER`) lui rend ses réglages et sa taille depuis la variante cible, sans toucher à ce qui est relié à la variable.
- **La largeur** : reposée comme avant, sauf décision de remplissage (réglage `LARGEUR`) ; la hauteur suit le contenu quand la variante cible suit le sien.

## Compte rendu — court
- Le total remplacé, page par page ; les instances mises à part et pourquoi ; ce qui reste de l'ancien.
- Ce qui s'est remis (par signature) et **ce qui s'est perdu**, écran par écran.
- Les défauts de la proposition soumis, avec leur correction recommandée, et ce qui attend le go du designer.
- Le temps passé ; la page de répétition à regarder ; l'ancien composant toujours en place, à supprimer quand le designer le décide.
Français simple, pas de tableau large, pas de jargon.
