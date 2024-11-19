import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';

interface RadioControlsProps {
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
}

const RadioControls = ({ isPlaying, volume, onPlayPause, onVolumeChange }: RadioControlsProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1">
        <button className="bg-[#C0C0C0] p-1 border-t border-l border-[#FFFFFF] border-b border-r border-[#555555]">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={onPlayPause}
          className="bg-[#C0C0C0] p-1 border-t border-l border-[#FFFFFF] border-b border-r border-[#555555]"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button className="bg-[#C0C0C0] p-1 border-t border-l border-[#FFFFFF] border-b border-r border-[#555555]">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-[#C0C0C0]" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default RadioControls;