<!-- Fichier de référence de ariane-rename-layers, lu à la demande (renvoi depuis SKILL.md). -->

## Arbitrage mutualisé sur lot (batch multi-écrans — UX seulement)
Sur un **lot de plusieurs écrans** (souvent jumeaux structurels), regrouper les décisions récurrentes en **UN menu mutualisé** au lieu d'un menu par écran.

- **MUTUALISABLES** (une question pour N écrans) : arbitrages de **structure / convention** qui ne dépendent **que du layer et de son rôle**, **indépendamment du contenu affiché** (ex. un conteneur hors table de patterns → `deliverySummaryContainer` sur N écrans ; `Les options de livraison` → `deliveryOptionsCaption`). **Même layer + même rôle** sur plusieurs écrans = **une seule question**.
- **JAMAIS mutualisés — posés PAR ÉCRAN** :
  - arbitrages où le **RÔLE lui-même diffère ou est ambigu** d'un écran à l'autre (caption vs description, value vs label réellement indécidable). **⚠️ CONTENU VARIABLE ≠ RÔLE VARIABLE** : si le **rôle est constant** et que seul le **contenu** change (nombre, date…), c'est **MUTUALISABLE** — ne pas écarter en « par écran » sur le seul prétexte d'un contenu variable ;
  - **coquilles trompeuses** du collapse (inertes dans l'état affiché, pas dans un état inversé) — la géométrie peut différer entre jumeaux ; chaque cas se juge isolément.
  - **Dans le doute → NE PAS mutualiser** → poser par écran (même esprit que le KEEP conservateur).
- **Ergonomie (gestion des exceptions)** — pour chaque décision mutualisée :
  - afficher le **nombre d'écrans concernés** (ex. « ce cas concerne N écrans ») ;
  - proposer **« appliquer à tous »** / **« voir les exceptions »** ;
  - si « voir les exceptions » : présenter séparément les écrans qui **diffèrent** (ex. la plupart identiques en bloc, quelques-uns à part) — jamais forcé de tout grouper ou tout dégrouper ;
  - la réponse mutualisée s'applique aux écrans concernés ; **exceptions et cas par-écran gardent leur propre arbitrage**.
- **AUTONOMIE sur le déterministe (ne pas s'arrêter dessus)** : appliquer **immédiatement, sans s'arrêter**, tout le déterministe — casse, glossaire, mapping doc, rôle TEXT à marqueurs clairs, **ET le collapse PROUVÉ par la sonde** (la sonde EST le garde-fou, pas un arbitrage). **Ne JAMAIS mettre un écran/une section entier en attente** parce qu'UN élément est ambigu ou qu'il y a un collapse à tenter → **traiter le sûr, isoler l'ambigu**.
- **Retour par SECTION, arbitrages NOMMÉS** : accumuler les `❓` réels et revenir vers l'utilisateur **une fois par section** (pas par écran, pas tout à la fin). Chaque arbitrage est **nommé + contextualisé** (ex. « le wrapper `Nav` qui enveloppe l'accroche en haut », « le TEXT `Choisissez une option` — rôle ? ») — **jamais** « arbitrage 1/2/3 ». L'utilisateur doit comprendre **sans ouvrir Figma**.
- **Respect des arbitrages** : un choix qui crée un conflit de noms se signale et se redemande (`SKILL.md`, § « Exclusions dures ») — ex. « ton choix `heading` entre en collision avec un `heading` existant sur cet écran — comment les distinguer ? ».
- **Inchangé** : le **collapse reste exécuté écran par écran par la sonde** (séquentiel) ; seuls les **arbitrages de nommage structurels** sont mutualisés, pas l'exécution.

## Batch reprenable (mémoire de session — résilience)
Sur un batch multi-écrans, permettre la **reprise après interruption** (erreur, timeout) sans tout refaire ni sauter d'écran.

**Mécanisme :**
- Tenir une **liste des écrans ENTIÈREMENT terminés** du batch courant. Granularité = **écran complet** (scan + collapse + nommage + read-back conforme). Un écran n'entre dans la liste qu'**APRÈS son read-back OK**.
- État en **mémoire de session** (pas de fichier persistant). Pour qu'il survive dans le contexte, **AFFICHER la progression de façon explicite et visible à chaque écran terminé** (ex. « ✅ traités : écrans 1-27 / 40 »).
- **Reprise** : reprendre les écrans **ABSENTS** de la liste, chacun **DE ZÉRO** (re-scan complet). Le **read-back rattrape** les layers déjà renommés (déjà à leur nom cible → rien à changer) et finit ce qui manquait.
- **Granularité binaire** : un écran est soit **ENTIÈREMENT terminé** (dans la liste), soit **À REFAIRE EN ENTIER**. Jamais de demi-écran mémorisé.

**Garde-fous :**
- La liste pilote la reprise par ce que le skill **A FAIT**, **PAS** par l'apparence des layers. Un écran nettoyé à la main (camelCase mais noms FR/hors-glossaire restants) **n'est PAS « déjà traité »** → il sera traité normalement. **Ne JAMAIS conclure « déjà fait » sur la seule apparence conforme** — « conforme » au sens **STRICT** de la section « Définition de CONFORME » (camelCase **ET** suffixe de rôle/structure). Un rôle/pattern **NU en camelCase** (`title`, `header`…) **n'est PAS conforme** → il n'est **jamais** court-circuité.
- Si la liste n'est plus claire (contexte compacté, doute) → **NE PAS deviner** : afficher ce qui est connu et **DEMANDER confirmation** avant de reprendre. Mieux vaut redemander que sauter un écran en silence.
- La liste vaut pour le **RUN COURANT**, pas comme vérité permanente : un nouveau batch sur la même section **repart à zéro** (et ne touchera que ce qui reste).
