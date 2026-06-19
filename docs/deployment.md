# Déploiement & Monitoring

Ce document décrit comment déployer le portfolio et sa stack de monitoring
(Prometheus + Grafana) sur un VPS, et comment vérifier que tout fonctionne de
bout en bout.

## Évaluation — j'ai reçu un `.env` déjà rempli (+ la clé SSH)

Si vous avez reçu mon fichier `.env` complété **et** ma clé privée de
déploiement (le fichier dont le chemin figure dans `VPS_SSH_KEY_FILE`), tout
est déjà en place : les secrets GitHub sont poussés et le VPS est déjà
provisionné. **Ne lancez donc PAS** `make gen-secrets`, `make secrets` ni
`make provision`. Procédez ainsi :

```sh
# 1. Déposez les deux fichiers reçus
cp /chemin/vers/.env  ./.env                 # à la racine du dépôt
mkdir -p ~/.ssh
cp /chemin/vers/vps_deploy_key ~/.ssh/vps_deploy_key   # = chemin VPS_SSH_KEY_FILE
chmod 600 ~/.ssh/vps_deploy_key              # Ansible refuse une clé trop permissive

# 2. Prérequis du contrôleur (Ansible + collections)
ansible-galaxy collection install community.docker community.general

# 3. Déployez et observez (ces cibles utilisent la clé deploy)
make deploy        # build/pull déjà fait par la CI ; ici on (re)déploie l'app
make monitoring    # déploie Prometheus + Grafana
make tunnel        # tunnel SSH -> Grafana (3001) + Prometheus (9090)
```

> Le chemin local de la clé est celui de `VPS_SSH_KEY_FILE` dans le `.env`
> (par défaut `~/.ssh/vps_deploy_key`). S'il diffère, déposez la clé à cet
> emplacement-là, ou ajustez la variable.

