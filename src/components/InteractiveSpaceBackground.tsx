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
      // Also update subtle background parallax state smoothly
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * -18,
        y: (e.clientY / window.innerHeight - 0.5) * -18,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Dynamic Starfield with 3D Depth
    const starCount = 75;
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      depth: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() * 0.8 + 0.2;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.45 + 0.25,
        alpha: 0.5,
        depth,
        twinkleSpeed: Math.random() * 0.025 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Occasional shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    }

    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 80,
      speed: 14,
      angle: Math.PI / 4,
      opacity: 0,
      active: false,
    };

    let nextShootingStarTime = Date.now() + 3000;

    const spawnShootingStar = () => {
      shootingStar.x = Math.random() * width * 0.8;
      shootingStar.y = Math.random() * height * 0.4;
      shootingStar.length = Math.random() * 70 + 60;
      shootingStar.speed = Math.random() * 8 + 12;
      shootingStar.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
      shootingStar.opacity = 1;
      shootingStar.active = true;
    };

    let animationId: number;
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(render);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render stars with 3D depth parallax
      for (const star of stars) {
        star.twinklePhase += star.twinkleSpeed;
        star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.2;

        const px = star.x + mouseX * star.depth;
        const py = star.y + mouseY * star.depth;

        ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0.1, star.alpha)})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size * star.depth, 0, Math.PI * 2);
        ctx.fill();
      }

      // Check shooting star
      if (Date.now() > nextShootingStarTime && !shootingStar.active) {
        spawnShootingStar();
        nextShootingStarTime = Date.now() + Math.random() * 8000 + 4000;
      }

      if (shootingStar.active) {
        ctx.save();
        ctx.strokeStyle = `rgba(125, 211, 252, ${shootingStar.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.opacity -= 0.016;

        if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
          shootingStar.active = false;
        }
      }
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationId);
      } else {
        isRunning = true;
        render();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#030712] pointer-events-none select-none">
      
      {/* Layer 1: Previous Space Background (Subdued/Dulled for optimal UI clarity and depth) */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/dark_ufo_bg.jpg')",
          transform: `translate3d(${parallax.x * 0.35}px, ${parallax.y * 0.35}px, 0)`,
          filter: pageState === 'LANDING' ? 'brightness(1.1) contrast(1.05)' : 'none'
        }}
        initial={false}
        animate={{ 
          opacity: pageState === 'LANDING' ? 0.75 : 0,
          scale: pageState === 'LANDING' ? 1.02 : 1.0
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Layer 2: Login Background (Photorealistic Planetary Arc & Cosmos Vista) */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/login_bg.jpg')",
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
        }}
        initial={false}
        animate={{ 
          opacity: (pageState === 'AUTH' && authMode === 'LOGIN') ? 0.88 : 0,
          scale: (pageState === 'AUTH' && authMode === 'LOGIN') ? [1.02, 1.05, 1.02] : 1.0
        }}
        transition={{ 
          opacity: { duration: 0.8, ease: "easeInOut" },
          scale: { duration: 35, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Layer 3: Register Background (Photorealistic Interstellar Nebula Star Cluster) */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/register_bg.jpg')",
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
        }}
        initial={false}
        animate={{ 
          opacity: (pageState === 'AUTH' && authMode === 'REGISTER') ? 0.88 : 0,
          scale: (pageState === 'AUTH' && authMode === 'REGISTER') ? [1.02, 1.05, 1.02] : 1.0
        }}
        transition={{ 
          opacity: { duration: 0.8, ease: "easeInOut" },
          scale: { duration: 35, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Interactive 3D Depth Starfield & Cosmic Dust Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* Atmospheric Gradients: Soft vignettes that preserve cockpit space visibility while maintaining UI clarity */}
      <div className={`absolute inset-0 transition-colors duration-700 ease-in-out z-10 ${
        pageState === 'LANDING' 
          ? 'bg-gradient-to-b from-[#01020a]/80 via-[#030818]/60 to-[#01020a]/90' 
          : 'bg-black/25'
      }`}></div>

      <div className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-700 ease-in-out z-10 ${
        pageState === 'LANDING' 
          ? 'from-black/70 via-transparent to-black/90 opacity-80' 
          : 'from-[#030712]/80 via-transparent to-[#030712]/80 opacity-90'
      }`}></div>

      {/* Radial Focus Vignette */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-10 ${
        pageState === 'AUTH' 
          ? 'opacity-80 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030712_85%)]' 
          : 'opacity-70 bg-[radial-gradient(ellipse_at_center,transparent_30%,#01020a_95%)]'
      }`}></div>
    </div>
  );
};
