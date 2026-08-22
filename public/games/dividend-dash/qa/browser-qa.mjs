import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const baseUrl = process.env.DIVIDEND_DASH_URL || "http://127.0.0.1:4178/games/dividend-dash/index.html";
const gameRoot = path.resolve(import.meta.dirname, "..");
const evidenceDir = path.join(gameRoot, "quality", "gauntlet", "evidence");

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const userProfile = process.env.USERPROFILE;
    if (!userProfile) throw new Error("Playwright is unavailable and USERPROFILE is not set.");
    const shared = path.join(userProfile, ".codex", "tools", "visual-check-runtime", "node_modules", "playwright", "index.mjs");
    return import(pathToFileURL(shared).href);
  }
}

async function launchBrowser(chromium) {
  const candidates = [
    { channel: "msedge", headless: true },
    { channel: "chrome", headless: true },
    { executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", headless: true },
  ];
  const failures = [];
  for (const options of candidates) {
    try {
      return await chromium.launch({ ...options, args: ["--disable-dev-shm-usage"] });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`Unable to launch QA browser:\n${failures.join("\n")}`);
}

async function settle(page) {
  await page.evaluate(async () => document.fonts?.ready);
  await page.waitForTimeout(180);
}

async function capture(page, name) {
  await settle(page);
  await page.screenshot({ path: path.join(evidenceDir, name) });
}

async function captureLocator(page, selector, name) {
  await settle(page);
  await page.locator(selector).screenshot({ path: path.join(evidenceDir, name) });
}

async function assertTableauLegibility(page) {
  const metrics = await page.locator(".tableau").evaluate((svg) => {
    const slots = [...svg.querySelectorAll('[data-role="quotient-slot"]')];
    const activeSlot = svg.querySelector('[data-role="quotient-slot"].is-active');
    const activeValue = svg.querySelector('[data-role="quotient-value"].is-active');
    const activeDigit = svg.querySelector('.dividend-digit.is-active');
    const bracket = svg.querySelector('[data-role="division-bracket"]');
    const slotBox = activeSlot?.getBBox();
    const digitBox = activeDigit?.getBBox();
    const barY = Number(bracket?.dataset.barY);
    return {
      slotCount: slots.length,
      activeText: activeValue?.textContent,
      activeFill: activeValue ? getComputedStyle(activeValue).fill : "",
      slotBottom: slotBox ? slotBox.y + slotBox.height : NaN,
      digitTop: digitBox?.y ?? NaN,
      barY,
    };
  });
  assert.equal(metrics.slotCount, 3, "tableau must expose three visible quotient positions");
  assert.equal(metrics.activeText, "?", "divide step must place its unknown in the quotient slot");
  assert.notEqual(metrics.activeFill, "rgb(167, 181, 202)", "active unknown must not use ghost contrast");
  assert.ok(metrics.slotBottom <= metrics.barY - 12, `quotient slot crowds the division bar (${metrics.slotBottom} > ${metrics.barY - 12})`);
  assert.ok(metrics.digitTop >= metrics.barY + 8, `division bar crowds the dividend digits (${metrics.digitTop} < ${metrics.barY + 8})`);
  assert.equal(await page.locator('[data-role="product-value"]').count(), 0, "divide step must not show a multiply-row unknown");
}

async function assertViewport(page, label) {
  const metrics = await page.evaluate(() => {
    const screen = document.getElementById("screen").getBoundingClientRect();
    const primary = document.querySelector('[data-action="start"], [data-action="commit"], [data-action="next"], [data-action="resume"]');
    const primaryRect = primary?.getBoundingClientRect() || null;
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      screenLeft: screen.left,
      screenRight: screen.right,
      primaryRect: primaryRect && { top: primaryRect.top, bottom: primaryRect.bottom, left: primaryRect.left, right: primaryRect.right },
    };
  });
  assert.ok(metrics.scrollWidth <= metrics.width, `${label}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.width}px`);
  if (label.includes("landscape")) assert.ok(metrics.scrollHeight <= metrics.height + 1, `${label}: vertical overflow ${metrics.scrollHeight}px > ${metrics.height}px`);
  assert.ok(metrics.screenLeft >= 0 && metrics.screenRight <= metrics.width + 1, `${label}: game shell exceeds viewport width`);
  if (metrics.primaryRect) {
    assert.ok(metrics.primaryRect.top >= 0 && metrics.primaryRect.bottom <= metrics.height + 1, `${label}: primary action is outside the first viewport`);
    assert.ok(metrics.primaryRect.left >= 0 && metrics.primaryRect.right <= metrics.width + 1, `${label}: primary action is clipped horizontally`);
  }
}

async function selectCorrectWithKeyboard(page) {
  const snap = await page.evaluate(() => window.DividendDash.snapshot());
  assert.equal(snap.phase, "play");
  if (snap.correctLane === 0) await page.keyboard.press("ArrowLeft");
  if (snap.correctLane === 1) {
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
  }
  if (snap.correctLane === 2) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
}

await fs.mkdir(evidenceDir, { recursive: true });
const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium);
const errors = [];
const results = [];

