// The Learning Universe: a 3D armillary of rings around the 99 Names. three.js, vendored locally.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $=s=>document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW=Math.min(innerWidth,innerHeight)<700||/iPhone|Android/i.test(navigator.userAgent);
const FONT="-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,'Segoe UI',Roboto,sans-serif";

// ---------- content ----------
const FIELDS=[['Art','#ff375f','Visual art, illustration, photography'],['Film','#ff9f0a','Writing, directing, post-production'],['Music','#bf5af2','Performance, composition, sound'],['Sports','#ff6b2c','Playing, coaching, sport business'],['Technology','#0a84ff','Software, hardware, AI and data'],['Business','#ffb340','Enterprise, finance, operations'],['Environment','#30d158','Conservation, energy, agriculture'],['Health','#ff2d92','Healthcare, nutrition, wellbeing'],['Innovation','#ffd60a','Research, invention, entrepreneurship'],['Travel','#64d2ff','Tourism, pilgrimage and heritage'],['Social Media','#da8fff','Creators, community, ethical media'],['Space','#5e5ce6','Space science, exploration, satellites'],['Media','#ff453a','Journalism, broadcasting, writing'],['Fashion','#ff6482','Design, textiles, retail'],['Science','#40c8e0','Natural, life and applied sciences'],['Government','#ffcc66','Law, policy, community'],['Education','#409cff','Teaching, curriculum, training'],['Food','#a2e05a','Cuisine, festivals, recipes'],['Architecture & Design','#5ac8c8','Buildings, pattern, design'],['Literature','#9d8cff','Novels, poetry, stories']];
// Provisional list (from Leon's reference image) pending Golden Age Sciences; the 18th is unnamed because the image repeats 'Grammar'.
const ICON={"Qur'an":"M3 6c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5v12c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z M12 6.5v12","Hadith":"M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4z M6 4a2 2 0 0 0-2 2v1h2 M9 9h6 M9 12h6 M9 15h4","Fiqh":"M12 3v18 M5 21h14 M4 7h16 M6 7l-3 7a3 3 0 0 0 6 0z M18 7l-3 7a3 3 0 0 0 6 0z","Usul al-Fiqh":"M12 21V11 M12 11L6 5 M12 11l6-6 M12 15l-4-3 M12 15l4-3","Aqidah":"M12 2l2.6 4.2L19 4.8l-1.4 4.6L22 12l-4.4 2.6L19 19.2l-4.4-1.4L12 22l-2.6-4.2L5 19.2l1.4-4.6L2 12l4.4-2.6L5 4.8l4.4 1.4z","Tafsir":"M4 6h9 M4 10h6 M4 14h5 M16 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 15l3 3","Grammar":"M15 3l6 6-9 9H6v-6z M13 5l6 6 M6 18l-3 3","To confirm":"M12 3a9 9 0 1 0 .01 0 M12 8v.01 M12 12v4","Logic":"M6 6a2 2 0 1 0 .01 0 M18 6a2 2 0 1 0 .01 0 M12 18a2 2 0 1 0 .01 0 M7.5 7.5l3.5 9 M16.5 7.5l-3.5 9 M8 6h8","Maths":"M4 20L12 4l8 16z M8 14h8 M12 4v16","Medicine":"M5 11h14l-1.5 6a3 3 0 0 1-3 2h-5a3 3 0 0 1-3-2z M14 11l5-7 M3 11h18","Astronomy":"M12 3a9 9 0 1 0 .01 0 M12 7a5 5 0 1 0 .01 0 M3 12h18 M12 3v18","Geography":"M12 3a9 9 0 1 0 .01 0 M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18","History":"M6 3h12 M6 21h12 M7 3c0 5 10 5 10 9s-10 4-10 9 M17 3c0 5-10 5-10 9s10 4 10 9","Philosophy":"M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z","Ethics":"M12 20s-7-4.4-8.6-9C2.3 7.6 4.6 5 7.4 5c1.9 0 3.4 1.2 4.6 2.8C13.2 6.2 14.7 5 16.6 5c2.8 0 5.1 2.6 4 6-1.6 4.6-8.6 9-8.6 9z","Arts":"M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z","Other sciences":"M12 3a9 9 0 1 0 .01 0 M8 12h.01 M12 12h.01 M16 12h.01"};
const SCI=["Qur'an","Hadith","Fiqh","Usul al-Fiqh","Aqidah","Tafsir","Grammar","To confirm","Logic","Maths","Medicine","Astronomy","Geography","History","Philosophy","Ethics","Arts","Other sciences"];
const BOOK=ICON["Qur'an"];
const LAYERS={
 core:{k:'The centre',h:'The 99 Names',sub:'al-Asma al-Husna',t:'Something of the 99 Names of Allah. The Names create reality; everything here grows out from them.',c:'#ffd27a'},
 course:{k:'Ring one',h:'Course Journey',t:'Five books, a guided journey for anyone who wants to walk it. Titles to come.',c:'#f2c45a',r:5.2,tilt:[0.42,0,0.18],spd:0.10},
 sci:{k:'Ring two',h:'The Islamic Sciences',t:'Eighteen sciences that documented how reality works. A working list, still being confirmed.',c:'#30d158',r:9,tilt:[-0.32,0,-0.36],spd:-0.055},
 cult:{k:'Ring three',h:'Culture',t:'Twenty fields where it all flows out into what people make. Tap a planet to open its finds.',c:'#ff7a3d',r:15,tilt:[0.12,0,0.06],spd:0.028},
 path:{k:'Ring four · coming later',h:'Pathways',t:'Ways into each field. Not built yet.',c:'#64d2ff',r:20,tilt:[1.05,0,0.3],spd:-0.012},
 guild:{k:'Ring five · coming later',h:'Guilds & Jobs',t:'The work and the people around each field. Not built yet.',c:'#e8c27a',r:23,tilt:[-0.5,0,1.15],spd:0.008}};

