import test from "node:test";
import assert from "node:assert/strict";
import { loadRegistry, validateRegistry } from "../scripts/registry-utils.mjs";

const registry = loadRegistry();

test("registry passes structural validation", () => {
  assert.deepEqual(validateRegistry(registry), []);
});

test("the public lab contains approved activities only", () => {
  const publicEntries = registry.experiences.filter((experience) => experience.public);
  assert.ok(publicEntries.length > 0);
  for (const experience of publicEntries) {
    assert.equal(experience.status, "published");
    assert.match(experience.url, /^https:\/\//);
  }
});

test("studio catalogue includes non-public work", () => {
  assert.ok(registry.experiences.some((experience) => !experience.public));
});

test("public metadata contains no absolute local paths", () => {
  const publicJson = JSON.stringify(registry.experiences.filter((experience) => experience.public));
  assert.doesNotMatch(publicJson, /([A-Za-z]:\\|\/mnt\/)/);
});
