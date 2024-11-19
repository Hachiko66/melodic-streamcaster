import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import AudioVisualizer from '@/components/AudioVisualizer';
import RadioControls from '@/components/RadioControls';
import StationList, { RadioStation } from '@/components/StationList';

const STATIONS: RadioStation[] = [
  {
    id: '1',
    name: 'Smooth Jazz',
    url: 'https://streaming.radio.co/s774887f7b/listen',
    genre: 'Jazz'
  },
  {
    id: '2',
    name: 'Classical Radio',
    url: 'https://live.musopen.org:8085/streamvbr0',
    genre: 'Classical'
  },
  {
    id: '3',
    name: 'Electronic Beats',
    url: 'https://streams.ilovemusic.de/iloveradio2.mp3',
    genre: 'Electronic'
  },
];

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(STATIONS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && currentStation) {
      audioRef.current.src = currentStation.url;
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          toast({
            title: "Playback Error",
            description: "There was an error playing this station. Please try again.",
            variant: "destructive",
          });
          setIsPlaying(false);
        });
      }
    }
  }, [currentStation]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback Error",
          description: "There was an error playing this station. Please try again.",
          variant: "destructive",
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newValue: number[]) => {
    const volumeValue = newValue[0];
    setVolume(volumeValue);
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }
  };

  const handleStationSelect = (station: RadioStation) => {
    setCurrentStation(station);
    toast({
      title: "Station Changed",
      description: `Now playing: ${station.name}`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-radio-purple to-radio-teal animate-gradient-flow bg-[length:400%_400%]">
      <div className="container max-w-4xl mx-auto p-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Live Radio</h1>
            {currentStation && (
              <p className="text-xl text-white/80">{currentStation.name}</p>
            )}
          </div>

          <AudioVisualizer audioElement={audioRef.current} />

          <div className="flex flex-col items-center gap-8">
            <RadioControls
              isPlaying={isPlaying}
              volume={volume}
              onPlayPause={handlePlayPause}
              onVolumeChange={handleVolumeChange}
            />

            <StationList
              stations={STATIONS}
              currentStation={currentStation}
              onStationSelect={handleStationSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;