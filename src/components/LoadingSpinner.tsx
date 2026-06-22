import React from 'react';

interface SpinnerProps {
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ message = 'Loading catalog...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3 p-8">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium text-sm text-center animate-pulse">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
