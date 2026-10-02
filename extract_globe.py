import re
import base64

with open(r'c:\Users\sriha\.gemini\antigravity-ide\scratch\globe.html', 'r', encoding='utf-8') as f:
    content = f.read()
    
match = re.search(r"data:image/webp;base64,([^']+)", content)
if match:
    img_data = base64.b64decode(match.group(1))
    with open(r'public\globe.webp', 'wb') as f_out:
        f_out.write(img_data)
    print('Saved to public/globe.webp')
else:
    print('Not found')
