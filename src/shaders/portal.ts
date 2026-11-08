import * as THREE from 'three';
import { noiseGLSL } from './noise.glsl';
export function portalMaterial(color = '#8b3dff') {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uPulse: { value: 0 } },
    transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: noiseGLSL + `varying vec2 vUv; uniform float uTime,uPulse; uniform vec3 uColor;
      void main(){ vec2 p=vUv-.5; float r=length(p*vec2(1.,.65)); float a=atan(p.y,p.x);
        float n=fbm(vec3(p*7.,uTime*.25)); float edge=1.-smoothstep(.28,.5,r);
        float swirl=.5+.5*sin(a*5.-r*28.+uTime*1.5+n*5.);
        vec3 col=uColor*(.35+swirl*.7+n)*edge*(1.4+uPulse); col+=vec3(.7,.55,1.)*pow(edge,7.)*.8;
        gl_FragColor=vec4(col,edge*.9); }`
  });
}
