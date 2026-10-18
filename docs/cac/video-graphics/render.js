// node render.js <section> stills t1,t2,...   |   node render.js <section> video <dur> <out.mov>
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
(async () => {
  const [section, mode, a, b] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('file://' + __dirname + '/graphics.html?s=' + section);
  await page.evaluate(() => document.fonts.ready);
  if (mode === 'stills') {
    for (const t of a.split(',')) {
      await page.evaluate(t => window.render(+t), t);
      await page.screenshot({ path: `${__dirname}/still_${section}_${t}.png`, omitBackground: true });
    }
  } else {
    const fps = 30, n = Math.ceil(+a * fps);
    const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'qtrle', b], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.render(t), i / fps);
      const buf = await page.screenshot({ omitBackground: true, type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
