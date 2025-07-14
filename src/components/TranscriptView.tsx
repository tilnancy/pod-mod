import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { TranscriptionSegment } from '../types';
import { FileText, Shield, Loader2 } from 'lucide-react';

const TranscriptView: React.FC = () => {
  const { currentAudio, transcription, processAudio } = useAudio();
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  if (!currentAudio) {
    return null;
  }
  
  if (!transcription) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Transcript Available</h3>
          <p className="text-gray-400 text-center">
            Click the Extract button above to generate the transcript for this audio file.
          </p>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await processAudio(currentAudio);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSegmentClick = (segment: TranscriptionSegment) => {
    setActiveSegment(segment.id);
    // In a real app, this would seek the audio player to this timestamp
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transcript</h2>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`
            px-4 py-2 rounded-lg
            bg-spotify-green hover:bg-spotify-green/90
            text-black font-medium
            transition-colors duration-200
            flex items-center
            ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Analyze Content
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-4">
        {transcription.segments.map((segment) => (
          <div 
            key={segment.id}
            className={`p-3 rounded-md transition-all cursor-pointer ${
              activeSegment === segment.id 
                ? 'bg-spotify-green/20 border-l-4 border-spotify-green' 
                : 'hover:bg-gray-700'
            }`}
            onClick={() => handleSegmentClick(segment)}
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">
                {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
              </span>
            </div>
            <p>{segment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default TranscriptView;