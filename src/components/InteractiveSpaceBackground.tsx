import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveSpaceBackgroundProps {
  pageState: 'LANDING' | 'AUTH';
  authMode: 'LOGIN' | 'REGISTER';
}

export const InteractiveSpaceBackground: React.FC<InteractiveSpaceBackgroundProps> = ({
  pageState,
  authMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 35;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 35;
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * -18,
        y: (e.clientY / window.innerHeight - 0.5) * -18,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ─── LAYER 1: MULTI-DEPTH REALISTIC STAR FIELD ───
    const starCount = 140;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      twinkleSpeed: number;
      phase: number;
      color: string;
      speed: number;
    }> = [];

    const starColors = ['#FFFFFF', '#F0F9FF', '#E0F2FE', '#EDE9FE', '#DDD6FE', '#38BDF8'];

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random(); // 0 (far distant) to 1 (near)
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: depth > 0.85 ? Math.random() * 1.4 + 0.8 : Math.random() * 0.7 + 0.35,
        baseAlpha: Math.random() * 0.55 + 0.25,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        speed: depth * 0.12 + 0.03
      });
    }

    // ─── LAYER 2: SLOW DRIFTING COSMIC DUST PARTICLES ───
    const dustCount = 38;
    const dustParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }> = [];

    const dustColors = ['#38BDF8', '#818CF8', '#A855F7', '#06B6D4', '#22D3EE'];

    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.6 + 0.8,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
        alpha: Math.random() * 0.3 + 0.15,
      });
    }

    // ─── LAYER 3: OCCASIONAL HIGH-SPEED RESEARCH METEOR STREAKS ───
    let shootingStar: {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    } | null = null;

    let nextShootingStarTime = Date.now() + 3500;

    let animationId: number;
    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(render);
      time += 0.016;

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      if (pageState === 'LANDING') {
        // 1. Draw Multi-Layered Stars with Organic Twinkle
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const px = s.x + mouseX * s.speed;
          const py = s.y + mouseY * s.speed;

          const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed * 60 + s.phase) * 0.3;
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.12, Math.min(0.95, alpha));
          ctx.beginPath();
          ctx.arc(px, py, s.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle corona for brighter foreground stars
          if (s.radius > 1.2) {
            ctx.fillStyle = s.color;
            ctx.globalAlpha = alpha * 0.25;
            ctx.beginPath();
            ctx.arc(px, py, s.radius * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 2. Draw Gentle Drifting Cosmic Dust & Research Vector Links
        for (let i = 0; i < dustParticles.length; i++) {
          const p = dustParticles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const px = p.x + mouseX * 0.18;
          const py = p.y + mouseY * 0.18;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle connection arcs between proximate dust particles
          for (let j = i + 1; j < dustParticles.length; j++) {
            const p2 = dustParticles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 135) {
              const lineAlpha = (1 - dist / 135) * 0.08;
              ctx.strokeStyle = '#38BDF8';
              ctx.globalAlpha = lineAlpha;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(p2.x + mouseX * 0.18, p2.y + mouseY * 0.18);
              ctx.stroke();
            }
          }
        }

        // 3. Cosmic Shooting Star / High-Velocity Data Streak
        const now = Date.now();
        if (!shootingStar && now > nextShootingStarTime) {
          shootingStar = {
            x: Math.random() * width * 0.85,
            y: Math.random() * height * 0.35,
            length: Math.random() * 80 + 75,
            speed: Math.random() * 12 + 15,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
            opacity: 1,
            active: true
          };
          nextShootingStarTime = now + Math.random() * 8000 + 6000;
        }

        if (shootingStar && shootingStar.active) {
          ctx.save();
          const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
          const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

          const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
          grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.45)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.75;
          ctx.globalAlpha = shootingStar.opacity;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();
          ctx.restore();

          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.opacity -= 0.024;

          if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
            shootingStar = null;
          }
        }

        ctx.globalAlpha = 1.0;
      }
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [pageState]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none transition-colors duration-700">
      
      {/* ─── LANDING MODE: DEEP SPACE RESEARCH COSMOS WITH HARMONIC ATMOSPHERIC WAVES ─── */}
      {pageState === 'LANDING' && (
        <div className="absolute inset-0 bg-[#060B19]">
          {/* Cosmic Nebula Wave 1: Top Right (Electric Blue & Indigo) */}
          <div 
            className="absolute -top-[18%] right-[4%] w-[750px] h-[750px] rounded-full pointer-events-none blur-[130px] opacity-35 animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 75%)',
              transform: `translate3d(${parallax.x * 0.35}px, ${parallax.y * 0.35}px, 0)`,
              animationDuration: '14s'
            }}
          />

          {/* Cosmic Nebula Wave 2: Center Left (Deep Violet & Magenta Galaxy Dust) */}
          <div 
            className="absolute top-[30%] -left-[14%] w-[700px] h-[700px] rounded-full pointer-events-none blur-[140px] opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 80%)',
              transform: `translate3d(${parallax.x * -0.28}px, ${parallax.y * -0.28}px, 0)`
            }}
          />

          {/* Cosmic Nebula Wave 3: Bottom Right (Cyan Atmospheric Halo) */}
          <div 
            className="absolute -bottom-[16%] right-[14%] w-[650px] h-[650px] rounded-full pointer-events-none blur-[120px] opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(37, 99, 235, 0.18) 60%, transparent 80%)',
              transform: `translate3d(${parallax.x * 0.2}px, ${parallax.y * 0.2}px, 0)`
            }}
          />

          {/* Micro-dot constellation grid texture */}
          <div 
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
        </div>
      )}

      {/* ─── AUTH MODE: DARK INTERSTELLAR COSMOS ─── */}
      {pageState === 'AUTH' && (
        <div className="absolute inset-0 bg-[#030712]">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: "url('/login_bg.jpg')",
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
            }}
            initial={false}
            animate={{ 
              opacity: authMode === 'LOGIN' ? 0.85 : 0,
              scale: authMode === 'LOGIN' ? [1.02, 1.05, 1.02] : 1.0
            }}
            transition={{ 
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 35, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          <motion.div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: "url('/register_bg.jpg')",
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
            }}
            initial={false}
            animate={{ 
              opacity: authMode === 'REGISTER' ? 0.85 : 0,
              scale: authMode === 'REGISTER' ? [1.02, 1.05, 1.02] : 1.0
            }}
            transition={{ 
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 35, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712]/80 opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030712_85%)] opacity-80" />
        </div>
      )}

      {/* Interactive Multi-Layer Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 pointer-events-none"
      />
    </div>
  );
};
