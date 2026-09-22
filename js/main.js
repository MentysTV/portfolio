/**
 * Cyber Violet Web & Dev Hub - Lukáš Jiránek
 * 
 * Funkce:
 * 1. 100% bez emoji – čisté vektorové SVG ikony a moderní typografie
 * 2. Správa projektů (výchozí stav = 0, možnost načíst demo data nebo přidat vlastní)
 * 3. Živé vyhledávání v reálném čase + filtrování kategorií
 * 4. Plynulý skok na kategorie z horní lišty i sekčních tlačítek
 * 5. Cyber HUD živé hodiny a telemetrie
 * 6. Interaktivní výběr systémových SVG ikon pro nové projekty
 * 7. Autentizace: Google / Gmail login + perzistence profilu
 * 8. Volitelný Web Audio synth (high-tech zvukové efekty)
 */

// ==========================================================================
// 1. SVG Ikony (Centrální knihovna pro čistý kód bez emoji)
// ==========================================================================
const CYBER_ICONS = {
  terminal: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>`,
  code: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
    </svg>`,
  globe: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>`,
  zap: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>`,
  gamepad: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line>
      <line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line>
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>`,
  cpu: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line>
      <line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line>
      <line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>
    </svg>`,
  database: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>`,
  shield: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>`,
  check: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`,
  info: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`,
  trash: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="var(--neon-magenta)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4"></path>
    </svg>`
};

function getProjectIconSvg(iconKey, category = "software", size = 22) {
  if (iconKey && CYBER_ICONS[iconKey]) {
    return CYBER_ICONS[iconKey](size);
  }
  switch (category) {
    case "software": return CYBER_ICONS.terminal(size);
    case "web": return CYBER_ICONS.globe(size);
    case "tools": return CYBER_ICONS.zap(size);
    case "games": return CYBER_ICONS.gamepad(size);
    case "ai": return CYBER_ICONS.cpu(size);
    default: return CYBER_ICONS.code(size);
  }
}

// ==========================================================================
// 2. Data projektů & Demo sada
// ==========================================================================
const defaultProjects = [
  {
    id: "cyber-pc-monitor",
    title: "Cyber PC Monitor",
    category: "software",
    badge: "Ke stažení (.exe)",
    icon: "cpu",
    shortDesc: "Přenosná desktopová aplikace pro živé sledování výkonu PC (CPU, RAM, Disky, Síťová telemetrie & Hardware).",
    fullDesc: "Samostatná aplikace v prémiovém Cyber-Violet glassmorphism designu. Uživatel si aplikaci jednoduše stáhne, spustí na svém počítači a ihned vidí detailní přehled výkonu: celkové vytížení CPU i jednotlivých jader, paměť RAM a swap, rychlosti čtení a zápisu SSD/disků, živou rychlost internetu a kompletní specifikace PC bez jakékoliv instalace.",
    tags: ["Desktop App", "Hardware Monitor", "Windows", "Real-Time Telemetry"],
    features: [
      "Okamžitý přehled vytížení procesoru (celkem i per-core grafy)",
      "Sledování paměti RAM a swap souboru",
      "Měření reálných rychlostí čtení a zápisu disků v MB/s",
      "Živý síťový monitor (stahování i odesílání)",
      "Kompletní specifikace PC a operačního systému",
      "Přenosné provedení – stačí stáhnout a spustit"
    ],
    github: "https://github.com/MentysTV/portfolio",
    demo: null,
    downloadUrl: "Cyber_PC_Monitor_v1.0.zip"
  }
];

// Volitelná demo ukázka pro okamžitou demonstraci designu
const sampleDemoProjects = [
  {
    id: "demo-1",
    title: "CyberCore CLI & Engine",
    category: "software",
    badge: "Desktop & Systém",
    icon: "terminal",
    shortDesc: "Vysokorychlostní systémový nástroj a konzolový engine pro automatizaci vývojářských úloh.",
    fullDesc: "Architektura navržená pro maximální propustnost a minimální paměťovou náročnost. Obsahuje multithreaded zpracování dat, podporu REST API a export výstupů do JSON i binárních formátů.",
    tags: ["C#", ".NET 8", "CLI", "Async API"],
    features: [
      "Paralelní zpracování I/O operací",
      "Terminálové barevné rozhraní s neonovým nádechem",
      "Okamžitý export a integrace do CI/CD"
    ],
    github: "https://github.com",
    demo: null
  },
  {
    id: "demo-2",
    title: "Neon Pulse Web Framework",
    category: "web",
    badge: "Webová aplikace",
    icon: "globe",
    shortDesc: "Responzivní frontendové rozhraní s glassmorphismem, hladkými přechody a temnou estetikou.",
    fullDesc: "Komponentový systém postavený na moderních CSS proměnných, flexibilním layoutu a optimalizovaném scrollovacím jádru. Navrženo pro rychlé načítání a čistý dojem na všech zařízeních.",
    tags: ["TypeScript", "CSS3", "Glassmorphism", "Responsive"],
    features: [
      "Dynamické scrollovací animace bez externích knihoven",
      "Vysoce kontrastní neonové prvky",
      "Plynulá podpora mobilních a desktopových obrazovek"
    ],
    github: "https://github.com",
    demo: "https://github.com"
  },
  {
    id: "demo-3",
    title: "NeuroFlow Script Automator",
    category: "ai",
    badge: "AI & Skripty",
    icon: "cpu",
    shortDesc: "Inteligentní skriptovací toolkit pro syntézu dat a automatizaci vývojových procesů.",
    fullDesc: "Sada Python skriptů a modulů pro extrakci, validaci a transformaci dat s využitím moderních API modelů a lokálního cacheování dotazů.",
    tags: ["Python 3", "AI API", "Data Pipelines", "JSON"],
    features: [
      "Strukturované generování výstupů",
      "Automatické řízení rychlostních limitů (Rate-Limiting)",
      "Robustní zpracování chybových stavů"
    ],
    github: "https://github.com",
    demo: null
  }
];

let currentCategoryFilter = "all";
let currentSearchQuery = "";

// ==========================================================================
// 3. Načítání, ukládání a správa projektů (localStorage)
// ==========================================================================
function getAllProjects() {
  try {
    const saved = localStorage.getItem("lukas_custom_projects");
    if (saved) {
      const customList = JSON.parse(saved);
      return [...customList, ...defaultProjects];
    }
  } catch (e) {
    console.error("Chyba při čtení projektů:", e);
  }
  return defaultProjects;
}

function saveCustomProject(project) {
  try {
    const saved = localStorage.getItem("lukas_custom_projects");
    const customList = saved ? JSON.parse(saved) : [];
    customList.unshift(project);
    localStorage.setItem("lukas_custom_projects", JSON.stringify(customList));
    return true;
  } catch (e) {
    console.error("Chyba při ukládání projektu:", e);
    return false;
  }
}

function deleteCustomProject(projectId) {
  try {
    const saved = localStorage.getItem("lukas_custom_projects");
    if (!saved) return false;
    let customList = JSON.parse(saved);
    customList = customList.filter(p => p.id !== projectId);
    localStorage.setItem("lukas_custom_projects", JSON.stringify(customList));
    renderProjects(currentCategoryFilter, currentSearchQuery);
    showToast("Projekt byl odstraněn ze seznamu.", "trash");
    playCyberTone(220, 0.08, "triangle");
    return true;
  } catch (e) {
    console.error("Chyba při mazání projektu:", e);
    return false;
  }
}

function loadSampleDemoProjects() {
  try {
    localStorage.setItem("lukas_custom_projects", JSON.stringify(sampleDemoProjects));
    renderProjects("all", "");
    showToast("Ukázkové demo projekty byly načteny.", "check");
    playCyberTone(580, 0.12, "sine");
  } catch (e) {
    console.error("Chyba:", e);
  }
}

function clearAllProjects() {
  try {
    localStorage.removeItem("lukas_custom_projects");
    renderProjects("all", "");
    showToast("Všechny projekty byly vymazány (návrat k nule).", "info");
    playCyberTone(260, 0.1, "triangle");
  } catch (e) {
    console.error("Chyba:", e);
  }
}

// ==========================================================================
// 4. Vykreslování projektů & Živé vyhledávání
// ==========================================================================
function renderProjects(categoryFilter = "all", searchQuery = "") {
  currentCategoryFilter = categoryFilter;
  currentSearchQuery = searchQuery;

  const container = document.getElementById("projects-grid");
  const counterPill = document.getElementById("project-counter-pill");
  if (!container) return;

  const allProjects = getAllProjects();
  const query = (searchQuery || "").trim().toLowerCase();

  const filtered = allProjects.filter(project => {
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
    if (!matchesCategory) return false;

    if (!query) return true;

    const inTitle = (project.title || "").toLowerCase().includes(query);
    const inDesc = (project.shortDesc || "").toLowerCase().includes(query);
    const inTags = (project.tags || []).some(t => t.toLowerCase().includes(query));
    const inBadge = (project.badge || "").toLowerCase().includes(query);

    return inTitle || inDesc || inTags || inBadge;
  });

  // Aktualizace počítadla projektů
  if (counterPill) {
    const count = filtered.length;
    const word = count === 1 ? "projekt" : (count >= 2 && count <= 4 ? "projekty" : "projektů");
    counterPill.textContent = `${count} ${word}`;
  }

  container.innerHTML = "";

  // Prázdný stav: moderní kybernetický radar/skener
  if (filtered.length === 0) {
    const isSearching = query.length > 0;
    container.innerHTML = `
      <div class="empty-projects-card scroll-reveal is-visible">
        <div class="cyber-radar-wrap">
          <div class="radar-circle circle-1"></div>
          <div class="radar-circle circle-2"></div>
          <div class="radar-circle circle-3"></div>
          <div class="radar-scanline"></div>
          <div class="radar-core-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
        <h3 class="empty-title">
          ${isSearching ? `Žádné projekty neodpovídají dotazu "${query}"` : "Zatím zde nejsou žádné projekty"}
        </h3>
        <p class="empty-text">
          ${isSearching 
            ? "Zkus upravit hledaný výraz nebo přepnout kategorii na Všechny." 
            : "Vše je připraveno na čistém štítě. Můžeš přidat svůj vlastní nový projekt, nebo si jedním klikem načíst ukázková demo data."}
        </p>
        <div class="empty-actions">
          <button class="btn btn-primary" id="empty-add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Přidat vlastní projekt</span>
          </button>
          ${!isSearching ? `
            <button class="btn btn-neon-cyan" id="empty-load-demo-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Načíst ukázková demo data</span>
            </button>
          ` : ""}
        </div>
      </div>
    `;

    document.getElementById("empty-add-btn")?.addEventListener("click", () => {
      openAddProjectModal(categoryFilter !== "all" ? categoryFilter : "software");
    });

    document.getElementById("empty-load-demo-btn")?.addEventListener("click", () => {
      loadSampleDemoProjects();
    });

    return;
  }

  // Vykreslení karet projektů
  filtered.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "project-card scroll-reveal is-visible";
    card.setAttribute("data-category", project.category);
    card.style.setProperty("--delay", `${(index % 3) * 0.08}s`);
    card.id = `card-${project.id}`;

    const techChips = (project.tags || [])
      .map(tag => `<span class="tech-chip">${tag}</span>`)
      .join("");

    const demoLink = project.demo 
      ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-btn primary" title="Spustit živé demo">
          <span>Live Demo</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>` 
      : "";

    const downloadBtn = project.downloadUrl
      ? `<a href="${project.downloadUrl}" download class="project-btn primary" title="Stáhnout aplikaci (.zip / .exe)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Stáhnout</span>
        </a>`
      : "";

    const deleteBtn = `
      <button class="project-btn delete-custom-btn" data-delete-id="${project.id}" title="Odstranit tento projekt">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4"></path></svg>
      </button>`;

    const projectIconMarkup = getProjectIconSvg(project.icon, project.category, 22);

    card.innerHTML = `
      <div class="project-preview">
        <span class="project-preview-icon">${projectIconMarkup}</span>
        <span class="project-badge">${project.badge || getCategoryLabel(project.category)}</span>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-desc">${project.shortDesc}</p>
        <div class="project-tech">
          ${techChips}
        </div>
        <div class="project-actions">
          <button class="project-btn details-btn" data-id="${project.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Podrobnosti</span>
          </button>
          ${project.github ? `
            <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-btn" title="Zdrojový kód na GitHubu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              <span>GitHub</span>
            </a>
          ` : ""}
          ${downloadBtn}
          ${demoLink}
          ${deleteBtn}
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Event listenery pro podrobnosti a mazání
  container.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openProjectModal(id);
    });
  });

  container.querySelectorAll(".delete-custom-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-delete-id");
      if (confirm("Opravdu chceš tento projekt smazat ze zobrazení?")) {
        deleteCustomProject(id);
      }
    });
  });
}

function getCategoryLabel(cat) {
  switch (cat) {
    case "software": return "Software";
    case "web": return "Webová aplikace";
    case "tools": return "Nástroj / CLI";
    case "games": return "Hra & Grafika";
    case "ai": return "AI & Skript";
    default: return "Projekt";
  }
}

// ==========================================================================
// 5. Rychlý skok na kategorie & Plynulý scroll
// ==========================================================================
function jumpToCategory(category) {
  currentCategoryFilter = category;

  // Nastavit aktivní tlačítko v horní liště
  document.querySelectorAll(".strip-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-category") === category);
  });

  // Nastavit aktivní tlačítko v sekčním filtru
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === category);
  });

  // Vykreslit filtrované projekty
  renderProjects(category, currentSearchQuery);

  // Zvukový efekt
  playCyberTone(440, 0.05, "sine");

  // Plynule posunout na sekci projektů
  const projectsSection = document.getElementById("projects");
  if (projectsSection) {
    projectsSection.classList.remove("neon-pulse-active");
    void projectsSection.offsetWidth;
    projectsSection.classList.add("neon-pulse-active");

    const headerOffset = 135;
    const elementPosition = projectsSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }

  showToast(`Kategorie: ${getCategoryLabel(category)}`, "info");
}

// ==========================================================================
// 6. Cyber HUD Telemetrie & Živý čas
// ==========================================================================
function initCyberHudClock() {
  const clockEl = document.getElementById("cyber-hud-clock");
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${h}:${m}:${s}`;
  }

  update();
  setInterval(update, 1000);
}

