'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get:k=>JSON.parse(localStorage.getItem(k)||'null'),set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
let PLACES=[],EVENTS=[],OVL={},RES=new Set();let MEDIA={resolved:{},curated:[]},TAB='All';let ALL=[],VIEW=[],shown=0,FIELD='All',X={},COUNTS=[];const BATCH=24;
const likes=new Set(LS.get('likes')||[]);const saves=LS.get('saves')||{};
const PALETTE=['#0f766e','#7c3aed','#b45309','#be123c','#1d4ed8','#4d7c0f','#334155'];
const FIELD_ORDER=['Art','Film','Music','Sports','Technology','Business','Environment','Health','Innovation','Travel','Social Media','Space','Media','Fashion','Science','Government','Education','Food','Architecture & Design','Literature'];

const FIELD_MAP={'government and society':'Government','health and wellbeing':'Health','health & wellbeing':'Health','travel and hospitality':'Travel','travel & hospitality':'Travel','space and exploration':'Space','space & exploration':'Space','media and communication':'Media','media & communication':'Media','architecture and design':'Architecture & Design','architecture':'Architecture & Design','design':'Architecture & Design','sport':'Sports','tech':'Technology','food and drink':'Food','books':'Literature','guilds & jobs':'Art' /* records are maker/craft; image lists Craft & Making under Art */};
const UNMAPPED={};
function canonField(f){if(!f)return'Other';if(FIELD_ORDER.includes(f))return f;const m=FIELD_MAP[String(f).toLowerCase().trim()];if(m)return m;const ci=FIELD_ORDER.find(x=>x.toLowerCase()===String(f).toLowerCase());if(ci)return ci;UNMAPPED[f]=(UNMAPPED[f]||0)+1;return'Other'}
window.__unmapped=UNMAPPED;
let PATHWAYS={},HL={},CRAFTX=[];
function craftIndex(){const esc2=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');CRAFTX=Object.entries(PATHWAYS).map(([k,c])=>({k,c,field:c.field,res:(c.tags||[]).map(t=>({t,re:new RegExp('(^|[^a-z0-9])'+esc2(t.toLowerCase())+'s?([^a-z0-9]|$)')}))}))}
function craftFor(r){if(!r||!CRAFTX.length)return null;if(r._cf!==undefined)return r._cf;const txt=[r.title,r.hook,(r.deep_tags||[]).join(' '),r.creator,''].join(' ').toLowerCase();let best=null,bs=0;
  for(const x of CRAFTX){if(x.field!==r.field)continue;let s=0;for(const q of x.res)if(q.re.test(txt))s+=q.t.length>5?2:1;if(s>bs){bs=s;best=x}}
  return r._cf=best&&bs>0?{key:best.k,...best.c}:null}
function tryIt(r){const c=craftFor(r);if(!c)return'';const items=c.items.slice(0,3);const kind=i=>i.type==='video'?'Video':i.type==='course'?'Free course':'Website';
  return `<section class="try" aria-labelledby="tryh"><h3 id="tryh">Try it yourself</h3><p class="trysub">Free, beginner-friendly starting points for ${esc(c.label.toLowerCase())}.</p><div class="group">${items.map(i=>`<a class="row tryrow" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer"><span class="trytxt"><b>${esc(i.title)}</b><small>${esc(i.provider)} · ${kind(i)}${i.length?' · '+esc(i.length):''}</small></span><span class="chev" aria-hidden="true">↗</span></a>`).join('')}</div></section>`}

// ---- Today tab (App Store style): hero + rows, deterministic by day ----
// TODO(trending): there is no usage data, so nothing here is called "Trending" and no popularity numbers are shown.
// When real usage/engagement data exists, add a "Trending" row fed by it and switch it on here (TODAY_TRENDING=true).
const TODAY_TRENDING=false;
function hlMap(h){const src=h&&(h.highlights||h);const m={};if(Array.isArray(src))src.forEach(x=>{if(x&&x.id&&x.highlight)m[x.id]=x});else if(src&&typeof src==='object')for(const[k,v]of Object.entries(src)){if(v)m[k]=typeof v==='string'?{id:k,highlight:v}:v}return m}
const hlText=r=>(HL[r.id]&&HL[r.id].highlight)||'';
function dayKey(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19}let s=h>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function seeded(list,seed,n){const a=[...list].sort((x,y)=>x.id<y.id?-1:1),r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,n)}
const secs=s=>{const p=String(s||'').split(':').map(Number);return p.length&&p.every(x=>!isNaN(x))?p.reduce((t,x)=>t*60+x,0):null};
function todayData(day=dayKey(),ev=EVENTS,now=new Date(day+'T12:00:00')){
  const safe=ALL.filter(r=>!isGated(r)&&!r.content_advisory&&!r.viewing_preference); // caps: nothing gated, sensitive or advised is ever promoted
  const used=new Set(),take=(list,seed,n)=>{const p=seeded(list.filter(r=>!used.has(r.id)),day+':'+seed,n);p.forEach(r=>used.add(r.id));return p};
  const hero=take(safe.filter(r=>r.image&&hlText(r)),'hero',1)[0]||take(safe.filter(r=>r.image&&r._origin==='hand-sourced'),'hero2',1)[0]||take(safe.filter(r=>r.image),'hero3',1)[0];
  const rows=[];
  const fresh=[...safe].sort((a,b)=>String(b.sources[0]?.fetched_at||'').localeCompare(String(a.sources[0]?.fetched_at||''))||(a.id<b.id?-1:1)).slice(0,160);
  rows.push({k:'new',t:'New finds',s:'The most recently added records',items:take(fresh.filter(r=>r.image||tabOf(r)!=='Look'),'new',10)});
  rows.push({k:'early',t:'From the early web',s:'Pages and files kept by the Wayback Machine',items:take(safe.filter(earlyWeb),'early',10)});
  const ms=86400000,t0=new Date(day+'T00:00:00').getTime();const evs=ev.filter(e=>e.status==='verified_active').map(e=>({e,s:Date.parse((e.start||e.next_dates?.start||'')+'T00:00:00'),n:Date.parse((e.end||e.next_dates?.end||e.start||e.next_dates?.start||'')+'T23:59:59')})).filter(x=>!isNaN(x.s)&&x.n>=t0&&!/past/i.test(x.e.next_dates?.edition||''));
  let wk=evs.filter(x=>x.s<=t0+7*ms).sort((a,b)=>a.s-b.s),wide=false;if(wk.length<2){wk=evs.filter(x=>x.s<=t0+60*ms).sort((a,b)=>a.s-b.s);wide=true}
  rows.push({k:'week',t:wide?'Coming up':'On this week',s:wide?'Nothing is dated this week: next verified dates':'Verified dates from official pages',events:wk.slice(0,10).map(x=>x.e)});
  rows.push({k:'zoom',t:'Zoom in',s:'Images with a larger original to explore',items:take(safe.filter(r=>r.image&&hires(r.image.src)!==r.image.src),'zoom',10)});
  let sh=safe.filter(r=>tabOf(r)==='Watch'&&(r.media_url||r.embed_url)&&secs(r.duration)!=null&&secs(r.duration)<=120),lim=120;if(sh.filter(r=>!used.has(r.id)).length<4){lim=300;sh=safe.filter(r=>tabOf(r)==='Watch'&&(r.media_url||r.embed_url)&&secs(r.duration)!=null&&secs(r.duration)<=300)}
  rows.push({k:'watch',t:'Watch in a minute',s:lim===120?'Under two minutes':'Short films, under five minutes',items:take(sh,'watch',10)});
  rows.push({k:'listen',t:'Listen',s:'Tap, then press play',items:take(safe.filter(r=>tabOf(r)==='Listen'&&r.media_url),'listen',10)});
  rows.push({k:'picks',t:"Editor's picks",s:'Chosen by hand, not by popularity',items:take(safe.filter(r=>r._origin==='hand-sourced'||hlText(r)),'picks',10)});
  return {hero,rows:rows.filter(r=>(r.items||r.events||[]).length)}}
function evDay(e){const s=e.start||e.next_dates?.start,en=e.end||e.next_dates?.end;if(!s)return['',''];let d=new Date(s+'T12:00:00'),pre='';if(en&&d<new Date(dayKey()+'T00:00:00')){d=new Date(en+'T12:00:00');pre='Until '}return[pre+d.toLocaleDateString('en',{month:'short'}),d.getDate()]}
function tcard(r,row){const c=PALETTE[[...r.field].reduce((a,ch)=>a+ch.charCodeAt(0),0)%PALETTE.length];const k=tabOf(r);
  return `<button class="tcard" data-go="#/d/${esc(r.id)}" aria-label="${esc(r.title)}"><span class="tmedia">${r.image?`<img loading="lazy" src="${esc(r.image.src)}" alt="" onerror="this.remove()">`:`<span class="noimg" style="background:linear-gradient(160deg,${c},#111827)">${esc(r.field)}</span>`}${row==='zoom'?'<span class="tbadge">⤢ Zoom</span>':k==='Watch'?`<span class="tbadge">▶︎ ${esc(r.duration||'Watch')}</span>`:k==='Listen'?`<span class="tbadge">♪ ${esc(r.duration||'Listen')}</span>`:row==='early'&&earlyWeb(r)?`<span class="tbadge">${esc(earlyWeb(r))}</span>`:''}</span><span class="ttxt"><b>${esc(r.title)}</b><small>${esc(r.field)}${hlText(r)?' · 1-min read':''}</small></span></button>`}
function ecard(e){const[m,d]=evDay(e);return `<a class="tcard tevt" href="${esc(e.official_url||e.action_link)}" target="_blank" rel="noopener noreferrer"><span class="tdate"><small>${esc(m)}</small><b>${esc(d)}</b></span><span class="ttxt"><b>${esc(e.name)}</b><small>${evWhen(e)||''}</small><small>${esc(e.place_label||e.country||'')} · official page ↗</small></span></a>`}
function renderToday(){const el=$('#today');if(!el)return;const D=todayData();window.__today=D;if(!D.hero){el.innerHTML='';return}const h=D.hero,day=new Date().toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'});
  el.innerHTML=`<p class="tkick">${esc(day)}</p><button class="thero" data-go="#/d/${esc(h.id)}" aria-label="Pick of the Day: ${esc(h.title)}"><img src="${esc(h.image.src)}" alt="" onerror="this.remove()"><span class="tshade"></span><span class="tcopy"><small>Pick of the Day</small><b>${esc(h.title)}</b><em>${esc(h.hook)}</em>${hlText(h)?'<span class="tchip">1-minute read: why it matters</span>':''}</span></button>`+
  D.rows.map(r=>`<section class="trow" aria-label="${esc(r.t)}"><div class="thead"><h2>${esc(r.t)}</h2><small>${esc(r.s)}</small></div><div class="tscroll" role="list">${r.events?r.events.map(ecard).join(''):r.items.map(x=>tcard(x,r.k)).join('')}</div></section>`).join('')}
function todayVis(){const el=$('#today');if(el)el.hidden=!!SQ||FIELD!=='All'||TAB!=='All'}
function norm(r,origin){ // tolerant of the harvester's schema
  const src=(r.sources&&r.sources[0])||{};
  const url=src.url||r.url||r.source_url||r.link||'';
  const img=r.image&&typeof r.image==='object'?r.image:(r.image_url||r.thumbnail||typeof r.image==='string'?{src:r.image_url||r.thumbnail||r.image,licence:r.licence||r.license||r.image_licence||'',commons_page:r.image_page||url}:null);
  const okImg=img&&img.src&&/public domain|cc0|cc[- ]by|fal|no restrictions|open access/i.test(img.licence||'')?img:null;
  return {...r,id:r.id||('H'+Math.random().toString(36).slice(2,8)),title:r.title||r.name||'Untitled',hook:r.hook||((s)=>s&&s.length>140?s.slice(0,140).replace(/\s+\S*$/,'')+'…':s)(r.summary)||((s)=>s&&s.length>140?s.slice(0,140).replace(/\s+\S*$/,'')+'…':s)(r.description)||'',
   field:canonField(r.field||r.primary_domain||r.culture_field||r.ring_field),media:r.media||r.media_type||'',summary:r.summary||r.description||r.extract||'',
   sources:r.sources&&r.sources.length?r.sources:[{url,quote:r.quote||r.locator_quote||'',locator:r.locator||'',kind:r.source_name||r.source_kind||r.source||'',fetched_at:r.retrieved||''}],
   image:okImg,rights_status:r.rights_status||(okImg?'open licence: '+okImg.licence:'link only'),verification_status:r.verification_status||'candidate - unreviewed',_origin:origin,_url:url,media_url:(r.media_url&&/\.(mp3|ogg|oga|wav|flac|m4a|mp4|webm|ogv|m4v)(\?|$)/i.test(r.media_url))?r.media_url:null,embed_url:r.embed_url||null,wayback_url:r.wayback_url||null,era:r.era||r.date||null,place:r.place||null,creator:r.creator||null,content_advisory:r.content_advisory||null,captions:r.captions||null,deep_tags:r.deep_tags||[]};
}
async function getJSON(u){try{const r=await fetch(u,{cache:'no-store'});return r.ok?r.json():null}catch{return null}}
async function boot(){
  const [mine,harv,ex,counts,niche,mediaF,media,ovl,resv,pl,evs,litF,pathF,hlF]=await Promise.all([getJSON('data/discoveries.json'),getJSON('harvest/discoveries.json'),getJSON('data/extras.json'),getJSON('harvest/more_counts.json'),getJSON('harvest/niche_discoveries.json'),getJSON('harvest/media_discoveries.json'),getJSON('data/media.json'),getJSON('data/tags_overlay.json'),getJSON('harvest/reserve.json'),getJSON('harvest/places.json'),getJSON('harvest/events.json'),getJSON('harvest/literature_discoveries.json'),getJSON('harvest/pathways.json'),getJSON('harvest/highlights.json')]);PATHWAYS=(pathF&&pathF.crafts)||{};HL=hlMap(hlF);craftIndex();PLACES=(pl||[]).map(p=>({...p,label:String(p.label||p.name||p.id).replace(/\s*\(city not recorded\)/i,' (whole country)')}));{const sn=new Set();EVENTS=(evs||[]).filter(e=>{const k=(e.name||'').toLowerCase().trim()+'|'+(e.place_hub||'');if(sn.has(k))return false;sn.add(k);return true})};RES=new Set(((resv&&resv.reserve)||[]).map(x=>x.id));OVL=ovl||{};MEDIA=media||{resolved:{},curated:[]};
  X=ex||{};COUNTS=Array.isArray(counts)?counts:counts?(counts.counts||Object.entries(counts).map(([k,v])=>typeof v==='object'?{key:k,...v}:{key:k,count:v})):[];
  const seen=new Set(),key=r=>(r._url||'').replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'').toLowerCase()||r.title.toLowerCase();
  const arr=h=>Array.isArray(h)?h:(h&&(h.records||h.discoveries))||[];const hv=[...arr(mediaF),...arr(niche),...arr(litF),...MEDIA.curated,...arr(harv)];
  for(const r of [...(mine||[]).map(r=>norm(r,'hand-sourced')),...hv.map(r=>norm(r,'harvest'))]){const z=MEDIA.resolved[r.id];if(z&&!r.media_url){r.media_url=r.media==='video'?(z.video||null):(z.audio||null);r.embed_url=r.embed_url||z.embed;r.captions=r.captions||z.captions;if(!r.creator&&typeof z.creator==='string')r.creator=z.creator}if(RES.has(r.id))continue;const k=key(r);if(seen.has(k))continue;seen.add(k);ALL.push(r)}
  // interleave fields so the feed feels mixed (deterministic)
  const by={};ALL.forEach(r=>(by[r.field]??=[]).push(r));const keys=Object.keys(by);const mixed=[];
  for(let i=0;mixed.length<ALL.length;i++)keys.forEach(k=>by[k][i]&&mixed.push(by[k][i]));
  const hs=new Set(OVL.hell_imagery||[]);const VPm=OVL.viewing_preference||{};mixed.forEach(r=>{if(VPm[r.id])r.viewing_preference=VPm[r.id];if(hs.has(r.id)&&!r.deep_tags.includes('hell_imagery'))r.deep_tags=[...r.deep_tags,'hell_imagery']});
  ALL=capOrder(mixed);
  window.__stats={vp:ALL.filter(isVP).length,reserve:RES.size,sensitive:ALL.filter(isSens).length,hell:ALL.filter(isHell).length,total:ALL.length,hand:ALL.filter(r=>r._origin==='hand-sourced').length,harvest:ALL.filter(r=>r._origin==='harvest').length};
  tabs();chips();applyFilter('All');updateCount();renderToday();todayVis();
  new IntersectionObserver(e=>e[0].isIntersecting&&more(),{rootMargin:'800px'}).observe($('#sentinel'));
  addEventListener('scroll',()=>$('#bar').classList.toggle('scrolled',scrollY>70),{passive:true});
  addEventListener('popstate',route);route();
}
function tabs(){$('#tabs').innerHTML=['All','Look','Watch','Listen','Read'].map(t=>`<button aria-pressed="${t===TAB}" data-t="${t}">${t}</button>`).join('');
 $('#tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;TAB=b.dataset.t;tabs();applyFilter(FIELD);if(TAB==='Watch'&&VIEW.some(r=>r.media_url||r.embed_url))go('#/watch');if(TAB==='Listen')go('#/queue')}}
function chips(){const present=[...FIELD_ORDER,...(ALL.some(r=>r.field==='Other')?['Other']:[])];
  $('#fields').innerHTML=['All',...present].map(f=>`<button class="chip" aria-pressed="${f===FIELD}" data-f="${esc(f)}">${esc(f)}${f!=='All'?` <small>${ALL.filter(r=>r.field===f).length}</small>`:''}</button>`).join('');
  $('#fields').onclick=e=>{const b=e.target.closest('.chip');if(b){applyFilter(b.dataset.f);chips()}}}
const FILE=/\.(mp3|ogg|oga|wav|flac|m4a|mp4|webm|ogv|m4v)(\?|$)/i;const playable=r=>!!(r.media_url&&FILE.test(r.media_url));
const tabOf=r=>/video|film/.test(r.media)?'Watch':/audio|sound|recording/.test(r.media)?'Listen':/text|book|paper|article/.test(r.media)?'Read':'Look';
let SQ='';const hay=r=>r._h??(r._h=[r.title,r.hook,r.creator,r.place,r.field,r.era,(r.deep_tags||[]).join(' ')].join(' ').toLowerCase());
const qmatch=r=>SQ.split(/\s+/).filter(Boolean).every(w=>hay(r).includes(w));
function applyFilter(f){FIELD=f;const searching=!!SQ;VIEW=ALL.filter(r=>!(LS.get('hideSensitive')&&isGated(r))&&(searching?qmatch(r):((f==='All'||r.field===f)&&(TAB==='All'||tabOf(r)===TAB))));shown=0;$('#feed').innerHTML='';more();todayVis();
  const st=$('#qstat');if(searching){st.hidden=false;st.innerHTML=VIEW.length?`${VIEW.length} ${VIEW.length===1?'result':'results'} for “${esc(SQ)}”`:`Nothing found for “${esc(SQ)}”. Try a place, a person or a field such as <b>Music</b>.`}else st.hidden=true}
(function(){const q=document.getElementById('q');if(!q)return;let t;q.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>{SQ=q.value.trim().toLowerCase();applyFilter(FIELD);scrollTo(0,0)},160)});
 q.addEventListener('keydown',e=>{if(e.key==='Enter')q.blur();if(e.key==='Escape'){q.value='';SQ='';applyFilter(FIELD);q.blur()}});
 document.addEventListener('keydown',e=>{const c=e.target.closest&&e.target.closest('.card');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();c.click()}})})();
