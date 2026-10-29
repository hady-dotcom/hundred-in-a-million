// The Learning Universe: a 3D armillary of rings around the 99 Names. three.js, vendored locally.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $=s=>document.querySelector(s);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW=Math.min(innerWidth,innerHeight)<700||/iPhone|Android/i.test(navigator.userAgent);
const compact=()=>innerWidth<700||innerHeight<500;
const FONT="-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,'Segoe UI',Roboto,sans-serif";

// ---------- content ----------
const FIELDS=[['Art','#ff375f','Visual art, illustration, photography'],['Film','#ff9f0a','Writing, directing, post-production'],['Music','#bf5af2','Performance, composition, sound'],['Sports','#ff6b2c','Playing, coaching, sport business'],['Technology','#0a84ff','Software, hardware, AI and data'],['Business','#ffb340','Enterprise, finance, operations'],['Environment','#30d158','Conservation, energy, agriculture'],['Health','#ff2d92','Healthcare, nutrition, wellbeing'],['Innovation','#ffd60a','Research, invention, entrepreneurship'],['Travel','#64d2ff','Tourism, pilgrimage and heritage'],['Social Media','#da8fff','Creators, community, ethical media'],['Space','#5e5ce6','Space science, exploration, satellites'],['Media','#ff453a','Journalism, broadcasting, writing'],['Fashion','#ff6482','Design, textiles, retail'],['Science','#40c8e0','Natural, life and applied sciences'],['Government','#ffcc66','Law, policy, community'],['Education','#409cff','Teaching, curriculum, training'],['Food','#a2e05a','Cuisine, festivals, recipes'],['Architecture & Design','#5ac8c8','Buildings, pattern, design'],['Literature','#9d8cff','Novels, poetry, stories']];
// Provisional list (from Leon's reference image) pending Golden Age Sciences; the 18th is unnamed because the image repeats 'Grammar'.
const ICON={"Qur'an":"M3 6c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5v12c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z M12 6.5v12","Hadith":"M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4z M6 4a2 2 0 0 0-2 2v1h2 M9 9h6 M9 12h6 M9 15h4","Fiqh":"M12 3v18 M5 21h14 M4 7h16 M6 7l-3 7a3 3 0 0 0 6 0z M18 7l-3 7a3 3 0 0 0 6 0z","Usul al-Fiqh":"M12 21V11 M12 11L6 5 M12 11l6-6 M12 15l-4-3 M12 15l4-3","Aqidah":"M12 2l2.6 4.2L19 4.8l-1.4 4.6L22 12l-4.4 2.6L19 19.2l-4.4-1.4L12 22l-2.6-4.2L5 19.2l1.4-4.6L2 12l4.4-2.6L5 4.8l4.4 1.4z","Tafsir":"M4 6h9 M4 10h6 M4 14h5 M16 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 15l3 3","Grammar":"M15 3l6 6-9 9H6v-6z M13 5l6 6 M6 18l-3 3","To confirm":"M12 3a9 9 0 1 0 .01 0 M12 8v.01 M12 12v4","Logic":"M6 6a2 2 0 1 0 .01 0 M18 6a2 2 0 1 0 .01 0 M12 18a2 2 0 1 0 .01 0 M7.5 7.5l3.5 9 M16.5 7.5l-3.5 9 M8 6h8","Maths":"M4 20L12 4l8 16z M8 14h8 M12 4v16","Medicine":"M5 11h14l-1.5 6a3 3 0 0 1-3 2h-5a3 3 0 0 1-3-2z M14 11l5-7 M3 11h18","Astronomy":"M12 3a9 9 0 1 0 .01 0 M12 7a5 5 0 1 0 .01 0 M3 12h18 M12 3v18","Geography":"M12 3a9 9 0 1 0 .01 0 M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18","History":"M6 3h12 M6 21h12 M7 3c0 5 10 5 10 9s-10 4-10 9 M17 3c0 5-10 5-10 9s10 4 10 9","Philosophy":"M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z","Ethics":"M12 20s-7-4.4-8.6-9C2.3 7.6 4.6 5 7.4 5c1.9 0 3.4 1.2 4.6 2.8C13.2 6.2 14.7 5 16.6 5c2.8 0 5.1 2.6 4 6-1.6 4.6-8.6 9-8.6 9z","Arts":"M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z","Other sciences":"M12 3a9 9 0 1 0 .01 0 M8 12h.01 M12 12h.01 M16 12h.01"};
const SCI=["Qur'an","Hadith","Fiqh","Usul al-Fiqh","Aqidah","Tafsir","Grammar","To confirm","Logic","Maths","Medicine","Astronomy","Geography","History","Philosophy","Ethics","Arts","Other sciences"];
// Ring four: each field's own five sub-pathways (from Leon's reference image; Food, Architecture & Design, Literature and a few fifths filled in sensibly).
const SUBS={Art:['Visual Art','Illustration','Photography','Digital & 3D','Craft & Making'],Film:['Writing','Directing','Performance','Production','Post-production'],Music:['Performance','Composition','Production','Sound Engineering','Events & Media'],Sports:['Playing','Coaching','Performance Science','Sport Business','Fitness'],Technology:['Software','Hardware','AI & Data','Web & Apps','Robotics & Engineering'],Business:['Enterprise','Finance','Operations','Sales','Investment'],Environment:['Conservation','Sustainability','Energy','Agriculture','Urban Planning'],Health:['Healthcare','Nutrition','Mental Health','Fitness','Research & Innovation'],Innovation:['Research','Invention','Entrepreneurship','Incubation','Social Innovation'],Travel:['Tourism','Hospitality','Cultural Exchange','Travel Media','Pilgrimage & Heritage'],'Social Media':['Content Creation','Influencing','Education','Community Building','Ethical Media'],Space:['Space Science','Aerospace','Satellite Technology','Exploration','Space Industry'],Media:['Journalism','Writing','Broadcasting','Dialogue','Marketing & PR'],Fashion:['Fashion Design','Textiles','Manufacturing','Branding','Retail'],Science:['Natural Sciences','Life Sciences','Applied Sciences','Research','Science Communication'],Government:['Law','Policy','Public Service','Community Development','Human Rights'],Education:['Teaching','Curriculum Design','Educational Technology','Training','Research & Policy'],Food:['Cuisine','Baking','Food Heritage','Festivals','Nutrition'],'Architecture & Design':['Architecture','Islamic Pattern','Interior Design','Urban Design','Calligraphy & Type'],Literature:['Poetry','Novels','Translation','Storytelling','Publishing']};
// (old app-verb pathways, kept only as reference), named after what each one does in the app.
const PATHS=[
 ['Discover','M12 3a9 9 0 1 0 .01 0 M15.5 8.5l-2 5-5 2 2-5z','Learn and explore. Scroll real finds from every field, each with its story and sources.'],
 ['Heart','M12 20s-7-4.4-8.6-9C2.3 7.6 4.6 5 7.4 5c1.9 0 3.4 1.2 4.6 2.8C13.2 6.2 14.7 5 16.6 5c2.8 0 5.1 2.6 4 6-1.6 4.6-8.6 9-8.6 9z','Keep what moves you. Every heart goes on your shelf and counts toward your hundred.'],
 ['Try it','M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z','Make something yourself. Free, beginner-friendly starting points for the field.'],
 ['Go there','M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z M12 7.5a2.5 2.5 0 1 0 .01 0','Find it in the world. Museums, places and events where you can see it for real.'],
 ['Connect','M9 5a3 3 0 1 0 .01 0 M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6 M16 5a3 3 0 0 1 0 6 M18 14c2 .6 3.5 2.8 3.5 6','Share and grow. After 100 hearts, meet people who loved 100 things like you. Coming soon.']];
