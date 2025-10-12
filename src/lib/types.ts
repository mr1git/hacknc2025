export type GeminiAutofill = Record<string, any>;

export type GeminiResponse = {
  speakToUser: string;      // brief, conversational reply
  autofill?: GeminiAutofill // only keys valid for the current page
};

export type OnboardingContext = Partial<{
  basics: Record<string, any>;
  security: Record<string, any>;
  address: Record<string, any>;
  employment: Record<string, any>;
  "trusted-contact": Record<string, any>;
  review: Record<string, any>;
}>;

export type InboundMessage = {
  page: string;
  text: string;
  history?: { role: "user" | "assistant"; content: string }[];
  source?: "stt" | "chat";
  currentPageData?: Record<string, any>; // already filled for this page
  context?: OnboardingContext;           // read-only snapshot of other pages
};

