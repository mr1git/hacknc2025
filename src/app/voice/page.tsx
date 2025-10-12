// app/voice/page.tsx
import VoiceLoop from "@/components/VoiceLoop"

export default function Page() {
  // set the current onboarding step so /api/gemini knows what to extract
  const onboardingPage = "Basics" // e.g. "Basics" | "Security" | "Employment" | "Address"

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">QuickVest Voice</h1>
      <p className="text-sm opacity-70">
        Hold the button to speak. We transcribe with ElevenLabs, send the transcript to /api/gemini,
        then speak the AI reply back.
      </p>
      <VoiceLoop page={onboardingPage} />
    </main>
  )
}
