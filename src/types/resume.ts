// src/types/resume.ts

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface WorkExperience {
  id: string; // Unique ID for managing multiple experiences
  title: string;
  company: string;
  startDate: string;
  endDate: string; // "Present" or specific date
  description: string; // Key responsibilities and achievements
}

export interface Education {
  id: string; // Unique ID for managing multiple education entries
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: string; // Optional
}

export interface Project {
  id: string; // Unique ID
  name: string;
  description: string;
  link?: string; // Optional project link
}

export interface AchievementCertification {
  id: string; // Unique ID
  name: string;
  issuer?: string; // Optional
  date?: string; // Optional
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string; // Comma-separated string for now
  projects: Project[];
  achievementsCertifications: AchievementCertification[];
}