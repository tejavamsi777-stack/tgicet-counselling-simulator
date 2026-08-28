import os
from PIL import Image, ImageOps, ImageFilter

user_uploaded_dir = r"C:\Users\Vamsi Teja\.gemini\antigravity\brain\558dca68-542b-490c-9723-5cb9db220af1\.user_uploaded"
output_dir = r"c:\Users\Vamsi Teja\Downloads\tgicet-simulator\client\public\maps"

os.makedirs(output_dir, exist_ok=True)

maps_info = [
    {
        "filename": "media_1787810783403.png", # AP
        "output": "andhra-pradesh.png",
        "crop_bottom_ratio": 0.0,
        "color": (96, 165, 250) # Light blue stroke for AP
    },
    {
        "filename": "media_1787810783407.png", # KA
        "output": "karnataka.png",
        "crop_bottom_ratio": 0.12, # Crop VectorStock banner at bottom
        "color": (251, 191, 36) # Amber gold stroke for KA
    },
    {
        "filename": "media_1787810783398.png", # TG
        "output": "telangana.png",
        "crop_bottom_ratio": 0.0,
        "color": (52, 211, 153) # Emerald green stroke for TG
    }
]

for m in maps_info:
    img_path = os.path.join(user_uploaded_dir, m["filename"])
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        continue
    
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    
    # Crop bottom if specified
    if m["crop_bottom_ratio"] > 0:
        crop_h = int(h * (1.0 - m["crop_bottom_ratio"]))
        img = img.crop((0, 0, w, crop_h))
        w, h = img.size
        
    datas = img.getdata()
    new_data = []
    
    # Extract outline lines and make background transparent
    # The outline in reference images is dark gray / black (R,G,B < 180)
    for item in datas:
        r, g, b, a = item
        # If pixel is dark (outline line), replace with vibrant state accent color
        if r < 200 and g < 200 and b < 200:
            # Opacity proportional to darkness
            darkness = (255 - ((r + g + b) // 3)) / 255.0
            alpha = int(min(255, max(0, darkness * 255 * 1.5)))
            cr, cg, cb = m["color"]
            new_data.append((cr, cg, cb, alpha))
        else:
            # White / background transparent
            new_data.append((0, 0, 0, 0))
            
    img.putdata(new_data)
    
    # Trim transparent borders to tight bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = os.path.join(output_dir, m["output"])
    img.save(out_path, "PNG")
    print(f"Saved processed map to {out_path}")

print("Processing complete!")
