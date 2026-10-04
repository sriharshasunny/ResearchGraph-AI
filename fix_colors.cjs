const fs = require('fs');
let oldHero = fs.readFileSync('public/home_hero.html', 'utf8');

// Replace body background
oldHero = oldHero.replace(/background:#030514/g, 'background:transparent');
oldHero = oldHero.replace(/color:#eaf2ff/g, 'color:#1e293b');

// tint gradient
oldHero = oldHero.replace(/#tint\{.*?\}/, '#tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,0) 0%,#f7f9fd 100%);pointer-events:none}');

// The text colors
oldHero = oldHero.replace(/color:#fff;text-shadow:0 0 14px rgba\(120,170,255,\.95\),0 2px 8px rgba\(0,0,10,\.9\)/g, 'color:#000;text-shadow:0 0 14px rgba(255,255,255,0.95),0 2px 8px rgba(0,0,0,0.1)'); // H1
oldHero = oldHero.replace(/color:#a3b9e2/g, 'color:#475569'); // .sub
oldHero = oldHero.replace(/background:rgba\(30,40,70,\.4\);border:1px solid rgba\(80,120,220,\.3\);color:#fff/g, 'background:#fff;border:1px solid #d0d7e6;color:#1e293b'); // .srch
oldHero = oldHero.replace(/fill="#8fa9d8"/g, 'fill="#64748b"'); // .srch svg
oldHero = oldHero.replace(/background:rgba\(60,110,240,\.95\);color:#fff/g, 'background:#2f63f0;color:#fff'); // #go button
oldHero = oldHero.replace(/background:rgba\(20,30,50,\.7\);border:1px solid rgba\(80,120,220,\.2\);color:#a3b9e2/g, 'background:#fff;border:1px solid #d0d7e6;color:#475569'); // .ch
oldHero = oldHero.replace(/background:rgba\(40,50,80,\.6\)/g, 'background:#f1f5f9'); // .ch:hover

// core text
oldHero = oldHero.replace(/#core\{.*?\}/, '#core{position:absolute;left:calc(661*var(--u));top:calc(50% - 200*var(--u));width:calc(600*var(--u));display:flex;flex-direction:column;align-items:center;pointer-events:none;z-index:2}#core span{font-size:calc(180*var(--u));line-height:.85;font-weight:800;letter-spacing:-.04em;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.01) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}');

// stage background
oldHero = oldHero.replace(/background:radial-gradient\(circle at 45% 50%,#080c25 0%,#030514 60%\)/g, 'background:transparent');

// globe color
oldHero = oldHero.replace(/new THREE\.Color\(0x22d3ee\)/, 'new THREE.Color(0x3b82f6)');

// chip0 color
oldHero = oldHero.replace(/background:rgba\(40,50,80,\.6\);color:#8fa9d8;border:1px solid rgba\(80,120,220,\.3\)/, 'background:#eaf1ff;color:#2f63f0;border:1px solid #c9d8fa');

fs.writeFileSync('public/home_hero.html', oldHero);
