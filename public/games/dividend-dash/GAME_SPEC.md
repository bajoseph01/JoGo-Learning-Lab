# Dividend Dash Game Spec

## Status

`CORE LOOP LOCKED`

## Learning objective

Grade 4-6 learners use the long-division sequence accurately: divide, multiply, subtract, bring down, and repeat.

## Prerequisite knowledge

- multiplication facts to 10 × 10;
- subtraction with regrouping where needed;
- place value in three-digit numbers.

## Core repeated thinking

> Read the current working number → divide → multiply → subtract → combine the remainder with the next digit → repeat.

## Three-layer map

- **Game fantasy:** Build a safe high-speed route for Mr Jo by choosing the number-gate that makes the next section of the division track valid.
- **Game system:** Each gate becomes a permanent piece of the route and the visible long-division tableau; an inconsistent value breaks the route and must be repaired.
- **Academic system:** The long-division algorithm determines which gate fits, where each quotient digit is placed, and which working number becomes available next.

## Knowledge → action connection

The learner steers to a value and locks it into the current operation. That value is rendered into the division tableau. Correct understanding extends the route and opens the next operation; a misconception creates a specific mathematical mismatch and a guided retry.

## Core loop

1. Read the highlighted current working number and operation.
2. Choose a lane and lock its number-gate.
3. Watch that value enter the long-division tableau.
4. Use the mathematical feedback to continue or repair the same step.

## Player actions

- tap a gate, or steer with Left/Right or A/D;
- lock a route with the on-screen button, Enter, or Space;
- pause, resume, mute, restart, and choose a processing pace.

## Win condition

Complete every operation in one long-division problem and construct a correct quotient and working tableau.

## Loss/recovery condition

Three unresolved route breaks trigger a calm pit-stop screen. The learner may restart immediately. Every ordinary mistake keeps the same item active and provides a progressive clue.

## Feedback ladder

1. Name the operation and show which relationship needs checking.
2. Highlight the relevant working number, divisor, quotient digit, or product.
3. Provide a partial equation, then require the learner to finish the original step.

## Difficulty progression

- Calm pace with the operation rail and full prompts.
- Steady pace with the same structure and less waiting time.
- Dash pace after accuracy is established.
- Future levels may fade operation labels, add remainders, or use two-digit divisors; these are non-goals for this proof.

## Evidence of learning

- first-attempt accuracy by operation;
- completed quotient and tableau;
- error count and feedback level by step;
- ability to finish without bypassing a step.

## Misconception checks

- dividing the full dividend instead of the current working number;
- multiplying by the wrong quotient digit;
- subtracting in the wrong direction;
- bringing down only the digit instead of forming the next working number.

## Transfer target

After playing, learners should be better able to set out and complete the same long-division sequence on paper.

## Removal Test

**PASS.** Remove score, lives, speed, mascot, animation, sound, rewards, and racing art: the learner still constructs a long-division tableau by selecting and applying each mathematically valid operation result in sequence.

## Learning-game score

- Knowledge drives gameplay: 4/4
- Retrieval required: 4/4
- Feedback teaches: 3/3
- Meaningful variation: 2/3
- Difficulty grows with mastery: 2/3
- Mastery creates capability: 3/3
- **Total: 18/20**

## Prototype scope

One complete three-digit ÷ one-digit route per race, three pace settings, structured repair feedback, results evidence, DEV state jumps, and deterministic logic/geometry tests.

## Non-goals

- learner accounts or cloud analytics;
- large content banks;
- live asset generation;
- two-digit divisors;
- public catalogue publication before Mr Jo approval.

## Acceptance checks

- The learner cannot skip an operation.
- The selected value appears in the mathematical work, not only in the score.
- Bring-down steps require the combined next working number.
- DEV mode opens home, active play, mistake, pit stop, and results directly without saving.
- Keyboard and Pointer Events complete the loop.
- No critical overlap or clipping at 1024×768 landscape.
- Static Vite build includes the full game.
