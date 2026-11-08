import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ellipsoid, smin, rng, clamp } from '../utils/math';
import { noiseGLSL } from '../shaders/noise.glsl';
import { portalMaterial } from '../shaders/portal';

export function marbleMaterial(pulse = { value: 0 }) {
  const mat = new THREE.MeshStandardMaterial({ color: '#b4aec0', roughness: .72, metalness: .06 });
  mat.onBeforeCompile = shader => {
    shader.uniforms.uPulse = pulse;
    shader.vertexShader = 'varying vec3 vLocalPos;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalPos=position;');
    shader.fragmentShader = 'varying vec3 vLocalPos; uniform float uPulse;\n' + noiseGLSL + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      vec3 mp=vLocalPos*4.; float vein=fbm(mp+fbm(mp*2.)*2.);
      diffuseColor.rgb*=mix(.42,1.25,vein);
      vec2 vv=voronoi(vLocalPos.xy*3.2+vLocalPos.z*1.1);
      float crack=1.-smoothstep(.008,.035,vv.y-vv.x);
      crack*=smoothstep(.48,.72,fbm(vLocalPos*2.2+7.));
      float tear=exp(-pow((vLocalPos.x-.28)*14.,2.))*smoothstep(.1,.5,vLocalPos.y)*.7;
      vec3 glow=vec3(.48,.10,1.);
      diffuseColor.rgb=mix(diffuseColor.rgb,glow*.3,crack*.7);
      totalEmissiveRadiance+=glow*(crack*2.4+tear)*(1.+uPulse*1.5);
    `);
  };
  return mat;
}

function headSDF(x: number, y: number, z: number) {
  let d = ellipsoid(x,y,z,0,.5,-.05,1.02,1.22,.92);
  d = smin(d, ellipsoid(x,y,z,0,-.5,.12,.76,.85,.7), .22);
  d = smin(d, ellipsoid(x,y,z,0,-.92,.48,.42,.3,.34), .18);
  d = smin(d, ellipsoid(x,y,z,-.52,-.12,.5,.38,.42,.32), .14);
  d = smin(d, ellipsoid(x,y,z,.52,-.12,.5,.38,.42,.32), .14);
  d = smin(d, ellipsoid(x,y,z,0,.42,.68,.78,.2,.28), .12);
  d = smin(d, ellipsoid(x,y,z,0,.12,.88,.17,.48,.22), .1);
  d = smin(d, ellipsoid(x,y,z,0,-.14,1.04,.23,.17,.24), .09);
  d = smin(d, ellipsoid(x,y,z,-.17,-.22,.94,.12,.1,.14), .07);
  d = smin(d, ellipsoid(x,y,z,.17,-.22,.94,.12,.1,.14), .07);
  d = smin(d, ellipsoid(x,y,z,0,-.5,.82,.34,.09,.15), .08);
  d = smin(d, ellipsoid(x,y,z,0,-.61,.8,.29,.09,.14), .08);
  d = smin(d, ellipsoid(x,y,z,-.98,.05,-.02,.17,.38,.24), .12);
  d = smin(d, ellipsoid(x,y,z,.98,.05,-.02,.17,.38,.24), .12);
  const eyeL = ellipsoid(x,y,z,-.4,.24,.82,.27,.15,.22);
  const eyeR = ellipsoid(x,y,z,.4,.24,.82,.27,.15,.22);
  d = Math.max(d, -Math.min(eyeL, eyeR) + .015);
  d = Math.max(d, -ellipsoid(x,y,z,0,-.56,.94,.3,.025,.12));
  d = Math.max(d, -ellipsoid(x,y,z,-.95,.65,.2,.38,.5,.42));
  d = Math.max(d, -ellipsoid(x,y,z,.7,-.85,.3,.3,.4,.4));
  const neck = Math.max(Math.hypot(x*.95,z+.12)-.53, -1.75-y, y+1.0);
  d = smin(d, neck, .18);
  d += Math.sin(x*13.+y*7.)*Math.sin(z*11.-y*9.)*.012;
  return d;
}

export function makeStatue(res = 72, pulse = { value: 0 }) {
  const group = new THREE.Group();
  const mat = marbleMaterial(pulse);
  const mc = new MarchingCubes(res, mat, false, false, 90000);
  mc.isolation = 0;
  const r = rng(421);
  for (let z=0; z<res; z++) for (let y=0; y<res; y++) for (let x=0; x<res; x++) {
    const px=(x/res*2-1)*1.45, py=(y/res*2-1)*1.95, pz=(z/res*2-1)*1.45;
    mc.field[z*res*res+y*res+x] = -headSDF(px,py,pz);
  }
  mc.update();
  const count = mc.geometry.drawRange.count;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute((mc.geometry.getAttribute('position').array as Float32Array).slice(0,count*3),3));
  geo.setAttribute('normal', new THREE.BufferAttribute((mc.geometry.getAttribute('normal').array as Float32Array).slice(0,count*3),3));
  geo.computeBoundingSphere();
  mc.geometry.dispose();
  const head = new THREE.Mesh(geo, mat);
  head.scale.set(1.45,1.95,1.45);
  group.add(head);
  // Sculpted curls: instanced marble toroids over the scalp.
  const curlGeo = new THREE.TorusKnotGeometry(.13,.055,32,5,2,3);
  const curls = new THREE.InstancedMesh(curlGeo, mat, 105);
  const dummy = new THREE.Object3D();
  for (let i=0;i<105;i++) {
    const a=r()*Math.PI*2, u=r()*.95;
    const rad=Math.sqrt(1-u*u);
    dummy.position.set(Math.cos(a)*rad*1.02, .55+u*1.18, Math.sin(a)*rad*.92-.08);
    if (dummy.position.z>.55 && dummy.position.y<1.15) dummy.position.z-=.7;
    dummy.rotation.set(r()*6,r()*6,r()*6); dummy.scale.setScalar(.75+r()*.8); dummy.updateMatrix(); curls.setMatrixAt(i,dummy.matrix);
  }
  group.add(curls);
  const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8,.35,4), toneMapped: false });
  for (const x of [-.4,.4]) { const eye=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),eyeMat); eye.position.set(x,.23,.79); eye.scale.set(1.5,.55,.5); group.add(eye); }
  return group;
}

export function makeRuins(seed = 1) {
  const group = new THREE.Group(); const r=rng(seed);
  const stone = new THREE.MeshStandardMaterial({ color:'#292431', roughness:.95, metalness:.08 });
  const dark = new THREE.MeshStandardMaterial({ color:'#14101d', roughness:1 });
  const box = new THREE.BoxGeometry(1,1,1);
  const archGeo = new THREE.TorusGeometry(1,.22,6,18,Math.PI);
  const colGeo = new THREE.CylinderGeometry(.2,.26,1,8);
  function arch(x:number,y:number,z:number,s:number,rot=0) {
    const g=new THREE.Group();
    for (const side of [-1,1]) { const c=new THREE.Mesh(colGeo,stone); c.position.set(side*1.1,1.25,0); c.scale.y=2.5; g.add(c);
      const base=new THREE.Mesh(box,stone); base.position.set(side*1.1,.12,0); base.scale.set(.65,.25,.65); g.add(base);
      const cap=new THREE.Mesh(box,stone); cap.position.set(side*1.1,2.5,0); cap.scale.set(.6,.2,.6); g.add(cap); }
    const a=new THREE.Mesh(archGeo,stone); a.position.y=2.5; g.add(a);
    const top=new THREE.Mesh(box,dark); top.position.set(0,3.65,0); top.scale.set(2.8,.3,.5); top.rotation.z=(r()-.5)*.06; g.add(top);
    for(let i=0;i<4;i++){const b=new THREE.Mesh(box,stone);b.position.set((r()-.5)*2.6,3.85+r()*.2,(r()-.5)*.4);b.scale.set(.3+r()*.5,.2+r()*.4,.4);b.rotation.z=r()*.4;g.add(b);}
    g.position.set(x,y,z);g.scale.setScalar(s);g.rotation.y=rot;group.add(g);
  }
  arch(-5,-3,-3,1.35,.3); arch(-2.8,-3,-5,1.1,.15); arch(5.8,-3,-4,1.5,-.4); arch(8,-3,-7,1.2,-.5); arch(-8,-3,-8,1.6,.4);
  for(let i=0;i<15;i++){const b=new THREE.Mesh(box,stone);b.position.set(-1.5+i*.32,-3.2+i*.13,5-i*.55);b.scale.set(5-i*.12,.22,.65);b.rotation.y=-.08;group.add(b);}
  for(let i=0;i<26;i++){const b=new THREE.Mesh(box,dark);b.position.set((r()-.5)*22,-3.5+r()*.4,(r()-.5)*12);b.scale.set(.4+r()*1.5,.3+r()*.8,.4+r()*1.2);b.rotation.set(r(),r()*6,r());group.add(b);}
  return group;
}

export function makePortal(scale=1) {
  const g=new THREE.Group();
  const shape=new THREE.Shape(); shape.moveTo(-.65,0);shape.lineTo(-.65,1.5);shape.absarc(0,1.5,.65,Math.PI,0,true);shape.lineTo(.65,0);shape.closePath();
  const door=new THREE.Mesh(new THREE.ShapeGeometry(shape),portalMaterial()); g.add(door);
  const frameMat=new THREE.MeshBasicMaterial({color:new THREE.Color(1.2,.25,3),toneMapped:false});
  const frame=new THREE.Mesh(new THREE.TorusGeometry(.68,.045,8,32,Math.PI),frameMat);frame.position.y=1.5;g.add(frame);
  for(const x of [-.68,.68]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1.5,8),frameMat);p.position.set(x,.75,0);g.add(p);}
  const light=new THREE.PointLight('#9b4dff',18,9,2);light.position.set(0,1,.6);g.add(light);
  g.scale.setScalar(scale); return g;
}

export function makeFigure() {
  const g=new THREE.Group(); const mat=new THREE.MeshStandardMaterial({color:'#09070e',roughness:1});
  const cloak=new THREE.Mesh(new THREE.ConeGeometry(.22,.85,12,1,true),mat);cloak.position.y=.43;g.add(cloak);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),mat);hood.position.y=.9;g.add(hood);
  const rim=new THREE.PointLight('#b26bff',2,2);rim.position.set(0,.6,-.3);g.add(rim); return g;
}

export function makeDebris(count=130,seed=7) {
  const r=rng(seed); const geo=new THREE.DodecahedronGeometry(1,0);
  const mat=new THREE.MeshStandardMaterial({color:'#3b3348',roughness:.85,metalness:.15});
  const mesh=new THREE.InstancedMesh(geo,mat,count); const data=[] as {p:THREE.Vector3;s:number;r:THREE.Euler;v:number}[];
  const d=new THREE.Object3D();
  for(let i=0;i<count;i++){const p=new THREE.Vector3((r()-.5)*24,(r()-.5)*15,(r()-.5)*16-2);const s=.035+Math.pow(r(),3)*.38;data.push({p,s,r:new THREE.Euler(r()*6,r()*6,r()*6),v:.1+r()*.4});d.position.copy(p);d.scale.setScalar(s);d.rotation.copy(data[i].r);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);}
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return {mesh,data,update(t:number,pointer:THREE.Vector2){for(let i=0;i<count;i++){const a=data[i];d.position.copy(a.p);d.position.y+=Math.sin(t*a.v+i)*.25;d.position.x+=pointer.x*.3*a.s;d.position.z+=pointer.y*.2;d.rotation.set(a.r.x+t*a.v*.2,a.r.y+t*a.v*.15,a.r.z);d.scale.setScalar(a.s);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);}mesh.instanceMatrix.needsUpdate=true;}};
}

export function makeStars(count=1800,seed=9) {
  const r=rng(seed); const pos=new Float32Array(count*3); const sizes=new Float32Array(count);
  for(let i=0;i<count;i++){const a=r()*Math.PI*2,u=r()*2-1,rad=35+r()*45;pos[i*3]=Math.cos(a)*Math.sqrt(1-u*u)*rad;pos[i*3+1]=u*rad;pos[i*3+2]=Math.sin(a)*Math.sqrt(1-u*u)*rad;sizes[i]=.5+r()*1.8;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPulse:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aSize;varying float vA;uniform float uTime,uPulse;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*(1.+uPulse*.5);vA=.4+.6*sin(uTime*.3+position.x*4.)*.5+.3;}`,
    fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.05,.5,d);gl_FragColor=vec4(.75,.7,1.,a*vA);}`});
  return new THREE.Points(geo,mat);
}

export function makeMoon() {
  const mat=new THREE.ShaderMaterial({uniforms:{},vertexShader:`varying vec3 vN,vP;void main(){vN=normal;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:noiseGLSL+`varying vec3 vN,vP;void main(){float n=fbm(vP*5.);float l=max(dot(normalize(vN),normalize(vec3(-.6,.3,.8))),0.);vec3 c=mix(vec3(.08,.07,.12),vec3(.55,.5,.65),n)*(.15+l*.9);gl_FragColor=vec4(c,1.);}`});
  const m=new THREE.Mesh(new THREE.SphereGeometry(1.5,32,24),mat);m.position.set(8,5,-10);return m;
}

export function canvasTexture(draw:(ctx:CanvasRenderingContext2D,w:number,h:number)=>void,w=1024,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;draw(ctx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

export function disposeObject(root:THREE.Object3D){const geos=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>(),texs=new Set<THREE.Texture>();root.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)geos.add(m.geometry);if(m.material){for(const mat of Array.isArray(m.material)?m.material:[m.material]){mats.add(mat);for(const v of Object.values(mat))if(v instanceof THREE.Texture)texs.add(v);}}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());texs.forEach(t=>t.dispose());}
