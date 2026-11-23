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
    else { setSearchQuery(term); setActivePage('search'); }
  }, [onNavigate, setSearchQuery, setActivePage]);

  // 7 Orbital Navigation Pills — anchored to globe surface positions
  const pillDefs = [
    { id: 'graph',    name: 'Knowledge Graph', tag: 'AI-Core',  color: '#10b981', icon: Network,   action: () => handleAction('graph' as PageType),    wp: new THREE.Vector3(3.4,  1.2,  0), ap: new THREE.Vector3(1.8,  0.6, 0.6) },
    { id: 'papers',   name: 'Research Papers',  tag: '204M+',   color: '#38bdf8', icon: FileText,  action: () => handleAction('search' as PageType),   wp: new THREE.Vector3(0.4,  2.4,  0), ap: new THREE.Vector3(0.0,  1.1, 0.8) },
    { id: 'insights', name: 'AI Insights',      tag: 'Consensus',color: '#a855f7', icon: Sparkles, action: () => handleAction('chat' as PageType),     wp: new THREE.Vector3(3.9,  0.0,  0), ap: new THREE.Vector3(1.9,  0.0, 0.5) },
    { id: 'authors',  name: 'Authors',          tag: '12.4M+',  color: '#14b8a6', icon: Users,     action: () => handleSearch('Research authors'),       wp: new THREE.Vector3(0.1,  0.3,  0), ap: new THREE.Vector3(1.0,  0.1, 0.5) },
    { id: 'concepts', name: 'Concepts',         tag: '1.8M+',   color: '#818cf8', icon: Layers,    action: () => handleSearch('Ontological concepts'),   wp: new THREE.Vector3(3.4, -1.2,  0), ap: new THREE.Vector3(1.8, -0.6, 0.6) },
    { id: 'datasets', name: 'Datasets',         tag: '85K+',    color: '#f59e0b', icon: Database,  action: () => handleSearch('Empirical datasets'),     wp: new THREE.Vector3(0.5, -1.8,  0), ap: new THREE.Vector3(1.2, -0.9, 0.5) },
    { id: 'citations',name: 'Citations',        tag: '1.24B+',  color: '#ec4899', icon: Link2,     action: () => handleAction('graph' as PageType),    wp: new THREE.Vector3(1.8, -2.5,  0), ap: new THREE.Vector3(1.6, -1.3, 0.5) },
  ];

  const [pillPositions, setPillPositions] = useState<Record<string, { x: number; y: number; ax: number; ay: number }>>({});
  const [ufoPos, setUfoPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let W = container.clientWidth || 1200;
    let H = container.clientHeight || 520;

    // ── Renderer ──────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch { return; }

    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // ── Scene & Camera ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    // The camera is angled so the globe sits right-centre and mountains fill the lower panorama
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 2000);
    camera.position.set(0, 2.5, 9.5);
    camera.lookAt(0.8, 0.5, 0);

    // ── BACKGROUND: Full-width sky gradient ──────────────────────
    // We paint the background directly on canvas (renderer has alpha:true,
    // so we control it via scene.background = null and CSS gradient on container)
    scene.background = null;

    // ── Lighting ──────────────────────────────────────────────────
    // Sky hemisphere light — warm sun from upper right, cold sky-blue fill
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x334488, 0.9);
    scene.add(hemi);

    const sunDir = new THREE.Vector3(-0.5, 0.65, 0.58).normalize();
    const sun = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sun.position.copy(sunDir).multiplyScalar(80);
    scene.add(sun);

    // Fill from right for the dark side of the globe
    const rimLight = new THREE.DirectionalLight(0x224488, 0.6);
    rimLight.position.set(6, 2, 4);
    scene.add(rimLight);

    // ── Helper: canvas texture ────────────────────────────────────
    const mkTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d')!; draw(ctx);
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
    };

    // ═══════════════════════════════════════════════════════════════
    //  A. CINEMATIC SKY — gradient from hazy white-blue (left)
    //     to deep midnight blue (right), rendered as a large plane
    // ═══════════════════════════════════════════════════════════════
    const skyTex = mkTex(1024, 256, ctx => {
      // Sky base: left = misty light blue-white, right = deep navy
      const grad = ctx.createLinearGradient(0, 0, 1024, 0);
      grad.addColorStop(0,    '#dce8f5');
      grad.addColorStop(0.28, '#c6d9ef');
      grad.addColorStop(0.52, '#8aadd4');
      grad.addColorStop(0.72, '#1a2f5a');
      grad.addColorStop(1,    '#050c1f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 256);

      // Atmospheric haze band at horizon (left side)
      const haze = ctx.createLinearGradient(0, 190, 0, 256);
      haze.addColorStop(0, 'rgba(220,235,250,0)');
      haze.addColorStop(1, 'rgba(220,235,250,0.55)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, 580, 256);

      // Stars on the right half
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 420; i++) {
        const sx = 500 + Math.random() * 524;
        const sy = Math.random() * 256;
        const sr = Math.random() * 1.1;
        const alpha = 0.3 + Math.random() * 0.7;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    // Large sky backdrop plane far behind everything
    const skyMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 100),
      new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false, side: THREE.FrontSide })
    );
    skyMesh.position.set(-6, 10, -100);
    scene.add(skyMesh);

    // ═══════════════════════════════════════════════════════════════
    //  B. VOLUMETRIC CLOUDS (left & center — multiple billboard layers)
    // ═══════════════════════════════════════════════════════════════
    const cloudLayerTex = mkTex(512, 256, ctx => {
      ctx.clearRect(0, 0, 512, 256);
      for (let k = 0; k < 60; k++) {
        const x = Math.random() * 512;
        const y = 60 + Math.random() * 160;
        const rx = 40 + Math.random() * 90;
        const ry = 15 + Math.random() * 35;
        const alpha = 0.18 + Math.random() * 0.32;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.4, `rgba(240,248,255,${alpha * 0.5})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Multiple cloud planes at different depths for parallax
    const cloudPlanes: THREE.Mesh[] = [];
    const cloudData = [
      { z: -18, y: 3.5,  x: -10, scaleX: 55, scaleY: 20, opacity: 0.75 },
      { z: -26, y: 4.2,  x: -6,  scaleX: 48, scaleY: 18, opacity: 0.55 },
      { z: -10, y: 2.8,  x: -16, scaleX: 40, scaleY: 14, opacity: 0.5 },
      { z: -35, y: 5.0,  x: 0,   scaleX: 60, scaleY: 22, opacity: 0.35 },
    ];
    cloudData.forEach(cd => {
      const cp = new THREE.Mesh(
        new THREE.PlaneGeometry(cd.scaleX, cd.scaleY),
        new THREE.MeshBasicMaterial({
          map: cloudLayerTex,
          transparent: true,
          opacity: cd.opacity,
          depthWrite: false,
          blending: THREE.NormalBlending,
        })
      );
      cp.position.set(cd.x, cd.y, cd.z);
      scene.add(cp);
      cloudPlanes.push(cp);
    });

    // ═══════════════════════════════════════════════════════════════
    //  C. 3D MOUNTAIN LANDSCAPE spanning full width
    //     Left mountains: light grey/snow (day side)
    //     Right mountains: dark slate/indigo (night/space side)
    // ═══════════════════════════════════════════════════════════════

    // Mountain texture: vertex colors will blend left=light, right=dark
    const mountainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.08,
      flatShading: true,
    });

    const mkMountains = (
      W2: number, D: number, segX: number, segZ: number,
      xOffset: number, zOffset: number,
      heightScale: number,
      colorLeft: THREE.Color,
      colorRight: THREE.Color
    ) => {
      const geo = new THREE.PlaneGeometry(W2, D, segX, segZ);
      geo.rotateX(-Math.PI * 0.5);

      const positions = geo.attributes.position as THREE.BufferAttribute;
      const colors: number[] = [];
      const count = positions.count;

      for (let i = 0; i < count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // multi-octave height noise
        const nx = (x + xOffset) * 0.22;
        const nz = (z + zOffset) * 0.28;
        const h1 = Math.sin(nx * 1.1 + 0.8) * Math.cos(nz * 1.4 - 0.6) * 1.0;
        const h2 = Math.sin(nx * 2.5 - nz * 2.0) * Math.cos(nz * 2.2 + nx * 0.6) * 0.45;
        const h3 = Math.sin(nx * 5.0 + nz * 4.5) * 0.18;
        const h4 = Math.cos(nx * 9.0 - nz * 7.0) * 0.07;
        let h = (h1 + h2 + h3 + h4) * heightScale;

        // Terrain front taper (blend into ground at camera-side)
        const frontT = Math.max(0, Math.min(1, (z - zOffset * 0.3 + D * 0.5) / (D * 0.6)));
        h = Math.max(0, h * frontT);

        positions.setY(i, h);

        // Colour blend: leftwards = lighter (day), rightwards = darker (night)
        const tX = Math.max(0, Math.min(1, (x + W2 * 0.5) / W2));
        const c = colorLeft.clone().lerp(colorRight, tX);
        // Snow on peaks
        const snowT = Math.max(0, Math.min(1, (h - heightScale * 0.55) / (heightScale * 0.3)));
        c.lerp(new THREE.Color(0xeef4ff), snowT);
        colors.push(c.r, c.g, c.b);
      }

      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, mountainMat.clone());
      mesh.position.set(xOffset * 0.1, -1.0, zOffset);
      return mesh;
    };

    // Background mountain range (further away, taller, narrower)
    const bgMtns = mkMountains(90, 55, 120, 60, 0, -28, 6.5,
      new THREE.Color(0xc8d8e8), new THREE.Color(0x1a2545));
    bgMtns.position.y = -1.5;
    scene.add(bgMtns);

    // Mid mountain range
    const midMtns = mkMountains(70, 38, 90, 48, 5, -12, 4.8,
      new THREE.Color(0xa8bfd4), new THREE.Color(0x0f1d3a));
    midMtns.position.y = -1.8;
    scene.add(midMtns);

    // Foreground foothills (closest, low, ground plane)
    const fgMtns = mkMountains(55, 22, 70, 36, -4, -2, 2.2,
      new THREE.Color(0x8aacca), new THREE.Color(0x0a1328));
    fgMtns.position.y = -2.0;
    scene.add(fgMtns);

    // Grid/mist ground plane
    const groundGeo = new THREE.PlaneGeometry(120, 80, 1, 1);
    groundGeo.rotateX(-Math.PI * 0.5);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x060e22,
      transparent: true,
      opacity: 0.65,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -2.1, -15);
    scene.add(ground);

    // ═══════════════════════════════════════════════════════════════
    //  D. REALISTIC EARTH GLOBE (from landing page — exact same code)
    // ═══════════════════════════════════════════════════════════════
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

    const dayTexture = mkTex(1024, 512, ctx => {
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
            if (absLat > 64) { d[idx]=230; d[idx+1]=240; d[idx+2]=250; }
            else if (lat>15&&lat<34&&lon>-15&&lon<55) { d[idx]=168; d[idx+1]=138; d[idx+2]=88; }
            else if (lat<-18&&lat>-32&&lon>115&&lon<145) { d[idx]=175; d[idx+1]=105; d[idx+2]=65; }
            else {
              const v=(Math.sin(lat*0.15)*Math.cos(lon*0.15)+1)*0.5;
              d[idx]=Math.floor(45+v*30); d[idx+1]=Math.floor(95+v*35); d[idx+2]=Math.floor(52+v*20);
            }
          } else {
            const depth=absLat/90;
            d[idx]=Math.floor(10+depth*8); d[idx+1]=Math.floor(28+depth*16); d[idx+2]=Math.floor(58+depth*22);
          }
          d[idx+3]=255;
        }
      }
      ctx.putImageData(img, 0, 0);
    });

    const nightTexture = mkTex(1024, 512, ctx => {
      ctx.fillStyle='#000000'; ctx.fillRect(0,0,1024,512);
      ctx.fillStyle='rgba(255,210,110,0.95)';
      for (let j=0;j<512;j+=2) {
        const lat=90-(j/512)*180;
        if (Math.abs(lat)>65) continue;
        for (let i=0;i<1024;i+=2) {
          const lon=(i/1024)*360-180;
          if (isLand(lat,lon)) {
            const isP=((lat>22&&lat<55&&lon>-125&&lon<-68)||(lat>35&&lat<60&&lon>-10&&lon<45)||(lat>15&&lat<45&&lon>70&&lon<142)||(lat>-35&&lat<-10&&lon>-60&&lon<-35));
            if (Math.random()<(isP?0.38:0.06)) ctx.fillRect(i,j,Math.random()<0.25?2:1.1,1.1);
          }
        }
      }
    });

    const specTexture = mkTex(512, 256, ctx => {
      const img=ctx.createImageData(512,256); const d=img.data;
      for (let j=0;j<256;j++) { const lat=90-(j/256)*180;
        for (let i=0;i<512;i++) { const lon=(i/512)*360-180; const idx=(j*512+i)*4;
          const val=isLand(lat,lon)?0:255; d[idx]=d[idx+1]=d[idx+2]=val; d[idx+3]=255; } }
      ctx.putImageData(img,0,0);
    });

    const cloudGlobeTex = mkTex(512, 256, ctx => {
      ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,512,256);
      for (let k=0;k<90;k++) {
        const x=Math.random()*512, y=30+Math.random()*196;
        const rx=18+Math.random()*45, ry=6+Math.random()*14;
        const g=ctx.createRadialGradient(x,y,0,x,y,rx);
        g.addColorStop(0,'rgba(255,255,255,0.42)'); g.addColorStop(0.5,'rgba(255,255,255,0.16)'); g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,Math.random()*0.3-0.15,0,Math.PI*2); ctx.fill();
      }
    });

    // Globe group — positioned on the RIGHT half of the hero
    const globeGroup = new THREE.Group();
    globeGroup.position.set(3.2, 1.0, 0); // right-centre, slightly elevated
    scene.add(globeGroup);

    const GLOBE_R = 1.6;

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
          vec3 col = day * (0.12 + 1.15 * max(0.0, nd)) * mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.98, 0.92), lit);
          col += night * (1.0 - lit) * 1.6;
          vec3 H = normalize(sun + V);
          col += vec3(1.0, 0.98, 0.92) * pow(max(dot(N, H), 0.0), 240.0) * spec * 0.75 * step(0.0, nd);
          float limb = pow(1.0 - max(dot(N, V), 0.0), 4.2);
          col += vec3(0.22, 0.55, 0.90) * limb * smoothstep(-0.2, 0.4, nd) * 0.42;
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 72, 56), earthMat);
    globeGroup.add(earthMesh);

    const cloudsMat = new THREE.MeshLambertMaterial({
      map: cloudGlobeTex, transparent: true, opacity: 0.32,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R * 1.012, 72, 56), cloudsMat);
    globeGroup.add(cloudsMesh);

    // Citation arcs on globe surface
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
      latLonToV3(42.36,-71.09,GLOBE_R), latLonToV3(37.42,-122.17,GLOBE_R),
      latLonToV3(51.50,-0.12,GLOBE_R),  latLonToV3(35.68,139.76,GLOBE_R),
      latLonToV3(1.35,103.82,GLOBE_R),  latLonToV3(-33.86,151.21,GLOBE_R)
    ];
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const photonBeads: THREE.Mesh[] = [];
    [[0,1],[0,2],[2,3],[3,4],[4,5]].forEach(([iA,iB]) => {
      const pA=hubs[iA], pB=hubs[iB];
      const mid=new THREE.Vector3().addVectors(pA,pB).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(GLOBE_R*1.28);
      const curve=new THREE.QuadraticBezierCurve3(pA,mid,pB);
      arcCurves.push(curve);
      const pts=curve.getPoints(28);
      globeGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({color:0x67e8f9,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending})
      ));
      const bead=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));
      globeGroup.add(bead); photonBeads.push(bead);
    });

    // ═══════════════════════════════════════════════════════════════
    //  E. UFO CRAFT (identical to landing page)
    // ═══════════════════════════════════════════════════════════════
    const ufoGroup = new THREE.Group();

    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.60, 0.11, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.25 })
    );
    ufoGroup.add(saucer);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.85 })
    );
    dome.position.y = 0.055;
    ufoGroup.add(dome);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.028, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    rim.rotation.x = Math.PI / 2;
    ufoGroup.add(rim);

    const tractorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
    });
    const tractorBeam = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.75, 24, 1, true), tractorMat);
    tractorBeam.rotation.x = Math.PI;
    tractorBeam.position.y = -0.95;
    ufoGroup.add(tractorBeam);

    // UFO engine glow sprites
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const glowGeo = new THREE.SphereGeometry(0.055, 6, 6);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const glowSphere = new THREE.Mesh(glowGeo, glowMat);
      glowSphere.position.set(Math.cos(ang) * 0.52, -0.055, Math.sin(ang) * 0.52);
      ufoGroup.add(glowSphere);
    }

    const UFO_PATROL = new THREE.Vector3(1.8, 2.8, 1.2);
    ufoGroup.position.copy(UFO_PATROL);
    ufoGroup.rotation.set(0.15, -0.4, 0.1);
    scene.add(ufoGroup);

    // ═══════════════════════════════════════════════════════════════
    //  F. CYBER BIRD (identical to landing page)
    // ═══════════════════════════════════════════════════════════════
    const birdGroup = new THREE.Group();
    const birdMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide });

    const bodyGeo = new THREE.ConeGeometry(0.11, 0.60, 4);
    bodyGeo.rotateX(Math.PI / 2);
    birdGroup.add(new THREE.Mesh(bodyGeo, birdMat));

    const wingL = new THREE.Group();
    const wvL = new Float32Array([0,0,0, -0.60,0.10,-0.28, -0.40,0,0.32]);
    const wgL = new THREE.BufferGeometry(); wgL.setAttribute('position', new THREE.BufferAttribute(wvL, 3)); wgL.computeVertexNormals();
    wingL.add(new THREE.Mesh(wgL, birdMat));

    const wingR = new THREE.Group();
    const wvR = new Float32Array([0,0,0,  0.60,0.10,-0.28,  0.40,0,0.32]);
    const wgR = new THREE.BufferGeometry(); wgR.setAttribute('position', new THREE.BufferAttribute(wvR, 3)); wgR.computeVertexNormals();
    wingR.add(new THREE.Mesh(wgR, birdMat));

    birdGroup.add(wingL); birdGroup.add(wingR);

    const BIRD_PATROL = new THREE.Vector3(-1.8, 2.5, 0.8);
    birdGroup.position.copy(BIRD_PATROL);
    scene.add(birdGroup);

    // ═══════════════════════════════════════════════════════════════
    //  G. PAPER DOCUMENT (carried from mountains to globe)
    // ═══════════════════════════════════════════════════════════════
    const paperMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const activePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.32), paperMat);
    scene.add(activePaper);

    const rippleMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, side: THREE.DoubleSide, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.11, 32), rippleMat);
    scene.add(rippleMesh);

    // Mountain outpost positions (world space) for the couriers to visit
    const outpostPositions = [
      new THREE.Vector3(-5.0, -1.2, -4.0),  // left-mountain outpost
      new THREE.Vector3(-1.5, -0.8, -1.5),  // centre valley outpost
      new THREE.Vector3( 0.5, -1.0, -3.5),  // right-centre outpost
    ];

    // ═══════════════════════════════════════════════════════════════
    //  H. COURIER STATE MACHINE
    // ═══════════════════════════════════════════════════════════════
    let cTimer = 0;
    let cPhase = 0;      // 0=patrol, 1=dive, 2=collect, 3=climb, 4=throw, 5=return
    let cProg = 0;
    let cType: 'bird' | 'ufo' = 'bird';
    let cOutpost = 0;
    let rippleProg = 1.0;
    let globeTarget = new THREE.Vector3();

    // ═══════════════════════════════════════════════════════════════
    //  I. DRAG-TO-ROTATE on globe
    // ═══════════════════════════════════════════════════════════════
    let isDragging = false;
    let prevX = 0;
    let rotVelY = 0;
    let targetRotY = 0;

    const onPD = (e: PointerEvent) => { isDragging=true; prevX=e.clientX; rotVelY=0; canvas.setPointerCapture(e.pointerId); };
    const onPM = (e: PointerEvent) => { if (!isDragging) return; const dx=e.clientX-prevX; prevX=e.clientX; rotVelY=dx*0.004; targetRotY+=rotVelY; };
    const onPU = (e: PointerEvent) => { isDragging=false; try { canvas.releasePointerCapture(e.pointerId); } catch {} };

    canvas.addEventListener('pointerdown', onPD);
    canvas.addEventListener('pointermove', onPM);
    canvas.addEventListener('pointerup', onPU);
    canvas.addEventListener('pointercancel', onPU);

    // ═══════════════════════════════════════════════════════════════
    //  J. RESIZE
    // ═══════════════════════════════════════════════════════════════
    const handleResize = () => {
      if (!container) return;
      W = container.clientWidth || 1200;
      H = container.clientHeight || 520;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const project = (v: THREE.Vector3) => {
      const p = v.clone().project(camera);
      return { x: (p.x + 1) * 0.5 * W, y: (1 - p.y) * 0.5 * H };
    };

    // ═══════════════════════════════════════════════════════════════
    //  K. ANIMATE LOOP
    // ═══════════════════════════════════════════════════════════════
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Subtle globe levitation
      globeGroup.position.y = 1.0 + Math.sin(elapsed * 1.1) * 0.06;

      // 2. Globe slow spin
      earthMesh.rotation.y += 0.003;
      cloudsMesh.rotation.y += 0.0038;

      // 3. Drag-rotate globe
      if (!isDragging) { rotVelY *= 0.94; targetRotY += rotVelY; }
      globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.08;

      // 4. Cloud drift (slow rightward parallax)
      cloudPlanes.forEach((cp, i) => { cp.position.x += dt * (0.08 + i * 0.02); if (cp.position.x > 30) cp.position.x = -30; });

      // 5. Citation arc photon beads
      photonBeads.forEach((bead, i) => {
        const curve = arcCurves[i];
        if (curve) {
          const t = (elapsed * 0.4 + i * 0.2) % 1.0;
          const wp = curve.getPoint(t);
          bead.position.copy(globeGroup.localToWorld(wp));
        }
      });

      // 6. UFO rim spin
      rim.rotation.z += 0.04;

      // 7. Bird wing flap
      const flap = Math.sin(elapsed * 11) * 0.5;
      wingL.rotation.z = flap;
      wingR.rotation.z = -flap;

      // 8. UFO/Bird gentle patrol drift
      if (cPhase === 0) {
        ufoGroup.position.set(
          UFO_PATROL.x + Math.sin(elapsed * 0.5) * 0.4,
          UFO_PATROL.y + Math.sin(elapsed * 0.7) * 0.18,
          UFO_PATROL.z + Math.cos(elapsed * 0.4) * 0.22
        );
        birdGroup.position.set(
          BIRD_PATROL.x + Math.sin(elapsed * 0.6 + 1) * 0.5,
          BIRD_PATROL.y + Math.sin(elapsed * 0.8) * 0.15,
          BIRD_PATROL.z + Math.cos(elapsed * 0.5) * 0.25
        );
      }

      // 9. Courier cycle
      cTimer += dt;
      if (cPhase === 0 && cTimer > 7.0) {
        cTimer = 0; cPhase = 1; cProg = 0;
        cType = Math.random() < 0.5 ? 'bird' : 'ufo';
        cOutpost = Math.floor(Math.random() * outpostPositions.length);
        globeTarget.set(
          globeGroup.position.x + (Math.random() - 0.5) * 0.8,
          globeGroup.position.y + (Math.random() - 0.5) * 0.6,
          globeGroup.position.z + 1.65
        );
      }

      const op = outpostPositions[cOutpost];

      if (cPhase === 1) {
        // Dive from patrol into mountain outpost
        cProg += dt * 0.55;
        const t = Math.min(1, cProg);
        const startPos = cType === 'bird' ? BIRD_PATROL : UFO_PATROL;
        const mid = new THREE.Vector3((startPos.x + op.x) * 0.5, startPos.y - 1.5, (startPos.z + op.z) * 0.5);
        const pos = new THREE.Vector3().lerpVectors(startPos, mid, t).lerp(new THREE.Vector3().lerpVectors(mid, op, t), t);
        if (cType === 'bird') { birdGroup.position.copy(pos); birdGroup.rotation.set(0.4, 0.3, -0.3); }
        else { ufoGroup.position.copy(pos); ufoGroup.rotation.set(-0.2, -0.2, 0.2); }
        if (cProg >= 1) { cPhase = 2; cProg = 0; if (cType === 'ufo') tractorMat.opacity = 0.7; }

      } else if (cPhase === 2) {
        // Collecting paper
        cProg += dt * 1.6;
        paperMat.opacity = Math.min(1, cProg * 1.4);
        const carrier = cType === 'bird' ? birdGroup : ufoGroup;
        activePaper.position.copy(carrier.position).add(new THREE.Vector3(0, cType==='bird'?-0.18:-0.4, 0.1));
        activePaper.rotation.x = -Math.PI / 3;
        if (cProg >= 1) { cPhase = 3; cProg = 0; tractorMat.opacity = 0; }

      } else if (cPhase === 3) {
        // Climb to globe
        cProg += dt * 0.5;
        const t = Math.min(1, cProg);
        const mid = new THREE.Vector3((op.x + globeTarget.x) * 0.5, 1.5, (op.z + globeTarget.z) * 0.5);
        const pos = new THREE.Vector3().lerpVectors(op, mid, t).lerp(new THREE.Vector3().lerpVectors(mid, globeTarget, t), t);
        if (cType === 'bird') { birdGroup.position.copy(pos); birdGroup.rotation.set(-0.4, 0.4, 0.2); }
        else { ufoGroup.position.copy(pos); ufoGroup.rotation.set(0.1, -0.3, -0.1); }
        activePaper.position.copy(pos).add(new THREE.Vector3(0, cType==='bird'?-0.14:-0.28, 0.1));
        if (cProg >= 1) { cPhase = 4; cProg = 0; rippleProg = 0; rippleMesh.position.copy(activePaper.position); rippleMesh.quaternion.copy(camera.quaternion); }

      } else if (cPhase === 4) {
        // Paper merges into globe
        cProg += dt * 2.0;
        paperMat.opacity = Math.max(0, 1 - cProg);
        if (cProg >= 1) { cPhase = 5; cProg = 0; }

      } else if (cPhase === 5) {
        // Return to patrol
        cProg += dt * 0.4;
        const t = Math.min(1, cProg);
        if (cType === 'bird') birdGroup.position.lerp(BIRD_PATROL, t);
        else ufoGroup.position.lerp(UFO_PATROL, t);
        if (cProg >= 1) {
          cPhase = 0; cTimer = 0;
          birdGroup.position.copy(BIRD_PATROL);
          ufoGroup.position.copy(UFO_PATROL);
        }
      }

      // Ripple effect on globe surface
      if (rippleProg < 1.0) {
        rippleProg += dt * 1.4;
        rippleMesh.scale.setScalar(0.2 + rippleProg * 2.0);
        rippleMat.opacity = (1 - rippleProg) * 0.8;
      } else { rippleMat.opacity = 0; }

      // 10. Update HUD pill screen positions
      const newPos: Record<string, { x: number; y: number; ax: number; ay: number }> = {};
      pillDefs.forEach(p => {
        const wp = p.wp.clone().applyMatrix4(globeGroup.matrixWorld);
        const ap = p.ap.clone().applyMatrix4(globeGroup.matrixWorld);
        const sp = project(wp);
        const sa = project(ap);
        newPos[p.id] = { x: sp.x, y: sp.y, ax: sa.x, ay: sa.y };
      });
      setPillPositions(newPos);

      const ufoW = ufoGroup.position.clone().project(camera);
      setUfoPos({ x: (ufoW.x + 1) * 0.5 * W, y: (1 - ufoW.y) * 0.5 * H });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPD);
      canvas.removeEventListener('pointermove', onPM);
      canvas.removeEventListener('pointerup', onPU);
      canvas.removeEventListener('pointercancel', onPU);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden"
      style={{ height: '520px' }}
    >
      {/* ── Full-width 3D WebGL canvas (mountains + clouds + globe + UFO + bird) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"
        style={{
          // The scene is transparent (alpha:true); background is set via CSS
          background: 'linear-gradient(to right, #dce9f7 0%, #a8c5e0 32%, #1e3464 58%, #05101e 100%)'
        }}
        aria-label="3D mountain panorama with Earth globe, UFO, and bird"
      />

      {/* ── SVG connector lines between pills and globe ── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        {pillDefs.map(p => {
          const pos = pillPositions[p.id];
          if (!pos) return null;
          return (
            <g key={p.id}>
              <line x1={pos.x} y1={pos.y} x2={pos.ax} y2={pos.ay}
                stroke={p.color} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" />
              <circle cx={pos.ax} cy={pos.ay} r="3.5" fill={p.color} className="animate-pulse" />
            </g>
          );
        })}
      </svg>

      {/* ── 7 Navigation Pills (floating, projected from 3D positions) ── */}
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
              boxShadow: `0 4px 18px rgba(0,0,0,0.5), 0 0 12px ${p.color}50`
            }}
            className="absolute left-0 top-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07132b]/90 hover:bg-[#111f42] text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md transition-transform duration-200 hover:scale-105 border cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }} />
            <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
            <span>{p.name}</span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-bold">{p.tag}</span>
          </button>
        );
      })}

      {/* ── RECON SURVEYOR badge tracks UFO ── */}
      {ufoPos && (
        <div
          style={{ transform: `translate(${ufoPos.x + 32}px, ${ufoPos.y - 26}px) translate(-50%, -50%)` }}
          className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#07132b]/85 border border-sky-400/60 text-[9.5px] font-mono text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.4)] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          <span>RECON SURVEYOR • 02%</span>
        </div>
      )}

      {/* ── Drag hint ── */}
      <div className="absolute bottom-2 right-4 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/50 border border-white/10 text-[10px] text-cyan-200/80 pointer-events-none backdrop-blur-sm z-10">
        <RotateCcw className="w-2.5 h-2.5 text-cyan-400" />
        <span>Drag to rotate 3D Earth</span>
      </div>
    </div>
  );
};
