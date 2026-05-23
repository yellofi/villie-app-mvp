# villie-app-mvp

## Development Environment / 개발 환경
- **Shell**: Ubuntu (WSL) — do not use PowerShell/CMD
- **Node.js**: pnpm workspaces (monorepo)
- **Path**: WSL sees Windows path as `/mnt/d/yshwang/workplace/villie-app`

## Key Documents / 핵심 문서
작업 전 반드시 읽을 것:
- `SPEC_INIT.md` — 기능 요구사항, 확정 스키마, Decision Log
- `TECH_STACK.md` — 기술 스택 상세
- `ROADMAP.md` — Phase 전환 계획 및 모노레포 구조

## Package Manager
- **pnpm 전용** — `npm install` / `yarn` 사용 금지
- 워크스페이스 명령: `pnpm --filter <package> <command>`

## Testing Strategy / 테스트 전략
- **TDD**: 구현 전 테스트 먼저 작성
- Unit/Component: Jest + React Native Testing Library (co-location: `*.test.tsx`)
- E2E: Maestro
- Supabase: unit → mock, integration → Supabase CLI 로컬 인스턴스 사용
- CI: GitHub Actions (`feature/*` → unit, PR→`dev` → +integration, PR→`main` → +E2E)

## Temporary & Test Scripts / 임시 스크립트 규칙
- One-off scripts, test files, and scratch work go in `~/tmp/` (WSL: `/home/yshwang/tmp/`)
- Never leave test scripts in the project root
- Create the directory if needed: `mkdir -p ~/tmp`

## Repository & Branch Strategy / 레포 및 브랜치 전략

- **GitHub**: https://github.com/yellofi/villie-app-mvp (public)
- **기본 브랜치 구조**
  ```
  main   ← 배포 가능한 상태만. force push 차단. PR은 dev 경유 필수
  dev    ← 통합 브랜치. 여기서 직접 push 가능
  │
  ├── feature/monorepo-setup
  ├── feature/auth-flow
  └── feature/care-feed   ... (기능 단위 브랜치)
  ```
- **작업 흐름**
  1. `dev`에서 `feature/*` 브랜치 분기
  2. 작업 완료 후 `feature/*` → `dev` PR
  3. `dev` 안정화 후 `dev` → `main` PR
- **커밋 컨벤션**: `feat:`, `fix:`, `chore:`, `test:`, `docs:` 프리픽스 사용
- **GitHub Actions 트리거**
  - `feature/*` push → unit test
  - PR → `dev` → unit + integration test
  - PR → `main` → unit + integration + E2E (Maestro)

## Claude Code Tool Behavior / Claude Code 도구 동작 주의
- The built-in **Bash tool connects to Git Bash (Windows), NOT WSL**
- `~` resolves to `C:\Users\user` (Windows home), not the WSL home
- WSL home is `/root` or `/home/<user>` — only accessible from inside WSL
- `~/.hermes/`, `hermes` CLI, and the project venv are all in WSL
- **Fix**: Use `wsl bash -c '...'` in Bash tool to run WSL commands — e.g. `wsl bash -c 'ls ~/.hermes/'`
- This works from Claude Desktop app on Windows without any extra configuration
- Windows paths in WSL: `C:\Users\user\...` → `/mnt/c/Users/user/...`