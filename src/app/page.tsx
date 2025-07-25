// src/app/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import PersonalInfoForm from '@/components/forms/PersonalInfoForm';
import WorkExperienceForm from '@/components/forms/WorkExperienceForm';
import EducationForm from '@/components/forms/EducationForm';
import SkillsForm from '@/components/forms/SkillsForm';
import ProjectForm from '@/components/forms/ProjectForm';
import AchievementCertificationForm from '@/components/forms/AchievementCertificationForm';
import { useResume } from '@/context/ResumeContext';
import { toast } from 'sonner';
import ResumePreview from '@/components/ResumePreview';
import { Dialog } from '@/components/ui/dialog';
import { processResumeAction } from '@/app/actions';
import { ReloadIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils'; // <--- Import cn utility for conditional classes

// Dynamically import pdfjs-dist only on the client-side
let pdfjs: typeof import('pdfjs-dist');
type PdfjsTextItem = import('pdfjs-dist/types/src/display/api').TextItem;
let isPdfjsLoaded = false;

export default function Home() {
  const { resume, setResumeData } = useResume();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js on client-side
  useEffect(() => {
    const loadPdfjs = async () => {
      if (typeof window !== 'undefined' && !isPdfjsLoaded) {
        try {
          pdfjs = await import('pdfjs-dist');
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
          isPdfjsLoaded = true;
          console.log("PDF.js loaded client-side.");
        } catch (err) {
          console.error("Failed to load pdfjs-dist on client:", err);
          toast.error("Failed to load PDF processing components.");
        }
      }
    };
    loadPdfjs();
  }, []);

  // Function to handle PDF/DOCX file change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsLoading(true);
    let success = false;
    let error = '';

    try {
      if (file.type === 'application/pdf') {
        if (!isPdfjsLoaded || !pdfjs) {
          error = "PDF processing library not fully loaded. Please try again.";
          toast.error(error);
          setIsLoading(false);
          return;
        }
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
          let pdfTextContent = '';
          try {
            const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
            const numPages = pdf.numPages;
            for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              pdfTextContent += (textContent.items as PdfjsTextItem[]).map((item) => item.str).join(' ') + ' ';
            }
            const result = await processResumeAction(createFormData(null, pdfTextContent));
            success = result.success;
            error = result.error || '';
            if (success && result.data) {
              setResumeData(result.data);
              setShowSuccessDialog(true);
            } else {
              toast.error(error || "Failed to parse PDF content with AI.");
            }
          } catch (pdfParseError) {
            console.error("Failed to read PDF file:", pdfParseError);
            error = `Failed to read PDF file. It might be corrupted or malformed. ${(pdfParseError as Error).message}`;
            toast.error(error);
          } finally {
            setIsLoading(false);
          }
        };
        fileReader.onerror = (e) => {
          error = "Error reading file: " + e.type;
          toast.error(error);
          setIsLoading(false);
        };
        fileReader.readAsArrayBuffer(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await processResumeAction(createFormData(file, null));
        success = result.success;
        error = result.error || '';
        if (success && result.data) {
          setResumeData(result.data);
          setShowSuccessDialog(true);
          setShowPreview(true); // <--- Auto-open preview on successful parse
        } else {
          toast.error(error || "Failed to parse DOCX content with AI.");
        }
        setIsLoading(false);
      } else {
        error = "Unsupported file type. Please upload a .pdf or .docx file.";
        toast.error(error);
        setIsLoading(false);
      }
    } catch (overallError) {
      console.error("Error during file processing:", overallError);
      error = `An unexpected error occurred: ${(overallError as Error).message}`;
      toast.error(error);
      setIsLoading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const createFormData = (file: File | null, textContent: string | null) => {
    const formData = new FormData();
    if (file) {
      formData.append('resumeFile', file);
    }
    if (textContent) {
      formData.append('textContent', textContent);
    }
    return formData;
  };

  // Download PDF function
  const handleDownloadPdf = async () => {
    toast.info("Generating PDF... This might take a moment. Please do not close the tab.");

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeData: resume }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF on server.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Resume downloaded successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to generate PDF: ${(error as Error).message}`);
    }
  };

  // Function to be passed to Header to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Function to toggle preview visibility
  const handleTogglePreview = () => {
    setShowPreview(prev => !prev);
    toast.info(showPreview ? "Hiding preview" : "Showing preview");
  };

  return (
    <div className="min-h-screen animated-gradient-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 technical-pattern-background z-0"></div>
      <div className="relative z-10 w-full">
      <Header
        onNewResumeClick={triggerFileInput}
        onTogglePreview={handleTogglePreview}
        showPreview={showPreview}
      />

      <main className={cn(
        "flex-grow container mx-auto py-10 px-4 md:px-8 gap-10",
        showPreview ? "grid grid-cols-1 md:grid-cols-3" : "flex justify-center" // <--- Dynamic grid for main
      )}>
        {/* Left Column (Main Form) */}
        <section className={cn(
          "bg-white p-8 rounded-lg shadow-xl border border-gray-200",
          showPreview ? "md:col-span-2" : "w-full max-w-4xl" // <--- Dynamic column span for form section
        )}>
          <h2 className="text-3xl font-space-grotesk font-semibold text-gray-800 mb-8 pb-2 border-b-2 border-indigo-600">
            Build/Modify Your Resume
          </h2>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            disabled={isLoading}
          />

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex items-center justify-center space-x-2 text-xl text-indigo-600 py-4">
              <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
              <span>Parsing your Resume... Please wait.</span>
            </div>
          )}

          {/* Your form components */}
          <div id="resume-form-content" className="space-y-8 mt-8">
            <PersonalInfoForm />
            <WorkExperienceForm />
            <EducationForm />
            <SkillsForm />
            <ProjectForm />
            <AchievementCertificationForm />
          </div>

          {/* Download Button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleDownloadPdf}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3.5 px-8 rounded-full text-xl shadow-lg transition duration-300 transform hover:scale-105"
            >
              Download Resume (PDF)
            </button>
          </div>
        </section>

        {/* Right Column (Resume Preview) - Conditionally rendered */}
        {showPreview && (
          <aside className="md:col-span-1 bg-white p-8 rounded-lg shadow-xl border border-gray-200 sticky top-10 h-fit">
            <h2 className="text-3xl font-space-grotesk font-semibold text-gray-800 mb-8 pb-2 border-b-2 border-indigo-600">
              Resume Preview
            </h2>
            {/* Adjust inner div for separate scrolling */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
              <ResumePreview resume={resume} />
            </div>
          </aside>
        )}
      </main>

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success!"
      >
        <p className="text-lg">Your resume has been successfully parsed and loaded.</p>
      </Dialog>
      </div>
    </div>
  );
}