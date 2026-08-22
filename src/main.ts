import "@fontsource-variable/dm-sans";
import "@fontsource-variable/fraunces";
import "./styles.css";
import registryData from "./data/experiences.json";

type BuildStatus = "published" | "testing" | "review" | "local" | "archive";
type VisualType = "money" | "metric" | "clock" | "tables" | "stompi" | "division" | "words";

interface Experience {
  id: string;
  title: string;
  subject: string;
  grades: string[];
  status: BuildStatus;
  public: boolean;
  url: string | null;
  sourceFolder: string;
  repositoryUrl: string | null;
  version: string;
  learningObjective: string;
  learnerAction: string;
  evidence: string;
  sessionLength: string;
  input: string[];
  visual: VisualType;
  learningScore: number | null;
  lastChecked: string | null;
  note: string;
}

interface Registry {
  updated: string;
  experiences: Experience[];
}

interface Theme {
  name: string;
  shortName: string;
  vars: Record<string, string>;
}

const registry = registryData as Registry;
const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) throw new Error("The application root is missing.");

const app: HTMLDivElement = appRoot;

const themes: Theme[] = [
  {
    name: "Retro Bloom",
    shortName: "Bloom",
    vars: {
      "--bg": "#fffbe8",
      "--surface": "#f8edd9",
      "--surface-2": "#fff1d4",
      "--text": "#2c2013",
      "--text-muted": "#5f5548",
      "--accent": "#317039",
      "--accent-2": "#f1be49",
      "--signal": "#cc4b24",
      "--border": "#2c2013",
      "--shadow": "#2c2013",
      "--gridline": "#e9dcc4",
      "--focus": "#cc4b24",
      "--good": "#317039",
      "--warning": "#cc4b24"
    }
  },
  {
    name: "SableSand",
    shortName: "Sand",
    vars: {
      "--bg": "#f9eedc",
      "--surface": "#efe2c9",
      "--surface-2": "#dfd3bd",
      "--text": "#342f29",
      "--text-muted": "#6c6459",
      "--accent": "#725838",
      "--accent-2": "#d5bb9a",
      "--signal": "#a34a2a",
      "--border": "#574a3d",
      "--shadow": "#574a3d",
      "--gridline": "#decbad",
      "--focus": "#a34a2a",
      "--good": "#4d6a4c",
      "--warning": "#a34a2a"
    }
  },
  {
    name: "Sea Mist",
    shortName: "Coast",
    vars: {
      "--bg": "#fffbf8",
      "--surface": "#f4f7ec",
      "--surface-2": "#d8f878",
      "--text": "#10252a",
      "--text-muted": "#2d5367",
      "--accent": "#2d6c70",
      "--accent-2": "#ffccb6",
      "--signal": "#b6472d",
      "--border": "#10252a",
      "--shadow": "#10252a",
      "--gridline": "#d7e7df",
      "--focus": "#b6472d",
      "--good": "#2d6c70",
      "--warning": "#b6472d"
    }
  }
];

let themeIndex = Number.parseInt(localStorage.getItem("jogo-lab-theme") || "0", 10);
if (!Number.isInteger(themeIndex) || themeIndex < 0 || themeIndex >= themes.length) themeIndex = 0;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyTheme(index: number): void {
  themeIndex = index;
  const theme = themes[themeIndex];
  for (const [property, value] of Object.entries(theme.vars)) {
    document.documentElement.style.setProperty(property, value);
  }
  localStorage.setItem("jogo-lab-theme", String(themeIndex));
  const label = document.querySelector<HTMLElement>("[data-theme-name]");
  if (label) label.textContent = theme.shortName;
}

function cycleTheme(): void {
  applyTheme((themeIndex + 1) % themes.length);
}

function gradeLabel(grades: string[]): string {
  if (grades.length === 1) return `Grade ${grades[0]}`;
  return `Grades ${grades[0]}–${grades.at(-1)}`;
}

