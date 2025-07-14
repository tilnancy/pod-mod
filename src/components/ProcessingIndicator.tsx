import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const ProcessingIndicator: React.FC = () => {
  const { isProcessing, processingStage } = useAudio();
  
  if (!isProcessing) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <Loader2 className="h-12 w-12 animate-spin text-spotify-green mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Processing Your Audio</h3>
        <p className="text-gray-400 mb-4">{processingStage}</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-spotify-green h-2.5 rounded-full animate-pulse w-3/4"></div>
        </div>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;