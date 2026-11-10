import {createPeopleSystem} from './people.js';
import {scene,camera,renderer,updateScene,resize,startFlyIn,skipIntro,setTimeOfDay,isPlaying,screenShake} from './scene.js';
import {products,pickProduct,clearTray,removeLastTrayItem,updateCart,setProductHandler,setCartEnabled,setCashOpen,serveTray,saleSparkles} from './cart.js';
import {buildCity,updateCity,setFerryHornCallback} from './city.js';
import {createGame} from './game.js';
import {createUI} from './ui.js';
import {createAudio} from './audio.js';
buildCity(scene);
const people=createPeopleSystem(scene,camera),audio=createAudio(),actors=new Map(),departures=[];
let ui,time=0,cityHour=7,pendingStart=false,hudTick=0;
const game=createGame((event,data)=>{
 switch(event){
  case 'toast':ui?.toast(data);break;
  case 'sound':audio.play(data);break;
  case 'mute':audio.setMuted(data);break;
  case 'spawn':actors.set(data.id,people.spawn(data.type));break;
  case 'current':people.setCurrent(actors.get(data.id));break;
  case 'pick':pickProduct(data);break;
  case 'remove':removeLastTrayItem(data);break;
  case 'clear':clearTray();break;
  case 'serve':serveTray();audio.play('whoosh');people.react(actors.get(data.id),'pay');setCashOpen(true);break;
  case 'payment':people.react(actors.get(data.id),'pay');setCashOpen(true);break;
  case 'wrong':people.react(actors.get(data.id),'angry');ui?.wrong();screenShake(.012);break;
  case 'sale':{
   const h=actors.get(data.customer.id);people.react(h,data.correct?'happy':'angry');
   ui?.popup(data,people.headScreenPosition(h));if(data.correct){saleSparkles();screenShake(.009);}break;
  }
  case 'money':ui?.popup(data);saleSparkles();break;
  case 'depart':{
   const h=actors.get(data.customer.id);people.releaseCurrent(h);if(data.lost)people.react(h,'angry');if(h)departures.push({h,left:data.lost?.4:.7});break;
  }
  case 'animal':people.spawnAnimal(data.type);break;
  case 'shoo':people.shooAnimal();break;
  case 'reset':case 'end':
   people.reset();actors.clear();departures.length=0;people.shooAnimal();clearTray();setCashOpen(false);if(event==='end')ui?.render();break;
 }
});
ui=createUI(game);
setProductHandler(id=>game.addProduct(id));
setFerryHornCallback(()=>{if(game.state.phase==='playing')audio.play('horn');});
const start=document.querySelector('#startBtn');start.disabled=false;start.textContent=game.state.day>1?`${game.state.day}. güne devam et`:'Tezgâhı Aç';
start.addEventListener('click',()=>{audio.start();start.disabled=true;pendingStart=true;startFlyIn();document.querySelector('#titleScreen').classList.add('leaving');});
document.addEventListener('pointerdown',()=>audio.start(),{once:true});
document.addEventListener('keydown',()=>audio.start(),{once:true});
renderer.domElement.addEventListener('click',e=>{
 if(game.state.phase!=='playing')return;
 const animal=people.pick({x:e.clientX/innerWidth*2-1,y:1-e.clientY/innerHeight*2});
 if(animal){e.stopImmediatePropagation();game.shoo();}
},true);
document.addEventListener('cartnotice',e=>ui.toast(e.detail));
window.addEventListener('keydown',e=>{
 if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select'))return;
 const k=e.key.toLowerCase();if(['p','m','enter','backspace',' '].includes(k)||/^[1-8]$/.test(k))e.preventDefault();
 if(k==='p'){game.pause();ui.render();return;}if(k==='m'){game.mute();ui.render();return;}
 if(game.state.phase!=='playing')return;
 if(/^[1-8]$/.test(k))game.addProduct(products[Number(k)-1].id);
 if(k==='enter'){if(game.state.current?.stage==='payment')game.giveChange();else game.serve();}
 if(k==='backspace')game.removeProduct(game.state.tray.length-1);
 if(k===' ')game.shoo();ui.render();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state.phase==='playing'){game.pause();ui.render();}});
window.addEventListener('resize',resize);
function syncProducts(){for(const p of products)p.locked=!game.unlocked(p.id);setCartEnabled(game.state.phase==='playing');}
function step(dt){
 if(game.state.phase==='paused'||game.state.phase==='summary'){ui.update(0,null);return;}
 time+=dt;updateScene(dt,time);
 if(pendingStart&&isPlaying()){pendingStart=false;game.startDay();ui.hideTitle();}
 syncProducts();
 if(game.state.phase==='playing'){
  people.update(dt);
  const c=game.state.current;if(c)c.arrived=!!actors.get(c.id)?.arrived;
  game.update(dt);
  for(let i=departures.length-1;i>=0;i--){const d=departures[i];d.left-=dt;if(d.left<=0){people.leave(d.h);if(!game.state.current||game.state.current.stage==='order')setCashOpen(false);departures.splice(i,1);}}
  // Release references once the departing model has been disposed by people.js.
  for(const [id,h] of actors)if(!people.customers.includes(h))actors.delete(id);
  cityHour=setTimeOfDay(7+game.state.time/game.state.duration*13);
 }
 updateCart(dt);updateCity(dt,time,cityHour);
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 ui.update(dt,people.headScreenPosition(actors.get(game.state.current?.id)));
 hudTick+=dt;if(hudTick>=.1){hudTick=0;ui.render();}
}
let last=performance.now(),sampleIndex=0,sampleCount=0,sampleTotal=0,accumulator=0;
const samples=new Float64Array(90);
function frame(now){const raw=(now-last)/1000;last=now;if(raw>0){sampleTotal-=samples[sampleIndex];samples[sampleIndex]=raw;sampleTotal+=raw;sampleIndex=(sampleIndex+1)%samples.length;sampleCount=Math.min(sampleCount+1,samples.length);}
 accumulator+=Math.min(raw,.25);while(accumulator>=1/60){step(1/60);accumulator-=1/60;}renderer.render(scene,camera);requestAnimationFrame(frame);
}
function enterGame(){pendingStart=false;skipIntro();updateScene(0,time);ui.hideTitle();game.startDay();syncProducts();ui.render();return true;}
window.__game={ready:true,state:game.state,startDay:enterGame,spawnCustomer:type=>game.spawnCustomer(type),getCurrentOrder:game.getCurrentOrder,serveExact(){syncProducts();const result=game.serveExact();ui.render();return result;},addProduct(id){syncProducts();return game.addProduct(id);},fps:()=>sampleTotal?Math.round(sampleCount/sampleTotal):0,skipIntro(){if(game.state.phase==='title')return enterGame();skipIntro();updateScene(0,time);ui.hideTitle();},setTime(h){game.setTime(h);cityHour=setTimeOfDay(7+game.state.time/210*13);updateCity(0,time,cityHour);ui.render();return cityHour;},simulate(seconds){if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('seconds must be finite and non-negative');const ticks=Math.floor(seconds*30);for(let i=0;i<ticks;i++)step(1/30);const remainder=seconds-ticks/30;if(remainder>1e-9)step(remainder);ui.render();},people};
ui.render();requestAnimationFrame(frame);
