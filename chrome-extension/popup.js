let BACKEND_URL = "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────
// ATS DETECTION: detect which platform we are on
// ─────────────────────────────────────────────────────────────────
const ATS_PLATFORMS = [
  {
    name: "Workday",
    icon: "🏢",
    coverage: "Full (Shadow DOM)",
    patterns: ["myworkdayjobs.com", "workday.com"]
  },
  {
    name: "Greenhouse",
    icon: "🌱",
    coverage: "Full",
    patterns: ["boards.greenhouse.io", "greenhouse.io"]
  },
  {
    name: "Lever",
    icon: "🎯",
    coverage: "Full",
    patterns: ["jobs.lever.co", "lever.co"]
  },
  {
    name: "iCIMS",
    icon: "🏗️",
    coverage: "Full (Iframe)",
    patterns: ["icims.com"]
  },
  {
    name: "Ashby",
    icon: "⚡",
    coverage: "Full",
    patterns: ["jobs.ashby.com", "ashby.com/jobs"]
  },
  {
    name: "SmartRecruiters",
    icon: "🧠",
    coverage: "Full",
    patterns: ["jobs.smartrecruiters.com"]
  },
  {
    name: "BambooHR",
    icon: "🎋",
    coverage: "Full",
    patterns: ["bamboohr.com"]
  },
  {
    name: "LinkedIn",
    icon: "💼",
    coverage: "Full (Dedicated Script)",
    patterns: ["linkedin.com"]
  },
  {
    name: "Naukri",
    icon: "🇮🇳",
    coverage: "Full (Dedicated Script)",
    patterns: ["naukri.com"]
  },
  {
    name: "Indeed",
    icon: "🔍",
    coverage: "Full (Dedicated Script)",
    patterns: ["indeed.com"]
  },
  {
    name: "Wellfound",
    icon: "🚀",
    coverage: "Full",
    patterns: ["wellfound.com", "angel.co"]
  },
  {
    name: "SAP SuccessFactors",
    icon: "⚙️",
    coverage: "Partial",
    patterns: ["successfactors.com", "sapsf.com"]
  },
  {
    name: "Taleo",
    icon: "🔧",
    coverage: "Partial",
    patterns: ["taleo.net"]
  },
  {
    name: "Rippling ATS",
    icon: "🌊",
    coverage: "Full",
    patterns: ["ats.rippling.com"]
  },
  {
    name: "Cutshort",
    icon: "✂️",
    coverage: "Full",
    patterns: ["cutshort.io"]
  },
  {
    name: "Instahyre",
    icon: "⚡",
    coverage: "Full",
    patterns: ["instahyre.com"]
  },
];

function detectATS(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  return ATS_PLATFORMS.find(ats => ats.patterns.some(p => u.includes(p))) || null;
}

