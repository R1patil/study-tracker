console.log("Jarvis OS Autofiller v2.0 active.");

// ─────────────────────────────────────────────
// MESSAGE LISTENER
// ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill") {
    try {
      const profile = request.profile;
      if (!profile) {
        sendResponse({ success: false, error: "No profile data found" });
        return;
      }
      const filledFields = autofillForm(profile);
      if (profile.resume_url) {
        tryFetchAndInjectResume(profile.resume_url);
      }
      sendResponse({ success: true, filled: filledFields });
    } catch (e) {
      console.error("Autofill error:", e);
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
      const filled = autofillForm(profile);
      if (profile.resume_url) {
        tryFetchAndInjectResume(profile.resume_url);
      }
      sendResponse({ success: true, filled });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }

  return true;
});

// ─────────────────────────────────────────────
// UTILITY: Keyword matcher
// ─────────────────────────────────────────────
function matchesKeywords(str, keywords) {
  if (!str) return false;
  const s = str.toLowerCase();
  return keywords.some(k => s.includes(k.toLowerCase()));
}

// ─────────────────────────────────────────────
// UTILITY: Get label text for any input
// ─────────────────────────────────────────────
function getLabelTextForInput(input) {
  if (input.getAttribute("aria-label")) return input.getAttribute("aria-label");

  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy.split(" ");
    const texts = parts.map(id => document.getElementById(id)?.textContent || "");
    const joined = texts.join(" ").trim();
    if (joined) return joined;
  }

  const parentLabel = input.closest("label");
  if (parentLabel?.textContent) return parentLabel.textContent;

  if (input.id) {
    const labelFor = document.querySelector(`label[for="${input.id}"]`);
    if (labelFor?.textContent) return labelFor.textContent;
  }

  // Walk up to find nearby label text in parent container
  let parent = input.parentElement;
  for (let i = 0; i < 5; i++) {
    if (!parent) break;
    const label = parent.querySelector("label, .label, .field-label, legend, [class*='label'], [class*='Label']");
    if (label && label !== input && label.textContent.trim()) return label.textContent.trim();
    parent = parent.parentElement;
  }

  // Check preceding siblings
  let sibling = input.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === "LABEL" && sibling.textContent) return sibling.textContent;
    const labelsInSibling = sibling.querySelectorAll("label, .label, .field-label, span");
    for (let el of labelsInSibling) {
      if (el.textContent.trim()) return el.textContent;
    }
    sibling = sibling.previousElementSibling;
  }

  return input.placeholder || input.name || "";
}

// ─────────────────────────────────────────────
// UTILITY: React-aware value setter
// ─────────────────────────────────────────────
function setNativeValue(element, value) {
  const lastValue = element.value;
  element.value = value;
  const event = new Event("input", { bubbles: true });
  const tracker = element._valueTracker;
  if (tracker) tracker.setValue(lastValue);
  element.dispatchEvent(event);
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

// ─────────────────────────────────────────────
// UTILITY: Fill a <select> dropdown by matching option text
// ─────────────────────────────────────────────
function fillSelect(select, value) {
  if (!value) return false;
  const valLower = value.toLowerCase();
  for (let option of select.options) {
    if (option.text.toLowerCase().includes(valLower) || 
        option.value.toLowerCase().includes(valLower)) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// UTILITY: Clean phone numbers by stripping country codes like +91
// ─────────────────────────────────────────────
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


// ─────────────────────────────────────────────
// UTILITY: Fill radio button group
// ─────────────────────────────────────────────
function fillRadioGroup(radios, value) {
  if (!value) return false;
  const valLower = value.toLowerCase();
  for (let radio of radios) {
    const label = getLabelTextForInput(radio).toLowerCase();
    const radioVal = (radio.value || "").toLowerCase();
    if (label.includes(valLower) || radioVal.includes(valLower) ||
        (valLower === "yes" && (label.includes("yes") || radioVal === "yes" || radioVal === "true")) ||
        (valLower === "no" && (label.includes("no") || radioVal === "no" || radioVal === "false"))) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
      radio.dispatchEvent(new Event("click", { bubbles: true }));
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// MAIN AUTOFILL FUNCTION
// ─────────────────────────────────────────────
function autofillForm(profile) {
  let filledCount = 0;

  const p = profile; // shorthand
  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();

  // ── FIELD DEFINITIONS ──
  // Each entry: { keywords: [...], value: "...", type: "text"|"select"|"radio" }
  const fieldMap = [
    // Personal
    { keywords: ["first name", "firstname", "given name", "givenname", "first-name"], value: p.first_name },
    { keywords: ["last name", "lastname", "family name", "familyname", "surname", "last-name"], value: p.last_name },
    { keywords: ["full name", "fullname", "candidate name", "your name"], value: fullName },
    { keywords: ["email", "e-mail", "mail address", "email address"], value: p.email },
    { keywords: ["phone", "mobile", "telephone", "tel", "contact number", "cell", "phone number"], value: p.phone },

    // Address
    { keywords: ["address line 1", "address1", "street address", "street", "address line one", "address_line1"], value: p.address_line1 },
    { keywords: ["address line 2", "address2", "apt", "suite", "unit", "address_line2"], value: p.address_line2 },
    { keywords: ["city", "town", "municipality"], value: p.city },
    { keywords: ["state", "province", "region"], value: p.state },
    { keywords: ["zip", "postal code", "postcode", "pin code", "pincode", "zip code"], value: p.zip_code },
    { keywords: ["country"], value: p.country },

    // Online
    { keywords: ["linkedin", "linked in", "linkedin url", "linkedin profile"], value: p.linkedin },
    { keywords: ["github", "git hub", "github url", "github profile"], value: p.github },
    { keywords: ["website", "portfolio", "personal site", "personal link", "blog", "other site", "urls[portfolio]"], value: p.website },
    { keywords: ["twitter", "x.com"], value: p.twitter },
    { keywords: ["stackoverflow", "stack overflow"], value: p.stackoverflow },

    // Professional
    { keywords: ["current title", "job title", "current position", "designation", "your role"], value: p.current_job_title },
    { keywords: ["current company", "current employer", "employer name", "company name", "organization"], value: p.current_company },
    { keywords: ["years of experience", "total experience", "work experience (years)", "experience in years"], value: p.total_years_experience },
    { keywords: ["notice period", "notice", "days notice", "serving notice"], value: p.notice_period_text },
    { keywords: ["availability", "available to join", "earliest start", "joining date", "when can you start"], value: p.availability_to_join },
    { keywords: ["expected salary", "expected ctc", "desired salary", "salary expectation", "salary range"], value: p.expected_ctc },
    { keywords: ["current salary", "current ctc", "last drawn salary", "present salary"], value: p.current_ctc },

    // Education
    { keywords: ["degree", "highest qualification", "educational qualification", "highest degree"], value: p.highest_degree },
    { keywords: ["major", "field of study", "specialization", "stream", "branch"], value: p.major },
    { keywords: ["university", "institution", "college", "school name", "alma mater"], value: p.university },
    { keywords: ["graduation year", "year of passing", "year of graduation", "pass out year"], value: p.graduation_year },
    { keywords: ["cgpa", "gpa", "percentage", "marks", "grade"], value: p.cgpa },

    // Summary / Cover letter
    { keywords: ["cover letter", "cover note", "cover message", "message to hiring", "additional information", "tell us about yourself", "about yourself", "introduce yourself"], value: p.summary },
    { keywords: ["summary", "professional summary", "brief bio", "bio", "pitch"], value: p.summary },

    // Skills
    { keywords: ["skills", "technical skills", "key skills", "core skills", "competencies", "technologies"], value: p.skills_text },

    // Certifications
    { keywords: ["certification", "certifications", "courses", "professional certification"], value: p.certifications_text },

    // Work Auth
    { keywords: ["authorized to work", "work authorization", "right to work", "legally authorized", "work permit", "eligible to work"], value: p.work_authorization_india },
    { keywords: ["require sponsorship", "visa sponsorship", "need sponsorship", "require h1b", "need h1b"], value: p.require_visa_sponsorship },

    // Behavioral
    { keywords: ["relocate", "willing to relocate", "open to relocation", "relocation"], value: p.willing_to_relocate },
    { keywords: ["travel", "willing to travel", "open to travel", "travel requirement"], value: p.willing_to_travel },
    { keywords: ["travel percentage", "travel %", "percentage of travel", "how much travel"], value: p.travel_percentage },

    // EEO / Voluntary
    { keywords: ["gender", "sex"], value: p.gender },
    { keywords: ["race", "ethnicity", "racial", "ethnic"], value: p.race_ethnicity },
    { keywords: ["veteran", "military", "military status", "veteran status"], value: p.veteran_status },
    { keywords: ["disability", "disabled", "disability status"], value: p.disability_status },

    // Source
    { keywords: ["how did you hear", "how did you find", "referral source", "source of application", "where did you hear"], value: p.referral_source },
    { keywords: ["referred by", "employee referral", "referral name", "referrer name"], value: p.referral_person_name },

    // Other common questions (textarea)
    { keywords: ["why do you want to join", "why this company", "why us", "why are you interested"], value: p.why_this_company },
    { keywords: ["why are you leaving", "reason for leaving", "reason for change"], value: p.why_leaving_current_job },
    { keywords: ["greatest achievement", "biggest achievement", "proud accomplishment"], value: p.biggest_achievement },
    { keywords: ["where do you see yourself", "5 years", "3 years", "career goals", "future plans"], value: p.where_do_you_see_yourself },
    { keywords: ["strengths", "key strengths", "your strengths"], value: p.strengths },
    { keywords: ["weakness", "weaknesses", "areas of improvement"], value: p.weaknesses },
    { keywords: ["describe yourself", "tell us about you", "who are you"], value: p.describe_yourself },
    { keywords: ["biggest challenge", "difficult situation", "hardest problem"], value: p.biggest_challenge },
    { keywords: ["leadership", "led a team", "managed a team"], value: p.leadership_example },
    { keywords: ["conflict", "disagreement", "handled conflict"], value: p.conflict_resolution },
    { keywords: ["teamwork", "worked with a team", "collaboration"], value: p.teamwork_example },

    // Projects
    { keywords: ["projects", "personal projects", "side projects", "notable projects", "describe your project"], value: p.projects_text },
  ];

  // ── PROCESS TEXT INPUTS & TEXTAREAS ──
  const textInputs = document.querySelectorAll("input:not([type=file]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]), textarea");

  textInputs.forEach(input => {
    if (input.disabled || input.readOnly) return;
    const labelText = getLabelTextForInput(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${input.autocomplete || ""} ${labelText}`.toLowerCase();

    // Special: full name vs first/last name logic
    const hasFirstField = Array.from(textInputs).some(i =>
      matchesKeywords(`${i.name} ${i.id} ${getLabelTextForInput(i)}`, ["first name", "firstname", "given name"])
    );

    for (const field of fieldMap) {
      if (!field.value) continue;
      const isFullName = matchesKeywords(testStr, ["full name", "fullname", "candidate name"]);
      if (field.value === fullName && hasFirstField && !isFullName) continue;

      if (matchesKeywords(testStr, field.keywords)) {
        let valToFill = field.value;
        if (field.keywords.includes("phone") || field.keywords.includes("mobile") || field.keywords.includes("telephone")) {
          valToFill = cleanPhoneNumberForInput(field.value, labelText);
        }
        setNativeValue(input, valToFill);
        filledCount++;
        break;
      }
    }

  });

  // ── PROCESS SELECT DROPDOWNS ──
  const selects = document.querySelectorAll("select");
  selects.forEach(select => {
    if (select.disabled) return;
    const labelText = getLabelTextForInput(select);
    const testStr = `${select.name || ""} ${select.id || ""} ${labelText}`.toLowerCase();

    const selectFieldMap = [
      { keywords: ["country"], value: p.country },
      { keywords: ["state", "province"], value: p.state },
      { keywords: ["gender", "sex"], value: p.gender },
      { keywords: ["degree", "qualification", "education level"], value: p.highest_degree },
      { keywords: ["experience", "years of experience"], value: p.total_years_experience },
      { keywords: ["notice period"], value: p.notice_period_days },
      { keywords: ["job type", "employment type", "full time", "part time"], value: p.job_type },
      { keywords: ["work mode", "remote", "hybrid", "on-site", "location preference"], value: p.work_mode_preference },
      { keywords: ["currency", "salary currency"], value: p.salary_currency },
      { keywords: ["race", "ethnicity"], value: p.race_ethnicity },
      { keywords: ["veteran"], value: p.veteran_status },
      { keywords: ["disability"], value: p.disability_status },
      { keywords: ["source", "how did you hear", "referral source"], value: p.referral_source },
      { keywords: ["language", "english proficiency"], value: p.english_proficiency },
      { keywords: ["relocate", "willing to relocate"], value: p.willing_to_relocate },
      { keywords: ["sponsorship", "visa"], value: p.require_visa_sponsorship },
    ];

    for (const field of selectFieldMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        const filled = fillSelect(select, field.value);
        if (filled) { filledCount++; break; }
      }
    }
  });

  // ── PROCESS RADIO BUTTONS ──
  const radioGroups = {};
  document.querySelectorAll("input[type=radio]").forEach(radio => {
    const name = radio.name || radio.id || getLabelTextForInput(radio);
    if (!radioGroups[name]) radioGroups[name] = [];
    radioGroups[name].push(radio);
  });

  const radioFieldMap = [
    { keywords: ["relocate", "relocation"], value: "yes" },
    { keywords: ["sponsorship", "visa sponsorship"], value: p.require_visa_sponsorship === "No" ? "no" : "yes" },
    { keywords: ["authorized", "work authorization", "legally authorized"], value: "yes" },
    { keywords: ["gender"], value: p.gender },
    { keywords: ["veteran"], value: "not a veteran" },
    { keywords: ["disability"], value: "no" },
    { keywords: ["travel"], value: "yes" },
    { keywords: ["currently employed", "employed"], value: "yes" },
    { keywords: ["remote", "work from home"], value: "yes" },
  ];

  for (const [groupName, radios] of Object.entries(radioGroups)) {
    const labelText = getLabelTextForInput(radios[0]);
    const testStr = `${groupName} ${labelText}`.toLowerCase();
    for (const field of radioFieldMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        const filled = fillRadioGroup(radios, field.value);
        if (filled) { filledCount++; break; }
      }
    }
  }

  // ── PROCESS CHECKBOXES ──
  document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
    const labelText = getLabelTextForInput(checkbox).toLowerCase();
    const testStr = `${checkbox.name || ""} ${checkbox.id || ""} ${labelText}`.toLowerCase();
    if (
      testStr.includes("authorized") ||
      testStr.includes("agree") ||
      testStr.includes("consent") ||
      testStr.includes("terms") ||
      testStr.includes("privacy policy") ||
      testStr.includes("eligible") ||
      testStr.includes("certify") ||
      testStr.includes("confirm")
    ) {
      if (!checkbox.checked) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        filledCount++;
      }
    }
  });

  console.log(`Jarvis OS: Filled ${filledCount} fields.`);
  return filledCount;
}

// ─────────────────────────────────────────────
// RESUME FILE INJECTION
// ─────────────────────────────────────────────
async function tryFetchAndInjectResume(url) {
  try {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    let resumeInput = null;

    fileInputs.forEach(input => {
      const labelText = getLabelTextForInput(input);
      const testStr = `${input.name} ${input.id} ${labelText}`.toLowerCase();
      if (testStr.includes("resume") || testStr.includes("cv") || testStr.includes("application")) {
        resumeInput = input;
      }
    });

    if (!resumeInput && fileInputs.length > 0) {
      resumeInput = fileInputs[0];
    }

    if (!resumeInput) {
      console.log("No resume file input detected.");
      return;
    }

    console.log("Fetching resume from:", url);
    const response = await fetch(url);
    const blob = await response.blob();

    let filename = "Rahul_Patil_Resume.pdf";
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.toLowerCase().endsWith(".pdf")) {
      filename = lastPart;
    }

    const file = new File([blob], filename, { type: blob.type || "application/pdf" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    resumeInput.files = dataTransfer.files;
    resumeInput.dispatchEvent(new Event("change", { bubbles: true }));
    console.log("Resume successfully injected!");
  } catch (err) {
    console.warn("Could not auto-inject resume (CORS or network):", err);
  }
}
