console.log("Antigravity Autofiller active.");

// Listen for message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofill") {
    try {
      const profile = request.profile;
      if (!profile) {
        sendResponse({ success: false, error: "No profile data found" });
        return;
      }
      
      const filledFields = autofillForm(profile);
      
      // Attempt to load resume if provided
      if (profile.resume_url) {
        tryFetchAndInjectResume(profile.resume_url);
      }
      
      sendResponse({ success: true, filled: filledFields });
    } catch (e) {
      console.error("Autofill error:", e);
      sendResponse({ success: false, error: e.message });
    }
  }
  return true; // Keep message channel open for async response
});

// Helper to check if a string contains any keyword
function matchesKeywords(str, keywords) {
  if (!str) return false;
  const s = str.toLowerCase();
  return keywords.some(k => s.includes(k.toLowerCase()));
}

// Function to find label text corresponding to an input
function getLabelTextForInput(input) {
  // Check aria-label
  if (input.getAttribute("aria-label")) {
    return input.getAttribute("aria-label");
  }
  
  // Check aria-labelledby
  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl && labelEl.textContent) return labelEl.textContent;
  }

  // Check closest label ancestor
  const parentLabel = input.closest("label");
  if (parentLabel && parentLabel.textContent) {
    return parentLabel.textContent;
  }

  // Check label with 'for' attribute matching input id
  if (input.id) {
    const labelFor = document.querySelector(`label[for="${input.id}"]`);
    if (labelFor && labelFor.textContent) return labelFor.textContent;
  }

  // Check preceding sibling labels or div headers
  let sibling = input.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === "LABEL" && sibling.textContent) {
      return sibling.textContent;
    }
    // Often there's a div holding the label text next to the input container
    const labelsInSibling = sibling.querySelectorAll("label, .label, .field-label, span");
    for (let el of labelsInSibling) {
      if (el.textContent.trim()) return el.textContent;
    }
    sibling = sibling.previousElementSibling;
  }

  return "";
}

function autofillForm(profile) {
  const inputs = document.querySelectorAll("input, textarea, select");
  let filledCount = 0;

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  // Define keywords for matcher
  const fields = {
    first_name: {
      keywords: ["first name", "firstname", "given name", "givenname"],
      value: profile.first_name || ""
    },
    last_name: {
      keywords: ["last name", "lastname", "family name", "familyname", "surname"],
      value: profile.last_name || ""
    },
    full_name: {
      keywords: ["full name", "fullname", "name", "candidate name"],
      value: fullName
    },
    email: {
      keywords: ["email", "e-mail", "mail address"],
      value: profile.email || ""
    },
    phone: {
      keywords: ["phone", "mobile", "telephone", "tel", "contact number"],
      value: profile.phone || ""
    },
    linkedin: {
      keywords: ["linkedin", "linked in"],
      value: profile.linkedin || ""
    },
    github: {
      keywords: ["github", "git hub"],
      value: profile.github || ""
    },
    website: {
      keywords: ["website", "portfolio", "personal link", "blog", "other site", "urls[portfolio]"],
      value: profile.website || ""
    },
    summary: {
      keywords: ["summary", "cover letter", "about yourself", "pitch", "additional information"],
      value: profile.summary || ""
    }
  };

  inputs.forEach(input => {
    // Skip hidden, disabled, or file inputs (files handled separately)
    if (input.type === "hidden" || input.disabled || input.type === "file") return;

    const name = input.name || "";
    const id = input.id || "";
    const placeholder = input.placeholder || "";
    const autocomplete = input.autocomplete || "";
    const labelText = getLabelTextForInput(input);

    const testStr = `${name} ${id} ${placeholder} ${autocomplete} ${labelText}`.toLowerCase();

    // Check matches
    for (const [key, field] of Object.entries(fields)) {
      if (!field.value) continue;

      // Handle split name vs full name logic
      if (key === "full_name") {
        // Only fill full name if we didn't fill first/last name, or if it specifically matches "full name"
        const isFirstNamePresent = Array.from(inputs).some(i => 
          matchesKeywords(`${i.name} ${i.id} ${getLabelTextForInput(i)}`, fields.first_name.keywords)
        );
        if (isFirstNamePresent && !matchesKeywords(testStr, ["full name", "fullname"])) {
          continue; 
        }
      }

      if (matchesKeywords(testStr, field.keywords)) {
        // Set value
        input.value = field.value;
        
        // Trigger React/Vue/Angular change events
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        
        filledCount++;
        break; // Stop matching other fields for this input
      }
    }
  });

  return filledCount;
}

// Attempt to load resume by downloading it in background and attaching to file input
async function tryFetchAndInjectResume(url) {
  try {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    let resumeInput = null;

    // Find file input matching resume
    fileInputs.forEach(input => {
      const labelText = getLabelTextForInput(input);
      const testStr = `${input.name} ${input.id} ${labelText}`.toLowerCase();
      if (testStr.includes("resume") || testStr.includes("cv") || testStr.includes("application")) {
        resumeInput = input;
      }
    });

    if (!resumeInput && fileInputs.length > 0) {
      resumeInput = fileInputs[0]; // fallback to first file input if only one
    }

    if (!resumeInput) {
      console.log("No resume file input detected.");
      return;
    }

    console.log("Fetching resume from:", url);
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Deduce filename
    let filename = "Resume.pdf";
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.toLowerCase().endsWith(".pdf")) {
      filename = lastPart;
    }

    const file = new File([blob], filename, { type: blob.type || "application/pdf" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    resumeInput.files = dataTransfer.files;
    
    // Trigger events
    resumeInput.dispatchEvent(new Event("change", { bubbles: true }));
    console.log("Resume successfully injected into file input!");
  } catch (err) {
    console.warn("Could not auto-inject resume file (usually due to CORS or local network issues):", err);
  }
}
