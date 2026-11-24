#!/bin/sh
# Fait la page de tickets d'un contrôle : page-tickets.sh tickets/AAAA-MM-JJ-controle-<cible>.md
# Écrit, à côté du .md, la page .html du même nom, remplie depuis le modèle page-tickets.html.
# Rien d'autre n'est écrit. Relancer le script après avoir refait le .md refait la page.
set -eu
src="$1"
[ -f "$src" ] || { echo "Sortie du contrôle introuvable : $src" >&2; exit 1; }
case "$src" in *.md) ;; *) echo "Attendu : un fichier .md" >&2; exit 1 ;; esac
modele="$(cd "$(dirname "$0")" && pwd)/page-tickets.html"
out="${src%.md}.html"
titre=$(basename "${src%.md}")
awk -v titre="$titre" -v src="$src" '
  index($0, "<!--SORTIE-->") { while ((getline l < src) > 0) { gsub(/<\/script/, "< /script", l); print l }; next }
  { gsub(/__TITRE__/, titre); print }' "$modele" > "$out"
echo "$out"
