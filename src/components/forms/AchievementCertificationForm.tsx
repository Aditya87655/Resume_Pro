// src/components/forms/AchievementsCertificationsForm.tsx
'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
//import { toast } from 'sonner'; // Assuming you use toast

const AchievementsCertificationsForm: React.FC = () => {
  const { resume, addAchievementCertification, updateAchievementCertification, removeAchievementCertification } = useResume();
  const achievementsCertifications = resume.achievementsCertifications;

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedCertifications = [...achievementsCertifications];
    updatedCertifications[index] = { ...updatedCertifications[index], [name]: value };
    updateAchievementCertification(updatedCertifications[index].id, { [name]: value });
  };

  return (
    <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
        Awards & Certifications
      </h3>

      {achievementsCertifications.length === 0 && ( // Conditional message if no certifications are present
        <p className="text-gray-500 text-center py-4">No awards or certifications added yet. Click &apos;Add New Award/Certification&apos; to start!</p>
      )}

      <div className="space-y-8">
        {achievementsCertifications.map((cert, index) => (
          <div key={cert.id} className="relative p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <Label htmlFor={`certName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Name</Label>
                <Input
                  id={`certName-${index}`}
                  name="name"
                  type="text"
                  value={cert.name || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Google Cloud Certified"
                />
              </div>
              <div>
                <Label htmlFor={`certIssuer-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Issuer (Optional)</Label>
                <Input
                  id={`certIssuer-${index}`}
                  name="issuer"
                  type="text"
                  value={cert.issuer || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Google"
                />
              </div>
              <div>
                <Label htmlFor={`certDate-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Date (Optional)</Label>
                <Input
                  id={`certDate-${index}`}
                  name="date"
                  type="text"
                  value={cert.date || ''}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Dec 2023"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => removeAchievementCertification(cert.id)}
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
          onClick={addAchievementCertification}
          variant="outline"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white hover:text-white"
        >
          Add New Award/Certification
        </Button>
      </div>
    </div>
  );
};

export default AchievementsCertificationsForm;