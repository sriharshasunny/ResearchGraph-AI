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
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 30;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 30;
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * -15,
        y: (e.clientY / window.innerHeight - 0.5) * -15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Floating Network Nodes for Scientific Intelligence Visualization
    const nodeCount = 45;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#2563EB', '#3B82F6', '#6366F1', '#8B5CF6', '#06B6D4'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.3 + 0.15,
      });
    }

    let animationId: number;
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(render);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Only draw subtle node connections on landing mode
      if (pageState === 'LANDING') {
        // Update and draw nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = width;
          if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          if (n.y > height) n.y = 0;

          const px = n.x + mouseX * 0.15;
          const py = n.y + mouseY * 0.15;

          ctx.fillStyle = n.color;
          ctx.globalAlpha = n.alpha;
          ctx.beginPath();
          ctx.arc(px, py, n.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect adjacent nodes with faint lines
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n.x - n2.x;
            const dy = n.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 130) {
              const lineAlpha = (1 - dist / 130) * 0.09;
              ctx.strokeStyle = '#3B82F6';
              ctx.globalAlpha = lineAlpha;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(n2.x + mouseX * 0.15, n2.y + mouseY * 0.15);
              ctx.stroke();
            }
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
      
      {/* ─── LANDING MODE: BRIGHT, FUTURISTIC, LUMINOUS SCIENTIFIC SURFACE (60% Light White/Slate) ─── */}
      {pageState === 'LANDING' && (
        <div className="absolute inset-0 bg-[#F8FAFC]">
          {/* Soft ambient radial glow 1: Top Right (Lavender & Blue) */}
          <div 
            className="absolute -top-[15%] right-[5%] w-[650px] h-[650px] rounded-full pointer-events-none blur-3xl opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(199, 210, 254, 0.45) 0%, rgba(224, 242, 254, 0.25) 50%, transparent 75%)',
              transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)`
            }}
          />

          {/* Soft ambient radial glow 2: Center Left (Sky Cyan & Indigo) */}
          <div 
            className="absolute top-[28%] -left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none blur-3xl opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(224, 242, 254, 0.55) 0%, rgba(243, 232, 255, 0.35) 50%, transparent 80%)',
              transform: `translate3d(${parallax.x * -0.3}px, ${parallax.y * -0.3}px, 0)`
            }}
          />

          {/* Soft ambient radial glow 3: Bottom Center (Subtle Cyan accent) */}
          <div 
            className="absolute -bottom-[10%] left-[25%] w-[700px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(219, 234, 254, 0.5) 0%, rgba(238, 242, 255, 0.3) 60%, transparent 80%)'
            }}
          />

          {/* Micro-dot academic grid texture */}
          <div 
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.16) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />
        </div>
      )}

      {/* ─── AUTH MODE: DARK INTERSTELLAR COSMOS ─── */}
      {pageState === 'AUTH' && (
        <div className="absolute inset-0 bg-[#030712]">
          {/* Layer 2: Login Background */}
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

          {/* Layer 3: Register Background */}
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

          {/* Dark Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712]/80 opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030712_85%)] opacity-80" />
        </div>
      )}

      {/* Interactive Canvas (Nodes / Constellation lines) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 pointer-events-none"
      />
    </div>
  );
};
