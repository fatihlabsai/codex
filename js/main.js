import {createPeopleSystem,customerTypes} from './people.js';
import {scene,camera,renderer,updateScene,resize,startFlyIn,skipIntro,setTimeOfDay,isPlaying} from './scene.js';
import {products,pickProduct,clearTray,removeLastTrayItem,updateCart} from './cart.js';
import {buildCity,updateCity,setFerryHornCallback} from './city.js';
buildCity(scene);
let cityHour=7;
const people=createPeopleSystem(scene,camera);
const greetings={
 ogrenci:'Derse yetişeceğim, bir el atar mısın?',lise:'Abi zil çalacak, hızlı olsun!',
 isadami:'Ofise kahvaltı götürüyorum. Kolay gelsin.',teyze:'Çayının demi yerinde mi evladım?',
 turist:'Is this simit? It smells wonderful!',balikci:'Deniz bugün cömert, simit de taze olsun.',
 emekli:'Çay tavşan kanı olsun. Gazeteyi de açayım.',taksici:'Usta çabuk, taksimetre çalışıyor!'
};
const speech=document.createElement('div');speech.id='speech';speech.hidden=true;document.querySelector('#hud').append(speech);
const animalNotice=document.createElement('div');animalNotice.id='animalNotice';animalNotice.hidden=true;document.querySelector('#hud').append(animalNotice);
let demoTimer=7,customerWait=0,lastCustomer=null;
function spawnCustomer(type){if(['kedi','cat','marti','seagull'].includes(type))return people.spawnAnimal(type==='cat'?'kedi':type==='seagull'?'marti':type);if(people.customers.length>=3)return null;return people.spawn(customerTypes.includes(type)?type:customerTypes[Math.floor(Math.random()*8)]);}
function updatePeople(dt){
 people.update(dt);demoTimer+=dt;
 if(demoTimer>=8&&people.customers.length<3){spawnCustomer();demoTimer=0;}
 if(!people.current&&people.queue.length)people.setCurrent(people.queue[0]);
 const h=people.current;if(h!==lastCustomer){customerWait=0;lastCustomer=h;}
 speech.hidden=true;
 if(h?.arrived){customerWait+=dt;const p=people.headScreenPosition(h);speech.textContent=greetings[h.type];speech.hidden=!p?.visible;if(p){speech.style.left=`${p.x}px`;speech.style.top=`${p.y}px`;}if(customerWait>=5&&!h.demoHappy){people.react(h,'happy');h.demoHappy=true;}if(customerWait>=7)people.leave(h);}
 const a=people.animals[0];animalNotice.hidden=!a||a.state==='flee';if(a){animalNotice.textContent=`${a.type==='kedi'?'🐈 Peynir peşinde!':'🐦 Simit peşinde!'} ${Math.ceil(a.timer)} sn · Tıkla / Boşluk`;if(a.state==='perched'&&a.timer===0){const stolen=people.animalStolen();document.dispatchEvent(new CustomEvent('cartnotice',{detail:stolen==='simit'?'Martı bir simit kaptı!':'Kedi peyniri kaptı!'}));}}
}
renderer.domElement.addEventListener('click',e=>{if(!isPlaying())return;const a=people.pick({x:e.clientX/innerWidth*2-1,y:1-e.clientY/innerHeight*2});if(a){e.stopImmediatePropagation();people.shooAnimal();}},true);
window.addEventListener('keydown',e=>{if(e.code==='Space'&&isPlaying()){e.preventDefault();people.shooAnimal();}});
function applyTime(h,immediate=true){cityHour=setTimeOfDay(h);if(immediate)updateCity(0,time,cityHour);document.querySelector('#clock').textContent=`${String(Math.floor(cityHour)).padStart(2,'0')}:${String(Math.floor(cityHour%1*60)).padStart(2,'0')}`;document.querySelector('.clock small').textContent=cityHour>=18?'AKŞAM SERİNLİĞİ':cityHour>=12?'RIHTIMDA BİR GÜN':'YENİ BİR SABAH';return cityHour;}
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
function frame(now){const raw=(now-last)/1000;last=now;const dt=Math.min(raw,.05);time+=dt;if(raw>0){sampleTotal-=samples[sampleIndex];samples[sampleIndex]=raw;sampleTotal+=raw;sampleIndex=(sampleIndex+1)%samples.length;sampleCount=Math.min(sampleCount+1,samples.length);}updateScene(dt,time);updateCart(dt);if(isPlaying()){applyTime(Math.min(20,cityHour+dt*13/210),false);updatePeople(dt);}updateCity(dt,time,cityHour);renderer.render(scene,camera);requestAnimationFrame(frame);}
window.__game={ready:true,skipIntro(){skipIntro();document.querySelector('#titleScreen').hidden=true;document.querySelector('#hud').hidden=false;},setFerryHornCallback,fps:()=>sampleTotal?Math.round(sampleCount/sampleTotal):0,addProduct:pickProduct,people,spawnCustomer,setTime:applyTime};
requestAnimationFrame(frame);