// ---------- renderer ----------
const canvas=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!LOW,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,LOW?1.5:2));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.05,2000);
camera.position.set(0,14,46);if(innerWidth<innerHeight)camera.position.multiplyScalar(1.55);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=0.06;controls.minDistance=1.2;controls.maxDistance=120;
controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI;controls.rotateSpeed=0.6;controls.zoomSpeed=0.8;
controls.autoRotate=!RM;controls.autoRotateSpeed=0.25;
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/(LOW?2:1),innerHeight/(LOW?2:1)),0.62,0.45,0.82);composer.addPass(bloom);
composer.addPass(new OutputPass());
const TL=new THREE.TextureLoader();
const tex=(u,srgb=true)=>{const t=TL.load(u);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t};

// ---------- sky ----------
{const sky=new THREE.Mesh(new THREE.SphereGeometry(900,48,32),new THREE.MeshBasicMaterial({map:tex('data/tex/nebula.jpg'),side:THREE.BackSide,color:0x777788}));scene.add(sky)}
const N=LOW?9000:22000;const sg=new THREE.BufferGeometry();const sp=new Float32Array(N*3),ss=new Float32Array(N),sph=new Float32Array(N),sc=new Float32Array(N*3);
for(let i=0;i<N;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=180+Math.random()*600,q=Math.sqrt(1-u*u);sp.set([Math.cos(a)*q*r,u*r,Math.sin(a)*q*r],i*3);ss[i]=Math.pow(Math.random(),5)*3.2+0.6;sph[i]=Math.random()*6.28;const w=Math.random();sc.set(w<.15?[1,.85,.7]:w<.3?[.75,.85,1]:[1,1,1],i*3)}
sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('size',new THREE.BufferAttribute(ss,1));sg.setAttribute('phase',new THREE.BufferAttribute(sph,1));sg.setAttribute('color',new THREE.BufferAttribute(sc,3));
const starMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},pr:{value:renderer.getPixelRatio()}},
 vertexShader:`attribute float size;attribute float phase;attribute vec3 color;uniform float t;uniform float pr;varying float vA;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float tw=.65+.35*sin(t*1.7+phase*3.);vA=tw;vC=color;gl_PointSize=size*pr*(1.+.0*tw);}`,
 fragmentShader:`varying float vA;varying vec3 vC;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float a=smoothstep(.5,.0,d);gl_FragColor=vec4(vC*a*vA*0.85,a*vA);}`});