Pour observer la **chaîne CI/CD complète** sans rien déployer à la main : un
`git push` sur `main` (ou *Run workflow* depuis l'onglet Actions) déclenche CI →
Security → SonarCloud, puis le workflow **Deploy** quand la CI passe. Les
secrets GitHub étant déjà configurés, le pipeline tourne tel quel.

Vérifications rapides après `make deploy` / `make monitoring` :

```sh
curl http://<VPS_HOST>:3000          # l'application répond
# puis, via make tunnel ouvert :
open http://localhost:3001           # Grafana (admin / $GRAFANA_ADMIN_PASSWORD)
open http://localhost:9090/targets   # toutes les cibles Prometheus UP
```

## Démarrage rapide (depuis zéro)

Un seul fichier à remplir, puis des commandes `make` qui chargent ce fichier
automatiquement. Prérequis : `ansible`, `gh` (authentifié via `gh auth login`),
`docker` côté VPS.

```sh
cp .env.example .env          # 1. remplir NEXT_PUBLIC_SANITY_*, VPS_HOST, GHCR_*, SONAR_TOKEN…
make gen-secrets              # 2. génère le mot de passe Grafana + la clé SSH de déploiement
make secrets                  # 3. pousse les 9 secrets GitHub d'un coup (gh)
make provision                # 4. bootstrap du VPS (Docker, firewall, dossiers) — une fois
make deploy                   # 5. déploie l'application
make monitoring               # 6. déploie Prometheus + Grafana (aussi fait par la CI)
make tunnel                   # 7. ouvre le tunnel SSH vers Grafana / Prometheus
```

> `make provision` se connecte avec `VPS_BOOTSTRAP_USER` (défaut `ubuntu` pour
> OVH) via votre clé SSH habituelle déjà autorisée par le fournisseur. Le
> provision crée ensuite l'utilisateur `deploy` et y installe `SSH_PUBKEY`
> (la clé générée par `make gen-secrets`), utilisée par `make deploy`.

`make help` liste toutes les cibles. Les sections ci-dessous détaillent chaque
étape et l'équivalent manuel.

## Vue d'ensemble

| Élément | Outil | Accès |
|---|---|---|
| Application | Conteneur Docker `portfolio` | `http://<VPS_HOST>:3000` (public) |
| Métriques | Prometheus | `127.0.0.1:9090` (tunnel SSH) |
| Dashboards | Grafana | `127.0.0.1:3001` (tunnel SSH) |
| Métriques hôte | node-exporter | scrapé par Prometheus |
| Métriques conteneurs | cAdvisor | scrapé par Prometheus |

Toute la stack de monitoring est bindée sur `127.0.0.1` : **rien n'est exposé
publiquement**. On y accède par un tunnel SSH. Le firewall UFW (configuré par
`provision.yml`) n'autorise en entrée que SSH et le port 3000.

## Secrets GitHub Actions requis

| Secret | Usage |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Build/runtime de l'app |
| `NEXT_PUBLIC_SANITY_DATASET` | Build/runtime de l'app |
| `VPS_HOST` | IP/host du VPS |
| `VPS_USER` | Utilisateur de déploiement (ex. `deploy`) |
| `VPS_PORT` | Port SSH (défaut 22) |
| `VPS_SSH_KEY` | Clé privée SSH du déploiement |
| `GHCR_PAT` | Token GHCR pour pull de l'image sur le VPS |
| `SONAR_TOKEN` | Analyse SonarCloud |
| `GRAFANA_ADMIN_PASSWORD` | Mot de passe admin Grafana (monitoring) |

## Prérequis sur le contrôleur Ansible

```sh
ansible-galaxy collection install community.docker community.general
```

## Étape 1 — Provisionner le VPS (une seule fois)

Sur un VPS Debian/Ubuntu neuf, en se connectant avec un utilisateur sudo.
Sur **OVH** c'est `ubuntu` (sudo sans mot de passe) ; ailleurs ce peut être
`root`. Installe Docker, crée l'utilisateur de déploiement, le firewall, et les
dossiers `/opt/portfolio` et `/opt/monitoring`.

```sh
cd ansible
VPS_HOST=1.2.3.4 \
ansible-playbook -i inventory.ini provision.yml \
  -e "ansible_user=ubuntu" \
  -e "deploy_user=deploy" \
  -e "ssh_pubkey='ssh-ed25519 AAAA... you@host'"
```

## Étape 2 — Déployer l'application

Automatique : un `git push` sur `main` déclenche le workflow CI puis le
workflow **Deploy**, qui build/push l'image vers GHCR et lance `deploy.yml`.

Manuel (équivalent) :

```sh
cd ansible
GHCR_USER=<github_user> GHCR_PAT=<token> \
VPS_HOST=1.2.3.4 VPS_USER=deploy \
ANSIBLE_PRIVATE_KEY_FILE=~/.ssh/vps_deploy_key \
ansible-playbook -i inventory.ini deploy.yml -e "image_tag=latest"
```

## Étape 3 — Déployer le monitoring

Le workflow **Deploy** déploie désormais la stack de monitoring automatiquement
après l'application (étape « Run Ansible monitoring playbook »). Cette étape
s'exécute **toujours** : le playbook vérifie en pré-tâche que
`GRAFANA_ADMIN_PASSWORD` est défini et **fait échouer tout le déploiement** si le
secret est absent ou vide (il n'est pas simplement ignoré). Le secret est déjà
poussé via `make secrets`.

Pour la déployer manuellement (ex. en local, modèle B) :

```sh
cd ansible
GRAFANA_ADMIN_PASSWORD='un-mot-de-passe-fort' \
VPS_HOST=1.2.3.4 VPS_USER=deploy \
ANSIBLE_PRIVATE_KEY_FILE=~/.ssh/vps_deploy_key \
ansible-playbook -i inventory.ini monitoring.yml
```

Le playbook vérifie automatiquement, en fin de run, que Prometheus est prêt et
que **toutes ses cibles sont `up`** (il échoue sinon).

## Accéder à Grafana (tunnel SSH)

```sh
ssh -L 3001:127.0.0.1:3001 deploy@<VPS_HOST>
```

Puis ouvrir <http://localhost:3001> — login `admin` / `$GRAFANA_ADMIN_PASSWORD`.

Deux dashboards sont provisionnés automatiquement :
- **Host — Node Exporter** : CPU, mémoire, disque, réseau de l'hôte.
- **Containers — cAdvisor** : CPU, mémoire, réseau par conteneur (dont
  `portfolio`).

> Besoin de dashboards plus riches ? Importer dans Grafana les IDs publics
> `1860` (Node Exporter Full) et `14282` (cAdvisor), en choisissant la source
> de données *Prometheus*.

## Vérification de bout en bout (checklist)

1. `curl http://<VPS_HOST>:3000` → l'application répond.
2. Tunnel Prometheus : `ssh -L 9090:127.0.0.1:9090 deploy@<VPS_HOST>` puis
   <http://localhost:9090/targets> → `prometheus`, `node-exporter` et
   `cadvisor` sont **UP**.
3. Tunnel Grafana (ci-dessus) → les deux dashboards affichent des données.
4. Dans le dashboard **Containers — cAdvisor**, le conteneur `portfolio` est
   visible (sélecteur `container`).

## Dépannage

- **Cible `cadvisor` DOWN** : cAdvisor met quelques secondes à démarrer ;
  rafraîchir après ~30 s.
- **Grafana en `admin/admin`** : `GRAFANA_ADMIN_PASSWORD` n'était pas défini au
  premier démarrage. Le mot de passe initial n'est appliqué qu'à la création du
  volume `grafana-data` ; le réinitialiser via
  `docker exec -it grafana grafana-cli admin reset-admin-password '<nouveau>'`.
- **`docker_compose_v2` introuvable** : installer la collection
  `community.docker` sur le contrôleur.
