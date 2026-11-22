import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Compass,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ResearchHangingPlatformViewProps {
  onNavigate?: (route: string) => void;
  className?: string;
}

// Major research hubs for the 3D globe overlay
const GLOBAL_HUBS = [
  { id: 'mit', name: 'MIT / Harvard', lat: 42.36, lon: -71.09, color: '#38bdf8' },
  { id: 'stanford', name: 'Stanford / Bay Area', lat: 37.42, lon: -122.17, color: '#38bdf8' },
  { id: 'cern', name: 'CERN Geneva', lat: 46.23, lon: 6.05, color: '#a855f7' },
  { id: 'oxford', name: 'Oxford University', lat: 51.75, lon: -1.25, color: '#818cf8' },
  { id: 'tokyo', name: 'Tokyo University', lat: 35.71, lon: 139.76, color: '#06b6d4' },
  { id: 'singapore', name: 'NUS Singapore', lat: 1.29, lon: 103.77, color: '#10b981' },
  { id: 'saopaulo', name: 'Univ of São Paulo', lat: -23.55, lon: -46.63, color: '#f59e0b' }
];

// Dynamic citation arcs between global academic hubs
const HUB_ARCS = [
  [0, 1], // MIT -> Stanford
  [0, 2], // MIT -> CERN
  [0, 3], // MIT -> Oxford
  [1, 4], // Stanford -> Tokyo
  [2, 3], // CERN -> Oxford
  [3, 5], // Oxford -> Singapore
  [4, 5], // Tokyo -> Singapore
  [0, 6]  // MIT -> São Paulo
];

// Continent Point Cloud bounds for realistic rotating continent landmasses
const CONTINENT_DATA = [
  { latMin: 18, latMax: 65, lonMin: -125, lonMax: -65, count: 180 }, // North America
  { latMin: -50, latMax: 10, lonMin: -78, lonMax: -38, count: 120 },  // South America
  { latMin: 38, latMax: 62, lonMin: -8, lonMax: 38, count: 130 },    // Europe
  { latMin: -32, latMax: 34, lonMin: -15, lonMax: 48, count: 150 },   // Africa
  { latMin: 12, latMax: 65, lonMin: 50, lonMax: 140, count: 220 },   // Asia
  { latMin: -38, latMax: -14, lonMin: 114, lonMax: 152, count: 70 }   // Australia
];

// Interactive Hotspots mapped directly over the artwork's 8 badges
const BADGE_HOTSPOTS = [
  {
    id: 'graph',
    name: 'Knowledge Graph',
    tag: 'AI-Core',
    metric: '1.8M Entities Connected',
    left: '28%',
    top: '20%',
    width: '16%',
    height: '6.5%',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.55)',
    action: 'graph'
  },
  {
    id: 'insights',
    name: 'AI Insights',
    tag: 'Consensus',
    metric: 'Multi-LLM Synthesis Active',
    left: '24%',
    top: '32.5%',
    width: '14%',
    height: '6.5%',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.55)',
    action: 'search'
  },
  {
    id: 'concepts',
    name: 'Concepts',
    tag: '1.8M+',
    metric: 'Ontology Lattice Indexed',
    left: '27%',
    top: '46%',
    width: '13%',
    height: '6.5%',
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.55)',
    action: 'search'
  },
  {
    id: 'citations',
    name: 'Citations',
    tag: '1.24B+',
    metric: 'Grounded Lineage Arcs',
    left: '50%',
    top: '64.5%',
    width: '14%',
    height: '6.5%',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.65)',
    action: 'search'
  },
  {
    id: 'papers',
    name: 'Research Papers',
    tag: '204M+',
    metric: 'Full-Text Crossref / arXiv',
    left: '73%',
    top: '20%',
    width: '16%',
    height: '6.5%',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.55)',
    action: 'search'
  },
  {
    id: 'authors',
    name: 'Authors',
    tag: '12.4M+',
    metric: 'Collaboration Networks Mapped',
    left: '79%',
    top: '31.5%',
    width: '13%',
    height: '6.5%',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.55)',
    action: 'search'
  },
  {
    id: 'datasets',
    name: 'Datasets',
    tag: '85K+',
    metric: 'Empirical Benchmarks Linked',
    left: '74%',
    top: '46%',
    width: '13%',
    height: '6.5%',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.55)',
    action: 'search'
  },
  {
    id: 'ufo',
    name: 'RECON SURVEYOR',
    tag: '02%',
    metric: 'Autonomous Literature Probe',
    left: '91%',
    top: '6.5%',
    width: '14%',
    height: '5%',
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.65)',
    action: 'search'
  }
];

