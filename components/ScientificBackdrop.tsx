import React, { useEffect, useRef } from 'react';

interface ScienceParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'star' | 'atom' | 'molecule';
  color: string;
  angle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
}

export const ScientificBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: ScienceParticle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(40, Math.floor((canvas.width * canvas.height) / 32000));
      
      const colors = [
        'rgba(129, 140, 248, 0.45)', // Indigo
        'rgba(192, 132, 252, 0.45)', // Purple
        'rgba(34, 211, 238, 0.50)',  // Cyan
        'rgba(251, 191, 36, 0.40)',  // Gold
      ];

      for (let i = 0; i < particleCount; i++) {
        const typeRand = Math.random();
        let type: 'star' | 'atom' | 'molecule' = 'star';
        if (typeRand > 0.65) type = 'atom';
        else if (typeRand > 0.35) type = 'molecule';

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          type,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * Math.PI * 2,
          orbitRadius: Math.random() * 16 + 8,
          orbitSpeed: (Math.random() - 0.5) * 0.04,
        });
      }
    };

    const drawParticle = (p: ScienceParticle) => {
      if (!ctx) return;

      ctx.save();
      
      if (p.type === 'atom') {
        // Draw Nucleus
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw Electron Orbit Loop
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.orbitRadius || 12, (p.orbitRadius || 12) * 0.4, Math.PI / 4, 0, Math.PI * 2);
        ctx.strokeStyle = p.color.replace('0.22', '0.07').replace('0.18', '0.05');
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Electron
        if (p.angle !== undefined && p.orbitRadius !== undefined) {
          const ex = p.x + Math.cos(p.angle) * p.orbitRadius;
          const ey = p.y + Math.sin(p.angle) * p.orbitRadius * 0.4;
          ctx.beginPath();
          ctx.arc(ex, ey, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace('0.22', '0.6').replace('0.18', '0.5');
          ctx.fill();
        }
      } else if (p.type === 'molecule') {
        // Draw simple atomic bond nodes (triple-connected cluster)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        const offsetAngle1 = p.angle || 0;
        const offsetAngle2 = offsetAngle1 + (Math.PI * 2) / 3;

        const subRadius = p.radius * 0.7;
        const subDist = p.radius * 4;

        // Sub Node 1
        const sx1 = p.x + Math.cos(offsetAngle1) * subDist;
        const sy1 = p.y + Math.sin(offsetAngle1) * subDist;
        ctx.beginPath();
        ctx.arc(sx1, sy1, subRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Sub Node 2
        const sx2 = p.x + Math.cos(offsetAngle2) * subDist;
        const sy2 = p.y + Math.sin(offsetAngle2) * subDist;
        ctx.beginPath();
        ctx.arc(sx2, sy2, subRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Lines connecting them
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(sx1, sy1);
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(sx2, sy2);
        ctx.strokeStyle = p.color.replace('0.22', '0.09').replace('0.18', '0.07');
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Standard Glowing Science Star / Spark
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
      }

      ctx.restore();
    };

    const updateParticles = () => {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Update orbits and offsets
        if (p.angle !== undefined && p.orbitSpeed !== undefined) {
          p.angle += p.orbitSpeed;
        }

        // Mouse Gravitational Attraction (Subtle influence)
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        if (mx !== null && my !== null) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 1100;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }
      });
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (140 - dist) / 140 * 0.11;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateParticles();
      drawConnections();
      particles.forEach(drawParticle);
      animationFrameId = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    tick();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
