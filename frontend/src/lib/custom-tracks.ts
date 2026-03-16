// // ── Custom Track Types ────────────────────────────────────────
// export interface CustomTopic {
//     id: string;
//     title: string;
//     url: string;
//     status: "not_started" | "in_progress" | "done";
//     notes: string;
// }

// export interface CustomSection {
//     title: string;
//     topics: CustomTopic[];
// }

// export interface CustomTrack {
//     id: string;           // unique id e.g. "custom_abc123"
//     title: string;        // repo name
//     color: string;
//     icon: string;
//     source: string;       // github url
//     repoOwner: string;
//     repoName: string;
//     addedAt: string;
//     sections: Record<string, CustomSection>;
// }

// const COLORS = ["#e879f9", "#06b6d4", "#f43f5e", "#84cc16", "#f97316", "#14b8a6", "#a855f7", "#0ea5e9"];
// const ICONS = ["📖", "🔥", "💡", "⚡", "🌟", "🎯", "🚀", "🛠️", "📐", "🔬", "🏆", "💎"];

// function randomColor(idx: number) { return COLORS[idx % COLORS.length]; }
// function randomIcon(idx: number) { return ICONS[idx % ICONS.length]; }

// // ── Storage ───────────────────────────────────────────────────
// export function getCustomTracksKey(userId: string) {
//     return `custom_tracks_${userId}`;
// }

// export function loadCustomTracks(userId: string): CustomTrack[] {
//     if (typeof window === "undefined") return [];
//     try {
//         const raw = localStorage.getItem(getCustomTracksKey(userId));
//         return raw ? JSON.parse(raw) : [];
//     } catch { return []; }
// }

// export function saveCustomTracks(userId: string, tracks: CustomTrack[]) {
//     localStorage.setItem(getCustomTracksKey(userId), JSON.stringify(tracks));
// }

// export function removeCustomTrack(userId: string, trackId: string): CustomTrack[] {
//     const updated = loadCustomTracks(userId).filter(t => t.id !== trackId);
//     saveCustomTracks(userId, updated);
//     return updated;
// }

// export function updateCustomTopicStatus(
//     userId: string, trackId: string, topicId: string, status: string
// ): CustomTrack[] {
//     const tracks = loadCustomTracks(userId);
//     const updated = tracks.map(track => {
//         if (track.id !== trackId) return track;
//         const sections = Object.fromEntries(
//             Object.entries(track.sections).map(([sk, section]) => [
//                 sk,
//                 {
//                     ...section,
//                     topics: section.topics.map(t =>
//                         t.id === topicId ? { ...t, status: status as any } : t
//                     ),
//                 },
//             ])
//         );
//         return { ...track, sections };
//     });
//     saveCustomTracks(userId, updated);
//     return updated;
// }

// export function updateCustomTopicNotes(
//     userId: string, trackId: string, topicId: string, notes: string
// ): CustomTrack[] {
//     const tracks = loadCustomTracks(userId);
//     const updated = tracks.map(track => {
//         if (track.id !== trackId) return track;
//         const sections = Object.fromEntries(
//             Object.entries(track.sections).map(([sk, section]) => [
//                 sk,
//                 {
//                     ...section,
//                     topics: section.topics.map(t =>
//                         t.id === topicId ? { ...t, notes } : t
//                     ),
//                 },
//             ])
//         );
//         return { ...track, sections };
//     });
//     saveCustomTracks(userId, updated);
//     return updated;
// }

// // ── GitHub README fetcher ─────────────────────────────────────
// export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
//     try {
//         const clean = url.trim().replace(/\/$/, "");
//         const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
//         if (!match) return null;
//         return { owner: match[1], repo: match[2] };
//     } catch { return null; }
// }

// export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
//     // Try main branch first, then master
//     for (const branch of ["main", "master"]) {
//         const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
//         try {
//             const res = await fetch(url);
//             if (res.ok) return res.text();
//         } catch { continue; }
//     }
//     return null;
// }

