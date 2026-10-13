import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Activity,
  Database,
  FileText,
  Lightbulb,
  Network,
  Quote,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { originalHubPoints, originalOrbitSprites } from './researchCoreModelData';

const MODEL_ORIGIN = { x: 1210, y: 444 };
const MODEL_BOUNDS = { width: 800, height: 540 };
const MODEL_RADIUS = 141;
const SPHERE_RADIUS = 2.4;

const labelData = [
  { id: 'graph', label: 'Knowledge Graph', Icon: Network, x: 1228, y: 188, color: '#6d4dff', tone: 'from-violet-500 to-indigo-500' },
  { id: 'papers', label: 'Papers', Icon: FileText, x: 1034, y: 258, color: '#3b82f6', tone: 'from-blue-500 to-sky-400', query: 'Transformers' },
  { id: 'authors', label: 'Authors', Icon: Users, x: 1437, y: 296, color: '#ff8a1f', tone: 'from-orange-400 to-amber-400', query: 'Ashish Vaswani' },
  { id: 'methods', label: 'Methods', Icon: Settings2, x: 962, y: 349, color: '#3b82f6', tone: 'from-blue-500 to-sky-400', query: 'Self-Supervised' },
  { id: 'datasets', label: 'Datasets', Icon: Database, x: 1516, y: 388, color: '#3b82f6', tone: 'from-blue-500 to-sky-400', query: 'ImageNet' },
  { id: 'citations', label: 'Citations', Icon: Quote, x: 960, y: 453, color: '#22b8ff', tone: 'from-cyan-400 to-sky-400', query: 'Attention Is All You Need' },
  { id: 'concepts', label: 'Concepts', Icon: Lightbulb, x: 1498, y: 493, color: '#ff4fc3', tone: 'from-pink-500 to-fuchsia-400', query: 'Multi-Head Attention' },
  { id: 'chat', label: 'AI Insights', Icon: Sparkles, x: 990, y: 566, color: '#8b3df0', tone: 'from-violet-500 to-purple-400' },
  { id: 'gaps', label: 'Research Gaps', Icon: Activity, x: 1244, y: 659, color: '#ff3fc0', tone: 'from-pink-500 to-rose-400' },
] as const;

type ModelLabel = (typeof labelData)[number];

