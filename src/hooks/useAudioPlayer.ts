import { useRef, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    audioRef.current.preload = "auto";

    const audio = audioRef.current;

    const handleError = (e: Event) => {
      console.error('Audio playback error occurred', e);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Unable to play this station. Please try another station or check your internet connection.",
        variant: "destructive",
      });
    };

    const handleStalled = () => {
      console.log('Audio playback stalled');
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      console.log('Audio is buffering...');
    };

    const handleCanPlay = () => {
      console.log('Audio can start playing');
    };

    // Add all event listeners
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      // Clean up all event listeners and audio context
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentStation) return;

    const audio = audioRef.current;
    audio.src = currentStation.url;

    if (isPlaying) {
      console.log('Attempting to play:', currentStation.url);
      
      // Initialize AudioContext on user interaction
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume AudioContext if it was suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Playback started successfully');
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            toast({
              title: "Playback Error",
              description: "There was an error playing this station. Please try again.",
              variant: "destructive",
            });
          });
      }
    } else {
      audio.pause();
    }
  }, [currentStation, isPlaying]);

  const handlePlayPause = async () => {
    if (!audioRef.current || !currentStation) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        console.log('Playback paused');
      } else {
        // Initialize AudioContext on user interaction
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Resume AudioContext if it was suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        console.log('Attempting to play audio');
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          console.log('Playback started successfully');
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "There was an error playing this station. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    const volumeValue = newValue[0];
    setVolume(volumeValue);
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }
  };

  const handleStationSelect = (station: RadioStation) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentStation(station);
    toast({
      title: "Station Changed",
      description: `Now playing: ${station.name}`,
    });
  };

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