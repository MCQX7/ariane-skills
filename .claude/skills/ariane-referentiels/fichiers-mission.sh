#!/bin/sh
# Crée les fichiers de la mission qui manquent, depuis leurs modèles vides (modeles/, à côté).
#   sh fichiers-mission.sh
# Un fichier déjà là n'est jamais touché. Ces fichiers sont à l'utilisateur : la version publique
# ne les suit pas par git, pour que les mises à jour d'Ariane n'y touchent jamais.
set -eu
dir="$(cd "$(dirname "$0")" && pwd)"
for f in cadre-mission.md lexique-mission.md journal-descriptions.md; do
  [ -f "$dir/modeles/$f" ] || { echo "Modèle introuvable : $dir/modeles/$f" >&2; exit 1; }
  if [ ! -f "$dir/$f" ]; then cp "$dir/modeles/$f" "$dir/$f"; echo "Créé, vide : $f"; fi
done
echo "Fichiers de la mission : prêts."
