# GitHub Actions Workflows

Two workflows power the CI/CD pipeline for this Next.js 14 portfolio.

## Workflows

| File | Trigger | Purpose |
|------|---------|---------|
| `ci.yml` | PR to main, push to main | Lint, type-check, Next.js build, Docker build verification (parallel jobs) |
| `deploy.yml` | CI passes on main, manual dispatch | Build + push Docker image to GHCR, then run Ansible playbook to pull and swap the container on the VPS |

---

## Required GitHub repository secrets

Configure these under **Settings > Secrets and variables > Actions**.

### Sanity (build-time — unchanged from before)

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID (sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | Your Sanity dataset name (e.g. `production`) |

No Sanity API token is required — the client uses unauthenticated CDN reads.

### VPS deployment (Ansible — replaces the old SSH_* secrets)

| Secret | Required | New? | Description |
|--------|----------|------|-------------|
| `VPS_HOST` | Yes | **new** (replaces `SSH_HOST`) | IP address or hostname of the VPS |
| `VPS_USER` | Yes | **new** (replaces `SSH_USER`) | SSH login user (e.g. `ubuntu`) |
| `VPS_SSH_KEY` | Yes | **new** (replaces `SSH_KEY`) | Full SSH private key PEM block (including `-----BEGIN` / `-----END` lines) |
| `VPS_PORT` | No | **new** (replaces `SSH_PORT`) | SSH port — defaults to `22` when omitted |
| `GHCR_PAT` | Yes | carried over | GitHub PAT with `read:packages` scope; used by Ansible on the VPS to pull the image from ghcr.io |

### Code quality (SonarCloud)

| Secret | Description |
|--------|-------------|
| `SONAR_TOKEN` | SonarCloud analysis token — generate at sonarcloud.io > My Account > Security |

> **Migration note**: the old secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY`, and `SSH_PORT` are no longer read by any workflow.  You can delete them from the repository settings once the new secrets are in place and a deploy has been verified.

### Notes on GHCR_PAT

`GITHUB_TOKEN` is used by the Actions runner to *push* the image.  The VPS needs a separate credential to *pull* it at deploy time.  Create a classic PAT (or fine-grained token scoped to this repository) with `read:packages`, store it in `GHCR_PAT`.

---

## VPS prerequisites

The VPS must be set up manually once before the first deploy:

1. Install Docker (`curl -fsSL https://get.docker.com | sh`).
2. Create `/opt/portfolio/.env` with the runtime environment variables:

   ```dotenv
   NEXT_PUBLIC_SANITY_PROJECT_ID=<value>
   NEXT_PUBLIC_SANITY_DATASET=<value>
   ```

   Copy from your laptop: `scp .env.production <user>@<host>:/opt/portfolio/.env`
3. Ensure the SSH user can run Docker (e.g. is in the `docker` group).

---

## SHA flow — how the image tag travels end-to-end

```
PR opened
  └─ ci.yml runs (lint / typecheck / build / docker-build)

Merge to main
  └─ ci.yml runs again on the merge commit
       └─ on success → triggers deploy.yml (workflow_run gate)

deploy.yml:
  1. Checkout  →  git rev-parse --short HEAD  →  steps.sha.outputs.short  (e.g. "a1b2c3d")
  2. docker/build-push-action  →  pushes ghcr.io/linhnhatnguyenepita/portfolio:a1b2c3d  +  :latest
  3. ansible-playbook … -e image_tag=a1b2c3d
       └─ docker pull ghcr.io/…/portfolio:a1b2c3d  →  container swap
```

The exact same SHA that was built and pushed is the one Ansible tells Docker to pull.

---

## Manual deploy from your laptop

```bash
export VPS_HOST=203.0.113.10
export VPS_USER=ubuntu
export GHCR_USER=linhnhatnguyenepita
export GHCR_PAT=<your-pat-with-read:packages>

ansible-galaxy collection install community.docker
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e image_tag=a1b2c3d
```

Never commit IP addresses or usernames to `inventory.ini` — it uses `lookup('env', …)`.

---

## Security scanning

`security.yml` runs four independent jobs in parallel on every PR, every push to `main`, every Monday at 06:00 UTC, and on manual dispatch.

| Job | Tool | What it checks |
|-----|------|----------------|
| `codeql` | GitHub CodeQL | Static analysis — JS/TS logic flaws, injection vectors |
| `trivy-fs` | Trivy (filesystem) | Vulnerable npm packages, exposed secrets in files, IaC misconfigurations |
| `trivy-image` | Trivy (image) | OS + app vulnerabilities in the built Docker image |
| `gitleaks` | Gitleaks | Secrets leaked anywhere in the full Git history |
| `npm-audit` | npm audit | High/critical CVEs in the dependency tree (report-only, non-blocking) |

**Viewing results:**  
CodeQL and both Trivy jobs upload SARIF files. Findings appear under **Security > Code scanning alerts** in the GitHub repository. Gitleaks and npm-audit findings appear in the workflow run logs and step summary.

**Gitleaks free-tier note:**  
`GITLEAKS_LICENSE` is not set. Gitleaks Action v2 works without a license for personal repos and organisations with 25 or fewer members — you may see a warning like `WARNING: a license is required for commercial use` in the job log. This is cosmetic; the scan still runs and detects secrets.

**Trivy image exit-code note:**  
`exit-code` is set to `0` for the image scan so vulnerabilities do not block PRs yet. Once you have reviewed the baseline findings and remediated or accepted them, change `exit-code: 0` to `exit-code: 1` in `security.yml` to enforce a hard gate.

---

## Code quality (SonarCloud)

`sonarcloud.yml` runs on every PR and every push to `main` (plus manual dispatch).

It performs a full SonarCloud analysis driven by `sonar-project.properties` at the repo root, covering the `app/`, `utils/`, and `proxy.js` source paths.

**Dashboard:**  
[https://sonarcloud.io/project/overview?id=linhnhatnguyenepita_portfolio](https://sonarcloud.io/project/overview?id=linhnhatnguyenepita_portfolio)

On pull requests, SonarCloud decorates the PR with a quality gate summary (pass/fail, new issues, coverage delta).

**Required secret:**

| Secret | Where to add | Description |
|--------|-------------|-------------|
| `SONAR_TOKEN` | Settings > Secrets and variables > Actions | SonarCloud analysis token — generate at sonarcloud.io > Account > Security |

**Coverage note:**  
`sonar-project.properties` points `sonar.javascript.lcov.reportPaths` at `coverage/lcov.info`. This project does not yet have a test suite, so coverage will show as 0 % until tests are added. The quality gate will still run code smell and bug detection without coverage data.