try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1, hasTouch: true });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()} ${message.location().url || ""}`.trim());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await settle(page);
  await assertViewport(page, "iPad landscape home");
  assert.equal(await page.locator('[data-action="start"]').isVisible(), true);
  assert.equal(await page.locator(".home-mrjo").evaluate((image) => image.complete && image.naturalWidth > 0), true);
  results.push("iPad landscape home fits and authoritative character asset loads");

  await page.locator('[data-action="start"]').click();
  await settle(page);
  await assertViewport(page, "iPad landscape active play");
  assert.equal((await page.locator(".number-gate").count()), 3);
  await assertTableauLegibility(page);
  await capture(page, "02-active-play-ipad-landscape.png");
  await captureLocator(page, ".tableau-wrap", "02a-tableau-legibility-closeup.png");
  results.push("active play exposes three touch gates and a high-contrast, non-overlapping division tableau");

  const firstStep = await page.evaluate(() => window.DividendDash.snapshot());
  await page.locator(".number-gate").nth(firstStep.correctLane).click();
  await page.locator('[data-action="commit"]').click();
  const afterPointer = await page.evaluate(() => window.DividendDash.snapshot());
  assert.equal(afterPointer.stepIndex, 1);
  assert.equal(afterPointer.feedback.type, "success");
  await capture(page, "03-correct-ipad-landscape.png");
  results.push("Pointer Events path advances one mathematical operation and shows teaching feedback");

  await selectCorrectWithKeyboard(page);
  const afterKeyboard = await page.evaluate(() => window.DividendDash.snapshot());
  assert.equal(afterKeyboard.stepIndex, 2);
  results.push("keyboard steering and Enter advance the next operation");

  await page.locator("#pauseButton").click();
  assert.equal((await page.evaluate(() => window.DividendDash.snapshot())).phase, "paused");
  await capture(page, "04-paused-ipad-landscape.png");
  await page.locator('[data-action="resume"]').click();
  assert.equal((await page.evaluate(() => window.DividendDash.snapshot())).phase, "play");
  results.push("pause and resume gate gameplay state cleanly");

  await page.evaluate(() => window.DividendDash.devJump("mistake"));
  const mistake = await page.evaluate(() => window.DividendDash.snapshot());
  assert.equal(mistake.feedback.type, "mistake");
  assert.equal(mistake.stepIndex, 0);
  await capture(page, "05-mistake-ipad-landscape.png");
  results.push("mistake path retains the same step and gives a specific repair clue");

  await page.evaluate(() => localStorage.setItem("jogo-dividend-dash-progress-v1", JSON.stringify({ bestAccuracy: 77, races: 4 })));
  const beforeDev = await page.evaluate(() => localStorage.getItem("jogo-dividend-dash-progress-v1"));
  await page.evaluate(() => window.DividendDash.devJump("bring-down"));
  const bring = await page.evaluate(() => window.DividendDash.snapshot());
  assert.equal(bring.step, "bring-down");
  assert.equal(await page.locator(".dividend-digit.is-active").getAttribute("data-index"), "1");
  await capture(page, "06-bring-down-ipad-landscape.png");
  await captureLocator(page, ".tableau-wrap", "06a-bring-down-tableau-closeup.png");
  await page.evaluate(() => window.DividendDash.devJump("pit-stop"));
  await capture(page, "07-pit-stop-ipad-landscape.png");
  await page.evaluate(() => window.DividendDash.devJump("results"));
  const afterDev = await page.evaluate(() => localStorage.getItem("jogo-dividend-dash-progress-v1"));
  assert.equal(afterDev, beforeDev);
  await assertViewport(page, "iPad landscape results");
  await capture(page, "08-results-ipad-landscape.png");
  results.push("DEV jumps cover bring-down, pit stop, and results without changing learner progress");

  await page.locator('[data-action="next"]').click();
  assert.equal((await page.evaluate(() => window.DividendDash.snapshot())).stepIndex, 0);
  await page.locator('[data-action="restart"]').click();
  const restarted = await page.evaluate(() => window.DividendDash.snapshot());
  assert.equal(restarted.stepIndex, 0);
  assert.equal(restarted.score, 0);
  results.push("next-route and restart both create clean playable state");
  await context.close();

  const portrait = await browser.newContext({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, hasTouch: true });
  const portraitPage = await portrait.newPage();
  await portraitPage.emulateMedia({ reducedMotion: "reduce" });
  portraitPage.on("console", (message) => {
    if (message.type() === "error") errors.push(`portrait console: ${message.text()} ${message.location().url || ""}`.trim());
  });
  portraitPage.on("pageerror", (error) => errors.push(`portrait pageerror: ${error.message}`));
  portraitPage.on("response", (response) => {
    if (response.status() >= 400) errors.push(`portrait http ${response.status()}: ${response.url()}`);
  });
  await portraitPage.goto(baseUrl, { waitUntil: "networkidle" });
  await assertViewport(portraitPage, "iPad portrait home");
  await capture(portraitPage, "09-home-ipad-portrait.png");
  await portraitPage.locator('[data-action="start"]').click();
  await settle(portraitPage);
  const portraitMetrics = await portraitPage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: innerWidth }));
  assert.ok(portraitMetrics.scrollWidth <= portraitMetrics.width);
  await capture(portraitPage, "10-active-play-ipad-portrait.png");
  results.push("iPad portrait home and active play have no horizontal overflow");
  await portrait.close();

  assert.deepEqual(errors, [], `Browser errors:\n${errors.join("\n")}`);
  console.log("Dividend Dash browser QA passed:");
  results.forEach((result) => console.log(`- ${result}`));
} finally {
  await browser.close();
}
