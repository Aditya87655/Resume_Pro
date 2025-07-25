// src/app/api/ai-suggestions/route.ts
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextResponse } from 'next/server'; // Keep this import as it's typically used in API routes, even if not directly in the return.

export async function POST(req: Request) {
  try {
    const { text, type } = await req.json();

    if (!text || !type) {
      return new Response(JSON.stringify({ error: 'Missing text or type in request body' }), { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    // Use the model name from your Google AI Studio: gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    let prompt = '';
    switch (type) {
      case 'workExperience':
        prompt = `You are an AI assistant specialized in writing professional resume bullet points.
          Refine the following work experience description into 3-5 concise, impactful bullet points, focusing on achievements and quantifiable results.
          Ensure the tone is professional and action-oriented.
          Original Description: "${text}"
          `;
        break;
      case 'personalInfoSummary':
        prompt = `You are an AI assistant specialized in writing professional resume summaries.
          Refine the following personal summary into 2-3 concise, impactful paragraphs, highlighting key skills, experience, and career goals. Focus on a strong opening that grabs attention.
          Original Summary: "${text}"
          `;
        break;
      case 'skills':
        prompt = `You are an AI assistant specialized in optimizing resume skills sections.
          Review the following list of skills and suggest improvements. This could include categorizing them (e.g., Programming Languages, Frameworks, Tools), suggesting related skills, or rephrasing for clarity. Provide the output as a comma-separated list of skills, or categorized if appropriate, ensuring professional resume formatting.
          Original Skills: "${text}"
          `;
        break;
      case 'projectDescription':
        prompt = `You are an AI assistant specialized in writing professional resume project descriptions.
          Refine the following project description into 3-5 concise, impactful bullet points, focusing on the technologies used, challenges overcome, and the impact or results of the project.
          Original Description: "${text}"
          `;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid suggestion type' }), { status: 400 });
    }

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], safetySettings: safetySettings });
    const response = await result.response;
    const rawText = response.text();

    // Assuming suggestions are comma-separated or newline-separated.
    // For skills, if categorized, we might want to split differently, but for now
    // a simple split by newline/comma works, and the front-end will display as is.
    const suggestions = rawText.split('\n').filter(s => s.trim() !== '');

    return new Response(JSON.stringify({ suggestions }), { status: 200 });

  } catch (error: unknown) { // <--- THIS LINE IS THE FIX
    console.error("AI suggestion generation error:", error);
    // Ensure error message is accessed safely, this handles both Error objects and other types
    return NextResponse.json({ error: `Failed to generate AI suggestions: ${(error instanceof Error ? error.message : String(error))}` }, { status: 500 });
  }
}