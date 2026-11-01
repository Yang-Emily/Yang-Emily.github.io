"""Animate pen strokes with articulated hand poses, wrist motion, and pen lifts."""
from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / 'public/blog/sketchmind'
small = ImageFont.truetype('/System/Library/Fonts/Noteworthy.ttc', 17)
ink, pencil = '#393a37', '#77736c'
canvas = Image.new('RGB', (620, 540), '#ffffff')
frames, durations = [], []
last_tip = None
poses = []
for i in range(3):
    sprite = Image.open(OUT/f'writing-hand-pose-{i}.png').convert('RGBA')
    mask = sprite.getchannel('A').point(lambda value: 255 if value > 180 else 0)
    left = mask.getbbox()[0]
    nib_y = max(y for y in range(sprite.height) if mask.getpixel((left,y)))
    original_size = sprite.size
    sprite.thumbnail((190,190), Image.Resampling.LANCZOS)
    anchor = (left * sprite.width / original_size[0], nib_y * sprite.height / original_size[1])
    poses.append((sprite,anchor))

# Simple single-stroke handwriting paths, normalized to the numeral's bounds.
DIGITS = {
  1: [(0.18,.25),(.55,.02),(.5,1)],
  2: [(0,.2),(.2,.03),(.65,0),(1,.18),(.9,.4),(.6,.65),(0,1),(1,.98)],
  3: [(0,.12),(.6,0),(1,.13),(.7,.42),(.3,.48),(.8,.5),(1,.7),(.8,.94),(.3,1),(0,.86)],
  4: [(.72,0),(0,.65),(1,.65),(.65,.65),(.65,1)],
  5: [(1,.04),(.15,0),(.05,.48),(.55,.42),(.95,.58),(1,.8),(.7,.98),(.2,1),(0,.88)],
}

def stamp(frame, tip, phase=0, lift=0, angle=0):
    sprite,anchor=poses[phase%len(poses)]
    side=420
    centered=Image.new('RGBA',(side,side))
    center=side//2
    centered.paste(sprite,(round(center-anchor[0]),round(center-anchor[1])),sprite)
    centered=centered.rotate(angle,resample=Image.Resampling.BICUBIC,center=(center,center))
    frame.paste(centered,(round(tip[0]-center),round(tip[1]-center-lift)),centered)

def capture(tip=None, duration=20, phase=0, lift=0, angle=0):
    frame=canvas.copy()
    if tip is not None:
        stamp(frame,tip,phase,lift,angle)
    frames.append(frame)
    durations.append(duration)

def travel(tip):
    global last_tip
    if last_tip is not None:
        distance=math.dist(last_tip,tip)
        if distance>65:
            mid=((last_tip[0]+tip[0])/2,(last_tip[1]+tip[1])/2)
            capture(mid,phase=2,lift=8,angle=-4)
    last_tip=tip

def path(points,color=ink,width=2):
    global last_tip
    travel(points[0])
    # Two trajectory samples keep the complete trace quick while showing real pen movement.
    split=max(1,len(points)//2)
    previous=0
    for j,end in enumerate([split,len(points)-1]):
        ImageDraw.Draw(canvas).line(points[previous:end+1],fill=color,width=width,joint='curve')
        tip=points[end]
        dx=tip[0]-points[previous][0]
        dy=tip[1]-points[previous][1]
        angle=max(-7,min(7,math.degrees(math.atan2(dy,abs(dx)+8))*.1))
        capture(tip,phase=j+1,angle=angle)
        previous=end
        last_tip=tip

def write_note(text,x,y):
    global last_tip
    travel((x,y+15))
    # Reveal short groups while fingers alternate between downstroke and release poses.
    for index in range(0,len(text),2):
        chunk=text[index:index+2]
        ImageDraw.Draw(canvas).text((x,y),chunk,font=small,fill=pencil)
        x+=small.getlength(chunk)
        tip=(x,y+15+math.sin(index*1.5)*2)
        capture(tip,phase=1 if index%4==0 else 2,angle=math.sin(index)*4)
        last_tip=tip

def row(values,r):
    for i,v in enumerate(values):
        jitter=random.Random(r*12+i)
        x,y=40+i*48+jitter.randint(-2,2),40+r*50+jitter.randint(-2,2)
        points=[(x+px*23,y+py*30) for px,py in DIGITS[v]]
        if v in (2,3,5):
            for _ in range(2):
                softened=[points[0]]
                for first,second in zip(points,points[1:]):
                    softened.extend([
                        (.75*first[0]+.25*second[0], .75*first[1]+.25*second[1]),
                        (.25*first[0]+.75*second[0], .25*first[1]+.75*second[1]),
                    ])
                points=softened+[points[-1]]
        path(points,width=2)

capture(duration=100)
a=[5,2,4,3,1]
r=0
notes=0
annotation=''
row(a,r)
for end in range(4,0,-1):
    for i in range(end):
        left,right=a[i:i+2]
        swap=left>right
        x,y=36+i*48,30+r*50
        path([(x,y+43+notes*2),(x+29,y+45+notes*2),(x+73,y+42+notes*2)],pencil,1)
        note=f'{left} > {right}, swap' if swap else f'{left} < {right}'
        text=('; ' if notes else '')+note
        write_note(text,307+round(small.getlength(annotation)),y+12)
        annotation+=text
        notes+=1
        if swap:
            a[i],a[i+1]=a[i+1],a[i]
            r+=1
            notes=0
            annotation=''
            row(a,r)
write_note('sorted',307,30+r*50+12)
# Lift the pencil away before the completed page rests.
if last_tip:
    capture((last_tip[0]+8,last_tip[1]-5),phase=2,lift=12,angle=-5)
canvas.save(OUT/'paper-trace-still.png')
capture(duration=2200)
frames[0].save(OUT/'paper-trace.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=True)
print(f'{len(frames)} frames; writing {sum(durations[:-1])/1000:.2f}s; finished hold {durations[-1]/1000:.1f}s')
