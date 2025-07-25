// src/components/forms/ProjectsForm.tsx
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

const ProjectsForm: React.FC = () => {
  const { resume, addProject, updateProject, removeProject } = useResume();
  const projects = resume.projects;

  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number | null>(null);

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [name]: value as string };
    updateProject(updatedProjects[index].id, { [name]: value as string });
  };

  const handleGenerateSuggestions = async (index: number) => {
    const description = projects[index].description || '';

    if (!description.trim()) {
      toast.warning("Please enter some text in the project description before asking for AI suggestions.");
      return;
    }

    setIsGeneratingSuggestions(true);
    setAiSuggestions([]); // Clear previous suggestions
    setCurrentProjectIndex(index); // Store the index of the project being edited
    toast.info("Generating AI suggestions for project description... This might take a moment.");

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: description, type: 'projectDescription' }),
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
    if (currentProjectIndex !== null) {
      updateProject(projects[currentProjectIndex].id, { description: suggestion });
      setAiSuggestions([]); // Close dialog after applying
      setCurrentProjectIndex(null);
      toast.success("Suggestion applied!");
    }
  };

  return (
    <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
        Personal Projects
      </h3>

      {projects.length === 0 && ( // Conditional message if no projects are present
        <p className="text-gray-500 text-center py-4">No projects added yet. Click &apos;Add New Project&apos; to start!</p>
      )}

      <div className="space-y-8">
        {projects.map((proj, index) => (
          <div key={proj.id} className="relative p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Removed the absolute positioned MinusCircledIcon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <Label htmlFor={`projectName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Project Name</Label>
                <Input
                  id={`projectName-${index}`}
                  name="name"
                  type="text"
                  value={proj.name || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Portfolio Website"
                />
              </div>
              <div>
                <Label htmlFor={`projectLink-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Project Link (Optional)</Label>
                <Input
                  id={`projectLink-${index}`}
                  name="link"
                  type="url"
                  value={proj.link || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="https://myportfolio.com"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor={`projectDescription-${index}`} className="block text-sm font-medium text-gray-700">Description (use bullet points)</Label>
                <Button
                  onClick={() => handleGenerateSuggestions(index)}
                  variant="outline"
                  size="sm"
                  className="bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 ease-in-out flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm"
                  disabled={isGeneratingSuggestions}
                >
                  {isGeneratingSuggestions && currentProjectIndex === index ? (
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <LightningBoltIcon className="h-4 w-4" />
                  )}
                  <span>{isGeneratingSuggestions && currentProjectIndex === index ? 'Generating...' : 'Enhance with AI'}</span>
                </Button>
              </div>
              <Textarea
                id={`projectDescription-${index}`}
                name="description"
                value={proj.description || ''}
                onChange={(e) => handleChange(index, e)}
                rows={6}
                placeholder="• Designed and developed a responsive portfolio..."
                className="min-h-[150px]"
              />
            </div>
            <div className="mt-6 flex justify-end"> {/* New div for Remove button */}
              <Button
                onClick={() => removeProject(proj.id)}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button
          onClick={addProject}
          variant="outline"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white hover:text-white"
        >
          Add New Project
        </Button>
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

export default ProjectsForm;