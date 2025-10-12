import { NextRequest } from "next/server"

const TTS_URL = (voiceId: string) =>
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

export const runtime = "nodejs"

function need(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json().catch(() => ({}))
    if (!text || typeof text !== "string") {
      return new Response("missing text", { status: 400 })
    }

    const r = await fetch(TTS_URL(need("ELEVENLABS_VOICE_ID")), {
      method: "POST",
      headers: {
        "xi-api-key": need("ELEVENLABS_API_KEY"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.7 }
      })
    })

    if (!r.ok) {
      const err = await r.text().catch(() => "")
      return new Response(err || "tts failed", { status: 502 })
    }

    const ab = await r.arrayBuffer()
    return new Response(ab, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store"
      }
    })
  } catch (e: any) {
    return new Response(e?.message || "tts error", { status: 500 })
  }
}
