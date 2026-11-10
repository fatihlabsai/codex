import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scene, camera, renderer, isPlaying } from './scene.js';
export const products=[
 {id:'simit',name:'Simit',price:20},{id:'cay',name:'Çay',price:15},
 {id:'su',name:'Su',price:10},{id:'acma',name:'Açma',price:25},
 {id:'pogaca',name:'Poğaça',price:25},{id:'kumru',name:'Kumru',price:90,locked:true},
 {id:'ayran',name:'Ayran',price:20},{id:'peynir',name:'Peynir',price:15,locked:true}
];
let seed=71;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
export function canvasTexture(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const paint=canvasTexture((c,s)=>{c.fillStyle='#a92826';c.fillRect(0,0,s,s);for(let i=0;i<2600;i++){c.fillStyle=`rgba(255,188,130,${random()*.05})`;c.fillRect(random()*s,random()*s,1,random()*12);}});
const wood=canvasTexture((c,s)=>{c.fillStyle='#875131';c.fillRect(0,0,s,s);for(let i=0;i<350;i++){c.strokeStyle=`rgba(45,18,9,${random()*.24})`;c.beginPath();const y=random()*s;c.moveTo(0,y);c.bezierCurveTo(140,y+random()*15,320,y-8,s,y+4);c.stroke();}for(let i=0;i<5;i++){c.fillStyle='#482c1f';c.fillRect(0,i*s/5,s,3);}});
const sesame=canvasTexture((c,s)=>{c.fillStyle='#b96925';c.fillRect(0,0,s,s);for(let i=0;i<1800;i++){const x=random()*s,y=random()*s;c.save();c.translate(x,y);c.rotate(random()*Math.PI);c.fillStyle=i%3?'#ebbd6a':'#f5d68a';c.beginPath();c.ellipse(0,0,2,4.5,0,0,Math.PI*2);c.fill();c.restore();}});
function mat(color,roughness=.5,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
const red=new THREE.MeshStandardMaterial({map:paint,roughness:.27,metalness:.18});
const timber=new THREE.MeshStandardMaterial({map:wood,roughness:.55});
const cream=mat(0xffedc4),brass=mat(0xc89e49,.25,.78),steel=mat(0xbac7c7,.23,.85),black=mat(0x252e2d),paper=mat(0xf3e7c9);
const bread=new THREE.MeshStandardMaterial({map:sesame,roughness:.72});
const bun=mat(0xc98336,.34),cheese=mat(0xffedaf),white=mat(0xf7f1df),blue=mat(0x3489aa,.3);
const glass=new THREE.MeshPhysicalMaterial({color:0xcceaf0,transparent:true,opacity:.13,roughness:.06,metalness:.25,envMapIntensity:1.4,depthWrite:false});
function mesh(parent,geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=material!==glass;m.receiveShadow=true;parent.add(m);return m;}
function box(p,w,h,d,m,x=0,y=0,z=0,r=.012){return mesh(p,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m,x,y,z);}
function cyl(p,rt,rb,h,m,x=0,y=0,z=0,n=32){return mesh(p,new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z);}
function torus(p,r,t,m,x=0,y=0,z=0){const a=mesh(p,new THREE.TorusGeometry(r,t,12,48),m,x,y,z);a.rotation.x=Math.PI/2;return a;}
function sphere(p,x,y,z,sx,sy,sz,m){const a=mesh(p,new THREE.SphereGeometry(1,24,16),m,x,y,z);a.scale.set(sx,sy,sz);return a;}
function lathe(p,points,m){return mesh(p,new THREE.LatheGeometry(points.map(a=>new THREE.Vector2(...a)),32),m);}
function label(text,bg='#f5e8c7',fg='#59392a',size=512){return canvasTexture((c,s)=>{c.fillStyle=bg;c.fillRect(0,0,s,s);c.strokeStyle=fg;c.lineWidth=5;c.strokeRect(12,12,s-24,s-24);c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';text.split('\n').forEach((line,i,all)=>{c.font=`bold ${all.length>2?42:65}px Georgia`;c.fillText(line,s/2,s/2+(i-(all.length-1)/2)*76,s-35);});},size);}
function sign(p,w,h,text,x,y,z,bg,fg){const material=new THREE.MeshStandardMaterial({map:label(text,bg,fg),roughness:.8});return mesh(p,new THREE.PlaneGeometry(w,h),material,x,y,z);}
function makeProduct(id){
 const g=new THREE.Group();g.name=id;
 if(id==='simit'||id==='acma'){
  const isSimit=id==='simit',r=isSimit?.069:.061,t=isSimit?.022:.031;
  const ring=torus(g,r,t,isSimit?bread:bun,0,t,0);
  const pos=ring.geometry.attributes.position;
  for(let i=0;i<pos.count;i++){const a=Math.atan2(pos.getY(i),pos.getX(i)),f=1+.035*Math.sin(a*18);pos.setXYZ(i,pos.getX(i)*f,pos.getY(i)*f,pos.getZ(i));}ring.geometry.computeVertexNormals();
  if(!isSimit)for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const l=sphere(g,Math.cos(a)*r,.034,Math.sin(a)*r,.032,.022,.026,bun);l.rotation.y=-a;}
 }else if(id==='cay'){
  cyl(g,.053,.048,.008,white,0,.004);torus(g,.044,.0025,brass,0,.009);
  lathe(g,[[.022,.009],[.026,.02],[.018,.045],[.021,.069],[.03,.093]],glass);
  const tea=mat(0x9e3507,.19);lathe(g,[[0,.012],[.023,.013],[.024,.025],[.017,.045],[.022,.071],[0,.071]],tea);
  torus(g,.03,.0015,steel,0,.093);box(g,.008,.002,.065,steel,.035,.013,.01,.001);
 }else if(id==='su'){
  lathe(g,[[0,0],[.029,0],[.032,.015],[.03,.11],[.02,.14],[.014,.15],[.014,.17]],new THREE.MeshPhysicalMaterial({color:0x84c6df,roughness:.15,metalness:.1,transparent:true,opacity:.65}));
  cyl(g,.016,.016,.018,blue,0,.173);const lm=new THREE.MeshStandardMaterial({map:label('SU\nİSTANBUL','#e9f4f2','#267a9d')});cyl(g,.0307,.0307,.047,lm,0,.079);
  for(let i=0;i<3;i++)torus(g,.03,.0015,glass,0,.023+i*.013);
 }else if(id==='pogaca'){
  sphere(g,0,.032,0,.079,.036,.051,bun);
  for(let i=0;i<18;i++){const x=(random()-.5)*.1,z=(random()-.5)*.06;const s=sphere(g,x,.063-Math.abs(x)*.12,z,.0018,.0012,.004,black);s.rotation.y=random()*6;}
 }else if(id==='kumru'){
  sphere(g,0,.025,0,.104,.025,.046,bun);box(g,.17,.008,.075,cheese,0,.047,0);
  for(let i=0;i<4;i++){const x=-.06+i*.04;cyl(g,.028,.028,.009,mat(0xa83a27),x,.06);cyl(g,.025,.025,.008,mat(0xe45e39),x,.073,.009);}
  sphere(g,0,.097,0,.107,.034,.05,bread);
 }else if(id==='ayran'){
  const lm=new THREE.MeshStandardMaterial({map:label('AYRAN\nGÜNLÜK','#f8f4e9','#276da0')});cyl(g,.036,.027,.09,lm,0,.045);cyl(g,.039,.039,.004,steel,0,.092);box(g,.017,.002,.013,steel,.033,.094,0);
 }else if(id==='peynir'){
  box(g,.15,.002,.13,paper,0,.002,0);
  const s=new THREE.Shape();s.moveTo(-.052,-.038);s.lineTo(.062,0);s.lineTo(-.052,.042);s.closePath();
  const wedge=mesh(g,new THREE.ExtrudeGeometry(s,{depth:.045,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.003,bevelThickness:.003}),white,0,.007,0);wedge.rotation.x=-Math.PI/2;
 }
 return g;
}
const cart=new THREE.Group();scene.add(cart);
box(cart,1.57,.65,.66,red,0,.61,-.78,.035);
box(cart,1.65,.07,.76,timber,0,1.0,-.76,.025);
for(const x of [-.76,.76])for(const z of [-1.08,-.48])box(cart,.022,.66,.025,brass,x,.63,z);
for(const y of [.31,.89])box(cart,1.56,.025,.018,cream,0,y,-.438);
for(const x of [-.52,.52]){const wheel=cyl(cart,.145,.145,.055,black,x,.18,-.78);wheel.rotation.z=Math.PI/2;const hub=cyl(cart,.095,.095,.059,steel,x,.18,-.78);hub.rotation.z=Math.PI/2;const axle=cyl(cart,.025,.025,1.2,steel,0,.18,-.78);axle.rotation.z=Math.PI/2;}
for(const x of [-.69,.69]){box(cart,.035,.035,.35,brass,x,.91,-.3);box(cart,.045,.048,.18,timber,x,.91,-.19);}
box(cart,.72,.3,.018,cream,0,.61,-1.12);
box(cart,.65,.19,.018,timber,0,.72,-.433);
box(cart,.17,.025,.03,brass,0,.72,-.41);
sign(cart,.66,.25,'SİMİT\nİSTANBUL',0,.61,-1.132,'#f6e8c5','#9f3027').rotation.y=Math.PI;
// The far-side glass case leaves a clear, open serving worktop toward the vendor.
box(cart,.76,.025,.29,brass,-.27,1.055,-.96);
for(const x of [-.65,.11])for(const z of [-1.105,-.815])box(cart,.014,.31,.014,brass,x,1.22,z);
for(const z of [-1.105,-.815])box(cart,.78,.012,.012,brass,-.27,1.38,z);
box(cart,.75,.29,.004,glass,-.27,1.22,-1.105);
for(const x of [-.65,.11])box(cart,.004,.29,.29,glass,x,1.22,-.96);
box(cart,.75,.004,.29,glass,-.27,1.39,-.96);
for(let row=0;row<3;row++)for(let i=0;i<3-row;i++){const p=makeProduct('simit');p.position.set(-.49+i*.18+row*.09,1.07+row*.046,-.96);cart.add(p);}
// Awning has scalloped striped fabric, brass finials and a curved crown.
for(const x of [-.79,.79]){cyl(cart,.014,.014,1.48,brass,x,1.7,-1.09);sphere(cart,x,2.47,-1.09,.028,.028,.028,brass);}
for(let i=0;i<14;i++){
 const x=-.91+i*.14,cloth=i%2?cream:red;
 const roof=box(cart,.142,.025,1.04,cloth,x,2.39,-.79);roof.rotation.x=-.12;
 box(cart,.142,.085,.02,cloth,x,2.28,-.27);
 const scallop=mesh(cart,new THREE.CircleGeometry(.071,16,Math.PI,Math.PI),cloth,x,2.24,-.258);scallop.material.side=THREE.DoubleSide;
}
box(cart,1.98,.025,.025,brass,0,2.34,-.27);
// Serving tray, recessed cash box, pastry papers and bottle crate.
export const trayPosition=new THREE.Vector3(-.47,1.06,-.49);
cyl(cart,.205,.197,.016,steel,...trayPosition.toArray());torus(cart,.197,.009,steel,-.47,1.073,-.49);
box(cart,.24,.075,.16,black,.61,1.08,-.49);box(cart,.23,.012,.155,steel,.61,1.123,-.49);box(cart,.07,.012,.007,brass,.61,1.08,-.405);
box(cart,.37,.013,.19,paper,-.06,1.046,-.59);
box(cart,.17,.075,.16,timber,.68,1.07,-.98);
for(const x of [.595,.765])box(cart,.008,.045,.17,timber,x,1.13,-.98);
// Brass double teapot on a dark burner.
cyl(cart,.072,.077,.032,black,.31,1.055,-1.0);torus(cart,.048,.006,brass,.31,1.078,-1);
for(const [y,r] of [[1.15,.064],[1.26,.045]]){
 sphere(cart,.31,y,-1,r,r*.78,r,brass);cyl(cart,r*.65,r*.85,.015,brass,.31,y+r*.72,-1);sphere(cart,.31,y+r*.95,-1,.011,.011,.011,black);
 const handle=torus(cart,r*.65,.008,black,.31+r,y,-1);handle.rotation.x=0;
 const spout=cyl(cart,.009,.018,.085,brass,.31-r,y+.02,-1);spout.rotation.z=-.65;
}
const board=box(cart,.235,.255,.02,timber,.87,1.21,-.79);board.rotation.y=-.23;
const chalk=sign(cart,.213,.23,'TAZE SİMİT\n20 ₺\nÇAY 15 ₺\nAFİYET OLSUN',.867,1.21,-.775,'#203a33','#f0e8cc');chalk.rotation.y=-.23;
// Batch opaque static cart pieces by material; keep glass separate for sorting.
cart.updateMatrixWorld(true);
const batches=new Map(), staticMeshes=[];
cart.traverse(o=>{if(o.isMesh&&!o.material.transparent){
 const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
 geometry.applyMatrix4(o.matrixWorld);
 if(!batches.has(o.material))batches.set(o.material,[]);
 batches.get(o.material).push(geometry);staticMeshes.push(o);
}});
for(const [material,geometries] of batches){
 const combined=mergeGeometries(geometries,false);
 const m=new THREE.Mesh(combined,material);m.castShadow=true;m.receiveShadow=true;scene.add(m);
 for(const geometry of geometries)geometry.dispose();
}
for(const m of staticMeshes){m.removeFromParent();m.geometry.dispose();}
const positions=[[-.54,1.075,-.96],[.2,1.045,-.78],[.68,1.115,-.98],[-.22,1.058,-.69],[-.02,1.058,-.69],[.23,1.048,-.56],[.51,1.045,-.78],[.00,1.045,-.48]];
const displays=[],targets=[],trayItems=[],flights=[],templates=new Map();
for(let i=0;i<products.length;i++){
 const p=products[i],template=makeProduct(p.id);templates.set(p.id,template);
 const g=template.clone(true);g.position.set(...positions[i]);cart.add(g);
 if(['su','ayran','cay'].includes(p.id))g.scale.setScalar(1.22);
 g.userData={product:p,baseY:g.position.y};
 // Each display owns its materials, so highlighting never changes other stock.
 const materials=new Map();g.traverse(o=>{if(o.isMesh){if(!materials.has(o.material))materials.set(o.material,o.material.clone());o.material=materials.get(o.material);o.userData.productRoot=g;targets.push(o);}});
 displays.push(g);
}
for(let i=0;i<2;i++){const tea=makeProduct('cay');tea.position.set(.17+i*.10,1.043,-.88);cart.add(tea);}
for(const [id,x,z] of [['su',.63,-1.04],['su',.73,-1.04],['ayran',.53,-.94],['ayran',.44,-.94],['acma',-.35,-.7],['pogaca',-.04,-.8]]){const i=products.findIndex(p=>p.id===id),g=makeProduct(id);g.position.set(x,id==='su'?1.115:1.045,z);if(['su','ayran'].includes(id))g.scale.setScalar(1.22);cart.add(g);g.traverse(o=>{if(o.isMesh){o.userData.productRoot=displays[i];targets.push(o);}});}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(9,9),hits=[];
let hovered=null, pointerInside=false;
const tip=document.querySelector('#productTip');
renderer.domElement.addEventListener('pointermove',e=>{pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);pointerInside=true;});
renderer.domElement.addEventListener('pointerleave',()=>{pointerInside=false;});
renderer.domElement.addEventListener('click',()=>{if(isPlaying()&&hovered)pickProduct(hovered.userData.product.id);});
function trayChanged(){document.dispatchEvent(new CustomEvent('traychange',{detail:trayItems.map(o=>o.name)}));}
export function pickProduct(id){
 if(!isPlaying())return false;
 const index=products.findIndex(p=>p.id===id);if(index<0)return false;
 if(products[index].locked){document.dispatchEvent(new CustomEvent('cartnotice',{detail:'Bu ürün dükkân geliştirmesiyle açılır.'}));return false;}
 if(trayItems.length>=8){document.dispatchEvent(new CustomEvent('cartnotice',{detail:'Tepsi doldu. Önce birkaç ürünü geri al.'}));return false;}
 const g=templates.get(id).clone(true);scene.add(g);displays[index].getWorldPosition(g.position);
 const n=trayItems.length,angle=n*2.4,r=n===0?0:.07+Math.floor(n/5)*.025;
 const end=trayPosition.clone().add(new THREE.Vector3(Math.cos(angle)*r,.025+Math.floor(n/4)*.065,Math.sin(angle)*r));
 flights.push({object:g,start:g.position.clone(),end,age:0});trayItems.push(g);trayChanged();return true;
}
// Copies share immutable geometry/materials with the eight reusable templates.
function disposeCopy(object){object.removeFromParent();}
export function removeLastTrayItem(){const item=trayItems.pop();if(!item)return;const i=flights.findIndex(f=>f.object===item);if(i>=0)flights.splice(i,1);disposeCopy(item);trayChanged();}
export function clearTray(){while(trayItems.length)removeLastTrayItem();}
export function updateCart(dt){
 hits.length=0;
 if(isPlaying()&&pointerInside){raycaster.setFromCamera(pointer,camera);raycaster.intersectObjects(targets,false,hits);}
 const next=hits.length?hits[0].object.userData.productRoot:null;
 if(next!==hovered){
  for(const g of displays){const on=g===next;g.traverse(o=>{if(o.isMesh&&o.material.emissive){o.material.emissive.setHex(on?0xc78935:0x000000);o.material.emissiveIntensity=on?.22:0;}});}
  hovered=next;renderer.domElement.style.cursor=hovered?'pointer':'default';tip.hidden=!hovered;if(hovered){const p=hovered.userData.product;tip.textContent=`${p.name} · ${p.price} ₺${p.locked?' · Kilitli':''}`;}}
 for(const g of displays){const on=g===hovered;g.position.y=THREE.MathUtils.damp(g.position.y,g.userData.baseY+(on?.022:0),12,dt);}
 for(let i=flights.length-1;i>=0;i--){const f=flights[i];f.age+=dt;const t=Math.min(1,f.age/.62),e=1-Math.pow(1-t,3);f.object.position.lerpVectors(f.start,f.end,e);f.object.position.y+=Math.sin(t*Math.PI)*.28;f.object.rotation.y=Math.sin(t*Math.PI)*.5;if(t===1)flights.splice(i,1);}
}
