import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from 'lucide-react';

interface RadioControlsProps {
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
}

const RadioControls = ({ isPlaying, volume, onPlayPause, onVolumeChange }: RadioControlsProps) => {
  return (
    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-lg rounded-lg p-4">
      <button
        onClick={onPlayPause}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </button>

      <div className="flex items-center gap-2 w-32">
        <Volume2 className="w-5 h-5 text-white/80" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="w-24"
        />
      </div>
    </div>
  );
};

export default RadioControls;