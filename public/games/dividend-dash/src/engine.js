const OPERATION_CODES = {
  divide: "D",
  multiply: "M",
  subtract: "S",
  "bring-down": "B",
};

function unique(values) {
  return [...new Set(values.filter((value) => Number.isFinite(value) && value >= 0))];
}

function chooseDistractors(step) {
  const { kind, answer, divisor, quotientDigit, partial, product, remainder, nextDigit } = step;
  if (kind === "divide") {
    return unique([answer - 1, answer + 1, Math.ceil(partial / divisor), divisor]);
  }
  if (kind === "multiply") {
    return unique([
      Math.max(0, (quotientDigit - 1) * divisor),
      (quotientDigit + 1) * divisor,
      quotientDigit + divisor,
      product + 1,
    ]);
  }
  if (kind === "subtract") {
    return unique([answer + 1, Math.max(0, answer - 1), product - partial, partial + product]);
  }
  return unique([
    nextDigit,
    Number(`${nextDigit}${remainder}`),
    remainder * 10,
    remainder + nextDigit,
  ]);
}

function makeOptions(step, seed) {
  const distractors = chooseDistractors(step).filter((value) => value !== step.answer);
  while (distractors.length < 2) distractors.push(step.answer + distractors.length + 1);
  const correctLane = seed % 3;
  const options = distractors.slice(0, 2);
  options.splice(correctLane, 0, step.answer);
  return { options, correctLane };
}

function feedbackFor(step, attempt) {
  const stage = Math.min(attempt, 3);
  if (step.kind === "divide") {
    return [
      `Check how many groups of ${step.divisor} fit into ${step.partial}.`,
      `Use the current working number ${step.partial}, not the whole dividend.`,
      `${step.divisor} × __ must be the largest product that does not pass ${step.partial}.`,
    ][stage - 1];
  }
  if (step.kind === "multiply") {
    return [
      `Multiply the quotient digit ${step.quotientDigit} by ${step.divisor}.`,
      `Keep the same quotient digit: ${step.quotientDigit} × ${step.divisor}.`,
      `${step.quotientDigit} groups of ${step.divisor} make __.`,
    ][stage - 1];
  }
  if (step.kind === "subtract") {
    return [
      `Subtract the product ${step.product} from ${step.partial}.`,
      `The remainder must be smaller than the divisor ${step.divisor}.`,
      `${step.partial} − ${step.product} = __.`,
    ][stage - 1];
  }
  return [
    `Join remainder ${step.remainder} to the next digit ${step.nextDigit}.`,
    `Bring ${step.nextDigit} down beside ${step.remainder}; do not choose only ${step.nextDigit}.`,
    `${step.remainder} tens and ${step.nextDigit} ones make __.`,
  ][stage - 1];
}

export function buildRoute(problem) {
  const { dividend, divisor } = problem;
  if (!Number.isInteger(dividend) || dividend < 10 || !Number.isInteger(divisor) || divisor < 1) {
    throw new Error("Dividend Dash requires a positive multi-digit dividend and divisor.");
  }

  const digits = String(dividend).split("").map(Number);
  const steps = [];
  const cycles = [];
  let remainder = 0;
  let started = false;
  let quotient = "";

  digits.forEach((digit, digitIndex) => {
    const partial = remainder * 10 + digit;
    if (!started && partial < divisor && digitIndex < digits.length - 1) {
      remainder = partial;
      return;
    }

    started = true;
    const cycleIndex = cycles.length;
    const quotientDigit = Math.floor(partial / divisor);
    const product = quotientDigit * divisor;
    remainder = partial - product;
    quotient += quotientDigit;
    const base = {
      cycleIndex,
      digitIndex,
      divisor,
      partial,
      quotientDigit,
      product,
      remainder,
    };

    cycles.push(base);
    steps.push({
      ...base,
      kind: "divide",
      label: "Divide",
      prompt: `How many ${divisor}s fit into ${partial}?`,
      answer: quotientDigit,
      success: `${partial} ÷ ${divisor} gives quotient digit ${quotientDigit}.`,
    });
    steps.push({
      ...base,
      kind: "multiply",
      label: "Multiply",
      prompt: `${quotientDigit} × ${divisor} = ?`,
      answer: product,
      success: `${quotientDigit} × ${divisor} = ${product}. Place ${product} under ${partial}.`,
    });
    steps.push({
      ...base,
      kind: "subtract",
      label: "Subtract",
      prompt: `${partial} − ${product} = ?`,
      answer: remainder,
      success: `${partial} − ${product} = ${remainder}. The remainder is smaller than ${divisor}.`,
    });

    if (digitIndex < digits.length - 1) {
      const nextDigit = digits[digitIndex + 1];
      const nextWorking = remainder * 10 + nextDigit;
      steps.push({
        ...base,
        kind: "bring-down",
        label: "Bring down",
        nextDigit,
        answer: nextWorking,
        success: `Bring down ${nextDigit}: ${remainder} becomes the next working number ${nextWorking}.`,
        prompt: `Bring down ${nextDigit}. What is the next working number?`,
      });
    }
  });

  const seededSteps = steps.map((step, index) => {
    const selection = makeOptions(step, dividend + divisor + index);
    return { ...step, ...selection, code: OPERATION_CODES[step.kind] };
  });

  return {
    problem: { ...problem },
    digits,
    cycles,
    steps: seededSteps,
    quotient: Number(quotient),
    remainder,
  };
}

