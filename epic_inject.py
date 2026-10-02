with open('public/knowledge_globe.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re

new_code = """const earth=new THREE.Mesh(new THREE.SphereGeometry(R,160,160),new THREE.MeshBasicMaterial({map:TX('/globe.webp'), color:0x000000, transparent:true, opacity:0.02}));earth.renderOrder=0;globe.add(earth);
// ---- EPIC LUMINOUS 3D KNOWLEDGE NETWORK ----
(function(){
    const cCyan = new THREE.Color(0x22d3ee);
    const cBrightCyan = new THREE.Color(0x67e8f9);
    const cBlue = new THREE.Color(0x3b82f6);
    const cPurple = new THREE.Color(0x8b5cf6);
    const cMagenta = new THREE.Color(0xd946ef);
    const cWhite = new THREE.Color(0xf8fdff);

    // 1. Volumetric Energy Core (Inner glows)
    const createGlow = (radius, col, opacity, addRim) => {
        const geo = new THREE.SphereGeometry(radius, 64, 64);
        const mat = new THREE.ShaderMaterial({
            uniforms: { c: { value: col }, op: { value: opacity } },
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
            vertexShader: `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
            fragmentShader: `varying vec3 vN; uniform vec3 c; uniform float op; 
                void main(){ 
                    float f = 1.0;
                    if (${addRim}) { f = pow(1.0 - max(dot(vN, vec3(0,0,1)), 0.0), 2.5) * 2.0 + 0.2; }
                    gl_FragColor = vec4(c * f, op * f); 
                }`
        });
        const m = new THREE.Mesh(geo, mat);
        m.renderOrder = 1;
        return m;
    };
    globe.add(createGlow(R * 0.4, cBrightCyan, 0.25, false));
    globe.add(createGlow(R * 0.7, cBlue, 0.15, false));
    globe.add(createGlow(R * 0.96, cPurple, 0.10, true));

    // Surface Energy Shell (Fresnel)
    const shellMat = new THREE.ShaderMaterial({
        uniforms: { color1: { value: cBrightCyan }, color2: { value: cPurple }, time: UN.time },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader: `varying vec3 vN; varying vec3 vPos; void main(){ vN=normalize(normalMatrix*normal); vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `varying vec3 vN; varying vec3 vPos; uniform vec3 color1; uniform vec3 color2; uniform float time;
            void main(){
                float fresnel = pow(1.0 - max(dot(vN, vec3(0,0,1)), 0.0), 2.0);
                vec3 mixColor = mix(color1, color2, (normalize(vPos).y + 1.0) * 0.5 + sin(time)*0.1);
                gl_FragColor = vec4(mixColor * fresnel * 2.5, fresnel * 0.5);
            }`
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(R * 0.99, 128, 128), shellMat);
    shell.renderOrder = 2;
    globe.add(shell);

    // 2. Organic Node Distribution
    const N = 450;
    const pts = [];
    const pColors = [];
    const pSizes = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
        let y = 1 - (i / (N - 1)) * 2;
        let radius = Math.sqrt(1 - y * y);
        let theta = phi * i;
        
        let v = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
        v.x += (Math.random() - 0.5) * 0.25;
        v.y += (Math.random() - 0.5) * 0.25;
        v.z += (Math.random() - 0.5) * 0.25;
        v.normalize().multiplyScalar(R * (1.0 + Math.random()*0.03));
        pts.push(v);
        
        let rand = Math.random();
        let col, size;
        if (rand > 0.90) { col = cWhite; size = 4.5; } 
        else if (rand > 0.80) { col = cMagenta; size = 2.5 + Math.random(); }
        else if (rand > 0.60) { col = cPurple; size = 2.0 + Math.random(); }
        else if (rand > 0.35) { col = cBlue; size = 1.5 + Math.random(); }
        else { col = cBrightCyan; size = 1.5 + Math.random(); }
        
        pColors.push(col.r, col.g, col.b);
        pSizes.push(size);
    }
    const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
    pGeo.setAttribute('color', new THREE.Float32BufferAttribute(pColors, 3));
    pGeo.setAttribute('size', new THREE.Float32BufferAttribute(pSizes, 1));

    const dotTex = (function(){
        const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 64;
        const ctx = cvs.getContext('2d');
        const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.fillRect(0,0,64,64);
        return new THREE.CanvasTexture(cvs);
    })();

    const pMat = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { value: dotTex }, time: UN.time },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader: `
            attribute float size; attribute vec3 color; varying vec3 vColor; uniform float time; varying float vDepth;
            void main() {
                vColor = color;
                float pulse = sin(position.x*4. + time*3.)*0.5 + 0.5;
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                vDepth = -mvPos.z;
                gl_PointSize = (12.0 * size + pulse * 6.0) * (5.0 / max(vDepth, 0.1));
                gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse; varying vec3 vColor; varying float vDepth;
            void main() {
                vec4 tex = texture2D(tDiffuse, gl_PointCoord);
                float depthMult = smoothstep(12.0, 3.0, vDepth) * 0.7 + 0.3;
                gl_FragColor = vec4(vColor * tex.rgb * depthMult, tex.a * depthMult);
            }
        `
    });
    const hubs = new THREE.Points(pGeo, pMat); hubs.renderOrder = 5; globe.add(hubs);

    // 3. Network Connections
    const linePts = [];
    const lineColors = [];
    const maxDist = R * 0.65;
    for (let i = 0; i < N; i++) {
        let neighbors = [];
        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            let d = pts[i].distanceTo(pts[j]);
            if (d < maxDist) neighbors.push({idx: j, dist: d});
        }
        neighbors.sort((a,b)=>a.dist - b.dist);
        let connectCount = 3 + Math.floor(Math.random() * 4);
        for (let k = 0; k < Math.min(connectCount, neighbors.length); k++) {
            let j = neighbors[k].idx;
            if (i < j || Math.random() > 0.85) {
                linePts.push(pts[i], pts[j]);
                lineColors.push(pColors[i*3], pColors[i*3+1], pColors[i*3+2]);
                lineColors.push(pColors[j*3], pColors[j*3+1], pColors[j*3+2]);
            }
        }
    }
    const lGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    lGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lMat = new THREE.ShaderMaterial({
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader: `
            attribute vec3 color; varying vec3 vColor; varying float vDepth;
            void main() {
                vColor = color;
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                vDepth = -mvPos.z;
                gl_Position = projectionMatrix * mvPos;
            }
        `,
        fragmentShader: `
            varying vec3 vColor; varying float vDepth;
            void main() {
                float depthMult = smoothstep(12.0, 3.0, vDepth) * 0.6 + 0.15;
                gl_FragColor = vec4(vColor * depthMult, depthMult);
            }
        `
    });
    const lines = new THREE.LineSegments(lGeo, lMat); lines.renderOrder = 4; globe.add(lines);

    // 4. Surface Particles
    const partPts = [];
    const partColors = [];
    for(let i=0; i<450; i++) {
        let r2 = R * (1.0 + Math.random() * 0.12); 
        let t2 = Math.random() * Math.PI * 2;
        let p2 = Math.acos(2 * Math.random() - 1);
        partPts.push(new THREE.Vector3(r2*Math.sin(p2)*Math.cos(t2), r2*Math.cos(p2), r2*Math.sin(p2)*Math.sin(t2)));
        let col = Math.random() > 0.5 ? cBrightCyan : cPurple;
        if (Math.random() > 0.85) col = cWhite;
        else if (Math.random() > 0.7) col = cMagenta;
        partColors.push(col.r, col.g, col.b);
    }
    const partGeo = new THREE.BufferGeometry().setFromPoints(partPts);
    partGeo.setAttribute('color', new THREE.Float32BufferAttribute(partColors, 3));
    const partMat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const particles = new THREE.Points(partGeo, partMat); particles.renderOrder = 6; globe.add(particles);

    // 5. Curved Energy Bands (Organic orbital paths)
    for(let i=0; i<14; i++) {
        const rGeo = new THREE.TorusGeometry(R * (1.02 + Math.random()*0.06), 0.003 + Math.random()*0.015, 4, 80, Math.PI * (0.8 + Math.random()*1.2));
        let col = [cBrightCyan, cBlue, cPurple, cMagenta][Math.floor(Math.random()*4)];
        const rMesh = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: 0.25 + Math.random()*0.3, blending: THREE.AdditiveBlending}));
        rMesh.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
        globe.add(rMesh);
    }
})();"""

c = re.sub(r"const earth=new THREE\.Mesh.*?}\)\(\);", new_code, c, flags=re.DOTALL)

with open('public/knowledge_globe.html', 'w', encoding='utf-8') as f:
    f.write(c)
