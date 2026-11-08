import * as THREE from 'three';
export const PostShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uWarp: { value: 0 }, uAberration: { value: 0.0012 }, uGrain: { value: 0.025 }, uGlitch: { value: 0 }, uResolution: { value: new THREE.Vector2(1, 1) } },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime,uWarp,uAberration,uGrain,uGlitch; uniform vec2 uResolution; varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
      vec2 uv=vUv; vec2 c=uv-.5; float r=length(c);
      float w=uWarp; uv+=c*w*(.35+r*1.8); uv.x+=sin(uv.y*30.+uTime*20.)*uGlitch*.008;
      float ab=uAberration*(.4+r)+w*.018+uGlitch*.006;
      vec3 col; col.r=texture2D(tDiffuse,uv+c*ab).r; col.g=texture2D(tDiffuse,uv).g; col.b=texture2D(tDiffuse,uv-c*ab).b;
      col+=vec3(.22,.06,.45)*w*w*(1.-smoothstep(.0,.5,abs(r-w*.45)));
      float vig=1.-smoothstep(.28,.82,r)*.58; col*=vig;
      col+=(hash(uv*uResolution+fract(uTime)*100.)-.5)*uGrain;
      gl_FragColor=vec4(col,1.);
    }`
};
