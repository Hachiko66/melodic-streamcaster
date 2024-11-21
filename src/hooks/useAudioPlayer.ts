import { useRef, useState, useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;

    // Debug event listeners
    audio.onloadstart = () => console.log('Audio loading started');
    audio.onabort = () => console.log('Audio playback aborted');
    audio.onstalled = () => console.log('Audio playback stalled');
    audio.onsuspend = () => console.log('Audio loading suspended');
    audio.onwaiting = () => console.log('Audio is waiting for data');
    audio.oncanplay = () => console.log('Audio can start playing');
    audio.oncanplaythrough = () => console.log('Audio can play through');
    audio.onplay = () => console.log('Audio playback started');
    audio.onplaying = () => console.log('Audio is playing');
    audio.onended = () => console.log('Audio playback ended');
    audio.onerror = (e) => {
      console.error('Audio error:', e);
      handleError('Audio playback error');
    };

    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
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
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
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
        setIsPlaying(false);
        console.log('Playback paused');
      } else {
        if (!audioRef.current.src) {
          audioRef.current.src = currentStation.url;
        }
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Playback started');
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
      setIsPlaying(false);

      // Set new station
      audioRef.current.src = station.url;
      setCurrentStation(station);
      
      toast({
        title: "Station Changed",
        description: `Now playing: ${station.name}`,
      });

      // Attempt to play
      await audioRef.current.play();
      setIsPlaying(true);
      console.log('Playback started after station selection');
    } catch (error) {
      console.error('Failed to start playback after station selection:', error);
      handleError('Failed to start playback');
    }
  }, [handleError]);

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