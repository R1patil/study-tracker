/**
 * Jarvis OS — iCIMS Iframe Content Script
 * iCIMS renders forms inside cross-origin iframes.
 * This script runs inside the iframes (via manifest host_permissions)
 * and uses postMessage to communicate with the parent when needed.
 */

console.log("Jarvis OS: iCIMS handler active.");

function matchesKeywords(str, keywords) {
  if (!str) return false;
  const s = str.toLowerCase();
  return keywords.some(k => s.includes(k.toLowerCase()));
}

function getLabelText(input) {
  if (input.getAttribute("aria-label")) return input.getAttribute("aria-label");

  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const el = document.getElementById(labelledBy);
    if (el) return el.textContent.trim();
  }

  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent.trim();
  }

  let parent = input.parentElement;
  for (let i = 0; i < 5; i++) {
    if (!parent) break;
    const label = parent.querySelector("label, .iCIMS_Label, [class*='label'], [class*='Label']");
    if (label && label !== input && label.textContent.trim()) return label.textContent.trim();
    parent = parent.parentElement;
  }

  return input.placeholder || input.name || "";
}

function setNativeValue(el, value) {
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
  // iCIMS sometimes uses jQuery events
  try {
    if (window.jQuery) {
      window.jQuery(el).trigger("change").trigger("blur");
    }
  } catch (_) {}
}

