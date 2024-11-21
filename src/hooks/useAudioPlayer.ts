import { useRef, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { RadioStation } from '@/components/StationList';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    audioRef.current.preload = "auto"; // Preload metadata

    const audio = audioRef.current;

    const handleError = () => {
      console.error('Audio playback error occurred');
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Unable to play this station. Please try another station or check your internet connection.",
        variant: "destructive",
      });
    };

    const handleStalled = () => {
      console.error('Audio playback stalled');
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
      // Clean up all event listeners
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
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
    }
  }, [currentStation]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('Playback paused');
    } else {
      console.log('Attempting to play audio');
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log('Playback started successfully');
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
    setCurrentStation
  };
};