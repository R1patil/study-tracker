/**
 * Jarvis OS — AI Review Panel (Human-in-the-Loop)
 * Handles: rendering tailored fields, inline editing,
 * per-field regeneration with custom instruction, and apply.
 */

let BACKEND_URL = "http://localhost:8000";

// ─────────────────────────────────────────────
// FIELD DEFINITIONS — display config for each AI field
// ─────────────────────────────────────────────
const FIELD_CONFIG = [
  {
    key: "summary",
    icon: "✨",
    label: "Professional Summary",
    description: "Your 3-4 sentence intro tailored to this role",
    multiline: true,
    rows: 5,
  },
  {
    key: "cover_letter",
    icon: "📝",
    label: "Cover Letter",
    description: "Full cover letter addressed to the company",
    multiline: true,
    rows: 10,
  },
  {
    key: "why_this_company",
    icon: "💡",
    label: "Why This Company",
    description: "Answer to 'Why do you want to work here?'",
    multiline: true,
    rows: 4,
  },
  {
    key: "skills_text",
    icon: "🛠",
    label: "Skills (ATS Optimized)",
    description: "JD-matching skills prioritized first",
    multiline: false,
    rows: 2,
  },
  {
    key: "biggest_achievement",
    icon: "🏆",
    label: "Biggest Achievement",
    description: "Your top achievement reframed for this role",
    multiline: true,
    rows: 3,
  },
];

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let state = {
  tailored: {},       // { summary: "...", cover_letter: "...", ... }
  original: {},       // original AI output (for reset)
  edited: {},         // tracks which fields have been edited by user
  jobTitle: "",
  companyName: "",
  jobDescription: "",
  profile: null,
  openCards: new Set(),
};

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = isError ? "toast error" : "toast";
  toast.style.display = "block";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = "none"; }, 3000);
}

function setStatus(msg, dotColor = "#10b981") {
  document.getElementById("status-msg-text").textContent = msg;
  document.getElementById("status-dot").style.background = dotColor;
}

function setApplyEnabled(enabled) {
  document.getElementById("apply-btn").disabled = !enabled;
  document.getElementById("apply-btn-2").disabled = !enabled;
}

