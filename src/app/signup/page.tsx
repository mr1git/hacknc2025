"use client"

import { useState } from "react"
import ChatAssistant from "@/components/Chat"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [showAssistant, setShowAssistant] = useState(true);

  const suggestedTopics = [
    "What type of retirement account is best for me?",
    "Should I take a loan from my 401(k)?",
    "Should I convert to a Roth IRA?",
  ];

  // ---- handle AI response ----
  const handleAIResponse = async (message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Example JSON response from AI
    // In a real scenario, AI might return a JSON string like:
    // { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "1234567890" }
    const aiJsonResponse = JSON.stringify({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "5551234567",
      password: "Password123!",
      confirmPassword: "Password123!"
    });

    // Parse JSON and update form fields
    try {
      const data = JSON.parse(aiJsonResponse);

      if (data.firstName) setFirstName(data.firstName);
      if (data.lastName) setLastName(data.lastName);
      if (data.email) setEmail(data.email);
      if (data.phone) setPhone(data.phone);
      if (data.password) setPassword(data.password);
      if (data.confirmPassword) setConfirmPassword(data.confirmPassword);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
    }

    return `Form filled with data for ${data.firstName || "user"}.`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-dark-purple border-b border-gray-200 px-6 py-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-green-600 text-3xl font-bold italic">Fidelity</div>
          <nav className="flex gap-8 text-sm">
            <a href="#" className="text-gray-700 hover:text-gray-900">Security</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">FAQs</a>
          </nav>
        </div>
      </header>

      <main className="flex items-start justify-center min-h-[calc(100vh-200px)] px-6 py-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Signup Form */}
          <section className="bg-white rounded-lg shadow-lg p-10">
            <h2 className="text-2xl font-bold mb-6">Or type it in</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="w-4 h-4 border-2 border-gray-400 rounded"
                />
                <label className="ml-2 text-sm">
                  I agree to the Terms and understand disclosures
                </label>
              </div>

              <button
                className="w-full bg-violet px-8 py-3 rounded-full font-medium border-2 border-black transition-colors duration-150 hover:bg-magenta"
                onClick={() => alert("Continue to next step")}
              >
                Continue
              </button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline">Log in</a>
              </div>
            </div>
          </section>

          {/* Chat Assistant */}
          <ChatAssistant
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
            onSendMessage={handleAIResponse}
            suggestedTopics={suggestedTopics}
            showAudioTab={true}
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
    </div>
  )
}
