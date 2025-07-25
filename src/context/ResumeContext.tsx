// src/context/ResumeContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ResumeData, PersonalInfo, WorkExperience, Education, Project, AchievementCertification } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';

interface ResumeContextType {
  resume: ResumeData;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  updateSkills: (skills: string) => void;
  addProject: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addAchievementCertification: () => void;
  updateAchievementCertification: (id: string, updates: Partial<AchievementCertification>) => void;
  removeAchievementCertification: (id: string) => void;
  setResumeData: (data: ResumeData) => void;
}

// Ensure the default data matches your resume types exactly
const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    summary: '',
  },
  // Initialize with one empty block for each section
  workExperience: [{ id: uuidv4(), title: '', company: '', startDate: '', endDate: '', description: '' }],
  education: [{ id: uuidv4(), degree: '', institution: '', graduationDate: '', gpa: '' }],
  skills: '',
  projects: [{ id: uuidv4(), name: '', description: '', link: '' }],
  achievementsCertifications: [{ id: uuidv4(), name: '', issuer: '', date: '' }],
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resume, setResume] = useState<ResumeData>(defaultResumeData);

  const updatePersonalInfo = (updates: Partial<PersonalInfo>) => {
    setResume(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates },
    }));
  };

  const addWorkExperience = () => {
    setResume(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { id: uuidv4(), title: '', company: '', startDate: '', endDate: '', description: '' },
      ],
    }));
  };

  const updateWorkExperience = (id: string, updates: Partial<WorkExperience>) => {
    setResume(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }));
  };

  const removeWorkExperience = (id: string) => {
    // Only remove if there's more than one item, or if you explicitly want to allow empty sections.
    // As per your request ("one block should be opened & given when user opens the app with remove button"),
    // we should allow removal even if it leads to 0 items, as the default state provides 1 item on load.
    // If you always want at least one, add a condition: `if (prev.workExperience.length > 1)`
    setResume(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: uuidv4(), degree: '', institution: '', graduationDate: '', gpa: '' },
      ],
    }));
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const updateSkills = (skills: string) => {
    setResume(prev => ({
      ...prev,
      skills: skills,
    }));
  };

  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: uuidv4(), name: '', description: '', link: '' },
      ],
    }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    }));
  };

  const removeProject = (id: string) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  };

  const addAchievementCertification = () => {
    setResume(prev => ({
      ...prev,
      achievementsCertifications: [
        ...prev.achievementsCertifications,
        { id: uuidv4(), name: '', issuer: '', date: '' },
      ],
    }));
  };

  const updateAchievementCertification = (id: string, updates: Partial<AchievementCertification>) => {
    setResume(prev => ({
      ...prev,
      achievementsCertifications: prev.achievementsCertifications.map(cert =>
        cert.id === id ? { ...cert, ...updates } : cert
      ),
    }));
  };

  const removeAchievementCertification = (id: string) => {
    setResume(prev => ({
      ...prev,
      achievementsCertifications: prev.achievementsCertifications.filter(cert => cert.id !== id),
    }));
  };

  const setResumeData = (data: ResumeData) => {
    setResume(data);
  };

  return (
    <ResumeContext.Provider
      value={{
        resume,
        updatePersonalInfo,
        addWorkExperience,
        updateWorkExperience,
        removeWorkExperience,
        addEducation,
        updateEducation,
        removeEducation,
        updateSkills,
        addProject,
        updateProject,
        removeProject,
        addAchievementCertification,
        updateAchievementCertification,
        removeAchievementCertification,
        setResumeData,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};