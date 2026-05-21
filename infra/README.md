# Infrastructure

This folder will eventually hold:

- `docker-compose.dev.yml`     — local dev stack (postgres + redis + minio + keycloak + api). **Present.**
- `docker/postgres/init/`      — first-run SQL bootstrapping Postgres extensions. **Present.**
- `docker/keycloak/`           — Keycloak realm export (NHPMBR roles, clients, users). **Present.**
- `terraform/`                 — Terraform modules for cloud + sovereign-cloud deployments. **Phase 0 deliverable.**
- `ansible/`                   — district edge-node provisioning playbooks. **Phase 3.**
- `k8s/`                       — Helm charts + ArgoCD app manifests. **Phase 1.**

## Local stack quick reference

Started by `make up` from the repo root.

| Service   | URL                              | Notes                                    |
|-----------|----------------------------------|------------------------------------------|
| API       | http://localhost:8000            | Swagger at `/docs`                       |
| Web       | http://localhost:3000            | `pnpm -C apps/web dev` (runs on host)    |
| Keycloak  | http://localhost:8080            | admin / admin · realm `nhpmbr` imported  |
| Postgres  | localhost:5432                   | user `nhpmbr` · db `nhpmbr`              |
| Redis     | localhost:6379                   |                                          |
| MinIO     | http://localhost:9001 (console)  | nhpmbr_minio / nhpmbr_minio_dev_password_change_me |