// // ── Groq AI topic extractor ───────────────────────────────────
// const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
// const GROQ_MODEL = "llama-3.3-70b-versatile";

// export async function extractTopicsWithAI(
//     readme: string,
//     repoName: string,
//     repoUrl: string
// ): Promise<{ sections: Record<string, CustomSection> } | null> {
//     // Truncate README to avoid token limits (keep first 8000 chars)
//     const truncated = readme.slice(0, 8000);

//     const systemPrompt = `You are a JSON extractor. Extract learning topics from a GitHub README.

// RULES:
// 1. Extract ALL links/topics from the README
// 2. Group them into logical sections
// 3. Each topic MUST have a real URL from the README (not made up)
// 4. If no URL exists for a topic, use the repo URL as fallback
// 5. Return ONLY valid JSON — no markdown, no explanation, no backticks

// OUTPUT FORMAT (strict JSON):
// {
//   "sections": {
//     "section_key": {
//       "title": "Section Title",
//       "topics": [
//         {
//           "id": "unique_id_001",
//           "title": "Topic Title",
//           "url": "https://actual-url-from-readme.com",
//           "status": "not_started",
//           "notes": ""
//         }
//       ]
//     }
//   }
// }`;

//     const userPrompt = `Extract all topics and their URLs from this README for the repo "${repoName}" (${repoUrl}).
// Group into sections based on the README headings.
// Use actual URLs from the README for each topic.

// README:
// ${truncated}`;

//     try {
//         const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${GROQ_API_KEY}`,
//             },
//             body: JSON.stringify({
//                 model: GROQ_MODEL,
//                 max_tokens: 4000,
//                 temperature: 0.1,
//                 messages: [
//                     { role: "system", content: systemPrompt },
//                     { role: "user", content: userPrompt },
//                 ],
//             }),
//         });

//         if (!res.ok) return null;
//         const data = await res.json();
//         const text = data.choices?.[0]?.message?.content || "";

//         // Clean and parse JSON
//         const clean = text
//             .replace(/```json\n?/g, "")
//             .replace(/```\n?/g, "")
//             .trim();

//         const parsed = JSON.parse(clean);
//         return parsed;
//     } catch { return null; }
// }

// // ── Build full CustomTrack from AI output ─────────────────────
// export function buildCustomTrack(
//     owner: string,
//     repo: string,
//     repoUrl: string,
//     aiOutput: { sections: Record<string, CustomSection> },
//     existingCount: number
// ): CustomTrack {
//     const id = `custom_${Date.now()}`;
//     return {
//         id,
//         title: repo.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
//         color: randomColor(existingCount),
//         icon: randomIcon(existingCount),
//         source: repoUrl,
//         repoOwner: owner,
//         repoName: repo,
//         addedAt: new Date().toISOString(),
//         sections: aiOutput.sections,
//     };
// }

// // ── Stats helper ──────────────────────────────────────────────
// export function getCustomTrackStats(track: CustomTrack) {
//     let total = 0, done = 0, inProgress = 0;
//     for (const section of Object.values(track.sections)) {
//         for (const topic of section.topics) {
//             total++;
//             if (topic.status === "done") done++;
//             else if (topic.status === "in_progress") inProgress++;
//         }
//     }
//     return {
//         total, done, inProgress,
//         not_started: total - done - inProgress,
//         percent: total > 0 ? Math.round((done / total) * 100) : 0,
//         color: track.color,
//         icon: track.icon,
//         title: track.title,
//     };
// }




// ── Custom Track Types ────────────────────────────────────────
export interface CustomTopic {
    id: string;
    title: string;
    url: string;
    status: "not_started" | "in_progress" | "done";
    notes: string;
}


export interface CustomSection {
    title: string;
    topics: CustomTopic[];
}

export interface CustomTrack {
    id: string;
    title: string;
    color: string;
    icon: string;
    source: string;
    repoOwner: string;
    repoName: string;
    addedAt: string;
    sections: Record<string, CustomSection>;
}

