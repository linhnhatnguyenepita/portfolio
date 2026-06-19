#!/usr/bin/env bash
# Generate the secrets that can be created automatically and write them back
# into .env (only when the corresponding value is still empty):
#   - GRAFANA_ADMIN_PASSWORD  (random)
#   - an ed25519 SSH deploy key at VPS_SSH_KEY_FILE, and its public key in SSH_PUBKEY
#
# Idempotent: existing values and an existing key file are left untouched.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

[ -f "$ENV_FILE" ] || { echo "Manque ${ENV_FILE} — lancez: cp .env.example .env" >&2; exit 1; }

# Portable in-place sed (GNU vs BSD).
sed_inplace() {
  if sed --version >/dev/null 2>&1; then sed -i "$@"; else sed -i '' "$@"; fi
}

# Upsert KEY="VALUE" in .env. Values are quoted so that entries containing
# spaces (e.g. the SSH public key) survive `source .env`. The | sed delimiter
# keeps slashes in the value safe.
set_env() {
  local key="$1" val="$2"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed_inplace "s|^${key}=.*|${key}=\"${val}\"|" "$ENV_FILE"
  else
    printf '%s="%s"\n' "$key" "$val" >> "$ENV_FILE"
  fi
}

# Read a value from .env (without sourcing the whole file).
get_env() {
  sed -n "s|^$1=||p" "$ENV_FILE" | head -n1
}

# --- Grafana admin password ---
if [ -z "$(get_env GRAFANA_ADMIN_PASSWORD)" ]; then
  pw="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
  set_env GRAFANA_ADMIN_PASSWORD "$pw"
  echo "✓ GRAFANA_ADMIN_PASSWORD généré"
else
  echo "• GRAFANA_ADMIN_PASSWORD déjà défini — inchangé"
fi

# --- SSH deploy key ---
key_file_raw="$(get_env VPS_SSH_KEY_FILE)"
key_file="${key_file_raw/#\~/$HOME}"
if [ -z "$key_file" ]; then
  echo "VPS_SSH_KEY_FILE vide dans .env" >&2; exit 1
fi

if [ ! -f "$key_file" ]; then
  mkdir -p "$(dirname "$key_file")"
  ssh-keygen -t ed25519 -N '' -C 'portfolio-deploy' -f "$key_file"
  echo "✓ Clé SSH générée: ${key_file}"
else
  echo "• Clé SSH déjà présente: ${key_file} — inchangée"
fi

# --- Public key into SSH_PUBKEY ---
if [ -z "$(get_env SSH_PUBKEY)" ]; then
  pub="$(cat "${key_file}.pub")"
  set_env SSH_PUBKEY "$pub"
  echo "✓ SSH_PUBKEY renseignée depuis ${key_file}.pub"
else
  echo "• SSH_PUBKEY déjà définie — inchangée"
fi

echo
echo "Terminé. Vérifiez/complétez les valeurs restantes dans .env, puis: make secrets"
