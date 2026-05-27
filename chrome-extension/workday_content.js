/**
 * Jarvis OS — Workday Shadow DOM Content Script
 * Workday uses Web Components with shadow roots.
 * Standard document.querySelector cannot reach inside shadow DOMs.
 * This script recursively pierces all shadow roots to find and fill inputs.
 */

console.log("Jarvis OS: Workday handler active.");

// ─────────────────────────────────────────────────────────────────
// SHADOW DOM PIERCING: recursively collect all inputs inside shadow trees
// ─────────────────────────────────────────────────────────────────
function getAllShadowInputs(root = document) {
  const inputs = [];

  function walk(node) {
    // Collect inputs in this node
    if (node.querySelectorAll) {
      node.querySelectorAll(
        "input:not([type=hidden]):not([type=file]):not([type=submit]):not([type=button]), textarea, select"
      ).forEach(el => inputs.push(el));
    }
    // Walk into shadow roots
    if (node.shadowRoot) {
      walk(node.shadowRoot);
    }
    // Walk all children (including custom elements)
    node.childNodes && node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  }

  walk(root);
  return inputs;
}

// ─────────────────────────────────────────────────────────────────
// Get label text — shadow DOM aware
// ─────────────────────────────────────────────────────────────────
function getShadowLabelForInput(input) {
  // Try aria-label
  if (input.getAttribute("aria-label")) return input.getAttribute("aria-label");

  // Try aria-labelledby (may point to element in shadow host or parent)
  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    let labelEl = null;
    // Search current shadow root first, then document
    const root = input.getRootNode();
    if (root && root.getElementById) labelEl = root.getElementById(labelledBy);
    if (!labelEl) labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent.trim();
  }

  // Walk upward through shadow hosts
  let node = input;
  for (let i = 0; i < 8; i++) {
    if (!node) break;
    const parent = node.parentElement || (node.getRootNode && node.getRootNode().host);
    if (!parent) break;
    const label = parent.querySelector
      ? parent.querySelector("label, [data-automation-id='label'], [class*='label'], [class*='Label'], legend")
      : null;
    if (label && label !== input && label.textContent.trim()) {
      return label.textContent.trim();
    }
    node = parent;
  }

  // Workday specific: data-automation-id attributes contain semantic field names
  const automationId = input.getAttribute("data-automation-id") || 
                       input.closest?.("[data-automation-id]")?.getAttribute("data-automation-id") || "";
  if (automationId) return automationId.replace(/-/g, " ");

  return input.placeholder || input.name || "";
}

