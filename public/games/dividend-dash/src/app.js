import { CONTENT } from "../data/content.js";
import {
  commitSelection,
  completeThrough,
  createGameState,
  currentStep,
  getTableauGeometry,
  learningSummary,
  selectLane,
} from "./game.js";
import { DEV_ACTIONS, queryRequestsDev } from "./dev-mode.js";
import { JogoSound } from "./sound.js";
import { JogoStorage } from "./storage.js";

const screen = document.getElementById("screen");
const liveStatus = document.getElementById("liveStatus");
const soundButton = document.getElementById("soundButton");
const pauseButton = document.getElementById("pauseButton");
const helpDialog = document.getElementById("helpDialog");
const devDialog = document.getElementById("devDialog");
const devActions = document.getElementById("devActions");

let state = null;
let problemIndex = 0;
let gateProgress = 0;
let animationFrame = 0;
let lastFrame = 0;
let paused = false;
let savedForRun = false;

function announce(message) {
  liveStatus.textContent = "";
  window.setTimeout(() => {
    liveStatus.textContent = message;
  }, 20);
}

function syncSound() {
  soundButton.textContent = JogoSound.enabled ? "♪" : "×";
  soundButton.setAttribute("aria-label", JogoSound.enabled ? "Mute sound" : "Enable sound");
}

function syncTopControls() {
  pauseButton.hidden = !state || !["play", "paused"].includes(state.phase);
  pauseButton.textContent = paused ? "▶" : "Ⅱ";
  pauseButton.setAttribute("aria-label", paused ? "Resume game" : "Pause game");
}

function devBanner() {
  return state?.dev ? '<div class="dev-banner">DEV SESSION · SAVING OFF</div>' : "";
}

function renderHome() {
  cancelAnimationFrame(animationFrame);
  state = null;
  paused = false;
  syncTopControls();
  const progress = JogoStorage.load();
  screen.innerHTML = `
    <section class="home-screen" data-testid="home-screen">
      <div class="home-copy">
        <span class="eyebrow">LONG DIVISION ROUTE BUILDER</span>
        <h1>Build the route.<br />Make every number fit.</h1>
        <p class="lead">Choose number-gates that construct the long-division working. Correct maths lays the next piece of track.</p>
        <div class="loop-strip" aria-label="Long division sequence">
          ${CONTENT.operationRail.map((label, index) => `${index ? '<span class="loop-arrow" aria-hidden="true">→</span>' : ""}<span class="loop-pill">${label}</span>`).join("")}
        </div>
        <fieldset class="pace-picker">
          <legend>Choose a thinking pace</legend>
          <div class="pace-options">
            ${Object.entries(CONTENT.paces).map(([id, pace]) => `
              <label class="pace-option">
                <input type="radio" name="pace" value="${id}" ${id === "steady" ? "checked" : ""} />
                <span>${pace.label}<small>${pace.seconds}s gate</small></span>
              </label>`).join("")}
          </div>
        </fieldset>
        <button class="primary-button tactile" data-action="start" type="button">⚡ Start the Dash</button>
        <p class="progress-copy">Device progress: ${progress.races} race${progress.races === 1 ? "" : "s"} · best first-try accuracy ${progress.bestAccuracy}%</p>
      </div>
      <div class="home-art" aria-label="Mr Jo skating with the JoGo robot sidekick">
        <img class="home-mrjo" src="assets/mrjo-skating.png" alt="Mr Jo skating forward" />
        <img class="home-robot" src="assets/robot-sidekick.png" alt="JoGo robot sidekick" />
        <div class="art-badge">Long division powers the track.</div>
      </div>
    </section>`;
  screen.focus({ preventScroll: true });
}

