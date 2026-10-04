const fs = require('fs');
const h = fs.readFileSync('scratch_hero.html', 'utf8');

// Get everything before </style>
const styleIndex = h.indexOf('</style>');
const headContent = h.substring(0, styleIndex + 8);

// Get the hero section
const heroStart = h.indexOf('<section id="hero">');
const heroEnd = h.indexOf('</section>') + 10;
const heroHtml = h.substring(heroStart, heroEnd);

// Get the script
const scriptStart = h.indexOf('<script>');
const scriptHtml = h.substring(scriptStart);

const fullHtml = `${headContent}
</head>
<body style="background: transparent; overflow: hidden; margin: 0; padding: 0;">
${heroHtml}
${scriptHtml}
`;

fs.writeFileSync('public/home_hero.html', fullHtml);
