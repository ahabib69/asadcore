import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { gsap } from 'gsap';
import { PostShader } from '../shaders/post';
import { clamp, damp } from '../utils/math';
import { disposeObject } from './procedural';
import type { AudioEngine } from '../audio/engine';

export interface SceneContext { engine:Engine; audio:AudioEngine; pointer:THREE.Vector2; time:number; dt:number; }
export interface ExperienceScene { root:THREE.Group; cameraPos:THREE.Vector3; lookAt:THREE.Vector3; freeCamera?:boolean; update(ctx:SceneContext):void; enter?():void; exit?():void; dispose?():void; pointerDown?(e:PointerEvent):void; pointerMove?(e:PointerEvent):void; pointerUp?(e:PointerEvent):void; wheel?(e:WheelEvent):void; }
export type SceneId = 'home'|'history'|'videos'|'music'|'incidents'|'street'|'deep'|'secret'|'cinema'|'ocean';
const loaders: Record<SceneId,()=>Promise<any>> = {
  home:()=>import('../scenes/home'), history:()=>import('../scenes/history'), videos:()=>import('../scenes/videos'), music:()=>import('../scenes/music'), incidents:()=>import('../scenes/incidents'), street:()=>import('../scenes/street'), deep:()=>import('../scenes/deep'), secret:()=>import('../scenes/secret'), cinema:()=>import('../scenes/cinema'), ocean:()=>import('../scenes/ocean')
};

