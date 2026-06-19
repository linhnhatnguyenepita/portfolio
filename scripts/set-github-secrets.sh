#!/usr/bin/env bash
# Push the GitHub Actions secrets from .env to the repository in one shot,
# using the GitHub CLI (`gh`). Run `gh auth login` first.
#
# Secrets consumed by the CI/CD workflows (9), including GRAFANA_ADMIN_PASSWORD
# since the monitoring stack is now deployed by the Deploy workflow.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

[ -f "$ENV_FILE" ] || { echo "Manque ${ENV_FILE} — lancez: cp .env.example .env" >&2; exit 1; }

command -v gh >/dev/null || { echo "gh (GitHub CLI) introuvable. Installez-le: https://cli.github.com" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh non authentifié. Lancez: gh auth login" >&2; exit 1; }

# Load .env (tilde in paths is expanded by bash on assignment).
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${GH_REPO:?GH_REPO doit être défini dans .env (owner/repo)}"

# Plain string secrets read from environment.
SECRETS=(
  NEXT_PUBLIC_SANITY_PROJECT_ID
  NEXT_PUBLIC_SANITY_DATASET
  VPS_HOST
  VPS_USER
  VPS_PORT
  GHCR_PAT
  SONAR_TOKEN
  GRAFANA_ADMIN_PASSWORD
)

echo "Dépôt cible: ${GH_REPO}"

for name in "${SECRETS[@]}"; do
  val="${!name:-}"
  if [ -z "$val" ]; then
    echo "⚠ ${name} vide dans .env — ignoré"
    continue
  fi
  printf '%s' "$val" | gh secret set "$name" --repo "$GH_REPO"
  echo "✓ ${name}"
done

# Multiline secret: the SSH private key, read from its file.
key_file="${VPS_SSH_KEY_FILE/#\~/$HOME}"
if [ -n "${VPS_SSH_KEY_FILE:-}" ] && [ -f "$key_file" ]; then
  gh secret set VPS_SSH_KEY --repo "$GH_REPO" < "$key_file"
  echo "✓ VPS_SSH_KEY (depuis ${key_file})"
else
  echo "⚠ VPS_SSH_KEY non poussée — fichier introuvable: ${key_file:-<non défini>}"
fi

echo
echo "Secrets GitHub mis à jour."