const COLORS = ["#e879f9", "#06b6d4", "#f43f5e", "#84cc16", "#f97316", "#14b8a6", "#a855f7", "#0ea5e9", "#ec4899", "#22d3ee"];
const ICONS = ["📖", "🔥", "💡", "⚡", "🌟", "🎯", "🚀", "🛠️", "📐", "🔬", "🏆", "💎", "🧠", "⚙️", "🎓"];

// ── Storage ───────────────────────────────────────────────────
export function getCustomTracksKey(userId: string) {
    return `custom_tracks_${userId}`;
}

export function loadCustomTracks(userId: string): CustomTrack[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(getCustomTracksKey(userId));
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveCustomTracks(userId: string, tracks: CustomTrack[]) {
    localStorage.setItem(getCustomTracksKey(userId), JSON.stringify(tracks));
}

export function removeCustomTrack(userId: string, trackId: string): CustomTrack[] {
    const updated = loadCustomTracks(userId).filter(t => t.id !== trackId);
    saveCustomTracks(userId, updated);
    return updated;
}

export function updateCustomTopicStatus(
    userId: string, trackId: string, topicId: string, status: string
): CustomTrack[] {
    const tracks = loadCustomTracks(userId);
    const updated = tracks.map(track => {
        if (track.id !== trackId) return track;
        const sections = Object.fromEntries(
            Object.entries(track.sections).map(([sk, section]) => [
                sk,
                { ...section, topics: section.topics.map(t => t.id === topicId ? { ...t, status: status as any } : t) },
            ])
        );
        return { ...track, sections };
    });
    saveCustomTracks(userId, updated);
    return updated;
}

export function updateCustomTopicNotes(
    userId: string, trackId: string, topicId: string, notes: string
): CustomTrack[] {
    const tracks = loadCustomTracks(userId);
    const updated = tracks.map(track => {
        if (track.id !== trackId) return track;
        const sections = Object.fromEntries(
            Object.entries(track.sections).map(([sk, section]) => [
                sk,
                { ...section, topics: section.topics.map(t => t.id === topicId ? { ...t, notes } : t) },
            ])
        );
        return { ...track, sections };
    });
    saveCustomTracks(userId, updated);
    return updated;
}

// ── GitHub README fetcher ─────────────────────────────────────
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
        const clean = url.trim().replace(/\/$/, "");
        const match = clean.match(/github\.com\/([^/\s]+)\/([^/\s]+)/);
        if (!match) return null;
        return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    } catch { return null; }
}