function card(r,i){const c=PALETTE[[...r.field].reduce((a,ch)=>a+ch.charCodeAt(0),0)%PALETTE.length];
  const gated=isGated(r)&&!REVEALED.has(r.id);
  return `<article class="card${gated?' gated':''}" data-id="${esc(r.id)}" tabindex="0" aria-label="${esc(gated?'Some may prefer not to view this. Tap to view':r.title)}">${gated?`<div class="gate"><div><b>Some may prefer not to view this.</b><br><i>Lower your wing over the believers.</i> <small class="cite">Qur'an 15:88</small><br><span class="pill" style="display:inline-block;margin-top:8px">Tap to view</span></div></div>`:''}
  <div class="media">${r.image?`<img loading="lazy" src="${esc(r.image.src)}" alt="${esc(r.title)}" onerror="this.remove()">`:`<div class="noimg" style="background:linear-gradient(160deg,${c},#111827)" aria-hidden="true">${esc(r.field)}</div>`}
  ${earlyWeb(r)?`<span class="badge">from the early web, ${esc(earlyWeb(r))}</span>`:''}${tabOf(r)==='Watch'?'<span class="play">▶︎</span>':tabOf(r)==='Listen'?'<span class="play">♪</span>':''}</div>
  <div class="b"><h3>${esc(r.title)}</h3><p>${esc(r.hook)}</p><div class="meta"><span>${esc(r.field)}</span>
  <button class="like ${likes.has(r.id)?'on':''}" data-like="${esc(r.id)}" aria-label="Like">${likes.has(r.id)?'♥':'♡'}</button></div></div></article>`}
function more(){if(shown>=VIEW.length)return;const f=document.createDocumentFragment(),t=document.createElement('template');
  t.innerHTML=VIEW.slice(shown,shown+BATCH).map(card).join('');f.append(t.content);$('#feed').append(f);shown+=BATCH}
document.addEventListener('click',e=>{
  const l=e.target.closest('[data-like]');if(l){e.stopPropagation();toggleLike(l.dataset.like);document.querySelectorAll(`[data-like="${CSS.escape(l.dataset.like)}"]`).forEach(b=>{b.classList.toggle('on',likes.has(l.dataset.like));b.textContent=likes.has(l.dataset.like)?'♥':'♡'});return}
  const c=e.target.closest('.card');if(c){if(c.classList.contains('gated')){REVEALED.add(c.dataset.id);c.classList.remove('gated');c.querySelector('.gate')?.remove();return}go('#/d/'+c.dataset.id);return}
  const n=e.target.closest('[data-go]');if(n){go(n.dataset.go);return}
  const t=e.target.closest('[data-toggle]');if(t){const p=document.getElementById(t.dataset.toggle);p.hidden=!p.hidden;t.querySelector('.chev').textContent=p.hidden?'›':'⌄';
    if(t.dataset.toggle.startsWith('p-'))LS.set('lastPanel',t.dataset.toggle)}
});
$('#shelfBtn').onclick=()=>go('#/shelf');$('#whatBtn').onclick=()=>go('#/hundred');$('#placesBtn').onclick=()=>go('#/places');
function toggleLike(id){likes.has(id)?likes.delete(id):likes.add(id);LS.set('likes',[...likes]);updateCount()}
function updateCount(){$('#likeCount').textContent=likes.size}
const trail=LS.get('trail')||[];
let feedY=0;function go(h){if(!location.hash||location.hash==='#/')feedY=scrollY;trail.push(h);LS.set('trail',trail.slice(-12));history.pushState({},'',h);route()}
function route(){const h=location.hash||'';const s=$('#sheet');fitsStop();
  if(!h||h==='#/'){s.hidden=true;document.body.style.overflow='';scrollTo(0,feedY);return} // feed never re-rendered: exact position kept
  document.body.style.overflow='hidden';s.hidden=false;s.scrollTop=0;
  const [,v,id]=h.split('/');const r=ALL.find(x=>x.id===decodeURIComponent(id||''));
  if(v==='watch'){s.innerHTML=watch(id);wireReels();return}if(v==='fits'){s.innerHTML=topBar()+fits();fitsStart(r);return}s.innerHTML=topBar()+({d:()=>detail(r),chain:chain,sky:sky,place:place,shelf:shelf,hundred:hundred,deeper:()=>deeper(r),watch:()=>watch(id),queue:queue,hub:()=>hub(id),places:places}[v]||(()=>'<div class="pad">Not found</div>'))()}
function topBar(){return `<div class="top"><button class="pill" onclick="history.back()" aria-label="Back">‹ Back</button>
 <div class="crumbs">${trail.slice(-4).map(t=>esc(t.replace('#/',''))).join(' › ')}</div>
 <button class="pill" onclick="trail.length=0;history.go(-(history.length));location.hash='';" aria-label="Back to feed">Feed</button></div>`}
const row=(id,label,sub,open)=>`<button class="row" data-toggle="${id}">${label} <span><small>${sub||''}</small> <span class="chev">${open?'⌄':'›'}</span></span></button>`;
function teaser(r){const sc=c=>String(c.scope||'');const hits=COUNTS.filter(c=>!/^DO NOT DISPLAY/i.test(c.reliability||'')&&Number(c.total??c.count)>0).filter(c=>[c.key,c.field,c.slug,c.id].some(k=>k&&(k===r?.field||k===r?.slug||k===r?.id))||sc(c)==='field:'+r?.field||(r?.source_name&&c.source===r.source_name));
  return hits.length?hits.map(c=>`<p>📚 ${countLabel(c)} in ${c.url?`<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.source||c.collection||'open collections')}</a>`:esc(c.source||'open collections')} <span class="tag">${esc((c.query||'')+' · retrieved '+(c.retrieved||c.as_of||''))}</span></p>`).join('')
   :'<p class="tag warn">No live count from an open collection yet (no_evidence_yet). No number is shown until one is fetched.</p>'}
function detail(r){if(!r)return'<div class="pad">Not found</div>';const s=r.sources[0]||{};const saved=saves[r.id];
 return `${r.image?`<div class="herowrap" onmousemove="loupe(event,this)" onclick="openZoom('${esc(r.id)}')"><img class="hero" src="${esc(r.image.src)}" alt="${esc(r.title)}"><div class="loupe" style="background-image:url('${esc(hires(r.image.src))}')"></div><span class="zoomhint">⤢ Tap to zoom</span></div>`:''}<div class="pad">
 <h2>${esc(r.title)}</h2><p style="font-size:17px;color:var(--ink2)">${esc(r.hook)}</p>
 ${hlText(r)?`<section class="why" aria-labelledby="whyh"><h3 id="whyh">Why it matters</h3><p>${esc(hlText(r))}</p><small>About a one-minute read. Editorial note written from the sources linked on this record; candidate, unreviewed.</small></section>`:''}
 ${r.content_advisory||r.viewing_preference?`<div class="advisory">ⓘ Context: ${esc(r.viewing_preference||r.content_advisory)}</div>`:''}
 ${tabOf(r)==='Listen'&&r.media_url?`<button class="btn" onclick="enqueue('${esc(r.id)}',true)">▶︎ Play</button><button class="btn ghost" onclick="enqueue('${esc(r.id)}')">+ Queue</button>`:''}
 ${tabOf(r)==='Watch'&&(r.media_url||r.embed_url)?`<button class="btn" data-go="#/watch/${esc(r.id)}">▶︎ Watch</button>`:''}
 ${s.url?`<a class="btn${(tabOf(r)==='Watch'||tabOf(r)==='Listen')&&(r.media_url||r.embed_url)?' ghost':''}" href="${esc(s.url)}" target="_blank" rel="noopener">Open the source ↗</a>`:''}
 ${r.wayback_url?`<a class="btn ghost" href="${esc(r.wayback_url)}" target="_blank" rel="noopener">Wayback ${esc(earlyWeb(r)||'')}</a>`:''}
 <p style="font-size:13px;color:var(--muted)">${[r.creator,r.era,r.place].filter(x=>x&&typeof x==='string').map(esc).join(' · ')}</p>
 <span class="tag">${esc(r.field)}</span><span class="tag">${esc(r.media||'')}</span><span class="tag warn">${esc(r.verification_status)}</span>
 <div class="group">
 ${row('p-look','Look closer',r.image?'image':'')}<div class="panel" id="p-look" hidden>${r.image?`<a href="${esc(r.image.src)}" target="_blank">Open full image</a> · licence <b>${esc(r.image.licence)}</b> · <a href="${esc(r.image.commons_page)}" target="_blank">file page</a><br><small>${esc(r.image.credit||'')}</small>`:'No openly licensed image yet. The source is linked below (link only).'}</div>
 ${row('p-story','Tell me its story','',true)}<div class="panel" id="p-story">${esc(r.summary)}${r.date_original?`<p><span class="tag">original date string</span> “${esc(r.date_original.string)}” (${esc(r.date_original.calendars.join(' / '))})</p>`:''}</div>
 ${row('p-world','Find it in the world')}<div class="panel" id="p-world" hidden><a class="btn" href="${esc(s.url)}" target="_blank" rel="noopener">Open source</a>
   ${r.slug==='Kampong_Glam'||r.slug==='Sultan_Mosque'||r.slug==='Haji_Lane'?`<button class="btn ghost" data-go="#/place">Place Book</button>`:''}
   ${hubsFor(r).map(h=>`<button class="btn ghost" data-go="#/hub/${esc(h.id)}">📍 ${esc(h.label)}</button>`).join('')}${hubsFor(r).map(h=>comingUp(h,2)).join('')||'<p><small>No verified visit or participation opportunity yet (no_evidence_yet).</small></p>'}${teaser(r)}</div>
 ${row('p-conn','Follow a connection')}<div class="panel" id="p-conn" hidden>${['The_Book_of_Fixed_Stars','Abd_al-Rahman_al-Sufi','Almagest','Arabic_star_names','Mariam_al-Asturlabi'].includes(r.slug)?`<button class="btn" data-go="#/chain">Give Props to the Chain</button>`:''}
   ${['Aldebaran','Lunar_station','The_Book_of_Fixed_Stars','Arabic_star_names'].includes(r.slug)?`<button class="btn ghost" data-go="#/sky">Follow the follower ✦</button>`:''}
   <p>Also in ${esc(r.field)}:</p>${ALL.filter(x=>x.field===r.field&&x.id!==r.id).slice(0,4).map(x=>`<button class="row" data-go="#/d/${esc(x.id)}">${esc(x.title)}<span class="chev">›</span></button>`).join('')}</div>
 ${row('p-ev','Show me the evidence','Trust Passport')}<div class="panel" id="p-ev" hidden>${passport(r)}</div>
 ${row('p-keep','Keep this',saved?'saved':'')}<div class="panel" id="p-keep" hidden>
   <button class="btn" data-like="${esc(r.id)}">${likes.has(r.id)?'♥ Liked':'♡ Like'}</button>
   <button class="btn ghost" onclick="saves['${esc(r.id)}']={at:Date.now(),folder:prompt('Folder (optional)')||''};LS.set('saves',saves);this.textContent='Saved to Shelf'">${saved?'Saved':'Save to Shelf'}</button></div>
 </div>
 <div class="group">${row('p-deep','Go deeper <small>(optional)</small>','')}<div class="panel" id="p-deep" hidden>
   <p>This walks inward through Leon's rings, one ring at a time. Every link on that walk is <span class="tag ed">editorial</span>, not a documented fact.</p>
   <button class="btn ghost" data-go="#/deeper/${esc(r.id)}">Start from ${esc(r.field)} ›</button> <button class="btn ghost" data-go="#/fits/${esc(r.id)}">How it fits together ›</button></div></div>
 ${tryIt(r)}
 </div>`}
function passport(r){return `<table style="width:100%;font-size:13px;border-collapse:collapse">
 ${(r.sources||[]).map(s=>`<tr><td colspan=2><blockquote>${esc(s.quote||'(no quote captured)')}</blockquote>
 <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><br><small>${esc(s.kind||'')} · locator: ${esc(s.locator||'n/a')} · fetched ${esc(s.fetched_at||'')}</small></td></tr>`).join('')}
 <tr><td><b>Claim: what it is</b></td><td><span class="tag">tertiary-sourced</span></td></tr>
 <tr><td><b>Claim: dates & attribution</b></td><td><span class="tag warn">not independently checked</span></td></tr>
 <tr><td><b>Connections</b></td><td>${r.deeper?'<span class="tag ed">ring links are editorial</span>':'<span class="tag">none</span>'}</td></tr>
 <tr><td><b>Rights</b></td><td>${esc(r.rights_status)}</td></tr>
 <tr><td><b>Review</b></td><td><span class="tag warn">${esc(r.verification_status)}</span> · curator: unassigned</td></tr>
 <tr><td><b>Challenge</b></td><td>Report a correction (stub in the prototype)</td></tr></table>`}
function chain(){const c=X.chain;if(!c)return'';const g=d=>c.hops.filter(h=>h.dir===d).map(h=>`<div class="hop"><div class="dir">${h.dir} · ${esc(h.rel)}</div><b>${esc(h.to)}</b>
 <blockquote>${esc(h.evidence)}</blockquote><span class="tag ${/no_evidence/.test(h.confidence)?'warn':'ok'}">${esc(h.confidence)}</span>
 ${h.uncertainty?`<p><small>Uncertainty: ${esc(h.uncertainty)}</small></p>`:''}<a href="${esc(h.url)}" target="_blank" rel="noopener"><small>source</small></a></div>`).join('');
 return `<div class="pad"><h2>Give Props to the Chain</h2><p>${esc(c.title)}</p>
 <h3>← Backwards</h3>${g('backwards')}<h3>↔ Sideways</h3>${g('sideways')}<h3>→ Forwards</h3>${g('forwards')}</div>`}
function sky(){const k=X.sky;return `<div class="pad"><h2>✦ ${esc(k.title)}</h2><div class="const">${[[30,40],[45,48],[60,52],[52,70],[38,30],[72,28]].map(([x,y],i)=>`<b style="left:${x}%;top:${y}%;${i==2?'width:10px;height:10px;background:#fb923c;box-shadow:0 0 16px #fb923c':''}"></b>`).join('')}<small style="position:absolute;bottom:8px;left:12px;color:#94a3b8">illustrative, not a star chart</small></div>
 ${k.steps.map((s,i)=>`<div class="hop"><div class="dir">step ${i+1}</div><b>${esc(s.h)}</b><p>${esc(s.t)}</p>${s.quote?`<blockquote>${esc(s.quote)}</blockquote>`:'<span class="tag warn">no_evidence_yet</span>'}<a href="${esc(s.url)}" target="_blank"><small>source</small></a></div>`).join('')}</div>`}
function place(){const p=X.place,sec=(n,a)=>`<h3>${n}</h3>`+a.map(x=>`<div class="hop"><b>${esc(x.t)}</b><blockquote>${esc(x.quote)}</blockquote><a href="${esc(x.url)}" target="_blank"><small>source</small></a></div>`).join('');
 return `<div class="pad"><span class="tag">${esc(p.label)}</span><h2>${esc(p.name)}</h2>${sec('Then',p.then)}${sec('Now',p.now)}${sec('Next',p.next)}<p class="tag warn">${esc(p.compare_label)}</p></div>`}
function shelf(){const items=ALL.filter(r=>likes.has(r.id)||saves[r.id]);const n=likes.size,pct=Math.min(100,n);
 return `<div class="pad"><h2>Your Living Shelf</h2><p><small>Private, stored only on this device.</small></p>
 <p><b>${Math.min(n,100)}</b> of 100 distinct likes</p><div class="progress"><i style="width:${pct}%"></i></div>
 <div class="group" style="padding:14px"><span class="tag warn">MOCK: Kindred Curiosity preview</span>
 <p>${n>=100?'Unlocked. You can now <b>choose</b> to opt in. Reaching 100 is not consent.':'Opens at 100 distinct likes. Even then you have to opt in, and you can opt out again.'}
 This is a likes-only overlap. There are no profiles and no messages.</p>
 <div class="const" style="height:110px">${[...Array(14)].map((_,i)=>`<b style="left:${(i*37)%95}%;top:${(i*53)%85+5}%;opacity:${i<Math.min(14,n/7)?1:.25}"></b>`).join('')}</div>
 <small>Synthetic illustration. No real users exist.</small></div>
 ${items.map(r=>`<button class="row" data-go="#/d/${esc(r.id)}">${esc(r.title)} <small>${esc(r.field)}${saves[r.id]?.folder?' · '+esc(saves[r.id].folder):''}</small></button>`).join('')||'<p>Nothing kept yet. Tap ♡ on any card.</p>'}
 <div class="group" style="padding:14px"><label style="display:flex;justify-content:space-between;align-items:center;font-size:17px;min-height:44px">Hide sensitive items <input type="checkbox" ${LS.get('hideSensitive')?'checked':''} onchange="LS.set('hideSensitive',this.checked);applyFilter(FIELD)" role="switch"></label><small>Optional. Items are hidden from your feed only. Nothing is removed from the collection.</small></div>
 <p><button class="btn ghost" onclick="const b=new Blob([JSON.stringify({likes:[...likes],saves},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='living-shelf.json';a.click()">Export</button>
 <button class="btn ghost" style="color:#be123c" onclick="if(confirm('Delete your shelf from this device?')){localStorage.clear();location.hash='';location.reload()}">Delete</button></p></div>`}
function deeper(r){if(!r)return'';const g=(X.guilds_from_image||{})[r.field];const d=r.deeper||{};
 const ring=(col,lbl,body)=>`<div class="ring" style="background:${col}"><small style="opacity:.8">${lbl}</small><div>${body}</div></div>`;
 return `<div class="pad"><h2>Go deeper</h2><p><button class="btn ghost" data-go="#/fits/${esc(r.id)}">See how it fits together ›</button></p><p><small>Outside-in, one ring at a time. You can stop at any ring. <span class="tag ed">Editorial association</span>: these links are curatorial readings. They are not documented claims about ${esc(r.title)}.</small></p>
 ${ring('#334155','Guilds & Jobs (from Leon\'s image)',g?g.map(x=>`<span class="tag">${esc(x)}</span>`).join(''):'<span class="tag warn">no_evidence_yet for this field</span>')}
 ${ring('#7c3aed','Culture field',esc(r.field)+'<div style="margin-top:6px">'+teaser(r)+'</div>')}
 <details><summary class="row" style="cursor:pointer">Continue inward ›</summary>
 ${ring('#15803d','The Islamic sciences · 18, from Golden Age Sciences',esc(d.science_ring_label||'no_evidence_yet')+' <span class="tag ed">editorial</span><div style="margin-top:6px;opacity:.85;font-size:13px">The list of 18 is still being drafted.</div>')}
 ${ring('#0f766e','Something of the 99 Names of Allah','<small>The centre. The Names create reality; the sciences documented how it works.</small>')}</details></div>`}
boot();

function earlyWeb(r){const m=(r.wayback_url||'').match(/\/web\/(\d{4})/);return r.wayback_url?(m?m[1]:(String(r.era||'').match(/\d{4}/)||[''])[0]):''}
function hires(u){if(!u)return u;return u.replace('/web-large/','/original/').replace(/_web\.jpg$/,'_print.jpg').replace(/\/(\d+)px-([^/?]+)(\?.*)?$/,'/2560px-$2')}
window.loupe=(e,el)=>{const L=el.querySelector('.loupe'),b=el.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top,z=3;
 L.style.left=(x-90)+'px';L.style.top=(y-90)+'px';L.style.backgroundSize=`${b.width*z}px ${b.height*z}px`;L.style.backgroundPosition=`${-x*z+90}px ${-y*z+90}px`};
// zoom viewer: pinch, double-tap, drag, wheel
let Z={s:1,x:0,y:0},ptrs=new Map(),pinch0=null,lastTap=0;
window.openZoom=id=>{const r=ALL.find(x=>x.id===id);if(!r?.image)return;const img=$('#zimg');img.src=r.image.src;const hi=hires(r.image.src);
 if(hi!==r.image.src){const pre=new Image();pre.onload=()=>{if($('#zimg').dataset.id===id)img.src=hi};pre.src=hi}img.dataset.id=id;
 $('.zcap').innerHTML=`${esc(r.title)} · ${esc(r.image.licence||'')} · pinch or double-tap to zoom`;Z={s:1,x:0,y:0};apply();$('#zoom').hidden=false};
function apply(){$('#zimg').style.transform=`translate(${Z.x}px,${Z.y}px) scale(${Z.s})`}
function zoomAt(cx,cy,ns){ns=Math.max(1,Math.min(8,ns));const img=$('#zimg'),b=img.getBoundingClientRect();const px=(cx-b.left)/Z.s,py=(cy-b.top)/Z.s;
 Z.x+= (cx-b.left)-px*ns - ((cx-b.left)-px*Z.s); Z.y+= (cy-b.top)-py*ns - ((cy-b.top)-py*Z.s); Z.s=ns; if(ns===1)Z.x=Z.y=0; apply()}
document.addEventListener('DOMContentLoaded',()=>{});
(function wireZoom(){const st=document.querySelector('#zoom');if(!st)return;st.querySelector('.zx').onclick=()=>{st.hidden=true};
 st.addEventListener('pointerdown',e=>{st.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1){const now=Date.now();if(now-lastTap<300){zoomAt(e.clientX,e.clientY,Z.s>1?1:2.5)}lastTap=now}
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0={d:Math.hypot(a.x-b.x,a.y-b.y),s:Z.s}}});
 st.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId);
  if(ptrs.size===2&&pinch0){ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});const [a,b]=[...ptrs.values()];zoomAt((a.x+b.x)/2,(a.y+b.y)/2,pinch0.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch0.d)}
  else if(Z.s>1){Z.x+=e.clientX-p.x;Z.y+=e.clientY-p.y;apply();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY})}});
 const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=null};st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
 st.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,Z.s*(e.deltaY<0?1.2:1/1.2))},{passive:false});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')st.hidden=true})})();
// Watch: vertical reels, muted until tapped
function watch(startId){const list=ALL.filter(r=>tabOf(r)==='Watch'&&(r.media_url||r.embed_url));const i=Math.max(0,list.findIndex(r=>r.id===startId));
 const order0=[...list.slice(i),...list.slice(0,i)];const order=startId?order0:[...order0.filter(r=>r.media_url),...order0.filter(r=>!r.media_url)];
 return `<div class="reels" id="reels"><button class="pill rtop" onclick="history.back()">‹ Back</button>${order.map(r=>`<section class="reel" data-id="${esc(r.id)}">${isGated(r)&&!REVEALED.has(r.id)?`<div class="gate rgate" onclick="REVEALED.add('${esc(r.id)}');this.remove()"><div><b>Some may prefer not to view this.</b><br><i>Lower your wing over the believers.</i> <small class="cite">Qur'an 15:88</small><br>${esc(r.viewing_preference||(isRights(r)?'':r.content_advisory)||'')}<br><span class="pill" style="display:inline-block;margin-top:8px">Tap to view</span></div></div>`:''}
 ${r.media_url?`<video playsinline muted loop preload="metadata" src="${esc(r.media_url)}"></video><button class="snd">🔇 Tap for sound</button>`:`<iframe loading="lazy" src="${esc(r.embed_url)}" allow="fullscreen" title="${esc(r.title)}"></iframe>`}
 <div class="rinfo"><b>${esc(r.title)}</b><br><small>${[r.creator,r.era,r.place].filter(x=>x&&typeof x==='string').map(esc).join(' · ')}</small>
 ${r.content_advisory?`<div class="advisory" style="background:rgba(255,255,255,.12);color:#e7e5e4">ⓘ ${esc(r.content_advisory)}</div>`:''}
 <div><small>${esc(r.rights_status)} · <a style="color:#93c5fd" href="${esc(r._url)}" target="_blank" rel="noopener">source</a>${r.captions?` · <a style="color:#93c5fd" href="${esc(r.captions)}" target="_blank">captions</a>`:' · captions: none found'}</small></div>
 <button class="btn ghost" style="margin-top:8px" data-go="#/d/${esc(r.id)}">More about this</button></div></section>`).join('')||'<p style="color:#fff;padding:40px">No playable films loaded yet.</p>'}</div>`}
function wireReels(){const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector('video');if(!v)return;if(e.isIntersecting&&e.intersectionRatio>.6&&!e.target.querySelector('.rgate')){v.muted=true;v.play().catch(()=>{})}else{v.pause()}}),{threshold:[0,.6,1]});
 document.querySelectorAll('.reel').forEach(r=>io.observe(r));
 document.querySelectorAll('.reel .snd').forEach(b=>b.onclick=e=>{e.stopPropagation();const v=b.parentElement.querySelector('video');v.muted=!v.muted;if(!v.muted){aud.pause()}b.textContent=v.muted?'🔇 Tap for sound':'🔊 Sound on';v.play().catch(()=>{})})}
