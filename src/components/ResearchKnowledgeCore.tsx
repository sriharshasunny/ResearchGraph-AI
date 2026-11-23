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
  const pillDefs = [
    // LEFT COLUMN (top to bottom)
    {
      id: 'papers',
      name: 'Research Papers',
      tag: '204M+',
      color: '#38bdf8',
      icon: FileText,
      action: () => handleAction('search'),
      side: 'left',
      slotY: 0.22,
      ap: new THREE.Vector3(-0.75, 0.35, 0.55)
    },
    {
      id: 'authors',
      name: 'Authors',
      tag: '12.4M+',
      color: '#14b8a6',
      icon: Users,
      action: () => handleSearch('Research authors'),
      side: 'left',
      slotY: 0.50,
      ap: new THREE.Vector3(-0.90, 0.05, 0.45)
    },
    {
      id: 'datasets',
      name: 'Datasets',
      tag: '85K+',
      color: '#f59e0b',
      icon: Database,
      action: () => handleSearch('Empirical datasets'),
      side: 'left',
      slotY: 0.78,
      ap: new THREE.Vector3(-0.70, -0.38, 0.55)
    },

    // RIGHT COLUMN (top to bottom)
    {
      id: 'graph',
      name: 'Knowledge Graph',
      tag: 'AI-Core',
      color: '#10b981',
      icon: Network,
      action: () => handleAction('graph'),
      side: 'right',
      slotY: 0.22,
      ap: new THREE.Vector3(0.75, 0.35, 0.55)
    },
    {
      id: 'insights',
      name: 'AI Insights',
      tag: 'Consensus',
      color: '#a855f7',
      icon: Sparkles,
      action: () => handleAction('chat'),
      side: 'right',
      slotY: 0.50,
      ap: new THREE.Vector3(0.90, 0.05, 0.45)
    },
    {
      id: 'concepts',
      name: 'Concepts',
      tag: '1.8M+',
      color: '#818cf8',
      icon: Layers,
      action: () => handleSearch('Ontological concepts'),
      side: 'right',
      slotY: 0.78,
      ap: new THREE.Vector3(0.70, -0.38, 0.55)
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
      slotY: 0.94,
      ap: new THREE.Vector3(0.0, -0.85, 0.45)
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

    // ── WebGL Renderer: Full Alpha Transparency (zero black box or dark halos) ──
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
    renderer.setClearColor(0x000000, 0); // 100% transparent clear
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0.08, 5.2);
    camera.lookAt(0, 0, 0);

    // ── Lighting ──
    const sunDir = new THREE.Vector3(-0.65, 0.48, 0.60).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sunLight.position.copy(sunDir).multiplyScalar(20);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xd4e4ff, 0.55);
    scene.add(ambientLight);

    const spaceBackLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    spaceBackLight.position.set(4, -2, -6);
    scene.add(spaceBackLight);

    // Canvas texture helpers
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
    // 1. COMPACT, PHOTOREALISTIC EARTH GLOBE (GLOBE_R = 0.92)
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

    // High fidelity Day Texture
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
              d[idx] = 232; d[idx + 1] = 242; d[idx + 2] = 252;
            } else if (lat > 15 && lat < 34 && lon > -15 && lon < 55) {
              d[idx] = 172; d[idx + 1] = 142; d[idx + 2] = 92;
            } else if (lat < -18 && lat > -32 && lon > 115 && lon < 145) {
              d[idx] = 178; d[idx + 1] = 108; d[idx + 2] = 68;
            } else {
              const v = (Math.sin(lat * 0.15) * Math.cos(lon * 0.15) + 1) * 0.5;
              d[idx] = Math.floor(46 + v * 32);
              d[idx + 1] = Math.floor(96 + v * 36);
              d[idx + 2] = Math.floor(54 + v * 20);
            }
          } else {
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

    // Night City Lights Texture
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

    // Cloud Texture
    const cloudTex = (() => {
      const c = mkc(512, 256), ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 256);
      for (let k = 0; k < 90; k++) {
        const x = Math.random() * 512, y = 30 + Math.random() * 196;
        const rx = 18 + Math.random() * 45, ry = 6 + Math.random() * 14;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
        g.addColorStop(0, 'rgba(255,255,255,0.42)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.16)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * 0.3 - 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      return tex(c);
    })();

    const masterGlobe = new THREE.Group();
    scene.add(masterGlobe);

    const spinGroup = new THREE.Group();
    masterGlobe.add(spinGroup);

    // Reduced globe radius for ideal proportions and zero background obstruction
    const GLOBE_R = 0.92;

    // Earth Shader with clean natural limb lighting on sphere surface
    // (NO outer black meshes or opaque halos)
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

          vec3 col = day * (0.12 + 1.15 * max(0.0, nd)) * mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.98, 0.92), lit);
          col += night * (1.0 - lit) * 1.6;

          // Ocean Specular Glint
          vec3 H = normalize(sun + V);
          col += vec3(1.0, 0.98, 0.92) * pow(max(dot(N, H), 0.0), 240.0) * spec * 0.72 * step(0.0, nd);

          // Rayleigh limb scattering directly on sphere edge (NO dark outer halo!)
          float limb = pow(1.0 - max(dot(N, V), 0.0), 3.8);
          col += vec3(0.25, 0.55, 0.95) * limb * smoothstep(-0.2, 0.4, nd) * 0.45;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 72, 56), earthMat);
    spinGroup.add(earthMesh);

    // Natural Clouds Layer
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

    const CITIES = [
      [42.36, -71.09], // Boston (MIT/Harvard)
      [37.42, -122.17], // Stanford/SF
      [51.50, -0.12],  // London
      [52.20, 0.12],   // Cambridge
      [47.37, 8.54],   // ETH Zurich
      [48.85, 2.35],   // Paris
      [35.68, 139.76], // Tokyo
      [1.35, 103.82],  // Singapore
      [39.90, 116.40], // Beijing
      [-33.86, 151.21],// Sydney
      [40.71, -74.00], // New York
      [34.05, -118.24],// Los Angeles
      [19.07, 72.87],  // Mumbai
      [12.97, 77.59],  // Bengaluru
      [22.31, 114.16]  // Hong Kong
    ];

    const researchNodes: THREE.Vector3[] = CITIES.map(c => llToV3(c[0], c[1], GLOBE_R));

    // Research Hub Beacons on Earth
    researchNodes.forEach((pos, i) => {
      const nodeSprite = spr(glowT, i % 3 === 0 ? 0x67e8f9 : 0xffd36a, 0.045, 0.9, spinGroup);
      nodeSprite.position.copy(pos).multiplyScalar(1.012);
    });

    // Dynamic Citation Arcs
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const photonBeads: THREE.Mesh[] = [];

    const cityPairs = [
      [0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [4, 5],
      [2, 6], [6, 7], [7, 8], [7, 9], [1, 11], [0, 10],
      [2, 12], [7, 13], [8, 14]
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

      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      spinGroup.add(bead);
      photonBeads.push(bead);
    });

    // ─────────────────────────────────────────────────────────────
    // 2. REPLICATED HIGH-FIDELITY BIRD FROM LANDING PAGE
    // ─────────────────────────────────────────────────────────────
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

    // Bird Head & Beak
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshStandardMaterial({ color: 0xdde2ea, roughness: 0.8 }));
    hd.scale.set(1, 1, 1.25);
    hd.position.set(0, 0.04, 0.47);
    birdBodyGroup.add(hd);

    const mB = new THREE.MeshStandardMaterial({ color: 0xf0b020, roughness: 0.5, emissive: 0x503000, emissiveIntensity: 0.4 });
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.2, 14).rotateX(Math.PI / 2), mB);
    bk.position.set(0, 0.01, 0.66);
    birdBodyGroup.add(bk);

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

    for (let k = -5; k <= 5; k++) {
      addF(birdBodyGroup, mWht, 0.085, 0.42 - Math.abs(k) * 0.012, 0.02, 0, 0, -0.55, Math.PI / 2 + k * 0.075, k % 2 ? 0.05 : -0.02);
    }

    const wl = mkWing(1), wr = mkWing(-1);
    wl.sh.position.set(0.13, 0.075, 0.12);
    wr.sh.position.set(-0.13, 0.075, 0.12);
    birdBodyGroup.add(wl.sh, wr.sh);

    // Miniature bird scale so it roams comfortably in 3D around the globe
    birdRoot.scale.setScalar(0.16);
    scene.add(birdRoot);

    // ─────────────────────────────────────────────────────────────
    // 3. REPLICATED HIGH-FIDELITY UFO FROM LANDING PAGE
    // ─────────────────────────────────────────────────────────────
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

    const ufoHullGeo = new THREE.LatheGeometry([
      [0, -0.45], [0.34, -0.43], [0.5, -0.37], [0.9, -0.3], [1.3, -0.19],
      [1.55, -0.09], [1.66, 0], [1.55, 0.08], [1.3, 0.15], [0.95, 0.22],
      [0.7, 0.29], [0.52, 0.33], [0, 0.34]
    ].map(q => new THREE.Vector2(q[0], q[1])), 96);
    ufoModel.add(new THREE.Mesh(ufoHullGeo, hullMat));

    const ufoBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.67, 1.67, 0.13, 64, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x10151f, emissive: 0xffffff, emissiveMap: WT, emissiveIntensity: 1.6, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide
      })
    );
    ufoModel.add(ufoBand);

    const ufoCollar = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.045, 12, 64), darkMat);
    ufoCollar.rotation.x = Math.PI / 2;
    ufoCollar.position.y = 0.3;
    ufoModel.add(ufoCollar);

    const ufoAcc = new THREE.Mesh(new THREE.TorusGeometry(1.64, 0.018, 8, 128), gmMat(0x66e8ff));
    ufoAcc.rotation.x = Math.PI / 2;
    ufoAcc.position.y = 0.075;
    ufoModel.add(ufoAcc);

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

    const ufoDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.64, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x9fd8ff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.45, clearcoat: 1, emissive: 0x0a3a66, emissiveIntensity: 0.5, side: THREE.DoubleSide
      })
    );
    ufoDome.position.y = 0.3;
    ufoDome.scale.y = 0.85;
    ufoModel.add(ufoDome);

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

    const an = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.4, 8), darkMat);
    an.position.y = 1.04;
    ufoModel.add(an);
    const ufoTip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5a5a }));
    ufoTip.position.y = 1.24;
    ufoModel.add(ufoTip);

    const ufoEm = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), gmMat(0x7ff0ff));
    ufoEm.rotation.x = Math.PI / 2;
    ufoEm.position.y = -0.455;
    ufoModel.add(ufoEm);

    const ufoEg = spr(glowT, 0x44ddff, 2.6, 0.6, ufoModel);
    ufoEg.position.y = -0.55;

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

    // Miniature UFO scale
    ufoRoot.scale.setScalar(0.18);
    scene.add(ufoRoot);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING PAPER & DELIVERY REACTION
    // ─────────────────────────────────────────────────────────────
    const paperMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const activePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), paperMat);
    activePaper.visible = false;
    scene.add(activePaper);

    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.08, 32), rippleMat);
    scene.add(rippleMesh);

    // ─────────────────────────────────────────────────────────────
    // 5. ORGANIC 3D ROAMING AUTONOMOUS AGENTS (NON-CIRCULAR FLIGHT)
    // ─────────────────────────────────────────────────────────────
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);

    // Collision avoidance buffer with Earth globe
    const keepOut = (p: THREE.Vector3, minDist: number) => {
      const len = p.length();
      if (len < minDist) {
        p.multiplyScalar(minDist / (len || 0.001));
      }
    };

    // Random 3D Waypoint Generator around the globe
    const getNextWaypoint = (isBird: boolean) => {
      // Pick random 3D position wrapping all sides of the globe
      const theta = rnd(0, Math.PI * 2);
      const phi = rnd(0.3, Math.PI - 0.3);
      const r = isBird ? rnd(1.35, 1.95) : rnd(1.45, 2.25);
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * (isBird ? 0.75 : 0.85),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Bird Flight State: Realistic aerodynamic steering, banking, and flapping bursts
    const birdState = {
      pos: new THREE.Vector3(-1.4, 0.6, 1.1),
      vel: new THREE.Vector3(0, 0, 0),
      target: getNextWaypoint(true),
      yaw: 0,
      pitch: 0,
      bank: 0,
      yawRate: 0,
      speed: 1.8,
      isGliding: false,
      glideTimer: 0,
      flapPhase: 0,
      waypointTimer: 0
    };

    // UFO Flight State: Anti-gravity thruster acceleration, inertia, hovering wobble
    const ufoState = {
      pos: new THREE.Vector3(1.5, 0.5, 1.2),
      vel: new THREE.Vector3(0, 0, 0),
      target: getNextWaypoint(false),
      rx: 0.15,
      rz: 0.0,
      wobbleSeed: rnd(0, 10),
      waypointTimer: 0
    };

    let courierTimer = 0;
    let courierPhase = 0; // 0=roaming, 1=paper pickup, 2=fly into globe, 3=ripple
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

      // 1. Globe Levitation
      masterGlobe.position.y = Math.sin(elapsed * 1.1) * 0.035;

      // 2. Drag Rotation
      if (!isDragging) {
        rotVelY *= 0.94;
        targetRotY += rotVelY;
      }
      spinGroup.rotation.y += (targetRotY - spinGroup.rotation.y) * 0.08;

      // 3. Slow Earth Spin
      earthMesh.rotation.y += 0.0028;
      cloudsMesh.rotation.y += 0.0036;

      // 4. Citation Photon Pulses
      photonBeads.forEach((bead, i) => {
        const curve = arcCurves[i];
        if (curve) {
          const t = (elapsed * 0.4 + i * 0.18) % 1.0;
          bead.position.copy(curve.getPoint(t));
        }
      });

      // 5. UFO Hardware Kinematics
      ufoBand.rotation.y = elapsed * 0.8;
      ufoLr.rotation.y = -elapsed * 1.6;
      ufoLr2.rotation.y = elapsed * 1.1;
      ufoTip.material.color.setHex(Math.sin(elapsed * 6) > 0 ? 0xff5a5a : 0x501818);
      ufoEg.scale.setScalar(2.6 + 0.3 * Math.sin(elapsed * 8));

      // ─────────────────────────────────────────────────────────
      // 6. REALISTIC BIRD AERODYNAMICS (ORGANIC 3D ROAMING)
      // ─────────────────────────────────────────────────────────
      birdState.waypointTimer += dt;
      const bDist = birdState.pos.distanceTo(birdState.target);
      if (bDist < 0.45 || birdState.waypointTimer > 5.5) {
        birdState.target = getNextWaypoint(true);
        birdState.waypointTimer = 0;
      }

      // Aerodynamic steering
      const bDx = birdState.target.x - birdState.pos.x;
      const bDy = birdState.target.y - birdState.pos.y;
      const bDz = birdState.target.z - birdState.pos.z;
      const bTotalDist = Math.hypot(bDx, bDy, bDz) || 1;

      // Target yaw and pitch angles
      let desiredYaw = Math.atan2(bDx, bDz);
      let diffYaw = desiredYaw - birdState.yaw;
      diffYaw = Math.atan2(Math.sin(diffYaw), Math.cos(diffYaw));

      const maxTurn = bDist < 1.0 ? 3.2 : 2.0;
      birdState.yawRate += (THREE.MathUtils.clamp(diffYaw * 2.5, -maxTurn, maxTurn) - birdState.yawRate) * Math.min(1, dt * 4.5);
      birdState.yaw += birdState.yawRate * dt;

      const desiredPitch = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(bDy / bTotalDist, -0.65, 0.65)), -0.6, 0.6);
      birdState.pitch += (desiredPitch - birdState.pitch) * Math.min(1, dt * 2.8);

      // Roll/bank realistically into turns
      birdState.bank += (THREE.MathUtils.clamp(-birdState.yawRate * 0.65, -0.75, 0.75) - birdState.bank) * Math.min(1, dt * 4.0);

      // Speed modulation: faster when pitching down, slower in steep climbs
      const targetSpeed = 1.6 - birdState.pitch * 0.8;
      birdState.speed = THREE.MathUtils.clamp(birdState.speed + (targetSpeed - birdState.speed) * dt * 2.0, 1.2, 2.8);

      // Forward flight translation
      const bFw = new THREE.Vector3(
        Math.cos(birdState.pitch) * Math.sin(birdState.yaw),
        Math.sin(birdState.pitch),
        Math.cos(birdState.pitch) * Math.cos(birdState.yaw)
      );
      birdState.pos.addScaledVector(bFw, birdState.speed * dt);
      keepOut(birdState.pos, GLOBE_R * 1.26);

      // Gliding vs Flapping state transitions
      birdState.glideTimer -= dt;
      if (birdState.glideTimer <= 0) {
        birdState.isGliding = !birdState.isGliding && Math.abs(diffYaw) < 0.4 && birdState.pitch < 0.15;
        birdState.glideTimer = birdState.isGliding ? rnd(1.4, 2.6) : rnd(1.8, 3.2);
      }

      birdState.flapPhase += dt * (birdState.isGliding ? 0.8 : 12.0);

      // Wing kinematics
      if (birdState.isGliding) {
        // Soaring wings held flat and steady with gentle breeze tilt
        const soarSh = 0.16 + 0.04 * Math.sin(elapsed * 1.5);
        const soarHand = -0.06;
        wl.sh.rotation.z = soarSh;
        wr.sh.rotation.z = -soarSh;
        wl.hand.rotation.z = soarHand;
        wr.hand.rotation.z = -soarHand;
      } else {
        // Active flapping cycle
        const flap = Math.sin(birdState.flapPhase);
        const shAngle = 0.12 + 0.72 * flap;
        const handAngle = 0.48 * Math.sin(birdState.flapPhase - 1.15);
        wl.sh.rotation.z = shAngle;
        wr.sh.rotation.z = -shAngle;
        wl.hand.rotation.z = handAngle;
        wr.hand.rotation.z = -handAngle;
      }

      birdRoot.position.copy(birdState.pos);
      birdRoot.rotation.set(-birdState.pitch, birdState.yaw, birdState.bank);

      // ─────────────────────────────────────────────────────────
      // 7. REALISTIC UFO ANTI-GRAVITY KINEMATICS (3D ROAMING)
      // ─────────────────────────────────────────────────────────
      ufoState.waypointTimer += dt;
      const uDist = ufoState.pos.distanceTo(ufoState.target);
      if (uDist < 0.5 || ufoState.waypointTimer > 6.0) {
        ufoState.target = getNextWaypoint(false);
        ufoState.waypointTimer = 0;
      }

      // Anti-gravity smooth acceleration towards target
      const uAx = THREE.MathUtils.clamp((ufoState.target.x - ufoState.pos.x) * 3.2 - ufoState.vel.x * 2.2, -6.0, 6.0);
      const uAy = THREE.MathUtils.clamp((ufoState.target.y - ufoState.pos.y) * 3.2 - ufoState.vel.y * 2.2, -6.0, 6.0);
      const uAz = THREE.MathUtils.clamp((ufoState.target.z - ufoState.pos.z) * 3.2 - ufoState.vel.z * 2.2, -6.0, 6.0);

      ufoState.vel.x += uAx * dt;
      ufoState.vel.y += uAy * dt;
      ufoState.vel.z += uAz * dt;

      // Speed cap for smooth graceful roaming
      if (ufoState.vel.length() > 2.4) {
        ufoState.vel.setLength(2.4);
      }

      ufoState.pos.addScaledVector(ufoState.vel, dt);
      ufoState.pos.y += Math.sin(elapsed * 2.2 + ufoState.wobbleSeed) * 0.12 * dt;
      keepOut(ufoState.pos, GLOBE_R * 1.30);

      // Bank realistically based on velocity & lateral acceleration
      ufoState.rx += (0.18 + THREE.MathUtils.clamp(ufoState.vel.z * 0.05 - uAy * 0.015, -0.35, 0.35) - ufoState.rx) * Math.min(1, dt * 5.0);
      ufoState.rz += (-THREE.MathUtils.clamp(ufoState.vel.x * 0.06 + uAx * 0.015, -0.45, 0.45) - ufoState.rz) * Math.min(1, dt * 5.0);

      ufoRoot.position.copy(ufoState.pos);
      ufoRoot.rotation.set(
        ufoState.rx + 0.02 * Math.sin(elapsed * 2.1),
        0.0,
        ufoState.rz + 0.02 * Math.sin(elapsed * 1.7 + 1.0)
      );

      // ─────────────────────────────────────────────────────────
      // 8. OCCASIONAL PAPER COURIER DELIVERY (CLEAN & SUBTLE)
      // ─────────────────────────────────────────────────────────
      courierTimer += dt;
      if (courierPhase === 0 && courierTimer > 12.0) {
        courierTimer = 0;
        courierPhase = 1;
        courierProgress = 0;
        courierType = Math.random() < 0.5 ? 'bird' : 'ufo';
        activePaper.visible = true;
      }

      if (courierPhase === 1) {
        courierProgress += dt * 1.4;
        paperMat.opacity = Math.min(1, courierProgress * 1.5);
        const carrier = courierType === 'bird' ? birdRoot : ufoRoot;
        activePaper.position.copy(carrier.position).add(
          new THREE.Vector3(0, courierType === 'bird' ? -0.08 : -0.20, 0.06)
        );
        if (courierType === 'ufo') tractorMat.opacity = Math.min(0.65, courierProgress * 0.65);

        if (courierProgress >= 1.0) {
          courierPhase = 2;
          courierProgress = 0;
        }
      } else if (courierPhase === 2) {
        courierProgress += dt * 0.75;
        const t = Math.min(1.0, courierProgress);
        const carrier = courierType === 'bird' ? birdRoot : ufoRoot;
        const target = new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.3,
          GLOBE_R * 0.96
        );
        activePaper.position.lerpVectors(carrier.position, target, t);
        paperMat.opacity = 1.0 - t * 0.2;

        if (courierProgress >= 1.0) {
          courierPhase = 3;
          courierProgress = 0;
          rippleProg = 0;
          rippleMesh.position.copy(activePaper.position);
          rippleMesh.quaternion.copy(camera.quaternion);
          tractorMat.opacity = 0;
          activePaper.visible = false;
        }
      } else if (courierPhase === 3) {
        courierProgress += dt * 2.2;
        if (courierProgress >= 1.0) {
          courierPhase = 0;
          courierTimer = 0;
        }
      }

      if (rippleProg < 1.0) {
        rippleProg += dt * 1.5;
        rippleMesh.scale.setScalar(0.2 + rippleProg * 1.6);
        rippleMat.opacity = (1.0 - rippleProg) * 0.8;
      } else {
        rippleMat.opacity = 0;
      }

      // ─────────────────────────────────────────────────────────
      // 9. PROJECTED HUD PILL POSITIONS (DEDICATED ZONES)
      // ─────────────────────────────────────────────────────────
      spinGroup.updateMatrixWorld(true);
      const newPos: Record<string, { x: number; y: number; ax: number; ay: number }> = {};

      pillDefs.forEach(p => {
        const worldAp = p.ap.clone().applyMatrix4(spinGroup.matrixWorld);
        const screenAp = projectToScreen(worldAp);

        let px = 0;
        let py = p.slotY * H;

        if (p.side === 'left') {
          px = Math.max(75, W * 0.12);
        } else if (p.side === 'right') {
          px = Math.min(W - 75, W * 0.88);
        } else {
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
      className="relative w-full h-[390px] sm:h-[420px] lg:h-[450px] select-none flex items-center justify-center overflow-visible"
    >
      {/* 3D WebGL Canvas — Transparent alpha, blends cleanly into background image */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block focus:outline-none"
        style={{ background: 'transparent' }}
        aria-label="3D Knowledge Earth with roaming bird and UFO"
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