// ─────────────────────────────────────────────────────────────────
// COMPLETENESS RENDERING
// ─────────────────────────────────────────────────────────────────
function renderCompleteness(profile, container) {
  const pct = profile._completeness_pct ?? 0;
  const missing = profile._missing_fields ?? [];

  // Color based on completeness
  let fillColor = "#ef4444"; // red < 40%
  if (pct >= 40) fillColor = "#f59e0b"; // amber 40-79%
  if (pct >= 80) fillColor = "#10b981"; // green 80%+

  const missingChips = missing.slice(0, 5).map(f => {
    const label = f.replace(/_/g, " ");
    return `<span class="chip">⚠ ${label}</span>`;
  }).join("");

  const extraCount = missing.length - 5;
  const extraChip = extraCount > 0
    ? `<span class="chip chip-more">+${extraCount} more</span>`
    : "";

  container.innerHTML = `
    <div class="completeness-section">
      <div class="completeness-header">
        <span class="completeness-label">Profile Completeness</span>
        <span class="completeness-pct" style="color:${fillColor}">${pct}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%; background:${fillColor};"></div>
      </div>
      ${missing.length > 0 ? `<div class="missing-chips">${missingChips}${extraChip}</div>` : ""}
    </div>
    <div class="divider" style="margin: 8px 0;"></div>
    <div class="profile-info">
      <div class="profile-row">
        <span class="label">Name</span>
        <span class="value ${!profile.first_name ? 'missing' : ''}" title="${profile.first_name || ''} ${profile.last_name || ''}">
          ${profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : "⚠ Missing"}
        </span>
      </div>
      <div class="profile-row">
        <span class="label">Email</span>
        <span class="value ${!profile.email ? 'missing' : ''}" title="${profile.email || ''}">
          ${profile.email || "⚠ Missing"}
        </span>
      </div>
      <div class="profile-row">
        <span class="label">Phone</span>
        <span class="value ${!profile.phone ? 'missing' : ''}">${profile.phone || "⚠ Missing"}</span>
      </div>
      <div class="profile-row">
        <span class="label">Current Role</span>
        <span class="value ${!profile.current_job_title ? 'missing' : ''}" title="${profile.current_job_title || ''}">
          ${profile.current_job_title || "⚠ Missing"}
        </span>
      </div>
      <div class="profile-row">
        <span class="label">Experience</span>
        <span class="value ${!profile.total_years_experience ? 'missing' : ''}">
          ${profile.total_years_experience ? profile.total_years_experience + " yrs" : "⚠ Missing"}
        </span>
      </div>
      <div class="profile-row">
        <span class="label">Resume</span>
        <span class="value ${!profile.resume_url ? 'missing' : ''}">
          ${profile.resume_url ? "✓ Saved" : "⚠ Missing"}
        </span>
      </div>
      <div class="profile-row">
        <span class="label">GitHub</span>
        <span class="value ${!profile.github ? 'missing' : ''}" title="${profile.github || ''}">
          ${profile.github ? profile.github.replace("https://github.com/", "@") : "⚠ Missing"}
        </span>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("status-badge");
  const profileDetails = document.getElementById("profile-details");
  const autofillBtn = document.getElementById("autofill-btn");
  const errorBox = document.getElementById("error-box");
  const manualLoginBox = document.getElementById("manual-login-box");
  const manualTokenInput = document.getElementById("manual-token-input");
  const saveManualTokenBtn = document.getElementById("save-manual-token-btn");
  const atsBadge = document.getElementById("ats-badge");
  const atsIcon = document.getElementById("ats-icon");
  const atsLabel = document.getElementById("ats-label");
  const atsCoverage = document.getElementById("ats-coverage");
  const completeProfileLink = document.getElementById("complete-profile-link");
  const tailorBtn = document.getElementById("tailor-btn");
  const tailorStatus = document.getElementById("tailor-status");
  const tailorStatusText = document.getElementById("tailor-status-text");

  let userProfile = null;
  let token = null;

  // ── Detect ATS from active tab ──
  async function detectCurrentATS() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return;
      const ats = detectATS(tab.url);
      if (ats) {
        atsBadge.style.display = "flex";
        atsIcon.textContent = ats.icon;
        atsLabel.textContent = ats.name;
        atsCoverage.textContent = ats.coverage;
      }
    } catch (_) {}
  }

  // ── Token retrieval logic ──
  async function checkConnection() {
    errorBox.style.display = "none";
    userProfile = null;
    token = null;

    // 1. From storage
    const stored = await chrome.storage.local.get(["supabase_token"]);
    if (stored.supabase_token) token = stored.supabase_token;

    // 2. From open tab localStorage
    if (!token) {
      try {
        const allTabs = await chrome.tabs.query({});
        const tabs = allTabs.filter(t => t.url && (
          t.url.includes("localhost") ||
          t.url.includes("127.0.0.1") ||
          t.url.includes("vercel.app") ||
          t.url.includes("study-tracker")
        ));
        for (const tab of tabs) {
          if (!tab.id) continue;
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
                  try {
                    const data = JSON.parse(localStorage.getItem(key));
                    return data?.access_token || null;
                  } catch (_) { return null; }
                }
              }
              return null;
            }
          });
          if (results?.[0]?.result) {
            token = results[0].result;
            const isProd = tab.url.includes("vercel.app") || tab.url.includes("study-tracker");
            const backendUrl = isProd ? "https://promaxrahul-study-tracker-backend.hf.space" : "http://localhost:8000";
            await chrome.storage.local.set({ supabase_token: token, backend_url: backendUrl });
            break;
          }
        }
      } catch (_) {}
    }

    // 3. From cookies
    if (!token) {
      try {
        const targets = [
          { url: "http://localhost:3000" },
          { url: "http://localhost:3001" },
          { url: "https://study-tracker-patil.vercel.app" }
        ];
        for (const target of targets) {
          const cookies = await chrome.cookies.getAll({ url: target.url });
          for (const cookie of cookies) {
            const isTokenCookie = cookie.name.startsWith("sb-") && (
              cookie.name.endsWith("-auth-token") || cookie.name.includes("-auth-token.")
            );
            if (isTokenCookie) {
              try {
                const decoded = decodeURIComponent(cookie.value);
                const parsed = JSON.parse(decoded);
                const t = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
                if (t) {
                  token = t;
                  const isProd = target.url.includes("vercel.app") || target.url.includes("study-tracker");
                  const backendUrl = isProd ? "https://promaxrahul-study-tracker-backend.hf.space" : "http://localhost:8000";
                  await chrome.storage.local.set({ supabase_token: t, backend_url: backendUrl });
                  break;
                }
              } catch (_) {
                try {
                  const parsed = JSON.parse(atob(cookie.value));
                  const t = parsed?.access_token || parsed?.[0];
                  if (t) {
                    token = t;
                    const isProd = target.url.includes("vercel.app") || target.url.includes("study-tracker");
                    const backendUrl = isProd ? "https://promaxrahul-study-tracker-backend.hf.space" : "http://localhost:8000";
                    await chrome.storage.local.set({ supabase_token: t, backend_url: backendUrl });
                    break;
                  }
                } catch (__) {}
              }
            }
          }
          if (token) break;
        }
      } catch (_) {}
    }

    // Not connected
    if (!token) {
      statusBadge.textContent = "Disconnected";
      statusBadge.className = "status-badge";
      // Resolve BACKEND_URL dynamically to know which login page link to show
      const storedBackend = await chrome.storage.local.get(["backend_url"]);
      const appUrl = (storedBackend.backend_url || "").includes("promaxrahul")
        ? "https://study-tracker-patil.vercel.app"
        : "http://localhost:3000";
      profileDetails.innerHTML = `
        <div style="text-align:center; padding:10px 0;">
          <p style="margin:0 0 8px; font-size:12px; color:#94a3b8;">Not logged in to Study Tracker.</p>
          <a href="${appUrl}" target="_blank" style="color:#6366f1; font-weight:600; font-size:12px; text-decoration:none;">Open App & Log In →</a>
        </div>
      `;
      manualLoginBox.style.display = "flex";
      autofillBtn.disabled = true;
      return;
    }

    // Resolve BACKEND_URL from local storage or open tabs
    const storedBackend = await chrome.storage.local.get(["backend_url"]);
    if (storedBackend.backend_url) {
      BACKEND_URL = storedBackend.backend_url;
    } else {
      try {
        const tabs = await chrome.tabs.query({});
        const hasLocal = tabs.some(t => t.url && (t.url.includes("localhost") || t.url.includes("127.0.0.1")));
        const hasProd = tabs.some(t => t.url && (t.url.includes("vercel.app") || t.url.includes("study-tracker")));
        if (hasProd && !hasLocal) {
          BACKEND_URL = "https://promaxrahul-study-tracker-backend.hf.space";
        } else {
          BACKEND_URL = "http://localhost:8000";
        }
      } catch (_) {
        BACKEND_URL = "http://localhost:8000";
      }
    }

    // Fetch profile
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        // Fallback to alternative backend URL if fetch failed (network error)
        const altUrl = BACKEND_URL === "http://localhost:8000"
          ? "https://promaxrahul-study-tracker-backend.hf.space"
          : "http://localhost:8000";
        res = await fetch(`${altUrl}/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          BACKEND_URL = altUrl;
          await chrome.storage.local.set({ backend_url: BACKEND_URL });
        } else {
          throw err;
        }
      }

      if (!res.ok) throw new Error(`Session expired (${res.status})`);

      const profile = await res.json();
      userProfile = profile;
      await chrome.storage.local.set({ user_profile: profile });

      statusBadge.textContent = "Connected";
      statusBadge.className = "status-badge connected";
      manualLoginBox.style.display = "none";

      renderCompleteness(profile, profileDetails);

      autofillBtn.disabled = false;
      tailorBtn.disabled = false;

      // Show "Complete Profile" link if < 80% complete
      const pct = profile._completeness_pct ?? 0;
      if (pct < 80) {
        completeProfileLink.style.display = "block";
      }

    } catch (err) {
      await chrome.storage.local.remove("supabase_token");
      statusBadge.textContent = "Error";
      statusBadge.className = "status-badge";
      errorBox.textContent = err.message;
      errorBox.style.display = "block";
      manualLoginBox.style.display = "flex";
      autofillBtn.disabled = true;
      tailorBtn.disabled = true;
      profileDetails.innerHTML = `
        <div style="text-align:center; color:#94a3b8; font-size:11px; padding:8px 0;">
          Failed to sync profile. Try pasting the token again.
        </div>
      `;
    }
  }

  // ── Manual token save ──
  saveManualTokenBtn.addEventListener("click", async () => {
    const rawVal = manualTokenInput.value.trim();
    if (!rawVal) return;
    saveManualTokenBtn.textContent = "Saving...";
    saveManualTokenBtn.disabled = true;
    let tokenToSave = rawVal;
    if (rawVal.startsWith("{")) {
      try {
        const parsed = JSON.parse(rawVal);
        tokenToSave = parsed.access_token || parsed.token || rawVal;
      } catch (_) {}
    }

    // Set default backendUrl based on active tab or open tabs
    let backendUrl = "http://localhost:8000";
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const isProd = activeTab?.url && (activeTab.url.includes("vercel.app") || activeTab.url.includes("study-tracker"));
      if (isProd) {
        backendUrl = "https://promaxrahul-study-tracker-backend.hf.space";
      } else {
        const tabs = await chrome.tabs.query({});
        const hasProd = tabs.some(t => t.url && (t.url.includes("vercel.app") || t.url.includes("study-tracker")));
        const hasLocal = tabs.some(t => t.url && (t.url.includes("localhost") || t.url.includes("127.0.0.1")));
        if (hasProd && !hasLocal) {
          backendUrl = "https://promaxrahul-study-tracker-backend.hf.space";
        }
      }
    } catch (_) {}

    await chrome.storage.local.set({ supabase_token: tokenToSave, backend_url: backendUrl });
    manualTokenInput.value = "";
    saveManualTokenBtn.textContent = "Save";
    saveManualTokenBtn.disabled = false;
    await checkConnection();
  });

  // ── Autofill button ──
  autofillBtn.addEventListener("click", async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) throw new Error("No active tab found");

      errorBox.style.display = "none";
      autofillBtn.textContent = "Filling...";
      autofillBtn.disabled = true;

      // Try to fetch the resume and convert to base64 in the popup (extension context)
      let resumeFile = null;
      if (userProfile?.resume_url) {
        try {
          const res = await fetch(userProfile.resume_url);
          if (res.ok) {
            const blob = await res.blob();
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result.split(",")[1]);
              reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            const base64Data = await base64Promise;
            const filename = userProfile.resume_url.split("/").pop().split("?")[0] || "Resume.pdf";
            resumeFile = {
              base64: base64Data,
              filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
              mimeType: blob.type || "application/pdf"
            };
            console.log("Successfully fetched and encoded resume in popup:", filename);
          }
        } catch (fetchErr) {
          console.warn("Popup failed to pre-fetch resume:", fetchErr);
        }
      }

      chrome.tabs.sendMessage(activeTab.id, {
        action: "autofill",
        profile: userProfile,
        resumeFile: resumeFile
      }, (response) => {
        const lastErr = chrome.runtime.lastError;
        if (lastErr) {
          errorBox.textContent = "Extension not active on this page. Navigate to a job application and try again.";
          errorBox.style.display = "block";
          autofillBtn.textContent = "⚡ Autofill Application";
          autofillBtn.disabled = false;
          return;
        }

        if (response?.success) {
          const count = response.filled || 0;
          const note = response.note || "";
          autofillBtn.textContent = `✓ Filled ${count} fields!`;
          autofillBtn.style.background = "#10b981";
          autofillBtn.style.boxShadow = "0 4px 14px rgba(16, 185, 129, 0.4)";
          if (note) {
            errorBox.textContent = "ℹ " + note;
            errorBox.style.color = "#34d399";
            errorBox.style.background = "rgba(16, 185, 129, 0.07)";
            errorBox.style.borderColor = "rgba(16, 185, 129, 0.2)";
            errorBox.style.display = "block";
          }
          setTimeout(() => {
            autofillBtn.textContent = "⚡ Autofill Application";
            autofillBtn.style.background = "#6366f1";
            autofillBtn.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
            autofillBtn.disabled = false;
            errorBox.style.display = "none";
            errorBox.style.color = "#f87171";
          }, 4000);
        } else {
          errorBox.textContent = response?.error || "Could not find matching form fields on this page.";
          errorBox.style.display = "block";
          autofillBtn.textContent = "⚡ Autofill Application";
          autofillBtn.disabled = false;
        }
      });
    } catch (e) {
      errorBox.textContent = e.message;
      errorBox.style.display = "block";
      autofillBtn.textContent = "⚡ Autofill Application";
      autofillBtn.disabled = false;
    }
  });

  // ── TAILOR BUTTON ──
  tailorBtn.addEventListener("click", async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) throw new Error("No active tab found");

      // Show loading
      tailorBtn.disabled = true;
      autofillBtn.disabled = true;
      tailorStatus.style.display = "flex";
      tailorStatusText.textContent = "Scraping job description...";
      errorBox.style.display = "none";

      // Step 1: Scrape job description from the active page
      let jd = "";
      let jobTitle = "";
      let companyName = "";

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            // Scrape job description — platform-specific selectors + generic fallback
            const selectors = [
              // LinkedIn
              ".jobs-description__content",
              ".jobs-box__html-content",
              ".jobs-description-content__text",
              // Naukri
              "#job-description",
              ".job-description",
              ".jd-desc",
              ".jd",
              // Indeed
              "#jobDescriptionText",
              ".jobsearch-jobDescriptionText",
              // Lever
              ".posting-requirements",
              ".posting-description",
              // Greenhouse
              "#content .description",
              // Workday
              ".job-req-description",
              // Ashby
              ".ashby-job-posting-description",
              // Generic
              "[class*='job-description']",
              "[class*='jobDescription']",
              "[class*='description']",
              "[id*='description']",
              "main article",
              "article",
            ];

            let jdText = "";
            for (const sel of selectors) {
              const el = document.querySelector(sel);
              if (el && el.innerText && el.innerText.trim().length > 200) {
                jdText = el.innerText.trim();
                break;
              }
            }

            // Fallback: grab the longest text block on the page
            if (!jdText) {
              const candidates = Array.from(document.querySelectorAll("p, div, section"))
                .map(el => ({ el, len: el.innerText?.trim().length || 0 }))
                .filter(x => x.len > 300)
                .sort((a, b) => b.len - a.len);
              if (candidates.length > 0) jdText = candidates[0].el.innerText.trim();
            }

            // Scrape job title and company
            const titleEl = document.querySelector(
              "h1, .job-title, .jobs-unified-top-card__job-title, " +
              ".jobsearch-JobInfoHeader-title, .naukri-job-title, " +
              "[class*='job-title'], [class*='jobTitle']"
            );
            const companyEl = document.querySelector(
              ".jobs-unified-top-card__company-name a, " +
              ".jobsearch-InlineCompanyRating-companyName, " +
              ".jdp-company-name, [class*='company-name'], " +
              "[class*='companyName'], [data-company-name]"
            );

            return {
              jd: jdText.slice(0, 6000),
              jobTitle: titleEl?.innerText?.trim() || document.title || "",
              companyName: companyEl?.innerText?.trim() || "",
            };
          }
        });

        if (results?.[0]?.result) {
          jd = results[0].result.jd || "";
          jobTitle = results[0].result.jobTitle || "";
          companyName = results[0].result.companyName || "";
        }
      } catch (scrapeErr) {
        console.warn("JD scrape error:", scrapeErr);
      }

      if (!jd || jd.length < 100) {
        throw new Error(
          "Could not find a job description on this page. " +
          "Navigate to the full job posting and try again."
        );
      }

      // Step 2: Call backend AI tailor
      tailorStatusText.textContent = `AI is tailoring your profile for ${companyName || 'this job'}...`;

      const res = await fetch(`${BACKEND_URL}/ai/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: jd,
          job_title: jobTitle,
          company_name: companyName,
          profile: userProfile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Backend error ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error("AI tailoring returned no data");

      // Step 3: Store results and open side panel
      await chrome.storage.local.set({
        tailor_result: data.tailored,
        tailor_job_title: jobTitle || data.job_title || "Unknown Role",
        tailor_company_name: companyName || data.company_name || "Unknown Company",
        tailor_job_description: jd,
        user_profile: userProfile,
      });

      tailorStatusText.textContent = "Opening Review Panel...";

      // Step 4: Open the side panel
      await chrome.sidePanel.open({ tabId: activeTab.id });

      tailorStatus.style.display = "none";
      tailorBtn.disabled = false;
      autofillBtn.disabled = false;

    } catch (e) {
      tailorStatus.style.display = "none";
      tailorBtn.disabled = false;
      autofillBtn.disabled = false;
      errorBox.textContent = e.message;
      errorBox.style.display = "block";
      console.error("Tailor error:", e);
    }
  });

  // ── Init ──
  await detectCurrentATS();
  await checkConnection();
});