export class Engine {
  renderer:THREE.WebGLRenderer; scene=new THREE.Scene(); camera:THREE.PerspectiveCamera; composer:EffectComposer; bloom:UnrealBloomPass; post:ShaderPass;
  pointer=new THREE.Vector2(); smoothPointer=new THREE.Vector2(); raycaster=new THREE.Raycaster();
  active:ExperienceScene|null=null; activeId:SceneId='home'; audio:AudioEngine; clock=new THREE.Clock(); time=0; running=false; transitioning=false;
  quality:'high'|'low'='high'; baseDpr=1; frameTimes:number[]=[]; slowFrames=0; introDone=false; reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  onTransition:((id:SceneId)=>void)|null=null; onQuality:((q:string)=>void)|null=null;
  private raf=0; private cache=new Map<SceneId,ExperienceScene>(); private look=new THREE.Vector3(0,1,0); private targetPos=new THREE.Vector3(); private targetLook=new THREE.Vector3(); private frame=0; private accum=0;
  constructor(canvas:HTMLCanvasElement,audio:AudioEngine){
    this.audio=audio;
    const params=new URLSearchParams(location.search);
    const weak=params.get('quality')==='low' || (navigator.hardwareConcurrency||4)<=4 || (navigator as any).deviceMemory<4 || /Android|iPhone|iPad/i.test(navigator.userAgent);
    this.quality=weak?'low':'high'; this.baseDpr=Math.min(devicePixelRatio,weak?1:1.75);
    (window as any).__asadEngine=this;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:!weak,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(this.baseDpr); this.renderer.setSize(innerWidth,innerHeight); this.renderer.toneMapping=THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure=1.05; this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,200); this.camera.position.set(0,1.5,15);
    this.scene.background=new THREE.Color('#05030a'); this.scene.fog=new THREE.FogExp2('#080412',.018);
    this.composer=new EffectComposer(this.renderer); this.composer.addPass(new RenderPass(this.scene,this.camera));
    this.bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.85,.65,.32); this.bloom.enabled=!weak; this.composer.addPass(this.bloom);
    this.post=new ShaderPass(PostShader); this.post.uniforms.uGrain.value=weak?.012:.025; this.composer.addPass(this.post); this.composer.addPass(new OutputPass());
    addEventListener('resize',()=>this.resize());
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.running=false;document.body.classList.add('no-webgl');});
    canvas.addEventListener('webglcontextrestored',()=>{this.running=true;document.body.classList.remove('no-webgl');});
  }
  async load(id:SceneId){let s=this.cache.get(id);if(!s){const mod=await loaders[id]();s=mod.create(this) as ExperienceScene;this.cache.set(id,s);}return s;}
  async setScene(id:SceneId,instant=false){if(this.transitioning)return;this.transitioning=true;this.onTransition?.(id);this.audio.uiSound('transition');
    const swap=async()=>{const next=await this.load(id);if(this.active){this.active.exit?.();this.scene.remove(this.active.root);}this.scene.fog=new THREE.FogExp2(id==='ocean'?'#0a0618':'#080412',id==='street'?.004:id==='ocean'?.012:.018);this.active=next;this.activeId=id;this.scene.add(next.root);next.enter?.();this.targetPos.copy(next.cameraPos);this.targetLook.copy(next.lookAt);if(instant){this.camera.position.copy(this.targetPos);this.look.copy(this.targetLook);}this.post.uniforms.uGlitch.value=.5;gsap.to(this.post.uniforms.uGlitch,{value:0,duration:.7});};
    if(instant){await swap();this.post.uniforms.uWarp.value=0;this.transitioning=false;return;}
    const d1=this.quality==='low'?.18:.42,d2=this.quality==='low'?.3:.75;
    await new Promise<void>(res=>{gsap.to(this.post.uniforms.uWarp,{value:1,duration:d1,ease:'power2.in',onComplete:async()=>{await swap();gsap.to(this.post.uniforms.uWarp,{value:0,duration:d2,ease:'power3.out',onComplete:()=>{this.transitioning=false;res();}});}});});
  }
  intro(){const cam=this.camera;const dur=this.reducedMotion?.1:(this.quality==='low'?1.4:3.2);cam.position.set(1.8,-1.2,3.2);this.look.set(1.8,1.5,0);const tl=gsap.timeline({onComplete:()=>{this.introDone=true;document.body.classList.add('entered');}});tl.to(cam.position,{x:0,y:1.4,z:15,duration:dur,ease:'power3.inOut'},0);tl.to(this.look,{x:.5,y:1.2,z:0,duration:dur*.94,ease:'power2.inOut'},0);tl.fromTo(this.post.uniforms.uWarp,{value:.8},{value:0,duration:dur*.75,ease:'power2.out'},0);}
  start(){if(this.running)return;this.running=true;this.clock.start();const loop=()=>{if(!this.running)return;this.raf=requestAnimationFrame(loop);const dt=Math.min(this.clock.getDelta(),.1);this.time+=dt;this.frameTimes.push(dt);if(this.frameTimes.length>120){const avg=this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length;this.frameTimes=[];if(avg>.026&&this.quality==='high'){this.slowFrames++;if(this.slowFrames>=2){this.quality='low';this.baseDpr=1;this.renderer.setPixelRatio(1);this.bloom.enabled=false;this.resize();this.onQuality?.('ECO');}}}
      this.smoothPointer.x=damp(this.smoothPointer.x,this.pointer.x,4,dt);this.smoothPointer.y=damp(this.smoothPointer.y,this.pointer.y,4,dt);
      const ctx={engine:this,audio:this.audio,pointer:this.smoothPointer,time:this.time,dt};
      if(this.active){this.active.update(ctx);if(this.active.freeCamera){/* scene owns the camera */}else if(this.introDone&&!this.transitioning){this.targetPos.copy(this.active.cameraPos);this.targetLook.copy(this.active.lookAt);const p=this.smoothPointer;const par=this.activeId==='deep'?1.2:.45;this.camera.position.x=damp(this.camera.position.x,this.targetPos.x+p.x*par,3,dt);this.camera.position.y=damp(this.camera.position.y,this.targetPos.y+p.y*par*.6,3,dt);this.camera.position.z=damp(this.camera.position.z,this.targetPos.z,3,dt);this.look.lerp(this.targetLook,1-Math.exp(-3*dt));this.camera.lookAt(this.look);}else{this.camera.lookAt(this.look);}}
      this.post.uniforms.uTime.value=this.time;this.bloom.strength=(this.quality==='high'?.72:.4)+this.audio.beat*.5+(this.activeId==='deep'?.25:0);
      // In ECO mode render at ~30fps to leave headroom on weak GPUs / software renderers.
      this.frame++;this.accum+=dt;if(this.quality==='high'||this.accum>=1/30){this.accum=0;this.composer.render();}};loop();}
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.composer.setSize(innerWidth,innerHeight);this.post.uniforms.uResolution.value.set(innerWidth,innerHeight);}
  private pickNdc=new THREE.Vector2();
  pick(objects:THREE.Object3D[],e:PointerEvent){const r=this.renderer.domElement.getBoundingClientRect();this.pickNdc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);this.raycaster.setFromCamera(this.pickNdc,this.camera);return this.raycaster.intersectObjects(objects,true);}
  dispose(){this.running=false;cancelAnimationFrame(this.raf);this.cache.forEach(s=>{s.dispose?.();disposeObject(s.root);});this.composer.dispose();this.renderer.dispose();}
}
