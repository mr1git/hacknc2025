// app/test/page.tsx
"use client"

import { useRef, useState } from "react"

export default function Page() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">API Test Bench</h1>
      <p className="text-sm opacity-70">
        Upload a short webm/m4a/mp3 to hit /api/stt. Type a line to hit /api/tts.
      </p>
      <SttUpload />
      <TtsPlay />
    </main>
  )
}

function SttUpload() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [resp, setResp] = useState<string>("")
  const [busy, setBusy] = useState(false)

  async function send() {
    const f = fileRef.current?.files?.[0]
    if (!f) {
      alert("pick a short webm/m4a/mp3 file")
      return
    }
    setBusy(true)
    try {
      const form = new FormData()
      form.append("audio", f, f.name)
      const r = await fetch("/api/stt", { method: "POST", body: form })
      const text = await r.text()
      setResp(`${r.status} ${r.statusText}\n${text}`)
    } catch (e: any) {
      setResp(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 p-4 border rounded">
      <h2 className="font-semibold">STT tester (file upload)</h2>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*,.webm,.m4a,.mp3"
        className="block"
      />
      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {busy ? "Sending..." : "Transcribe"}
      </button>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto min-h-[3rem]">
        {resp || "response will show here"}
      </pre>
    </section>
  )
}

function TtsPlay() {
  const [text, setText] = useState("testing one two")
  const [busy, setBusy] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  async function speak() {
    if (!text.trim()) return
    setBusy(true)
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })
      const buf = await r.arrayBuffer()
      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }))
      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 p-4 border rounded">
      <h2 className="font-semibold">TTS tester (type and play)</h2>
      <textarea
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full border rounded p-2"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={speak}
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
        {busy ? "Speaking..." : "Speak"}
        </button>
        <audio ref={audioRef} />
      </div>
    </section>
  )
}
