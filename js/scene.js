import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export const scene = new THREE.Scene();
export const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#viewport').appendChild(renderer.domElement);
export const camera = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.025,1800);
export const rig = new THREE.Group();
rig.position.set(0,1.65,0); scene.add(rig); rig.add(camera);
camera.rotation.order = 'YXZ';
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
scene.environment = pmrem.fromScene(room,.04).texture;
room.dispose(); pmrem.dispose(); scene.environmentIntensity=.45;
const sky = new Sky(); sky.scale.setScalar(1600); scene.add(sky);
sky.material.uniforms.turbidity.value=3;
sky.material.uniforms.rayleigh.value=1.6;
const sun = new THREE.DirectionalLight(0xffe5ba,3); scene.add(sun); scene.add(sun.target);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:60});
sun.shadow.normalBias=.025; sun.shadow.bias=-.0002;
const hemi = new THREE.HemisphereLight(0xc5e5f0,0x74634b,1.7);scene.add(hemi);
scene.fog = new THREE.FogExp2(0xc3d4d4,.0017);
const sunVector = new THREE.Vector3();
export function setTimeOfDay(hours){
 const h=THREE.MathUtils.clamp(Number(hours)||7,7,20), phase=(h-7)/13;
 const elevation=Math.sin(phase*Math.PI)*.95+.04;
 sunVector.set(Math.cos(phase*Math.PI)*.85,elevation,-.6).normalize();
 sky.material.uniforms.sunPosition.value.copy(sunVector);
 sun.position.copy(sunVector).multiplyScalar(24);sun.target.position.set(0,0,-1);
 const dusk=THREE.MathUtils.smoothstep(h,18.5,20);
 const warmth=Math.max(1-Math.min(1,elevation*1.7),THREE.MathUtils.smoothstep(h,16.5,19));
 sun.color.set(0xfff5df).lerp(new THREE.Color(0xffa057),warmth).lerp(new THREE.Color(0x829acb),dusk);
 sun.intensity=(2.8-warmth*.8)*(1-dusk*.85);
 hemi.intensity=1.5-dusk*.85;hemi.color.set(0xc5e5f0).lerp(new THREE.Color(0x617cae),dusk);
 scene.fog.color.set(0xc3d4d4).lerp(new THREE.Color(0xe8b494),warmth*.5).lerp(new THREE.Color(0x667e9c),dusk);
 renderer.toneMappingExposure=1.05-dusk*.3;
 sky.material.uniforms.rayleigh.value=1.6+dusk*1.8;
 return h;
}
let active=false, flyStart=-1, elapsed=0, yaw=0, pitch=0, targetYaw=0,targetPitch=0,shake=0;
const basePitch=THREE.MathUtils.degToRad(-18), origin=new THREE.Vector3(4.6,5.5,5.2), destination=new THREE.Vector3(0,1.65,.65);
const look=new THREE.Vector3(0,1,-.85);
rig.position.copy(origin);camera.lookAt(look);
renderer.domElement.addEventListener('pointermove',e=>{
 targetYaw=-(e.clientX/innerWidth-.5)*2*THREE.MathUtils.degToRad(35);
 targetPitch=-(e.clientY/innerHeight-.5)*2*THREE.MathUtils.degToRad(e.clientY<innerHeight/2?15:40);
});
renderer.domElement.addEventListener('pointerleave',()=>{targetYaw=targetPitch=0;});
export function startFlyIn(){if(flyStart<0&&!active)flyStart=performance.now()/1000;}
export function skipIntro(){if(flyStart>=0)flyStart=-1e9;else if(!active)flyStart=-1e9;}
export function isPlaying(){return active;}
export function screenShake(strength=.018){shake=Math.max(shake,strength);}
export function updateScene(dt,time){
 elapsed=time;
 if(flyStart>=0||flyStart===-1e9){
  const t=Math.min(1,(performance.now()/1000-flyStart)/3),ease=t*t*(3-2*t);
  rig.position.lerpVectors(origin,destination,ease);rig.position.y+=Math.sin(t*Math.PI)*.65;
  look.set(0,THREE.MathUtils.lerp(1,1.65-1.65*Math.tan(-basePitch),ease),THREE.MathUtils.lerp(-.85,-1,ease));
  camera.lookAt(look);
  if(t===1){active=true;flyStart=-1;camera.rotation.set(basePitch,0,0);}
 }else if(active){
  const smooth=1-Math.exp(-dt*7);yaw+=(targetYaw-yaw)*smooth;pitch+=(targetPitch-pitch)*smooth;
  camera.rotation.set(basePitch+pitch,yaw,0);
 }
 shake*=Math.exp(-dt*12);camera.position.set(Math.sin(time*67)*shake,Math.cos(time*53)*shake,0);
}
export function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
setTimeOfDay(7);
