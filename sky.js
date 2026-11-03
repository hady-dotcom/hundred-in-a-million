// Sky of the day: real astronomy only (moon phase, sun position, prayer times, qibla). No astrology.
const D2R=Math.PI/180,R2D=180/Math.PI;
export const KAABA={lat:21.4225,lon:39.8262};
export const TORONTO={lat:43.6532,lon:-79.3832,label:'Toronto (default)'};
function jd(d){return d.getTime()/86400000+2440587.5}
// NOAA-style solar position
export function sunPos(d,lat,lon){const n=jd(d)-2451545.0;const L=(280.46+0.9856474*n)%360;const g=(357.528+0.9856003*n)*D2R;
 const lam=(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*D2R;const eps=(23.439-0.0000004*n)*D2R;
 const ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam));const dec=Math.asin(Math.sin(eps)*Math.sin(lam));
 const gmst=(18.697374558+24.06570982441908*n)%24;const lst=(gmst*15+lon)*D2R;const H=lst-ra;
 const alt=Math.asin(Math.sin(lat*D2R)*Math.sin(dec)+Math.cos(lat*D2R)*Math.cos(dec)*Math.cos(H));
 let az=Math.atan2(-Math.sin(H),Math.tan(dec)*Math.cos(lat*D2R)-Math.sin(lat*D2R)*Math.cos(H));az=(az*R2D+360)%360;
 // equation of time (minutes)
 const dd=(((L-ra*R2D)%360)+540)%360-180;const eot=4*dd;
 return {alt:alt*R2D,az,dec:dec*R2D,eot}}
// Moon phase from mean synodic month, anchored to the new moon of 2000-01-06 18:14 UTC
export function moonPhase(d){const syn=29.530588853;const ref=Date.UTC(2000,0,6,18,14)/86400000;let age=((d.getTime()/86400000-ref)%syn+syn)%syn;
 const ill=(1-Math.cos(2*Math.PI*age/syn))/2;
 const names=[[1.0,'New moon'],[3.7,'Thin crescent'],[6.4,'Waxing crescent'],[8.4,'First quarter'],[13.8,'Waxing gibbous'],[15.8,'Full moon'],[21.1,'Waning gibbous'],[23.2,'Last quarter'],[28.5,'Waning crescent'],[30,'New moon']];
 const name=names.find(([a])=>age<a)[1];return {age,ill,name,waxing:age<syn/2}}
// Prayer times, ISNA method (Fajr and Isha at 15°), Asr by shadow factor 1. Returns local Date objects.
export function prayerTimes(d,lat,lon){const day=new Date(d);day.setHours(12,0,0,0);
 const tz=-day.getTimezoneOffset()/60;const s=sunPos(day,lat,lon);const dec=s.dec*D2R,phi=lat*D2R;
 const noon=12+tz-lon/15-s.eot/60;
 const ha=a=>{const c=(Math.sin(a*D2R)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec));return c<-1||c>1?NaN:Math.acos(c)*R2D/15};
 const asrAlt=Math.atan(1/(1+Math.tan(Math.abs(phi-dec))))*R2D;
 const T={Fajr:noon-ha(-15),Sunrise:noon-ha(-0.833),Dhuhr:noon+2/60,Asr:noon+ha(asrAlt),Maghrib:noon+ha(-0.833),Isha:noon+ha(-15)};
 const out={};for(const k in T){const h=T[k];const x=new Date(day);x.setHours(0,0,0,0);x.setMinutes(Math.round(h*60));out[k]=x}return out}
export function qibla(lat,lon){const p1=lat*D2R,p2=KAABA.lat*D2R,dl=(KAABA.lon-lon)*D2R;
 const b=Math.atan2(Math.sin(dl),Math.cos(p1)*Math.tan(p2)-Math.sin(p1)*Math.cos(dl));return (b*R2D+360)%360}
