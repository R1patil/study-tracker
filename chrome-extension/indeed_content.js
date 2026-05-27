/**
 * Jarvis OS — Indeed Content Script
 * Handles Indeed Easy Apply:
 *   1. Direct apply page on indeed.com / in.indeed.com
 *   2. Sidebar apply widget (#indeed-ia / .ia-container)
 *   3. Indeed's custom data-testid DOM pattern
 */

console.log("Jarvis OS: Indeed handler v1.0 active.");

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────
function setNativeValue(element, value) {
  if (!element || value === null || value === undefined) return false;
  const lastValue = element.value;
  element.value = String(value);
  const tracker = element._valueTracker;
  if (tracker) tracker.setValue(lastValue);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
  return true;
}

function matchesKeywords(str, keywords) {
  if (!str) return false;
  const s = str.toLowerCase();
  return keywords.some(k => s.includes(k.toLowerCase()));
}

function getLabelText(input) {
  // Indeed uses data-testid heavily — extract the value as a label hint
  const testId = input.getAttribute("data-testid") || "";
  if (testId) {
    const humanized = testId.replace(/-/g, " ").replace(/_/g, " ");
    if (humanized) return humanized;
  }

  if (input.getAttribute("aria-label")) return input.getAttribute("aria-label");

  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy.split(" ")
      .map(id => document.getElementById(id)?.textContent || "")
      .join(" ").trim();
    if (text) return text;
  }

  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label?.textContent) return label.textContent.trim();
  }

  // Walk up for label
  let parent = input.parentElement;
  for (let i = 0; i < 5; i++) {
    if (!parent) break;
    const label = parent.querySelector(
      "label, .ia-Questions-item--label, [class*='label'], [class*='Label'], legend, fieldset legend"
    );
    if (label && label !== input && label.textContent.trim()) return label.textContent.trim();
    parent = parent.parentElement;
  }

  return input.placeholder || input.name || "";
}

