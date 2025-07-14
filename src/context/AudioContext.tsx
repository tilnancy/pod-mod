import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AudioFile, TranscriptionResult, ModerationResult, ContentAnalysis } from '../types';

interface AudioContextType {
  currentAudio: AudioFile | null;
  transcription: TranscriptionResult | null;
  moderation: ModerationResult | null;
  contentAnalysis: ContentAnalysis | null;
  recentUploads: AudioFile[];
  isProcessing: boolean;
  processingStage: string;
  setCurrentAudio: (audio: AudioFile | null) => void;
  addUpload: (audio: AudioFile) => void;
  processAudio: (audio: AudioFile) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [recentUploads, setRecentUploads] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  const addUpload = (audio: AudioFile) => {
    setRecentUploads(prev => [audio, ...prev.slice(0, 9)]);
  };

  const processAudio = async (audio: AudioFile) => {
    console.log('Processing audio:', audio);
    setCurrentAudio(audio);
    setContentAnalysis(null);
    
    if (audio.transcription) {
      console.log('Setting transcription from audio:', audio.transcription);
      setTranscription(audio.transcription);
      
      // Analyze content after transcription is set
      try {
        console.log('Starting content analysis');
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: audio.transcription.text }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
        }

        const analysis = await response.json();
        console.log('Content analysis completed:', analysis);
        setContentAnalysis(analysis);
      } catch (error) {
        console.error('Error during content analysis:', error);
      }
    } else {
      console.log('No transcription available for audio');
      setTranscription(null);
    }
    
    setModeration(null);
  };

  const handleSetCurrentAudio = (audio: AudioFile | null) => {
    console.log('Setting current audio:', audio);
    setCurrentAudio(audio);
    setContentAnalysis(null);
    
    if (audio?.transcription) {
      console.log('Setting transcription for new audio:', audio.transcription);
      setTranscription(audio.transcription);
    } else {
      console.log('Clearing transcription as no audio or transcription available');
      setTranscription(null);
    }
    
    setModeration(null);
  };

  return (
    <AudioContext.Provider 
      value={{ 
        currentAudio, 
        transcription, 
        moderation,
        contentAnalysis,
        recentUploads,
        isProcessing,
        processingStage,
        setCurrentAudio: handleSetCurrentAudio, 
        addUpload,
        processAudio
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};