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

    // Theme palettes
    const palettes = {
      cyan: {
        crystal: 0x0ea5e9,
        emissive: 0x0284c7,
        inner: 0x38bdf8,
        edges: 0x22d3ee,
        ring1: 0x38bdf8,
        ring2: 0x818cf8,
        ring3: 0x06b6d4,
        satellites: 0xffffff,
        vertices: 0x67e8f9,
        particles: 0x22d3ee,
        keyLight: 0x38bdf8,
        rimLight: 0xa855f7,
      },
      purple: {
        crystal: 0x9333ea,
        emissive: 0x6b21a8,
        inner: 0xc084fc,
        edges: 0xe879f9,
        ring1: 0xc084fc,
        ring2: 0x38bdf8,
        ring3: 0xa855f7,
        satellites: 0xffffff,
        vertices: 0xf0abfc,
        particles: 0xc084fc,
        keyLight: 0xc084fc,
        rimLight: 0x38bdf8,
      },
      emerald: {
        crystal: 0x059669,
        emissive: 0x047857,
        inner: 0x34d399,
        edges: 0x6ee7b7,
        ring1: 0x34d399,
        ring2: 0x38bdf8,
        ring3: 0x10b981,
        satellites: 0xffffff,
        vertices: 0xa7f3d0,
        particles: 0x34d399,
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Optimized camera distance for immersive 3D presence
    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 100);
    camera.position.z = 5.9;

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ========== 1. CRYSTALLINE CORE (Icosahedron) ==========
    const crystalGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: p.crystal,
      emissive: p.emissive,
      emissiveIntensity: 0.85,
      roughness: 0.02,
      metalness: 0.25,
      transmission: 0.65,
      ior: 1.7,
      thickness: 1.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    masterGroup.add(crystalMesh);

    // ========== 2. NEON EDGE WIREFRAME ==========
    const edgesGeo = new THREE.EdgesGeometry(crystalGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: p.edges,
      transparent: true,
      opacity: 0.8,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    crystalMesh.add(edgesMesh);

    // ========== 3. INNER ENERGY CORE ==========
    const innerGeo = new THREE.OctahedronGeometry(0.42, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: p.inner,
      emissive: p.edges,
      emissiveIntensity: 2.2,
      roughness: 0.05,
      metalness: 0.4,
      flatShading: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    masterGroup.add(innerMesh);

    // ========== 4. VERTEX BEACONS (instanced) ==========
    const vertexPositions = crystalGeo.attributes.position;
    const vertexCount = vertexPositions.count;
    const vertexGeo = new THREE.SphereGeometry(0.035, 10, 10);
    const vertexMat = new THREE.MeshBasicMaterial({ color: p.vertices });
    const vertexMesh = new THREE.InstancedMesh(vertexGeo, vertexMat, vertexCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < vertexCount; i++) {
      dummy.position.set(
        vertexPositions.getX(i),
        vertexPositions.getY(i),
        vertexPositions.getZ(i)
      );
      dummy.updateMatrix();
      vertexMesh.setMatrixAt(i, dummy.matrix);
    }
    vertexMesh.instanceMatrix.needsUpdate = true;
    crystalMesh.add(vertexMesh);

    // ========== 5. ORBITAL RINGS (sized to fit within camera view) ==========
    const ringGroup = new THREE.Group();
    masterGroup.add(ringGroup);

    // Ring 1 — primary orbit
    const ring1Geo = new THREE.TorusGeometry(1.55, 0.016, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: p.ring1,
      emissive: p.ring1,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.95,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.8;
    ring1.rotation.y = 0.3;
    ringGroup.add(ring1);

    // Ring 2 — secondary orbit (slightly larger)
    const ring2Geo = new THREE.TorusGeometry(1.78, 0.013, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: p.ring2,
      emissive: p.ring2,
      emissiveIntensity: 0.55,
      roughness: 0.15,
      metalness: 0.95,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3.5;
    ring2.rotation.y = Math.PI / 3;
    ringGroup.add(ring2);

    // Ring 3 — tertiary orbit (outermost, thinnest)
    const ring3Geo = new THREE.TorusGeometry(2.0, 0.01, 16, 120);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: p.ring3,
      emissive: p.ring3,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 5;
    ring3.rotation.z = Math.PI / 4;
    ringGroup.add(ring3);

    // ========== 6. ORBITING SATELLITES ==========
    const satGeo = new THREE.SphereGeometry(0.055, 14, 14);
    const satMat = new THREE.MeshStandardMaterial({
      color: p.satellites,
      emissive: p.edges,
      emissiveIntensity: 1.2,
    });
    const sat1 = new THREE.Mesh(satGeo, satMat);
    const sat2 = new THREE.Mesh(satGeo, satMat.clone());
    const sat3 = new THREE.Mesh(satGeo, satMat.clone());
    ringGroup.add(sat1, sat2, sat3);

    // ========== 7. FLOATING PARTICLE FIELD ==========
    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 1.8 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: p.particles,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    masterGroup.add(particlesMesh);

    // ========== 8. LIGHTING ==========
    const ambientLight = new THREE.AmbientLight(0x0a1026, 2.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(p.keyLight, 4.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(p.rimLight, 4.0);
    rimLight.position.set(-4, -4, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(0, 0, 6);
    scene.add(fillLight);

    const coreLight = new THREE.PointLight(p.edges, 5.0, 8);
    masterGroup.add(coreLight);

    // ========== 9. INTERACTION: CURSOR ROTATION + DRAG ==========
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let userRotX = 0;
    let userRotY = 0;
    let isHovered = false;

    // Normalised cursor position for rotation
    let targetCursorX = 0;
    let targetCursorY = 0;
    let smoothCursorX = 0;
    let smoothCursorY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;

      // Track cursor position for rotation influence
      const rect = container.getBoundingClientRect();
      targetCursorX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetCursorY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        dragVelocityX = deltaX * 0.008;
        dragVelocityY = deltaY * 0.008;
        userRotY += dragVelocityX;
        userRotX += dragVelocityY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      if (container) container.style.cursor = 'grab';
    };

    const onMouseEnter = () => { isHovered = true; };

    const onMouseLeave = () => {
      isHovered = false;
      isDragging = false;
      targetCursorX = 0;
      targetCursorY = 0;
      if (container) container.style.cursor = 'grab';
    };

    const onClick = () => {
      // Energy flash on click
      coreLight.intensity = 10.0;
      edgesMat.opacity = 1.0;
      innerMat.emissiveIntensity = 4.0;
      setTimeout(() => {
        coreLight.intensity = 5.0;
        edgesMat.opacity = 0.8;
        innerMat.emissiveIntensity = 2.2;
      }, 220);
    };

    if (interactive) {
      container.style.cursor = 'grab';
      container.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp);
      container.addEventListener('mouseenter', onMouseEnter);
      container.addEventListener('mouseleave', onMouseLeave);
      container.addEventListener('click', onClick);
    }

    // ========== 10. ANIMATION LOOP ==========
    let isVisible = true;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const t = clock.getElapsedTime();

      // Drag inertia
      if (!isDragging) {
        dragVelocityX *= 0.93;
        dragVelocityY *= 0.93;
        userRotY += dragVelocityX;
        userRotX += dragVelocityY;
      }

      // Smooth cursor tracking
      smoothCursorX += (targetCursorX - smoothCursorX) * 0.07;
      smoothCursorY += (targetCursorY - smoothCursorY) * 0.07;

      // Constant auto-rotation speed
      const autoSpeed = 0.15;

      // When hovered: cursor drives extra rotation; when not: just auto-rotate
      const cursorRotStrength = isHovered ? 0.5 : 0;

      masterGroup.rotation.x = userRotX
        + Math.sin(t * 0.4) * 0.04
        + smoothCursorY * cursorRotStrength;
      masterGroup.rotation.y = userRotY
        + t * autoSpeed
        - smoothCursorX * cursorRotStrength;

      // Crystal self-rotation
      crystalMesh.rotation.y += delta * 0.25;
      crystalMesh.rotation.x = Math.sin(t * 0.25) * 0.12;

      // Inner core counter-spin + breathing pulse
      innerMesh.rotation.y -= delta * 0.5;
      innerMesh.rotation.z += delta * 0.35;
      const breathe = 1.0 + Math.sin(t * 2.0) * 0.08;
      innerMesh.scale.setScalar(breathe);

      // Orbital rings — each spins on its own axis
      ring1.rotation.z += delta * 0.3;
      ring2.rotation.z -= delta * 0.22;
      ring3.rotation.z += delta * 0.18;

      // Satellites orbit along their ring paths
      const s1 = t * 1.1;
      sat1.position.set(
        Math.cos(s1) * 1.55,
        Math.sin(s1) * 1.55 * Math.cos(ring1.rotation.x),
        Math.sin(s1) * 1.55 * Math.sin(ring1.rotation.x)
      );

      const s2 = -t * 0.85;
      sat2.position.set(
        Math.cos(s2) * 1.78 * Math.cos(ring2.rotation.y),
        Math.sin(s2) * 1.78,
        Math.sin(s2) * 1.78 * Math.sin(ring2.rotation.x)
      );

      const s3 = t * 0.7 + Math.PI;
      sat3.position.set(
        Math.cos(s3) * 2.0,
        Math.sin(s3) * 2.0 * Math.cos(ring3.rotation.x),
        -Math.sin(s3) * 2.0 * Math.sin(ring3.rotation.z)
      );

      // Particles gentle drift
      particlesMesh.rotation.y += delta * 0.04;
      particlesMesh.rotation.x += delta * 0.02;

      // Core light pulse
      coreLight.intensity = 5.0 + Math.sin(t * 1.5) * 0.8;

      renderer.render(scene, camera);
    };

    // Pause when off-screen
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (!isVisible) {
            isVisible = true;
            clock.start();
            animate();
          }
        } else {
          isVisible = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Pause when tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        clock.start();
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animate();

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

    // ========== CLEANUP ==========
    return () => {
      cancelAnimationFrame(animationFrameId);
      isVisible = false;
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (interactive) {
        container.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mouseleave', onMouseLeave);
        container.removeEventListener('click', onClick);
      }

      crystalGeo.dispose();
      edgesGeo.dispose();
      innerGeo.dispose();
      vertexGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      satGeo.dispose();
      particlesGeo.dispose();

      crystalMat.dispose();
      edgesMat.dispose();
      innerMat.dispose();
      vertexMat.dispose();
      ring1Mat.dispose();
      ring2Mat.dispose();
      ring3Mat.dispose();
      satMat.dispose();
      particlesMat.dispose();

      renderer.forceContextLoss();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, theme]);

  return (
    <div 
      ref={containerRef} 
      className={`relative flex items-center justify-center select-none touch-none ${className}`}
      style={{ overflow: 'visible' }}
      title="Hover to control rotation • Click & Drag to spin"
    />
  );
};
