import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { ContentInstance } from '../types';

const ModeratedContent: React.FC = () => {
  const { moderation } = useAudio();
  const [activeTab, setActiveTab] = useState<'summary' | 'sensitive' | 'swear' | 'slurs'>('summary');
  
  if (!moderation) {
    return null;
  }
  
  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return '';
    }
  };
  
  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-500" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };
  
  const renderContentInstances = (instances: ContentInstance[]) => {
    if (instances.length === 0) {
      return (
        <div className="p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-gray-400">No instances detected</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {instances.map((instance, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${getSeverityColor(instance.severity)}`}>
                {instance.category}
              </span>
              {getSeverityIcon(instance.severity)}
            </div>
            <p className="text-sm">"{instance.text}"</p>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <h2 className="text-xl font-bold">Content Analysis</h2>
        <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(moderation.overallSeverity)}`}>
          {moderation.overallSeverity.toUpperCase()}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'summary' ? 'border-b-2 border-spotify-green text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'sensitive' ? 'border-b-2 border-spotify-green text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('sensitive')}
          >
            Sensitive Content
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'swear' ? 'border-b-2 border-spotify-green text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('swear')}
          >
            Swear Words
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'slurs' ? 'border-b-2 border-spotify-green text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('slurs')}
          >
            Slurs
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {activeTab === 'summary' && (
          <div className="p-4 bg-gray-700 rounded-md">
            <p>{moderation.summary}</p>
          </div>
        )}
        
        {activeTab === 'sensitive' && renderContentInstances(moderation.sensitiveContent.instances)}
        
        {activeTab === 'swear' && (
          <>
            <div className="mb-4">
              <p className="text-gray-400">
                Found <span className="font-bold text-white">{moderation.swearWords.count}</span> instances of swear words
              </p>
            </div>
            {renderContentInstances(moderation.swearWords.instances)}
          </>
        )}
        
        {activeTab === 'slurs' && (
          <>
            <div className="mb-4">
              <p className="text-gray-400">
                Found <span className="font-bold text-white">{moderation.slurs.count}</span> instances of slurs or offensive language
              </p>
            </div>
            {renderContentInstances(moderation.slurs.instances)}
          </>
        )}
      </div>
    </div>
  );
};

export default ModeratedContent;