// Listen: persistent mini-player + queue
const aud=document.getElementById('aud');let Q=[],qi=-1;
window.enqueue=(id,now)=>{const r=ALL.find(x=>x.id===id);if(!r?.media_url)return;if(isGated(r)&&!REVEALED.has(id)){listenGate(r,now);return}if(!Q.includes(r))Q.push(r);if(now||qi<0)playAt(Q.indexOf(r));showMini()};
function playAt(i){qi=i;const r=Q[i];if(!r)return;aud.src=r.media_url;aud.play().catch(()=>{});$('#mTitle').textContent=r.title;
 $('#mMeta').textContent=[r.creator,r.era,r.place].filter(x=>x&&typeof x==='string').join(' · ')||r.source_name||'';showMini()}
function showMini(){$('#mini').hidden=false;document.body.classList.add('hasmini')}
aud.onplay=()=>$('#mPlay').textContent='⏸︎';aud.onpause=()=>$('#mPlay').textContent='▶︎';aud.onended=()=>playAt(qi+1);
aud.ontimeupdate=()=>{$('#mProg i').style.width=(aud.duration?aud.currentTime/aud.duration*100:0)+'%'};
$('#mPlay').onclick=()=>aud.paused?aud.play():aud.pause();$('#mNext').onclick=()=>playAt(qi+1);
$('#mQ').onclick=()=>go('#/queue');

