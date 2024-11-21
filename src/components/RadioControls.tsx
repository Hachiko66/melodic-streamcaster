import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface RadioControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
}

const RadioControls = ({
  isPlaying,
  isLoading = false,
  volume,
  onPlayPause,
  onVolumeChange
}: RadioControlsProps) => {
  return (
    <div className="flex items-center gap-4 text-[#C0C0C0]">
      <button
        onClick={onPlayPause}
        disabled={isLoading}
        className={`p-2 hover:text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <div className="animate-spin h-6 w-6 border-2 border-[#C0C0C0] border-t-transparent rounded-full" />
        ) : isPlaying ? (
          <Pause size={24} />
        ) : (
          <Play size={24} />
        )}
      </button>
      <div className="flex items-center gap-2 flex-1">
        <Volume2 size={20} />
        <Slider
          value={[volume]}
          onValueChange={onVolumeChange}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default RadioControls;