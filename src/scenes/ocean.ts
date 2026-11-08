import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { makeStars } from '../core/procedural';
import { rng, randomSeed, clamp, damp } from '../utils/math';
import { store } from '../utils/storage';

function moonTexture(size: number) { const c = document.createElement('canvas'); c.width = size; c.height = size / 2; const ctx = c.getContext('2d')!; ctx.fillStyle = '#8f8a9a'; ctx.fillRect(0, 0, c.width, c.height); const r = rng(12); for (let i = 0; i < size * 1.2; i++) { const x = r() * c.width, y = r() * c.height, rad = 1 + r() * size * .012; const g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(40,38,52,.55)'); g.addColorStop(.7, 'rgba(120,116,132,.25)'); g.addColorStop(1, 'rgba(180,176,192,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function sunTexture() { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const ctx = c.getContext('2d')!; const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, '#fff7e0'); g.addColorStop(.25, '#ffd9a0'); g.addColorStop(.55, 'rgba(255,150,80,.35)'); g.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); }
function rockTexture() { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const ctx = c.getContext('2d')!; ctx.fillStyle = '#3a3348'; ctx.fillRect(0, 0, 256, 256); const r = rng(7); for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${20 + r() * 60},${18 + r() * 50},${40 + r() * 70},${.2 + r() * .4})`; ctx.fillRect(r() * 256, r() * 256, 2 + r() * 6, 2 + r() * 6); } return new THREE.CanvasTexture(c); }

export function create(engine: Engine): ExperienceScene {
  const root = new THREE.Group(); const seed = randomSeed(); const r = rng(seed);
  const cameraPos = new THREE.Vector3(0, 0, 0); const lookAt = new THREE.Vector3(0, 0, -1);
  root.add(makeStars(2000, seed));
  const ambient = new THREE.AmbientLight('#4a3a7a', .7); root.add(ambient);
  const sunLight = new THREE.DirectionalLight('#ffd9a0', 1.2); sunLight.position.set(30, 40, -60); root.add(sunLight);
  // Nebula backdrop sphere
  const nebulaMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { uTime: { value: 0 } }, vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `varying vec3 vP;uniform float uTime;float h(vec3 p){return fract(sin(dot(p,vec3(12.9,78.2,37.7)))*43758.5);}void main(){vec3 d=normalize(vP);float n=h(floor(d*6.+uTime*.02));vec3 c=mix(vec3(.03,.015,.08),vec3(.12,.05,.25),n*.6);c+=vec3(.05,.02,.12)*pow(max(0.,d.y),2.);gl_FragColor=vec4(c,1.);}` });
  const nebula = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), nebulaMat); root.add(nebula);
  // Moon
  const moonMat = new THREE.MeshStandardMaterial({ map: moonTexture(1024), roughness: .95, metalness: 0 });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(14, 48, 32), moonMat); moon.position.set(-40, 22, -90); root.add(moon);
  // Sun + flare
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sun.position.set(60, 45, -140); sun.scale.setScalar(60); root.add(sun);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTexture(), transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })); flare.position.copy(sun.position); flare.scale.setScalar(120); root.add(flare);
  // Ringed planet
  const planet = new THREE.Mesh(new THREE.SphereGeometry(8, 32, 24), new THREE.MeshStandardMaterial({ color: '#6d5a9a', roughness: .7 })); planet.position.set(45, -12, -110); root.add(planet);
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 18, 64), new THREE.MeshBasicMaterial({ color: '#b26bff', transparent: true, opacity: .35, side: THREE.DoubleSide })); ring.position.copy(planet.position); ring.rotation.x = 1.2; root.add(ring);
  // Caustic god-ray planes
  const rays: THREE.Mesh[] = []; const rayMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `varying vec2 vUv;uniform float uTime;void main(){float a=sin(vUv.x*20.+uTime)*.5+.5;a*=smoothstep(0.,.3,vUv.y)*smoothstep(1.,.4,vUv.y);gl_FragColor=vec4(.35,.25,.7,a*.12);}` });
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 90), rayMat.clone()); m.position.set((r() - .5) * 80, 30, -40 - r() * 80); m.rotation.z = (r() - .5) * .4; root.add(m); rays.push(m); }
  // Asteroids instanced
  const rockGeo = new THREE.IcosahedronGeometry(1, 1); const rockMat = new THREE.MeshStandardMaterial({ map: rockTexture(), roughness: 1 }); const count = engine.quality === 'high' ? 220 : 110;
  const asteroids = new THREE.InstancedMesh(rockGeo, rockMat, count); const dummy = new THREE.Object3D(); const rockData: { p: THREE.Vector3; rot: THREE.Euler; spin: THREE.Vector3; s: number }[] = [];
  for (let i = 0; i < count; i++) { const p = new THREE.Vector3((r() - .5) * 160, (r() - .5) * 90, (r() - .5) * 160); const s = .4 + r() * 2.4; rockData.push({ p, rot: new THREE.Euler(r() * 6, r() * 6, r() * 6), spin: new THREE.Vector3((r() - .5) * .4, (r() - .5) * .4, (r() - .5) * .4), s }); dummy.position.copy(p); dummy.scale.setScalar(s); dummy.updateMatrix(); asteroids.setMatrixAt(i, dummy.matrix); } root.add(asteroids);
  // Bubbles / plankton
  const pc = engine.quality === 'high' ? 1800 : 800; const pp = new Float32Array(pc * 3); for (let i = 0; i < pc; i++) pp.set([(r() - .5) * 120, (r() - .5) * 80, (r() - .5) * 120], i * 3); const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); const particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#c084fc', size: .12, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); root.add(particles);
  // Leviathans
  const leviathans: THREE.Group[] = []; for (let i = 0; i < 3; i++) { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 12), new THREE.MeshStandardMaterial({ color: '#1a1030', roughness: .8 })); body.scale.set(3, 1, 1); g.add(body); for (let k = 0; k < 5; k++) { const seg = new THREE.Mesh(new THREE.SphereGeometry(1.4 - k * .2, 12, 8), body.material); seg.position.x = -3 - k * 2; g.add(seg); } const eye = new THREE.Mesh(new THREE.SphereGeometry(.25, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, .5, 3), toneMapped: false })); eye.position.set(4, .5, 1); g.add(eye); g.position.set((r() - .5) * 120, (r() - .5) * 40, -60 - r() * 80); g.userData.speed = .5 + r(); root.add(g); leviathans.push(g); }
  // Hidden secrets
  const secretIds = ['ocean-shell', 'ocean-ring', 'ocean-eye', 'ocean-heart', 'ocean-door']; const secrets: THREE.Mesh[] = []; const found = new Set(store.get<string[]>('secrets', []));
  secretIds.forEach((id, i) => { if (found.has(id)) return; const geo = i === 0 ? new THREE.TorusKnotGeometry(.6, .2, 64, 8) : i === 1 ? new THREE.TorusGeometry(.7, .15, 12, 32) : i === 2 ? new THREE.SphereGeometry(.6, 16, 12) : i === 3 ? new THREE.OctahedronGeometry(.7) : new THREE.BoxGeometry(.9, 1.4, .2); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, .7, 3), toneMapped: false, transparent: true, opacity: .9 })); const a = i / 5 * Math.PI * 2; m.position.set(Math.cos(a) * (25 + i * 8), (r() - .5) * 30, Math.sin(a) * (25 + i * 8) - 30); m.userData.secret = id; root.add(m); secrets.push(m); });
  // Controls
  const keys = new Set<string>(); let yaw = 0, pitch = 0, dragging = false, lx = 0, ly = 0; const vel = new THREE.Vector3(); let boost = false; const touchMove = { x: 0, y: 0 };
  const kd = (e: KeyboardEvent) => { if (engine.activeId !== 'ocean') return; keys.add(e.code); if (e.code === 'KeyB' || e.code === 'ControlLeft') boost = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); };
  const ku = (e: KeyboardEvent) => { keys.delete(e.code); if (e.code === 'KeyB' || e.code === 'ControlLeft') boost = false; };
  const down = (e: PointerEvent) => { if (engine.activeId !== 'ocean') return; dragging = true; lx = e.clientX; ly = e.clientY; };
  const move = (e: PointerEvent) => { if (engine.activeId !== 'ocean') return; if (dragging) { yaw -= (e.clientX - lx) * .003; pitch = clamp(pitch - (e.clientY - ly) * .003, -1.4, 1.4); lx = e.clientX; ly = e.clientY; } else { const h = engine.pick(secrets, e); engine.renderer.domElement.style.cursor = h.length ? 'pointer' : 'grab'; } };
  const up = (e: PointerEvent) => { if (engine.activeId !== 'ocean') { dragging = false; return; } if (dragging && Math.abs(e.clientX - lx) < 4 && Math.abs(e.clientY - ly) < 4) { const h = engine.pick(secrets, e); if (h.length) { const m = h[0].object as THREE.Mesh; window.dispatchEvent(new CustomEvent('asad:secret', { detail: m.userData.secret })); root.remove(m); secrets.splice(secrets.indexOf(m), 1); } } dragging = false; };
  const onTouch = (e: Event) => { const d = (e as CustomEvent).detail; touchMove.x = d.x; touchMove.y = d.y; };
  addEventListener('keydown', kd); addEventListener('keyup', ku); addEventListener('asad:ocean-move', onTouch);
  const el = engine.renderer.domElement; el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
  // Quality / FPS
  let fpsAccum = 0, fpsFrames = 0, fps = 60, qualityMode: 'auto' | '1080' | '4k' = 'auto', lowTimer = 0;
  const applyQuality = () => { const dpr = devicePixelRatio || 1; let ratio = Math.min(dpr, 1.75); if (qualityMode === '1080') ratio = Math.min(dpr, 1080 / innerHeight, 1920 / innerWidth); if (qualityMode === '4k') ratio = Math.min(dpr, 2160 / innerHeight, 3840 / innerWidth); if (qualityMode === 'auto' && lowTimer > 3) ratio = Math.min(ratio, 1); engine.baseDpr = ratio; engine.renderer.setPixelRatio(ratio); engine.resize(); };
  const onQuality = (e: Event) => { qualityMode = (e as CustomEvent).detail; lowTimer = 0; applyQuality(); }; addEventListener('asad:ocean-quality', onQuality);
  let texUpgraded = false; const upgradeTextures = () => { if (texUpgraded) return; texUpgraded = true; const size = qualityMode === '4k' ? 4096 : 2048; const old = moonMat.map; moonMat.map = moonTexture(size); moonMat.needsUpdate = true; old?.dispose(); };
  const idle = (window as any).requestIdleCallback || ((fn: any) => setTimeout(fn, 2000)); if (engine.quality === 'high') idle(upgradeTextures);
  const euler = new THREE.Euler(0, 0, 0, 'YXZ'); const fwd = new THREE.Vector3(), right = new THREE.Vector3();
  return { root, cameraPos, lookAt, freeCamera: true,
    enter() { engine.camera.fov = 62; engine.camera.updateProjectionMatrix(); engine.camera.position.set(0, 0, 0); yaw = 0; pitch = 0; vel.set(0, 0, 0); engine.audio.setOcean(true); applyQuality(); el.style.cursor = 'grab'; },
    exit() { engine.audio.setOcean(false); engine.camera.fov = 48; engine.camera.updateProjectionMatrix(); keys.clear(); dragging = false; el.style.cursor = ''; engine.baseDpr = Math.min(devicePixelRatio, engine.quality === 'high' ? 1.75 : 1); engine.renderer.setPixelRatio(engine.baseDpr); engine.resize(); },
    update({ time, dt }: SceneContext) {
      euler.set(pitch, yaw, 0); engine.camera.quaternion.setFromEuler(euler);
      fwd.set(0, 0, -1).applyQuaternion(engine.camera.quaternion); right.set(1, 0, 0).applyQuaternion(engine.camera.quaternion);
      const accel = new THREE.Vector3(); const sp = (boost ? 34 : 14);
      if (keys.has('KeyW') || keys.has('ArrowUp')) accel.add(fwd); if (keys.has('KeyS') || keys.has('ArrowDown')) accel.sub(fwd); if (keys.has('KeyA') || keys.has('ArrowLeft')) accel.sub(right); if (keys.has('KeyD') || keys.has('ArrowRight')) accel.add(right); if (keys.has('Space')) accel.y += 1; if (keys.has('ShiftLeft') || keys.has('ShiftRight')) accel.y -= 1;
      accel.x += touchMove.x; accel.z += touchMove.y;
      if (accel.lengthSq() > 0) accel.normalize().multiplyScalar(sp);
      vel.addScaledVector(accel, dt); vel.multiplyScalar(Math.exp(-1.6 * dt)); engine.camera.position.addScaledVector(vel, dt);
      engine.camera.position.y += Math.sin(time * .8) * .002;
      const speed = vel.length(); const depth = Math.max(0, -engine.camera.position.y);
      engine.audio.updateOcean(speed, depth);
      const fog = engine.scene.fog as THREE.FogExp2; if (fog) fog.density = .012 + Math.min(depth / 400, .02);
      engine.post.uniforms.uGlitch.value = Math.min(speed / 60, .25);
      nebulaMat.uniforms.uTime.value = time; rays.forEach((m, i) => { (m.material as THREE.ShaderMaterial).uniforms.uTime.value = time + i; });
      moon.rotation.y = time * .02; planet.rotation.y = time * .05; ring.rotation.z = time * .02;
      for (let i = 0; i < count; i++) { const d = rockData[i]; d.rot.x += d.spin.x * dt; d.rot.y += d.spin.y * dt; dummy.position.copy(d.p); dummy.rotation.copy(d.rot); dummy.scale.setScalar(d.s); dummy.updateMatrix(); asteroids.setMatrixAt(i, dummy.matrix); } asteroids.instanceMatrix.needsUpdate = true;
      const pa = pg.getAttribute('position') as THREE.BufferAttribute; for (let i = 0; i < pc; i++) { let y = pa.getY(i) + dt * (.3 + (i % 5) * .1); if (y > 40) y = -40; pa.setY(i, y); } pa.needsUpdate = true;
      leviathans.forEach((g, i) => { g.position.x += Math.sin(time * .1 + i) * dt * g.userData.speed * 2; g.position.z += Math.cos(time * .07 + i) * dt * g.userData.speed; g.rotation.y = Math.sin(time * .1 + i) * .3; });
      secrets.forEach((s, i) => { s.rotation.y = time * .8 + i; s.rotation.x = time * .4; const sc = 1 + Math.sin(time * 2 + i) * .15; s.scale.setScalar(sc); });
      fpsAccum += dt; fpsFrames++; if (fpsAccum >= .5) { fps = fpsFrames / fpsAccum; fpsAccum = 0; fpsFrames = 0; window.dispatchEvent(new CustomEvent('asad:ocean-fps', { detail: Math.round(fps) })); if (qualityMode === 'auto') { if (fps < 45) lowTimer += .5; else lowTimer = Math.max(0, lowTimer - .5); if (lowTimer > 3) applyQuality(); } }
    },
    dispose() { removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('asad:ocean-move', onTouch); removeEventListener('asad:ocean-quality', onQuality); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); }
  };
}
