/**
 * Jarvis OS — Naukri.com Content Script
 * Handles:
 *   1. Quick Apply modal (basic fields: name, phone, experience, CTC, notice)
 *   2. Full Application page (multi-section React form)
 *   3. Chatbot-style questionnaire (button-click answers)
 */

console.log("Jarvis OS: Naukri handler v1.0 active.");

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

  // Naukri often uses a wrapping div with a label class above the input
  let parent = input.parentElement;
  for (let i = 0; i < 5; i++) {
    if (!parent) break;
    const label = parent.querySelector("label, .lbl, .field-label, [class*='label'], [class*='Label']");
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
// NAUKRI QUICK APPLY MODAL
// Triggered when user clicks Apply on job listing page
// Modal selector: div.apply-popup, div.quick-apply-overlay
// ─────────────────────────────────────────────
function autofillNaukriQuickApply(profile) {
  if (!profile) return 0;
  let filledCount = 0;

  const modal = document.querySelector(
    ".apply-popup, .quick-apply-popup, .chatbot-modal, " +
    "[class*='apply-popup'], [class*='quick-apply'], #apply-popup-cointainer"
  ) || document;

  const fieldMap = [
    { keywords: ["name", "full name", "candidate name", "applicant name"], value: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() },
    { keywords: ["email", "e-mail", "mail"], value: profile.email },
    { keywords: ["phone", "mobile", "contact", "number"], value: profile.phone },
    { keywords: ["current ctc", "current salary", "ctc", "present salary"], value: profile.current_ctc },
    { keywords: ["expected ctc", "expected salary", "desired salary", "expected compensation"], value: profile.expected_ctc },
    { keywords: ["notice period", "notice", "joining"], value: profile.notice_period_text },
    { keywords: ["experience", "years of experience", "total experience", "work experience"], value: profile.total_years_experience },
    { keywords: ["current company", "company name", "current employer", "employer"], value: profile.current_company },
    { keywords: ["current designation", "designation", "current title", "job title", "current role"], value: profile.current_job_title },
    { keywords: ["city", "location", "current location", "preferred location"], value: profile.city },
    { keywords: ["linkedin", "linkedin url", "linked in"], value: profile.linkedin },
    { keywords: ["github", "github url"], value: profile.github },
    { keywords: ["skills", "key skills", "technical skills"], value: profile.skills_text },
    { keywords: ["summary", "cover note", "cover letter", "message", "additional info"], value: profile.summary },
  ];

  const inputs = modal.querySelectorAll(
    "input:not([type=file]):not([type=hidden]):not([type=submit]):not([type=button]), textarea"
  );

  inputs.forEach(input => {
    if (input.disabled || input.readOnly) return;
    const labelText = getLabelText(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${labelText}`.toLowerCase();

    for (const field of fieldMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        if (setNativeValue(input, field.value)) filledCount++;
        break;
      }
    }
  });

  // Fill selects in modal
  const selects = modal.querySelectorAll("select");
  selects.forEach(select => {
    if (select.disabled) return;
    const labelText = getLabelText(select);
    const testStr = `${select.name || ""} ${select.id || ""} ${labelText}`.toLowerCase();
    const selectMap = [
      { keywords: ["notice", "notice period"], value: profile.notice_period_days },
      { keywords: ["experience", "years"], value: profile.total_years_experience },
      { keywords: ["ctc", "current salary"], value: profile.current_ctc },
      { keywords: ["expected", "desired"], value: profile.expected_ctc },
      { keywords: ["location", "city"], value: profile.city },
    ];
    for (const field of selectMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        if (fillSelect(select, field.value)) { filledCount++; break; }
      }
    }
  });

  console.log(`Jarvis OS [Naukri Quick Apply]: Filled ${filledCount} fields.`);
  return filledCount;
}

// ─────────────────────────────────────────────
// NAUKRI FULL APPLICATION PAGE
// URL pattern: /job-listings-*  or  naukri.com/apply-for-*
// Has multi-section React form
// ─────────────────────────────────────────────
function autofillNaukriFullApply(profile) {
  if (!profile) return 0;
  let filledCount = 0;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  const fieldMap = [
    { keywords: ["first name", "firstname", "given name"], value: profile.first_name },
    { keywords: ["last name", "lastname", "surname"], value: profile.last_name },
    { keywords: ["full name", "name", "candidate name"], value: fullName },
    { keywords: ["email", "e-mail"], value: profile.email },
    { keywords: ["phone", "mobile", "contact number"], value: profile.phone },
    { keywords: ["current ctc", "current salary", "present ctc"], value: profile.current_ctc },
    { keywords: ["expected ctc", "expected salary", "desired ctc"], value: profile.expected_ctc },
    { keywords: ["notice period", "notice"], value: profile.notice_period_text },
    { keywords: ["total experience", "work experience", "experience"], value: profile.total_years_experience },
    { keywords: ["current designation", "designation", "current title", "job title"], value: profile.current_job_title },
    { keywords: ["current company", "company", "employer"], value: profile.current_company },
    { keywords: ["city", "current location", "location"], value: profile.city },
    { keywords: ["state"], value: profile.state },
    { keywords: ["zip", "pincode", "pin code", "postal"], value: profile.zip_code },
    { keywords: ["university", "college", "institution"], value: profile.university },
    { keywords: ["degree", "qualification", "highest qualification"], value: profile.highest_degree },
    { keywords: ["major", "specialization", "stream", "branch"], value: profile.major },
    { keywords: ["graduation year", "passing year"], value: profile.graduation_year },
    { keywords: ["cgpa", "gpa", "percentage", "marks"], value: profile.cgpa },
    { keywords: ["skills", "key skills", "technical skills"], value: profile.skills_text },
    { keywords: ["summary", "profile summary", "professional summary", "about"], value: profile.summary },
    { keywords: ["cover letter", "cover note", "message to recruiter"], value: profile.summary },
    { keywords: ["linkedin"], value: profile.linkedin },
    { keywords: ["github"], value: profile.github },
    { keywords: ["website", "portfolio"], value: profile.website },
  ];

  const allInputs = document.querySelectorAll(
    "input:not([type=file]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]), textarea"
  );
  const inputsArr = Array.from(allInputs);
  const hasFirstNameField = inputsArr.some(i =>
    matchesKeywords(`${i.name} ${i.id} ${i.placeholder} ${getLabelText(i)}`, ["first name", "firstname"])
  );

  allInputs.forEach(input => {
    if (input.disabled || input.readOnly) return;
    const labelText = getLabelText(input);
    const testStr = `${input.name || ""} ${input.id || ""} ${input.placeholder || ""} ${labelText}`.toLowerCase();

    for (const field of fieldMap) {
      if (!field.value) continue;
      const isFullName = matchesKeywords(testStr, ["full name", "fullname", "candidate name"]);
      if (field.value === fullName && hasFirstNameField && !isFullName) continue;

      if (matchesKeywords(testStr, field.keywords)) {
        if (setNativeValue(input, field.value)) filledCount++;
        break;
      }
    }
  });

  // Selects
  document.querySelectorAll("select").forEach(select => {
    if (select.disabled) return;
    const labelText = getLabelText(select);
    const testStr = `${select.name || ""} ${select.id || ""} ${labelText}`.toLowerCase();
    const selectMap = [
      { keywords: ["notice period", "notice"], value: profile.notice_period_days },
      { keywords: ["experience", "total experience"], value: profile.total_years_experience },
      { keywords: ["degree", "qualification"], value: profile.highest_degree },
      { keywords: ["state", "province"], value: profile.state },
      { keywords: ["country"], value: profile.country },
      { keywords: ["gender"], value: profile.gender },
      { keywords: ["job type", "employment type"], value: profile.job_type },
      { keywords: ["work mode", "remote", "hybrid"], value: profile.work_mode_preference },
      { keywords: ["relocate"], value: profile.willing_to_relocate },
    ];
    for (const field of selectMap) {
      if (!field.value) continue;
      if (matchesKeywords(testStr, field.keywords)) {
        if (fillSelect(select, field.value)) { filledCount++; break; }
      }
    }
  });

  console.log(`Jarvis OS [Naukri Full Apply]: Filled ${filledCount} fields.`);
  return filledCount;
}

// ─────────────────────────────────────────────
// NAUKRI CHATBOT QUESTIONNAIRE
// Naukri's conversational apply flow uses button-based answers.
// When a question matches, we auto-click the best answer button.
// ─────────────────────────────────────────────
function autofillNaukriChatbot(profile) {
  if (!profile) return 0;
  let filledCount = 0;

  // The chatbot body contains question text + answer buttons
  const chatbotBody = document.querySelector(".chatbot-body, .ssbot-body, [class*='chatbot']");
  if (!chatbotBody) return 0;

  // Get currently visible (active) question
  const activeQuestion = chatbotBody.querySelector(
    ".active-question, .ssbot-question:last-child, .bot-message:last-child, [class*='question']:last-child"
  );
  if (!activeQuestion) return 0;

  const questionText = activeQuestion.textContent.toLowerCase();

  // Answer buttons: .ssBtn, .answer-btn, [class*='choice']
  const answerButtons = activeQuestion.querySelectorAll(
    ".ssBtn, .answer-btn, button.choice, [class*='choice'], [class*='option-btn']"
  );

  if (answerButtons.length === 0) {
    // Try filling a text input in the chatbot
    const chatInput = chatbotBody.querySelector(
      "input:not([type=hidden]), textarea"
    );
    if (chatInput) {
      let value = null;
      if (matchesKeywords(questionText, ["notice", "joining"])) value = profile.notice_period_text;
      else if (matchesKeywords(questionText, ["experience", "years"])) value = profile.total_years_experience;
      else if (matchesKeywords(questionText, ["current ctc", "current salary"])) value = profile.current_ctc;
      else if (matchesKeywords(questionText, ["expected ctc", "expected salary"])) value = profile.expected_ctc;
      else if (matchesKeywords(questionText, ["location", "city"])) value = profile.city;
      else if (matchesKeywords(questionText, ["skills"])) value = profile.skills_text;

      if (value && setNativeValue(chatInput, value)) filledCount++;
    }
    return filledCount;
  }

  // Match answer buttons to question context
  let targetAnswer = null;

  if (matchesKeywords(questionText, ["relocate", "relocation"])) {
    targetAnswer = "yes";
  } else if (matchesKeywords(questionText, ["work from home", "remote", "wfh"])) {
    targetAnswer = "yes";
  } else if (matchesKeywords(questionText, ["currently employed", "employed", "working"])) {
    targetAnswer = "yes";
  } else if (matchesKeywords(questionText, ["authorized", "eligible", "legal", "work permit"])) {
    targetAnswer = "yes";
  } else if (matchesKeywords(questionText, ["sponsorship", "visa"])) {
    targetAnswer = profile.require_visa_sponsorship === "No" ? "no" : "yes";
  } else if (matchesKeywords(questionText, ["notice period"])) {
    targetAnswer = profile.notice_period_days;
  } else if (matchesKeywords(questionText, ["experience", "years"])) {
    targetAnswer = profile.total_years_experience;
  } else if (matchesKeywords(questionText, ["gender"])) {
    targetAnswer = profile.gender;
  }

  if (targetAnswer) {
    const targetLower = String(targetAnswer).toLowerCase();
    for (const btn of answerButtons) {
      if (btn.textContent.toLowerCase().includes(targetLower)) {
        btn.click();
        filledCount++;
        break;
      }
    }
  }

  console.log(`Jarvis OS [Naukri Chatbot]: Answered ${filledCount} chatbot question(s).`);
  return filledCount;
}

// ─────────────────────────────────────────────
// DETECT NAUKRI PAGE TYPE
// ─────────────────────────────────────────────
function detectNaukriMode() {
  const url = window.location.href;
  const hasChatbot = !!(
    document.querySelector(".chatbot-body, .ssbot-body, [class*='chatbot-modal']")
  );
  const hasQuickApply = !!(
    document.querySelector(".apply-popup, .quick-apply-popup, #apply-popup-cointainer")
  );

  if (hasChatbot) return "chatbot";
  if (hasQuickApply) return "quick-apply";
  if (url.includes("/job-listings") || url.includes("/apply-for")) return "full-apply";
  return "full-apply"; // Default for job pages
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

      const mode = detectNaukriMode();
      let filled = 0;
      let note = "";

      if (mode === "chatbot") {
        filled = autofillNaukriChatbot(profile);
        note = "Naukri chatbot mode: answered current question. Click Autofill again for each new question.";
      } else if (mode === "quick-apply") {
        filled = autofillNaukriQuickApply(profile);
        note = "Naukri Quick Apply filled!";
      } else {
        filled = autofillNaukriFullApply(profile);
        note = "Naukri full application filled!";
      }

      sendResponse({
        success: true,
        filled,
        note: filled > 0 ? note : "No matching fields found. Make sure the Apply form is open."
      });
    } catch (e) {
      console.error("Jarvis Naukri autofill error:", e);
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
      cachedNaukriProfile = profile;
      const mode = detectNaukriMode();
      let filled = 0;
      if (mode === "chatbot") filled = autofillNaukriChatbot(profile);
      else if (mode === "quick-apply") filled = autofillNaukriQuickApply(profile);
      else filled = autofillNaukriFullApply(profile);
      sendResponse({ success: true, filled });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }

  return true;
});

// ─────────────────────────────────────────────
// MUTATION OBSERVER — Watch for modal/chatbot open
// ─────────────────────────────────────────────
let naukriObserver = null;
let cachedNaukriProfile = null;

async function getNaukriProfile() {
  if (cachedNaukriProfile) return cachedNaukriProfile;
  return new Promise(resolve => {
    chrome.storage.local.get(["user_profile"], result => {
      cachedNaukriProfile = result.user_profile || null;
      resolve(cachedNaukriProfile);
    });
  });
}

naukriObserver = new MutationObserver(async mutations => {
  const hasNewModal = mutations.some(m =>
    Array.from(m.addedNodes).some(node =>
      node.nodeType === 1 && (
        node.classList?.contains("apply-popup") ||
        node.classList?.contains("chatbot-modal") ||
        node.classList?.contains("ssbot-body") ||
        node.querySelector?.(".apply-popup, .chatbot-body, .chatbot-modal")
      )
    )
  );

  if (!hasNewModal) return;

  await new Promise(r => setTimeout(r, 600));
  const profile = await getNaukriProfile();
  if (!profile) return;

  const mode = detectNaukriMode();
  let filled = 0;
  if (mode === "chatbot") filled = autofillNaukriChatbot(profile);
  else if (mode === "quick-apply") filled = autofillNaukriQuickApply(profile);

  if (filled > 0) console.log(`Jarvis OS [Naukri Auto]: Auto-filled ${filled} fields.`);
});

naukriObserver.observe(document.body, { childList: true, subtree: true });

console.log("Jarvis OS: Naukri MutationObserver active.");
