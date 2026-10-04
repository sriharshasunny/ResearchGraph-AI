const fs = require('fs');

let oldHero = fs.readFileSync('scratch_hero_old.html', 'utf8');
let newHero = fs.readFileSync('scratch_hero.html', 'utf8');

// 1. Replace CSS variables and text colors in oldHero
oldHero = oldHero.replace(/color:#fff;text-shadow:0 0 14px rgba\(120,170,255,\.95\),0 2px 8px rgba\(0,0,10,\.9\)/g, 'color:#fff;text-shadow:0 0 14px rgba(255,255,255,.95),0 2px 8px rgba(0,0,10,.5)');
oldHero = oldHero.replace(/color:#fff/g, 'color:#1c1b30'); // For h1
oldHero = oldHero.replace(/background:linear-gradient\(90deg,#4de1ff 0%,#78a4ff 38%,#b57bff 72%,#ff7ad9 100%\)/g, 'background:linear-gradient(90deg,#1170f6 0%,#3a5cf0 42%,#7a30e2 76%,#9a3bf0 100%)');
oldHero = oldHero.replace(/color:#e2eaff/g, 'color:#5c6578'); // For .sub
oldHero = oldHero.replace(/border:1px solid rgba\(120,165,255,\.5\);background:rgba\(18,28,84,\.55\);color:#86e3ff;/g, 'border:none;background:#e5eeff;color:#2f63f0;font-weight:600;'); // For .chip0
oldHero = oldHero.replace(/fill:#7fe3ff/g, 'fill:#2f63f0'); // For .chip0 svg
oldHero = oldHero.replace(/border:1px solid rgba\(120,155,255,\.5\);background:rgba\(8,14,50,\.72\);backdrop-filter:blur\(8px\);box-shadow:0 0 24px rgba\(80,110,255,\.18\)/g, 'border:1px solid #eef1fa;background:#fff;box-shadow:0 8px 30px rgba(90,110,200,.13);backdrop-filter:none;'); // For .search
oldHero = oldHero.replace(/stroke:#dbe6ff/g, 'stroke:#5a6277'); // For .search svg.q
oldHero = oldHero.replace(/color:#1c1b30;font:500/g, 'color:#14193a;font:500'); // For .search input
oldHero = oldHero.replace(/color:#9db0dc/g, 'color:#7b8397'); // For .search input::placeholder
oldHero = oldHero.replace(/background:linear-gradient\(135deg,#3b8bff,#2354ff\);box-shadow:0 0 18px rgba\(60,120,255,\.7\)/g, 'background:linear-gradient(135deg,#3b82ff,#2347e8);box-shadow:0 8px 20px rgba(47,99,240,.45)'); // For .search button
oldHero = oldHero.replace(/border:1px solid rgba\(150,170,255,\.32\);background:rgba\(16,24,72,\.55\);color:#e8eeff;/g, 'border:1px solid #edf0fa;background:rgba(255,255,255,.82);box-shadow:0 5px 18px rgba(90,110,200,.1);color:#1a2040;'); // For .chips button
oldHero = oldHero.replace(/border-color:rgba\(120,230,255,\.7\);background:rgba\(30,50,120,\.65\)/g, 'box-shadow:0 10px 24px rgba(60,100,240,.2),0 0 0 1px #c9d8fb;background:#fff;border-color:transparent;'); // For .chips button:hover
oldHero = oldHero.replace(/background:linear-gradient\(180deg,#151f58,#090e30\) padding-box,linear-gradient\(110deg,#4f8cff,#b36bff\) border-box;box-shadow:0 8px 24px rgba\(0,0,0,\.5\),0 0 20px rgba\(110,100,255,\.38\)/g, 'background:rgba(255,255,255,.9);box-shadow:0 12px 32px rgba(90,105,200,.17),0 0 0 1px rgba(235,239,250,.9),inset 0 1px 0 #fff;color:#1b2040;'); // For .pill
oldHero = oldHero.replace(/box-shadow:0 10px 30px rgba\(0,0,0,\.5\),0 0 34px color-mix\(in srgb,var\(--c\) 65%,transparent\)/g, 'box-shadow:0 18px 40px color-mix(in srgb,var(--c) 40%,transparent),0 0 0 1px color-mix(in srgb,var(--c) 40%,transparent)'); // For .pill:hover

// Replace `#core span` color from #1c1b30 (because we replaced #fff -> #1c1b30) back to #fff
oldHero = oldHero.replace(/#core\{position:absolute.*color:#1c1b30;/, (match) => match.replace('color:#1c1b30', 'color:#fff'));

// Now extract the base64 globe texture from newHero
const matchEarthNew = newHero.match(/const earth=new THREE\.Mesh\(new THREE\.SphereGeometry\(R,160,160\),new THREE\.MeshBasicMaterial\(\{map:TX\('([^']+)'\)/);
const matchEarthOld = oldHero.match(/const earth=new THREE\.Mesh\(new THREE\.SphereGeometry\(R,160,160\),new THREE\.MeshBasicMaterial\(\{map:TX\('([^']+)'\)/);
if(matchEarthNew && matchEarthOld) {
  oldHero = oldHero.replace(matchEarthOld[1], matchEarthNew[1]);
}

// Extract base64 dot texture
const matchDotNew = newHero.match(/const dot=new THREE\.MeshBasicMaterial\(\{map:TX\('([^']+)'\)/);
const matchDotOld = oldHero.match(/const dot=new THREE\.MeshBasicMaterial\(\{map:TX\('([^']+)'\)/);
if(matchDotNew && matchDotOld) {
  oldHero = oldHero.replace(matchDotOld[1], matchDotNew[1]);
}

// Extract arc lines texture
const matchArcNew = newHero.match(/const am=new THREE\.MeshBasicMaterial\(\{map:TX\('([^']+)'\)/);
const matchArcOld = oldHero.match(/const am=new THREE\.MeshBasicMaterial\(\{map:TX\('([^']+)'\)/);
if(matchArcNew && matchArcOld) {
  oldHero = oldHero.replace(matchArcOld[1], matchArcNew[1]);
}

// Extract glows
const matchGlowNew = newHero.match(/const gc='([^']+)'/);
const matchGlowOld = oldHero.match(/const gc='([^']+)'/);
if(matchGlowNew && matchGlowOld) {
  oldHero = oldHero.replace(matchGlowOld[1], matchGlowNew[1]);
}

// Extract sprites array
const matchSprNew = newHero.match(/const SPR=(\[.*?\]);/);
const matchSprOld = oldHero.match(/const SPR=(\[.*?\]);/);
if(matchSprNew && matchSprOld) {
  oldHero = oldHero.replace(matchSprOld[1], matchSprNew[1]);
}

fs.writeFileSync('public/home_hero.html', oldHero);
console.log("Done transforming!");