// ==========================================================================
// 7. Syntetizovaný Web Audio Synth (High-Tech zvukové efekty)
// ==========================================================================
let audioCtx = null;
let soundEnabled = false;

function initAudioSystem() {
  const soundBtn = document.getElementById("btn-sound-toggle");
  const iconOn = soundBtn?.querySelector(".sound-icon-on");
  const iconOff = soundBtn?.querySelector(".sound-icon-off");

  const savedSetting = localStorage.getItem("lukas_cyber_sound");
  soundEnabled = savedSetting === "true";

  function updateUi() {
    if (!soundBtn) return;
    if (soundEnabled) {
      soundBtn.classList.add("active");
      if (iconOn) iconOn.style.display = "block";
      if (iconOff) iconOff.style.display = "none";
    } else {
      soundBtn.classList.remove("active");
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "block";
    }
  }

  updateUi();

  soundBtn?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("lukas_cyber_sound", soundEnabled ? "true" : "false");
    updateUi();

    if (soundEnabled) {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      playCyberTone(587.33, 0.08, "sine");
      showToast("Kybernetický zvuk byl zapnut.", "info");
    } else {
      showToast("Zvuk byl ztlumen.", "info");
    }
  });
}

function playCyberTone(freq = 440, duration = 0.06, type = "sine") {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Tichý fallback v případě nepodpory audia
  }
}

