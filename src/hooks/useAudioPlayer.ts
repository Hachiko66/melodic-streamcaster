import { useRef, useState, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleError = useCallback((error: string) => {
    console.error('Audio playback error:', error);
    setIsPlaying(false);
    toast({
      title: "Playback Error",
      description: "Unable to play this station. Please try another station or check your internet connection.",
      variant: "destructive",
    });
  }, []);

  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      audioRef.current.onerror = () => {
        handleError('Audio element encountered an error');
      };
    }
  }, [volume]);

  const handlePlayPause = useCallback(async () => {
    try {
      if (!currentStation) {
        toast({
          title: "No Station Selected",
          description: "Please select a radio station first.",
          variant: "destructive",
        });
        return;
      }

      initializeAudio();

      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        console.log('Playback paused');
      } else {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        console.log('Attempting to play audio');
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Playback started successfully');
      }
    } catch (error) {
      handleError('Error during playback control');
    }
  }, [isPlaying, currentStation, initializeAudio, handleError]);

  const handleVolumeChange = useCallback((newValue: number[]) => {
    const volumeValue = newValue[0];
    setVolume(volumeValue);
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }
  }, []);

  const handleStationSelect = useCallback((station: RadioStation) => {
    console.log('Selecting station:', station.name);
    
    initializeAudio();
    
    if (audioRef.current) {
      // Stop current playback
      audioRef.current.pause();
      setIsPlaying(false);
      
      // Set new station
      audioRef.current.src = station.url;
      setCurrentStation(station);
      
      toast({
        title: "Station Changed",
        description: `Now playing: ${station.name}`,
      });
    }
  }, [initializeAudio]);

  return {
    isPlaying,
    volume,
    currentStation,
    handlePlayPause,
    handleVolumeChange,
    handleStationSelect,
    setCurrentStation,
    audioRef
  };
};