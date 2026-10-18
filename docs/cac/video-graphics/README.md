# CAC video graphics

The animated graphics for the intro, the technical part and the closing of the CAC
video. Each element is timed to the word it illustrates, from Descript's transcript
(`SEGS` in the page).

- `editorial.html`: the current style (v5): a paper panel slides in while the footage
  slides right, serif headlines, mono labels, ink line drawings, monochrome logos.
- `graphics.html`: the first style (v3 and v4), kept for reference.

To render again, from a scratch folder holding these files:

```bash
npm i puppeteer-core@23.11.1 ffmpeg-static@5.2.0 simple-icons@13.21.0 d3-geo@3.1.1 topojson-client@3.1.0 world-atlas@2.0.2 @fontsource/instrument-serif@5.1.1 @fontsource/ibm-plex-mono@5.1.1
node -e "const s=require('simple-icons');const o={};for(const k of ['React','Typescript','Apple','Android','Supabase','Postgresql','Python','Githubactions','Meta','Whatsapp','Cloudflare','Github'])o[k.toLowerCase()]={hex:s['si'+k].hex,path:s['si'+k].path};require('fs').writeFileSync('icons.js','window.ICONS='+JSON.stringify(o)+';')"
node mkmap.mjs
PAGE=editorial.html node render.js intro video 54.16 intro.mov
PAGE=editorial.html node render.js tech video 41.04 tech.mov
PAGE=editorial.html node render.js close video 15.43 close.mov
```

Then composite each overlay onto its raw clip with the matching `fc_*.txt` filter script
(`ffmpeg -i <clip> -i <overlay>.mov -filter_complex_script fc_intro.txt -map "[v]" -map 0:a ...`;
the tech script maps `[a]`, its audio at 1.1x). The scripts slide the footage right in
step with the panel (`PAGE=editorial.html node render.js intro expr` prints the slide
expression if the timings change) and add the film grain, which is far cheaper there
than in the page.
