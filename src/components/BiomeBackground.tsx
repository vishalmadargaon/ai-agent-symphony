import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export const BiomeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const colors = [
      'rgba(132, 204, 22, 0.15)', // Lime
      'rgba(6, 182, 212, 0.15)',  // Cyan
      'rgba(236, 72, 153, 0.15)',  // Pink
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000); // density
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // boundary checks
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* 3D Gaussian Splats SVG layout */}
      <svg className="absolute w-full h-full opacity-45 scale-110">
        <defs>
          <filter id="gaussian-blur-splat" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="90" />
          </filter>
        </defs>
        
        {/* Lime/Green organic twin sphere */}
        <circle 
          cx="15%" 
          cy="25%" 
          r="240" 
          fill="url(#limeGradient)" 
          filter="url(#gaussian-blur-splat)"
        />
        
        {/* Cyan neural cloud sphere */}
        <circle 
          cx="60%" 
          cy="75%" 
          r="300" 
          fill="url(#cyanGradient)" 
          filter="url(#gaussian-blur-splat)"
        />
        
        {/* Cyber Pink synthesis sphere */}
        <circle 
          cx="85%" 
          cy="30%" 
          r="260" 
          fill="url(#pinkGradient)" 
          filter="url(#gaussian-blur-splat)"
        />

        {/* Gradients */}
        <radialGradient id="limeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(132, 204, 22, 0.22)" />
          <stop offset="100%" stopColor="rgba(132, 204, 22, 0)" />
        </radialGradient>
        
        <radialGradient id="cyanGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(6, 182, 212, 0.22)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
        </radialGradient>
        
        <radialGradient id="pinkGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(236, 72, 153, 0.2)" />
          <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
        </radialGradient>
      </svg>

      {/* Floating neon dust particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
