import * as THREE from 'three';
import { noiseGLSL } from './noise.glsl';
export function makeSky(seed: number, octaves = 5) {
  const uniforms = { uTime: { value: 0 }, uSeed: { value: seed % 100 }, uShift: { value: (seed % 30) / 100 }, uPulse: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, defines: { OCTAVES: octaves },
    vertexShader: `varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: noiseGLSL + `
      varying vec3 vPos; uniform float uTime,uSeed,uShift,uPulse;
      void main(){
        vec3 d=normalize(vPos); vec3 p=d*3.2+vec3(uSeed,uTime*.006,0.);
        float n=fbm(p+fbm(p*1.7)*1.8);
        float cloud=smoothstep(.34,.78,n);
        float band=exp(-pow((d.y-d.x*.22+.08)*2.4,2.));
        vec3 col=vec3(.008,.004,.022);
        col+=mix(vec3(.10,.025,.20),vec3(.16,.045,.30),uShift)*cloud*band*(1.1+uPulse*.25);
        col+=vec3(.035,.012,.07)*pow(fbm(p*3.),3.)*band;
        float star=hash21(floor(d.xz*900.+d.y*300.));
        col+=vec3(.65,.6,.8)*step(.9987,star)*(.4+.6*sin(uTime*.4+star*90.)*.5+.3);
        gl_FragColor=vec4(col,1.);
      }`
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 24), material);
  return { mesh, uniforms };
}
