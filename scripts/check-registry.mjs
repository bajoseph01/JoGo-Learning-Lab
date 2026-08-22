import { loadRegistry, validateRegistry } from "./registry-utils.mjs";

const registry = loadRegistry();
const errors = validateRegistry(registry);

if (errors.length) {
  console.error(`Registry validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const published = registry.experiences.filter((experience) => experience.public).length;
console.log(`Registry valid: ${registry.experiences.length} builds, ${published} public activities.`);
