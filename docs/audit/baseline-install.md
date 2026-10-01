# Baseline: dependency restore (prerequisite for audit agents)

- Repo: /home/deploymodeio/proyectos/filosofuss
- Branch: nivel-dios
- Date: 2026-09-30
- Node: v22.20.0
- npm: 10.9.3

## Install
- Method: `npm ci` (lockfile clean, no drift) — exit code 0
- Output tail: "added 232 packages, and audited 233 packages in 2s"
- Peer-dependency / deprecation warnings: none
- Audit summary: 11 vulnerabilities (4 moderate, 7 high); 37 packages looking for funding

## Artifacts
- node_modules size: 146M
- `npm ls --all 2>/dev/null | wc -l`: 422

## Toolchain
- `npx vite --version` -> vite/5.4.21 linux-x64 node-v22.20.0 (exit 0)
- `npx tsc --version` -> Version 5.9.3 (exit 0)
- Full build/typecheck intentionally NOT run (deferred to audit agents)

Status: READY for code-quality and performance audit agents.
