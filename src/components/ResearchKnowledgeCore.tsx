import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Activity,
  Lightbulb,
  Network,
  Quote,
  Sparkles,
} from 'lucide-react';
import { originalHubPoints } from './researchCoreModelData';

const MODEL_ORIGIN = { x: 1210, y: 444 };
const MODEL_BOUNDS = { width: 800, height: 540 };
const MODEL_RADIUS = 141;
const SPHERE_RADIUS = 2.4;
// Reduced globe zoom from 1.16 to 0.84 so the 3D globe is smaller, proportional,
// and leaves ample breathing room without dominating or colliding with cards.
const MODEL_ZOOM = 0.84;

// Essential, non-overlapping labels positioned cleanly outside card boundaries:
// Left preview card ends around x: 960, top: 8%-40%
// Right preview card is around x: 1450-1600, top: 10%-42%
// Overlapping labels (Methods, Authors, Datasets, Papers) have been removed.
const labelData = [
  { id: 'graph', label: 'Knowledge Graph', Icon: Network, x: 1210, y: 235, color: '#7769e8', tone: 'from-violet-500 to-indigo-400' },
  { id: 'citations', label: 'Citations', Icon: Quote, x: 985, y: 440, color: '#36b9d8', tone: 'from-cyan-400 to-sky-400', query: 'Attention Is All You Need' },
  { id: 'concepts', label: 'Concepts', Icon: Lightbulb, x: 1435, y: 440, color: '#8b70e8', tone: 'from-violet-500 to-indigo-400', query: 'Multi-Head Attention' },
  { id: 'chat', label: 'AI Insights', Icon: Sparkles, x: 1030, y: 565, color: '#7769e8', tone: 'from-violet-500 to-indigo-400' },
  { id: 'gaps', label: 'Research Gaps', Icon: Activity, x: 1210, y: 625, color: '#36b9d8', tone: 'from-cyan-400 to-blue-400' },
] as const;

type ModelLabel = (typeof labelData)[number];

