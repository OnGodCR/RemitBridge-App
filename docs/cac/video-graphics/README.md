# CAC video graphics

The animated graphics for the intro, the technical part and the closing of the CAC video. Each
element is timed to the word it illustrates, from Descript's transcript (`SEGS` in
`graphics.html`).

To render again, from a scratch folder holding these files:

```bash
npm i puppeteer-core@23.11.1 ffmpeg-static@5.2.0 simple-icons@13.21.0 d3-geo@3.1.1 topojson-client@3.1.0 world-atlas@2.0.2
node -e "const s=require('simple-icons');const o={};for(const k of ['React','Typescript','Apple','Android','Supabase','Postgresql','Python','Githubactions','Meta','Whatsapp','Cloudflare','Github'])o[k.toLowerCase()]={hex:s['si'+k].hex,path:s['si'+k].path};require('fs').writeFileSync('icons.js','window.ICONS='+JSON.stringify(o)+';')"
node mkmap.mjs
node render.js intro video 54.16 intro_overlay.mov
node render.js tech video 41.04 tech_overlay.mov
node render.js close video 15.43 close_overlay.mov
```

Each overlay is then composited onto the footage with ffmpeg: the intro at 1x with Angad in the frame on the right during the two graphics
stretches (0:00 to 0:17 and 0:32 to 0:46), the technical part at 1.1x with Angad cropped into the frame on the right, and the closing at 1x with the
same frame from the end card on.
