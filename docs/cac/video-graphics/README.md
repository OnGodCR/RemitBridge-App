# CAC video graphics

The animated graphics for the intro, the technical part and the closing of the CAC
video. Each element is timed to the word it illustrates, from Descript's transcript
(`SEGS` in the page).

- `graphics.html`: the current style (v6): the app's dark green with white cards, a
  different transition per scene and varied entrances. `node audit.js` lists any element
  on screen for under 1.4 seconds.
- `editorial.html`: the v5 experiment (a paper split screen with serif type), kept for
  reference; Angad preferred the app's own look.

To render again, from a scratch folder holding these files:

```bash
npm i puppeteer-core@23.11.1 ffmpeg-static@5.2.0 simple-icons@13.21.0 d3-geo@3.1.1 topojson-client@3.1.0 world-atlas@2.0.2 @fontsource/instrument-serif@5.1.1 @fontsource/ibm-plex-mono@5.1.1
node -e "const s=require('simple-icons');const o={};for(const k of ['React','Typescript','Apple','Android','Supabase','Postgresql','Python','Githubactions','Meta','Whatsapp','Cloudflare','Github'])o[k.toLowerCase()]={hex:s['si'+k].hex,path:s['si'+k].path};require('fs').writeFileSync('icons.js','window.ICONS='+JSON.stringify(o)+';')"
node mkmap.mjs
PAGE=graphics.html node render.js intro video 54.16 intro.mov
PAGE=graphics.html node render.js tech video 41.04 tech.mov
PAGE=graphics.html node render.js close video 16.93 close.mov
```

For v6, each overlay is composited with Angad cropped into the frame on the right while
graphics are up (crop x 571 for the intro, 871 for the technical part, 691 for the
closing), and the closing's last frame held 1.5 seconds (`tpad`, `apad`). For the v5
style, composite with the matching `fc_*.txt` filter script
(`ffmpeg -i <clip> -i <overlay>.mov -filter_complex_script fc_intro.txt -map "[v]" -map 0:a ...`;
the tech script maps `[a]`, its audio at 1.1x). The scripts slide the footage right in
step with the panel (`PAGE=editorial.html node render.js intro expr` prints the slide
expression if the timings change) and add the film grain, which is far cheaper there
than in the page.
