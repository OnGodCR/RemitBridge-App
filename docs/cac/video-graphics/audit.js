const puppeteer = require('puppeteer-core');
(async () => { const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  for (const s of ['intro','tech','close']) { await p.goto('file://' + __dirname + '/graphics3.html?s=' + s); console.log('== ' + s + '\n' + await p.evaluate(() => window.audit())); }
  b.close().catch(()=>{}); setTimeout(()=>process.exit(0), 500); })();