function queue(){const L=ALL.filter(r=>tabOf(r)==='Listen'&&r.media_url);
 return `<div class="pad"><h2>Listen</h2><p><small>Keeps playing while you browse. Recitation, song, archival 78s. Each item streams from its source.</small></p>
 <h3>Up next</h3><div class="group">${Q.map((r,i)=>`<button class="row" onclick="playAt(${i})">${i===qi?'▶︎ ':''}${esc(r.title)}<small>${esc([r.creator,r.era].filter(x=>typeof x==='string').join(' · '))}</small></button>`).join('')||'<div class="panel">Queue is empty</div>'}</div>
 <h3>Everything playable (${L.length})</h3><div class="group">${L.map(r=>`<button class="row" onclick="enqueue('${esc(r.id)}')">${esc(r.title)}<small>+ queue</small></button>`).join('')}</div></div>`}
window.playAt=playAt;

const REVEALED=new Set();
function isRights(r){return /^\s*rights unclear/i.test(r.content_advisory||'')}
function isSens(r){return !!r.content_advisory&&!isRights(r)&&!isHell(r)}
function isVP(r){return !!r.viewing_preference}
function isGated(r){return isSens(r)||isHell(r)||isVP(r)}
function isHell(r){return (r.deep_tags||[]).includes('hell_imagery')}
// Cap: each class <=1% of curated items. In feed order an item of a class is placed only when
// (placedOfClass+1)*100 <= position+1, so any prefix of the feed stays at or under 1%. Deferred items go to the tail (never removed).
function capOrder(list){const out=[],wait={s:[],h:[]},n={s:0,h:0};const cls=r=>isHell(r)?'h':isSens(r)?'s':null; // viewing_preference not capped
 const fit=k=>(n[k]+1)*100<=out.length+1;
 for(const r of list){for(const k of ['s','h'])while(wait[k].length&&fit(k)){out.push(wait[k].shift());n[k]++}
  const k=cls(r);if(!k){out.push(r);continue}if(fit(k)){out.push(r);n[k]++}else wait[k].push(r)}
 window.__deferred=wait.s.length+wait.h.length;return out.concat(wait.s,wait.h)}

