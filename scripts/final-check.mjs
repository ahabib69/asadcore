import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.env.URL || 'http://localhost:5173';
fs.mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.setDefaultTimeout(30000);
const errors = [];
const external = /youtube|youtu\.be|google|gstatic|mapillary|archive\.org|wikimedia|tmdb|themoviedb|jamendo|net::|Failed to load resource|favicon|doubleclick|googleads/i;
page.on('console', m => { if (m.type() === 'error' && !external.test(m.text())) errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
const cdp = await page.context().newCDPSession(page);
const setRun = on => page.evaluate(on => { const e = window.__asadEngine; if (!e) return; if (on) e.start(); else e.running = false; }, on);
const shot = async n => { await page.evaluate(() => { const e = window.__asadEngine; if (!e) return; if (e.active && !e.active.freeCamera) { e.camera.position.copy(e.active.cameraPos); e.camera.lookAt(e.active.lookAt); } e.renderer.render(e.scene, e.camera); }); const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(`shots/${n}.png`, Buffer.from(data, 'base64')); };
const nav = async id => { await page.evaluate(id => window.dispatchEvent(new CustomEvent('asad:navigate', { detail: id })), id); await page.waitForFunction(id => window.__asadEngine?.activeId === id && !window.__asadEngine?.transitioning, id, { timeout: 90000, polling: 300 }); await page.waitForTimeout(500); };
const click = sel => page.$eval(sel, el => el.click());
await page.goto(url + '/?quality=low', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !document.querySelector('#enterBtn').disabled, { timeout: 90000 });
await click('#enterBtn');
await page.waitForFunction(() => document.body.classList.contains('entered'), { timeout: 90000 });
await page.waitForTimeout(800); await setRun(false); await shot('final-home');
console.log('HOME', await page.evaluate(() => ({ cards: document.querySelectorAll('.explore-card').length, audio: window.__asadAudio.started })));
for (const id of ['history','cinema','ocean','videos','music','incidents','street','deep','secret']) {
  await nav(id);
  console.log('SCENE', id, await page.evaluate(() => ({ name: document.querySelector('#sceneName').textContent, body: document.querySelector('#sceneBody').children.length > 0 })));
  if (id === 'videos') { await click('[data-video="0"]'); await page.waitForTimeout(1800); console.log('VIDEO', await page.evaluate(() => !!document.querySelector('#videoStage iframe, #videoStage video'))); await shot('final-video'); await click('.modal-close'); await page.waitForTimeout(300); }
  if (id === 'music') { const has = await page.$('[data-mtrack]'); if (has) { await click('[data-mtrack]'); await page.waitForTimeout(1800); } console.log('MUSIC', await page.evaluate(() => ({ mode: window.__asadAudio.mode, title: window.__asadAudio.title }))); await shot('final-music'); await page.evaluate(() => window.__asadAudio.stopMusicTrack()); }
  if (id === 'street') { await page.waitForTimeout(1200); await click('[data-loc="paris"]'); await page.waitForTimeout(1800); console.log('STREET', await page.evaluate(() => document.querySelector('#streetInfo')?.textContent)); await shot('final-street'); }
  if (id === 'cinema') { await page.waitForTimeout(1200); console.log('CINEMA', await page.evaluate(() => ({ movies: document.querySelectorAll('.movie-card').length, news: document.querySelectorAll('.news-item').length }))); await click('[data-ind="bn"]'); await page.waitForTimeout(700); await click('[data-kind="upcoming"]'); await page.waitForTimeout(700); await shot('final-cinema'); const card = await page.$('.movie-card'); if (card) { await click('.movie-card'); await page.waitForTimeout(700); console.log('MOVIE MODAL', await page.evaluate(() => !document.querySelector('#modal').hidden)); await click('.modal-close'); await page.waitForTimeout(300); } }
  if (id === 'ocean') { await setRun(true); await page.keyboard.down('KeyW'); await page.waitForTimeout(1200); await page.keyboard.up('KeyW'); await setRun(false); console.log('OCEAN', await page.evaluate(() => ({ fps: document.querySelector('#oceanFps')?.textContent, pos: window.__asadEngine.camera.position.toArray().map(n => +n.toFixed(1)) }))); await shot('final-ocean'); }
  if (id === 'deep') { await setRun(true); await page.mouse.move(640, 400); await page.mouse.wheel(0, 3000); await page.waitForTimeout(1800); await setRun(false); await shot('final-deep'); }
}
await nav('home');
await click('#nextBtn'); await click('#playBtn'); await click('#playBtn');
await page.fill('#searchInput', 'ocean'); await page.waitForTimeout(300); console.log('SEARCH', await page.evaluate(() => document.querySelectorAll('#searchResults button[data-id]').length)); await page.fill('#searchInput', '');
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800); await shot('final-mobile');
for (const id of ['videos','music','street','cinema','ocean']) { await nav(id); await page.waitForTimeout(600); await shot('final-mobile-' + id); console.log('MOBILE SCENE', id, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)); }
console.log('CONSOLE ERRORS', errors.length ? errors : 'none');
await browser.close();
process.exit(errors.length ? 1 : 0);
