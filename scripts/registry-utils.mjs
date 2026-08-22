import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(projectRoot, "src", "data", "experiences.json");

export function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

export function validateRegistry(registry) {
  const errors = [];
  const allowedStatuses = new Set(["published", "testing", "review", "local", "archive"]);

  if (!registry || !Array.isArray(registry.experiences)) {
    return ["Registry must contain an experiences array."];
  }

  const ids = new Set();
  for (const [index, experience] of registry.experiences.entries()) {
    const label = experience?.id || `entry ${index + 1}`;
    const required = [
      "id",
      "title",
      "subject",
      "grades",
      "status",
      "sourceFolder",
      "learningObjective",
      "learnerAction",
      "evidence",
      "sessionLength",
      "input",
      "visual",
    ];

    for (const field of required) {
      if (experience?.[field] === undefined || experience?.[field] === null || experience?.[field] === "") {
        errors.push(`${label}: missing ${field}.`);
      }
    }

    if (ids.has(experience.id)) errors.push(`${label}: duplicate id.`);
    ids.add(experience.id);

    if (!allowedStatuses.has(experience.status)) errors.push(`${label}: invalid status ${experience.status}.`);
    if (!Array.isArray(experience.grades) || experience.grades.length === 0) errors.push(`${label}: grades must be a non-empty array.`);
    if (!Array.isArray(experience.input) || experience.input.length === 0) errors.push(`${label}: input must be a non-empty array.`);
    if (experience.learningScore !== null && (!Number.isInteger(experience.learningScore) || experience.learningScore < 0 || experience.learningScore > 20)) {
      errors.push(`${label}: learningScore must be null or an integer from 0 to 20.`);
    }

    if (experience.public) {
      if (experience.status !== "published") errors.push(`${label}: public entries must be published.`);
      if (typeof experience.url !== "string" || !experience.url.startsWith("https://")) errors.push(`${label}: public entries require an HTTPS URL.`);
      if (!experience.lastChecked) errors.push(`${label}: public entries require a lastChecked date.`);
    }

    const serialised = JSON.stringify(experience);
    if (/([A-Za-z]:\\|\/mnt\/|api[_-]?key|password|token)/i.test(serialised)) {
      errors.push(`${label}: registry contains an absolute path or sensitive-looking field.`);
    }
  }

  return errors;
}
