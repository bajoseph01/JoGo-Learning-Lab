# Dividend Dash Educational Geometry Test

## Visual

Procedural long-division tableau rendered as SVG.

## Shared coordinate model

- Canvas: 340 × 244 SVG units.
- First dividend digit x: 126.
- Place-value gap: 44 units.
- Divisor x: 58.
- Bracket x: 100.
- Quotient y: 28.
- Dividend y: 66.
- Work rows: 92, 140, 188.

`getTableauGeometry()` is the only source of these coordinates. Rendering and invariant tests use the same model.

## Invariants

- [x] One x-position exists for every dividend digit.
- [x] Equal place-value gaps are exactly 44 units.
- [x] Each quotient digit uses its cycle's dividend-digit anchor.
- [x] The division bracket precedes the dividend.
- [x] Product and remainder rows remain inside the view box.
- [x] Bring-down arrows use the next dividend digit's anchor.

## Edge cases checked

- First digit divisible by divisor: `672 ÷ 6`.
- First digit smaller than divisor: deterministic test `432 ÷ 6` anchors the first quotient over the second dividend digit.
- Zero final remainder: all current content problems.
- Largest current content product: generated and tested through the full content bank.

Verification: `tests/dividend-dash.test.mjs`.