// Ring five: one line icon per field, two real guilds or jobs each, plus the hearts tiers.
const FICON={Art:'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z M7.5 11h.01 M10 7h.01 M15 7.5h.01',Film:'M3 10h18v10H3z M3 10l1.6-4.5 16-2.5.9 3.5 M8.5 5l2.5 4 M14 4.2l2.5 4',Music:'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',Sports:'M12 3a9 9 0 1 0 .01 0 M3.5 9c4 1 8 5 9 11.5 M20.5 9c-4 1-8 5-9 11.5 M7 4.5c2 3 8 3 10 0',Technology:'M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4',Business:'M3 8h18v12H3z M8 8V5h8v3 M3 13h18',Environment:'M5 19c0-9 6-14 15-14 0 9-5 15-14 15 M5 19l8-8',Health:'M3 12h4l2-4 3 8 2-4h7',Innovation:'M12 3c3 2 5 6 4 11H8c-1-5 1-9 4-11z M8 14l-3 3h4 M16 14l3 3h-4 M10 17l2 4 2-4 M12 8.5h.01',Travel:'M2 13l20-8-6 15-4-6z M12 14l4-4','Social Media':'M4 5h12v8H9l-4 3v-3H4z M16 9h4v8h-1v3l-4-3h-4v-2',Space:'M12 7a5 5 0 1 0 .01 0 M3.5 16c1.5 2 17-3.5 17-8.5 0-1.5-2-1.6-4-1',Media:'M4 5h13v14H6a2 2 0 0 1-2-2z M17 9h3v8a2 2 0 0 1-2 2 M7 8h7 M7 12h7 M7 15h4',Fashion:'M10 5a2 2 0 1 1 2 2v2 M12 9l-9 7h18z',Science:'M9 3h6 M10 3v6l-5 10a1.5 1.5 0 0 0 1.3 2h11.4A1.5 1.5 0 0 0 19 19l-5-10V3 M7.5 15h9',Government:'M3 9l9-5 9 5z M5 9v9 M9.5 9v9 M14.5 9v9 M19 9v9 M3 20h18',Education:'M2 9l10-5 10 5-10 5z M6 11v5c3 2.5 9 2.5 12 0v-5 M22 9v6',Food:'M5 3v6 M9 3v6 M7 3v6 M5 9a2 2 0 0 0 4 0 M7 11v10 M16 21V3c2.5 1.5 3.5 4.5 3.5 9H16','Architecture & Design':'M4 21V8l8-5 8 5v13 M9 21v-6h6v6 M2 21h20',Literature:'M20 4C12 4 6 10 6 18 M20 4c0 7-5 12-12 12 M6 18l-3 3 M10 12h5'};
const GUILDS={Art:['Illustrators','Photographers'],Film:['Directors','Editors'],Music:['Composers','Sound engineers'],Sports:['Coaches','Sports scientists'],Technology:['Software makers','Data and AI'],Business:['Founders','Finance'],Environment:['Conservationists','Growers'],Health:['Nurses and doctors','Nutritionists'],Innovation:['Inventors','Researchers'],Travel:['Guides','Heritage keepers'],'Social Media':['Creators','Community builders'],Space:['Astronomers','Satellite engineers'],Media:['Journalists','Broadcasters'],Fashion:['Designers','Textile makers'],Science:['Lab scientists','Science writers'],Government:['Lawyers','Public servants'],Education:['Teachers','Curriculum designers'],Food:['Chefs','Bakers'],'Architecture & Design':['Architects','Pattern makers'],Literature:['Poets','Translators']};
const TIERS=[['1','First heart','Your first heart. The shelf starts here.'],['25','Twenty-five','A quarter of the way. Your taste is starting to show.'],['50','Halfway','Fifty hearts. Halfway to your hundred.'],['100','Your hundred','One hundred hearts: you can meet people who loved 100 things like you. Coming soon.'],['200','Contributor','Proposed: at 200, add discoveries of your own, after review. Not decided yet.']];
const LAYERS={
 core:{k:'The centre',h:'The 99 Names',sub:'al-Asma al-Husna',t:'Something of the 99 Names of Allah. The Names create reality; everything here grows out from them.',c:'#ffd27a'},
 sci:{k:'Ring one',h:'The Islamic Sciences',t:'Eighteen sciences that documented how reality works. A working list, still being confirmed.',c:'#30d158',r:8,tilt:[-0.32,0,-0.36],spd:-0.055},
 cult:{k:'Ring two',h:'Culture',t:'Twenty fields where it all flows out into what people make. Tap a planet to open its finds.',c:'#ff7a3d',r:15,tilt:[0.12,0,0.06],spd:0.028},
 path:{k:'Ring three',h:'Five Pathways',t:'Five ways into every field. Each planet has five moons just outside it: the areas you can enter it through, like Composition or Sound Engineering for Music.',c:'#ff9f2e',r:19.6,tilt:[0.12,0,0.06],spd:0.028},
 guild:{k:'Ring four',h:'Guilds & Jobs',t:'Communities, livelihoods, contribution. Real guilds and jobs for all twenty fields, and the hearts milestones that open the way in.',c:'#e8c27a',r:23.5,tilt:[-0.62,0,0.5],spd:0.008}};

