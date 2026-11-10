import * as THREE from 'three';
export const customerTypes=['ogrenci','lise','isadami','teyze','turist','balikci','emekli','taksici'];
const rand=(a,b)=>a+Math.random()*(b-a);
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
const dark=material(0x272527),white=material(0xf4ead6),hair=material(0x30251e);
function oval(p,m,x,y,z,a,b,c){const o=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),m);o.position.set(x,y,z);o.scale.set(a,b,c);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function block(p,m,x,y,z,a,b,c){const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;}
function rod(p,m,a,b,r=.012){const d=new THREE.Vector3().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(o);return o;}
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
function pattern(kind,color){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,128,128);for(let i=0;i<128;i+=16){x.fillStyle='#ffffff35';x.fillRect(i,0,3,128);x.fillRect(0,i,128,3);if(kind==='floral'){x.fillStyle='#e9ba86';for(let j=0;j<128;j+=24){x.beginPath();x.arc(i,j,4,0,7);x.fill();}}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:1});}
function humanoid(type){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const skin=material([0xe6b58e,0xc88d66,0xa76d4f,0xf0c6a0][Math.floor(rand(0,4))]);
 const colors={ogrenci:0x427ca2,lise:0x23364e,isadami:0x303943,teyze:0xc9b292,turist:0xbc7950,balikci:0x53674a,emekli:0x796d5b,taksici:0x598992};
 const coat=type==='teyze'?material(colors[type]):type==='taksici'||type==='emekli'?pattern('check',type==='taksici'?'#56858c':'#776958'):material(new THREE.Color(colors[type]).offsetHSL(rand(-.025,.025),0,rand(-.05,.05)));
 const trousers=material(type==='ogrenci'?0x334c69:type==='turist'?0xc0ae7d:0x333940);
 oval(body,coat,0,1.17,0,.235,.32,.135);oval(body,trousers,0,.88,0,.18,.14,.12);
 block(body,white,0,1.27,.123,.10,.30,.018);
 if(type==='isadami'){block(body,material(0x9a3432),0,1.28,.145,.035,.24,.012);}
 if(type==='teyze')oval(body,coat,0,.91,0,.26,.37,.17);
 const limbs=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.105,.88,0);body.add(leg);oval(leg,trousers,0,-.19,0,.085,.23,.09);
  const knee=new THREE.Group();knee.position.y=-.38;leg.add(knee);oval(knee,type==='turist'?skin:trousers,0,-.19,0,.065,.22,.07);oval(knee,dark,0,-.43,.055,.075,.055,.14);
  const arm=new THREE.Group();arm.position.set(side*.225,1.38,0);body.add(arm);oval(arm,coat,side*.02,-.14,0,.075,.18,.075);
  const elbow=new THREE.Group();elbow.position.set(side*.02,-.29,0);arm.add(elbow);oval(elbow,type==='taksici'||type==='turist'?skin:coat,0,-.12,0,.054,.15,.058);oval(elbow,skin,0,-.27,0,.049,.065,.037);
  limbs.push({leg,knee,arm,elbow});
 }
 oval(body,skin,0,1.49,0,.065,.10,.065);
 const head=new THREE.Group();head.position.y=1.65;body.add(head);oval(head,skin,0,0,0,.119,.15,.115);
 for(const s of [-1,1]){oval(head,skin,s*.119,-.01,0,.025,.039,.025);oval(head,white,s*.044,.024,.102,.026,.015,.012);oval(head,dark,s*.044,.024,.114,.009,.010,.005);block(head,hair,s*.044,.054,.106,.048,.009,.012);}
 oval(head,skin,0,-.008,.119,.022,.034,.025);block(head,material(0x995b50),0,-.069,.102,.044,.008,.01);
 if(type!=='emekli')oval(head,hair,0,.104,-.017,.123,.068,.113);
 if(type==='ogrenci'){oval(head,hair,0,-.02,-.084,.127,.19,.067);oval(head,hair,.07,.12,-.09,.073,.07,.07);}
 if(['balikci','taksici','emekli'].includes(type))oval(head,hair,0,-.045,.112,.057,.016,.014);
 if(type==='isadami')oval(head,hair,0,-.099,.054,.09,.048,.062);
 if(type==='teyze'){const scarf=pattern('floral','#984f65');oval(head,scarf,0,.04,-.04,.148,.17,.12);oval(head,scarf,0,-.16,-.04,.16,.09,.13);body.rotation.x=.09;}
 if(type==='turist'||type==='balikci'){const hat=material(type==='turist'?0xd1b77b:0x5e6559);oval(head,hat,0,.14,0,.17,.022,.17);oval(head,hat,0,.18,-.01,.12,.065,.12);}
 if(type==='emekli')for(const s of [-1,1]){const o=new THREE.Mesh(new THREE.TorusGeometry(.035,.004,6,16),dark);o.position.set(s*.045,.025,.12);head.add(o);}
 const hand=limbs[1].elbow;
 if(['ogrenci','lise'].includes(type)){oval(body,material(0x884c3e),0,1.19,-.17,.19,.23,.09);for(const s of [-1,1])block(body,dark,s*.14,1.25,.13,.026,.33,.022);}
 if(type==='ogrenci'){block(hand,dark,0,-.27,.055,.065,.115,.013);limbs[1].elbow.rotation.x=-.8;}
 if(type==='isadami'){block(hand,material(0x47362b),0,-.43,0,.27,.21,.075);rod(hand,dark,v(-.05,-.33,0),v(.05,-.33,0));}
 if(type==='teyze'){const bag=oval(hand,pattern('check','#b9a989'),0,-.45,0,.13,.18,.09);bag.material.wireframe=true;rod(hand,white,v(0,-.27,0),v(0,-.36,0));}
 if(type==='turist'){block(body,dark,0,1.12,.18,.16,.10,.07);oval(body,dark,0,1.12,.23,.044,.044,.035);for(const s of [-1,1])rod(body,dark,v(s*.08,1.16,.18),v(s*.1,1.46,.08),.008);block(hand,white,0,-.25,.05,.21,.17,.008);}
 if(type==='balikci'){rod(body,material(0x806140),v(.28,.83,-.12),v(.32,2.25,-.45),.009);rod(body,white,v(.32,2.25,-.45),v(.32,1.4,-.55),.002);}
 if(type==='emekli'){block(hand,white,0,-.26,.06,.23,.28,.012);for(let i=0;i<8;i++)block(hand,dark,0,-.16-i*.025,.069,.19,.004,.001);const beads=material(0x733a22);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;oval(limbs[0].elbow,beads,Math.cos(a)*.035,-.33+Math.sin(a)*.06,0,.008,.009,.008);}}
 if(type==='taksici'){rod(hand,white,v(0,-.28,0),v(0,-.36,0),.009);block(hand,dark,0,-.37,0,.035,.05,.018);}
 root.scale.set(rand(.94,1.08),type==='teyze'?rand(.88,.93):rand(.96,1.06),1);
 return {root,body,head,limbs};
}
function animalModel(type){
 const root=new THREE.Group(),orange=material(0xc77b32),fur=material(0x6e3c21),wings=[];let tail;
 if(type==='kedi'){
  oval(root,orange,0,.22,0,.12,.13,.26);oval(root,orange,0,.36,.22,.12,.11,.11);
  for(const s of [-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.052,.11,3),orange);ear.position.set(s*.075,.46,.21);root.add(ear);oval(root,white,s*.045,.38,.315,.027,.018,.009);oval(root,dark,s*.045,.38,.325,.007,.014,.006);for(const z of [-.17,.16])oval(root,orange,s*.085,.10,z,.037,.11,.04);}
  oval(root,material(0xd58d80),0,.34,.33,.018,.013,.012);
  for(let i=0;i<5;i++)oval(root,fur,0,.31,-.17+i*.065,.115,.02,.016);
  tail=new THREE.Group();tail.position.set(0,.24,-.22);root.add(tail);oval(tail,orange,0,.13,-.1,.035,.18,.035);tail.rotation.x=-.6;
 }else{
  oval(root,white,0,.12,0,.12,.13,.23);oval(root,white,0,.28,.17,.085,.085,.09);const gold=material(0xd4a83a);oval(root,gold,0,.26,.28,.026,.022,.08);
  for(const s of [-1,1]){oval(root,dark,s*.065,.3,.21,.012,.013,.008);const wing=new THREE.Group();wing.position.set(s*.08,.16,0);root.add(wing);oval(wing,white,s*.21,0,-.04,.27,.035,.14);oval(wing,dark,s*.41,0,-.09,.11,.025,.095);wings.push(wing);rod(root,gold,v(s*.055,0,.02),v(s*.055,.1,0),.012);}
 }
 return {root,tail,wings};
}
export function createPeopleSystem(scene,camera){
 const customers=[],queue=[],animals=[],ray=new THREE.Raycaster(),projected=new THREE.Vector3(),delta=new THREE.Vector3();let current=null,clock=0,serial=0;
 const queuePosition=i=>v(1.5+i*.7,0,-2.5-i*.7);
 function arrangeQueue(){queue.forEach((h,i)=>{if(h!==current&&h.state!=='leaving'){h.destination.copy(queuePosition(i));if(h.state==='idle')h.state='walking';}});}
 function spawn(type){
  if(!customerTypes.includes(type))return null;
  const h={...humanoid(type),id:++serial,type,state:'walking',destination:v(0,0,0),phase:rand(0,6),reaction:null,reactionTime:0,arrived:false};
  h.root.position.set(Math.random()<.5?-9:9,0,-4.5);h.route=[v(h.root.position.x<0?-2:4,0,-3.5)];scene.add(h.root);customers.push(h);queue.push(h);arrangeQueue();return h;
 }
 function setCurrent(h){if(h&&!customers.includes(h))return false;if(current===h)return true;if(current&&current!==h&&current.state!=='leaving'){queue.unshift(current);}current=h;if(h){const i=queue.indexOf(h);if(i>=0)queue.splice(i,1);h.destination.set(0,0,-1.6);h.arrived=false;h.state='walking';}arrangeQueue();return true;}
 function react(h,kind){if(!h||!['happy','angry','pay'].includes(kind))return false;h.reaction=kind;h.reactionTime=0;return true;}
 function leave(h){if(!h||h.state==='leaving')return;h.state='leaving';h.arrived=false;h.route=[v(h.root.position.x<0?-1.3:1.3,0,-2.8)];h.destination.set(Math.random()<.5?-11:11,0,-4.5);const i=queue.indexOf(h);if(i>=0)queue.splice(i,1);if(current===h)current=null;arrangeQueue();}
 function dispose(h){h.root.removeFromParent();const geometries=new Set(),materials=new Set();h.root.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);if(![dark,white,hair].includes(o.material))materials.add(o.material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});}
 function spawnAnimal(type){if(!['kedi','marti'].includes(type))return null;for(const a of [...animals]){dispose(a);animals.splice(animals.indexOf(a),1);}const a={...animalModel(type),type,state:'approach',age:0,timer:9,stolen:false,start:v(type==='kedi'?3:-7,type==='kedi'?0:5,-3),target:v(type==='kedi'?.22:-.3,type==='kedi'?1.04:1.4,type==='kedi'?-.59:-.98)};a.root.position.copy(a.start);scene.add(a.root);animals.push(a);return a;}
 function shooAnimal(){const a=animals[0];if(!a||a.state==='flee')return false;a.state='flee';a.age=0;a.start.copy(a.root.position);return true;}
 function animalStolen(){const a=animals[0];if(!a||a.state!=='perched')return null;a.stolen=true;shooAnimal();return a.type==='kedi'?'peynir':'simit';}
 function update(dt){
  clock+=dt;
  for(let i=customers.length-1;i>=0;i--){const h=customers[i],p=h.root.position,target=h.route.length?h.route[0]:h.destination;delta.subVectors(target,p);delta.y=0;const distance=delta.length(),walking=distance>.035;
   if(walking){const speed=Math.min(distance,dt*.95);p.addScaledVector(delta,speed/distance);const angle=Math.atan2(delta.x,delta.z),diff=Math.atan2(Math.sin(angle-h.root.rotation.y),Math.cos(angle-h.root.rotation.y));h.root.rotation.y+=diff*(1-Math.exp(-dt*7));h.phase+=dt*7;}
   else if(h.route.length)h.route.shift();
   else if(h.state==='leaving'){dispose(h);customers.splice(i,1);continue;}
   else{h.state='idle';h.arrived=true;const angle=Math.atan2(-p.x,.35-p.z);h.root.rotation.y+=Math.atan2(Math.sin(angle-h.root.rotation.y),Math.cos(angle-h.root.rotation.y))*(1-Math.exp(-dt*4));}
   h.body.position.y=walking?Math.abs(Math.sin(h.phase))*.025:Math.sin(clock*2+h.phase)*.007;h.body.rotation.z=walking?0:Math.sin(clock*.8+h.phase)*.017;
   h.head.rotation.y=walking?Math.sin(clock)*.06:THREE.MathUtils.clamp(Math.atan2(camera.parent.position.x-p.x,camera.parent.position.z-p.z)-h.root.rotation.y,-.5,.5);
   h.head.rotation.x=0;
   h.limbs.forEach((l,j)=>{const swing=walking?Math.sin(h.phase+j*Math.PI)*.5:0;l.leg.rotation.x=swing;l.knee.rotation.x=Math.max(0,-swing)*.7;l.arm.rotation.set(-swing*.65,0,0);l.elbow.rotation.set(h.type==='ogrenci'&&j===1?-.8:-.12,0,0);});
   if(h.reaction){h.reactionTime+=dt;const t=h.reactionTime;if(h.reaction==='happy'){h.head.rotation.x=Math.sin(t*9)*.16;h.limbs[1].arm.rotation.z=-2.3;h.limbs[1].elbow.rotation.x=Math.sin(t*12)*.35;h.body.position.y+=Math.max(0,Math.sin(t*7))*.045;}if(h.reaction==='angry'){h.head.rotation.y=Math.sin(t*11)*.25;h.limbs.forEach((l,j)=>{l.arm.rotation.x=-.7;l.arm.rotation.z=j?.5:-.5;l.elbow.rotation.x=-1.4;});}if(h.reaction==='pay'){h.limbs[1].arm.rotation.x=-1.1;h.limbs[1].elbow.rotation.x=-.35;}if(t>2)h.reaction=null;}
  }
  for(let i=animals.length-1;i>=0;i--){const a=animals[i];a.age+=dt;if(a.state==='approach'){const t=Math.min(1,a.age/3);a.root.position.lerpVectors(a.start,a.target,t);if(a.type==='kedi')a.root.position.y=a.age<1.8?0:Math.sin((t-.6)/.4*Math.PI)*.35+(t-.6)/.4*1.04;else a.root.position.y+=Math.sin(t*Math.PI)*.5;a.root.rotation.y=Math.atan2(a.target.x-a.start.x,a.target.z-a.start.z);if(t===1){a.state='perched';a.age=0;a.root.position.copy(a.target);}}else if(a.state==='perched'){a.timer=Math.max(0,a.timer-dt);a.root.rotation.x=Math.sin(clock*5)*.05;}else{a.root.position.x+=dt*3;a.root.position.z-=dt*2;a.root.position.y=a.type==='marti'?a.start.y+a.age*2:Math.max(0,a.start.y-a.age*2);a.root.rotation.y=2.2;if(a.age>3){dispose(a);animals.splice(i,1);continue;}}if(a.tail)a.tail.rotation.z=Math.sin(clock*5)*.4;a.wings.forEach((w,j)=>w.rotation.z=(j?1:-1)*(a.state==='perched'?.25:Math.sin(clock*15)*.7));}
 }
 function reset(){for(const h of [...customers,...animals])dispose(h);customers.length=0;queue.length=0;animals.length=0;current=null;clock=0;}
 function releaseCurrent(h){if(current===h)current=null;}
 function headScreenPosition(h){if(!h||!customers.includes(h))return null;h.head.getWorldPosition(projected);projected.y+=.26;projected.project(camera);return {x:(projected.x*.5+.5)*innerWidth,y:(.5-projected.y*.5)*innerHeight,visible:projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1&&Math.abs(projected.y)<1};}
 function pick(ndc){ray.setFromCamera(ndc,camera);for(const a of animals){if(a.state!=='flee'&&ray.intersectObject(a.root,true).length)return a;}return null;}
 return {spawn,setCurrent,reset,releaseCurrent,arrangeQueue,queuePosition,react,leave,spawnAnimal,shooAnimal,animalStolen,update,headScreenPosition,pick,customers,queue,animals,get current(){return current;},get animalTimer(){return animals[0]?.timer??0;}};
}
