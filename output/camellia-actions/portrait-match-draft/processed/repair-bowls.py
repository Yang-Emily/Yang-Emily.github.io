"""Restore source pixels inside the two ceramic bowls missed by Vision."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parent
outlines = {
    0: [(143,315),(258,315),(254,337),(247,352),(238,359),(165,359),(153,352),(147,339)],
    7: [(125,314),(243,314),(239,337),(231,351),(219,357),(148,357),(136,349),(129,335)],
}
for index, outline in outlines.items():
    name = f'feed-{index:02}.png'
    original = Image.open(root/'frames'/name).convert('RGBA')
    masked = Image.open(root/'masked'/name).convert('RGBA')
    repair = Image.new('L', original.size)
    draw = ImageDraw.Draw(repair)
    draw.polygon(outline, fill=255)
    draw.ellipse((141, 307, 259, 325) if index == 0 else (123, 303, 244, 323), fill=255)
    Image.composite(original, masked, repair).save(root/'masked'/name)