export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
    for (const branch of ["main", "master", "develop"]) {
        for (const filename of ["README.md", "readme.md", "Readme.md", "README.MD"]) {
            try {
                const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`);
                if (res.ok) {
                    const text = await res.text();
                    if (text.length > 10) return text;
                }
            } catch { continue; }
        }
    }
    // Try GitHub API as last resort
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
            headers: { Accept: "application/vnd.github.raw" },
        });
        if (res.ok) return res.text();
    } catch { /* ignore */ }
    return null;
}

// ── Fallback builders ─────────────────────────────────────────
// function buildFallbackFromText(text: string, repoName: string, repoUrl: string): { sections: Record<string, CustomSection> } {
//     const lines = text.split("\n").filter(l => l.trim().length > 3);
//     // const topics: CustomTopic[] = lines.slice(0, 20).map((line, i) => {
//     const topics = lines.slice(0, 20).map((line, i): CustomTopic => {
//         const urlMatch = line.match(/https?:\/\/[^\s)>"']+/);
//         const title = line.replace(/^[-*#\d.)\s]+/, "").replace(/\[([^\]]+)\].*/, "$1").trim().slice(0, 80);
//         return {
//             id: `t${String(i + 1).padStart(3, "0")}`,
//             title: title.length > 2 ? title : `Topic ${i + 1}`,
//             url: urlMatch?.[0] || repoUrl,
//             status: "not_started",
//             notes: "",
//         };
//     }).filter(t => t.title.length > 2);

//     return topics.length > 0
//         ? { sections: { sec1: { title: repoName, topics } } }
//         : buildFallbackSections(repoName, repoUrl);
// }


// // ── Fallback builders ─────────────────────────────────────────
// function buildFallbackFromText(
//     text: string,
//     repoName: string,
//     repoUrl: string
// ): { sections: Record<string, CustomSection> } {

//     const lines = text.split("\n").filter(l => l.trim().length > 3);

//     const topics = lines.slice(0, 20).map((line, i): CustomTopic => {

//         const urlMatch = line.match(/https?:\/\/[^\s)>"']+/);

//         // Extract relative markdown links like (guide/80-spring-data-jpa.md)
//         const relativeMatch = line.match(/\(([^)]+)\)/);

//         let url = urlMatch?.[0];

//         if (!url && relativeMatch) {
//             const relative = relativeMatch[1];

//             if (!relative.startsWith("http")) {
//                 url = `${repoUrl}/blob/main/${relative}`;
//             }
//         }

//         const title = line
//             .replace(/^[-*#\d.)\s]+/, "")
//             .replace(/\[([^\]]+)\].*/, "$1")
//             .trim()
//             .slice(0, 80);

//         return {
//             id: `t${String(i + 1).padStart(3, "0")}`,
//             title: title.length > 2 ? title : `Topic ${i + 1}`,
//             url: url || repoUrl,
//             status: "not_started",
//             notes: "",
//         };

//     }).filter(t => t.title.length > 2);

//     return topics.length > 0
//         ? { sections: { sec1: { title: repoName, topics } } }
//         : buildFallbackSections(repoName, repoUrl);
// }
// ── Fallback builders ─────────────────────────────────────────
function buildFallbackFromText(
    text: string,
    repoName: string,
    repoUrl: string
): { sections: Record<string, CustomSection> } {

    const baseRepo = repoUrl.replace(/\/$/, "");
    const lines = text.split("\n").filter(l => l.trim().length > 3);

    const topics = lines.slice(0, 20).map((line, i): CustomTopic => {

        // Absolute URL
        const urlMatch = line.match(/https?:\/\/[^\s)>"']+/);

        // Relative markdown link
        const relativeMatch = line.match(/\(([^)]+)\)/);

        let url = urlMatch?.[0];

        // Handle GitHub relative links
        if (!url && relativeMatch) {
            const relative = relativeMatch[1];

            if (relative && !relative.startsWith("http")) {
                //url = `${baseRepo}/blob/master/${relative}`;
                url = `${baseRepo}/blob/HEAD/${relative}`;
            }
        }

        const title = line
            .replace(/^[-*#\d.)\s]+/, "")
            .replace(/\[([^\]]+)\].*/, "$1")
            .trim()
            .slice(0, 80);

        return {
            id: `t${String(i + 1).padStart(3, "0")}`,
            title: title.length > 2 ? title : `Topic ${i + 1}`,
            url: url || baseRepo,
            status: "not_started",
            notes: "",
        };

    }).filter(t => t.title.length > 2);

    return topics.length > 0
        ? { sections: { sec1: { title: repoName, topics } } }
        : buildFallbackSections(repoName, repoUrl);
}
function buildFallbackSections(repoName: string, repoUrl: string): { sections: Record<string, CustomSection> } {
    const name = repoName.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
        sections: {
            sec1: {
                title: "Topics",
                topics: [
                    { id: "t001", title: `${name} — Overview`, url: repoUrl, status: "not_started", notes: "" },
                    { id: "t002", title: `${name} — Study Materials`, url: repoUrl, status: "not_started", notes: "" },
                    { id: "t003", title: `${name} — Practice Problems`, url: repoUrl, status: "not_started", notes: "" },
                    { id: "t004", title: `${name} — Key Concepts`, url: repoUrl, status: "not_started", notes: "" },
                    { id: "t005", title: `${name} — Interview Prep`, url: repoUrl, status: "not_started", notes: "" },
                ],
            },
        },
    };
}

// ── Groq AI topic extractor ───────────────────────────────────
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function extractTopicsWithAI(
    readme: string,
    repoName: string,
    repoUrl: string
): Promise<{ sections: Record<string, CustomSection> }> {
    const truncated = (readme || "").slice(0, 10000);

    const systemPrompt = `You are a JSON extractor for GitHub repos. Extract study topics from ANY README format.

RULES:
1. ALWAYS return valid JSON — never fail, never return empty
2. Extract links as topics with their actual URLs
3. If no links exist, create topics from headings/bullets using the repo URL
4. If README is empty, create 5 basic topics from the repo name
5. Group into sections by README headings. Use "Topics" if no headings exist
6. IDs must be unique strings like "t001", "t002"
7. Return ONLY the raw JSON object — no markdown, no backticks, no explanation

FORMAT: {"sections":{"key":{"title":"name","topics":[{"id":"t001","title":"name","url":"https://...","status":"not_started","notes":""}]}}}`;

    const userPrompt = `Repo: ${repoName} (${repoUrl})

README:
${truncated || `Empty README. Create 5 study topics for: ${repoName}`}

Return ONLY valid JSON. Use "${repoUrl}" for any topic without a URL.`;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                max_tokens: 4000,
                temperature: 0.1,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
            }),
        });

        if (!res.ok) return buildFallbackSections(repoName, repoUrl);

        const data = await res.json();
        let text = data.choices?.[0]?.message?.content || "";

        // Strip markdown code blocks
        text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

        // Extract JSON object
        const first = text.indexOf("{");
        const last = text.lastIndexOf("}");
        if (first !== -1 && last !== -1) {
            text = text.slice(first, last + 1);
        }

        try {
            const parsed = JSON.parse(text);
            if (parsed?.sections && Object.keys(parsed.sections).length > 0) {
                // Sanitize all topics
                for (const [, section] of Object.entries(parsed.sections) as any[]) {
                    if (!Array.isArray(section.topics)) section.topics = [];
                    section.topics = section.topics.map((t: any, i: number) => ({
                        id: t.id || `t${String(i + 1).padStart(3, "0")}`,
                        title: t.title || `Topic ${i + 1}`,
                        url: t.url || repoUrl,
                        status: "not_started",
                        notes: "",
                    }));
                }
                return parsed;
            }
        } catch { /* fall through */ }

        // Try to extract topics from raw AI text
        return buildFallbackFromText(text, repoName, repoUrl);

    } catch {
        return buildFallbackSections(repoName, repoUrl);
    }
}

// ── Build full CustomTrack ────────────────────────────────────
export function buildCustomTrack(
    owner: string,
    repo: string,
    repoUrl: string,
    aiOutput: { sections: Record<string, CustomSection> },
    existingCount: number
): CustomTrack {
    return {
        id: `custom_${Date.now()}`,
        title: repo.replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        color: COLORS[existingCount % COLORS.length],
        icon: ICONS[existingCount % ICONS.length],
        source: repoUrl,
        repoOwner: owner,
        repoName: repo,
        addedAt: new Date().toISOString(),
        sections: aiOutput.sections,
    };
}

// ── Stats ─────────────────────────────────────────────────────
export function getCustomTrackStats(track: CustomTrack) {
    let total = 0, done = 0, inProgress = 0;
    for (const section of Object.values(track.sections)) {
        for (const topic of section.topics) {
            total++;
            if (topic.status === "done") done++;
            else if (topic.status === "in_progress") inProgress++;
        }
    }
    return {
        total, done, inProgress,
        not_started: total - done - inProgress,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
        color: track.color,
        icon: track.icon,
        title: track.title,
    };
}