import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { CONFIG, type VideoItem } from '../config';
import { makeStars, canvasTexture } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { damp } from '../utils/math';
import { ytThumb, checkThumbnail } from '../media/youtube';

export const videoAvailable = new Map<number, boolean>();
export let videoFilter: { category: string; query: string } = { category: 'All', query: '' };
export function setVideoFilter(category: string, query: string) { videoFilter = { category, query }; window.dispatchEvent(new CustomEvent('asad:video-filter')); }
export function visibleVideoIndices(): number[] { return CONFIG.videos.map((_, i) => i).filter(i => { const v = CONFIG.videos[i]; if (videoAvailable.get(i) === false) return false; if (videoFilter.category !== 'All' && v.category !== videoFilter.category) return false; if (videoFilter.query && !(v.title + ' ' + v.line + ' ' + v.category).toLowerCase().includes(videoFilter.query.toLowerCase())) return false; return true; }); }

function fallbackPoster(v: VideoItem, i: number) { return canvasTexture((ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1a0b2e'); g.addColorStop(.5, '#6b21a8'); g.addColorStop(1, '#0f172a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#e9d5ff'; ctx.font = '700 40px Space Grotesk, sans-serif'; ctx.shadowColor = '#8b3dff'; ctx.shadowBlur = 20; const words = v.title.split(' '); let line = '', y = h / 2 - 40; for (const word of words) { if ((line + word).length > 26) { ctx.fillText(line, 40, y); y += 48; line = ''; } line += word + ' '; } ctx.fillText(line, 40, y); ctx.font = '20px JetBrains Mono'; ctx.fillStyle = '#c4b5fd'; ctx.fillText(v.category, 40, h - 30); }, 1024, 576); }

export function create(engine: Engine): ExperienceScene {
  const root = new THREE.Group(); root.add(makeSky(77).mesh, makeStars(1000, 77)); root.add(new THREE.AmbientLight('#8b6bbf', 1));
  const planes: THREE.Mesh[] = []; const uniforms: { uHover: { value: number }; uTime: { value: number } }[] = []; const frames: THREE.Mesh[] = [];
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  CONFIG.videos.forEach((v, i) => {
    const u = { uHover: { value: 0 }, uTime: { value: 0 } }; uniforms.push(u);
    const tex = v.ytId ? loader.load(ytThumb(v.ytId, engine.quality === 'high' ? 'hq' : 'mq'), undefined, undefined, () => { (planes[i].material as THREE.ShaderMaterial).uniforms.uMap.value = fallbackPoster(v, i); }) : fallbackPoster(v, i);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.ShaderMaterial({ uniforms: { ...u, uMap: { value: tex } }, vertexShader: `varying vec2 vUv;uniform float uHover,uTime;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*4.+uTime*3.)*.06*uHover;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`, fragmentShader: `uniform sampler2D uMap;uniform float uHover,uTime;varying vec2 vUv;void main(){vec2 uv=vUv;float r=length(uv-.5);uv+=normalize(uv-.5+.001)*sin(r*30.-uTime*5.)*.012*uHover;vec3 c=texture2D(uMap,uv).rgb;c.r=texture2D(uMap,uv+vec2(.006*uHover,0.)).r;c.b=texture2D(uMap,uv-vec2(.006*uHover,0.)).b;c+=vec3(.2,.05,.4)*uHover*(1.-smoothstep(.0,.5,abs(r-.3)));gl_FragColor=vec4(c,1.);}` });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.04, 32, 16), mat); m.userData.index = i; root.add(m); planes.push(m);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.24), new THREE.MeshBasicMaterial({ color: '#8b3dff', transparent: true, opacity: .25 })); frame.position.z = -.03; root.add(frame); frames.push(frame);
    if (v.ytId) checkThumbnail(v.ytId).then(ok => { videoAvailable.set(i, ok); layout(); }); else videoAvailable.set(i, true);
  });
  let offset = 0, target = 0, hovered = -1; const cameraPos = new THREE.Vector3(0, 0, 10); const lookAt = new THREE.Vector3(0, 0, 0);
  function layout() { const idx = visibleVideoIndices(); idx.forEach((vi, slot) => { const p = planes[vi]; p.visible = true; p.userData.slot = slot; frames[vi].visible = true; }); planes.forEach((p, i) => { if (!idx.includes(i)) { p.visible = false; frames[i].visible = false; } }); target = Math.max(0, Math.min(target, Math.max(0, idx.length - 1) * 6.2)); }
  layout(); addEventListener('asad:video-filter', layout);
  const move = (e: PointerEvent) => { if (engine.activeId !== 'videos') return; const hits = engine.pick(planes.filter(p => p.visible), e); hovered = hits.length ? (hits[0].object as THREE.Mesh).userData.index : -1; engine.renderer.domElement.style.cursor = hovered >= 0 ? 'pointer' : ''; };
  const click = (e: PointerEvent) => { if (engine.activeId !== 'videos') return; const hits = engine.pick(planes.filter(p => p.visible), e); if (hits.length) window.dispatchEvent(new CustomEvent('asad:video', { detail: (hits[0].object as THREE.Mesh).userData.index })); };
  const wheel = (e: WheelEvent) => { const n = visibleVideoIndices().length; target = Math.max(0, Math.min(Math.max(0, n - 1) * 6.2, target + e.deltaY * .01)); };
  let vDrag = false, vX = 0, vMoved = 0;
  const vDown = (e: PointerEvent) => { if (engine.activeId !== 'videos') return; vDrag = true; vX = e.clientX; vMoved = 0; };
  const vMove = (e: PointerEvent) => { if (!vDrag || engine.activeId !== 'videos') return; const dx = e.clientX - vX; vX = e.clientX; vMoved += Math.abs(dx); const n = visibleVideoIndices().length; target = Math.max(0, Math.min(Math.max(0, n - 1) * 6.2, target - dx * .02)); };
  const vUp = () => { vDrag = false; };
  const el = engine.renderer.domElement; el.addEventListener('pointermove', move); el.addEventListener('click', e => { if (vMoved < 6) click(e); }); el.addEventListener('pointerdown', vDown); el.addEventListener('pointermove', vMove); el.addEventListener('pointerup', vUp); el.addEventListener('pointerleave', vUp);
  return { root, cameraPos, lookAt, wheel,
    update({ time, dt }: SceneContext) { offset = damp(offset, target, 5, dt); planes.forEach((p, i) => { if (!p.visible) return; const slot = p.userData.slot ?? i; uniforms[i].uTime.value = time; uniforms[i].uHover.value = damp(uniforms[i].uHover.value, hovered === i ? 1 : 0, 8, dt); p.position.x = slot * 6.2 - offset; p.position.y = Math.sin(time * .5 + i) * .12; p.rotation.y = Math.sin(time * .3 + i) * .04; frames[i].position.x = p.position.x; frames[i].position.y = p.position.y; }); },
    dispose() { removeEventListener('asad:video-filter', layout); el.removeEventListener('pointermove', move); el.removeEventListener('pointerdown', vDown); el.removeEventListener('pointermove', vMove); el.removeEventListener('pointerup', vUp); el.removeEventListener('pointerleave', vUp); }
  };
}