function tableauSvg() {
  const geometry = getTableauGeometry(state);
  const completed = state.completed;
  const current = currentStep(state);
  const completedByCycle = new Map();
  completed.forEach((step) => {
    const values = completedByCycle.get(step.cycleIndex) || {};
    values[step.kind] = step;
    completedByCycle.set(step.cycleIndex, values);
  });

  const quotient = state.route.cycles.map((cycle) => {
    const values = completedByCycle.get(cycle.cycleIndex) || {};
    const isComplete = Boolean(values.divide);
    const isActive = current?.kind === "divide" && current.cycleIndex === cycle.cycleIndex;
    const x = geometry.digitXs[cycle.digitIndex];
    const slotClass = isActive ? "is-active" : isComplete ? "is-complete" : "is-waiting";
    const value = isComplete ? cycle.quotientDigit : isActive ? "?" : "";
    return `
      <rect class="quotient-slot ${slotClass}" data-role="quotient-slot" x="${x - geometry.quotientSlotWidth / 2}" y="${geometry.quotientSlotY}" width="${geometry.quotientSlotWidth}" height="${geometry.quotientSlotHeight}" rx="10" />
      ${value !== "" ? `<text class="quotient-value ${isActive ? "is-active" : ""}" data-role="quotient-value" x="${x}" y="${geometry.quotientY}">${value}</text>` : ""}`;
  }).join("");

  const activeCycleDigitIndex = current?.cycleIndex !== undefined ? state.route.cycles[current.cycleIndex]?.digitIndex : -1;
  const activeDigitIndex = current?.kind === "bring-down" ? activeCycleDigitIndex + 1 : activeCycleDigitIndex;
  const dividendDigits = state.route.digits.map((digit, index) => {
    const x = geometry.digitXs[index];
    const isActive = index === activeDigitIndex;
    return `${isActive ? `<rect class="active-digit-cell" x="${x - 20}" y="${geometry.dividendY - 32}" width="40" height="43" rx="9" />` : ""}<text class="math-number dividend-digit ${isActive ? "is-active" : ""}" data-role="dividend-digit" data-index="${index}" x="${x}" y="${geometry.dividendY}">${digit}</text>`;
  }).join("");
  let visibleContentBottom = geometry.dividendY + 18;
  const rows = state.route.cycles.map((cycle, cycleIndex) => {
    const values = completedByCycle.get(cycleIndex) || {};
    const y = geometry.cycleRows[cycleIndex];
    const endX = geometry.digitXs[cycle.digitIndex];
    const hasProduct = Boolean(values.multiply);
    const hasRemainder = Boolean(values.subtract);
    const bring = values["bring-down"];
    const isCurrentCycle = current?.cycleIndex === cycleIndex;
    const isMultiply = isCurrentCycle && current.kind === "multiply";
    const isSubtract = isCurrentCycle && current.kind === "subtract";
    const isBringDown = isCurrentCycle && current.kind === "bring-down";
    let row = "";
    if (hasProduct || isMultiply) {
      visibleContentBottom = Math.max(visibleContentBottom, y + 18);
      if (isMultiply) row += `<rect class="answer-cell" x="${endX - 24}" y="${y - 31}" width="48" height="40" rx="9" />`;
      row += `<text class="math-number row-value ${isMultiply ? "is-active" : ""}" data-role="product-value" x="${endX}" y="${y}">${hasProduct ? cycle.product : "?"}</text>`;
      row += `<path class="math-line" d="M ${Math.max(106, endX - 54)} ${y + 10} L ${endX + 18} ${y + 10}" />`;
    }
    if (hasRemainder || isSubtract) {
      visibleContentBottom = Math.max(visibleContentBottom, y + 58);
      if (isSubtract) row += `<rect class="answer-cell" x="${endX - 24}" y="${y + 15}" width="48" height="40" rx="9" />`;
      row += `<text class="math-number row-value ${isSubtract ? "is-active" : ""}" data-role="remainder-value" x="${endX}" y="${y + 46}">${hasRemainder ? cycle.remainder : "?"}</text>`;
    }
    if (bring || isBringDown) {
      visibleContentBottom = Math.max(visibleContentBottom, y + 58);
      const nextX = geometry.digitXs[cycle.digitIndex + 1];
      row += `<path class="bring-arrow" d="M ${nextX} ${geometry.dividendY + 13} Q ${nextX + 20} ${y + 18} ${nextX} ${y + 46}" />`;
      if (isBringDown) row += `<rect class="answer-cell" x="${nextX - 27}" y="${y + 15}" width="54" height="40" rx="9" />`;
      row += `<text class="math-number row-value ${isBringDown ? "is-active" : ""}" data-role="bring-value" x="${nextX}" y="${y + 46}">${bring ? bring.answer : "?"}</text>`;
    }
    return row;
  }).join("");
  const visibleHeight = Math.min(geometry.height, Math.max(190, visibleContentBottom + 16));

  return `
    <svg class="tableau" viewBox="0 0 ${geometry.width} ${visibleHeight}" role="img" aria-label="Long division working for ${state.route.problem.dividend} divided by ${state.route.problem.divisor}">
      <defs>
        <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L7,3.5 z" fill="var(--jogo-red)" /></marker>
      </defs>
      <text class="math-number divisor-value" data-role="divisor" x="${geometry.divisorX}" y="${geometry.dividendY}">${state.route.problem.divisor}</text>
      <path class="bracket" data-role="division-bracket" data-bar-y="${geometry.bracketTopY}" d="M ${geometry.bracketX} ${geometry.dividendY + 8} Q ${geometry.bracketX + 7} ${geometry.bracketTopY + 15} ${geometry.bracketX + 22} ${geometry.bracketTopY} L ${geometry.width - 24} ${geometry.bracketTopY}" />
      ${quotient}
      ${dividendDigits}
      ${rows}
    </svg>`;
}