export function compass(b){return ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(b/22.5)%16]}
// Focus entries and the ayah that invites people to look at the sky. Texts: Sahih International.
export const AYAT={
 moon:{ref:'Qur’an 36:39–40',url:'https://quran.com/36/39-40',t:'And the moon, We have determined for it phases, until it returns like the old date stalk. It is not allowable for the sun to reach the moon, nor does the night overtake the day, but each, in an orbit, is swimming.'},
 hilal:{ref:'Qur’an 2:189',url:'https://quran.com/2/189',t:'They ask you about the new moons. Say, “They are measurements of time for the people and for Hajj.”'},
 sun:{ref:'Qur’an 55:5',url:'https://quran.com/55/5',t:'The sun and the moon move by precise calculation.'},
 prayer:{ref:'Qur’an 17:78',url:'https://quran.com/17/78',t:'Establish prayer at the decline of the sun until the darkness of the night and also the Qur’an of dawn.'},
 stars:{ref:'Qur’an 6:97',url:'https://quran.com/6/97',t:'And it is He who placed for you the stars that you may be guided by them through the darknesses of the land and sea.'},
 qibla:{ref:'Qur’an 2:144',url:'https://quran.com/2/144',t:'So turn your face toward al-Masjid al-Haram. And wherever you are, turn your faces toward it.'},
 heavens:{ref:'Qur’an 3:190',url:'https://quran.com/3/190',t:'Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding.'}};
export const E={crescent:['ast-c3b7b4aa19','The new crescent that opens Ramadan'],eid:['ast-f2a22ed4eb','The Eid crescent from Pune'],committee:['ast-7cfd1cf5a8','A moon sighting committee’s announcement'],phases:['ast-3b9e15e615','Al-Battani on the phases of the moon'],
 sufi:['met-446297','Book of the Images of the Fixed Stars'],sufi2:['ast-2851e0706a','Al-Sufi’s star figures'],quadrant:['met-449085','Horary quadrant, 10th century'],muwaqqit:['ast-08dd8e5bd2','Dar al-Muwaqqit, the timekeeper’s room, Fez'],muvakkit:['ast-6d022327f6','A muvakkithane, Istanbul'],
 rub:['ast-31817307b5','A sine quadrant (rubʿ)'],mustafa:['ast-9aeddb7202','Mustafa ibn ʿAli al-Muwaqqit'],astrolabe:['met-451699','Planispheric astrolabe, Iran'],ulugh:['ast-e5701eb4b2','Ulugh Beg’s observatory, Samarkand']};
export function today(d,lat,lon){const m=moonPhase(d),s=sunPos(d,lat,lon),p=prayerTimes(d,lat,lon),q=qibla(lat,lon);
 const nowM=d.getTime();const order=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];const next=order.find(k=>p[k]&&p[k].getTime()>nowM)||'Fajr';
 const F=[];
 if(m.age<3.7||m.age>27.5)F.push({k:'Moon',e:E.crescent,a:AYAT.hilal,why:`The moon is ${m.age<3.7?Math.max(0,m.age).toFixed(1)+' days old':'nearly new'}: watchers are looking for the hilal.`});
 else if(m.ill<0.35)F.push({k:'Moon',e:E.sufi,a:AYAT.stars,why:`A ${m.name.toLowerCase()} leaves the sky dark enough to see al-Sufi’s stars tonight.`});
 else F.push({k:'Moon',e:E.phases,a:AYAT.moon,why:`Tonight’s ${m.name.toLowerCase()} (${Math.round(m.ill*100)}% lit), the phases al-Battani tabled.`});
 if(s.alt>0)F.push({k:'Sun',e:s.alt>25?E.quadrant:E.muwaqqit,a:AYAT.sun,why:`The sun is ${s.alt.toFixed(0)}° up, bearing ${s.az.toFixed(0)}°. A muwaqqit would read the hour from this.`});
 else F.push({k:'Sun',e:E.muvakkit,a:AYAT.prayer,why:`The sun is ${Math.abs(s.alt).toFixed(0)}° below the horizon. Next prayer: ${next}.`});
 F.push({k:'Qibla',e:E.rub,a:AYAT.qibla,why:`From here the qibla is ${q.toFixed(1)}° (${compass(q)}), worked out on a sine quadrant like this one.`});
 return {moon:m,sun:s,prayers:p,next,qibla:q,focus:F}}