// ---------- renderer ----------
const canvas=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!LOW,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.05,2000);
// fit the whole universe (bounding sphere) to the screen for any aspect ratio
const HOME_D=new THREE.Vector3(0,14,46).normalize(),HOME_P=new THREE.Vector3(0,30,34).normalize(),BOUND=24.5;
function homePos(){const vf=THREE.MathUtils.degToRad(camera.fov)/2;const hf=Math.atan(Math.tan(vf)*camera.aspect);const half=Math.min(vf,hf);const pad=compact()?1.04:1.0;const d=Math.max(BOUND/Math.sin(half)*pad*(compact()?1:0.77),30);return (innerHeight>innerWidth*1.2?HOME_P:HOME_D).clone().multiplyScalar(d)}
camera.position.copy(homePos());
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=0.06;controls.minDistance=1.2;controls.maxDistance=120;
controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI;controls.rotateSpeed=0.6;controls.zoomSpeed=0.8;
controls.autoRotate=!RM;controls.autoRotateSpeed=0.25;
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/(LOW?2:1),innerHeight/(LOW?2:1)),LOW?0.3:0.42,0.4,0.88);composer.addPass(bloom);
composer.addPass(new OutputPass());
const ENV=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const TL=new THREE.TextureLoader();
const tex=(u,srgb=true)=>{const t=TL.load(u);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t};

// ---------- sky ----------
{const sky=new THREE.Mesh(new THREE.SphereGeometry(900,48,32),new THREE.MeshBasicMaterial({map:tex('data/tex/nebula.jpg'),side:THREE.BackSide,color:0x777788}));scene.add(sky)}
const N=LOW?5000:22000;const sg=new THREE.BufferGeometry();const sp=new Float32Array(N*3),ss=new Float32Array(N),sph=new Float32Array(N),sc=new Float32Array(N*3);
for(let i=0;i<N;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=180+Math.random()*600,q=Math.sqrt(1-u*u);sp.set([Math.cos(a)*q*r,u*r,Math.sin(a)*q*r],i*3);ss[i]=Math.pow(Math.random(),5)*3.2+0.6;sph[i]=Math.random()*6.28;const w=Math.random();sc.set(w<.15?[1,.85,.7]:w<.3?[.75,.85,1]:[1,1,1],i*3)}
sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('size',new THREE.BufferAttribute(ss,1));sg.setAttribute('phase',new THREE.BufferAttribute(sph,1));sg.setAttribute('color',new THREE.BufferAttribute(sc,3));
const starMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},pr:{value:renderer.getPixelRatio()}},
 vertexShader:`attribute float size;attribute float phase;attribute vec3 color;uniform float t;uniform float pr;varying float vA;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float tw=.65+.35*sin(t*1.7+phase*3.);vA=tw;vC=color;gl_PointSize=size*pr*(1.+.0*tw);}`,
 fragmentShader:`varying float vA;varying vec3 vC;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float a=smoothstep(.5,.0,d);gl_FragColor=vec4(vC*a*vA*0.85,a*vA);}`});
scene.add(new THREE.Points(sg,starMat));

