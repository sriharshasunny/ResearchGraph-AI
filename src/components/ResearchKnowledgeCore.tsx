import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GLOBE_RAW_BASE64 } from './researchGraphGlobeRaw';

export const ResearchKnowledgeCore: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setActivePage('search');
  };

function initResearchGraphGlobe(
  c: HTMLCanvasElement,
  x: CanvasRenderingContext2D,
  stage: HTMLDivElement,
  tip: HTMLDivElement,
  hint: HTMLDivElement
) {

    const MW = 1440;
    const MH = 720;
    const W = 1200;
    const R = 430;
    const cx = W / 2;
    const cy = W / 2;
    const D = Math.PI / 180;
    const TAU = Math.PI * 2;
    const S = 560;
    const H = S / 2;
    let T = 0;

    // Decode base64 land bitmask
    const raw = atob(GLOBE_RAW_BASE64);
    const land = new Uint8Array(MW * MH);
    const coast = new Uint8Array(MW * MH);

    for (let i = 0; i < MW * MH; i++) {
      land[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    }
    for (let j = 0; j < MH; j++) {
      for (let i = 0; i < MW; i++) {
        const k = j * MW + i;
        if (!land[k]) continue;
        if (!land[j * MW + ((i + 1) % MW)] || !land[j * MW + ((i + MW - 1) % MW)] || (j > 0 && !land[k - MW]) || (j < MH - 1 && !land[k + MW])) {
          coast[k] = 1;
        }
      }
    }
    const c2 = new Uint8Array(coast);
    for (let j = 0; j < MH - 1; j++) {
      for (let i = 0; i < MW - 1; i++) {
        const k = j * MW + i;
        if (coast[k]) {
          c2[k + 1] = 1;
          c2[k + MW] = 1;
        }
      }
    }

    function isLand(la: number, lo: number) {
      const u = (Math.floor((lo + 180) / 360 * MW) % MW + MW) % MW;
      const v = Math.min(MH - 1, Math.max(0, Math.floor((90 - la) / 180 * MH)));
      return land[v * MW + u];
    }

    function rnd(seed: number) {
      let s = seed;
      return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    }
    const r = rnd(11);

    // Per-pixel sphere vector precomputation
    const n = S * S;
    const NX = new Float32Array(n);
    const NY = new Float32Array(n);
    const NZ = new Float32Array(n);
    const LI = new Float32Array(n);
    const AL = new Uint8Array(n);
    const LON = new Float32Array(n);
    const LATD = new Float32Array(n);
    const FV = new Float32Array(n);
    const CV = new Int32Array(n);
    const VI = new Int32Array(n);

    for (let j = 0; j < S; j++) {
      for (let i = 0; i < S; i++) {
        const p = j * S + i;
        const nx = (i + 0.5 - H) / H;
        const ny = -(j + 0.5 - H) / H;
        const rr = nx * nx + ny * ny;
        if (rr >= 1.02) continue;
        const nz = Math.sqrt(Math.max(0, 1 - rr));
        NX[p] = nx;
        NY[p] = ny;
        NZ[p] = nz;
        LI[p] = Math.max(0, -0.45 * nx + 0.5 * ny + 0.74 * nz);
        AL[p] = Math.max(0, Math.min(255, (1 - Math.sqrt(rr)) * H * 255 / 1.5));
      }
    }

    let tilt = 0.33;
    let ct = Math.cos(tilt);
    let st = Math.sin(tilt);

    function setTilt(t: number) {
      tilt = t;
      ct = Math.cos(t);
      st = Math.sin(t);
      for (let p = 0; p < n; p++) {
        if (!AL[p]) continue;
        const nz = NZ[p];
        const y = NY[p] * ct + nz * st;
        const z = -NY[p] * st + nz * ct;
        const la = Math.asin(y > 1 ? 1 : y < -1 ? -1 : y) / D;
        const v = (90 - la) / 180 * MH;
        LON[p] = Math.atan2(NX[p], z);
        VI[p] = Math.min(MH - 1, Math.max(0, Math.floor(v)));
        FV[p] = (v / 4) % 1;
        CV[p] = Math.floor(v / 4);
        LATD[p] = la;
      }
    }
    setTilt(0.33);

    const oc = document.createElement('canvas');
    oc.width = oc.height = S;
    const ox = oc.getContext('2d')!;
    const img = ox.createImageData(S, S);
    const buf = new Uint32Array(img.data.buffer);

    function shade(ang: number) {
      const off = ang / TAU + 0.5;
      for (let p = 0; p < n; p++) {
        const a = AL[p];
        if (!a) {
          buf[p] = 0;
          continue;
        }
        let u = (LON[p] / TAU + off) * MW;
        u = u - Math.floor(u / MW) * MW;
        const ui = u | 0;
        const kk = VI[p] * MW + ui;
        const nz = NZ[p];
        const lt = 0.62 + 0.55 * LI[p];
        const fu = (u / 4) % 1;
        const fvv = FV[p];
        const dx = fu - 0.5;
        const dy = fvv - 0.5;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const dot = dd < 0.2 ? 1 : dd < 0.38 ? (0.38 - dd) / 0.18 : 0;
        const fr = Math.pow(1 - nz, 2.8);
        const lw = (LON[p] + ang) / D;
        const la = LATD[p];
        const gl = ((Math.abs(((la + 5) % 10 + 10) % 10 - 5) < 0.22) || (Math.abs(((lw + 5) % 10 + 10) % 10 - 5) * Math.cos(la * D) < 0.22)) ? 0.4 : 0;

        let rr: number;
        let gg: number;
        let bb: number;

        if (land[kk]) {
          const h = (((ui >> 2) * 73856093) ^ (CV[p] * 19349663)) >>> 0;
          const hh = (h % 1000) / 1000;
          rr = 18 * lt + dot * 80 * lt + gl * 10;
          gg = 66 * lt + dot * 175 * lt + gl * 50;
          bb = 150 * lt + dot * 255 * lt + gl * 90;
          if (hh > 0.972) {
            rr += dot * 230;
            gg += dot * 150;
            bb += dot * 40;
          }
          if (c2[kk]) {
            rr += 10;
            gg += 70;
            bb += 140;
            if (coast[kk]) {
              rr += 30;
              gg += 60;
              bb += 60;
            }
          }
        } else {
          rr = 4 * lt + dot * 8 + gl * 20;
          gg = 16 * lt + dot * 30 + gl * 80;
          bb = 54 * lt + dot * 80 + gl * 150;
        }

        rr += fr * 100;
        gg += fr * 190;
        bb += fr * 255;
        rr = rr > 255 ? 255 : rr;
        gg = gg > 255 ? 255 : gg;
        bb = bb > 255 ? 255 : bb;
        buf[p] = (a << 24) | (bb << 16) | (gg << 8) | rr;
      }
      ox.putImageData(img, 0, 0);
    }

    // Network cities and connections
    const cities = [
      [40, -74], [34, -118], [19, -99], [-23, -46], [-34, -58], [51, 0], [48, 2], [52, 13],
      [30, 31], [19, 73], [28, 77], [31, 121], [35, 139], [37, 127], [-34, 151], [6, 3],
      [-26, 28], [55, 37], [41, 29], [23, 113], [1, 104], [-12, -77], [4, -74], [45, -73],
      [41, -87], [29, -95], [25, -80], [60, 10], [35, 51], [9, -79], [-33, -70], [49, -123],
      [38, -122], [43, -79], [15, -90], [-1, 36], [14, -17], [39, 116], [13, 100]
    ];
    const cols = ['#ffffff', '#7cd4ff', '#38b6ff', '#a58bff', '#22e0ff', '#e08cff'];
    const types = ['Papers', 'Authors', 'Datasets', 'Concepts', 'Citations'];
    interface NodeItem {
      x: number;
      y: number;
      z: number;
      c: string;
      s: number;
      t: string;
      n: number;
      lk: any[];
    }
    const nodes: NodeItem[] = [];

    function ll(la: number, lo: number) {
      const q = Math.cos(la * D);
      return { x: q * Math.sin(lo * D), y: Math.sin(la * D), z: q * Math.cos(lo * D) };
    }
    function mk(p: { x: number; y: number; z: number }, s: number): NodeItem {
      const idx = nodes.length;
      return {
        ...p,
        c: cols[idx % 6],
        s,
        t: types[(idx * 7 + 3) % 5],
        n: 120 + Math.floor(r() * 4800),
        lk: []
      };
    }
    cities.forEach(q => nodes.push(mk(ll(q[0], q[1]), 4 + r() * 3.5)));
    let tr = 0;
    while (nodes.length < 170 && tr++ < 8000) {
      const la = Math.asin(2 * r() - 1) / D;
      const lo = r() * 360 - 180;
      if (!isLand(la, lo) || Math.abs(la) > 72) continue;
      nodes.push(mk(ll(la, lo), 2 + r() * 2.4));
    }

    const links: Array<{ a: number; b: number; ph: number; sp: number }> = [];
    const seen: Record<string, number> = {};
    nodes.forEach((nd, i) => {
      const d = nodes.map((m, j) => ({
        j,
        d: (nd.x - m.x) * (nd.x - m.x) + (nd.y - m.y) * (nd.y - m.y) + (nd.z - m.z) * (nd.z - m.z)
      })).sort((p, q) => p.d - q.d);

      for (let k = 1; k <= 4; k++) {
        if (!d[k]) continue;
        const j = d[k].j;
        const key = Math.min(i, j) + '-' + Math.max(i, j);
        if (!seen[key] && d[k].d < (k < 4 ? 0.5 : 1.1)) {
          seen[key] = 1;
          const L = { a: i, b: j, ph: r(), sp: 0.004 + r() * 0.004 };
          links.push(L);
          nd.lk.push(L);
          nodes[j].lk.push(L);
        }
      }
    });

    const spr: Record<string, HTMLCanvasElement> = {};
    function sprite(col: string) {
      if (spr[col]) return spr[col];
      const o = document.createElement('canvas');
      o.width = o.height = 64;
      const q = o.getContext('2d')!;
      const g = q.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, col);
      g.addColorStop(0.3, col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      q.fillStyle = g;
      q.fillRect(0, 0, 64, 64);
      return spr[col] = o;
    }

    let ang = -1.36;
    let vel = 0;
    let drag: { px: number; py: number; t: number; moved: number } | null = null;
    let idle = 0;
    let mp: { x: number; y: number } | null = null;
    let hov = -1;
    let sel = -1;
    let selT = 0;
    let tgt: { a: number; t: number } | null = null;
    let last = performance.now();
    let vis = true;
    let raf = 0;
    let P: Array<{ x: number; y: number; z: number }> = [];

    function rot(p: { x: number; y: number; z: number }) {
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const X = p.x * ca - p.z * sa;
      let Z = p.x * sa + p.z * ca;
      const Y = p.y * ct - Z * st;
      Z = p.y * st + Z * ct;
      return { x: cx + X * R, y: cy - Y * R, z: Z };
    }

    function arc(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
      const m = { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
      const l = Math.hypot(m.x, m.y, m.z);
      const h = 1 + Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) * 0.2;
      return { x: m.x / l * h, y: m.y / l * h, z: m.z / l * h };
    }

    function hit(mx: number, my: number) {
      let b = -1;
      let bd = 900;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (p.z < 0.05) continue;
        const d = (p.x - mx) * (p.x - mx) + (p.y - my) * (p.y - my);
        if (d < bd) {
          bd = d;
          b = i;
        }
      }
      return b;
    }

    function clampT(t: number) {
      return Math.max(-0.3, Math.min(0.9, t));
    }

    function loop(t: number) {
      if (!vis) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      T += dt * 60;

      if (!drag) {
        if (tgt) {
          const da = ((tgt.a - ang + Math.PI) % TAU + TAU) % TAU - Math.PI;
          ang += da * 0.09;
          const dtl = tgt.t - tilt;
          if (Math.abs(dtl) > 0.002) setTilt(tilt + dtl * 0.09);
          if (Math.abs(da) < 0.003 && Math.abs(dtl) < 0.004) tgt = null;
          idle = t + 4000;
        } else {
          ang += vel * dt * 60;
          vel *= Math.pow(0.94, dt * 60);
          if (t > idle) ang += 0.096 * dt;
        }
      }
      ang = ((ang + Math.PI) % TAU + TAU) % TAU - Math.PI;

      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
      x.clearRect(0, 0, W, W);

      // Outer radial aura
      const g = x.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.4);
      g.addColorStop(0, 'rgba(70,165,255,.8)');
      g.addColorStop(0.3, 'rgba(40,110,255,.2)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx, cy, R * 1.4, 0, 7);
      x.fill();

      // Shaded globe
      shade(ang);
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = 'high';
      x.drawImage(oc, cx - R, cy - R, R * 2, R * 2);

      x.globalCompositeOperation = 'lighter';
      if ('filter' in x) {
        x.filter = 'blur(10px)';
        x.globalAlpha = 0.5;
        x.drawImage(oc, cx - R, cy - R, R * 2, R * 2);
        x.filter = 'none';
        x.globalAlpha = 1;
      }

      P = nodes.map(rot);
      if (mp && !drag) hov = hit(mp.x, mp.y);
      else if (!mp) hov = -1;
      const f = hov >= 0 ? hov : sel;

      // Arc Links
      links.forEach(l => {
        const A = nodes[l.a];
        const B = nodes[l.b];
        const pa = P[l.a];
        const pb = P[l.b];
        const m = rot(arc(A, B));
        if (Math.min(pa.z, pb.z, m.z) < 0) return;

        const on = f >= 0 && (l.a === f || l.b === f);
        const dim = f >= 0 && !on ? 0.45 : 1;
        const al = (0.3 + 0.45 * Math.min(1, (pa.z + pb.z) / 1.3)) * dim;
        const cxp = 2 * m.x - (pa.x + pb.x) / 2;
        const cyp = 2 * m.y - (pa.y + pb.y) / 2;

        x.strokeStyle = on ? 'rgba(190,240,255,.95)' : 'rgba(140,225,255,' + al + ')';
        x.lineWidth = on ? 2.2 : 1.1;
        x.beginPath();
        x.moveTo(pa.x, pa.y);
        x.quadraticCurveTo(cxp, cyp, pb.x, pb.y);
        x.stroke();

        const q = (l.ph + T * l.sp * (on ? 2.5 : 1)) % 1;
        const u = 1 - q;
        const qx = u * u * pa.x + 2 * u * q * cxp + q * q * pb.x;
        const qy = u * u * pa.y + 2 * u * q * cyp + q * q * pb.y;
        x.fillStyle = 'rgba(90,225,255,' + (0.3 * dim) + ')';
        x.beginPath();
        x.arc(qx, qy, 7, 0, 7);
        x.fill();
        x.fillStyle = 'rgba(255,255,255,' + (0.95 * dim) + ')';
        x.beginPath();
        x.arc(qx, qy, 2.4, 0, 7);
        x.fill();
      });

      // City & Research Nodes
      P.forEach((p, i) => {
        if (p.z < 0.02) return;
        const nd = nodes[i];
        const isF = i === f;
        const s = nd.s * (0.55 + p.z * 0.7) * (isF ? 1.35 : 1);
        const pu = 1 + 0.25 * Math.sin(T * 0.05 + i);

        x.globalAlpha = isF ? 1 : 0.75;
        x.drawImage(sprite(nd.c), p.x - s * 6, p.y - s * 6, s * 12, s * 12);
        x.globalAlpha = 1;

        x.fillStyle = '#fff';
        x.beginPath();
        x.arc(p.x, p.y, s * 0.85, 0, 7);
        x.fill();

        if (s > 4.2 || isF) {
          x.strokeStyle = nd.c;
          x.lineWidth = 1.5;
          x.beginPath();
          x.arc(p.x, p.y, (s + 4) * pu, 0, 7);
          x.stroke();
        }
      });

      // Ripple on Selected Node
      if (sel >= 0 && P[sel] && P[sel].z > 0) {
        const qq = ((T - selT) % 90) / 90;
        const p = P[sel];
        x.strokeStyle = 'rgba(160,230,255,' + (1 - qq) + ')';
        x.lineWidth = 2;
        x.beginPath();
        x.arc(p.x, p.y, 10 + qq * 70, 0, 7);
        x.stroke();
      }

      // Orbital Rings with Rotating Satellites
      x.strokeStyle = 'rgba(90,185,255,.4)';
      x.lineWidth = 1.3;
      x.beginPath();
      x.ellipse(cx, cy, R * 1.22, R * 0.34, -0.35, 0, 7);
      x.stroke();

      for (let k = 0; k < 3; k++) {
        const a = T * 0.006 + k * 2.09;
        const qx = Math.cos(a) * R * 1.22;
        const qy = Math.sin(a) * R * 0.34;
        const rx = cx + qx * Math.cos(-0.35) - qy * Math.sin(-0.35);
        const ry = cy + qx * Math.sin(-0.35) + qy * Math.cos(-0.35);
        x.fillStyle = '#9fe8ff';
        x.beginPath();
        x.arc(rx, ry, 4.5, 0, 7);
        x.fill();
      }
      x.globalCompositeOperation = 'source-over';

      // Cursor & Tooltip
      c.style.cursor = drag ? 'grabbing' : (hov >= 0 ? 'pointer' : 'grab');
      if (hov >= 0 && !drag) {
        const nd2 = nodes[hov];
        const p2 = P[hov];
        const b = c.getBoundingClientRect();
        const sb = stage.getBoundingClientRect();
        tip.textContent = nd2.t + ' · ' + nd2.n.toLocaleString('en-US') + ' links';
        tip.style.setProperty('--c', nd2.c);
        tip.style.transform = 'translate(' + (b.left - sb.left + p2.x / W * b.width) + 'px,' + (b.top - sb.top + p2.y / W * b.height) + 'px) translate(-50%,-150%)';
        tip.classList.add('on');
      } else {
        tip.classList.remove('on');
      }
    }

    function cpos(e: PointerEvent) {
      const b = c!.getBoundingClientRect();
      return {
        x: (e.clientX - b.left) / b.width * W,
        y: (e.clientY - b.top) / b.height * W,
        k: 1 / (b.width * R / W)
      };
    }

    const onPointerDown = (e: PointerEvent) => {
      const q = cpos(e);
      if (Math.hypot(q.x - cx, q.y - cy) > R * 1.3) return;
      c.setPointerCapture(e.pointerId);
      drag = { px: e.clientX, py: e.clientY, t: e.timeStamp, moved: 0 };
      vel = 0;
      tgt = null;
      hint.classList.add('off');
    };

    const onPointerMove = (e: PointerEvent) => {
      const q = cpos(e);
      mp = { x: q.x, y: q.y };
      if (!drag) return;
      const dx = e.clientX - drag.px;
      const dy = e.clientY - drag.py;
      const dtm = Math.max(1, e.timeStamp - drag.t);
      drag.moved += Math.abs(dx) + Math.abs(dy);
      ang -= dx * q.k;
      const nt = clampT(tilt + dy * q.k * 0.8);
      if (Math.abs(nt - tilt) > 0.001) setTilt(nt);
      vel = -dx * q.k / dtm * 16 * 0.5 + vel * 0.5;
      drag.px = e.clientX;
      drag.py = e.clientY;
      drag.t = e.timeStamp;
    };

    const end = () => {
      if (!drag) return;
      const click = drag.moved < 5;
      drag = null;
      idle = performance.now() + 2500;
      if (click && mp) {
        const i = hit(mp.x, mp.y);
        if (i >= 0) {
          sel = i;
          selT = T;
          tgt = { a: Math.atan2(nodes[i].x, nodes[i].z), t: clampT(Math.asin(nodes[i].y)) };
        } else {
          sel = -1;
        }
      }
    };

    const onPointerLeave = () => {
      if (!drag) {
        mp = null;
        hov = -1;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const m: Record<string, [number, number]> = {
        ArrowLeft: [-0.12, 0],
        ArrowRight: [0.12, 0],
        ArrowUp: [0, 0.06],
        ArrowDown: [0, -0.06]
      };
      if (!m[e.key]) return;
      e.preventDefault();
      ang += m[e.key][0];
      setTilt(clampT(tilt + m[e.key][1]));
      idle = performance.now() + 2500;
      hint.classList.add('off');
    };

    c.addEventListener('pointerdown', onPointerDown);
    c.addEventListener('pointermove', onPointerMove);
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('pointerleave', onPointerLeave);
    c.addEventListener('keydown', onKeyDown);

    const hintTimer = setTimeout(() => {
      hint.classList.add('off');
    }, 8000);

    const observer = new IntersectionObserver(en => {
      vis = en[0].isIntersecting;
      if (vis && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    observer.observe(c);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hintTimer);
      observer.disconnect();
      c.removeEventListener('pointerdown', onPointerDown);
      c.removeEventListener('pointermove', onPointerMove);
      c.removeEventListener('pointerup', end);
      c.removeEventListener('pointercancel', end);
      c.removeEventListener('pointerleave', onPointerLeave);
      c.removeEventListener('keydown', onKeyDown);
    };
  }

  useEffect(() => {
    const c = canvasRef.current;
    const stage = stageRef.current;
    const tip = tipRef.current;
    const hint = hintRef.current;
    if (!c || !stage || !tip || !hint) return;

    const x = c.getContext('2d');
    if (!x) return;

    return initResearchGraphGlobe(c, x, stage, tip, hint);
  }, []);

  return (
    <div className="rg-wrapper w-full overflow-visible select-none">
      <style>{`
        .rg-stage {
          position: relative;
          container-type: inline-size;
          aspect-ratio: 1000/585;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
        }
        .rg-stage canvas {
          position: absolute;
          left: 48.7%;
          top: 56.8%;
          width: 56%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          cursor: grab;
          touch-action: pan-y;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .rg-stage canvas:focus-visible {
          outline: 2px solid #35c6ff;
          outline-offset: -4px;
          border-radius: 50%;
        }
        .rg-tip {
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity .15s;
          padding: .7cqw 1.4cqw;
          border-radius: 2cqw;
          font-size: 1.35cqw;
          font-weight: 600;
          white-space: nowrap;
          background: rgba(6,16,42,.95);
          border: 1px solid var(--c, #4aa0ff);
          color: #eaf2ff;
          box-shadow: 0 0 1.6cqw -.3cqw var(--c, #4aa0ff);
          z-index: 35;
        }
        .rg-tip.on { opacity: 1; }
        .rg-hint {
          position: absolute;
          left: 48.7%;
          top: 73%;
          transform: translateX(-50%);
          display: flex;
          gap: .8cqw;
          align-items: center;
          padding: .7cqw 1.5cqw;
          border-radius: 2cqw;
          font-size: 1.3cqw;
          color: #9fb6e6;
          background: rgba(6,16,42,.72);
          border: 1px solid rgba(120,150,220,.22);
          pointer-events: none;
          transition: opacity .6s;
          z-index: 30;
          white-space: nowrap;
        }
        .rg-hint.off { opacity: 0; }
        .rg-hint svg {
          width: 1.8cqw;
          height: 1.8cqw;
          stroke: #9fb6e6;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .rg-links-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        .rg-links-svg line {
          stroke-width: 1.5;
          stroke-linecap: round;
          opacity: .8;
        }
        .rg-links-svg .g {
          filter: drop-shadow(0 0 4px currentColor);
        }
        .rg-links-svg .p {
          animation: rg-pl 2.8s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes rg-pl {
          50% { transform: scale(1.7); opacity: .15; }
        }
        .rg-tag {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 1.2cqw;
          padding: 0 0 0 2.1cqw;
          height: 4.6cqw;
          border-radius: 5cqw;
          font-weight: 600;
          font-size: 1.68cqw;
          white-space: nowrap;
          background: color-mix(in srgb, var(--c) 14%, #07112b);
          border: 1.5px solid var(--c);
          color: #f0f5ff;
          box-shadow: 0 0 2.6cqw -.4cqw var(--c);
          transform: translate(-50%,-50%);
          z-index: 20;
          cursor: pointer;
          transition: transform .2s, box-shadow .2s;
        }
        .rg-tag:hover {
          transform: translate(-50%,-50%) scale(1.05);
          box-shadow: 0 0 3.5cqw 0 var(--c);
        }
        .rg-tag svg {
          width: 2.25cqw;
          height: 2.25cqw;
          stroke: var(--c);
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .rg-card {
          position: absolute;
          width: 25.6%;
          padding: 1.9cqw 2.1cqw;
          border-radius: 1.7cqw;
          background: linear-gradient(160deg, rgba(14,28,68,.92), rgba(6,16,42,.92));
          border: 1px solid rgba(120,160,240,.32);
          box-shadow: 0 1.8cqw 5cqw rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,0.1);
          transform: rotate(var(--r));
          z-index: 20;
          cursor: pointer;
          transition: transform .2s, box-shadow .2s, border-color .2s;
        }
        .rg-card:hover {
          transform: rotate(var(--r)) translateY(-4px) scale(1.02);
          box-shadow: 0 2.4cqw 6cqw rgba(0,0,0,.7);
          border-color: rgba(90,160,255,.6);
        }
        .rg-card .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.3cqw;
          color: #aab6d3;
        }
        .rg-card .src {
          font-family: Georgia, serif;
          font-size: 2cqw;
          color: #e8edf9;
          letter-spacing: .05cqw;
        }
        .rg-card .src i {
          color: #e34c3a;
          font-style: normal;
        }
        .rg-card .oa {
          display: flex;
          gap: .7cqw;
          align-items: center;
          color: #5fa8ff;
          font-size: 1.25cqw;
        }
        .rg-card .oa svg {
          width: 1.8cqw;
          height: 1.8cqw;
        }
        .rg-card h3 {
          font-size: 1.85cqw;
          font-weight: 600;
          line-height: 1.28;
          margin: 1.1cqw 0 .9cqw;
          border-top: 1px solid rgba(120,150,220,.22);
          padding-top: 1.2cqw;
          color: #f0f5ff;
        }
        .rg-card .au {
          font-size: 1.4cqw;
          color: #9aa8c8;
        }
        .rg-card .au b {
          font-weight: 400;
          color: #c7d1ea;
        }
        .rg-card .meta {
          display: flex;
          gap: 2.4cqw;
          margin-top: 1.3cqw;
          font-size: 1.4cqw;
          color: #aab6d3;
        }
        .rg-card .meta span {
          display: flex;
          gap: .7cqw;
          align-items: center;
        }
        .rg-card .meta svg {
          width: 1.8cqw;
          height: 1.8cqw;
          stroke: #aab6d3;
          fill: none;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>

      <div className="rg-stage" id="stage" ref={stageRef}>
        <canvas
          id="globe"
          ref={canvasRef}
          width={1200}
          height={1200}
          tabIndex={0}
          aria-label="Interactive knowledge graph globe. Drag to rotate, hover a node for details, click a node to fly to it."
        />

        <svg className="rg-links-svg" viewBox="0 0 1000 585" aria-hidden="true">
          <g style={{ color: '#f5b335' }} className="g">
            <line x1="382" y1="101" x2="415" y2="160" stroke="#f5b335" />
            <circle cx="415" cy="160" r="3.4" fill="#fff" />
            <circle className="p" cx="382" cy="101" r="9" fill="#f5b335" opacity=".3" />
            <circle cx="382" cy="101" r="4.6" fill="#f5b335" />
          </g>
          <g style={{ color: '#2dd4a8' }} className="g">
            <line x1="587" y1="101" x2="560" y2="150" stroke="#2dd4a8" />
            <circle cx="560" cy="150" r="3.4" fill="#fff" />
            <circle className="p" cx="587" cy="101" r="9" fill="#2dd4a8" opacity=".3" />
            <circle cx="587" cy="101" r="4.6" fill="#2dd4a8" />
          </g>
          <g style={{ color: '#35c6ff' }} className="g">
            <line x1="301" y1="267" x2="345" y2="268" stroke="#35c6ff" />
            <circle cx="345" cy="268" r="3.4" fill="#fff" />
            <circle className="p" cx="301" cy="267" r="9" fill="#35c6ff" opacity=".3" />
            <circle cx="301" cy="267" r="4.6" fill="#35c6ff" />
          </g>
          <g style={{ color: '#e08cff' }} className="g">
            <line x1="678" y1="270" x2="603" y2="265" stroke="#e08cff" />
            <circle cx="603" cy="265" r="3.4" fill="#fff" />
            <circle className="p" cx="678" cy="270" r="9" fill="#e08cff" opacity=".3" />
            <circle cx="678" cy="270" r="4.6" fill="#e08cff" />
          </g>
          <g style={{ color: '#a67bf5' }} className="g">
            <line x1="314" y1="430" x2="365" y2="373" stroke="#a67bf5" />
            <circle cx="365" cy="373" r="3.4" fill="#fff" />
            <circle className="p" cx="314" cy="430" r="9" fill="#a67bf5" opacity=".3" />
            <circle cx="314" cy="430" r="4.6" fill="#a67bf5" />
          </g>
          <g style={{ color: '#35c6ff' }} className="g">
            <line x1="650" y1="426" x2="595" y2="380" stroke="#35c6ff" />
            <circle cx="595" cy="380" r="3.4" fill="#fff" />
            <circle className="p" cx="650" cy="426" r="9" fill="#35c6ff" opacity=".3" />
            <circle cx="650" cy="426" r="4.6" fill="#35c6ff" />
          </g>
          <g style={{ color: '#35c6ff' }} className="g">
            <line x1="490" y1="527" x2="483" y2="385" stroke="#35c6ff" />
            <circle cx="483" cy="385" r="3.4" fill="#fff" />
            <circle className="p" cx="490" cy="527" r="9" fill="#35c6ff" opacity=".3" />
            <circle cx="490" cy="527" r="4.6" fill="#35c6ff" />
          </g>
        </svg>

        {/* Card 1: arXiv Vision Transformers */}
        <div
          onClick={() => handleSearch('A Survey on Vision Transformers')}
          className="rg-card"
          style={{ left: '.2%', top: '1.2%', '--r': '-5deg' } as React.CSSProperties}
        >
          <div className="top">
            <span className="src">ar<i>X</i>iv</span>
            <span>2024</span>
          </div>
          <h3>A Survey on Vision Transformers</h3>
          <div className="au">A. Dosovitskiy <b>et al.</b></div>
          <div className="meta">
            <span>
              <svg viewBox="0 0 24 24"><path d="M7 7c-2 1-3 3-3 6h4v4H4M17 7c-2 1-3 3-3 6h4v4h-4" /></svg>
              1.2K
            </span>
            <span>
              <svg viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v5h5" /></svg>
              PDF
            </span>
          </div>
        </div>

        {/* Card 2: OpenAlex GNN */}
        <div
          onClick={() => handleSearch('Graph Neural Networks for Social Recommendation')}
          className="rg-card"
          style={{ left: '73.5%', top: '.9%', '--r': '4deg' } as React.CSSProperties}
        >
          <div className="top">
            <span className="oa">
              <svg viewBox="0 0 24 24" fill="none" stroke="#5fa8ff" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
              </svg>
              OpenAlex
            </span>
            <span>2023</span>
          </div>
          <h3>Graph Neural Networks for Social Recommendation</h3>
          <div className="au">Y. Wu <b>et al.</b></div>
          <div className="meta">
            <span>
              <svg viewBox="0 0 24 24"><path d="M7 7c-2 1-3 3-3 6h4v4H4M17 7c-2 1-3 3-3 6h4v4h-4" /></svg>
              856
            </span>
            <span>
              <svg viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v5h5" /></svg>
              PDF
            </span>
          </div>
        </div>

        {/* Card 3: arXiv Medical Imaging */}
        <div
          onClick={() => handleSearch('Self-Supervised Learning for Medical Image Analysis')}
          className="rg-card"
          style={{ left: '1.5%', top: '61%', '--r': '-6deg' } as React.CSSProperties}
        >
          <div className="top">
            <span className="src">ar<i>X</i>iv</span>
            <span>2024</span>
          </div>
          <h3>Self-Supervised Learning for Medical Image Analysis</h3>
          <div className="au">J. Chen <b>et al.</b></div>
          <div className="meta">
            <span>
              <svg viewBox="0 0 24 24"><path d="M7 7c-2 1-3 3-3 6h4v4H4M17 7c-2 1-3 3-3 6h4v4h-4" /></svg>
              642
            </span>
            <span>
              <svg viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v5h5" /></svg>
              PDF
            </span>
          </div>
        </div>

        {/* Card 4: OpenAlex LLMs in Science */}
        <div
          onClick={() => handleSearch('Large Language Models in Scientific Research')}
          className="rg-card"
          style={{ left: '75.7%', top: '65%', width: '24.4%', '--r': '6deg' } as React.CSSProperties}
        >
          <div className="top">
            <span className="oa">
              <svg viewBox="0 0 24 24" fill="none" stroke="#5fa8ff" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
              </svg>
              OpenAlex
            </span>
            <span>2023</span>
          </div>
          <h3>Large Language Models in Scientific Research</h3>
          <div className="au">T. Brown <b>et al.</b></div>
          <div className="meta">
            <span>
              <svg viewBox="0 0 24 24"><path d="M7 7c-2 1-3 3-3 6h4v4H4M17 7c-2 1-3 3-3 6h4v4h-4" /></svg>
              1.1K
            </span>
            <span>
              <svg viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v5h5" /></svg>
              PDF
            </span>
          </div>
        </div>

        {/* 7 Interactive Tags */}
        <button
          type="button"
          onClick={() => handleSearch('Authors')}
          className="rg-tag"
          style={{ '--c': '#f5b335', left: '37.4%', top: '11.2%', width: '14.4cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" style={{ fill: '#f5b335' }}>
            <circle cx="12" cy="8" r="4.2" />
            <path d="M4 21c1-6 15-6 16 0z" />
          </svg>
          Authors
        </button>

        <button
          type="button"
          onClick={() => handleSearch('Datasets')}
          className="rg-tag"
          style={{ '--c': '#2dd4a8', left: '61.2%', top: '11.2%', width: '14.4cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" style={{ fill: '#2dd4a8' }}>
            <ellipse cx="12" cy="6" rx="7" ry="3" />
            <path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3 3 7 3s7-1.3 7-3" />
          </svg>
          Datasets
        </button>

        <button
          type="button"
          onClick={() => setActivePage('search')}
          className="rg-tag"
          style={{ '--c': '#3a8dff', left: '20.6%', top: '45.5%', width: '13.8cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7" />
          </svg>
          Papers
        </button>

        <button
          type="button"
          onClick={() => handleSearch('Citations')}
          className="rg-tag"
          style={{ '--c': '#e08cff', left: '79.1%', top: '45.5%', width: '16.4cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" style={{ fill: '#e08cff' }}>
            <path d="M7 7c-2 1-3 3-3 6h4v4H4M17 7c-2 1-3 3-3 6h4v4h-4" />
          </svg>
          Citations
        </button>

        <button
          type="button"
          onClick={() => setActivePage('graph')}
          className="rg-tag"
          style={{ '--c': '#b86cf5', left: '35.7%', top: '79.5%', width: '15.2cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" style={{ fill: '#b86cf5' }}>
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z" />
          </svg>
          Concepts
        </button>

        <button
          type="button"
          onClick={() => handleSearch('Research Trends')}
          className="rg-tag"
          style={{ '--c': '#3a8dff', left: '65.3%', top: '79.5%', width: '18.4cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 20V12M12 20V5M19 20v-9" strokeWidth="3.2" />
          </svg>
          Research Trends
        </button>

        <button
          type="button"
          onClick={() => setActivePage('graph')}
          className="rg-tag"
          style={{ '--c': '#35c6ff', left: '49.4%', top: '96.2%', width: '22.1cqw' } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="5" cy="18" r="2.5" />
            <circle cx="19" cy="18" r="2.5" />
            <path d="m11 7.5-5 8M13 7.5l5 8M8 18h8" />
          </svg>
          Knowledge Graph
        </button>

        <div className="rg-tip" id="tip" ref={tipRef} role="status" />
        <div className="rg-hint" id="hint" ref={hintRef}>
          <svg viewBox="0 0 24 24">
            <path d="M12 3a9 9 0 1 0 9 9" />
            <path d="M21 3v6h-6" />
          </svg>
          Drag to rotate &middot; click a node
        </div>
      </div>
    </div>
  );
};
