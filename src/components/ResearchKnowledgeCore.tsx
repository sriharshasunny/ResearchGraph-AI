import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  FileText,
  Network,
  ArrowRight,
  Quote,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResearchKnowledgeCore: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const hostRef = useRef<HTMLDivElement>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.0);

    // Main rotating group
    const globe = new THREE.Group();
    globeGroupRef.current = globe;
    scene.add(globe);

    const SPHERE_RADIUS = 2.15;

    // 1. Texture loader with luminous glowing knowledge globe
    const textureLoader = new THREE.TextureLoader();
    const globeTexture = textureLoader.load('/globe.webp', () => {
      renderer.render(scene, camera);
    });
    globeTexture.colorSpace = THREE.SRGBColorSpace;

    // Core mesh with illuminated continents and network lines
    const coreMaterial = new THREE.MeshStandardMaterial({
      map: globeTexture,
      emissive: new THREE.Color(0x38bdf8),
      emissiveMap: globeTexture,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.15,
    });
    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64),
      coreMaterial,
    );
    globe.add(coreMesh);

    // 2. Inner atmospheric core glow
    const innerGlowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS * 0.99, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1d4ed8,
        transparent: true,
        opacity: 0.7,
      }),
    );
    globe.add(innerGlowMesh);

    // 3. Fresnel Atmospheric Rim Glow (Radiant Electric Blue aura)
    const rimMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = pow(rim, 2.4);
          gl_FragColor = vec4(0.24, 0.72, 1.0, rim * 0.95);
        }
      `,
    });
    const rimMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS * 1.03, 64, 64),
      rimMaterial,
    );
    scene.add(rimMesh);

    // 4. Floating Concentric High-Tech Orbiting Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Cyan Orbit Ring
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.012, 16, 120),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      }),
    );
    ring1.rotation.set(0.65, 0.35, 0.2);
    ringGroup.add(ring1);

    // Violet Orbit Ring
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.3, 0.01, 16, 120),
      new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      }),
    );
    ring2.rotation.set(-0.75, 0.45, -0.3);
    ringGroup.add(ring2);

    // Satellite Beacons (glowing orbs traversing rings)
    const sat1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
    );
    ringGroup.add(sat1);

    const sat2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xc084fc }),
    );
    ringGroup.add(sat2);

    // 5. Ambient & Directional Lights for metallic depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93c5fd, 2.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    pointLight.position.set(-2, -1, 3);
    scene.add(pointLight);

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'absolute inset-0 h-full w-full pointer-events-auto';
    host.prepend(renderer.domElement);

    // Resize handling
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    // Interactive Drag to Rotate
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, .paper-card')) return;
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      globe.rotation.y += dx * 0.005;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + dy * 0.005, -0.6, 0.6);
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    host.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Smooth continuous animation loop
    let frameId = 0;
    let angle1 = 0;
    let angle2 = Math.PI;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globe.rotation.y += 0.0022;
        globe.rotation.x *= 0.98;
      }

      // Animate satellite beacons along orbit paths
      angle1 += 0.012;
      const r1 = 3.0;
      const p1 = new THREE.Vector3(Math.cos(angle1) * r1, Math.sin(angle1) * r1, 0);
      p1.applyEuler(ring1.rotation);
      sat1.position.copy(p1);

      angle2 -= 0.009;
      const r2 = 3.3;
      const p2 = new THREE.Vector3(Math.cos(angle2) * r2, Math.sin(angle2) * r2, 0);
      p2.applyEuler(ring2.rotation);
      sat2.position.copy(p2);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      host.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else mat.dispose();
        }
      });
      globeTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setActivePage('search');
  };

  return (
    <div
      ref={hostRef}
      className="relative flex h-[370px] sm:h-[390px] lg:h-[410px] w-full items-center justify-center select-none"
      aria-label="Interactive academic knowledge core"
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*       4 FLOATING RESEARCH PAPERS FRAMING THE KNOWLEDGE CORE     */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* 1. TOP-LEFT CARD: arXiv Vision Transformers */}
      <div
        onClick={() => handleSearch('A Survey on Vision Transformers')}
        className="paper-card group absolute left-[1%] top-[3%] z-20 w-[180px] cursor-pointer rounded-2xl border border-white/95 bg-white/95 p-3 shadow-[0_12px_28px_-6px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:left-[3%] sm:w-[195px] lg:left-[5%] lg:w-[210px]"
        style={{ transform: 'rotate(-4deg)' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="font-serif font-black text-xs tracking-tight text-[#B31B1B]">arXiv</span>
          <span className="font-mono text-[9px] font-semibold text-slate-400">2024</span>
        </div>
        <h4 className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-[11.5px]">
          A Survey on Vision Transformers
        </h4>
        <span className="my-1 block text-[9.5px] text-slate-500">A. Dosovitskiy et al.</span>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9.5px] text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-0.5"><Quote className="h-2.5 w-2.5 text-slate-400" /> 1.2K</span>
            <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5 text-slate-400" /> PDF</span>
          </div>
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs transition group-hover:scale-110">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>

      {/* 2. TOP-RIGHT CARD: OpenAlex Graph Neural Networks */}
      <div
        onClick={() => handleSearch('Graph Neural Networks for Social Recommendation')}
        className="paper-card group absolute right-[1%] top-[4%] z-20 w-[180px] cursor-pointer rounded-2xl border border-white/95 bg-white/95 p-3 shadow-[0_12px_28px_-6px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:right-[3%] sm:w-[195px] lg:right-[5%] lg:w-[210px]"
        style={{ transform: 'rotate(4deg)' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-slate-900">OpenAlex</span>
          </div>
          <span className="font-mono text-[9px] font-semibold text-slate-400">2023</span>
        </div>
        <h4 className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-[11.5px]">
          Graph Neural Networks for Social Recommendation
        </h4>
        <span className="my-1 block text-[9.5px] text-slate-500">Y. Wu et al.</span>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9.5px] text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-0.5"><Quote className="h-2.5 w-2.5 text-slate-400" /> 856</span>
            <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5 text-slate-400" /> PDF</span>
          </div>
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs transition group-hover:scale-110">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>

      {/* 3. BOTTOM-LEFT CARD: arXiv Medical Image Analysis */}
      <div
        onClick={() => handleSearch('Self-Supervised Learning for Medical Image Analysis')}
        className="paper-card group absolute bottom-[4%] left-[1%] z-20 w-[180px] cursor-pointer rounded-2xl border border-white/95 bg-white/95 p-3 shadow-[0_12px_28px_-6px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:bottom-[6%] sm:left-[3%] sm:w-[195px] lg:left-[5%] lg:w-[210px]"
        style={{ transform: 'rotate(-3deg)' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="font-serif font-black text-xs tracking-tight text-[#B31B1B]">arXiv</span>
          <span className="font-mono text-[9px] font-semibold text-slate-400">2024</span>
        </div>
        <h4 className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-[11.5px]">
          Self-Supervised Learning for Medical Image Analysis
        </h4>
        <span className="my-1 block text-[9.5px] text-slate-500">J. Chen et al.</span>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9.5px] text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-0.5"><Quote className="h-2.5 w-2.5 text-slate-400" /> 642</span>
            <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5 text-slate-400" /> PDF</span>
          </div>
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs transition group-hover:scale-110">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>

      {/* 4. BOTTOM-RIGHT CARD: OpenAlex Large Language Models */}
      <div
        onClick={() => handleSearch('Large Language Models in Scientific Research')}
        className="paper-card group absolute bottom-[3%] right-[1%] z-20 w-[180px] cursor-pointer rounded-2xl border border-white/95 bg-white/95 p-3 shadow-[0_12px_28px_-6px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:bottom-[5%] sm:right-[3%] sm:w-[195px] lg:right-[5%] lg:w-[210px]"
        style={{ transform: 'rotate(3deg)' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-slate-900">OpenAlex</span>
          </div>
          <span className="font-mono text-[9px] font-semibold text-slate-400">2023</span>
        </div>
        <h4 className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-[11.5px]">
          Large Language Models in Science
        </h4>
        <span className="my-1 block text-[9.5px] text-slate-500">T. Brown et al.</span>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9.5px] text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-0.5"><Quote className="h-2.5 w-2.5 text-slate-400" /> 1.1K</span>
            <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5 text-slate-400" /> PDF</span>
          </div>
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs transition group-hover:scale-110">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*              4 VIBRANT GLOWING CATEGORY BADGES                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* TOP: Knowledge Graph (Purple) */}
      <button
        type="button"
        onClick={() => setActivePage('graph')}
        className="absolute top-[2%] left-[50%] -translate-x-1/2 z-30 inline-flex items-center gap-1.5 rounded-full border border-purple-200/60 bg-[#7C3AED] px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-purple-600/35 transition hover:scale-105"
      >
        <Network className="h-3.5 w-3.5 text-purple-200" />
        <span>Knowledge Graph</span>
      </button>

      {/* MID-LEFT: Research Papers (Blue) */}
      <button
        type="button"
        onClick={() => setActivePage('search')}
        className="absolute top-[48%] left-[2%] sm:left-[6%] lg:left-[8%] -translate-y-1/2 z-30 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-[#1D4ED8] px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-blue-600/35 transition hover:scale-105"
      >
        <FileText className="h-3.5 w-3.5 text-blue-200" />
        <span>Research Papers</span>
      </button>

      {/* MID-RIGHT: AI Insights (Emerald) */}
      <button
        type="button"
        onClick={() => setActivePage('chat')}
        className="absolute top-[48%] right-[2%] sm:right-[6%] lg:right-[8%] -translate-y-1/2 z-30 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-[#059669] px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-emerald-600/35 transition hover:scale-105"
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
        <span>AI Insights</span>
      </button>

      {/* BOTTOM-CENTER: Global Connections (Deep Blue) */}
      <button
        type="button"
        onClick={() => setActivePage('graph')}
        className="absolute bottom-[2%] left-[50%] -translate-x-1/2 z-30 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-[#1E40AF] px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-blue-700/35 transition hover:scale-105"
      >
        <Globe className="h-3.5 w-3.5 text-sky-200" />
        <span>Global Connections</span>
      </button>

      {/* Floating Decorative Academic Paper Sheets */}
      <div
        className="pointer-events-none absolute right-[18%] top-[14%] z-10 hidden sm:block w-9 h-12 rounded-sm border border-white/60 bg-white/70 shadow-md backdrop-blur-xs"
        style={{ transform: 'rotate(18deg)' }}
      >
        <div className="m-1 space-y-1 opacity-40">
          <div className="h-0.5 w-full bg-slate-400 rounded-full" />
          <div className="h-0.5 w-4/5 bg-slate-400 rounded-full" />
          <div className="h-0.5 w-3/4 bg-slate-400 rounded-full" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute left-[20%] bottom-[14%] z-10 hidden sm:block w-9 h-12 rounded-sm border border-white/60 bg-white/70 shadow-md backdrop-blur-xs"
        style={{ transform: 'rotate(-22deg)' }}
      >
        <div className="m-1 space-y-1 opacity-40">
          <div className="h-0.5 w-full bg-slate-400 rounded-full" />
          <div className="h-0.5 w-4/5 bg-slate-400 rounded-full" />
          <div className="h-0.5 w-2/3 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};
