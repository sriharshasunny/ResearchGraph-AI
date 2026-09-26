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

    // Vibrant theme palettes with specular highlights
    const palettes = {
      cyan: {
        crystal: 0x0ea5e9,
        emissive: 0x0284c7,
        inner: 0x38bdf8,
        edges: 0x22d3ee,
        ringOuter: 0x38bdf8,
        ringInner: 0x818cf8,
        satellites: 0xffffff,
        vertices: 0x67e8f9,
        keyLight: 0x38bdf8,
        rimLight: 0xa855f7,
        glowHex: '#22d3ee',
      },
      purple: {
        crystal: 0x9333ea,
        emissive: 0x6b21a8,
        inner: 0xc084fc,
        edges: 0xe879f9,
        ringOuter: 0xc084fc,
        ringInner: 0x38bdf8,
        satellites: 0xffffff,
        vertices: 0xf0abfc,
        keyLight: 0xc084fc,
        rimLight: 0x38bdf8,
        glowHex: '#c084fc',
      },
      emerald: {
        crystal: 0x059669,
        emissive: 0x047857,
        inner: 0x34d399,
        edges: 0x6ee7b7,
        ringOuter: 0x34d399,
        ringInner: 0x38bdf8,
        satellites: 0xffffff,
        vertices: 0xa7f3d0,
        keyLight: 0x34d399,
        rimLight: 0x38bdf8,
        glowHex: '#34d399',
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
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, initialW / initialH, 0.1, 100);
    camera.position.z = 6.4;

    // Master Group for smooth mouse parallax, user drag & auto-rotation
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --- 1. CLEAN FACETED CRYSTALLINE JEWEL (Icosahedron) ---
    const crystalGeo = new THREE.IcosahedronGeometry(1.22, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: p.crystal,
      emissive: p.emissive,
      emissiveIntensity: 0.55,
      roughness: 0.05,
      metalness: 0.15,
      transmission: 0.6,
      ior: 1.52,
      thickness: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      flatShading: true,
      transparent: true,
      opacity: 0.94,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    masterGroup.add(crystalMesh);

    // --- 2. RAZOR-SHARP NEON FACET EDGES ---
    const edgesGeo = new THREE.EdgesGeometry(crystalGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: p.edges,
      transparent: true,
      opacity: 0.75,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    crystalMesh.add(edgesMesh);

    // --- 3. INNER RADIANT QUANTUM EMITTER ---
    const innerGeo = new THREE.OctahedronGeometry(0.58, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: p.inner,
      emissive: p.edges,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.3,
      flatShading: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    masterGroup.add(innerMesh);

    // --- 4. GEOMETRIC VERTEX BEACONS ---
    const vertexPositions = crystalGeo.attributes.position;
    const vertexCount = vertexPositions.count;
    const vertexGeo = new THREE.SphereGeometry(0.045, 12, 12);
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

    // --- 5. CHRONO-RINGS & SATELLITES ---
    const ringGroup = new THREE.Group();
    masterGroup.add(ringGroup);

    const ring1Geo = new THREE.TorusGeometry(1.95, 0.018, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: p.ringOuter,
      emissive: p.ringOuter,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3.2;
    ringGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.25, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: p.ringInner,
      emissive: p.ringInner,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 4;
    ringGroup.add(ring2);

    // Satellites
    const satGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const satMat = new THREE.MeshBasicMaterial({ color: p.satellites });
    const sat1 = new THREE.Mesh(satGeo, satMat);
    const sat2 = new THREE.Mesh(satGeo, satMat);
    const sat3 = new THREE.Mesh(satGeo, satMat);
    ringGroup.add(sat1);
    ringGroup.add(sat2);
    ringGroup.add(sat3);

    // --- 6. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x0a1026, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(p.keyLight, 4.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(p.rimLight, 3.8);
    rimLight.position.set(-4, -4, -3);
    scene.add(rimLight);

    const coreLight = new THREE.PointLight(p.edges, 4.5, 6);
    masterGroup.add(coreLight);

    // --- 7. RICH INTERACTION: DRAG TO ROTATE & HOVER SPEEDUP ---
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let userRotX = 0;
    let userRotY = 0;
    let isHovered = false;
    let pulseScale = 1.0;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
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
      if (container) {
        container.style.cursor = 'grab';
      }
    };

    const onMouseEnter = () => {
      isHovered = true;
      pulseScale = 1.08;
    };

    const onMouseLeave = () => {
      isHovered = false;
      isDragging = false;
      pulseScale = 1.0;
      if (container) {
        container.style.cursor = 'grab';
      }
    };

    const onClick = () => {
      // Trigger brief luminous energy pulse
      pulseScale = 1.15;
      coreLight.intensity = 8.0;
      setTimeout(() => {
        pulseScale = isHovered ? 1.08 : 1.0;
        coreLight.intensity = 4.5;
      }, 250);
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

    // --- 8. SMART VISIBILITY & ANIMATION LOOP ---
    let isVisible = true;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const t = clock.getElapsedTime();

      // Inertia dampening for user drag
      if (!isDragging) {
        dragVelocityX *= 0.94;
        dragVelocityY *= 0.94;
        userRotY += dragVelocityX;
        userRotX += dragVelocityY;
      }

      // Smooth scale interpolation for hover pulse
      const currentScale = masterGroup.scale.x;
      const targetScale = pulseScale;
      const newScale = currentScale + (targetScale - currentScale) * 0.1;
      masterGroup.scale.set(newScale, newScale, newScale);

      // Speed multiplier when hovered
      const speed = isHovered ? 1.8 : 1.0;

      // Master rotation combining user drag and gentle cosmic drift
      masterGroup.rotation.x = userRotX + Math.sin(t * 0.5) * 0.05;
      masterGroup.rotation.y = userRotY + t * 0.12 * speed;

      // Crystal rotation
      crystalMesh.rotation.y += delta * 0.3 * speed;
      crystalMesh.rotation.x = Math.sin(t * 0.3) * 0.18;

      // Inner core counter-rotation
      innerMesh.rotation.y -= delta * 0.6 * speed;
      innerMesh.rotation.z += delta * 0.4 * speed;

      // Gyroscope rings rotation
      ring1.rotation.z += delta * 0.35 * speed;
      ring2.rotation.z -= delta * 0.28 * speed;

      // Satellites orbiting along rings
      const t1 = t * 1.2 * speed;
      sat1.position.set(
        Math.cos(t1) * 1.95 * Math.cos(ring1.rotation.x),
        Math.sin(t1) * 1.95,
        -Math.cos(t1) * 1.95 * Math.sin(ring1.rotation.x)
      );

      const t2 = -t * 0.95 * speed;
      sat2.position.set(
        Math.cos(t2) * 2.25,
        Math.sin(t2) * 2.25 * Math.cos(ring2.rotation.x),
        Math.sin(t2) * 2.25 * Math.sin(ring2.rotation.y)
      );

      const t3 = t * 0.8 * speed + Math.PI;
      sat3.position.set(
        Math.cos(t3) * 1.95 * Math.cos(ring1.rotation.x),
        Math.sin(t3) * 1.95,
        -Math.cos(t3) * 1.95 * Math.sin(ring1.rotation.x)
      );

      renderer.render(scene, camera);
    };

    // Pause when off-screen to avoid lag on other pages
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

    // Pause when tab is hidden
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

    // --- CLEANUP ---
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
      satGeo.dispose();

      crystalMat.dispose();
      edgesMat.dispose();
      innerMat.dispose();
      vertexMat.dispose();
      ring1Mat.dispose();
      ring2Mat.dispose();
      satMat.dispose();

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
      className={`relative flex items-center justify-center select-none overflow-hidden touch-none ${className}`}
      title="Click & Drag to rotate • Hover to energize"
    />
  );
};
