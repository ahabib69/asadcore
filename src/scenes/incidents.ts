import * as THREE from 'three';
import type { Engine, ExperienceScene, SceneContext } from '../core/engine';
import { CONFIG } from '../config';
import { makeStars, canvasTexture } from '../core/procedural';
import { makeSky } from '../shaders/sky';
import { damp } from '../utils/math';

function newspaper(i:number){const n=CONFIG.incidents[i];return canvasTexture((ctx,w,h)=>{ctx.fillStyle='#d8d0c0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#1a1410';ctx.font='700 54px Georgia, serif';ctx.textAlign='center';ctx.fillText('THE DHAKA CHRONICLE',w/2,70);ctx.font='16px Georgia';ctx.fillText('EST. 1874  ·  REAL & UNREAL  ·  VOL. '+n.id,w/2,100);ctx.fillRect(30,115,w-60,3);ctx.textAlign='left';ctx.font='700 58px Georgia, serif';const words=n.title.toUpperCase().split(' ');let line='',y=190;for(const word of words){if(ctx.measureText(line+word).width>w-80){ctx.fillText(line,40,y);y+=64;line=word+' ';}else line+=word+' ';}ctx.fillText(line,40,y);ctx.font='20px Georgia';ctx.fillStyle='#3a3028';let ty=y+60;const body=n.text;let bl='';for(const word of body.split(' ')){if(ctx.measureText(bl+word).width>w-90){ctx.fillText(bl,40,ty);ty+=28;bl=word+' ';}else bl+=word+' ';}ctx.fillText(bl,40,ty);ctx.strokeStyle='#8b0000';ctx.lineWidth=5;ctx.save();ctx.translate(w-170,h-90);ctx.rotate(-.18);ctx.strokeRect(-100,-35,200,60);ctx.fillStyle='#8b0000';ctx.font='700 30px JetBrains Mono';ctx.textAlign='center';ctx.fillText(n.tag,0,8);ctx.restore();for(let s=0;s<1200;s++){ctx.fillStyle=`rgba(40,20,10,${Math.random()*.12})`;ctx.fillRect(Math.random()*w,Math.random()*h,2,2);}},768,1024);}

export function create(engine:Engine):ExperienceScene {
  const root=new THREE.Group();root.add(makeSky(404).mesh,makeStars(900,404));root.add(new THREE.AmbientLight('#bba6d9',1.2));
  const cards:THREE.Mesh[]=[];const us:{uHover:{value:number};uTime:{value:number}}[]=[];
  CONFIG.incidents.forEach((n,i)=>{const tex=newspaper(i);const u={uHover:{value:0},uTime:{value:0}};us.push(u);const mat=new THREE.ShaderMaterial({uniforms:{...u,uMap:{value:tex}},side:THREE.DoubleSide,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D uMap;uniform float uHover,uTime;varying vec2 vUv;void main(){vec2 uv=vUv;float g=step(.94,fract(sin(floor(uTime*14.)*12.9898)*43758.5))*uHover;uv.x+=g*.02*sin(uv.y*80.);vec3 c=texture2D(uMap,uv).rgb;c.r=mix(c.r,texture2D(uMap,uv+vec2(.012,0.)).r,uHover);c.b=mix(c.b,texture2D(uMap,uv-vec2(.012,0.)).b,uHover);c*=1.-g*.25;gl_FragColor=vec4(c,1.);}`});const m=new THREE.Mesh(new THREE.PlaneGeometry(2.7,3.6),mat);m.position.set((i-1.5)*3.2,(i%2?.4:-.3),i%2?-1:0);m.rotation.z=(i-1.5)*.06;m.userData.index=i;root.add(m);cards.push(m);});
  let hovered=-1;const cameraPos=new THREE.Vector3(0,0,9);const lookAt=new THREE.Vector3(0,0,0);
  const move=(e:PointerEvent)=>{if(engine.activeId!=='incidents')return;const h=engine.pick(cards,e);hovered=h.length?(h[0].object as THREE.Mesh).userData.index:-1;};
  const click=(e:PointerEvent)=>{if(engine.activeId!=='incidents')return;const h=engine.pick(cards,e);if(h.length)window.dispatchEvent(new CustomEvent('asad:incident',{detail:(h[0].object as THREE.Mesh).userData.index}));};
  engine.renderer.domElement.addEventListener('pointermove',move);engine.renderer.domElement.addEventListener('click',click);
  return {root,cameraPos,lookAt,update({time,dt}:SceneContext){cards.forEach((c,i)=>{us[i].uTime.value=time;us[i].uHover.value=damp(us[i].uHover.value,hovered===i?1:0,8,dt);c.position.y=(i%2?.4:-.3)+Math.sin(time*.6+i)*.15;c.rotation.y=Math.sin(time*.3+i)*.08+(hovered===i?.15:0);});},dispose(){engine.renderer.domElement.removeEventListener('pointermove',move);engine.renderer.domElement.removeEventListener('click',click);}}
}
