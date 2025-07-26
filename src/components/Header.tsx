// src/components/Header.tsx
import React from 'react';
import { FileTextIcon, LightningBoltIcon, EyeOpenIcon, EyeClosedIcon, UploadIcon } from '@radix-ui/react-icons'; // Import UploadIcon
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onUploadResumeClick: () => void; // Added for the upload button
  onTogglePreview: () => void;
  showPreview: boolean;
}

const Header: React.FC<HeaderProps> = ({ onUploadResumeClick, onTogglePreview, showPreview }) => {
  return (
    <header className="bg-gray-800 text-white p-4 md:p-6 shadow-lg"> {/* Adjusted padding for smaller screens */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0"> {/* Flex direction change */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-lg md:text-xl lg:text-3xl"> {/* Adjusted text size for responsiveness */}
          <LightningBoltIcon className="h-5 w-5 md:h-7 md:w-7 text-indigo-400" />
          <FileTextIcon className="h-5 w-5 md:h-7 md:w-7 text-teal-400" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-space-grotesk tracking-tight text-center md:text-left"> {/* Responsive text size */}
            Resume_Pro
          </h1>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end items-center gap-2 sm:gap-4 mt-3 md:mt-0"> {/* Wrap buttons, adjust spacing */}
          {/* "Toggle Preview" Button */}
          <Button
            onClick={onTogglePreview}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-md shadow-md transition duration-300 flex items-center space-x-1 sm:space-x-2 text-sm md:text-base" // Responsive padding and font size
          >
            {showPreview ? (
              <EyeClosedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <EyeOpenIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span> {/* Hide text on very small screens */}
            <span className="sm:hidden">{showPreview ? 'Hide' : 'Show'}</span> {/* Shorter text for very small screens */}
          </Button>

          {/* "New Resume" button */}
          <Button
            onClick={onUploadResumeClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-md shadow-md transition duration-300 flex items-center space-x-1 sm:space-x-2 text-sm md:text-base" // Responsive padding and font size
          >
            <UploadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Upload Resume</span>
            <span className="sm:hidden">Upload</span>
          </Button>

        </nav>
      </div>
    </header>
  );
};

export default Header;