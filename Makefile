# Portfolio — façade de déploiement.
# Toutes les cibles chargent .env automatiquement.
# Démarrage : cp .env.example .env  →  make gen-secrets  →  make secrets
#             →  make provision  →  make deploy  →  make monitoring  →  make tunnel

SHELL := /bin/bash
ENV   ?= .env
TUNNEL_SOCK := /tmp/portfolio-tunnel.sock

.PHONY: help gen-secrets secrets provision deploy monitoring tunnel tunnel-stop check-env

help:
	@echo "Cibles disponibles :"
	@echo "  make gen-secrets   Génère mot de passe Grafana + clé SSH dans .env"
	@echo "  make secrets       Pousse les secrets GitHub via gh"
	@echo "  make provision     Bootstrap du VPS (Docker, firewall, dossiers) — root, une fois"
	@echo "  make deploy        Déploie l'application sur le VPS"
	@echo "  make monitoring    Déploie la stack Prometheus + Grafana"
	@echo "  make tunnel        Ouvre le tunnel SSH (arrière-plan) vers Grafana (3001) et Prometheus (9090)"
	@echo "  make tunnel-stop   Ferme le tunnel SSH"

check-env:
	@test -f $(ENV) || { echo "Manque $(ENV) — lancez: cp .env.example .env"; exit 1; }

gen-secrets: check-env
	@./scripts/gen-secrets.sh

secrets: check-env
	@./scripts/set-github-secrets.sh

provision: check-env
	@set -a; source $(ENV); set +a; \
	cd ansible && ANSIBLE_PRIVATE_KEY_FILE="$$VPS_SSH_KEY_FILE" \
	ansible-playbook -i inventory.ini provision.yml \
	  -e "ansible_user=$${VPS_BOOTSTRAP_USER:-ubuntu}" -e "deploy_user=$$VPS_USER" \
	  -e "{\"ssh_pubkey\": \"$$SSH_PUBKEY\"}"

deploy: check-env
	@set -a; source $(ENV); set +a; \
	cd ansible && ANSIBLE_PRIVATE_KEY_FILE="$$VPS_SSH_KEY_FILE" \
	ansible-playbook -i inventory.ini deploy.yml -e "image_tag=$${IMAGE_TAG:-latest}"

monitoring: check-env
	@set -a; source $(ENV); set +a; \
	cd ansible && ANSIBLE_PRIVATE_KEY_FILE="$$VPS_SSH_KEY_FILE" \
	ansible-playbook -i inventory.ini monitoring.yml

tunnel: check-env
	@set -a; source $(ENV); set +a; \
	echo "Grafana    -> http://localhost:3001 (admin / $$GRAFANA_ADMIN_PASSWORD)"; \
	echo "Prometheus -> http://localhost:9090"; \
	ssh -f -N -M -S $(TUNNEL_SOCK) -o ExitOnForwardFailure=yes \
	  -i "$$VPS_SSH_KEY_FILE" -o IdentitiesOnly=yes \
	  -p "$$VPS_PORT" -L 3001:127.0.0.1:3001 -L 9090:127.0.0.1:9090 "$$VPS_USER@$$VPS_HOST" \
	  && echo "Tunnel ouvert en arrière-plan. Arrêt: make tunnel-stop"

tunnel-stop: check-env
	@set -a; source $(ENV); set +a; \
	ssh -S $(TUNNEL_SOCK) -O exit "$$VPS_USER@$$VPS_HOST" 2>/dev/null \
	  && echo "Tunnel fermé." || echo "Aucun tunnel actif."