scene.add(new THREE.Points(sg,starMat));

// ---------- helpers ----------
function glowTex(col){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,col);gr.addColorStop(.25,col+'88');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function iconTex(d,stroke='#ffffff'){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.scale(128/24*0.62,128/24*0.62);g.translate(7.35,7.35);g.strokeStyle=stroke;g.lineWidth=1.35;g.lineCap='round';g.lineJoin='round';g.stroke(new Path2D(d));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function bandTex(text,col){const c=document.createElement('canvas');c.width=4096;c.height=128;const g=c.getContext('2d');g.clearRect(0,0,4096,128);
 g.font=`600 58px ${FONT}`;g.textBaseline='middle';g.fillStyle=col;const unit='   '+text.toUpperCase().split('').join('\u200A')+'   ·';const w=g.measureText(unit).width;const n=Math.max(1,Math.round(4096/w));const sc=4096/(w*n);g.save();g.scale(sc,1);for(let i=0;i<n;i++)g.fillText(unit,i*w,66);g.restore();
 g.fillStyle=col;g.globalAlpha=.55;g.fillRect(0,6,4096,2.5);g.fillRect(0,120,4096,2.5);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return t}
const pickables=[];const labels=[];const lbRoot=$('#labels');
function addLabel(obj,html,cls,info,opts={}){const el=document.createElement('div');el.className='lb '+cls;el.innerHTML=html;lbRoot.appendChild(el);labels.push({obj,el,info,off:opts.off||0,near:opts.near||8,far:opts.far||70,base:opts.base||1});return el}

// ---------- core ----------
const core=new THREE.Group();scene.add(core);
const sunMat=new THREE.SpriteMaterial({map:tex('data/tex/sun.png'),color:0xffffff,depthWrite:false});const sun=new THREE.Sprite(sunMat);sun.scale.set(6.2,6.2,1);core.add(sun);
const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('#ffb347'),blending:THREE.AdditiveBlending,depthWrite:false,opacity:.4}));halo.scale.set(10,10,1);core.add(halo);
// calligraphy ring (al-Asma al-Husna), slow-turning
{const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.translate(512,512);g.fillStyle='rgba(255,236,190,0.9)';g.font=`600 46px 'Geeza Pro','Noto Naskh Arabic','Amiri','Times New Roman',serif`;g.textAlign='center';g.textBaseline='middle';
 const txt='الأسماء الحسنى ۞ ';for(let k=0;k<4;k++){g.save();g.rotate(k*Math.PI/2);g.translate(0,-420);g.fillText(txt,0,0);g.restore()}
 g.strokeStyle='rgba(255,220,150,.5)';g.lineWidth=2;g.beginPath();g.arc(0,0,470,0,Math.PI*2);g.stroke();g.beginPath();g.arc(0,0,372,0,Math.PI*2);g.stroke();
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:.55}));m.name='calli';core.add(m);core.userData.calli=m}
const coreHit=new THREE.Mesh(new THREE.SphereGeometry(2.4,24,16),new THREE.MeshBasicMaterial({visible:false}));coreHit.userData={layer:'core',name:'The 99 Names'};core.add(coreHit);pickables.push(coreHit);
addLabel(core,'The 99 Names<small>al-Asma al-Husna</small>','core',coreHit.userData,{off:-3.6,near:4,far:140});
const light=new THREE.PointLight(0xffe2b0,1100,0,2);scene.add(light);scene.add(new THREE.AmbientLight(0x30324a,0.55));

