// src/components/forms/SkillsForm.tsx
'use client';

import React, { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LightningBoltIcon, ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';

const SkillsForm: React.FC = () => {
  const { resume, updateSkills } = useResume();
  const skills = resume.skills;

  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSkills(e.target.value);
  };

  const handleGenerateSuggestions = async () => {
    const textToSuggest = skills || '';

    // --- NEW: Check if text is empty ---
    if (!textToSuggest.trim()) {
      toast.warning("Please enter some skills before asking for AI suggestions.");
      return;
    }
    // --- END NEW ---

    setIsGeneratingSuggestions(true);
    setAiSuggestions([]); // Clear previous suggestions
    toast.info("Generating AI suggestions... This might take a moment.");

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSuggest, type: 'skills' }),
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
    updateSkills(suggestion);
    setAiSuggestions([]); // Close dialog after applying
    toast.success("Suggestion applied!");
  };

  return (
    <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Skills</h3>
      <div className="flex justify-between items-center mb-1">
        <Label htmlFor="skills" className="block text-sm font-medium text-gray-700">Key Skills (comma-separated)</Label>
        <Button
          onClick={handleGenerateSuggestions}
          variant="outline"
          size="sm"
          className="bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 ease-in-out flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm"
          disabled={isGeneratingSuggestions}
        >
          {isGeneratingSuggestions ? (
            <ReloadIcon className="h-4 w-4 animate-spin" />
          ) : (
            <LightningBoltIcon className="h-4 w-4" />
          )}
          <span>{isGeneratingSuggestions ? 'Generating...' : 'Enhance with AI'}</span>
        </Button>
      </div>
      <Textarea
        id="skills"
        name="skills"
        value={skills || ''}
        onChange={handleChange}
        rows={6}
        placeholder="JavaScript, React, Node.js, AWS, SQL, Agile, Data Structures"
        className="min-h-[150px]"
      />

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

export default SkillsForm;