// ---------- helpers ----------
function iconFaces(g,map,size,depth){const m=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false});const f=new THREE.Mesh(new THREE.PlaneGeometry(size,size),m);f.position.z=depth/2+.012;g.add(f);const b=f.clone();b.rotation.y=Math.PI;b.position.z=-depth/2-.012;g.add(b)}
function glowTex(col){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,col);gr.addColorStop(.25,col+'88');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function numTex(n,stroke){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle=stroke;g.textAlign='center';g.textBaseline='middle';g.font=`600 ${n.length>2?44:54}px ${FONT}`;g.fillText(n,64,58);g.save();g.translate(64-14,88);g.scale(1.15,1.15);g.strokeStyle=stroke;g.lineWidth=1.6;g.stroke(new Path2D('M12 20s-7-4.4-8.6-9C2.3 7.6 4.6 5 7.4 5c1.9 0 3.4 1.2 4.6 2.8C13.2 6.2 14.7 5 16.6 5c2.8 0 5.1 2.6 4 6-1.6 4.6-8.6 9-8.6 9z'.replace(/(\d+\.?\d*)/g,m=>m)));g.restore();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function iconTex(d,stroke='#ffffff'){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.scale(128/24*0.62,128/24*0.62);g.translate(7.35,7.35);g.strokeStyle=stroke;g.lineWidth=1.35;g.lineCap='round';g.lineJoin='round';g.stroke(new Path2D(d));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function bandTex(text,col){const c=document.createElement('canvas');c.width=4096;c.height=128;const g=c.getContext('2d');g.clearRect(0,0,4096,128);
 g.font=`600 58px ${FONT}`;g.textBaseline='middle';g.fillStyle=col;const unit='   '+text.toUpperCase().split('').join('\u200A')+'   ·';const w=g.measureText(unit).width;const n=Math.max(1,Math.round(4096/w));const sc=4096/(w*n);g.save();g.scale(sc,1);for(let i=0;i<n;i++)g.fillText(unit,i*w,66);g.restore();
 g.fillStyle=col;g.globalAlpha=.55;g.fillRect(0,6,4096,2.5);g.fillRect(0,120,4096,2.5);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return t}
const pickables=[];const labels=[];const lbRoot=$('#labels');
function addLabel(obj,html,cls,info,opts={}){const el=document.createElement('div');el.className='lb '+cls;el.innerHTML=html;lbRoot.appendChild(el);labels.push({obj,el,info,off:opts.off||0,near:opts.near||8,far:opts.far||70,base:opts.base||1});return el}

// ---------- core ----------
const core=new THREE.Group();scene.add(core);
const sunMat=new THREE.SpriteMaterial({map:tex('data/tex/sun.png'),color:0xffffff,depthWrite:false});const sun=new THREE.Sprite(sunMat);sun.scale.set(5,5,1);core.add(sun);
const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('#ffb347'),blending:THREE.AdditiveBlending,depthWrite:false,opacity:.22}));halo.scale.set(9,9,1);core.add(halo);
// calligraphy ring (al-Asma al-Husna), slow-turning
{const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.translate(512,512);g.fillStyle='rgba(255,236,190,0.9)';g.font=`600 46px 'Geeza Pro','Noto Naskh Arabic','Amiri','Times New Roman',serif`;g.textAlign='center';g.textBaseline='middle';
 const txt='الأسماء الحسنى ۞ ';for(let k=0;k<4;k++){g.save();g.rotate(k*Math.PI/2);g.translate(0,-420);g.fillText(txt,0,0);g.restore()}
 g.strokeStyle='rgba(255,220,150,.5)';g.lineWidth=2;g.beginPath();g.arc(0,0,470,0,Math.PI*2);g.stroke();g.beginPath();g.arc(0,0,372,0,Math.PI*2);g.stroke();
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:.55}));m.name='calli';core.add(m);core.userData.calli=m}
const coreHit=new THREE.Mesh(new THREE.SphereGeometry(2.4,24,16),new THREE.MeshBasicMaterial({visible:false}));coreHit.userData={layer:'core',name:'The 99 Names'};core.add(coreHit);pickables.push(coreHit);
addLabel(core,'The 99 Names<small>al-Asma al-Husna</small>','core',coreHit.userData,{off:-2.1,near:4,far:140});
const light=new THREE.PointLight(0xffe2b0,1100,0,2);scene.add(light);scene.add(new THREE.AmbientLight(0x30324a,0.55));

// ---------- rings ----------
const rings={};
function makeRing(key){const L=LAYERS[key];const pivot=new THREE.Group();pivot.rotation.set(...L.tilt);const spin=new THREE.Group();pivot.add(spin);scene.add(pivot);
 const faint=false;const big=L.r>16;
 const tor=new THREE.Mesh(new THREE.TorusGeometry(L.r,faint?0.03:0.045,8,320),new THREE.MeshBasicMaterial({color:new THREE.Color(L.c).multiplyScalar(faint?1:1.6),transparent:true,opacity:faint?.18:.85}));tor.rotation.x=Math.PI/2;spin.add(tor);
 const band=new THREE.Mesh(new THREE.CylinderGeometry(L.r*1.0,L.r*1.0,big?0.78:0.62,320,1,true),new THREE.MeshBasicMaterial({map:bandTex(L.h+(key==='guild'?'  ·  Communities · Livelihoods · Contribution':''),L.c),transparent:true,side:THREE.DoubleSide,depthWrite:false,opacity:key==='guild'?.5:big?.8:.95}));
 band.visible=false;band.position.y=key==='guild'?-1.25:big?-0.98:-0.58;band.material.map.repeat.set(Math.max(1,Math.round(L.r/(key==='guild'?18:10))),1);spin.add(band);
 const sheen=new THREE.Mesh(new THREE.RingGeometry(L.r-0.35,L.r+0.35,256),new THREE.MeshBasicMaterial({color:L.c,transparent:true,opacity:faint?.035:.07,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));sheen.rotation.x=Math.PI/2;spin.add(sheen);
 const hit=new THREE.Mesh(new THREE.TorusGeometry(L.r,0.5,6,120),new THREE.MeshBasicMaterial({visible:false}));hit.rotation.x=Math.PI/2;hit.userData={layer:key,name:L.h,ring:true};spin.add(hit);pickables.push(hit);
 rings[key]={pivot,spin,L,band,tor,sheen,so:sheen.material.opacity,bo:band.material.opacity,to:tor.material.opacity};return spin}
// sciences ring: glass tiles with icon sprites
const sciBodies=[];
{const s=makeRing('sci');const glass=new THREE.MeshPhysicalMaterial({color:0x1db36b,metalness:0,roughness:.12,transmission:LOW?0:.55,thickness:.4,transparent:true,opacity:LOW?.78:.9,clearcoat:1,clearcoatRoughness:.08,emissive:0x0b5a33,emissiveIntensity:.16,ior:1.4});
 const geo=new THREE.BoxGeometry(1.45,1.45,.24);
 SCI.forEach((n,i)=>{const a=i/18*Math.PI*2;const g=new THREE.Group();g.position.set(Math.cos(a)*LAYERS.sci.r,0,Math.sin(a)*LAYERS.sci.r);
  const tile=new THREE.Mesh(geo,glass);tile.userData={layer:'sci',name:n,desc:'One of the Islamic sciences on the working list of eighteen.'};g.add(tile);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xbfffe0,transparent:true,opacity:.55}));g.add(edge);
  iconFaces(g,iconTex(ICON[n]),1.2,.24);
  g.userData.tile=tile;s.add(g);pickables.push(tile);sciBodies.push(g);addLabel(g,n,'sci',tile.userData,{off:1.0,near:3,far:80})})}