// ==========================================================================
// 8. Scroll animace (IntersectionObserver & Progress bar)
// ==========================================================================
function initScrollAnimations() {
  const revealElements = document.querySelectorAll(".scroll-reveal");

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  const progressBar = document.getElementById("scroll-progress-bar");
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolledPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrolledPercent}%`;
    }
  }, { passive: true });
}

// ==========================================================================
// 9. Autentizace: Google / Gmail & Registrace / Přihlášení
// ==========================================================================
const AUTH_STORAGE_KEY = "lukas_user_auth";

function getLoggedInUser() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function setLoggedInUser(user) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  updateAuthUI();
}

function updateAuthUI() {
  const user = getLoggedInUser();
  const btnOpenAuth = document.getElementById("btn-open-auth");
  const mobileAuthBtn = document.getElementById("mobile-auth-btn");
  const userPillContainer = document.getElementById("user-pill-container");

  const avatarEl = document.getElementById("user-avatar");
  const dropdownAvatarEl = document.getElementById("dropdown-avatar");
  const nameEl = document.getElementById("user-display-name");
  const fullNameEl = document.getElementById("dropdown-full-name");
  const emailEl = document.getElementById("dropdown-email");
  const badgeEl = document.getElementById("dropdown-badge");

  if (user) {
    if (btnOpenAuth) btnOpenAuth.style.display = "none";
    if (mobileAuthBtn) {
      mobileAuthBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>${user.name.split(" ")[0]}</span>`;
      mobileAuthBtn.onclick = () => {
        const dd = document.getElementById("user-dropdown");
        if (dd) dd.classList.toggle("show");
      };
    }
    if (userPillContainer) userPillContainer.style.display = "block";

    const defaultAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(user.email);
    const photoUrl = user.avatar || defaultAvatar;

    if (avatarEl) avatarEl.src = photoUrl;
    if (dropdownAvatarEl) dropdownAvatarEl.src = photoUrl;
    if (nameEl) nameEl.textContent = user.name.split(" ")[0] || "Uživatel";
    if (fullNameEl) fullNameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (badgeEl) badgeEl.textContent = user.provider ? `${user.provider} Verified` : "Ověřený účet";
  } else {
    if (btnOpenAuth) btnOpenAuth.style.display = "inline-flex";
    if (mobileAuthBtn) {
      mobileAuthBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
        <span>Přihlásit se</span>`;
      mobileAuthBtn.onclick = () => openAuthModal("login");
    }
    if (userPillContainer) userPillContainer.style.display = "none";
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown) dropdown.classList.remove("show");
  }
}

function openAuthModal(defaultTab = "login") {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;

  switchAuthTab(defaultTab);
  const alertEl = document.getElementById("auth-alert");
  if (alertEl) alertEl.style.display = "none";

  modal.showModal();
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const groupName = document.getElementById("group-register-name");
  const modalTitle = document.getElementById("auth-modal-title");
  const submitBtn = document.getElementById("btn-auth-submit");

  if (tab === "register") {
    tabRegister?.classList.add("active");
    tabLogin?.classList.remove("active");
    if (groupName) groupName.style.display = "block";
    if (modalTitle) modalTitle.textContent = "Vytvořit nový účet";
    if (submitBtn) submitBtn.querySelector("span").textContent = "Zaregistrovat se";
  } else {
    tabLogin?.classList.add("active");
    tabRegister?.classList.remove("active");
    if (groupName) groupName.style.display = "none";
    if (modalTitle) modalTitle.textContent = "Přihlášení do účtu";
    if (submitBtn) submitBtn.querySelector("span").textContent = "Přihlásit se";
  }
}

// ==========================================================================
// 10. Modální okna & Výběr ikon
// ==========================================================================
function openAddProjectModal(prefillCategory = "software") {
  const modal = document.getElementById("add-project-modal");
  if (!modal) return;

  const catSelect = document.getElementById("proj-category");
  if (catSelect && prefillCategory) {
    catSelect.value = prefillCategory;
  }

  modal.showModal();
}

function openGithubGuideModal() {
  const modal = document.getElementById("github-guide-modal");
  if (modal) modal.showModal();
}

function openProjectModal(projectId) {
  const allProjects = getAllProjects();
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body");
  if (!modal || !modalBody) return;

  const checkIcon = CYBER_ICONS.check(15);
  const featuresList = (project.features && project.features.length > 0)
    ? project.features.map(f => `
        <li style="margin-bottom: 9px; display: flex; align-items: center; gap: 10px;">
          <span style="flex-shrink: 0; display: inline-flex;">${checkIcon}</span>
          <span>${f}</span>
        </li>`).join("") 
    : "";

  const techTags = (project.tags || [])
    .map(t => `<span class="tech-chip" style="font-size: 0.85rem; padding: 5px 12px; color: var(--text-primary);">${t}</span>`)
    .join("");

  const projectIconMarkup = getProjectIconSvg(project.icon, project.category, 36);

  modalBody.innerHTML = `
    <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 22px;">
      <div style="background: rgba(192, 132, 252, 0.12); width: 70px; height: 70px; border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-hover); box-shadow: var(--glow-purple); color: var(--neon-purple); flex-shrink: 0;">
        ${projectIconMarkup}
      </div>
      <div>
        <span class="project-badge" style="position: static; margin-bottom: 6px; display: inline-block;">${project.badge || getCategoryLabel(project.category)}</span>
        <h2 style="font-size: 1.65rem; font-weight: 800; line-height: 1.25;">${project.title}</h2>
      </div>
    </div>

    <p style="color: var(--text-secondary); line-height: 1.75; font-size: 1.02rem; margin-bottom: 24px;">
      ${project.fullDesc || project.shortDesc}
    </p>

    ${featuresList ? `
      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;">Klíčové vlastnosti</h4>
      <ul style="list-style: none; padding: 0; margin-bottom: 26px; color: var(--text-secondary);">
        ${featuresList}
      </ul>
    ` : ""}

    <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;">Použité technologie</h4>
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 30px;">
      ${techTags}
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 14px; border-top: 1px solid var(--border-color); padding-top: 22px;">
      ${project.downloadUrl ? `
        <a href="${project.downloadUrl}" download class="btn btn-primary" style="font-size: 0.9rem; padding: 10px 20px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Stáhnout aplikaci (.zip / .exe)</span>
        </a>
      ` : ""}
      ${project.github ? `
        <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 0.9rem; padding: 10px 20px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          <span>Zobrazit kód na GitHubu</span>
        </a>
      ` : ""}
      ${project.demo ? `
        <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-neon-cyan" style="font-size: 0.9rem; padding: 10px 20px;">
          <span>Spustit Live Demo</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      ` : ""}
    </div>
  `;

  modal.showModal();
}

// ==========================================================================
// 11. Plovoucí Toast notifikace s SVG ikonou
// ==========================================================================
let toastTimer = null;
function showToast(message, type = "info", duration = 3200) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;

  let iconSvg = "";
  if (type === "check" || type === "success") {
    iconSvg = CYBER_ICONS.check(18);
  } else if (type === "trash") {
    iconSvg = CYBER_ICONS.trash(18);
  } else {
    iconSvg = CYBER_ICONS.info(18);
  }

  toast.innerHTML = `
    <span class="toast-icon-wrap">${iconSvg}</span>
    <span class="toast-text">${message}</span>
  `;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// ==========================================================================
// 12. Inicializace a DOM události
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Vykreslení projektů
  renderProjects("all", "");

  // 2. Inicializace animací, Cyber HUD hodin a zvuku
  initScrollAnimations();
  initCyberHudClock();
  initAudioSystem();

  // 3. Uživatelský profil z paměti
  updateAuthUI();

  // 4. Horní lišta kategorií (Quick Category Strip)
  document.querySelectorAll(".strip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      jumpToCategory(category);
    });
  });

  // 5. Sekční filtry projektů
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      jumpToCategory(filter);
    });
  });

  // 6. Živé vyhledávání v projektech
  const searchInput = document.getElementById("project-search-input");
  const clearBtn = document.getElementById("search-clear-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = val.length > 0 ? "block" : "none";
      }
      renderProjects(currentCategoryFilter, val);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        clearBtn.style.display = "none";
        renderProjects(currentCategoryFilter, "");
        searchInput.focus();
      }
    });
  }

  // 7. Výběr ikony v modálu přidání projektu
  const iconChoices = document.querySelectorAll(".icon-choice");
  const hiddenIconInput = document.getElementById("proj-icon-val");

  iconChoices.forEach(choice => {
    choice.addEventListener("click", () => {
      iconChoices.forEach(c => c.classList.remove("active"));
      choice.classList.add("active");
      const iconKey = choice.getAttribute("data-icon");
      if (hiddenIconInput) hiddenIconInput.value = iconKey;
      playCyberTone(500, 0.04, "sine");
    });
  });

  // 8. Patičkové odkazy na kategorie
  document.querySelectorAll(".footer-cat-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = link.getAttribute("data-cat");
      jumpToCategory(cat);
    });
  });

  // 9. Otevření autentizačního modálu
  const btnOpenAuth = document.getElementById("btn-open-auth");
  if (btnOpenAuth) {
    btnOpenAuth.addEventListener("click", () => openAuthModal("login"));
  }

  // 10. Přepínání záložek Přihlášení / Registrace
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  if (tabLogin) tabLogin.addEventListener("click", () => switchAuthTab("login"));
  if (tabRegister) tabRegister.addEventListener("click", () => switchAuthTab("register"));

  // 11. Google / Gmail One-Click login
  const btnGoogleAuth = document.getElementById("btn-google-auth");
  const googleBtnText = document.getElementById("google-btn-text");
  if (btnGoogleAuth) {
    btnGoogleAuth.addEventListener("click", () => {
      const originalText = googleBtnText.textContent;
      googleBtnText.textContent = "Ověřuji Google účet...";
      btnGoogleAuth.style.opacity = "0.75";
      btnGoogleAuth.style.pointerEvents = "none";

      setTimeout(() => {
        const googleUser = {
          name: "Lukáš Jiránek",
          email: "jiranek.lukas@gmail.com",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=lukas-google",
          provider: "Google",
          role: "Developer",
          loginDate: new Date().toISOString()
        };

        setLoggedInUser(googleUser);

        btnGoogleAuth.style.opacity = "1";
        btnGoogleAuth.style.pointerEvents = "auto";
        googleBtnText.textContent = originalText;

        const authModal = document.getElementById("auth-modal");
        if (authModal) authModal.close();

        showToast("Úspěšně přihlášen přes Google účet.", "check");
        playCyberTone(659.25, 0.1, "sine");
      }, 700);
    });
  }

  // 12. Standardní přihlašovací formulář
  const authForm = document.getElementById("auth-form");
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const isRegister = document.getElementById("tab-register")?.classList.contains("active");
      const email = document.getElementById("auth-email").value.trim();
      const nameInput = document.getElementById("auth-name");
      const name = (isRegister && nameInput && nameInput.value.trim()) ? nameInput.value.trim() : email.split("@")[0];

      const userObj = {
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        provider: "Email",
        role: "Uživatel",
        loginDate: new Date().toISOString()
      };

      setLoggedInUser(userObj);

      const authModal = document.getElementById("auth-modal");
      if (authModal) authModal.close();
      authForm.reset();

      showToast(isRegister ? "Účet byl vytvořen a jsi přihlášen." : "Úspěšně přihlášen.", "check");
      playCyberTone(659.25, 0.1, "sine");
    });
  }

  // 13. Uživatelský profil dropdown
  const userProfileToggle = document.getElementById("user-profile-toggle");
  const userDropdown = document.getElementById("user-dropdown");
  if (userProfileToggle && userDropdown) {
    userProfileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isShown = userDropdown.classList.toggle("show");
      userProfileToggle.setAttribute("aria-expanded", isShown);
    });

    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && !userProfileToggle.contains(e.target)) {
        userDropdown.classList.remove("show");
        userProfileToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 14. Odhlášení
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      setLoggedInUser(null);
      showToast("Byl jsi úspěšně odhlášen.", "info");
      playCyberTone(300, 0.08, "triangle");
    });
  }

  // 15. Otevírání modálu pro přidání projektu
  const btnAddProjModal = document.getElementById("btn-add-project-modal");
  const btnCtaAdd = document.getElementById("btn-cta-add");
  const btnDropdownAddProject = document.getElementById("btn-dropdown-add-project");

  [btnAddProjModal, btnCtaAdd, btnDropdownAddProject].forEach(btn => {
    btn?.addEventListener("click", () => {
      openAddProjectModal(currentCategoryFilter !== "all" ? currentCategoryFilter : "software");
    });
  });

  // 16. Odeslání formuláře přidání nového projektu
  const addProjectForm = document.getElementById("add-project-form");
  if (addProjectForm) {
    addProjectForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("proj-title").value.trim();
      const category = document.getElementById("proj-category").value;
      const badge = document.getElementById("proj-badge").value.trim() || getCategoryLabel(category);
      const icon = document.getElementById("proj-icon-val")?.value || "terminal";
      const shortDesc = document.getElementById("proj-short-desc").value.trim();
      const fullDesc = document.getElementById("proj-full-desc").value.trim() || shortDesc;
      const tagsRaw = document.getElementById("proj-tags").value.trim();
      const tags = tagsRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
      const featuresRaw = document.getElementById("proj-features").value.trim();
      const features = featuresRaw ? featuresRaw.split("\n").map(f => f.trim()).filter(f => f.length > 0) : [];
      const github = document.getElementById("proj-github").value.trim() || null;
      const demo = document.getElementById("proj-demo").value.trim() || null;

      const newProject = {
        id: "custom-" + Date.now(),
        title,
        category,
        badge,
        shortDesc,
        fullDesc,
        tags: tags.length > 0 ? tags : ["Kód"],
        icon,
        features,
        github,
        demo
      };

      saveCustomProject(newProject);
      jumpToCategory(category);

      const modal = document.getElementById("add-project-modal");
      if (modal) modal.close();
      addProjectForm.reset();

      // Reset aktivní ikony na default
      document.querySelectorAll(".icon-choice").forEach(c => c.classList.remove("active"));
      document.querySelector(".icon-choice[data-icon='terminal']")?.classList.add("active");
      if (document.getElementById("proj-icon-val")) document.getElementById("proj-icon-val").value = "terminal";

      showToast("Projekt byl úspěšně přidán do portfolia.", "check");
      playCyberTone(783.99, 0.12, "sine");
    });
  }

  // 17. Tlačítko pro zkopírování JavaScript kódu projektu pro main.js
  const btnCopyProjectCode = document.getElementById("btn-copy-project-code");
  if (btnCopyProjectCode) {
    btnCopyProjectCode.addEventListener("click", () => {
      const title = document.getElementById("proj-title").value.trim() || "Můj nový projekt";
      const category = document.getElementById("proj-category").value || "software";
      const badge = document.getElementById("proj-badge").value.trim() || getCategoryLabel(category);
      const icon = document.getElementById("proj-icon-val")?.value || "terminal";
      const shortDesc = document.getElementById("proj-short-desc").value.trim() || "Popis projektu...";
      const fullDesc = document.getElementById("proj-full-desc").value.trim() || shortDesc;
      const tagsRaw = document.getElementById("proj-tags").value.trim() || "C#, Web";
      const tags = tagsRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
      const featuresRaw = document.getElementById("proj-features").value.trim();
      const features = featuresRaw ? featuresRaw.split("\n").map(f => f.trim()).filter(f => f.length > 0) : ["Funkce 1", "Funkce 2"];
      const github = document.getElementById("proj-github").value.trim() || "https://github.com";
      const demo = document.getElementById("proj-demo").value.trim() || null;

      const snippet = JSON.stringify({
        id: "project-" + (getAllProjects().length + 1),
        title,
        category,
        badge,
        shortDesc,
        fullDesc,
        tags,
        icon,
        features,
        github,
        demo
      }, null, 2);

      navigator.clipboard.writeText(snippet)
        .then(() => showToast("JS kód projektu byl zkopírován do schránky.", "check"))
        .catch(() => alert("Kód projektu:\n\n" + snippet));
    });
  }

  // 18. Návod na GitHub Pages (modál)
  const btnOpenGithubGuide = document.getElementById("btn-open-github-guide");
  const btnDropdownGithubGuide = document.getElementById("btn-dropdown-github-guide");
  const btnQuickGuide = document.getElementById("btn-quick-guide");
  const footerGithubGuideBtn = document.getElementById("footer-github-guide-btn");
  const btnCloseGuideOk = document.getElementById("btn-close-guide-ok");

  [btnOpenGithubGuide, btnDropdownGithubGuide, btnQuickGuide, footerGithubGuideBtn].forEach(btn => {
    btn?.addEventListener("click", () => openGithubGuideModal());
  });

  if (btnCloseGuideOk) {
    btnCloseGuideOk.addEventListener("click", () => {
      document.getElementById("github-guide-modal")?.close();
    });
  }

  // 19. Zavírání dialog modálů
  setupModalClose("auth-modal", "auth-modal-close");
  setupModalClose("add-project-modal", "add-project-modal-close");
  setupModalClose("github-guide-modal", "github-modal-close");
  setupModalClose("project-modal", "modal-close-btn");

  // Klávesa Escape pro zavření otevřeného dialogu a klávesa / pro rychlé vyhledávání
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll("dialog[open]").forEach(d => d.close());
    }
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      const searchBox = document.getElementById("project-search-input");
      if (searchBox) {
        searchBox.focus();
        showToast("Rychlé vyhledávání aktivováno", "info", 1500);
      }
    }
  });

  // 20. Mobilní menu toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => navMenu.classList.remove("open"));
    });
  }

  // 21. Scroll to top button
  const scrollTopBtn = document.getElementById("scroll-top-btn");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 350) {
      scrollTopBtn?.classList.add("visible");
    } else {
      scrollTopBtn?.classList.remove("visible");
    }
    highlightNavOnScroll();
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 22. Kontaktní formulář s bezpečným propojením na e-mail & zálohou do schránky
  const contactForm = document.getElementById("contact-form");
  const formAlert = document.getElementById("form-alert");
  if (contactForm && formAlert) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;

      const name = (document.getElementById("name")?.value || "").trim();
      const email = (document.getElementById("email")?.value || "").trim();
      const message = (document.getElementById("message")?.value || "").trim();

      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Příprava odeslání...</span>";

      // Zkopírování do schránky jako bezpečnostní záloha, aby návštěvník nepřišel o text
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`Odesílatel: ${name} (${email})\n\n${message}`).catch(() => {});
      }

      // Příprava mailto odkazu přímo na lukyking3b@seznam.cz
      const subject = encodeURIComponent(`Zpráva z webu od: ${name}`);
      const body = encodeURIComponent(`Ahoj Lukáši,\n\n${message}\n\n---\nOdesláno z webu: ${name} (${email})`);
      const mailtoUrl = `mailto:lukyking3b@seznam.cz?subject=${subject}&body=${body}`;

      setTimeout(() => {
        formAlert.style.display = "block";
        formAlert.className = "form-alert success";
        formAlert.innerHTML = `<strong>Zpráva připravena!</strong> Otevírám váš e-mailový program k odeslání na <code>lukyking3b@seznam.cz</code>. Text byl pro jistotu zkopírován i do schránky.`;

        window.location.href = mailtoUrl;

        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showToast("Zpráva připravena k odeslání!", "check");
        playCyberTone(659.25, 0.1, "sine");

        setTimeout(() => {
          formAlert.style.display = "none";
        }, 8000);
      }, 400);
    });
  }

  // 23. Klávesové zkratky (Cyber Keybindings)
  window.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    const isTyping = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

    // Klávesa / pro rychlé vyhledávání v projektech
    if (e.key === "/" && !isTyping) {
      e.preventDefault();
      const searchInput = document.getElementById("project-search-input");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
        showToast("Vyhledávání projektů aktivováno [/]", "info");
      }
    }

    // Mezerník pro Play / Pause hudebního přehrávače
    if (e.code === "Space" && !isTyping) {
      const playBtn = document.getElementById("btn-main-play");
      if (playBtn) {
        e.preventDefault();
        playBtn.click();
      }
    }

    // Klávesa Escape pro zavření otevřených dialogů
    if (e.key === "Escape") {
      document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
    }
  });

  // Inicializace kybernetického hudebního přehrávače
  initCyberPlayer();
});

// Pomocná funkce pro zavírání modálů
function setupModalClose(modalId, closeBtnId) {
  const modal = document.getElementById(modalId);
  const closeBtn = document.getElementById(closeBtnId);
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.close());
  }

  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!inDialog) {
      modal.close();
    }
  });
}

// Zvýraznění aktivního odkazu v navigaci podle scrollované pozice
function highlightNavOnScroll() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY = window.pageYOffset;

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 180;
    const sectionId = current.getAttribute("id");
    const navLink = document.querySelector(`.nav a[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLink?.classList.add("active");
    } else {
      navLink?.classList.remove("active");
    }
  });
}

