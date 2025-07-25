// src/components/ResumePreview.tsx
import React from 'react';
import { ResumeData, WorkExperience, Education, Project, AchievementCertification } from '@/types/resume';

interface ResumePreviewProps {
  resume: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  const { personalInfo, workExperience, education, skills, projects, achievementsCertifications } = resume;

  return (
    <div className="font-sans p-6 bg-white max-w-2xl mx-auto border border-gray-300 rounded-lg shadow-sm min-h-[400px]">
      {/* Personal Info */}
      <section className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-1 leading-tight">{personalInfo?.fullName || 'Your Full Name'}</h1>
        <p className="text-base text-gray-700 mb-2">{personalInfo?.summary || 'Aspiring Software Engineer'}</p> {/* Summary often goes under name */}
        <p className="text-sm text-gray-600 space-x-4">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.linkedin && (
            <span><a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{personalInfo.linkedin.replace(/(https?:\/\/)?(www\.)?linkedin\.com\/in\//, 'LinkedIn: ')}</a></span>
          )}
          {personalInfo?.github && (
            <span><a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{personalInfo.github.replace(/(https?:\/\/)?(www\.)?github\.com\//, 'GitHub: ')}</a></span>
          )}
        </p>
      </section>

      {/* Separator Line */}
      <hr className="border-t border-gray-300 mb-6" />

      {/* Work Experience */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-1 mb-4">EXPERIENCE</h2>
          {workExperience.map((exp: WorkExperience) => (
            <div key={exp.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{exp.title || 'Job Title'} at {exp.company || 'Company Name'}</h3>
                <p className="text-sm text-gray-600">{exp.startDate || 'Start Date'} - {exp.endDate || 'End Date'}</p>
              </div>
              {exp.description && (
                <ul className="list-disc pl-5 text-sm text-gray-700 leading-relaxed">
                  {exp.description.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                    <li key={index}>{line.trim()}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-1 mb-4">EDUCATION</h2>
          {education.map((edu: Education) => (
            <div key={edu.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{edu.degree || 'Degree'}</h3>
                <p className="text-sm text-gray-600">{edu.graduationDate || 'Graduation Date'}</p>
              </div>
              <p className="text-base text-gray-700">{edu.institution || 'Institution Name'}{edu.gpa && ` (GPA: ${edu.gpa})`}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills && skills.trim() !== '' && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-1 mb-4">SKILLS</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{skills}</p>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-1 mb-4">PROJECTS</h2>
          {projects.map((proj: Project) => (
            <div key={proj.id} className="mb-4 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900">{proj.name || 'Project Name'}</h3>
              {proj.link && (
                <p className="text-sm text-blue-700 hover:underline mb-1">
                  <a href={proj.link} target="_blank" rel="noopener noreferrer">{proj.link}</a>
                </p>
              )}
              {proj.description && (
                <ul className="list-disc pl-5 text-sm text-gray-700 leading-relaxed">
                  {proj.description.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                    <li key={index}>{line.trim()}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Achievements & Certifications */}
      {achievementsCertifications && achievementsCertifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-1 mb-4">AWARDS & CERTIFICATIONS</h2>
          {achievementsCertifications.map((ac: AchievementCertification) => (
            <div key={ac.id} className="mb-4 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900">{ac.name || 'Achievement/Certification'}</h3>
              {(ac.issuer || ac.date) && (
                <p className="text-sm text-gray-600">
                  {ac.issuer && `Issuer: ${ac.issuer}`}
                  {ac.issuer && ac.date && ` | `}
                  {ac.date && `Date: ${ac.date}`}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Fallback for empty resume data */}
      {!personalInfo?.fullName && (!workExperience || workExperience.length === 0) &&
       (!education || education.length === 0) && (!skills || skills.trim() === '') &&
       (!projects || projects.length === 0) && (!achievementsCertifications || achievementsCertifications.length === 0) && (
        <div className="text-center text-gray-500 py-20">
          <p>Upload a resume or start filling out the forms to see your preview here!</p>
          <p className="mt-2 text-sm">Resume data will appear as you input it or after AI processing.</p>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;