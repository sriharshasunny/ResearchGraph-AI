with open('public/knowledge_globe.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re

target = r"const earth=new THREE\.Mesh\(new THREE\.SphereGeometry\(R,160,160\),new THREE\.MeshBasicMaterial\(\{map:TX\('/globe\.webp'\)\}\)\);earth\.renderOrder=0;globe\.add\(earth\);"

replacement = """const earth=new THREE.Mesh(new THREE.SphereGeometry(R,160,160),new THREE.MeshBasicMaterial({map:TX('/globe.webp'), color:0x445566, transparent:true, opacity:0.8}));earth.renderOrder=0;globe.add(earth);
// ---- True 3D Supplementary Network ----
(function(){
    const N = 250;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < N; i++) {
        let y = 1 - (i / (N - 1)) * 2;
        let radius = Math.sqrt(1 - y * y);
        let theta = phi * i;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).multiplyScalar(R * 1.01));
    }
    const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const pColors = [];
    const cBase = new THREE.Color(0x38bdf8);
    const cAcc1 = new THREE.Color(0xc084fc);
    const cAcc2 = new THREE.Color(0x22d3ee);
    const cWhite = new THREE.Color(0xeafcff);
    for(let i=0; i<N; i++) {
        let rand = Math.random();
        let col = cBase;
        if(rand > 0.9) col = cWhite;
        else if(rand > 0.75) col = cAcc1;
        else if(rand > 0.5) col = cAcc2;
        pColors.push(col.r, col.g, col.b);
    }
    pGeo.setAttribute('color', new THREE.Float32BufferAttribute(pColors, 3));
    
    const cvs = document.createElement('canvas'); cvs.width = 64; cvs.height = 64;
    const ctx = cvs.getContext('2d');
    const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0,0,64,64);
    const dotTex = new THREE.CanvasTexture(cvs);

    const pMat = new THREE.PointsMaterial({
        size: 0.16,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const extraHubs = new THREE.Points(pGeo, pMat);
    extraHubs.renderOrder = 4;
    globe.add(extraHubs);

    const linePts = [];
    const lineColors = [];
    const connectDist = R * 0.45;
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            if (pts[i].distanceTo(pts[j]) < connectDist) {
                linePts.push(pts[i], pts[j]);
                lineColors.push(pColors[i*3]*0.6, pColors[i*3+1]*0.6, pColors[i*3+2]*0.6);
                lineColors.push(pColors[j*3]*0.6, pColors[j*3+1]*0.6, pColors[j*3+2]*0.6);
            }
        }
    }
    const lGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    lGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const extraLines = new THREE.LineSegments(lGeo, lMat);
    extraLines.renderOrder = 3;
    globe.add(extraLines);
})();
"""

c = re.sub(target, replacement, c)

with open('public/knowledge_globe.html', 'w', encoding='utf-8') as f:
    f.write(c)