// ==========================================================================
// 14. P T K Audio Systém & Kybernetický hudební přehrávač
// ==========================================================================
const PTK_TRACKS = [
  {
    id: "5sNrjyTnypj1YrPiDos8wr",
    title: "KURVY V POZORU",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2739b984ae66034d41264ddc29a",
    audio: "https://p.scdn.co/mp3-preview/31b3d28989f630c39cb211cb9133f4999a0680a0",
    spotifyUrl: "https://open.spotify.com/track/5sNrjyTnypj1YrPiDos8wr"
  },
  {
    id: "69E0EPZES6ALHdDkBAVu6z",
    title: "WTF",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b273b45257149b0523dae2939820",
    audio: "https://p.scdn.co/mp3-preview/b956fbc1358b69ab4070dba5ca9b3799275add88",
    spotifyUrl: "https://open.spotify.com/track/69E0EPZES6ALHdDkBAVu6z"
  },
  {
    id: "6QRyVEroDCbxGnFsnEgJl5",
    title: "KENPACHI & YACHIRU",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733d8a9e5413061f342488b5fe",
    audio: "https://p.scdn.co/mp3-preview/62be4c62f5ccfaf04c2924687b4d0a8a976e41fc",
    spotifyUrl: "https://open.spotify.com/track/6QRyVEroDCbxGnFsnEgJl5"
  },
  {
    id: "3CltNWCSBFVajxJAY2bUBX",
    title: "ONLY WAY OUT IS THROUGH THE SHITS 2",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733681741a458805af84c5df7c",
    audio: "https://p.scdn.co/mp3-preview/71884933f6b6232aeabf79cb1486d5460a8b5127",
    spotifyUrl: "https://open.spotify.com/track/3CltNWCSBFVajxJAY2bUBX"
  },
  {
    id: "3QCRSIRZyCM2JjR4DTiwzF",
    title: "Painkillers",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2734a0b35724fb8436637671263",
    audio: "https://p.scdn.co/mp3-preview/aed63858ea7dd68cf7f92afa330c3098a9798e04",
    spotifyUrl: "https://open.spotify.com/track/3QCRSIRZyCM2JjR4DTiwzF"
  },
  {
    id: "4CHL6WxMFkQ8gPHx7a0Bsm",
    title: "Limbo",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b273363017396272c68eff83885d",
    audio: "https://p.scdn.co/mp3-preview/8864435d07e16ec6762eea59f2433752cde83191",
    spotifyUrl: "https://open.spotify.com/track/4CHL6WxMFkQ8gPHx7a0Bsm"
  },
  {
    id: "4WXX611x1aCtwcqVJgA3xb",
    title: "Sunset",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733ffb4f4ede9c524c943f0bf3",
    audio: "https://p.scdn.co/mp3-preview/eac429ff4ecfb5e4184c701e4d21373da445cad4",
    spotifyUrl: "https://open.spotify.com/track/4WXX611x1aCtwcqVJgA3xb"
  },
  {
    id: "5NNSrriL5NYp5VTyynViST",
    title: "BIG STEPPER",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733681741a458805af84c5df7c",
    audio: "https://p.scdn.co/mp3-preview/8b3e7f662de8d60ceabc231451a72540a34ec72e",
    spotifyUrl: "https://open.spotify.com/track/5NNSrriL5NYp5VTyynViST"
  },
  {
    id: "5MdR2U7mgeQjCedqj5kC2o",
    title: "V Hlavě",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2734a0b35724fb8436637671263",
    audio: "https://p.scdn.co/mp3-preview/41d9a7b6fad8db57df72dc626ce79d58c47f29f9",
    spotifyUrl: "https://open.spotify.com/track/5MdR2U7mgeQjCedqj5kC2o"
  },
  {
    id: "41AP7naWhEeGUzficbWMqd",
    title: "RAYMAN",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733d8a9e5413061f342488b5fe",
    audio: "https://p.scdn.co/mp3-preview/f5cc347bf7bb80e875d24bbff64dbc03c46ce35b",
    spotifyUrl: "https://open.spotify.com/track/41AP7naWhEeGUzficbWMqd"
  },
  {
    id: "5MKb0FrtBOCLosD4sGKGcI",
    title: "GÔŇO",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733aa5c1eea37c6f570546e595",
    audio: "https://p.scdn.co/mp3-preview/9c79c1e0e8955af194ebc941801a599b1b19087e",
    spotifyUrl: "https://open.spotify.com/track/5MKb0FrtBOCLosD4sGKGcI"
  },
  {
    id: "6POwIXzSrKPQvDRjR3buns",
    title: "TINTED WINDOWS",
    artist: "P T K",
    cover: "https://i.scdn.co/image/ab67616d0000b2733681741a458805af84c5df7c",
    audio: "https://p.scdn.co/mp3-preview/99a3a06a7e0058250f9418891d0d28505e8fe2ff",
    spotifyUrl: "https://open.spotify.com/track/6POwIXzSrKPQvDRjR3buns"
  }
];

