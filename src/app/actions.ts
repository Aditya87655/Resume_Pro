// src/app/actions.ts
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData } from '@/types/resume'; // Ensure this path is correct based on your project structure
//import mammoth from 'mammoth';

// Initialize Gemini Pro model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Ensure GEMINI_API_KEY is set in your .env.local file
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Function to parse the raw text using Gemini
async function parseResumeTextWithAI(resumeText: string): Promise<ResumeData | null> {
  if (!resumeText.trim()) {
    console.warn("Attempted to parse empty or whitespace-only resume text with AI.");
    return null;
  }

  const prompt = `
    You are an expert resume parser. Extract the following information from the provided resume text and return it as a JSON object. Ensure the JSON strictly adheres to the provided TypeScript interface structure. If a field is not found, leave it as an empty string or empty array.

    IMPORTANT: For any array fields (workExperience, education, projects, achievementsCertifications), ensure each object within the array has a unique 'id' field. You can generate a simple unique string like "exp-1", "edu-a", "proj-x" or a short hash. This 'id' is crucial for React.

    Here is the TypeScript interface for the desired JSON structure:

    interface PersonalInfo {
      fullName: string;
      email: string;
      phone: string;
      linkedin: string;
      github: string;
      summary: string;
    }

    interface WorkExperience {
      id: string; // Unique ID for managing multiple experiences
      title: string;
      company: string;
      startDate: string; // e.g., "May 2020", "2020"
      endDate: string; // e.g., "Present", "Dec 2023", "2023"
      description: string; // Detailed responsibilities and achievements, ideally bullet points merged into a string
    }

    interface Education {
      id: string; // Unique ID for managing multiple education entries
      degree: string;
      institution: string;
      graduationDate: string; // e.g., "May 2023", "2023"
      gpa?: string; // Optional
    }

    interface Project {
      id: string; // Unique ID
      name: string;
      description: string;
      link?: string; // Optional project link
    }

    interface AchievementCertification {
      id: string; // Unique ID
      name: string;
      issuer?: string; // Optional
      date?: string; // Optional
    }

    interface ResumeData {
      personalInfo: PersonalInfo;
      workExperience: WorkExperience[];
      education: Education[];
      skills: string; // Comma-separated string of skills
      projects: Project[];
      achievementsCertifications: AchievementCertification[];
    }

    Resume Text to Parse:
    \`\`\`
    ${resumeText}
    \`\`\`

    Please provide only the JSON object, nothing else. Do not include any explanatory text before or after the JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean AI response: Remove markdown code block fences if present
    // This is more robust than trying to remove problematic ASCII chars that might be valid JSON escapes.
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }

    // Attempt to remove any problematic non-printable characters that might have slipped through
    // and aren't valid in JSON string values. Only target things that would break parsing.
    // This regex targets common non-printable ASCII characters that are NOT valid in JSON strings.
    // It specifically excludes valid JSON whitespace (\t, \n, \r) unless they are unescaped in source.
    text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');


    console.log("AI Raw Response (cleaned):", text);

    const parsedData: ResumeData = JSON.parse(text);

    // Ensure UUIDs for array items, or generate if missing
    // Using crypto.randomUUID() for robust unique IDs when parsing from AI
    parsedData.workExperience = parsedData.workExperience.map(item => ({ ...item, id: item.id || crypto.randomUUID() }));
    parsedData.education = parsedData.education.map(item => ({ ...item, id: item.id || crypto.randomUUID() }));
    parsedData.projects = parsedData.projects.map(item => ({ ...item, id: item.id || crypto.randomUUID() }));
    parsedData.achievementsCertifications = parsedData.achievementsCertifications.map(item => ({ ...item, id: item.id || crypto.randomUUID() }));

    return parsedData;

  } catch (aiError) {
    console.error("Error communicating with Gemini AI or parsing AI response:", aiError);
    if (aiError instanceof SyntaxError) {
      console.error("JSON Parsing Error: AI might have returned malformed JSON or invalid characters:",); // Log the problematic text
    }
    return null;
  }
}

export async function processResumeAction(formData: FormData): Promise<{ success: boolean; data?: ResumeData | null; error?: string }> {
  const file = formData.get('resumeFile') as File | null;
  const textContent = formData.get('textContent') as string | null;

  let resumeText = '';

  try {
    if (file) {
      // Check for DOCX MIME type
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        // Dynamic import mammoth to ensure it's only loaded on the server
        const mammoth_instance = (await import('mammoth')).default;
        const { value } = await mammoth_instance.extractRawText({ buffer: fileBuffer });
        resumeText = value;
      } else {
        // This 'else' block will catch unsupported file types, including PDFs
        // PDF parsing is handled client-side in ResumeUpload.tsx, so PDFs shouldn't reach here.
        // If a PDF does reach here (e.g., direct form submission without JS), it will be rejected.
        return { success: false, error: 'Unsupported file type sent from client. Only .docx files can be processed server-side via file upload.' };
      }
    } else if (textContent) {
      // This path is for text content extracted client-side (e.g., from PDF, or manual paste)
      resumeText = textContent;
    } else {
      return { success: false, error: 'No resume file or text content provided.' };
    }

    if (!resumeText.trim()) {
        return { success: false, error: 'Could not extract readable text from the document or provided text is empty.' };
    }

    const parsedData = await parseResumeTextWithAI(resumeText);

    if (parsedData) {
      return { success: true, data: parsedData };
    } else {
      return { success: false, error: 'Failed to parse resume content with AI. Please check the document format or try manual entry.' };
    }

  } catch (parseError) {
    console.error("Error during resume processing:", parseError);
    // Provide a more user-friendly error message, while logging the full error for developers
    return { success: false, error: `An unexpected error occurred during resume processing: ${(parseError as Error).message}` };
  }
}