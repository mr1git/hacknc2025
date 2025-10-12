"use client";

import { useRef, useState } from "react";

type HistoryMsg = { role: "user" | "assistant"; content: string };
type OnboardingContext = Partial<{
  basics: Record<string, any>;
  security: Record<string, any>;
  address: Record<string, any>;
  employment: Record<string, any>;
  "trusted-contact": Record<string, any>;
  review: Record<string, any>;
}>;

type Props = {
  /** Optional onboarding page; if omitted, Gemini runs in Q&A mode */
  page?: string;
  /** Global context snapshot (caller is source of truth) */
  context?: OnboardingContext;
  /** Already-filled values on this page */
  currentPageData?: Record<string, any>;
  /** Prior chat turns sent to Gemini for better answers */
  history?: HistoryMsg[];

  /** Callbacks to sync with chat + UI */
  onBusyChange?: (busy: boolean) => void;
  onTranscript?: (text: string) => void; // so chat can show the user message
  onAIResult?: (payload: { speakToUser?: string; autofill?: any }) => void; // chat merges autofill + shows bot msg
  onAutofill?: (fields: Record<string, any>) => void; // if you want to hook directly
  onSpeak?: (text: string) => void; // forward to ElevenLabs TTS if you centralize there

  /** Endpoints (override if needed) */
  sttPath?: string;     // default "/api/stt"
  ttsPath?: string;     // default "/api/tts"
  geminiPath?: string;  // default "/api/gemini"

  /** Button UI */
  buttonClassName?: string;
  idleLabel?: string;
  busyLabel?: string;
};

export default function VoiceLoop({
  page,
  context,
  currentPageData,
  history,
  onBusyChange,
  onTranscript,
  onAIResult,
  onAutofill,
  onSpeak,
  sttPath = "/api/stt",
  ttsPath = "/api/tts",
  geminiPath = "/api/gemini",
  buttonClassName = "px-3 py-2 rounded bg-black text-white disabled:opacity-60",
  idleLabel = "Hold to talk",
  busyLabel = "Working...",
}: Props) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isBusy, setIsBusy] = useState(false);

  function setBusy(b: boolean) {
    setIsBusy(b);
    onBusyChange?.(b);
  }

  function pickMime(): string | undefined {
    if (typeof MediaRecorder === "undefined") return undefined;
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
    if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
    if (MediaRecorder.isTypeSupported("audio/mpeg")) return "audio/mpeg";
    return undefined;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.start();
      mediaRecorderRef.current = mr;
    } catch (err) {
      console.error("mic error", err);
      alert("Mic unavailable. Check permissions.");
    }
  }

  async function stopAndProcess() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    setBusy(true);

    const stopped = new Promise<void>((res) => {
      mr.onstop = () => res();
    });
    mr.stop();
    await stopped;

    try {
      // 1) STT
      const first = chunksRef.current[0] as Blob | undefined;
      const type = first?.type || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      const filename =
        type.includes("mp4") ? "clip.m4a" : type.includes("mpeg") ? "clip.mp3" : "clip.webm";

      const sttForm = new FormData();
      sttForm.append("audio", blob, filename);

      const sttRes = await fetch(sttPath, { method: "POST", body: sttForm });
      if (!sttRes.ok) throw new Error(await sttRes.text());
      const sttData = (await sttRes.json()) as { text?: string };
      const userTranscript = (sttData.text || "").trim();
      if (!userTranscript) {
        // propagate to chat if needed
        onAIResult?.({
          speakToUser: "I didn't catch that. Say it one more time.",
          autofill: {},
        });
        setBusy(false);
        return;
      }

      onTranscript?.(userTranscript);

      // 2) Gemini
      const payload: any = { text: userTranscript, history };
      if (page) payload.page = page;
      if (context) payload.context = context;
      if (page && currentPageData) payload.currentPageData = currentPageData;

      const gRes = await fetch(geminiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!gRes.ok) throw new Error(await gRes.text());
      const gData = (await gRes.json()) as { speakToUser?: string; autofill?: any };

      // push to store/UI if desired
      if (gData.autofill && onAutofill) {
        onAutofill(gData.autofill);
      }
      onAIResult?.(gData);

      const line = (gData.speakToUser || "Got it. What should I grab next?").trim();

      // 3) TTS
      const ttsRes = await fetch(ttsPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: line }),
      });
      if (!ttsRes.ok) throw new Error(await ttsRes.text());
      const mp3Buf = await ttsRes.arrayBuffer();
      const mp3Url = URL.createObjectURL(new Blob([mp3Buf], { type: "audio/mpeg" }));
      if (audioRef.current) {
        audioRef.current.src = mp3Url;
        await audioRef.current.play();
      }
      onSpeak?.(line);
    } catch (err) {
      console.error("voice loop error", err);
      alert("Something glitched. Try again.");
    } finally {
      try {
        mr.stream.getTracks().forEach((t) => t.stop());
      } catch {}
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onMouseDown={startRecording}
        onMouseUp={stopAndProcess}
        onTouchStart={startRecording}
        onTouchEnd={stopAndProcess}
        disabled={isBusy}
        className={buttonClassName}
        aria-label="Hold to talk"
        title="Hold to talk"
      >
        {isBusy ? busyLabel : idleLabel}
      </button>
      <audio ref={audioRef} />
    </div>
  );
}