function operationRail() {
  const step = currentStep(state);
  const currentCycle = step?.cycleIndex ?? state.route.cycles.length - 1;
  return CONTENT.operationRail.map((label, index) => {
    const kind = ["divide", "multiply", "subtract", "bring-down"][index];
    const isActive = step?.kind === kind;
    const done = state.completed.some((item) => item.cycleIndex === currentCycle && item.kind === kind);
    return `<span class="rail-step ${done ? "is-done" : ""} ${isActive ? "is-active" : ""}">${index + 1}. ${label}</span>`;
  }).join("");
}

function feedbackMarkup() {
  if (!state.feedback) {
    return '<div class="feedback"><span class="feedback-icon">i</span><span>Your choice becomes part of the written division. Make the numbers agree.</span></div>';
  }
  const className = state.feedback.type === "success" ? "is-success" : state.feedback.type === "mistake" ? "is-mistake" : "";
  const icon = state.feedback.type === "success" ? "✓" : state.feedback.type === "mistake" ? "!" : "i";
  return `<div class="feedback ${className}" data-testid="feedback"><span class="feedback-icon">${icon}</span><span>${state.feedback.text}</span></div>`;
}

function renderPlay() {
  cancelAnimationFrame(animationFrame);
  paused = false;
  state.phase = "play";
  syncTopControls();
  const step = currentStep(state);
  const racePercent = Math.round((state.stepIndex / state.route.steps.length) * 100);
  screen.innerHTML = `
    <section class="game-screen" data-testid="game-screen">
      <header class="game-header">
        <div class="prompt-block">
          <div class="step-kicker"><span class="step-code">${step.code}</span> ${step.label} · route piece ${state.stepIndex + 1} of ${state.route.steps.length}</div>
          <h1>${step.prompt}</h1>
        </div>
        <div class="hud" aria-label="Race status">
          <div class="hud-chip">Score<strong>${state.score}</strong></div>
          <div class="hud-chip">Pace<strong>${CONTENT.paces[state.pace].label}</strong></div>
          <div class="hud-chip">Route strength<strong class="integrity-dots" aria-label="${state.integrity} route strength remaining">${[0, 1, 2].map((index) => `<span class="integrity-dot ${index < state.integrity ? "is-full" : ""}"></span>`).join("")}</strong></div>
        </div>
      </header>
      <div class="game-stage">
        <section class="math-bay" aria-label="Long division workbench">
          <div class="bay-head"><span class="bay-title">Division workbench</span><span class="problem-chip">${state.route.problem.dividend} ÷ ${state.route.problem.divisor}</span></div>
          <div class="tableau-wrap">${tableauSvg()}</div>
          <div class="operation-rail" aria-label="Current operation sequence">${operationRail()}</div>
          ${feedbackMarkup()}
        </section>
        <section class="track" data-testid="track" style="--lane:${state.selectedLane ?? 1};--gate-progress:${gateProgress}%">
          <div class="gate-progress" aria-hidden="true"><span></span></div>
          <div class="decision-label">Decision line · the gate waits for your thinking</div>
          <div class="gate-row" role="group" aria-label="Number gates">
            ${step.options.map((option, lane) => `<button class="number-gate ${state.selectedLane === lane ? "is-selected" : ""}" data-action="select" data-lane="${lane}" type="button" aria-pressed="${state.selectedLane === lane}">${option}</button>`).join("")}
          </div>
          <img class="player-runner" src="assets/mrjo-skating.png" alt="" />
          <div class="track-hint">Tap a gate · or steer with ← → / A D</div>
          <button class="lock-button tactile" data-action="commit" type="button" ${state.selectedLane === null ? "disabled" : ""}>⚡ Lock Route</button>
        </section>
      </div>
      <footer class="game-footer">
        <div><div class="race-progress" aria-label="${racePercent}% of route complete"><span style="width:${racePercent}%"></span></div><div class="progress-copy">${racePercent}% of the division route built</div></div>
        <button class="secondary-button tactile" data-action="restart" type="button">Restart</button>
      </footer>
    </section>
    ${devBanner()}`;
  screen.focus({ preventScroll: true });
  announce(`${step.label}. ${step.prompt}`);
  startGateMotion();
}