// ---------- rings ----------
const rings={};
function makeRing(key){const L=LAYERS[key];const pivot=new THREE.Group();pivot.rotation.set(...L.tilt);const spin=new THREE.Group();pivot.add(spin);scene.add(pivot);
 const faint=key==='path'||key==='guild';
 const tor=new THREE.Mesh(new THREE.TorusGeometry(L.r,faint?0.03:0.045,8,320),new THREE.MeshBasicMaterial({color:new THREE.Color(L.c).multiplyScalar(faint?1:1.6),transparent:true,opacity:faint?.18:.85}));tor.rotation.x=Math.PI/2;spin.add(tor);
 const band=new THREE.Mesh(new THREE.CylinderGeometry(L.r*1.0,L.r*1.0,faint?0.55:0.62,320,1,true),new THREE.MeshBasicMaterial({map:bandTex(L.h+(faint?' · coming later':''),L.c),transparent:true,side:THREE.DoubleSide,depthWrite:false,opacity:faint?.28:.95}));
 band.position.y=-0.58;band.material.map.repeat.set(1,1);spin.add(band);
 const sheen=new THREE.Mesh(new THREE.RingGeometry(L.r-0.35,L.r+0.35,256),new THREE.MeshBasicMaterial({color:L.c,transparent:true,opacity:faint?.035:.07,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));sheen.rotation.x=Math.PI/2;spin.add(sheen);
 const hit=new THREE.Mesh(new THREE.TorusGeometry(L.r,0.5,6,120),new THREE.MeshBasicMaterial({visible:false}));hit.rotation.x=Math.PI/2;hit.userData={layer:key,name:L.h,ring:true};spin.add(hit);pickables.push(hit);
 rings[key]={pivot,spin,L,band};return spin}
// course ring + books
{const s=makeRing('course');const gm=new THREE.MeshStandardMaterial({color:0xf2c45a,metalness:.9,roughness:.25,emissive:0x5a3a08,emissiveIntensity:.6});
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const g=new THREE.Group();g.position.set(Math.cos(a)*LAYERS.course.r,0,Math.sin(a)*LAYERS.course.r);
  const b=new THREE.Mesh(new THREE.BoxGeometry(.62,.82,.16),gm);g.add(b);const pg=new THREE.Mesh(new THREE.BoxGeometry(.56,.76,.17),new THREE.MeshStandardMaterial({color:0xfff6e0,roughness:.6}));pg.position.x=.04;g.add(pg);
  const ic=new THREE.Sprite(new THREE.SpriteMaterial({map:iconTex(BOOK,'#ffe6a8'),transparent:true,depthWrite:false}));ic.scale.set(.0001,.0001,1);g.add(ic);
  b.userData={layer:'course',name:'Book '+(i+1),desc:'One of five books on the Course Journey. Title to come.'};pickables.push(b);s.add(g);addLabel(g,'Book '+(i+1),'bk',b.userData,{off:.75,near:3,far:42})}}
// sciences ring: glass tiles with icon sprites
const sciBodies=[];
{const s=makeRing('sci');const glass=new THREE.MeshPhysicalMaterial({color:0x1db36b,metalness:0,roughness:.12,transmission:LOW?0:.55,thickness:.4,transparent:true,opacity:LOW?.78:.9,clearcoat:1,clearcoatRoughness:.08,emissive:0x0b5a33,emissiveIntensity:.35,ior:1.4});
 const geo=new THREE.BoxGeometry(1.15,1.15,.22);
 SCI.forEach((n,i)=>{const a=i/18*Math.PI*2;const g=new THREE.Group();g.position.set(Math.cos(a)*LAYERS.sci.r,0,Math.sin(a)*LAYERS.sci.r);
  const tile=new THREE.Mesh(geo,glass);tile.userData={layer:'sci',name:n,desc:'One of the Islamic sciences on the working list of eighteen.'};g.add(tile);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xbfffe0,transparent:true,opacity:.55}));g.add(edge);
  const ic=new THREE.Sprite(new THREE.SpriteMaterial({map:iconTex(ICON[n]),transparent:true,depthWrite:false,color:0xffffff}));ic.scale.set(.95,.95,1);g.add(ic);
  g.userData.tile=tile;s.add(g);pickables.push(tile);sciBodies.push(g);addLabel(g,n,'sci',tile.userData,{off:.85,near:3,far:80})})}
