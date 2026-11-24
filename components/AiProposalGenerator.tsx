import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Button } from './ui/Button';
import { Sparkles, LoaderCircle } from 'lucide-react';

interface AiProposalGeneratorProps {
  jobData: any;
  userData: any;
  onGenerated: (text: string) => void;
}

const AiProposalGenerator: React.FC<AiProposalGeneratorProps> = ({ jobData, userData, onGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProposal = async () => {
    setIsLoading(true);
    setError(null);
    try {
        if (!process.env.API_KEY) {
            throw new Error("API key is missing. Please configure it in your environment variables.");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            You are an expert proposal writer for a freelance marketplace called FOGSLY.
            Write a professional, compelling, and concise cover letter for a freelancer applying to a job.
            The tone should be confident but not arrogant. Keep it to 3-4 short paragraphs.
            Do not use markdown formatting like headings or bullet points. Just plain text.

            **Job Details:**
            - Title: ${jobData.title}
            - Description: ${jobData.description}
            - Required Skills: ${jobData.skills.join(', ')}

            **My Freelancer Profile:**
            - Role: ${userData.role}
            - My Top Skills: ${userData.skills.join(', ')}
            - Bio: ${userData.bio}

            Based on this information, generate a cover letter that highlights how my skills and experience are a perfect match for this job.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const generatedText = response.text || '';
        onGenerated(generatedText);

    } catch (err) {
        console.error("Error generating proposal:", err);
        setError("Failed to generate proposal. Please try again.");
        onGenerated('');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
        <Button variant="outline" onClick={generateProposal} disabled={isLoading}>
            {isLoading ? (
                <>
                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                    Generate with AI
                </>
            )}
        </Button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default AiProposalGenerator;