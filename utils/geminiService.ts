import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  toolResults?: any;
}

const PLATFORM_CONTEXT = `
You are FOGSLY AI Assistant, the intelligent assistant for the FOGSLY ecosystem platform.
FOGSLY is an all-in-one Web3 & Freelance platform where users can:
- Earn FOG Coins by watching ads, completing daily tasks, referral rewards, freelance projects, and selling digital services.
- Freelance Hub: Post jobs, bid on proposals, hire verified talent, and manage deliverables.
- Physical Jobs & Events: Find and post local physical jobs, book events with interactive location maps.
- Wallet & FOG Coin: Send/receive FOG Coins with QR codes, check live exchange rates, withdraw earnings.
- Ecosystem Services: Buy & sell digital services, brand showcases, and AI tools.
`;

export const getSuggestedQuestions = (): string[] => {
  return [
    "How can I earn Fog Coins on the platform?",
    "How do I create and bid on freelance jobs?",
    "How do I withdraw my earnings?",
    "Tell me about the referral system and rank tiers",
    "How does the Physical Jobs map work?"
  ];
};

export const generateAIResponse = async (
  prompt: string,
  history: ChatMessage[] = [],
  liveDataContext?: string
): Promise<{ content: string; toolResults?: any }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!apiKey) {
    return {
      content: "AI Assistant is running in preview mode. To enable full real-time AI responses, please configure `VITE_GEMINI_API_KEY` in your environment settings.\n\nFOGSLY provides a complete ecosystem for freelancing, e-services, job bidding, and digital currency rewards."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct prompt with context
    const fullSystemInstruction = `${PLATFORM_CONTEXT}\n\n${liveDataContext ? `Current Live Data:\n${liveDataContext}` : ''}`;
    
    const contents: any[] = [];
    
    // Add history
    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const text = response.text || 'I apologize, but I could not generate a response at this time.';
    return { content: text };
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return {
      content: `I'm having trouble connecting to the AI service right now. Please verify your connection or try again later.`
    };
  }
};
