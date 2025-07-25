// src/components/ui/dialog.tsx
import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showOkButton?: boolean; // New prop for showing/hiding OK button
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, showOkButton = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full relative transform transition-all scale-100 opacity-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
        <div className="text-gray-700 mb-6">{children}</div>
        {showOkButton && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-md transition duration-300"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Dialog };