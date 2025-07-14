export interface AudioFile {
  id: string;
  name: string;
  file: File;
  url: string;
  duration: number;
  uploadDate: Date;
  transcription?: TranscriptionResult;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface ContentAnalysis {
  swear_words: string;
  racial_slurs: string;
  sensitive_content: string;
  violence_and_extremism: string;
  sexual_content: string;
  timestamp: string;
}

export interface ModerationResult {
  summary: string;
  sensitiveContent: {
    found: boolean;
    instances: ContentInstance[];
  };
  swearWords: {
    count: number;
    instances: ContentInstance[];
  };
  slurs: {
    count: number;
    instances: ContentInstance[];
  };
  overallSeverity: 'low' | 'medium' | 'high';
}

export interface ContentInstance {
  text: string;
  position: number;
  severity: 'low' | 'medium' | 'high';
  category: string;
}

export type Theme = 'dark' | 'light';