export function createGameState(problem, { dev = false, pace = "steady" } = {}) {
  const route = buildRoute(problem);
  return {
    dev,
    pace,
    route,
    stepIndex: 0,
    selectedLane: null,
    completed: [],
    attemptsByStep: {},
    firstTryCorrect: 0,
    mistakes: 0,
    integrity: 3,
    score: 0,
    phase: "play",
    feedback: null,
  };
}

export function currentStep(state) {
  return state.route.steps[state.stepIndex] || null;
}

export function selectLane(state, lane) {
  if (state.phase !== "play" || !Number.isInteger(lane) || lane < 0 || lane > 2) return state;
  return { ...state, selectedLane: lane };
}

export function commitSelection(state) {
  const step = currentStep(state);
  if (!step || state.phase !== "play") return { state, result: "ignored" };
  if (state.selectedLane === null) {
    return {
      state: { ...state, feedback: { type: "notice", text: "Choose a number-gate first." } },
      result: "no-selection",
    };
  }

  const chosen = step.options[state.selectedLane];
  const previousAttempts = state.attemptsByStep[state.stepIndex] || 0;
  const attemptsByStep = { ...state.attemptsByStep, [state.stepIndex]: previousAttempts + 1 };
  if (chosen !== step.answer) {
    const integrity = state.integrity - 1;
    return {
      state: {
        ...state,
        attemptsByStep,
        selectedLane: null,
        mistakes: state.mistakes + 1,
        integrity,
        phase: integrity <= 0 ? "pit-stop" : "play",
        feedback: {
          type: "mistake",
          text: feedbackFor(step, previousAttempts + 1),
          chosen,
        },
      },
      result: integrity <= 0 ? "pit-stop" : "mistake",
    };
  }

  const nextIndex = state.stepIndex + 1;
  const finished = nextIndex >= state.route.steps.length;
  const firstTry = previousAttempts === 0;
  return {
    state: {
      ...state,
      attemptsByStep,
      completed: [...state.completed, { ...step, chosen }],
      stepIndex: nextIndex,
      selectedLane: null,
      firstTryCorrect: state.firstTryCorrect + (firstTry ? 1 : 0),
      score: state.score + 100 + (firstTry ? 50 : 0),
      phase: finished ? "results" : "play",
      feedback: { type: "success", text: step.success, chosen },
    },
    result: finished ? "complete" : "correct",
  };
}

export function completeThrough(state, targetIndex) {
  let next = state;
  const finalTarget = Math.min(targetIndex, next.route.steps.length);
  while (next.stepIndex < finalTarget) {
    const step = currentStep(next);
    next = selectLane(next, step.correctLane);
    next = commitSelection(next).state;
  }
  return next;
}

export function getTableauGeometry(state) {
  const digitStartX = 132;
  const digitGap = 48;
  return {
    width: 380,
    height: 320,
    divisorX: 58,
    bracketX: 96,
    bracketTopY: 65,
    dividendY: 112,
    quotientY: 39,
    quotientSlotY: 9,
    quotientSlotWidth: 40,
    quotientSlotHeight: 40,
    digitXs: state.route.digits.map((_, index) => digitStartX + index * digitGap),
    cycleRows: state.route.cycles.map((_, index) => 158 + index * 52),
  };
}

export function validateTableauGeometry(state) {
  const geometry = getTableauGeometry(state);
  const errors = [];
  if (geometry.digitXs.length !== state.route.digits.length) errors.push("Every dividend digit needs one x-position.");
  geometry.digitXs.forEach((x, index) => {
    if (index > 0 && x - geometry.digitXs[index - 1] !== 48) errors.push("Dividend digit spacing must remain equal.");
  });
  state.route.cycles.forEach((cycle, index) => {
    if (geometry.digitXs[cycle.digitIndex] === undefined) errors.push(`Cycle ${index} quotient has no dividend anchor.`);
  });
  if (!(geometry.bracketX < geometry.digitXs[0])) errors.push("Division bracket must sit before dividend digits.");
  if (geometry.quotientSlotY + geometry.quotientSlotHeight > geometry.bracketTopY - 12) errors.push("Quotient slots must not crowd the division bar.");
  if (geometry.dividendY - geometry.bracketTopY < 40) errors.push("Dividend digits must remain clearly below the division bar.");
  return errors;
}

export function learningSummary(state) {
  const total = state.route.steps.length;
  const accuracy = total ? Math.round((state.firstTryCorrect / total) * 100) : 0;
  const weakKinds = Object.entries(state.attemptsByStep)
    .filter(([, count]) => count > 1)
    .map(([index]) => state.route.steps[Number(index)].label);
  return {
    accuracy,
    totalSteps: total,
    mistakes: state.mistakes,
    weakKinds: [...new Set(weakKinds)],
    quotient: state.route.quotient,
    remainder: state.route.remainder,
  };
}
