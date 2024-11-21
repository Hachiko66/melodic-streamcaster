import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import AudioVisualizer from '@/components/AudioVisualizer';
import RadioControls from '@/components/RadioControls';
import StationList, { RadioStation } from '@/components/StationList';
import { Twitter, Instagram } from 'lucide-react';

const STATIONS: RadioStation[] = [
  {
    id: '1',
    name: 'Radio Dangdut Indonesia',
    url: 'https://stream-node0.rri.co.id/streaming/14/9014/rridangdut.mp3',
    genre: 'Dangdut',
    tipAddress: '0x1234567890123456789012345678901234567890',
    waveInfo: 'FM 97.1 MHz - Jakarta'
  },
  {
    id: '2',
    name: 'RRI Pro 2 Jakarta',
    url: 'https://stream-node0.rri.co.id/streaming/2/9021/rripro2.mp3',
    genre: 'Pop & News',
    tipAddress: '0x2345678901234567890123456789012345678901',
    waveInfo: 'FM 95.0 MHz - Jakarta'
  },
  {
    id: '3',
    name: 'Prambors FM',
    url: 'https://22253.live.streamtheworld.com/PRAMBORS_FM.mp3',
    genre: 'Pop & Entertainment',
    tipAddress: '0x3456789012345678901234567890123456789012',
    waveInfo: 'FM 102.2 MHz - Jakarta'
  },
  {
    id: '4',
    name: 'Custom Radio',
    url: 'https://uk3freenew.listen2myradio.com/live.mp3?typeportmount=s1_25742_stream_842986431',
    genre: 'Various',
    waveInfo: 'Online Stream'
  }
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
    
    // Add error event listener
    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Unable to play this station. Please try another station or check your internet connection.",
        variant: "destructive",
      });
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('error', handleError as EventListener);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('error', handleError as EventListener);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && currentStation) {
      audioRef.current.src = currentStation.url;
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
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
    }
  }, [currentStation]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/lovable-uploads/e5c2ac3a-8689-48e4-94f6-ed50b3c1e4ae.png')`,
        backgroundColor: '#3D3D3D',
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="space-y-2 max-w-2xl w-full px-4 backdrop-blur-sm">
        {/* Main Player Window */}
        <div className="bg-[#C0C0C0] border-t-2 border-l-2 border-[#FFFFFF] border-b-2 border-r-2 border-[#555555] p-1">
          {/* Title Bar */}
          <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-sm mb-1">
            <div className="flex items-center gap-1">
              <img src="/lovable-uploads/1642cd86-1530-467f-a4fa-c88e5e5ea368.png" alt="Winamp" className="w-4 h-4" />
              <span>Lovable Radio - {currentStation?.name || 'No station selected'}</span>
            </div>
            <div className="flex gap-1">
              <button className="px-1 bg-[#C0C0C0] text-black text-xs">_</button>
              <button className="px-1 bg-[#C0C0C0] text-black text-xs">□</button>
              <button className="px-1 bg-[#C0C0C0] text-black text-xs">×</button>
            </div>
          </div>

          {/* Player Content */}
          <div className="bg-[#232323] p-4 space-y-4">
            <AudioVisualizer audioElement={audioRef.current} />
            <div className="text-[#C0C0C0] text-xs">
              {currentStation?.waveInfo && (
                <div className="mb-2 font-mono">
                  Wave Info: {currentStation.waveInfo}
                </div>
              )}
            </div>
            <RadioControls
              isPlaying={isPlaying}
              volume={volume}
              onPlayPause={handlePlayPause}
              onVolumeChange={handleVolumeChange}
            />
            
            {/* Social Media Links */}
            <div className="flex justify-center gap-4 pt-2 border-t border-[#444444]">
              <a
                href="https://twitter.com/lovableradio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C0C0C0] hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/lovableradio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C0C0C0] hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Playlist Window */}
        <div className="bg-[#C0C0C0] border-t-2 border-l-2 border-[#FFFFFF] border-b-2 border-r-2 border-[#555555] p-1">
          <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-sm mb-1">
            <span>Playlist</span>
            <div className="flex gap-1">
              <button className="px-1 bg-[#C0C0C0] text-black text-xs">_</button>
              <button className="px-1 bg-[#C0C0C0] text-black text-xs">×</button>
            </div>
          </div>
          <div className="bg-[#232323] p-2">
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
