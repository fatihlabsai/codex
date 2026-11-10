import {scene,camera,renderer,updateScene,resize,startFlyIn,skipIntro,setTimeOfDay,isPlaying} from './scene.js';
import {products,pickProduct,clearTray,removeLastTrayItem,updateCart} from './cart.js';
import {buildCity,updateCity,setFerryHornCallback} from './city.js';
buildCity(scene);
let cityHour=7;
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
function frame(now){const raw=(now-last)/1000;last=now;const dt=Math.min(raw,.05);time+=dt;if(raw>0){sampleTotal-=samples[sampleIndex];samples[sampleIndex]=raw;sampleTotal+=raw;sampleIndex=(sampleIndex+1)%samples.length;sampleCount=Math.min(sampleCount+1,samples.length);}updateScene(dt,time);updateCart(dt);updateCity(dt,time,cityHour);renderer.render(scene,camera);requestAnimationFrame(frame);}
window.__game={ready:true,skipIntro(){skipIntro();document.querySelector('#titleScreen').hidden=true;document.querySelector('#hud').hidden=false;},setFerryHornCallback,fps:()=>sampleTotal?Math.round(sampleCount/sampleTotal):0,addProduct:pickProduct,setTime(h){const hour=setTimeOfDay(h);cityHour=hour;updateCity(0,time,hour);document.querySelector('#clock').textContent=`${String(Math.floor(hour)).padStart(2,'0')}:${String(Math.floor(hour%1*60)).padStart(2,'0')}`;return hour;}};
requestAnimationFrame(frame);
