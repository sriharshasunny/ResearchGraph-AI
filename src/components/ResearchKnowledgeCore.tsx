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
      slotYOffset: -0.58,
      rimAngle: -0.42
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
      slotYOffset: 0.58,
      rimAngle: 0.42
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
      slotYOffset: -0.58,
      rimAngle: -0.42
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
      slotYOffset: 0.58,
      rimAngle: 0.42
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

    // ── WebGL Renderer: Full Alpha Transparency ──
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

    // ── Lighting (Natural Sun & Soft Sky Fill) ──
    const sunDir = new THREE.Vector3(-0.62, 0.38, 0.69).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    sunLight.position.copy(sunDir).multiplyScalar(20);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xdde8ff, 0.65);
    scene.add(ambientLight);

    const spaceBackLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
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
    // 1. NATURAL, PHOTOREALISTIC EARTH GLOBE FROM LANDING PAGE
    // ─────────────────────────────────────────────────────────────
    const D2R = Math.PI / 180;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const sm = (a: number, b: number, x: number) => {
      x = cl((x - a) / (b - a), 0, 1);
      return x * x * (3 - 2 * x);
    };

    // 3D Noise helpers for natural continental biomes and clouds
    const hs = (x: number, y: number, z: number) => {
      let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };

    const vn = (x: number, y: number, z: number) => {
      const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
      const fx = x - ix, fy = y - iy, fz = z - iz;
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
      const a = lerp(lerp(hs(ix, iy, iz), hs(ix + 1, iy, iz), ux), lerp(hs(ix, iy + 1, iz), hs(ix + 1, iy + 1, iz), ux), uy);
      const b = lerp(lerp(hs(ix, iy, iz + 1), hs(ix + 1, iy, iz + 1), ux), lerp(hs(ix, iy + 1, iz + 1), hs(ix + 1, iy + 1, iz + 1), ux), uy);
      return lerp(a, b, uz);
    };

    const fbm = (x: number, y: number, z: number, oct: number) => {
      let s = 0, a = 0.5;
      for (let i = 0; i < oct; i++) {
        s += a * vn(x, y, z);
        x *= 2.02; y *= 2.02; z *= 2.02;
        a *= 0.5;
      }
      return s;
    };

    // Decode raster landmask from the high-resolution dataset
    const MW = 1440, MH = 720;
    const raw = atob(GLOBE_RAW_BASE64);
    const land = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) {
      land[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    }

    const landAt = (u: number, v: number) => {
      const x = u * MW - 0.5, y = cl(v * MH - 0.5, 0, MH - 1);
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const fx = x - x0, fy = y - y0;
      const X0 = ((x0 % MW) + MW) % MW, X1 = (X0 + 1) % MW, Y1 = Math.min(MH - 1, y0 + 1);
      return lerp(lerp(land[y0 * MW + X0], land[y0 * MW + X1], fx), lerp(land[Y1 * MW + X0], land[Y1 * MW + X1], fx), fy);
    };

    // Coastal bathymetry blur
    const blur = (a: Float32Array, w: number, h: number, r: number) => {
      const t = new Float32Array(a.length);
      for (let y = 0; y < h; y++) {
        let s = 0;
        for (let k = -r; k <= r; k++) s += a[y * w + ((k + w) % w)];
        for (let x = 0; x < w; x++) {
          t[y * w + x] = s / (2 * r + 1);
          s += a[y * w + ((x + r + 1) % w)] - a[y * w + ((x - r + w) % w)];
        }
      }
      const o = new Float32Array(a.length);
      for (let x = 0; x < w; x++) {
        let s = 0;
        for (let k = -r; k <= r; k++) s += t[Math.min(h - 1, Math.max(0, k)) * w + x];
        for (let y = 0; y < h; y++) {
          o[y * w + x] = s / (2 * r + 1);
          s += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x];
        }
      }
      return o;
    };

    const BW = 360, BH = 180;
    let bl = new Float32Array(BW * BH);
    for (let j = 0; j < BH; j++) {
      for (let i = 0; i < BW; i++) bl[j * BW + i] = landAt((i + 0.5) / BW, (j + 0.5) / BH);
    }
    bl = blur(bl, BW, BH, 3);

    const samp = (a: Float32Array, w: number, h: number, u: number, v: number) => {
      const x = u * w - 0.5, y = cl(v * h - 0.5, 0, h - 1);
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const fx = x - x0, fy = y - y0;
      const X0 = ((x0 % w) + w) % w, X1 = (X0 + 1) % w, Y1 = Math.min(h - 1, y0 + 1);
      return lerp(lerp(a[y0 * w + X0], a[y0 * w + X1], fx), lerp(a[Y1 * w + X0], a[Y1 * w + X1], fx), fy);
    };

    // Major global research hubs and metropolitan centers
    const CITIES = [
      [40, -74], [34, -118], [19, -99], [-23, -46], [-34, -58],
      [51, 0], [48, 2], [52, 13], [30, 31], [19, 73], [28, 77],
      [31, 121], [35, 139], [37, 127], [-34, 151], [6, 3], [-26, 28],
      [55, 37], [41, 29], [23, 113], [1, 104], [-12, -77], [4, -74],
      [45, -73], [41, -87], [29, -95], [25, -80], [60, 10], [35, 51],
      [9, -79], [-33, -70], [49, -123], [38, -122], [43, -79], [-1, 36],
      [39, 116], [13, 100], [22, 114], [-6, 106], [14, 121]
    ];

    // Landing Page Realistic Procedural Earth Generator
    const mkLandingEarth = () => {
      const W = 1024, H = 512;
      const c = mkc(W, H), x = c.getContext('2d')!;
      const im = x.createImageData(W, H), d = im.data;
      const cs = mkc(512, 256), xs = cs.getContext('2d')!;
      const is = xs.createImageData(512, 256), ds = is.data;

      for (let j = 0; j < H; j++) {
        const v = (j + 0.5) / H, lat = (0.5 - v) * Math.PI;
        const cla = Math.cos(lat), sla = Math.sin(lat);
        const la = Math.abs(lat) / D2R;

        for (let i = 0; i < W; i++) {
          const u = (i + 0.5) / W, lon = (u - 0.5) * 2 * Math.PI;
          const px = Math.cos(lon) * cla, pz = -Math.sin(lon) * cla;
          const a = sm(0.35, 0.65, landAt(u, v));
          const n1 = fbm(px * 5 + 3, sla * 5, pz * 5, 4);
          const n3 = fbm(px * 2.2, sla * 2.2, pz * 2.2 + 9, 3);
          let r: number, g: number, b: number;

          const sh = sm(0, 0.55, samp(bl, BW, BH, u, v));
          const ob = 0.8 + 0.4 * fbm(px * 8, sla * 8, pz * 8, 2);
          const oi = sm(72, 82, la + (n1 - 0.5) * 10) * 0.9;

          let orr = lerp(6, 24, sh) * ob;
          let og = lerp(26, 96, sh) * ob;
          let obb = lerp(62, 130, sh) * ob;
          orr = lerp(orr, 235, oi);
          og = lerp(og, 240, oi);
          obb = lerp(obb, 248, oi);

          if (a > 0.01) {
            const n2 = fbm(px * 12, sla * 12 + 7, pz * 12, 3);
            const ice = sm(58, 70, la + (n1 - 0.5) * 16);
            const des = Math.exp(-Math.pow((la - 24) / 10, 2)) * sm(0.38, 0.58, n3) * (1 - ice);
            const mt = sm(0.58, 0.72, n2) * 0.7;
            const trop = sm(30, 5, la);
            const bor = sm(45, 62, la);
            const k = 0.8 + 0.4 * n1;

            r = lerp(lerp(78, 34, trop), 52, bor) * k;
            g = lerp(lerp(104, 86, trop), 82, bor) * k;
            b = lerp(lerp(58, 40, trop), 64, bor) * k;

            r = lerp(r, 198, des);
            g = lerp(g, 166, des);
            b = lerp(b, 112, des);
            r = lerp(r, 118, mt);
            g = lerp(g, 104, mt);
            b = lerp(b, 92, mt);
            r = lerp(r, 236, ice);
            g = lerp(g, 242, ice);
            b = lerp(b, 250, ice);

            r = lerp(orr, r, a);
            g = lerp(og, g, a);
            b = lerp(obb, b, a);
          } else {
            r = orr; g = og; b = obb;
          }

          const p = (j * W + i) * 4;
          d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255;
        }
      }
      x.putImageData(im, 0, 0);

      // Ocean Specular Map
      for (let j = 0; j < 256; j++) {
        for (let i = 0; i < 512; i++) {
          const p = (j * 512 + i) * 4;
          const o = landAt((i + 0.5) / 512, (j + 0.5) / 256) > 0.5 ? 0 : 255;
          ds[p] = ds[p + 1] = ds[p + 2] = o;
          ds[p + 3] = 255;
        }
      }
      xs.putImageData(is, 0, 0);

      // Golden Research City Lights on Night Side
      const cn = mkc(1024, 512), xn = cn.getContext('2d')!;
      xn.fillStyle = '#000';
      xn.fillRect(0, 0, 1024, 512);
      xn.globalCompositeOperation = 'lighter';
      const cen = CITIES.map(q => [q[0], q[1], 90]);
      let tr = 0;
      while (cen.length < 150 && tr++ < 3000) {
        const la = Math.asin(rnd(-1, 1)) / D2R, lo = rnd(-180, 180);
        if (Math.abs(la) < 62 && landAt((lo + 180) / 360, (90 - la) / 180) > 0.5) {
          cen.push([la, lo, 40]);
        }
      }
      cen.forEach(q => {
        for (let k = 0; k < q[2]; k++) {
          const la = q[0] + (Math.random() + Math.random() + Math.random() - 1.5) * 3.2;
          const lo = q[1] + (Math.random() + Math.random() + Math.random() - 1.5) * 4.2;
          if (landAt((lo + 180) / 360, (90 - la) / 180) < 0.5) continue;
          xn.fillStyle = `rgba(255, ${190 + (rnd(0, 50) | 0)}, ${110 + (rnd(0, 60) | 0)}, ${rnd(0.35, 0.9)})`;
          const s = rnd(1, 2.2);
          xn.fillRect(((lo + 180) / 360) * 1024, ((90 - la) / 180) * 512, s, s);
        }
      });

      // Natural Atmospheric Swirling Clouds
      const cc = mkc(1024, 512), xc = cc.getContext('2d')!;
      const ic = xc.createImageData(1024, 512), dc = ic.data;
      for (let j = 0; j < 512; j++) {
        const lat = (0.5 - (j + 0.5) / 512) * Math.PI;
        const cla = Math.cos(lat), sla = Math.sin(lat);
        for (let i = 0; i < 1024; i++) {
          const lon = ((i + 0.5) / 1024 - 0.5) * 2 * Math.PI;
          const px = Math.cos(lon) * cla, pz = -Math.sin(lon) * cla;
          const n = fbm(px * 3 + 1.7, sla * 3.4, pz * 3, 5);
          const w = fbm(px * 9, sla * 9, pz * 9, 3);
          const al = sm(0.5, 0.74, n + (w - 0.5) * 0.25);
          const p = (j * 1024 + i) * 4;
          dc[p] = dc[p + 1] = dc[p + 2] = 255;
          dc[p + 3] = al * 215;
        }
      }
      xc.putImageData(ic, 0, 0);

      return { day: tex(c), spec: tex(cs), night: tex(cn), cloud: tex(cc) };
    };

    const E = mkLandingEarth();

    const masterGlobe = new THREE.Group();
    scene.add(masterGlobe);

    const spinGroup = new THREE.Group();
    masterGlobe.add(spinGroup);

    // Globe radius (0.74 proportion blends with hero banner)
    const GLOBE_R = 0.74;

    // Photorealistic Earth Shader identical to landing page
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayT: { value: E.day },
        nightT: { value: E.night },
        specT: { value: E.spec },
        sun: { value: sunDir }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vN, vP;
        void main() {
          vUv = uv;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 w = modelMatrix * vec4(position, 1.0);
          vP = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayT, nightT, specT;
        uniform vec3 sun;
        varying vec2 vUv;
        varying vec3 vN, vP;
        void main() {
          vec3 N = normalize(vN);
          vec3 Vv = normalize(cameraPosition - vP);
          float nd = dot(N, sun);

          // Ambient daylight baseline so the shaded side is softly lit by alpine mountain sky:
          float lit = smoothstep(-0.25, 0.4, nd);
          float dif = max(nd, 0.0);
          float ambient = 0.56 + 0.14 * max(0.0, dot(N, vec3(0.0, 1.0, 0.0)));

          vec3 day = texture2D(dayT, vUv).rgb;
          vec3 nl = texture2D(nightT, vUv).rgb;
          float sp = texture2D(specT, vUv).r;

          vec3 lightColor = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.96, 0.9), lit);
          vec3 col = day * (ambient + 0.85 * dif) * lightColor;

          // Soft golden research city lights visible on the shaded hemisphere:
          col += nl * (1.0 - lit) * 1.15;

          // Ocean specular glint
          vec3 H = normalize(sun + Vv);
          col += vec3(0.9, 0.95, 1.0) * pow(max(dot(N, H), 0.0), 160.0) * sp * 0.55 * step(-0.05, nd);

          // Natural atmospheric limb Fresnel directly on Earth's surface (No outer mesh, zero black ring):
          float f = pow(1.0 - max(dot(N, Vv), 0.0), 3.0);
          col += vec3(0.32, 0.62, 1.0) * f * (0.35 + 0.85 * smoothstep(-0.25, 0.5, nd));

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 96, 64), earthMat);
    spinGroup.add(earthMesh);

    // Natural Clouds Layer from landing page
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R * 1.012, 64, 48),
      new THREE.MeshLambertMaterial({
        map: E.cloud,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      })
    );
    spinGroup.add(cloudsMesh);

    // Subtle Ambient Research Constellation Particles (Twinkling subtle stars/dust across hero mountains)
    const DUST_COUNT = 75;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST_COUNT * 3);
    const dustColors = new Float32Array(DUST_COUNT * 3);
    const dustPhases = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPos[i * 3] = (Math.random() - 0.45) * 11;
      dustPos[i * 3 + 1] = (Math.random() - 0.35) * 4.2;
      dustPos[i * 3 + 2] = rnd(0.2, 3.2);
      const isCyan = Math.random() > 0.45;
      dustColors[i * 3] = isCyan ? 0.38 : 0.98;
      dustColors[i * 3 + 1] = isCyan ? 0.78 : 0.82;
      dustColors[i * 3 + 2] = isCyan ? 1.0 : 0.45;
      dustPhases[i] = Math.random() * Math.PI * 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // ── Global Hub Beacons & Dynamic Citation Arcs ──
    const llToV3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * D2R;
      const th = (lon + 180) * D2R;
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(th)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(th)
      );
    };

    const RESEARCH_CITIES = [
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

    const researchNodes: THREE.Vector3[] = RESEARCH_CITIES.map(c => llToV3(c[0], c[1], GLOBE_R));

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

    // High-visibility scholar bird scale so it roams with presence across the hero banner
    birdRoot.scale.setScalar(0.138);
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
    // Sleek micro folio dimensions (0.065 x 0.088)
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
    // 4. BIRD AUTONOMOUS 3D ROAMING (CONTINUOUSLY VISIBLE, -30% SPEED)
    // ─────────────────────────────────────────────────────────────
    // Collision avoidance buffer with Earth globe in world space
    // CRITICAL: Bird ALWAYS stays in front of the Earth plane (z >= 0.95), never disappears behind globe
    const keepOut = (p: THREE.Vector3, minDist: number) => {
      if (p.z < 0.95) {
        p.z = 0.95;
      }
      const rel = p.clone().sub(masterGlobe.position);
      const len = rel.length();
      if (len < minDist) {
        rel.multiplyScalar(minDist / (len || 0.001));
        if (rel.z < 0.25) rel.z = 0.25;
        p.copy(masterGlobe.position).add(rel);
      }
    };

    // Cross-Banner Waypoint Generator: Ensures bird stays continuously visible across hero section
    const getNextWaypoint = () => {
      const vh = 5.2 * Math.tan(THREE.MathUtils.degToRad(19));
      const vw = vh * (W / H);

      const curX = birdState.pos.x;
      let zone: 'left' | 'center' | 'right';

      if (curX > 0.25 * vw) {
        // Near globe -> glide across mountains toward center or left
        zone = Math.random() < 0.6 ? 'left' : 'center';
      } else if (curX < -0.15 * vw) {
        // Over search/mountains -> cruise toward center or globe
        zone = Math.random() < 0.6 ? 'right' : 'center';
      } else {
        zone = Math.random() < 0.5 ? 'left' : 'right';
      }

      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;

      if (W >= 900) {
        const gX = masterGlobe.position.x || (0.52 * vw);
        if (zone === 'left') {
          targetX = rnd(-vw * 0.46, -vw * 0.10);
          targetY = rnd(-vh * 0.15, vh * 0.42);
          targetZ = rnd(1.15, 1.65);
        } else if (zone === 'center') {
          targetX = rnd(-vw * 0.10, vw * 0.24);
          targetY = rnd(-vh * 0.12, vh * 0.38);
          targetZ = rnd(1.10, 1.55);
        } else {
          // Around and in front of the Earth
          targetX = gX + rnd(-0.62, 0.48);
          targetY = rnd(-vh * 0.20, vh * 0.38);
          targetZ = rnd(1.15, 1.70);
        }
      } else {
        targetX = rnd(-vw * 0.55, vw * 0.55);
        targetY = rnd(-vh * 0.32, vh * 0.35);
        targetZ = rnd(1.15, 1.65);
      }

      // Constrain waypoints strictly inside the visible hero camera frustum
      targetX = THREE.MathUtils.clamp(targetX, -vw * 0.50, vw * 0.84);
      targetY = THREE.MathUtils.clamp(targetY, -vh * 0.32, vh * 0.46);
      targetZ = THREE.MathUtils.clamp(targetZ, 1.05, 1.78);

      return new THREE.Vector3(targetX, targetY, targetZ);
    };

    // Bird Flight State: Tuned 30% slower with active waypoint cycle for continuous visibility
    const birdState = {
      pos: new THREE.Vector3(-1.8, 0.45, 1.35),
      target: new THREE.Vector3(-0.6, 0.25, 1.25),
      yaw: 0,
      pitch: 0,
      bank: 0,
      yawRate: 0,
      speed: 1.45,
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
        masterGlobe.position.x = 0.52 * vw; // Shifted right by 10%
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

      // 1. Globe Panoramic Positioning (10% shifted to the right) & Soft Levitation
      const vh = 5.2 * Math.tan(THREE.MathUtils.degToRad(19));
      const vw = vh * (W / H);
      if (W >= 900) {
        masterGlobe.position.x = 0.52 * vw;
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

      // Slow continuous rotation of the natural Earth and clouds
      earthMesh.rotation.y += 0.0022;
      cloudsMesh.rotation.y += 0.0030;

      // Animate ambient research constellation particles
      const posAttr = dustGeo.attributes.position;
      for (let i = 0; i < DUST_COUNT; i++) {
        const py = posAttr.getY(i) + Math.sin(elapsed * 0.7 + dustPhases[i]) * 0.0006;
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;

      // 3. Citation Arc Photon Pulses
      photonBeads.forEach((bead, i) => {
        const curve = arcCurves[i];
        if (curve) {
          const t = (elapsed * 0.35 + i * 0.18) % 1.0;
          bead.position.copy(curve.getPoint(t));
        }
      });

      // ─────────────────────────────────────────────────────────
      // 4. BIRD AERODYNAMICS (CONTINUOUSLY VISIBLE, -30% SPEED)
      // ─────────────────────────────────────────────────────────
      birdState.waypointTimer += dt;
      const bDist = birdState.pos.distanceTo(birdState.target);
      if (bDist < 0.45 || birdState.waypointTimer > 3.8) {
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

      const maxTurn = bDist < 1.0 ? 2.4 : 1.6;
      birdState.yawRate += (THREE.MathUtils.clamp(diffYaw * 1.8, -maxTurn, maxTurn) - birdState.yawRate) * Math.min(1, dt * 3.8);
      birdState.yaw += birdState.yawRate * dt;

      const desiredPitch = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(bDy / bTotalDist, -0.4, 0.4)), -0.32, 0.32);
      birdState.pitch += (desiredPitch - birdState.pitch) * Math.min(1, dt * 2.5);

      // Roll realistically into turns
      birdState.bank += (THREE.MathUtils.clamp(-birdState.yawRate * 0.55, -0.65, 0.65) - birdState.bank) * Math.min(1, dt * 3.2);

      // Speed modulation: 30% slower (cruises ~1.45)
      const targetSpeed = 1.45 - birdState.pitch * 0.7;
      birdState.speed = THREE.MathUtils.clamp(birdState.speed + (targetSpeed - birdState.speed) * dt * 1.8, 1.1, 2.2);

      // Forward flight translation
      const bFw = new THREE.Vector3(
        Math.cos(birdState.pitch) * Math.sin(birdState.yaw),
        Math.sin(birdState.pitch),
        Math.cos(birdState.pitch) * Math.cos(birdState.yaw)
      );
      birdState.pos.addScaledVector(bFw, birdState.speed * dt);

      // CRITICAL: Ensure bird NEVER drops behind the Earth or outside camera frustum
      birdState.pos.z = THREE.MathUtils.clamp(birdState.pos.z, 0.95, 1.95);
      birdState.pos.x = THREE.MathUtils.clamp(birdState.pos.x, -vw * 0.54, vw * 0.86);
      birdState.pos.y = THREE.MathUtils.clamp(birdState.pos.y, -vh * 0.35, vh * 0.50);
      keepOut(birdState.pos, GLOBE_R * 1.30);

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
      if (courierPhase === 0 && courierTimer > 10.0) {
        courierTimer = 0;
        courierPhase = 1;
        courierProgress = 0;
        activePaper.visible = true;
        paperMat.opacity = 0;
      }

      if (courierPhase === 1) {
        // Phase 1: Bird carrying the small paper
        courierProgress += dt * 0.85;
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
        courierProgress += dt * 1.25;
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
      const pillGap = Math.max(56, Math.min(76, W * 0.055));

      pillDefs.forEach(p => {
        let px = 0;
        let py = G_Y + p.slotYOffset * screenGlobeR * 0.88;
        let startX = 0;
        let startY = py;
        let ax = 0;
        let ay = 0;

        if (p.side === 'left') {
          px = G_X - screenGlobeR - pillGap;
          px = Math.max(px, 74);
          startX = px + 62; // Starts from right edge of left pill
          // Connects strictly to the left rim of the Earth
          ax = G_X - screenGlobeR * Math.cos(p.rimAngle);
          ay = G_Y + screenGlobeR * Math.sin(p.rimAngle);
        } else if (p.side === 'right') {
          px = G_X + screenGlobeR + pillGap;
          px = Math.min(px, W - 78);
          startX = px - 62; // Starts from left edge of right pill
          // Connects strictly to the right rim of the Earth
          ax = G_X + screenGlobeR * Math.cos(p.rimAngle);
          ay = G_Y + screenGlobeR * Math.sin(p.rimAngle);
        } else {
          // Bottom center pill
          px = G_X;
          py = G_Y + screenGlobeR + 32;
          startX = px;
          startY = py - 14;
          ax = G_X;
          ay = G_Y + screenGlobeR;
        }

        py = THREE.MathUtils.clamp(py, 22, H - 24);

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
        aria-label="3D Natural Knowledge Earth with soaring research courier bird"
      />

      {/* SVG Connector Lines from HUD Pills to 3D Earth Rim Anchors (Clean, Non-Overlapping) */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        <defs>
          <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
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
                strokeWidth="1.4"
                strokeDasharray="4 3"
                opacity="0.75"
              />
              {/* Subtle glowing anchor beacon dot on the globe rim */}
              <circle
                cx={pos.ax}
                cy={pos.ay}
                r="3.2"
                fill={p.color}
                filter="url(#coreGlow)"
              />
              <circle
                cx={pos.ax}
                cy={pos.ay}
                r="1.2"
                fill="#ffffff"
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
              borderColor: `${p.color}75`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 14px ${p.color}35`
            }}
            className="absolute left-0 top-0 z-20 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-950/85 dark:bg-[#071328]/90 hover:bg-slate-900 dark:hover:bg-[#0e214d] text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 border cursor-pointer pointer-events-auto whitespace-nowrap group"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: p.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
              />
            </span>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.color }} />
            <span className="leading-none text-slate-100 group-hover:text-white transition-colors">{p.name}</span>
            <span className="text-[9px] sm:text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold leading-none bg-white/10 text-slate-200 border border-white/10 group-hover:bg-white/20 transition-colors">
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
