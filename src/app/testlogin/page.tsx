"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import ChatAssistant from "@/components/Chat";
import { useRouter } from "next/navigation";

export default function FidelityLogin() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const suggestedTopics = [
    "What type of retirement account is best for me?",
    "Should I take a loan from my 401(k)?",
    "Should I convert to a Roth IRA?",
  ];

  // --- Login handler ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed. Please try again.");
    }
  };

  // --- Chat Assistant logic (unchanged) ---
  const handleSendMessage = async (message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `Thank you for asking about "${message}". Our team can help you with that. Would you like more specific information?`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-dark-purple border-b border-gray-200 px-6 py-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-green-600 text-3xl font-bold italic">Fidelity</div>
          <nav className="flex gap-8 text-sm">
            <a href="#" className="text-black hover:text-gray-900">
              Security
            </a>
            <a href="#" className="text-black hover:text-gray-900">
              FAQs
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-6 py-16">
        <div className="flex gap-x-40 items-start">
          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-lg shadow-lg p-10 w-[420px]"
          >
            <h1 className="text-3xl font-bold mb-8">Log in</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                  className="w-4 h-4 border-2 border-gray-400 rounded"
                />
                <label className="ml-2 text-sm">Remember my username</label>
              </div>

              {error && (
                <div className="text-red-600 text-sm font-medium">{error}</div>
              )}

              <button
                type="submit"
                className="w-full bg-violet px-8 py-3 rounded-full font-medium border-2 border-black transition-colors duration-150 hover:bg-magenta"
              >
                Log in
              </button>

              <div className="text-center">
                <a href="#" className="text-sm text-black underline">
                  Forgot username or password?
                </a>
              </div>
            </div>
          </form>

          {/* AI Assistant */}
          <ChatAssistant
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
            onSendMessage={handleSendMessage}
            suggestedTopics={suggestedTopics}
            showAudioTab={false}
          />
        </div>
      </main>

      {/* Assistant Toggle */}
      <img
        src="/bronai.png"
        alt="AI Assistant"
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full cursor-pointer object-cover bg-transparent border-0 shadow-none p-0 m-0"
        style={{
          bottom: showAssistant ? "32px" : "32px",
          right: showAssistant ? "calc(50% - 210px - 32px)" : "32px",
        }}
      />

      {/* Feedback Button */}
      {!showAssistant && (
        <div className="fixed bottom-8 right-28 bg-green-50 text-green-700 px-3 py-1 text-xs font-medium border border-green-700">
          Feedback
        </div>
      )}
    </div>
  );
}
