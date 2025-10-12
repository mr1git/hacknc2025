// src/app/api/gemini/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PageSchemas, PageKey } from "@/src/lib/pageSchemas";
import type { InboundMessage, GeminiResponse } from "@/src/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const SITE = {
  home: "/",
  signup: "/signup",
  login: "/login",
};


function extractJson(s: string) {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1].trim() : s.trim();
}

// Light redaction so we never echo or pass full SSN (if it existed elsewhere)
function redactCtx<T = any>(ctx: T): T {
  try {
    const clone: any = JSON.parse(JSON.stringify(ctx || {}));
    if (clone?.security) {
      if ("ssnFull" in clone.security) delete clone.security.ssnFull;
    }
    return clone;
  } catch {
    return ctx;
  }
}

// Deterministic fallback parser for EMPLOYMENT if LLM returns empty autofill
function parseEmploymentFallback(input: string) {
  const out: any = {};
  const lower = input.toLowerCase();

  const map: Record<string, string> = {
    "full time": "Employed full-time",
    "full-time": "Employed full-time",
    "part time": "Employed part-time",
    "part-time": "Employed part-time",
    "self employed": "Self-employed",
    "self-employed": "Self-employed",
    "contract": "Contractor",
    "contractor": "Contractor",
    "student": "Student",
    "retired": "Retired",
    "unemployed": "Unemployed",
  };
  for (const k of Object.keys(map)) {
    if (lower.includes(k)) { out.status = map[k]; break; }
  }

  const t1 = input.match(/title[:\s]+([A-Za-z0-9 &\-\/]+)\b/i)?.[1];
  const t2 = input.match(/\bas (an?|the)?\s+([A-Z][A-Za-z0-9 &\-\/]+)\b/);
  if (t1) out.title = t1.trim();
  else if (t2) out.title = t2[2].trim();

  const emp = input.match(/\bat\s+([A-Z][A-Za-z0-9 &\.\-’']+)/);
  if (emp) out.employer = emp[1].trim().replace(/[\.]$/, "");

  const affTrue =
    /affiliated|affiliate|broker-?dealer|finra|exchange|member firm/i.test(input) &&
    !/not affiliated|no affiliation/i.test(input);
  if (affTrue) {
    out.isRegAffiliated = true;
    const firm =
      input.match(/(?:at|with)\s+([A-Z][A-Za-z0-9 &\.\-’']+)\b(?: broker|$)/) ||
      input.match(/(?:with)\s+([A-Z][A-Za-z0-9 &\.\-’']+)/);
    if (firm) out.regFirmName = firm[1].trim().replace(/[\.]$/, "");
  } else if (/not affiliated|no affiliation/i.test(input)) {
    out.isRegAffiliated = false;
  }

  const insiderTrue =
    /insider|board|director|policy[-\s]?making officer|10%|ten percent/i.test(input) &&
    !/not an insider|no insider/i.test(input);
  if (insiderTrue) {
    out.isInsider = true;
    const comp = input.match(/insider (?:at|of)\s+([A-Z][A-Za-z0-9 &\.\-’']+)/i);
    if (comp) out.insiderCompany = comp[1].trim().replace(/[\.]$/, "");
  } else if (/not an insider|no insider/i.test(input)) {
    out.isInsider = false;
  }

  if (/backup withholding/i.test(input)) {
    if (/(not|no)\s+.*backup withholding/i.test(input)) out.irsBackupWithholding = false;
    if (/(subject|am|is)\s+.*backup withholding/i.test(input)) out.irsBackupWithholding = true;
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InboundMessage;
    const rawPage = (body.page || "").toLowerCase();
    const page = rawPage as PageKey;
    const text = (body.text || "").trim();
    const currentPageData = body.currentPageData ?? {};
    const safeContext = redactCtx(body.context ?? {});

    if (!text) {
      return NextResponse.json(
        { error: "Missing 'text' field (transcript or chat message)." },
        { status: 400 }
      );
    }

    // Decide mode: onboarding (page known) vs. QA (no/invalid page)
    const onboardingMode = !!page && !!PageSchemas[page];

    // ---------- Q&A FALLBACK MODE ----------
    if (!onboardingMode) {
      const qaPrompt = `
You are QuickVest Assistant.

NAVIGATION-FIRST POLICY:
- If the user's question maps to a specific page in our site map, guide them there FIRST with a clear, direct instruction and the exact path from the site map.
- Only if the site map does not cover their request, give a concise, plain-English answer.
- Never tell them to "visit our website or app" generically—always reference a concrete path from the site map if applicable.
- Keep replies short (1–2 sentences).

SITE MAP (use these exact paths in your reply):
${JSON.stringify(SITE)}

OPTIONAL CONTEXT:
${JSON.stringify(safeContext)}

USER:
"""${text}"""

Return ONLY plain text. Include a path like /signup when relevant.
`.trim();


      const result = await model.generateContent(qaPrompt);
      let speak = result.response.text().trim();

      // Safety: don't echo 9-digit SSNs if user pasted one
      if (/\b\d{9}\b/.test(speak)) {
        speak = "I can’t repeat sensitive numbers, but I can help with your question.";
      }

      const qaResponse: GeminiResponse = { speakToUser: speak, autofill: {} };
      return NextResponse.json(qaResponse);
    }

    // ---------- ONBOARDING MODE (page-specific) ----------
    // Build a simple shape of allowed keys to show the model
    const schema = PageSchemas[page];
    const allowed: Record<string, any> = {};
    // @ts-ignore Zod object exposes .shape
    const keys = Object.keys(schema.shape ?? {});
    for (const k of keys) allowed[k] = "";
    if (page === "review") {
      allowed.acknowledgements = { tos: false, privacy: false, disclosures: false, esig: false };
    }

    const basePrompt = `
You are QuickVest Copilot for the "${page}" onboarding page.

Return ONLY raw JSON (no backticks, no markdown, no prose) in this structure:
{
  "autofill": <object containing ONLY keys from this page>,
  "speakToUser": "<one or two short sentences>"
}

Allowed keys for "autofill" on this page:
${JSON.stringify(allowed)}

Context from other pages (read-only; do not modify):
${JSON.stringify(safeContext)}

Data already filled on this page (treat as ground truth unless the user corrects it):
${JSON.stringify(currentPageData)}

Rules:
- Prefer user corrections on THIS page over currentPageData.
- Use context to avoid re-asking for info we already know on other pages.
- DO NOT say you "filled" anything unless "autofill" has at least one key.
- If you couldn't confidently extract any field, set "autofill": {} and ask a targeted follow-up in "speakToUser".
- Never include a full 9-digit SSN in "speakToUser". Only last-4 belongs in autofill when exactly 4 digits were given.
- Keep "speakToUser" concise and avoid repeating sensitive PII.
`.trim();

    const employmentFewShot = `
You must output ONLY JSON. Fill fields only if confidently extracted.

Aliases:
- status ∈ {"Employed full-time","Employed part-time","Self-employed","Unemployed","Student","Retired","Contractor","Other"}
- isRegAffiliated: true if user or household is employed by/affiliated with broker-dealer, exchange, FINRA, muni dealer, or "member firm".
- regFirmName: name of that firm (string).
- isInsider: true if user/spouse/household is a board member, policymaking officer, or ≥10% shareholder of a public company.
- insiderCompany: the public company name (string).
- irsBackupWithholding: true if user says IRS notified them, or “subject to backup withholding”.

Examples (input → output):

Input: "I’m full time at Acme Robotics as a Software Engineer. No affiliations. Not an insider."
Output:
{"autofill":{"status":"Employed full-time","title":"Software Engineer","employer":"Acme Robotics","isRegAffiliated":false,"isInsider":false},"speakToUser":"I filled your employment details."}

Input: "Contract data analyst for Bluefin Analytics. I’m an insider at Tidepool Energy. No broker-dealer affiliation."
Output:
{"autofill":{"status":"Contractor","title":"Data Analyst","employer":"Bluefin Analytics","isInsider":true,"insiderCompany":"Tidepool Energy","isRegAffiliated":false},"speakToUser":"Noted your role and insider company."}

Input: "Part-time barista at Bean & Co. My spouse works at Fidelity broker-dealer. IRS said I’m subject to backup withholding."
Output:
{"autofill":{"status":"Employed part-time","title":"Barista","employer":"Bean & Co","isRegAffiliated":true,"regFirmName":"Fidelity","irsBackupWithholding":true},"speakToUser":"Thanks. I captured the affiliation and withholding."}

Rules:
- DO NOT say you filled anything if "autofill" is {}.
- If unsure about status wording, map to the closest option above.
`.trim();

    const prompt =
      page === "employment"
        ? `${basePrompt}\n\n${employmentFewShot}\n\nUser input:\n"""${text}"""`
        : `${basePrompt}\n\nUser input:\n"""${text}"""`;

    const result = await model.generateContent(prompt);
    const rawMaybeFenced = result.response.text();
    const raw = extractJson(rawMaybeFenced);

    let data: GeminiResponse;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        speakToUser: raw || "I parsed your message, but couldn’t format JSON properly.",
        autofill: {},
      };
    }

    // --- ZOD VALIDATION + STRIP UNKNOWN KEYS ---
    if (data.autofill) {
      const parsed = PageSchemas[page].partial().safeParse(data.autofill);
      data.autofill = parsed.success ? parsed.data : {};
    } else {
      data.autofill = {};
    }

    // EMPLOYMENT FALLBACK (if LLM answered but left autofill empty)
    if (page === "employment" && Object.keys(data.autofill).length === 0) {
      const fallback = parseEmploymentFallback(text);
      if (Object.keys(fallback).length > 0) {
        const parsed = PageSchemas.employment.partial().safeParse(fallback);
        if (parsed.success) data.autofill = parsed.data;
      }
    }

    // --- NO-EMPTY-FILL GUARD + SMART FOLLOW-UP ---
    const filledKeys = Object.keys(data.autofill ?? {});
    if (filledKeys.length === 0) {
      const followups: Record<string, string> = {
        basics: "I didn’t catch enough to fill fields. What’s your full name, email, or phone number?",
        security: "I didn’t catch it. What’s your date of birth or the last 4 of your SSN?",
        address: "Could you share your street address (and city/state/ZIP if you have it)?",
        employment: "What’s your employment status, title, and employer? Any broker-dealer affiliation or insider role?",
        "trusted-contact": "Who is your trusted contact and how can we reach them?",
        review: "Do you agree to the terms, privacy, disclosures, and e-sign?",
      };
      data.speakToUser = followups[page] ?? "Can you share one required detail for this step?";
    }

    // Final safety: never echo a full 9-digit SSN in speakToUser
    if (data.speakToUser && /\b\d{9}\b/.test(data.speakToUser)) {
      data.speakToUser = "Thanks — I’ve saved that securely.";
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Gemini route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
