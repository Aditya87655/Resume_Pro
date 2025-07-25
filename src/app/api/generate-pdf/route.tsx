// src/app/api/generate-pdf/route.tsx

import { PDFDocument, rgb, StandardFonts, Color } from 'pdf-lib';
import { NextResponse } from 'next/server';

// Defining interfaces for the ResumeData structure
// These types are crucial for eliminating 'any' errors by providing strong typing.
// It's recommended to have these in a shared types file (e.g., src/app/types.ts)
// and import them, but for a self-contained fix in this file, they are included here.
interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  summary?: string;
}

interface WorkExperience {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string | string[]; // MODIFIED: description can be a string or string[]
}

interface Education {
  degree?: string;
  institution?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

interface Skills {
  technical?: string[];
  soft?: string[];
  tools?: string[];
}

interface Project {
  name?: string;
  description?: string | string[]; // MODIFIED: description can be a string or string[]
  technologies?: string[];
  link?: string;
}

interface AchievementCertification {
  name?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

interface ResumeData {
  personalInfo?: PersonalInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skills;
  projects?: Project[];
  achievementsCertifications?: AchievementCertification[];
}


export async function POST(req: Request) {
  try {
    const { resumeData }: { resumeData: ResumeData } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: "No resume data provided." }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = page.getHeight() - 50;
    const x = 50;
    const sectionSpacing = 20;

    const drawText = (text: string, size: number, color: Color, isBold: boolean = false) => {
      page.drawText(text, {
        x,
        y,
        font: isBold ? boldFont : font,
        size,
        color: color,
      });
      y -= size + 5; // Move down after drawing
    };

    // Personal Info
    if (resumeData.personalInfo) {
      drawText(resumeData.personalInfo.fullName || 'Full Name', 24, rgb(0, 0.53, 0.71), true);
      drawText(`${resumeData.personalInfo.email || ''} | ${resumeData.personalInfo.phone || ''} | ${resumeData.personalInfo.linkedin || ''}`, 10, rgb(0.2, 0.2, 0.2));
      drawText(`${resumeData.personalInfo.location || ''}`, 10, rgb(0.2, 0.2, 0.2));
      y -= sectionSpacing;

      if (resumeData.personalInfo.summary) {
        drawText('Summary', 14, rgb(0, 0, 0), true);
        drawText(resumeData.personalInfo.summary, 10, rgb(0.2, 0.2, 0.2), false);
        y -= sectionSpacing;
      }
    }

    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      drawText('Work Experience', 14, rgb(0, 0, 0), true);
      resumeData.workExperience.forEach((job: WorkExperience) => {
        drawText(`${job.title || ''} at ${job.company || ''} - ${job.location || ''}`, 12, rgb(0, 0, 0), true);
        drawText(`${job.startDate || ''} - ${job.endDate || ''}`, 10, rgb(0.3, 0.3, 0.3));
        if (job.description) {
          // MODIFIED LINES to handle job.description being a string or an array
          const descriptions = Array.isArray(job.description) ? job.description : [job.description];
          if (descriptions.length > 0) {
            descriptions.forEach((desc: string) => {
              drawText(`• ${desc}`, 10, rgb(0.2, 0.2, 0.2));
            });
          }
        }
        y -= sectionSpacing / 2;
      });
      y -= sectionSpacing;
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      drawText('Education', 14, rgb(0, 0, 0), true);
      resumeData.education.forEach((edu: Education) => {
        drawText(`${edu.degree || ''} - ${edu.institution || ''}`, 12, rgb(0, 0, 0), true);
        drawText(`${edu.startDate || ''} - ${edu.endDate || ''}, GPA: ${edu.gpa || 'N/A'}`, 10, rgb(0.3, 0.3, 0.3));
        y -= sectionSpacing / 2;
      });
      y -= sectionSpacing;
    }

    // Skills
    if (resumeData.skills) {
      drawText('Skills', 14, rgb(0, 0, 0), true);
      if (resumeData.skills.technical && resumeData.skills.technical.length > 0) {
        drawText(`Technical: ${resumeData.skills.technical.join(', ')}`, 10, rgb(0.2, 0.2, 0.2));
      }
      if (resumeData.skills.soft && resumeData.skills.soft.length > 0) {
        drawText(`Soft: ${resumeData.skills.soft.join(', ')}`, 10, rgb(0.2, 0.2, 0.2));
      }
      if (resumeData.skills.tools && resumeData.skills.tools.length > 0) {
        drawText(`Tools: ${resumeData.skills.tools.join(', ')}`, 10, rgb(0.2, 0.2, 0.2));
      }
      y -= sectionSpacing;
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      drawText('Projects', 14, rgb(0, 0, 0), true);
      resumeData.projects.forEach((project: Project) => {
        drawText(`${project.name || ''} (${project.technologies?.join(', ') || ''})`, 12, rgb(0, 0, 0), true);
        if (project.description) {
          // MODIFIED LINES to handle project.description being a string or an array
          const projectDescriptions = Array.isArray(project.description) ? project.description : [project.description];
          if (projectDescriptions.length > 0) {
            projectDescriptions.forEach((desc: string) => {
              drawText(`• ${desc}`, 10, rgb(0.2, 0.2, 0.2));
            });
          }
        }
        if (project.link) {
          drawText(`Link: ${project.link}`, 10, rgb(0.05, 0.4, 0.8), false);
        }
        y -= sectionSpacing / 2;
      });
      y -= sectionSpacing;
    }

    // Achievements & Certifications
    if (resumeData.achievementsCertifications && resumeData.achievementsCertifications.length > 0) {
      drawText('Achievements & Certifications', 14, rgb(0, 0, 0), true);
      resumeData.achievementsCertifications.forEach((ach: AchievementCertification) => {
        drawText(`${ach.name || ''} (${ach.issuer || ''}, ${ach.date || ''})`, 12, rgb(0, 0, 0), true);
        if (ach.description) {
          drawText(ach.description, 10, rgb(0.2, 0.2, 0.2));
        }
        y -= sectionSpacing / 2;
      });
      y -= sectionSpacing;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });

  } catch (error: unknown) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: `Failed to generate PDF: ${(error instanceof Error ? error.message : String(error))}` }, { status: 500 });
  }
}