export const ResearchHangingPlatformView: React.FC<ResearchHangingPlatformViewProps> = ({
  onNavigate,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<typeof BADGE_HOTSPOTS[0] | null>(null);

  // 3D Parallax Tilt State
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotY: x * 8,  // Smooth 8 deg max horizontal tilt
      rotX: -y * 6  // Smooth 6 deg max vertical tilt
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotX: 0, rotY: 0 });
    setActiveTooltip(null);
  }, []);

  // 3D Interactive Rotating Globe Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const size = 380;
    canvas.width = size;
    canvas.height = size;
    const R = 158;
    const cx = size / 2;
    const cy = size / 2;

    let rotation = 0;
    let drag: { x: number; rot: number } | null = null;

    // Generate 3D point cloud on sphere
    const points: { x: number; y: number; z: number }[] = [];
    CONTINENT_DATA.forEach(c => {
      for (let i = 0; i < c.count; i++) {
        const lat = (c.latMin + Math.random() * (c.latMax - c.latMin)) * (Math.PI / 180);
        const lon = (c.lonMin + Math.random() * (c.lonMax - c.lonMin)) * (Math.PI / 180);
        points.push({
          x: R * Math.cos(lat) * Math.sin(lon),
          y: -R * Math.sin(lat),
          z: R * Math.cos(lat) * Math.cos(lon)
        });
      }
    });

    const hubs3D = GLOBAL_HUBS.map(h => {
      const lat = h.lat * (Math.PI / 180);
      const lon = h.lon * (Math.PI / 180);
      return {
        ...h,
        ox: R * Math.cos(lat) * Math.sin(lon),
        oy: -R * Math.sin(lat),
        oz: R * Math.cos(lat) * Math.cos(lon)
      };
    });

    // Touch and Mouse Drag Handlers
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, rot: rotation };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      rotation = drag.rot + (e.clientX - drag.x) * 0.007;
    };

    const onUp = (e: PointerEvent) => {
      drag = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let t = 0;
    const render = () => {
      animId = requestAnimationFrame(render);
      t += 0.016;

      if (!drag) {
        rotation += 0.0035; // Continuous smooth rotation
      }

      ctx.clearRect(0, 0, size, size);

      const cosA = Math.cos(rotation);
      const sinA = Math.sin(rotation);

      // 1. Atmospheric Ambient Rim Glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.22);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      glow.addColorStop(0.4, 'rgba(6, 182, 212, 0.16)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // 2. Latitude Grid Rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const radLat = lat * (Math.PI / 180);
        const rP = R * Math.cos(radLat);
        const yP = cy - R * Math.sin(radLat);
        ctx.beginPath();
        ctx.ellipse(cx, yP, rP, rP * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Rotating Continent Points
      points.forEach(p => {
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;

        // Front-facing hemisphere
        if (rz > -12) {
          const depth = (rz + R) / (2 * R);
          const alpha = 0.25 + depth * 0.75;
          ctx.fillStyle = `rgba(103, 232, 249, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx + rx, cy + p.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Research Hubs & Citation Arcs
      const currentHubs = hubs3D.map(h => {
        const rx = h.ox * cosA - h.oz * sinA;
        const rz = h.ox * sinA + h.oz * cosA;
        return {
          ...h,
          px: cx + rx,
          py: cy + h.oy,
          vis: rz > 0
        };
      });

      // Animated 3D Citation Arcs
      HUB_ARCS.forEach(([a, b], idx) => {
        const hA = currentHubs[a];
        const hB = currentHubs[b];
        if (!hA || !hB) return;
        if (!hA.vis && !hB.vis) return;

        const mx = (hA.px + hB.px) / 2;
        const my = (hA.py + hB.py) / 2 - 32;

        ctx.strokeStyle = 'rgba(103, 232, 249, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(hA.px, hA.py);
        ctx.quadraticCurveTo(mx, my, hB.px, hB.py);
        ctx.stroke();

        // Traveling Photon Packet
        const progress = (t * 0.42 + idx * 0.25) % 1;
        const bx = Math.pow(1 - progress, 2) * hA.px + 2 * (1 - progress) * progress * mx + Math.pow(progress, 2) * hB.px;
        const by = Math.pow(1 - progress, 2) * hA.py + 2 * (1 - progress) * progress * my + Math.pow(progress, 2) * hB.py;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Hub Node Marker Bulbs
      currentHubs.forEach(h => {
        if (!h.vis) return;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(h.px, h.py, 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = h.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(h.px, h.py, 5.5 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 5. Tilted Equatorial Orbital Ring with Orbiting Satellites
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.34, R * 0.35, -0.26, 0, Math.PI * 2);
      ctx.stroke();

      const satAngle1 = t * 0.58;
      const s1x = cx + Math.cos(satAngle1) * R * 1.34 * Math.cos(-0.26) - Math.sin(satAngle1) * R * 0.35 * Math.sin(-0.26);
      const s1y = cy + Math.cos(satAngle1) * R * 1.34 * Math.sin(-0.26) + Math.sin(satAngle1) * R * 0.35 * Math.cos(-0.26);
      ctx.fillStyle = '#67e8f9';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s1x, s1y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-[920px] mx-auto select-none transition-transform duration-300 ease-out ${className}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* ── 3D LEVITATING STAGE WITH GYROSCOPIC TILT ── */}
      <div
        className="relative w-full aspect-[16/9] flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* 1. CINEMATIC HANGING CITADEL ARTWORK BASE (USER EXACT COMPOSITION) */}
        <img
          src="/hanging_citadel_hero.jpg"
          alt="ResearchGraph AI Hanging Citadel and Knowledge Core"
          className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_60px_rgba(6,182,212,0.4)]"
          style={{
            maskImage: 'radial-gradient(ellipse 96% 94% at 50% 50%, black 75%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 96% 94% at 50% 50%, black 75%, transparent 100%)'
          }}
        />

        {/* 2. DYNAMIC VOLUMETRIC HOLOGRAPHIC BEAM PILLAR (OVER PLATFORM EMITTER) */}
        <div 
          className="absolute top-[2%] left-1/2 -translate-x-1/2 w-[24%] h-[65%] pointer-events-none z-10 flex justify-center mix-blend-screen"
          aria-hidden="true"
        >
          <div 
            className="w-full h-full animate-pulse"
            style={{
              background: 'linear-gradient(to top, rgba(6,182,212,0.4) 0%, rgba(56,189,248,0.2) 45%, rgba(129,140,248,0.08) 80%, transparent 100%)',
              filter: 'blur(3px)',
              clipPath: 'polygon(15% 100%, 85% 100%, 90% 0%, 10% 0%)'
            }}
          />
        </div>

        {/* 3. 3D ROTATING GLOBE OVERLAY (PIXEL-PERFECT CONCENTRIC ALIGNMENT WITH ARTWORK GLOBE) */}
        <div 
          className="absolute top-[34.0%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22.5%] aspect-square z-20 flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto mix-blend-screen"
          title="Interactive 3D Research Knowledge Globe · Drag to Rotate"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            aria-label="3D Interactive Research Knowledge Globe"
          />
        </div>

        {/* 4. ACTIVE GRAVITON THRUSTER PLASMA ACCENTS (UNDERNEATH ROCK ISLAND) */}
        <div 
          className="absolute bottom-[6.5%] left-1/2 -translate-x-1/2 w-[32%] h-[12%] pointer-events-none z-10 flex justify-around items-center"
          aria-hidden="true"
        >
          <div className="w-3.5 h-12 rounded-full bg-cyan-400/80 blur-sm animate-ping opacity-75" />
          <div className="w-4 h-16 rounded-full bg-sky-400/90 blur-sm animate-pulse opacity-90" />
          <div className="w-4 h-16 rounded-full bg-sky-400/90 blur-sm animate-pulse opacity-90" />
          <div className="w-3.5 h-12 rounded-full bg-cyan-400/80 blur-sm animate-ping opacity-75" />
        </div>

        {/* 5. INTERACTIVE HOTSPOT BUTTONS (POSITIONED DIRECTLY OVER ARTWORK'S 8 BADGES) */}
        {BADGE_HOTSPOTS.map((badge) => (
          <button
            key={badge.id}
            type="button"
            onClick={() => onNavigate && onNavigate(badge.action)}
            onMouseEnter={() => setActiveTooltip(badge)}
            onMouseLeave={() => setActiveTooltip(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 rounded-full cursor-pointer transition-all duration-200 group focus:outline-none"
            style={{
              left: badge.left,
              top: badge.top,
              width: badge.width,
              height: badge.height
            }}
            aria-label={`${badge.name}: ${badge.metric}`}
          >
            {/* Glowing Aura Ring on Hover */}
            <span 
              className="absolute inset-0 rounded-full transition-all duration-200 group-hover:scale-105 opacity-0 group-hover:opacity-100"
              style={{
                boxShadow: `0 0 20px ${badge.glow}, inset 0 0 10px ${badge.glow}`,
                border: `1.5px solid ${badge.color}`
              }}
            />
          </button>
        ))}

        {/* 6. HOVER TELEMETRY TOOLTIP */}
        {activeTooltip && (
          <div
            className="absolute z-40 pointer-events-none px-3.5 py-1.5 rounded-xl bg-[#070D1E]/95 border backdrop-blur-xl shadow-2xl flex items-center gap-2 -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: activeTooltip.left,
              top: activeTooltip.top,
              borderColor: activeTooltip.color,
              boxShadow: `0 8px 28px rgba(0,0,0,0.7), 0 0 16px ${activeTooltip.glow}`
            }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: activeTooltip.color }} />
            <div className="text-left">
              <span className="block text-xs font-bold text-white leading-tight">
                {activeTooltip.name} · <span className="font-mono text-[10px]" style={{ color: activeTooltip.color }}>{activeTooltip.tag}</span>
              </span>
              <span className="text-[10px] text-gray-300 leading-tight">
                {activeTooltip.metric}
              </span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400 ml-1 shrink-0" />
          </div>
        )}
      </div>

      {/* Floating 3D Interaction Control Hint */}
      <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-cyan-300/80 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '9s' }} />
        <span>3D Research Knowledge Core · Drag globe to spin · Hover badges for live telemetry</span>
      </div>
    </div>
  );
};
