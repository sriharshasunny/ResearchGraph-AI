import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Network, 
  Sparkles, 
  Layers, 
  Link2, 
  FileText, 
  Users, 
  Database,
  Compass
} from 'lucide-react';

interface ResearchHangingPlatformCoreProps {
  onNavigate?: (route: string) => void;
  className?: string;
}

// Geographic data for real Earth continent shapes
// Latitude/Longitude bounds for continent point clouds
const CONTINENT_ZONES = [
  // North America
  { latMin: 15, latMax: 65, lonMin: -130, lonMax: -60, density: 450, prob: (lat: number, lon: number) => {
    if (lat > 50 && lon < -120) return 0.4;
    if (lat < 25 && lon < -100) return 0.2;
    return 0.85;
  }},
  // South America
  { latMin: -55, latMax: 12, lonMin: -80, lonMax: -35, density: 300, prob: (lat: number, lon: number) => {
    if (lat < -40 && lon > -65) return 0.2;
    if (lat > -15 && lon < -75) return 0.3;
    return 0.8;
  }},
  // Europe
  { latMin: 36, latMax: 65, lonMin: -10, lonMax: 40, density: 380, prob: () => 0.88 },
  // Africa
  { latMin: -35, latMax: 36, lonMin: -18, lonMax: 50, density: 420, prob: (lat: number, lon: number) => {
    if (lat > 15 && lon > 35) return 0.5;
    if (lat < -20 && lon < 15) return 0.3;
    return 0.82;
  }},
  // Asia
  { latMin: 10, latMax: 70, lonMin: 45, lonMax: 145, density: 650, prob: (lat: number, lon: number) => {
    if (lat > 55 && lon < 60) return 0.5;
    if (lat < 25 && lon > 125) return 0.3;
    return 0.85;
  }},
  // Australia
  { latMin: -42, latMax: -12, lonMin: 112, lonMax: 154, density: 180, prob: () => 0.85 }
];

// Major Research Hub Nodes with geographical coordinates
const RESEARCH_HUBS = [
  { id: 'mit', name: 'MIT / Harvard', lat: 42.36, lon: -71.09, c: '#38bdf8', weight: '24.2M Citations' },
  { id: 'stanford', name: 'Stanford / Bay Area', lat: 37.42, lon: -122.17, c: '#38bdf8', weight: '21.8M Citations' },
  { id: 'cern', name: 'CERN Geneva', lat: 46.23, lon: 6.05, c: '#a855f7', weight: '18.4M Citations' },
  { id: 'oxford', name: 'Oxford / Cambridge', lat: 51.75, lon: -1.25, c: '#818cf8', weight: '19.1M Citations' },
  { id: 'tokyo', name: 'University of Tokyo', lat: 35.71, lon: 139.76, c: '#06b6d4', weight: '14.5M Citations' },
  { id: 'singapore', name: 'NUS Singapore', lat: 1.29, lon: 103.77, c: '#10b981', weight: '9.8M Citations' },
  { id: 'sao_paulo', name: 'USP São Paulo', lat: -23.55, lon: -46.63, c: '#f59e0b', weight: '6.4M Citations' },
  { id: 'capetown', name: 'Univ of Cape Town', lat: -33.95, lon: 18.46, c: '#ec4899', weight: '4.9M Citations' }
];

// Helper to convert Lat/Lon to 3D Cartesian coords on sphere of radius R
function latLonToVector3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