// culture ring: planets
const planets=[];
{const s=makeRing('cult');
 FIELDS.forEach(([n,col,sub],i)=>{const a=i/20*Math.PI*2;const g=new THREE.Group();g.position.set(Math.cos(a)*LAYERS.cult.r,0,Math.sin(a)*LAYERS.cult.r);
  const R=.95+((i*37)%5)*.06;const m=new THREE.Mesh(new THREE.SphereGeometry(R,LOW?40:64,LOW?28:48),new THREE.MeshStandardMaterial({map:tex(`data/tex/p${String(i).padStart(2,'0')}.jpg`),roughness:.85,metalness:0,emissive:new THREE.Color(col),emissiveIntensity:.05}));
  m.rotation.z=.35;m.userData={layer:'cult',name:n,desc:sub+'.',field:n,color:col};g.add(m);
  const atm=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,depthWrite:false,opacity:.38}));atm.scale.set(R*3.4,R*3.4,1);g.add(atm);
  g.userData.planet=m;s.add(g);pickables.push(m);planets.push(g);addLabel(g,n,'pl',m.userData,{off:R+.35,near:4,far:80})})}
function tileRing(key,items,col,emis,edgeCol,iconCol,size,labelFar){const s=makeRing(key);const L=LAYERS[key];
 const mat=new THREE.MeshPhysicalMaterial({color:col,metalness:.3,roughness:.38,clearcoat:.8,clearcoatRoughness:.35,emissive:emis,emissiveIntensity:.3,envMap:ENV,envMapIntensity:.45,sheen:.6,sheenColor:new THREE.Color(0x9fc4ff)});
 const geo=new THREE.BoxGeometry(size,size,.2);const out=[];
 items.forEach((it,i)=>{const a=(i+.5)/items.length*Math.PI*2;const g=new THREE.Group();g.position.set(Math.cos(a)*L.r,0,Math.sin(a)*L.r);
  const tile=new THREE.Mesh(geo,it.mat||mat);tile.userData={layer:key,name:it.name,desc:it.desc,field:it.field};g.add(tile);
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:it.edge||edgeCol,transparent:true,opacity:.6})));
  iconFaces(g,it.num?numTex(it.num,it.iconCol||iconCol):iconTex(it.icon,it.iconCol||iconCol),size*.83,.2);
  g.userData.tile=tile;s.add(g);pickables.push(tile);out.push(g);addLabel(g,it.name,key==='path'?'pw':'gd',tile.userData,{off:size*.72,near:3,far:labelFar})});return out}
var tierMat;const pathBodies=[];
{const s=makeRing('path');const L=LAYERS.path;const geo=new THREE.SphereGeometry(.34,LOW?24:40,LOW?16:28);const hitG=new THREE.SphereGeometry(.7,8,6);
 FIELDS.forEach(([f,col],fi)=>{const pm=planets[fi].userData.planet.material;SUBS[f].forEach((n,k)=>{const a=fi/20*Math.PI*2+(k-2)*0.062;const g=new THREE.Group();g.position.set(Math.cos(a)*L.r,((k%2)?.28:-.28),Math.sin(a)*L.r);
  const c=new THREE.Color(col);const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:pm.map,color:c.clone().lerp(new THREE.Color(1,1,1),.45),roughness:.55,metalness:.1,emissive:c,emissiveIntensity:.14,envMap:ENV,envMapIntensity:.35}));m.rotation.set(k,fi,0);g.add(m);
  const atm=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,depthWrite:false,opacity:.42}));atm.scale.set(1.25,1.25,1);g.add(atm);
  const hit=new THREE.Mesh(hitG,new THREE.MeshBasicMaterial({visible:false}));hit.userData={layer:'path',name:n,field:f,desc:n+' is one of five pathways into '+f+'. Open the field to see finds.'};g.add(hit);
  g.userData.tile=hit;g.userData.moon=m;g.userData.parent=fi;s.add(g);pickables.push(hit);pathBodies.push(g);addLabel(g,n,'pw',hit.userData,{off:.5,near:2,far:22})})})}