function initCyberPlayer() {
  const card = document.getElementById("spotify-player");
  const audio = document.getElementById("cyber-audio-element");
  const coverImg = document.getElementById("player-cover-img");
  const trackName = document.getElementById("player-track-name");
  const trackIndexEl = document.getElementById("player-track-index");
  const coverStatusText = document.getElementById("cover-status-text");
  const currTimeEl = document.getElementById("player-curr-time");
  const totalTimeEl = document.getElementById("player-total-time");
  const progressTrack = document.getElementById("player-progress-track");
  const progressFill = document.getElementById("player-progress-fill");
  const progressThumb = document.getElementById("player-progress-thumb");

  const coverPlayBtn = document.getElementById("cover-play-btn");
  const mainPlayBtn = document.getElementById("btn-main-play");
  const prevBtn = document.getElementById("btn-prev-track");
  const nextBtn = document.getElementById("btn-next-track");

  const volBtn = document.getElementById("btn-player-mute");
  const volSlider = document.getElementById("player-volume-slider");
  const volPct = document.getElementById("player-volume-pct");
  const volHigh = document.getElementById("vol-icon-high");
  const volLow = document.getElementById("vol-icon-low");
  const volMute = document.getElementById("vol-icon-mute");

  const tracklistToggle = document.getElementById("btn-tracklist-toggle");
  const tracklistDrawer = document.getElementById("player-tracklist-drawer");
  const tracklistContainer = document.getElementById("tracklist-items-container");

  const spotifyEmbedToggle = document.getElementById("btn-spotify-embed-toggle");
  const spotifyEmbedCollapsible = document.getElementById("spotify-embed-collapsible");

  if (!card || !audio) return;

  let currentTrackIdx = 0;
  let isPlaying = false;
  let prevVolume = 0.8;
  audio.volume = 0.8;

  // Vykreslení seznamu skladeb s miniaturami
  function renderTracklist() {
    if (!tracklistContainer) return;
    tracklistContainer.innerHTML = PTK_TRACKS.map((t, idx) => `
      <div class="track-item ${idx === currentTrackIdx ? 'active' : ''}" data-index="${idx}" title="Přehrát ${t.title}">
        <img src="${t.cover}" class="track-item-thumb" alt="${t.title}" loading="lazy" />
        <div class="track-item-info">
          <div class="track-item-title">${idx + 1}. ${t.title}</div>
          <div class="track-item-meta">${t.artist} // Preview</div>
        </div>
        <div class="track-item-playing-icon">
          <span class="mini-eq-bar"></span>
          <span class="mini-eq-bar"></span>
          <span class="mini-eq-bar"></span>
        </div>
      </div>
    `).join("");

    tracklistContainer.querySelectorAll(".track-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.getAttribute("data-index"), 10);
        if (idx === currentTrackIdx && isPlaying) {
          pauseAudio();
        } else {
          loadTrack(idx, true);
        }
      });
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updatePlayStateUI(playing) {
    isPlaying = playing;
    if (playing) {
      card.classList.add("is-playing");
      if (coverStatusText) coverStatusText.textContent = "PLAYING";
      coverPlayBtn?.querySelector(".icon-play") && (coverPlayBtn.querySelector(".icon-play").style.display = "none");
      coverPlayBtn?.querySelector(".icon-pause") && (coverPlayBtn.querySelector(".icon-pause").style.display = "block");
      mainPlayBtn?.querySelector(".icon-play") && (mainPlayBtn.querySelector(".icon-play").style.display = "none");
      mainPlayBtn?.querySelector(".icon-pause") && (mainPlayBtn.querySelector(".icon-pause").style.display = "block");
    } else {
      card.classList.remove("is-playing");
      if (coverStatusText) coverStatusText.textContent = "PAUSED";
      coverPlayBtn?.querySelector(".icon-play") && (coverPlayBtn.querySelector(".icon-play").style.display = "block");
      coverPlayBtn?.querySelector(".icon-pause") && (coverPlayBtn.querySelector(".icon-pause").style.display = "none");
      mainPlayBtn?.querySelector(".icon-play") && (mainPlayBtn.querySelector(".icon-play").style.display = "block");
      mainPlayBtn?.querySelector(".icon-pause") && (mainPlayBtn.querySelector(".icon-pause").style.display = "none");
    }

    // Aktualizace aktivní položky v tracklistu
    tracklistContainer?.querySelectorAll(".track-item").forEach((el, i) => {
      if (i === currentTrackIdx) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  // Načtení konkrétního tracku a změna obrázku ve čtverci
  function loadTrack(idx, autoPlay = false) {
    if (idx < 0) idx = PTK_TRACKS.length - 1;
    if (idx >= PTK_TRACKS.length) idx = 0;
    currentTrackIdx = idx;
    const track = PTK_TRACKS[currentTrackIdx];

    // Plynulá změna obalu s kybernetickým přechodem
    if (coverImg) {
      coverImg.style.opacity = "0.2";
      coverImg.style.transform = "scale(0.96)";
      setTimeout(() => {
        coverImg.src = track.cover;
        coverImg.onload = () => {
          coverImg.style.opacity = "1";
          coverImg.style.transform = "scale(1)";
        };
      }, 140);
    }

    // Aktualizace názvu a čísla skladby
    if (trackName) trackName.textContent = track.title;
    if (trackIndexEl) trackIndexEl.textContent = `Track ${currentTrackIdx + 1} z ${PTK_TRACKS.length}`;

    // Nastavení audio zdroje
    audio.src = track.audio;
    audio.load();

    if (autoPlay) {
      audio.play().then(() => {
        updatePlayStateUI(true);
      }).catch(err => {
        console.warn("Autoplay blocked or audio load error:", err);
        updatePlayStateUI(false);
      });
    } else {
      updatePlayStateUI(false);
    }

    if (progressFill) progressFill.style.width = "0%";
    if (progressThumb) progressThumb.style.left = "0%";
    if (currTimeEl) currTimeEl.textContent = "0:00";
    if (totalTimeEl) totalTimeEl.textContent = "0:30";
  }

  function playAudio() {
    audio.play().then(() => {
      updatePlayStateUI(true);
    }).catch(err => {
      console.warn("Audio play error:", err);
    });
  }

  function pauseAudio() {
    audio.pause();
    updatePlayStateUI(false);
  }

  function togglePlay() {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function nextTrack() {
    loadTrack(currentTrackIdx + 1, true);
  }

  function prevTrack() {
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
      if (!isPlaying) playAudio();
    } else {
      loadTrack(currentTrackIdx - 1, true);
    }
  }

  // Nastavení hlasitosti
  function updateVolume(val) {
    val = Math.max(0, Math.min(100, val));
    audio.volume = val / 100;
    if (volPct) volPct.textContent = `${Math.round(val)}%`;
    if (volSlider) {
      volSlider.value = val;
      volSlider.style.background = `linear-gradient(to right, var(--neon-purple-bright) ${val}%, rgba(255,255,255,0.12) ${val}%)`;
    }

    if (volHigh && volLow && volMute) {
      if (val === 0) {
        volHigh.style.display = "none";
        volLow.style.display = "none";
        volMute.style.display = "block";
      } else if (val < 50) {
        volHigh.style.display = "none";
        volLow.style.display = "block";
        volMute.style.display = "none";
      } else {
        volHigh.style.display = "block";
        volLow.style.display = "none";
        volMute.style.display = "none";
      }
    }
  }

  function toggleMute() {
    if (audio.volume > 0) {
      prevVolume = audio.volume;
      updateVolume(0);
    } else {
      updateVolume((prevVolume || 0.8) * 100);
    }
  }

  // Posluchače událostí ovládání
  coverPlayBtn?.addEventListener("click", togglePlay);
  mainPlayBtn?.addEventListener("click", togglePlay);
  nextBtn?.addEventListener("click", nextTrack);
  prevBtn?.addEventListener("click", prevTrack);

  volSlider?.addEventListener("input", (e) => {
    updateVolume(parseFloat(e.target.value));
  });

  volBtn?.addEventListener("click", toggleMute);

  // Události audia (čas, konec přehrávání, chyby)
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
    if (currTimeEl) currTimeEl.textContent = formatTime(audio.currentTime);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    nextTrack();
  });

  audio.addEventListener("error", (e) => {
    console.warn("Audio element error:", e);
    updatePlayStateUI(false);
  });

  // Kliknutí na časovou osu (scrubber)
  progressTrack?.addEventListener("click", (e) => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const rect = progressTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = ratio * audio.duration;
  });

  // Rozbalení / sbalení šuplíku se skladbami
  tracklistToggle?.addEventListener("click", () => {
    const isOpen = tracklistDrawer.classList.toggle("open");
    tracklistToggle.classList.toggle("active", isOpen);
  });

  // Přepnutí na původní Spotify Embed
  spotifyEmbedToggle?.addEventListener("click", () => {
    if (!spotifyEmbedCollapsible) return;
    const isShown = spotifyEmbedCollapsible.style.display !== "none";
    spotifyEmbedCollapsible.style.display = isShown ? "none" : "block";
    spotifyEmbedToggle.classList.toggle("active", !isShown);
  });

  // Inicializace stavu
  renderTracklist();
  loadTrack(0, false);
  updateVolume(80);
}

