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

  // 7 Navigation pills anchored to 3D globe-relative positions
  const pillDefs = [
    { id: 'graph',    name: 'Knowledge Graph', tag: 'AI-Core',   color: '#10b981', icon: Network,  action: () => handleAction('graph'),                   wp: new THREE.Vector3(-2.5,  1.1, 0), ap: new THREE.Vector3(-1.1,  0.55, 0.65) },
    { id: 'papers',   name: 'Research Papers',  tag: '204M+',    color: '#38bdf8', icon: FileText, action: () => handleAction('search'),                  wp: new THREE.Vector3( 2.5,  1.1, 0), ap: new THREE.Vector3( 1.1,  0.55, 0.65) },
    { id: 'insights', name: 'AI Insights',      tag: 'Consensus',color: '#a855f7', icon: Sparkles, action: () => handleAction('chat'),                    wp: new THREE.Vector3(-2.8,  0.0, 0), ap: new THREE.Vector3(-1.3,  0.05, 0.5) },
    { id: 'authors',  name: 'Authors',          tag: '12.4M+',   color: '#14b8a6', icon: Users,    action: () => handleSearch('Research authors'),         wp: new THREE.Vector3( 2.8,  0.0, 0), ap: new THREE.Vector3( 1.3,  0.05, 0.5) },
    { id: 'concepts', name: 'Concepts',         tag: '1.8M+',    color: '#818cf8', icon: Layers,   action: () => handleSearch('Ontological concepts'),     wp: new THREE.Vector3(-2.4, -1.1, 0), ap: new THREE.Vector3(-1.1, -0.55, 0.65) },
    { id: 'datasets', name: 'Datasets',         tag: '85K+',     color: '#f59e0b', icon: Database, action: () => handleSearch('Empirical datasets'),       wp: new THREE.Vector3( 2.4, -1.1, 0), ap: new THREE.Vector3( 1.1, -0.55, 0.65) },
    { id: 'citations',name: 'Citations',        tag: '1.24B+',   color: '#ec4899', icon: Link2,    action: () => handleAction('graph'),                    wp: new THREE.Vector3( 0.0, -2.0, 0), ap: new THREE.Vector3( 0.0, -1.1, 0.65) },
  ];

  const [pillPositions, setPillPositions] = useState<Record<string, { x: number; y: number; ax: number; ay: number }>>({});
  const [ufoScreenPos, setUfoScreenPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let W = container.clientWidth || 640;
    let H = container.clientHeight || 450;

    // ── Renderer — fully transparent, blends with photo background ──
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,              // transparent background — the CSS bg photo shows through
        powerPreference: 'high-performance',
      });
    } catch { return; }

    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);  // fully clear — no black fill
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // ── Scene & Camera ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 0.1, 5.5);
    camera.lookAt(0, 0, 0);

    // ── Lighting ──────────────────────────────────────────────────
    // Warm sunlight from upper-left matching the hero photo's lighting
    const sunDir = new THREE.Vector3(-0.6, 0.5, 0.65).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sunLight.position.copy(sunDir).multiplyScalar(10);
    scene.add(sunLight);

    // Soft ambient so dark side of globe isn't pure black
    const ambient = new THREE.AmbientLight(0xaabbdd, 0.55);
    scene.add(ambient);

    // Subtle cold blue rim from behind (space rim effect)
    const rimLight = new THREE.DirectionalLight(0x1a4080, 0.4);
    rimLight.position.set(0, -1, -4);
    scene.add(rimLight);

    // ── Helper: canvas texture ────────────────────────────────────
    const mkTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d')!; draw(ctx);
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
    };

    // ═══════════════════════════════════════════════════════════════
    //  A. EARTH GLOBE — exact same shader as landing page
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

    const dayTex = mkTex(1024, 512, ctx => {
      const img = ctx.createImageData(1024, 512); const d = img.data;
      for (let j = 0; j < 512; j++) {
        const lat = 90 - (j / 512) * 180; const absLat = Math.abs(lat);
        for (let i = 0; i < 1024; i++) {
          const lon = (i / 1024) * 360 - 180;
          const idx = (j * 1024 + i) * 4; const l = isLand(lat, lon);
          if (l) {
            if (absLat > 64)                                             { d[idx]=230; d[idx+1]=240; d[idx+2]=250; }
            else if (lat>15&&lat<34&&lon>-15&&lon<55)                    { d[idx]=168; d[idx+1]=138; d[idx+2]=88;  }
            else if (lat<-18&&lat>-32&&lon>115&&lon<145)                 { d[idx]=175; d[idx+1]=105; d[idx+2]=65;  }
            else { const v=(Math.sin(lat*0.15)*Math.cos(lon*0.15)+1)*0.5; d[idx]=Math.floor(45+v*30); d[idx+1]=Math.floor(95+v*35); d[idx+2]=Math.floor(52+v*20); }
          } else {
            const depth=absLat/90; d[idx]=Math.floor(10+depth*8); d[idx+1]=Math.floor(28+depth*16); d[idx+2]=Math.floor(58+depth*22);
          }
          d[idx+3]=255;
        }
      }
      ctx.putImageData(img,0,0);
    });

    const nightTex = mkTex(1024, 512, ctx => {
      ctx.fillStyle='#000000'; ctx.fillRect(0,0,1024,512);
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
    });

    const specTex = mkTex(512, 256, ctx => {
      const img=ctx.createImageData(512,256); const d=img.data;
      for (let j=0;j<256;j++) { const lat=90-(j/256)*180;
        for (let i=0;i<512;i++) { const lon=(i/512)*360-180; const idx=(j*512+i)*4;
          const val=isLand(lat,lon)?0:255; d[idx]=d[idx+1]=d[idx+2]=val; d[idx+3]=255; } }
      ctx.putImageData(img,0,0);
    });

    const cloudTex = mkTex(512, 256, ctx => {
      ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,512,256);
      for (let k=0;k<90;k++) {
        const x=Math.random()*512, y=30+Math.random()*196, rx=18+Math.random()*45, ry=6+Math.random()*14;
        const g=ctx.createRadialGradient(x,y,0,x,y,rx);
        g.addColorStop(0,'rgba(255,255,255,0.42)'); g.addColorStop(0.5,'rgba(255,255,255,0.16)'); g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,Math.random()*0.3-0.15,0,Math.PI*2); ctx.fill();
      }
    });

    // Globe group — centred in scene
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    const GLOBE_R = 1.25;

    // Earth shader (identical to landing page)
    const earthMat = new THREE.ShaderMaterial({
      uniforms: { dayT:{value:dayTex}, nightT:{value:nightTex}, specT:{value:specTex}, sun:{value:sunDir} },
      vertexShader:`
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
        void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);vPos=(modelViewMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
      `,
      fragmentShader:`
        uniform sampler2D dayT,nightT,specT; uniform vec3 sun;
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
        void main(){
          vec3 N=normalize(vNormal),V=normalize(-vPos);
          float nd=dot(N,sun),lit=smoothstep(-0.15,0.20,nd);
          vec3 day=texture2D(dayT,vUv).rgb,night=texture2D(nightT,vUv).rgb;
          float spec=texture2D(specT,vUv).r;
          vec3 col=day*(0.12+1.15*max(0.0,nd))*mix(vec3(0.85,0.92,1.0),vec3(1.0,0.98,0.92),lit);
          col+=night*(1.0-lit)*1.6;
          vec3 H=normalize(sun+V);
          col+=vec3(1.0,0.98,0.92)*pow(max(dot(N,H),0.0),240.0)*spec*0.75*step(0.0,nd);
          float limb=pow(1.0-max(dot(N,V),0.0),4.2);
          col+=vec3(0.22,0.55,0.90)*limb*smoothstep(-0.2,0.4,nd)*0.42;
          gl_FragColor=vec4(col,1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 72, 56), earthMat);
    globeGroup.add(earthMesh);

    const cloudsMat = new THREE.MeshLambertMaterial({ map:cloudTex, transparent:true, opacity:0.32, blending:THREE.AdditiveBlending, depthWrite:false });
    const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R*1.013,72,56), cloudsMat);
    globeGroup.add(cloudsMesh);

    // Faint atmosphere glow ring (not blurry halo — just a sharp limb-scattering ring for depth)
    const atmMat = new THREE.ShaderMaterial({
      uniforms: { sun:{value:sunDir} },
      vertexShader:`varying vec3 vN,vP;void main(){vN=normalize(normalMatrix*normal);vP=normalize((modelViewMatrix*vec4(position,1.0)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 sun;varying vec3 vN,vP;void main(){float rim=1.0-max(dot(vN,-vP),0.0);float nd=dot(vN,sun);float a=pow(rim,3.5)*smoothstep(-0.1,0.5,nd)*0.55;gl_FragColor=vec4(0.3,0.65,1.0,a);}`,
      transparent:true, side:THREE.FrontSide, depthWrite:false, blending:THREE.AdditiveBlending
    });
    const atmMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R*1.055,72,56), atmMat);
    globeGroup.add(atmMesh);

    // Citation arcs
    const latLonToV3 = (la: number, lo: number, r: number) => {
      const phi=(90-la)*(Math.PI/180), th=(lo+180)*(Math.PI/180);
      return new THREE.Vector3(-(r*Math.sin(phi)*Math.cos(th)), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(th));
    };
    const hubs = [
      latLonToV3(42.36,-71.09,GLOBE_R), latLonToV3(37.42,-122.17,GLOBE_R),
      latLonToV3(51.50,-0.12,GLOBE_R),  latLonToV3(35.68,139.76,GLOBE_R),
      latLonToV3(1.35,103.82,GLOBE_R),  latLonToV3(-33.86,151.21,GLOBE_R),
    ];
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const photonBeads: THREE.Mesh[] = [];
    [[0,1],[0,2],[2,3],[3,4],[4,5]].forEach(([iA,iB]) => {
      const pA=hubs[iA],pB=hubs[iB];
      const mid=new THREE.Vector3().addVectors(pA,pB).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_R*1.3);
      const curve=new THREE.QuadraticBezierCurve3(pA,mid,pB);
      arcCurves.push(curve);
      globeGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),
        new THREE.LineBasicMaterial({color:0x67e8f9,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending})
      ));
      const bead=new THREE.Mesh(new THREE.SphereGeometry(0.025,8,8),new THREE.MeshBasicMaterial({color:0xffffff}));
      globeGroup.add(bead); photonBeads.push(bead);
    });

    // ═══════════════════════════════════════════════════════════════
    //  B. UFO — identical to landing page
    // ═══════════════════════════════════════════════════════════════
    const ufoGroup = new THREE.Group();

    ufoGroup.add(Object.assign(new THREE.Mesh(
      new THREE.CylinderGeometry(0.44,0.52,0.095,24),
      new THREE.MeshStandardMaterial({color:0x1e293b,metalness:0.9,roughness:0.25})
    )));

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.26,16,12,0,Math.PI*2,0,Math.PI/2),
      new THREE.MeshBasicMaterial({color:0x67e8f9,transparent:true,opacity:0.85})
    );
    dome.position.y=0.048; ufoGroup.add(dome);

    const rimMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.48,0.024,8,24),
      new THREE.MeshBasicMaterial({color:0x38bdf8})
    );
    rimMesh.rotation.x=Math.PI/2; ufoGroup.add(rimMesh);

    const tractorMat = new THREE.MeshBasicMaterial({
      color:0x38bdf8, transparent:true, opacity:0,
      blending:THREE.AdditiveBlending, side:THREE.DoubleSide, depthWrite:false
    });
    const tractorBeam = new THREE.Mesh(new THREE.ConeGeometry(0.58,1.5,24,1,true),tractorMat);
    tractorBeam.rotation.x=Math.PI; tractorBeam.position.y=-0.82; ufoGroup.add(tractorBeam);

    // Engine glow nodes
    for (let i=0;i<6;i++) {
      const ang=(i/6)*Math.PI*2;
      const g=new THREE.Mesh(new THREE.SphereGeometry(0.046,6,6),new THREE.MeshBasicMaterial({color:0x38bdf8}));
      g.position.set(Math.cos(ang)*0.44,-0.048,Math.sin(ang)*0.44); ufoGroup.add(g);
    }
    scene.add(ufoGroup);

    // ═══════════════════════════════════════════════════════════════
    //  C. BIRD — identical to landing page
    // ═══════════════════════════════════════════════════════════════
    const birdGroup = new THREE.Group();
    const bMat = new THREE.MeshStandardMaterial({color:0xffffff,metalness:0.15,roughness:0.55,side:THREE.DoubleSide});

    const bodyGeo = new THREE.ConeGeometry(0.095,0.52,4);
    bodyGeo.rotateX(Math.PI/2);
    birdGroup.add(new THREE.Mesh(bodyGeo,bMat));

    const wingL=new THREE.Group(); const wvL=new Float32Array([0,0,0,-0.52,0.09,-0.24,-0.34,0,0.28]);
    const wgL=new THREE.BufferGeometry(); wgL.setAttribute('position',new THREE.BufferAttribute(wvL,3)); wgL.computeVertexNormals();
    wingL.add(new THREE.Mesh(wgL,bMat));

    const wingR=new THREE.Group(); const wvR=new Float32Array([0,0,0,0.52,0.09,-0.24,0.34,0,0.28]);
    const wgR=new THREE.BufferGeometry(); wgR.setAttribute('position',new THREE.BufferAttribute(wvR,3)); wgR.computeVertexNormals();
    wingR.add(new THREE.Mesh(wgR,bMat));

    birdGroup.add(wingL); birdGroup.add(wingR);
    scene.add(birdGroup);

    // ═══════════════════════════════════════════════════════════════
    //  D. PAPER DOCUMENT — carried from orbit pickup to globe
    // ═══════════════════════════════════════════════════════════════
    const paperMat = new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true,opacity:0});
    const activePaper = new THREE.Mesh(new THREE.PlaneGeometry(0.20,0.26),paperMat);
    scene.add(activePaper);

    const rippleMat = new THREE.MeshBasicMaterial({color:0x67e8f9,side:THREE.DoubleSide,transparent:true,opacity:0,blending:THREE.AdditiveBlending});
    const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.04,0.09,32),rippleMat);
    scene.add(rippleMesh);

    // ═══════════════════════════════════════════════════════════════
    //  E. ORBIT PATHS — UFO and Bird orbit the globe on ellipses
    //     Bird: smaller inner orbit, slightly tilted
    //     UFO : larger outer orbit, opposite tilt
    // ═══════════════════════════════════════════════════════════════
    // Orbit radii (in world units from globe centre)
    const UFO_ORBIT_RX = 2.05;
    const UFO_ORBIT_RY = 1.55;  // vertical compression
    const UFO_ORBIT_TILT = 0.28; // radians tilt
    const UFO_ORBIT_SPEED = 0.26; // rad/s

    const BIRD_ORBIT_RX = 1.70;
    const BIRD_ORBIT_RY = 1.20;
    const BIRD_ORBIT_TILT = -0.42;
    const BIRD_ORBIT_SPEED = 0.38; // rad/s — slightly faster than UFO

    // Paper pickup & delivery cycle
    let pPhase = 0;   // 0=orbiting, 1=collecting(paper appear), 2=flying in, 3=throw, 4=ripple
    let pTimer = 0;
    let pProg  = 0;
    let pType: 'bird'|'ufo' = 'bird';
    let rippleProg = 1.0;

    // ═══════════════════════════════════════════════════════════════
    //  F. DRAG-TO-ROTATE on globe
    // ═══════════════════════════════════════════════════════════════
    let isDragging = false;
    let prevX = 0;
    let rotVelY = 0;
    let targetRotY = 0;

    const onPD=(e:PointerEvent)=>{isDragging=true;prevX=e.clientX;rotVelY=0;canvas.setPointerCapture(e.pointerId);};
    const onPM=(e:PointerEvent)=>{if(!isDragging)return;const dx=e.clientX-prevX;prevX=e.clientX;rotVelY=dx*0.004;targetRotY+=rotVelY;};
    const onPU=(e:PointerEvent)=>{isDragging=false;try{canvas.releasePointerCapture(e.pointerId);}catch{}};

    canvas.addEventListener('pointerdown',onPD);
    canvas.addEventListener('pointermove',onPM);
    canvas.addEventListener('pointerup',onPU);
    canvas.addEventListener('pointercancel',onPU);

    // ── Resize ────────────────────────────────────────────────────
    const handleResize=()=>{
      if(!container)return;
      W=container.clientWidth||640; H=container.clientHeight||450;
      camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H);
    };
    const ro=new ResizeObserver(handleResize); ro.observe(container);

    const project=(v:THREE.Vector3)=>{
      const p=v.clone().project(camera);
      return{x:(p.x+1)*0.5*W,y:(1-p.y)*0.5*H};
    };

    // ═══════════════════════════════════════════════════════════════
    //  G. ANIMATE
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

      // 2. Drag-rotate globe
      if(!isDragging){rotVelY*=0.94;targetRotY+=rotVelY;}
      globeGroup.rotation.y+=(targetRotY-globeGroup.rotation.y)*0.08;

      // 3. Rim light flicker (subtle)
      rimMesh.rotation.z+=0.055;

      // 4. Citation arc photon beads
      photonBeads.forEach((bead,i)=>{
        const c=arcCurves[i]; if(!c)return;
        const t=(elapsed*0.42+i*0.22)%1.0;
        bead.position.copy(globeGroup.localToWorld(c.getPoint(t)));
      });

      // 5. UFO orbital motion (smooth ellipse around globe)
      {
        const ang = elapsed*UFO_ORBIT_SPEED;
        const lx = Math.cos(ang)*UFO_ORBIT_RX;
        const ly = Math.sin(ang)*UFO_ORBIT_RY;
        // Apply tilt rotation around Z axis
        const cosT=Math.cos(UFO_ORBIT_TILT), sinT=Math.sin(UFO_ORBIT_TILT);
        ufoGroup.position.set(
          lx*cosT - ly*sinT + globeGroup.position.x,
          lx*sinT + ly*cosT + globeGroup.position.y,
          Math.sin(ang*0.5)*0.3  // slight Z wobble for 3D depth
        );
        // Face direction of travel
        const velX=-Math.sin(ang)*UFO_ORBIT_RX*UFO_ORBIT_SPEED;
        const velY= Math.cos(ang)*UFO_ORBIT_RY*UFO_ORBIT_SPEED;
        ufoGroup.rotation.y=Math.atan2(velX,velZ(ufoGroup.position,globeGroup.position));
        ufoGroup.rotation.x=0.1;
        ufoGroup.rotation.z=velY*0.08; // gentle bank
      }

      // 6. Bird orbital motion (inner orbit, opposite phase)
      {
        const ang = elapsed*BIRD_ORBIT_SPEED+Math.PI; // offset by PI so they're on opposite sides
        const lx=Math.cos(ang)*BIRD_ORBIT_RX;
        const ly=Math.sin(ang)*BIRD_ORBIT_RY;
        const cosT=Math.cos(BIRD_ORBIT_TILT),sinT=Math.sin(BIRD_ORBIT_TILT);
        birdGroup.position.set(
          lx*cosT-ly*sinT+globeGroup.position.x,
          lx*sinT+ly*cosT+globeGroup.position.y,
          Math.cos(ang*0.6)*0.25
        );
        // Always face direction of travel
        const nextAng=ang+0.08;
        const nx2=Math.cos(nextAng)*BIRD_ORBIT_RX,ny2=Math.sin(nextAng)*BIRD_ORBIT_RY;
        const nx3=nx2*Math.cos(BIRD_ORBIT_TILT)-ny2*Math.sin(BIRD_ORBIT_TILT);
        const nx4=nx2*Math.sin(BIRD_ORBIT_TILT)+ny2*Math.cos(BIRD_ORBIT_TILT);
        birdGroup.rotation.y=Math.atan2(nx3-birdGroup.position.x+globeGroup.position.x, 0.5);
        birdGroup.rotation.x=Math.atan2(nx4-birdGroup.position.y+globeGroup.position.y,-0.5)*0.4;
        birdGroup.rotation.z=(Math.sin(ang*2)*0.15); // gentle banking
      }

      // 7. Wing flap
      const flap=Math.sin(elapsed*11)*0.52;
      wingL.rotation.z=flap; wingR.rotation.z=-flap;

      // 8. Paper delivery cycle (triggered every ~8s)
      pTimer+=dt;
      if(pPhase===0&&pTimer>8.0){
        pTimer=0;pPhase=1;pProg=0;
        pType=Math.random()<0.5?'bird':'ufo';
      }

      if(pPhase===1){
        // Paper appears near courier
        pProg+=dt*1.6;
        paperMat.opacity=Math.min(1,pProg*1.4);
        const carrier=pType==='bird'?birdGroup:ufoGroup;
        activePaper.position.copy(carrier.position).add(new THREE.Vector3(0,pType==='bird'?-0.14:-0.36,0.1));
        activePaper.rotation.set(-Math.PI/3,0,0);
        if(pType==='ufo') tractorMat.opacity=Math.min(0.65,pProg*0.65);
        if(pProg>=1){pPhase=2;pProg=0;}

      }else if(pPhase===2){
        // Paper flies toward globe surface
        pProg+=dt*0.65;
        const t=Math.min(1,pProg);
        const carrier=pType==='bird'?birdGroup:ufoGroup;
        const target=new THREE.Vector3(globeGroup.position.x+(Math.random()-0.5)*0.4,globeGroup.position.y+(Math.random()-0.5)*0.3,GLOBE_R*0.9);
        activePaper.position.lerpVectors(carrier.position,target,t);
        paperMat.opacity=1-t*0.3;
        if(pProg>=1){pPhase=3;pProg=0;rippleProg=0;rippleMesh.position.copy(activePaper.position);rippleMesh.quaternion.copy(camera.quaternion);tractorMat.opacity=0;}

      }else if(pPhase===3){
        // Paper dissolves, ripple expands
        pProg+=dt*2.4;
        paperMat.opacity=Math.max(0,1-pProg);
        if(pProg>=1){pPhase=0;pTimer=0;}
      }

      if(rippleProg<1){
        rippleProg+=dt*1.5;
        rippleMesh.scale.setScalar(0.2+rippleProg*2.0);
        rippleMat.opacity=(1-rippleProg)*0.8;
      }else{rippleMat.opacity=0;}

      // 9. Update HUD pill screen positions (anchored to globe-relative coords)
      const newPos:Record<string,{x:number;y:number;ax:number;ay:number}>={};
      pillDefs.forEach(p=>{
        const wp=p.wp.clone().applyMatrix4(globeGroup.matrixWorld);
        const ap=p.ap.clone().applyMatrix4(globeGroup.matrixWorld);
        const sp=project(wp); const sa=project(ap);
        newPos[p.id]={x:sp.x,y:sp.y,ax:sa.x,ay:sa.y};
      });
      setPillPositions(newPos);

      // UFO screen pos for RECON tag
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
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] select-none overflow-visible"
    >
      {/* Transparent WebGL canvas — blends with the hero photo background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"
        style={{ background: 'transparent' }}
        aria-label="Interactive 3D Knowledge Globe with orbiting UFO and bird"
      />

      {/* SVG connector lines — pill to anchor dot on globe */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {pillDefs.map(p => {
          const pos=pillPositions[p.id]; if(!pos) return null;
          return (
            <g key={p.id}>
              <line x1={pos.x} y1={pos.y} x2={pos.ax} y2={pos.ay}
                stroke={p.color} strokeWidth="1.1" strokeDasharray="4 3" opacity="0.6"/>
              <circle cx={pos.ax} cy={pos.ay} r="3" fill={p.color} opacity="0.9" filter="url(#glow)" className="animate-pulse"/>
            </g>
          );
        })}
      </svg>

      {/* 7 Navigation Pills */}
      {pillDefs.map(p=>{
        const pos=pillPositions[p.id]; if(!pos) return null;
        const Icon=p.icon;
        return (
          <button
            key={p.id}
            type="button"
            onClick={p.action}
            style={{
              transform:`translate(${pos.x}px,${pos.y}px) translate(-50%,-50%)`,
              borderColor:p.color,
              boxShadow:`0 4px 20px rgba(0,0,0,0.5),0 0 14px ${p.color}44`
            }}
            className="absolute left-0 top-0 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#06112a]/88 hover:bg-[#0d1f45] text-white text-[10.5px] sm:text-[11px] font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 border cursor-pointer whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:p.color,boxShadow:`0 0 5px ${p.color}`}}/>
            <Icon className="w-3 h-3 flex-shrink-0" style={{color:p.color}}/>
            <span>{p.name}</span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-slate-200">{p.tag}</span>
          </button>
        );
      })}

      {/* RECON SURVEYOR badge — tracks UFO */}
      {ufoScreenPos&&(
        <div
          style={{transform:`translate(${ufoScreenPos.x+30}px,${ufoScreenPos.y-22}px) translate(-50%,-50%)`}}
          className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06112a]/88 border border-sky-400/55 text-[9px] font-mono text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.4)] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"/>
          <span>RECON SURVEYOR • 02%</span>
        </div>
      )}

      {/* Drag hint */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[9.5px] text-cyan-200/70 pointer-events-none backdrop-blur-sm z-10">
        <RotateCcw className="w-2.5 h-2.5 text-cyan-400"/>
        <span>Drag to rotate</span>
      </div>
    </div>
  );
};

// Helper: get approximate forward Z for UFO yaw — just returns a stable value
function velZ(_pos: THREE.Vector3, _globePos: THREE.Vector3): number { return 0.5; }