function listenGate(r,now){let p=document.getElementById('lgate');if(!p){p=document.createElement('div');p.id='lgate';p.className='lgate';document.body.append(p)}
 p.innerHTML=`<div class="lcard"><b>Some may prefer not to view this.</b><br><i>Lower your wing over the believers.</i> <small class="cite">Qur\'an 15:88</small>${r.viewing_preference?`<p><small>${esc(r.viewing_preference)}</small></p>`:''}<p style="margin:10px 0 0"><b>${esc(r.title)}</b></p>
 <div style="margin-top:14px"><button class="btn" id="lgo">Tap to view</button><button class="btn ghost" id="lno">Not now</button></div></div>`;p.hidden=false;
 p.querySelector('#lgo').onclick=()=>{REVEALED.add(r.id);p.hidden=true;enqueue(r.id,now)};p.querySelector('#lno').onclick=()=>{p.hidden=true}}

const TODAY=new Date().toISOString().slice(0,10);
const fmt=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}catch{return d}};
function hubsFor(r){return PLACES.filter(p=>(p.discovery_ids||[]).includes(r.id)||(p.country_discovery_ids||[]).includes(r.id)).slice(0,2)}
function evWhen(e){const st=e.start||e.next_dates?.start,en=e.end||e.next_dates?.end;
 if(st&&st>=TODAY)return `${fmt(st)}${en&&en!==st?' – '+fmt(en):''}`;
 const known=e.recurrence&&e.recurrence!=='unknown'&&e.typical_month&&e.typical_month!=='unknown';
 if(known)return `usually ${esc(e.typical_month)} (${esc(e.recurrence)})${st?` · last held ${fmt(st)}`:''}`;
 return ''}
