// src/components/ResumeUpload.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useResume } from '@/context/ResumeContext';
import { processResumeAction } from '@/app/actions';
//import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog'; // <--- Import the new Dialog component

// Dynamically import pdfjs-dist only on the client-side
let pdfjs: typeof import('pdfjs-dist');
type PdfjsTextItem = import('pdfjs-dist/types/src/display/api').TextItem;

let isPdfjsLoaded = false;

export function ResumeUpload() {
  const { setResumeData } = useResume();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // <--- New state for dialog
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    // let resumeText = ''; // No longer explicitly needed here, handled internally
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
          let pdfTextContent = ''; // Local variable for PDF text
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
              // toast.success("Resume processed successfully!"); // Replaced by dialog
              setShowSuccessDialog(true); // <--- Show dialog on success
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
          // toast.success("Resume processed successfully!"); // Replaced by dialog
          setShowSuccessDialog(true); // <--- Show dialog on success
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Your Existing Resume</h2>
      <p className="text-muted-foreground">Upload .pdf or .docx files. We&apos;ll parse it for you!</p>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="resume-upload">Choose File</Label>
        <Input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={isLoading}
          ref={fileInputRef}
        />
      </div>
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          <span>Parsing your resume... Please wait.</span>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success!"
      >
        <p>Your resume has been successfully parsed and loaded.</p>
      </Dialog>
    </div>
  );
}