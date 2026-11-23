import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { GLOBE_RAW_BASE64 } from './researchGraphGlobeRaw';
import type { PageType } from '../types';
import {
  Network,
  Sparkles,
  Layers,
  Link2,
  FileText,
  Users,
  Database,
  RotateCcw
} from 'lucide-react';

interface ResearchKnowledgeCoreProps {
  onNavigate?: (target: string) => void;
}

export const ResearchKnowledgeCore: React.FC<ResearchKnowledgeCoreProps> = ({ onNavigate }) => {
  const { setActivePage, setSearchQuery } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleAction = useCallback((page: string) => {
    if (onNavigate) onNavigate(page);
    else setActivePage(page as PageType);
  }, [onNavigate, setActivePage]);

  const handleSearch = useCallback((term: string) => {
    if (onNavigate) onNavigate(term);
    else {
      setSearchQuery(term);
      setActivePage('search');
    }
  }, [onNavigate, setSearchQuery, setActivePage]);

  // 7 HUD Navigation Pills — arranged in dedicated non-overlapping zones
  // Left column (3), Right column (3), Bottom center (1)
  // Anchor points (ap) are on the 3D globe surface and rotate with user interaction
  const pillDefs = [
    // LEFT SIDE (top to bottom)
    {
      id: 'papers',
      name: 'Research Papers',
      tag: '204M+',
      color: '#38bdf8',
      icon: FileText,
      action: () => handleAction('search'),
      side: 'left',
      slotY: 0.24, // 24% from top
      ap: new THREE.Vector3(-0.95, 0.45, 0.65)
    },
    {
      id: 'authors',
      name: 'Authors',
      tag: '12.4M+',
      color: '#14b8a6',
      icon: Users,
      action: () => handleSearch('Research authors'),
      side: 'left',
      slotY: 0.50, // 50% from top
      ap: new THREE.Vector3(-1.15, 0.05, 0.55)
    },
    {
      id: 'datasets',
      name: 'Datasets',
      tag: '85K+',
      color: '#f59e0b',
      icon: Database,
      action: () => handleSearch('Empirical datasets'),
      side: 'left',
      slotY: 0.76, // 76% from top
      ap: new THREE.Vector3(-0.85, -0.45, 0.70)
    },

    // RIGHT SIDE (top to bottom)
    {
      id: 'graph',
      name: 'Knowledge Graph',
      tag: 'AI-Core',
      color: '#10b981',
      icon: Network,
      action: () => handleAction('graph'),
      side: 'right',
      slotY: 0.24, // 24% from top
      ap: new THREE.Vector3(0.95, 0.45, 0.65)
    },
    {
      id: 'insights',
      name: 'AI Insights',
      tag: 'Consensus',
      color: '#a855f7',
      icon: Sparkles,
      action: () => handleAction('chat'),
      side: 'right',
      slotY: 0.50, // 50% from top
      ap: new THREE.Vector3(1.15, 0.05, 0.55)
    },
    {
      id: 'concepts',
      name: 'Concepts',
      tag: '1.8M+',
      color: '#818cf8',
      icon: Layers,
      action: () => handleSearch('Ontological concepts'),
      side: 'right',
      slotY: 0.76, // 76% from top
      ap: new THREE.Vector3(0.85, -0.45, 0.70)
    },

    // BOTTOM CENTER
    {
      id: 'citations',
      name: 'Citations',
      tag: '1.24B+',
      color: '#ec4899',
      icon: Link2,
      action: () => handleAction('graph'),
      side: 'center',
      slotY: 0.94, // 94% from top
      ap: new THREE.Vector3(0.0, -1.05, 0.55)
    }
  ];

  const [pillPositions, setPillPositions] = useState<Record<string, { x: number; y: number; ax: number; ay: number }>>({});
  const [ufoScreenPos, setUfoScreenPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let W = container.clientWidth || 640;
    let H = container.clientHeight || 450;

    // ── WebGL Renderer with full alpha transparency (blends into background image) ──
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 0.12, 5.4);
    camera.lookAt(0, 0, 0);

    // ── Lighting: Natural Sunlight from upper-left matching background image ──
    const sunDir = new THREE.Vector3(-0.62, 0.45, 0.64).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sunLight.position.copy(sunDir).multiplyScalar(20);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xd0e2ff, 0.52);
    scene.add(ambientLight);

    const spaceBackLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    spaceBackLight.position.set(4, -2, -6);
    scene.add(spaceBackLight);

    // Helper functions for canvas textures
    const mkc = (w: number, h: number) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      return c;
    };
    const tex = (c: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(c);
      t.anisotropy = 4;
      return t;
    };

    // Shared glow & ring textures (exact from landing page)
    const glowT = (() => {
      const c = mkc(128, 128), x = c.getContext('2d')!;
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
      return tex(c);
    })();

    const spr = (map: THREE.Texture, col: number, sc: number, op: number, par?: THREE.Object3D) => {
      const m = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map,
          color: col,
          transparent: true,
          opacity: op,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
      );
      m.scale.set(sc, sc, 1);
      (par || scene).add(m);
      return m;
    };

    // ─────────────────────────────────────────────────────────────
    // 1. REALISTIC EARTH WITH CYBER TOUCH
    // ─────────────────────────────────────────────────────────────
    const MW = 1440, MH = 720;
    const raw = atob(GLOBE_RAW_BASE64);
    const land = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) {
      land[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    }
    const isLand = (la: number, lo: number) => {
      const u = (Math.floor((lo + 180) / 360 * MW) % MW + MW) % MW;
      const v = Math.min(MH - 1, Math.max(0, Math.floor((90 - la) / 180 * MH)));
      return land[v * MW + u];
    };

    // High fidelity Day Satellite Texture
    const dayTex = (() => {
      const c = mkc(1024, 512), ctx = c.getContext('2d')!;
      const img = ctx.createImageData(1024, 512), d = img.data;
      for (let j = 0; j < 512; j++) {
        const lat = 90 - (j / 512) * 180, absLat = Math.abs(lat);
        for (let i = 0; i < 1024; i++) {
          const lon = (i / 1024) * 360 - 180;
          const idx = (j * 1024 + i) * 4;
          const l = isLand(lat, lon);
          if (l) {
            if (absLat > 64) {
              // Polar Ice (Greenland/Antarctica)
              d[idx] = 232; d[idx + 1] = 242; d[idx + 2] = 252;
            } else if (lat > 15 && lat < 34 && lon > -15 && lon < 55) {
              // Sahara & Arabian Sands
              d[idx] = 172; d[idx + 1] = 142; d[idx + 2] = 92;
            } else if (lat < -18 && lat > -32 && lon > 115 && lon < 145) {
              // Australian Red Earth
              d[idx] = 178; d[idx + 1] = 108; d[idx + 2] = 68;
            } else {
              // Forest & Temperate
              const v = (Math.sin(lat * 0.15) * Math.cos(lon * 0.15) + 1) * 0.5;
              d[idx] = Math.floor(46 + v * 32);
              d[idx + 1] = Math.floor(96 + v * 36);
              d[idx + 2] = Math.floor(54 + v * 20);
            }
          } else {
            // Realistic Deep Navy Ocean
            const depth = absLat / 90;
            d[idx] = Math.floor(12 + depth * 8);
            d[idx + 1] = Math.floor(30 + depth * 16);
            d[idx + 2] = Math.floor(62 + depth * 22);
          }
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      return tex(c);
    })();

    // Night Lights Texture
    const nightTex = (() => {
      const c = mkc(1024, 512), ctx = c.getContext('2d')!;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 512);
      ctx.fillStyle = 'rgba(255, 215, 115, 0.95)';
      for (let j = 0; j < 512; j += 2) {
        const lat = 90 - (j / 512) * 180;
        if (Math.abs(lat) > 65) continue;
        for (let i = 0; i < 1024; i += 2) {
          const lon = (i / 1024) * 360 - 180;
          if (isLand(lat, lon)) {
            const isPop = (
              (lat > 22 && lat < 55 && lon > -125 && lon < -68) ||
              (lat > 35 && lat < 60 && lon > -10 && lon < 45) ||
              (lat > 15 && lat < 45 && lon > 70 && lon < 142) ||
              (lat > -35 && lat < -10 && lon > -60 && lon < -35)
            );
            if (Math.random() < (isPop ? 0.38 : 0.05)) {
              ctx.fillRect(i, j, Math.random() < 0.25 ? 2 : 1.1, 1.1);
            }
          }
        }
      }
      return tex(c);
    })();

    // Ocean Specular Texture
    const specTex = (() => {
      const c = mkc(512, 256), ctx = c.getContext('2d')!;
      const img = ctx.createImageData(512, 256), d = img.data;
      for (let j = 0; j < 256; j++) {
        const lat = 90 - (j / 256) * 180;
        for (let i = 0; i < 512; i++) {
          const lon = (i / 512) * 360 - 180;
          const idx = (j * 512 + i) * 4;
          const val = isLand(lat, lon) ? 0 : 255;
          d[idx] = d[idx + 1] = d[idx + 2] = val;
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      return tex(c);
    })();

    // Natural Cloud Texture
    const cloudTex = (() => {
      const c = mkc(512, 256), ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 256);
      for (let k = 0; k < 90; k++) {
        const x = Math.random() * 512, y = 30 + Math.random() * 196;
        const rx = 18 + Math.random() * 45, ry = 6 + Math.random() * 14;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
        g.addColorStop(0, 'rgba(255,255,255,0.44)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.16)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * 0.3 - 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      return tex(c);
    })();

    // Master Globe Container
    const masterGlobe = new THREE.Group();
    scene.add(masterGlobe);

    const spinGroup = new THREE.Group();
    masterGlobe.add(spinGroup);

    const GLOBE_R = 1.25;

    // Earth Shader with photorealistic limb scattering
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayT: { value: dayTex },
        nightT: { value: nightTex },
        specT: { value: specTex },
        sun: { value: sunDir }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayT;
        uniform sampler2D nightT;
        uniform sampler2D specT;
        uniform vec3 sun;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(-vPos);
          float nd = dot(N, sun);
          float lit = smoothstep(-0.15, 0.20, nd);
          vec3 day = texture2D(dayT, vUv).rgb;
          vec3 night = texture2D(nightT, vUv).rgb;
          float spec = texture2D(specT, vUv).r;

          // Day sunlight diffuse + night city clusters
          vec3 col = day * (0.12 + 1.15 * max(0.0, nd)) * mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.98, 0.92), lit);
          col += night * (1.0 - lit) * 1.6;

          // Sharp specular reflection on oceans
          vec3 H = normalize(sun + V);
          col += vec3(1.0, 0.98, 0.92) * pow(max(dot(N, H), 0.0), 240.0) * spec * 0.72 * step(0.0, nd);

          // Thin, realistic Rayleigh limb scattering on lit horizon
          float limb = pow(1.0 - max(dot(N, V), 0.0), 3.8);
          col += vec3(0.20, 0.52, 0.90) * limb * smoothstep(-0.2, 0.4, nd) * 0.45;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 72, 56), earthMat);
    spinGroup.add(earthMesh);

    // Dynamic Clouds Mesh
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R * 1.012, 72, 56),
      new THREE.MeshLambertMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    spinGroup.add(cloudsMesh);

    // Sharp BackSide Rayleigh Atmosphere Ring (exact from landing page atmoMat)
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: { sun: { value: sunDir } },
      vertexShader: `
        varying vec3 vn, wn;
        void main() {
          vn = normalize(normalMatrix * normal);
          wn = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sun;
        varying vec3 vn, wn;
        void main() {
          float d = clamp(-vn.z / 0.5, 0.0, 1.0);
          float i = pow(d, 2.2);
          gl_FragColor = vec4(vec3(0.25, 0.55, 0.95) * i * (0.35 + 1.1 * smoothstep(-0.4, 0.5, dot(wn, sun))), 1.0);
        }
      `
    });
    const atmoMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R * 1.10, 64, 48), atmoMat);
    masterGlobe.add(atmoMesh);

    // ── CYBER TOUCH: Global Research Node Network & Citation Arcs ──
    const D2R = Math.PI / 180;
    const llToV3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * D2R;
      const th = (lon + 180) * D2R;
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(th)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(th)
      );
    };

    // Major global research institution clusters
    const CITIES = [
      [42.36, -71.09], // Boston (MIT/Harvard)
      [37.42, -122.17], // Stanford/SF
      [51.50, -0.12],  // London (Imperial/UCL)
      [52.20, 0.12],   // Cambridge
      [47.37, 8.54],   // ETH Zurich
      [48.85, 2.35],   // Paris (Sorbonne)
      [35.68, 139.76], // Tokyo
      [1.35, 103.82],  // Singapore (NUS)
      [39.90, 116.40], // Beijing (Tsinghua)
      [-33.86, 151.21],// Sydney
      [40.71, -74.00], // New York (Columbia/NYU)
      [34.05, -118.24],// Los Angeles (Caltech/UCLA)
      [55.75, 37.61],  // Moscow
      [19.07, 72.87],  // Mumbai (IIT)
      [12.97, 77.59],  // Bengaluru (IISc)
      [22.31, 114.16], // Hong Kong (HKU)
      [-23.55, -46.63],// Sao Paulo
      [-37.81, 144.96] // Melbourne
    ];

    const researchNodes: THREE.Vector3[] = CITIES.map(c => llToV3(c[0], c[1], GLOBE_R));

    // Glowing Research Hub Beacons on Earth
    researchNodes.forEach((pos, i) => {
      const nodeSprite = spr(glowT, i % 3 === 0 ? 0x67e8f9 : 0xffd36a, 0.05, 0.9, spinGroup);
      nodeSprite.position.copy(pos).multiplyScalar(1.012);
    });

    // Dynamic Citation Arcs connecting research hubs
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const photonBeads: THREE.Mesh[] = [];

    const cityPairs = [
      [0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [4, 5],
      [2, 6], [6, 7], [7, 8], [7, 9], [1, 11], [0, 10],
      [2, 13], [7, 14], [8, 15], [0, 16], [9, 17]
    ];

    cityPairs.forEach(([iA, iB]) => {
      const pA = researchNodes[iA];
      const pB = researchNodes[iB];
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const dist = pA.distanceTo(pB);
      mid.normalize().multiplyScalar(GLOBE_R * (1.06 + dist * 0.12));

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      arcCurves.push(curve);

      const pts = curve.getPoints(20);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      spinGroup.add(new THREE.Line(arcGeo, arcMat));

      // Animated traveling photon bead
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      spinGroup.add(bead);
      photonBeads.push(bead);
    });

    // Cyber Meridian Hologram Ring
    const ringGeo = new THREE.RingGeometry(GLOBE_R * 1.15, GLOBE_R * 1.155, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const meridianRing = new THREE.Mesh(ringGeo, ringMat);
    meridianRing.rotation.x = Math.PI / 2;
    spinGroup.add(meridianRing);

    // ─────────────────────────────────────────────────────────────
    // 2. REPLICATED HIGH-FIDELITY BIRD FROM LANDING PAGE
    // ─────────────────────────────────────────────────────────────
    // Feather Texture generator (exact from landing page featherTex)
    const featherTex = (base: string, tip: string, frac: number) => {
      const c = mkc(64, 256), x = c.getContext('2d')!;
      x.beginPath();
      x.moveTo(30, 256);
      x.bezierCurveTo(2, 200, 4, 60, 32, 2);
      x.bezierCurveTo(60, 60, 62, 200, 34, 256);
      x.closePath();
      const g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, tip);
      g.addColorStop(frac, tip);
      g.addColorStop(Math.min(1, frac + 0.04), base);
      g.addColorStop(1, base);
      x.fillStyle = g;
      x.fill();
      x.save();
      x.clip();
      x.strokeStyle = 'rgba(20,30,50,0.3)';
      x.lineWidth = 1;
      for (let i = 0; i < 72; i++) {
        const y = 4 + i * 3.6;
        x.beginPath(); x.moveTo(32, y); x.lineTo(2, y - 24);
        x.moveTo(32, y); x.lineTo(62, y - 24);
        x.stroke();
      }
      x.restore();
      x.strokeStyle = 'rgba(255,255,255,0.5)';
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(32, 256); x.lineTo(32, 6); x.stroke();
      return tex(c);
    };

    const fmat = (t: THREE.Texture) => new THREE.MeshStandardMaterial({
      map: t, color: 0xd8dce4, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.85, metalness: 0
    });
    const mPrim = fmat(featherTex('#262c3d', '#f4f6fa', 0.12));
    const mSec = fmat(featherTex('#a9b4c6', '#f0f3f8', 0.07));
    const mCov = fmat(featherTex('#c4cdda', '#e4e9f0', 0.05));
    const mWht = fmat(featherTex('#f6f8fb', '#ffffff', 0.02));

    const fGeo = (w: number, L: number, cam: number) => {
      const g = new THREE.PlaneGeometry(w, L, 1, 4);
      g.translate(0, L / 2, 0);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const t = p.getY(i) / L;
        p.setZ(i, -cam * t * t);
      }
      g.rotateZ(-Math.PI / 2);
      g.rotateX(-Math.PI / 2);
      g.computeVertexNormals();
      return g;
    };

    const addF = (par: THREE.Group, mat: THREE.Material, w: number, L: number, cam: number, x: number, y: number, z: number, psi: number, flex: number) => {
      const pv = new THREE.Group();
      pv.position.set(x, y, z);
      pv.rotation.set(0, psi, flex);
      pv.add(new THREE.Mesh(fGeo(w, L, cam), mat));
      par.add(pv);
      return pv;
    };

    const mkWing = (s: number) => {
      const sh = new THREE.Group(), mir = new THREE.Group(), hand = new THREE.Group();
      mir.scale.x = s;
      sh.add(mir);
      hand.position.set(0.5, 0, 0);
      mir.add(hand);

      const arm = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mCov);
      arm.scale.set(0.30, 0.04, 0.11);
      arm.position.set(0.26, 0.012, 0.03);
      mir.add(arm);

      const fan: Array<{ pv: THREE.Group; psi: number; k: number }> = [];
      for (let i = 0; i < 10; i++) {
        const x = 0.46 - i * 0.047;
        addF(mir, mSec, 0.08, 0.5 - 0.012 * i, 0.04, x, 0, -0.02, 1.28 + i * 0.012, 0);
        addF(mir, mCov, 0.075, 0.22, 0.03, x + 0.01, 0.007, 0.05, 1.24 + i * 0.012, 0);
      }
      for (let i = 0; i < 3; i++) addF(mir, mWht, 0.08, 0.34 - 0.02 * i, 0.03, 0.03 + i * 0.03, 0.004, -0.01, 1.4, 0);
      for (let i = 0; i < 8; i++) addF(mir, mCov, 0.06, 0.13, 0.02, 0.06 + i * 0.05, 0.012, 0.085, 1.15 + i * 0.015, 0);
      for (let i = 0; i < 3; i++) addF(mir, mSec, 0.07, 0.28, 0.03, 0.015 + i * 0.025, 0.008, 0.03, 1.45, 0);

      for (let i = 0; i < 10; i++) {
        const psi = THREE.MathUtils.lerp(1.0, 0.12, i / 9);
        fan.push({ pv: addF(hand, i < 3 ? mSec : mPrim, 0.06, 0.44 + 0.025 * i, 0.03, i * 0.01, -0.002, 0, psi, 0), psi, k: i / 9 });
        if (i < 7) {
          fan.push({ pv: addF(hand, mCov, 0.06, 0.2, 0.03, i * 0.012, 0.007, 0.03, THREE.MathUtils.lerp(1.0, 0.12, (i + 2) / 9), 0), psi: THREE.MathUtils.lerp(1.0, 0.12, (i + 2) / 9), k: (i + 2) / 9 });
        }
      }
      addF(hand, mPrim, 0.03, 0.11, 0.01, 0, 0.006, 0.05, 0.02, 0.2);
      return { sh, hand, s, fan };
    };

    // Construct Bird Hierarchy
    const birdRoot = new THREE.Group();
    const birdBodyGroup = new THREE.Group();
    birdRoot.add(birdBodyGroup);

    const prof = [
      [0, -0.62], [0.03, -0.58], [0.08, -0.45], [0.13, -0.25],
      [0.16, -0.02], [0.155, 0.15], [0.125, 0.30], [0.08, 0.38], [0, 0.40]
    ].map(q => new THREE.Vector2(q[0], q[1]));
    const bgm = new THREE.LatheGeometry(prof, 28);
    bgm.scale(1, 1, 0.92);
    bgm.rotateX(Math.PI / 2);

    const nr = bgm.attributes.normal;
    const cols: number[] = [];
    for (let i = 0; i < nr.count; i++) {
      const k = THREE.MathUtils.smoothstep(0.1, 0.7, nr.getY(i));
      cols.push(
        THREE.MathUtils.lerp(0.9, 0.5, k),
        THREE.MathUtils.lerp(0.92, 0.56, k),
        THREE.MathUtils.lerp(0.96, 0.66, k)
      );
    }
    bgm.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    birdBodyGroup.add(new THREE.Mesh(bgm, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0 })));

    // Bird Head
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshStandardMaterial({ color: 0xdde2ea, roughness: 0.8 }));
    hd.scale.set(1, 1, 1.25);
    hd.position.set(0, 0.04, 0.47);
    birdBodyGroup.add(hd);

    // Beak
    const mB = new THREE.MeshStandardMaterial({ color: 0xf0b020, roughness: 0.5, emissive: 0x503000, emissiveIntensity: 0.4 });
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.2, 14).rotateX(Math.PI / 2), mB);
    bk.position.set(0, 0.01, 0.66);
    birdBodyGroup.add(bk);

    // Nostril/mouth slit & eyes
    [-1, 1].forEach(s => {
      const ring = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf08a20 }));
      ring.position.set(s * 0.075, 0.065, 0.52);
      birdBodyGroup.add(ring);
      const ey = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.2 }));
      ey.position.set(s * 0.085, 0.067, 0.525);
      birdBodyGroup.add(ey);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(s * 0.098, 0.074, 0.532);
      birdBodyGroup.add(hl);
    });

    // Tail Feathers
    for (let k = -5; k <= 5; k++) {
      addF(birdBodyGroup, mWht, 0.085, 0.42 - Math.abs(k) * 0.012, 0.02, 0, 0, -0.55, Math.PI / 2 + k * 0.075, k % 2 ? 0.05 : -0.02);
    }

    const wl = mkWing(1), wr = mkWing(-1);
    wl.sh.position.set(0.13, 0.075, 0.12);
    wr.sh.position.set(-0.13, 0.075, 0.12);
    birdBodyGroup.add(wl.sh, wr.sh);

    // SCALE: Small sleek size so it roams properly and looks proportionate around globe
    birdRoot.scale.setScalar(0.18);
    scene.add(birdRoot);

    // ─────────────────────────────────────────────────────────────
    // 3. REPLICATED HIGH-FIDELITY UFO FROM LANDING PAGE
    // ─────────────────────────────────────────────────────────────
    // UFO Textures
    const PT = (() => {
      const c = mkc(512, 64), x = c.getContext('2d')!;
      x.fillStyle = '#808080'; x.fillRect(0, 0, 512, 64);
      x.strokeStyle = '#303030'; x.lineWidth = 2;
      for (let i = 0; i <= 16; i++) {
        x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, 64); x.stroke();
      }
      const t = tex(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 2);
      return t;
    })();

    const HT = (() => {
      const c = mkc(512, 128), x = c.getContext('2d')!;
      const g = x.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, '#8e9bb4'); g.addColorStop(0.5, '#c3ccdc'); g.addColorStop(1, '#7f8aa2');
      x.fillStyle = g; x.fillRect(0, 0, 512, 128);
      for (let i = 0; i < 16; i++) {
        if (i % 3 === 0) { x.fillStyle = 'rgba(40,60,100,0.18)'; x.fillRect(i * 32, 0, 32, 128); }
        x.fillStyle = 'rgba(20,30,50,0.5)'; x.fillRect(i * 32, 0, 1.5, 128);
      }
      const t = tex(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    })();

    const WT = (() => {
      const c = mkc(512, 32), x = c.getContext('2d')!;
      x.fillStyle = '#000'; x.fillRect(0, 0, 512, 32);
      for (let i = 0; i < 32; i++) {
        x.fillStyle = i % 5 === 0 ? '#ffc86a' : '#8fe8ff';
        x.fillRect(i * 16 + 3, 10, 10, 12);
      }
      const t = tex(c);
      t.wrapS = THREE.RepeatWrapping;
      return t;
    })();

    const ufoRoot = new THREE.Group();
    const ufoModel = new THREE.Group();
    ufoRoot.add(ufoModel);

    const hullMat = new THREE.MeshStandardMaterial({
      map: HT, color: 0xe6ecf6, metalness: 0.72, roughness: 0.3, bumpMap: PT, bumpScale: 0.5, side: THREE.DoubleSide
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a3042, metalness: 0.9, roughness: 0.4 });
    const gmMat = (c: number) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });

    // Multi-segment sculpted saucer hull
    const ufoHullGeo = new THREE.LatheGeometry([
      [0, -0.45], [0.34, -0.43], [0.5, -0.37], [0.9, -0.3], [1.3, -0.19],
      [1.55, -0.09], [1.66, 0], [1.55, 0.08], [1.3, 0.15], [0.95, 0.22],
      [0.7, 0.29], [0.52, 0.33], [0, 0.34]
    ].map(q => new THREE.Vector2(q[0], q[1])), 96);
    ufoModel.add(new THREE.Mesh(ufoHullGeo, hullMat));

    // Emissive cyber window band
    const ufoBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.67, 1.67, 0.13, 64, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x10151f, emissive: 0xffffff, emissiveMap: WT, emissiveIntensity: 1.6, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide
      })
    );
    ufoModel.add(ufoBand);

    // Collar & cyan rim accents
    const ufoCollar = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.045, 12, 64), darkMat);
    ufoCollar.rotation.x = Math.PI / 2;
    ufoCollar.position.y = 0.3;
    ufoModel.add(ufoCollar);

    const ufoAcc = new THREE.Mesh(new THREE.TorusGeometry(1.64, 0.018, 8, 128), gmMat(0x66e8ff));
    ufoAcc.rotation.x = Math.PI / 2;
    ufoAcc.position.y = 0.075;
    ufoModel.add(ufoAcc);

    // 10 Perimeter vent fins with cyan slits
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.07), darkMat);
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.025), gmMat(0x66e8ff));
      v.position.set(Math.cos(a) * 1.12, 0.2, Math.sin(a) * 1.12);
      v.rotation.y = -a;
      s.position.set(Math.cos(a) * 1.12, 0.218, Math.sin(a) * 1.12);
      s.rotation.y = -a;
      ufoModel.add(v, s);
    }

    // Physical Glass Bubble Dome
    const ufoDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.64, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x9fd8ff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.45, clearcoat: 1, emissive: 0x0a3a66, emissiveIntensity: 0.5, side: THREE.DoubleSide
      })
    );
    ufoDome.position.y = 0.3;
    ufoDome.scale.y = 0.85;
    ufoModel.add(ufoDome);

    // Alien Pilot inside Dome
    const alienMat = new THREE.MeshStandardMaterial({ color: 0x6f8a78, roughness: 0.6 });
    const alienHead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), alienMat);
    alienHead.scale.set(1, 1.35, 1);
    alienHead.position.set(0, 0.62, 0);
    ufoModel.add(alienHead);

    const alienBody = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 12), alienMat);
    alienBody.position.set(0, 0.42, 0);
    ufoModel.add(alienBody);

    [-1, 1].forEach(s => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), gmMat(0x000000));
      eye.position.set(s * 0.035, 0.64, 0.06);
      ufoModel.add(eye);
    });

    const consoleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.34, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0x1a3a5a, emissive: 0x2a8acf, emissiveIntensity: 0.5 })
    );
    consoleMesh.position.y = 0.34;
    ufoModel.add(consoleMesh);

    // Red Blinking Sensor Antenna
    const an = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.4, 8), darkMat);
    an.position.y = 1.04;
    ufoModel.add(an);
    const ufoTip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5a5a }));
    ufoTip.position.y = 1.24;
    ufoModel.add(ufoTip);

    // Bottom Thruster Emitter & Glow
    const ufoEm = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), gmMat(0x7ff0ff));
    ufoEm.rotation.x = Math.PI / 2;
    ufoEm.position.y = -0.455;
    ufoModel.add(ufoEm);

    const ufoEg = spr(glowT, 0x44ddff, 2.6, 0.6, ufoModel);
    ufoEg.position.y = -0.55;

    // 14 Lower Rim Lights + 10 Upper Rim Lights (Counter-rotating)
    const ufoLr = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), gmMat(i % 2 ? 0xffc86a : 0x66f0ff));
      l.position.set(Math.cos(a) * 1.1, -0.36, Math.sin(a) * 1.1);
      ufoLr.add(l);
    }
    ufoModel.add(ufoLr);

    const ufoLr2 = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), gmMat(i % 2 ? 0xff9a5a : 0x9fe8ff));
      l.position.set(Math.cos(a) * 1.3, 0.17, Math.sin(a) * 1.3);
      ufoLr2.add(l);
    }
    ufoModel.add(ufoLr2);

    // Volumetric Tractor Beam
    const tractorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const tractorBeam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 24, 1, true), tractorMat);
    tractorBeam.rotation.x = Math.PI;
    tractorBeam.position.y = -0.85;
    ufoModel.add(tractorBeam);

    // SCALE: Sleek miniature size so it roams properly and looks proportional around the globe
    ufoRoot.scale.setScalar(0.20);
    scene.add(ufoRoot);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING PAPERS & DELIVERY CYCLE (SUBTLE & REFINED)
    // ─────────────────────────────────────────────────────────────
    const paperMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const activePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.24), paperMat);
    scene.add(activePaper);

    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.09, 32), rippleMat);
    scene.add(rippleMesh);

    // ─────────────────────────────────────────────────────────────
    // 5. 3D ORBIT FLIGHT DYNAMICS
    // ─────────────────────────────────────────────────────────────
    // UFO Orbit: tilted wider ellipse
    const UFO_RX = 2.15;
    const UFO_RY = 1.45;
    const UFO_TILT = 0.32;
    const UFO_SPEED = 0.24;

    // Bird Orbit: inner ellipse, opposite phase
    const BIRD_RX = 1.82;
    const BIRD_RY = 1.25;
    const BIRD_TILT = -0.38;
    const BIRD_SPEED = 0.34;

    let courierTimer = 0;
    let courierPhase = 0; // 0=patrol, 1=gather, 2=fly-in, 3=ripple
    let courierProgress = 0;
    let courierType: 'bird' | 'ufo' = 'bird';
    let rippleProg = 1.0;

    // ─────────────────────────────────────────────────────────────
    // 6. DRAG TO ROTATE
    // ─────────────────────────────────────────────────────────────
    let isDragging = false;
    let prevX = 0;
    let rotVelY = 0;
    let targetRotY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      rotVelY = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      rotVelY = dx * 0.005;
      targetRotY += rotVelY;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      W = container.clientWidth || 640;
      H = container.clientHeight || 450;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const projectToScreen = (v: THREE.Vector3) => {
      const p = v.clone().project(camera);
      return {
        x: (p.x + 1) * 0.5 * W,
        y: (1 - p.y) * 0.5 * H
      };
    };

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Master Globe Floating Levitation
      masterGlobe.position.y = Math.sin(elapsed * 1.1) * 0.045;

      // 2. Drag Rotation with Inertia
      if (!isDragging) {
        rotVelY *= 0.94;
        targetRotY += rotVelY;
      }
      spinGroup.rotation.y += (targetRotY - spinGroup.rotation.y) * 0.08;

      // 3. Earth Globe Constant Slow Spin
      earthMesh.rotation.y += 0.0028;
      cloudsMesh.rotation.y += 0.0036;

      // 4. Citation Arc Traveling Photon Packets
      photonBeads.forEach((bead, i) => {
        const curve = arcCurves[i];
        if (curve) {
          const t = (elapsed * 0.4 + i * 0.18) % 1.0;
          bead.position.copy(curve.getPoint(t));
        }
      });

      // 5. High-Fidelity UFO Kinematics
      ufoBand.rotation.y = elapsed * 0.8;
      ufoLr.rotation.y = -elapsed * 1.6;
      ufoLr2.rotation.y = elapsed * 1.1;
      ufoTip.material.color.setHex(Math.sin(elapsed * 6) > 0 ? 0xff5a5a : 0x501818);
      ufoEg.scale.setScalar(2.6 + 0.3 * Math.sin(elapsed * 8));

      // UFO Smooth 3D Elliptical Orbit
      {
        const ang = elapsed * UFO_SPEED;
        const lx = Math.cos(ang) * UFO_RX;
        const ly = Math.sin(ang) * UFO_RY;
        const cosT = Math.cos(UFO_TILT), sinT = Math.sin(UFO_TILT);
        const lz = Math.sin(ang * 0.5) * 0.4;

        ufoRoot.position.set(
          lx * cosT - ly * sinT,
          lx * sinT + ly * cosT,
          lz
        );

        // Bank into curve
        const velX = -Math.sin(ang) * UFO_RX * UFO_SPEED;
        const velY = Math.cos(ang) * UFO_RY * UFO_SPEED;
        ufoRoot.rotation.y = Math.atan2(velX, 0.5);
        ufoRoot.rotation.x = 0.15;
        ufoRoot.rotation.z = velY * 0.08;
      }

      // 6. High-Fidelity Bird Kinematics
      {
        const ang = elapsed * BIRD_SPEED + Math.PI; // Opposite phase
        const lx = Math.cos(ang) * BIRD_RX;
        const ly = Math.sin(ang) * BIRD_RY;
        const cosT = Math.cos(BIRD_TILT), sinT = Math.sin(BIRD_TILT);
        const lz = Math.cos(ang * 0.6) * 0.35;

        birdRoot.position.set(
          lx * cosT - ly * sinT,
          lx * sinT + ly * cosT,
          lz
        );

        // Bird banking and direction
        const nextAng = ang + 0.08;
        const nx = Math.cos(nextAng) * BIRD_RX * cosT - Math.sin(nextAng) * BIRD_RY * sinT;
        const ny = Math.cos(nextAng) * BIRD_RX * sinT + Math.sin(nextAng) * BIRD_RY * cosT;
        birdRoot.rotation.y = Math.atan2(nx - birdRoot.position.x, 0.5);
        birdRoot.rotation.x = Math.atan2(ny - birdRoot.position.y, -0.5) * 0.35;
        birdRoot.rotation.z = Math.sin(ang * 2) * 0.2;

        // Two-joint wing flapping articulation
        const flap = Math.sin(elapsed * 12);
        const shAngle = 0.12 + 0.72 * flap;
        const handAngle = 0.48 * Math.sin(elapsed * 12 - 1.15);
        wl.sh.rotation.z = shAngle;
        wr.sh.rotation.z = -shAngle;
        wl.hand.rotation.z = handAngle;
        wr.hand.rotation.z = -handAngle;
      }

      // 7. Subtle Paper Delivery Routine
      courierTimer += dt;
      if (courierPhase === 0 && courierTimer > 8.0) {
        courierTimer = 0;
        courierPhase = 1;
        courierProgress = 0;
        courierType = Math.random() < 0.5 ? 'bird' : 'ufo';
      }

      if (courierPhase === 1) {
        // Paper gathers near courier
        courierProgress += dt * 1.5;
        paperMat.opacity = Math.min(1, courierProgress * 1.4);
        const carrier = courierType === 'bird' ? birdRoot : ufoRoot;
        activePaper.position.copy(carrier.position).add(
          new THREE.Vector3(0, courierType === 'bird' ? -0.10 : -0.25, 0.08)
        );
        if (courierType === 'ufo') tractorMat.opacity = Math.min(0.7, courierProgress * 0.7);

        if (courierProgress >= 1.0) {
          courierPhase = 2;
          courierProgress = 0;
        }
      } else if (courierPhase === 2) {
        // Paper flies toward globe surface
        courierProgress += dt * 0.7;
        const t = Math.min(1.0, courierProgress);
        const carrier = courierType === 'bird' ? birdRoot : ufoRoot;
        const target = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.4,
          GLOBE_R * 0.95
        );
        activePaper.position.lerpVectors(carrier.position, target, t);
        paperMat.opacity = 1.0 - t * 0.25;

        if (courierProgress >= 1.0) {
          courierPhase = 3;
          courierProgress = 0;
          rippleProg = 0;
          rippleMesh.position.copy(activePaper.position);
          rippleMesh.quaternion.copy(camera.quaternion);
          tractorMat.opacity = 0;
        }
      } else if (courierPhase === 3) {
        // Paper dissolves with surface ripple
        courierProgress += dt * 2.2;
        paperMat.opacity = Math.max(0, 1.0 - courierProgress);
        if (courierProgress >= 1.0) {
          courierPhase = 0;
          courierTimer = 0;
        }
      }

      // Ripple fade
      if (rippleProg < 1.0) {
        rippleProg += dt * 1.5;
        rippleMesh.scale.setScalar(0.2 + rippleProg * 1.8);
        rippleMat.opacity = (1.0 - rippleProg) * 0.8;
      } else {
        rippleMat.opacity = 0;
      }

      // 8. Projected HUD Pill Positions & Symmetrical Non-Overlapping Layout
      spinGroup.updateMatrixWorld(true);
      const newPos: Record<string, { x: number; y: number; ax: number; ay: number }> = {};

      pillDefs.forEach(p => {
        // The 3D anchor dot rotates with the Earth globe
        const worldAp = p.ap.clone().applyMatrix4(spinGroup.matrixWorld);
        const screenAp = projectToScreen(worldAp);

        // Fixed symmetrical HUD positions:
        // Left column sits on left margin, Right column sits on right margin,
        // Bottom center sits underneath.
        let px = 0;
        let py = p.slotY * H;

        if (p.side === 'left') {
          // Left margin with safe padding
          px = Math.max(75, W * 0.12);
        } else if (p.side === 'right') {
          // Right margin with safe padding
          px = Math.min(W - 75, W * 0.88);
        } else {
          // Centered below globe
          px = W * 0.5;
          py = Math.min(H - 24, p.slotY * H);
        }

        newPos[p.id] = {
          x: px,
          y: py,
          ax: screenAp.x,
          ay: screenAp.y
        };
      });

      setPillPositions(newPos);

      // Track UFO on screen for RECON SURVEYOR badge
      const ufoWorld = ufoRoot.position.clone();
      const ufoScreen = projectToScreen(ufoWorld);
      setUfoScreenPos(ufoScreen);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[430px] lg:h-[460px] select-none flex items-center justify-center overflow-visible"
    >
      {/* 3D WebGL Canvas — Transparent alpha, blends cleanly into background image */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block focus:outline-none"
        style={{ background: 'transparent' }}
        aria-label="3D Knowledge Earth with orbiting cyber bird and UFO"
      />

      {/* SVG Connector Lines from HUD Pills to 3D Earth Anchor Dots */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        <defs>
          <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {pillDefs.map(p => {
          const pos = pillPositions[p.id];
          if (!pos) return null;
          return (
            <g key={p.id}>
              <line
                x1={pos.x}
                y1={pos.y}
                x2={pos.ax}
                y2={pos.ay}
                stroke={p.color}
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              <circle
                cx={pos.ax}
                cy={pos.ay}
                r="3.2"
                fill={p.color}
                filter="url(#coreGlow)"
                className="animate-pulse"
              />
            </g>
          );
        })}
      </svg>

      {/* 7 Re-arranged Non-Overlapping Interactive HUD Pills */}
      {pillDefs.map(p => {
        const pos = pillPositions[p.id];
        if (!pos) return null;
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            type="button"
            onClick={p.action}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
              borderColor: `${p.color}90`,
              boxShadow: `0 4px 18px rgba(0,0,0,0.5), 0 0 12px ${p.color}40`
            }}
            className="absolute left-0 top-0 z-20 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#07132b]/90 hover:bg-[#0e214d] text-white text-[10.5px] sm:text-xs font-semibold backdrop-blur-md transition-transform duration-200 hover:scale-105 border cursor-pointer pointer-events-auto whitespace-nowrap group"
          >
            <span
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
            />
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: p.color }} />
            <span className="leading-none">{p.name}</span>
            <span className="text-[9px] sm:text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-bold leading-none">
              {p.tag}
            </span>
          </button>
        );
      })}

      {/* RECON SURVEYOR • 02% Badge Tracking the Miniature UFO */}
      {ufoScreenPos && (
        <div
          style={{
            transform: `translate(${ufoScreenPos.x + 28}px, ${ufoScreenPos.y - 22}px) translate(-50%, -50%)`
          }}
          className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#07132b]/85 border border-sky-400/60 text-[9px] font-mono text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.45)] backdrop-blur-sm whitespace-nowrap"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping flex-shrink-0" />
          <span>RECON SURVEYOR • 02%</span>
        </div>
      )}

      {/* Drag hint at bottom right */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/60 dark:bg-black/60 border border-white/10 text-[9.5px] text-cyan-200/80 pointer-events-none backdrop-blur-sm z-10">
        <RotateCcw className="w-2.5 h-2.5 text-cyan-400" />
        <span>Drag to rotate Earth</span>
      </div>
    </div>
  );
};
