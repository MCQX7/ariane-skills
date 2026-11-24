# Ce qui change d'une version à l'autre · What changes from one version to the next

## 1.2 — 2026

Corrections tirées du premier essai public · Fixes from the first public trial.

- Les fichiers de ta mission (cadre, lexique, journal des descriptions) se créent au premier run et git ne les suit plus : une mise à jour d'Ariane ne bute plus sur eux. Si tu as cloné la 1.0 ou la 1.1 et rempli l'un d'eux, mets-le de côté avant de mettre à jour, puis remets-le. · Your project files (frame, lexicon, description log) are created on the first run and no longer tracked by git, so an update never trips on them. If you cloned 1.0 or 1.1 and filled one in, set it aside before updating, then put it back.
- Une copie corrigée se pose au-dessus de l'original sans déplacer aucune planche voisine. · A corrected copy goes above the original without moving any neighbouring board.
- La copie d'un composant posé seul sur la page passe toute sa vérification ; ce qui n'a pas pu être vérifié est toujours dit. · The copy of a component placed on its own on the page goes through its full verification; anything that couldn't be checked is always reported.
- Le contrôle découpe ses problèmes de façon plus régulière d'un run à l'autre : tout ce qui touche une même propriété du panneau fait un seul problème. · The check splits its problems more consistently from one run to the next: everything about one panel property makes a single problem.
- Le contrôle compte l'opacité : un état désactivé à 50 % n'est plus pris pour l'état normal. · The check counts opacity: a disabled state at 50% is no longer taken for the default one.

- `ariane-orchestrator` v1.24
- `ariane-check-component` v2.20
- `ariane-rebuild-component` v0.17

## 1.1 — 2026

La revue des copies a sa page, comme les tickets du contrôle · Copy review gets its own page, like the check's tickets.

- `ariane-orchestrator` v1.23
- `ariane-check-component` v2.19

## 1.0 — 2026

Première version publique · First public release.

- `ariane-orchestrator` v1.22
- `ariane-check-component` v2.18
- `ariane-rename-layers` v2.22
- `ariane-rename-props` v1.26
- `ariane-describe-components` v1.19
- `ariane-rebuild-component` v0.16
- `ariane-replace-instances` v0.3