// faint threads from each planet to its five moons
const thrPos=new Float32Array(100*6);const thrGeo=new THREE.BufferGeometry();thrGeo.setAttribute('position',new THREE.BufferAttribute(thrPos,3));
const threads=new THREE.LineSegments(thrGeo,new THREE.LineBasicMaterial({color:0xffc58a,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));threads.frustumCulled=false;scene.add(threads);
function updThreads(){const a=new THREE.Vector3(),b=new THREE.Vector3();pathBodies.forEach((g,i)=>{planets[g.userData.parent].getWorldPosition(a);g.getWorldPosition(b);a.lerp(b,.08);thrPos.set([a.x,a.y,a.z,b.x,b.y,b.z],i*6)});thrGeo.attributes.position.needsUpdate=true}
tierMat=new THREE.MeshStandardMaterial({color:0xd4a347,metalness:.85,roughness:.25,emissive:0x5a3c0c,emissiveIntensity:.35,envMap:ENV,envMapIntensity:1.1});const guildItems=[];FIELDS.forEach(([f],i)=>{GUILDS[f].forEach(n=>guildItems.push({name:n,icon:FICON[f],field:f,desc:n+', one of the guilds around '+f+'. Open the field to find people and places doing this work.'}));if(i%4===3){const T=TIERS[(i-3)/4];guildItems.push({name:T[1],num:T[0],desc:T[2],mat:tierMat,edge:0xffe3a0,iconCol:'#ffe7b0'})}});
const guildBodies=tileRing('guild',guildItems,0x1f55b8,0x0f2f78,0xf0d390,'#f3e2b8',1.05,36);


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
function flyTo(pos,target,dur=2.2,obj=null){if(innerWidth<innerHeight&&obj){pos=target.clone().add(pos.clone().sub(target).multiplyScalar(1.35))}else if(innerWidth<innerHeight){pos=target.clone().add(pos.clone().sub(target).multiplyScalar(1.6))}if(RM){if(obj){follow=obj}camera.position.copy(pos);controls.target.copy(target);controls.update();return}fly={p0:camera.position.clone(),t0:controls.target.clone(),p1:pos.clone(),t1:target.clone(),t:0,d:dur,obj,off:pos.clone().sub(target)}}
let follow=null;
function focusBody(o){const ud=o.userData;const w=wp(o);const L=LAYERS[ud.layer];
 const dist=ud.layer==='cult'?4.6:ud.layer==='sci'?4.2:ud.layer==='path'?4.4:ud.layer==='guild'?4.4:ud.layer==='core'?12:L.r*1.6;
 const out=w.clone().normalize();if(out.lengthSq()<.01)out.set(0,0,1);let pos=w.clone().add(out.clone().multiplyScalar(dist)).add(new THREE.Vector3(0,dist*.35,0));
 if(ud.layer==='cult'||ud.layer==='path'){const tg=new THREE.Vector3(-w.z,0,w.x).normalize();pos=w.clone().add(out.clone().multiplyScalar(-dist*.55)).add(tg.multiplyScalar(dist*.6)).add(new THREE.Vector3(0,dist*.55,0))}
 if(ud.layer==='guild'){const n=new THREE.Vector3(0,1,0).applyQuaternion(rings[ud.layer].pivot.quaternion);if(n.y<0)n.negate();pos=w.clone().add(n.multiplyScalar(dist*.85)).add(out.multiplyScalar(dist*.5))}
 const keep=ud.ring||ud.layer==='core'?null:o;flyTo(pos,w,2.2,keep);follow=keep;controls.autoRotate=false;showCard(ud)}
function frameFor(on){const w=innerWidth,h=innerHeight;if(on&&w>900){camera.setViewOffset(w,h,Math.min(220,w*.14),0,w,h)}else if(on&&h>w){camera.setViewOffset(w,h,0,h*.17,w,h)}else if(on&&h<500){camera.setViewOffset(w,h,w*.2,0,w,h)}else camera.clearViewOffset()}
function showCard(ud){$('#legend').classList.remove('open');frameFor(true);const L=LAYERS[ud.layer];$('#card').hidden=false;$('#cardK').textContent=ud.ring?L.k:L.k+' · '+L.h;$('#cardH').textContent=ud.name;$('#cardT').textContent=ud.ring||ud.layer==='core'?L.t:ud.desc;
 const go=$('#cardGo');if(ud.field&&(ud.layer==='cult'||ud.layer==='guild'||ud.layer==='path')){go.hidden=false;go.href='index.html#/field/'+encodeURIComponent(ud.field)}else go.hidden=true}
$('#cardX').onclick=()=>{$('#card').hidden=true;frameFor(false);follow=null;flyTo(homePos(),new THREE.Vector3());controls.autoRotate=!RM};

// ---------- picking / HUD ----------
const ray=new THREE.Raycaster();const mouse=new THREE.Vector2();let hover=null,downAt=null;
const MINPX=22;const _v=new THREE.Vector3(),_s=new THREE.Vector3();
function pick(e){const w=innerWidth,h=innerHeight,x=e.clientX,y=e.clientY;const f=(h/2)/Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);let best=null,bd=1e9;
 for(const o of pickables){if(o.userData.ring)continue;o.getWorldPosition(_v);const d=_v.distanceTo(camera.position);_s.copy(_v).project(camera);if(_s.z>1||_s.z<-1)continue;
  const sx=(_s.x*.5+.5)*w,sy=(-_s.y*.5+.5)*h;if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const rpx=Math.max(MINPX,o.geometry.boundingSphere.radius*o.getWorldScale(_s.set(1,1,1)).x*f/d);
  if(Math.hypot(sx-x,sy-y)<=rpx&&d<bd){bd=d;best=o}}
 if(best)return best;mouse.set(x/w*2-1,-(y/h)*2+1);ray.setFromCamera(mouse,camera);const hh=ray.intersectObjects(pickables,false);return hh[0]?.object||null}
window.__pickAt=(x,y)=>{const o=pick({clientX:x,clientY:y});return o?o.userData.name:null};
canvas.addEventListener('pointermove',e=>{const o=pick(e);if(o!==hover){hover=o;canvas.style.cursor=o?'pointer':'grab';hud(o?o.userData:null)}});
canvas.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];if(tour.on)return;controls.autoRotate=false});
canvas.addEventListener('pointerup',e=>{if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(moved>6||tour.on)return;const o=pick(e);if(o)focusBody(o)});
function hud(ud){if(!ud){$('#hudK').textContent='You’re looking at';$('#hudH').textContent=nearestLayer();$('#hudT').textContent='Drag to turn it. Go above, below, even inside the rings. Tap anything.';return}
 const L=LAYERS[ud.layer];$('#hudK').textContent=ud.ring?L.k:L.h;$('#hudH').textContent=ud.name;$('#hudT').textContent=ud.ring||ud.layer==='core'?L.t:ud.desc}
