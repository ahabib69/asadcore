export const noiseGLSL = /* glsl */`
float hash13(vec3 p){ p=fract(p*.1031); p+=dot(p,p.yzx+33.33); return fract((p.x+p.y)*p.z); }
float hash21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float noise3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x),mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x),mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z); }
#ifndef OCTAVES
#define OCTAVES 5
#endif
float fbm(vec3 p){ float v=0.,a=.5; for(int i=0;i<OCTAVES;i++){ v+=a*noise3(p); p=p*2.03+vec3(13.1,7.7,5.3); a*=.5; } return v; }
vec2 voronoi(vec2 p){ vec2 n=floor(p),f=fract(p); float f1=8.,f2=8.; for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){ vec2 g=vec2(float(i),float(j)); vec2 o=vec2(hash21(n+g),hash21(n+g+17.)); vec2 r=g+o-f; float d=dot(r,r); if(d<f1){f2=f1;f1=d;}else if(d<f2){f2=d;} } return sqrt(vec2(f1,f2)); }
`;
