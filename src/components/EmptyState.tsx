import React from 'react';
import { FileAudio, ArrowUp } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-8 bg-gray-800 rounded-lg text-center">
      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
        <FileAudio className="w-8 h-8 text-spotify-green" />
      </div>
      <h3 className="text-xl font-bold mb-2">No Audio Selected</h3>
      <p className="text-gray-400 mb-4">
        Upload a podcast to get started with transcription and content moderation
      </p>
      <div className="animate-bounce text-spotify-green mt-4">
        <ArrowUp className="w-6 h-6" />
      </div>
    </div>
  );
};

export default EmptyState;