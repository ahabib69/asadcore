import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { makeStatue, makeRuins, makePortal, makeFigure, makeDebris, makeStars, makeMoon } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { randomSeed } from '../utils/math';

export function create(engine:Engine):ExperienceScene {
  const root=new THREE.Group(); const pulse={value:0}; const seed=randomSeed();
  const sky=makeSky(seed,engine.quality==='high'?5:3); root.add(sky.mesh);
  const stars=makeStars(engine.quality==='high'?2200:1000,seed); root.add(stars);
  const moon=makeMoon(); moon.position.set(9.5,5.5,-13); root.add(moon);
  const statue=makeStatue(engine.quality==='high'?76:52,pulse); statue.position.set(2.3,2.15,-1.2); statue.scale.setScalar(1.72); statue.rotation.set(.04,-.38,-.07); root.add(statue);
  const ringMat=new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,.45,3.2),toneMapped:false,transparent:true,opacity:.9});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.05,.022,8,160),ringMat); ring.position.copy(statue.position); ring.rotation.set(1.18,.18,-.32); root.add(ring);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(3.25,.008,6,160),ringMat.clone()); ring2.position.copy(statue.position); ring2.rotation.copy(ring.rotation); root.add(ring2);
  const ruins=makeRuins(seed); root.add(ruins);
  const portal=makePortal(1.25); portal.position.set(2.05,-2.75,.4); root.add(portal);
  const figure=makeFigure(); figure.position.set(1.7,-2.55,3.1); figure.scale.setScalar(.9); root.add(figure);
  const debris=makeDebris(engine.quality==='high'?150:70,seed); root.add(debris.mesh);
  const amb=new THREE.AmbientLight('#8a7aa8',.55); root.add(amb);
  const key=new THREE.DirectionalLight('#efe8fa',3.1); key.position.set(-4,8,7); root.add(key);
  const rim=new THREE.DirectionalLight('#8b3dff',1.7); rim.position.set(5,3,-4); root.add(rim);
  const fill=new THREE.PointLight('#b26bff',14,18,2); fill.position.set(2,-1,3); root.add(fill);
  const crackLight=new THREE.PointLight('#a64dff',12,10,2); crackLight.position.set(2.3,2.5,2); root.add(crackLight);
  let hover=false; let ringSpeed=.12;
  const onMove=(e:PointerEvent)=>{if(engine.activeId!=='home')return;const hits=engine.pick([statue,ring],e);hover=hits.length>0;document.body.classList.toggle('statue-hover',hover);};
  engine.renderer.domElement.addEventListener('pointermove',onMove);
  const onClick=(e:PointerEvent)=>{if(engine.activeId!=='home')return;if(engine.pick([portal],e).length){engine.audio.uiSound('click');window.dispatchEvent(new CustomEvent('asad:navigate',{detail:'deep'}));}};
  engine.renderer.domElement.addEventListener('click',onClick);
  return {
    root, cameraPos:new THREE.Vector3(0,1.35,15), lookAt:new THREE.Vector3(.55,1.05,0),
    update({time,dt,pointer,audio}:SceneContext){pulse.value=audio.beat;sky.uniforms.uTime.value=time;sky.uniforms.uPulse.value=audio.level;(stars.material as THREE.ShaderMaterial).uniforms.uTime.value=time;(stars.material as THREE.ShaderMaterial).uniforms.uPulse.value=audio.level;
      ringSpeed+=((hover?.65:.12)-ringSpeed)*dt*3;ring.rotation.z+=dt*ringSpeed;ring2.rotation.z-=dt*ringSpeed*.6;ring.scale.setScalar(1+audio.beat*.025);ring2.scale.setScalar(1+audio.beat*.04);
      statue.position.y=2.15+Math.sin(time*.35)*.12;statue.rotation.y=-.38+pointer.x*.06;debris.update(time,pointer);fill.intensity=12+audio.beat*20;crackLight.intensity=8+audio.beat*16;
      const pm=(portal.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;pm.uniforms.uTime.value=time;pm.uniforms.uPulse.value=audio.beat;
    },
    dispose(){engine.renderer.domElement.removeEventListener('pointermove',onMove);engine.renderer.domElement.removeEventListener('click',onClick);}
  };
}
