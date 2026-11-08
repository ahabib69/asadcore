import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { makeStars, canvasTexture } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { damp } from '../utils/math';
import { posterUrl, type Movie } from '../media/tmdb';

function fallbackPoster(m: Movie) { return canvasTexture((ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1a3a'); g.addColorStop(1, '#0a0612'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#e9d5ff'; ctx.font = '700 34px Space Grotesk'; const words = m.title.split(' '); let line = '', y = h / 2 - 30; for (const word of words) { if ((line + word).length > 18) { ctx.fillText(line, 30, y); y += 42; line = ''; } line += word + ' '; } ctx.fillText(line, 30, y); ctx.font = '20px JetBrains Mono'; ctx.fillStyle = '#b26bff'; ctx.fillText(m.release_date || 'TBA', 30, h - 30); }, 512, 768); }

export function create(engine: Engine): ExperienceScene {
  const root = new THREE.Group(); root.add(makeSky(404).mesh, makeStars(1200, 404)); root.add(new THREE.AmbientLight('#8b6bbf', .8));
  const key = new THREE.PointLight('#b26bff', 30, 40); key.position.set(0, 4, 8); root.add(key);
  let planes: THREE.Mesh[] = []; let movies: Movie[] = []; let hovered = -1; let offset = 0, target = 0;
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  const cameraPos = new THREE.Vector3(0, 0, 12); const lookAt = new THREE.Vector3(0, 0, 0);
  function setList(list: Movie[]) { planes.forEach(p => { root.remove(p); (p.material as THREE.ShaderMaterial).uniforms.uMap.value?.dispose?.(); p.geometry.dispose(); (p.material as THREE.Material).dispose(); }); planes = []; movies = list.slice(0, engine.quality === 'high' ? 14 : 8); movies.forEach((m, i) => { const u = { uHover: { value: 0 }, uTime: { value: 0 } }; const tex = loader.load(posterUrl(m), undefined, undefined, () => { (planes[i].material as THREE.ShaderMaterial).uniforms.uMap.value = fallbackPoster(m); }); tex.colorSpace = THREE.SRGBColorSpace; const mat = new THREE.ShaderMaterial({ uniforms: { ...u, uMap: { value: tex } }, vertexShader: `varying vec2 vUv;uniform float uHover,uTime;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.y*3.+uTime*2.)*.05*uHover;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`, fragmentShader: `uniform sampler2D uMap;uniform float uHover,uTime;varying vec2 vUv;void main(){vec3 c=texture2D(uMap,vUv).rgb;float edge=smoothstep(.0,.06,vUv.x)*smoothstep(1.,.94,vUv.x)*smoothstep(.0,.06,vUv.y)*smoothstep(1.,.94,vUv.y);c+=vec3(.35,.1,.7)*uHover*(1.-edge)*1.4;c*=.85+.15*uHover;gl_FragColor=vec4(c,1.);}` }); const p = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.5, 16, 16), mat); p.userData.index = i; root.add(p); planes.push(p); }); target = 0; }
  const onList = (e: Event) => setList((e as CustomEvent).detail);
  addEventListener('asad:cinema-list', onList);
  const move = (e: PointerEvent) => { if (engine.activeId !== 'cinema') return; const h = engine.pick(planes, e); hovered = h.length ? (h[0].object as THREE.Mesh).userData.index : -1; engine.renderer.domElement.style.cursor = hovered >= 0 ? 'pointer' : ''; };
  const click = (e: PointerEvent) => { if (engine.activeId !== 'cinema') return; const h = engine.pick(planes, e); if (h.length) window.dispatchEvent(new CustomEvent('asad:movie', { detail: movies[(h[0].object as THREE.Mesh).userData.index] })); };
  const wheel = (e: WheelEvent) => { target = Math.max(0, Math.min(Math.max(0, planes.length - 1) * 3.8, target + e.deltaY * .008)); };
  const el = engine.renderer.domElement; el.addEventListener('pointermove', move); el.addEventListener('click', click);
  return { root, cameraPos, lookAt, wheel,
    update({ time, dt }: SceneContext) { offset = damp(offset, target, 5, dt); planes.forEach((p, i) => { const u = (p.material as THREE.ShaderMaterial).uniforms; u.uTime.value = time; u.uHover.value = damp(u.uHover.value, hovered === i ? 1 : 0, 8, dt); p.position.x = i * 3.8 - offset - (planes.length - 1) * 1.9; p.position.y = Math.sin(time * .6 + i) * .18; p.rotation.y = Math.sin(time * .3 + i) * .06 + (hovered === i ? (engine.pointer.x * .2) : 0); p.rotation.x = hovered === i ? -engine.pointer.y * .12 : 0; }); key.intensity = 26 + Math.sin(time) * 4; },
    dispose() { removeEventListener('asad:cinema-list', onList); el.removeEventListener('pointermove', move); el.removeEventListener('click', click); }
  };
}
