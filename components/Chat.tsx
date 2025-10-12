'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowUp, Bot, User } from 'lucide-react';
import VoiceLoop from '@/components/VoiceLoop';

/** -------- Types (self-contained) -------- */
type HistoryMsg = { role: 'user' | 'assistant'; content: string };

type OnboardingContext = Partial<{
  basics: Record<string, any>;
  security: Record<string, any>;
  address: Record<string, any>;
  employment: Record<string, any>;
  'trusted-contact': Record<string, any>;
  review: Record<string, any>;
}>;

type PageKey =
  | 'basics'
  | 'security'
  | 'address'
  | 'employment'
  | 'trusted-contact'
  | 'review'
  | 'submit';

type ChatMessage = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type ChatAssistantProps = {
  isOpen: boolean;
  onClose: () => void;

  /** Optional page => onboarding mode (autofill). Omit => global Q&A. */
  page?: PageKey;

  context?: OnboardingContext;
  currentPageData?: Record<string, any>;

  onAutofill?: (fields: Record<string, any>) => void;
  onSpeak?: (text: string) => void;

  apiPath?: string; // defaults to /api/gemini
  sttPath?: string; // defaults to /api/stt
  ttsPath?: string; // defaults to /api/tts

  suggestedTopics?: string[];

  /** Whether to show the Audio tab */
  showAudioTab?: boolean;
};

/** -------- Component -------- */
const DEFAULT_TOPICS = [
  'How do I reset my password?',
  'What are your trading hours?',
  'How do I transfer funds?',
  'What fees do you charge?',
];

export default function ChatAssistant({
  isOpen,
  onClose,
  page,
  context,
  currentPageData,
  onAutofill,
  onSpeak,
  apiPath = '/api/gemini',
  sttPath = '/api/stt',
  ttsPath = '/api/tts',
  suggestedTopics = DEFAULT_TOPICS,
  showAudioTab = false, // <-- hardcoded prop to control tab 2 visibility
}: ChatAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'audio'>('chat');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildHistory = (): HistoryMsg[] =>
    messages.map((m) => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text,
    }));

  /** ---- Typed send ---- */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const payload: any = { text: trimmed, history: buildHistory() };
      if (page) payload.page = page;
      if (context) payload.context = context;
      if (page && currentPageData) payload.currentPageData = currentPageData;

      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const data: { speakToUser: string; autofill?: Record<string, any> } = await res.json();
console.log("[ChatAssistant] /api/gemini response:", data);

