"""Rebuild the app icons from the website mark: `python3 scripts/make-icons.py` (needs Pillow),
run from mobile/. The iOS layered icon (assets/expo.icon) uses the same mark as a vector."""
# Renders the website's bridge mark (favicon.svg: arch M11 33 Q32 17 53 33, pier M22 48 v-6 q10-9 20 0 v6,
# stroke 5, round caps) at app-icon sizes. Supersampled 4x for smooth edges.
from PIL import Image, ImageDraw
GREEN=(20,112,90,255); WHITE=(255,255,255,255)
def quad(p0,p1,p2,n=80):
    return [((1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0], (1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]) for t in [i/n for i in range(n+1)]]
arch=quad((11,33),(32,17),(53,33))
pier=[(22,48),(22,42)]+quad((22,42),(32,33),(42,42))+[(42,48)]
def mark(size, box, color, bg=None, rx=0):
    """Draw the mark so its 64-unit design fits `box` px (the favicon's own 64 grid), centered."""
    S=4; W=size*S
    im=Image.new('RGBA',(W,W),bg or (0,0,0,0)); d=ImageDraw.Draw(im)
    k=box*S/64; off=(W-64*k)/2
    # centre the drawn mark (the arch peaks at y=25, so ink spans y 22.5..50.5), not the 64 grid
    dy=(64-(22.5+50.5))/2*k
    for path in (arch,pier):
        pts=[(off+x*k, off+y*k+dy) for x,y in path]
        w=5*k; r=w/2
        # Stamp round dots along the path: a round pen, so curves have no seams.
        for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
            n=max(1,int(((x1-x0)**2+(y1-y0)**2)**0.5/2))
            for i in range(n+1):
                x=x0+(x1-x0)*i/n; y=y0+(y1-y0)*i/n
                d.ellipse([x-r,y-r,x+r,y+r], fill=color)
    return im.resize((size,size), Image.LANCZOS)
import os
out=os.path.join(os.path.dirname(__file__), '..', 'assets', 'images') + '/'
mark(1024,1024*0.82,WHITE,GREEN).save(out+'icon.png')                       # store icon: full-bleed square
Image.new('RGBA',(512,512),GREEN).save(out+'android-icon-background.png')
mark(512,512*0.56,WHITE).save(out+'android-icon-foreground.png')            # inside the adaptive safe zone
mark(432,432*0.56,WHITE).save(out+'android-icon-monochrome.png')
mark(400,400,WHITE).save(out+'splash-icon.png')
mark(48,48*0.8,WHITE,GREEN).save(out+'favicon.png')
