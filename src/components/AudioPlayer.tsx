import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const AudioPlayer: React.FC = () => {
  const { currentAudio } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentAudio) {
      if (audioRef.current) {
        audioRef.current.load();
        setDuration(currentAudio.duration);
        setCurrentTime(0);
        setIsPlaying(false);
      }
    }
  }, [currentAudio]);
  
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      
      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  if (!currentAudio) return null;
  
  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 p-4">
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={currentAudio.url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <div className="flex items-center justify-between">
        <div className="hidden sm:flex items-center w-1/4">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded mr-3"></div>
          <div>
            <div className="text-sm font-medium truncate w-32">{currentAudio.name}</div>
            <div className="text-xs text-gray-500">Uploaded Audio</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow max-w-2xl">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <button className="text-gray-400 hover:text-white">
              <SkipBack size={20} />
            </button>
            <button 
              className="bg-white rounded-full p-2 text-black hover:scale-105 transition-all"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="text-gray-400 hover:text-white">
              <SkipForward size={20} />
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div 
              ref={progressBarRef}
              className="h-1 flex-grow rounded-full bg-gray-700 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-spotify-green rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute w-3 h-3 bg-white rounded-full -right-1.5 -top-1 opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center w-1/4 justify-end">
          <button 
            className="text-gray-400 hover:text-white mr-2"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-spotify-green"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;