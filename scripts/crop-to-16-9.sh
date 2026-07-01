#!/usr/bin/env bash
set -euo pipefail

crop() {
  local img="$1"
  local w h target_h

  w=$(sips -g pixelWidth "$img" 2>/dev/null | awk '/pixelWidth:/ {print $2}')
  h=$(sips -g pixelHeight "$img" 2>/dev/null | awk '/pixelHeight:/ {print $2}')

  if [[ -z "$w" || -z "$h" ]]; then
    echo "  skip: unable to read dimensions" >&2
    return
  fi

  target_h=$(( w * 9 / 16 ))

  if (( target_h >= h )); then
    echo "  skip: already ≤16:9 (${w}x${h})" >&2
    return
  fi

  echo "  crop ${w}x${h} -> ${w}x${target_h} (remove $(( h - target_h ))px bottom)" >&2
  sips -c "$target_h" "$w" "$img" --out "$img" >/dev/null
}

if (( $# == 0 )); then
  echo "Usage: $0 <image> [image ...]"
  echo "Crop 16:10 images to 16:9 by removing the bottom strip."
  exit 1
fi

for f in "$@"; do
  if [[ ! -f "$f" ]]; then
    echo "skip: $f (not a file)" >&2
    continue
  fi

  ext="$(printf '%s' "${f##*.}" | tr '[:upper:]' '[:lower:]')"
  case "$ext" in
    png|jpg|jpeg|webp|tiff|gif) ;;
    *) echo "skip: $f (unsupported extension .$ext)" >&2; continue ;;
  esac

  echo "$f"
  crop "$f"
done