function comingUp(h,max=8){const ev=EVENTS.filter(e=>e.place_hub===h.id&&e.status==='verified_active');if(!ev.length)return'';
 ev.sort((a,b)=>String(a.start||'9999').localeCompare(String(b.start||'9999')));
 return `<div class="coming"><div class="dir">Coming up · ${esc(h.label)}</div>${ev.slice(0,max).map(e=>`<a class="evt" href="${esc(e.official_url||e.action_link)}" target="_blank" rel="noopener"><b>${esc(e.name)}</b><span>${evWhen(e)||'see official site'}</span><small>${esc(e.category||'')} · official link · checked ${esc(e.last_checked||'')}</small></a>`).join('')}</div>`}
function hub(id){const h=PLACES.find(p=>p.id===id);if(!h)return'<div class="pad">Not found</div>';
 const ids=new Set([...(h.discovery_ids||[]),...(h.country_discovery_ids||[])]);const ds=ALL.filter(r=>ids.has(r.id));
 const yr=r=>parseInt(String(r.era||r.date||'').match(/\d{4}/)?.[0]||'0');
 const then=ds.filter(r=>r.period==='historical'||(yr(r)&&yr(r)<1950)),now=ds.filter(r=>!then.includes(r));
 const fest=EVENTS.filter(e=>e.place_hub===h.id);const tile=r=>`<button class="ht" data-go="#/d/${esc(r.id)}">${r.image&&!isGated(r)?`<img loading="lazy" src="${esc(r.image.src)}" alt="">`:`<span>${esc(r.title)}</span>`}<small>${esc(r.title)}</small></button>`;
 return `<div class="pad"><span class="tag">Place hub</span><h2>${esc(h.label)}</h2><p style="color:var(--muted)">${esc(h.country||'')}</p>
 ${comingUp(h)||'<p><small>No verified upcoming dates. Festivals listed below link to their sites.</small></p>'}
 <h3>Festivals & gatherings</h3><div class="group">${fest.map(e=>`<a class="row" href="${esc(e.official_url||e.action_link||'#')}" target="_blank" rel="noopener">${esc(e.name)}<small>${e.status==='verified_active'?(evWhen(e)||'official site'):e.status==='expired'?'ended':'link only'}</small></a>`).join('')||'<div class="panel">None listed yet</div>'}</div>
 ${(h.neighbourhoods||[]).length?`<h3>Neighbourhoods</h3><div>${h.neighbourhoods.map(n=>`<span class="tag">${esc(typeof n==='string'?n:n.name)}</span>`).join('')}</div>`:''}
 ${(h.venues||[]).length?`<h3>Venues</h3><div>${h.venues.map(n=>`<span class="tag">${esc(typeof n==='string'?n:n.name)}</span>`).join('')}</div>`:''}
 <h3>Then</h3><div class="hgrid">${then.slice(0,12).map(tile).join('')||'<small>no_evidence_yet</small>'}</div>
 <h3>Now</h3><div class="hgrid">${now.slice(0,12).map(tile).join('')||'<small>no_evidence_yet</small>'}</div>
 <h3>Next</h3><p><small>The dated events above link to their official pages. No other verified opportunity yet.</small></p>
 <p><small>Linked discoveries: ${ds.length}. Then/Now is split by recorded period or date (before 1950 = Then). This is an approximate grouping, not a verified history.</small></p></div>`}
