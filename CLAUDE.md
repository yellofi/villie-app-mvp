# villie-app-mvp

## Development Environment / 개발 환경
- **Shell**: Ubuntu (WSL) — do not use PowerShell/CMD
- **Node.js**: pnpm workspaces (monorepo)
- **Path**: WSL sees Windows path as `/mnt/d/yshwang/workplace/villie-app`

## Temporary & Test Scripts / 임시 스크립트 규칙
- One-off scripts, test files, and scratch work go in `~/tmp/` (WSL: `/home/yshwang/tmp/`)
- Never leave test scripts in the project root
- Create the directory if needed: `mkdir -p ~/tmp`

## Claude Code Tool Behavior / Claude Code 도구 동작 주의
- The built-in **Bash tool connects to Git Bash (Windows), NOT WSL**
- `~` resolves to `C:\Users\user` (Windows home), not the WSL home
- WSL home is `/root` or `/home/<user>` — only accessible from inside WSL
- `~/.hermes/`, `hermes` CLI, and the project venv are all in WSL
- **Fix**: Use `wsl bash -c '...'` in Bash tool to run WSL commands — e.g. `wsl bash -c 'ls ~/.hermes/'`
- This works from Claude Desktop app on Windows without any extra configuration
- Windows paths in WSL: `C:\Users\user\...` → `/mnt/c/Users/user/...`