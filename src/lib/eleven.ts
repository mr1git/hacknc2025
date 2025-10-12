// lib/eleven.ts
const ELEVEN_BASE = "https://api.elevenlabs.io/v1"
const STT_URL = `${ELEVEN_BASE}/speech-to-text/convert`
const TTS_URL = (voiceId: string) => `${ELEVEN_BASE}/text-to-speech/${voiceId}`

type SttOpts = {
  modelId?: string
  languageCode?: string // optional, if you want to hint language
  diarize?: boolean
}

type TtsOpts = {
  voiceId?: string
  modelId?: string
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
}

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

async function withTimeout<T>(p: Promise<T>, ms = 30000): Promise<T> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  // @ts-ignore attach signal if fetch passed in here
  try {
    // caller passes fetch with its own signal if needed
    return await p
  } finally {
    clearTimeout(t)
  }
}

/**
 * Send an audio file to ElevenLabs STT and get text back.
 * Returns the transcript string. You can expand to return words if you need timestamps.
 */
export async function elevenStt(file: Blob, opts: SttOpts = {}): Promise<string> {
  const form = new FormData()
  form.append("file", file, (file as any).name || "audio.webm")
  form.append("model_id", opts.modelId || "scribe_v1")
  if (opts.languageCode) form.append("language_code", opts.languageCode)
  if (typeof opts.diarize === "boolean") form.append("diarize", String(opts.diarize))

  const res = await fetch(STT_URL, {
    method: "POST",
    headers: { "xi-api-key": requiredEnv("ELEVENLABS_API_KEY") },
    body: form
  })

  if (!res.ok) {
    const errTxt = await res.text().catch(() => "")
    throw new Error(`STT ${res.status} ${errTxt}`)
  }

  const json = await res.json().catch(() => ({} as any))
  // Eleven returns { text, words, ... }
  return json.text ?? ""
}

/**
 * Turn text into an MP3 using ElevenLabs TTS.
 * Returns ArrayBuffer so you can put it straight into a Response body.
 */
export async function elevenTts(text: string, opts: TtsOpts = {}): Promise<ArrayBuffer> {
  const body = {
    text,
    model_id: opts.modelId || "eleven_turbo_v2",
    voice_settings: {
      stability: opts.stability ?? 0.4,
      similarity_boost: opts.similarityBoost ?? 0.7,
      style: opts.style ?? 0,
      use_speaker_boost: opts.useSpeakerBoost ?? false
    }
  }

  const res = await fetch(TTS_URL(opts.voiceId || requiredEnv("ELEVENLABS_VOICE_ID")), {
    method: "POST",
    headers: {
      "xi-api-key": requiredEnv("ELEVENLABS_API_KEY"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const errTxt = await res.text().catch(() => "")
    throw new Error(`TTS ${res.status} ${errTxt}`)
  }

  return res.arrayBuffer()
}
