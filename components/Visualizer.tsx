import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface VisualizerProps {
  isPlaying: boolean;
  color?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, color = '#ffffff' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bassBoost } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    // Initialize bars
    const barCount = 40;
    let bars: number[] = Array(barCount).fill(0).map(() => Math.random() * 50);

    const render = () => {
      if (!canvas.parentElement) return;
      
      // Resize to fit container
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bars.length;
      const gap = 4;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      bars.forEach((bar, index) => {
        // Simulation logic
        // Bass boost multiplier: if enabled, bars jump higher
        const multiplier = bassBoost ? 1.8 : 1.0;
        
        let targetHeight = isPlaying 
            ? Math.random() * height * 0.8 * multiplier 
            : Math.random() * height * 0.1;
        
        // Clamp height
        targetHeight = Math.min(targetHeight, height);

        // Smooth transition
        bars[index] = bars[index] + (targetHeight - bars[index]) * 0.2;

        const x = index * barWidth;
        const h = Math.max(bars[index], 4); 
        const y = height - h;
        const w = Math.max(0, barWidth - gap);
        const radius = Math.min(w / 2, 4);

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            try {
                ctx.roundRect(x + gap/2, y, w, h, [radius, radius, 0, 0]);
            } catch (e) {
                 ctx.rect(x + gap/2, y, w, h);
            }
        } else {
            ctx.rect(x + gap/2, y, w, h);
        }
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, color, bassBoost]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default Visualizer;