// culture ring: planets
const planets=[];
{const s=makeRing('cult');
 FIELDS.forEach(([n,col,sub],i)=>{const a=i/20*Math.PI*2;const g=new THREE.Group();g.position.set(Math.cos(a)*LAYERS.cult.r,0,Math.sin(a)*LAYERS.cult.r);
  const R=.95+((i*37)%5)*.06;const m=new THREE.Mesh(new THREE.SphereGeometry(R,LOW?40:64,LOW?28:48),new THREE.MeshStandardMaterial({map:tex(`data/tex/p${String(i).padStart(2,'0')}.jpg`),roughness:.85,metalness:0,emissive:new THREE.Color(col),emissiveIntensity:.05}));
  m.rotation.z=.35;m.userData={layer:'cult',name:n,desc:sub+'.',field:n,color:col};g.add(m);
  const atm=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,depthWrite:false,opacity:.55}));atm.scale.set(R*3.4,R*3.4,1);g.add(atm);
  g.userData.planet=m;s.add(g);pickables.push(m);planets.push(g);addLabel(g,n,'pl',m.userData,{off:R+.35,near:4,far:80})})}
makeRing('path');makeRing('guild');

// ---------- lightning ----------
const bolts=[];const boltGroup=new THREE.Group();scene.add(boltGroup);
const wp=(o)=>o.getWorldPosition(new THREE.Vector3());
function jag(a,b,depth,disp,out){if(depth===0){out.push(b.clone());return}const m=a.clone().lerp(b,.5);const d=b.clone().sub(a);const len=d.length();const r=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(len*disp*(Math.random()*.9+.3));m.add(r);jag(a,m,depth-1,disp,out);jag(m,b,depth-1,disp,out)}
function boltLine(pts,col,op){const g=new THREE.BufferGeometry().setFromPoints(pts);const m=new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});m.userData.o=op;return new THREE.Line(g,m)}
function spawnBolt(){const si=sciBodies[Math.floor(Math.random()*18)],pl=planets[Math.floor(Math.random()*20)];const A=new THREE.Vector3(0,0,0),B=wp(si),Cc=wp(pl);
 const dir=B.clone().normalize();A.copy(dir.multiplyScalar(2.6));
 const grp=new THREE.Group();const chain=Math.random()<.7?[A,B,Cc]:[A,B];
 for(let k=0;k<chain.length-1;k++){const pts=[chain[k].clone()];jag(chain[k],chain[k+1],6,.17,pts);
  grp.add(boltLine(pts,new THREE.Color(3.2,2.6,1.6),1));
  const p2=pts.map(p=>p.clone().add(new THREE.Vector3((Math.random()-.5)*.06,(Math.random()-.5)*.06,(Math.random()-.5)*.06)));grp.add(boltLine(p2,new THREE.Color(1.6,1.1,.5),.7));
  for(let b=0;b<3;b++){const s=pts[Math.floor(pts.length*(.2+Math.random()*.6))];const e=s.clone().add(new THREE.Vector3((Math.random()-.5),(Math.random()-.5),(Math.random()-.5)).multiplyScalar(1.6+Math.random()*2));const bp=[s.clone()];jag(s,e,4,.22,bp);grp.add(boltLine(bp,new THREE.Color(1.8,1.4,.8),.6))}}
 const flash=new THREE.PointLight(0xffd9a0,40,12,2);flash.position.copy(B);grp.add(flash);
 boltGroup.add(grp);bolts.push({grp,t:0,life:.22+Math.random()*.25,flick:Math.random()*10})}
