import { AudioFile, TranscriptionResult, TranscriptionSegment } from '../types';

// Mock function to simulate transcription
export const mockTranscription = async (audio: AudioFile): Promise<TranscriptionResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock transcription text
  const mockText = `Welcome to our podcast episode ${Math.floor(Math.random() * 100)}. 
Today we're discussing important topics related to technology and its impact on society.
Some people might find this content triggering as we discuss social media addiction and its effects on mental health.
Damn, these statistics are shocking! The average person spends over 3 hours on their phone daily.
We need to be mindful of how technology shapes our interactions and sometimes leads to problematic behaviors.
Some critics have used inappropriate language when describing certain demographic groups, which we strongly condemn.
In summary, while technology offers tremendous benefits, we must approach it with awareness and responsibility.`;

  // Create segments
  const segments: TranscriptionSegment[] = mockText.split('.').map((sentence, index) => ({
    id: `segment-${index}`,
    start: index * 10,
    end: (index + 1) * 10 - 0.5,
    text: sentence.trim() + '.'
  }));

  return {
    text: mockText,
    segments
  };
};