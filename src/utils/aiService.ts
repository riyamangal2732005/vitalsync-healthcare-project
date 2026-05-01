import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const refineNotes= async (diagnosis: string, role: string) => {
  const systemContent = role === 'doctor' 
    ? `Act as a clinical documentation assistant. 
       Standardize the following notes into a concise professional summary. 
       Use objective, formal medical terminology. 
       Focus only on clinical findings and immediate treatment plan. 
       Avoid dramatic or unnecessary descriptive adjectives. Max 3 lines.`
    : `Act as a patient educator. 
       Explain the diagnosis using simple, clear terms without being overly emotional or condescending. 
       1. Summarize the condition in one sentence.
       2. List 2 specific, actionable precautions.
       Use a calm, neutral, and professional tone. Max 3 lines.`
  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct", 
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: diagnosis
        }
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};