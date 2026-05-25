const BACKEND_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("status-badge");
  const profileDetails = document.getElementById("profile-details");
  const autofillBtn = document.getElementById("autofill-btn");
  const errorBox = document.getElementById("error-box");
  const manualLoginBox = document.getElementById("manual-login-box");
  const manualTokenInput = document.getElementById("manual-token-input");
  const saveManualTokenBtn = document.getElementById("save-manual-token-btn");

  let userProfile = null;
  let token = null;

  async function checkConnection() {
    errorBox.style.display = "none";
    userProfile = null;
    token = null;

    // 1. Try to get token from storage first
    const stored = await chrome.storage.local.get(["supabase_token"]);
    if (stored.supabase_token) {
      token = stored.supabase_token;
    }

    // 2. Try to scan active tabs to extract token (if not in storage)
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
                  } catch (e) {
                    return null;
                  }
                }
              }
              return null;
            }
          });

          if (results && results[0] && results[0].result) {
            token = results[0].result;
            await chrome.storage.local.set({ supabase_token: token });
            break;
          }
        }
      } catch (err) {
        console.warn("Failed to query tabs for token:", err);
      }
    }

    // 3. Try to get token from cookies of the domains (if still no token)
    if (!token) {
      try {
        const targets = [
          { url: "http://localhost:3000" },
          { url: "http://localhost:3001" },
          { url: "http://127.0.0.1:3000" },
          { url: "http://127.0.0.1:3001" },
          { url: "https://study-tracker-patil.vercel.app" }
        ];
        for (const target of targets) {
          const cookies = await chrome.cookies.getAll({ url: target.url });
          for (const cookie of cookies) {
            const isTokenCookie = cookie.name.startsWith("sb-") && (cookie.name.endsWith("-auth-token") || cookie.name.includes("-auth-token."));
            if (isTokenCookie) {
              try {
                const decoded = decodeURIComponent(cookie.value);
                const parsed = JSON.parse(decoded);
                const extractedToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
                if (extractedToken) {
                  token = extractedToken;
                  await chrome.storage.local.set({ supabase_token: token });
                  break;
                }
              } catch (e) {
                try {
                  const parsed = JSON.parse(atob(cookie.value));
                  const extractedToken = parsed?.access_token || parsed?.[0];
                  if (extractedToken) {
                    token = extractedToken;
                    await chrome.storage.local.set({ supabase_token: token });
                    break;
                  }
                } catch (innerErr) {}
              }
            }
          }
          if (token) break;
        }
      } catch (err) {
        console.warn("Failed to retrieve token from cookies:", err);
      }
    }

    if (!token) {
      statusBadge.textContent = "Disconnected";
      statusBadge.className = "status-badge";
      profileDetails.innerHTML = `
        <div style="text-align: center; padding: 8px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">Not logged in to Study Tracker.</p>
          <a href="http://localhost:3000" target="_blank" style="color: #6366f1; font-weight: 500; font-size: 13px; text-decoration: none;">Open App & Log In &rarr;</a>
        </div>
      `;
      manualLoginBox.style.display = "flex";
      autofillBtn.disabled = true;
      return;
    }

    // 4. Fetch profile from Backend
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Session expired or server error (${res.status})`);
      }

      const profile = await res.json();
      userProfile = profile;
      await chrome.storage.local.set({ user_profile: profile });

      statusBadge.textContent = "Connected";
      statusBadge.className = "status-badge connected";
      manualLoginBox.style.display = "none";

      const name = (profile.first_name || profile.last_name) 
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
        : "Incomplete Profile";

      profileDetails.innerHTML = `
        <div class="profile-row">
          <span class="label">Name</span>
          <span class="value" title="${name}">${name}</span>
        </div>
        <div class="profile-row">
          <span class="label">Email</span>
          <span class="value" title="${profile.email || ""}">${profile.email || "—"}</span>
        </div>
        <div class="profile-row">
          <span class="label">GitHub</span>
          <span class="value" title="${profile.github || ""}">${profile.github ? profile.github.replace("https://github.com/", "") : "—"}</span>
        </div>
        <div class="profile-row">
          <span class="label">Resume URL</span>
          <span class="value" title="${profile.resume_url || ""}">${profile.resume_url ? "Link Saved" : "—"}</span>
        </div>
      `;

      autofillBtn.disabled = false;

    } catch (err) {
      await chrome.storage.local.remove("supabase_token");
      statusBadge.textContent = "Error";
      statusBadge.className = "status-badge";
      errorBox.textContent = err.message;
      errorBox.style.display = "block";
      manualLoginBox.style.display = "flex";
      autofillBtn.disabled = true;
      profileDetails.innerHTML = `
        <div style="text-align: center; color: #94a3b8; font-size: 12px; padding: 8px 0;">
          Failed to sync profile from backend. Try pasting the token again.
        </div>
      `;
    }
  }

  // Handle Manual Save Click
  saveManualTokenBtn.addEventListener("click", async () => {
    const rawVal = manualTokenInput.value.trim();
    if (!rawVal) return;

    saveManualTokenBtn.textContent = "Saving...";
    saveManualTokenBtn.disabled = true;

    // Check if the input is a full Supabase JSON session from localStorage
    let tokenToSave = rawVal;
    if (rawVal.startsWith("{")) {
      try {
        const parsed = JSON.parse(rawVal);
        tokenToSave = parsed.access_token || parsed.token || rawVal;
      } catch (e) {}
    }

    await chrome.storage.local.set({ supabase_token: tokenToSave });
    manualTokenInput.value = "";
    saveManualTokenBtn.textContent = "Save";
    saveManualTokenBtn.disabled = false;
    
    await checkConnection();
  });

  // Autofill Button click handler
  autofillBtn.addEventListener("click", async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.id) {
        throw new Error("No active tab found");
      }

      errorBox.style.display = "none";
      autofillBtn.textContent = "Filling...";
      autofillBtn.disabled = true;

      // Send a message to content script on active tab
      chrome.tabs.sendMessage(activeTab.id, {
        action: "autofill",
        profile: userProfile
      }, (response) => {
        const lastErr = chrome.runtime.lastError;
        if (lastErr) {
          errorBox.textContent = "Make sure you are on a supported job application page (Lever, Greenhouse, or Workday).";
          errorBox.style.display = "block";
          autofillBtn.textContent = "⚡ Autofill Application";
          autofillBtn.disabled = false;
          return;
        }

        if (response && response.success) {
          autofillBtn.textContent = "✓ Filled Successfully!";
          autofillBtn.style.background = "#10b981";
          autofillBtn.style.boxShadow = "0 4px 14px rgba(16, 185, 129, 0.4)";
          setTimeout(() => {
            autofillBtn.textContent = "⚡ Autofill Application";
            autofillBtn.style.background = "#6366f1";
            autofillBtn.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.4)";
            autofillBtn.disabled = false;
          }, 3000);
        } else {
          errorBox.textContent = response?.error || "Autofill failed to find matching form fields.";
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

  // Initial check
  await checkConnection();
});
