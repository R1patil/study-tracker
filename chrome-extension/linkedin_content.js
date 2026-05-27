/**
 * Jarvis OS — LinkedIn Easy Apply Content Script
 * Handles LinkedIn's multi-step Easy Apply modal with MutationObserver.
 * DOM: div[data-test-modal], input[id^="jobs-apply-form"], artdeco-text-input
 */

console.log("Jarvis OS: LinkedIn Easy Apply handler v1.0 active.");

// ─────────────────────────────────────────────
// SHARED UTILITIES (mirrored from content.js)
// ─────────────────────────────────────────────
function setNativeValue(element, value) {
  if (!element || !value) return false;
  const lastValue = element.value;
  element.value = value;
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
  // 1. aria-label
  if (input.getAttribute("aria-label")) return input.getAttribute("aria-label");

  // 2. aria-labelledby
  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy.split(" ")
      .map(id => document.getElementById(id)?.textContent || "")
      .join(" ").trim();
    if (text) return text;
  }

  // 3. associated <label for="">
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label?.textContent) return label.textContent.trim();
  }

  // 4. LinkedIn-specific: artdeco-form__label inside parent
  let parent = input.parentElement;
  for (let i = 0; i < 6; i++) {
    if (!parent) break;
    const label = parent.querySelector(
      ".artdeco-text-input--label, label, .fb-form-element-label, legend, [class*='label']"
    );
    if (label && label !== input && label.textContent.trim()) {
      return label.textContent.trim();
    }
    parent = parent.parentElement;
  }

  return input.placeholder || input.name || "";
}

function fillSelect(select, value) {
  if (!value || !select) return false;
  const valLower = value.toLowerCase();
  for (const option of select.options) {
    if (
      option.text.toLowerCase().includes(valLower) ||
      option.value.toLowerCase().includes(valLower)
    ) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// LINKEDIN-SPECIFIC: Fill phone country code
// ─────────────────────────────────────────────
function fillPhoneCountryCode(profile) {
  // LinkedIn renders a custom flag dropdown for phone country code
  const countrySelect = document.querySelector(
    "select[id*='phoneNumber-country'], select[name*='phoneNumber-country'], " +
    "select[data-test-phone-country-code], select[id*='phone-country']"
  );
  if (countrySelect && profile.phone_country_code) {
    fillSelect(countrySelect, profile.phone_country_code);
  }
}

// ─────────────────────────────────────────────
// LINKEDIN-SPECIFIC: Handle typeahead/autocomplete inputs
// LinkedIn uses artdeco-typeahead for fields like "Current Company"
// ─────────────────────────────────────────────
function fillTypeahead(input, value) {
  if (!input || !value) return false;
  setNativeValue(input, value);
  // Trigger keydown to force dropdown, then blur to accept
  input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, keyCode: 40 }));
  setTimeout(() => {
    input.dispatchEvent(new Event("blur", { bubbles: true }));
  }, 300);
  return true;
}

