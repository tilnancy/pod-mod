import { TranscriptionResult, ModerationResult, ContentInstance } from '../types';

export const mockModeration = async (transcription: TranscriptionResult): Promise<ModerationResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const text = transcription.text;
  
  // Find sensitive content
  const sensitiveContentPatterns = [
    { pattern: /trigger/i, category: 'psychological' },
    { pattern: /addiction/i, category: 'health' },
    { pattern: /mental health/i, category: 'health' }
  ];
  
  // Find swear words
  const swearWordPatterns = [
    { pattern: /damn/i, category: 'mild' },
    { pattern: /hell/i, category: 'mild' },
    { pattern: /shit/i, category: 'moderate' }
  ];
  
  // Find slurs
  const slurPatterns = [
    { pattern: /inappropriate language/i, category: 'reference to slurs' }
  ];
  
  const findInstances = (patterns: Array<{ pattern: RegExp, category: string }>, text: string): ContentInstance[] => {
    const instances: ContentInstance[] = [];
    
    for (const { pattern, category } of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        instances.push({
          text: match[0],
          position: match.index,
          severity: category === 'mild' ? 'low' : category === 'moderate' ? 'medium' : 'high',
          category
        });
        
        // Avoid infinite loops for global patterns
        if (!pattern.global) break;
      }
    }
    
    return instances;
  };
  
  const sensitiveContentInstances = findInstances(sensitiveContentPatterns, text);
  const swearWordInstances = findInstances(swearWordPatterns, text);
  const slurInstances = findInstances(slurPatterns, text);
  
  // Generate summary
  const summary = "This podcast discusses technology's impact on society, focusing on social media addiction and mental health effects. It presents statistics about screen time and calls for responsible technology use. The content contains mild language and references to sensitive topics.";
  
  // Calculate overall severity
  const hasHighSeverity = [...sensitiveContentInstances, ...swearWordInstances, ...slurInstances]
    .some(instance => instance.severity === 'high');
  
  const hasMediumSeverity = [...sensitiveContentInstances, ...swearWordInstances, ...slurInstances]
    .some(instance => instance.severity === 'medium');
  
  let overallSeverity: 'low' | 'medium' | 'high' = 'low';
  if (hasHighSeverity) overallSeverity = 'high';
  else if (hasMediumSeverity) overallSeverity = 'medium';
  
  return {
    summary,
    sensitiveContent: {
      found: sensitiveContentInstances.length > 0,
      instances: sensitiveContentInstances
    },
    swearWords: {
      count: swearWordInstances.length,
      instances: swearWordInstances
    },
    slurs: {
      count: slurInstances.length,
      instances: slurInstances
    },
    overallSeverity
  };
};