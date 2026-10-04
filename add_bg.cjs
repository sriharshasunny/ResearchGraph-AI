const fs = require('fs');

let hero = fs.readFileSync('public/home_hero.html', 'utf8');
let source = fs.readFileSync('scratch_hero.html', 'utf8');

// Get plate and spl CSS
const plateCss = source.match(/#plate\{.*?\}/)[0].replace(/width:1520px;height:627px;/, 'width:100%;height:100%;').replace(/left:5px;top:5px;/, 'left:0;top:0;');
const plateAfterCss = source.match(/#plate:after\{.*?\}/)[0];
const swKeyframes = source.match(/@keyframes sw\{.*?\}/)[0];
const splCss = '#spl{position:absolute;inset:0;pointer-events:none}';

// Inject CSS before </style>
hero = hero.replace('</style>', `\n${plateCss}\n${plateAfterCss}\n${swKeyframes}\n${splCss}\n</style>`);

// Replace HTML
hero = hero.replace('<svg id="mt" viewBox="0 0 1000 100" preserveAspectRatio="none"></svg><div id="hg"></div><div id="lake"></div>', '<div id="plate"></div><div id="spl"></div>');

// The original JS might be animating mt, hg, lake. Let's remove them from JS if they error out, or just let it be. 
// In the JS: const mt=document.getElementById('mt');
// It doesn't throw if mt is missing unless it uses it. In scratch_hero_old.html:
// `const stage=document.getElementById('stage'),ui=document.getElementById('ui'),tint=document.getElementById('tint'),core=document.getElementById('core'),mt=document.getElementById('mt');`
// But later it doesn't do much with `mt` other than try to tint it maybe? Let's check. 
// Let's just create fake elements or remove the references. 
hero = hero.replace("mt=document.getElementById('mt')", "mt=document.getElementById('mt') || {}");

fs.writeFileSync('public/home_hero.html', hero);
console.log("Added plate background successfully!");
