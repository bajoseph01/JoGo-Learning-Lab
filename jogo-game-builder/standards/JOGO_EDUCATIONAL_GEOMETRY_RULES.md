# Jo⚡Go Educational Geometry Rules

## Why this exists

When a visual encodes academic information, geometry is part of the curriculum.

A mathematically correct answer engine with an ambiguous diagram is a broken game.

## Universal invariants

- N equal spaces require N+1 marks/boundaries.
- Labelled endpoint values must attach to the actual endpoint marks.
- Decorative housings may extend past the usable scale; the measuring band may not imply extra intervals.
- Target indicators must land exactly on the intended location.
- Visual spacing must match numerical spacing unless a non-linear scale is explicitly taught.
- Units must be visible wherever ambiguity is possible.
- Pointer/needle/marker contrast must remain high against every background it crosses.
- Hit targets may be larger than visible marks, but invisible targets must remain centred on the correct geometry.

## Rulers / number lines

- endpoints and labels align;
- ticks are evenly spaced for equal numeric intervals;
- major/minor ticks have consistent hierarchy;
- no decorative line resembles a tick;
- target snap points equal valid tick positions.

## Dials

- start/end angle corresponds to labelled min/max;
- number of tick gaps equals configured spaces;
- endpoint ticks sit at the usable arc ends;
- needle angle is derived from the same geometry as ticks;
- needle remains visible against both face and background.

## Measuring cylinders

- scale ticks do not collide visually with vessel walls;
- liquid plane is distinct from glass;
- scale labels align to corresponding heights;
- target water level uses the same coordinate transform as scale ticks;
- vessel rim/base do not imply extra measurement marks.

## Clocks

- 12/3/6/9 anchors are exact;
- hands rotate from a shared centre;
- minute/hour hand lengths are visually distinct;
- displayed digital value must match hand geometry.

## Fractions

- equal parts must actually be equal;
- shading cannot cross partition boundaries accidentally;
- numerator count matches shaded/selected parts;
- denominator matches total equal parts.

## QA requirement

For every procedural educational visual, write a small invariant test or deterministic QA mode that can render representative edge cases.
