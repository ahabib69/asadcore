import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { makeStars, makePortal } from '../core/procedural';
import { makeSky } from '../shaders/sky';
export function create(engine:Engine):ExperienceScene {
  const root=new THREE.Group();root.add(makeSky(777).mesh,makeStars(2000,777));
  const portal=makePortal(2.4);portal.position.set(0,-1.5,0);root.add(portal);
  const torus=new THREE.Mesh(new THREE.TorusKnotGeometry(1.2,.08,128,12),new THREE.MeshBasicMaterial({color:new THREE.Color(1.4,.5,2.8),toneMapped:false,wireframe:true}));torus.position.y=1;root.add(torus);
  root.add(new THREE.AmbientLight('#b26bff',1.5));const l=new THREE.PointLight('#f0b6ff',40,20);l.position.set(0,2,4);root.add(l);
  const cameraPos=new THREE.Vector3(0,1,8);const lookAt=new THREE.Vector3(0,.5,0);
  return {root,cameraPos,lookAt,enter(){engine.audio.choir();},update({time,audio}:SceneContext){torus.rotation.set(time*.2,time*.3,0);torus.scale.setScalar(1+audio.beat*.2);const m=(portal.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;m.uniforms.uTime.value=time;m.uniforms.uPulse.value=audio.beat;}}
}
