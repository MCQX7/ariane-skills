<!-- Fichier de référence de ariane-rename-layers, lu à la demande (renvoi depuis SKILL.md). -->

## Modes de sortie (AFFICHAGE seulement — n'affecte AUCUNE logique)
**COMPACT = défaut. VERBEUX = sur demande explicite** (« mode verbeux », « détail sur <écran> »).

- **COMPACT (défaut)** :
  - Les scripts/lectures renvoient **candidats + compteurs** (ex. « 8 frames : 5 KEEP, 2 coquilles collapsées, 1 ❓ »), **PAS le dump d'arbre complet**.
  - Recaps **condensés** : table essentielle (`node | avant | après | source`), **sans prose d'explication par étape**.
  - **Ne pas réafficher les contenus TEXT longs** (mentions légales…) à chaque étape → tronquer/référencer.
- **VERBEUX (sur demande)** : sortie complète (arbre annoté, raisonnement par étape, recaps détaillés) pour débugger un écran précis.

**GARDE-FOU — TOUJOURS affiché, même en compact (c'est la TRACE des actions, pas du verbiage) :**
- **Collapses appliqués** (frame supprimée, enfants remontés) + **read-back géométrique** (preuve que rien n'a bougé).
- **Renommages appliqués** (table avant/après).
- **`❓` / arbitrages en attente**.
- Blocs **« réarchitecture manuelle à prévoir »** et **« à remonter au skill `ariane-rename-props` »**.

On coupe le **raisonnement** et les **dumps** ; jamais la **preuve** des actions ni les **points de décision**.
