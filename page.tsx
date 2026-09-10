'use client';
import {useEffect,useRef,useState} from 'react';
import {LETTER} from '../lib/letter';

type Status='sealed'|'reading'|'paused'|'destroyed'|'expired'|'finished';
const TEST_KEY='carta-v-test';

export default function Home(){
 const test=typeof window!=='undefined'&&new URLSearchParams(location.search).get('test')==='1';
 const [status,setStatus]=useState<Status>('sealed'); const [started,setStarted]=useState(false);
 const [progress,setProgress]=useState(0); const [left,setLeft]=useState(86400); const [music,setMusic]=useState(false);
 const audio=useRef<HTMLAudioElement>(null); const save=useRef<any>(null);

 const loadTest=()=>{try{return JSON.parse(localStorage.getItem(TEST_KEY)||'{}')}catch{return {}}};
 const saveTest=(x:any)=>localStorage.setItem(TEST_KEY,JSON.stringify(x));
 async function boot(){ if(test){const s=loadTest(); if(s.status==='destroyed')return setStatus('destroyed'); if(s.startedAt){const rem=Math.max(0,86400-Math.floor((Date.now()-s.startedAt)/1000));setLeft(rem);setStarted(true);setProgress(s.progress||0);setStatus(rem?('reading'):'expired');}return;}
   const r=await fetch('/api/state',{cache:'no-store'});const s=await r.json();setStatus(s.status);setStarted(s.started);setProgress(s.progress||0);setLeft(s.secondsLeft||86400);
 }
 useEffect(()=>{boot()},[]);
 useEffect(()=>{if(!started||['destroyed','expired'].includes(status))return;const t=setInterval(()=>setLeft(v=>{if(v<=1){setStatus('expired');return 0}return v-1}),1000);return()=>clearInterval(t)},[started,status]);
 useEffect(()=>{const fn=()=>{const ps=[...document.querySelectorAll<HTMLElement>('.para')];const c=innerHeight*.5;let best=Infinity,idx=-1;ps.forEach((p,i)=>{const r=p.getBoundingClientRect();const d=Math.abs((r.top+r.bottom)/2-c);if(d<best){best=d;idx=i}});ps.forEach((p,i)=>p.classList.toggle('active',i===idx)); const max=document.documentElement.scrollHeight-innerHeight;const bar=document.getElementById('bar');if(bar)bar.style.width=(max?scrollY/max*100:0)+'%';
 clearTimeout(save.current); if(started&&status==='reading')save.current=setTimeout(()=>{if(test){const s=loadTest();saveTest({...s,progress:scrollY})}else fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({progress:scrollY})})},500);
 };addEventListener('scroll',fn,{passive:true});setTimeout(()=>{scrollTo(0,progress||0);fn()},180);return()=>removeEventListener('scroll',fn)},[started,status,progress,test]);

 async function open(){setStarted(true);setStatus('reading'); if(test){const s=loadTest();const start=s.startedAt||Date.now();saveTest({...s,startedAt:start,status:'reading'});setLeft(Math.max(0,86400-Math.floor((Date.now()-start)/1000)))}else{const r=await fetch('/api/start',{method:'POST'});const s=await r.json();setLeft(s.secondsLeft);setProgress(s.progress||0);setStatus(s.status)};setTimeout(()=>scrollTo(0,0),250);try{await audio.current?.play();setMusic(true)}catch{}}
 async function pause(){if(test){const s=loadTest();saveTest({...s,status:'paused',progress:scrollY})}else await fetch('/api/pause',{method:'POST'});setStatus('paused')}
 async function resume(){setStatus('reading');setTimeout(()=>scrollTo(0,progress||0),120)}
 async function decide(d:'yes'|'no'){if(d==='no'&&!confirm('Si eliges terminar aquí, la carta dejará de estar disponible. ¿Deseas hacerlo?'))return;if(test){const s=loadTest();saveTest({...s,status:d==='no'?'destroyed':'paused'});setStatus(d==='no'?'destroyed':'paused');return}const r=await fetch('/api/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision:d})});const s=await r.json();setStatus(s.status)}
 function toggleMusic(){if(!audio.current)return;if(audio.current.paused){audio.current.play();setMusic(true)}else{audio.current.pause();setMusic(false)}}
 const time=`${Math.floor(left/3600)} h ${String(Math.floor((left%3600)/60)).padStart(2,'0')} min`;
 const paras=LETTER.split(/\n\s*\n/);

 if(status==='destroyed')return <main className="end"><h1>Esta carta terminó aquí.</h1><p>Gracias por haber leído hasta donde quisiste llegar.</p></main>;
 if(status==='expired')return <main className="end"><h1>Esta carta ya no está disponible.</h1><p>Las 24 horas para leerla terminaron.</p></main>;
 if(status==='paused')return <main className="end"><h1>La carta queda aquí por ahora.</h1><p>Puedes volver desde este mismo enlace mientras el tiempo siga disponible.</p><button onClick={resume}>Volver a la carta</button></main>;
 if(!started)return <main className="cover"><div className="scene"><img src="/portada-carta.png" alt="Pergamino antiguo con vela y libro"/><div className="shade"></div><div className="cover-copy"><span>UNA CARTA PARA TI</span><h1>Hay palabras que solo pueden leerse una vez en la vida</h1><p>Cuando estés lista...</p><button onClick={open}>Abrir carta</button><small>Al abrirla tendrás 24 horas. Puedes continuar más tarde.</small></div></div>{test&&<button className="reset" onClick={()=>{localStorage.removeItem(TEST_KEY);location.reload()}}>Reiniciar prueba</button>}<audio ref={audio} src="/musica.mp3" loop preload="auto"/></main>;
 return <main className="reader"><div id="bar"></div><div className="toolbar"><span>Disponible por {time}</span><div><button onClick={toggleMusic}>{music?'♫':'♪'}</button><button onClick={pause}>Continuar más tarde</button></div></div><div className="chapter"><span>PARTE I</span><h2>Lo que necesitaba que supieras</h2></div><article className="scroll"><div className="roll top"></div><header>Para ti,</header>{paras.map((p,i)=><p key={i} className={`para ${p.startsWith('“')?'quote':''}`}>{p}</p>)}<div className="signature"><small>Con cariño,</small>J.</div><section className="decision"><span>ANTES DE TERMINAR</span><h2>¿Quieres leer la segunda parte?</h2><p>Si esta primera carta te ayudó a entender un poco mejor lo que sentí y todavía deseas conocer lo que falta, puedes continuar. Si prefieres que termine aquí, también lo voy a entender.</p><div><button onClick={()=>decide('yes')}>Sí, quiero continuar</button><button className="danger" onClick={()=>decide('no')}>No, quiero terminar aquí</button></div></section><div className="roll bottom"></div></article><audio ref={audio} src="/musica.mp3" loop preload="auto"/></main>
}