function fillSelect(select, value) {
  if (!value || !select) return false;
  const valLower = value.toLowerCase();
  for (const option of select.options) {
    if (option.text.toLowerCase().includes(valLower) || option.value.toLowerCase().includes(valLower)) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// INDEED: Find the apply form container
// Indeed loads the form in:
//   - #ia-container (sidebar widget)
//   - .ia-BasePage (full page apply)
//   - iframe#indeed-apply-iframe (rare iframe case)
// ─────────────────────────────────────────────
function getIndeedFormRoot() {
  return (
    document.querySelector("#ia-container") ||
    document.querySelector(".ia-BasePage") ||
    document.querySelector(".indeed-apply-widget") ||
    document.querySelector("[data-testid='ia-container']") ||
    document
  );
}

// ─────────────────────────────────────────────
// INDEED: Fill radio/button-style YES/NO answers
// Indeed uses <input type="radio"> with aria labels
// ─────────────────────────────────────────────
function fillIndeedRadio(root, questionKeywords, answer) {
  const radios = root.querySelectorAll("input[type='radio']");
  const answerLower = answer.toLowerCase();

  // Group by name
  const groups = {};
  radios.forEach(r => {
    if (!groups[r.name]) groups[r.name] = [];
    groups[r.name].push(r);
  });

  for (const [, group] of Object.entries(groups)) {
    const firstLabel = getLabelText(group[0]);
    const containerLabel = group[0].closest("fieldset")?.querySelector("legend")?.textContent || firstLabel;

    if (matchesKeywords(containerLabel, questionKeywords)) {
      for (const radio of group) {
        const radioLabel = getLabelText(radio).toLowerCase();
        const radioVal = (radio.value || "").toLowerCase();
        if (radioLabel.includes(answerLower) || radioVal.includes(answerLower)) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          radio.dispatchEvent(new Event("click", { bubbles: true }));
          return true;
        }
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// MAIN AUTOFILL FUNCTION
// ─────────────────────────────────────────────
function autofillIndeed(profile) {
  if (!profile) return 0;
  let filledCount = 0;

  const p = profile;
  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();
  const root = getIndeedFormRoot();

  const fieldMap = [
    // Personal
    { keywords: ["first name", "firstname", "given name", "first-name"], value: p.first_name },
    { keywords: ["last name", "lastname", "surname", "family name", "last-name"], value: p.last_name },
    { keywords: ["full name", "your name", "name", "candidate name"], value: fullName },
    { keywords: ["email", "e-mail", "email address"], value: p.email },
    { keywords: ["phone", "mobile", "telephone", "cell", "phone number"], value: p.phone },

    // Address
    { keywords: ["city", "location", "town", "current city"], value: p.city },
    { keywords: ["state", "province", "region"], value: p.state },
    { keywords: ["zip", "postal", "zip code", "pincode", "pin code"], value: p.zip_code },
    { keywords: ["country"], value: p.country },
    { keywords: ["address", "street"], value: p.address_line1 },

    // Professional
    { keywords: ["current title", "job title", "title", "designation", "current position", "current role"], value: p.current_job_title },
    { keywords: ["company", "current company", "current employer", "employer"], value: p.current_company },
    { keywords: ["years of experience", "experience", "total experience", "work experience"], value: p.total_years_experience },
    { keywords: ["notice period", "notice", "availability"], value: p.notice_period_text },
    { keywords: ["start date", "when can you start", "available from", "joining"], value: p.availability_to_join },
    { keywords: ["expected salary", "salary expectation", "desired salary", "expected ctc"], value: p.expected_ctc },
    { keywords: ["current salary", "current ctc", "last drawn"], value: p.current_ctc },

    // Online
    { keywords: ["linkedin", "linkedin url"], value: p.linkedin },
    { keywords: ["github", "github url"], value: p.github },
    { keywords: ["website", "portfolio"], value: p.website },

    // Education
    { keywords: ["degree", "highest qualification", "education level"], value: p.highest_degree },
    { keywords: ["major", "field of study", "specialization", "stream"], value: p.major },
    { keywords: ["university", "college", "institution", "school"], value: p.university },
    { keywords: ["graduation year", "year of passing", "graduating year"], value: p.graduation_year },
    { keywords: ["gpa", "cgpa", "grade", "percentage"], value: p.cgpa },

    // Cover / Summary
    {
      keywords: [
        "cover letter", "cover note", "additional information",
        "message to hiring", "tell us about yourself", "about yourself",
        "why are you interested", "why do you want to work", "summary"
      ],
      value: p.summary
    },
    { keywords: ["skills", "technical skills", "key skills"], value: p.skills_text },

    // Work Auth
    { keywords: ["authorized", "work authorization", "legally authorized", "right to work"], value: "Yes" },
    { keywords: ["sponsorship", "visa sponsorship", "require sponsorship"], value: p.require_visa_sponsorship },
    { keywords: ["relocate", "willing to relocate", "open to relocation"], value: p.willing_to_relocate },
  ];

  // ── Text inputs & textareas ──
  const textInputs = root.querySelectorAll(
    "input:not([type=file]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]), textarea"
  );
  const inputsArr = Array.from(textInputs);
  const hasFirstName = inputsArr.some(i =>
    matchesKeywords(`${i.name} ${i.id} ${i.placeholder} ${getLabelText(i)}`, ["first name", "firstname"])
  );

  textInputs.forEach(input => {
    if (input.disabled || input.readOnly) return;
    const labelText = getLabelText(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${labelText} ${input.getAttribute("data-testid") || ""}`.toLowerCase();

    for (const field of fieldMap) {
      if (!field.value) continue;
      const isFullName = matchesKeywords(testStr, ["full name", "fullname", "candidate name"]);
      if (field.value === fullName && hasFirstName && !isFullName) continue;

      if (matchesKeywords(testStr, field.keywords)) {
        if (setNativeValue(input, field.value)) filledCount++;
        break;
      }
    }
  });

  // ── Select dropdowns ──
  root.querySelectorAll("select").forEach(select => {
    if (select.disabled) return;
    const labelText = getLabelText(select);
    const testStr = `${select.name || ""} ${select.id || ""} ${labelText} ${select.getAttribute("data-testid") || ""}`.toLowerCase();

    const selectMap = [
      { keywords: ["country"], value: p.country },
      { keywords: ["state", "province"], value: p.state },
      { keywords: ["gender"], value: p.gender },
      { keywords: ["degree", "qualification", "education"], value: p.highest_degree },
      { keywords: ["experience", "years"], value: p.total_years_experience },
      { keywords: ["notice period", "notice"], value: p.notice_period_days },
      { keywords: ["job type", "employment type"], value: p.job_type },
      { keywords: ["work mode", "remote", "hybrid", "on-site"], value: p.work_mode_preference },
      { keywords: ["source", "how did you hear", "referral"], value: p.referral_source },
      { keywords: ["language", "english"], value: p.english_proficiency },
      { keywords: ["relocate"], value: p.willing_to_relocate },
      { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship },
      { keywords: ["race", "ethnicity"], value: p.race_ethnicity },
      { keywords: ["veteran"], value: p.veteran_status },
      { keywords: ["disability"], value: p.disability_status },
    ];

    for (const field of selectMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        if (fillSelect(select, field.value)) { filledCount++; break; }
      }
    }
  });

  // ── Radio buttons (YES/NO style) ──
  const radioQA = [
    { keywords: ["authorized", "work authorization", "legally authorized", "eligible to work"], answer: "yes" },
    { keywords: ["sponsorship", "visa sponsorship", "require sponsorship"], answer: p.require_visa_sponsorship === "No" ? "no" : "yes" },
    { keywords: ["relocate", "willing to relocate", "relocation"], answer: "yes" },
    { keywords: ["currently employed", "currently working", "employed"], answer: "yes" },
    { keywords: ["remote", "work from home"], answer: "yes" },
    { keywords: ["travel", "willing to travel"], answer: "yes" },
    { keywords: ["veteran", "military"], answer: "not a veteran" },
    { keywords: ["disability", "disabled"], answer: "no" },
  ];

  radioQA.forEach(({ keywords, answer }) => {
    if (fillIndeedRadio(root, keywords, answer)) filledCount++;
  });

  // ── Checkboxes: auto-check consent ──
  root.querySelectorAll("input[type='checkbox']").forEach(cb => {
    const labelText = getLabelText(cb).toLowerCase();
    const testStr = `${cb.name || ""} ${cb.id || ""} ${labelText}`;
    if (
      testStr.includes("agree") || testStr.includes("consent") ||
      testStr.includes("terms") || testStr.includes("privacy") ||
      testStr.includes("authorize") || testStr.includes("confirm") ||
      testStr.includes("certify") || testStr.includes("eligible")
    ) {
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
        filledCount++;
      }
    }
  });

  console.log(`Jarvis OS [Indeed]: Filled ${filledCount} fields.`);
  return filledCount;
}

// ─────────────────────────────────────────────
// MESSAGE LISTENER
// ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill") {
    try {
      const profile = request.profile;
      if (!profile) {
        sendResponse({ success: false, error: "No profile data found" });
        return true;
      }

      const filled = autofillIndeed(profile);
      sendResponse({
        success: true,
        filled,
        note: filled > 0
          ? "Indeed application filled! If multi-step, click 'Continue' then Autofill again."
          : "No fields found. Make sure you clicked 'Apply Now' and the form is open."
      });
    } catch (e) {
      console.error("Jarvis Indeed autofill error:", e);
      sendResponse({ success: false, error: e.message });
    }
  }

  // Handle tailored profile from the HITL Review Panel
  if (request.action === "autofill_tailored") {
    try {
      const profile = request.profile;
      if (!profile) {
        sendResponse({ success: false, error: "No tailored profile data" });
        return true;
      }
      cachedIndeedProfile = profile;
      const filled = autofillIndeed(profile);
      sendResponse({ success: true, filled });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }

  return true;
});

// ─────────────────────────────────────────────
// MUTATION OBSERVER — Indeed sidebar loads dynamically
// The #ia-container is injected into the DOM when user
// clicks "Apply Now" button on job listing page.
// ─────────────────────────────────────────────
let indeedObserver = null;
let cachedIndeedProfile = null;
let lastIndeedPageFilled = null;

async function getIndeedProfile() {
  if (cachedIndeedProfile) return cachedIndeedProfile;
  return new Promise(resolve => {
    chrome.storage.local.get(["user_profile"], result => {
      cachedIndeedProfile = result.user_profile || null;
      resolve(cachedIndeedProfile);
    });
  });
}

indeedObserver = new MutationObserver(async mutations => {
  const sidebarAppeared = mutations.some(m =>
    Array.from(m.addedNodes).some(node =>
      node.nodeType === 1 && (
        node.id === "ia-container" ||
        node.classList?.contains("ia-BasePage") ||
        node.querySelector?.("#ia-container, .ia-BasePage, .indeed-apply-widget")
      )
    )
  );

  // Also watch for new form steps (step counter text changes)
  const hasNewInputs = mutations.some(m =>
    Array.from(m.addedNodes).some(node =>
      node.nodeType === 1 &&
      node.querySelector?.("input:not([type=hidden]), textarea, select")
    )
  );

  if (!sidebarAppeared && !hasNewInputs) return;

  // Identify current page/step to avoid duplicate fills
  const pageTitle = document.querySelector(
    ".ia-Questions-item--title, [data-testid='page-title'], .ia-BasePage-title"
  )?.textContent?.trim();
  if (pageTitle && pageTitle === lastIndeedPageFilled) return;
  lastIndeedPageFilled = pageTitle;

  await new Promise(r => setTimeout(r, 700));
  const profile = await getIndeedProfile();
  if (!profile) return;

  const filled = autofillIndeed(profile);
  if (filled > 0) console.log(`Jarvis OS [Indeed Auto]: Auto-filled ${filled} fields.`);
});

indeedObserver.observe(document.body, { childList: true, subtree: true });

console.log("Jarvis OS: Indeed MutationObserver watching for apply widget...");
