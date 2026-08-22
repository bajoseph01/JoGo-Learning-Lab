# Dividend Dash QA

Last verified: 2026-08-22

## Logic

- [x] Correct answers verified for all six content problems.
- [x] Wrong answers retain the same operation and raise the feedback ladder.
- [x] Divide → multiply → subtract → bring-down order cannot be skipped.
- [x] Combined bring-down values are correct (`33` and `16` for `736 ÷ 4`).
- [x] Final quotient and remainder summaries match the generated route.

Evidence: `npm test` — 10/10 repository tests passed, including six Dividend Dash tests.

## Interaction

- [x] Pointer/touch gate selection advances one mathematical step.
- [x] Keyboard Left/Right and Enter advance one mathematical step.
- [x] Pause/resume gates input state.
- [x] Restart and Next Route create clean state.
- [x] Rapid state changes do not duplicate saved progress.

Evidence: `qa/browser-qa.mjs` and screenshots `02` through `08` in `quality/gauntlet/evidence/`.

## DEV MODE

- [x] Home, first play, bring-down, mistake, pit stop, and results are directly accessible.
- [x] A storage sentinel remains byte-for-byte unchanged across DEV state jumps.
- [x] DEV banner clearly separates test state from learner state.

## Educational geometry

- [x] Every dividend digit has one deterministic x-coordinate.
- [x] Equal place-value spacing remains 48 SVG units.
- [x] Quotient digits anchor above the dividend digit completing that working number.
- [x] The division bracket remains before the first dividend digit.
- [x] Quotient slots retain at least 12 SVG units of clearance above the division bar.
- [x] Rendered dividend glyphs retain at least 8 SVG units of clearance below the division bar.
- [x] Divide shows its unknown only in the quotient slot; later operation rows appear only when active or completed.
- [x] All six problems pass `validateTableauGeometry()`.

See `qa/GEOMETRY_TEST.md`.

## Visual and iPad

- [x] Authoritative JoGo palette, mascot, robot, rounded controls, and local DM Sans font render.
- [x] Home primary action is visible at 1024×768 landscape.
- [x] Active play, feedback, controls, footer, and results fit at 1024×768 with no horizontal or vertical page overflow.
- [x] 820×1180 portrait has no horizontal overflow and keeps gates and Lock Route reachable.
- [x] Route-strength indicators render as three circles, not collapsed spans.
- [x] Tight tableau captures confirm readable numbers, visible answer slots, dark active unknowns, and correct bring-down focus.
- [x] No console errors, page errors, failed requests, or HTTP error responses.

Evidence: `02a-tableau-legibility-closeup.png` and `06a-bring-down-tableau-closeup.png` in `quality/gauntlet/evidence/`.

## Play-through and transfer

- [x] Correct pointer path completed.
- [x] Correct keyboard path completed.
- [x] Wrong-answer repair path completed.
- [x] Bring-down state inspected.
- [x] Pit stop and results inspected.
- [x] Results report operation evidence, not only points.
- [x] Removing rewards and racing art still leaves a complete long-division construction task.

## Build

- [x] `npm run check:registry`
- [x] `npm run build`
- [x] Game copied into `dist/games/dividend-dash/` by Vite.

## Remaining limitation

Automated emulation covered the exact 1024×768 landscape geometry and an 820×1180 portrait viewport in Chromium/Edge. A physical Safari/iPad touch pass has not been performed, so that remains a low release risk before public publication.
