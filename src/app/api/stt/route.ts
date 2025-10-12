import { NextRequest } from "next/server"

export const runtime = "nodejs"

const STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"

function need(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

export async function GET() {
  return new Response("POST audio via form-data (audio=<file>) or binary body", { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const ct = (req.headers.get("content-type") || "").toLowerCase()
    let blob: Blob | null = null
    let filename = "audio.webm"
    let type = "audio/webm"

    if (ct.includes("multipart/form-data")) {
      // form-data branch: need key "audio"
      const inForm = await req.formData()
      const file = inForm.get("audio") as File | null
      if (!file) return new Response("no audio", { status: 400 })
      blob = file
      type = file.type || type
      filename = (file as any)?.name || inferName(type)
    } else if (ct.startsWith("application/octet-stream") || ct.startsWith("audio/")) {
      // raw binary branch: entire body is the audio file
      const ab = await req.arrayBuffer()
      if (!ab || ab.byteLength === 0) return new Response("empty body", { status: 400 })
      type = ct.startsWith("audio/") ? ct : type
      blob = new Blob([ab], { type })
      filename = inferName(type)
    } else {
      return new Response(
        'unsupported content-type. use form-data with "audio" file or send raw binary audio',
        { status: 415 }
      )
    }

    // optional language hint if you ever pass it on form-data
    // const lang = inForm?.get?.("language")

    const out = new FormData()
    out.append("file", blob, filename)
    out.append("model_id", "scribe_v1")
    // if (typeof lang === "string" && lang) out.append("language_code", lang)

    // timeout so it can’t hang forever
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 20000)

    const r = await fetch(STT_URL, {
      method: "POST",
      headers: { "xi-api-key": need("ELEVENLABS_API_KEY") },
      body: out,
      signal: ac.signal
    }).catch(e => {
      throw new Error("upstream request failed " + e.message)
    })
    clearTimeout(timer)

    const txt = await r.text().catch(() => "")
    if (!r.ok) {
      console.error("Eleven STT fail:", r.status, txt)
      return new Response(txt || "stt failed", { status: r.status })
    }

    const j = JSON.parse(txt || "{}")
    return Response.json({ text: j.text ?? "" })
  } catch (e: any) {
    if (e?.name === "AbortError") return new Response("stt timeout", { status: 504 })
    return new Response(e?.message || "stt error", { status: 500 })
  }
}

function inferName(mime?: string) {
  if (!mime) return "audio.webm"
  if (mime.includes("mp4")) return "audio.m4a"
  if (mime.includes("mpeg")) return "audio.mp3"
  if (mime.includes("webm")) return "audio.webm"
  return "audio.webm"
}
