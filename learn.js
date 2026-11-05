/* Round 38: on every entry, a calm "What happens next?" sheet. View = real talks from the entry's moon. Learn = LSJ coming soon only. */
(function(){
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const I={play:'<rect x="3" y="4.5" width="18" height="15" rx="3.5"/><path d="M10 9v6l5-3z"/>',cap:'<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4"/><path d="M21.5 9.5v5"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',ext:'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/>',back:'<path d="m15 6-6 6 6 6"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>'};
const ic=(n,s=24)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[n]}</g></svg>`;
let D=null,root=null,lastFocus=null,current=null,step='choice',suppressUntil=0;
const L={data:()=>D,forEntry:null};
L.ready=fetch('data/learning.json').then(r=>r.ok?r.json():null).then(j=>{D=j||{courses:{},moons:{},entry_links:{}}}).catch(()=>{D={courses:{},moons:{},entry_links:{}}});
function courseList(r){if(!D)return[];const el=D.entry_links[r.id];if(!el)return[];
 const candidates=[];
 if(typeof el==='string')candidates.push(el);
 else{for(const n of [el.primary,el.secondary])if(n)for(const f of [r.field,'Fashion (a craft guild)','Art / Architecture'])candidates.push(f+'|'+n)}
 const key=candidates.find(k=>D.moons[k]);if(!key)return[];
 const moon=D.moons[key];return moon.courses.map(id=>({id,...D.courses[id],_moon:moon.moon,_field:moon.field}));}
L.forEntry=id=>{const r=window.__entries&&__entries.find(x=>x.id===id);return r?courseList(r):[]};
L.moonFor=r=>{const c=courseList(r);return c.length?c[0]:null};
function shell(){if(root)return root;root=document.createElement('div');root.id='nextSheet';root.className='next-root';root.hidden=true;root.innerHTML='<div class="next-scrim" data-next-close></div><section class="next-sheet" role="dialog" aria-modal="true" aria-labelledby="nextTitle" tabindex="-1"><div class="next-grab" aria-hidden="true"></div><button class="next-x" type="button" aria-label="Close">'+ic('x',20)+'</button><div id="nextBody"></div></section>';
 document.body.appendChild(root);root.querySelector('.next-x').addEventListener('click',()=>L.close());
 root.addEventListener('click',e=>{if(e.target.closest('[data-next-close]'))L.close();const b=e.target.closest('[data-next]');if(!b)return;const a=b.dataset.next;
  if(a==='learn'){step='learn';render()}else if(a==='view'){step='view';render()}else if(a==='back'){step='choice';render()}});
 return root}
function focusables(){return [...root.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')].filter(x=>x.offsetParent!==null)}
function render(){if(!current)return;const r=current,list=courseList(r),moon=list.length;const title=r.title;
 let h='';
 if(step==='learn')h=`<div class="next-center"><div class="next-hero learn">${ic('cap',36)}</div><p class="next-kicker">Learn</p><h2 id="nextTitle">LSJ · Learning Support Journey</h2><p class="next-lead">Learning Support Journey tool coming soon.</p><button class="next-done" type="button" data-next-close>Got it</button></div>`;
 else if(step==='view'){
  const pl=list.find(c=>c.playlist),start=list.find(c=>c.kind==='start')||list[0],first=pl||start;
  h=`<button class="next-back" type="button" data-next="back">${ic('back',18)} Back</button><div class="next-hero view">${ic('play',34)}</div><p class="next-kicker">View · ${esc(r.field)} / ${esc((list[0]&&list[0]._moon)||r.field)}</p><h2 id="nextTitle">${moon} linked talks on YouTube</h2><p class="next-sub">${pl?'The playlist opens first.':'Start with this talk.'} Each talk opens in a new tab.</p>
  <a class="next-primary" href="${esc(first.url)}" target="_blank" rel="noopener noreferrer">${ic('play',20)} ${pl?'Open playlist':'Open first talk'}${ic('ext',17)}</a>
  <div class="next-talks" role="list" aria-label="Linked talks">${list.map(c=>`<a class="next-talk" role="listitem" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span class="next-kind ${c.kind}">${c.kind==='start'?'Start':c.kind==='deeper'?'Go deeper':'Watch it made'}</span><span class="next-talktxt"><b>${esc(c.title)}</b><small>${esc(c.channel)} · ${esc(c.length)}</small></span>${ic('ext',17)}</a>`).join('')}</div><p class="next-note">Free on YouTube. Every talk is at least 5 minutes. Candidate – unreviewed.</p>`;
 }else h=`<p class="next-kicker">What happens next?</p><h2 id="nextTitle">${esc(title)}</h2><p class="next-sub">${moon?moon+' linked talks from this entry’s moon.':'Courses for this moon are being checked.'}</p><div class="next-options">
 <button class="next-option" type="button" data-next="view" ${moon?'':'disabled'}><span class="next-optic view">${ic('play',28)}</span><span><b>View</b><small>${moon?'Watch the course on YouTube':'No checked talks yet'}</small></span><span class="next-chev">${ic('ext',18)}</span></button>
 <button class="next-option" type="button" data-next="learn"><span class="next-optic learn">${ic('cap',28)}</span><span><b>Learn</b><small>LSJ · coming soon</small></span><span class="next-chev">${ic('cap',18)}</span></button></div><p class="next-note">Take your time. One good talk is a good start.</p>`;
 $('#nextBody').innerHTML=h;root.classList.toggle('is-learn',step==='learn');root.classList.toggle('is-view',step==='view');
 const f=$('.next-sheet');if(f)f.scrollTop=0;
 if(step!=='choice')setTimeout(()=>{const b=root.querySelector('.next-back')||root.querySelector('.next-done');if(b)b.focus({preventScroll:true})},0)}
function openEntry(r){if(!r)return;L.ready.then(()=>{current=r;step='choice';lastFocus=document.activeElement;shell();root.hidden=false;document.body.classList.add('next-open');render();setTimeout(()=>root.querySelector('.next-sheet').focus({preventScroll:true}),0)})}
L.openEntry=openEntry;L.openById=id=>{const r=window.__entries&&__entries.find(x=>x.id===id);if(r)openEntry(r)};
L.close=()=>{if(!root||root.hidden)return;root.hidden=true;document.body.classList.remove('next-open');current=null;suppressUntil=Date.now()+500;if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})};
L.isOpen=()=>!!(root&&!root.hidden);
document.addEventListener('keydown',e=>{if(!L.isOpen())return;if(e.key==='Escape'){e.preventDefault();L.close();return}if(e.key==='Tab'){const f=focusables();if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}},true);

// Feed card taps: intercept before the app's normal route. Direct #/d/ links keep working and expose the same sheet from the entry.
document.addEventListener('click',e=>{if(L.isOpen())return;const c=e.target.closest('#feed .card');if(!c)return;if(e.target.closest('a,button,input,select,textarea,label,[data-like],[data-go],[data-toggle]'))return;
 const r=window.__entries&&__entries.find(x=>x.id===c.dataset.id);if(!r)return;if(c.classList.contains('gated'))return;e.preventDefault();e.stopImmediatePropagation();openEntry(r)},true);
window.NEXT=L;
})();
