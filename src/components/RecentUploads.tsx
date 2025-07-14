import React from 'react';
import { FileAudio, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { AudioFile } from '../types';

const RecentUploads: React.FC = () => {
  const { recentUploads, processAudio } = useAudio();
  
  if (recentUploads.length === 0) {
    return null;
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handleSelectAudio = (audio: AudioFile) => {
    processAudio(audio);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Uploads</h2>
        <Clock className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="space-y-2">
        {recentUploads.map((audio) => (
          <div 
            key={audio.id}
            className="flex items-center p-3 rounded-md hover:bg-gray-700 cursor-pointer transition-colors"
            onClick={() => handleSelectAudio(audio)}
          >
            <div className="h-10 w-10 bg-gray-700 rounded-md flex items-center justify-center mr-3">
              <FileAudio className="h-5 w-5 text-spotify-green" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="text-sm font-medium truncate">{audio.name}</div>
              <div className="text-xs text-gray-500">
                {formatDate(audio.uploadDate)} • {Math.round(audio.duration)}s
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentUploads;