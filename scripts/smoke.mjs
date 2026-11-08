import { chromium } from 'playwright';
const url = process.env.URL || 'http://localhost:5173';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
await page.goto(url + '/?quality=low', { waitUntil: 'networkidle' });
await page.waitForFunction(() => !document.querySelector('#enterBtn').disabled, { timeout: 30000 });
await page.screenshot({ path: 'shots/01-loader.png' });
await page.click('#enterBtn');
await page.waitForFunction(() => document.body.classList.contains('entered'), { timeout: 60000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'shots/02-home.png', timeout: 60000 });
const state = await page.evaluate(() => ({ entered: document.body.classList.contains('entered'), webgl: !document.body.classList.contains('no-webgl'), audio: window.__asadAudio?.started, title: document.querySelector('#trackTitle').textContent }));
console.log('STATE', JSON.stringify(state));
for (const id of ['history','videos','music','incidents','street','deep','secret']) {
  await page.evaluate(id => window.dispatchEvent(new CustomEvent('asad:navigate', { detail: id })), id);
  await page.waitForFunction(id => window.__asadEngine?.activeId === id && !window.__asadEngine?.transitioning, id, { timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/scene-${id}.png`, timeout: 60000 });
  const visible = await page.evaluate(() => !document.querySelector('#sceneUI').hidden && document.querySelector('#sceneName').textContent);
  console.log('SCENE', id, visible);
}
// deep dive: hold to accelerate
await page.evaluate(() => window.dispatchEvent(new CustomEvent('asad:navigate', { detail: 'deep' })));
await page.waitForTimeout(1800);
await page.mouse.move(780, 450); await page.mouse.down(); await page.waitForTimeout(9000); await page.mouse.up();
const depth = await page.evaluate(() => document.querySelector('#depthNum')?.textContent);
console.log('DEPTH after hold', depth);
await page.screenshot({ path: 'shots/03-deep-dive.png', timeout: 90000 });
// back home, open video modal
await page.click('#backBtn'); await page.waitForTimeout(1800);
await page.click('#trailerBtn'); await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/04-video.png', timeout: 90000 });
await page.click('.modal-close'); await page.waitForTimeout(400);
// secrets
await page.click('#heroStar'); await page.waitForTimeout(300);
const secrets = await page.evaluate(() => document.querySelector('#secretCount').textContent);
console.log('SECRETS', secrets);
// mobile
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/05-mobile.png', fullPage: false, timeout: 90000 });
console.log('CONSOLE ERRORS', errors.length ? errors : 'none');
await browser.close();
if (errors.length) process.exit(1);