function places(){const withEv=p=>EVENTS.filter(e=>e.place_hub===p.id&&e.status==='verified_active').length;
 const L=[...PLACES].sort((a,b)=>withEv(b)-withEv(a)||a.label.localeCompare(b.label));
 return `<div class="pad"><h2>Places</h2><div class="group">${L.map(p=>`<button class="row" data-go="#/hub/${esc(p.id)}">${esc(p.label)}<small>${withEv(p)?withEv(p)+' coming up · ':''}${esc(p.country||'')}</small></button>`).join('')}</div></div>`}

function countLabel(c){const n=Number(c.total??c.count);return /^loose/i.test(c.reliability||'')?(n>=1000?'<b>Thousands more</b>':'<b>More</b>'):`<b>${n.toLocaleString()}</b>`}

/* ---- How it fits together: 3D rings demo (CSS 3D; stepped 2D under reduced motion) ---- */
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let FT=null,FS=0,FITEMS=[];
const FIT_RINGS=[{k:'names',n:'Something of the 99 Names',c:'#0f766e'},{k:'sci',n:'The Islamic sciences',c:'#15803d'},{k:'fields',n:'20 culture fields',c:'#7c3aed'},{k:'items',n:'The finds',c:'#2563eb'}];
function fitSteps(){const it=FITEMS;const t=it.map(r=>esc(r.title)).join(' and ');return [
 {r:0,h:'It starts at the centre',t:'Something of the 99 Names of Allah. The Names create reality.'},
 {r:1,h:'Then the Islamic sciences',t:'Eighteen of them. The sciences documented how that reality works, a firm base for everything after.'},
 {r:2,h:'Then the culture fields',t:'Light flows out from the sciences into everything in culture. Twenty fields: '+FIELD_ORDER.slice(0,6).map(esc).join(', ')+' and more.'},
 {r:3,h:'Then the finds',t:it.length?'Real things, like '+t+'. Built from the Names, through the sciences, to what exists in culture. This is where you start.':'Real things you can see, watch and hear. This is where you start.'},
 {r:-1,h:'And back again',t:'Every find has a way back to the centre, the Names. Open one, tap “Go deeper”, and follow it in, one ring at a time.'}]}
