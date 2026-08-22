# JoGo Learning Lab Agent Rules

## Mandatory game-builder workflow

For every new JoGo game, rebuild, substantial mechanic change, or release-polish pass:

1. Read `.agents/skills/jogo-game-builder/SKILL.md` completely.
2. Read `jogo-game-builder/CODEX_START_HERE.md` and every file in `jogo-game-builder/standards/`.
3. Start from `jogo-game-builder/templates/game-starter/` unless the existing game already has an equivalent maintainable structure.
4. Complete the game's `GAME_SPEC.md`, including the Removal Test and `/20` learning-game score, before substantial implementation.
5. Do not proceed below 14/20 or after a failed Removal Test unless Mr Jo explicitly accepts the recorded exception.
6. Record `CORE LOOP LOCKED` before premium visual polish.
7. Treat the two files in `jogo-game-builder/assets/authoritative/` as the default JoGo brand and character source of truth unless Mr Jo approves a game-specific visual board.
8. Keep DEV MODE available from the start. DEV sessions must never write learner progress.
9. Treat educational diagrams and mathematical layouts as functional code and add deterministic invariant checks.
10. Run logic, interaction, educational-geometry, visual, 1024×768 iPad, play-through, and transfer QA before publishing.

## Repository safety

- Preserve existing catalogue entries and game folders unless the requested work explicitly targets them.
- New test games remain `public: false` until their QA evidence is complete and Mr Jo approves publication.
- Keep browser games static-host compatible, touch-first, keyboard accessible, and free of browser-side secrets.
- Store generated media as local development-time assets; do not add paid runtime generation by default.
- Run `npm test`, `npm run check:registry`, and `npm run build` before committing a repository change.