function nearestLayer(){const cd=camera.position.distanceTo(controls.target),r=controls.target.length();if(cd<12&&r>1){return r<11?'The Islamic Sciences':r<17.5?'Culture':r<21.7?'Five Pathways':'Guilds & Jobs'}const d=camera.position.distanceTo(controls.target)+controls.target.length();if(d<7)return'The 99 Names';if(d<17)return'The Islamic Sciences';if(d<18.5)return'Culture';if(d<22)return'Five Pathways';if(d<27)return'Guilds & Jobs';return'The whole universe'}
// legend (side list on desktop; pill + bottom sheet on phones)
$('#ringPill').onclick=()=>{const o=$('#legend').classList.toggle('open');$('#ringPill').setAttribute('aria-expanded',o);if(o)$('#card').hidden=true};
$('#legend').innerHTML='<p class="lk">Rings</p>'+['core','sci','cult','path','guild'].map(k=>`<button data-k="${k}"><i style="color:${LAYERS[k].c};background:${LAYERS[k].c}"></i>${LAYERS[k].h}</button>`).join('');
$('#legend').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;$('#legend').classList.remove('open');$('#ringPill').setAttribute('aria-expanded','false');const k=b.dataset.k;if(k==='core'){focusBody(coreHit);return}const R=rings[k];focusRing(k)};
function focusRing(k){const R=rings[k];const n=new THREE.Vector3(0,1,0).applyQuaternion(R.pivot.quaternion);if(n.y<0)n.negate();const pos=R.L.r>16?n.clone().multiplyScalar(R.L.r*2.3).add(new THREE.Vector3(R.L.r*.35,R.L.r*.2,R.L.r*.35)):n.clone().multiplyScalar(R.L.r*1.25).add(new THREE.Vector3(R.L.r*.9,0,R.L.r*.9));flyTo(pos,new THREE.Vector3());follow=null;controls.autoRotate=false;showCard({layer:k,name:R.L.h,ring:true})}

// ---------- tour ----------
const TOUR=[
 {l:'core',k:'The centre',h:'Something of the 99 Names.',t:'The Names create reality. Everything you see grows out from this light.',cam:[0,2.6,11.5],tg:[0,0,0]},
 {l:'sci',k:'Ring one',h:'The Islamic Sciences.',t:'Eighteen glass tiles on a tilted green orbit. They documented how that reality works.',body:()=>sciBodies[0],d:3.2},
 {l:'sci',k:'Ring one, from below',h:'Rings that pass through each other.',t:'Each ring turns on its own axis, so the layers weave through one another, like an armillary sphere.',cam:[3,-11,13],tg:[0,0,0]},
 {l:'cult',k:'Ring two',h:'Culture.',t:'Twenty planets, one for every field. From the sciences, the light flows out into everything people make.',body:()=>planets[2],d:4.8},
 {l:'cult',k:'Watch the light',h:'Every link is alive.',t:'Arcs of light run from the centre, through a science, out to a field. Tap any planet to open its finds.',cam:[22,9,24],tg:[0,0,0]},
 {l:'path',k:'Ring three',h:'Five ways in.',t:'Every planet has five moons: the pathways into that field. Music has Performance, Composition, Production, Sound Engineering, and Events & Media.',body:()=>pathBodies[12],d:3.2},
 {l:'guild',k:'Ring four',h:'Guilds and jobs.',t:'The outer ring holds the people and the work: forty guilds across twenty fields, with gold hearts milestones on the way to your hundred.',cam:[0,34,40],tg:[0,0,0]},
 {l:'core',k:'The way back',h:'Every find leads home.',t:'Follow any planet inward, through its science, back to the Names.',cam:[0,3,9],tg:[0,0,0]}];
const tour={on:false,i:0,timer:0};
function tourShow(i){frameFor(true);tour.i=Math.max(0,Math.min(TOUR.length-1,i));const s=TOUR[tour.i];$('#cap').hidden=false;$('#card').hidden=true;$('#capK').textContent=s.k;$('#capH').textContent=s.h;$('#capT').textContent=s.t;
 $('#capDots').innerHTML=TOUR.map((_,k)=>`<i class="${k===tour.i?'on':''}"></i>`).join('');$('#capNext').textContent=tour.i===TOUR.length-1?'Finish':'Next';
 follow=null;if(s.body&&s.body()){const o=s.body();const w=wp(o);const out=w.clone().normalize();flyTo(w.clone().add(out.multiplyScalar(s.d)).add(new THREE.Vector3(0,s.d*.4,0)),w,2.6);follow=o.userData.tile||o.userData.planet?o:null}
 else flyTo(new THREE.Vector3(...s.cam),new THREE.Vector3(...s.tg),2.8);tour.timer=0}
function tourStart(){tour.on=true;controls.autoRotate=false;$('#legend').style.opacity=.0;$('#ringPill').style.visibility='hidden';$('#hud').style.opacity=0;tourShow(0)}
function tourEnd(){frameFor(false);tour.on=false;$('#cap').hidden=true;$('#legend').style.opacity=1;$('#ringPill').style.visibility='';$('#hud').style.opacity=1;follow=null;flyTo(homePos(),new THREE.Vector3());controls.autoRotate=!RM}
$('#tourBtn').onclick=()=>tour.on?tourEnd():tourStart();$('#capNext').onclick=()=>{if(tour.i>=TOUR.length-1)tourEnd();else tourShow(tour.i+1)};$('#capPrev').onclick=()=>tourShow(tour.i-1);$('#capSkip').onclick=tourEnd;
addEventListener('keydown',e=>{if(e.key==='Escape'){if(tour.on)tourEnd();else $('#cardX').click()}if(tour.on&&e.key==='ArrowRight')$('#capNext').click();if(tour.on&&e.key==='ArrowLeft')$('#capPrev').click()});

