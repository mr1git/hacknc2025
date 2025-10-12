// app/voice-test/page.tsx
"use client"

import { useState } from "react"
import VoiceLoop from "@/components/VoiceLoop"

const STEPS = ["Basics", "Security", "Address", "Employment", "Review"] as const
type Step = (typeof STEPS)[number]

export default function Page() {
  const [step, setStep] = useState<Step>("Basics")
  const usingStub = process.env.NEXT_PUBLIC_USE_GEMINI_STUB === "true"

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">VoiceLoop test</h1>
        <p className="text-sm opacity-70">
          Hold the button to talk. We do STT, send{" "}
          <code>{`{ transcript, page: "${step}" }`}</code> to /api/gemini, then TTS the reply.
        </p>
        {usingStub && (
          <div className="rounded bg-yellow-100 text-yellow-900 p-3 text-sm">
            Gemini stub is ON. Set NEXT_PUBLIC_USE_GEMINI_STUB=false when the real endpoint is ready.
          </div>
        )}
      </header>

      <section className="space-y-2">
        <label className="text-sm font-medium">Onboarding step</label>
        <div className="flex flex-wrap gap-2">
          {STEPS.map(s => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`px-3 py-1.5 rounded border ${
                step === s ? "bg-black text-white" : "bg-white"
              }`}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs opacity-70">
          Current page: <b>{step}</b>
        </p>
      </section>

      <section>
        <VoiceLoop page={step} />
      </section>
    </main>
  )
}