function fillSelect(select, value) {
  if (!value) return false;
  const vl = value.toLowerCase();
  for (let opt of select.options) {
    if (opt.text.toLowerCase().includes(vl) || opt.value.toLowerCase().includes(vl)) {
      select.value = opt.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
  }
  return false;
}

function iCIMSAutofill(profile) {
  if (!profile) return 0;
  const p = profile;
  let filledCount = 0;
  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();

  const fieldMap = [
    { keywords: ["first name", "firstname", "given name"], value: p.first_name },
    { keywords: ["last name", "lastname", "surname"], value: p.last_name },
    { keywords: ["full name", "fullname", "candidate name"], value: fullName },
    { keywords: ["email", "e-mail"], value: p.email },
    { keywords: ["phone", "mobile", "telephone"], value: p.phone },
    { keywords: ["address", "street", "address line 1"], value: p.address_line1 },
    { keywords: ["address line 2", "apt", "suite"], value: p.address_line2 },
    { keywords: ["city", "town"], value: p.city },
    { keywords: ["state", "province"], value: p.state },
    { keywords: ["zip", "postal", "pin code"], value: p.zip_code },
    { keywords: ["linkedin"], value: p.linkedin },
    { keywords: ["github"], value: p.github },
    { keywords: ["website", "portfolio"], value: p.website },
    { keywords: ["current title", "job title"], value: p.current_job_title },
    { keywords: ["current company", "employer"], value: p.current_company },
    { keywords: ["years of experience", "experience"], value: p.total_years_experience },
    { keywords: ["degree", "education", "qualification"], value: p.highest_degree },
    { keywords: ["major", "field of study"], value: p.major },
    { keywords: ["university", "institution", "school", "college"], value: p.university },
    { keywords: ["graduation year", "year of passing"], value: p.graduation_year },
    { keywords: ["cgpa", "gpa", "grade"], value: p.cgpa },
    { keywords: ["cover letter", "summary", "about", "additional info"], value: p.summary },
    { keywords: ["skills"], value: p.skills_text },
    { keywords: ["notice period"], value: p.notice_period_text },
    { keywords: ["expected salary", "expected ctc", "desired salary"], value: p.expected_ctc },
    { keywords: ["current salary", "current ctc"], value: p.current_ctc },
    { keywords: ["source", "how did you hear"], value: p.referral_source },
    { keywords: ["relocat"], value: p.willing_to_relocate },
    { keywords: ["authorized to work", "work authorization"], value: p.work_authorization_india },
    { keywords: ["sponsorship"], value: p.require_visa_sponsorship },
  ];

  // TEXT INPUTS & TEXTAREAS
  document.querySelectorAll(
    "input:not([type=hidden]):not([type=file]):not([type=submit]):not([type=button]):not([type=radio]):not([type=checkbox]), textarea"
  ).forEach(input => {
    if (input.disabled || input.readOnly) return;
    const labelText = getLabelText(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${labelText}`.toLowerCase();

    for (const field of fieldMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        setNativeValue(input, field.value);
        filledCount++;
        break;
      }
    }
  });

  // SELECTS
  document.querySelectorAll("select").forEach(select => {
    if (select.disabled) return;
    const labelText = getLabelText(select);
    const testStr = `${select.name || ""} ${select.id || ""} ${labelText}`.toLowerCase();

    const selectMap = [
      { keywords: ["country"], value: p.country },
      { keywords: ["state", "province"], value: p.state },
      { keywords: ["gender"], value: p.gender },
      { keywords: ["degree", "education level"], value: p.highest_degree },
      { keywords: ["experience"], value: p.total_years_experience },
      { keywords: ["job type", "employment type"], value: p.job_type },
      { keywords: ["veteran"], value: p.veteran_status },
      { keywords: ["disability"], value: p.disability_status },
      { keywords: ["race", "ethnicity"], value: p.race_ethnicity },
      { keywords: ["relocat"], value: p.willing_to_relocate },
      { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship },
      { keywords: ["source", "how did you hear"], value: p.referral_source },
    ];

    for (const sf of selectMap) {
      if (!sf.value) continue;
      if (matchesKeywords(testStr, sf.keywords)) {
        if (fillSelect(select, sf.value)) { filledCount++; break; }
      }
    }
  });

  // RADIO BUTTONS
  const radioGroups = {};
  document.querySelectorAll("input[type=radio]").forEach(r => {
    const key = r.name || getLabelText(r);
    if (!radioGroups[key]) radioGroups[key] = [];
    radioGroups[key].push(r);
  });

  Object.entries(radioGroups).forEach(([name, radios]) => {
    const groupLabel = getLabelText(radios[0]).toLowerCase();
    const testStr = `${name} ${groupLabel}`.toLowerCase();

    const radioMap = [
      { keywords: ["relocat"], value: "yes" },
      { keywords: ["sponsor", "visa"], value: "no" },
      { keywords: ["authorized", "eligible", "work auth"], value: "yes" },
      { keywords: ["travel"], value: "yes" },
      { keywords: ["veteran"], value: "not a veteran" },
      { keywords: ["disability"], value: "no" },
    ];

    for (const rm of radioMap) {
      if (matchesKeywords(testStr, rm.keywords)) {
        const vl = rm.value.toLowerCase();
        for (const radio of radios) {
          const rl = (radio.value || getLabelText(radio) || "").toLowerCase();
          if (rl.includes(vl) || (vl === "yes" && (rl === "yes" || rl === "true")) ||
              (vl === "no" && (rl === "no" || rl === "false"))) {
            radio.checked = true;
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new Event("click", { bubbles: true }));
            filledCount++;
            break;
          }
        }
        break;
      }
    }
  });

  // CHECKBOXES
  document.querySelectorAll("input[type=checkbox]").forEach(cb => {
    const label = getLabelText(cb).toLowerCase();
    const testStr = `${cb.name || ""} ${cb.id || ""} ${label}`.toLowerCase();
    if (
      testStr.includes("authorized") || testStr.includes("agree") ||
      testStr.includes("certif") || testStr.includes("consent") ||
      testStr.includes("eligible") || testStr.includes("confirm") ||
      testStr.includes("terms") || testStr.includes("privacy")
    ) {
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
        filledCount++;
      }
    }
  });

  console.log(`Jarvis OS (iCIMS): Filled ${filledCount} fields.`);
  return filledCount;
}

// ─────────────────────────────────────────────────────────────────
// MESSAGE LISTENER
// ─────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill") {
    const profile = request.profile;
    if (!profile) {
      sendResponse({ success: false, error: "No profile data" });
      return;
    }
    // iCIMS loads forms slowly — wait 500ms then fill
    setTimeout(() => {
      const filled = iCIMSAutofill(profile);

      // Also try to fill inside iframes (same-origin only, cross-origin blocked by browser)
      document.querySelectorAll("iframe").forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Inject inputs search into iframe document
            iframeDoc.querySelectorAll(
              "input:not([type=hidden]):not([type=file]), textarea, select"
            ).forEach(el => {
              // minimal fill inside iframe
              const label = (el.getAttribute("aria-label") || el.placeholder || el.name || "").toLowerCase();
              if (label.includes("email") && profile.email) el.value = profile.email;
              if ((label.includes("first") && label.includes("name")) && profile.first_name) el.value = profile.first_name;
              if ((label.includes("last") && label.includes("name")) && profile.last_name) el.value = profile.last_name;
              if (label.includes("phone") && profile.phone) el.value = profile.phone;
              el.dispatchEvent(new Event("change", { bubbles: true }));
            });
          }
        } catch (_) {
          // Cross-origin iframe — cannot access
        }
      });

      sendResponse({ success: true, filled });
    }, 500);
  }
  return true;
});
