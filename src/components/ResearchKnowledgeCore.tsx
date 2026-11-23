import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { GLOBE_RAW_BASE64 } from './researchGraphGlobeRaw';
import type { PageType } from '../types';
import {
  Network, Sparkles, Layers, Link2, FileText, Users, Database, RotateCcw
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

  // 7 pills — fixed screen-space positions relative to container (no 3D projection overlap)
  // Arranged: top-row 2, left-mid 2, right-mid 2, bottom 1
  const pillDefs = [
    { id: 'papers',   name: 'Research Papers',  tag: '204M+',    color: '#38bdf8', icon: FileText,  action: () => handleAction('search'),              fx: 0.72, fy: 0.08 },
    { id: 'graph',    name: 'Knowledge Graph',  tag: 'AI-Core',  color: '#10b981', icon: Network,   action: () => handleAction('graph'),               fx: 0.14, fy: 0.14 },
    { id: 'authors',  name: 'Authors',          tag: '12.4M+',   color: '#14b8a6', icon: Users,     action: () => handleSearch('Research authors'),     fx: 0.08, fy: 0.50 },
    { id: 'insights', name: 'AI Insights',      tag: 'Consensus',color: '#a855f7', icon: Sparkles,  action: () => handleAction('chat'),                fx: 0.84, fy: 0.44 },
    { id: 'datasets', name: 'Datasets',         tag: '85K+',     color: '#f59e0b', icon: Database,  action: () => handleSearch('Empirical datasets'),   fx: 0.84, fy: 0.72 },
    { id: 'concepts', name: 'Concepts',         tag: '1.8M+',    color: '#818cf8', icon: Layers,    action: () => handleSearch('Ontological concepts'), fx: 0.08, fy: 0.78 },
    { id: 'citations',name: 'Citations',        tag: '1.24B+',   color: '#ec4899', icon: Link2,     action: () => handleAction('graph'),               fx: 0.46, fy: 0.92 },
  ];

  const [containerSize, setContainerSize] = useState({ w: 640, h: 450 });
  const [ufoScreenPos, setUfoScreenPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let W = container.clientWidth || 640;
    let H = container.clientHeight || 450;

    // ── Renderer ──────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch { return; }

    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 0.1, 5.5);
    camera.lookAt(0, 0, 0);

    // ── Lighting ──────────────────────────────────────────────────
    const sunDir = new THREE.Vector3(-0.6, 0.5, 0.65).normalize();
    scene.add(new THREE.DirectionalLight(0xfff8ee, 1.6).copy(
      Object.assign(new THREE.DirectionalLight(0xfff8ee, 1.6), { position: sunDir.clone().multiplyScalar(10) })
    ));
    // Fix: add lights properly
    const sun = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sun.position.copy(sunDir).multiplyScalar(10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xaabbdd, 0.6));
    const rim = new THREE.DirectionalLight(0x1a3060, 0.35);
    rim.position.set(0, -1, -4); scene.add(rim);

    // ── Canvas texture helper ─────────────────────────────────────
    const mkTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d')!; draw(ctx);
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
    };

    // ═══════════════════════════════════════════════════════════════
    //  A. EARTH GLOBE — photorealistic + cyber hex grid overlay
    // ═══════════════════════════════════════════════════════════════
    const MW = 1440, MH = 720;
    const raw = atob(GLOBE_RAW_BASE64);
    const land = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) land[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    const isLand = (la: number, lo: number) => {
      const u = (Math.floor((lo + 180) / 360 * MW) % MW + MW) % MW;
      const v = Math.min(MH - 1, Math.max(0, Math.floor((90 - la) / 180 * MH)));
      return land[v * MW + u];
    };

    const dayTex = mkTex(1024, 512, ctx => {
      const img = ctx.createImageData(1024, 512); const d = img.data;
      for (let j = 0; j < 512; j++) {
        const lat = 90 - (j / 512) * 180; const absLat = Math.abs(lat);
        for (let i = 0; i < 1024; i++) {
          const lon = (i / 1024) * 360 - 180;
          const idx = (j * 1024 + i) * 4; const l = isLand(lat, lon);
          if (l) {
            if (absLat > 64)                              { d[idx]=230; d[idx+1]=240; d[idx+2]=250; }
            else if (lat>15&&lat<34&&lon>-15&&lon<55)     { d[idx]=168; d[idx+1]=138; d[idx+2]=88;  }
            else if (lat<-18&&lat>-32&&lon>115&&lon<145)  { d[idx]=175; d[idx+1]=105; d[idx+2]=65;  }
            else { const v=(Math.sin(lat*0.15)*Math.cos(lon*0.15)+1)*0.5; d[idx]=Math.floor(45+v*30); d[idx+1]=Math.floor(95+v*35); d[idx+2]=Math.floor(52+v*20); }
          } else {
            const depth=absLat/90; d[idx]=Math.floor(10+depth*8); d[idx+1]=Math.floor(28+depth*16); d[idx+2]=Math.floor(58+depth*22);
          }
          d[idx+3]=255;
        }
      }
      ctx.putImageData(img, 0, 0);
      // Cyber hex grid overlay
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = '#40e0ff';
      ctx.lineWidth = 0.8;
      for (let col = 0; col < 1024; col += 28) {
        for (let row = 0; row < 512; row += 24) {
          const ox = col + (Math.floor(row / 24) % 2) * 14;
          const hx = 14; const hy = 12;
          ctx.beginPath();
          ctx.moveTo(ox + hx, row);
          ctx.lineTo(ox + hx*2, row + hy);
          ctx.lineTo(ox + hx*2, row + hy*2);
          ctx.lineTo(ox + hx, row + hy*3);
          ctx.lineTo(ox, row + hy*2);
          ctx.lineTo(ox, row + hy);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    });

    const nightTex = mkTex(1024, 512, ctx => {
      ctx.fillStyle='#000'; ctx.fillRect(0,0,1024,512);
      ctx.fillStyle='rgba(255,210,110,0.95)';
      for (let j=0;j<512;j+=2) {
        const lat=90-(j/512)*180; if (Math.abs(lat)>65) continue;
        for (let i=0;i<1024;i+=2) {
          const lon=(i/1024)*360-180;
          if (isLand(lat,lon)) {
            const isP=((lat>22&&lat<55&&lon>-125&&lon<-68)||(lat>35&&lat<60&&lon>-10&&lon<45)||(lat>15&&lat<45&&lon>70&&lon<142)||(lat>-35&&lat<-10&&lon>-60&&lon<-35));
            if (Math.random()<(isP?0.38:0.06)) ctx.fillRect(i,j,Math.random()<0.25?2:1.1,1.1);
          }
        }
      }
      // Cyan node markers at major cities
      ctx.fillStyle='rgba(56,189,248,0.9)';
      [[300,145],[128,112],[482,120],[582,132],[716,164],[800,180]].forEach(([x,y])=>{
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill();
      });
    });

    const specTex = mkTex(512, 256, ctx => {
      const img=ctx.createImageData(512,256); const d=img.data;
      for (let j=0;j<256;j++) { const lat=90-(j/256)*180;
        for (let i=0;i<512;i++) { const lon=(i/512)*360-180; const idx=(j*512+i)*4;
          const val=isLand(lat,lon)?0:255; d[idx]=d[idx+1]=d[idx+2]=val; d[idx+3]=255; } }
      ctx.putImageData(img,0,0);
    });

    const cloudTex = mkTex(512,256,ctx=>{
      ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,512,256);
      for(let k=0;k<90;k++){
        const x=Math.random()*512,y=30+Math.random()*196,rx=18+Math.random()*45,ry=6+Math.random()*14;
        const g=ctx.createRadialGradient(x,y,0,x,y,rx);
        g.addColorStop(0,'rgba(255,255,255,0.42)'); g.addColorStop(0.5,'rgba(255,255,255,0.16)'); g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,Math.random()*0.3-0.15,0,Math.PI*2); ctx.fill();
      }
    });

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    const GLOBE_R = 1.25;

    const earthMat = new THREE.ShaderMaterial({
      uniforms:{dayT:{value:dayTex},nightT:{value:nightTex},specT:{value:specTex},sun:{value:sunDir}},
      vertexShader:`varying vec2 vUv;varying vec3 vN,vP;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vP=(modelViewMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform sampler2D dayT,nightT,specT;uniform vec3 sun;varying vec2 vUv;varying vec3 vN,vP;
        void main(){
          vec3 N=normalize(vN),V=normalize(-vP);float nd=dot(N,sun),lit=smoothstep(-0.15,0.20,nd);
          vec3 day=texture2D(dayT,vUv).rgb,night=texture2D(nightT,vUv).rgb;float spec=texture2D(specT,vUv).r;
          vec3 col=day*(0.12+1.15*max(0.0,nd))*mix(vec3(0.85,0.92,1.0),vec3(1.0,0.98,0.92),lit);
          col+=night*(1.0-lit)*1.6;
          vec3 H=normalize(sun+V);col+=vec3(1.0,0.98,0.92)*pow(max(dot(N,H),0.0),240.0)*spec*0.75*step(0.0,nd);
          float limb=pow(1.0-max(dot(N,V),0.0),4.2);
          col+=vec3(0.22,0.55,0.90)*limb*smoothstep(-0.2,0.4,nd)*0.42;
          gl_FragColor=vec4(col,1.0);
        }`
    });
    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R,72,56),earthMat);
    globeGroup.add(earthMesh);

    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R*1.013,72,56),
      new THREE.MeshLambertMaterial({map:cloudTex,transparent:true,opacity:0.32,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    globeGroup.add(cloudsMesh);

    // Thin atmosphere rim glow
    const atmMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R*1.055,64,48),
      new THREE.ShaderMaterial({
        uniforms:{sun:{value:sunDir}},
        vertexShader:`varying vec3 vN,vP;void main(){vN=normalize(normalMatrix*normal);vP=normalize((modelViewMatrix*vec4(position,1.0)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader:`uniform vec3 sun;varying vec3 vN,vP;void main(){float rim=1.0-max(dot(vN,-vP),0.0);float nd=dot(vN,sun);float a=pow(rim,3.5)*smoothstep(-0.1,0.5,nd)*0.5;gl_FragColor=vec4(0.3,0.65,1.0,a);}`,
        transparent:true,side:THREE.FrontSide,depthWrite:false,blending:THREE.AdditiveBlending
      })
    );
    globeGroup.add(atmMesh);

    // Cyber scan ring orbiting the equator
    const scanRingMat = new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false});
    const scanRing = new THREE.Mesh(new THREE.TorusGeometry(GLOBE_R*1.1,0.006,8,96),scanRingMat);
    globeGroup.add(scanRing);

    // Second tilted ring
    const scanRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(GLOBE_R*1.14,0.004,8,96),
      new THREE.MeshBasicMaterial({color:0xa855f7,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    scanRing2.rotation.x = Math.PI/3;
    globeGroup.add(scanRing2);

    // Citation arcs
    const latLonToV3=(la:number,lo:number,r:number)=>{
      const phi=(90-la)*(Math.PI/180),th=(lo+180)*(Math.PI/180);
      return new THREE.Vector3(-(r*Math.sin(phi)*Math.cos(th)),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(th));
    };
    const hubs=[latLonToV3(42.36,-71.09,GLOBE_R),latLonToV3(37.42,-122.17,GLOBE_R),latLonToV3(51.50,-0.12,GLOBE_R),latLonToV3(35.68,139.76,GLOBE_R),latLonToV3(1.35,103.82,GLOBE_R),latLonToV3(-33.86,151.21,GLOBE_R)];
    const arcCurves:THREE.QuadraticBezierCurve3[]=[];
    const photonBeads:THREE.Mesh[]=[];
    [[0,1],[0,2],[2,3],[3,4],[4,5]].forEach(([iA,iB])=>{
      const pA=hubs[iA],pB=hubs[iB];
      const mid=new THREE.Vector3().addVectors(pA,pB).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_R*1.3);
      const curve=new THREE.QuadraticBezierCurve3(pA,mid,pB);
      arcCurves.push(curve);
      globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),new THREE.LineBasicMaterial({color:0x67e8f9,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending})));
      const bead=new THREE.Mesh(new THREE.SphereGeometry(0.025,8,8),new THREE.MeshBasicMaterial({color:0x67e8ff}));
      globeGroup.add(bead); photonBeads.push(bead);
    });

    // ═══════════════════════════════════════════════════════════════
    //  B. REALISTIC UFO — lathe hull + emissive band + glass dome + pilot + pods
    //     Scale: 0.60 of landing page for compact orbit
    // ═══════════════════════════════════════════════════════════════
    const SC = 0.60; // global scale factor vs. landing page

    const ufoGroup = new THREE.Group();

    // Lathe hull profile (matches landing page)
    const hullProfile = [
      [0,0],[0.18,-0.02],[0.42,-0.06],[0.72,-0.12],[0.95,-0.08],[1.10,0.00],[1.08,0.10],[0.88,0.18],
      [0.60,0.22],[0.32,0.20],[0.10,0.14],[0,0.08]
    ].map(q => new THREE.Vector2(q[0]*SC, q[1]*SC));
    const hullGeo = new THREE.LatheGeometry(hullProfile, 36);
    const hullMat = new THREE.MeshStandardMaterial({
      color:0x1a2540, metalness:0.92, roughness:0.18,
      envMapIntensity:1.2
    });
    ufoGroup.add(new THREE.Mesh(hullGeo, hullMat));

    // Emissive window band (rotating ring of panels)
    const bandGroup = new THREE.Group();
    for (let i=0; i<16; i++) {
      const ang = (i/16)*Math.PI*2;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.055*SC*2, 0.028*SC*2, 0.015*SC*2),
        new THREE.MeshStandardMaterial({color:0x38bdf8, emissive:0x38bdf8, emissiveIntensity:i%2===0?1.8:0.5, metalness:0.5})
      );
      panel.position.set(Math.cos(ang)*0.78*SC, 0.12*SC, Math.sin(ang)*0.78*SC);
      bandGroup.add(panel);
    }
    ufoGroup.add(bandGroup);

    // Glass dome
    const domeMat = new THREE.MeshPhysicalMaterial({
      color:0x88ccff, transparent:true, opacity:0.72,
      metalness:0.1, roughness:0, transmission:0.4,
      thickness:0.5
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.56*SC, 32, 20, 0, Math.PI*2, 0, Math.PI/2), domeMat);
    dome.position.y = 0.19*SC;
    ufoGroup.add(dome);

    // Pilot sphere inside dome
    const pilot = new THREE.Mesh(
      new THREE.SphereGeometry(0.14*SC, 12, 10),
      new THREE.MeshStandardMaterial({color:0xd0a0ff, emissive:0x6020a0, emissiveIntensity:0.6})
    );
    pilot.position.y = 0.26*SC;
    ufoGroup.add(pilot);

    // Landing legs / engine pods (3 around hull)
    for (let i=0; i<3; i++) {
      const ang = (i/3)*Math.PI*2;
      const pod = new THREE.Mesh(
        new THREE.SphereGeometry(0.11*SC, 10, 8),
        new THREE.MeshStandardMaterial({color:0x38bdf8, emissive:0x1060a0, emissiveIntensity:0.8, metalness:0.7})
      );
      pod.position.set(Math.cos(ang)*1.08*SC, -0.06*SC, Math.sin(ang)*1.08*SC);
      ufoGroup.add(pod);
    }

    // Top beacon light (flashing red)
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.055*SC,8,8),
      new THREE.MeshBasicMaterial({color:0xff3333})
    );
    beacon.position.y = 0.56*SC;
    ufoGroup.add(beacon);

    // Tractor beam (cone, invisible until collecting)
    const tractorMat = new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false});
    const tractorBeam = new THREE.Mesh(new THREE.ConeGeometry(0.5*SC,1.4*SC,24,1,true),tractorMat);
    tractorBeam.rotation.x=Math.PI; tractorBeam.position.y=-0.72*SC;
    ufoGroup.add(tractorBeam);

    // Outer glow ring
    const ufoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.98*SC, 0.022*SC, 8, 36),
      new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.75,blending:THREE.AdditiveBlending})
    );
    ufoRing.rotation.x = Math.PI/2;
    ufoGroup.add(ufoRing);

    // Second inner ring
    const ufoRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.72*SC, 0.014*SC, 8, 36),
      new THREE.MeshBasicMaterial({color:0xa855f7,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending})
    );
    ufoRing2.rotation.x = Math.PI/2;
    ufoGroup.add(ufoRing2);

    scene.add(ufoGroup);

    // ═══════════════════════════════════════════════════════════════
    //  C. REALISTIC BIRD — feather canvas textures + lathe body + beak + eyes
    //     Scale: 0.60 of landing page
    // ═══════════════════════════════════════════════════════════════
    const BSC = SC; // bird scale

    // Feather texture generator (matches landing page featherTex)
    const featherTex = (baseColor: string, tipColor: string) => mkTex(64, 256, ctx => {
      ctx.beginPath();
      ctx.moveTo(30,256); ctx.bezierCurveTo(2,200,4,60,32,2);
      ctx.bezierCurveTo(60,60,62,200,34,256); ctx.closePath();
      const g = ctx.createLinearGradient(0,0,0,256);
      g.addColorStop(0, tipColor); g.addColorStop(0.12, tipColor);
      g.addColorStop(0.16, baseColor); g.addColorStop(1, baseColor);
      ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle='rgba(20,30,50,.3)'; ctx.lineWidth=1;
      for (let i=0; i<72; i++) {
        const y=4+i*3.6;
        ctx.beginPath(); ctx.moveTo(32,y); ctx.lineTo(2,y-24);
        ctx.moveTo(32,y); ctx.lineTo(62,y-24); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(32,256); ctx.lineTo(32,6); ctx.stroke();
    });

    const fMatP = new THREE.MeshStandardMaterial({map:featherTex('#262c3d','#f4f6fa'),alphaTest:0.4,side:THREE.DoubleSide,roughness:0.85,metalness:0});
    const fMatS = new THREE.MeshStandardMaterial({map:featherTex('#a9b4c6','#f0f3f8'),alphaTest:0.4,side:THREE.DoubleSide,roughness:0.85,metalness:0});
    const fMatC = new THREE.MeshStandardMaterial({map:featherTex('#c4cdda','#e4e9f0'),alphaTest:0.4,side:THREE.DoubleSide,roughness:0.85,metalness:0});
    const fMatW = new THREE.MeshStandardMaterial({map:featherTex('#f6f8fb','#ffffff'), alphaTest:0.4,side:THREE.DoubleSide,roughness:0.85,metalness:0});

    const fGeo = (w: number, L: number, cam: number) => {
      const g = new THREE.PlaneGeometry(w,L,1,4); g.translate(0,L/2,0);
      const p = g.attributes.position as THREE.BufferAttribute;
      for (let i=0;i<p.count;i++){const t=p.getY(i)/L; p.setZ(i,-cam*t*t);}
      g.rotateZ(-Math.PI/2); g.rotateX(-Math.PI/2); g.computeVertexNormals(); return g;
    };

    const addF = (par: THREE.Object3D, mat: THREE.Material, w: number, L: number, cam: number, x: number, y: number, z: number, psi: number, flex: number) => {
      const pv = new THREE.Group();
      pv.position.set(x,y,z); pv.rotation.set(0,psi,flex);
      pv.add(new THREE.Mesh(fGeo(w,L,cam),mat));
      par.add(pv); return pv;
    };

    // Wing builder (mirror-able)
    const wingData: Array<{sh:THREE.Group; hand:THREE.Group; s:number; fan:Array<{pv:THREE.Group; psi:number; k:number}>}> = [];
    const mkWing = (s: number) => {
      const sh = new THREE.Group(), mir = new THREE.Group(), hand = new THREE.Group();
      mir.scale.x = s; sh.add(mir);
      hand.position.set(0.5*BSC,0,0); mir.add(hand);
      mir.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(1,10,8),fMatC),{scale:new THREE.Vector3(0.30*BSC,0.04*BSC,0.11*BSC),position:new THREE.Vector3(0.26*BSC,0.012*BSC,0.03*BSC)}));
      const fan: Array<{pv:THREE.Group; psi:number; k:number}> = [];
      for (let i=0;i<10;i++){
        const x2=(0.46-i*0.047)*BSC;
        addF(mir,fMatS,0.08*BSC,(0.5-0.012*i)*BSC,0.04*BSC,x2,0,-0.02*BSC,1.28+i*0.012,0);
        addF(mir,fMatC,0.075*BSC,0.22*BSC,0.03*BSC,(x2+0.01*BSC),0.007*BSC,0.05*BSC,1.24+i*0.012,0);
      }
      for(let i=0;i<3;i++) addF(mir,fMatW,0.08*BSC,(0.34-0.02*i)*BSC,0.03*BSC,(0.03+i*0.03)*BSC,0.004*BSC,-0.01*BSC,1.4,0);
      for(let i=0;i<8;i++) addF(mir,fMatC,0.06*BSC,0.13*BSC,0.02*BSC,(0.06+i*0.05)*BSC,0.012*BSC,0.085*BSC,1.15+i*0.015,0);
      for(let i=0;i<3;i++) addF(mir,fMatS,0.07*BSC,0.28*BSC,0.03*BSC,(0.015+i*0.025)*BSC,0.008*BSC,0.03*BSC,1.45,0);
      for(let i=0;i<10;i++){
        const psi2=1.0+((0.12-1.0)*(i/9));
        fan.push({pv:addF(hand,i<3?fMatS:fMatP,0.06*BSC,(0.44+0.025*i)*BSC,0.03*BSC,(i*0.01)*BSC,-0.002*BSC,0,psi2,0),psi:psi2,k:i/9});
        if(i<7) fan.push({pv:addF(hand,fMatC,0.06*BSC,0.2*BSC,0.03*BSC,(i*0.012)*BSC,0.007*BSC,0.03*BSC,1.0+((0.12-1.0)*((i+2)/9)),0),psi:1.0+((0.12-1.0)*((i+2)/9)),k:(i+2)/9});
      }
      addF(hand,fMatP,0.03*BSC,0.11*BSC,0.01*BSC,0,0.006*BSC,0.05*BSC,0.02,0.2);
      wingData.push({sh,hand,s,fan}); return sh;
    };

    const birdGroup = new THREE.Group();
    const birdBody = new THREE.Group();
    birdGroup.rotation.order = 'YXZ';
    birdGroup.add(birdBody);

    // Body lathe
    const bProf = [[0,-0.62],[0.03,-0.58],[0.08,-0.45],[0.13,-0.25],[0.16,-0.02],[0.155,0.15],[0.125,0.30],[0.08,0.38],[0,0.40]]
      .map(q => new THREE.Vector2(q[0]*BSC, q[1]*BSC));
    const bgm = new THREE.LatheGeometry(bProf, 24);
    bgm.scale(1,1,0.92); bgm.rotateX(Math.PI/2);

    // Vertex colours
    const nr = bgm.attributes.normal as THREE.BufferAttribute;
    const cols: number[] = [];
    for(let i=0;i<nr.count;i++){
      const k = Math.min(1,Math.max(0,(nr.getY(i)-0.1)/0.6));
      const lerp = (a:number,b:number,t:number)=>a+(b-a)*t;
      cols.push(lerp(0.9,0.5,k),lerp(0.92,0.56,k),lerp(0.96,0.66,k));
    }
    bgm.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
    birdBody.add(new THREE.Mesh(bgm,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.8,metalness:0})));

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09*BSC,20,14),new THREE.MeshStandardMaterial({color:0xdde2ea,roughness:0.8}));
    head.scale.set(1,1,1.25); head.position.set(0,0.04*BSC,0.47*BSC); birdBody.add(head);

    // Beak
    const beakMat = new THREE.MeshStandardMaterial({color:0xf0b020,roughness:0.5,emissive:0x503000,emissiveIntensity:0.4});
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.034*BSC,0.2*BSC,14).rotateX(Math.PI/2),beakMat);
    beak.position.set(0,0.01*BSC,0.66*BSC); birdBody.add(beak);

    // Eyes
    [-1,1].forEach(s=>{
      const eyeRing=new THREE.Mesh(new THREE.SphereGeometry(0.026*BSC,10,8),new THREE.MeshStandardMaterial({color:0xf08a20}));
      eyeRing.position.set(s*0.075*BSC,0.065*BSC,0.52*BSC); birdBody.add(eyeRing);
      const eye=new THREE.Mesh(new THREE.SphereGeometry(0.018*BSC,10,8),new THREE.MeshStandardMaterial({color:0x080808,roughness:0.2}));
      eye.position.set(s*0.085*BSC,0.067*BSC,0.525*BSC); birdBody.add(eye);
      const hl=new THREE.Mesh(new THREE.SphereGeometry(0.005*BSC,6,6),new THREE.MeshBasicMaterial({color:0xffffff}));
      hl.position.set(s*0.098*BSC,0.074*BSC,0.532*BSC); birdBody.add(hl);
    });

    // Wings
    const wingL = mkWing(1); wingL.position.set(0.13*BSC, 0.075*BSC, 0.12*BSC); birdBody.add(wingL);
    const wingR = mkWing(-1); wingR.position.set(-0.13*BSC, 0.075*BSC, 0.12*BSC); birdBody.add(wingR);

    // Tail feathers
    for(let k=-5;k<=5;k++){
      addF(birdBody,fMatW,0.085*BSC,(0.42-Math.abs(k)*0.012)*BSC,0.02*BSC,0,0,-0.55*BSC,Math.PI/2+k*0.075,k%2?0.05:-0.02);
    }

    scene.add(birdGroup);

    // ═══════════════════════════════════════════════════════════════
    //  D. PAPER DOCUMENT
    // ═══════════════════════════════════════════════════════════════
    const paperMat = new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true,opacity:0});
    const activePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.24),paperMat);
    scene.add(activePaper);
    const rippleMat = new THREE.MeshBasicMaterial({color:0x67e8f9,side:THREE.DoubleSide,transparent:true,opacity:0,blending:THREE.AdditiveBlending});
    const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.04,0.09,32),rippleMat);
    scene.add(rippleMesh);

    // ═══════════════════════════════════════════════════════════════
    //  E. ORBIT PARAMETERS — smooth elliptical paths around globe
    // ═══════════════════════════════════════════════════════════════
    const UFO_RX = 2.1, UFO_RY = 1.5, UFO_SPD = 0.22;
    const BIRD_RX = 1.75, BIRD_RY = 1.25, BIRD_SPD = 0.34;
    const UFO_TILT = 0.30, BIRD_TILT = -0.40;

    const getOrbitPos = (ang: number, rx: number, ry: number, tilt: number, zAmp: number) => {
      const lx = Math.cos(ang)*rx, ly = Math.sin(ang)*ry;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      return new THREE.Vector3(
        lx*cosT - ly*sinT,
        lx*sinT + ly*cosT + globeGroup.position.y,
        Math.sin(ang)*zAmp
      );
    };

    // ── Paper delivery ──
    let pPhase = 0, pTimer = 0, pProg = 0;
    let pType: 'bird'|'ufo' = 'bird';
    let rippleProg = 1.0;
    let globeHitPos = new THREE.Vector3();

    // ── Wing animation state ──
    let birdPh = 0;
    let birdGlide = 0;

    // ── Drag-to-rotate ──
    let isDragging = false, prevX = 0, rotVelY = 0, targetRotY = 0;
    const onPD=(e:PointerEvent)=>{isDragging=true;prevX=e.clientX;rotVelY=0;canvas.setPointerCapture(e.pointerId);};
    const onPM=(e:PointerEvent)=>{if(!isDragging)return;const dx=e.clientX-prevX;prevX=e.clientX;rotVelY=dx*0.004;targetRotY+=rotVelY;};
    const onPU=(e:PointerEvent)=>{isDragging=false;try{canvas.releasePointerCapture(e.pointerId);}catch{}};
    canvas.addEventListener('pointerdown',onPD);
    canvas.addEventListener('pointermove',onPM);
    canvas.addEventListener('pointerup',onPU);
    canvas.addEventListener('pointercancel',onPU);

    // ── Resize ──
    const handleResize=()=>{
      if(!container)return; W=container.clientWidth||640; H=container.clientHeight||450;
      camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H);
      setContainerSize({w:W,h:H});
    };
    const ro=new ResizeObserver(handleResize); ro.observe(container);

    // ═══════════════════════════════════════════════════════════════
    //  F. ANIMATE LOOP
    // ═══════════════════════════════════════════════════════════════
    let animId: number;
    const clock = new THREE.Clock();

    const animate=()=>{
      animId=requestAnimationFrame(animate);
      const dt=clock.getDelta(); const elapsed=clock.getElapsedTime();

      // 1. Globe levitation & spin
      globeGroup.position.y = Math.sin(elapsed*1.1)*0.055;
      earthMesh.rotation.y  += 0.003;
      cloudsMesh.rotation.y += 0.0038;
      scanRing.rotation.y   += 0.012;
      scanRing2.rotation.z  += 0.008;

      // 2. Drag rotate
      if(!isDragging){rotVelY*=0.94;targetRotY+=rotVelY;}
      globeGroup.rotation.y+=(targetRotY-globeGroup.rotation.y)*0.08;

      // 3. Beacon flicker
      beacon.material.color.setHex(Math.sin(elapsed*5)>0?0xff3333:0x501818);
      bandGroup.rotation.y = elapsed*0.9;
      ufoRing.rotation.z += 0.045;
      ufoRing2.rotation.z -= 0.03;

      // 4. Citation arc photon beads
      photonBeads.forEach((bead,i)=>{
        const c=arcCurves[i]; if(!c)return;
        const t=(elapsed*0.42+i*0.22)%1.0;
        bead.position.copy(globeGroup.localToWorld(c.getPoint(t)));
      });

      // 5. UFO orbital motion
      const ufoAng = elapsed*UFO_SPD;
      const ufoPos2 = getOrbitPos(ufoAng, UFO_RX, UFO_RY, UFO_TILT, 0.28);
      ufoGroup.position.copy(ufoPos2);
      // Bank and tilt based on velocity direction
      const ufoVelAng = ufoAng + 0.05;
      const ufoNext = getOrbitPos(ufoVelAng, UFO_RX, UFO_RY, UFO_TILT, 0.28);
      const ufoDelta = ufoNext.clone().sub(ufoPos2).normalize();
      ufoGroup.rotation.y = Math.atan2(ufoDelta.x, ufoDelta.z);
      ufoGroup.rotation.x = 0.1 + Math.sin(elapsed*2.1)*0.03;
      ufoGroup.rotation.z = -ufoDelta.x * 0.25;

      // 6. Bird orbital motion (opposite phase, inner orbit)
      const birdAng = elapsed*BIRD_SPD + Math.PI; // opposite side
      const birdPos2 = getOrbitPos(birdAng, BIRD_RX, BIRD_RY, BIRD_TILT, 0.22);
      birdGroup.position.copy(birdPos2);
      // Face direction of travel
      const birdVelAng = birdAng + 0.08;
      const birdNext2 = getOrbitPos(birdVelAng, BIRD_RX, BIRD_RY, BIRD_TILT, 0.22);
      const birdDelta = birdNext2.clone().sub(birdPos2).normalize();
      birdGroup.rotation.y = Math.atan2(birdDelta.x, birdDelta.z);
      birdGroup.rotation.x = -(Math.asin(Math.min(1,Math.max(-1,birdDelta.y)))*0.4);
      birdGroup.rotation.z = -birdDelta.x*0.3;

      // 7. Feathered wing flap animation
      birdPh += dt * (3.1 + Math.max(0, 0.6 - 5/10)*4) * 6.283 * (1 - birdGlide*0.85);
      birdGlide += (0 - birdGlide) * Math.min(1, dt*2);
      const s1=Math.sin(birdPh), s2=Math.sin(birdPh-1.15);
      const sh2 = 0.12 + 0.78*s1;
      const wr2 = 0.5*s2 - 0.1;
      const swp2 = 0.16*(1-Math.cos(birdPh))/2;
      const spr2 = 0.14 + 0.1*Math.cos(birdPh);
      wingData.forEach(w=>{
        w.sh.rotation.z = w.s*sh2;
        w.hand.rotation.set(0, swp2, wr2);
        w.fan.forEach(f=>{ f.pv.rotation.y = f.psi - spr2*f.k; f.pv.rotation.z = -0.18*f.k*Math.sin(birdPh-1.6); });
      });
      birdBody.position.y = -0.035*s1*BSC;

      // 8. Paper delivery cycle
      pTimer += dt;
      if(pPhase===0 && pTimer>9.0){
        pTimer=0; pPhase=1; pProg=0;
        pType=Math.random()<0.5?'bird':'ufo';
        globeHitPos.set((Math.random()-0.5)*0.5, globeGroup.position.y+(Math.random()-0.5)*0.4, GLOBE_R*0.9);
      }
      if(pPhase===1){
        pProg+=dt*1.6; paperMat.opacity=Math.min(1,pProg*1.4);
        const carrier=pType==='bird'?birdGroup:ufoGroup;
        activePaper.position.copy(carrier.position).add(new THREE.Vector3(0,pType==='bird'?-0.14*BSC:-0.4*BSC,0.08));
        activePaper.rotation.set(-Math.PI/3,0,0);
        if(pType==='ufo') tractorMat.opacity=Math.min(0.6,pProg*0.6);
        if(pProg>=1){pPhase=2;pProg=0;}
      } else if(pPhase===2){
        pProg+=dt*0.65; const t=Math.min(1,pProg);
        const carrier=pType==='bird'?birdGroup:ufoGroup;
        activePaper.position.lerpVectors(carrier.position,globeHitPos,t);
        paperMat.opacity=1-t*0.3;
        if(pProg>=1){pPhase=3;pProg=0;rippleProg=0;rippleMesh.position.copy(globeHitPos);rippleMesh.quaternion.copy(camera.quaternion);tractorMat.opacity=0;}
      } else if(pPhase===3){
        pProg+=dt*2.4; paperMat.opacity=Math.max(0,1-pProg);
        if(pProg>=1){pPhase=0;pTimer=0;}
      }
      if(rippleProg<1){rippleProg+=dt*1.4;rippleMesh.scale.setScalar(0.2+rippleProg*2.0);rippleMat.opacity=(1-rippleProg)*0.75;}else{rippleMat.opacity=0;}

      // 9. UFO screen pos for RECON tag
      const uw=ufoGroup.position.clone().project(camera);
      setUfoScreenPos({x:(uw.x+1)*0.5*W,y:(1-uw.y)*0.5*H});

      renderer.render(scene,camera);
    };

    animate();

    return()=>{
      cancelAnimationFrame(animId); ro.disconnect();
      canvas.removeEventListener('pointerdown',onPD);
      canvas.removeEventListener('pointermove',onPM);
      canvas.removeEventListener('pointerup',onPU);
      canvas.removeEventListener('pointercancel',onPU);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] select-none overflow-visible">
      {/* Transparent WebGL canvas — blends with hero background photo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"
        style={{background:'transparent'}}
        aria-label="3D Knowledge Globe with realistic UFO and bird"
      />

      {/* SVG connector lines */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        <defs>
          <filter id="hglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {pillDefs.map(p => {
          const cx = p.fx * containerSize.w;
          const cy = p.fy * containerSize.h;
          const gcx = containerSize.w * 0.5; // globe centre X approx
          const gcy = containerSize.h * 0.46;
          return (
            <g key={p.id}>
              <line x1={cx} y1={cy} x2={gcx} y2={gcy}
                stroke={p.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
              <circle cx={cx} cy={cy} r="3.5" fill={p.color} filter="url(#hglow)" opacity="0.85" className="animate-pulse"/>
            </g>
          );
        })}
      </svg>

      {/* 7 Navigation Pills — fixed fractional positions, no overlapping */}
      {pillDefs.map(p => {
        const Icon = p.icon;
        const x = p.fx * containerSize.w;
        const y = p.fy * containerSize.h;
        return (
          <button
            key={p.id}
            type="button"
            onClick={p.action}
            style={{
              transform:`translate(${x}px,${y}px) translate(-50%,-50%)`,
              borderColor:p.color,
              boxShadow:`0 3px 16px rgba(0,0,0,0.5),0 0 12px ${p.color}44`
            }}
            className="absolute left-0 top-0 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#06112a]/88 hover:bg-[#0d1f45] text-white text-[10px] font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 border cursor-pointer whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:p.color,boxShadow:`0 0 4px ${p.color}`}}/>
            <Icon className="w-3 h-3 flex-shrink-0" style={{color:p.color}}/>
            <span className="hidden sm:inline">{p.name}</span>
            <span className="text-[8.5px] font-mono px-1 py-0.5 rounded bg-white/10 text-slate-200">{p.tag}</span>
          </button>
        );
      })}

      {/* RECON SURVEYOR badge — tracks UFO */}
      {ufoScreenPos && (
        <div
          style={{transform:`translate(${ufoScreenPos.x+28}px,${ufoScreenPos.y-20}px) translate(-50%,-50%)`}}
          className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06112a]/88 border border-sky-400/55 text-[8.5px] font-mono text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.4)] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"/>
          <span>RECON SURVEYOR • 02%</span>
        </div>
      )}

      {/* Drag hint */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[9px] text-cyan-200/70 pointer-events-none backdrop-blur-sm z-10">
        <RotateCcw className="w-2.5 h-2.5 text-cyan-400"/>
        <span>Drag to rotate</span>
      </div>
    </div>
  );
};
