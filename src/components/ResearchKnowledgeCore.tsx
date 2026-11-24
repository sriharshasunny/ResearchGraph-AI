import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
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

  // 7 HUD Navigation Pills — arranged symmetrically around the 3D Earth Globe
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
      side: 'left' as const,
      slotYOffset: -0.65,
      rimAngle: -0.44
    },
    {
      id: 'authors',
      name: 'Authors',
      tag: '12.4M+',
      color: '#14b8a6',
      icon: Users,
      action: () => handleSearch('Research authors'),
      side: 'left' as const,
      slotYOffset: 0.0,
      rimAngle: 0.0
    },
    {
      id: 'datasets',
      name: 'Datasets',
      tag: '85K+',
      color: '#f59e0b',
      icon: Database,
      action: () => handleSearch('Empirical datasets'),
      side: 'left' as const,
      slotYOffset: 0.65,
      rimAngle: 0.44
    },

    // RIGHT COLUMN (top to bottom)
    {
      id: 'graph',
      name: 'Knowledge Graph',
      tag: 'AI-Core',
      color: '#10b981',
      icon: Network,
      action: () => handleAction('graph'),
      side: 'right' as const,
      slotYOffset: -0.65,
      rimAngle: -0.44
    },
    {
      id: 'insights',
      name: 'AI Insights',
      tag: 'Consensus',
      color: '#a855f7',
      icon: Sparkles,
      action: () => handleAction('chat'),
      side: 'right' as const,
      slotYOffset: 0.0,
      rimAngle: 0.0
    },
    {
      id: 'concepts',
      name: 'Concepts',
      tag: '1.8M+',
      color: '#818cf8',
      icon: Layers,
      action: () => handleSearch('Ontological concepts'),
      side: 'right' as const,
      slotYOffset: 0.65,
      rimAngle: 0.44
    },

    // BOTTOM CENTER
    {
      id: 'citations',
      name: 'Citations',
      tag: '1.24B+',
      color: '#ec4899',
      icon: Link2,
      action: () => handleAction('graph'),
      side: 'center' as const,
      slotYOffset: 1.0,
      rimAngle: Math.PI / 2
    }
  ];

  const [pillPositions, setPillPositions] = useState<
    Record<string, { x: number; y: number; startX: number; startY: number; ax: number; ay: number }>
  >({});

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

    const ambientLight = new THREE.AmbientLight(0xd4e4ff, 0.7);
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
    // 1. RESTORED PREVIOUS GLOBE MODEL (globe.webp + Atmospheric Shells)
    // ─────────────────────────────────────────────────────────────
    const masterGlobe = new THREE.Group();
    scene.add(masterGlobe);

    const spinGroup = new THREE.Group();
    masterGlobe.add(spinGroup);

    // Globe radius (0.74 gives ideal proportion to hero banner and leaves clearance for labels)
    const GLOBE_R = 0.74;

    // Load original globe.webp texture with maximum anisotropy
    const textureLoader = new THREE.TextureLoader();
    const globeTexture = textureLoader.load('/globe.webp');
    globeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Primary Earth Sphere with original globe.webp
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R, 96, 96),
      new THREE.MeshBasicMaterial({ map: globeTexture })
    );
    spinGroup.add(earthMesh);

    // Atmospheric Shell Shader Generator from original knowledge_globe.html
    const createShell = (sc: number, side: THREE.Side, pw: number, col: number, mul: number) => {
      return new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_R * sc, 64, 64),
        new THREE.ShaderMaterial({
          uniforms: { c: { value: new THREE.Color(col) } },
          side,
          transparent: true,
          blending: THREE.AdditiveBlending,
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
            uniform vec3 c;
            void main() {
              float i = ${
                side === THREE.BackSide
                  ? `pow(max(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), ${pw.toFixed(1)})`
                  : `pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), ${pw.toFixed(1)})`
              } * ${mul.toFixed(2)};
              gl_FragColor = vec4(c * i, i);
            }
          `
        })
      );
    };

    // Inner rim glow shell (FrontSide)
    const rimGlow = createShell(1.004, THREE.FrontSide, 2.6, 0x5ee7ff, 1.15);
    rimGlow.renderOrder = 6;
    spinGroup.add(rimGlow);

    // Outer atmospheric glow shell (BackSide)
    const outerAtmo = createShell(1.22, THREE.BackSide, 2.0, 0x2a9cff, 2.0);
    masterGlobe.add(outerAtmo);

    // Subtle equatorial scanning radar ring
    const scanRing = new THREE.Mesh(
      new THREE.TorusGeometry(GLOBE_R * 1.008, 0.005, 6, 120),
      new THREE.MeshBasicMaterial({
        color: 0x7ff0ff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      })
    );
    scanRing.rotation.x = Math.PI / 2;
    spinGroup.add(scanRing);

    // ── Global Hub Beacons & Dynamic Citation Arcs ──
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
        new THREE.SphereGeometry(0.016, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      spinGroup.add(bead);
      photonBeads.push(bead);
    });

    // ─────────────────────────────────────────────────────────────
    // 2. REPLICATED HIGH-FIDELITY BIRD WITH ENHANCED VISUAL EFFECTS
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

    // Miniature bird scale so it roams comfortably and gracefully in 3D across the entire hero banner
    birdRoot.scale.setScalar(0.12);
    scene.add(birdRoot);

    // ── Visual Effect Enhancement: Aerodynamic Wind Wisp Particle Trail ──
    const TRAIL_LEN = 20;
    const trailPositions = new Float32Array(TRAIL_LEN * 3);
    const trailAlphas = new Float32Array(TRAIL_LEN);
    for (let i = 0; i < TRAIL_LEN; i++) {
      trailAlphas[i] = (1.0 - i / TRAIL_LEN) * 0.45;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('alpha', new THREE.BufferAttribute(trailAlphas, 1));
    const trailMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(0xa5f3fc) } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.2 + alpha * 2.8) * (20.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
          if (d > 1.0) discard;
          float strength = pow(1.0 - d, 2.0);
          gl_FragColor = vec4(color, strength * vAlpha);
        }
      `
    });
    const birdTrailPoints = new THREE.Points(trailGeo, trailMat);
    scene.add(birdTrailPoints);

    const trailHistory: THREE.Vector3[] = [];

    // ─────────────────────────────────────────────────────────────
    // 3. ELEGANT MICRO RESEARCH PAPER & PARABOLIC THROWING EFFECT
    // ─────────────────────────────────────────────────────────────
    // Micro research folio texture (crisp scholarly miniature layout)
    const miniPaperTex = (() => {
      const c = mkc(128, 170), ctx = c.getContext('2d')!;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 128, 170);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px serif';
      ctx.fillText('Research Paper', 10, 18);
      ctx.fillStyle = '#64748b';
      ctx.font = '7px sans-serif';
      ctx.fillText('arXiv:2611 · cs.AI', 10, 30);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(10, 36, 108, 1.5);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(10, 46 + i * 12, i % 2 === 0 ? 108 : 82, 4);
      }
      return tex(c);
    })();

    const paperMat = new THREE.MeshStandardMaterial({
      map: miniPaperTex,
      roughness: 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    // Sleek micro folio dimensions (reduced from 0.18x0.24 to 0.065x0.088)
    const activePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.088), paperMat);
    activePaper.visible = false;
    scene.add(activePaper);

    // Glowing impact ripple on Earth surface
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.05, 32), rippleMat);
    scene.add(rippleMesh);

    // ─────────────────────────────────────────────────────────────
    // 4. BIRD AUTONOMOUS 3D ROAMING (PEACEFUL, 30% SLOWER SPEED)
    // ─────────────────────────────────────────────────────────────
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);

    // Collision avoidance buffer with Earth globe in world space
    const keepOut = (p: THREE.Vector3, minDist: number) => {
      const rel = p.clone().sub(masterGlobe.position);
      const len = rel.length();
      if (len < minDist) {
        rel.multiplyScalar(minDist / (len || 0.001));
        p.copy(masterGlobe.position).add(rel);
      }
    };

    // Cross-Banner Waypoint Generator: Ensures bird soars across the ENTIRE hero section
    const getNextWaypoint = () => {
      const vh = 5.2 * Math.tan(THREE.MathUtils.degToRad(19));
      const vw = vh * (W / H);

      const curX = birdState.pos.x;
      let zone: 'left' | 'center' | 'right';

      if (curX > 0.15 * vw) {
        // Near globe -> glide back across mountains to center/left
        zone = Math.random() < 0.6 ? 'left' : 'center';
      } else if (curX < -0.20 * vw) {
        // Far-left above search -> cruise toward center or globe
        zone = Math.random() < 0.6 ? 'right' : 'center';
      } else {
        zone = Math.random() < 0.5 ? 'left' : 'right';
      }

      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;

      if (W >= 900) {
        if (zone === 'left') {
          targetX = rnd(-vw * 0.82, -vw * 0.32);
          targetY = rnd(-0.20, vh * 0.65);
          targetZ = rnd(1.1, 2.2);
        } else if (zone === 'center') {
          targetX = rnd(-vw * 0.22, vw * 0.16);
          targetY = rnd(-0.15, vh * 0.65);
          targetZ = rnd(1.0, 2.0);
        } else {
          const gX = masterGlobe.position.x || (0.42 * vw);
          const side = Math.random() < 0.5 ? 1 : -1;
          targetX = gX + side * rnd(GLOBE_R * 1.35, GLOBE_R * 2.2);
          targetY = rnd(-vh * 0.35, vh * 0.65);
          targetZ = rnd(1.1, 2.1);
        }
      } else {
        targetX = rnd(-vw * 0.75, vw * 0.75);
        targetY = rnd(-vh * 0.55, vh * 0.55);
        targetZ = rnd(1.1, 2.2);
      }

      targetX = THREE.MathUtils.clamp(targetX, -vw * 0.86, vw * 0.86);
      targetY = THREE.MathUtils.clamp(targetY, -vh * 0.65, vh * 0.68);
      targetZ = THREE.MathUtils.clamp(targetZ, 0.9, 2.3);

      return new THREE.Vector3(targetX, targetY, targetZ);
    };

    // Bird Flight State: Tuned 30% slower for graceful, non-distracting hero ambiance
    const birdState = {
      pos: new THREE.Vector3(-2.2, 0.8, 1.4),
      target: new THREE.Vector3(-1.0, 0.4, 1.2),
      yaw: 0,
      pitch: 0,
      bank: 0,
      yawRate: 0,
      speed: 1.45, // Reduced by 30% from 2.2
      isGliding: false,
      glideTimer: 0,
      flapPhase: 0,
      waypointTimer: 0
    };

    // Courier State for Micro-Paper Delivery
    let courierTimer = 0;
    let courierPhase = 0; // 0=roaming, 1=carrying, 2=parabolic toss, 3=absorption ripple
    let courierProgress = 0;
    const throwStartPos = new THREE.Vector3();
    const throwDestPos = new THREE.Vector3();
    let rippleProg = 1.0;

    // ─────────────────────────────────────────────────────────────
    // 5. DRAG TO ROTATE (DIRECTLY OVER EARTH GLOBE)
    // ─────────────────────────────────────────────────────────────
    let isDragging = false;
    let prevX = 0;
    let rotVelY = 0;
    let targetRotY = 0;

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const globeScreen = projectToScreen(masterGlobe.position);
      const screenGlobeR = (GLOBE_R / 5.2) * (H / (2 * Math.tan(THREE.MathUtils.degToRad(19))));
      const dist = Math.hypot(clickX - globeScreen.x, clickY - globeScreen.y);

      // Only initiate globe dragging when clicking near Earth globe
      if (dist < screenGlobeR * 1.6) {
        isDragging = true;
        prevX = e.clientX;
        rotVelY = 0;
        canvas.setPointerCapture(e.pointerId);
      }
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

      const vh = 5.2 * Math.tan(THREE.MathUtils.degToRad(19));
      const vw = vh * (W / H);
      if (W >= 900) {
        masterGlobe.position.x = 0.42 * vw;
      } else {
        masterGlobe.position.x = 0;
      }
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

      // 1. Globe Panoramic Positioning & Soft Levitation
      const vh = 5.2 * Math.tan(THREE.MathUtils.degToRad(19));
      const vw = vh * (W / H);
      if (W >= 900) {
        masterGlobe.position.x = 0.42 * vw;
        masterGlobe.position.y = Math.sin(elapsed * 0.9) * 0.03;
      } else {
        masterGlobe.position.x = 0;
        masterGlobe.position.y = -vh * 0.28 + Math.sin(elapsed * 0.9) * 0.03;
      }

      // 2. Drag & Natural Earth Rotation
      if (!isDragging) {
        rotVelY *= 0.94;
        targetRotY += rotVelY;
      }
      spinGroup.rotation.y += (targetRotY - spinGroup.rotation.y) * 0.08;

      // Slow continuous rotation of the Earth model
      earthMesh.rotation.y += 0.0024;
      scanRing.rotation.z = elapsed * 0.5;

      // 3. Citation Arc Photon Pulses
      photonBeads.forEach((bead, i) => {
        const curve = arcCurves[i];
        if (curve) {
          const t = (elapsed * 0.35 + i * 0.18) % 1.0;
          bead.position.copy(curve.getPoint(t));
        }
      });

      // ─────────────────────────────────────────────────────────
      // 4. BIRD AERODYNAMICS (PEACEFUL & SOARING, -30% SPEED)
      // ─────────────────────────────────────────────────────────
      birdState.waypointTimer += dt;
      const bDist = birdState.pos.distanceTo(birdState.target);
      if (bDist < 0.45 || birdState.waypointTimer > 7.0) {
        birdState.target = getNextWaypoint();
        birdState.waypointTimer = 0;
      }

      // Aerodynamic steering
      const bDx = birdState.target.x - birdState.pos.x;
      const bDy = birdState.target.y - birdState.pos.y;
      const bDz = birdState.target.z - birdState.pos.z;
      const bTotalDist = Math.hypot(bDx, bDy, bDz) || 1;

      // Desired yaw and pitch
      const desiredYaw = Math.atan2(bDx, bDz);
      let diffYaw = desiredYaw - birdState.yaw;
      diffYaw = Math.atan2(Math.sin(diffYaw), Math.cos(diffYaw));

      const maxTurn = bDist < 1.0 ? 2.2 : 1.4;
      birdState.yawRate += (THREE.MathUtils.clamp(diffYaw * 1.8, -maxTurn, maxTurn) - birdState.yawRate) * Math.min(1, dt * 3.5);
      birdState.yaw += birdState.yawRate * dt;

      const desiredPitch = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(bDy / bTotalDist, -0.5, 0.5)), -0.45, 0.45);
      birdState.pitch += (desiredPitch - birdState.pitch) * Math.min(1, dt * 2.2);

      // Roll realistically into turns
      birdState.bank += (THREE.MathUtils.clamp(-birdState.yawRate * 0.55, -0.65, 0.65) - birdState.bank) * Math.min(1, dt * 3.2);

      // Speed modulation: 30% slower than before (cruises ~1.4, clamped 1.1 to 2.2)
      const targetSpeed = 1.45 - birdState.pitch * 0.7;
      birdState.speed = THREE.MathUtils.clamp(birdState.speed + (targetSpeed - birdState.speed) * dt * 1.8, 1.1, 2.2);

      // Forward flight translation
      const bFw = new THREE.Vector3(
        Math.cos(birdState.pitch) * Math.sin(birdState.yaw),
        Math.sin(birdState.pitch),
        Math.cos(birdState.pitch) * Math.cos(birdState.yaw)
      );
      birdState.pos.addScaledVector(bFw, birdState.speed * dt);
      keepOut(birdState.pos, GLOBE_R * 1.25);

      // Gliding vs Flapping state transitions
      birdState.glideTimer -= dt;
      if (birdState.glideTimer <= 0) {
        birdState.isGliding = !birdState.isGliding && Math.abs(diffYaw) < 0.35 && birdState.pitch < 0.15;
        birdState.glideTimer = birdState.isGliding ? rnd(1.8, 3.2) : rnd(1.6, 2.8);
      }

      birdState.flapPhase += dt * (birdState.isGliding ? 0.6 : 8.5);

      // Wing kinematics
      if (birdState.isGliding) {
        const soarSh = 0.16 + 0.03 * Math.sin(elapsed * 1.2);
        const soarHand = -0.05;
        wl.sh.rotation.z = soarSh;
        wr.sh.rotation.z = -soarSh;
        wl.hand.rotation.z = soarHand;
        wr.hand.rotation.z = -soarHand;
      } else {
        const flap = Math.sin(birdState.flapPhase);
        const shAngle = 0.10 + 0.65 * flap;
        const handAngle = 0.42 * Math.sin(birdState.flapPhase - 1.15);
        wl.sh.rotation.z = shAngle;
        wr.sh.rotation.z = -shAngle;
        wl.hand.rotation.z = handAngle;
        wr.hand.rotation.z = -handAngle;
      }

      birdRoot.position.copy(birdState.pos);
      birdRoot.rotation.set(-birdState.pitch, birdState.yaw, birdState.bank);

      // ── Update Aerodynamic Trail History ──
      const tailPos = birdRoot.position.clone().add(
        new THREE.Vector3(0, -0.01, -0.06).applyEuler(birdRoot.rotation)
      );
      trailHistory.unshift(tailPos);
      if (trailHistory.length > TRAIL_LEN) trailHistory.pop();
      for (let i = 0; i < trailHistory.length; i++) {
        trailPositions[i * 3] = trailHistory[i].x;
        trailPositions[i * 3 + 1] = trailHistory[i].y;
        trailPositions[i * 3 + 2] = trailHistory[i].z;
      }
      trailGeo.attributes.position.needsUpdate = true;

      // ─────────────────────────────────────────────────────────
      // 5. MICRO-PAPER COURIER & REFINED PARABOLIC THROW
      // ─────────────────────────────────────────────────────────
      courierTimer += dt;
      if (courierPhase === 0 && courierTimer > 15.0) {
        courierTimer = 0;
        courierPhase = 1;
        courierProgress = 0;
        activePaper.visible = true;
        paperMat.opacity = 0;
      }

      if (courierPhase === 1) {
        // Phase 1: Bird carrying the small paper
        courierProgress += dt * 0.75;
        paperMat.opacity = Math.min(1.0, courierProgress * 2.0);
        activePaper.position.copy(birdRoot.position).add(
          new THREE.Vector3(0, -0.045, 0.02).applyEuler(birdRoot.rotation)
        );
        activePaper.rotation.copy(birdRoot.rotation);

        if (courierProgress >= 1.0) {
          courierPhase = 2; // RELEASE & THROW!
          courierProgress = 0;
          throwStartPos.copy(activePaper.position);
          const randAngle = rnd(-0.6, 0.6);
          throwDestPos.set(
            masterGlobe.position.x + Math.sin(randAngle) * GLOBE_R * 0.82,
            masterGlobe.position.y + rnd(-GLOBE_R * 0.35, GLOBE_R * 0.35),
            GLOBE_R * 0.98
          );
        }
      } else if (courierPhase === 2) {
        // Phase 2: Parabolic toss arc toward the Earth
        courierProgress += dt * 1.1;
        const t = Math.min(1.0, courierProgress);
        const arcY = Math.sin(t * Math.PI) * 0.16;
        activePaper.position.lerpVectors(throwStartPos, throwDestPos, t);
        activePaper.position.y += arcY;

        // Realistic aerodynamic paper tumble in flight
        activePaper.rotation.x += dt * 4.2;
        activePaper.rotation.y += dt * 2.6;
        activePaper.rotation.z += dt * 1.4;

        if (courierProgress >= 1.0) {
          courierPhase = 3;
          courierProgress = 0;
          rippleProg = 0;
          rippleMesh.position.copy(throwDestPos);
          rippleMesh.quaternion.copy(camera.quaternion);
          activePaper.visible = false;
          paperMat.opacity = 0;
        }
      } else if (courierPhase === 3) {
        // Phase 3: Absorption ripple on Earth surface
        courierProgress += dt * 2.0;
        if (courierProgress >= 1.0) {
          courierPhase = 0;
          courierTimer = 0;
        }
      }

      if (rippleProg < 1.0) {
        rippleProg += dt * 1.6;
        rippleMesh.scale.setScalar(0.25 + rippleProg * 1.4);
        rippleMat.opacity = (1.0 - rippleProg) * 0.85;
      } else {
        rippleMat.opacity = 0;
      }

      // ─────────────────────────────────────────────────────────
      // 6. DECLUTTERED, BALANCED HUD PILL POSITIONS & CLEAN LEADER LINES
      // ─────────────────────────────────────────────────────────
      const newPos: Record<
        string,
        { x: number; y: number; startX: number; startY: number; ax: number; ay: number }
      > = {};

      const globeScreen = projectToScreen(masterGlobe.position);
      const G_X = globeScreen.x;
      const G_Y = globeScreen.y;
      const screenGlobeR = (GLOBE_R / 5.2) * (H / (2 * Math.tan(THREE.MathUtils.degToRad(19))));
      const pillGap = Math.max(72, Math.min(98, W * 0.07));

      pillDefs.forEach(p => {
        let px = 0;
        let py = G_Y + p.slotYOffset * screenGlobeR * 0.85;
        let startX = 0;
        const startY = py;
        let ax = 0;
        let ay = 0;

        if (p.side === 'left') {
          px = G_X - screenGlobeR - pillGap;
          startX = px + 54; // Right edge of left pill
          // Connects strictly to the left rim of the Earth (NEVER crosses over or behind)
          ax = G_X - screenGlobeR * Math.cos(p.rimAngle);
          ay = G_Y + screenGlobeR * Math.sin(p.rimAngle);
        } else if (p.side === 'right') {
          px = G_X + screenGlobeR + pillGap;
          startX = px - 54; // Left edge of right pill
          // Connects strictly to the right rim of the Earth
          ax = G_X + screenGlobeR * Math.cos(p.rimAngle);
          ay = G_Y + screenGlobeR * Math.sin(p.rimAngle);
        } else {
          // Bottom center pill
          px = G_X;
          py = G_Y + screenGlobeR + 28;
          startX = px;
          ax = G_X;
          ay = G_Y + screenGlobeR * 0.98;
        }

        px = THREE.MathUtils.clamp(px, 55, W - 55);
        py = THREE.MathUtils.clamp(py, 22, H - 22);

        newPos[p.id] = {
          x: px,
          y: py,
          startX,
          startY,
          ax,
          ay
        };
      });

      setPillPositions(newPos);

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
      className="relative w-full h-full min-h-[420px] lg:min-h-[446px] select-none flex items-center justify-center overflow-visible"
    >
      {/* 3D WebGL Canvas — Transparent alpha, blends cleanly into mountain background image */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-default active:cursor-grabbing block focus:outline-none pointer-events-auto"
        style={{ background: 'transparent' }}
        aria-label="3D Knowledge Earth with soaring research courier bird"
      />

      {/* SVG Connector Lines from HUD Pills to 3D Earth Rim Anchors (Clean, Non-Overlapping) */}
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
              {/* Clean, short connector line from pill edge directly to its local globe rim anchor */}
              <line
                x1={pos.startX}
                y1={pos.startY}
                x2={pos.ax}
                y2={pos.ay}
                stroke={p.color}
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              {/* Subtle glowing anchor beacon dot on the globe rim */}
              <circle
                cx={pos.ax}
                cy={pos.ay}
                r="2.8"
                fill={p.color}
                filter="url(#coreGlow)"
              />
            </g>
          );
        })}
      </svg>

      {/* 7 Neatly Arranged Non-Overlapping Interactive HUD Pills */}
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

      {/* Drag hint at bottom right */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/60 dark:bg-black/60 border border-white/10 text-[9.5px] text-cyan-200/80 pointer-events-none backdrop-blur-sm z-10">
        <RotateCcw className="w-2.5 h-2.5 text-cyan-400" />
        <span>Drag to rotate Earth</span>
      </div>
    </div>
  );
};