let boltOn=!RM,boltTimer=0;

// ---------- camera travel ----------
let fly=null;const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function flyTo(pos,target,dur=2.2){if(innerWidth<innerHeight){pos=target.clone().add(pos.clone().sub(target).multiplyScalar(1.8))}if(RM){camera.position.copy(pos);controls.target.copy(target);controls.update();return}fly={p0:camera.position.clone(),t0:controls.target.clone(),p1:pos.clone(),t1:target.clone(),t:0,d:dur}}
let follow=null;
function focusBody(o){const ud=o.userData;const w=wp(o);const L=LAYERS[ud.layer];
 const dist=ud.layer==='cult'?4.6:ud.layer==='sci'?3.6:ud.layer==='course'?3:ud.layer==='core'?12:L.r*1.6;
 const out=w.clone().normalize();if(out.lengthSq()<.01)out.set(0,0,1);const pos=w.clone().add(out.multiplyScalar(dist)).add(new THREE.Vector3(0,dist*.35,0));
 flyTo(pos,w);follow=ud.ring||ud.layer==='core'?null:o;controls.autoRotate=false;showCard(ud)}
function showCard(ud){const L=LAYERS[ud.layer];$('#card').hidden=false;$('#cardK').textContent=ud.ring?L.k:L.k+' · '+L.h;$('#cardH').textContent=ud.name;$('#cardT').textContent=ud.ring||ud.layer==='core'?L.t:ud.desc;
 const go=$('#cardGo');if(ud.field){go.hidden=false;go.href='index.html#/field/'+encodeURIComponent(ud.field)}else go.hidden=true}
$('#cardX').onclick=()=>{$('#card').hidden=true;follow=null;flyTo(new THREE.Vector3(0,14,46),new THREE.Vector3());controls.autoRotate=!RM};

// ---------- picking / HUD ----------
const ray=new THREE.Raycaster();const mouse=new THREE.Vector2();let hover=null,downAt=null;
function pick(e){mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(mouse,camera);const h=ray.intersectObjects(pickables,false);const body=h.find(x=>!x.object.userData.ring);return (body||h[0])?.object||null}
canvas.addEventListener('pointermove',e=>{const o=pick(e);if(o!==hover){hover=o;canvas.style.cursor=o?'pointer':'grab';hud(o?o.userData:null)}});
canvas.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];if(tour.on)return;controls.autoRotate=false});
canvas.addEventListener('pointerup',e=>{if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(moved>6||tour.on)return;const o=pick(e);if(o)focusBody(o)});
function hud(ud){if(!ud){$('#hudK').textContent='You’re looking at';$('#hudH').textContent=nearestLayer();$('#hudT').textContent='Drag to turn it. Go above, below, even inside the rings. Tap anything.';return}
 const L=LAYERS[ud.layer];$('#hudK').textContent=ud.ring?L.k:L.h;$('#hudH').textContent=ud.name;$('#hudT').textContent=ud.ring||ud.layer==='core'?L.t:ud.desc}
function nearestLayer(){const d=camera.position.distanceTo(controls.target)+controls.target.length();if(d<7)return'The 99 Names';if(d<12)return'Course Journey';if(d<19)return'The Islamic Sciences';if(d<30)return'Culture';return'The whole universe'}
// legend
$('#legend').innerHTML=['core','course','sci','cult','path','guild'].map(k=>`<button data-k="${k}"><i style="color:${LAYERS[k].c};background:${LAYERS[k].c}"></i>${LAYERS[k].h}${k==='path'||k==='guild'?'<small>later</small>':''}</button>`).join('');
$('#legend').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;if(k==='core'){focusBody(coreHit);return}const R=rings[k];focusRing(k)};
function focusRing(k){const R=rings[k];const n=new THREE.Vector3(0,1,0).applyQuaternion(R.pivot.quaternion);const pos=n.clone().multiplyScalar(R.L.r*1.25).add(new THREE.Vector3(R.L.r*.9,0,R.L.r*.9));flyTo(pos,new THREE.Vector3());follow=null;controls.autoRotate=false;showCard({layer:k,name:R.L.h,ring:true})}

