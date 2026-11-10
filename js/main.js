import * as THREE from 'three';
import {scene,camera,renderer,updateScene,resize,startFlyIn,setTimeOfDay,isPlaying} from './scene.js';
import {products,canvasTexture,pickProduct,clearTray,removeLastTrayItem,updateCart} from './cart.js';
const groundTexture=canvasTexture((c,s)=>{
 c.fillStyle='#706f65';c.fillRect(0,0,s,s);
 let seed=31;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let y=-1;y<8;y++)for(let x=-1;x<8;x++){
  const px=x*64+(y%2)*32,py=y*64,v=135+Math.floor(rnd()*25);
  c.fillStyle=`rgb(${v},${v-2},${v-10})`;c.beginPath();c.roundRect(px+3,py+3,58,58,7);c.fill();
  c.strokeStyle='#b9b6a4';c.lineWidth=2;c.stroke();
  for(let i=0;i<30;i++){c.fillStyle=rnd()>.5?'#ffffff10':'#0000000c';c.fillRect(px+6+rnd()*50,py+6+rnd()*50,2,2);}
 }
});
groundTexture.wrapS=groundTexture.wrapT=THREE.RepeatWrapping;groundTexture.repeat.set(35,15);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(70,30),new THREE.MeshStandardMaterial({map:groundTexture,roughness:.94,bumpMap:groundTexture,bumpScale:.025}));
ground.rotation.x=-Math.PI/2;ground.position.set(0,-.015,0);ground.receiveShadow=true;scene.add(ground);
const quay=new THREE.Mesh(new THREE.BoxGeometry(70,.3,.4),new THREE.MeshStandardMaterial({color:0xbab5a0,roughness:.85}));quay.position.set(0,-.08,-14.9);quay.receiveShadow=true;scene.add(quay);
const ripple=canvasTexture((c,s)=>{c.fillStyle='#8d9c9f';c.fillRect(0,0,s,s);for(let i=0;i<100;i++){c.strokeStyle=`rgba(220,240,240,${.06+(i%5)*.03})`;c.beginPath();for(let x=0;x<=s;x+=8){const y=i*5+Math.sin(x*.035+i)*3;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}});
ripple.wrapS=ripple.wrapT=THREE.RepeatWrapping;ripple.repeat.set(70,70);
const water=new THREE.Mesh(new THREE.PlaneGeometry(1800,1000),new THREE.MeshStandardMaterial({color:0x477f8a,metalness:.55,roughness:.24,bumpMap:ripple,bumpScale:.11}));water.rotation.x=-Math.PI/2;water.position.set(0,-.18,-515);scene.add(water);
const bar=document.querySelector('#productBar');
for(const [i,p] of products.entries()){const b=document.createElement('button');b.className=p.locked?'locked':'';b.innerHTML=`<kbd>${i+1}${p.locked?' · 🔒':''}</kbd><b>${p.name}</b><small>${p.price} ₺</small>`;b.setAttribute('aria-label',`${p.name}, ${p.price} lira${p.locked?', kilitli':''}`);b.addEventListener('click',()=>pickProduct(p.id));bar.appendChild(b);}
const start=document.querySelector('#startBtn');start.disabled=false;start.textContent='Tezgâhı Aç';
start.addEventListener('click',()=>{start.disabled=true;startFlyIn();document.querySelector('#titleScreen').classList.add('leaving');setTimeout(()=>{document.querySelector('#titleScreen').hidden=true;document.querySelector('#hud').hidden=false;},2800);});
document.querySelector('#undoBtn').addEventListener('click',removeLastTrayItem);
document.querySelector('#clearBtn').addEventListener('click',clearTray);
document.addEventListener('traychange',e=>{document.querySelector('#trayCount').textContent=`${e.detail.length} ürün`;});
let noticeTimer;document.addEventListener('cartnotice',e=>{const el=document.querySelector('#notice');el.textContent=e.detail;el.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('visible'),2300);});
window.addEventListener('keydown',e=>{if(!isPlaying()||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[1-8]$/.test(e.key)){e.preventDefault();pickProduct(products[Number(e.key)-1].id);}if(e.key==='Backspace'){e.preventDefault();removeLastTrayItem();}});
window.addEventListener('resize',resize);
let last=performance.now(),time=0,sampleIndex=0,sampleCount=0,sampleTotal=0;
const samples=new Float64Array(90);
function frame(now){const raw=(now-last)/1000;last=now;const dt=Math.min(raw,.05);time+=dt;if(raw>0){sampleTotal-=samples[sampleIndex];samples[sampleIndex]=raw;sampleTotal+=raw;sampleIndex=(sampleIndex+1)%samples.length;sampleCount=Math.min(sampleCount+1,samples.length);}updateScene(dt,time);updateCart(dt);ripple.offset.x=time*.004;renderer.render(scene,camera);requestAnimationFrame(frame);}
window.__game={ready:true,fps:()=>sampleTotal?Math.round(sampleCount/sampleTotal):0,addProduct:pickProduct,setTime(h){const hour=setTimeOfDay(h);document.querySelector('#clock').textContent=`${String(Math.floor(hour)).padStart(2,'0')}:${String(Math.floor(hour%1*60)).padStart(2,'0')}`;return hour;}};
requestAnimationFrame(frame);
