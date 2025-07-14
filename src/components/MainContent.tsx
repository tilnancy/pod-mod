import React from 'react';
import FileUpload from './FileUpload';
import EmptyState from './EmptyState';
import TranscriptView from './TranscriptView';
import ContentAnalysis from './ContentAnalysis';
import { useAudio } from '../context/AudioContext';

const MainContent: React.FC<{ activeSection: string }> = ({ activeSection }) => {
  const { currentAudio } = useAudio();
  
  if (activeSection === 'history') {
    return null; // History is now handled in Sidebar
  }
  
  return (
    <div className="flex-grow p-6 overflow-y-auto">
      <div className="mb-6">
        <FileUpload />
      </div>
      
      {!currentAudio && <EmptyState />}
      
      {currentAudio && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TranscriptView />
          <ContentAnalysis />
        </div>
      )}
    </div>
  );
};

export default MainContent;