function renderPitStop() {
  cancelAnimationFrame(animationFrame);
  syncTopControls();
  const step = currentStep(state);
  screen.innerHTML = `
    <section class="pit-screen" data-testid="pit-stop">
      <div class="pit-card">
        <img class="pit-avatar" src="assets/mrjo-encouraging.png" alt="Mr Jo encouraging you" />
        <span class="eyebrow">ROUTE REPAIR</span>
        <h1>Pit stop</h1>
        <p>The route broke at <strong>${step.label}</strong>. That is useful evidence: slow down and rebuild the same division from the first working number.</p>
        <button class="danger-button tactile" data-action="restart" type="button">Try the route again</button>
      </div>
    </section>${devBanner()}`;
  announce(`Pit stop. The route broke at ${step.label}.`);
}

function renderResults() {
  cancelAnimationFrame(animationFrame);
  paused = false;
  syncTopControls();
  const summary = learningSummary(state);
  if (!state.dev && !savedForRun) {
    const old = JogoStorage.load();
    JogoStorage.save({ bestAccuracy: Math.max(old.bestAccuracy, summary.accuracy), races: old.races + 1 });
    savedForRun = true;
  }
  const weakCopy = summary.weakKinds.length ? `Repair focus: ${summary.weakKinds.join(", ")}.` : "Every operation was correct on the first try.";
  screen.innerHTML = `
    <section class="results-screen" data-testid="results-screen">
      <div class="results-card">
        <div class="results-art">
          <img src="assets/mrjo-skating.png" alt="Mr Jo finishing the division route" />
          <img src="assets/robot-sidekick.png" alt="JoGo robot celebrating" />
        </div>
        <div class="results-copy">
          <span class="eyebrow">ROUTE COMPLETE</span>
          <h1>Brilliant build!</h1>
          <div class="results-equation">${state.route.problem.dividend} ÷ ${state.route.problem.divisor} = ${summary.quotient}${summary.remainder ? ` r ${summary.remainder}` : ""}</div>
          <div class="results-grid">
            <div class="result-stat">First-try accuracy<strong>${summary.accuracy}%</strong></div>
            <div class="result-stat">Route pieces<strong>${summary.totalSteps}</strong></div>
            <div class="result-stat">Repairs<strong>${summary.mistakes}</strong></div>
          </div>
          <p class="result-note">${weakCopy} You built the quotient and every working step, not only the final answer.</p>
          <div class="result-actions">
            <button class="primary-button tactile" data-action="next" type="button">⚡ Next Route</button>
            <button class="secondary-button tactile" data-action="home" type="button">Back Home</button>
          </div>
        </div>
      </div>
    </section>${devBanner()}`;
  announce(`Route complete. ${state.route.problem.dividend} divided by ${state.route.problem.divisor} equals ${summary.quotient}.`);
}

function renderPaused() {
  cancelAnimationFrame(animationFrame);
  syncTopControls();
  screen.innerHTML = `
    <section class="pause-screen" data-testid="pause-screen">
      <div class="pause-card">
        <img class="pit-avatar" src="assets/mrjo-focused.png" alt="Mr Jo thinking carefully" />
        <span class="eyebrow">THINKING BREAK</span>
        <h1>Race paused</h1>
        <p>Your division route is safe. Resume when you are ready.</p>
        <button class="primary-button tactile" data-action="resume" type="button">▶ Resume</button>
      </div>
    </section>${devBanner()}`;
}

function startGame({ dev = false, pace = "steady", index = problemIndex, jumpTo = 0 } = {}) {
  problemIndex = ((index % CONTENT.problems.length) + CONTENT.problems.length) % CONTENT.problems.length;
  state = createGameState(CONTENT.problems[problemIndex], { dev, pace });
  if (jumpTo > 0) state = completeThrough(state, jumpTo);
  gateProgress = 0;
  lastFrame = 0;
  paused = false;
  savedForRun = false;
  renderPlay();
}

function selectGate(lane) {
  if (!state || state.phase !== "play") return;
  state = selectLane(state, lane);
  document.querySelectorAll(".number-gate").forEach((button, index) => {
    button.classList.toggle("is-selected", index === lane);
    button.setAttribute("aria-pressed", String(index === lane));
  });
  const track = document.querySelector(".track");
  if (track) track.style.setProperty("--lane", lane);
  const lock = document.querySelector(".lock-button");
  if (lock) lock.disabled = false;
  announce(`Selected gate ${currentStep(state).options[lane]}.`);
}

function commitGate() {
  if (!state || state.phase !== "play") return "ignored";
  const outcome = commitSelection(state);
  state = outcome.state;
  gateProgress = 0;
  lastFrame = 0;
  if (outcome.result === "no-selection") {
    announce(state.feedback.text);
    return outcome.result;
  }
  if (outcome.result === "mistake" || outcome.result === "pit-stop") {
    JogoSound.bad();
    announce(state.feedback.text);
  } else if (outcome.result === "complete") {
    JogoSound.finish();
  } else {
    JogoSound.good();
  }

  if (outcome.result === "complete") renderResults();
  else if (outcome.result === "pit-stop") renderPitStop();
  else renderPlay();
  return outcome.result;
}

function startGateMotion() {
  cancelAnimationFrame(animationFrame);
  if (!state || state.phase !== "play" || paused) return;
  const seconds = CONTENT.paces[state.pace].seconds;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const speed = reducedMotion ? 0 : 100 / (seconds * 1000);

  function frame(time) {
    if (!state || state.phase !== "play" || paused) return;
    if (!lastFrame) lastFrame = time;
    const delta = Math.min(100, time - lastFrame);
    lastFrame = time;
    if (gateProgress < 94 || state.selectedLane !== null) gateProgress = Math.min(100, gateProgress + delta * speed);
    const track = document.querySelector(".track");
    const gateRow = document.querySelector(".gate-row");
    if (track) track.style.setProperty("--gate-progress", `${gateProgress}%`);
    if (gateRow) gateRow.style.setProperty("--gate-y", `${Math.min(190, gateProgress * 1.9)}px`);
    if (gateProgress >= 100 && state.selectedLane !== null) {
      commitGate();
      return;
    }
    animationFrame = requestAnimationFrame(frame);
  }
  animationFrame = requestAnimationFrame(frame);
}

function togglePause(force) {
  if (!state || !["play", "paused"].includes(state.phase)) return;
  paused = typeof force === "boolean" ? force : !paused;
  state.phase = paused ? "paused" : "play";
  if (paused) renderPaused();
  else renderPlay();
}

function restartCurrent() {
  if (!state) return;
  startGame({ dev: state.dev, pace: state.pace, index: problemIndex });
}