export const ResearchKnowledgeCore: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const rotationTargetRef = useRef<number | null>(null);
  const rippleSequenceRef = useRef(0);
  const hoveredTintRef = useRef<THREE.Color | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [rippleEffect, setRippleEffect] = useState<{ color: string; id: number } | null>(null);
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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);
    const globe = new THREE.Group();
    globeRef.current = globe;
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

    // Surface Network Mesh Arcs
    const hubDirections = originalHubPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
    const edgePositions: number[] = [];
    const edgeColors: number[] = [];
    const edgePalette = [new THREE.Color('#43d9ff'), new THREE.Color('#468dff'), new THREE.Color('#9b78ff')];
    const edgePairs = new Set<string>();
    hubDirections.forEach((direction, nodeIndex) => {
      hubDirections
        .map((candidate, candidateIndex) => ({ candidate, candidateIndex, distance: direction.distanceToSquared(candidate) }))
        .filter(({ candidateIndex }) => candidateIndex !== nodeIndex)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)
        .forEach(({ candidate, candidateIndex }) => {
          const key = [nodeIndex, candidateIndex].sort((a, b) => a - b).join(':');
          if (edgePairs.has(key)) return;
          edgePairs.add(key);
          const start = direction.clone();
          const end = candidate.clone();
          const angle = start.angleTo(end);
          const divisions = 12;
          const color = edgePalette[(nodeIndex + candidateIndex) % edgePalette.length];
          let previous = start.clone().multiplyScalar(SPHERE_RADIUS * 1.012);
          for (let step = 1; step <= divisions; step += 1) {
            const progress = step / divisions;
            const next = start.clone().multiplyScalar(Math.sin((1 - progress) * angle))
              .add(end.clone().multiplyScalar(Math.sin(progress * angle)))
              .divideScalar(Math.sin(angle))
              .multiplyScalar(SPHERE_RADIUS * 1.012);
            edgePositions.push(previous.x, previous.y, previous.z, next.x, next.y, next.z);
            const intensity = 0.5 + 0.18 * (1 - Math.abs(progress - 0.5) * 2);
            edgeColors.push(color.r * intensity, color.g * intensity, color.b * intensity, color.r * intensity, color.g * intensity, color.b * intensity);
            previous = next;
          }
        });
    });

    const networkGeometry = new THREE.BufferGeometry();
    networkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
    networkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(edgeColors, 3));
    const network = new THREE.LineSegments(networkGeometry, new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    network.renderOrder = 3;
    globe.add(network);

    // Subtle orbital guiding rings
    const orbitMaterials = [0x42cfff, 0x6a8dff, 0xa276ff].map(color => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    const orbitTracks = [
      { radius: 3.25, tube: 0.010, rotation: [0.18, 0.22, -0.28] },
      { radius: 3.50, tube: 0.008, rotation: [0.95, 0.35, 0.15] },
      { radius: 3.75, tube: 0.007, rotation: [0.62, -0.68, 0.32] },
    ] as const;
    orbitTracks.forEach((track, index) => {
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(track.radius, track.tube, 4, 160), orbitMaterials[index]);
      orbit.rotation.set(track.rotation[0], track.rotation[1], track.rotation[2]);
      orbit.renderOrder = 1;
      scene.add(orbit);
    });

    // Outer Rim Fresnel Aura
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

    // Glowing Hub Points on Globe
    const positions: number[] = [];
    const colors: number[] = [];
    const phases: number[] = [];
    const sizes: number[] = [];
    originalHubPoints.forEach(([x, y, z, color, size], index) => {
      positions.push(x * SPHERE_RADIUS * 1.004, y * SPHERE_RADIUS * 1.004, z * SPHERE_RADIUS * 1.004);
      const nodeColor = new THREE.Color(color);
      colors.push(nodeColor.r, nodeColor.g, nodeColor.b);
      phases.push(index * 1.7);
      sizes.push(size * 0.16);
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

    // Glow Canvas Texture
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 64;
    const glowContext = glowCanvas.getContext('2d');
    if (glowContext) {
      const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.35, 'rgba(255,255,255,.65)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      glowContext.fillStyle = gradient;
      glowContext.fillRect(0, 0, 64, 64);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    // =========================================================================
    // REAL 3D ROTATING CELESTIAL SATELLITE BALLS THAT OPEN UP WITH LANES & STAR BLOOM
    // =========================================================================
    interface CelestialSatellite {
      radiusX: number;
      radiusZ: number;
      tiltX: number;
      tiltZ: number;
      speed: number;
      angle: number;
      baseColor: THREE.Color;
      starColor: THREE.Color;
      group: THREE.Group;
      ballMesh: THREE.Mesh;
      glowSprite: THREE.Sprite;
      starFlareSprite: THREE.Sprite;
      lanesMesh: THREE.LineSegments;
    }

    const satelliteConfigs = [
      {
        radiusX: 3.35,
        radiusZ: 3.05,
        tiltX: 0.25,
        tiltZ: -0.32,
        speed: 0.85,
        angle: 0.0,
        baseColor: new THREE.Color('#38bdf8'),
        starColor: new THREE.Color('#fbbf24'), // radiant golden star
      },
      {
        radiusX: 3.65,
        radiusZ: 3.35,
        tiltX: -0.42,
        tiltZ: 0.35,
        speed: -0.68,
        angle: Math.PI * 0.7,
        baseColor: new THREE.Color('#22d3ee'),
        starColor: new THREE.Color('#38bdf8'), // brilliant hyper-cyan star
      },
      {
        radiusX: 3.95,
        radiusZ: 3.60,
        tiltX: 0.55,
        tiltZ: 0.42,
        speed: 0.95,
        angle: Math.PI * 1.4,
        baseColor: new THREE.Color('#a855f7'),
        starColor: new THREE.Color('#f472b6'), // celestial pink/violet star
      },
    ];

    const satellites: CelestialSatellite[] = satelliteConfigs.map((cfg) => {
      const satGroup = new THREE.Group();

      // 1. Core Sphere Ball
      const ballGeo = new THREE.SphereGeometry(0.13, 24, 24);
      const ballMat = new THREE.MeshBasicMaterial({ color: cfg.baseColor.clone() });
      const ballMesh = new THREE.Mesh(ballGeo, ballMat);
      satGroup.add(ballMesh);

      // 2. Halo Glow Sprite
      const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: cfg.baseColor.clone(),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.set(0.65, 0.65, 1);
      satGroup.add(glowSprite);

      // 3. Sparkling Star Flare Sprite (activates when in front)
      const starFlareMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: cfg.starColor.clone(),
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const starFlareSprite = new THREE.Sprite(starFlareMat);
      starFlareSprite.scale.set(1.4, 1.4, 1);
      satGroup.add(starFlareSprite);

      // 4. Opening "Lanes" / Constellation Beams
      // Geometric radiant lanes connecting outward and back towards the globe
      const lanePositions: number[] = [];
      const laneColors: number[] = [];
      const numLanes = 8;
      for (let i = 0; i < numLanes; i++) {
        const phi = (i / numLanes) * Math.PI * 2;
        const length = 0.75 + (i % 2) * 0.45;
        const targetX = Math.cos(phi) * length;
        const targetY = Math.sin(phi) * length;
        const targetZ = (i % 2 === 0 ? 0.3 : -0.3) * length;

        lanePositions.push(0, 0, 0, targetX, targetY, targetZ);
        laneColors.push(cfg.starColor.r, cfg.starColor.g, cfg.starColor.b);
        laneColors.push(cfg.baseColor.r, cfg.baseColor.g, cfg.baseColor.b);
      }
      const laneGeo = new THREE.BufferGeometry();
      laneGeo.setAttribute('position', new THREE.Float32BufferAttribute(lanePositions, 3));
      laneGeo.setAttribute('color', new THREE.Float32BufferAttribute(laneColors, 3));
      const laneMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const lanesMesh = new THREE.LineSegments(laneGeo, laneMat);
      lanesMesh.scale.set(0.001, 0.001, 0.001);
      satGroup.add(lanesMesh);

      scene.add(satGroup);

      return {
        ...cfg,
        group: satGroup,
        ballMesh,
        glowSprite,
        starFlareSprite,
        lanesMesh,
      };
    });

    // Surface Energy Dust Arcs
    const randomDirection = () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const arcs = Array.from({ length: 10 }, (_, arcIndex) => {
      const particles = Array.from({ length: 6 }, () => {
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
      return { particles, from: randomDirection(), to: randomDirection(), progress: -Math.random() * 1.2, speed: 0.20 + Math.random() * 0.28 };
    });

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'absolute inset-0 h-full w-full';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.prepend(renderer.domElement);

    let frame = 0;
    let elapsed = 0;
    let lastFrameTime = 0;
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
      camera.position.set(0, 0, SPHERE_RADIUS * (height / 2) / (MODEL_RADIUS * scale * MODEL_ZOOM * Math.tan(Math.PI / 9)));
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

    const animate = (time = performance.now()) => {
      frame = window.requestAnimationFrame(animate);
      const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 16.667, 2) : 1;
      lastFrameTime = time;
      if (!reduceMotion.matches) elapsed += 0.016 * delta;
      uniforms.time.value = elapsed;

      // Globe continuous rotation
      if (!dragState) {
        if (rotationTargetRef.current !== null && !reduceMotion.matches) {
          const remaining = rotationTargetRef.current - globe.rotation.y;
          const step = Math.sign(remaining) * Math.min(0.045, Math.max(0.002, Math.abs(remaining) * 0.06)) * delta;
          globe.rotation.y += step;
          if (Math.abs(remaining) <= 0.006) {
            globe.rotation.y = rotationTargetRef.current;
            rotationTargetRef.current = null;
          }
        } else {
          rotationTargetRef.current = null;
          globe.rotation.y += yawVelocity * delta;
          yawVelocity += ((reduceMotion.matches ? 0 : 0.0016) - yawVelocity) * (1 - Math.pow(0.97, delta));
        }
        globe.rotation.x += (0 - globe.rotation.x) * (1 - Math.pow(0.99, delta));
      }

      // =======================================================================
      // CELESTIAL SATELLITES ANIMATION: ORBIT, OPEN LANES & STAR BLOOM IN FRONT
      // =======================================================================
      satellites.forEach((sat) => {
        if (!reduceMotion.matches) {
          sat.angle += sat.speed * 0.012 * delta;
        }

        // Orbital parametric coordinate
        const unrotatedX = Math.cos(sat.angle) * sat.radiusX;
        const unrotatedZ = Math.sin(sat.angle) * sat.radiusZ;

        // Apply orbit inclination tilt
        const posX = unrotatedX * Math.cos(sat.tiltZ) - unrotatedZ * Math.sin(sat.tiltZ);
        const posY = unrotatedX * Math.sin(sat.tiltX) + Math.sin(sat.angle * 2) * 0.18;
        const posZ = unrotatedZ * Math.cos(sat.tiltX);

        sat.group.position.set(posX, posY, posZ);

        // When in front of the globe (posZ > 0):
        // Blossom open, reveal glowing lanes, and shine with star color!
        const frontRatio = THREE.MathUtils.clamp(posZ / (sat.radiusZ * 0.9), 0, 1);
        const openCurve = THREE.MathUtils.smoothstep(frontRatio, 0.15, 0.85);

        // 1. Ball scale: expands up to 1.55x in front
        const ballScale = 1.0 + openCurve * 0.55;
        sat.ballMesh.scale.setScalar(ballScale);

        // 2. Color transition from base orbital hue to radiant star hue
        const currentMat = sat.ballMesh.material as THREE.MeshBasicMaterial;
        currentMat.color.copy(sat.baseColor).lerp(sat.starColor, openCurve);

        // 3. Star flare bloom opacity & pulsing
        const starGlowMat = sat.starFlareSprite.material;
        starGlowMat.opacity = openCurve * (0.8 + 0.2 * Math.sin(elapsed * 5.0 + sat.angle));
        sat.starFlareSprite.scale.setScalar(1.2 + openCurve * 0.6);

        // 4. "Lanes" opening and closing:
        // When coming in front, lanes fan out to scale 1.0 with vivid opacity!
        // When going to the sides/back, lanes contract back to 0.0!
        sat.lanesMesh.scale.setScalar(Math.max(0.001, openCurve));
        (sat.lanesMesh.material as THREE.LineBasicMaterial).opacity = openCurve * 0.9;
        sat.lanesMesh.rotation.z += 0.01 * delta;

        // Adjust renderOrder so it cleanly renders behind/in front
        sat.group.renderOrder = posZ > 0 ? 8 : 0;
      });

      // Surface Dust Arcs
      arcs.forEach(arc => {
        arc.progress += reduceMotion.matches ? 0 : 0.016 * delta * arc.speed;
        if (arc.progress > 1.3) {
          arc.from = randomDirection();
          arc.to = arc.from.clone().add(randomDirection().multiplyScalar(0.8)).normalize();
          arc.progress = -Math.random() * 1.2;
          arc.speed = 0.20 + Math.random() * 0.28;
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

      // Hub tinting on label hover
      const tintUniform = hubs.material as THREE.ShaderMaterial;
      tintUniform.uniforms.tintMix.value += ((hoveredTintRef.current ? 1 : 0) - tintUniform.uniforms.tintMix.value) * (1 - Math.pow(0.9, delta));
      if (hoveredTintRef.current) tintUniform.uniforms.tint.value.copy(hoveredTintRef.current);
      rim.material.uniforms.color.value.lerp(hoveredTintRef.current ?? baseRimColor, 1 - Math.pow(0.92, delta));

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
      orbitMaterials.forEach(material => material.dispose());
      coreTexture.dispose();
      glowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      globeRef.current = null;
    };
  }, []);

  const handleLabelClick = (label: ModelLabel) => {
    const globe = globeRef.current;
    if (!globe) return;
    const rippleId = rippleSequenceRef.current + 1;
    rippleSequenceRef.current = rippleId;
    setRippleEffect({ color: label.color, id: rippleId });
    const target = globe.rotation.y + Math.PI * 1.5;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      globe.rotation.y = target;
      rotationTargetRef.current = null;
    } else {
      rotationTargetRef.current = target;
    }
  };

  const updateHoveredLabel = (label: ModelLabel | null) => {
    setHoveredLabel(label?.id ?? null);
    hoveredTintRef.current = label ? new THREE.Color(label.color) : null;
  };

  const offset = (coordinate: number, axis: 'x' | 'y') =>
    `calc(50% + ${(coordinate - MODEL_ORIGIN[axis]) * modelScale}px)`;
  const labelScale = Math.max(0.68, Math.min(modelScale * 0.94, 0.95));

  return (
    <div ref={hostRef} className="relative h-[260px] w-full touch-pan-y select-none sm:h-[300px] lg:h-[340px] xl:h-[350px]" aria-label="Interactive research knowledge core">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(71,119,255,0.12)_0%,rgba(34,211,238,0.045)_48%,transparent_72%)] blur-xl" aria-hidden="true" />

      {rippleEffect && (
        <div
          key={rippleEffect.id}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] aspect-square -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${MODEL_RADIUS * 2 * modelScale * MODEL_ZOOM}px`, height: `${MODEL_RADIUS * 2 * modelScale * MODEL_ZOOM}px` }}
          aria-hidden="true"
        >
          {[0, 1, 2].map(index => (
            <span
              key={index}
              className="research-core-wave-ring absolute inset-0 rounded-full border"
              style={{
                borderColor: rippleEffect.color,
                boxShadow: `0 0 14px ${rippleEffect.color}b0, inset 0 0 9px ${rippleEffect.color}70`,
                animationDelay: `${index * 170}ms`,
              }}
              onAnimationEnd={index === 2 ? () => setRippleEffect(current => current?.id === rippleEffect.id ? null : current) : undefined}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center drop-shadow-[0_1px_5px_rgba(3,10,30,0.95)]" aria-hidden="true">
        <span className="text-[11px] font-extrabold tracking-[0.12em] text-white sm:text-[13px]">RESEARCH</span>
        <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-200 sm:text-[11px]">CORE</span>
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
          aria-label={`Rotate the research core from ${label}`}
          className={`research-core-label absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full border font-semibold leading-none text-white shadow-[0_4px_14px_rgba(0,0,0,.22)] transition duration-300 hover:scale-105 hover:shadow-[0_0_15px_var(--label-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${hoveredLabel === id ? 'bg-[#102a50]' : 'bg-[#071a3c]/95'}`}
          style={{
            left: offset(x, 'x'),
            top: offset(y, 'y'),
            gap: 6 * labelScale,
            padding: `${4 * labelScale}px ${8 * labelScale}px`,
            fontSize: `${Math.max(10, 11.8 * labelScale)}px`,
            borderColor: `${color}bf`,
            boxShadow: `0 4px 14px ${color}36`,
            ['--label-glow' as string]: `${color}8c`,
          }}
        >
          <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ${tone}`} style={{ width: Math.max(18, 23 * labelScale), height: Math.max(18, 23 * labelScale) }}>
            <Icon style={{ width: Math.max(11, 13.5 * labelScale), height: Math.max(11, 13.5 * labelScale) }} />
          </span>
          <span className="whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
};
