<!-- Fichier de référence de ariane-rename-layers, lu à la demande (renvoi depuis SKILL.md). -->

## Régime « board de documentation » (sœur de l'exclusion artboard)
**Détection** : `SKILL.md`, § « Régime board de documentation ».

**Régime appliqué dans un board de doc :**
- **Collapse** : autorisé dans un master, aux conditions du § « Critère de collapse » de `SKILL.md` (« Collapse dans un master »). Ce régime ne redirige que le **NOMMAGE** — cf. bullets suivants.
- **Frame de présentation 1er niveau** (celle qui usurpe le nom du master) → **exclue du renommage des calques** (comme l'artboard d'écran) : c'est la passe des propriétés qui lui donne le nouveau nom du master, avec le titre de l'en-tête de documentation (`ariane-rename-props`, « la présentation suit le nom du master »).
- **MASTERS : ne sont PAS du scaffolding.** Traités par leurs **propres runs** (`ariane-rename-props` pour les props ; skill layers **ciblé sur le master** pour ses layers internes). L'exclusion protège le **décor de doc**, jamais le master.
- **Scaffolding de doc** : renommé via un **MAPPING DÉTERMINISTE** propre au gabarit de documentation du design system, qui vit dans le **lexique de mission** (section « Gabarit des planches de documentation ») : chaque DS a son gabarit. Mapping **dépendant du chemin** pour les noms ambigus (`Content` désambiguïsé par son parent). Section absente ou vide → tout le scaffolding passe en `❓`.
- **Le mapping se vérifie au contenu.** Le nom que donne le mapping doit dire ce que le cadre contient : une colonne « claire » ou « sombre » montre ce mode ; une section de cas pratiques contient des cas (des instances du master), pas des masters. Quand le contenu dit autre chose — des colonnes qui séparent des plateformes, une section qui range des composants de construction —, le mapping ne s'applique pas : le cadre se nomme par ce qu'il contient (`iosContainer` / `androidContainer` pour des colonnes par plateforme, `platformContainer` pour le cadre qui les range ; pour une section de composants de construction, le nom que le mapping donne à ce rôle s'il en a un), et la passe le signale dans son récapitulatif.
- **Tout scaffolding HORS de ce mapping → `❓`** : ne JAMAIS déduire un nom ; signaler, laisser l'utilisateur trancher, **puis proposer l'ajout au mapping**, écrit seulement après validation du designer (même logique que le glossaire).
- **Frame vide** (0 enfant) — priorité :
  - si son nom est **DANS le mapping** → **appliquer le mapping** (ex. un conteneur de mode vide garde son nom de mapping). Le mapping encode un **rôle structurel** qui existe **indépendamment du contenu**.
  - sinon (nom **HORS mapping**) → `❓` (vraie inconnue / scratch potentiel).
  Autrement dit : dans un board de doc, **le MAPPING PRIME sur la règle « vide → ❓ »** quand l'entrée existe.

Ce régime est une **exclusion/redirection** : il ne change RIEN au comportement sur les écrans de prod ni sur les masters ciblés directement.
