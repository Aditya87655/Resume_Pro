import React from 'react';
import { FileTextIcon, LightningBoltIcon, UploadIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNewResumeClick: () => void;
  onTogglePreview: () => void;
  showPreview: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewResumeClick, onTogglePreview, showPreview }) => {
  return (
    <header className="bg-gray-800 text-white p-6 shadow-lg sticky top-0 z-50 w-full"> {/* ADDED sticky, top-0, z-50, w-full */}
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <LightningBoltIcon className="h-7 w-7 text-indigo-400" />
          <FileTextIcon className="h-7 w-7 text-teal-400" />
          <h1 className="text-3xl font-bold font-space-grotesk tracking-tight">
            Resume_Pro
          </h1>
        </div>
        <nav className="flex items-center space-x-4">
          <Button
            onClick={onTogglePreview}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center space-x-2"
          >
            {showPreview ? (
              <EyeClosedIcon className="h-5 w-5" />
            ) : (
              <EyeOpenIcon className="h-5 w-5" />
            )}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>

          <Button
            onClick={onNewResumeClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center space-x-2"
          >
            <UploadIcon className="h-5 w-5" />
            <span>Upload Resume</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
