# DevAI

**AI-powered code quality gate — SaaS web app + local CLI agent.**

## Architecture

| Component | Tech | Directory |
|-----------|------|-----------|
| Web App | Next.js 16 | `web/` |
| CLI Agent | Go + Cobra | `cli/` |

### CLI Agent
A lightweight Go binary that hooks into `git pre-commit` and:
- Captures staged diffs
- Scans dependencies against the [OSV](https://osv.dev/) vulnerability database
- Runs smart code review using a small local AI model via [Ollama](https://ollama.com/)

### Web App
A SaaS dashboard that connects to your GitHub account for collaborative code quality management.

## Getting Started

```bash
# Web app
cd web && npm install && npm run dev

# CLI agent
cd cli && go build -o devai . && ./devai scan
```

## License

MIT