import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { CONFIG } from '../config';
import { makeStatue, makeRuins, makePortal, makeStars } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { portalMaterial } from '../shaders/portal';
import { rng, randomSeed, clamp, damp } from '../utils/math';
import { gsap } from 'gsap';

export function create(engine:Engine):ExperienceScene {
  const root=new THREE.Group();const seed=randomSeed();const r=rng(seed);
  const sky=makeSky(seed);root.add(sky.mesh);root.add(makeStars(1600,seed));
  root.add(new THREE.AmbientLight('#7a6a9f',1.1));const key=new THREE.PointLight('#b26bff',60,60,1.6);key.position.set(0,0,5);root.add(key);const dir=new THREE.DirectionalLight('#c4b5fd',1.4);dir.position.set(3,6,4);root.add(dir);
  const pulse={value:0};
  // Tunnel rings recycled along -Z.
  const rings:THREE.Mesh[]=[];const ringMat=new THREE.MeshBasicMaterial({color:new THREE.Color(1.1,.3,2.4),toneMapped:false,transparent:true,opacity:.55});
  for(let i=0;i<34;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(5+r()*3,.025+r()*.035,6,80),ringMat.clone());m.position.set((r()-.5)*2,(r()-.5)*2,-i*9);m.rotation.set(r()*.4,r()*.4,r()*6);root.add(m);rings.push(m);}
  // Nebula tunnel: dark, subtle swirling walls (not additive wash).
  const tunnelMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uColor:{value:new THREE.Color('#6d28d9')},uPulse:{value:0}},side:THREE.BackSide,transparent:true,depthWrite:false,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime,uPulse;uniform vec3 uColor;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 p=vec2(vUv.x*8.,vUv.y*40.-uTime*.6);float f=n(p)*.6+n(p*2.3)*.3+n(p*5.)*.1;float veins=smoothstep(.55,.85,f);float edge=smoothstep(.0,.15,vUv.y)*smoothstep(1.,.85,vUv.y);vec3 col=uColor*(.06+veins*.5)*(1.+uPulse*.6);gl_FragColor=vec4(col,edge*.85);}`});
  const tunnel=new THREE.Mesh(new THREE.CylinderGeometry(14,14,260,32,1,true),tunnelMat);tunnel.rotation.x=Math.PI/2;tunnel.position.z=-110;root.add(tunnel);
  const ruins:THREE.Group[]=[];for(let i=0;i<5;i++){const g=makeRuins(seed+i);g.scale.setScalar(.5+r()*.4);g.position.set((r()-.5)*14,(r()-.5)*10,-30-i*45);g.rotation.set(r()*6,r()*6,r()*6);root.add(g);ruins.push(g);}
  const statues:THREE.Group[]=[];for(let i=0;i<3;i++){const s=makeStatue(44,pulse);s.scale.setScalar(1.2+r());s.position.set((r()-.5)*16,(r()-.5)*10,-50-i*70);s.rotation.set(r(),r()*6,r());root.add(s);statues.push(s);}
  // Particle stream.
  const pc=engine.quality==='high'?2600:1200;const pp=new Float32Array(pc*3);for(let i=0;i<pc;i++){const a=r()*6.28,rad=2+r()*11;pp.set([Math.cos(a)*rad,Math.sin(a)*rad,-r()*240],i*3);}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:'#c084fc',size:.05,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));root.add(particles);
  // Rare glowing doors.
  const doors:THREE.Group[]=[];for(let i=0;i<3;i++){if(r()>.45){const d=makePortal(.9);d.position.set((r()-.5)*8,(r()-.5)*6,-40-r()*160);d.userData.secret=true;root.add(d);doors.push(d);}}
  // Giant eye in the void.
  const eye=new THREE.Group();const sclera=new THREE.Mesh(new THREE.SphereGeometry(2.4,32,16),new THREE.MeshStandardMaterial({color:'#1a1026',emissive:'#3b0a6b',emissiveIntensity:.6,roughness:.3}));sclera.scale.set(1.6,.8,.5);eye.add(sclera);const iris=new THREE.Mesh(new THREE.CircleGeometry(.9,48),new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,.4,3),toneMapped:false}));iris.position.z=1.21;eye.add(iris);const pupil=new THREE.Mesh(new THREE.CircleGeometry(.35,32),new THREE.MeshBasicMaterial({color:'#05030a'}));pupil.position.z=1.22;eye.add(pupil);eye.position.set(0,0,-210);eye.scale.y=.02;root.add(eye);
  // Core.
  const core=new THREE.Group();const coreSphere=new THREE.Mesh(new THREE.IcosahedronGeometry(2,3),new THREE.MeshBasicMaterial({color:new THREE.Color(2,1,3),wireframe:true,toneMapped:false}));core.add(coreSphere);const coreLight=new THREE.PointLight('#f0b6ff',0,60);core.add(coreLight);core.position.z=-260;root.add(core);
  // Shooting lights.
  const shooters:THREE.Mesh[]=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,3,4),new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,.8,3),toneMapped:false}));m.rotation.z=Math.PI/2;m.position.set((r()-.5)*20,(r()-.5)*14,-r()*200);root.add(m);shooters.push(m);}
  let depth=0,speed=8,targetSpeed=8,holding=false,dragY=0,dragging=false,lastY=0,layerIndex=0,coreReached=false,whisperTimer=3,doorTimer=0;
  const cameraPos=new THREE.Vector3(0,0,6);const lookAt=new THREE.Vector3(0,0,-20);
  const layerFor=(d:number)=>{let i=0;CONFIG.layers.forEach((l,j)=>{if(d>=l.at)i=j;});return i;};
  const setLayer=(i:number)=>{layerIndex=i;const l=CONFIG.layers[i];const c=new THREE.Color(l.color);ringMat.color.copy(c).multiplyScalar(1.6);rings.forEach(r=>(r.material as THREE.MeshBasicMaterial).color.copy(c).multiplyScalar(1.6));(tunnelMat.uniforms.uColor.value as THREE.Color).copy(c);const fog=engine.scene.fog as THREE.FogExp2;if(fog){fog.color.copy(c).multiplyScalar(.05);fog.density=.018+i*.004;}engine.audio.setMood(.15+i*.16);window.dispatchEvent(new CustomEvent('asad:layer',{detail:i}));};
  const down=(e:PointerEvent)=>{if(engine.activeId!=='deep')return;holding=true;dragging=true;lastY=e.clientY;targetSpeed=22;};
  const move=(e:PointerEvent)=>{if(engine.activeId!=='deep')return;if(dragging){const dy=lastY-e.clientY;targetSpeed=clamp(targetSpeed+dy*.08,2,45);lastY=e.clientY;}const hits=engine.pick(doors,e);engine.renderer.domElement.style.cursor=hits.length?'pointer':'';};
  const up=(e:PointerEvent)=>{if(engine.activeId!=='deep'){holding=false;dragging=false;return;}const wasDrag=dragging;holding=false;dragging=false;targetSpeed=8;if(!wasDrag)return;const hits=engine.pick(doors,e);if(hits.length){window.dispatchEvent(new CustomEvent('asad:secret',{detail:'door'}));window.dispatchEvent(new CustomEvent('asad:navigate',{detail:'secret'}));}};
  const wheel=(e:WheelEvent)=>{targetSpeed=clamp(targetSpeed+e.deltaY*.03,2,45);};
  const el=engine.renderer.domElement;el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointerleave',up);
  return {root,cameraPos,lookAt,wheel,
    enter(){depth=0;speed=8;targetSpeed=8;coreReached=false;setLayer(0);window.dispatchEvent(new CustomEvent('asad:depth',{detail:{depth:0,layer:0}}));},
    exit(){holding=false;dragging=false;engine.audio.setMood(.12);},
    update({time,dt,audio}:SceneContext){
      speed=damp(speed,targetSpeed,2,dt);if(!coreReached)depth+=speed*dt;else depth=1000;
      const li=layerFor(depth);if(li!==layerIndex)setLayer(li);
      window.dispatchEvent(new CustomEvent('asad:depth',{detail:{depth,layer:layerIndex}}));
      const moveZ=speed*dt;
      rings.forEach((m,i)=>{m.position.z+=moveZ;if(m.position.z>10)m.position.z-=306;m.rotation.z+=dt*(.1+i*.01);const s=1+audio.beat*.06;m.scale.setScalar(s);});
      ruins.forEach(g=>{g.position.z+=moveZ*.8;if(g.position.z>15)g.position.z-=240;g.rotation.y+=dt*.05;});
      statues.forEach(s=>{s.position.z+=moveZ*.7;if(s.position.z>15)s.position.z-=260;s.rotation.y+=dt*.08;});
      doors.forEach(d=>{d.position.z+=moveZ;if(d.position.z>12)d.position.z-=240;const pm=(d.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;pm.uniforms.uTime.value=time;});
      const pa=pg.getAttribute('position') as THREE.BufferAttribute;for(let i=0;i<pc;i++){let z=pa.getZ(i)+moveZ*1.6;if(z>8)z-=248;pa.setZ(i,z);}pa.needsUpdate=true;
      shooters.forEach((s,i)=>{s.position.x+=dt*(12+i*3);s.position.z+=moveZ;if(s.position.x>15||s.position.z>10){s.position.x=-15;s.position.z=-50-Math.random()*180;s.position.y=(Math.random()-.5)*14;}});
      tunnelMat.uniforms.uTime.value=time;tunnelMat.uniforms.uPulse.value=audio.beat;sky.uniforms.uTime.value=time;
      // Eye opens between 700-900m.
      const eyeOpen=depth>680&&depth<920?Math.sin(clamp((depth-680)/60,0,1)*Math.PI/2)*Math.sin(clamp((920-depth)/60,0,1)*Math.PI/2):0;eye.scale.y=.02+eyeOpen*.98;eye.position.z=-210+depth*.18;iris.rotation.z=time*.1;
      if(depth>=1000&&!coreReached){coreReached=true;targetSpeed=0;speed=0;coreLight.intensity=120;audio.choir();audio.setMood(1);window.dispatchEvent(new CustomEvent('asad:secret',{detail:'core'}));window.dispatchEvent(new CustomEvent('asad:core'));gsap.fromTo(core.scale,{x:.01,y:.01,z:.01},{x:1,y:1,z:1,duration:3,ease:'power3.out'});}
      core.position.z=-260+depth*.24;core.rotation.y=time*.2;core.rotation.x=time*.1;coreSphere.scale.setScalar(1+audio.beat*.2);
      whisperTimer-=dt;if(whisperTimer<=0&&depth>30&&!coreReached){whisperTimer=5+Math.random()*7;window.dispatchEvent(new CustomEvent('asad:whisper',{detail:CONFIG.whispers[Math.floor(Math.random()*CONFIG.whispers.length)]}));}
      key.intensity=50+audio.beat*60;pulse.value=audio.beat;
    },
    dispose(){el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointerleave',up);}
  };
}
