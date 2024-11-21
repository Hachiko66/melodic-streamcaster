import { useRef, useState, useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup function to properly dispose of audio resources
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('Audio playback error:', error);
    setIsPlaying(false);
    
    // Reset audio element on error
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    toast({
      title: "Playback Error",
      description: "Unable to play this station. Please try another station or check your internet connection.",
      variant: "destructive",
    });
  }, []);

  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      console.log('Initializing new audio element');
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";

      // Basic error handling
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        handleError('Audio element encountered an error');
      };

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

      audio.volume = volume;
      audioRef.current = audio;
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
    
    // Always create a new audio element for each station change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    initializeAudio();
    
    if (!audioRef.current) return;

    try {
      // Set new station
      audioRef.current.src = station.url;
      setCurrentStation(station);
      
      toast({
        title: "Station Changed",
        description: `Now playing: ${station.name}`,
      });

      // Attempt to play immediately
      await audioRef.current.play();
      setIsPlaying(true);
      console.log('Playback started after station selection');
    } catch (error) {
      console.error('Failed to start playback after station selection:', error);
      handleError('Failed to start playback');
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