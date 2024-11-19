import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
}

const AudioVisualizer = ({ audioElement }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

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

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
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