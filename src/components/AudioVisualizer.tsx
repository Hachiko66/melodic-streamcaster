import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
}

const AudioVisualizer = ({ audioElement }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const setupAudioContext = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (!analyserRef.current) {
          const analyser = audioContextRef.current.createAnalyser();
          analyserRef.current = analyser;
          
          const source = audioContextRef.current.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioContextRef.current.destination);
          
          analyser.fftSize = 256;
        }
      } catch (error) {
        console.error('Error setting up audio context:', error);
      }
    };

    const initializeVisualization = () => {
      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      const draw = () => {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        animationRef.current = requestAnimationFrame(draw);

        analyserRef.current!.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;

          const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          gradient.addColorStop(0, '#4C1D95');
          gradient.addColorStop(1, '#0D9488');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      };

      draw();
    };

    setupAudioContext();
    initializeVisualization();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={200} 
      className="w-full h-[200px] rounded-lg"
    />
  );
};

export default AudioVisualizer;