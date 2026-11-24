---
name: journal-descriptions
description: Journal des descriptions de composants validées pendant la mission en cours — une ligne par master, écrite par ariane-describe-components après le read-back. Sert à retrouver les voisins d'un composant d'une session à l'autre, même après un /clear. Donnée de MISSION, comme le lexique.
metadata:
  type: reference
---

# Journal des descriptions — mission en cours

Écrit **uniquement** par `ariane-describe-components`, après le GO du designer et le read-back réussi de chaque description. Une ligne par master, montrée au designer dans la proposition avant le GO ; un master déjà présent voit sa ligne remplacée, jamais dupliquée. Le journal ne dit rien que la description validée ne dise : il sert à **retrouver** les voisins, et sa ligne dit qu'un composant est **traité** : le contrôle ne le rejuge pas (`ariane-check-component`, § Où vit le composant). Il ne décide rien d'autre.

> [!WARNING]
> **Ce fichier se vide au changement de mission**, comme le lexique.

Format (la clé est le lien, pas le nom) : `- <lien Figma> · <nom exact> · <pattern ou « — »> · Rôle : <ligne Rôle> · propriétés : <noms> · contient : <noms ou « — »> · voisins : <nom (critère)> · écartés : <noms> · <AAAA-MM-JJ>` — listes séparées par `, `, `—` pour une liste vide. Sur la ligne d'une copie, `· remplace : <lien du master d'origine>` vient avant la date : c'est l'ancien que la copie remplace, devenu « en attente de migration ».

## Composants décrits
