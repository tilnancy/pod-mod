import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, Loader2, X, Play, Pause } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useHistory } from '../hooks/useHistory';
import { AudioFile } from '../types';

const FileUpload: React.FC = () => {
  const { addUpload, setCurrentAudio, currentAudio } = useAudio();
  const { addHistoryItem } = useHistory();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      if (file.type.includes('audio')) {
        setIsUploading(true);
        setUploadProgress(0);
        
        const reader = new FileReader();
        let progress = 0;
        const increment = 100 / (file.size / (1024 * 1024));
        
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        };
        
        reader.onload = async () => {
          const url = URL.createObjectURL(file);
          
          const audio = new Audio(url);
          audio.onloadedmetadata = async () => {
            const newAudio: AudioFile = {
              id: `file-${Date.now()}`,
              name: file.name,
              file,
              url,
              duration: audio.duration,
              uploadDate: new Date()
            };
            
            addUpload(newAudio);
            setCurrentAudio(newAudio);
            
            // Add to history
            await addHistoryItem({
              file_name: file.name,
              duration: audio.duration,
              status: 'uploaded'
            });
            
            setIsUploading(false);
            setShowModal(true);
            setTimeout(() => setShowModal(false), 3000);
          };
        };
        
        reader.readAsArrayBuffer(file);
      }
    });
  }, [addUpload, setCurrentAudio, addHistoryItem]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    }
  });

  const handleExtract = async () => {
    if (!currentAudio?.file) return;
    
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('audio', currentAudio.file);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-transcript`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to extract transcript: ${response.status} ${response.statusText}`);
      }

      const transcription = await response.json();
      setCurrentAudio({
        ...currentAudio,
        transcription,
      });

      // Update history status
      const historyItem = await addHistoryItem({
        file_name: currentAudio.name,
        duration: currentAudio.duration,
        transcript: transcription.text,
        status: 'transcribed'
      });

    } catch (error) {
      console.error('Error extracting transcript:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`
          w-full p-8 rounded-lg border-2 border-dashed
          transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center gap-4
          ${isDragActive ? 'border-spotify-green bg-spotify-green/10' : 'border-gray-600 hover:border-spotify-green/60 hover:bg-spotify-green/5'}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-spotify-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-spotify-green/10 flex items-center justify-center">
              {isDragActive ? (
                <FileAudio className="w-8 h-8 text-spotify-green" />
              ) : (
                <Upload className="w-8 h-8 text-spotify-green" />
              )}
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                {isDragActive ? 'Drop your podcast here' : 'Upload your podcast'}
              </h3>
              <p className="text-gray-400">
                {isDragActive 
                  ? 'We\'ll process it right away' 
                  : 'Drag and drop or click to select an audio file'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports MP3, WAV and M4A files
              </p>
            </div>
          </>
        )}
      </div>

      {currentAudio && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-grow">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center mr-4 hover:bg-spotify-green/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black" />
                )}
              </button>
              <div>
                <div className="font-medium">{currentAudio.name}</div>
                <div className="text-sm text-gray-400">
                  {Math.round(currentAudio.duration)} seconds
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className={`
                px-4 py-2 rounded-lg
                bg-spotify-green hover:bg-spotify-green/90
                text-black font-medium
                transition-colors duration-200
                flex items-center
                ${isExtracting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Extracting...
                </>
              ) : (
                'Extract Transcript'
              )}
            </button>
          </div>
          
          <audio
            ref={audioRef}
            src={currentAudio.url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-spotify-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileAudio className="w-8 h-8 text-spotify-green" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Complete!</h3>
              <p className="text-gray-400">
                Your podcast has been uploaded successfully. Click the Extract button to generate the transcript.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;