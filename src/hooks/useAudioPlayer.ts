import { useRef, useState, useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = volume;

      // Add event listeners
      audio.addEventListener('playing', () => {
        console.log('Audio started playing');
        setIsPlaying(true);
        setIsLoading(false);
      });

      audio.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
        setIsLoading(false);
        handleError('Audio playback error');
      });

      audio.addEventListener('waiting', () => {
        console.log('Audio is buffering...');
        setIsLoading(true);
      });

      audio.addEventListener('canplay', () => {
        console.log('Audio can play');
        setIsLoading(false);
      });

      audioRef.current = audio;
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleError = useCallback((error: string) => {
    console.error('Audio playback error:', error);
    setIsPlaying(false);
    setIsLoading(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }

    toast({
      title: "Playback Error",
      description: "Unable to play this station. Please try another station or check your internet connection.",
      variant: "destructive",
    });
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!currentStation) {
      toast({
        title: "No Station Selected",
        description: "Please select a radio station first.",
        variant: "destructive",
      });
      return;
    }

    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        if (audioRef.current.src !== currentStation.url) {
          audioRef.current.src = currentStation.url;
          audioRef.current.load();
        }
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Playback control error:', error);
      handleError('Failed to control playback');
    }
  }, [isPlaying, currentStation, handleError]);

  const handleVolumeChange = useCallback((newValue: number[]) => {
    const volumeValue = newValue[0];
    setVolume(volumeValue);
  }, []);

  const handleStationSelect = useCallback(async (station: RadioStation) => {
    console.log('Selecting station:', station.name);
    
    if (!audioRef.current) return;

    try {
      // Stop current playback
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      setIsPlaying(false);
      setIsLoading(true);

      // Set new station
      setCurrentStation(station);
      audioRef.current.src = station.url;
      audioRef.current.load();
      
      toast({
        title: "Station Changed",
        description: `Loading: ${station.name}`,
      });

      // Attempt to play
      await audioRef.current.play();
    } catch (error) {
      console.error('Failed to start playback after station selection:', error);
      handleError('Failed to start playback');
    }
  }, [handleError]);

  return {
    isPlaying,
    isLoading,
    volume,
    currentStation,
    handlePlayPause,
    handleVolumeChange,
    handleStationSelect,
    setCurrentStation,
    audioRef
  };
};