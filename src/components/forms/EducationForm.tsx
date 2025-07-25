// src/components/forms/EducationForm.tsx
'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const EducationForm: React.FC = () => {
  const { resume, addEducation, updateEducation, removeEducation } = useResume();
  const education = resume.education;

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [name]: value };
    updateEducation(updatedEducation[index].id, { [name]: value });
  };

  return (
    <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
        Education
      </h3>

      {education.length === 0 && (
        <p className="text-gray-500 text-center py-4">No education added yet. Click &apos;Add New Education&apos; to start!</p>
      )}

      <div className="space-y-8">
        {education.map((edu, index) => (
          <div key={edu.id} className="relative p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <Label htmlFor={`degree-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Degree/Field of Study</Label>
                <Input
                  id={`degree-${index}`}
                  name="degree"
                  type="text"
                  value={edu.degree || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor={`institution-${index}`} className="block text-sm font-medium text-gray-700 mb-1">University/Institution</Label>
                <Input
                  id={`institution-${index}`}
                  name="institution"
                  type="text"
                  value={edu.institution || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="University of Example"
                />
              </div>
              <div>
                <Label htmlFor={`graduationDate-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Graduation Date (e.g., May 2023)</Label>
                <Input
                  id={`graduationDate-${index}`}
                  name="graduationDate"
                  type="text"
                  value={edu.graduationDate || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="May 2023"
                />
              </div>
              <div>
                <Label htmlFor={`gpa-${index}`} className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</Label>
                <Input
                  id={`gpa-${index}`}
                  name="gpa"
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="3.8/4.0"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => removeEducation(edu.id)}
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
          onClick={addEducation}
          variant="outline"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white hover:text-white"
        >
          Add New Education
        </Button>
      </div>
    </div>
  );
};

export default EducationForm;