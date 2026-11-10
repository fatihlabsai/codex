// Small synthesized cues; no audio context is created until a user gesture.
export function createAudio(){
 let context=null,muted=false;
 function start(){try{if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)context=new Audio();}if(context?.state==='suspended')context.resume().catch(()=>{});}catch{}}
 function play(kind){if(muted||context?.state!=='running')return;
  const patterns={coin:[1300,1900],tea:[520,420,340],gull:[1000,1500,900],horn:[110,146],cash:[660,880,1320],wrong:[190,140],radio:[392,440,523,440,349,392],whoosh:[600,240,90]};
  const now=context.currentTime;
  (patterns[kind]||patterns.coin).forEach((f,i)=>{const o=context.createOscillator(),g=context.createGain(),t=now+i*.09,d=kind==='horn'?1.2:.22;o.type=kind==='horn'?'sawtooth':'sine';o.frequency.setValueAtTime(f,t);if(kind==='gull'||kind==='whoosh')o.frequency.exponentialRampToValueAtTime(f*.6,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='horn'?.018:.035,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(context.destination);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect();};});
  if(kind==='tea'||kind==='whoosh'){const n=context.createBuffer(1,context.sampleRate*.3,context.sampleRate),data=n.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const src=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain();src.buffer=n;filter.type='lowpass';filter.frequency.value=kind==='tea'?1800:800;g.gain.value=.035;src.connect(filter);filter.connect(g);g.connect(context.destination);src.start();src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};}
 }
 return {start,play,setMuted(value){muted=value;}};
}
