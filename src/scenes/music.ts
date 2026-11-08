import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { makeStars } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { rng } from '../utils/math';

export function create(engine:Engine):ExperienceScene {
  const root=new THREE.Group();const sky=makeSky(303);root.add(sky.mesh,makeStars(1400,303));
  const r=rng(99);const count=engine.quality==='high'?4500:2000;const pos=new Float32Array(count*3);const base=new Float32Array(count*3);
  for(let i=0;i<count;i++){const a=r()*Math.PI*2,u=r()*2-1,rad=2.6;const x=Math.cos(a)*Math.sqrt(1-u*u)*rad,y=u*rad,z=Math.sin(a)*Math.sqrt(1-u*u)*rad;pos.set([x,y,z],i*3);base.set([x,y,z],i*3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAudio:{value:0},uColor:{value:new THREE.Color('#b26bff')}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`uniform float uTime,uAudio;varying float vA;void main(){vec3 p=position;float n=sin(p.x*3.+uTime)*sin(p.y*3.-uTime*.7)*sin(p.z*3.+uTime*.5);p*=1.+n*.08+uAudio*.35;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(2.+uAudio*4.)*(18./-mv.z);vA=.5+uAudio;}`,
    fragmentShader:`uniform vec3 uColor;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.05,.5,d);gl_FragColor=vec4(uColor,a*vA);}`});
  const sphere=new THREE.Points(geo,mat);root.add(sphere);
  const ringCount=128;const rp=new Float32Array(ringCount*3);const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(rp,3));
  const ring=new THREE.LineLoop(rg,new THREE.LineBasicMaterial({color:new THREE.Color(1.4,.4,2.6),toneMapped:false,transparent:true,opacity:.9}));root.add(ring);
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.7,2),new THREE.MeshBasicMaterial({color:new THREE.Color(1.2,.3,2.5),wireframe:true,toneMapped:false}));root.add(core);
  const cameraPos=new THREE.Vector3(0,0,8);const lookAt=new THREE.Vector3(0,0,0);
  return {root,cameraPos,lookAt,update({time,audio}:SceneContext){sky.uniforms.uTime.value=time;mat.uniforms.uTime.value=time;mat.uniforms.uAudio.value=audio.level;sphere.rotation.y=time*.08;sphere.rotation.x=Math.sin(time*.1)*.2;core.rotation.set(time*.2,time*.3,0);core.scale.setScalar(1+audio.bassLevel*.5);
    const arr=rg.getAttribute('position') as THREE.BufferAttribute;for(let i=0;i<ringCount;i++){const a=i/ringCount*Math.PI*2;const f=audio.data[Math.floor(i/ringCount*audio.data.length)]/255;const rad=3.3+f*1.2;arr.setXYZ(i,Math.cos(a)*rad,Math.sin(a)*rad,Math.sin(a*3+time)*.2);}arr.needsUpdate=true;ring.rotation.z=time*.05;}}
}