function activityVisual(type: VisualType): string {
  if (type === "money") {
    return `<div class="money-stack" aria-hidden="true"><span>R10</span><span>50c</span><span>R2</span></div>`;
  }
  if (type === "metric") {
    return `<div class="metric-track" aria-hidden="true"><span>4</span><i>,</i><span>0</span><span>0</span><b>cm → mm</b></div>`;
  }
  if (type === "clock") {
    return `<div class="clock-face" aria-hidden="true"><i class="hour-hand"></i><i class="minute-hand"></i><b>12</b><span>6</span></div>`;
  }
  if (type === "tables") {
    return `<div class="factor-road" aria-hidden="true"><span>36</span><span>42</span><span>48</span><b>6 × 7</b></div>`;
  }
  if (type === "stompi") {
    return `<div class="stompi-strip" aria-hidden="true"><span>S</span><span>v1</span><span>T</span><span>O</span><span>M</span><span>P</span></div>`;
  }
  if (type === "division") {
    return `<div class="division-work" aria-hidden="true"><span>4⟌84</span><b>8 ÷ 4 = 2</b><i>04</i></div>`;
  }
  return `<div class="word-pair" aria-hidden="true"><span>quiet</span><b>↔</b><span>silent</span></div>`;
}

function themeControl(): string {
  return `
    <button class="theme-control" type="button" data-action="theme" aria-label="Change colour theme">
      <span class="theme-swatches" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>Colour: <b data-theme-name>${themes[themeIndex].shortName}</b></span>
    </button>
  `;
}