// ---------- tour ----------
const TOUR=[
 {l:'core',k:'The centre',h:'Something of the 99 Names.',t:'The Names create reality. Everything you see grows out from this light.',cam:[0,1.2,7.5],tg:[0,0,0]},
 {l:'course',k:'Ring one',h:'The Course Journey.',t:'A golden ring of five books circles the centre: a guided journey anyone can walk.',cam:[5,3.4,9.5],tg:[0,0,0],body:()=>null},
 {l:'sci',k:'Ring two',h:'The Islamic Sciences.',t:'Eighteen glass tiles on a tilted green orbit. They documented how that reality works.',body:()=>sciBodies[0],d:3.2},
 {l:'sci',k:'Ring two, from below',h:'Rings that pass through each other.',t:'Each ring turns on its own axis, so the layers weave through one another, like an armillary sphere.',cam:[3,-11,13],tg:[0,0,0]},
 {l:'cult',k:'Ring three',h:'Culture.',t:'Twenty planets, one for every field. From the sciences, the light flows out into everything people make.',body:()=>planets[2],d:4.8},
 {l:'cult',k:'Watch the light',h:'Every link is alive.',t:'Arcs of light run from the centre, through a science, out to a field. Tap any planet to open its finds.',cam:[22,9,24],tg:[0,0,0]},
 {l:'path',k:'Coming later',h:'Pathways, then guilds and jobs.',t:'The two faint outer rings: ways into each field, and the work around them.',cam:[0,30,44],tg:[0,0,0]},
 {l:'core',k:'The way back',h:'Every find leads home.',t:'Follow any planet inward, through its science, back to the Names.',cam:[0,3,9],tg:[0,0,0]}];
const tour={on:false,i:0,timer:0};
function tourShow(i){tour.i=Math.max(0,Math.min(TOUR.length-1,i));const s=TOUR[tour.i];$('#cap').hidden=false;$('#card').hidden=true;$('#capK').textContent=s.k;$('#capH').textContent=s.h;$('#capT').textContent=s.t;
 $('#capDots').innerHTML=TOUR.map((_,k)=>`<i class="${k===tour.i?'on':''}"></i>`).join('');$('#capNext').textContent=tour.i===TOUR.length-1?'Finish':'Next';
 follow=null;if(s.body&&s.body()){const o=s.body();const w=wp(o);const out=w.clone().normalize();flyTo(w.clone().add(out.multiplyScalar(s.d)).add(new THREE.Vector3(0,s.d*.4,0)),w,2.6);follow=o.userData.tile||o.userData.planet?o:null}
 else flyTo(new THREE.Vector3(...s.cam),new THREE.Vector3(...s.tg),2.8);tour.timer=0}
function tourStart(){tour.on=true;controls.autoRotate=false;$('#legend').style.opacity=.0;$('#hud').style.opacity=0;tourShow(0)}
function tourEnd(){tour.on=false;$('#cap').hidden=true;$('#legend').style.opacity=1;$('#hud').style.opacity=1;follow=null;flyTo(new THREE.Vector3(0,14,46),new THREE.Vector3());controls.autoRotate=!RM}
$('#tourBtn').onclick=()=>tour.on?tourEnd():tourStart();$('#capNext').onclick=()=>{if(tour.i>=TOUR.length-1)tourEnd();else tourShow(tour.i+1)};$('#capPrev').onclick=()=>tourShow(tour.i-1);$('#capSkip').onclick=tourEnd;
addEventListener('keydown',e=>{if(e.key==='Escape'){if(tour.on)tourEnd();else $('#cardX').click()}if(tour.on&&e.key==='ArrowRight')$('#capNext').click();if(tour.on&&e.key==='ArrowLeft')$('#capPrev').click()});

