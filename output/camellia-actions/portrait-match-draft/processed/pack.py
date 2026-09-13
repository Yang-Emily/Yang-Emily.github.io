from PIL import Image
from pathlib import Path
import numpy as np
source=Path(__file__).resolve().parent/'masked'
for action in ['pet','feed','scratch','walk']:
 paths=sorted(source.glob(f'{action}-*.png'))
 if len(paths)!=12: continue
 frames=[Image.open(p).convert('RGBA') for p in paths]
 boxes=[im.getchannel('A').point(lambda a:255 if a>30 else 0).getbbox() for im in frames]
 assert all(boxes)
 # Match the seated torso, not the changing head pose or the food bowl.
 # The generated source frames drift in body width; calibrate torso width without rescaling the height as the head moves.
 maxw=max(b[2]-b[0] for b in boxes);maxh=max(b[3]-b[1] for b in boxes)
 scale=min(340/maxw,273/maxh)
 atlas=Image.new('RGBA',(384*4,320*3))
 for i,(im,b) in enumerate(zip(frames,boxes)):
  if action != 'walk':
   alpha=np.asarray(im.getchannel('A'))
   spans=[]
   for row in alpha[220:251]:
    edges=np.diff(np.r_[False,row>200,False].astype(int))
    runs=list(zip(np.flatnonzero(edges==1),np.flatnonzero(edges==-1)))
    spans.append(max(runs,key=lambda pair:pair[1]-pair[0]))
   body_width=float(np.median([r-l for l,r in spans]))
   body_center=float(np.median([(l+r)/2 for l,r in spans]))
   scale=140/body_width
  else:
   # Walking used to be enlarged to fill the cell vertically.
   scale=.77
   body_center=(b[0]+b[2])/2
  scale_y=273/356 if action != 'walk' else scale
  resized=im.resize((round(im.width*scale),round(im.height*scale_y)),Image.Resampling.LANCZOS)
  x=round(215-body_center*scale) if action != 'walk' else round(192-body_center*scale)
  y=round(288-(b[3]-(10 if action == 'feed' else 0))*scale_y)
  cell=Image.new('RGBA',(384,320));cell.alpha_composite(resized,(x,y))
  atlas.alpha_composite(cell,((i%4)*384,(i//4)*320))
 target=Path(f'public/camellia/{action}-portrait-v1.webp')
 atlas.save(target,format='WEBP',lossless=True,method=4,exact=True)
 print(action,'12 frames',target.stat().st_size)

# Use the same neutral pose and coordinates for idle and care.
pet=Image.open('public/camellia/pet-portrait-v1.webp')
pet.crop((0,0,384,320)).save('public/camellia/idle-portrait-v1.webp',lossless=True)
