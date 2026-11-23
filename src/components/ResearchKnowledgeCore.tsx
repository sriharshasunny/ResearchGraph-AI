import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { GLOBE_RAW_BASE64 } from './researchGraphGlobeRaw';
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

  const handleAction = useCallback((page: any) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      setActivePage(page);
    }
  }, [onNavigate, setActivePage]);

  const handleSearch = useCallback((term: string) => {
    if (onNavigate) {
      onNavigate(term);
    } else {
      setSearchQuery(term);
      setActivePage('search');
    }
  }, [onNavigate, setSearchQuery, setActivePage]);

  // 7 Orbital Navigation Pills positioned around the 3D globe and mountain horizon
  const pillDefs = [
    { id: 'graph', name: 'Knowledge Graph', tag: 'AI-Core', color: '#10b981', icon: Network, action: () => handleAction('graph'), wp: new THREE.Vector3(-1.85, 1.05, 0.2), ap: new THREE.Vector3(-0.95, 0.45, 0.65) },
    { id: 'papers', name: 'Research Papers', tag: '204M+', color: '#38bdf8', icon: FileText, action: () => handleAction('search'), wp: new THREE.Vector3(1.85, 1.05, 0.2), ap: new THREE.Vector3(0.95, 0.45, 0.65) },
    { id: 'insights', name: 'AI Insights', tag: 'Consensus', color: '#a855f7', icon: Sparkles, action: () => handleAction('chat'), wp: new THREE.Vector3(-2.10, 0.15, 0.2), ap: new THREE.Vector3(-1.15, 0.05, 0.5) },
    { id: 'authors', name: 'Authors', tag: '12.4M+', color: '#14b8a6', icon: Users, action: () => handleSearch('Research authors'), wp: new THREE.Vector3(2.10, 0.15, 0.2), ap: new THREE.Vector3(1.15, 0.05, 0.5) },
    { id: 'concepts', name: 'Concepts', tag: '1.8M+', color: '#818cf8', icon: Layers, action: () => handleSearch('Ontological concepts'), wp: new THREE.Vector3(-1.75, -0.75, 0.2), ap: new THREE.Vector3(-0.85, -0.45, 0.65) },
    { id: 'datasets', name: 'Datasets', tag: '85K+', color: '#f59e0b', icon: Database, action: () => handleSearch('Empirical datasets'), wp: new THREE.Vector3(1.85, -0.75, 0.2), ap: new THREE.Vector3(0.85, -0.45, 0.65) },
    { id: 'citations', name: 'Citations', tag: '1.24B+', color: '#ec4899', icon: Link2, action: () => handleAction('graph'), wp: new THREE.Vector3(0.0, -1.35, 0.8), ap: new THREE.Vector3(0.0, -0.95, 0.65) }
  ];

  const [pillPositions, setPillPositions] = useState<{ [key: string]: { x: number; y: number; ax: number; ay: number } }>({});
  const [ufoPos, setUfoPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 640;
    let height = container.clientHeight || 420;

    // 1. WebGL Renderer with full alpha transparency (no background clipping)
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

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 5.2);
    camera.lookAt(0, 0, 0);

    // 3. Lighting: Crisp Sun from upper-left + soft ambient + subtle rim
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunDir = new THREE.Vector3(-0.62, 0.45, 0.64).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.45);
    sunLight.position.copy(sunDir).multiplyScalar(10);
    scene.add(sunLight);

    const terrainFill = new THREE.DirectionalLight(0x38bdf8, 0.45);
    terrainFill.position.set(3, -2, 4);
    scene.add(terrainFill);

    // 4. Master Levitation & Rotation Root Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ─────────────────────────────────────────────────────────────
    // A. PROCEDURAL TEXTURES FROM GLOBE_RAW_BASE64 (HIGH-FIDELITY)
    // ─────────────────────────────────────────────────────────────
    const MW = 1440;
    const MH = 720;
    const raw = atob(GLOBE_RAW_BASE64);
    const land = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) {
      land[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    }

    function isLand(la: number, lo: number) {
      const u = (Math.floor((lo + 180) / 360 * MW) % MW + MW) % MW;
      const v = Math.min(MH - 1, Math.max(0, Math.floor((90 - la) / 180 * MH)));
      return land[v * MW + u];
    }

    const createTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d')!;
      draw(ctx);
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      return tex;
    };

    // 1. Photorealistic Satellite Day Texture (Natural Earth Tones, Polar Ice, Desert Ochre)
    const dayTexture = createTex(1024, 512, ctx => {
      const img = ctx.createImageData(1024, 512);
      const d = img.data;
      for (let j = 0; j < 512; j++) {
        const lat = 90 - (j / 512) * 180;
        const absLat = Math.abs(lat);
        for (let i = 0; i < 1024; i++) {
          const lon = (i / 1024) * 360 - 180;
          const idx = (j * 1024 + i) * 4;
          const l = isLand(lat, lon);
          if (l) {
            if (absLat > 64) {
              // Polar Ice Caps (Greenland, Antarctica, Siberia) - Crisp White/Ice
              d[idx + 0] = 230; d[idx + 1] = 240; d[idx + 2] = 250;
            } else if (lat > 15 && lat < 34 && lon > -15 && lon < 55) {
              // Sahara & Arabian Deserts - Warm Sand Ochre
              d[idx + 0] = 168; d[idx + 1] = 138; d[idx + 2] = 88;
            } else if (lat < -18 && lat > -32 && lon > 115 && lon < 145) {
              // Australian Outback - Red Earth
              d[idx + 0] = 175; d[idx + 1] = 105; d[idx + 2] = 65;
            } else {
              // Temperate Forests & Rainforests - Lush Natural Green
              const v = (Math.sin(lat * 0.15) * Math.cos(lon * 0.15) + 1) * 0.5;
              d[idx + 0] = Math.floor(45 + v * 30);
              d[idx + 1] = Math.floor(95 + v * 35);
              d[idx + 2] = Math.floor(52 + v * 20);
            }
          } else {
            // Realistic Deep Ocean (Navy Blue, zero fluorescent cyan)
            const depth = absLat / 90;
            d[idx + 0] = Math.floor(10 + depth * 8);
            d[idx + 1] = Math.floor(28 + depth * 16);
            d[idx + 2] = Math.floor(58 + depth * 22);
          }
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    });

    // 2. Realistic Night City Lights (Warm Amber, Clustered along true populated centers)
    const nightTexture = createTex(1024, 512, ctx => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 512);
      ctx.fillStyle = 'rgba(255, 210, 110, 0.95)';
      for (let j = 0; j < 512; j += 2) {
        const lat = 90 - (j / 512) * 180;
        if (Math.abs(lat) > 65) continue;
        for (let i = 0; i < 1024; i += 2) {
          const lon = (i / 1024) * 360 - 180;
          if (isLand(lat, lon)) {
            const isPopulated = (
              (lat > 22 && lat < 55 && lon > -125 && lon < -68) || // North America
              (lat > 35 && lat < 60 && lon > -10 && lon < 45) ||   // Europe
              (lat > 15 && lat < 45 && lon > 70 && lon < 142) ||   // East/South Asia
              (lat > -35 && lat < -10 && lon > -60 && lon < -35)   // South America coast
            );
            const prob = isPopulated ? 0.38 : 0.06;
            if (Math.random() < prob) {
              const sz = Math.random() < 0.25 ? 2.0 : 1.1;
              ctx.fillRect(i, j, sz, sz);
            }
          }
        }
      }
    });

    // 3. Specular Map (Ocean is high gloss, Land is pure matte)
    const specTexture = createTex(512, 256, ctx => {
      const img = ctx.createImageData(512, 256);
      const d = img.data;
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
    });

    // 4. Subtle Photorealistic Clouds Texture
    const cloudTexture = createTex(512, 256, ctx => {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 256);
      for (let k = 0; k < 90; k++) {
        const x = Math.random() * 512;
        const y = 30 + Math.random() * 196;
        const rx = 18 + Math.random() * 45;
        const ry = 6 + Math.random() * 14;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rx);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.16)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * 0.3 - 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // B. CLEAN, PHOTOREALISTIC EARTH GLOBE (NO HEAVY BLUE HALO)
    // ─────────────────────────────────────────────────────────────
    const globeGroup = new THREE.Group();
    // Floating centered slightly above the mountain ridges
    globeGroup.position.set(0, 0.28, 0);
    masterGroup.add(globeGroup);

    const GLOBE_R = 1.18;

    // Realistic Earth Shader: Zero cartoonish blue aura!
    // Paper-thin, delicate Rayleigh limb scattering only on the sunlit edge
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayT: { value: dayTexture },
        nightT: { value: nightTexture },
        specT: { value: specTexture },
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

          // Day diffuse with natural sun color + night city lights on shadow hemisphere
          vec3 col = day * (0.12 + 1.15 * max(0.0, nd)) * mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.98, 0.92), lit);
          col += night * (1.0 - lit) * 1.6;

          // Sharp natural specular sun glint on oceans
          vec3 H = normalize(sun + V);
          col += vec3(1.0, 0.98, 0.92) * pow(max(dot(N, H), 0.0), 240.0) * spec * 0.75 * step(0.0, nd);

          // Paper-thin realistic limb scattering (NO wide blurry blue aura!)
          float limb = pow(1.0 - max(dot(N, V), 0.0), 4.2);
          col += vec3(0.22, 0.55, 0.90) * limb * smoothstep(-0.2, 0.4, nd) * 0.42;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 64, 48), earthMat);
    globeGroup.add(earthMesh);

    // Natural clouds layer
    const cloudsMat = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R * 1.012, 64, 48), cloudsMat);
    globeGroup.add(cloudsMesh);

    // Citation Arcs on Earth surface
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const latLonToV3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    const hubs = [
      latLonToV3(42.36, -71.09, GLOBE_R), // Boston
      latLonToV3(37.42, -122.17, GLOBE_R), // SF
      latLonToV3(51.50, -0.12, GLOBE_R),  // London
      latLonToV3(35.68, 139.76, GLOBE_R), // Tokyo
      latLonToV3(1.35, 103.82, GLOBE_R),  // Singapore
      latLonToV3(-33.86, 151.21, GLOBE_R) // Sydney
    ];

    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const photonBeads: THREE.Mesh[] = [];

    [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5]].forEach(([iA, iB]) => {
      const pA = hubs[iA];
      const pB = hubs[iB];
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(GLOBE_R * 1.25);
      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      arcCurves.push(curve);

      const pts = curve.getPoints(24);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      arcGroup.add(new THREE.Line(curveGeo, curveMat));

      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      arcGroup.add(bead);
      photonBeads.push(bead);
    });

    // ─────────────────────────────────────────────────────────────
    // C. 3D MOUNTAIN LANDSCAPE & RESEARCH OUTPOSTS AT BASE
    // ─────────────────────────────────────────────────────────────
    const terrainGroup = new THREE.Group();
    // Positioned below the globe across the lower horizon
    terrainGroup.position.set(0, -1.35, -0.2);
    masterGroup.add(terrainGroup);

    // Procedural Mountain Terrain Plane
    const terrainW = 12.0;
    const terrainD = 7.0;
    const segX = 80;
    const segZ = 48;
    const terrainGeo = new THREE.PlaneGeometry(terrainW, terrainD, segX, segZ);
    // Orient plane so it stretches across ground plane
    terrainGeo.rotateX(-Math.PI * 0.44);

    const tPositions = terrainGeo.attributes.position;
    for (let i = 0; i < tPositions.count; i++) {
      const x = tPositions.getX(i);
      const z = tPositions.getZ(i);

      // Multi-octave procedural mountain peaks and valley passes
      const n1 = Math.sin(x * 0.7 + 1.2) * Math.cos(z * 0.8 - 0.5) * 0.55;
      const n2 = Math.sin(x * 1.6 - z * 1.3) * Math.cos(z * 1.4 + x * 0.5) * 0.28;
      const n3 = Math.sin(x * 3.2 + z * 2.4) * 0.12;
      const h = n1 + n2 + n3;

      // Gentle valley in center so the globe sits clearly above
      const distFromCenter = Math.sqrt(x * x * 0.7 + z * z);
      const valley = Math.min(1.0, 0.4 + distFromCenter * 0.25);

      // Taper down at front camera edge for seamless blending
      const frontTaper = Math.max(0.0, Math.min(1.0, (1.8 - z) * 0.6));

      const finalY = (h * valley * 0.85) * frontTaper;
      tPositions.setY(i, finalY);
    }
    terrainGeo.computeVertexNormals();

    // Dark Obsidian / Slate Mountain Material with atmospheric mountain lighting
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x111c34,
      roughness: 0.86,
      metalness: 0.24,
      flatShading: true
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainGroup.add(terrainMesh);

    // Mountain Wireframe Ridge Accent (Futuristic holographic contours)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a6a,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wireMesh = new THREE.Mesh(terrainGeo, wireMat);
    wireMesh.position.y += 0.005;
    terrainGroup.add(wireMesh);

    // Mountain Research Outposts with Glowing Beacons & Document Cache
    const outposts = [
      { id: 'station-a', pos: new THREE.Vector3(-2.6, 0.35, -0.6), color: 0x10b981 }, // West Valley Station
      { id: 'station-b', pos: new THREE.Vector3(0.0, -0.15, 0.4), color: 0xa855f7 },  // Center Canyon Station
      { id: 'station-c', pos: new THREE.Vector3(2.5, 0.42, -0.5), color: 0x38bdf8 }   // East Ridge Station
    ];

    const outpostPapers: THREE.Mesh[] = [];

    outposts.forEach(op => {
      // Beacon base pad
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
      );
      pad.position.copy(op.pos);
      terrainGroup.add(pad);

      // Glowing beacon light ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.20, 0.018, 8, 24),
        new THREE.MeshBasicMaterial({ color: op.color })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(op.pos).add(new THREE.Vector3(0, 0.04, 0));
      terrainGroup.add(ring);

      // Paper Document resting over beacon
      const pDoc = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 0.24),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      pDoc.rotation.x = -Math.PI / 3;
      pDoc.position.copy(op.pos).add(new THREE.Vector3(0, 0.16, 0));
      terrainGroup.add(pDoc);
      outpostPapers.push(pDoc);
    });

    // ─────────────────────────────────────────────────────────────
    // D. 3D UFO RECON CRAFT (PATROLLING MOUNTAINS & ORBIT)
    // ─────────────────────────────────────────────────────────────
    const ufoGroup = new THREE.Group();
    // Saucer Disc Hull
    const saucerGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.09, 24);
    const saucerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.25 });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    ufoGroup.add(saucer);

    // Cabin Dome
    const domeGeo = new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.85 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.045;
    ufoGroup.add(dome);

    // Rotating Rim Light Ring
    const rimGeo = new THREE.TorusGeometry(0.46, 0.022, 8, 24);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    ufoGroup.add(rim);

    // Downward Tractor Beam Cone
    const tractorGeo = new THREE.ConeGeometry(0.55, 1.4, 24, 1, true);
    const tractorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const tractorBeam = new THREE.Mesh(tractorGeo, tractorMat);
    tractorBeam.rotation.x = Math.PI;
    tractorBeam.position.y = -0.75;
    ufoGroup.add(tractorBeam);

    const UFO_ORBIT_POS = new THREE.Vector3(1.85, 1.45, 0.35);
    ufoGroup.position.copy(UFO_ORBIT_POS);
    ufoGroup.rotation.set(0.18, -0.4, 0.12);
    masterGroup.add(ufoGroup);

    // ─────────────────────────────────────────────────────────────
    // E. 3D CYBER BIRD (SWOOPING THROUGH MOUNTAIN CANYONS)
    // ─────────────────────────────────────────────────────────────
    const birdGroup = new THREE.Group();
    const birdMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.5,
      side: THREE.DoubleSide
    });

    // Bird Body
    const bodyGeo = new THREE.ConeGeometry(0.09, 0.48, 4);
    bodyGeo.rotateX(Math.PI / 2);
    const birdBody = new THREE.Mesh(bodyGeo, birdMat);
    birdGroup.add(birdBody);

    // Articulated Wings
    const wingL = new THREE.Group();
    const wingR = new THREE.Group();

    const wingGeo = new THREE.BufferGeometry();
    const wVerts = new Float32Array([
      0, 0, 0,
      -0.48, 0.08, -0.22,
      -0.32, 0, 0.26
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(wVerts, 3));
    wingGeo.computeVertexNormals();

    const wMeshL = new THREE.Mesh(wingGeo, birdMat);
    wingL.add(wMeshL);

    const wingGeoR = new THREE.BufferGeometry();
    const wVertsR = new Float32Array([
      0, 0, 0,
      0.48, 0.08, -0.22,
      0.32, 0, 0.26
    ]);
    wingGeoR.setAttribute('position', new THREE.BufferAttribute(wVertsR, 3));
    wingGeoR.computeVertexNormals();

    const wMeshR = new THREE.Mesh(wingGeoR, birdMat);
    wingR.add(wMeshR);

    birdGroup.add(wingL);
    birdGroup.add(wingR);

    const BIRD_ORBIT_POS = new THREE.Vector3(-1.75, 1.40, 0.3);
    birdGroup.position.copy(BIRD_ORBIT_POS);
    masterGroup.add(birdGroup);

    // ─────────────────────────────────────────────────────────────
    // F. COURIER FLIGHT IN MOUNTAINS & PAPER COLLECTION
    // ─────────────────────────────────────────────────────────────
    // The active paper mesh being carried from mountain to globe
    const activePaperGeo = new THREE.PlaneGeometry(0.20, 0.26);
    const activePaperMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const activePaper = new THREE.Mesh(activePaperGeo, activePaperMat);
    activePaper.rotation.x = -Math.PI / 3;
    scene.add(activePaper);

    // Expanding ripple ring on the Earth globe when a paper is merged
    const rippleGeo = new THREE.RingGeometry(0.04, 0.09, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    scene.add(rippleMesh);

    // Courier State Machine:
    // 0: Patrol high orbit
    // 1: Dive down into mountains to outpost
    // 2: Collect paper (tractor beam / talon grab)
    // 3: Climb out of mountain pass towards Earth globe
    // 4: Throw / merge paper into globe
    // 5: Bank away & return to patrol
    let courierTimer = 0;
    let courierType: 'bird' | 'ufo' = 'bird';
    let courierPhase = 0;
    let courierProgress = 0;
    let targetOutpostIdx = 0;
    let rippleProgress = 1.0;

    // ─────────────────────────────────────────────────────────────
    // G. DRAG TO ROTATE & POINTER CONTROLS
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
      width = container.clientWidth || 640;
      height = container.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const projectToScreen = (v: THREE.Vector3) => {
      const p = v.clone().project(camera);
      return {
        x: (p.x + 1) * 0.5 * width,
        y: (1 - p.y) * 0.5 * height
      };
    };

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Master Group Floating Levitation
      masterGroup.position.y = Math.sin(elapsed * 1.2) * 0.04;

      // 2. Drag Rotation with inertia
      if (!isDragging) {
        rotVelY *= 0.94;
        targetRotY += rotVelY;
      }
      masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.08;

      // 3. Earth Globe slow spin
      earthMesh.rotation.y += 0.0035;
      cloudsMesh.rotation.y += 0.0042;

      // 4. Citation arc photon packets
      photonBeads.forEach((bead, i) => {
        const curve = arcCurves[i];
        if (curve) {
          const prog = (elapsed * 0.4 + i * 0.2) % 1.0;
          bead.position.copy(curve.getPoint(prog));
        }
      });

      // 5. Outpost Papers gentle hover
      outpostPapers.forEach((p, i) => {
        p.position.y = outposts[i].pos.y + 0.16 + Math.sin(elapsed * 2.5 + i) * 0.025;
        p.rotation.z = Math.sin(elapsed * 1.5 + i) * 0.08;
      });

      // 6. Courier Flight Cycle (Mountain Dive -> Paper Collection -> Globe Throw)
      courierTimer += dt;
      if (courierPhase === 0 && courierTimer > 6.0) {
        courierTimer = 0;
        courierPhase = 1; // Start dive into mountains
        courierProgress = 0;
        courierType = Math.random() < 0.5 ? 'bird' : 'ufo';
        targetOutpostIdx = Math.floor(Math.random() * outposts.length);
      }

      const outpostPos = outposts[targetOutpostIdx].pos.clone().add(terrainGroup.position);
      const globeTarget = new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        0.35 + (Math.random() - 0.5) * 0.4,
        1.18
      );

      if (courierPhase === 1) {
        // Diving down into the mountain pass toward the outpost
        courierProgress += dt * 0.6;
        const t = Math.min(1.0, courierProgress);

        if (courierType === 'bird') {
          const start = BIRD_ORBIT_POS;
          // Bezier curve through mountain pass
          const mid = new THREE.Vector3(outpostPos.x - 0.8, -0.6, outpostPos.z + 0.4);
          const current = new THREE.Vector3()
            .lerpVectors(start, mid, t)
            .lerp(new THREE.Vector3().lerpVectors(mid, outpostPos, t), t);

          birdGroup.position.copy(current);
          birdGroup.rotation.set(0.35, Math.PI * 0.35, -0.3);
        } else {
          const start = UFO_ORBIT_POS;
          const mid = new THREE.Vector3(outpostPos.x + 0.6, -0.4, outpostPos.z + 0.3);
          const current = new THREE.Vector3()
            .lerpVectors(start, mid, t)
            .lerp(new THREE.Vector3().lerpVectors(mid, outpostPos, t), t);

          ufoGroup.position.copy(current);
          ufoGroup.rotation.set(-0.25, -0.2, 0.25);
        }

        if (courierProgress >= 1.0) {
          courierPhase = 2; // Arrived at mountain outpost
          courierProgress = 0;
          if (courierType === 'ufo') {
            tractorMat.opacity = 0.75;
          }
        }
      } else if (courierPhase === 2) {
        // Collecting paper at the outpost
        courierProgress += dt * 1.8;
        activePaperMat.opacity = Math.min(1.0, courierProgress * 1.5);

        if (courierType === 'bird') {
          activePaper.position.copy(birdGroup.position).add(new THREE.Vector3(0, -0.15, 0.08));
        } else {
          activePaper.position.copy(ufoGroup.position).add(new THREE.Vector3(0, -0.35, 0.05));
        }

        if (courierProgress >= 1.0) {
          courierPhase = 3; // Climb to Earth globe
          courierProgress = 0;
          tractorMat.opacity = 0;
        }
      } else if (courierPhase === 3) {
        // Climbing out of mountain canyon up to the floating Earth globe
        courierProgress += dt * 0.55;
        const t = Math.min(1.0, courierProgress);

        if (courierType === 'bird') {
          const start = outpostPos;
          const mid = new THREE.Vector3(globeTarget.x - 0.5, 0.1, globeTarget.z + 0.3);
          const current = new THREE.Vector3()
            .lerpVectors(start, mid, t)
            .lerp(new THREE.Vector3().lerpVectors(mid, globeTarget, t), t);

          birdGroup.position.copy(current);
          birdGroup.rotation.set(-0.35, Math.PI * 0.45, 0.2);
          activePaper.position.copy(current).add(new THREE.Vector3(0, -0.12, 0.08));
        } else {
          const start = outpostPos;
          const mid = new THREE.Vector3(globeTarget.x + 0.5, 0.2, globeTarget.z + 0.4);
          const current = new THREE.Vector3()
            .lerpVectors(start, mid, t)
            .lerp(new THREE.Vector3().lerpVectors(mid, globeTarget, t), t);

          ufoGroup.position.copy(current);
          ufoGroup.rotation.set(0.15, -0.3, -0.15);
          activePaper.position.copy(current).add(new THREE.Vector3(0, -0.22, 0.05));
        }

        if (courierProgress >= 1.0) {
          courierPhase = 4; // Throw paper into globe
          courierProgress = 0;
          rippleProgress = 0;
          rippleMesh.position.copy(activePaper.position);
          rippleMesh.quaternion.copy(camera.quaternion);
        }
      } else if (courierPhase === 4) {
        // Paper dissolves into globe surface with an expanding ripple
        courierProgress += dt * 2.2;
        activePaperMat.opacity = Math.max(0, 1.0 - courierProgress);
        if (courierProgress >= 1.0) {
          courierPhase = 5; // Return to orbit
          courierProgress = 0;
        }
      } else if (courierPhase === 5) {
        // Banking away into high orbit patrol
        courierProgress += dt * 0.45;
        const t = Math.min(1.0, courierProgress);

        if (courierType === 'bird') {
          birdGroup.position.lerp(BIRD_ORBIT_POS, t);
          birdGroup.rotation.set(0, 0, 0);
        } else {
          ufoGroup.position.lerp(UFO_ORBIT_POS, t);
          ufoGroup.rotation.set(0.18, -0.4, 0.12);
        }

        if (courierProgress >= 1.0) {
          courierPhase = 0;
          courierTimer = 0;
          birdGroup.position.copy(BIRD_ORBIT_POS);
          ufoGroup.position.copy(UFO_ORBIT_POS);
        }
      }

      // Bird wing flap kinematics
      const flap = Math.sin(elapsed * 12) * 0.48;
      wingL.rotation.z = flap;
      wingR.rotation.z = -flap;

      // Ripple effect on paper impact into globe
      if (rippleProgress < 1.0) {
        rippleProgress += dt * 1.6;
        rippleMesh.scale.setScalar(0.2 + rippleProgress * 1.5);
        rippleMat.opacity = (1.0 - rippleProgress) * 0.85;
      } else {
        rippleMat.opacity = 0;
      }

      // 7. Update 2D Screen Positions for HUD Pills and UFO
      masterGroup.updateMatrixWorld(true);
      const newPositions: { [key: string]: { x: number; y: number; ax: number; ay: number } } = {};

      pillDefs.forEach(p => {
        const worldWp = p.wp.clone().applyMatrix4(masterGroup.matrixWorld);
        const worldAp = p.ap.clone().applyMatrix4(masterGroup.matrixWorld);
        const screenWp = projectToScreen(worldWp);
        const screenAp = projectToScreen(worldAp);
        newPositions[p.id] = {
          x: screenWp.x,
          y: screenWp.y,
          ax: screenAp.x,
          ay: screenAp.y
        };
      });

      setPillPositions(newPositions);

      // Project UFO position for RECON tag
      const ufoWorld = ufoGroup.position.clone().applyMatrix4(masterGroup.matrixWorld);
      const ufoScreen = projectToScreen(ufoWorld);
      setUfoPos(ufoScreen);

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
  }, [handleAction, handleSearch]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] sm:h-[430px] lg:h-[450px] select-none flex items-center justify-center overflow-visible"
    >
      {/* 3D WebGL Canvas: 3D Mountains + Realistic Earth + UFO + Bird */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing block focus:outline-none"
        aria-label="3D Mountains and Realistic Knowledge Earth with UFO and Bird"
      />

      {/* Dynamic SVG Connector Lines and Anchor Dots */}
      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
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
                strokeDasharray="3 3"
                opacity="0.65"
              />
              <circle
                cx={pos.ax}
                cy={pos.ay}
                r="3.5"
                fill={p.color}
                className="animate-pulse"
              />
            </g>
          );
        })}
      </svg>

      {/* 7 Interactive Orbital Navigation Pills */}
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
              borderColor: p.color,
              boxShadow: `0 4px 18px rgba(0,0,0,0.45), 0 0 12px ${p.color}40`
            }}
            className="absolute left-0 top-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b142c]/90 hover:bg-[#111f42] text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md transition-transform duration-200 hover:scale-105 border cursor-pointer group"
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }} 
            />
            <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
            <span>{p.name}</span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-bold">
              {p.tag}
            </span>
          </button>
        );
      })}

      {/* RECON SURVEYOR • 02% Badge tracking UFO */}
      {ufoPos && (
        <div
          style={{
            transform: `translate(${ufoPos.x + 28}px, ${ufoPos.y - 24}px) translate(-50%, -50%)`
          }}
          className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#07132b]/85 border border-sky-400/60 text-[9.5px] font-mono text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.45)] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          <span>RECON SURVEYOR • 02%</span>
        </div>
      )}

      {/* Drag hint at bottom */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/60 dark:bg-black/60 border border-white/10 text-[10px] text-cyan-200/80 pointer-events-none backdrop-blur-xs">
        <RotateCcw className="w-2.5 h-2.5 text-cyan-400" />
        <span>Drag to rotate 3D Earth</span>
      </div>
    </div>
  );
};