// ---------- labels projection ----------
const v=new THREE.Vector3();
function updateLabels(){const w=innerWidth,h=innerHeight;for(const L of labels){L.obj.getWorldPosition(v);const d=v.distanceTo(camera.position);
  const up=camera.up.clone();v.addScaledVector(new THREE.Vector3(0,-1,0).applyQuaternion(camera.quaternion),L.off*-1);
  const p=v.clone().project(camera);const behind=p.z>1;let o=behind?0:1;
  const fadeFar=1-THREE.MathUtils.smoothstep(d,L.far*.7,L.far),fadeNear=THREE.MathUtils.smoothstep(d,.6,1.4);o*=fadeFar*fadeNear;
  if(hover&&L.info===hover.userData)o=1;
  if(o<0.02){L.el.style.opacity=0;continue}
  const s=THREE.MathUtils.clamp(14/d,.62,1.7)*L.base;const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
  L.el.style.opacity=o.toFixed(2);L.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0) scale(${s.toFixed(3)})`;L.el.classList.toggle('hl',!!hover&&L.info===hover.userData)}}

// ---------- loop ----------
const clock=new THREE.Clock();let frames=0,fpsT=0;window.__fps=0;
function frame(){const dt=Math.min(clock.getDelta(),.05);const t=clock.elapsedTime;starMat.uniforms.t.value=t;
 if(!RM){for(const k in rings){rings[k].spin.rotation.y+=rings[k].L.spd*dt;rings[k].pivot.rotation.x=rings[k].L.tilt[0]+Math.sin(t*.07+rings[k].L.r)*.06}
  core.userData.calli.rotation.z+=dt*.05;planets.forEach((p,i)=>p.userData.planet.rotation.y+=dt*(.12+i%3*.03));sciBodies.forEach(g=>g.rotation.y+=dt*.2)}
 core.userData.calli.quaternion.copy(camera.quaternion);halo.material.opacity=.36+.05*Math.sin(t*1.3);
 // keep science tiles facing outward-ish & readable
 if(boltOn){boltTimer-=dt;if(boltTimer<=0){const n=1+Math.floor(Math.random()*3);for(let i=0;i<n;i++)spawnBolt();boltTimer=.12+Math.random()*.45}}
 for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.t+=dt;const k=b.t/b.life;const fl=(Math.sin(b.t*90+b.flick)>-.2?1:.25)*(1-k);b.grp.children.forEach(c=>{if(c.material){c.material.opacity=c.material.userData.o*fl}else if(c.isLight)c.intensity=40*fl});
  if(k>=1){boltGroup.remove(b.grp);b.grp.traverse(c=>{c.geometry?.dispose();c.material?.dispose()});bolts.splice(i,1)}}
 if(fly){fly.t+=dt/fly.d;const e=ease(Math.min(fly.t,1));camera.position.lerpVectors(fly.p0,fly.p1,e);controls.target.lerpVectors(fly.t0,fly.t1,e);if(fly.t>=1)fly=null}
 else if(follow){const w=wp(follow);const delta=w.clone().sub(controls.target);controls.target.add(delta);camera.position.add(delta)}
 controls.update();composer.render();updateLabels();
 frames++;fpsT+=dt;if(fpsT>1){window.__fps=Math.round(frames/fpsT);frames=0;fpsT=0}
 requestAnimationFrame(frame)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
hud(null);requestAnimationFrame(frame);
if(new URLSearchParams(location.search).get('tour')==='1')setTimeout(tourStart,600);
window.__U={tourStart,tourShow,tourEnd,focusBody,planets,sciBodies,coreHit,camera,controls,flyTo,THREE,labels,get boltCount(){return bolts.length},get tour(){return tour}};