// ---------- labels projection ----------
const v=new THREE.Vector3();
function updateLabels(){const w=innerWidth,h=innerHeight;for(const L of labels){L.obj.getWorldPosition(v);const d=v.distanceTo(camera.position);
  const up=camera.up.clone();v.addScaledVector(new THREE.Vector3(0,-1,0).applyQuaternion(camera.quaternion),L.off*-1);
  const p=v.clone().project(camera);const behind=p.z>1;let o=behind?0:1;
  const fadeFar=1-THREE.MathUtils.smoothstep(d,L.far*.7,L.far),fadeNear=THREE.MathUtils.smoothstep(d,.6,1.4);o*=fadeFar*fadeNear;
  if(follow&&L.info===coreHit.userData)o=0;if(hover&&L.info===hover.userData)o=1;
  if(o<0.02){L.el.style.opacity=0;L._r=null;continue}
  const s=THREE.MathUtils.clamp(14/d,.62,1.7)*L.base;const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
  L.el.style.opacity=o.toFixed(2);L.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0) scale(${s.toFixed(3)})`;L.el.classList.toggle('hl',!!hover&&L.info===hover.userData);if(!L.w){L.w=L.el.offsetWidth;L.h=L.el.offsetHeight}L._r=[x-L.w*s/2,y,L.w*s,L.h*s,d]}
 declutter()}
const PRI={pl:1,sci:2,core:2.5,bk:2,pw:3,gd:4};
function declutter(){const vis=labels.filter(L=>L.el.style.opacity>0.02&&L._r);vis.sort((a,b)=>(PRI[a.el.classList[1]]-PRI[b.el.classList[1]])||(a._r[4]-b._r[4]));const kept=[];for(const L of vis){const [x,y,w,h]=L._r;const hit=kept.some(([X,Y,W,H])=>x<X+W+4&&x+w+4>X&&y<Y+H&&y+h>Y);if(hit&&!(hover&&L.info===hover.userData)){L.el.style.opacity=0}else kept.push(L._r)}}

// ---------- loop ----------
const KEEPBLOOM=new URLSearchParams(location.search).has('keepbloom');let slow=0;const clock=new THREE.Clock();let frames=0,fpsT=0;window.__fps=0;
function frame(){const dt=Math.min(clock.getDelta(),.05);const t=clock.elapsedTime;starMat.uniforms.t.value=t;
 if(!RM){for(const k in rings){rings[k].spin.rotation.y+=rings[k].L.spd*dt;rings[k].pivot.rotation.x=rings[k].L.tilt[0]+Math.sin(t*.07+rings[k].L.r)*.06}
  core.userData.calli.rotation.z+=dt*.05;planets.forEach((p,i)=>p.userData.planet.rotation.y+=dt*(.12+i%3*.03));sciBodies.forEach(g=>g.rotation.y+=dt*.2);pathBodies.forEach(g=>g.userData.moon.rotation.y+=dt*.25);guildBodies.forEach(g=>g.rotation.y+=dt*.12)}
 {const f=follow&&follow.parent;if(f&&f.userData.tile===follow&&!f.userData.moon){const q=f.quaternion.clone();f.lookAt(camera.position);const q2=f.quaternion.clone();f.quaternion.copy(q).slerp(q2,RM?1:.12)}}
 core.userData.calli.quaternion.copy(camera.quaternion);halo.material.opacity=.2+.03*Math.sin(t*1.3);
 // keep science tiles facing outward-ish & readable
 if(boltOn){boltTimer-=dt;if(boltTimer<=0){const n=1+Math.floor(Math.random()*3);for(let i=0;i<n;i++)spawnBolt();boltTimer=.12+Math.random()*.45}}
 for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.t+=dt;const k=b.t/b.life;const fl=(Math.sin(b.t*90+b.flick)>-.2?1:.25)*(1-k);b.grp.children.forEach(c=>{if(c.material){c.material.opacity=c.material.userData.o*fl}else if(c.isLight)c.intensity=40*fl});
  if(k>=1){boltGroup.remove(b.grp);b.grp.traverse(c=>{c.geometry?.dispose();c.material?.dispose()});bolts.splice(i,1)}}
 if(fly){if(fly.obj){fly.t1.copy(wp(fly.obj));fly.p1.copy(fly.t1).add(fly.off)}fly.t+=dt/fly.d;const e=ease(Math.min(fly.t,1));camera.position.lerpVectors(fly.p0,fly.p1,e);controls.target.lerpVectors(fly.t0,fly.t1,e);if(fly.t>=1)fly=null}
 else if(follow){const w=wp(follow);const delta=w.clone().sub(controls.target);controls.target.add(delta);camera.position.add(delta)}
 {const lc=new THREE.Vector3();for(const k in rings){const Rg=rings[k];lc.copy(camera.position);Rg.spin.worldToLocal(lc);const d=Math.hypot(Math.hypot(lc.x,lc.z)-Rg.L.r,lc.y);const f=THREE.MathUtils.smoothstep(d,4.5,10);Rg.band.material.opacity=Rg.bo*f;Rg.tor.material.opacity=Rg.to*f;Rg.sheen.material.opacity=Rg.so*f}}
 updThreads();controls.update();composer.render();updateLabels();
 frames++;fpsT+=dt;if(fpsT>1){window.__fps=Math.round(frames/fpsT);frames=0;fpsT=0;if(t>5&&bloom.enabled&&!KEEPBLOOM){slow=window.__fps<28?slow+1:0;if(slow>=3){bloom.enabled=false;window.__bloomOff=true}}}
 requestAnimationFrame(frame)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();if(!follow&&!fly&&$('#card').hidden&&!tour.on)camera.position.copy(homePos());frameFor(!$('#card').hidden||tour.on);renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
['gesturestart','gesturechange'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));document.addEventListener('touchmove',e=>{if(e.touches.length>1||e.target===canvas)e.preventDefault()},{passive:false});
controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};controls.screenSpacePanning=true;
hud(null);requestAnimationFrame(frame);setInterval(()=>{if(!hover)hud(null);const nl=nearestLayer();document.querySelectorAll('#legend button').forEach(b=>b.classList.toggle('on',LAYERS[b.dataset.k].h===nl));const k=Object.keys(LAYERS).find(k=>LAYERS[k].h===nl);$('#pillT').textContent=nl;$('#pillDot').style.background=k?LAYERS[k].c:'#f5f5f7'},700);
if(new URLSearchParams(location.search).get('tour')==='1')setTimeout(tourStart,600);
window.__U={bloom,homePos,pathBodies,guildBodies,focusRing,tourStart,tourShow,tourEnd,focusBody,planets,sciBodies,coreHit,camera,controls,flyTo,THREE,labels,get flying(){return !!fly},get boltCount(){return bolts.length},get tour(){return tour}};
