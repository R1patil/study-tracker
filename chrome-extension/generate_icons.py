import os
from PIL import Image, ImageDraw

def create_icon(size):
    # Create an image with transparent background
    img = Image.new('RGBA', (size, size), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a beautiful gradient-like circle
    # Outer circle
    draw.ellipse([size*0.1, size*0.1, size*0.9, size*0.9], fill=(99, 102, 241, 255)) # Indigo base
    
    # Inner accent (lightning bolt style)
    # Simple polygon for a clean lightning/spark icon
    points = [
        (size * 0.55, size * 0.2),
        (size * 0.3, size * 0.55),
        (size * 0.45, size * 0.55),
        (size * 0.4, size * 0.8),
        (size * 0.7, size * 0.45),
        (size * 0.5, size * 0.45)
    ]
    draw.polygon(points, fill=(255, 255, 255, 255))
    
    os.makedirs('icons', exist_ok=True)
    img.save(f'icons/icon{size}.png')
    print(f"Generated icons/icon{size}.png")

if __name__ == '__main__':
    create_icon(16)
    create_icon(48)
    create_icon(128)
