import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRoute,
  commitSelection,
  completeThrough,
  createGameState,
  currentStep,
  getTableauGeometry,
  learningSummary,
  selectLane,
  validateTableauGeometry,
} from "../public/games/dividend-dash/src/engine.js";

test("736 ÷ 4 builds the complete long-division sequence", () => {
  const route = buildRoute({ id: "test", dividend: 736, divisor: 4 });
  assert.equal(route.quotient, 184);
  assert.equal(route.remainder, 0);
  assert.deepEqual(
    route.steps.map(({ kind, answer }) => [kind, answer]),
    [
      ["divide", 1],
      ["multiply", 4],
      ["subtract", 3],
      ["bring-down", 33],
      ["divide", 8],
      ["multiply", 32],
      ["subtract", 1],
      ["bring-down", 16],
      ["divide", 4],
      ["multiply", 16],
      ["subtract", 0],
    ],
  );
});

test("a small leading digit anchors the first quotient over the correct dividend digit", () => {
  const state = createGameState({ id: "leading", dividend: 432, divisor: 6 });
  assert.equal(state.route.quotient, 72);
  assert.equal(state.route.cycles[0].digitIndex, 1);
  assert.deepEqual(validateTableauGeometry(state), []);
});

test("every step has one and only one correct gate", () => {
  const route = buildRoute({ id: "options", dividend: 852, divisor: 3 });
  for (const step of route.steps) {
    assert.equal(step.options.length, 3);
    assert.equal(step.options.filter((option) => option === step.answer).length, 1);
    assert.equal(step.options[step.correctLane], step.answer);
  }
});

test("a misconception keeps the same operation active and raises a teaching clue", () => {
  let state = createGameState({ id: "repair", dividend: 736, divisor: 4 });
  const step = currentStep(state);
  state = selectLane(state, (step.correctLane + 1) % 3);
  const outcome = commitSelection(state);
  assert.equal(outcome.result, "mistake");
  assert.equal(outcome.state.stepIndex, 0);
  assert.equal(outcome.state.integrity, 2);
  assert.match(outcome.state.feedback.text, /current working number|groups/i);
});

test("the route cannot skip operations and completes with learning evidence", () => {
  let state = createGameState({ id: "complete", dividend: 984, divisor: 8 });
  state = completeThrough(state, state.route.steps.length);
  const summary = learningSummary(state);
  assert.equal(state.phase, "results");
  assert.equal(state.completed.length, state.route.steps.length);
  assert.equal(summary.quotient, 123);
  assert.equal(summary.accuracy, 100);
  assert.equal(summary.mistakes, 0);
});

test("tableau geometry is deterministic for every content problem", () => {
  const problems = [
    [736, 4],
    [852, 3],
    [945, 5],
    [672, 6],
    [984, 8],
    [864, 9],
  ];
  for (const [dividend, divisor] of problems) {
    const state = createGameState({ id: `${dividend}-${divisor}`, dividend, divisor });
    assert.deepEqual(validateTableauGeometry(state), []);
    const geometry = getTableauGeometry(state);
    assert.ok(geometry.quotientSlotY + geometry.quotientSlotHeight <= geometry.bracketTopY - 12);
    assert.ok(geometry.dividendY - geometry.bracketTopY >= 40);
  }
});
