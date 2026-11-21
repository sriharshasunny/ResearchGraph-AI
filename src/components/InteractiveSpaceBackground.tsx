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

    // Layer 1: Distant Multi-Depth Star Field (Deep Cosmic Canvas)
    const starCount = 120;
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

    const starColors = ['#FFFFFF', '#E0F2FE', '#CFFAFE', '#EDE9FE', '#DDD6FE', '#38BDF8'];

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random(); // 0 (far) to 1 (near)
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: depth * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        phase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        speed: depth * 0.15 + 0.05
      });
    }

    // Layer 2: Floating Scientific Network Nodes with Topological Links
    const nodeCount = 36;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }> = [];

    const nodeColors = ['#0EA5E9', '#38BDF8', '#6366F1', '#A855F7', '#06B6D4'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.8 + 1.2,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
        alpha: Math.random() * 0.35 + 0.2,
      });
    }

    // Layer 3: Occasional Cosmic Shooting Stars
    let shootingStar: {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    } | null = null;

    let nextShootingStarTime = Date.now() + 3000;

    let animationId: number;
    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(render);
      time += 0.02;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render for Landing Page
      if (pageState === 'LANDING') {
        // 1. Draw Multi-Layered Twinkling Starfield
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const px = s.x + mouseX * s.speed;
          const py = s.y + mouseY * s.speed;

          // Twinkle pulse calculation
          const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed * 60 + s.phase) * 0.35;
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
          ctx.beginPath();
          ctx.arc(px, py, s.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Draw Scientific Constellation Nodes & Directional Data Links
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = width;
          if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          if (n.y > height) n.y = 0;

          const px = n.x + mouseX * 0.2;
          const py = n.y + mouseY * 0.2;

          ctx.fillStyle = n.color;
          ctx.globalAlpha = n.alpha;
          ctx.beginPath();
          ctx.arc(px, py, n.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect adjacent nodes within connection radius
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n.x - n2.x;
            const dy = n.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140) {
              const lineAlpha = (1 - dist / 140) * 0.12;
              ctx.strokeStyle = '#38BDF8';
              ctx.globalAlpha = lineAlpha;
              ctx.lineWidth = 0.85;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(n2.x + mouseX * 0.2, n2.y + mouseY * 0.2);
              ctx.stroke();
            }
          }
        }

        // 3. Cosmic Shooting Star / Fast Research Data Pulse
        const now = Date.now();
        if (!shootingStar && now > nextShootingStarTime) {
          shootingStar = {
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.35,
            length: Math.random() * 80 + 70,
            speed: Math.random() * 12 + 16,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            opacity: 1,
            active: true
          };
          nextShootingStarTime = now + Math.random() * 7000 + 5000;
        }

        if (shootingStar && shootingStar.active) {
          ctx.save();
          const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
          const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

          const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
          grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.globalAlpha = shootingStar.opacity;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();
          ctx.restore();

          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.opacity -= 0.025;

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
      
      {/* ─── LANDING MODE: DEEP SPACE RESEARCH COSMOS WITH PARALLAX NEBULAE ─── */}
      {pageState === 'LANDING' && (
        <div className="absolute inset-0 bg-[#060B19]">
          {/* Ambient Cosmic Nebula Glow 1: Top Right (Electric Blue & Indigo) */}
          <div 
            className="absolute -top-[15%] right-[5%] w-[700px] h-[700px] rounded-full pointer-events-none blur-[120px] opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 75%)',
              transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)`
            }}
          />

          {/* Ambient Cosmic Nebula Glow 2: Center Left (Deep Violet & Magenta) */}
          <div 
            className="absolute top-[32%] -left-[12%] w-[650px] h-[650px] rounded-full pointer-events-none blur-[130px] opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 80%)',
              transform: `translate3d(${parallax.x * -0.3}px, ${parallax.y * -0.3}px, 0)`
            }}
          />

          {/* Ambient Cosmic Nebula Glow 3: Bottom Right (Cyan Atmospheric Halo) */}
          <div 
            className="absolute -bottom-[15%] right-[15%] w-[600px] h-[600px] rounded-full pointer-events-none blur-[110px] opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(37, 99, 235, 0.2) 60%, transparent 80%)',
              transform: `translate3d(${parallax.x * 0.2}px, ${parallax.y * 0.2}px, 0)`
            }}
          />

          {/* Micro-dot constellation grid texture */}
          <div 
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
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
