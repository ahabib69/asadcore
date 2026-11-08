import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { CONFIG } from '../config';
import { makeStars, canvasTexture } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { rng, clamp } from '../utils/math';

export function create(engine:Engine):ExperienceScene {
  const root=new THREE.Group(); const sky=makeSky(1971); root.add(sky.mesh,makeStars(1200,1971));
  root.add(new THREE.AmbientLight('#7a6a9f',.9)); const key=new THREE.DirectionalLight('#d8c6ff',2.4);key.position.set(-3,6,5);root.add(key);
  const r=rng(1608); const stone=new THREE.MeshStandardMaterial({color:'#3a3046',roughness:.9}); const glow=new THREE.MeshBasicMaterial({color:new THREE.Color(1.2,.35,2.4),toneMapped:false});
  const groups:THREE.Group[]=[];
  CONFIG.history.forEach((h,i)=>{
    const g=new THREE.Group(); const z=-i*14; g.position.set(i%2?3:-3,-1,z);
    // Old-Dhaka silhouette: domes, arches, minarets, stepped plinths.
    const base=new THREE.Mesh(new THREE.BoxGeometry(6,.5,3),stone);base.position.y=-1.5;g.add(base);
    const body=new THREE.Mesh(new THREE.BoxGeometry(4.6,2.4,2.2),stone);body.position.y=-.1;g.add(body);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(1.25,24,16,0,Math.PI*2,0,Math.PI/2),stone);dome.position.y=1.1;g.add(dome);
    const finial=new THREE.Mesh(new THREE.ConeGeometry(.08,.7,8),glow);finial.position.y=2.6;g.add(finial);
    for(const x of [-2.5,2.5]){const tower=new THREE.Mesh(new THREE.CylinderGeometry(.28,.36,3.6,10),stone);tower.position.set(x,.2,0);g.add(tower);const cap=new THREE.Mesh(new THREE.SphereGeometry(.4,12,8,0,Math.PI*2,0,Math.PI/2),stone);cap.position.set(x,2,0);g.add(cap);}
    for(let a=0;a<5;a++){const arch=new THREE.Mesh(new THREE.TorusGeometry(.34,.07,6,14,Math.PI),glow);arch.position.set(-1.7+a*.85,-.3,1.13);g.add(arch);const win=new THREE.Mesh(new THREE.PlaneGeometry(.5,.8),new THREE.MeshBasicMaterial({color:'#120a20'}));win.position.set(-1.7+a*.85,-.7,1.12);g.add(win);}
    const tex=canvasTexture((ctx,w,hh)=>{ctx.clearRect(0,0,w,hh);ctx.font='700 120px Orbitron, sans-serif';ctx.textAlign='center';ctx.fillStyle='#d9b6ff';ctx.shadowColor='#8b3dff';ctx.shadowBlur=30;ctx.fillText(h.year,w/2,150);ctx.font='24px JetBrains Mono, monospace';ctx.fillStyle='#b8a6cc';ctx.fillText(h.era,w/2,205);},512,256);
    const label=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.7),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));label.position.set(0,3.6,0);g.add(label);
    const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.18),glow);marker.position.set(0,-1.1,2);g.add(marker);
    for(let j=0;j<8;j++){const shard=new THREE.Mesh(new THREE.BoxGeometry(.2+r()*.5,.15+r()*.4,.2),stone);shard.position.set((r()-.5)*8,(r()-.5)*5,(r()-.5)*4);shard.rotation.set(r()*3,r()*3,r()*3);g.add(shard);}
    root.add(g);groups.push(g);
  });
  const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-1.1,4),new THREE.Vector3(0,-1.1,-80)]);
  root.add(new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:'#8b3dff',transparent:true,opacity:.5})));
  let progress=0; const cameraPos=new THREE.Vector3(0,1.5,8); const lookAt=new THREE.Vector3(0,1,-4);
  const onScroll=(e:Event)=>{const el=e.target as HTMLElement;progress=clamp(el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight),0,1);};
  return {root,cameraPos,lookAt,
    enter(){const el=document.querySelector('.history-scroll');el?.addEventListener('scroll',onScroll);progress=0;},
    exit(){document.querySelector('.history-scroll')?.removeEventListener('scroll',onScroll);},
    update({time,audio}:SceneContext){sky.uniforms.uTime.value=time;const z=8-progress*76;cameraPos.set(Math.sin(progress*6)*.8,1.5+Math.sin(progress*3)*.4,z);lookAt.set(0,1,z-12);groups.forEach((g,i)=>{g.rotation.y=Math.sin(time*.2+i)*.05;g.position.y=-1+Math.sin(time*.4+i)*.15;});}
  };
}
