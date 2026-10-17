import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  FileText,
  Network,
  Sparkles,
  Globe2,
  ArrowRight,
  Quote,
} from 'lucide-react';
import { originalHubPoints } from './researchCoreModelData';
import { useApp } from '../context/AppContext';

const MODEL_ORIGIN = { x: 1210, y: 444 };
const MODEL_BOUNDS = { width: 800, height: 580 };
const MODEL_RADIUS = 141;
const SPHERE_RADIUS = 2.4;
const MODEL_ZOOM = 0.98;

export const ResearchKnowledgeCore: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const [modelScale, setModelScale] = useState(0.5);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);
    const globe = new THREE.Group();
    globeRef.current = globe;
    scene.add(globe);

    const uniforms = {
      time: { value: 0 },
      pointScale: { value: 1 },
      tintMix: { value: 0 },
      tint: { value: new THREE.Color(0x2563eb) },
    };

    const textureLoader = new THREE.TextureLoader();
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const coreTexture = textureLoader.load('/research-core/core-texture.webp');
    coreTexture.anisotropy = anisotropy;
    coreTexture.colorSpace = THREE.SRGBColorSpace;
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS, 160, 160),
      new THREE.MeshBasicMaterial({ map: coreTexture }),
    );
    globe.add(core);

    // Geodesic connection arcs
    const hubDirections = originalHubPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
    const edgePositions: number[] = [];
    const edgeColors: number[] = [];
    const edgePalette = [new THREE.Color('#38bdf8'), new THREE.Color('#3b82f6'), new THREE.Color('#8b5cf6')];
    const edgePairs = new Set<string>();
    hubDirections.forEach((direction, nodeIndex) => {
      hubDirections
        .map((candidate, candidateIndex) => ({ candidate, candidateIndex, distance: direction.distanceToSquared(candidate) }))
        .filter(({ candidateIndex }) => candidateIndex !== nodeIndex)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)
        .forEach(({ candidate, candidateIndex }) => {
          const key = [nodeIndex, candidateIndex].sort((a, b) => a - b).join(':');
          if (edgePairs.has(key)) return;
          edgePairs.add(key);
          const start = direction.clone();
          const end = candidate.clone();
          const angle = start.angleTo(end);
          const divisions = 12;
          const color = edgePalette[(nodeIndex + candidateIndex) % edgePalette.length];
          let previous = start.clone().multiplyScalar(SPHERE_RADIUS * 1.012);
          for (let step = 1; step <= divisions; step += 1) {
            const progress = step / divisions;
            const next = start.clone().multiplyScalar(Math.sin((1 - progress) * angle))
              .add(end.clone().multiplyScalar(Math.sin(progress * angle)))
              .divideScalar(Math.sin(angle))
              .multiplyScalar(SPHERE_RADIUS * 1.012);
            edgePositions.push(previous.x, previous.y, previous.z, next.x, next.y, next.z);
            const intensity = 0.55 + 0.25 * (1 - Math.abs(progress - 0.5) * 2);
            edgeColors.push(color.r * intensity, color.g * intensity, color.b * intensity, color.r * intensity, color.g * intensity, color.b * intensity);
            previous = next;
          }
        });
    });

    const networkGeometry = new THREE.BufferGeometry();
    networkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
    networkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(edgeColors, 3));
    const network = new THREE.LineSegments(networkGeometry, new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    network.renderOrder = 3;
    globe.add(network);

    // Glowing Orbital Rings
    const orbitMaterials = [0x38bdf8, 0x60a5fa, 0xa855f7].map(color => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    const orbitTracks = [
      { radius: 3.20, tube: 0.009, rotation: [0.18, 0.22, -0.28] },
      { radius: 3.45, tube: 0.008, rotation: [0.95, 0.35, 0.15] },
      { radius: 3.70, tube: 0.007, rotation: [0.62, -0.68, 0.32] },
    ] as const;
    orbitTracks.forEach((track, index) => {
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(track.radius, track.tube, 4, 160), orbitMaterials[index]);
      orbit.rotation.set(track.rotation[0], track.rotation[1], track.rotation[2]);
      orbit.renderOrder = 1;
      scene.add(orbit);
    });

    // Luminous Atmospheric Rim
    const baseRimColor = new THREE.Color(0xdbeafe);
    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS * 1.004, 96, 96),
      new THREE.ShaderMaterial({
        uniforms: { color: { value: baseRimColor.clone() } },
        transparent: true,
        depthWrite: false,
        vertexShader: 'varying vec3 normalView;void main(){normalView=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: 'varying vec3 normalView;uniform vec3 color;void main(){float rim=pow(1.0-abs(dot(normalView,vec3(0.0,0.0,1.0))),3.0)*0.9;gl_FragColor=vec4(color,rim);}',
      }),
    );
    rim.renderOrder = 6;
    scene.add(rim);

    // Node hub points
    const positions: number[] = [];
    const colors: number[] = [];
    const phases: number[] = [];
    const sizes: number[] = [];
    originalHubPoints.forEach(([x, y, z, color, size], index) => {
      positions.push(x * SPHERE_RADIUS * 1.004, y * SPHERE_RADIUS * 1.004, z * SPHERE_RADIUS * 1.004);
      const nodeColor = new THREE.Color(color);
      colors.push(nodeColor.r, nodeColor.g, nodeColor.b);
      phases.push(index * 1.7);
      sizes.push(size * 0.18);
    });
    const hubsGeometry = new THREE.BufferGeometry();
    hubsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    hubsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    hubsGeometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
    hubsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    const hubs = new THREE.Points(hubsGeometry, new THREE.ShaderMaterial({
      uniforms: { ...uniforms },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 color;attribute float phase,size;uniform float pointScale,time;varying vec3 nodeColor;varying float visibility;void main(){vec3 n=normalize(normalMatrix*normalize(position));visibility=mix(0.16,1.0,smoothstep(-0.2,0.35,n.z));nodeColor=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=size*(1.0+0.12*sin(time*1.6+phase))*pointScale/-mv.z;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: 'varying vec3 nodeColor;varying float visibility;uniform float tintMix;uniform vec3 tint;void main(){float d=length(gl_PointCoord-0.5)*2.0;if(d>1.0)discard;float core=1.0-smoothstep(0.05,0.2,d),ring=(1.0-smoothstep(0.0,0.07,abs(d-0.5)))*0.85,halo=pow(1.0-d,3.0)*0.5;float alpha=(core+ring+halo)*visibility;vec3 color=mix(mix(nodeColor,tint,tintMix),vec3(1.0),core);gl_FragColor=vec4(color,min(alpha,1.0));}',
    }));
    hubs.renderOrder = 4;
    globe.add(hubs);

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'absolute inset-0 h-full w-full';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.prepend(renderer.domElement);

    let frame = 0;
    let elapsed = 0;
    let lastFrameTime = 0;
    let yawVelocity = 0.0016;
    let dragState: { x: number; y: number } | null = null;
    let pointerX = 0;
    let pointerY = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const mousePosition = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    };
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest('button')) return;
      dragState = { x: event.clientX, y: event.clientY };
      host.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      mousePosition(event);
      if (!dragState) return;
      const dx = event.clientX - dragState.x;
      const dy = event.clientY - dragState.y;
      globe.rotation.y += dx * 0.006;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + dy * 0.006, -0.9, 0.9);
      yawVelocity = dx * 0.0045;
      dragState = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = () => { dragState = null; };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      const scale = Math.min(width / MODEL_BOUNDS.width, height / MODEL_BOUNDS.height);
      setModelScale(scale);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(0, 0, SPHERE_RADIUS * (height / 2) / (MODEL_RADIUS * scale * MODEL_ZOOM * Math.tan(Math.PI / 9)));
      camera.updateProjectionMatrix();
      uniforms.pointScale.value = renderer.getPixelRatio() * height / (2 * Math.tan(Math.PI / 9));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointercancel', onPointerUp);

    const animate = (time = performance.now()) => {
      frame = window.requestAnimationFrame(animate);
      const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 16.667, 2) : 1;
      lastFrameTime = time;
      if (!reduceMotion.matches) elapsed += 0.016 * delta;
      uniforms.time.value = elapsed;

      if (!dragState) {
        globe.rotation.y += yawVelocity * delta;
        yawVelocity += ((reduceMotion.matches ? 0 : 0.0016) - yawVelocity) * (1 - Math.pow(0.97, delta));
        globe.rotation.x += (0 - globe.rotation.x) * (1 - Math.pow(0.99, delta));
      }

      scene.rotation.y = pointerX * 0.04;
      scene.rotation.x = pointerY * 0.02;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
      orbitMaterials.forEach(material => material.dispose());
      coreTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      globeRef.current = null;
    };
  }, []);

  const offset = (coordinate: number, axis: 'x' | 'y') =>
    `calc(50% + ${(coordinate - MODEL_ORIGIN[axis]) * modelScale}px)`;
  const scale = Math.max(0.72, Math.min(modelScale, 1));

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setActivePage('search');
  };

  return (
    <div ref={hostRef} className="relative h-[480px] sm:h-[520px] lg:h-[560px] w-full touch-pan-y select-none" aria-label="Interactive research knowledge globe">
      
      {/* Ambient Radial Blue Backglow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28)_0%,rgba(147,51,234,0.15)_45%,transparent_70%)] blur-2xl" aria-hidden="true" />

      {/* Floating 3D Background Document Sheet (Top Right) */}
      <div 
        className="pointer-events-none absolute hidden xl:block rounded-xl bg-white/70 border border-white/80 p-3 shadow-md backdrop-blur-xs opacity-75"
        style={{
          left: offset(1430, 'x'),
          top: offset(210, 'y'),
          width: `${85 * scale}px`,
          height: `${110 * scale}px`,
          transform: 'translate(-50%, -50%) rotate(15deg)',
        }}
      >
        <div className="space-y-1.5 opacity-40">
          <div className="h-1.5 w-12 bg-slate-400 rounded-full"></div>
          <div className="h-1 w-full bg-slate-300 rounded-full"></div>
          <div className="h-1 w-full bg-slate-300 rounded-full"></div>
          <div className="h-1 w-10 bg-slate-300 rounded-full"></div>
        </div>
      </div>

      {/* Floating 3D Background Document Sheet (Bottom Right) */}
      <div 
        className="pointer-events-none absolute hidden xl:block rounded-xl bg-white/70 border border-white/80 p-3 shadow-md backdrop-blur-xs opacity-70"
        style={{
          left: offset(1470, 'x'),
          top: offset(460, 'y'),
          width: `${80 * scale}px`,
          height: `${100 * scale}px`,
          transform: 'translate(-50%, -50%) rotate(-14deg)',
        }}
      >
        <div className="space-y-1.5 opacity-40">
          <div className="h-1.5 w-10 bg-slate-400 rounded-full"></div>
          <div className="h-1 w-full bg-slate-300 rounded-full"></div>
          <div className="h-1 w-8 bg-slate-300 rounded-full"></div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/*               4 REALISTIC FLOATING PAPER CARDS                */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* Card 1: Top-Left arXiv 2024 - Survey on Vision Transformers */}
      <div
        onClick={() => handleSearch('A Survey on Vision Transformers')}
        className="absolute z-20 cursor-pointer rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-[0_15px_35px_-10px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
        style={{
          left: offset(980, 'x'),
          top: offset(290, 'y'),
          width: `${210 * scale}px`,
          transform: 'translate(-50%, -50%) rotate(-6deg)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-serif font-black text-sm text-[#B31B1B] tracking-tight">arXiv</span>
          <span className="font-mono text-[10px] font-semibold text-slate-400">2024</span>
        </div>
        <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: `${12 * scale}px` }}>
          A Survey on Vision Transformers
        </h4>
        <span className="block text-slate-500 font-medium my-1.5" style={{ fontSize: `${10 * scale}px` }}>
          A. Dosovitskiy et al.
        </span>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600" style={{ fontSize: `${10.5 * scale}px` }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Quote className="w-3 h-3 text-slate-400" /> 1.2K
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <FileText className="w-3 h-3 text-slate-400" /> PDF
            </span>
          </div>
          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Card 2: Bottom-Left arXiv 2024 - Self-Supervised Learning for Medical Image Analysis */}
      <div
        onClick={() => handleSearch('Self-Supervised Learning for Medical Image Analysis')}
        className="absolute z-20 cursor-pointer rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-[0_15px_35px_-10px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
        style={{
          left: offset(1005, 'x'),
          top: offset(560, 'y'),
          width: `${215 * scale}px`,
          transform: 'translate(-50%, -50%) rotate(-4deg)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-serif font-black text-sm text-[#B31B1B] tracking-tight">arXiv</span>
          <span className="font-mono text-[10px] font-semibold text-slate-400">2024</span>
        </div>
        <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: `${12 * scale}px` }}>
          Self-Supervised Learning for Medical Image Analysis
        </h4>
        <span className="block text-slate-500 font-medium my-1.5" style={{ fontSize: `${10 * scale}px` }}>
          J. Chen et al.
        </span>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600" style={{ fontSize: `${10.5 * scale}px` }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Quote className="w-3 h-3 text-slate-400" /> 642
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <FileText className="w-3 h-3 text-slate-400" /> PDF
            </span>
          </div>
          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Card 3: Top-Right OpenAlex 2023 - Graph Neural Networks for Social Recommendation */}
      <div
        onClick={() => handleSearch('Graph Neural Networks for Social Recommendation')}
        className="absolute z-20 cursor-pointer rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-[0_15px_35px_-10px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
        style={{
          left: offset(1440, 'x'),
          top: offset(310, 'y'),
          width: `${215 * scale}px`,
          transform: 'translate(-50%, -50%) rotate(5deg)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
            <span className="font-bold text-xs text-slate-900">OpenAlex</span>
          </div>
          <span className="font-mono text-[10px] font-semibold text-slate-400">2023</span>
        </div>
        <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: `${12 * scale}px` }}>
          Graph Neural Networks for Social Recommendation
        </h4>
        <span className="block text-slate-500 font-medium my-1.5" style={{ fontSize: `${10 * scale}px` }}>
          Y. Wu et al.
        </span>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600" style={{ fontSize: `${10.5 * scale}px` }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Quote className="w-3 h-3 text-slate-400" /> 856
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <FileText className="w-3 h-3 text-slate-400" /> PDF
            </span>
          </div>
          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Card 4: Bottom-Right OpenAlex 2023 - Large Language Models in Scientific Research */}
      <div
        onClick={() => handleSearch('Large Language Models in Scientific Research')}
        className="absolute z-20 cursor-pointer rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-[0_15px_35px_-10px_rgba(30,58,138,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
        style={{
          left: offset(1435, 'x'),
          top: offset(575, 'y'),
          width: `${215 * scale}px`,
          transform: 'translate(-50%, -50%) rotate(4deg)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
            <span className="font-bold text-xs text-slate-900">OpenAlex</span>
          </div>
          <span className="font-mono text-[10px] font-semibold text-slate-400">2023</span>
        </div>
        <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: `${12 * scale}px` }}>
          Large Language Models in Scientific Research
        </h4>
        <span className="block text-slate-500 font-medium my-1.5" style={{ fontSize: `${10 * scale}px` }}>
          T. Brown et al.
        </span>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600" style={{ fontSize: `${10.5 * scale}px` }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Quote className="w-3 h-3 text-slate-400" /> 1.1K
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <FileText className="w-3 h-3 text-slate-400" /> PDF
            </span>
          </div>
          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/*               4 FLOATING CATEGORY BADGES / PILLS              */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* Top: Knowledge Graph (Purple) */}
      <button
        type="button"
        onClick={() => setActivePage('graph')}
        className="absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-purple-400/40 bg-[#7C3AED] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-600/35 transition hover:scale-105"
        style={{
          left: offset(1245, 'x'),
          top: offset(248, 'y'),
          fontSize: `${12 * scale}px`,
        }}
      >
        <Network className="w-3.5 h-3.5 text-purple-200" />
        <span>Knowledge Graph</span>
      </button>

      {/* Left: Research Papers (Royal Blue) */}
      <button
        type="button"
        onClick={() => setActivePage('search')}
        className="absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-blue-400/40 bg-[#1D4ED8] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/35 transition hover:scale-105"
        style={{
          left: offset(1075, 'x'),
          top: offset(434, 'y'),
          fontSize: `${12 * scale}px`,
        }}
      >
        <FileText className="w-3.5 h-3.5 text-blue-200" />
        <span>Research Papers</span>
      </button>

      {/* Right: AI Insights (Emerald Green) */}
      <button
        type="button"
        onClick={() => setActivePage('chat')}
        className="absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-emerald-400/40 bg-[#059669] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/35 transition hover:scale-105"
        style={{
          left: offset(1370, 'x'),
          top: offset(454, 'y'),
          fontSize: `${12 * scale}px`,
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
        <span>AI Insights</span>
      </button>

      {/* Bottom: Global Connections (Blue) */}
      <button
        type="button"
        onClick={() => setActivePage('graph')}
        className="absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-blue-400/40 bg-[#1E40AF] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-800/35 transition hover:scale-105"
        style={{
          left: offset(1235, 'x'),
          top: offset(640, 'y'),
          fontSize: `${12 * scale}px`,
        }}
      >
        <Globe2 className="w-3.5 h-3.5 text-blue-200" />
        <span>Global Connections</span>
      </button>

    </div>
  );
};
