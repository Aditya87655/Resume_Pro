// src/components/forms/PersonalInfoForm.tsx
'use client';

import React, { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LightningBoltIcon, ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';

const PersonalInfoForm: React.FC = () => {
  const { resume, updatePersonalInfo } = useResume();
  const personalInfo = resume.personalInfo;

  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [currentSuggestionField, setCurrentSuggestionField] = useState<'summary' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value as string });
  };

  const handleGenerateSuggestions = async (fieldType: 'summary') => {
    const textToSuggest = personalInfo[fieldType] || '';

    // --- NEW: Check if text is empty ---
    if (!textToSuggest.trim()) {
      toast.warning(`Please enter some text in the ${fieldType} field before asking for AI suggestions.`);
      return;
    }
    // --- END NEW ---

    setIsGeneratingSuggestions(true);
    setAiSuggestions([]); // Clear previous suggestions
    setCurrentSuggestionField(fieldType); // Store which field is being edited
    toast.info("Generating AI suggestions... This might take a moment.");


    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSuggest, type: `personalInfo${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}` }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI suggestions from server.');
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
      } else {
        setAiSuggestions(["No specific suggestions at this time. Try rephrasing your input for better results."]);
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast.error(`Failed to get AI suggestions: ${(error as Error).message}`);
      setAiSuggestions(["Failed to load suggestions. Please try again."]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (currentSuggestionField === 'summary') {
      updatePersonalInfo({ summary: suggestion });
      setAiSuggestions([]); // Close dialog after applying
      setCurrentSuggestionField(null);
      toast.success("Suggestion applied!");
    }
  };


  return (
    <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            value={personalInfo.fullName || ''}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={personalInfo.email || ''}
            onChange={handleChange}
            placeholder="john.doe@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={personalInfo.phone || ''}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            value={personalInfo.linkedin || ''}
            onChange={handleChange}
            placeholder="linkedin.com/in/johndoe"
          />
        </div>
        <div>
          <Label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</Label>
          <Input
            id="github"
            name="github"
            type="url"
            value={personalInfo.github || ''}
            onChange={handleChange}
            placeholder="github.com/johndoe"
          />
        </div>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</Label>
          <Button
            onClick={() => handleGenerateSuggestions('summary')}
            variant="outline"
            size="sm"
            className="bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 ease-in-out flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm"
            disabled={isGeneratingSuggestions}
          >
            {isGeneratingSuggestions && currentSuggestionField === 'summary' ? (
              <ReloadIcon className="h-4 w-4 animate-spin" />
            ) : (
              <LightningBoltIcon className="h-4 w-4" />
            )}
            <span>{isGeneratingSuggestions && currentSuggestionField === 'summary' ? 'Generating...' : 'Enhance with AI'}</span>
          </Button>
        </div>
        <Textarea
          id="summary"
          name="summary"
          value={personalInfo.summary || ''}
          onChange={handleChange}
          rows={6}
          placeholder="A passionate software engineer with 5 years of experience..."
          className="min-h-[150px]"
        />
      </div>

      {/* AI Suggestions Dialog */}
      <Dialog
        isOpen={aiSuggestions.length > 0}
        onClose={() => setAiSuggestions([])}
        title="AI Suggestions"
        showOkButton={false}
      >
        <p className="text-gray-600 mb-4">Choose a suggestion below or close to dismiss:</p>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {aiSuggestions.map((suggestion, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col">
              <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3 flex-grow">{suggestion}</p>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleApplySuggestion(suggestion)}
                  variant="outline"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Apply This
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={() => setAiSuggestions([])} className="bg-gray-300 hover:bg-gray-400 text-gray-800">
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default PersonalInfoForm;