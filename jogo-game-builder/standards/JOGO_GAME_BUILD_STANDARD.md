# Jo⚡Go Game Build Standard

## 1. Classroom delivery contract

Every learner-facing build should be designed for this scenario:

> Teacher shares one URL. Learner taps it on an iPad. The game starts.

Default constraints:

- static hosting compatible;
- Safari/iPad;
- no account;
- no install;
- touch first;
- graceful offline behaviour where practical;
- classroom session can begin within seconds.

## 2. Build stages

### Stage A — Define
Write the learning loop and success criterion.

### Stage B — Prove
Build a tiny functional prototype. Do not polish prematurely.

### Stage C — Lock
Declare `CORE LOOP LOCKED` when approved.

### Stage D — Art direct
Create and approve visual direction before premium UI coding.

### Stage E — Rebuild
Implement the approved design system with reusable components.

### Stage F — Dev enable
Provide direct state/level access.

### Stage G — QA
Test logic, interaction, geometry, visual layout, iPad rendering, full play-through and transfer.

### Stage H — Publish
Deploy static build to GitHub Pages or equivalent.

## 3. Definition of a good educational game

A Jo⚡Go game should:

- require the academic skill to progress;
- produce many retrieval decisions per minute without feeling like a test;
- provide fast, useful feedback;
- increase challenge structurally;
- invite replay;
- minimise teacher setup;
- transfer to classroom/paper performance.

## 4. Architecture default

### Early prototype
Single HTML is acceptable.

### Approved game
Prefer:

```text
index.html
styles.css
src/
  game.js
  ui.js
  dev-mode.js
  storage.js
  sound.js
data/
assets/
qa/
```

Avoid frameworks unless they solve a real complexity problem.

## 5. Stop rules

Pause implementation and resolve the issue before continuing if:

- the learning mechanic is ambiguous;
- visual direction has not been approved for a polish phase;
- generated educational geometry cannot be verified;
- the game depends on progression to QA later states;
- touch interaction is unreliable on iPad;
- a decorative choice conflicts with academic meaning.
