import { loadRegistry } from "./registry-utils.mjs";

const registry = loadRegistry();
const publicEntries = registry.experiences.filter((experience) => experience.public);
let failures = 0;

for (const experience of publicEntries) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(experience.url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "JoGo-Learning-Lab-Link-Check/1.0" },
    });
    const contentType = response.headers.get("content-type") || "unknown";
    const passed = response.ok && contentType.includes("text/html");
    console.log(`${passed ? "PASS" : "FAIL"} ${experience.title}: ${response.status} ${response.url}`);
    if (!passed) failures += 1;
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${experience.title}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (failures) process.exit(1);
console.log(`All ${publicEntries.length} public links returned HTML successfully.`);