// ─────────────────────────────────────────────────────────────────
// React-aware value setter (works inside shadow DOM too)
// ─────────────────────────────────────────────────────────────────
function setReactValue(element, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, "value"
  );
  const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, "value"
  );
  const setter = element.tagName === "TEXTAREA" ? nativeTextareaSetter : nativeInputValueSetter;
  if (setter && setter.set) {
    setter.set.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

function matchesKeywords(str, keywords) {
  if (!str) return false;
  const s = str.toLowerCase();
  return keywords.some(k => s.includes(k.toLowerCase()));
}

// ─────────────────────────────────────────────────────────────────
// Fill a Workday <select> or listbox
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// Fill a Workday <select> or listbox
// ─────────────────────────────────────────────────────────────────
function fillShadowSelect(select, value) {
  if (!value) return false;
  const vl = value.toLowerCase();
  for (let opt of select.options) {
    if (opt.text.toLowerCase().includes(vl) || opt.value.toLowerCase().includes(vl)) {
      select.value = opt.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────
// Get all shadow elements matching a selector
// ─────────────────────────────────────────────────────────────────
function getAllShadowElements(selector, root = document) {
  const elements = [];

  function walk(node) {
    if (node.querySelectorAll) {
      node.querySelectorAll(selector).forEach(el => elements.push(el));
    }
    if (node.shadowRoot) {
      walk(node.shadowRoot);
    }
    node.childNodes && node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  }

  walk(root);
  return elements;
}

// ─────────────────────────────────────────────────────────────────
// Get all shadow dropdown trigger buttons/comboboxes
// ─────────────────────────────────────────────────────────────────
function getAllShadowDropdownTriggers(root = document) {
  const triggers = [];

  function walk(node) {
    if (node.querySelectorAll) {
      // Find buttons or comboboxes or divs that act as dropdown triggers in Workday
      node.querySelectorAll(
        "button[role='combobox'], [data-automation-id='searchBoxInput'], [data-automation-id*='dropdown'], button[aria-haspopup='listbox']"
      ).forEach(el => triggers.push(el));
    }
    if (node.shadowRoot) {
      walk(node.shadowRoot);
    }
    node.childNodes && node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  }

  walk(root);
  return triggers;
}

// ─────────────────────────────────────────────────────────────────
// Clean phone numbers by stripping country codes like +91
// ─────────────────────────────────────────────────────────────────
function cleanPhoneNumberForInput(phone, labelText = "") {
  if (!phone) return "";
  let clean = phone.trim();

  // If it's a country code selector, don't clean
  const lbl = labelText.toLowerCase();
  if (lbl.includes("country code") || lbl.includes("phone code")) {
    return clean;
  }

  if (clean.startsWith("+")) {
    if (clean.startsWith("+91")) {
      clean = clean.slice(3);
    } else if (clean.startsWith("+1")) {
      clean = clean.slice(2);
    } else {
      const digitsOnly = clean.replace(/\D/g, "");
      if (digitsOnly.length > 10) {
        clean = digitsOnly.slice(digitsOnly.length - 10);
      }
    }
  }

  clean = clean.replace(/\D/g, "");

  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.slice(2);
  } else if (clean.length === 11 && (clean.startsWith("1") || clean.startsWith("0"))) {
    clean = clean.slice(1);
  }

  return clean;
}

// ─────────────────────────────────────────────────────────────────
// Fill a Workday custom shadow dropdown trigger sequentially
// ─────────────────────────────────────────────────────────────────
async function fillWorkdayCustomDropdown(trigger, value) {
  if (!trigger || !value) return false;

  try {
    // 1. Click the trigger to open the dropdown listbox
    trigger.click();

    // 2. Wait 250ms for popover options to populate in DOM
    await new Promise(resolve => setTimeout(resolve, 250));

    // 3. Find options inside popovers/listboxes pierces shadow roots too
    const options = getAllShadowElements("[role='option'], [data-automation-id='promptOption'], .wd-popup [role='button']");
    const valLower = value.toLowerCase().trim();

    // 4. Find option matching the text
    let matchedOption = null;
    for (const opt of options) {
      const optText = opt.textContent.toLowerCase().trim();
      if (optText.includes(valLower) || valLower.includes(optText)) {
        matchedOption = opt;
        break;
      }
    }

    // 5. Click the matching option
    if (matchedOption) {
      matchedOption.click();
      return true;
    } else {
      // Close dropdown by clicking trigger again if no match
      trigger.click();
    }
  } catch (err) {
    console.warn("Failed to fill custom Workday dropdown:", err);
  }
  return false;
}


// ─────────────────────────────────────────────────────────────────
// Workday multi-step form observer — refills on page navigation
// ─────────────────────────────────────────────────────────────────
let workdayObserver = null;
let lastFillProfile = null;

function startWorkdayObserver(profile) {
  lastFillProfile = profile;
  if (workdayObserver) workdayObserver.disconnect();

  workdayObserver = new MutationObserver((mutations) => {
    const relevant = mutations.some(m =>
      m.addedNodes.length > 0 &&
      Array.from(m.addedNodes).some(n => n.nodeType === Node.ELEMENT_NODE)
    );
    if (relevant) {
      // Debounce: wait 600ms after DOM settles before re-filling
      clearTimeout(workdayObserver._timer);
      workdayObserver._timer = setTimeout(() => {
        workdayAutofill(lastFillProfile);
      }, 600);
    }
  });

  workdayObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ─────────────────────────────────────────────────────────────────
// MAIN WORKDAY AUTOFILL
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// MAIN WORKDAY AUTOFILL
// ─────────────────────────────────────────────────────────────────
async function workdayAutofill(profile) {
  if (!profile) return 0;
  const p = profile;
  let filledCount = 0;
  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();

  const fieldMap = [
    { keywords: ["first name", "firstname", "given name", "legalFirstName"], value: p.first_name },
    { keywords: ["last name", "lastname", "family name", "legalLastName"], value: p.last_name },
    { keywords: ["full name", "candidate name"], value: fullName },
    { keywords: ["email", "e-mail"], value: p.email },
    { keywords: ["phone", "mobile", "telephone"], value: p.phone },
    { keywords: ["address line 1", "address1", "street address", "addressLine1"], value: p.address_line1 },
    { keywords: ["address line 2", "address2", "addressLine2"], value: p.address_line2 },
    { keywords: ["city", "town"], value: p.city },
    { keywords: ["state", "province", "region"], value: p.state },
    { keywords: ["zip", "postal code", "postcode", "postalCode"], value: p.zip_code },
    { keywords: ["linkedin"], value: p.linkedin },
    { keywords: ["github"], value: p.github },
    { keywords: ["website", "portfolio"], value: p.website },
    { keywords: ["current title", "job title", "current position"], value: p.current_job_title },
    { keywords: ["current company", "current employer", "employer"], value: p.current_company },
    { keywords: ["years of experience", "total experience"], value: p.total_years_experience },
    { keywords: ["notice period", "notice"], value: p.notice_period_text },
    { keywords: ["expected salary", "expected ctc", "desired salary"], value: p.expected_ctc },
    { keywords: ["current salary", "current ctc"], value: p.current_ctc },
    { keywords: ["degree", "highest qualification"], value: p.highest_degree },
    { keywords: ["major", "field of study", "specialization"], value: p.major },
    { keywords: ["university", "institution", "college"], value: p.university },
    { keywords: ["graduation year", "year of passing"], value: p.graduation_year },
    { keywords: ["cgpa", "gpa", "grade", "percentage"], value: p.cgpa },
    { keywords: ["cover letter", "summary", "about yourself", "tell us", "additional information"], value: p.summary },
    { keywords: ["skills", "technical skills"], value: p.skills_text },
    { keywords: ["how did you hear", "source", "referral source"], value: p.referral_source },
    { keywords: ["why leaving", "reason for leaving"], value: p.why_leaving_current_job },
    { keywords: ["greatest achievement", "biggest achievement"], value: p.biggest_achievement },
    { keywords: ["strengths", "key strengths"], value: p.strengths },
    { keywords: ["where do you see yourself", "career goals"], value: p.where_do_you_see_yourself },
  ];

  const allInputs = getAllShadowInputs(document);

  allInputs.forEach(input => {
    if (input.disabled || input.readOnly) return;

    const labelText = getShadowLabelForInput(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${labelText}`.toLowerCase();

    if (input.tagName === "SELECT") {
      const selectMap = [
        { keywords: ["country"], value: p.country },
        { keywords: ["state", "province"], value: p.state },
        { keywords: ["gender"], value: p.gender },
        { keywords: ["degree", "qualification"], value: p.highest_degree },
        { keywords: ["experience"], value: p.total_years_experience },
        { keywords: ["notice"], value: p.notice_period_days },
        { keywords: ["job type", "employment type"], value: p.job_type },
        { keywords: ["race", "ethnicity"], value: p.race_ethnicity },
        { keywords: ["veteran"], value: p.veteran_status },
        { keywords: ["disability"], value: p.disability_status },
        { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship },
        { keywords: ["relocate"], value: p.willing_to_relocate },
        { keywords: ["source", "how did you hear"], value: p.referral_source },
      ];
      for (const sf of selectMap) {
        if (!sf.value) continue;
        if (matchesKeywords(testStr, sf.keywords)) {
          if (fillShadowSelect(input, sf.value)) { filledCount++; break; }
        }
      }
      return;
    }

    if (input.type === "radio") return; // handled separately below

    // Text / textarea
    for (const field of fieldMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        let valToFill = field.value;
        if (field.keywords.includes("phone") || field.keywords.includes("mobile") || field.keywords.includes("telephone")) {
          valToFill = cleanPhoneNumberForInput(field.value, labelText);
        }
        setReactValue(input, valToFill);
        filledCount++;
        break;
      }
    }
  });

  // Handle Workday custom dropdown triggers (e.g. State, Phone Device Type, Country)
  const customDropdownMap = [
    { keywords: ["country"], value: p.country },
    { keywords: ["state", "province"], value: p.state },
    { keywords: ["phone device type", "device type"], value: "Mobile" },
    { keywords: ["gender"], value: p.gender },
    { keywords: ["degree", "qualification"], value: p.highest_degree },
    { keywords: ["notice"], value: p.notice_period_days },
    { keywords: ["job type", "employment type"], value: p.job_type },
    { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship },
    { keywords: ["relocate"], value: p.willing_to_relocate },
    { keywords: ["source", "how did you hear"], value: p.referral_source },
  ];

  const triggers = getAllShadowDropdownTriggers(document);
  for (const trigger of triggers) {
    if (trigger.disabled) continue;

    const labelText = getShadowLabelForInput(trigger);
    const testStr = `${trigger.name || ""} ${trigger.id || ""} ${trigger.getAttribute("data-automation-id") || ""} ${labelText}`.toLowerCase();

    for (const entry of customDropdownMap) {
      if (!entry.value) continue;
      if (matchesKeywords(testStr, entry.keywords)) {
        const filled = await fillWorkdayCustomDropdown(trigger, entry.value);
        if (filled) {
          filledCount++;
          // Give DOM 100ms to settle after closing dropdown
          await new Promise(resolve => setTimeout(resolve, 100));
          break;
        }
      }
    }
  }

  // Handle Workday custom radio-like elements (often rendered as <div role="radio">)
  document.querySelectorAll('[role="radio"], [role="option"]').forEach(el => {
    const label = (el.getAttribute("aria-label") || el.textContent || "").toLowerCase();
    const container = el.closest('[role="radiogroup"], [data-automation-id*="radio"]');
    const containerLabel = container
      ? (container.getAttribute("aria-label") || container.getAttribute("data-automation-id") || "").toLowerCase()
      : "";

    const shouldCheck = (
      (containerLabel.includes("relocat") && label.includes("yes")) ||
      (containerLabel.includes("sponsor") && label.includes("no")) ||
      (containerLabel.includes("authorized") && label.includes("yes")) ||
      (containerLabel.includes("veteran") && label.includes("not a veteran")) ||
      (containerLabel.includes("disability") && label.includes("no")) ||
      (containerLabel.includes("travel") && label.includes("yes"))
    );

    if (shouldCheck && el.getAttribute("aria-checked") !== "true") {
      el.click();
      filledCount++;
    }
  });

  // Handle Workday checkboxes (often <div role="checkbox">)
  document.querySelectorAll('[role="checkbox"]').forEach(el => {
    const label = (el.getAttribute("aria-label") || el.textContent || "").toLowerCase();
    if (
      (label.includes("agree") || label.includes("authorize") ||
       label.includes("certif") || label.includes("confirm") ||
       label.includes("eligible") || label.includes("consent")) &&
      el.getAttribute("aria-checked") !== "true"
    ) {
      el.click();
      filledCount++;
    }
  });

  console.log(`Jarvis OS (Workday): Filled ${filledCount} fields.`);
  return filledCount;
}

// ─────────────────────────────────────────────────────────────────
// MESSAGE LISTENER
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// MESSAGE LISTENER
// ─────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill" || request.action === "autofill_tailored") {
    const profile = request.profile;
    if (!profile) {
      sendResponse({ success: false, error: "No profile data" });
      return;
    }
    
    (async () => {
      try {
        const filled = await workdayAutofill(profile);
        // Start observer so new Workday steps get auto-filled too
        startWorkdayObserver(profile);

        if (profile.resume_url) {
          tryFetchAndInjectResume(profile.resume_url);
        }
        sendResponse({ success: true, filled, note: "Workday observer active for multi-step forms" });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async sendResponse
  }
  return true;
});


// ─────────────────────────────────────────────────────────────────
// RESUME INJECTION
// ─────────────────────────────────────────────────────────────────
async function tryFetchAndInjectResume(url) {
  try {
    const allInputs = getAllShadowInputs(document);
    let resumeInput = null;
    allInputs.filter(i => i.type === "file").forEach(input => {
      const label = getShadowLabelForInput(input).toLowerCase();
      const testStr = `${input.name} ${input.id} ${label}`.toLowerCase();
      if (testStr.includes("resume") || testStr.includes("cv")) resumeInput = input;
    });
    if (!resumeInput) {
      const fileInputs = allInputs.filter(i => i.type === "file");
      if (fileInputs.length > 0) resumeInput = fileInputs[0];
    }
    if (!resumeInput) return;

    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split("/").pop() || "Resume.pdf";
    const file = new File([blob], filename, { type: "application/pdf" });
    const dt = new DataTransfer();
    dt.items.add(file);
    resumeInput.files = dt.files;
    resumeInput.dispatchEvent(new Event("change", { bubbles: true }));
    console.log("Jarvis OS: Resume injected into Workday.");
  } catch (err) {
    console.warn("Jarvis OS: Resume injection failed:", err);
  }
}
