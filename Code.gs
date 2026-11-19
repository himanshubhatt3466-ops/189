/**
 * Manas College Review Generator - Google Apps Script backend
 *
 * 1) In Apps Script: Project Settings -> Script properties
 *    Add GEMINI_API_KEY = your NEW Gemini API key
 * 2) Deploy -> New deployment -> Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 3) Copy the /exec URL into index.html as APPS_SCRIPT_URL.
 *
 * The key is stored in Script Properties and is never sent to the browser.
 */
const COLLEGE_NAME = "Manas College";
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || "");
  let result;
  try {
    if (p.action !== "generate") throw new Error("Invalid request.");
    result = { review: generateReview_(p) };
  } catch (err) {
    result = { error: err && err.message ? err.message : "Could not generate review." };
  }

  const json = JSON.stringify(result);
  // JSONP allows a static GitHub Pages frontend to call Apps Script without a Node server.
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Missing or invalid callback." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(callback + "(" + json + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function generateReview_(p) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Gemini API key is not configured in Apps Script Script Properties.");

  const keywords = String(p.keywords || "").split("|").map(s => s.trim()).filter(Boolean).slice(0, 12);
  const note = String(p.customNote || "").trim().slice(0, 300);
  if (!keywords.length && !note) throw new Error("Select at least one highlight or enter a short note.");

  const rating = Math.min(5, Math.max(1, Number(p.rating) || 5));
  const length = p.length === "short" ? "25 to 45 words" : p.length === "long" ? "65 to 95 words" : "40 to 65 words";
  const language = p.language === "Hinglish"
    ? "Natural Hinglish, simple Hindi written in English letters mixed with everyday English."
    : p.language === "Simple English" ? "Very simple, easy-to-read Indian English." : "Natural, clear English.";

  const personas = [
    "a current undergraduate student",
    "a final-year student preparing for placements",
    "a recent alumnus",
    "a parent visiting the campus",
    "a postgraduate student",
    "a first-year student sharing an initial impression"
  ];
  const styles = [
    "Use a warm, natural, personal voice.",
    "Keep it crisp, direct, and appreciative.",
    "Sound conversational and enthusiastic without exaggeration.",
    "Use a thoughtful tone and mention learning or campus life naturally.",
    "Start with a specific highlight rather than a generic opening.",
    "Vary sentence length and avoid promotional-sounding language."
  ];
  const hints = [
    'Do not begin with "Manas College is".',
    'Mention "Manas College" naturally, not necessarily in the first sentence.',
    "Avoid clichés and overly formal words.",
    "Do not claim facilities, events, results, or experiences that were not supplied."
  ];
  const pick = a => a[Math.floor(Math.random() * a.length)];

  const prompt = [
    "Write a genuine first-person review draft for " + COLLEGE_NAME + ".",
    "This is a writing assistant: do not pretend to have personal experience or invent facts.",
    "The visitor will edit the draft so it reflects their own real experience.",
    "User-selected rating: " + rating + "/5",
    "Highlights supplied by visitor: " + (keywords.join(", ") || "General college experience"),
    "Extra note supplied by visitor: " + (note || "None"),
    "Requested length: " + length,
    "Language: " + language,
    "Voice/persona suggestion: " + pick(personas),
    "Style: " + pick(styles),
    "Additional direction: " + pick(hints),
    "Rules: Use only supplied details; do not invent claims. Sound natural, not like an advertisement. No hashtags, bullets, excessive emojis, or rating mention. Output only the review draft."
  ].join("\n");

  let lastError = "AI could not generate a review.";
  for (let i = 0; i < MODELS.length; i++) {
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
      MODELS[i] + ":generateContent";
    const response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: { "x-goog-api-key": apiKey },
      payload: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.95, topP: 0.95, maxOutputTokens: 220 }
      }),
      muteHttpExceptions: true
    });
    const code = response.getResponseCode();
    let data = {};
    try { data = JSON.parse(response.getContentText()); } catch (_) {}
    if (code >= 200 && code < 300) {
      const parts = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts;
      const review = parts ? parts.map(x => x.text || "").join("").trim() : "";
      if (review) return review.replace(/^["']|["']$/g, "").trim();
      lastError = "Gemini returned an empty response.";
    } else {
      lastError = data && data.error && data.error.message
        ? data.error.message : "Gemini API error: " + code;
      if (code === 400 || code === 401 || code === 403) break;
    }
  }
  throw new Error(lastError);
}