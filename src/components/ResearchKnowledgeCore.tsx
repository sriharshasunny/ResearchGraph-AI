import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  FileText,
  Network,
  ArrowRight,
  Quote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Hub locations for real-world academic connections (lat, lng, name)
const HUBS = [
  { lat: 42.36, lng: -71.09, name: 'MIT/Harvard' },
  { lat: 37.43, lng: -122.17, name: 'Stanford' },
  { lat: 51.51, lng: -0.12, name: 'London/Imperial' },
  { lat: 47.37, lng: 8.55, name: 'ETH Zurich' },
  { lat: 35.68, lng: 139.77, name: 'Tokyo' },
  { lat: 1.35, lng: 103.82, name: 'Singapore' },
  { lat: -33.87, lng: 151.21, name: 'Sydney' },
  { lat: 39.90, lng: 116.40, name: 'Tsinghua' },
  { lat: 48.85, lng: 2.35, name: 'Paris/Sorbonne' },
  { lat: 37.77, lng: -122.42, name: 'UC Berkeley' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Generate crisp high-res world map texture with continents & grid
function createCrispEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0a1638');
  bgGrad.addColorStop(0.5, '#0d1f4d');
  bgGrad.addColorStop(1, '#081330');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle coordinate grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  // Latitudes
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  // Longitudes
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Equator emphasis
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Continent vector approximations (high-tech stylized dot clusters)
  ctx.fillStyle = '#22d3ee';
  const drawCluster = (cx: number, cy: number, rx: number, ry: number, density = 450) => {
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random());
      const px = cx + Math.cos(angle) * rx * dist + (Math.random() - 0.5) * 15;
      const py = cy + Math.sin(angle) * ry * dist + (Math.random() - 0.5) * 15;
      const size = 1.2 + Math.random() * 2.2;
      const alpha = 0.35 + Math.random() * 0.55;
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // North America
  drawCluster(520, 320, 190, 110, 600);
  drawCluster(440, 220, 130, 80, 350);
  // South America
  drawCluster(680, 680, 120, 180, 450);
  // Europe
  drawCluster(1060, 280, 110, 80, 500);
  // Africa
  drawCluster(1080, 560, 130, 170, 550);
  // Asia
  drawCluster(1420, 320, 260, 150, 900);
  drawCluster(1360, 480, 120, 100, 400); // India
  // Australia
  drawCluster(1660, 720, 120, 90, 350);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const ResearchKnowledgeCore: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Group | null>(null);

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
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const globe = new THREE.Group();
    globeRef.current = globe;
    scene.add(globe);

    const SPHERE_RADIUS = 2.15;

    // 1. Earth Core Sphere with sharp texture
    const earthTexture = createCrispEarthTexture();
    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64),
      new THREE.MeshBasicMaterial({ map: earthTexture }),
    );
    globe.add(coreMesh);

    // 2. Hub nodes (glowing points on key universities/cities)
    const hubPoints: THREE.Vector3[] = [];
    const hubGeometry = new THREE.BufferGeometry();
    const hubPositions: number[] = [];

    HUBS.forEach(hub => {
      const pos = latLngToVector3(hub.lat, hub.lng, SPHERE_RADIUS * 1.01);
      hubPoints.push(pos);
      hubPositions.push(pos.x, pos.y, pos.z);
    });

    hubGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hubPositions, 3));
    const hubMaterial = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.16,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const hubs = new THREE.Points(hubGeometry, hubMaterial);
    globe.add(hubs);

    // 3. Geodesic Connection Arcs
    const arcPositions: number[] = [];
    const arcColors: number[] = [];
    const colorCyan = new THREE.Color(0x38bdf8);
    const colorBlue = new THREE.Color(0x3b82f6);

    for (let i = 0; i < hubPoints.length; i++) {
      for (let j = i + 1; j < hubPoints.length; j++) {
        const start = hubPoints[i];
        const end = hubPoints[j];
        const distance = start.distanceTo(end);

        if (distance > 1.2 && distance < 3.8) {
          const divisions = 24;
          const mid = start.clone().add(end).multiplyScalar(0.5);
          const altitude = SPHERE_RADIUS + distance * 0.22;
          mid.normalize().multiplyScalar(altitude);

          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const points = curve.getPoints(divisions);

          for (let p = 0; p < points.length - 1; p++) {
            arcPositions.push(points[p].x, points[p].y, points[p].z);
            arcPositions.push(points[p + 1].x, points[p + 1].y, points[p + 1].z);

            const t = p / divisions;
            const c = colorCyan.clone().lerp(colorBlue, t);
            arcColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
          }
        }
      }
    }

    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcPositions, 3));
    arcGeo.setAttribute('color', new THREE.Float32BufferAttribute(arcColors, 3));
    const arcMesh = new THREE.LineSegments(
      arcGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    );
    globe.add(arcMesh);

    // 4. Concentric High-Tech Orbiting Rings with Satellite Beacons
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Orbit Ring 1 (Cyan)
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.05, 0.012, 16, 120),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }),
    );
    ring1.rotation.set(0.65, 0.35, 0.2);
    ringGroup.add(ring1);

    const satellite1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
    );
    ringGroup.add(satellite1);

    // Orbit Ring 2 (Royal Blue / Violet)
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.35, 0.01, 16, 120),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }),
    );
    ring2.rotation.set(-0.75, 0.45, -0.3);
    ringGroup.add(ring2);

    const satellite2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xc084fc }),
    );
    ringGroup.add(satellite2);

    // 5. Crisp Atmospheric Rim Glow
    const rimMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS * 1.015, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
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
            rim = pow(rim, 3.2);
            gl_FragColor = vec4(0.25, 0.65, 1.0, rim * 0.85);
          }
        `,
      }),
    );
    globe.add(rimMesh);

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'absolute inset-0 h-full w-full';
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

    // Interaction (drag to rotate)
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
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

    // Animation Loop
    let frameId = 0;
    let angle1 = 0;
    let angle2 = Math.PI;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globe.rotation.y += 0.0025;
        globe.rotation.x *= 0.96;
      }

      // Orbit satellites along rings
      angle1 += 0.012;
      const r1 = 3.05;
      const p1 = new THREE.Vector3(Math.cos(angle1) * r1, Math.sin(angle1) * r1, 0);
      p1.applyEuler(ring1.rotation);
      satellite1.position.copy(p1);

      angle2 -= 0.009;
      const r2 = 3.35;
      const p2 = new THREE.Vector3(Math.cos(angle2) * r2, Math.sin(angle2) * r2, 0);
      p2.applyEuler(ring2.rotation);
      satellite2.position.copy(p2);

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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else mat.dispose();
        }
      });
      earthTexture.dispose();
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
      className="relative flex h-[350px] sm:h-[370px] lg:h-[390px] w-full items-center justify-center select-none"
      aria-label="Interactive academic knowledge core"
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*          SIMPLE, CLEAN & ELEGANT SURROUNDING ELEMENTS          */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* Top-Left Card: arXiv Survey on Vision Transformers */}
      <div
        onClick={() => handleSearch('A Survey on Vision Transformers')}
        className="group absolute left-[4%] top-[8%] z-20 w-[190px] cursor-pointer rounded-xl border border-white/95 bg-white/95 p-3 shadow-[0_10px_24px_-8px_rgba(30,58,138,0.18)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:left-[6%] sm:w-[205px]"
        style={{ transform: 'rotate(-4deg)' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="font-serif font-black text-xs tracking-tight text-[#B31B1B]">arXiv</span>
          <span className="font-mono text-[9.5px] font-semibold text-slate-400">2024</span>
        </div>
        <h4 className="line-clamp-2 text-[11.5px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-[12px]">
          A Survey on Vision Transformers
        </h4>
        <span className="my-1 block text-[10px] text-slate-500">A. Dosovitskiy et al.</span>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-0.5"><Quote className="h-2.5 w-2.5 text-slate-400" /> 1.2K</span>
            <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5 text-slate-400" /> PDF</span>
          </div>
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs transition group-hover:scale-110">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>

      {/* Top-Right Badge: Knowledge Graph */}
      <button
        type="button"
        onClick={() => setActivePage('graph')}
        className="absolute right-[8%] top-[12%] z-20 inline-flex items-center gap-1.5 rounded-full border border-purple-300/50 bg-[#7C3AED] px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-purple-600/25 transition hover:scale-105 sm:right-[12%]"
      >
        <Network className="h-3 w-3 text-purple-200" />
        <span>Knowledge Graph</span>
      </button>

      {/* Bottom-Left Badge: Research Papers */}
      <button
        type="button"
        onClick={() => setActivePage('search')}
        className="absolute bottom-[14%] left-[10%] z-20 inline-flex items-center gap-1.5 rounded-full border border-blue-300/50 bg-[#1D4ED8] px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-600/25 transition hover:scale-105 sm:left-[14%]"
      >
        <FileText className="h-3 w-3 text-blue-200" />
        <span>Research Papers</span>
      </button>

      {/* Bottom-Right Card: OpenAlex LLMs in Science */}
      <div
        onClick={() => handleSearch('Large Language Models in Scientific Research')}
        className="group absolute bottom-[6%] right-[4%] z-20 w-[190px] cursor-pointer rounded-xl border border-white/95 bg-white/95 p-3 shadow-[0_10px_24px_-8px_rgba(30,58,138,0.18)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:right-[6%] sm:w-[205px]"
        style={{ transform: 'rotate(3deg)' }}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-900" />
            <span className="text-[11px] font-bold text-slate-900">OpenAlex</span>
          </div>
          <span className="font-mono text-[9.5px] font-semibold text-slate-400">2023</span>
        </div>
        <h4 className="line-clamp-2 text-[11.5px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-[12px]">
          Large Language Models in Science
        </h4>
        <span className="my-1 block text-[10px] text-slate-500">T. Brown et al.</span>
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-0.5"><Quote className="h-2.5 w-2.5 text-slate-400" /> 1.1K</span>
            <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5 text-slate-400" /> PDF</span>
          </div>
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs transition group-hover:scale-110">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
