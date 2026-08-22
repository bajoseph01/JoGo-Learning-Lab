# Dividend Dash

A JoGo long-division route-building game and the first proof of the repository's gated game-builder workflow.

## Run

From the repository root:

```bash
npm run dev
```

Open `http://127.0.0.1:4178/games/dividend-dash/`.

## Verify

```bash
npm test
npm run check:registry
npm run build
```

Browser QA scripts live in `qa/` and evidence is recorded in `quality/gauntlet/`.

On this Codex workstation, run the shared browser gauntlet with:

```bash
cmd.exe /d /c node.exe "public/games/dividend-dash/qa/browser-qa.mjs"
```

The Vite server must already be running. The script tests `http://127.0.0.1:4178/games/dividend-dash/index.html`.

## Baseline preservation

The two supplied single-file prototypes are retained unchanged in `reference/`.
