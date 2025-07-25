'use client';

import React, { useRef, useEffect } from 'react'; // Import useEffect for initial logging
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeData } from '@/types/resume';

interface PdfGeneratorProps {
  resumeData: ResumeData;
}

const PdfGenerator: React.FC<PdfGeneratorProps> = ({ resumeData }) => {
  const resumePrintRef = useRef<HTMLDivElement>(null);

  // Add an effect to log resumeData when the component mounts or resumeData changes
  useEffect(() => {
    console.log("PdfGenerator mounted/resumeData changed. Resume Data:", resumeData);
    // You can add more detailed checks here, e.g., if (!resumeData || !resumeData.personalInfo.fullName) console.warn("ResumeData seems empty!");
  }, [resumeData]);

  const generatePdf = async () => {
    console.log("Download button clicked! Initiating PDF generation...");

    if (!resumePrintRef.current) {
      console.error("Error: resumePrintRef is null. The target element for PDF conversion might not be rendered.");
      alert("Could not prepare resume for PDF. Please ensure the resume preview is visible."); // Alert user for immediate feedback
      return;
    }

    const element = resumePrintRef.current;
    console.log("Target element for html2canvas:", element);

    try {
      // Use html2canvas to capture the HTML element as a canvas image
      const canvas = await html2canvas(element, { scale: 2 }); // Scale option improves the quality/resolution
      console.log("html2canvas: Canvas generated:", canvas);
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn("html2canvas: Generated canvas is empty (width or height is 0). This might lead to an empty PDF.");
      }

      const imgData = canvas.toDataURL('image/png'); // Get image data as PNG
      console.log("html2canvas: Image data length:", imgData.length); // Check if data is present

      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      // Add the captured image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      console.log("jsPDF: Image added to PDF.");

      // Save the PDF
      const filename = `${resumeData.personalInfo.fullName || 'resume'}.pdf`;
      pdf.save(filename);
      console.log(`jsPDF: PDF saved as ${filename}`);

    } catch (error) {
      console.error("Error during PDF generation:", error);
      alert(`Failed to generate PDF: ${(error as Error).message}. Please try again.`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={generatePdf}
        className="btn btn-primary mt-4 mb-4"
      >
        Download Resume as PDF
      </button>

      {/* This is the actual resume layout that html2canvas will convert to an image.
          Ensure this div is rendered and contains content.
          If you intend for this to be hidden, use 'opacity-0' and 'absolute' instead of 'hidden'.
          For debugging, temporarily remove any 'hidden' or 'absolute' styling to ensure it's visible.
      */}
      <div
        ref={resumePrintRef}
        className="p-8 bg-white text-gray-800 shadow-lg"
        style={{ width: '8.5in', minHeight: '11in', margin: 'auto', boxSizing: 'border-box' }}
      >
        {/* Your Resume Layout goes here. This should mirror the structure of your ResumeData.
            Make sure the resumeData content is actually being rendered within this div. */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold">{resumeData.personalInfo.fullName || 'Full Name'}</h1>
          <p className="text-sm">
            {resumeData.personalInfo.email || 'Email'} | {resumeData.personalInfo.phone || 'Phone'} |{' '}
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <> | <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                GitHub
              </a></>
            )}
          </p>
          <p className="mt-2 text-md leading-relaxed">{resumeData.personalInfo.summary || 'Summary'}</p>
        </header>

        <section className="mb-6">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Skills</h2>
          <p className="text-sm">{resumeData.skills || 'No skills provided.'}</p>
        </section>

        {resumeData.workExperience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Work Experience</h2>
            {resumeData.workExperience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <h3 className="text-lg font-semibold">{exp.title || 'Job Title'}</h3>
                <p className="text-md font-medium">{exp.company || 'Company'}</p>
                <p className="text-sm text-gray-600">{exp.startDate || 'Start Date'} - {exp.endDate || 'End Date'}</p>
                <p className="text-sm mt-1 whitespace-pre-line">{exp.description || 'Description'}</p>
              </div>
            ))}
          </section>
        )}

        {/* ... (Continue with Education, Projects, Achievements sections similarly) ... */}
        {resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Education</h2>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <h3 className="text-lg font-semibold">{edu.degree || 'Degree'}</h3>
                <p className="text-md font-medium">{edu.institution || 'Institution'}</p>
                <p className="text-sm text-gray-600">{edu.graduationDate || 'Graduation Date'}{edu.gpa && ` (GPA: ${edu.gpa})`}</p>
              </div>
            ))}
          </section>
        )}

        {resumeData.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Projects</h2>
            {resumeData.projects.map((proj) => (
              <div key={proj.id} className="mb-4">
                <h3 className="text-lg font-semibold">{proj.name || 'Project Name'}</h3>
                {proj.link && (
                  <p className="text-sm text-blue-600 hover:underline mb-1">
                    <a href={proj.link} target="_blank" rel="noopener noreferrer">{proj.link}</a>
                  </p>
                )}
                <p className="text-sm whitespace-pre-line">{proj.description || 'Project Description'}</p>
              </div>
            ))}
          </section>
        )}

        {resumeData.achievementsCertifications.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Achievements & Certifications</h2>
            {resumeData.achievementsCertifications.map((item) => (
              <div key={item.id} className="mb-4">
                <h3 className="text-lg font-semibold">{item.name || 'Achievement/Certification'}</h3>
                <p className="text-md font-medium">{item.issuer || 'Issuer'}{item.date && ` (${item.date})`}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default PdfGenerator;