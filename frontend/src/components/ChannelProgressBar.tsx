import React from 'react';
import { ChannelProgress } from '../types';

interface ChannelProgressBarProps {
  progress: ChannelProgress | null;
}

export function ChannelProgressBar({ progress }: ChannelProgressBarProps) {
  if (!progress) return null;

  const percentage = Math.min(100, (progress.currentExp / progress.maxExp) * 100);

  return (
    <div className="channel-progress-container">
      <div className="channel-progress-info">
        <div className="channel-objective">
          <span>{progress.objectiveEmoji}</span>
          <span>{progress.objectiveName}</span>
        </div>
        <div className="channel-level">
          Capitolo {progress.level}
        </div>
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        >
          <div className="progress-glow" />
        </div>
      </div>
    </div>
  );
}