// ─────────────────────────────────────────────
// RENDER FIELD CARDS
// ─────────────────────────────────────────────
function renderFieldCards() {
  const grid = document.getElementById("fields-grid");
  grid.innerHTML = "";

  FIELD_CONFIG.forEach(config => {
    const card = document.createElement("div");
    card.className = "field-card";
    card.id = `card-${config.key}`;

    const value = state.tailored[config.key] || "";
    const isEdited = state.edited[config.key];
    const badgeText = isEdited ? "edited" : "ai generated";
    const badgeClass = isEdited ? "field-badge edited" : "field-badge";
    const isOpen = state.openCards.has(config.key);

    card.innerHTML = `
      <div class="card-header" id="header-${config.key}">
        <span class="field-icon">${config.icon}</span>
        <div style="flex:1; min-width:0;">
          <div class="field-label">${config.label}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:1px;">${config.description}</div>
        </div>
        <span class="${badgeClass}" id="badge-${config.key}">${badgeText}</span>
        <span class="card-toggle ${isOpen ? 'open' : ''}" id="toggle-${config.key}">▼</span>
      </div>
      <div class="card-body ${isOpen ? 'open' : ''}" id="body-${config.key}">
        <div class="card-body-inner">
          <div class="field-preview" id="preview-${config.key}" title="Click to edit">${escapeHtml(value)}</div>
          <textarea
            class="field-textarea"
            id="textarea-${config.key}"
            rows="${config.rows}"
            style="display:none;"
          >${escapeHtml(value)}</textarea>
          <div class="regen-row">
            <input
              type="text"
              class="regen-input"
              id="regen-input-${config.key}"
              placeholder="Optional: custom instruction (e.g. 'make it more concise')"
            />
            <button class="btn-regen" id="regen-btn-${config.key}">
              🔄 Regenerate
            </button>
            <button class="btn-reset" id="reset-btn-${config.key}" title="Reset to original AI output">↩</button>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
    attachCardListeners(config.key);
  });
}

function escapeHtml(str) {
  if (!str) return "<span style='color:var(--text-muted);font-style:italic;'>No content generated</span>";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─────────────────────────────────────────────
// CARD LISTENERS
// ─────────────────────────────────────────────
function attachCardListeners(key) {
  const header = document.getElementById(`header-${key}`);
  const body = document.getElementById(`body-${key}`);
  const toggle = document.getElementById(`toggle-${key}`);
  const preview = document.getElementById(`preview-${key}`);
  const textarea = document.getElementById(`textarea-${key}`);
  const regenBtn = document.getElementById(`regen-btn-${key}`);
  const regenInput = document.getElementById(`regen-input-${key}`);
  const resetBtn = document.getElementById(`reset-btn-${key}`);

  // Toggle open/close
  header.addEventListener("click", (e) => {
    if (e.target === regenBtn || e.target === resetBtn || regenInput.contains(e.target)) return;
    const isOpen = body.classList.contains("open");
    if (isOpen) {
      body.classList.remove("open");
      toggle.classList.remove("open");
      state.openCards.delete(key);
    } else {
      body.classList.add("open");
      toggle.classList.add("open");
      state.openCards.add(key);
    }
  });

  // Click preview to switch to textarea
  preview.addEventListener("click", () => {
    preview.style.display = "none";
    textarea.style.display = "block";
    textarea.focus();
    textarea.select();
  });

  // Textarea blur → back to preview
  textarea.addEventListener("blur", () => {
    const newVal = textarea.value.trim();
    state.tailored[key] = newVal;
    state.edited[key] = newVal !== state.original[key];
    updateCardBadge(key);
    preview.innerHTML = escapeHtml(newVal);
    textarea.style.display = "none";
    preview.style.display = "block";
  });

  // REGENERATE button
  regenBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await regenerateField(key, regenInput.value.trim());
  });

  // Allow Enter key in regen input to trigger regen
  regenInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await regenerateField(key, regenInput.value.trim());
    }
  });

  // RESET to original
  resetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.tailored[key] = state.original[key];
    delete state.edited[key];
    updateCardBadge(key);
    preview.innerHTML = escapeHtml(state.original[key]);
    textarea.value = state.original[key];
    textarea.style.display = "none";
    preview.style.display = "block";
    showToast(`↩ ${FIELD_CONFIG.find(f => f.key === key)?.label} reset to original`);
  });
}

function updateCardBadge(key) {
  const badge = document.getElementById(`badge-${key}`);
  const card = document.getElementById(`card-${key}`);
  if (!badge) return;

  if (state.edited[key]) {
    badge.textContent = "edited";
    badge.className = "field-badge edited";
    card.classList.remove("updated");
  } else if (state.regenerated && state.regenerated[key]) {
    badge.textContent = "regenerated";
    badge.className = "field-badge regenerated";
  } else {
    badge.textContent = "ai generated";
    badge.className = "field-badge";
  }
}

// ─────────────────────────────────────────────
// REGENERATE SINGLE FIELD
// ─────────────────────────────────────────────
async function regenerateField(key, instruction = "") {
  const card = document.getElementById(`card-${key}`);
  const regenBtn = document.getElementById(`regen-btn-${key}`);
  const preview = document.getElementById(`preview-${key}`);
  const textarea = document.getElementById(`textarea-${key}`);
  const label = FIELD_CONFIG.find(f => f.key === key)?.label || key;

  // Set loading state
  regenBtn.disabled = true;
  regenBtn.textContent = "⏳ Regenerating...";
  card.classList.add("regenerating");

  try {
    const res = await fetch(`${BACKEND_URL}/ai/regenerate-field`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_name: key,
        job_description: state.jobDescription,
        job_title: state.jobTitle,
        company_name: state.companyName,
        profile: state.profile,
        instruction: instruction,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const newValue = data.value || "";

    // Update state
    state.tailored[key] = newValue;
    if (!state.regenerated) state.regenerated = {};
    state.regenerated[key] = true;
    delete state.edited[key];

    // Update UI
    preview.innerHTML = escapeHtml(newValue);
    textarea.value = newValue;
    textarea.style.display = "none";
    preview.style.display = "block";

    card.classList.remove("regenerating");
    card.classList.add("updated");
    setTimeout(() => card.classList.remove("updated"), 2000);

    updateCardBadge(key);
    showToast(`✨ ${label} regenerated!`);

    // Clear instruction input
    document.getElementById(`regen-input-${key}`).value = "";

  } catch (err) {
    card.classList.remove("regenerating");
    showToast(`Failed to regenerate ${label}: ${err.message}`, true);
    console.error(`Regen error [${key}]:`, err);
  } finally {
    regenBtn.disabled = false;
    regenBtn.innerHTML = "🔄 Regenerate";
  }
}

// ─────────────────────────────────────────────
// APPLY TAILORED PROFILE
// Sends final merged profile to the active tab's content script
// ─────────────────────────────────────────────
async function applyTailoredProfile() {
  const applyBtn = document.getElementById("apply-btn");
  const applyBtn2 = document.getElementById("apply-btn-2");

  applyBtn.textContent = "⏳ Applying...";
  applyBtn.disabled = true;
  applyBtn2.textContent = "⏳ Applying...";
  applyBtn2.disabled = true;

  try {
    // Merge tailored fields into base profile
    const mergedProfile = {
      ...state.profile,
      summary: state.tailored.summary || state.profile?.summary || "",
      cover_letter: state.tailored.cover_letter || "",
      why_this_company: state.tailored.why_this_company || state.profile?.why_this_company || "",
      skills_text: state.tailored.skills_text || state.profile?.skills_text || "",
      biggest_achievement: state.tailored.biggest_achievement || state.profile?.biggest_achievement || "",
    };

    // Get active tab
    const [activeTab] = await chrome.tabs.query({ active: true });
    if (!activeTab?.id) throw new Error("No active tab found");

    // Send to content script
    const response = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "autofill_tailored", profile: mergedProfile },
        (res) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        }
      );
    });

    if (response?.success) {
      const count = response.filled || 0;
      applyBtn.textContent = `✅ Applied ${count} fields!`;
      applyBtn.style.background = "#10b981";
      applyBtn2.textContent = `✅ Applied ${count} fields!`;
      applyBtn2.style.background = "#10b981";
      setStatus(`✅ Successfully applied ${count} tailored fields to the form`, "#10b981");
      showToast(`✅ Tailored profile applied — ${count} fields filled!`);

      // Save to storage for re-use
      await chrome.storage.local.set({ last_tailored_profile: mergedProfile });

      setTimeout(() => {
        window.close();
      }, 2500);
    } else {
      throw new Error(response?.error || "Content script did not respond");
    }
  } catch (err) {
    applyBtn.textContent = "✅ Apply Tailored Profile";
    applyBtn.disabled = false;
    applyBtn2.textContent = "✅ Apply Tailored Profile";
    applyBtn2.disabled = false;
    setStatus(`Error: ${err.message}`, "#ef4444");
    showToast(`Apply failed: ${err.message}`, true);
  }
}

// ─────────────────────────────────────────────
// INIT — Load data from chrome.storage.local
// ─────────────────────────────────────────────
async function init() {
  document.getElementById("loading-overlay").style.display = "flex";
  setStatus("Loading AI tailored fields...", "#f59e0b");

  // Resolve BACKEND_URL from chrome storage
  try {
    const storedBackend = await chrome.storage.local.get(["backend_url"]);
    if (storedBackend.backend_url) {
      BACKEND_URL = storedBackend.backend_url;
    }
  } catch (_) {}

  try {
    const stored = await chrome.storage.local.get([
      "tailor_result",
      "tailor_job_title",
      "tailor_company_name",
      "tailor_job_description",
      "user_profile",
    ]);

    state.jobTitle = stored.tailor_job_title || "Unknown Role";
    state.companyName = stored.tailor_company_name || "Unknown Company";
    state.jobDescription = stored.tailor_job_description || "";
    state.profile = stored.user_profile || {};

    // Update job context display
    document.getElementById("ctx-title").textContent = state.jobTitle;
    document.getElementById("ctx-company").textContent = state.companyName;

    const tailored = stored.tailor_result;
    if (!tailored) {
      throw new Error("No tailored data found. Go back and click '🪄 Tailor for this Job' again.");
    }

    state.tailored = { ...tailored };
    state.original = { ...tailored };
    state.regenerated = {};

    // Open first two cards by default
    state.openCards.add("summary");
    state.openCards.add("cover_letter");

    // Render
    document.getElementById("skeleton").style.display = "none";
    document.getElementById("fields-grid").style.display = "flex";
    renderFieldCards();

    setStatus("Review and edit fields, then click Apply", "#10b981");
    setApplyEnabled(true);
    document.getElementById("loading-overlay").style.display = "none";

  } catch (err) {
    document.getElementById("loading-overlay").style.display = "none";
    document.getElementById("skeleton").innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
        <div style="font-size:32px; margin-bottom:12px;">⚠️</div>
        <div style="font-size:14px; font-weight:600; color:#f87171; margin-bottom:8px;">Failed to load tailored data</div>
        <div style="font-size:13px;">${err.message}</div>
      </div>
    `;
    setStatus(err.message, "#ef4444");
  }
}

// ─────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  init();

  document.getElementById("apply-btn").addEventListener("click", applyTailoredProfile);
  document.getElementById("apply-btn-2").addEventListener("click", applyTailoredProfile);

  document.getElementById("cancel-btn").addEventListener("click", () => window.close());
  document.getElementById("cancel-btn-2").addEventListener("click", () => window.close());
});