function publicCard(experience: Experience, index: number): string {
  const title = escapeHtml(experience.title);
  return `
    <article
      class="experience-card reveal"
      style="--reveal-order:${index}"
      data-subject="${escapeHtml(experience.subject)}"
      data-grades="${experience.grades.join(",")}"
      data-search="${escapeHtml(`${experience.title} ${experience.learningObjective} ${experience.learnerAction}`.toLowerCase())}"
    >
      <div class="activity-visual visual-${experience.visual}">
        <span class="activity-number">LAB ${String(index + 1).padStart(2, "0")}</span>
        ${activityVisual(experience.visual)}
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span>${escapeHtml(experience.subject)}</span>
          <span>${gradeLabel(experience.grades)}</span>
          <span>${escapeHtml(experience.sessionLength)}</span>
        </div>
        <h3>${title}</h3>
        <p class="objective">${escapeHtml(experience.learningObjective)}</p>
        <dl class="learning-details">
          <div>
            <dt>Learners do</dt>
            <dd>${escapeHtml(experience.learnerAction)}</dd>
          </div>
          <div>
            <dt>Teacher can notice</dt>
            <dd>${escapeHtml(experience.evidence)}</dd>
          </div>
        </dl>
        <div class="card-footer">
          <span>${experience.input.map((item) => escapeHtml(item)).join(" · ")}</span>
          <a href="${escapeHtml(experience.url || "#")}" target="_blank" rel="noopener noreferrer" aria-label="Open ${title} in a new tab">
            Open activity <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderPublic(): void {
  const experiences = registry.experiences.filter((experience) => experience.public && experience.status === "published" && experience.url);
  const subjects = [...new Set(experiences.map((experience) => experience.subject))].sort();
  const grades = [...new Set(experiences.flatMap((experience) => experience.grades))].sort((a, b) => Number(a) - Number(b));

  app.innerHTML = `
    <div class="page-frame public-page">
      <header class="lab-header">
        <a class="brand" href="#top" aria-label="JoGo Learning Lab home">
          <span class="brand-bolt" aria-hidden="true">ϟ</span>
          <span><strong>Jo<span>Go</span></strong><small>Learning Lab</small></span>
        </a>
        <div class="header-note">Teacher-selected interactive practice</div>
        ${themeControl()}
      </header>

      <main id="main-content">
        <section class="hero" id="top">
          <div class="hero-copy">
            <p class="eyebrow">Curriculum knowledge in action</p>
            <h1>Learning by <em>doing</em>, thinking and trying again.</h1>
            <p class="hero-lede">Short interactive activities where the school concept shapes what learners can do. Each one has a clear purpose, an observable learner action and feedback that helps the next attempt.</p>
            <a class="primary-link" href="#activities">Choose an activity <span aria-hidden="true">↓</span></a>
          </div>
          <div class="method-board" aria-label="The Learning Lab method">
            <div class="tape" aria-hidden="true"></div>
            <p class="board-label">THE LAB METHOD</p>
            <ol>
              <li><b>Know</b><span>Recall the idea</span></li>
              <li><b>Try</b><span>Use it in an action</span></li>
              <li><b>Notice</b><span>Read the feedback</span></li>
              <li><b>Adjust</b><span>Make a better attempt</span></li>
            </ol>
            <p class="board-note">The concept does the work.</p>
          </div>
        </section>

        <section class="trust-strip" aria-label="Learning Lab commitments">
          <span>Curriculum-led</span>
          <span>Short, focused sessions</span>
          <span>Immediate teaching feedback</span>
          <span>Teacher-selected</span>
        </section>

        <section class="library" id="activities">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Open activities</p>
              <h2>Choose the concept for today.</h2>
            </div>
            <p><strong data-public-count>${experiences.length}</strong> activities match</p>
          </div>

          <div class="filters" aria-label="Filter activities">
            <label>
              <span>Search</span>
              <input id="public-search" type="search" placeholder="Try fractions, words or money" autocomplete="off" />
            </label>
            <label>
              <span>Subject</span>
              <select id="public-subject">
                <option value="all">All subjects</option>
                ${subjects.map((subject) => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span>Grade</span>
              <select id="public-grade">
                <option value="all">All grades</option>
                ${grades.map((grade) => `<option value="${grade}">Grade ${grade}</option>`).join("")}
              </select>
            </label>
          </div>

          <div class="experience-grid">
            ${experiences.map(publicCard).join("")}
          </div>
          <div class="empty-state" hidden>
            <strong>No activity matches those filters yet.</strong>
            <p>Clear one filter and try again.</p>
          </div>
        </section>

        <section class="why-section">
          <div class="why-intro">
            <p class="eyebrow">For parents and colleagues</p>
            <h2>Purposeful practice, with the learning visible.</h2>
            <p>These activities sit inside a lesson. They give learners another way to handle a concept, make a choice, see the result and correct a misconception while the teacher remains in control of the purpose and pace.</p>
          </div>
          <div class="principle-list">
            <article><span>01</span><div><h3>Knowledge drives the action</h3><p>The school concept affects what the learner can build, choose, change or complete.</p></div></article>
            <article><span>02</span><div><h3>Mistakes teach</h3><p>Feedback names the idea and supports another attempt instead of stopping at right or wrong.</p></div></article>
            <article><span>03</span><div><h3>Progress can be seen</h3><p>Teachers can observe choices, corrections, fluency and the points where help is still needed.</p></div></article>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="footer-mark"><span aria-hidden="true">ϟ</span> JoGo Learning Lab</div>
        <p>Built by Mr Jo for focused classroom practice.</p>
        <p class="footer-small">Catalogue checked ${escapeHtml(registry.updated)}. Activities open in a new tab.</p>
      </footer>
    </div>
  `;

  wireShared();
  wirePublicFilters();
}

function statusLabel(status: BuildStatus): string {
  const labels: Record<BuildStatus, string> = {
    published: "Published",
    testing: "Testing",
    review: "Learning review",
    local: "Local only",
    archive: "Archived"
  };
  return labels[status];
}

function scoreLabel(score: number | null): string {
  if (score === null) return `<span class="score score-unrated">Not reviewed</span>`;
  const tone = score >= 16 ? "strong" : score >= 14 ? "prototype" : "review";
  return `<span class="score score-${tone}">${score}/20</span>`;
}

function studioRow(experience: Experience): string {
  const liveLink = experience.url
    ? `<a href="${escapeHtml(experience.url)}" target="_blank" rel="noopener noreferrer">Live ↗</a>`
    : `<span class="muted-action">No live link</span>`;
  const repoLink = experience.repositoryUrl
    ? `<a href="${escapeHtml(experience.repositoryUrl)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`
    : `<span class="muted-action">No remote</span>`;

  return `
    <article class="studio-row" data-status="${experience.status}" data-search="${escapeHtml(`${experience.title} ${experience.subject} ${experience.sourceFolder}`.toLowerCase())}">
      <div class="studio-title-cell">
        <span class="status status-${experience.status}">${statusLabel(experience.status)}</span>
        <h3>${escapeHtml(experience.title)}</h3>
        <p>${escapeHtml(experience.subject)} · ${gradeLabel(experience.grades)} · ${escapeHtml(experience.version)}</p>
      </div>
      <div class="studio-learning-cell">
        ${scoreLabel(experience.learningScore)}
        <p>${escapeHtml(experience.learningObjective)}</p>
      </div>
      <div class="studio-source-cell">
        <code>${escapeHtml(experience.sourceFolder)}</code>
        <button type="button" data-copy="${escapeHtml(experience.sourceFolder)}">Copy folder</button>
      </div>
      <div class="studio-check-cell">
        <span>${experience.lastChecked ? `Checked ${escapeHtml(experience.lastChecked)}` : "Link not checked"}</span>
        <small>${escapeHtml(experience.note)}</small>
      </div>
      <div class="studio-actions">${liveLink}${repoLink}</div>
    </article>
  `;
}

function renderStudio(): void {
  const counts = registry.experiences.reduce<Record<string, number>>((result, experience) => {
    result[experience.status] = (result[experience.status] || 0) + 1;
    return result;
  }, {});
  const scored = registry.experiences.filter((experience) => experience.learningScore !== null);
  const average = scored.length
    ? (scored.reduce((sum, experience) => sum + (experience.learningScore || 0), 0) / scored.length).toFixed(1)
    : "—";

  app.innerHTML = `
    <div class="page-frame studio-page">
      <header class="lab-header studio-header">
        <a class="brand" href="#" aria-label="Return to the public Learning Lab">
          <span class="brand-bolt" aria-hidden="true">ϟ</span>
          <span><strong>Jo<span>Go</span></strong><small>Studio</small></span>
        </a>
        <div class="header-note">Build catalogue</div>
        ${themeControl()}
      </header>

      <main id="main-content" class="studio-main">
        <section class="studio-hero">
          <div>
            <p class="eyebrow">Developer view</p>
            <h1>Every learning build.<br><em>One clear catalogue.</em></h1>
            <p>Track what is live, what is being tested and what still needs a learning-design review. The registry drives both this catalogue and the public Learning Lab.</p>
          </div>
          <div class="studio-warning">
            <strong>Unlinked, not secured</strong>
            <p>This page is absent from public navigation, but anyone with the address can open it. Keep credentials, learner data and confidential notes out of the registry.</p>
          </div>
        </section>

        <section class="studio-stats" aria-label="Build catalogue totals">
          <article><span>All builds</span><strong>${registry.experiences.length}</strong><small>catalogued</small></article>
          <article><span>Public</span><strong>${counts.published || 0}</strong><small>verified links</small></article>
          <article><span>In progress</span><strong>${(counts.testing || 0) + (counts.review || 0)}</strong><small>testing or review</small></article>
          <article><span>Reviewed score</span><strong>${average}</strong><small>average out of 20</small></article>
        </section>

        <section class="studio-library">
          <div class="section-heading">
            <div><p class="eyebrow">Registry</p><h2>Build inventory</h2></div>
            <a class="back-public" href="#">View public lab ↗</a>
          </div>
          <div class="studio-filters">
            <label><span>Find a build</span><input id="studio-search" type="search" placeholder="Search title, subject or folder" autocomplete="off" /></label>
            <label><span>Status</span><select id="studio-status"><option value="all">All statuses</option><option value="published">Published</option><option value="testing">Testing</option><option value="review">Learning review</option><option value="local">Local only</option><option value="archive">Archived</option></select></label>
            <p><strong data-studio-count>${registry.experiences.length}</strong> builds shown</p>
          </div>
          <div class="studio-column-labels" aria-hidden="true"><span>Build</span><span>Learning</span><span>Source folder</span><span>Check / note</span><span>Open</span></div>
          <div class="studio-list">${registry.experiences.map(studioRow).join("")}</div>
          <div class="studio-empty empty-state" hidden><strong>No build matches those filters.</strong></div>
        </section>
      </main>

      <footer class="site-footer studio-footer">
        <div class="footer-mark"><span aria-hidden="true">ϟ</span> JoGo Studio</div>
        <p>Update <code>src/data/experiences.json</code>, then run the registry and link checks.</p>
      </footer>
    </div>
  `;

  wireShared();
  wireStudioFilters();
  wireCopyButtons();
}

function wireShared(): void {
  document.querySelector<HTMLButtonElement>("[data-action='theme']")?.addEventListener("click", cycleTheme);
  applyTheme(themeIndex);
}

function wirePublicFilters(): void {
  const search = document.querySelector<HTMLInputElement>("#public-search");
  const subject = document.querySelector<HTMLSelectElement>("#public-subject");
  const grade = document.querySelector<HTMLSelectElement>("#public-grade");
  const cards = [...document.querySelectorAll<HTMLElement>(".experience-card")];
  const count = document.querySelector<HTMLElement>("[data-public-count]");
  const empty = document.querySelector<HTMLElement>(".empty-state");

  const filter = (): void => {
    const query = search?.value.trim().toLowerCase() || "";
    const selectedSubject = subject?.value || "all";
    const selectedGrade = grade?.value || "all";
    let visible = 0;

    for (const card of cards) {
      const matches = (!query || card.dataset.search?.includes(query))
        && (selectedSubject === "all" || card.dataset.subject === selectedSubject)
        && (selectedGrade === "all" || card.dataset.grades?.split(",").includes(selectedGrade));
      card.hidden = !matches;
      if (matches) visible += 1;
    }

    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  };

  search?.addEventListener("input", filter);
  subject?.addEventListener("change", filter);
  grade?.addEventListener("change", filter);
}

function wireStudioFilters(): void {
  const search = document.querySelector<HTMLInputElement>("#studio-search");
  const status = document.querySelector<HTMLSelectElement>("#studio-status");
  const rows = [...document.querySelectorAll<HTMLElement>(".studio-row")];
  const count = document.querySelector<HTMLElement>("[data-studio-count]");
  const empty = document.querySelector<HTMLElement>(".studio-empty");

  const filter = (): void => {
    const query = search?.value.trim().toLowerCase() || "";
    const selectedStatus = status?.value || "all";
    let visible = 0;

    for (const row of rows) {
      const matches = (!query || row.dataset.search?.includes(query))
        && (selectedStatus === "all" || row.dataset.status === selectedStatus);
      row.hidden = !matches;
      if (matches) visible += 1;
    }

    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  };

  search?.addEventListener("input", filter);
  status?.addEventListener("change", filter);
}

function wireCopyButtons(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = original; }, 1200);
      } catch {
        button.textContent = "Copy failed";
      }
    });
  }
}

function renderRoute(): void {
  if (window.location.hash === "#studio") renderStudio();
  else renderPublic();
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