// Try merge if (a) we are on an onboarding page, (b) autofill is an object with any keys
if (page && data && typeof data.autofill === "object" && data.autofill && onAutofill) {
  const keys = Object.keys(data.autofill);
  console.log("[ChatAssistant] attempting onAutofill with keys:", keys);
  if (keys.length > 0) onAutofill(data.autofill);
}

      if (data.speakToUser && onSpeak) onSpeak(data.speakToUser);

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        text: data.speakToUser || 'Okay.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicClick = (topic: string) => setInput(topic);
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** ---- Voice integration: callbacks ---- */
  const handleVoiceBusy = (b: boolean) => setIsTyping(b);

  const handleVoiceTranscript = (txt: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: txt,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  const handleVoiceAIResult = (gData: { speakToUser?: string; autofill?: any }) => {
    console.log("[ChatAssistant] voice AI result:", gData);

  if (page && gData && typeof gData.autofill === "object" && gData.autofill && onAutofill) {
    const keys = Object.keys(gData.autofill);
    console.log("[ChatAssistant] attempting onAutofill (voice) with keys:", keys);
    if (keys.length > 0) onAutofill(gData.autofill);
  }
    const line = (gData.speakToUser || 'Okay.').trim();
    const botMessage: ChatMessage = {
      id: Date.now() + 1,
      text: line,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
    if (onSpeak && gData.speakToUser) onSpeak(gData.speakToUser);
  };

  if (!isOpen) return null;

return (
  <div className="bg-white rounded-lg shadow-2xl w-[420px] h-[600px] flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-600 to-green-700">
      <div className="flex items-center gap-2">
        <Bot className="w-6 h-6 text-black" />
        <h2 className="font-bold text-lg text-black">Fidelity Assistant</h2>
      </div>
      <button
        onClick={onClose}
        className="text-black hover:bg-white/20 rounded-full p-1 transition-colors"
        aria-label="Close assistant"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Tabs */}
    <div className="flex border-b">
      <button
        className={`flex-1 py-2 font-semibold ${
          activeTab === 'chat'
            ? 'border-b-2 border-green-600 text-green-700'
            : 'text-gray-500 hover:text-green-700'
        }`}
        onClick={() => setActiveTab('chat')}
      >
        Chat
      </button>

      {showAudioTab && (
        <button
          className={`flex-1 py-2 font-semibold ${
            activeTab === 'audio'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-500 hover:text-green-700'
          }`}
          onClick={() => setActiveTab('audio')}
        >
          Audio
        </button>
      )}
    </div>

    {/* Tab Content */}
    {activeTab === 'chat' ? (
      <>
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-700">
                  {page
                    ? "Ask for help or provide info for this step. I can also autofill fields when you share details."
                    : "Ask any question about QuickVest. I’ll answer concisely."}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                <p className="text-sm font-semibold">Ready? Let&apos;s get started.</p>
                <p className="text-sm text-gray-600">
                  Choose from one of the following popular topics:
                </p>
              </div>

              <div className="space-y-2">
                {suggestedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTopicClick(topic)}
                    className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 rounded-lg text-sm shadow-sm border border-gray-200 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-blue-500' : 'bg-green-600'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="w-5 h-5 text-black" />
                    ) : (
                      <Bot className="w-5 h-5 text-black" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-black'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input + Voice */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-2">
            <VoiceLoop
              page={page}
              context={context}
              currentPageData={currentPageData}
              history={buildHistory()}
              onBusyChange={handleVoiceBusy}
              onTranscript={handleVoiceTranscript}
              onAIResult={handleVoiceAIResult}
              onAutofill={onAutofill}
              onSpeak={onSpeak}
              sttPath={sttPath}
              ttsPath={ttsPath}
              geminiPath={apiPath}
              buttonClassName="px-3 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
              idleLabel="Hold to talk"
              busyLabel="Working..."
            />

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
                aria-label="Chat input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black bg-green-600 rounded-full p-1.5 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
                title={isTyping ? 'Working…' : 'Send'}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </>
    ) : (
      showAudioTab && (
        <section className="bg-white rounded-lg shadow-lg p-8 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2">Open an account with your voice</h1>
          <p className="text-sm opacity-70 mb-6">
            Hold to talk. We transcribe with ElevenLabs, send it to Gemini for the Sign Up step, then speak back the next prompt.
          </p>

          <VoiceLoop
            page="Basics"
            buttonClassName="w-full px-6 py-5 rounded-xl border-2 text-lg font-semibold tracking-wide disabled:opacity-60"
            styleOverride={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              borderColor: '#000000',
            }}
          />

          {/* Test API Call Button */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="w-full px-4 py-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
              onClick={async () => {
                try {
                  setIsTyping(true);
                  const payload = { test: 'dummy audio data' };
                  const res = await fetch(sttPath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  console.log('API Test Response:', data);
                  alert('API call successful! Check console for response.');
                } catch (err) {
                  console.error(err);
                  alert('API call failed. Check console for errors.');
                } finally {
                  setIsTyping(false);
                }
              }}
            >
              Test API Call
            </button>
          </div>

          <p className="mt-4 text-xs opacity-60">
            Tip: say your full legal name and email to autofill faster.
          </p>
        </section>
      )
    )}
  </div>
);

}