// ─────────────────────────────────────────────
// LINKEDIN-SPECIFIC: Handle radio buttons
// LinkedIn uses <fieldset> + <label> based radio groups
// ─────────────────────────────────────────────
function fillLinkedInRadio(container, value) {
  if (!container || !value) return false;
  const valLower = value.toLowerCase();
  const options = container.querySelectorAll(
    "input[type='radio'], [role='radio'], .fb-form-element input"
  );
  for (const option of options) {
    const label = getLabelText(option).toLowerCase();
    const val = (option.value || "").toLowerCase();
    if (label.includes(valLower) || val.includes(valLower)) {
      option.checked = true;
      option.dispatchEvent(new Event("change", { bubbles: true }));
      option.dispatchEvent(new Event("click", { bubbles: true }));
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// MAIN AUTOFILL — LinkedIn Easy Apply Modal
// ─────────────────────────────────────────────
function autofillLinkedIn(profile) {
  if (!profile) return 0;
  let filledCount = 0;

  const p = profile;
  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();

  // ── Field map: keywords → profile value ──
  const fieldMap = [
    // Contact
    { keywords: ["first name", "firstname", "given name"], value: p.first_name },
    { keywords: ["last name", "lastname", "family name", "surname"], value: p.last_name },
    { keywords: ["full name", "your name", "candidate name"], value: fullName },
    { keywords: ["email", "e-mail"], value: p.email },
    { keywords: ["phone", "mobile", "telephone", "cell"], value: p.phone },

    // Address
    { keywords: ["city", "location", "town"], value: p.city },
    { keywords: ["state", "province"], value: p.state },
    { keywords: ["zip", "postal", "pin code"], value: p.zip_code },
    { keywords: ["country"], value: p.country },

    // Professional
    { keywords: ["current title", "job title", "position", "designation", "current role"], value: p.current_job_title },
    { keywords: ["current company", "employer", "company name", "organization", "current employer"], value: p.current_company },
    { keywords: ["years of experience", "experience", "work experience"], value: p.total_years_experience },
    { keywords: ["linkedin", "linkedin url", "linked in"], value: p.linkedin },
    { keywords: ["website", "portfolio", "personal website"], value: p.website },
    { keywords: ["github"], value: p.github },

    // Salary / Notice
    { keywords: ["expected salary", "desired salary", "expected ctc", "salary expectation"], value: p.expected_ctc },
    { keywords: ["current salary", "current ctc"], value: p.current_ctc },
    { keywords: ["notice period", "notice", "availability"], value: p.notice_period_text },
    { keywords: ["start date", "when can you start", "joining date"], value: p.availability_to_join },

    // Education
    { keywords: ["degree", "highest qualification", "education"], value: p.highest_degree },
    { keywords: ["major", "field of study", "specialization"], value: p.major },
    { keywords: ["university", "college", "institution"], value: p.university },
    { keywords: ["graduation year", "year of graduation", "passing year"], value: p.graduation_year },
    { keywords: ["gpa", "cgpa", "grade"], value: p.cgpa },

    // Cover letter / Summary
    {
      keywords: [
        "cover letter", "cover note", "additional information",
        "tell us about yourself", "about yourself", "introduce yourself",
        "message to hiring", "why are you interested", "why do you want"
      ],
      value: p.summary
    },

    // Work auth
    { keywords: ["authorized", "work authorization", "right to work", "eligible to work"], value: "Yes" },
    { keywords: ["sponsorship", "visa sponsorship"], value: p.require_visa_sponsorship },
    { keywords: ["relocate", "relocation"], value: p.willing_to_relocate },

    // Behavioral
    { keywords: ["summary", "professional summary", "brief bio"], value: p.summary },
    { keywords: ["skills", "technical skills", "key skills"], value: p.skills_text },
    { keywords: ["why this company", "why us", "why are you applying"], value: p.why_this_company },

    // EEO
    { keywords: ["gender"], value: p.gender },
    { keywords: ["race", "ethnicity"], value: p.race_ethnicity },
    { keywords: ["veteran"], value: p.veteran_status },
    { keywords: ["disability"], value: p.disability_status },
  ];

  // ── Scope to the Easy Apply modal if present ──
  const modal = document.querySelector(
    "[data-test-modal], .jobs-easy-apply-modal, .artdeco-modal--layer-default, " +
    "[aria-label*='Easy Apply'], [aria-label*='easy apply']"
  ) || document;

  // ── Fill text inputs & textareas ──
  const textInputs = modal.querySelectorAll(
    "input:not([type=file]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]), textarea"
  );

  const inputsArr = Array.from(textInputs);
  const hasFirstNameField = inputsArr.some(i =>
    matchesKeywords(`${i.name} ${i.id} ${getLabelText(i)}`, ["first name", "firstname", "given name"])
  );

  textInputs.forEach(input => {
    if (input.disabled || input.readOnly) return;
    const labelText = getLabelText(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${labelText}`.toLowerCase();

    for (const field of fieldMap) {
      if (!field.value) continue;
      const isFullName = matchesKeywords(testStr, ["full name", "fullname", "candidate name"]);
      if (field.value === fullName && hasFirstNameField && !isFullName) continue;

      if (matchesKeywords(testStr, field.keywords)) {
        // Use typeahead fill for company/title fields
        const isTypeahead = input.getAttribute("role") === "combobox" ||
          input.closest("[data-test-single-typeahead-entity-form-component]");
        if (isTypeahead) {
          if (fillTypeahead(input, field.value)) filledCount++;
        } else {
          if (setNativeValue(input, field.value)) filledCount++;
        }
        break;
      }
    }
  });

  // ── Fill select dropdowns ──
  const selects = modal.querySelectorAll("select");
  const selectFieldMap = [
    { keywords: ["country"], value: p.country },
    { keywords: ["state", "province"], value: p.state },
    { keywords: ["gender"], value: p.gender },
    { keywords: ["degree", "qualification", "education level"], value: p.highest_degree },
    { keywords: ["experience", "years of experience"], value: p.total_years_experience },
    { keywords: ["notice period"], value: p.notice_period_days },
    { keywords: ["job type", "employment type"], value: p.job_type },
    { keywords: ["work mode", "remote", "hybrid"], value: p.work_mode_preference },
    { keywords: ["race", "ethnicity"], value: p.race_ethnicity },
    { keywords: ["veteran"], value: p.veteran_status },
    { keywords: ["disability"], value: p.disability_status },
    { keywords: ["source", "how did you hear", "referral"], value: p.referral_source },
    { keywords: ["language", "english proficiency"], value: p.english_proficiency },
    { keywords: ["relocate"], value: p.willing_to_relocate },
    { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship },
    { keywords: ["currency", "salary currency"], value: p.salary_currency },
  ];

  selects.forEach(select => {
    if (select.disabled) return;
    const labelText = getLabelText(select);
    const testStr = `${select.name || ""} ${select.id || ""} ${labelText}`.toLowerCase();
    for (const field of selectFieldMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        if (fillSelect(select, field.value)) { filledCount++; break; }
      }
    }
  });

  // ── Fill phone country code (special LinkedIn widget) ──
  fillPhoneCountryCode(p);

  // ── Fill radio buttons ──
  const radioGroups = {};
  modal.querySelectorAll("input[type=radio]").forEach(radio => {
    const name = radio.name || getLabelText(radio);
    if (!radioGroups[name]) radioGroups[name] = [];
    radioGroups[name].push(radio);
  });

  const radioMap = [
    { keywords: ["relocate", "relocation"], value: "yes" },
    { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship === "No" ? "no" : "yes" },
    { keywords: ["authorized", "work authorization", "legally authorized"], value: "yes" },
    { keywords: ["currently employed", "employed"], value: "yes" },
    { keywords: ["remote", "work from home", "work from anywhere"], value: "yes" },
    { keywords: ["travel"], value: "yes" },
    { keywords: ["gender"], value: p.gender },
    { keywords: ["veteran"], value: "not a veteran" },
    { keywords: ["disability"], value: "no" },
  ];

  for (const [groupName, radios] of Object.entries(radioGroups)) {
    const labelText = getLabelText(radios[0]);
    const testStr = `${groupName} ${labelText}`.toLowerCase();
    for (const field of radioMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        const container = radios[0].closest("fieldset, .fb-form-element, [data-test-form-element]") || document;
        if (fillLinkedInRadio(container, field.value)) { filledCount++; break; }
      }
    }
  }

  // ── Auto-check consent checkboxes ──
  modal.querySelectorAll("input[type=checkbox]").forEach(cb => {
    const labelText = getLabelText(cb).toLowerCase();
    const testStr = `${cb.name || ""} ${cb.id || ""} ${labelText}`;
    if (
      testStr.includes("agree") || testStr.includes("consent") ||
      testStr.includes("terms") || testStr.includes("privacy") ||
      testStr.includes("authorize") || testStr.includes("certify")
    ) {
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
        filledCount++;
      }
    }
  });

  console.log(`Jarvis OS [LinkedIn]: Filled ${filledCount} fields on this step.`);
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
      const filled = autofillLinkedIn(profile);
      sendResponse({
        success: true,
        filled,
        note: filled > 0
          ? "LinkedIn Easy Apply filled! Click 'Next' to continue to next step, then click Autofill again."
          : "No fields found yet — make sure the Easy Apply modal is open."
      });
    } catch (e) {
      console.error("Jarvis LinkedIn autofill error:", e);
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
      // Tailored profile has same shape — run the same fill function
      const filled = autofillLinkedIn(profile);
      // Also store the tailored profile in cache for step-by-step autofill
      cachedProfile = profile;
      sendResponse({ success: true, filled });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }

  return true;
});

// ─────────────────────────────────────────────
// MUTATION OBSERVER — Auto-fill on step change
// Watches the Easy Apply modal for new form steps
// ─────────────────────────────────────────────
let lastStepFilled = null;
let cachedProfile = null;

async function getCachedProfile() {
  if (cachedProfile) return cachedProfile;
  return new Promise(resolve => {
    chrome.storage.local.get(["user_profile"], result => {
      cachedProfile = result.user_profile || null;
      resolve(cachedProfile);
    });
  });
}

function isEasyApplyModal() {
  return !!(
    document.querySelector("[data-test-modal]") ||
    document.querySelector(".jobs-easy-apply-modal") ||
    document.querySelector("[aria-label*='Easy Apply']") ||
    document.querySelector("[aria-label*='easy apply']")
  );
}

const observer = new MutationObserver(async (mutations) => {
  if (!isEasyApplyModal()) return;

  // Debounce — only fire once per step change
  const hasNewInputs = mutations.some(m =>
    Array.from(m.addedNodes).some(node =>
      node.nodeType === 1 &&
      (node.querySelector?.("input, textarea, select") || node.tagName === "INPUT")
    )
  );

  if (!hasNewInputs) return;

  // Grab step indicator text as a unique key for this step
  const stepIndicator = document.querySelector(
    ".jobs-easy-apply-form-header__title, [data-test-form-page-title], .artdeco-modal__header h2"
  )?.textContent?.trim();

  if (stepIndicator === lastStepFilled) return;
  lastStepFilled = stepIndicator;

  // Small delay to let the DOM settle
  await new Promise(r => setTimeout(r, 500));

  const profile = await getCachedProfile();
  if (!profile) return;

  const filled = autofillLinkedIn(profile);
  if (filled > 0) {
    console.log(`Jarvis OS [LinkedIn Auto]: Auto-filled ${filled} fields on step: "${stepIndicator}"`);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log("Jarvis OS: LinkedIn MutationObserver watching for Easy Apply modal...");
