import { useRef, useState, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

      // Add event listeners for debugging
      audioRef.current.onabort = () => console.log('Audio playback aborted');
      audioRef.current.onstalled = () => console.log('Audio playback stalled');
      audioRef.current.onsuspend = () => console.log('Audio loading suspended');
      audioRef.current.onwaiting = () => console.log('Audio is waiting for data');
      audioRef.current.oncanplay = () => console.log('Audio can start playing');
      audioRef.current.oncanplaythrough = () => console.log('Audio can play through');
      audioRef.current.onplay = () => console.log('Audio playback started');
      audioRef.current.onplaying = () => console.log('Audio is playing');
    }

    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, handleError]);

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
        try {
          console.log('Attempting to play audio:', currentStation.url);
          await audioRef.current.play();
          setIsPlaying(true);
          console.log('Playback started successfully');
        } catch (error) {
          console.error('Play failed:', error);
          handleError('Failed to start playback');
        }
      }
    } catch (error) {
      console.error('Playback control error:', error);
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

  const handleStationSelect = useCallback(async (station: RadioStation) => {
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

      try {
        // Attempt to play immediately
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Playback started after station selection');
      } catch (error) {
        console.error('Failed to start playback after station selection:', error);
        handleError('Failed to start playback');
      }
    }
  }, [initializeAudio, handleError]);

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