export const ResearchKnowledgeCore: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const hostRef = useRef<HTMLDivElement>(null);
  const hoveredTintRef = useRef<THREE.Color | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
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
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);
    const globe = new THREE.Group();
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

    const baseRimColor = new THREE.Color(0xe9f2ff);
    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS * 1.003, 96, 96),
      new THREE.ShaderMaterial({
        uniforms: { color: { value: baseRimColor.clone() } },
        transparent: true,
        depthWrite: false,
        vertexShader: 'varying vec3 normalView;void main(){normalView=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: 'varying vec3 normalView;uniform vec3 color;void main(){float rim=pow(1.0-abs(dot(normalView,vec3(0.0,0.0,1.0))),3.2)*0.85;gl_FragColor=vec4(color,rim);}',
      }),
    );
    rim.renderOrder = 6;
    scene.add(rim);

    // These 48 positions and their pulse sizes come from the supplied model's original shader geometry.
    const positions: number[] = [];
    const colors: number[] = [];
    const phases: number[] = [];
    const sizes: number[] = [];
    originalHubPoints.forEach(([x, y, z, color, size], index) => {
      positions.push(x * SPHERE_RADIUS * 1.004, y * SPHERE_RADIUS * 1.004, z * SPHERE_RADIUS * 1.004);
      const nodeColor = new THREE.Color(color);
      colors.push(nodeColor.r, nodeColor.g, nodeColor.b);
      phases.push(index * 1.7);
      sizes.push(size);
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

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 64;
    const glowContext = glowCanvas.getContext('2d');
    if (glowContext) {
      const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,.6)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      glowContext.fillStyle = gradient;
      glowContext.fillRect(0, 0, 64, 64);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const randomDirection = () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const arcs = Array.from({ length: 12 }, (_, arcIndex) => {
      const particles = Array.from({ length: 7 }, () => {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTexture,
          color: arcIndex % 2 ? 0x9fd0ff : 0xffb8f0,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }));
        sprite.visible = false;
        globe.add(sprite);
        return sprite;
      });
      return { particles, from: randomDirection(), to: randomDirection(), progress: -Math.random() * 1.2, speed: 0.22 + Math.random() * 0.3 };
    });

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'absolute inset-0 h-full w-full';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.prepend(renderer.domElement);

    let frame = 0;
    let elapsed = 0;
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
      camera.position.set(0, 0, SPHERE_RADIUS * (height / 2) / (MODEL_RADIUS * scale * Math.tan(Math.PI / 9)));
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

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (!reduceMotion.matches) elapsed += 0.016;
      uniforms.time.value = elapsed;
      if (!dragState) {
        globe.rotation.y += yawVelocity;
        yawVelocity += ((reduceMotion.matches ? 0 : 0.0016) - yawVelocity) * 0.03;
        globe.rotation.x += (0 - globe.rotation.x) * 0.01;
      }
      arcs.forEach(arc => {
        arc.progress += reduceMotion.matches ? 0 : 0.016 * arc.speed;
        if (arc.progress > 1.3) {
          arc.from = randomDirection();
          arc.to = arc.from.clone().add(randomDirection().multiplyScalar(0.8)).normalize();
          arc.progress = -Math.random() * 1.2;
          arc.speed = 0.22 + Math.random() * 0.3;
        }
        arc.particles.forEach((particle, index) => {
          const progress = arc.progress - index * 0.025;
          if (progress < 0 || progress > 1) {
            particle.visible = false;
            return;
          }
          particle.visible = true;
          particle.position.lerpVectors(arc.from, arc.to, progress).normalize().multiplyScalar(SPHERE_RADIUS * (1.01 + 0.12 * Math.sin(Math.PI * progress)));
          particle.scale.setScalar(index ? 0.14 * (1 - index / 8) : 0.24);
          (particle.material as THREE.SpriteMaterial).opacity = (1 - index / 7) * 0.9;
        });
      });
      const tintUniform = hubs.material as THREE.ShaderMaterial;
      tintUniform.uniforms.tintMix.value += ((hoveredTintRef.current ? 1 : 0) - tintUniform.uniforms.tintMix.value) * 0.1;
      if (hoveredTintRef.current) tintUniform.uniforms.tint.value.copy(hoveredTintRef.current);
      rim.material.uniforms.color.value.lerp(hoveredTintRef.current ?? baseRimColor, 0.08);
      scene.rotation.y = pointerX * 0.05;
      scene.rotation.x = pointerY * 0.03;
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
        } else if (object instanceof THREE.Sprite) {
          object.material.dispose();
        }
      });
      coreTexture.dispose();
      glowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const handleLabelClick = (label: ModelLabel) => {
    if (label.id === 'papers') setActivePage('search');
    else if (label.id === 'graph') setActivePage('graph');
    else if (label.id === 'gaps') setActivePage('gaps');
    else if (label.id === 'chat') setActivePage('chat');
    else if ('query' in label && label.query) {
      setSearchQuery(label.query);
      setActivePage('search');
    }
  };

  const updateHoveredLabel = (label: ModelLabel | null) => {
    setHoveredLabel(label?.id ?? null);
    hoveredTintRef.current = label ? new THREE.Color(label.color) : null;
  };

  const offset = (coordinate: number, axis: 'x' | 'y') =>
    `calc(50% + ${(coordinate - MODEL_ORIGIN[axis]) * modelScale}px)`;

  return (
    <div ref={hostRef} className="relative h-[300px] w-full max-w-[500px] touch-pan-y select-none sm:h-[330px]" aria-label="Interactive research knowledge core">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {originalOrbitSprites.map(sprite => (
          <img
            key={sprite.n}
            src={`/research-core/${sprite.n}.webp`}
            alt=""
            draggable={false}
            className="research-core-orbit-sprite absolute object-contain"
            style={{
              left: offset(sprite.cx, 'x'),
              top: offset(sprite.cy, 'y'),
              width: sprite.w * modelScale,
              height: sprite.h * modelScale,
              animationDuration: `${sprite.dur}s`,
              animationDelay: `${-sprite.dl}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center drop-shadow-[0_1px_5px_rgba(3,10,30,0.95)]" aria-hidden="true">
        <span className="text-[9px] font-extrabold tracking-[0.12em] text-white sm:text-[10px]">RESEARCH</span>
        <span className="text-[8px] font-bold tracking-[0.2em] text-cyan-200 sm:text-[9px]">CORE</span>
      </div>

      {labelData.map(({ id, label, Icon, x, y, color, tone }) => (
        <button
          key={id}
          type="button"
          onMouseEnter={() => updateHoveredLabel(labelData.find(item => item.id === id) ?? null)}
          onMouseLeave={() => updateHoveredLabel(null)}
          onFocus={() => updateHoveredLabel(labelData.find(item => item.id === id) ?? null)}
          onBlur={() => updateHoveredLabel(null)}
          onClick={() => handleLabelClick(labelData.find(item => item.id === id)!)}
          aria-label={`Explore ${label}`}
          className={`research-core-label absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-1.5 py-1 text-[8px] font-semibold leading-none text-slate-900 shadow-[0_4px_14px_rgba(0,0,0,.22)] transition duration-300 hover:scale-105 hover:shadow-[0_0_15px_var(--label-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:gap-1.5 sm:px-2 sm:text-[9px] ${hoveredLabel === id ? 'border-white/90 bg-white' : 'border-white/65 bg-white/90'}`}
          style={{ left: offset(x, 'x'), top: offset(y, 'y'), ['--label-glow' as string]: `${color}8c` }}
        >
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white sm:h-[18px] sm:w-[18px] ${tone}`}>
            <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </span>
          <span className="whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
};

