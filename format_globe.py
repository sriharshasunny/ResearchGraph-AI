import re

with open(r'c:\Users\sriha\.gemini\antigravity-ide\scratch\globe.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace base64 with local file path using string search since we don't want regex escape issues
# The format in the file is map:TX('data:image/webp;base64,....')
match = re.search(r"data:image/webp;base64,([^']+)", content)
if match:
    content = content.replace("data:image/webp;base64," + match.group(1), "/globe.webp")

# Remove backgrounds to make it transparent
content = content.replace('background:#030615;', 'background:transparent;')
content = re.sub(r'#stage\{[^}]*background:radial-gradient[^;]*;', '#stage{position:relative;width:100%;height:100%;cursor:grab;touch-action:none;overflow:hidden;', content)
content = content.replace('<div class="hz"></div>', '') # Remove the horizon glow as AuthPage already has a glowing console
content = content.replace('<div class="sc">SCROLL TO EXPLORE</div>', '') # Not needed in the center container
content = content.replace('<div class="hud"><span>CANOPY PRESSURIZED</span><span>GRAPH TOPOLOGY: ACTIVE</span><span>45 SOURCES SYNCHRONIZED</span><span>LIVE</span></div>', '') # AuthPage already has a HUD

with open(r'public\knowledge_globe.html', 'w', encoding='utf-8') as f_out:
    f_out.write(content)
print('Saved public/knowledge_globe.html')
