# Ce qui change d'une version à l'autre · What changes from one version to the next

## 1.3.1 — 2026

- Les lignes qui disent ce qui se fait pendant une étape longue parlent avec les mots de Figma, plus avec le nom des outils d'Ariane. · Progress lines during a long step use Figma's words, no longer the names of Ariane's tools.

- `ariane-orchestrator` v1.26

## 1.3 — 2026

Corrections tirées d'un essai comme un inconnu · Fixes from a trial run as a newcomer.

- Sur une page qui mêle composants à reprendre et composants bien construits, construire les copies renomme aussi les bien construits ; le récapitulatif dit ce qui n'a pas été traité. · On a page mixing components to rework and well-built ones, building the copies also renames the well-built ones; the summary says what was left untouched.
- Ariane ne crée plus de nouveau composant de son propre chef : une valeur reste dans son composant, sauf si ton design system fait déjà ce découpage ou si tu le demandes. · Ariane no longer creates a new component on its own: a value stays in its component, unless your design system already splits it out or you ask for it.
- Les mots que tu valides vont dans ton lexique, jamais dans les fichiers livrés avec Ariane : ses mises à jour ne butent plus dessus. · The words you approve go to your lexicon, never into the files shipped with Ariane, so its updates never trip on them.
- Une copie se crée sur la page de son original, et se pose à côté de lui quand la place au-dessus est prise. · A copy is created on its original's page, and goes next to it when the space above is taken.
- Des questions plus claires, une à la fois, et moins de mots internes dans le terminal. · Clearer questions, one at a time, and fewer internal words in the terminal.

- `ariane-orchestrator` v1.25
- `ariane-check-component` v2.21
- `ariane-rebuild-component` v0.18
- `ariane-rename-props` v1.27
- `ariane-describe-components` v1.20

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
