#!/usr/bin/env sh
# Review before running: installs only the public GenieLocker instructions.
set -eu

DIR=".claude/skills/genie-locker"
SRC="https://genie.locker/agent.md"

mkdir -p "$DIR"
BODY=$(curl -fsSL "$SRC") || {
  echo "genie.locker: could not fetch $SRC" >&2
  exit 1
}

{
  echo '---'
  echo 'name: genie-locker'
  echo 'description: >-'
  echo '  Buy a private, quality-gated OpenAI-compatible inference locker by'
  echo '  the minute. Use when an agent needs bounded temporary inference.'
  echo '---'
  echo
  printf '%s\n' "$BODY"
} > "$DIR/SKILL.md"

echo "genie.locker: installed $DIR/SKILL.md"
echo "Nothing was purchased and no wallet or API key was created."