function fits(){const S=fitSteps();const flat=RM();
 return `<div class="pad fits ${flat?'flat':''}"><h2>How it fits together</h2>
 <div class="fstage" id="fstage" role="button" tabindex="0" aria-label="Next step"><div class="fworld" id="fworld">
 ${bolts()}${FIT_RINGS.map((g,i)=>`<div class="fring" data-r="${i}" style="--i:${i};--c:${g.c}"><span>${esc(g.n)}</span></div>`).join('')}
 </div><div class="fitems" aria-hidden="true">${FITEMS.map(r=>r.image?.src?`<img src="${esc(r.image.src)}" alt="">`:'').join('')}</div></div>
 <div class="fcap" aria-live="polite"><b id="fh"></b><p id="ft"></p></div>
 <div class="fdots">${S.map((_,i)=>`<i data-d="${i}"></i>`).join('')}</div>
 <div class="fctl"><button class="btn ghost" id="fprev" aria-label="Previous step">‹</button><button class="btn" id="fnext">Next</button><button class="btn ghost" id="fskip">Skip</button></div>
 ${FITEMS.length?`<p class="fsee"><small>The finds shown: ${FITEMS.map(r=>`<a href="#/d/${esc(r.id)}">${esc(r.title)}</a>`).join(' · ')}</small></p>`:''}</div>`}
function fitsShow(i){const S=fitSteps();FS=Math.max(0,Math.min(S.length-1,i));const s=S[FS];const w=$('#fworld');if(!w)return;
 $('#fh').textContent=s.h;$('#ft').innerHTML=s.t;
 document.querySelectorAll('.fring').forEach(e=>{const r=+e.dataset.r;e.classList.toggle('on',s.r<0?true:r===s.r);e.classList.toggle('lit',s.r<0||r<=s.r)});
 $('#fstage').classList.toggle('rev',s.r<0);$('#fstage').classList.toggle('flash',s.r>=1||s.r<0);$('#fstage').classList.toggle('showitems',s.r===3||s.r<0);
 document.querySelectorAll('.fdots i').forEach((d,k)=>d.classList.toggle('on',k===FS));
 $('#fnext').textContent=FS===S.length-1?'Done':'Next'}
function fitsStart(r){const pool=ALL.filter(x=>!isGated(x)&&x.image&&x.image.src);FITEMS=r&&!isGated(r)?[r,...pool.filter(x=>x.id!==r.id&&x.field!==r.field).slice(0,1)]:pool.slice(0,2);
 const s=$('#sheet');s.innerHTML=topBar()+fits();FS=0;fitsShow(0);
 const nx=()=>{if(FS>=fitSteps().length-1){fitsStop();history.back();return}fitsShow(FS+1)};
 $('#fstage').onclick=()=>{fitsStop();fitsShow(FS+1)};$('#fstage').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#fstage').click()}};
 $('#fnext').onclick=()=>{fitsStop();nx()};$('#fprev').onclick=()=>{fitsStop();fitsShow(FS-1)};$('#fskip').onclick=()=>{fitsStop();fitsShow(fitSteps().length-1)};
 if(!RM())FT=setInterval(()=>{if(FS>=fitSteps().length-1)return fitsStop();fitsShow(FS+1)},4200)}
function fitsStop(){if(FT){clearInterval(FT);FT=null}}
function hundred(){const n=likes.size,pct=Math.min(100,n);
 return `<div class="pad"><h2>1 (hundred) in a million</h2>
 <p>When you’ve liked 100 things, you’ll be able to meet other people who liked 100 things like you did. Your hundred, out of a million.</p>
 <p><b>${Math.min(n,100)}</b> of 100 hearts</p><div class="progress"><i style="width:${pct}%"></i></div>
 <p><small>Matching isn’t built yet. It’s coming. When it arrives you choose whether to join, and your likes stay on this device until you do.</small></p>
 <p><button class="btn ghost" data-go="#/shelf">See your hearts ›</button></p></div>`}

function bolts(){if(RM())return '';const C=170,out=[];for(let k=0;k<10;k++){const a=(k*51+13)*Math.PI/180,b=a+((k%3)-1)*.35,r0=k%2?35:64,r1=k%2?64:93;
 let pts=[],n=5;for(let s=0;s<=n;s++){const f=s/n,rr=r0+(r1-r0)*f,an=a+(b-a)*f,j=(s>0&&s<n)?((s%2?1:-1)*6):0;pts.push([(C+Math.cos(an)*rr+Math.cos(an+1.57)*j).toFixed(1),(C+Math.sin(an)*rr+Math.sin(an+1.57)*j).toFixed(1)])}
 out.push(`<path d="M${pts.map(p=>p.join(' ')).join(' L')}" style="animation-delay:${(k*0.37%1.6).toFixed(2)}s"/>`)}
 return `<svg class="fbolts" viewBox="0 0 340 340" aria-hidden="true">${out.join('')}</svg>`}