function devJump(action) {
  const before = localStorage.getItem(JogoStorage.key);
  if (action === "home") {
    renderHome();
  } else if (action === "reset") {
    JogoStorage.reset();
    renderHome();
  } else if (action === "first-play") {
    startGame({ dev: true, pace: "calm", index: 0 });
  } else if (action === "bring-down") {
    const routeState = createGameState(CONTENT.problems[0], { dev: true, pace: "calm" });
    const target = routeState.route.steps.findIndex((step) => step.kind === "bring-down");
    startGame({ dev: true, pace: "calm", index: 0, jumpTo: target });
  } else if (action === "mistake") {
    startGame({ dev: true, pace: "calm", index: 0 });
    const step = currentStep(state);
    selectGate((step.correctLane + 1) % 3);
    commitGate();
  } else if (action === "pit-stop") {
    startGame({ dev: true, pace: "calm", index: 0 });
    state.integrity = 1;
    const step = currentStep(state);
    selectGate((step.correctLane + 1) % 3);
    commitGate();
  } else if (action === "results") {
    startGame({ dev: true, pace: "calm", index: 0 });
    state = completeThrough(state, state.route.steps.length);
    renderResults();
  }
  const after = localStorage.getItem(JogoStorage.key);
  if (action !== "reset" && before !== after) throw new Error("DEV MODE changed learner progress.");
  return snapshot();
}

function snapshot() {
  const step = state ? currentStep(state) : null;
  return {
    phase: state?.phase || "home",
    dev: state?.dev || false,
    problem: state?.route.problem || null,
    stepIndex: state?.stepIndex ?? null,
    step: step?.kind || null,
    options: step?.options || null,
    correctLane: step?.correctLane ?? null,
    selectedLane: state?.selectedLane ?? null,
    integrity: state?.integrity ?? null,
    score: state?.score ?? null,
    feedback: state?.feedback || null,
    storage: localStorage.getItem(JogoStorage.key),
  };
}

function chooseCorrect() {
  if (!state || state.phase !== "play") return false;
  selectGate(currentStep(state).correctLane);
  return true;
}

screen.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "start") {
    const pace = document.querySelector('input[name="pace"]:checked')?.value || "steady";
    startGame({ pace, index: JogoStorage.load().races });
  } else if (action === "select") {
    selectGate(Number(actionTarget.dataset.lane));
  } else if (action === "commit") {
    commitGate();
  } else if (action === "restart") {
    restartCurrent();
  } else if (action === "resume") {
    togglePause(false);
  } else if (action === "next") {
    startGame({ dev: state.dev, pace: state.pace, index: problemIndex + 1 });
  } else if (action === "home") {
    renderHome();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest("dialog") || !state) return;
  if (["p", "P"].includes(event.key) && ["play", "paused"].includes(state.phase)) {
    event.preventDefault();
    togglePause();
    return;
  }
  if (state.phase !== "play") return;
  if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D", "Enter", " ", "p", "P"].includes(event.key)) event.preventDefault();
  if (["ArrowLeft", "a", "A"].includes(event.key)) selectGate(Math.max(0, (state.selectedLane ?? 1) - 1));
  if (["ArrowRight", "d", "D"].includes(event.key)) selectGate(Math.min(2, (state.selectedLane ?? 1) + 1));
  if (["Enter", " "].includes(event.key)) commitGate();
});

soundButton.addEventListener("click", () => {
  JogoSound.toggle();
  syncSound();
});

pauseButton.addEventListener("click", () => togglePause());
document.getElementById("helpButton").addEventListener("click", () => helpDialog.showModal());
document.getElementById("devButton").addEventListener("click", () => devDialog.showModal());

devActions.innerHTML = DEV_ACTIONS.map((action) => `<button type="button" data-dev="${action.id}">${action.label}</button>`).join("");
devActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dev]");
  if (!button) return;
  devDialog.close();
  devJump(button.dataset.dev);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state?.phase === "play") togglePause(true);
});

window.DividendDash = {
  snapshot,
  devJump,
  chooseCorrect,
  commit: commitGate,
  selectLane: selectGate,
  pause: () => togglePause(true),
  resume: () => togglePause(false),
};

syncSound();
renderHome();
if (queryRequestsDev()) window.setTimeout(() => devDialog.showModal(), 120);