export const ResearchHangingPlatformCore: React.FC<ResearchHangingPlatformCoreProps> = ({
  onNavigate,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction handlers for badges
  const handlePillClick = useCallback((target: string) => {
    if (onNavigate) {
      onNavigate(target);
    }
  }, [onNavigate]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 560;

    // 1. Renderer Setup
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 8.2);
    camera.lookAt(0, 0.35, 0);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 3.2);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.2);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    // Central emitter point light
    const daisPointLight = new THREE.PointLight(0x00f0ff, 4.5, 6);
    daisPointLight.position.set(0, -0.2, 0);
    scene.add(daisPointLight);

    // 4. Master Interactive Group (Rotates and Hovers)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ─────────────────────────────────────────────────────────────
    // A. THE 3D HANGING PLATFORM (FLOATING CITADEL ISLAND)
    // ─────────────────────────────────────────────────────────────
    const platformGroup = new THREE.Group();
    platformGroup.position.set(0, -1.15, 0);
    masterGroup.add(platformGroup);

    // 1. Floating Asteroid Rock Island Base (Inverted Jagged Cone)
    const rockGeo = new THREE.CylinderGeometry(2.4, 0.2, 2.2, 28, 7);
    const rockPos = rockGeo.attributes.position;
    for (let i = 0; i < rockPos.count; i++) {
      const x = rockPos.getX(i);
      const y = rockPos.getY(i);
      const z = rockPos.getZ(i);
      // Displace vertices with procedural rocky crags
      const noise1 = Math.sin(x * 4.5 + y * 3.2) * Math.cos(z * 4.5);
      const noise2 = Math.sin(y * 8.0) * 0.12;
      const taper = Math.max(0.1, (1.1 - y) / 2.2);
      rockPos.setXYZ(
        i,
        x * (1 + noise1 * 0.18 * taper),
        y + noise2 * 0.25,
        z * (1 + noise1 * 0.18 * taper)
      );
    }
    rockGeo.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.88,
      metalness: 0.2,
      flatShading: true
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.position.y = -1.1;
    platformGroup.add(rockMesh);

    // 2. Downward Graviton Repulsor Thruster Pods & Beams
    const thrusterBeams: THREE.Mesh[] = [];
    const numThrusters = 6;
    for (let i = 0; i < numThrusters; i++) {
      const theta = (i * Math.PI * 2) / numThrusters;
      const radius = 1.65;
      const tx = Math.cos(theta) * radius;
      const tz = Math.sin(theta) * radius;

      // Thruster metal nozzle housing
      const nozzleGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.35, 12);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.set(tx, -0.75, tz);
      platformGroup.add(nozzle);

      // Downward glowing thrust plasma cone
      const beamGeo = new THREE.ConeGeometry(0.32, 2.6, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(tx, -2.1, tz);
      // Rotate cone so it points downward
      beam.rotation.x = Math.PI;
      platformGroup.add(beam);
      thrusterBeams.push(beam);
    }

    // 3. Multi-tier Sci-Fi Mechanical Platform Deck
    // Outer Chassis Hull Ring
    const hullGeo = new THREE.CylinderGeometry(2.75, 2.55, 0.45, 48);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x162036,
      metalness: 0.82,
      roughness: 0.38
    });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    hullMesh.position.y = 0.05;
    platformGroup.add(hullMesh);

    // Outer Perimeter Running Cyan LED Rim Ring
    const rimLedGeo = new THREE.TorusGeometry(2.72, 0.028, 16, 64);
    const rimLedMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const rimLed = new THREE.Mesh(rimLedGeo, rimLedMat);
    rimLed.rotation.x = Math.PI / 2;
    rimLed.position.y = 0.26;
    platformGroup.add(rimLed);

    // Concentric Purple / Magenta Neon Track Loop
    const purpleNeonGeo = new THREE.TorusGeometry(2.18, 0.035, 16, 64);
    const purpleNeonMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const purpleNeon = new THREE.Mesh(purpleNeonGeo, purpleNeonMat);
    purpleNeon.rotation.x = Math.PI / 2;
    purpleNeon.position.y = 0.28;
    platformGroup.add(purpleNeon);

    // Concentric Deck Stepped Tier
    const deckTierGeo = new THREE.CylinderGeometry(2.1, 2.15, 0.12, 48);
    const deckTierMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      metalness: 0.9,
      roughness: 0.3
    });
    const deckTier = new THREE.Mesh(deckTierGeo, deckTierMat);
    deckTier.position.y = 0.28;
    platformGroup.add(deckTier);

    // Central Holographic Emitter Dais & Neon Rings
    const daisRings: THREE.Mesh[] = [];
    const daisRadiusList = [
      { r: 1.45, color: 0x00f0ff, thick: 0.045 },
      { r: 1.05, color: 0x38bdf8, thick: 0.038 },
      { r: 0.68, color: 0xa5f3fc, thick: 0.032 }
    ];

    daisRadiusList.forEach((spec, idx) => {
      const ringGeo = new THREE.TorusGeometry(spec.r, spec.thick, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: spec.color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.35 + idx * 0.02;
      platformGroup.add(ring);
      daisRings.push(ring);
    });

    // Central Emitter Core Disc
    const coreDiscGeo = new THREE.CircleGeometry(0.55, 32);
    const coreDiscMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const coreDisc = new THREE.Mesh(coreDiscGeo, coreDiscMat);
    coreDisc.rotation.x = -Math.PI / 2;
    coreDisc.position.y = 0.37;
    platformGroup.add(coreDisc);

    // Perimeter Sensor Mast Antennas on Platform Rim
    const mastGeo = new THREE.CylinderGeometry(0.02, 0.035, 1.2, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const mastLeft = new THREE.Mesh(mastGeo, mastMat);
    mastLeft.position.set(-2.4, 0.85, 0);
    platformGroup.add(mastLeft);

    const mastRight = new THREE.Mesh(mastGeo, mastMat);
    mastRight.position.set(2.4, 0.85, 0);
    platformGroup.add(mastRight);

    // Antenna Beacon Light tips
    const beaconGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const beaconLeftMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconLeft = new THREE.Mesh(beaconGeo, beaconLeftMat);
    beaconLeft.position.set(-2.4, 1.48, 0);
    platformGroup.add(beaconLeft);

    const beaconRightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const beaconRight = new THREE.Mesh(beaconGeo, beaconRightMat);
    beaconRight.position.set(2.4, 1.48, 0);
    platformGroup.add(beaconRight);

    // ─────────────────────────────────────────────────────────────
    // B. VERTICAL HOLOGRAPHIC PROJECTION COLUMN
    // ─────────────────────────────────────────────────────────────
    const beamGroup = new THREE.Group();
    platformGroup.add(beamGroup);

    // Volumetric Outer Column
    const holoColumnGeo = new THREE.CylinderGeometry(1.22, 1.22, 5.2, 32, 1, true);
    const holoColumnMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const holoColumn = new THREE.Mesh(holoColumnGeo, holoColumnMat);
    holoColumn.position.y = 2.9;
    beamGroup.add(holoColumn);

    // Inner Concentric Projection Filament
    const holoInnerGeo = new THREE.CylinderGeometry(0.72, 0.72, 5.4, 32, 1, true);
    const holoInnerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const holoInner = new THREE.Mesh(holoInnerGeo, holoInnerMat);
    holoInner.position.y = 2.9;
    beamGroup.add(holoInner);

    // Rising Particle Energy Filament inside the beam
    const numRise = 75;
    const riseGeo = new THREE.BufferGeometry();
    const risePos = new Float32Array(numRise * 3);
    const riseVels = new Float32Array(numRise);
    for (let i = 0; i < numRise; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.95;
      risePos[i * 3 + 0] = Math.cos(angle) * rad;
      risePos[i * 3 + 1] = 0.4 + Math.random() * 4.8;
      risePos[i * 3 + 2] = Math.sin(angle) * rad;
      riseVels[i] = 0.015 + Math.random() * 0.025;
    }
    riseGeo.setAttribute('position', new THREE.BufferAttribute(risePos, 3));
    const riseMat = new THREE.PointsMaterial({
      color: 0xa5f3fc,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const riseParticles = new THREE.Points(riseGeo, riseMat);
    beamGroup.add(riseParticles);

    // ─────────────────────────────────────────────────────────────
    // C. THE 3D ROTATING KNOWLEDGE EARTH GLOBE
    // ─────────────────────────────────────────────────────────────
    const globeGroup = new THREE.Group();
    // Position globe perfectly centered in the holographic beam above the dais
    globeGroup.position.set(0, 1.45, 0);
    masterGroup.add(globeGroup);

    const GLOBE_R = 1.15;

    // 1. Deep Electric Blue Core Sphere
    const globeSphereGeo = new THREE.SphereGeometry(GLOBE_R * 0.985, 48, 48);
    const globeSphereMat = new THREE.MeshStandardMaterial({
      color: 0x050e24,
      emissive: 0x021940,
      emissiveIntensity: 0.4,
      roughness: 0.45,
      metalness: 0.8
    });
    const globeSphere = new THREE.Mesh(globeSphereGeo, globeSphereMat);
    globeGroup.add(globeSphere);

    // 2. Latitude & Longitude Coordinate Lattice
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.38
    });

    // Latitude parallels
    for (let lat = -75; lat <= 75; lat += 15) {
      const rad = GLOBE_R * Math.cos(lat * (Math.PI / 180));
      const py = GLOBE_R * Math.sin(lat * (Math.PI / 180));
      const latGeo = new THREE.BufferGeometry();
      const latPts: number[] = [];
      for (let theta = 0; theta <= 360; theta += 5) {
        const radTheta = theta * (Math.PI / 180);
        latPts.push(rad * Math.cos(radTheta), py, rad * Math.sin(radTheta));
      }
      latGeo.setAttribute('position', new THREE.Float32BufferAttribute(latPts, 3));
      const latLine = new THREE.Line(latGeo, gridMat);
      globeGroup.add(latLine);
    }

    // Longitude meridians
    for (let lon = 0; lon < 360; lon += 30) {
      const lonGeo = new THREE.BufferGeometry();
      const lonPts: number[] = [];
      const radLon = lon * (Math.PI / 180);
      for (let lat = -90; lat <= 90; lat += 5) {
        const rad = GLOBE_R * Math.cos(lat * (Math.PI / 180));
        const py = GLOBE_R * Math.sin(lat * (Math.PI / 180));
        lonPts.push(rad * Math.sin(radLon), py, rad * Math.cos(radLon));
      }
      lonGeo.setAttribute('position', new THREE.Float32BufferAttribute(lonPts, 3));
      const lonLine = new THREE.Line(lonGeo, gridMat);
      globeGroup.add(lonLine);
    }

    // 3. High-Density Glowing Continents Point Cloud
    const continentPoints: number[] = [];
    CONTINENT_ZONES.forEach(zone => {
      for (let i = 0; i < zone.density; i++) {
        const lat = zone.latMin + Math.random() * (zone.latMax - zone.latMin);
        const lon = zone.lonMin + Math.random() * (zone.lonMax - zone.lonMin);
        if (zone.prob(lat, lon) > Math.random()) {
          const v = latLonToVector3(lat, lon, GLOBE_R * 1.006);
          continentPoints.push(v.x, v.y, v.z);
        }
      }
    });

    const contGeo = new THREE.BufferGeometry();
    contGeo.setAttribute('position', new THREE.Float32BufferAttribute(continentPoints, 3));
    const contMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.038,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    const contMesh = new THREE.Points(contGeo, contMat);
    globeGroup.add(contMesh);

    // 4. Research Hub Node Markers
    const hubPositions: THREE.Vector3[] = [];
    RESEARCH_HUBS.forEach(hub => {
      const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_R * 1.02);
      hubPositions.push(pos);

      // Glowing white core
      const nodeGeo = new THREE.SphereGeometry(0.035, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      globeGroup.add(nodeMesh);

      // Node halo
      const haloGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(hub.c),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(pos);
      globeGroup.add(haloMesh);
    });

    // 5. Dynamic 3D Inter-Hub Research Citation Arcs
    const arcPairs = [
      [0, 1], // MIT -> Stanford
      [0, 2], // MIT -> CERN
      [0, 3], // MIT -> Oxford
      [1, 4], // Stanford -> Tokyo
      [2, 3], // CERN -> Oxford
      [3, 5], // Oxford -> Singapore
      [4, 5], // Tokyo -> Singapore
      [0, 6], // MIT -> São Paulo
      [2, 7]  // CERN -> Cape Town
    ];

    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const arcMaterials: THREE.LineBasicMaterial[] = [];
    const photonBeads: THREE.Mesh[] = [];

    arcPairs.forEach(([iA, iB]) => {
      const pA = hubPositions[iA];
      const pB = hubPositions[iB];
      if (!pA || !pB) return;

      // Calculate elevated arc midpoint
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const midDist = mid.length();
      const altitude = GLOBE_R * 1.35;
      mid.normalize().multiplyScalar(Math.max(altitude, midDist * 1.32));

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      arcCurves.push(curve);

      const pts = curve.getPoints(36);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending
      });
      arcMaterials.push(curveMat);
      const curveLine = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(curveLine);

      // Traveling photon packet bead
      const beadGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      globeGroup.add(bead);
      photonBeads.push(bead);
    });

    // 6. Concentric Tilted Orbital Rings with Satellites
    const ringSpecs = [
      { r: GLOBE_R * 1.38, tiltX: -0.25, tiltZ: 0.15, color: 0x38bdf8, speed: 0.012 },
      { r: GLOBE_R * 1.55, tiltX: 0.38, tiltZ: -0.22, color: 0xa855f7, speed: -0.009 },
      { r: GLOBE_R * 1.72, tiltX: -0.42, tiltZ: -0.32, color: 0x06b6d4, speed: 0.015 }
    ];

    const satMeshes: { mesh: THREE.Mesh; spec: typeof ringSpecs[0]; angle: number }[] = [];

    ringSpecs.forEach(spec => {
      const ringGeo = new THREE.TorusGeometry(spec.r, 0.012, 12, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = spec.tiltX + Math.PI / 2;
      ring.rotation.z = spec.tiltZ;
      globeGroup.add(ring);

      // Satellite node
      const satGeo = new THREE.SphereGeometry(0.045, 10, 10);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sat = new THREE.Mesh(satGeo, satMat);
      globeGroup.add(sat);
      satMeshes.push({ mesh: sat, spec, angle: Math.random() * Math.PI * 2 });
    });

    // ─────────────────────────────────────────────────────────────
    // D. INTERACTION & ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0.12;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      rotationVelocityX = 0;
      rotationVelocityY = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      rotationVelocityY = dx * 0.005;
      rotationVelocityX = dy * 0.005;

      targetRotationY += rotationVelocityY;
      targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX + rotationVelocityX));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1. Smooth Gentle Levitation / Hovering of whole platform + globe
      masterGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.08;
      masterGroup.rotation.z = Math.sin(elapsedTime * 0.9) * 0.012;

      // 2. Drag Inertia and Master Y-rotation
      if (!isDragging) {
        rotationVelocityY *= 0.94;
        rotationVelocityX *= 0.94;
        targetRotationY += rotationVelocityY;
        targetRotationX += rotationVelocityX;
      }

      masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.08;
      masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.08;

      // 3. Continuous Slow Rotation of Earth Globe
      globeGroup.rotation.y += 0.0035;

      // 4. Thruster Plasma Cone Pulsing
      thrusterBeams.forEach((beam, idx) => {
        const pulse = 0.65 + Math.sin(elapsedTime * 14 + idx * 1.5) * 0.25;
        (beam.material as THREE.MeshBasicMaterial).opacity = pulse;
        beam.scale.set(
          1 + Math.sin(elapsedTime * 12 + idx) * 0.06,
          1 + Math.cos(elapsedTime * 16 + idx) * 0.1,
          1 + Math.sin(elapsedTime * 12 + idx) * 0.06
        );
      });

      // 5. Dais Concentric Neon Rings Pulsing
      daisRings.forEach((ring, idx) => {
        const p = 0.8 + Math.sin(elapsedTime * 3.5 + idx * 1.2) * 0.2;
        ring.scale.set(p, p, 1);
      });

      // 6. Holographic Column Scanner Opacity Fluctuation
      holoColumnMat.opacity = 0.22 + Math.sin(elapsedTime * 2.8) * 0.07;
      holoInnerMat.opacity = 0.32 + Math.cos(elapsedTime * 3.2) * 0.09;

      // 7. Rising Energy Filament Particles
      const posAttr = riseParticles.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < numRise; i++) {
        positions[i * 3 + 1] += riseVels[i];
        if (positions[i * 3 + 1] > 5.2) {
          positions[i * 3 + 1] = 0.38;
        }
      }
      posAttr.needsUpdate = true;

      // 8. Traveling Citation Arc Photons
      photonBeads.forEach((bead, idx) => {
        const curve = arcCurves[idx];
        if (!curve) return;
        const progress = (elapsedTime * 0.45 + idx * 0.18) % 1;
        const pt = curve.getPoint(progress);
        bead.position.copy(pt);
      });

      // 9. Orbiting Satellites on Rings
      satMeshes.forEach(item => {
        item.angle += item.spec.speed;
        const qx = Math.cos(item.angle) * item.spec.r;
        const qz = Math.sin(item.angle) * item.spec.r;
        // Transform by ring tilt
        const euler = new THREE.Euler(item.spec.tiltX + Math.PI / 2, 0, item.spec.tiltZ, 'XYZ');
        const v = new THREE.Vector3(qx, 0, qz).applyEuler(euler);
        item.mesh.position.copy(v);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
      className={`relative w-full h-[540px] sm:h-[600px] lg:h-[680px] select-none ${className}`}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing block focus:outline-none"
        aria-label="Interactive 3D Hanging Research Platform and Knowledge Globe"
      />

      {/* ── 8 SLEEK ORBITAL UI PILLS MATCHING IMAGE REFERENCE ── */}
      {/* 1. Knowledge Graph [AI-Core] (Upper Left, Cyan/Emerald) */}
      <div 
        onClick={() => handlePillClick('graph')}
        className="absolute top-[8%] left-[6%] sm:left-[10%] z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07132B]/85 border border-cyan-400/50 backdrop-blur-xl shadow-[0_4px_22px_rgba(6,182,212,0.35)] cursor-pointer hover:scale-105 hover:border-cyan-300 transition-all group"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        <Network className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-xs font-bold text-white tracking-wide">Knowledge Graph</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-200">AI-Core</span>
      </div>

      {/* 2. AI Insights [Consensus] (Mid Left, Purple/Violet) */}
      <div 
        onClick={() => handlePillClick('search')}
        className="absolute top-[28%] left-[2%] sm:left-[6%] z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0B25]/85 border border-purple-500/50 backdrop-blur-xl shadow-[0_4px_22px_rgba(168,85,247,0.35)] cursor-pointer hover:scale-105 hover:border-purple-300 transition-all group"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
        <span className="text-xs font-bold text-white tracking-wide">AI Insights</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-purple-200">Consensus</span>
      </div>

      {/* 3. Concepts [1.8M+] (Lower Left, Violet) */}
      <div 
        onClick={() => handlePillClick('search')}
        className="absolute top-[52%] left-[4%] sm:left-[8%] z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0B25]/85 border border-indigo-500/50 backdrop-blur-xl shadow-[0_4px_22px_rgba(99,102,241,0.35)] cursor-pointer hover:scale-105 hover:border-indigo-300 transition-all group"
      >
        <Layers className="w-3.5 h-3.5 text-indigo-300" />
        <span className="text-xs font-bold text-white tracking-wide">Concepts</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-indigo-200">1.8M+</span>
      </div>

      {/* 4. Citations [1.24B+] (Front Platform Deck Center, Magenta) */}
      <div 
        onClick={() => handlePillClick('search')}
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A0826]/90 border border-pink-500/60 backdrop-blur-xl shadow-[0_4px_25px_rgba(236,72,153,0.45)] cursor-pointer hover:scale-105 hover:border-pink-300 transition-all group"
      >
        <Link2 className="w-3.5 h-3.5 text-pink-300" />
        <span className="text-xs font-bold text-white tracking-wide">Citations</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-200 font-bold">1.24B+</span>
      </div>

      {/* 5. Research Papers [204M+] (Upper Right, Cyan) */}
      <div 
        onClick={() => handlePillClick('search')}
        className="absolute top-[8%] right-[8%] sm:right-[12%] z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07132B]/85 border border-sky-400/50 backdrop-blur-xl shadow-[0_4px_22px_rgba(56,189,248,0.35)] cursor-pointer hover:scale-105 hover:border-sky-300 transition-all group"
      >
        <FileText className="w-3.5 h-3.5 text-sky-300" />
        <span className="text-xs font-bold text-white tracking-wide">Research Papers</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200 font-bold">204M+</span>
      </div>

      {/* 6. Authors [12.4M+] (Mid Right, Teal/Cyan) */}
      <div 
        onClick={() => handlePillClick('search')}
        className="absolute top-[28%] right-[4%] sm:right-[7%] z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07132B]/85 border border-teal-400/50 backdrop-blur-xl shadow-[0_4px_22px_rgba(20,184,166,0.35)] cursor-pointer hover:scale-105 hover:border-teal-300 transition-all group"
      >
        <Users className="w-3.5 h-3.5 text-teal-300" />
        <span className="text-xs font-bold text-white tracking-wide">Authors</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-200 font-bold">12.4M+</span>
      </div>

      {/* 7. Datasets [85K+] (Lower Right, Amber/Gold) */}
      <div 
        onClick={() => handlePillClick('search')}
        className="absolute top-[52%] right-[6%] sm:right-[10%] z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F1505]/85 border border-amber-400/50 backdrop-blur-xl shadow-[0_4px_22px_rgba(245,158,11,0.35)] cursor-pointer hover:scale-105 hover:border-amber-300 transition-all group"
      >
        <Database className="w-3.5 h-3.5 text-amber-300" />
        <span className="text-xs font-bold text-white tracking-wide">Datasets</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">85K+</span>
      </div>

      {/* 8. Top-Right Flying Saucer with RECON SURVEYOR • 02% badge */}
      <div className="absolute top-[1%] right-[2%] sm:right-[4%] z-30 pointer-events-none flex flex-col items-center">
        {/* RECON SURVEYOR badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-[10px] font-mono text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>RECON SURVEYOR • 02%</span>
        </div>
        {/* UFO Craft SVG */}
        <svg width="68" height="38" viewBox="0 0 92 56" fill="none" className="drop-shadow-[0_4px_16px_rgba(6,182,212,0.6)]">
          <ellipse cx="46" cy="18" rx="18" ry="11" fill="url(#ufoDomeGrad2)" opacity="0.95" />
          <ellipse cx="44" cy="16" rx="10" ry="5" fill="#FFFFFF" opacity="0.7" />
          <path d="M6 31 C6 24, 86 24, 86 31 C86 42, 6 42, 6 31 Z" fill="url(#ufoHullGrad2)" stroke="#38BDF8" strokeWidth="1.2" />
          <circle cx="28" cy="34" r="1.8" fill="#67E8F9" />
          <circle cx="46" cy="35.5" r="2.2" fill="#FFFFFF" />
          <circle cx="64" cy="34" r="1.8" fill="#67E8F9" />
          <ellipse cx="46" cy="36" rx="14" ry="4.5" fill="#38BDF8" opacity="0.9" />
          <defs>
            <linearGradient id="ufoHullGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="ufoDomeGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CFFAFE" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle Drag Rotation Hint at the bottom */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06102a]/80 border border-white/10 text-[11px] text-cyan-200/80 pointer-events-none backdrop-blur-sm">
        <Compass className="w-3 h-3 text-cyan-400" />
        <span>Drag to rotate 3D platform • hover nodes</span>
      </div>
    </div>
  );
};
