import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
let world, water, ferry, windows, seed=194, hornClock=0;
const bulbs=[], lights=[], gulls=[];
const dayWater=new THREE.Color(0x176875),nightWater=new THREE.Color(0x092b45);
export let onFerryHorn=null;
export function setFerryHornCallback(callback){onFerryHorn=typeof callback==='function'?callback:null;}
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:.83});
const stone=material(0xb9b4a3),iron=material(0x273c3a),roof=material(0x576769),wood=material(0x78513a);
function mesh(p,g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;}
function box(p,w,h,d,m,x,y,z){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
function cyl(p,r,h,m,x,y,z,top=r,n=12){return mesh(p,new THREE.CylinderGeometry(top,r,h,n),m,x,y,z);}
function texture(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function batch(group){group.updateMatrixWorld(true);const batches=new Map();group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);});for(const [m,gs] of batches){mesh(world,mergeGeometries(gs,false),m);for(const g of gs)g.dispose();}group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
function square(){
 const paving=texture((c,s)=>{c.fillStyle='#686c68';c.fillRect(0,0,s,s);for(let y=-1;y<8;y++)for(let x=-1;x<8;x++){const px=x*64+(y%2)*32,py=y*64,v=128+rnd()*42;c.fillStyle=`rgb(${v},${v+2},${v-3})`;c.beginPath();c.roundRect(px+2,py+2,59,59,5);c.fill();c.strokeStyle='#c0c1b3';c.stroke();for(let i=0;i<90;i++){c.fillStyle=rnd()>.5?'#ffffff18':'#00000018';c.fillRect(px+4+rnd()*55,py+4+rnd()*55,1+rnd()*3,1+rnd()*2);}}});
 paving.wrapS=paving.wrapT=THREE.RepeatWrapping;paving.repeat.set(24,9);paving.anisotropy=8;
 const ground=mesh(world,new THREE.PlaneGeometry(100,36),new THREE.MeshStandardMaterial({map:paving,bumpMap:paving,bumpScale:.035,roughness:.96}),0,-.015,3);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
 const props=new THREE.Group();box(props,100,.6,.6,stone,0,-.22,-14.7);
 for(let x=-48;x<=48;x+=3){box(props,2.96,.12,.75,stone,x,.04,-14.5);cyl(props,.12,.75,iron,x,.38,-14);cyl(props,.18,.09,iron,x,.76,-14);}
 for(const x of [-8,7,16]){for(let i=0;i<4;i++)box(props,1.8,.07,.12,wood,x,.48,-8+i*.14);for(let i=0;i<3;i++)box(props,1.8,.11,.06,wood,x,.69+i*.13,-8.05);for(const dx of [-.65,.65]){box(props,.07,.48,.55,iron,x+dx,.24,-7.8);box(props,.07,.8,.07,iron,x+dx,.5,-8.05);}}
 cyl(props,.25,.7,iron,4,.35,-5);cyl(props,.28,.06,stone,4,.73,-5);
 for(const x of [-12,-6,6,12,20]){
  cyl(props,.18,.25,iron,x,.125,-10);cyl(props,.065,3.5,iron,x,1.8,-10,.035);
  for(const y of [.4,2.8,3.25])cyl(props,.11,.07,iron,x,y,-10);
  cyl(props,.28,.12,iron,x,3.46,-10,.19);cyl(props,.3,.2,iron,x,3.97,-10,0);
  for(const dx of [-.17,.17])for(const dz of [-.17,.17])box(props,.025,.42,.025,iron,x+dx,3.7,-10+dz);
  const glow=new THREE.MeshStandardMaterial({color:0xffe9bd,emissive:0xffbd61,emissiveIntensity:0,roughness:.25});bulbs.push(glow);mesh(world,new THREE.SphereGeometry(.16,8,6),glow,x,3.7,-10);
  if(lights.length<3){const light=new THREE.PointLight(0xffce85,0,13,2);light.position.set(x,3.6,-10);world.add(light);lights.push(light);}
 }
 cyl(props,.035,2.6,iron,-2.8,1.3,-3.6);box(props,1.1,.3,.05,iron,-2.8,2.38,-3.6);
 const sign=texture((c,s)=>{c.fillStyle='#244b52';c.fillRect(0,0,s,s);c.strokeStyle='#e8ddbd';c.lineWidth=14;c.strokeRect(12,12,s-24,s-24);c.font='bold 74px Georgia';c.fillStyle='#fff1d2';c.textAlign='center';c.fillText('EMİNÖNÜ',s/2,285);});
 mesh(props,new THREE.PlaneGeometry(1.04,.25),new THREE.MeshStandardMaterial({map:sign}),-2.8,2.38,-3.57);batch(props);
}
function sea(){
 const uniforms=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uTime:{value:0},uColor:{value:dayWater.clone()},uSky:{value:new THREE.Color(0xaac9cb)},uNight:{value:0}}]);
 const m=new THREE.ShaderMaterial({uniforms,fog:true,vertexShader:`
 #include <fog_pars_vertex>
 uniform float uTime; varying vec3 vWorld; varying vec3 vNormal;
 void main(){vec3 p=position;float a=p.x*.12+p.z*.19+uTime*.85;float b=p.x*.33-p.z*.16+uTime*1.3;
 p.y+=sin(a)*.16+sin(b)*.07;vNormal=normalize(vec3(-cos(a)*.0192-cos(b)*.0231,1.,-cos(a)*.0304+cos(b)*.0112));
 vWorld=(modelMatrix*vec4(p,1.)).xyz;vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;
 #include <fog_vertex>
 }`,fragmentShader:`
 #include <fog_pars_fragment>
 uniform vec3 uColor;uniform vec3 uSky;uniform float uNight;varying vec3 vWorld;varying vec3 vNormal;
 void main(){vec3 eye=normalize(cameraPosition-vWorld);float fresnel=pow(1.-max(dot(eye,vNormal),0.),4.);
 float glitter=pow(max(dot(reflect(-normalize(vec3(-.5,.35,-.7)),vNormal),eye),0.),180.);
 float ripple=sin(vWorld.x*2.+vWorld.z*1.7)*sin(vWorld.z*3.1)*.015;
 vec3 color=mix(uColor*(.85+vNormal.y*.15+ripple),uSky,fresnel*.7)+vec3(1.,.79,.43)*glitter*(1.-uNight)*1.7;
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 #include <fog_fragment>
 }`});
 const geo=new THREE.PlaneGeometry(1800,1000,220,150);geo.rotateX(-Math.PI/2);water=mesh(world,geo,m,0,-.38,-515);
}
function mosque(p,x,y,z,s,minarets){
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);p.add(g);
 box(g,22,12,18,stone,0,6,0);
 const dome=(x,y,z,r)=>mesh(g,new THREE.SphereGeometry(r,20,10,0,Math.PI*2,0,Math.PI/2),roof,x,y,z);
 dome(0,12,0,11);cyl(g,.25,4,iron,0,24,0,0);
 for(const dx of [-10,10]){dome(dx,9,0,6);box(g,8,9,14,stone,dx,4.5,0);}
 for(const dx of [-8,0,8]){dome(dx,6,13,4);box(g,7,6,7,stone,dx,3,13);}
 for(let i=0;i<minarets;i++){const dx=i%2?-17:17,dz=i<2?8:-12;cyl(g,1.05,34,stone,dx,17,dz,.65,12);for(const h of [20,28]){cyl(g,1.65,.7,stone,dx,h,dz);cyl(g,1.5,1,stone,dx,h-.8,dz,.9);}cyl(g,.95,7,roof,dx,37.5,dz,0);}
}
function skyline(){
 const fixed=new THREE.Group();
 for(let i=0;i<3;i++){const hill=mesh(fixed,new THREE.SphereGeometry(1,36,12),material([0x82948d,0x6f8580,0x5d7872][i]),-100+i*95,0,-690+i*65);hill.scale.set(390-i*55,85-i*17,110);}
 box(fixed,850,6,24,stone,-40,1,-510);
 const facade=texture((c,s)=>{c.fillStyle='#c2b8a0';c.fillRect(0,0,s,s);for(let y=35;y<s;y+=100)for(let x=30;x<s;x+=90){c.fillStyle='#435c61';c.fillRect(x,y,29,48);c.fillStyle='#e8cf93';c.fillRect(x+5,y+6,19,33);c.fillStyle='#9b8a71';c.fillRect(x-3,y+48,35,6);}});
 const glow=texture((c,s)=>{c.fillStyle='#000';c.fillRect(0,0,s,s);for(let y=35;y<s;y+=100)for(let x=30;x<s;x+=90){c.fillStyle=rnd()>.32?'#ffd48d':'#080808';c.fillRect(x+5,y+6,19,33);}});
 windows=new THREE.MeshStandardMaterial({map:facade,emissiveMap:glow,emissive:0xffcf83,emissiveIntensity:0,roughness:.9});
 const count=480,houses=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),windows,count),roofs=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,4),material(0x925b48),count);
 const dummy=new THREE.Object3D(),color=new THREE.Color();
 for(let i=0;i<count;i++){const x=-420+rnd()*800,z=-525-rnd()*150,h=7+rnd()*15,w=6+rnd()*7,y=Math.max(0,58*(1-Math.pow((x+65)/420,2)))*Math.min(1,(-z-515)/90);dummy.position.set(x,y+h/2,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,7+rnd()*6);dummy.updateMatrix();houses.setMatrixAt(i,dummy.matrix);color.setHSL(.06+rnd()*.12,.12+rnd()*.15,.58+rnd()*.25);houses.setColorAt(i,color);dummy.position.y=y+h+2;dummy.scale.set(w*.8,5,dummy.scale.z*.8);dummy.rotation.y=Math.PI/4;dummy.updateMatrix();roofs.setMatrixAt(i,dummy.matrix);}
 world.add(houses,roofs);
 // Galata's tall stone drum, projecting balcony and pointed lead roof.
 const tx=-100,tz=-595,ty=57;cyl(fixed,9,39,stone,tx,ty+19.5,tz,8,24);cyl(fixed,11,2,stone,tx,ty+35,tz,11,24);cyl(fixed,8.4,8,stone,tx,ty+41,tz,8.4,24);cyl(fixed,10,17,roof,tx,ty+53,tz,0,24);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const win=box(fixed,1.7,4,.4,iron,tx+Math.sin(a)*8.45,ty+41,tz+Math.cos(a)*8.45);win.rotation.y=a;}
 const hill=mesh(fixed,new THREE.SphereGeometry(1,24,10),material(0x8a9687),260,-7,-355);hill.scale.set(145,37,100);
 mosque(fixed,150,9,-285,1.05,2);mosque(fixed,285,28,-405,1.3,4);
 // Low bridge approaches remain below the skyline.
 box(fixed,350,4,20,stone,-340,5,-220);for(let x=-490;x<-165;x+=40)box(fixed,7,13,13,stone,x,-1,-220);box(fixed,350,1,1,iron,-340,8,-210);batch(fixed);
}
function movingLife(){
 ferry=new THREE.Group();world.add(ferry);const white=material(0xf0ede0),dark=material(0x263c44),yellow=material(0xdba64a);
 const hull=mesh(ferry,new THREE.SphereGeometry(1,16,8),dark,0,1,0);hull.scale.set(19,2.6,4.5);
 box(ferry,32,2.6,7.5,white,0,3.2,0);box(ferry,27,2.5,6.6,white,-1,5.7,0);box(ferry,34,.35,8,white,0,4.6,0);box(ferry,29,.35,7.3,white,-1,7.1,0);
 for(const z of [-3.8,3.8])for(let x=-13;x<=13;x+=2.3)box(ferry,1.35,1.25,.08,dark,x,3.3,z);
 for(const z of [-3.35,3.35])for(let x=-12;x<=10;x+=2.3)box(ferry,1.4,1.2,.08,dark,x,5.7,z);
 cyl(ferry,1,4,yellow,-3,8.5,0);cyl(ferry,1.05,.65,dark,-3,10.3,0);cyl(ferry,.09,5,white,9,9,0);
 const name=texture((c,s)=>{c.fillStyle='#f0ede0';c.fillRect(0,0,s,s);c.fillStyle='#263c44';c.font='bold 48px Arial';c.textAlign='center';c.fillText('ŞEHİR HATLARI',s/2,270);});mesh(ferry,new THREE.PlaneGeometry(10,1.5),new THREE.MeshStandardMaterial({map:name}),0,1.8,4.25);
 const gullMat=material(0xf3f1de),wingGeo=new THREE.BufferGeometry();wingGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.75,.03,.08,.28,0,.24],3));wingGeo.computeVertexNormals();gullMat.side=THREE.DoubleSide;
 for(let i=0;i<16;i++){const bird=new THREE.Group();const body=mesh(bird,new THREE.SphereGeometry(.1,6,4),gullMat);body.scale.set(1,1,2.8);const left=mesh(bird,wingGeo,gullMat),right=mesh(bird,wingGeo,gullMat);right.scale.x=-1;world.add(bird);gulls.push({bird,left,right,phase:rnd()*Math.PI*2,radius:8+rnd()*28,speed:.12+rnd()*.15,height:4+rnd()*12});}
}
export function buildCity(scene){
 if(world)return world;world=new THREE.Group();world.name='Istanbul';scene.add(world);scene.fog.density=.00115;square();sea();skyline();movingLife();updateCity(0,0,7);return world;
}
export function updateCity(dt,time,hour){
 if(!world)return;const night=THREE.MathUtils.smoothstep(hour,18.3,20),on=hour>18.3;
 water.material.uniforms.uTime.value=time;water.material.uniforms.uColor.value.copy(dayWater).lerp(nightWater,night);water.material.uniforms.uSky.value.copy(world.parent.fog.color);water.material.uniforms.uNight.value=night;
 for(const bulb of bulbs)bulb.emissiveIntensity=on?2.5:0;for(const light of lights)light.intensity=on?24:0;windows.emissiveIntensity=night*1.5;
 const phase=time*.008;ferry.position.set(Math.sin(phase)*210,-.25+Math.sin(time*.8)*.12,-170);ferry.rotation.y=Math.cos(phase)>=0?0:Math.PI;ferry.rotation.z=Math.sin(time*.65)*.012;
 hornClock+=dt;if(hornClock>=48){hornClock%=48;if(onFerryHorn)onFerryHorn();}
 for(const g of gulls){const a=time*g.speed+g.phase;g.bird.position.set(Math.cos(a)*g.radius,g.height+Math.sin(a*2)*1.2,-23+Math.sin(a)*g.radius*.6);g.bird.rotation.y=-a;g.left.rotation.z=Math.sin(time*5+g.phase)*.55;g.right.rotation.z=-g.left.rotation.z;}
}
