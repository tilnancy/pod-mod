import React from 'react';
import { AlertCircle, Shield, AlertTriangle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useHistory } from '../hooks/useHistory';

const ContentAnalysis: React.FC = () => {
  const { currentAudio, transcription, contentAnalysis } = useAudio();
  const { updateHistoryItem } = useHistory();

  React.useEffect(() => {
    if (currentAudio?.id && contentAnalysis) {
      updateHistoryItem(currentAudio.id, {
        analysis: contentAnalysis,
        status: 'analyzed'
      });
    }
  }, [contentAnalysis, currentAudio?.id, updateHistoryItem]);

  if (!currentAudio || !transcription) {
    return null;
  }

  if (!contentAnalysis) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Content Analysis</h3>
            <p className="text-gray-400">
              Click the "Analyze Content" button to start content analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { 
      title: 'Swear Words',
      key: 'swear_words',
      icon: AlertCircle,
      severity: 'warning'
    },
    { 
      title: 'Racial Slurs',
      key: 'racial_slurs',
      icon: AlertTriangle,
      severity: 'high'
    },
    { 
      title: 'Sensitive Content',
      key: 'sensitive_content',
      icon: AlertCircle,
      severity: 'medium'
    },
    { 
      title: 'Violence and Extremism',
      key: 'violence_and_extremism',
      icon: AlertTriangle,
      severity: 'high'
    },
    { 
      title: 'Sexual Content',
      key: 'sexual_content',
      icon: AlertCircle,
      severity: 'warning'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/50';
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/50';
      default:
        return 'bg-gray-700';
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'warning':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Shield className="w-6 h-6 mr-2" />
        Content Analysis
      </h2>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const content = contentAnalysis[section.key];
          const hasContent = content && content !== 'None detected';
          
          return (
            <div 
              key={section.key} 
              className={`rounded-lg p-4 border ${
                hasContent 
                  ? getSeverityColor(section.severity)
                  : 'bg-gray-700'
              }`}
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Icon className={`w-5 h-5 mr-2 ${
                  hasContent 
                    ? getIconColor(section.severity)
                    : 'text-gray-400'
                }`} />
                {section.title}
              </h3>
              <p className="text-gray-300 whitespace-pre-line">
                {content || 'None detected'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Last updated: {new Date(contentAnalysis.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

export default ContentAnalysis;