import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ThreeNeuralCoreProps {
  className?: string;
  interactive?: boolean;
  theme?: 'cyan' | 'purple' | 'emerald';
}

export const ThreeNeuralCore: React.FC<ThreeNeuralCoreProps> = ({ 
  className = '',
  interactive = true,
  theme = 'cyan'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Palette configurations based on theme
    const palettes = {
      cyan: {
        crystalColor: 0x0ea5e9,
        crystalEmissive: 0x0284c7,
        innerColor: 0x38bdf8,
        innerEmissive: 0x22d3ee,
        wireframe: 0x38bdf8,
        ring1: 0x22d3ee,
        ring1Emissive: 0x0891b2,
        ring2: 0x818cf8,
        ring2Emissive: 0x4f46e5,
        nodes: 0x67e8f9,
        lines: 0x38bdf8,
        particles: 0x93c5fd,
        keyLight: 0x38bdf8,
        rimLight: 0x818cf8,
      },
      purple: {
        crystalColor: 0x9333ea,
        crystalEmissive: 0x7e22ce,
        innerColor: 0xc084fc,
        innerEmissive: 0xd8b4fe,
        wireframe: 0xc084fc,
        ring1: 0xc084fc,
        ring1Emissive: 0x9333ea,
        ring2: 0x22d3ee,
        ring2Emissive: 0x0891b2,
        nodes: 0xe879f9,
        lines: 0xc084fc,
        particles: 0xf0abfc,
        keyLight: 0xc084fc,
        rimLight: 0x38bdf8,
      },
      emerald: {
        crystalColor: 0x059669,
        crystalEmissive: 0x047857,
        innerColor: 0x34d399,
        innerEmissive: 0x10b981,
        wireframe: 0x34d399,
        ring1: 0x34d399,
        ring1Emissive: 0x059669,
        ring2: 0x22d3ee,
        ring2Emissive: 0x0891b2,
        nodes: 0x6ee7b7,
        lines: 0x34d399,
        particles: 0xa7f3d0,
        keyLight: 0x34d399,
        rimLight: 0x38bdf8,
      }
    };

    const p = palettes[theme] || palettes.cyan;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
      });
    } catch {
      return;
    }

    const initialW = container.clientWidth || 300;
    const initialH = container.clientHeight || 300;

    renderer.setSize(initialW, initialH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 100);
    camera.position.z = 6.8;

    // Master Group for smooth rotational tilt & mouse parallax
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --- 1. CORE FACETED QUANTUM CRYSTAL (Icosahedron) ---
    // Flat shading gives distinct gemstone faces catching specular light
    const crystalGeo = new THREE.IcosahedronGeometry(1.25, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: p.crystalColor,
      emissive: p.crystalEmissive,
      emissiveIntensity: 0.65,
      roughness: 0.12,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      flatShading: true,
      transparent: true,
      opacity: 0.93,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    masterGroup.add(crystalMesh);

    // Inner glowing core
    const innerCoreGeo = new THREE.OctahedronGeometry(0.62, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: p.innerColor,
      emissive: p.innerEmissive,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.4,
      flatShading: true,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    masterGroup.add(innerCore);

    // Wireframe edge lattice cage
    const wireframeGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: p.wireframe,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    masterGroup.add(wireframeMesh);

    // --- 2. DUAL GYROSCOPIC QUANTUM RINGS ---
    const ringGeo1 = new THREE.TorusGeometry(2.05, 0.024, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: p.ring1,
      emissive: p.ring1Emissive,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    masterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.35, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: p.ring2,
      emissive: p.ring2Emissive,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 4;
    masterGroup.add(ring2);

    // Satellite beads travelling along the rings
    const beadGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bead1 = new THREE.Mesh(beadGeo, beadMat);
    const bead2 = new THREE.Mesh(beadGeo, beadMat);
    masterGroup.add(bead1);
    masterGroup.add(bead2);

    // --- 3. 3D NEURAL GRAPH (Connected Node Network) ---
    const nodeCount = 45;
    const nodePositions: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: p.nodes });
    const nodeInstanced = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.9 + Math.random() * 0.9;
      const sinPhi = Math.sin(phi);
      const pos = new THREE.Vector3(
        r * sinPhi * Math.cos(theta),
        r * sinPhi * Math.sin(theta),
        r * Math.cos(phi)
      );
      nodePositions.push(pos);
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.0035,
          (Math.random() - 0.5) * 0.0035,
          (Math.random() - 0.5) * 0.0035
        )
      );

      dummy.position.copy(pos);
      dummy.updateMatrix();
      nodeInstanced.setMatrixAt(i, dummy.matrix);
    }
    nodeInstanced.instanceMatrix.needsUpdate = true;
    masterGroup.add(nodeInstanced);

    // Dynamic Line Connections
    const maxLines = 85;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: p.lines,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    masterGroup.add(lineSegments);

    // --- 4. AMBIENT DATA PARTICLES / DUST ---
    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particleCoords[i] = (Math.random() - 0.5) * 7.5;
      particleCoords[i + 1] = (Math.random() - 0.5) * 7.5;
      particleCoords[i + 2] = (Math.random() - 0.5) * 7.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
    const particleMat = new THREE.PointsMaterial({
      color: p.particles,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 5. CINEMATIC REALISTIC LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x0a1026, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(p.keyLight, 4.2);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(p.rimLight, 3.8);
    rimLight.position.set(-5, -4, -3);
    scene.add(rimLight);

    const centerGlow = new THREE.PointLight(p.innerEmissive, 5.5, 6);
    centerGlow.position.set(0, 0, 0);
    masterGroup.add(centerGlow);

    // --- 6. MOUSE INTERACTION & SMOOTH LERP ---
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.5;
      targetRotX = -y * 0.5;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // --- 7. ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse lerp
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      // Master rotation & breathing
      masterGroup.rotation.x = currentRotX + Math.sin(elapsedTime * 0.7) * 0.06;
      masterGroup.rotation.y = currentRotY + elapsedTime * 0.16;

      // Crystal rotation
      crystalMesh.rotation.y = elapsedTime * 0.28;
      crystalMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;

      // Inner core counter-rotation
      innerCore.rotation.y = -elapsedTime * 0.55;
      innerCore.rotation.z = elapsedTime * 0.32;

      // Outer wireframe cage
      wireframeMesh.rotation.y = -elapsedTime * 0.12;
      wireframeMesh.rotation.z = Math.cos(elapsedTime * 0.2) * 0.2;

      // Gyroscope rings
      ring1.rotation.z = elapsedTime * 0.35;
      ring2.rotation.z = -elapsedTime * 0.28;

      // Satellite beads travel along rings
      const t1 = elapsedTime * 1.3;
      bead1.position.set(
        Math.cos(t1) * 2.05 * Math.cos(ring1.rotation.x),
        Math.sin(t1) * 2.05,
        -Math.cos(t1) * 2.05 * Math.sin(ring1.rotation.x)
      );

      const t2 = -elapsedTime * 1.0;
      bead2.position.set(
        Math.cos(t2) * 2.35,
        Math.sin(t2) * 2.35 * Math.cos(ring2.rotation.x),
        Math.sin(t2) * 2.35 * Math.sin(ring2.rotation.y)
      );

      // Node network positions & connections update
      let lineIdx = 0;
      for (let i = 0; i < nodeCount; i++) {
        const pos = nodePositions[i];
        pos.add(nodeVelocities[i]);

        // Keep nodes in sphere bounds
        if (pos.length() > 3.0 || pos.length() < 1.7) {
          nodeVelocities[i].negate();
        }

        dummy.position.copy(pos);
        dummy.updateMatrix();
        nodeInstanced.setMatrixAt(i, dummy.matrix);

        // Find neighbors for connection lines
        for (let j = i + 1; j < nodeCount; j++) {
          if (lineIdx < maxLines) {
            const dist = pos.distanceTo(nodePositions[j]);
            if (dist < 1.1) {
              const posArray = lineGeo.attributes.position.array as Float32Array;
              posArray[lineIdx * 6] = pos.x;
              posArray[lineIdx * 6 + 1] = pos.y;
              posArray[lineIdx * 6 + 2] = pos.z;
              posArray[lineIdx * 6 + 3] = nodePositions[j].x;
              posArray[lineIdx * 6 + 4] = nodePositions[j].y;
              posArray[lineIdx * 6 + 5] = nodePositions[j].z;
              lineIdx++;
            }
          }
        }
      }
      nodeInstanced.instanceMatrix.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIdx * 2);
      lineGeo.attributes.position.needsUpdate = true;

      // Slowly rotate dust starfield
      particles.rotation.y = elapsedTime * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // --- 8. RESIZE OBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    // --- 9. CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();

      crystalGeo.dispose();
      crystalMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, theme]);

  return (
    <div 
      ref={containerRef} 
      className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}
    />
  );
};
