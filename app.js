/* My Health v2.0.0 — (c) Ashen Wijesingha. Nutrition guidance: Gayathri Dissanayaka, Registered Dietitian & Nutritionist. */
(function(){
/* =====================================================================
   My Health — core: utilities, i18n, store, schedules, classifications
   ===================================================================== */
'use strict';
var CFG = self.MH_CONFIG || {};
var VERSION = '2.0.0';

/* ---------- DOM & formatting utilities ---------- */
var $ = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function pad(n){return String(n).padStart(2,'0');}
function dKey(d){d=d||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function localDT(d){return dKey(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes());}
function hhmm(d){return pad(d.getHours())+':'+pad(d.getMinutes());}
function parseDay(s){if(!s)return null;var p=String(s).split('-');if(p.length<3)return null;var d=new Date(+p[0],+p[1]-1,+p[2]);return isNaN(d)?null:d;}
function parseDT(s){if(!s)return null;var m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s);if(!m)return null;return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]);}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
function pnum(v){if(v==null)return NaN;var s=String(v).replace(/,/g,'.').replace(/[^0-9.\-]/g,'');if(s===''||s==='.'||s==='-')return NaN;var n=parseFloat(s);return isFinite(n)?n:NaN;}
function r1(x){return Math.round(x*10)/10;}
function f1(x){return r1(x).toFixed(1);}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function ageOf(dob){var d=parseDay(dob);if(!d)return null;var t=new Date(),a=t.getFullYear()-d.getFullYear();if(t.getMonth()<d.getMonth()||(t.getMonth()===d.getMonth()&&t.getDate()<d.getDate()))a--;return a>=0&&a<130?a:null;}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function isStandalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;}

/* ---------- i18n ---------- */
var LANG='en';
var LOCALES={en:'en-GB',si:'si-LK',ta:'ta-LK'};
function t(s,vars){
  var d=(self.MH_I18N||{})[LANG],r=(LANG!=='en'&&d&&d[s])||s;
  if(vars)for(var k in vars)r=r.split('{'+k+'}').join(vars[k]);
  return r;
}
function loc(){return LOCALES[LANG]||'en-GB';}
var LDATA={
  si:{m:['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'],ms:['ජන','පෙබ','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝ','සැප්','ඔක්','නොවැ','දෙසැ'],
      w:['ඉරිදා','සඳුදා','අඟහරුවාදා','බදාදා','බ්‍රහස්පතින්දා','සිකුරාදා','සෙනසුරාදා'],ws:['ඉරි','සඳු','අඟ','බදා','බ්‍රහ','සිකු','සෙන'],wn:['ඉ','ස','අ','බ','බ්‍ර','සි','සෙ'],am:'පෙ.ව.',pm:'ප.ව.',ap:'pre'},
  ta:{m:['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'],ms:['ஜன.','பிப்.','மார்.','ஏப்.','மே','ஜூன்','ஜூலை','ஆக.','செப்.','அக்.','நவ.','டிச.'],
      w:['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'],ws:['ஞாயி.','திங்.','செவ்.','புத.','வியா.','வெள்.','சனி'],wn:['ஞா','தி','செ','பு','வி','வெ','ச'],am:'முற்பகல்',pm:'பிற்பகல்',ap:'pre'}
};
var nativeLoc={};
function nativeOk(){if(LANG==='en')return true;if(nativeLoc[LANG]!=null)return nativeLoc[LANG];var re=LANG==='si'?/[\u0D80-\u0DFF]/:/[\u0B80-\u0BFF]/,ok=false;
  try{ok=re.test(new Date(2020,10,1).toLocaleDateString(loc(),{month:'long'}))&&re.test(new Date(2020,10,1,9).toLocaleTimeString(loc(),{hour:'numeric',hour12:true}));}catch(e){}return nativeLoc[LANG]=ok;}
function fmtD(d,o){
  if(nativeOk()){var opt={};if(o.wd)opt.weekday=o.wd;if(o.mon)opt.month=o.mon;if(o.day)opt.day='numeric';if(o.year)opt.year='numeric';return d.toLocaleDateString(loc(),opt);}
  var L=LDATA[LANG],parts=[];if(o.wd)parts.push((o.wd==='long'?L.w:o.wd==='narrow'?L.wn:L.ws)[d.getDay()]);
  var dm=[];if(o.mon)dm.push((o.mon==='long'?L.m:L.ms)[d.getMonth()]);if(o.day)dm.push(d.getDate());if(o.year)dm.unshift(d.getFullYear());
  if(o.wd&&!o.mon&&!o.day)return parts[0];return (parts.length?parts[0]+', ':'')+dm.join(' ');
}
function fDate(d){return fmtD(d,{day:1,mon:'short',year:1});}
function fDay(d){return fmtD(d,{wd:'short',day:1,mon:'short'});}
function fLong(d){return fmtD(d,{wd:'long',day:1,mon:'long'});}
function fTime(d){if(nativeOk())return d.toLocaleTimeString(loc(),{hour:'numeric',minute:'2-digit',hour12:true});var L=LDATA[LANG],h=d.getHours();return (h<12?L.am:L.pm)+' '+(((h+11)%12)+1)+':'+pad(d.getMinutes());}
function fTimeStr(s){var p=String(s).split(':');var d=new Date();d.setHours(+p[0],+p[1],0,0);return fTime(d);}
function fNum(n){return Number(n).toLocaleString(loc());}
function relDay(d){var td=parseDay(dKey()),x=new Date(d.getFullYear(),d.getMonth(),d.getDate()),diff=Math.round((x-td)/864e5);
  if(diff===0)return t('Today');if(diff===1)return t('Tomorrow');if(diff===-1)return t('Yesterday');if(diff>1&&diff<7)return t('In {n} days',{n:diff});if(diff<-1&&diff>-7)return t('{n} days ago',{n:-diff});return fDay(d);}
function greet(){var h=new Date().getHours();return h<12?t('Good morning'):h<17?t('Good afternoon'):t('Good evening');}
function plural(n,one,many){return t(n===1?one:many,{n:n});}

/* ---------- Store (local-first, synced when signed in) ---------- */
var KEY='myhealth.v2', DB, storageOK=true;
var COLLS=['people','meds','doses','logs','appts','records'];
var KIND={people:'person',meds:'med',doses:'dose',logs:'log',appts:'appt',records:'record'};
var COLL_OF={person:'people',med:'meds',dose:'doses',log:'logs',appt:'appts',record:'records'};
function tzName(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Colombo';}catch(e){return 'Asia/Colombo';}}
function newPerson(name){var id=uid();return {id:id,pid:id,name:name||t('Me'),sex:'',dob:'',height:'',blood:'',allergies:'',conditions:'',notes:'',
  doctor:'',doctorPhone:'',contacts:[{name:'',rel:'',phone:''},{name:'',rel:'',phone:''},{name:'',rel:'',phone:''}],cutoff:'asia',waterGoal:2000,glass:250,stepGoal:8000,
  tz:tzName(),missAfter:30,circle:null,color:'#1877F2'};}
function defaults(){var p=newPerson('');p.name='';return {v:2,active:p.id,me:p.id,people:[p],meds:[],doses:[],logs:[],appts:[],records:[],
  settings:{theme:'auto',lang:'',size:'normal',simple:false,sound:'chime',vibrate:true,alarms:true,alarmPeople:null,push:{on:false,remind:[],missed:[],water:false},onboarded:false},
  cloud:{cursor:null,attached:{}},watch:{},created:new Date().toISOString()};}
function migrateV1(){
  var raw=null;try{raw=localStorage.getItem('myhealth.v1');}catch(e){}
  if(!raw)return null;var o;try{o=JSON.parse(raw);}catch(e){return null;}
  if(!o||!Array.isArray(o.profiles))return null;
  var D=defaults();D.people=[];
  o.profiles.forEach(function(p){var n=newPerson(p.name);for(var k in p)if(k!=='id')n[k]=p[k];n.id=p.id;n.pid=p.id;n.tz=tzName();n.missAfter=30;n.circle=null;D.people.push(n);
    (o.logs&&o.logs[p.id]||[]).forEach(function(e){var x=JSON.parse(JSON.stringify(e));x.pid=p.id;D.logs.push(x);});
    (o.meds&&o.meds[p.id]||[]).forEach(function(m){var x=JSON.parse(JSON.stringify(m));x.pid=p.id;x.form=x.form||'tablet';D.meds.push(x);});
    (o.appts&&o.appts[p.id]||[]).forEach(function(a){var x=JSON.parse(JSON.stringify(a));x.pid=p.id;D.appts.push(x);});
    var tk=o.taken&&o.taken[p.id]||{};Object.keys(tk).forEach(function(day){Object.keys(tk[day]).forEach(function(k){var i=k.indexOf('@'),mid=k.slice(0,i),tm=k.slice(i+1);
      if(tm.length===5)D.doses.push({id:mid+'_'+day+'_'+tm,pid:p.id,med:mid,date:day,time:tm,status:'taken',at:tk[day][k]});
      else D.doses.push({id:mid+'_'+day+'_prn'+tm.replace(/:/g,''),pid:p.id,med:mid,date:day,time:'prn',status:'taken',at:tk[day][k]});});});
  });
  if(!D.people.length)return null;
  D.active=o.active&&D.people.some(function(p){return p.id===o.active;})?o.active:D.people[0].id;D.me=D.people[0].id;
  if(o.settings&&o.settings.theme)D.settings.theme=o.settings.theme;
  if(o.syncInfo)D.watch=o.syncInfo;
  D.settings.onboarded=true;
  return D;
}
function load(){
  try{var raw=localStorage.getItem(KEY);DB=raw?JSON.parse(raw):null;}catch(e){DB=null;storageOK=false;}
  if(!DB)DB=migrateV1()||defaults();
  var d=defaults();
  COLLS.forEach(function(c){if(!Array.isArray(DB[c]))DB[c]=[];});
  ['settings','cloud','watch'].forEach(function(k){if(!DB[k]||typeof DB[k]!=='object')DB[k]=d[k];});
  for(var k in d.settings)if(DB.settings[k]===undefined)DB.settings[k]=d.settings[k];
  if(!DB.settings.push)DB.settings.push=d.settings.push;
  if(!DB.cloud.attached)DB.cloud.attached={};
  if(!DB.people.filter(function(p){return !p._del;}).length){var p=newPerson('');p.name='';DB.people.push(p);DB.active=p.id;DB.me=p.id;}
  DB.people.forEach(function(p){var n=newPerson();for(var k in n)if(p[k]===undefined)p[k]=n[k];p.pid=p.id;while(p.contacts.length<3)p.contacts.push({name:'',rel:'',phone:''});});
  if(!live('people').some(function(p){return p.id===DB.active;}))DB.active=live('people')[0].id;
  if(!DB.me||!live('people').some(function(p){return p.id===DB.me;}))DB.me=DB.active;
}
var saveT=null;
function save(now){
  clearTimeout(saveT);
  var go=function(){try{localStorage.setItem(KEY,JSON.stringify(DB));storageOK=true;}catch(e){storageOK=false;toast(t('Could not save — storage is full or blocked'));}};
  if(now)go();else saveT=setTimeout(go,60);
}
function live(c){return DB[c].filter(function(x){return !x._del;});}
function mine(c,pid){pid=pid||DB.active;return DB[c].filter(function(x){return !x._del&&x.pid===pid;});}
function byId(c,id){for(var i=0;i<DB[c].length;i++)if(DB[c][i].id===id)return DB[c][i];return null;}
function personOf(pid){return byId('people',pid);}
function P(){return byId('people',DB.active)||live('people')[0];}
function pname(p){return (p&&p.name)||t('Me');}
function put(c,o){o._u=Date.now();o._dirty=1;if(c==='people')o.pid=o.id;if(!byId(c,o.id))DB[c].push(o);save();if(Cloud)Cloud.soon();return o;}
function del(c,o){
  var p=personOf(o.pid);
  if(p&&p.circle){o._del=1;o._u=Date.now();o._dirty=1;}
  else{var i=DB[c].indexOf(o);if(i>=0)DB[c].splice(i,1);}
  save();if(Cloud)Cloud.soon();
}
function delPerson(p){COLLS.forEach(function(c){if(c==='people')return;DB[c].filter(function(x){return x.pid===p.id&&!x._del;}).forEach(function(x){del(c,x);});});del('people',p);
  if(DB.active===p.id)DB.active=live('people')[0]?live('people')[0].id:null;if(DB.me===p.id)DB.me=DB.active;
  if(!live('people').length){var n=newPerson('');DB.people.push(n);DB.active=n.id;DB.me=n.id;}
  save();}

/* ---------- Medicine schedule (mirrors server) ---------- */
var FOOD={any:'Any time',before:'Before food',after:'After food','with':'With food',empty:'Empty stomach',bed:'At bedtime'};
var FORMS={tablet:['💊','Tablet'],capsule:['💊','Capsule'],syrup:['🥄','Syrup / liquid'],injection:['💉','Injection'],insulin:['💉','Insulin'],inhaler:['🌬️','Inhaler'],drops:['💧','Drops'],cream:['🧴','Cream / ointment'],patch:['🩹','Patch'],other:['⚕️','Other']};
var DAYN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function dayNum(s){var p=s.split('-');return Math.floor(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5);}
function medOn(m,day){
  if(!m||m._del||m.paused||m.freq==='prn')return false;
  if(m.start&&day<m.start)return false;if(m.end&&day>m.end)return false;
  if(m.freq==='days'){var d=parseDay(day);return Array.isArray(m.days)&&m.days.indexOf(d.getDay())>=0;}
  if(m.freq==='interval'){var n=Math.max(1,+m.every||1);return (dayNum(day)-dayNum(m.start||day))%n===0;}
  return true;
}
function medIcon(m){return (FORMS[m.form]||FORMS.tablet)[0];}
function freqText(m){
  if(m.freq==='prn')return t('Only when needed');
  if(m.freq==='days')return (m.days||[]).slice().sort().map(function(d){return t(DAYN[d]);}).join(', ');
  if(m.freq==='interval')return t('Every {n} days',{n:m.every||2});
  return t('Every day');
}
function doseId(m,day,time){return m.id+'_'+day+'_'+time;}
function schedule(pid,day){
  day=day||dKey();var out=[];
  mine('meds',pid).forEach(function(m){
    if(m.freq==='prn'){if(m.paused)return;if(m.start&&day<m.start)return;if(m.end&&day>m.end)return;
      var n=mine('doses',pid).filter(function(x){return x.med===m.id&&x.date===day&&x.time==='prn';}).length;out.push({m:m,prn:true,count:n,time:null});return;}
    if(!medOn(m,day))return;
    (m.times||[]).forEach(function(tm){var id=doseId(m,day,tm),d=byId('doses',id);if(d&&d._del)d=null;out.push({m:m,time:tm,id:id,dose:d,status:d?d.status:null});});
  });
  out.sort(function(a,b){return (a.time||'99')<(b.time||'99')?-1:(a.time||'99')>(b.time||'99')?1:0;});
  return out;
}
function dueState(x,day){
  if(x.prn)return 'prn';if(x.status==='taken')return 'taken';if(x.status==='skipped')return 'skipped';
  var now=new Date(),p=x.time.split(':'),due=parseDay(day||dKey());due.setHours(+p[0],+p[1],0,0);
  var diff=(now-due)/60000;if(diff<-60)return 'upcoming';if(diff<0)return 'soon';if(diff<=60)return 'due';return 'late';
}
function setDose(m,day,time,status){
  var id=doseId(m,day,time),d=byId('doses',id),prev=d&&!d._del?d.status:null;
  if(status===prev)status=null;
  if(!status){if(d){d.status=null;del('doses',d);}}
  else{if(!d){d={id:id,pid:m.pid,med:m.id,date:day,time:time};}d._del=0;d.status=status;d.at=new Date().toISOString();d.by=Cloud.user?Cloud.user.id:'local';put('doses',d);}
  if(m.stock!==''&&m.stock!=null&&!isNaN(+m.stock)){var q=+m.qty||1;
    if(status==='taken'&&prev!=='taken'){m.stock=Math.max(0,r1(+m.stock-q));put('meds',m);}
    else if(prev==='taken'&&status!=='taken'){m.stock=r1(+m.stock+q);put('meds',m);}}
  return status;
}
function logPrn(m){var now=new Date(),day=dKey(now);put('doses',{id:m.id+'_'+day+'_prn'+hhmm(now).replace(':','')+pad(now.getSeconds()),pid:m.pid,med:m.id,date:day,time:'prn',status:'taken',at:now.toISOString()});
  if(m.stock!==''&&m.stock!=null&&!isNaN(+m.stock)){m.stock=Math.max(0,r1(+m.stock-(+m.qty||1)));put('meds',m);}}
function daysLeft(m){if(m.stock===''||m.stock==null||isNaN(+m.stock)||m.freq==='prn')return null;var per=(m.times||[]).length*(+m.qty||1);if(m.freq==='interval')per=per/Math.max(1,+m.every||1);if(m.freq==='days')per=per*(m.days||[]).length/7;return per>0?Math.floor(+m.stock/per):null;}
function adherence(pid,days){
  var tot=0,ok=0,now=new Date();
  for(var i=days-1;i>=0;i--){var day=dKey(addDays(now,-i));schedule(pid,day).forEach(function(x){if(x.prn)return;var p=x.time.split(':'),due=parseDay(day);due.setHours(+p[0],+p[1]);if(due>now)return;tot++;if(x.status==='taken')ok++;});}
  return {tot:tot,ok:ok,pct:tot?Math.round(ok/tot*100):null};
}

/* ---------- Classifications ---------- */
var BMI_STD={
  asia:{label:'Asian (WHO Asia-Pacific)',healthy:[18.5,22.9],bands:[{n:'Underweight',max:18.5,c:'info'},{n:'Normal',max:23,c:'ok'},{n:'Overweight (at risk)',max:25,c:'warn'},{n:'Obese I',max:30,c:'warn2'},{n:'Obese II',max:Infinity,c:'bad'}]},
  who:{label:'WHO International',healthy:[18.5,24.9],bands:[{n:'Underweight',max:18.5,c:'info'},{n:'Normal',max:25,c:'ok'},{n:'Overweight',max:30,c:'warn'},{n:'Obese I',max:35,c:'warn2'},{n:'Obese II',max:40,c:'bad'},{n:'Obese III',max:Infinity,c:'bad2'}]}
};
var BMI_MSG={Underweight:'Below the healthy range. A dietitian can help you gain weight safely.',Normal:'Within the healthy range. Keep up balanced eating and regular activity.',
  'Overweight (at risk)':'Slightly above the healthy range for Asian adults. Small lifestyle changes make a big difference.',Overweight:'Above the healthy range. Small lifestyle changes make a big difference.',
  'Obese I':'Above the healthy range. Professional dietary guidance is recommended.','Obese II':'Well above the healthy range. Please consult a doctor or dietitian.','Obese III':'Severely above the healthy range. Please seek medical and dietetic support.'};
function bmiClass(b,std){var B=BMI_STD[std||'asia'].bands,v=r1(b);for(var i=0;i<B.length;i++)if(v<B[i].max)return {n:B[i].n,c:B[i].c,i:i};var L=B[B.length-1];return {n:L.n,c:L.c,i:B.length-1};}
function bpClass(s,d){
  if(s>180||d>120)return {n:'Very high — urgent',c:'bad2',m:'If you have chest pain, breathlessness, weakness, vision or speech problems, call 1990 now. Otherwise rest 5 minutes, re-check and contact your doctor today.'};
  if(s>=140||d>=90)return {n:'High (Stage 2)',c:'bad',m:'Consistently at this level needs medical review. Contact your doctor.'};
  if(s>=130||d>=80)return {n:'High (Stage 1)',c:'warn2',m:'Above normal. Discuss with your doctor; reduce salt, stay active.'};
  if(s>=120)return {n:'Elevated',c:'warn',m:'Slightly above normal. Lifestyle changes help: less salt, more activity.'};
  if(s<90||d<60)return {n:'Low',c:'info',m:'Lower than usual. If you feel dizzy or faint, sit or lie down and seek advice.'};
  return {n:'Normal',c:'ok',m:'Healthy blood pressure. Keep it up!'};
}
var SUGAR_CTX={fasting:'Fasting',before:'Before meal',after:'2 h after meal',random:'Random',bedtime:'Bedtime'};
function sugarClass(v,ctx){
  if(v<54)return {n:'Very low',c:'bad2',m:'Treat immediately with fast sugar and get help if not improving.'};
  if(v<70)return {n:'Low',c:'bad',m:'Take 15 g fast sugar (e.g. 3 tsp sugar in water), re-check in 15 minutes.'};
  if(ctx==='fasting'||ctx==='before'){if(v<100)return {n:'Normal',c:'ok',m:'Within the usual fasting range.'};if(v<126)return {n:'Above normal',c:'warn',m:'In the pre-diabetes range when fasting. Discuss with your doctor.'};return {n:'High',c:'bad',m:'In the diabetes range when fasting. Please consult your doctor.'};}
  if(v<140)return {n:'Normal',c:'ok',m:'Within the usual range.'};if(v<200)return {n:'Above normal',c:'warn',m:'Higher than usual. Discuss with your doctor.'};
  return {n:'High',c:'bad',m:'High reading. If you feel unwell, very thirsty or drowsy, seek medical care.'};
}
function pulseClass(v){if(v<50)return {n:'Low',c:'info'};if(v<=100)return {n:'Normal',c:'ok'};if(v<=120)return {n:'High',c:'warn2'};return {n:'Very high',c:'bad'};}
function tempClass(v){if(v<35)return {n:'Too low',c:'bad'};if(v<37.5)return {n:'Normal',c:'ok'};if(v<38)return {n:'Slightly raised',c:'warn'};if(v<39.5)return {n:'Fever',c:'warn2'};return {n:'High fever',c:'bad'};}
function spo2Class(v){if(v>=95)return {n:'Normal',c:'ok'};if(v>=92)return {n:'Slightly low',c:'warn'};return {n:'Low — seek advice',c:'bad'};}
function sleepClass(v){if(v<6)return {n:'Too little',c:'warn2'};if(v<7)return {n:'A bit short',c:'warn'};if(v<=9)return {n:'Good',c:'ok'};return {n:'Long',c:'info'};}
var MOODS=[null,['😣','Very bad'],['🙁','Not good'],['😐','Okay'],['🙂','Good'],['😄','Great']];

/* ---------- Tracker types ---------- */
var TYPES={
  weight:{n:'Weight',em:'⚖️',color:'#1877F2',fields:[{k:'v',l:'Weight',u:'kg',min:2,max:350,dp:1}],show:function(v){return f1(v.v)+'<small> kg</small>';},val:function(v){return v.v;},
    cls:function(v){var h=pnum(P().height);if(!h)return null;var b=v.v/Math.pow(h/100,2),c=bmiClass(b,P().cutoff);return {n:'BMI {b} · {c}',vars:{b:f1(b),c:t(c.n)},c:c.c};}},
  bp:{n:'Blood pressure',em:'🩺',color:'#D93636',color2:'#3BA3F5',fields:[{k:'s',l:'Systolic (top)',u:'mmHg',min:50,max:260},{k:'d',l:'Diastolic (bottom)',u:'mmHg',min:30,max:180},{k:'p',l:'Pulse (optional)',u:'bpm',min:25,max:250,opt:true}],
    show:function(v){return v.s+'/'+v.d+'<small> mmHg</small>';},val:function(v){return v.s;},val2:function(v){return v.d;},cls:function(v){return bpClass(v.s,v.d);}},
  sugar:{n:'Blood sugar',em:'🩸',color:'#A61E4D',fields:[{k:'v',l:'Blood glucose',u:'mg/dL',min:10,max:700},{k:'ctx',l:'When',type:'select',opts:SUGAR_CTX}],
    show:function(v){return v.v+'<small> mg/dL</small>';},val:function(v){return v.v;},sub:function(v){return t(SUGAR_CTX[v.ctx]||'');},cls:function(v){return sugarClass(v.v,v.ctx);}},
  steps:{n:'Steps',em:'👟',color:'#22A55B',fields:[{k:'v',l:'Steps',u:'steps',min:0,max:100000}],show:function(v){return fNum(v.v)+'<small> '+t('steps')+'</small>';},val:function(v){return v.v;},
    cls:function(v){var g=+P().stepGoal||8000;return v.v>=g?{n:'Goal reached',c:'ok'}:v.v>=g*0.6?{n:'Almost there',c:'warn'}:{n:'Low activity',c:'warn2'};}},
  sleep:{n:'Sleep',em:'😴',color:'#7A5AF8',fields:[{k:'v',l:'Hours slept',u:'h',min:0,max:24,dp:1}],show:function(v){return f1(v.v)+'<small> h</small>';},val:function(v){return v.v;},
    sub:function(v){return v.from&&v.to?fTimeStr(v.from)+' – '+fTimeStr(v.to):'';},cls:function(v){return sleepClass(v.v);}},
  pulse:{n:'Heart rate',em:'❤️',color:'#EE6A2B',fields:[{k:'v',l:'Heart rate (resting)',u:'bpm',min:25,max:250}],show:function(v){return v.v+'<small> bpm</small>';},val:function(v){return v.v;},cls:function(v){return pulseClass(v.v);}},
  hrday:{n:'Daily heart rate',em:'⌚',color:'#EE6A2B',fields:[{k:'v',l:'Average heart rate',u:'bpm',min:25,max:250},{k:'min',l:'Lowest (optional)',u:'bpm',min:25,max:250,opt:true},{k:'max',l:'Highest (optional)',u:'bpm',min:25,max:250,opt:true}],
    show:function(v){return v.v+'<small> bpm</small>';},val:function(v){return v.v;},sub:function(v){return v.min&&v.max&&v.min!==v.max?t('Range {a}–{b} bpm',{a:v.min,b:v.max}):'';},cls:function(v){return pulseClass(v.v);}},
  temp:{n:'Temperature',em:'🌡️',color:'#E9A10F',fields:[{k:'v',l:'Temperature',u:'°C',min:30,max:45,dp:1}],show:function(v){return f1(v.v)+'<small> °C</small>';},val:function(v){return v.v;},cls:function(v){return tempClass(v.v);}},
  spo2:{n:'Oxygen (SpO₂)',em:'🫁',color:'#3BA3F5',fields:[{k:'v',l:'Oxygen saturation',u:'%',min:50,max:100}],show:function(v){return v.v+'<small> %</small>';},val:function(v){return v.v;},cls:function(v){return spo2Class(v.v);}},
  waist:{n:'Waist',em:'📏',color:'#22A55B',fields:[{k:'v',l:'Waist circumference',u:'cm',min:30,max:250,dp:1}],show:function(v){return f1(v.v)+'<small> cm</small>';},val:function(v){return v.v;},
    cls:function(v){if(!P().sex)return null;var m=P().sex==='male'?90:80;return v.v>=m?{n:'Above Asian cut-off ({m} cm)',vars:{m:m},c:'warn2'}:{n:'Healthy range',c:'ok'};}},
  mood:{n:'Mood',em:'🙂',color:'#F2A51A',fields:[{k:'v',l:'How are you feeling?',type:'mood',min:1,max:5}],show:function(v){return (MOODS[v.v]||MOODS[3])[0]+' <small>'+t((MOODS[v.v]||MOODS[3])[1])+'</small>';},val:function(v){return v.v;},
    cls:function(v){return v.v>=4?{n:'Feeling good',c:'ok'}:v.v===3?{n:'Okay',c:'warn'}:{n:'Not feeling well',c:'warn2'};}},
  symptom:{n:'Symptoms',em:'🤒',color:'#D93636',fields:[{k:'name',l:'Symptom',type:'text',ph:'e.g. Headache, cough, dizziness'},{k:'v',l:'Severity (1–10)',u:'/10',min:1,max:10}],
    show:function(v){return esc(v.name||t('Symptom'))+' <small>'+v.v+'/10</small>';},val:function(v){return v.v;},cls:function(v){return v.v>=8?{n:'Severe',c:'bad'}:v.v>=5?{n:'Moderate',c:'warn2'}:{n:'Mild',c:'warn'};}},
  water:{n:'Water',em:'💧',color:'#3BA3F5',fields:[{k:'v',l:'Amount',u:'ml',min:10,max:5000}],show:function(v){return v.v+'<small> ml</small>';},val:function(v){return v.v;},cls:function(){return null;}}
};
var TYPE_ORDER=['weight','bp','sugar','steps','sleep','pulse','hrday','temp','spo2','waist','mood','symptom','water'];
var SRC={apple:'Apple Health',shortcut:'Watch sync',csv:'CSV import',ble:'Bluetooth'};
function isDaily(e){return e.type==='steps'||e.type==='hrday'||(e.type==='pulse'&&e.src&&e.src!=='ble');}
function logsOf(type,pid){return mine('logs',pid).filter(function(e){return e.type===type;}).sort(function(a,b){return a.t<b.t?-1:a.t>b.t?1:0;});}
function latest(type,pid){var l=logsOf(type,pid);return l.length?l[l.length-1]:null;}
function latestWeight(pid){var e=latest('weight',pid);return e?e.v.v:NaN;}
function waterOn(day,pid){return mine('logs',pid).filter(function(e){return e.type==='water'&&e.t.slice(0,10)===day;}).reduce(function(s,e){return s+e.v.v;},0);}
function whenStr(e){var d=parseDT(e.t);return isDaily(e)?fDay(d):fDay(d)+' · '+fTime(d);}

/* =====================================================================
   UI primitives: toast, tags, fields, bottom sheet, confirm, charts
   ===================================================================== */
var toastT;
function toast(msg,ms){var el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove('on');},ms||2400);}
function tag(c){return c?'<span class="tag c-'+c.c+'">'+esc(t(c.n,c.vars))+'</span>':'';}
function field(o){
  var id='f_'+o.k,v=o.val==null?'':o.val,h='<div class="f">',lab='<label for="'+id+'">'+esc(t(o.l))+'</label>';
  if(o.type==='select'){h+=lab+'<select id="'+id+'" name="'+o.k+'">';for(var k in o.opts)h+='<option value="'+esc(k)+'"'+(String(k)===String(v)?' selected':'')+'>'+esc(o.raw?o.opts[k]:t(o.opts[k]))+'</option>';h+='</select>';}
  else if(o.type==='textarea')h+=lab+'<textarea id="'+id+'" name="'+o.k+'" placeholder="'+esc(t(o.ph||''))+'">'+esc(v)+'</textarea>';
  else if(o.type==='date'||o.type==='time'||o.type==='datetime-local')h+=lab+'<input type="'+o.type+'" id="'+id+'" name="'+o.k+'" value="'+esc(v)+'">';
  else if(o.type==='tel')h+=lab+'<input type="tel" inputmode="tel" autocomplete="off" id="'+id+'" name="'+o.k+'" value="'+esc(v)+'" placeholder="'+esc(t(o.ph||''))+'">';
  else if(o.type==='email')h+=lab+'<input type="email" inputmode="email" autocomplete="email" autocapitalize="off" id="'+id+'" name="'+o.k+'" value="'+esc(v)+'" placeholder="'+esc(t(o.ph||''))+'">';
  else if(o.type==='password')h+=lab+'<input type="password" autocomplete="'+(o.ac||'current-password')+'" id="'+id+'" name="'+o.k+'" value="" placeholder="'+esc(t(o.ph||''))+'">';
  else if(o.type==='mood'){h+='<span class="lbl">'+esc(t(o.l))+'</span><div class="moods" data-seg="'+o.k+'">';for(var i=1;i<=5;i++)h+='<button type="button" data-val="'+i+'" aria-pressed="'+(String(v||3)===String(i))+'" aria-label="'+esc(t(MOODS[i][1]))+'"><span>'+MOODS[i][0]+'</span><small>'+esc(t(MOODS[i][1]))+'</small></button>';h+='</div><input type="hidden" name="'+o.k+'" value="'+esc(v||3)+'">';}
  else if(o.num)h+=lab+'<div class="inp"><input type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" id="'+id+'" name="'+o.k+'" value="'+esc(v)+'" placeholder="'+esc(t(o.ph||''))+'">'+(o.u?'<span class="u">'+esc(t(o.u))+'</span>':'')+'</div>';
  else h+=lab+'<input type="text" autocomplete="off" id="'+id+'" name="'+o.k+'" value="'+esc(v)+'" placeholder="'+esc(t(o.ph||''))+'"'+(o.max?' maxlength="'+o.max+'"':'')+'>';
  if(o.hint)h+='<div class="hint">'+esc(t(o.hint))+'</div>';
  return h+'</div>';
}
function seg(name,opts,val){var h='<div class="seg" role="group" data-seg="'+name+'">';for(var k in opts)h+='<button type="button" data-val="'+k+'" aria-pressed="'+(k===val)+'">'+esc(t(opts[k]))+'</button>';return h+'</div><input type="hidden" name="'+name+'" value="'+val+'">';}

/* ---------- Bottom sheet ---------- */
var sheetSubmit=null,sheetDel=null,sheetOpen=false,lastFocus=null,confirmFn=null,sheetOnClose=null;
function openSheet(title,html,onSubmit,opts){
  opts=opts||{};lastFocus=document.activeElement;
  $('#sheetTitle').textContent=title;
  var body=html;
  if(onSubmit)body='<form id="sheetForm" novalidate autocomplete="off">'+html+'<div class="ferr" id="ferr" role="alert"></div><div class="ft">'+
    (opts.del?'<button type="button" class="btn d" data-act="sheetDel">'+esc(t('Delete'))+'</button>':'<button type="button" class="btn s" data-act="closeSheet">'+esc(t('Cancel'))+'</button>')+
    '<button type="submit" class="btn p">'+esc(t(opts.ok||'Save'))+'</button></div></form>';
  $('#sheetBody').innerHTML=body;$('#sheetBody').scrollTop=0;
  sheetSubmit=onSubmit||null;sheetDel=opts.onDel||null;sheetOnClose=opts.onClose||null;
  var sh=$('#sheet'),sc=$('#scrim');sh.classList.remove('hidden');sc.classList.remove('hidden');void sh.offsetWidth;sh.classList.add('on');sc.classList.add('on');sheetOpen=true;
  document.body.classList.add('noscroll');
  var f=$('#sheetForm');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();
    var data={};$$('input,select,textarea',f).forEach(function(i){if(!i.name)return;if(i.type==='checkbox'){if(i.checked)(data[i.name]=data[i.name]||[]).push(i.value);else if(!data[i.name])data[i.name]=data[i.name]||[];}else data[i.name]=i.value.trim();});
    var btn=f.querySelector('[type=submit]');
    var res=sheetSubmit(data,f);
    if(res&&typeof res.then==='function'){btn.disabled=true;btn.classList.add('busy');res.then(function(err){btn.disabled=false;btn.classList.remove('busy');if(err){$('#ferr').textContent=err;}else closeSheet();},function(err){btn.disabled=false;btn.classList.remove('busy');$('#ferr').textContent=String(err&&err.message||err);});return;}
    if(res){$('#ferr').textContent=res;return;}
    closeSheet();});
  if(opts.focus){setTimeout(function(){var el=$(opts.focus);if(el)el.focus();},380);}
  else setTimeout(function(){var b=$('#sheet .hd .btn');if(b)b.focus({preventScroll:true});},60);
}
function closeSheet(){
  if(!sheetOpen)return;sheetOpen=false;var sh=$('#sheet'),sc=$('#scrim');sh.classList.remove('on');sc.classList.remove('on');document.body.classList.remove('noscroll');
  var oc=sheetOnClose;sheetOnClose=null;if(oc)try{oc();}catch(e){}
  setTimeout(function(){if(!sheetOpen){sh.classList.add('hidden');sc.classList.add('hidden');$('#sheetBody').innerHTML='';}},320);
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true});}catch(e){}
}
function confirmBox(msg,okLabel,fn,danger){
  openSheet(t('Please confirm'),'<p class="lead">'+esc(msg)+'</p><div class="ft"><button class="btn s" data-act="closeSheet">'+esc(t('Cancel'))+'</button><button class="btn '+(danger===false?'p':'d')+'" data-act="confirmOk">'+esc(t(okLabel||'Delete'))+'</button></div>');
  confirmFn=fn;
}
function infoBox(title,html){openSheet(title,html+'<div class="ft"><button class="btn p" data-act="closeSheet">'+esc(t('OK'))+'</button></div>');}
function download(name,text,type){
  try{var blob=text instanceof Blob?text:new Blob([text],{type:type||'text/plain'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},4000);}
  catch(e){toast(t('Download not supported here'));}
}
function shareText(title,text,url){
  if(navigator.share){navigator.share({title:title,text:text,url:url}).catch(function(){});return true;}
  if(navigator.clipboard){navigator.clipboard.writeText(text+(url?' '+url:'')).then(function(){toast(t('Copied to clipboard'));});return true;}
  return false;
}

/* ---------- Charts ---------- */
function chart(series,opts){
  opts=opts||{};var W=320,H=opts.h||150,L=32,R=8,T=10,B=22;
  var all=[];series.forEach(function(s){s.pts.forEach(function(p){all.push(p);});});
  if(all.length<2)return '<div class="empty small">'+esc(t('Add at least 2 readings to see a chart.'))+'</div>';
  var xs=all.map(function(p){return p.x;}),ys=all.map(function(p){return p.y;});
  var x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs);if(x1===x0)x1=x0+1;
  var y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys);
  if(opts.band){y0=Math.min(y0,opts.band[0]);y1=Math.max(y1,opts.band[1]);}
  var py=(y1-y0)*0.15||Math.max(1,Math.abs(y1)*0.05);y0-=py;y1+=py;if(opts.min!=null)y0=Math.max(y0,opts.min);
  var X=function(x){return L+(x-x0)/(x1-x0)*(W-L-R);},Y=function(y){return T+(1-(y-y0)/(y1-y0))*(H-T-B);};
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opts.label||t('Chart'))+'">';
  if(opts.band)s+='<rect x="'+L+'" y="'+Y(opts.band[1]).toFixed(1)+'" width="'+(W-L-R)+'" height="'+Math.max(0,Y(opts.band[0])-Y(opts.band[1])).toFixed(1)+'" fill="#22A55B" opacity=".1" rx="4"/>';
  for(var i=0;i<=3;i++){var yv=y0+(y1-y0)*i/3,yy=Y(yv);s+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'"/><text x="'+(L-5)+'" y="'+(yy+3).toFixed(1)+'" text-anchor="end">'+(Math.abs(y1-y0)<10?yv.toFixed(1):(Math.abs(yv)>=10000?Math.round(yv/1000)+'k':Math.round(yv)))+'</text>';}
  var fm=function(d){return fmtD(d,{day:1,mon:'short'});};
  s+='<text x="'+L+'" y="'+(H-5)+'">'+fm(new Date(x0))+'</text><text x="'+(W-R)+'" y="'+(H-5)+'" text-anchor="end">'+fm(new Date(x1))+'</text>';
  series.forEach(function(se,si){
    if(!se.pts.length)return;
    var path=se.pts.map(function(p,i){return (i?'L':'M')+X(p.x).toFixed(1)+' '+Y(p.y).toFixed(1);}).join(' ');
    var len=0;for(var i=1;i<se.pts.length;i++){var dx=X(se.pts[i].x)-X(se.pts[i-1].x),dy=Y(se.pts[i].y)-Y(se.pts[i-1].y);len+=Math.sqrt(dx*dx+dy*dy);}len=Math.ceil(len)+2;
    if(si===0&&series.length===1){var area=path+' L'+X(se.pts[se.pts.length-1].x).toFixed(1)+' '+(H-B)+' L'+X(se.pts[0].x).toFixed(1)+' '+(H-B)+' Z',gid='g'+uid();
      s+='<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+se.color+'" stop-opacity=".25"/><stop offset="1" stop-color="'+se.color+'" stop-opacity="0"/></linearGradient></defs><path class="ar" d="'+area+'" fill="url(#'+gid+')"/>';}
    s+='<path class="ln" d="'+path+'" stroke="'+se.color+'" style="--len:'+len+'"/>';
    var n=se.pts.length;se.pts.forEach(function(p,i){if(n>40&&i!==n-1)return;s+='<circle class="dt" cx="'+X(p.x).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="'+(i===n-1?4.5:3)+'" fill="'+se.color+'" stroke="var(--card)" stroke-width="1.5" style="animation-delay:'+(0.3+0.7*i/Math.max(1,n-1)).toFixed(2)+'s"/>';});
  });
  return s+'</svg>';
}
function bars(days,goal,colorOk,color){
  var W=320,H=150,max=goal||1,bw=(W-10)/days.length;days.forEach(function(x){if(x.v>max)max=x.v;});
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img">';
  if(goal){var gy=10+(1-goal/max)*(H-34);s+='<line x1="0" x2="'+W+'" y1="'+gy.toFixed(1)+'" y2="'+gy.toFixed(1)+'" stroke="#22A55B" stroke-dasharray="4 4"/><text x="'+(W-2)+'" y="'+(gy-4).toFixed(1)+'" text-anchor="end">'+esc(t('Goal'))+'</text>';}
  days.forEach(function(x,i){var bh=x.v/max*(H-34),y=10+(H-34)-bh;s+='<rect class="bar" x="'+(5+i*bw+3).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+Math.max(2,bw-6).toFixed(1)+'" height="'+Math.max(bh,0).toFixed(1)+'" rx="4" fill="'+(goal&&x.v>=goal?colorOk:color)+'" style="transform-origin:0 '+(H-24)+'px;animation-delay:'+(i*0.03).toFixed(2)+'s"/>'+
    ((days.length<=14&&(i%2===1||i===days.length-1))||(days.length>14&&i%5===0)?'<text x="'+(5+i*bw+bw/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+x.d.getDate()+'</text>':'');});
  return s+'</svg>';
}
function bmiGauge(b,std,anim){
  var GMIN=12,GMAX=42,ang=function(x){x=clamp(x,GMIN,GMAX);return -90+(x-GMIN)/(GMAX-GMIN)*180;},pt=function(a,r){var q=(a-90)*Math.PI/180;return [120+r*Math.cos(q),120+r*Math.sin(q)];};
  var col={info:'#3BA3F5',ok:'#22A55B',warn:'#F2A51A',warn2:'#EE6A2B',bad:'#D93636',bad2:'#A61E4D'};
  var s='<div class="gauge"><svg viewBox="0 0 240 130" aria-hidden="true"><g fill="none" stroke-width="18">',lo=GMIN,last=-99,tx='';
  BMI_STD[std].bands.forEach(function(B,i){var hi=Math.min(B.max,GMAX);if(hi<=lo)return;var a1=ang(lo)+(i?0.8:0),a2=ang(hi)-(hi<GMAX?0.8:0),p1=pt(a1,92),p2=pt(a2,92);
    s+='<path d="M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' A92 92 0 0 1 '+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+'" stroke="'+col[B.c]+'"/>';
    if(hi<GMAX){var q=pt(ang(hi),hi-last<3?56:70);tx+='<text x="'+q[0].toFixed(1)+'" y="'+(q[1]+3).toFixed(1)+'" text-anchor="middle">'+hi+'</text>';last=hi;}lo=hi;});
  var a=ang(r1(b));
  s+='</g>'+tx+'<g transform="rotate('+a.toFixed(1)+' 120 120)"><line x1="120" y1="120" x2="120" y2="44" stroke="var(--ink)" stroke-width="4" stroke-linecap="round">'+(anim?'<animateTransform attributeName="transform" type="rotate" from="'+(-90-a).toFixed(1)+' 120 120" to="0 120 120" dur=".7s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1" fill="freeze"/>':'')+'</line></g><circle cx="120" cy="120" r="8" fill="var(--ink)"/></svg></div>';
  return s;
}
function ring(pct,label,sub,id,color){var C=2*Math.PI*50,off=C*(1-clamp(pct,0,1));
  return '<div class="ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="rg'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+(color||'#3BA3F5')+'"/><stop offset="1" stop-color="#1877F2"/></linearGradient></defs><circle class="bgc" cx="60" cy="60" r="50" fill="none" stroke-width="12"/><circle class="fg" data-ring="'+id+'" cx="60" cy="60" r="50" fill="none" stroke="url(#rg'+id+')" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(RINGS[id]!=null?RINGS[id]:C).toFixed(1)+'" data-off="'+off.toFixed(1)+'"/></svg><div class="in"><div><b>'+label+'</b><span>'+sub+'</span></div></div></div>';}
var RINGS={};
function animateRings(){$$('[data-ring]').forEach(function(fg){requestAnimationFrame(function(){requestAnimationFrame(function(){fg.style.strokeDashoffset=fg.dataset.off;RINGS[fg.dataset.ring]=+fg.dataset.off;});});});}

/* =====================================================================
   Router, Home, Simple mode
   ===================================================================== */
var R={tab:'home',sub:null,param:null}, trackType='weight', medSub='today', toolOpen=null;
var TABS=['home','meds','track','tools','more'];
function go(tab,sub,param){R.tab=tab;R.sub=sub||null;R.param=param||null;if(tab!=='tools')toolOpen=null;view();window.scrollTo(0,0);}
function view(quiet){
  var simple=DB.settings.simple&&R.tab==='home'&&!R.sub;
  document.body.classList.toggle('simple',!!simple);
  var map={home:vHome,meds:vMeds,track:vTrack,tools:vTools,more:vMore};
  var h;try{h=simple?vSimple():(map[R.tab]||vHome)();}catch(err){console.error(err);h='<div class="card"><b>'+esc(t('Something went wrong'))+'</b><p class="small muted">'+esc(String(err&&err.message||err))+'</p><button class="btn s" data-act="go" data-tab="home">'+esc(t('Home'))+'</button></div>';}
  /* keep horizontal chip rows where the user left them across re-renders */
  var keepX=R.tab===view._tab?$$('#view .chips').map(function(c){return c.scrollLeft;}):[];view._tab=R.tab;
  $('#view').innerHTML='<div class="view'+(quiet===true?' q':'')+'">'+h+'</div>';
  $$('#view .chips').forEach(function(c,i){
    if(keepX[i])c.scrollLeft=keepX[i];
    var a=c.querySelector('[aria-pressed="true"]');if(!a)return;
    var l=a.offsetLeft-c.offsetLeft,r=l+a.offsetWidth;
    if(l<c.scrollLeft)c.scrollLeft=l-16;else if(r>c.scrollLeft+c.clientWidth)c.scrollLeft=r-c.clientWidth+16;
  });
  $$('.nav button').forEach(function(b){if(b.dataset.tab===R.tab&&!(R.tab==='more'&&R.sub==='sos'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  var p=P();$('#whoName').textContent=pname(p)+(live('people').length>1?' ▾':'');
  updateCloudDot();
  if(R.tab==='tools'&&toolOpen)runCalc();
  animateRings();
  document.title=t('My Health');
}
function updateCloudDot(){var d=$('#cloudDot');if(!d)return;var st=Cloud.status();d.className='cdot '+st;d.title=t({off:'Not signed in',ok:'Synced',sync:'Syncing…',err:'Offline — changes will sync later'}[st]);d.classList.toggle('hidden',st==='off');}

/* ---------------- HOME ---------------- */
function vHome(){
  var p=P(),a=ageOf(p.dob),h='<div class="stack">',w=latestWeight(),ht=pnum(p.height);
  var chips=(a!=null?'<span class="chip">'+esc(t('{n} yrs',{n:a}))+'</span>':'')+(p.blood?'<span class="chip">🩸 '+esc(p.blood)+'</span>':'')+(!isNaN(w)&&ht?'<span class="chip">BMI '+f1(w/Math.pow(ht/100,2))+'</span>':'')+
    (p.circle?'<span class="chip">👨‍👩‍👧 '+esc(t('Shared'))+'</span>':'');
  h+='<section class="hero"><div class="hi">'+greet()+' 👋</div><div class="nm">'+esc(p.name||t('Welcome'))+'</div><div class="chips">'+chips+
    '<button class="chip btn" data-act="editPerson">✏️ '+esc(a==null&&!p.height?t('Complete profile'):t('Edit'))+'</button></div></section>';
  h+=setupCard();
  h+=nextDoseCard(p);
  // medicines today
  var sc=schedule(p.id);
  h+='<section class="card"><h2>'+esc(t('Medicines today'))+' <button class="link" data-act="go" data-tab="meds">'+esc(t('All'))+'</button></h2>';
  if(!sc.length)h+='<div class="empty"><span class="em">💊</span>'+esc(t('No medicines scheduled today.'))+'<br><button class="btn s sm mt" data-act="addMed">'+esc(t('Add a medicine'))+'</button></div>';
  else{var done=sc.filter(function(x){return x.status==='taken';}).length,tot=sc.filter(function(x){return !x.prn;}).length;
    if(tot)h+='<div class="row between small muted" style="margin:-4px 0 6px"><span>'+esc(t('{a} of {b} taken',{a:done,b:tot}))+'</span><span>'+Math.round(done/tot*100)+'%</span></div><div class="pbar"><i style="width:'+(done/tot*100).toFixed(0)+'%"></i></div>';
    h+='<ul class="list">'+sc.map(function(x){return medRow(x);}).join('')+'</ul>';}
  h+='</section>';
  h+=familyCard(p);
  h+=moodCard(p);
  // water
  var wt=waterOn(dKey()),goal=+p.waterGoal||2000,gl=+p.glass||250,left=Math.max(0,Math.ceil((goal-wt)/gl));
  h+='<section class="card"><h2>'+esc(t('Water today'))+' <button class="link" data-act="trackGo" data-type="water">'+esc(t('History'))+'</button></h2><div class="row" style="gap:16px">'+
    ring(wt/goal,(wt>=1000?(wt/1000).toFixed(wt%1000?1:0)+' L':wt+' ml'),esc(t('of {n} L',{n:(goal/1000).toFixed(1).replace('.0','')})),'water')+
    '<div style="flex:1;display:flex;flex-direction:column;gap:8px">'+(wt>=goal?'<span class="tag c-ok">🎉 '+esc(t('Goal reached!'))+'</span>':'<span class="small muted">'+esc(plural(left,'{n} more glass to go','{n} more glasses to go'))+'</span>')+
    '<button class="btn p sm" data-act="water" data-ml="'+gl+'">💧 + '+gl+' ml</button><button class="btn s sm" data-act="water" data-ml="500">+ 500 ml</button>'+(wt>0?'<button class="btn s sm" data-act="waterUndo">'+esc(t('Undo last'))+'</button>':'')+'</div></div></section>';
  h+=activityCard(p);
  // latest readings
  h+='<section class="card"><h2>'+esc(t('Latest readings'))+' <button class="link" data-act="go" data-tab="track">'+esc(t('Track'))+'</button></h2><div class="grid2">';
  ['bp','sugar','weight','pulse'].forEach(function(ty){var e=latest(ty),T=TYPES[ty];
    h+='<button class="tile" data-act="trackGo" data-type="'+ty+'"><span class="k">'+T.em+' '+esc(t(T.n))+'</span>'+(e?'<span class="v">'+T.show(e.v)+'</span>'+tag(T.cls(e.v))+'<span class="small muted">'+relDay(parseDT(e.t))+'</span>':'<span class="v muted nodata">'+esc(t('No data'))+'</span><span class="small link2">+ '+esc(t('Add'))+'</span>')+'</button>';});
  h+='</div></section>';
  h+='<section class="card"><h2>'+esc(t('Quick log'))+'</h2><div class="qa">';
  [['bp','BP'],['sugar','Sugar'],['weight','Weight'],['temp','Temp'],['pulse','Pulse'],['spo2','Oxygen'],['symptom','Symptoms'],['sleep','Sleep']].forEach(function(x){h+='<button data-act="addLog" data-type="'+x[0]+'"><span class="em">'+TYPES[x[0]].em+'</span>'+esc(t(x[1]))+'</button>';});
  h+='</div></section>';
  var up=upcomingAppts(p.id)[0];
  h+='<section class="card"><h2>'+esc(t('Next appointment'))+' <button class="link" data-act="go" data-tab="meds" data-sub="appts">'+esc(t('All'))+'</button></h2>'+(up?'<ul class="list">'+apptRow(up)+'</ul>':'<div class="empty"><span class="em">📅</span>'+esc(t('No upcoming appointments.'))+'<br><button class="btn s sm mt" data-act="addAppt">'+esc(t('Add appointment'))+'</button></div>')+'</section>';
  var tip=TIPS[Math.floor(Date.now()/864e5)%TIPS.length];
  h+='<section class="card"><h2>'+esc(t('Tip of the day'))+'</h2><div class="row" style="align-items:flex-start"><span style="font-size:30px;line-height:1">'+tip[0]+'</span><div><b>'+esc(t(tip[1]))+'</b><div class="muted" style="font-size:15px;margin-top:2px">'+esc(t(tip[2]))+'</div></div></div></section>';
  return h+'</div>';
}
function setupCard(){
  if(DB.settings.setupDone)return '';
  var p=P(),steps=[
    [!!(p.name&&(p.dob||p.height)),'Complete your profile','editPerson'],
    [mine('meds').length>0,'Add your medicines','addMed'],
    [!!(DB.settings.push.on||(DB.settings.alarms&&typeof Notification!=='undefined'&&Notification.permission==='granted')),'Turn on medicine alarms','notifySetup'],
    [!!Cloud.user,'Connect your family','familySetup'],
    [isStandalone(),'Install the app on your phone','installHelp']];
  var done=steps.filter(function(s){return s[0];}).length;
  if(done===steps.length){DB.settings.setupDone=true;save();return '';}
  var h='<section class="card setup"><h2>'+esc(t('Get started'))+' <span class="small" style="text-transform:none;letter-spacing:0">'+done+'/'+steps.length+'</span><button class="link" data-act="setupHide">'+esc(t('Hide'))+'</button></h2><div class="pbar"><i style="width:'+(done/steps.length*100)+'%"></i></div><ul class="list">';
  steps.forEach(function(s){h+='<li><button class="navrow" data-act="'+s[2]+'"><span class="chk'+(s[0]?' on':'')+'" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div class="main"><b'+(s[0]?' class="muted"':'')+'>'+esc(t(s[1]))+'</b></div>'+(s[0]?'':'<span class="chev">›</span>')+'</button></li>';});
  return h+'</ul></section>';
}
function nextDoseCard(p){
  var sc=schedule(p.id).filter(function(x){return !x.prn&&!x.status;}),now=new Date(),nx=null;
  var lateMins=function(x){var q=x.time.split(':'),d=new Date();d.setHours(+q[0],+q[1],0,0);return (now-d)/60000;};
  for(var i=0;i<sc.length;i++){var st=dueState(sc[i]);if(st==='late'&&lateMins(sc[i])>180&&sc.slice(i+1).some(function(y){return dueState(y)!=='late';}))continue;nx=sc[i];break;}
  if(!nx)return '';
  var pp=nx.time.split(':'),due=new Date();due.setHours(+pp[0],+pp[1],0,0);var mins=Math.round((due-now)/60000);
  var st=dueState(nx),txt=mins>0?(mins>=60?t('in {h} h {m} min',{h:Math.floor(mins/60),m:mins%60}):t('in {m} min',{m:mins})):st==='late'?(-mins>=60?t('{h} h {m} min late',{h:Math.floor(-mins/60),m:(-mins)%60}):t('{m} min late',{m:-mins})):t('Due now');
  var same=sc.filter(function(x){return x.time===nx.time;});
  return '<section class="card nextdose '+(st==='late'?'late':st==='due'?'due':'')+'"><div class="row between"><div><div class="small muted">'+esc(t('Next medicine'))+' · '+esc(fTimeStr(nx.time))+'</div><div class="nd-t">'+esc(txt)+'</div></div><div class="nd-ic">'+medIcon(nx.m)+'</div></div>'+
    '<div class="nd-list">'+same.map(function(x){return '<div><b>'+esc(x.m.name)+'</b> <span class="muted">'+esc([x.m.dose,x.m.food&&x.m.food!=='any'?t(FOOD[x.m.food]):''].filter(Boolean).join(' · '))+'</span></div>';}).join('')+'</div>'+
    (st==='due'||st==='late'||st==='soon'?'<div class="grid2 mt"><button class="btn s" data-act="skipGroup" data-time="'+nx.time+'">'+esc(t('Skip'))+'</button><button class="btn p" data-act="takeGroup" data-time="'+nx.time+'">✓ '+esc(t('Taken'))+'</button></div>':'')+'</section>';
}
function medRow(x,day,pidShow){
  var m=x.m,dl=daysLeft(m),low=dl!=null&&dl<=(+m.refillDays||3);
  if(x.prn)return '<li><span class="em">'+medIcon(m)+'</span><div class="main"><b>'+esc(m.name)+'</b><span>'+[esc(m.dose||''),esc(t('As needed')),x.count?esc(t('taken {n}× today',{n:x.count})):''].filter(Boolean).join(' · ')+'</span></div><button class="btn s sm" data-act="prn" data-id="'+m.id+'">'+esc(t('Log dose'))+'</button></li>';
  var st=dueState(x,day),late=st==='late';
  return '<li class="'+(x.status==='taken'?'done':x.status==='skipped'?'skipped':'')+'"><button class="chk'+(x.status==='taken'?' on':'')+(x.status==='skipped'?' skip':'')+'" data-act="take" data-id="'+m.id+'" data-time="'+x.time+'" data-day="'+(day||dKey())+'" aria-label="'+esc(t('Mark {m} at {t} as taken',{m:m.name,t:x.time}))+'" aria-pressed="'+(x.status==='taken')+'"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'+
    '<button class="navrow main" data-act="doseMenu" data-id="'+m.id+'" data-time="'+x.time+'" data-day="'+(day||dKey())+'"><div class="main"><b>'+esc(m.name)+'</b><span>'+[esc(fTimeStr(x.time)),esc(m.dose||''),m.food&&m.food!=='any'?esc(t(FOOD[m.food])):''].filter(Boolean).join(' · ')+'</span></div></button>'+
    '<div class="end">'+(x.status==='skipped'?'<span class="tag c-none">'+esc(t('Skipped'))+'</span>':'')+(late&&!x.status?'<span class="tag c-warn2">'+esc(t('Late'))+'</span>':'')+(st==='due'&&!x.status?'<span class="tag c-info">'+esc(t('Due'))+'</span>':'')+(low?'<span class="tag c-bad">'+esc(t('Low stock'))+'</span>':'')+'</div></li>';
}
function familyCard(p){
  var others=live('people').filter(function(x){return x.id!==p.id;});if(!others.length)return '';
  var h='<section class="card"><h2>'+esc(t('Family today'))+' <button class="link" data-act="go" data-tab="more" data-sub="family">'+esc(t('Manage'))+'</button></h2><ul class="list">';
  others.forEach(function(o){var sc=schedule(o.id).filter(function(x){return !x.prn;}),tk=sc.filter(function(x){return x.status==='taken';}).length,late=sc.filter(function(x){return !x.status&&dueState(x)==='late';}).length;
    var md=latest('mood',o.id),mdToday=md&&md.t.slice(0,10)===dKey();
    h+='<li><button class="navrow" data-act="switchTo" data-id="'+o.id+'"><span class="av" style="background:'+esc(o.color||'#1877F2')+'">'+esc((o.name||'?').trim().charAt(0).toUpperCase())+'</span><div class="main"><b>'+esc(pname(o))+(mdToday?' '+MOODS[md.v.v][0]:'')+'</b><span>'+(sc.length?esc(t('{a} of {b} doses taken',{a:tk,b:sc.length})):esc(t('No medicines today')))+'</span></div><div class="end">'+(late?'<span class="tag c-bad">'+esc(plural(late,'{n} missed','{n} missed'))+'</span>':sc.length&&tk===sc.length?'<span class="tag c-ok">✓ '+esc(t('All done'))+'</span>':'')+'</div><span class="chev">›</span></button></li>';});
  return h+'</ul></section>';
}
function moodCard(p){
  var md=latest('mood'),today=md&&md.t.slice(0,10)===dKey();
  if(today)return '<section class="card"><div class="row"><span style="font-size:34px;line-height:1">'+MOODS[md.v.v][0]+'</span><div style="flex:1"><b>'+esc(t('Feeling {m} today',{m:t(MOODS[md.v.v][1]).toLowerCase()}))+'</b><div class="small muted">'+esc(t('Thanks for checking in.'))+'</div></div><button class="btn s sm" data-act="addLog" data-type="symptom">🤒 '+esc(t('Symptoms'))+'</button></div></section>';
  var h='<section class="card"><h2>'+esc(t('How are you feeling today?'))+'</h2><div class="moods">';
  for(var i=5;i>=1;i--)h+='<button data-act="moodQuick" data-v="'+i+'" aria-label="'+esc(t(MOODS[i][1]))+'"><span>'+MOODS[i][0]+'</span><small>'+esc(t(MOODS[i][1]))+'</small></button>';
  return h+'</div></section>';
}
function activityCard(p){
  var st=latest('steps'),sl=latest('sleep'),rh=latest('pulse'),hd=latest('hrday'),info=DB.watch[p.id];
  if(!st&&!info&&!sl)return '<section class="card"><div class="row"><span style="font-size:34px;line-height:1">⌚</span><div style="flex:1"><b>'+esc(t('Connect your smartwatch'))+'</b><div class="small muted">'+esc(t('Sync steps, sleep and heart rate from Apple Watch and other watches.'))+'</div></div></div><button class="btn s full mt" data-act="syncPage">'+esc(t('Set up sync'))+'</button></section>';
  var goal=+p.stepGoal||8000,v=st?st.v.v:0,h='<section class="card"><h2>'+esc(t('Activity & sleep'))+' <button class="link" data-act="syncPage">⌚ '+esc(t('Sync'))+'</button></h2>';
  h+='<button class="navrow block" data-act="trackGo" data-type="steps"><div class="row between"><div><span class="small muted">👟 '+esc(t('Steps'))+' · '+(st?relDay(parseDT(st.t)):esc(t('No data')))+'</span><div class="bignum">'+fNum(v)+' <small class="muted">/ '+fNum(goal)+'</small></div></div>'+(st?tag(TYPES.steps.cls(st.v)):'')+'</div><div class="pbar mt"><i style="width:'+clamp(v/goal*100,0,100).toFixed(0)+'%"></i></div></button>';
  h+='<div class="grid2 mt"><button class="tile" data-act="trackGo" data-type="sleep"><span class="k">😴 '+esc(t('Sleep'))+'</span>'+(sl?'<span class="v">'+f1(sl.v.v)+'<small> h</small></span>'+tag(sleepClass(sl.v.v))+'<span class="small muted">'+(sl.v.from?fTimeStr(sl.v.from)+' – '+fTimeStr(sl.v.to):relDay(parseDT(sl.t)))+'</span>':'<span class="v muted nodata">'+esc(t('No data'))+'</span>')+'</button>'+
    '<button class="tile" data-act="trackGo" data-type="'+(rh?'pulse':'hrday')+'"><span class="k">❤️ '+esc(t('Heart rate'))+'</span>'+(rh?'<span class="v">'+rh.v.v+'<small> bpm</small></span><span class="small muted">'+esc(t('Resting'))+' · '+relDay(parseDT(rh.t))+'</span>':hd?'<span class="v">'+hd.v.v+'<small> bpm</small></span><span class="small muted">'+esc(t('Average'))+'</span>':'<span class="v muted nodata">'+esc(t('No data'))+'</span>')+'</button></div>';
  return h+'</section>';
}

/* ---------------- SIMPLE MODE (large, for elderly users) ---------------- */
function vSimple(){
  var p=P(),now=new Date(),sc=schedule(p.id),h='<div class="simplev">';
  h+='<div class="s-top"><div><div class="s-date">'+esc(fLong(now))+'</div><div class="s-hi">'+greet()+(p.name?', '+esc(p.name):'')+'</div></div><button class="s-sos" data-act="go" data-tab="more" data-sub="sos">SOS</button></div>';
  var pending=sc.filter(function(x){return !x.prn&&!x.status;}),lm=function(x){var q=x.time.split(':'),d=new Date();d.setHours(+q[0],+q[1],0,0);return (now-d)/60000;},next=pending.filter(function(x,i){return !(lm(x)>180&&pending.slice(i+1).some(function(y){return lm(y)<=180;}));})[0];
  if(next){var st=dueState(next),grp=pending.filter(function(x){return x.time===next.time;});
    h+='<div class="s-card s-next '+(st==='late'||st==='due'?'now':'')+'"><div class="s-lbl">'+esc(st==='late'||st==='due'?t('Take your medicine now'):t('Next medicine at {t}',{t:fTimeStr(next.time)}))+'</div>'+
      grp.map(function(x){return '<div class="s-med"><span>'+medIcon(x.m)+'</span><div><b>'+esc(x.m.name)+'</b><small>'+esc([x.m.dose,x.m.food&&x.m.food!=='any'?t(FOOD[x.m.food]):''].filter(Boolean).join(' · '))+'</small></div></div>';}).join('')+
      '<button class="s-big ok" data-act="takeGroup" data-time="'+next.time+'">✓ '+esc(t('I took it'))+'</button></div>';}
  else if(sc.length)h+='<div class="s-card s-done"><div style="font-size:56px">🎉</div><b>'+esc(t('All medicines taken today!'))+'</b></div>';
  if(sc.length){h+='<div class="s-card"><div class="s-lbl">'+esc(t('Today'))+'</div>';sc.forEach(function(x){if(x.prn)return;
    h+='<button class="s-row '+(x.status||'')+'" data-act="take" data-id="'+x.m.id+'" data-time="'+x.time+'" data-day="'+dKey()+'"><span class="s-tm">'+esc(fTimeStr(x.time))+'</span><span class="s-nm">'+esc(x.m.name)+'</span><span class="s-st">'+(x.status==='taken'?'✅':x.status==='skipped'?'⏭️':'⬜')+'</span></button>';});h+='</div>';}
  var c=(p.contacts||[]).filter(function(x){return x.phone;})[0];
  h+='<div class="s-grid"><button class="s-tile" data-act="water" data-ml="'+(+p.glass||250)+'"><span>💧</span>'+esc(t('I drank water'))+'<small>'+(waterOn(dKey())/1000).toFixed(1)+' L</small></button>'+
    '<button class="s-tile" data-act="addLog" data-type="bp"><span>🩺</span>'+esc(t('Blood pressure'))+'</button>'+
    '<button class="s-tile" data-act="addLog" data-type="sugar"><span>🩸</span>'+esc(t('Blood sugar'))+'</button>'+
    '<button class="s-tile" data-act="moodPick"><span>🙂</span>'+esc(t('How I feel'))+'</button>'+
    (c?'<a class="s-tile call2" href="tel:'+esc(c.phone.replace(/[^\d+]/g,''))+'"><span>📞</span>'+esc(t('Call {n}',{n:c.name||t('family')}))+'</a>':'<button class="s-tile" data-act="editPerson"><span>📞</span>'+esc(t('Add family phone'))+'</button>')+
    '<button class="s-tile" data-act="shareLocation"><span>📍</span>'+esc(t('Send my location'))+'</button></div>';
  h+='<button class="btn s full mt" data-act="exitSimple">⚙️ '+esc(t('Open full app'))+'</button></div>';
  return h;
}

/* =====================================================================
   TRACK
   ===================================================================== */
function vTrack(){
  var T=TYPES[trackType],h='<div class="stack"><div><div class="row between"><div class="h1">'+esc(t('Track'))+'</div><button class="btn s sm" data-act="syncPage">⌚ '+esc(t('Sync watch'))+'</button></div><p class="sub">'+esc(t('Log readings and watch your trends.'))+'</p></div>';
  h+='<div class="chips" role="tablist">'+TYPE_ORDER.map(function(ty){return '<button class="chipb" data-act="trackGo" data-type="'+ty+'" aria-pressed="'+(ty===trackType)+'">'+TYPES[ty].em+' '+esc(t(TYPES[ty].n))+'</button>';}).join('')+'</div>';
  if(trackType==='water')return h+vWaterTrack()+'</div>';
  var L=logsOf(trackType),last=L[L.length-1],vf0=T.fields.filter(function(f){return f.k==='v';})[0],dp=vf0&&vf0.dp;
  h+='<section class="card"><h2>'+esc(t(T.n))+'<button class="btn p sm" data-act="addLog" data-type="'+trackType+'">+ '+esc(t('Add'))+'</button></h2>';
  if(last){var c=T.cls(last.v),sb=T.sub?T.sub(last.v):'';
    h+='<div class="res" style="margin:0 0 12px"><div class="big">'+T.show(last.v)+'</div>'+(sb?'<div class="small muted">'+esc(sb)+'</div>':'')+'<div class="mt">'+tag(c)+'</div>'+(c&&c.m?'<p>'+esc(t(c.m))+'</p>':'')+'<p class="small">'+esc(t('Latest'))+' · '+whenStr(last)+(last.src?' · ⌚ '+esc(t(SRC[last.src])):'')+'</p></div>';
    if(L.length>1&&trackType!=='symptom'){var vals=L.map(function(e){return T.val(e.v);}),avg=vals.reduce(function(a,b){return a+b;},0)/vals.length,diff=T.val(last.v)-T.val(L[0].v),fm=function(x){return dp?f1(x):fNum(Math.round(x));};
      h+='<div class="grid3" style="margin-bottom:12px"><div class="tile mini"><span class="k">'+esc(t('Average'))+'</span><b>'+fm(avg)+'</b></div><div class="tile mini"><span class="k">'+esc(t('Lowest'))+'</span><b>'+fm(Math.min.apply(null,vals))+'</b></div><div class="tile mini"><span class="k">'+esc(t('Change'))+'</span><b>'+(diff>0?'+':'')+fm(diff)+'</b></div></div>';}
  }
  var band=null,p=P();
  if(trackType==='weight'){var ht=pnum(p.height);if(ht){var hr=BMI_STD[p.cutoff||'asia'].healthy;band=[r1(hr[0]*Math.pow(ht/100,2)),r1(hr[1]*Math.pow(ht/100,2))];}}
  if(trackType==='pulse'||trackType==='hrday')band=[60,100];if(trackType==='spo2')band=[95,100];if(trackType==='temp')band=[36.1,37.4];if(trackType==='sleep')band=[7,9];if(trackType==='sugar')band=[70,140];
  if(trackType==='steps'){var sg=+p.stepGoal||8000;band=[sg,sg*1.5];}
  var recent=L.slice(-60),series=[{color:T.color,pts:recent.map(function(e){return {x:parseDT(e.t).getTime(),y:T.val(e.v)};})}];
  if(T.val2)series.push({color:T.color2,pts:recent.map(function(e){return {x:parseDT(e.t).getTime(),y:T.val2(e.v)};})});
  if(L.length)h+=chart(series,{band:band,label:t(T.n)})+(T.val2?'<div class="legend"><span><i style="background:'+T.color+'"></i>'+esc(t('Systolic'))+'</span><span><i style="background:'+T.color2+'"></i>'+esc(t('Diastolic'))+'</span></div>':'')+(band?'<div class="legend"><span><i style="background:#22A55B;opacity:.35"></i>'+esc(t('Healthy range'))+'</span></div>':'');
  else h+='<div class="empty"><span class="em">'+T.em+'</span>'+esc(t('No readings yet.'))+'<br>'+esc(t('Tap + Add to log your first one.'))+'</div>';
  if(trackType==='weight'&&!pnum(p.height))h+='<p class="small muted mt">'+esc(t('Add your height in your profile to see BMI with each weight.'))+'</p>';
  h+='</section>';
  if(L.length){h+='<section class="card"><h2>'+esc(t('History'))+' <span class="small nocaps">'+esc(plural(L.length,'{n} reading','{n} readings'))+'</span></h2><ul class="list">';
    L.slice().reverse().slice(0,100).forEach(function(e){var c=T.cls(e.v),sb=T.sub?T.sub(e.v):'';
      h+='<li><button class="navrow" data-act="editLog" data-id="'+e.id+'"><div class="main"><b>'+T.show(e.v).replace(/<small>|<\/small>/g,'')+'</b><span>'+[whenStr(e),esc(sb),e.note?esc(e.note):'',e.src?'⌚ '+esc(t(SRC[e.src])):''].filter(Boolean).join(' · ')+'</span></div><div class="end">'+tag(c)+'</div><span class="chev">›</span></button></li>';});
    h+='</ul></section>';}
  return h+'</div>';
}
function vWaterTrack(){
  var p=P(),goal=+p.waterGoal||2000,days=[];for(var i=13;i>=0;i--){var d=addDays(new Date(),-i);days.push({d:d,v:waterOn(dKey(d))});}
  var h='<section class="card"><h2>'+esc(t('Water · last 14 days'))+'<button class="btn p sm" data-act="addLog" data-type="water">+ '+esc(t('Add'))+'</button></h2>'+bars(days,goal,'#22A55B','#3BA3F5');
  var avg=days.reduce(function(s,x){return s+x.v;},0)/14,hit=days.filter(function(x){return x.v>=goal;}).length;
  h+='<div class="grid2 mt"><div class="tile mini"><span class="k">'+esc(t('Daily average'))+'</span><b>'+Math.round(avg)+' ml</b></div><div class="tile mini"><span class="k">'+esc(t('Goal reached'))+'</span><b>'+esc(t('{a} of {b} days',{a:hit,b:14}))+'</b></div></div></section>';
  var L=logsOf('water').slice().reverse().slice(0,50);
  if(L.length){h+='<section class="card"><h2>'+esc(t('Recent'))+'</h2><ul class="list">';L.forEach(function(e){var d=parseDT(e.t);h+='<li><button class="navrow" data-act="editLog" data-id="'+e.id+'"><span class="em">💧</span><div class="main"><b>'+e.v.v+' ml</b><span>'+fDay(d)+' · '+fTime(d)+'</span></div><span class="chev">›</span></button></li>';});h+='</ul></section>';}
  return h;
}
function logForm(type,e){
  var T=TYPES[type],h='';
  T.fields.forEach(function(f){
    if(f.type==='select')h+=field({k:f.k,l:f.l,type:'select',opts:f.opts,val:e?e.v[f.k]:'fasting'});
    else if(f.type==='mood')h+=field({k:f.k,l:f.l,type:'mood',val:e?e.v[f.k]:3});
    else if(f.type==='text')h+=field({k:f.k,l:f.l,val:e?e.v[f.k]:'',ph:f.ph});
    else h+=field({k:f.k,l:f.l,u:f.u,num:true,val:e&&e.v[f.k]!=null?e.v[f.k]:(type==='water'?(+P().glass||250):'')});});
  h+=field({k:'t',l:'Date & time',type:'datetime-local',val:e?e.t.slice(0,16):localDT(new Date())});
  h+=field({k:'note',l:'Note (optional)',val:e?e.note:'',ph:type==='bp'?'e.g. left arm, after rest':'e.g. after breakfast'});
  return h;
}
function readLog(type,data){
  var T=TYPES[type],v={};
  for(var i=0;i<T.fields.length;i++){var f=T.fields[i];
    if(f.type==='select'){v[f.k]=data[f.k];continue;}
    if(f.type==='text'){if(!data[f.k])return t('Please enter {f}.',{f:t(f.l).toLowerCase()});v[f.k]=data[f.k].slice(0,60);continue;}
    var n=pnum(data[f.k]);
    if(isNaN(n)){if(f.opt)continue;return t('Please enter {f}.',{f:t(f.l).replace(/\s*\(.*\)$/,'').toLowerCase()});}
    if(n<f.min||n>f.max)return t('{f} should be between {a} and {b}.',{f:t(f.l).replace(/\s*\(.*\)$/,''),a:f.min,b:f.max});
    v[f.k]=f.dp?r1(n):Math.round(n);}
  if(type==='bp'&&v.d>=v.s)return t('Systolic (top) must be higher than diastolic (bottom).');
  var tm=parseDT(data.t);if(!tm)return t('Please choose a valid date and time.');
  if(tm.getTime()>Date.now()+5*60000)return t('Date and time cannot be in the future.');
  return {v:v,t:localDT(tm)+':00',note:(data.note||'').slice(0,140)};
}
function addLog(type,preset){
  var T=TYPES[type];
  openSheet(T.em+' '+t(T.n),logForm(type,preset),function(data){var r=readLog(type,data);if(typeof r==='string')return r;
    put('logs',{id:uid(),pid:P().id,type:type,t:r.t,v:r.v,note:r.note});trackType=type;
    var c=T.cls(r.v);toast(c&&c.n?t('Saved')+' · '+t(c.n,c.vars):t('Saved'));
    if(type==='bp'&&r.v.s>180||type==='bp'&&r.v.d>120||type==='sugar'&&r.v.v<70||type==='spo2'&&r.v.v<92||type==='temp'&&r.v.v>=39.5)setTimeout(function(){urgentAdvice(type,r.v);},450);
    view(true);});
}
function editLog(id){
  var e=byId('logs',id);if(!e)return;var T=TYPES[e.type];
  openSheet(t('Edit')+' · '+t(T.n),logForm(e.type,e),function(data){var r=readLog(e.type,data);if(typeof r==='string')return r;e.v=r.v;e.t=r.t;e.note=r.note;put('logs',e);toast(t('Updated'));view(true);},
    {del:true,onDel:function(){del('logs',e);toast(t('Deleted'));view(true);}});
}
function urgentAdvice(type,v){
  var c=TYPES[type].cls(v);
  openSheet('⚠️ '+t(c.n,c.vars),'<div class="alert c-bad"><b>'+esc(t(c.m||'This reading needs attention.'))+'</b></div><p class="lead">'+esc(t('If you feel unwell, call for help now.'))+'</p><div class="calls"><a class="call" href="tel:1990"><span class="em">🚑</span><b>'+esc(t('Ambulance (Suwa Seriya)'))+'</b><span class="num">1990</span></a></div>'+
    '<div class="ft"><button class="btn s" data-act="closeSheet">'+esc(t('Close'))+'</button><button class="btn p" data-act="go" data-tab="more" data-sub="sos">'+esc(t('Emergency card'))+'</button></div>');
}

/* =====================================================================
   MEDICINES, APPOINTMENTS, ALARMS
   ===================================================================== */
function vMeds(){
  var p=P(),titles={today:'Medicines',list:'Medicines',appts:'Appointments',history:'Medicines'};
  var h='<div class="stack"><div><div class="h1">'+esc(t(titles[medSub]||'Medicines'))+'</div><p class="sub">'+esc(t('For {n}',{n:pname(p)}))+'</p></div>'+
    '<div class="seg" role="tablist">'+[['today','Today'],['list','My medicines'],['history','History'],['appts','Visits']].map(function(x){return '<button data-act="medSub" data-sub="'+x[0]+'" aria-pressed="'+(medSub===x[0])+'">'+esc(t(x[1]))+'</button>';}).join('')+'</div>';
  if(medSub==='appts')return h+vAppts()+'</div>';
  if(medSub==='history')return h+vMedHistory()+'</div>';
  if(medSub==='list')return h+vMedList()+'</div>';
  var sc=schedule(p.id);
  h+='<section class="card"><h2>'+esc(fDay(new Date()))+'<button class="btn p sm" data-act="addMed">+ '+esc(t('Add'))+'</button></h2>'+(sc.length?'<ul class="list">'+sc.map(function(x){return medRow(x);}).join('')+'</ul>':'<div class="empty"><span class="em">💊</span>'+esc(t('Nothing scheduled today.'))+'</div>')+'</section>';
  var tm=schedule(p.id,dKey(addDays(new Date(),1))).filter(function(x){return !x.prn;});
  if(tm.length)h+='<section class="card"><h2>'+esc(t('Tomorrow'))+'</h2><ul class="list">'+tm.map(function(x){return '<li><span class="em">'+medIcon(x.m)+'</span><div class="main"><b>'+esc(x.m.name)+'</b><span>'+esc(fTimeStr(x.time))+(x.m.dose?' · '+esc(x.m.dose):'')+'</span></div></li>';}).join('')+'</ul></section>';
  h+=alarmStatusCard();
  return h+'</div>';
}
function alarmStatusCard(){
  var push=DB.settings.push.on&&Cloud.user,perm=typeof Notification!=='undefined'?Notification.permission:'unsupported';
  if(push&&perm==='granted')return '<section class="card"><div class="row"><span style="font-size:28px">🔔</span><div style="flex:1"><b>'+esc(t('Alarms are on'))+'</b><div class="small muted">'+esc(t('You will be reminded even when the app is closed.'))+'</div></div><button class="btn s sm" data-act="go" data-tab="more" data-sub="notify">'+esc(t('Settings'))+'</button></div></section>';
  return '<section class="card warnbox"><div class="row"><span style="font-size:28px">🔕</span><div style="flex:1"><b>'+esc(t('Turn on medicine alarms'))+'</b><div class="small muted">'+esc(t('Get an alarm at every dose time, even when the app is closed.'))+'</div></div></div><button class="btn p full mt" data-act="notifySetup">'+esc(t('Set up alarms'))+'</button></section>';
}
function vMedList(){
  var meds=mine('meds'),h='<section class="card"><h2>'+esc(t('Current'))+'<button class="btn p sm" data-act="addMed">+ '+esc(t('Add'))+'</button></h2>';
  var act=meds.filter(function(m){return !m.paused&&!(m.end&&m.end<dKey());}),old=meds.filter(function(m){return act.indexOf(m)<0;});
  if(!meds.length)h+='<div class="empty"><span class="em">💊</span>'+esc(t('No medicines added yet.'))+'</div>';
  var row=function(m){var dl=daysLeft(m);return '<li><button class="navrow" data-act="editMed" data-id="'+m.id+'"><span class="em" style="background:'+esc(m.color||'var(--soft)')+'22">'+medIcon(m)+'</span><div class="main"><b>'+esc(m.name)+'</b><span>'+[esc(m.dose||''),esc(freqText(m)),m.freq!=='prn'?esc((m.times||[]).map(fTimeStr).join(', ')):'',m.purpose?esc(m.purpose):''].filter(Boolean).join(' · ')+'</span></div><div class="end">'+(dl!=null?(dl<=(+m.refillDays||3)?'<span class="tag c-bad">'+esc(plural(dl,'{n} day left','{n} days left'))+'</span>':'<span class="small muted">'+esc(t('{n} left',{n:m.stock}))+'</span>'):'')+'</div><span class="chev">›</span></button></li>';};
  if(act.length)h+='<ul class="list">'+act.map(row).join('')+'</ul>';
  h+='</section>';
  if(old.length)h+='<section class="card"><h2>'+esc(t('Paused or finished'))+'</h2><ul class="list">'+old.map(row).join('')+'</ul></section>';
  if(meds.length)h+='<section class="card"><h2>'+esc(t('Backup reminders'))+'</h2><p class="small muted" style="margin:0 0 10px">'+esc(t('Also add every dose to your phone calendar with an alert — works even without internet.'))+'</p><button class="btn s full" data-act="medIcs">📅 '+esc(t('Add to phone calendar'))+'</button></section>';
  return h;
}
function vMedHistory(){
  var p=P(),a7=adherence(p.id,7),a30=adherence(p.id,30),h='<section class="card"><h2>'+esc(t('Adherence'))+'</h2>';
  if(!a30.tot)return h+'<div class="empty">'+esc(t('No scheduled doses yet.'))+'</div></section>';
  var tg=function(pc){return pc>=90?{n:'Excellent',c:'ok'}:pc>=70?{n:'Good',c:'warn'}:{n:'Needs attention',c:'bad'};};
  h+='<div class="grid2"><div class="tile mini"><span class="k">'+esc(t('Last 7 days'))+'</span><b class="bignum">'+(a7.pct==null?'—':a7.pct+'%')+'</b>'+(a7.pct!=null?tag(tg(a7.pct)):'')+'</div><div class="tile mini"><span class="k">'+esc(t('Last 30 days'))+'</span><b class="bignum">'+a30.pct+'%</b>'+tag(tg(a30.pct))+'</div></div>';
  h+='<div class="small muted mt">'+esc(t('{a} of {b} doses taken in 30 days',{a:a30.ok,b:a30.tot}))+'</div></section>';
  h+='<section class="card"><h2>'+esc(t('Last 14 days'))+'</h2><div class="cal">';
  for(var i=13;i>=0;i--){var d=addDays(new Date(),-i),day=dKey(d),sc=schedule(p.id,day).filter(function(x){return !x.prn;}),now=new Date();
    var due=sc.filter(function(x){var pp=x.time.split(':'),dd=parseDay(day);dd.setHours(+pp[0],+pp[1]);return dd<=now;}),ok=due.filter(function(x){return x.status==='taken';}).length;
    var cls=!due.length?'na':ok===due.length?'ok':ok>0?'part':'miss';
    h+='<div class="cd '+cls+'" title="'+esc(fDay(d))+'"><small>'+esc(fmtD(d,{wd:'narrow'}))+'</small><b>'+d.getDate()+'</b><i>'+(due.length?ok+'/'+due.length:'–')+'</i></div>';}
  h+='</div><div class="legend"><span><i style="background:#22A55B"></i>'+esc(t('All taken'))+'</span><span><i style="background:#F2A51A"></i>'+esc(t('Some missed'))+'</span><span><i style="background:#D93636"></i>'+esc(t('Missed'))+'</span></div></section>';
  var recent=mine('doses').filter(function(d){return d.status;}).sort(function(a,b){return (a.at||'')<(b.at||'')?1:-1;}).slice(0,25);
  if(recent.length){h+='<section class="card"><h2>'+esc(t('Recent doses'))+'</h2><ul class="list">';recent.forEach(function(d){var m=byId('meds',d.med),at=d.at?new Date(d.at):null;
    h+='<li><span class="em">'+(d.status==='taken'?'✅':'⏭️')+'</span><div class="main"><b>'+esc(m?m.name:t('Medicine'))+'</b><span>'+esc(d.time==='prn'?t('As needed'):t('Scheduled {t}',{t:fTimeStr(d.time)}))+' · '+esc(fDay(parseDay(d.date)))+(at?' · '+esc(t('marked {t}',{t:fTime(at)})):'')+(d.by==='notification'?' · 🔔':'')+'</span></div></li>';});h+='</ul></section>';}
  return h;
}
function medForm(m){
  m=m||{name:'',dose:'',form:'tablet',freq:'daily',days:[1,2,3,4,5],every:2,times:['08:00'],food:'after',start:dKey(),end:'',stock:'',qty:1,refillDays:5,purpose:'',prescriber:'',notes:'',paused:false,color:'#1877F2'};
  var tms=m.times||[],h=field({k:'name',l:'Medicine name',val:m.name,ph:'e.g. Metformin'})+'<div class="grid2">'+field({k:'dose',l:'Dose',val:m.dose,ph:'e.g. 500 mg · 1 tablet'})+
    field({k:'form',l:'Type',type:'select',val:m.form||'tablet',opts:Object.keys(FORMS).reduce(function(o,k){o[k]=FORMS[k][1];return o;},{})})+'</div>'+
    field({k:'purpose',l:'What it is for (optional)',val:m.purpose,ph:'e.g. Diabetes, blood pressure'})+
    field({k:'freq',l:'How often',type:'select',val:m.freq,opts:{daily:'Every day',days:'Specific days of the week',interval:'Every few days',prn:'Only when needed'}});
  h+='<div class="f" id="daysBox"'+(m.freq==='days'?'':' style="display:none"')+'><span class="lbl">'+esc(t('Days'))+'</span><div class="daypick">'+DAYN.map(function(d,i){return '<label><input type="checkbox" name="days" value="'+i+'"'+((m.days||[]).indexOf(i)>=0?' checked':'')+'><span>'+esc(t(d))+'</span></label>';}).join('')+'</div></div>';
  h+='<div id="everyBox"'+(m.freq==='interval'?'':' style="display:none"')+'>'+field({k:'every',l:'Every how many days?',u:'days',num:true,val:m.every||2})+'</div>';
  h+='<div class="f" id="timesBox"'+(m.freq==='prn'?' style="display:none"':'')+'><span class="lbl">'+esc(t('Times each day'))+'</span><div class="grid3">';
  for(var i=0;i<6;i++)h+='<input type="time" name="t'+i+'" aria-label="'+esc(t('Dose time {n}',{n:i+1}))+'" value="'+esc(tms[i]||'')+'"'+(i>=Math.max(3,tms.length+1)?' class="hidden more-t"':'')+'>';
  h+='</div><div class="row between mt"><div class="hint" style="margin:0">'+esc(t('One box per dose. Leave the rest empty.'))+'</div><span class="row" style="gap:6px">'+[['1','08:00'],['2','08:00,20:00'],['3','08:00,14:00,20:00']].map(function(x){return '<button type="button" class="btn s sm" data-act="timesPreset" data-v="'+x[1]+'">'+x[0]+'×</button>';}).join('')+'</span></div></div>';
  h+=field({k:'food',l:'Take it',type:'select',val:m.food||'any',opts:FOOD});
  h+='<div class="grid2">'+field({k:'start',l:'Start date',type:'date',val:m.start})+field({k:'end',l:'End date (optional)',type:'date',val:m.end})+'</div>';
  h+='<div class="grid3">'+field({k:'stock',l:'Stock left',num:true,val:m.stock,ph:'optional'})+field({k:'qty',l:'Per dose',num:true,val:m.qty||1})+field({k:'refillDays',l:'Warn at',u:'days',num:true,val:m.refillDays||5})+'</div>';
  h+='<div class="grid2">'+field({k:'prescriber',l:'Prescribed by',val:m.prescriber,ph:'Dr. …'})+field({k:'color',l:'Colour',type:'select',val:m.color||'#1877F2',raw:true,opts:{'#1877F2':'🔵','#22A55B':'🟢','#D93636':'🔴','#F2A51A':'🟡','#7A5AF8':'🟣','#EE6A2B':'🟠','#8B6B4A':'🟤','#5B6575':'⚪'}})+'</div>';
  h+=field({k:'notes',l:'Notes',type:'textarea',val:m.notes,ph:'Side effects, special instructions…'});
  if(m.id)h+=field({k:'paused',l:'Status',type:'select',val:m.paused?'1':'0',opts:{'0':'Active','1':'Paused / stopped'}});
  return h;
}
function readMed(d,m){
  if(!d.name)return t('Please enter the medicine name.');
  var times=[];for(var i=0;i<6;i++)if(d['t'+i])times.push(d['t'+i]);times=times.filter(function(x,i){return times.indexOf(x)===i;}).sort();
  if(d.freq!=='prn'&&!times.length)return t('Add at least one dose time.');
  var days=(d.days||[]).map(Number);if(d.freq==='days'&&!days.length)return t('Choose at least one day.');
  var every=Math.round(pnum(d.every));if(d.freq==='interval'&&!(every>=2&&every<=60))return t('Every how many days? Enter 2–60.');
  if(d.start&&d.end&&d.end<d.start)return t('End date must be after the start date.');
  var stock=d.stock===''?'':pnum(d.stock);if(stock!==''&&(isNaN(stock)||stock<0))return t('Stock must be a number.');
  var qty=pnum(d.qty);if(isNaN(qty)||qty<=0)qty=1;var rd=Math.round(pnum(d.refillDays));
  m.name=d.name.slice(0,60);m.dose=d.dose.slice(0,60);m.form=d.form;m.freq=d.freq;m.days=days;m.every=every||2;m.times=d.freq==='prn'?[]:times;m.food=d.food;m.start=d.start||dKey();m.end=d.end;
  m.stock=stock===''?'':r1(stock);m.qty=qty;m.refillDays=rd>=1&&rd<=60?rd:5;m.purpose=(d.purpose||'').slice(0,60);m.prescriber=(d.prescriber||'').slice(0,60);m.color=d.color||'#1877F2';m.notes=(d.notes||'').slice(0,500);m.paused=d.paused==='1';
}
function addMed(){openSheet('💊 '+t('Add medicine'),medForm(),function(d){var m={id:uid(),pid:P().id};var e=readMed(d,m);if(e)return e;put('meds',m);toast(t('Medicine added'));view(true);
  if(!DB.settings.push.on&&!DB.settings.alarmHintShown){DB.settings.alarmHintShown=true;save();setTimeout(notifySetup,500);}},{focus:'#f_name'});wireMedForm();}
function editMed(id){var m=byId('meds',id);if(!m)return;
  openSheet(t('Edit medicine'),medForm(m),function(d){var e=readMed(d,m);if(e)return e;put('meds',m);toast(t('Saved'));view(true);},{del:true,onDel:function(){del('meds',m);toast(t('Medicine removed'));view(true);}});wireMedForm();}
function wireMedForm(){var s=$('#f_freq');if(!s)return;s.addEventListener('change',function(){$('#timesBox').style.display=s.value==='prn'?'none':'';$('#daysBox').style.display=s.value==='days'?'':'none';$('#everyBox').style.display=s.value==='interval'?'':'none';});
  $$('#timesBox input[type=time]').forEach(function(inp,i,all){inp.addEventListener('change',function(){var nx=all[i+1];if(nx&&inp.value)nx.classList.remove('hidden');});});}
function doseMenu(d){
  var m=byId('meds',d.id);if(!m)return;var x=schedule(m.pid,d.day).filter(function(y){return y.m.id===m.id&&y.time===d.time;})[0]||{};
  var dl=daysLeft(m);
  openSheet(medIcon(m)+' '+m.name,'<p class="lead">'+esc([fTimeStr(d.time),m.dose,m.food&&m.food!=='any'?t(FOOD[m.food]):'',fDay(parseDay(d.day))].filter(Boolean).join(' · '))+'</p>'+
    (m.purpose?'<div class="kv"><span>'+esc(t('For'))+'</span><b>'+esc(m.purpose)+'</b></div>':'')+(dl!=null?'<div class="kv"><span>'+esc(t('Stock'))+'</span><b>'+esc(t('{n} left',{n:m.stock}))+' · '+esc(plural(dl,'{n} day left','{n} days left'))+'</b></div>':'')+(m.notes?'<div class="kv"><span>'+esc(t('Notes'))+'</span><b>'+esc(m.notes)+'</b></div>':'')+
    '<div class="grid2 mt"><button class="btn '+(x.status==='taken'?'s':'p')+'" data-act="doseSet" data-id="'+m.id+'" data-time="'+d.time+'" data-day="'+d.day+'" data-st="taken">✓ '+esc(t(x.status==='taken'?'Undo taken':'Taken'))+'</button><button class="btn s" data-act="doseSet" data-id="'+m.id+'" data-time="'+d.time+'" data-day="'+d.day+'" data-st="skipped">'+esc(t(x.status==='skipped'?'Undo skip':'Skip'))+'</button></div>'+
    '<div class="ft"><button class="btn s" data-act="editMed" data-id="'+m.id+'">✏️ '+esc(t('Edit medicine'))+'</button><button class="btn s" data-act="closeSheet">'+esc(t('Close'))+'</button></div>');
}

/* ---------- Appointments ---------- */
function upcomingAppts(pid){var now=Date.now()-60*60000;return mine('appts',pid).filter(function(a){var d=parseDT(a.dt);return d&&d.getTime()>=now;}).sort(function(a,b){return a.dt<b.dt?-1:1;});}
function apptRow(a){var d=parseDT(a.dt);return '<li><button class="navrow" data-act="editAppt" data-id="'+a.id+'"><span class="em datebox">'+esc(fmtD(d,{mon:'short'}))+'<b>'+d.getDate()+'</b></span><div class="main"><b>'+esc(a.title||a.doctor||t('Appointment'))+'</b><span>'+[relDay(d),fTime(d),esc(a.doctor&&a.title?a.doctor:''),esc(a.place||'')].filter(Boolean).join(' · ')+'</span></div><span class="chev">›</span></button></li>';}
function vAppts(){
  var up=upcomingAppts(),past=mine('appts').filter(function(a){return up.indexOf(a)<0;}).sort(function(a,b){return a.dt>b.dt?-1:1;});
  var h='<section class="card"><h2>'+esc(t('Upcoming'))+' <button class="btn p sm" data-act="addAppt">+ '+esc(t('Add'))+'</button></h2>'+(up.length?'<ul class="list">'+up.map(apptRow).join('')+'</ul>':'<div class="empty"><span class="em">📅</span>'+esc(t('No upcoming appointments.'))+'</div>')+'</section>';
  if(past.length)h+='<section class="card"><h2>'+esc(t('Past visits'))+'</h2><ul class="list">'+past.slice(0,30).map(apptRow).join('')+'</ul></section>';
  return h;
}
function apptForm(a){var d=addDays(new Date(),1);d.setHours(9,0,0,0);a=a||{title:'',doctor:'',place:'',dt:localDT(d),notes:'',outcome:''};
  return field({k:'title',l:'What',val:a.title,ph:'e.g. Diabetes clinic, Blood test'})+'<div class="grid2">'+field({k:'doctor',l:'Doctor',val:a.doctor,ph:'e.g. Dr. Perera'})+field({k:'place',l:'Place',val:a.place,ph:'e.g. Nawaloka Hospital'})+'</div>'+
  field({k:'dt',l:'Date & time',type:'datetime-local',val:a.dt})+field({k:'notes',l:'Questions to ask / things to bring',type:'textarea',val:a.notes,ph:'Previous reports, fasting required…'})+
  (a.id?field({k:'outcome',l:'Doctor\'s advice after the visit',type:'textarea',val:a.outcome,ph:'Diagnosis, changes to medicines, next visit…'}):'');}
function readAppt(d,a){if(!d.title&&!d.doctor)return t('Please enter what the appointment is for, or the doctor.');var tm=parseDT(d.dt);if(!tm)return t('Please choose a date and time.');
  a.title=d.title.slice(0,80);a.doctor=d.doctor.slice(0,80);a.place=d.place.slice(0,80);a.dt=localDT(tm);a.notes=(d.notes||'').slice(0,800);a.outcome=(d.outcome||'').slice(0,800);}
function addAppt(){openSheet('📅 '+t('Add appointment'),apptForm(),function(d){var a={id:uid(),pid:P().id};var e=readAppt(d,a);if(e)return e;put('appts',a);toast(t('Appointment added'));medSub='appts';if(R.tab==='meds')view(true);});}
function editAppt(id){var a=byId('appts',id);if(!a)return;
  openSheet(t('Edit appointment'),apptForm(a)+'<button type="button" class="btn s full" data-act="apptIcs" data-id="'+a.id+'" style="margin-bottom:12px">📅 '+esc(t('Add to phone calendar'))+'</button>',function(d){var e=readAppt(d,a);if(e)return e;put('appts',a);toast(t('Saved'));view(true);},
    {del:true,onDel:function(){del('appts',a);toast(t('Deleted'));view(true);}});}

/* ---------- Calendar (.ics) ---------- */
function icsEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');}
function icsDT(d){return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';}
function icsStamp(){var d=new Date();return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';}
function icsWrap(ev){return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//My Health//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n'+ev.join('')+'END:VCALENDAR\r\n';}
function medIcs(){
  var ev=[],st=icsStamp(),BY=['SU','MO','TU','WE','TH','FR','SA'];
  mine('meds').forEach(function(m){if(m.freq==='prn'||m.paused)return;var sd=parseDay(m.start)||new Date();if(sd<parseDay(dKey()))sd=parseDay(dKey());
    (m.times||[]).forEach(function(tm){var p=tm.split(':'),d=new Date(sd);d.setHours(+p[0],+p[1],0,0);var e=new Date(d);e.setMinutes(e.getMinutes()+10);
      var rr=m.freq==='days'?'RRULE:FREQ=WEEKLY;BYDAY='+(m.days||[]).map(function(x){return BY[x];}).join(','):m.freq==='interval'?'RRULE:FREQ=DAILY;INTERVAL='+(m.every||2):'RRULE:FREQ=DAILY';
      if(m.freq==='interval'){var sd0=parseDay(m.start)||sd,k=Math.ceil((dayNum(dKey(sd))-dayNum(dKey(sd0)))/(m.every||2));d=addDays(sd0,k*(m.every||2));d.setHours(+p[0],+p[1],0,0);e=new Date(d);e.setMinutes(e.getMinutes()+10);}
      var ed=parseDay(m.end);if(ed){ed.setHours(23,59,0,0);rr+=';UNTIL='+icsDT(ed);}
      ev.push('BEGIN:VEVENT\r\nUID:'+m.id+'-'+tm.replace(':','')+'@myhealth\r\nDTSTAMP:'+st+'\r\nDTSTART:'+icsDT(d)+'\r\nDTEND:'+icsDT(e)+'\r\n'+rr+'\r\nSUMMARY:'+icsEsc('💊 '+m.name+(m.dose?' – '+m.dose:''))+'\r\nDESCRIPTION:'+icsEsc(t(FOOD[m.food]||'')+(m.notes?'\n'+m.notes:'')+'\n'+pname(P()))+'\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:'+icsEsc(t('Time to take {m}',{m:m.name}))+'\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT\r\n');});});
  if(!ev.length){toast(t('No scheduled medicines to add'));return;}
  download('medicine-reminders.ics',icsWrap(ev),'text/calendar');toast(t('Open the file to add the reminders'));
}
function apptIcs(id){var a=byId('appts',id);if(!a)return;var d=parseDT(a.dt),e=new Date(d);e.setHours(e.getHours()+1);
  var ev='BEGIN:VEVENT\r\nUID:'+a.id+'@myhealth\r\nDTSTAMP:'+icsStamp()+'\r\nDTSTART:'+icsDT(d)+'\r\nDTEND:'+icsDT(e)+'\r\nSUMMARY:'+icsEsc('🩺 '+(a.title||t('Appointment'))+(a.doctor?' – '+a.doctor:''))+'\r\n'+(a.place?'LOCATION:'+icsEsc(a.place)+'\r\n':'')+'DESCRIPTION:'+icsEsc((a.notes||'')+'\n'+pname(P()))+'\r\n'+
    'BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:'+icsEsc(t('Appointment tomorrow'))+'\r\nTRIGGER:-P1D\r\nEND:VALARM\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:'+icsEsc(t('Appointment in 1 hour'))+'\r\nTRIGGER:-PT1H\r\nEND:VALARM\r\nEND:VEVENT\r\n';
  download('appointment-'+dKey(d)+'.ics',icsWrap([ev]),'text/calendar');closeSheet();toast(t('Open the file to add it to your calendar'));}

/* =====================================================================
   In-app alarm (full screen, sound, vibration) + local notifications
   ===================================================================== */
var Alarm={shown:null,snoozed:{},fired:{},timer:null,audio:null,soundT:null,
  start:function(){var self=this;try{this.fired=JSON.parse(sessionStorage.getItem('mh-fired')||'{}');}catch(e){}clearInterval(this.timer);this.timer=setInterval(function(){self.check();},15000);setTimeout(function(){self.check();},1500);},
  people:function(){var ap=DB.settings.alarmPeople;return live('people').filter(function(p){return !ap||ap.indexOf(p.id)>=0;});},
  check:function(){
    if(!DB.settings.alarms||this.shown)return;var now=new Date(),day=dKey(now),hm=hhmm(now),self=this,due=[];
    this.people().forEach(function(p){schedule(p.id,day).forEach(function(x){if(x.prn||x.status)return;
      var key=x.id,sn=self.snoozed[key],p0=x.time.split(':'),dt=parseDay(day);dt.setHours(+p0[0],+p0[1],0,0);var mins=(now-dt)/60000;
      if(sn){if(now>=sn){delete self.snoozed[key];due.push({x:x,p:p});}return;}
      if(mins>=0&&mins<20&&!self.fired[key])due.push({x:x,p:p});});});
    if(!due.length)return;
    due.forEach(function(d){self.fired[d.x.id]=1;});try{sessionStorage.setItem('mh-fired',JSON.stringify(this.fired));}catch(e){}
    if(document.hidden)this.localNotify(due);
    this.show(due);
  },
  localNotify:function(due){if(typeof Notification==='undefined'||Notification.permission!=='granted'||!navigator.serviceWorker)return;
    navigator.serviceWorker.ready.then(function(reg){due.forEach(function(d){var m=d.x.m;reg.showNotification(t('💊 Time for {med}',{med:m.name}),{body:fTimeStr(d.x.time)+' · '+[m.dose,t(FOOD[m.food]||''),pname(d.p)].filter(Boolean).join(' · '),tag:'due|'+m.id+'|'+d.x.id.split('_').slice(-2).join('|'),icon:'icons/icon-192.png',badge:'icons/badge-96.png',requireInteraction:true,vibrate:[400,150,400,150,800],data:{kind:'due',local:1,url:'./?alarm=local'}});});}).catch(function(){});},
  show:function(due,opts){
    opts=opts||{};this.shown=due;var el=$('#alarm'),p=due[0].p,tm=due[0].x.time;
    el.innerHTML='<div class="al-in"><div class="al-pulse"><span>'+medIcon(due[0].x.m)+'</span></div><div class="al-time">'+esc(fTimeStr(tm))+'</div><div class="al-t">'+esc(t('Time for your medicine'))+'</div>'+
      (live('people').length>1?'<div class="al-p">'+esc(t('For {n}',{n:pname(p)}))+'</div>':'')+
      '<div class="al-list">'+due.map(function(d){var m=d.x.m;return '<div class="al-med"><span>'+medIcon(m)+'</span><div><b>'+esc(m.name)+'</b><small>'+esc([m.dose,m.food&&m.food!=='any'?t(FOOD[m.food]):''].filter(Boolean).join(' · '))+(live('people').length>1&&d.p.id!==p.id?' · '+esc(pname(d.p)):'')+'</small></div></div>';}).join('')+'</div>'+
      '<button class="al-btn ok" data-act="alarmTake">✓ '+esc(t('I took it'))+'</button><div class="al-row"><button class="al-btn s" data-act="alarmSnooze">⏰ '+esc(t('Snooze 10 min'))+'</button><button class="al-btn s" data-act="alarmSkip">'+esc(t('Skip'))+'</button></div></div>';
    el.classList.add('on');document.body.classList.add('noscroll');
    if(!opts.silent){this.sound();if(DB.settings.vibrate&&navigator.vibrate)navigator.vibrate([400,150,400,150,800]);}
  },
  hide:function(){this.shown=null;$('#alarm').classList.remove('on');document.body.classList.remove('noscroll');this.stopSound();if(navigator.vibrate)navigator.vibrate(0);},
  act:function(kind){var due=this.shown||[],self=this;if(this.demo){this.demo=false;this.hide();toast(t('This was a preview. Real alarms look like this.'));return;}
    due.forEach(function(d){var day=d.x.id.split('_').slice(-2)[0];
      if(kind==='take'||kind==='skip')setDose(d.x.m,day,d.x.time,kind==='take'?'taken':'skipped');
      else self.snoozed[d.x.id]=new Date(Date.now()+10*60000);
      if(kind==='snooze'&&self.pushKey&&Cloud.user)Cloud.snooze(self.pushKey);});
    this.pushKey=null;this.hide();toast(kind==='take'?'✓ '+t('Marked as taken'):kind==='skip'?t('Skipped'):t('I will remind you again in 10 minutes'));view(true);
    if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(function(reg){reg.getNotifications().then(function(ns){ns.forEach(function(n){if(n.data&&n.data.kind==='due')n.close();});});}).catch(function(){});
  },
  sound:function(){
    this.stopSound();if(DB.settings.sound==='off')return;var self=this,n=0;
    try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.audio=this.audio||new AC();if(this.audio.state==='suspended')this.audio.resume();}catch(e){return;}
    var play=function(){var ac=self.audio,t0=ac.currentTime,notes=DB.settings.sound==='beep'?[880,0,880,0,880]:[784,988,1175,988,1319];
      notes.forEach(function(f,i){if(!f)return;var o=ac.createOscillator(),g=ac.createGain();o.type=DB.settings.sound==='beep'?'square':'sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t0+i*0.18);g.gain.exponentialRampToValueAtTime(0.35,t0+i*0.18+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+i*0.18+0.17);o.connect(g);g.connect(ac.destination);o.start(t0+i*0.18);o.stop(t0+i*0.18+0.2);});
      if(++n<40)self.soundT=setTimeout(play,1600);};
    play();
  },
  stopSound:function(){clearTimeout(this.soundT);this.soundT=null;},
  test:function(){var p=P(),m={id:'demo',name:t('Sample medicine'),dose:t('1 tablet'),food:'after',form:'tablet',pid:p.id};this.show([{x:{id:'demo_'+dKey()+'_'+hhmm(new Date()),m:m,time:hhmm(new Date())},p:p}]);this.demo=true;},
  fromPush:function(key,tok){var pr=key.split('|'),m=byId('meds',pr[1]);if(!m){toast(t('Opening…'));return;}var p=personOf(m.pid)||P();
    var x={id:doseId(m,pr[2],pr[3]),m:m,time:pr[3]};var d=byId('doses',x.id);if(d&&d.status&&!d._del){toast(t('Already marked: {s}',{s:t(d.status==='taken'?'Taken':'Skipped')}));return;}
    this.pushKey={key:key,tok:tok};this.show([{x:x,p:p}],{silent:true});}
};

/* =====================================================================
   TOOLS (calculators)
   ===================================================================== */
var TOOLS=[
  {id:'bmi',em:'⚖️',n:'BMI',d:'Body mass index & healthy weight'},{id:'cal',em:'🔥',n:'Daily calories',d:'BMR and energy needs for your goal'},
  {id:'ibw',em:'🎯',n:'Healthy weight',d:'Healthy weight range for your height'},{id:'water',em:'💧',n:'Water needs',d:'How much to drink each day'},
  {id:'protein',em:'🥚',n:'Protein needs',d:'Daily protein target'},{id:'waist',em:'📏',n:'Waist & waist-to-height',d:'Belly fat and health risk'},
  {id:'fat',em:'📐',n:'Body fat %',d:'US Navy tape-measure method'},{id:'hr',em:'❤️',n:'Heart rate zones',d:'Target zones for exercise'},
  {id:'preg',em:'🤰',n:'Pregnancy due date',d:'Due date and current week'},{id:'sugar',em:'🩸',n:'Sugar unit converter',d:'mg/dL ⇄ mmol/L'}
];
function vTools(){
  if(toolOpen){var to=TOOLS.filter(function(x){return x.id===toolOpen;})[0];
    return '<div class="stack"><div><button class="btn s sm" data-act="toolBack">‹ '+esc(t('All tools'))+'</button><div class="h1">'+to.em+' '+esc(t(to.n))+'</div><p class="sub">'+esc(t(to.d))+'</p></div><section class="card" data-calc="'+to.id+'">'+toolForm(to.id)+'<div id="calcOut"></div></section>'+toolNote(to.id)+'</div>';}
  var h='<div class="stack"><div><div class="h1">'+esc(t('Health tools'))+'</div><p class="sub">'+esc(t('Calculators pre-filled from your profile.'))+'</p></div><section class="card"><ul class="list">';
  TOOLS.forEach(function(x){h+='<li><button class="navrow" data-act="tool" data-id="'+x.id+'"><span class="em">'+x.em+'</span><div class="main"><b>'+esc(t(x.n))+'</b><span>'+esc(t(x.d))+'</span></div><span class="chev">›</span></button></li>';});
  return h+'</ul></section></div>';
}
function pre(){var p=P(),w=latestWeight(),a=ageOf(p.dob);return {h:p.height||'',w:isNaN(w)?'':w,a:a==null?'':a,s:p.sex||'',c:p.cutoff||'asia'};}
function toolForm(id){
  var p=pre(),num=function(k,l,u,v,ph){return field({k:k,l:l,u:u,num:true,val:v,ph:ph});};
  var sexSeg='<div class="f"><span class="lbl">'+esc(t('Sex'))+'</span>'+seg('sex',{female:'Female',male:'Male'},p.s||'female')+'</div>';
  var cut='<div class="f"><span class="lbl">'+esc(t('BMI cut-offs'))+'</span>'+seg('c',{asia:'Asian',who:'International'},p.c)+'</div>';
  switch(id){
    case 'bmi':return num('h','Height','cm',p.h,'e.g. 160')+num('w','Weight','kg',p.w,'e.g. 58')+cut;
    case 'cal':return sexSeg+'<div class="grid2">'+num('a','Age','yrs',p.a,'30')+num('h','Height','cm',p.h,'160')+'</div>'+num('w','Weight','kg',p.w,'58')+
      field({k:'act',l:'Activity level',type:'select',val:'1.375',opts:{'1.2':'Sedentary (little or no exercise)','1.375':'Lightly active (1–3 days/week)','1.55':'Moderately active (3–5 days/week)','1.725':'Very active (6–7 days/week)','1.9':'Extra active (physical job + training)'}})+
      '<div class="f"><span class="lbl">'+esc(t('Goal'))+'</span>'+seg('g',{lose:'Lose',keep:'Maintain',gain:'Gain'},'keep')+'</div>';
    case 'ibw':return sexSeg+num('h','Height','cm',p.h,'160')+cut;
    case 'water':return num('w','Weight','kg',p.w,'58')+num('ex','Exercise today','min','0')+'<div class="f"><span class="lbl">'+esc(t('Weather'))+'</span>'+seg('hot',{no:'Normal',yes:'Hot / humid'},'yes')+'</div>';
    case 'protein':return num('w','Weight','kg',p.w,'58')+num('a','Age','yrs',p.a,'30')+field({k:'lvl',l:'Activity',type:'select',val:'0.8',opts:{'0.8':'Mostly inactive','1.0':'Regular moderate exercise','1.4':'Strength / endurance training'}});
    case 'waist':var lw=latest('waist');return sexSeg+num('wa','Waist','cm',lw?lw.v.v:'','e.g. 80')+num('h','Height','cm',p.h,'160')+'<div class="hint" style="margin:-4px 0 4px">'+esc(t('Measure at the midpoint between lowest rib and hip bone, after breathing out.'))+'</div>';
    case 'fat':var lw2=latest('waist');return sexSeg+num('h','Height','cm',p.h,'160')+num('ne','Neck','cm','','e.g. 34')+num('wa','Waist (at navel)','cm',lw2?lw2.v.v:'','e.g. 80')+'<div id="hipF">'+num('hi','Hip (widest point)','cm','','e.g. 95')+'</div>';
    case 'hr':var lp=latest('pulse');return num('a','Age','yrs',p.a,'30')+num('r','Resting heart rate (optional)','bpm',lp?lp.v.v:'','e.g. 70');
    case 'preg':return field({k:'lmp',l:'First day of last menstrual period',type:'date',val:''})+num('cy','Average cycle length','days','28');
    case 'sugar':return '<div class="f"><span class="lbl">'+esc(t('Convert from'))+'</span>'+seg('from',{mg:'mg/dL → mmol/L',mm:'mmol/L → mg/dL'},'mg')+'</div>'+num('v','Value','','','e.g. 110');
  }
  return '';
}
var TOOL_NOTES={bmi:'BMI does not measure body fat directly and may not suit athletes, pregnant women, children or older adults. Asian cut-offs are recommended for Sri Lankan adults.',
  cal:'Uses the Mifflin-St Jeor equation. Estimates only — needs differ in pregnancy, illness and for children. Ask your dietitian for a personalised plan.',
  ibw:'Healthy range is from BMI; ideal body weight uses the Devine formula (common in clinical use).',
  water:'General guide: about 35 ml per kg, more with exercise and heat. People with kidney or heart conditions should follow their doctor\'s fluid advice.',
  protein:'General adult guide. Kidney disease, pregnancy and other conditions change protein needs — check with your dietitian.',
  waist:'Asian cut-offs: increased risk at 90 cm or more for men and 80 cm or more for women. Waist-to-height under 0.5 is a good target.',
  fat:'Tape-measure estimate with a typical error of a few percent.',
  hr:'Max heart rate estimated as 220 − age. If you have heart disease or take BP medicine, ask your doctor for safe exercise limits.',
  preg:'Based on Naegele\'s rule adjusted for cycle length. Your doctor\'s scan date is more accurate.',sugar:'1 mmol/L = 18 mg/dL.'};
function toolNote(id){return '<p class="small muted" style="margin:0 4px">ℹ️ '+esc(t(TOOL_NOTES[id]||''))+'</p>';}
function g(name){var el=$('[data-calc] [name="'+name+'"]');return el?el.value:'';}
function gn(name){return pnum(g(name));}
function kv(a,b){return '<div class="kv"><span>'+a+'</span><b>'+b+'</b></div>';}
function runCalc(){
  var box=$('#calcOut');if(!box)return;var id=toolOpen,o='',miss='<div class="empty small">'+esc(t('Enter your details above to see results.'))+'</div>',sex=g('sex'),T_=function(s,v){return esc(t(s,v));};
  if(id==='fat'){var hf=$('#hipF');if(hf)hf.classList.toggle('hidden',sex!=='female');}
  try{
  if(id==='bmi'){var h=gn('h'),w=gn('w'),c=g('c');
    if(!(h>=50&&h<=250&&w>=2&&w<=350))o=miss;else{var b=w/Math.pow(h/100,2),cl=bmiClass(b,c),hr=BMI_STD[c].healthy,first=!box.querySelector('.gauge');
      o='<div class="res">'+bmiGauge(b,c,first)+'<div style="text-align:center"><div class="big">'+f1(b)+' <small>kg/m²</small></div>'+tag(cl)+'<p>'+T_(BMI_MSG[cl.n])+'</p></div></div>'+kv(T_('Healthy weight for your height'),f1(hr[0]*h*h/1e4)+' – '+f1(hr[1]*h*h/1e4)+' kg')+bandTable(c,cl.i);}}
  else if(id==='cal'){var a=gn('a'),h2=gn('h'),w2=gn('w'),act=+g('act'),gl=g('g');
    if(!(a>=15&&a<=110&&h2>=100&&h2<=250&&w2>=25&&w2<=350))o='<div class="empty small">'+T_('Enter age (15+), height and weight.')+'</div>';else{
      var bmr=10*w2+6.25*h2-5*a+(sex==='male'?5:-161),tdee=bmr*act,floor=sex==='male'?1500:1200,target=gl==='lose'?Math.max(floor,tdee-500):gl==='gain'?tdee+300:tdee;
      o='<div class="res"><div class="small muted">'+T_('Daily calories for your goal')+'</div><div class="big">'+fNum(Math.round(target/10)*10)+' <small>kcal/'+T_('day')+'</small></div>'+(gl==='lose'&&tdee-500<floor?'<p>'+T_('Limited to a safe minimum of {n} kcal.',{n:floor})+'</p>':'')+'</div>'+
      kv(T_('Basal metabolic rate (BMR)'),Math.round(bmr)+' kcal')+kv(T_('Maintenance (TDEE)'),Math.round(tdee)+' kcal')+kv(T_('Lose ~0.5 kg/week'),Math.round(Math.max(floor,tdee-500))+' kcal')+kv(T_('Gain slowly'),Math.round(tdee+300)+' kcal')+
      kv(T_('Carbs / Protein / Fat (50/20/30)'),Math.round(target*.5/4)+' g · '+Math.round(target*.2/4)+' g · '+Math.round(target*.3/9)+' g');}}
  else if(id==='ibw'){var h3=gn('h'),c3=g('c');if(!(h3>=120&&h3<=250))o=miss;else{var hr3=BMI_STD[c3].healthy,ibw=(sex==='male'?50:45.5)+2.3*(h3/2.54-60);
      o='<div class="res"><div class="small muted">'+T_('Healthy weight range')+'</div><div class="big">'+f1(hr3[0]*h3*h3/1e4)+' – '+f1(hr3[1]*h3*h3/1e4)+' <small>kg</small></div><p>'+T_('Based on BMI {a}–{b}.',{a:hr3[0],b:hr3[1]})+'</p></div>'+
      kv(T_('Ideal body weight (Devine)'),h3<152.4?T_('n/a (under 152 cm)'):f1(ibw)+' kg')+kv(T_('Middle of healthy range'),f1((hr3[0]+hr3[1])/2*h3*h3/1e4)+' kg');
      var lw=latestWeight();if(!isNaN(lw)){var lo=hr3[0]*h3*h3/1e4,hi=hr3[1]*h3*h3/1e4;o+=kv(T_('Your latest weight'),f1(lw)+' kg '+(lw<lo?'(↑ '+f1(lo-lw)+' kg)':lw>hi?'(↓ '+f1(lw-hi)+' kg)':'✓'));}}}
  else if(id==='water'){var w4=gn('w'),ex=gn('ex')||0;if(!(w4>=10&&w4<=350))o=miss;else{var ml=Math.round((w4*35+ex/30*350+(g('hot')==='yes'?500:0))/50)*50;
      o='<div class="res"><div class="small muted">'+T_('Recommended daily water')+'</div><div class="big">'+(ml/1000).toFixed(1)+' <small>L</small></div><p>'+T_('About {n} glasses of 250 ml.',{n:Math.round(ml/250)})+'</p></div><button class="btn s full mt" data-act="setWaterGoal" data-ml="'+ml+'">'+T_('Set as my daily water goal')+'</button>';}}
  else if(id==='protein'){var w5=gn('w'),a5=gn('a'),f=+g('lvl');if(!(w5>=10&&w5<=350))o=miss;else{if(a5>=65&&f<1)f=1;var lo5=w5*f,hi5=w5*(f===0.8?1.0:f+0.2);
      o='<div class="res"><div class="small muted">'+T_('Daily protein')+'</div><div class="big">'+Math.round(lo5)+' – '+Math.round(hi5)+' <small>g</small></div><p>'+(a5>=65?T_('Older adults need a little more protein to protect muscle.')+' ':'')+T_('About {n} g per main meal.',{n:Math.round(lo5/3)})+'</p></div>'+
      kv(T_('1 egg'),'≈ 6 g')+kv(T_('1 cup cooked dhal'),'≈ 18 g')+kv(T_('100 g fish / chicken'),'≈ 22–25 g')+kv(T_('1 cup milk'),'≈ 8 g');}}
  else if(id==='waist'){var wa=gn('wa'),h6=gn('h');if(!(wa>=30&&wa<=250))o=miss;else{var cutw=sex==='male'?90:80;
      o='<div class="res"><div class="small muted">'+T_('Waist')+'</div><div class="big">'+f1(wa)+' <small>cm</small></div>'+tag(wa>=cutw?{n:'Increased risk (≥ {m} cm)',vars:{m:cutw},c:'warn2'}:{n:'Below Asian risk cut-off',c:'ok'})+'</div>';
      if(h6>=100){var x=wa/h6,c6=x<0.4?{n:'Low',c:'info'}:x<0.5?{n:'Healthy',c:'ok'}:x<0.6?{n:'Increased risk',c:'warn2'}:{n:'High risk',c:'bad'};o+=kv(T_('Waist-to-height ratio'),x.toFixed(2)+' '+tag(c6))+kv(T_('Target waist'),'&lt; '+Math.round(h6/2)+' cm');}}}
  else if(id==='fat'){var h7=gn('h'),ne=gn('ne'),wa7=gn('wa'),hi7=gn('hi'),bf=NaN;
      if(h7>=100&&ne>=15&&wa7>=40){if(sex==='male'&&wa7>ne)bf=495/(1.0324-0.19077*Math.log10(wa7-ne)+0.15456*Math.log10(h7))-450;else if(sex==='female'&&hi7>=50&&wa7+hi7>ne)bf=495/(1.29579-0.35004*Math.log10(wa7+hi7-ne)+0.22100*Math.log10(h7))-450;}
      if(isNaN(bf)||bf<2||bf>70)o='<div class="empty small">'+T_(sex==='female'?'Enter height, neck, waist and hip.':'Enter height, neck and waist.')+'</div>';else{
        var c7=sex==='male'?(bf<6?{n:'Essential',c:'info'}:bf<18?{n:'Fit',c:'ok'}:bf<25?{n:'Average',c:'warn'}:{n:'High',c:'warn2'}):(bf<14?{n:'Essential',c:'info'}:bf<25?{n:'Fit',c:'ok'}:bf<32?{n:'Average',c:'warn'}:{n:'High',c:'warn2'});
        o='<div class="res"><div class="small muted">'+T_('Estimated body fat')+'</div><div class="big">'+f1(bf)+' <small>%</small></div>'+tag(c7)+'</div>';var lw7=latestWeight();if(!isNaN(lw7))o+=kv(T_('Fat mass'),f1(lw7*bf/100)+' kg')+kv(T_('Lean mass'),f1(lw7*(1-bf/100))+' kg');}}
  else if(id==='hr'){var a8=gn('a'),r8=gn('r');if(!(a8>=10&&a8<=110))o=miss;else{var mx=220-a8,useR=r8>=30&&r8<=120,z=[[50,60,'Very light','Warm-up, recovery','info'],[60,70,'Light','Fat burning, endurance','ok'],[70,80,'Moderate','Aerobic fitness','warn'],[80,90,'Hard','Performance','warn2'],[90,100,'Maximum','Short bursts only','bad']];
      var bp=function(q){return Math.round(useR?r8+(mx-r8)*q/100:mx*q/100);};o='<div class="res"><div class="small muted">'+T_('Estimated maximum heart rate')+'</div><div class="big">'+mx+' <small>bpm</small></div>'+(useR?'<p>'+T_('Zones use your resting heart rate (Karvonen method).')+'</p>':'')+'</div>';
      z.forEach(function(q){o+=kv(tag({n:q[2],c:q[4]})+' <span class="small muted">'+T_(q[3])+'</span>',bp(q[0])+'–'+bp(q[1]));});}}
  else if(id==='preg'){var d=parseDay(g('lmp')),cy=gn('cy')||28;if(!d)o='<div class="empty small">'+T_('Choose the first day of your last period.')+'</div>';else if(cy<20||cy>45)o='<div class="empty small">'+T_('Cycle length should be 20–45 days.')+'</div>';else{
      var due=addDays(d,280+(cy-28)),now=parseDay(dKey()),ga=Math.floor((now-d)/864e5)-(cy-28);
      if(ga<0||ga>300)o='<div class="empty small">'+T_('Please check the date — it should be within the last 42 weeks.')+'</div>';else{var wk=Math.floor(ga/7),dy=ga%7,left=Math.round((due-now)/864e5);
        o='<div class="res"><div class="small muted">'+T_('Estimated due date')+'</div><div class="big" style="font-size:26px">'+esc(fmtD(due,{wd:'short',day:1,mon:'long',year:1}))+'</div><p>'+(left>=0?T_('{n} days to go',{n:left}):T_('Due date has passed'))+'</p></div>'+
        kv(T_('Current pregnancy'),T_('{w} weeks {d} days',{w:wk,d:dy}))+kv(T_('Trimester'),T_(wk<13?'First':wk<27?'Second':'Third'))+'<div class="pbar mt"><i style="width:'+clamp(ga/280*100,0,100).toFixed(1)+'%;background:linear-gradient(90deg,#F59AB8,#D93685)"></i></div>';}}}
  else if(id==='sugar'){var v=gn('v'),fr=g('from');if(isNaN(v)||v<=0)o=miss;else o='<div class="res"><div class="big">'+(fr==='mg'?(v/18).toFixed(1)+' <small>mmol/L</small>':Math.round(v*18)+' <small>mg/dL</small>')+'</div><p>'+(fr==='mg'?v+' mg/dL':v+' mmol/L')+'</p></div>';}
  }catch(err){o='<div class="empty small">'+T_('Please check your entries.')+'</div>';}
  box.innerHTML=o;
}
function bandTable(std,active){var B=BMI_STD[std].bands,lo=null,col={info:'#3BA3F5',ok:'#22A55B',warn:'#F2A51A',warn2:'#EE6A2B',bad:'#D93636',bad2:'#A61E4D'},h='<div class="mt">';
  B.forEach(function(b,i){var rng=i===0?'&lt; '+b.max:(b.max===Infinity?'≥ '+lo:lo+' – '+f1(b.max-0.1));h+='<div class="kv band'+(i===active?' on':'')+'"><span><i style="background:'+col[b.c]+'"></i>'+esc(t(b.n))+'</span><b>'+rng+'</b></div>';lo=b.max;});
  return h+'</div>';}

/* =====================================================================
   MORE: profile hub, people, records, SOS, settings, guide, about, backup
   ===================================================================== */
function vMore(){
  var map={family:vFamily,account:vAccount,notify:vNotify,settings:vSettings,sos:vSOS,records:vRecords,guide:vGuide,about:vAbout,sync:vSync};
  if(R.sub&&map[R.sub])return map[R.sub]();
  var p=P(),a=ageOf(p.dob),h='<div class="stack"><div><div class="h1">'+esc(t('Profile'))+'</div><p class="sub">'+esc(t('Family, health records and settings.'))+'</p></div>';
  h+='<section class="card"><div class="row"><span class="av lg" style="background:'+esc(p.color||'#1877F2')+'">'+esc((p.name||'?').trim().charAt(0).toUpperCase()||'?')+'</span><div style="flex:1;min-width:0"><b style="font-size:20px">'+esc(pname(p))+'</b><div class="small muted">'+[a!=null?t('{n} yrs',{n:a}):'',p.sex?t(p.sex==='male'?'Male':'Female'):'',p.height?p.height+' cm':'',p.blood].filter(Boolean).map(esc).join(' · ')+'</div></div><button class="btn s sm" data-act="editPerson">'+esc(t('Edit'))+'</button></div></section>';
  h+='<section class="card"><h2>'+esc(t('People'))+' <button class="btn p sm" data-act="addPerson">+ '+esc(t('Add'))+'</button></h2><ul class="list">'+live('people').map(function(x){
    return '<li><button class="navrow" data-act="switchTo" data-id="'+x.id+'"><span class="av" style="background:'+esc(x.color||'#1877F2')+'">'+esc((x.name||'?').trim().charAt(0).toUpperCase()||'?')+'</span><div class="main"><b>'+esc(pname(x))+(x.id===DB.me?' <span class="tag c-info">'+esc(t('Me'))+'</span>':'')+'</b><span>'+esc(x.id===DB.active?t('Viewing now'):t('Tap to switch'))+(x.circle?' · 👨‍👩‍👧 '+esc(Cloud.circleName(x.circle)):'')+'</span></div><span class="chev">›</span></button></li>';}).join('')+'</ul></section>';
  h+='<section class="card"><ul class="list">'+
    navItem('go','👨‍👩‍👧','Family & caregivers',Cloud.user?t('{n} family groups',{n:Cloud.circles.length}):t('Share with family, get missed-dose alerts'),'family')+
    navItem('go','🔔','Alarms & notifications',DB.settings.push.on?t('On'):t('Set up medicine alarms'),'notify')+
    navItem('go','🆘','Emergency card','Medical ID, contacts, hotlines','sos')+
    navItem('go','📋','Health records','Vaccines, lab results, conditions','records')+
    navItem('go','⌚','Connect watch & sync','Apple Watch, Apple Health, other watches','sync')+
    navItem('printCard','🖨️','Doctor summary','Print or save as PDF for your visit')+'</ul></section>';
  h+='<section class="card"><ul class="list">'+navItem('go','⚙️','Settings','Language, text size, simple mode, sound','settings')+navItem('go','📚','Healthy living guide','Eating, activity, sleep, check-ups','guide')+
    navItem('go','👤','Account',Cloud.user?Cloud.user.email:t('Sign in to sync and share'),'account')+navItem('go','ℹ️','About the app','Nutrition guidance & developer','about')+'</ul></section>';
  h+='<footer class="f2">'+esc(t('My Health'))+' v'+VERSION+' · '+esc(t('Developed by Ashen Wijesingha'))+'<br>'+esc(t('Not a medical device. In an emergency call 1990.'))+'</footer></div>';
  return h;
}
function navItem(act,em,ti,d,sub){return '<li><button class="navrow" data-act="'+act+'"'+(sub?' data-tab="more" data-sub="'+sub+'"':'')+'><span class="em">'+em+'</span><div class="main"><b>'+esc(t(ti))+'</b><span>'+esc(t(d))+'</span></div><span class="chev">›</span></button></li>';}
function back(label){return '<button class="btn s sm" data-act="go" data-tab="more">‹ '+esc(t(label||'Profile'))+'</button>';}

/* ---------- Person form ---------- */
function personForm(p,isNew){
  var h=field({k:'name',l:'Name',val:p.name,ph:'e.g. Amma, Thaththa, Me'})+
  '<div class="grid2">'+field({k:'sex',l:'Sex',type:'select',val:p.sex,opts:{'':'—',female:'Female',male:'Male'}})+field({k:'dob',l:'Date of birth',type:'date',val:p.dob})+'</div>'+
  '<div class="grid2">'+field({k:'height',l:'Height',u:'cm',num:true,val:p.height,ph:'160'})+field({k:'blood',l:'Blood group',type:'select',val:p.blood,raw:true,opts:{'':'?','A+':'A+','A−':'A−','B+':'B+','B−':'B−','AB+':'AB+','AB−':'AB−','O+':'O+','O−':'O−'}})+'</div>';
  if(Cloud.user&&Cloud.circles.length){var co={'':t('Only this phone')};Cloud.circles.forEach(function(c){co[c.id]=c.name;});h+=field({k:'circle',l:'Share with family group',type:'select',raw:true,val:p.circle||'',opts:co,hint:'Family members can see and manage this person\'s medicines and readings.'});}
  if(isNew)return h+field({k:'isme',l:'Who is this?',type:'select',val:'0',opts:{'0':'A family member I care for','1':'This is me'}});
  h+=field({k:'allergies',l:'Allergies',val:p.allergies,ph:'e.g. Penicillin, peanuts'})+field({k:'conditions',l:'Medical conditions',val:p.conditions,ph:'e.g. Type 2 diabetes, asthma'})+field({k:'notes',l:'Other medical notes',type:'textarea',val:p.notes,ph:'Surgeries, pregnancy, implants…'})+
  '<div class="grid2">'+field({k:'doctor',l:'Family doctor',val:p.doctor,ph:'Dr. …'})+field({k:'doctorPhone',l:'Doctor phone',type:'tel',val:p.doctorPhone,ph:'07X XXX XXXX'})+'</div><div class="lbl2">'+esc(t('Emergency contacts'))+'</div>';
  for(var i=0;i<3;i++){var c=p.contacts[i]||{};h+='<div class="grid2">'+field({k:'cn'+i,l:'Name {n}',val:c.name}).replace('{n}',i+1)+field({k:'cr'+i,l:'Relationship',val:c.rel,ph:'e.g. Son'})+'</div>'+field({k:'cp'+i,l:'Phone',type:'tel',val:c.phone,ph:'07X XXX XXXX'});}
  h+='<div class="lbl2">'+esc(t('Goals & reminders'))+'</div><div class="grid2">'+field({k:'waterGoal',l:'Water goal',u:'ml',num:true,val:p.waterGoal})+field({k:'glass',l:'Glass size',u:'ml',num:true,val:p.glass})+'</div>'+
  '<div class="grid2">'+field({k:'stepGoal',l:'Daily step goal',num:true,val:p.stepGoal})+field({k:'missAfter',l:'Alert family if dose not taken within',type:'select',val:String(p.missAfter||30),opts:{'15':'15 min','30':'30 min','45':'45 min','60':'1 hour','120':'2 hours'}})+'</div>'+
  field({k:'cutoff',l:'BMI cut-offs',type:'select',val:p.cutoff,opts:{asia:'Asian (recommended for Sri Lanka)',who:'WHO International'}})+
  field({k:'color',l:'Colour',type:'select',raw:true,val:p.color||'#1877F2',opts:{'#1877F2':'🔵','#22A55B':'🟢','#D93636':'🔴','#F2A51A':'🟡','#7A5AF8':'🟣','#EE6A2B':'🟠'}})+
  (live('people').length>1?'<button type="button" class="btn d full mb" data-act="delPerson" data-id="'+p.id+'">🗑️ '+esc(t('Remove {n}',{n:pname(p)}))+'</button>':'');
  return h;
}
function readPerson(d,p,isNew){
  if(!d.name)return t('Please enter a name.');
  var h=d.height===''?'':pnum(d.height);if(h!==''&&(isNaN(h)||h<40||h>250))return t('Height should be between 40 and 250 cm.');
  if(d.dob){var dd=parseDay(d.dob);if(!dd||dd>new Date())return t('Date of birth cannot be in the future.');}
  p.name=d.name.slice(0,40);p.sex=d.sex;p.dob=d.dob;p.height=h===''?'':r1(h);p.blood=d.blood;
  if(d.circle!==undefined){var nc=d.circle||null;if(nc!==p.circle){Cloud.moveTo(p,nc);}}
  if(isNew)return;
  p.allergies=d.allergies.slice(0,200);p.conditions=d.conditions.slice(0,200);p.notes=d.notes.slice(0,500);p.doctor=d.doctor.slice(0,60);p.doctorPhone=d.doctorPhone.slice(0,20);
  for(var i=0;i<3;i++)p.contacts[i]={name:d['cn'+i].slice(0,40),rel:d['cr'+i].slice(0,30),phone:d['cp'+i].slice(0,20)};
  var wg=pnum(d.waterGoal);p.waterGoal=wg>=500&&wg<=6000?Math.round(wg):2000;var gl=pnum(d.glass);p.glass=gl>=50&&gl<=1000?Math.round(gl):250;
  var sg=pnum(d.stepGoal);p.stepGoal=sg>=500&&sg<=50000?Math.round(sg):8000;p.missAfter=+d.missAfter||30;p.cutoff=d.cutoff==='who'?'who':'asia';p.color=d.color||'#1877F2';
}
function editPerson(){var p=P();openSheet(t('Edit profile'),personForm(p),function(d){var e=readPerson(d,p);if(e)return e;put('people',p);toast(t('Profile saved'));view(true);});}
function addPerson(){var p=newPerson('');p.name='';if(Cloud.user&&Cloud.circles[0])p.circle=Cloud.circles[0].id;
  openSheet('👤 '+t('Add a person'),personForm(p,true)+'<p class="hint">'+esc(t('You can add allergies, contacts and more after saving.'))+'</p>',function(d){var e=readPerson(d,p,true);if(e)return e;put('people',p);DB.active=p.id;if(d.isme==='1')DB.me=p.id;save();toast(t('Now viewing {n}',{n:p.name}));view(true);},{ok:'Add',focus:'#f_name'});}
function switcher(){
  var h='<ul class="list">'+live('people').map(function(x){var a=ageOf(x.dob);return '<li><button class="navrow" data-act="switchTo" data-id="'+x.id+'"><span class="av" style="background:'+esc(x.color||'#1877F2')+'">'+esc((x.name||'?').trim().charAt(0).toUpperCase()||'?')+'</span><div class="main"><b>'+esc(pname(x))+(x.id===DB.active?' ✓':'')+'</b><span>'+[a!=null?t('{n} yrs',{n:a}):'',x.circle?'👨‍👩‍👧 '+Cloud.circleName(x.circle):''].filter(Boolean).map(esc).join(' · ')+'</span></div></button></li>';}).join('')+'</ul>'+
    '<button class="btn p full mt" data-act="addPerson">+ '+esc(t('Add a person'))+'</button>';
  openSheet(t('Whose health?'),h);
}

/* ---------- Health records ---------- */
var REC_CAT={vaccine:['💉','Vaccination'],lab:['🧪','Lab result'],condition:['🩺','Diagnosis / condition'],surgery:['🏥','Surgery / hospital stay'],allergy:['⚠️','Allergy'],other:['📄','Other']};
function vRecords(){
  var recs=mine('records').sort(function(a,b){return (a.date||'')<(b.date||'')?1:-1;}),h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Health records'))+'</div><p class="sub">'+esc(t('For {n}',{n:pname(P())}))+'</p></div>';
  h+='<section class="card"><h2>'+esc(t('Records'))+' <button class="btn p sm" data-act="addRecord">+ '+esc(t('Add'))+'</button></h2>';
  if(!recs.length)h+='<div class="empty"><span class="em">📋</span>'+esc(t('Keep vaccinations, lab results and past illnesses in one place.'))+'</div>';
  else{var groups={};recs.forEach(function(r){(groups[r.cat]=groups[r.cat]||[]).push(r);});
    Object.keys(REC_CAT).forEach(function(c){if(!groups[c])return;h+='<div class="lbl2">'+REC_CAT[c][0]+' '+esc(t(REC_CAT[c][1]))+'</div><ul class="list">'+groups[c].map(function(r){return '<li><button class="navrow" data-act="editRecord" data-id="'+r.id+'"><div class="main"><b>'+esc(r.name)+(r.value?' · '+esc(r.value)+(r.unit?' '+esc(r.unit):''):'')+'</b><span>'+[r.date?fDate(parseDay(r.date)):'',esc(r.notes||'')].filter(Boolean).join(' · ')+'</span></div><span class="chev">›</span></button></li>';}).join('')+'</ul>';});}
  return h+'</section></div>';
}
function recForm(r){r=r||{cat:'lab',name:'',date:dKey(),value:'',unit:'',notes:''};
  return field({k:'cat',l:'Type',type:'select',val:r.cat,opts:Object.keys(REC_CAT).reduce(function(o,k){o[k]=REC_CAT[k][1];return o;},{})})+field({k:'name',l:'Name',val:r.name,ph:'e.g. HbA1c, Tetanus, Cholesterol'})+
  '<div class="grid2">'+field({k:'value',l:'Result (optional)',val:r.value,ph:'e.g. 6.8'})+field({k:'unit',l:'Unit',val:r.unit,ph:'e.g. %'})+'</div>'+field({k:'date',l:'Date',type:'date',val:r.date})+field({k:'notes',l:'Notes',type:'textarea',val:r.notes,ph:'Hospital, doctor, next due date…'});}
function readRec(d,r){if(!d.name)return t('Please enter a name.');r.cat=d.cat;r.name=d.name.slice(0,80);r.value=d.value.slice(0,30);r.unit=d.unit.slice(0,20);r.date=d.date;r.notes=(d.notes||'').slice(0,500);}
function addRecord(){openSheet('📋 '+t('Add record'),recForm(),function(d){var r={id:uid(),pid:P().id};var e=readRec(d,r);if(e)return e;put('records',r);toast(t('Saved'));view(true);});}
function editRecord(id){var r=byId('records',id);if(!r)return;openSheet(t('Edit record'),recForm(r),function(d){var e=readRec(d,r);if(e)return e;put('records',r);toast(t('Saved'));view(true);},{del:true,onDel:function(){del('records',r);toast(t('Deleted'));view(true);}});}

/* ---------- SOS ---------- */
var HOTLINES=[['🚑','Ambulance (Suwa Seriya)','1990'],['👮','Police emergency','119'],['🚒','Fire & rescue','110'],['🌊','Disaster management','117'],['🧠','Mental health helpline (NIMH)','1926'],['🏥','National Hospital Accident Service','0112691111','011 269 1111']];
function vSOS(){
  var p=P(),a=ageOf(p.dob),meds=mine('meds').filter(function(m){return !m.paused&&!(m.end&&m.end<dKey());});
  var h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Emergency'))+'</div><p class="sub">'+esc(t('Show this card to first responders.'))+'</p></div>';
  h+='<div class="grid2"><a class="btn d big" href="tel:1990">🚑 '+esc(t('Call 1990'))+'</a><button class="btn p big" data-act="shareLocation">📍 '+esc(t('Send location'))+'</button></div>';
  h+='<section class="ecard"><div class="t">✚ '+esc(t('Medical ID'))+'</div><div class="n">'+esc(pname(p))+'</div><div class="g"><div><small>'+esc(t('Age'))+'</small><b>'+(a!=null?esc(t('{n} yrs',{n:a})):'—')+'</b></div><div><small>'+esc(t('Blood group'))+'</small><b>'+esc(p.blood||'—')+'</b></div>'+
    '<div><small>'+esc(t('Sex'))+'</small><b>'+(p.sex?esc(t(p.sex==='male'?'Male':'Female')):'—')+'</b></div><div><small>'+esc(t('Height / weight'))+'</small><b>'+(p.height?esc(p.height)+' cm':'—')+' / '+(isNaN(latestWeight())?'—':f1(latestWeight())+' kg')+'</b></div></div></section>';
  h+='<section class="card"><h2>'+esc(t('Medical details'))+' <button class="link" data-act="editPerson">'+esc(t('Edit'))+'</button></h2><div class="alert c-bad"><b>⚠️ '+esc(t('Allergies'))+':</b> '+esc(p.allergies||t('None recorded'))+'</div>'+
    kv(esc(t('Conditions')),esc(p.conditions||t('None recorded')))+kv(esc(t('Medicines')),meds.length?meds.map(function(m){return esc(m.name+(m.dose?' '+m.dose:''));}).join(', '):esc(t('None')))+(p.notes?kv(esc(t('Notes')),esc(p.notes)):'')+
    (p.doctor?kv(esc(t('Doctor')),esc(p.doctor)+(p.doctorPhone?' · <a href="tel:'+esc(p.doctorPhone.replace(/[^\d+]/g,''))+'">'+esc(p.doctorPhone)+'</a>':'')):'')+'</section>';
  var cs=p.contacts.filter(function(c){return c.phone;});
  h+='<section class="card"><h2>'+esc(t('Emergency contacts'))+' <button class="link" data-act="editPerson">'+esc(t('Edit'))+'</button></h2>'+(cs.length?'<div class="calls">'+cs.map(function(c){return '<a class="call" href="tel:'+esc(c.phone.replace(/[^\d+]/g,''))+'"><span class="em">📞</span><div><b>'+esc(c.name||t('Contact'))+'</b><div class="small muted">'+esc(c.rel||'')+'</div></div><span class="num blue">'+esc(c.phone)+'</span></a>';}).join('')+'</div>':'<div class="empty">'+esc(t('No emergency contacts yet.'))+'<br><button class="btn s sm mt" data-act="editPerson">'+esc(t('Add contacts'))+'</button></div>')+'</section>';
  h+='<section class="card"><h2>'+esc(t('Sri Lanka emergency numbers'))+'</h2><div class="calls">'+HOTLINES.map(function(x){return '<a class="call" href="tel:'+x[2]+'"><span class="em">'+x[0]+'</span><b>'+esc(t(x[1]))+'</b><span class="num">'+(x[3]||x[2])+'</span></a>';}).join('')+'</div></section>';
  h+='<section class="card art"><h2>'+esc(t('Act fast — warning signs'))+'</h2>'+FIRSTAID.map(function(x){return '<h3>'+x[0]+' '+esc(t(x[1]))+'</h3><p>'+esc(t(x[2]))+'</p>';}).join('')+'</section>';
  h+='<button class="btn s full" data-act="printCard">🖨️ '+esc(t('Print / save medical summary'))+'</button></div>';
  return h;
}
var FIRSTAID=[['🧠','Stroke — think BE FAST','Balance loss, Eyes (sudden vision loss), Face drooping, Arm weakness, Speech slurred: Time to call 1990. Note the time symptoms started.'],
  ['💔','Heart attack','Chest pain or pressure that may spread to the arm, jaw or back, with breathlessness, sweating or nausea. Call 1990, sit the person down, do not let them drive.'],
  ['🩸','Low blood sugar','Shaky, sweaty, confused or pale. If awake and able to swallow, give fast sugar (3 tsp sugar in water or half a glass of fruit juice) and re-check after 15 minutes. If unconscious, call 1990 and give nothing by mouth.'],
  ['🦟','Dengue warning signs','Especially as the fever settles (days 3–7): severe tummy pain, repeated vomiting, bleeding gums or nose, very tired or restless, passing little urine. Go to hospital immediately. For fever use paracetamol only — avoid ibuprofen, aspirin and other NSAIDs.'],
  ['🤧','Severe allergic reaction','Swelling of lips, face or tongue, wheezing, difficulty breathing, faintness. Use an adrenaline auto-injector if prescribed and call 1990.'],
  ['🧓','Falls in older adults','Do not lift the person quickly. Check for pain, bleeding or confusion. If they hit their head, cannot get up, or are on blood thinners, call 1990.']];
function shareLocation(){
  var p=P(),cs=(p.contacts||[]).filter(function(c){return c.phone;});
  var send=function(link){var msg=t('I need help. My location: {l}',{l:link})+' — '+pname(p);
    if(cs.length){var nums=cs.map(function(c){return c.phone.replace(/[^\d+]/g,'');}).join(',');var sep=isIOS()?'&':'?';
      openSheet('📍 '+t('Send location'),'<p class="lead">'+esc(msg)+'</p><div class="calls">'+cs.map(function(c){var n=c.phone.replace(/[^\d+]/g,'');return '<a class="call" href="sms:'+esc(n)+sep+'body='+encodeURIComponent(msg)+'"><span class="em">💬</span><b>'+esc(c.name||c.phone)+'</b><span class="num blue">SMS</span></a><a class="call" target="_blank" rel="noopener" href="https://wa.me/'+esc(n.replace(/^0/,'94').replace(/^\+/,''))+'?text='+encodeURIComponent(msg)+'"><span class="em">🟢</span><b>WhatsApp · '+esc(c.name||c.phone)+'</b></a>';}).join('')+'</div><button class="btn s full mt" data-act="shareMsg" data-msg="'+esc(msg)+'">'+esc(t('Share another way'))+'</button>');}
    else if(!shareText(t('My location'),msg))toast(msg,6000);};
  if(!navigator.geolocation){send(t('(location unavailable)'));return;}
  toast(t('Finding your location…'),8000);
  navigator.geolocation.getCurrentPosition(function(pos){var la=pos.coords.latitude.toFixed(6),lo=pos.coords.longitude.toFixed(6);send('https://maps.google.com/?q='+la+','+lo);},
    function(){toast(t('Could not get your location. Check location permission.'),4000);send(t('(location unavailable)'));},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
}

/* ---------- Settings ---------- */
function vSettings(){
  var s=DB.settings,h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Settings'))+'</div></div>';
  h+='<section class="card"><h2>'+esc(t('Language'))+'</h2><div class="seg">'+[['en','English'],['si','සිංහල'],['ta','தமிழ்']].map(function(x){return '<button data-act="setLang" data-val="'+x[0]+'" aria-pressed="'+(LANG===x[0])+'">'+x[1]+'</button>';}).join('')+'</div></section>';
  h+='<section class="card"><h2>'+esc(t('Text size'))+'</h2><div class="seg">'+[['normal','Normal'],['large','Large'],['xlarge','Extra large']].map(function(x){return '<button data-act="setSize" data-val="'+x[0]+'" aria-pressed="'+(s.size===x[0])+'">'+esc(t(x[1]))+'</button>';}).join('')+'</div></section>';
  h+='<section class="card"><h2>'+esc(t('Simple mode'))+'</h2><p class="small muted" style="margin:0 0 10px">'+esc(t('Big buttons and only the essentials: today\'s medicines, water, blood pressure, call family and SOS. Ideal for parents and grandparents.'))+'</p><button class="btn '+(s.simple?'s':'p')+' full" data-act="toggleSimple">'+esc(t(s.simple?'Turn off simple mode':'Turn on simple mode'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('Appearance'))+'</h2><div class="seg">'+['auto','light','dark'].map(function(x){return '<button data-act="theme" data-val="'+x+'" aria-pressed="'+(s.theme===x)+'">'+esc(t({auto:'Automatic',light:'Light',dark:'Dark'}[x]))+'</button>';}).join('')+'</div></section>';
  h+='<section class="card"><h2>'+esc(t('Alarm sound'))+'</h2><div class="seg">'+[['chime','Chime'],['beep','Beep'],['off','Silent']].map(function(x){return '<button data-act="setSound" data-val="'+x[0]+'" aria-pressed="'+(s.sound===x[0])+'">'+esc(t(x[1]))+'</button>';}).join('')+'</div>'+
    '<label class="switch mt"><input type="checkbox" data-act2="vibrate"'+(s.vibrate?' checked':'')+'><span>'+esc(t('Vibrate'))+'</span></label><button class="btn s full mt" data-act="alarmTest">🔔 '+esc(t('Preview the alarm screen'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('Your data'))+'</h2><ul class="list">'+navItem('exportJson','💾','Back up all data','Download a backup file')+navItem('importJson','📥','Restore from backup','Replace data with a backup file')+navItem('exportCsv','📊','Export readings (CSV)','Open in Excel or Google Sheets')+navItem('eraseAll','🗑️','Erase this phone','Delete all data on this device')+'</ul>'+
    '<p class="hint">🔒 '+esc(t(Cloud.user?'Your data is stored on this phone and synced securely with your family group.':'Everything stays on this phone. Back up regularly.'))+(storageOK?'':' <b class="red">'+esc(t('Storage is unavailable — data will not be kept.'))+'</b>')+'</p></section>';
  if(!isStandalone())h+='<section class="card"><h2>'+esc(t('Install the app'))+'</h2><button class="btn p full" data-act="installHelp">📲 '+esc(t('Add My Health to your home screen'))+'</button></section>';
  return h+'</div>';
}
function installHelp(){
  if(window.__bip){window.__bip.prompt();window.__bip.userChoice.then(function(){window.__bip=null;view(true);});return;}
  var ios=isIOS();
  infoBox('📲 '+t('Install My Health'),'<ol class="steps">'+(ios?'<li>'+esc(t('Open this page in Safari.'))+'</li><li>'+esc(t('Tap the Share button (square with an arrow).'))+'</li><li>'+esc(t('Scroll down and tap "Add to Home Screen".'))+'</li><li>'+esc(t('Tap "Add". Open My Health from your home screen.'))+'</li>':
    '<li>'+esc(t('Open this page in Chrome.'))+'</li><li>'+esc(t('Tap the menu (⋮) at the top right.'))+'</li><li>'+esc(t('Tap "Install app" or "Add to Home screen".'))+'</li><li>'+esc(t('Open My Health from your home screen.'))+'</li>')+'</ol>'+
    (ios?'<p class="hint">'+esc(t('On iPhone, alarms when the app is closed need iOS 16.4 or newer and the app must be opened from the home screen.'))+'</p>':''));
}

/* ---------- Guide & tips ---------- */
var TIPS=[['🥗','Fill half your plate with vegetables','Mallum, gotukola and leafy greens add fibre and vitamins with few calories.'],['🚶','Walk after meals','A 10–15 minute walk after eating helps control blood sugar.'],
 ['🧂','Go easy on salt','Keep salt under one teaspoon a day — taste before you add.'],['💧','Drink water first','Thirst is often mistaken for hunger. Have a glass of water before snacks.'],
 ['🍚','Choose red rice','Red or brown rice and kurakkan keep you fuller for longer than white rice.'],['🍵','Cut sugar in tea','Reduce sugar by half a spoon each week — your taste adapts.'],
 ['😴','Protect your sleep','Aim for 7–9 hours. A regular bedtime improves energy and appetite control.'],['🐟','Eat fish twice a week','Sardines, tuna and salaya provide healthy omega-3 fats.'],
 ['🍌','Fruit over juice','Whole fruit has fibre that juice loses.'],['🧘','Take a breathing break','Slow breathing for 2 minutes can lower stress and blood pressure.'],
 ['🥜','Smart snacks','A handful of peanuts, gram or a fruit beats biscuits and short eats.'],['📏','Watch your waist','Waist under 80 cm (women) or 90 cm (men) lowers heart and diabetes risk.'],
 ['💊','Never double a missed dose','If you miss a dose, check the leaflet or ask your pharmacist — do not take two at once unless told to.'],['🧓','Prevent falls','Good lighting, non-slip mats and a night light help older adults stay safe at home.']];
var GUIDE=[['🍛','The healthy plate','Half the plate: vegetables, greens (mallum) and fruit. A quarter: whole grains such as red rice or kurakkan. A quarter: protein — fish, dhal, eggs, chicken, soya or chickpeas. Prefer boiled, steamed or curried food over deep-fried.'],
  ['🧂','Salt, sugar & fat','Keep salt under 5 g a day (about 1 teaspoon) — watch pickles, dried fish, papadam and instant noodles. Limit sugary tea, soft drinks and sweets. Choose fruit over juice.'],
  ['💧','Water','Most adults need about 2–3 litres a day, more in hot weather or with exercise. Pale-yellow urine is a good sign.'],
  ['🚶','Activity','Aim for at least 150 minutes of moderate activity each week (for example 30 minutes of brisk walking, 5 days) plus muscle-strengthening twice a week. Break up long sitting.'],
  ['😴','Sleep','Adults need 7–9 hours. Keep regular times and avoid screens and caffeine late in the evening.'],
  ['💊','Taking medicines safely','Take medicines at the same times each day. Keep an up-to-date list and show it to every doctor. Do not stop a medicine without advice. Store medicines away from heat and out of reach of children.'],
  ['🩺','Regular check-ups','Blood pressure at least once a year. Blood sugar and cholesterol as advised — especially if overweight, over 35, or diabetes runs in the family. Eyes, teeth and feet (if diabetic) every year.'],
  ['🧠','Mind','Talk to someone you trust when stressed. The National Institute of Mental Health helpline 1926 is free and confidential.']];
function vGuide(){return '<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Healthy living'))+'</div><p class="sub">'+esc(t('Simple everyday guidance.'))+'</p></div><section class="card art">'+GUIDE.map(function(x){return '<h3>'+x[0]+' '+esc(t(x[1]))+'</h3><p>'+esc(t(x[2]))+'</p>';}).join('')+'</section>'+creditCard()+'</div>';}

/* ---------- About ---------- */
function creditCard(bare){var c='<div class="credit"><div class="av2 green">GD</div><div><span>'+esc(t('Nutrition guidance by'))+'</span><b>Gayathri Dissanayaka</b><span>'+esc(t('Registered Dietitian & Nutritionist'))+'<br>SLMC Reg No. 148 &amp; 375</span></div></div>';return bare?c:'<section class="card">'+c+'</section>';}
function vAbout(){
  return '<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('About the app'))+'</div><p class="sub">'+esc(t('My Health'))+' · '+esc(t('Version'))+' '+VERSION+'</p></div>'+
  '<section class="card center"><img src="icons/icon-192.png" alt="" width="76" height="76" class="appicon"><b style="font-size:22px;display:block;margin-top:8px">'+esc(t('My Health'))+'</b><p class="muted">'+esc(t('Your personal & family health companion — medicines with alarms, readings, family caregiving and emergency details in one place.'))+'</p></section>'+
  '<section class="card"><h2>'+esc(t('Nutrition guidance'))+'</h2>'+creditCard(true)+'<p class="small muted mt">'+esc(t('Healthy-eating guidance, tips and nutrition calculators in this app are provided under the guidance of Gayathri Dissanayaka. For a personalised diet plan, please consult your dietitian.'))+'</p></section>'+
  '<section class="card"><h2>'+esc(t('Developer'))+'</h2><div class="credit"><div class="av2">AW</div><div><span>'+esc(t('Designed & developed by'))+'</span><b>Ashen Wijesingha</b><span>'+esc(t('Developer · Cyber Security Analyst'))+'</span></div></div><a class="btn s full mt" href="https://github.com/AshenWijesingha" target="_blank" rel="noopener">GitHub · @AshenWijesingha</a></section>'+
  '<section class="card"><h2>'+esc(t('Privacy'))+'</h2><p class="pm">🔒 '+esc(t('Your data is stored on your phone. If you sign in, it is synced securely and only shared with the family groups you choose. Nothing is sold or used for advertising.'))+'</p></section>'+
  '<section class="card"><h2>'+esc(t('Disclaimer'))+'</h2><p class="pm">'+esc(t('My Health is for personal record-keeping and general health information. It is not a medical device and does not diagnose or treat any condition. Always follow the advice of your doctor or dietitian. In an emergency call 1990.'))+'</p></section>'+
  '<p class="small muted center">© '+new Date().getFullYear()+' Ashen Wijesingha · '+esc(t('Made in Sri Lanka'))+' 🇱🇰</p></div>';
}

/* ---------- Print summary ---------- */
function printSummary(){
  var p=P(),a=ageOf(p.dob),meds=mine('meds').filter(function(m){return !m.paused;}),row=function(k,v){return '<tr><th style="width:35%">'+esc(t(k))+'</th><td>'+v+'</td></tr>';},ad=adherence(p.id,30);
  var h='<h1>'+esc(t('Medical summary'))+' — '+esc(pname(p))+'</h1><div>'+esc(t('Prepared'))+' '+fDate(new Date())+' · '+esc(t('My Health'))+'</div><h2>'+esc(t('Personal details'))+'</h2><table>'+
   row('Age',(a!=null?esc(t('{n} yrs',{n:a})):'—')+(p.dob?' ('+fDate(parseDay(p.dob))+')':''))+row('Sex',esc(p.sex?t(p.sex==='male'?'Male':'Female'):'—'))+row('Blood group',esc(p.blood||'—'))+row('Height',p.height?esc(p.height)+' cm':'—')+
   row('Allergies','<b>'+esc(p.allergies||t('None recorded'))+'</b>')+row('Conditions',esc(p.conditions||t('None recorded')))+row('Notes',esc(p.notes||'—'))+row('Family doctor',esc((p.doctor||'—')+(p.doctorPhone?' · '+p.doctorPhone:'')))+
   row('Emergency contacts',p.contacts.filter(function(c){return c.phone;}).map(function(c){return esc(c.name+' ('+c.rel+') '+c.phone);}).join('<br>')||'—')+'</table>';
  h+='<h2>'+esc(t('Current medicines'))+'</h2>'+(meds.length?'<table><tr><th>'+esc(t('Medicine'))+'</th><th>'+esc(t('Dose'))+'</th><th>'+esc(t('When'))+'</th><th>'+esc(t('For'))+'</th></tr>'+meds.map(function(m){return '<tr><td>'+esc(m.name)+'</td><td>'+esc(m.dose)+'</td><td>'+esc(freqText(m))+(m.freq!=='prn'?' · '+esc((m.times||[]).join(', ')):'')+' · '+esc(t(FOOD[m.food]||''))+'</td><td>'+esc(m.purpose||'')+'</td></tr>';}).join('')+'</table>'+(ad.tot?'<p>'+esc(t('Adherence (30 days)'))+': <b>'+ad.pct+'%</b> ('+ad.ok+'/'+ad.tot+')</p>':''):'<p>'+esc(t('None recorded.'))+'</p>');
  h+='<h2>'+esc(t('Recent readings'))+'</h2><table><tr><th>'+esc(t('Measure'))+'</th><th>'+esc(t('Latest'))+'</th><th>'+esc(t('Date'))+'</th><th>'+esc(t('Status'))+'</th></tr>';
  TYPE_ORDER.forEach(function(ty){if(ty==='water')return;var L=logsOf(ty);if(!L.length)return;var e=L[L.length-1],T=TYPES[ty],c=T.cls(e.v);h+='<tr><td>'+esc(t(T.n))+'</td><td>'+T.show(e.v).replace(/<[^>]+>/g,'')+'</td><td>'+fDate(parseDT(e.t))+'</td><td>'+(c?esc(t(c.n,c.vars)):'')+'</td></tr>';});
  h+='</table>';
  [['bp','Blood pressure'],['sugar','Blood sugar']].forEach(function(x){var L=logsOf(x[0]).slice(-10);if(L.length<2)return;h+='<h2>'+esc(t(x[1]))+'</h2><table>'+L.reverse().map(function(e){return '<tr><td>'+fDate(parseDT(e.t))+' '+fTime(parseDT(e.t))+'</td><td>'+TYPES[x[0]].show(e.v).replace(/<[^>]+>/g,'')+'</td><td>'+esc(TYPES[x[0]].sub?TYPES[x[0]].sub(e.v):'')+'</td></tr>';}).join('')+'</table>';});
  var recs=mine('records');if(recs.length)h+='<h2>'+esc(t('Health records'))+'</h2><table>'+recs.map(function(r){return '<tr><td>'+esc(t(REC_CAT[r.cat]?REC_CAT[r.cat][1]:'Other'))+'</td><td>'+esc(r.name)+(r.value?' · '+esc(r.value+' '+(r.unit||'')):'')+'</td><td>'+(r.date?fDate(parseDay(r.date)):'')+'</td></tr>';}).join('')+'</table>';
  h+='<div class="foot">'+esc(t('Self-recorded data for discussion with a healthcare professional. Not a diagnosis.'))+'</div>';
  $('#print').innerHTML=h;setTimeout(function(){window.print();},120);
}

/* ---------- Backup ---------- */
function exportJson(){var c=JSON.parse(JSON.stringify(DB));delete c.cloud;download('my-health-backup-'+dKey()+'.json',JSON.stringify(c,null,1),'application/json');toast(t('Backup downloaded'));}
function exportCsv(){var rows=[['Date','Time','Measure','Value','Value 2','Extra','Context','Note','Source']];
  mine('logs').sort(function(a,b){return a.t<b.t?-1:1;}).forEach(function(e){var d=parseDT(e.t);rows.push([dKey(d),hhmm(d),TYPES[e.type]?TYPES[e.type].n:e.type,e.type==='bp'?e.v.s:e.v.v,e.type==='bp'?e.v.d:(e.v.min||''),e.v.p||e.v.max||e.v.name||'',SUGAR_CTX[e.v.ctx]||'',e.note||'',e.src||'']);});
  mine('doses').forEach(function(d){var m=byId('meds',d.med);rows.push([d.date,d.time,'Medicine dose',m?m.name:'',d.status,'','','',d.by==='notification'?'notification':'']);});
  if(rows.length<2){toast(t('No readings to export yet'));return;}
  var csv=rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',');}).join('\r\n');
  download('health-'+(P().name||'me').replace(/\W+/g,'-').toLowerCase()+'-'+dKey()+'.csv','﻿'+csv,'text/csv');toast(t('CSV downloaded'));}
function importJson(file){var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);var ok=d&&(Array.isArray(d.people)||Array.isArray(d.profiles));if(!ok)throw 0;
    confirmBox(t('Replace all data on this phone with this backup?'),'Restore',function(){if(Array.isArray(d.profiles)){localStorage.setItem('myhealth.v1',JSON.stringify(d));localStorage.removeItem(KEY);}else{d.cloud={cursor:null,attached:{}};COLLS.forEach(function(c){(d[c]||[]).forEach(function(x){x._dirty=1;x._u=Date.now();});});localStorage.setItem(KEY,JSON.stringify(d));}
      load();applyPrefs();save(true);toast(t('Backup restored'));Cloud.soon();go('home');},false);}catch(e){toast(t('That file is not a valid My Health backup'));}};r.readAsText(file);}

/* =====================================================================
   CLOUD: auth, family groups, sync, push alarms
   ===================================================================== */
var Cloud={sb:null,user:null,circles:[],members:{},syncing:false,pending:false,lastErr:null,timer:null,channel:null,
  init:function(){
    var self=this;
    if(!self.supabaseOk())return;
    try{this.sb=supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'mh-auth',flowType:'implicit'}});}catch(e){console.error(e);return;}
    this.sb.auth.onAuthStateChange(function(ev,session){
      var prev=self.user&&self.user.id;self.user=session?session.user:null;
      if(ev==='PASSWORD_RECOVERY')setTimeout(newPasswordSheet,400);
      if(self.user&&self.user.id!==prev)setTimeout(function(){self.afterLogin();},0);
      if(!self.user&&prev){self.circles=[];self.members={};self.unsub();view(true);}
      updateCloudDot();
    });
    window.addEventListener('online',function(){self.soon(300);});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)self.soon(400);});
    setInterval(function(){if(self.user&&!document.hidden)self.sync();},60000);
  },
  supabaseOk:function(){return !!(self.supabase&&CFG.supabaseUrl&&CFG.supabaseKey);},
  status:function(){if(!this.user)return 'off';if(this.syncing)return 'sync';if(this.lastErr||!navigator.onLine)return 'err';return 'ok';},
  circleName:function(id){var c=this.circles.filter(function(x){return x.id===id;})[0];return c?c.name:t('Family');},
  myName:function(){var u=this.user;return (u&&u.user_metadata&&u.user_metadata.name)||pname(personOf(DB.me))||(u&&u.email||'').split('@')[0];},
  afterLogin:function(){var self=this;
    return this.loadCircles().then(function(){
      if(!self.circles.length){onboardFamily();return;}
      self.subscribe();return self.sync().then(function(){Push.refresh();var j=pendingJoin();if(j)joinSheet(j);});
    }).catch(function(e){self.lastErr=e;console.error(e);}).then(function(){view(true);});},
  loadCircles:function(){var self=this;
    return this.sb.from('circles').select('id,name,owner,created_at').order('created_at').then(function(r){if(r.error)throw r.error;self.circles=r.data||[];
      return self.sb.from('circle_members').select('circle_id,user_id,display_name,role,joined_at');}).then(function(m){if(m.error)throw m.error;self.members={};(m.data||[]).forEach(function(x){(self.members[x.circle_id]=self.members[x.circle_id]||[]).push(x);});
      // people whose circle no longer exists → keep locally only
      live('people').forEach(function(p){if(p.circle&&!self.circles.some(function(c){return c.id===p.circle;})){p.circle=null;}});save();});},
  createCircle:function(name){var self=this;return this.sb.rpc('create_circle',{p_name:name,p_display:this.myName()}).then(function(r){if(r.error)throw r.error;return self.loadCircles().then(function(){self.subscribe();return r.data;});});},
  join:function(code){var self=this;return this.sb.rpc('join_circle',{p_code:code,p_display:this.myName()}).then(function(r){if(r.error)throw r.error;return self.loadCircles().then(function(){self.subscribe();return self.sync(true);}).then(function(){return r.data;});});},
  invite:function(cid){return this.sb.rpc('create_invite',{p_circle:cid}).then(function(r){if(r.error)throw r.error;return r.data;});},
  leave:function(cid){var self=this;return this.sb.rpc('leave_circle',{p_circle:cid}).then(function(r){if(r.error)throw r.error;live('people').forEach(function(p){if(p.circle===cid)p.circle=null;});save();return self.loadCircles();});},
  attachAll:function(cid){var self=this;live('people').forEach(function(p){if(!p.circle&&(p.name||mine('meds',p.id).length||mine('logs',p.id).length))self.moveTo(p,cid);});
    live('people').forEach(function(p){if(!p.circle&&!p.name&&!mine('meds',p.id).length&&!mine('logs',p.id).length&&live('people').length>1){var i=DB.people.indexOf(p);DB.people.splice(i,1);}});
    if(!byId('people',DB.active))DB.active=live('people')[0].id;if(!byId('people',DB.me))DB.me=DB.active;save();},
  moveTo:function(p,cid){var old=p.circle,now=Date.now();
    COLLS.forEach(function(c){DB[c].forEach(function(x){if(x.pid!==p.id&&!(c==='people'&&x.id===p.id))return;if(old&&!cid)x._unshare=old;x._dirty=1;x._u=now;});});
    p.circle=cid;save();this.soon(300);},
  row:function(x,c,cid){var d={};for(var k in x)if(k!=='id'&&k!=='pid'&&k.charAt(0)!=='_'&&k!=='circle')d[k]=x[k];return {id:x.id,circle_id:cid,kind:KIND[c],person_id:c==='people'?x.id:x.pid,data:d,deleted:!!x._del};},
  push:function(){var self=this,rows=[],items=[];
    COLLS.forEach(function(c){DB[c].forEach(function(x){if(!x._dirty)return;var per=c==='people'?x:personOf(x.pid);
      if(x._unshare){rows.push({id:x.id,circle_id:x._unshare,kind:KIND[c],person_id:c==='people'?x.id:x.pid,data:{},deleted:true});items.push([c,x,x._u]);}
      else if(per&&per.circle){rows.push(self.row(x,c,per.circle));items.push([c,x,x._u]);}
      else{delete x._dirty;if(x._del){var i=DB[c].indexOf(x);if(i>=0)DB[c].splice(i,1);}}});});
    if(!rows.length)return Promise.resolve(0);
    var chunks=[];for(var i=0;i<rows.length;i+=200)chunks.push([rows.slice(i,i+200),items.slice(i,i+200)]);
    return chunks.reduce(function(pr,ch){return pr.then(function(){return self.sb.from('records').upsert(ch[0],{onConflict:'id'}).then(function(r){if(r.error)throw r.error;
      ch[1].forEach(function(it){var x=it[1];if(x._u===it[2]){delete x._dirty;delete x._unshare;if(x._del){var j=DB[it[0]].indexOf(x);if(j>=0)DB[it[0]].splice(j,1);}}});save();});});},Promise.resolve()).then(function(){return rows.length;});},
  pull:function(){var self=this,changed=0;
    var page=function(){var q=self.sb.from('records').select('*').order('updated_at',{ascending:true}).limit(1000);
      if(DB.cloud.cursor)q=q.gt('updated_at',new Date(Date.parse(DB.cloud.cursor)-10000).toISOString());
      return q.then(function(r){if(r.error)throw r.error;var rows=r.data||[];
        rows.forEach(function(row){if(self.apply(row))changed++;if(!DB.cloud.cursor||row.updated_at>DB.cloud.cursor)DB.cloud.cursor=row.updated_at;});
        if(rows.length===1000&&rows[rows.length-1].updated_at!==rows[0].updated_at)return page();});};
    return page().then(function(){
      if(!byId('people',DB.active)||byId('people',DB.active)._del)DB.active=live('people')[0]?live('people')[0].id:DB.active;
      save();return changed;});},
  apply:function(row){
    var c=COLL_OF[row.kind];if(!c)return false;var local=byId(c,row.id),srvU=Date.parse(row.updated_at);
    if(local&&local._dirty&&local._u>srvU)return false;
    if(local&&!local._dirty&&local._srv===row.updated_at)return false;
    if(row.deleted){if(local){DB[c].splice(DB[c].indexOf(local),1);return true;}return false;}
    var o={};for(var k in row.data)o[k]=row.data[k];o.id=row.id;o.pid=row.person_id;o._u=srvU;o._srv=row.updated_at;
    if(c==='people'){o.circle=row.circle_id;o.pid=row.id;var d=newPerson();for(var k2 in d)if(o[k2]===undefined)o[k2]=d[k2];}
    if(local){Object.keys(local).forEach(function(k){delete local[k];});Object.assign(local,o);}else DB[c].push(o);
    return true;},
  sync:function(force){var self=this;
    if(!this.user||!this.sb)return Promise.resolve();
    if(this.syncing){this.pending=true;return Promise.resolve();}
    this.syncing=true;updateCloudDot();
    return this.push().then(function(){return self.pull();}).then(function(n){self.lastErr=null;if(n&&!sheetOpen&&!Alarm.shown)view(true);})
      .catch(function(e){self.lastErr=e;console.warn('sync',e);})
      .then(function(){self.syncing=false;updateCloudDot();if(self.pending){self.pending=false;self.soon(500);}});},
  soon:function(ms){var self=this;if(!this.user)return;clearTimeout(this.timer);this.timer=setTimeout(function(){self.sync();},ms||1500);},
  subscribe:function(){var self=this;if(this.channel||!this.sb)return;
    try{this.channel=this.sb.channel('rec-'+uid()).on('postgres_changes',{event:'*',schema:'public',table:'records'},function(){self.soon(400);}).subscribe();}catch(e){}},
  unsub:function(){if(this.channel){try{this.sb.removeChannel(this.channel);}catch(e){}this.channel=null;}},
  fn:function(body,auth){var h={'Content-Type':'application/json','apikey':CFG.supabaseKey};var self=this;
    var go=function(tok){if(tok)h.Authorization='Bearer '+tok;return fetch(CFG.supabaseUrl+'/functions/v1/notify',{method:'POST',headers:h,body:JSON.stringify(body)}).then(function(r){return r.json();});};
    if(!auth)return go();return this.sb.auth.getSession().then(function(s){return go(s.data.session&&s.data.session.access_token);});},
  snooze:function(pk){return Push.sub().then(function(s){if(!s)return;return Cloud.fn({action:'snooze',key:pk.key,tok:pk.tok,endpoint:s.endpoint,minutes:10});}).catch(function(){});},
  signOut:function(){var self=this;return this.sb.auth.signOut().then(function(){DB.cloud={cursor:null,attached:{}};
    live('people').forEach(function(p){p.circle=null;});COLLS.forEach(function(c){DB[c].forEach(function(x){delete x._dirty;delete x._unshare;delete x._srv;});});save(true);self.user=null;view(true);});}
};
function pendingJoin(){var m=/[?&]join=([A-Za-z0-9]{6})/.exec(location.search)||(DB.cloud.join?[0,DB.cloud.join]:null);return m?m[1].toUpperCase():null;}

/* ---------- Push alarms ---------- */
function b64u8(b){var p='='.repeat((4-b.length%4)%4),s=atob((b+p).replace(/-/g,'+').replace(/_/g,'/')),o=new Uint8Array(s.length);for(var i=0;i<s.length;i++)o[i]=s.charCodeAt(i);return o;}
var Push={
  supported:function(){return 'serviceWorker' in navigator&&'PushManager' in window&&typeof Notification!=='undefined';},
  sub:function(){if(!this.supported())return Promise.resolve(null);return navigator.serviceWorker.ready.then(function(r){return r.pushManager.getSubscription();});},
  enable:function(){var self=this,s=DB.settings.push;
    if(!this.supported())return Promise.reject(new Error(isIOS()&&!isStandalone()?t('On iPhone, first add My Health to your Home Screen, then open it from there to turn on alarms.'):t('This browser does not support notifications.')));
    return Notification.requestPermission().then(function(perm){if(perm!=='granted')throw new Error(t('Notifications are blocked. Allow them in your phone settings for this app.'));
      return navigator.serviceWorker.ready;}).then(function(reg){return reg.pushManager.getSubscription().then(function(sub){return sub||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u8(CFG.vapidPublic)});});})
      .then(function(sub){s.on=true;if(!s.remind.length)s.remind=[DB.me];if(!s.missed.length)s.missed=live('people').filter(function(p){return p.id!==DB.me&&p.circle;}).map(function(p){return p.id;});save();
        live('people').forEach(function(p){if(s.remind.indexOf(p.id)>=0&&!p.circle&&Cloud.circles[0])Cloud.moveTo(p,Cloud.circles[0].id);});
        return self.save(sub).then(function(){return Cloud.sync();});});},
  save:function(sub){var s=DB.settings.push;if(!Cloud.user)return Promise.resolve();
    return (sub?Promise.resolve(sub):this.sub()).then(function(sub){if(!sub)return;var j=sub.toJSON();
      return Cloud.sb.rpc('save_push_sub',{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_remind:s.remind,p_missed:s.missed,p_water:!!s.water,p_lang:LANG,p_tz:tzName()}).then(function(r){if(r.error)throw r.error;});});},
  refresh:function(){if(DB.settings.push.on&&Cloud.user&&this.supported()&&Notification.permission==='granted')this.save().catch(function(e){console.warn(e);});},
  disable:function(){var s=DB.settings.push;s.on=false;save();return this.sub().then(function(sub){if(!sub)return;var ep=sub.endpoint;return sub.unsubscribe().then(function(){if(Cloud.user)return Cloud.sb.from('push_subs').delete().eq('endpoint',ep);});});},
  test:function(){return this.sub().then(function(sub){if(!sub)throw new Error(t('Alarms are not turned on yet.'));return Cloud.fn({action:'test',endpoint:sub.endpoint},true);}).then(function(r){if(!r||!r.sent)throw new Error((r&&r.error)||t('Could not send a test. Check your internet connection.'));return r;});}
};

/* ---------- Account screens ---------- */
function vAccount(){
  var h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Account'))+'</div></div>';
  if(!Cloud.supabaseOk())return h+'<section class="card"><p>'+esc(t('Cloud features are not configured for this copy of the app.'))+'</p></section></div>';
  if(!Cloud.user){
    h+='<section class="card"><h2>'+esc(t('Why sign in?'))+'</h2><ul class="ticks"><li>'+esc(t('Medicine alarms even when the app is closed'))+'</li><li>'+esc(t('Children can manage parents\' medicines from their own phones'))+'</li><li>'+esc(t('Get an alert if a parent misses a dose'))+'</li><li>'+esc(t('Your data is backed up and works on all your devices'))+'</li></ul><p class="hint">'+esc(t('Optional — the app works fully without an account.'))+'</p></section>';
    h+='<section class="card"><div class="grid2"><button class="btn p" data-act="signUp">'+esc(t('Create account'))+'</button><button class="btn s" data-act="signIn">'+esc(t('Sign in'))+'</button></div></section>';
    return h+'</div>';
  }
  h+='<section class="card"><div class="row"><span class="av lg">'+esc((Cloud.myName()||'?').charAt(0).toUpperCase())+'</span><div style="flex:1;min-width:0"><b style="font-size:18px">'+esc(Cloud.myName())+'</b><div class="small muted ellip">'+esc(Cloud.user.email||'')+'</div><div class="small"><span class="cdot inline '+Cloud.status()+'"></span> '+esc(t({ok:'Synced',sync:'Syncing…',err:'Offline — changes will sync later',off:''}[Cloud.status()]))+'</div></div></div>'+
    '<div class="grid2 mt"><button class="btn s" data-act="syncNow">🔄 '+esc(t('Sync now'))+'</button><button class="btn s" data-act="changePw">🔑 '+esc(t('Password'))+'</button></div></section>';
  h+='<section class="card"><ul class="list">'+navItem('go','👨‍👩‍👧','Family & caregivers','Groups, invites and members','family')+navItem('go','🔔','Alarms & notifications','Choose who gets which alerts','notify')+'</ul></section>';
  h+='<section class="card"><div class="grid2"><button class="btn s" data-act="signOut">'+esc(t('Sign out'))+'</button><button class="btn d" data-act="deleteAccount">'+esc(t('Delete account'))+'</button></div></section>';
  return h+'</div>';
}
function authErr(e){var m=String(e&&e.message||e||'');if(/invalid login/i.test(m))return t('Wrong email or password.');if(/not confirmed/i.test(m))return t('Please confirm your email first — check your inbox.');if(/already registered|already exists/i.test(m))return t('An account with this email already exists. Please sign in.');if(/rate limit/i.test(m))return t('Too many attempts. Please wait a little and try again.');if(/password/i.test(m)&&/6|short|weak/i.test(m))return t('Password must be at least 6 characters.');if(/fetch|network/i.test(m))return t('No internet connection.');return m;}
function signUpSheet(){
  openSheet(t('Create account'),field({k:'name',l:'Your name',val:pname(personOf(DB.me))===t('Me')?'':pname(personOf(DB.me)),ph:'e.g. Ashen'})+field({k:'email',l:'Email',type:'email',ph:'you@example.com'})+field({k:'pw',l:'Password',type:'password',ac:'new-password',ph:'At least 8 characters'}),
    function(d){if(!d.name)return t('Please enter your name.');if(!/^\S+@\S+\.\S+$/.test(d.email))return t('Please enter a valid email.');if((d.pw||'').length<8)return t('Password must be at least 8 characters.');
      return Cloud.sb.auth.signUp({email:d.email,password:d.pw,options:{data:{name:d.name.slice(0,40)},emailRedirectTo:location.origin+location.pathname}}).then(function(r){
        if(r.error)return authErr(r.error);var me=personOf(DB.me);if(me&&!me.name){me.name=d.name.slice(0,40);put('people',me);}
        if(!r.data.session){setTimeout(function(){infoBox('📧 '+t('Check your email'),'<p class="lead">'+esc(t('We sent a confirmation link to {e}. Open it, then come back and sign in.',{e:d.email}))+'</p>');},400);}
        else toast(t('Welcome, {n}!',{n:d.name}));});},{ok:'Create account',focus:'#f_name'});
}
function signInSheet(){
  openSheet(t('Sign in'),field({k:'email',l:'Email',type:'email',ph:'you@example.com'})+field({k:'pw',l:'Password',type:'password'})+'<button type="button" class="btn link mb" data-act="forgotPw">'+esc(t('Forgot password?'))+'</button>',
    function(d){if(!d.email||!d.pw)return t('Enter your email and password.');return Cloud.sb.auth.signInWithPassword({email:d.email,password:d.pw}).then(function(r){if(r.error)return authErr(r.error);toast(t('Signed in'));});},{ok:'Sign in',focus:'#f_email'});
}
function forgotSheet(){openSheet(t('Reset password'),field({k:'email',l:'Email',type:'email'}),function(d){if(!/^\S+@\S+\.\S+$/.test(d.email))return t('Please enter a valid email.');
  return Cloud.sb.auth.resetPasswordForEmail(d.email,{redirectTo:location.origin+location.pathname}).then(function(r){if(r.error)return authErr(r.error);setTimeout(function(){infoBox('📧 '+t('Check your email'),'<p class="lead">'+esc(t('If an account exists for {e}, you will receive a link to set a new password.',{e:d.email}))+'</p>');},400);});},{ok:'Send link'});}
function newPasswordSheet(){openSheet(t('Set a new password'),field({k:'pw',l:'New password',type:'password',ac:'new-password'}),function(d){if((d.pw||'').length<8)return t('Password must be at least 8 characters.');
  return Cloud.sb.auth.updateUser({password:d.pw}).then(function(r){if(r.error)return authErr(r.error);toast(t('Password updated'));});},{ok:'Save'});}

/* ---------- Family screens ---------- */
function vFamily(){
  var h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Family & caregivers'))+'</div><p class="sub">'+esc(t('Care for parents and loved ones together.'))+'</p></div>';
  h+='<section class="card"><h2>'+esc(t('How it works'))+'</h2><ol class="steps"><li>'+esc(t('Create a family group and add the people you care for (e.g. Amma, Thaththa).'))+'</li><li>'+esc(t('Invite family members with a 6-letter code. Parents can join on their own phones too.'))+'</li><li>'+esc(t('Everyone sees the same medicines, readings and appointments — updated live.'))+'</li><li>'+esc(t('Parents get alarms at dose times. Children get an alert if a dose is missed.'))+'</li></ol></section>';
  if(!Cloud.user)return h+'<section class="card"><p class="lead">'+esc(t('Sign in to create or join a family group.'))+'</p><div class="grid2"><button class="btn p" data-act="signUp">'+esc(t('Create account'))+'</button><button class="btn s" data-act="signIn">'+esc(t('Sign in'))+'</button></div></section></div>';
  Cloud.circles.forEach(function(c){var ms=Cloud.members[c.id]||[],ppl=live('people').filter(function(p){return p.circle===c.id;});
    h+='<section class="card"><h2>👨‍👩‍👧 '+esc(c.name)+'</h2><div class="lbl2">'+esc(t('People cared for'))+'</div>'+(ppl.length?'<ul class="list">'+ppl.map(function(p){var sc=schedule(p.id).filter(function(x){return !x.prn;}),tk=sc.filter(function(x){return x.status==='taken';}).length;return '<li><button class="navrow" data-act="switchTo" data-id="'+p.id+'"><span class="av" style="background:'+esc(p.color||'#1877F2')+'">'+esc((p.name||'?').charAt(0).toUpperCase())+'</span><div class="main"><b>'+esc(pname(p))+'</b><span>'+(sc.length?esc(t('{a} of {b} doses taken',{a:tk,b:sc.length})):esc(t('No medicines today')))+'</span></div><span class="chev">›</span></button></li>';}).join('')+'</ul>':'<p class="small muted">'+esc(t('No one shared yet. Add a person and choose this group under "Share with family group".'))+'</p>')+
      '<div class="lbl2">'+esc(t('Members'))+'</div><ul class="list">'+ms.map(function(m){return '<li><span class="em">'+(m.role==='owner'?'⭐':'👤')+'</span><div class="main"><b>'+esc(m.display_name||t('Member'))+(m.user_id===Cloud.user.id?' ('+esc(t('you'))+')':'')+'</b><span>'+esc(t(m.role==='owner'?'Owner':'Member'))+'</span></div></li>';}).join('')+'</ul>'+
      '<div class="grid2 mt"><button class="btn p" data-act="invite" data-id="'+c.id+'">➕ '+esc(t('Invite'))+'</button><button class="btn s" data-act="addPerson">👤 '+esc(t('Add person'))+'</button></div><button class="btn link full" data-act="leaveCircle" data-id="'+c.id+'">'+esc(t('Leave this group'))+'</button></section>';});
  h+='<section class="card"><div class="grid2"><button class="btn s" data-act="newCircle">+ '+esc(t('New group'))+'</button><button class="btn s" data-act="joinCircle">🔑 '+esc(t('Join with code'))+'</button></div></section>';
  return h+'</div>';
}
function onboardFamily(){
  openSheet('👨‍👩‍👧 '+t('Set up your family'),'<p class="lead">'+esc(t('Family groups let you share medicines and readings with the people you care about.'))+'</p><div class="choice"><button class="btn p full" data-act="obCreate">🏠 '+esc(t('Create my family group'))+'</button><div class="small muted center mb">'+esc(t('I will add and manage people (e.g. my parents)'))+'</div><button class="btn s full" data-act="joinCircle">🔑 '+esc(t('I have a family code'))+'</button><div class="small muted center">'+esc(t('Someone invited me (e.g. my son or daughter)'))+'</div></div>');
}
function createCircleFlow(name){
  return Cloud.createCircle(name||t('{n}\'s family',{n:Cloud.myName()})).then(function(cid){Cloud.attachAll(cid);return Cloud.sync();}).then(function(){toast(t('Family group created'));view(true);
    setTimeout(function(){if(!DB.settings.push.on)notifySetup();},500);});
}
function joinSheet(code){
  openSheet('🔑 '+t('Join a family'),field({k:'code',l:'6-letter family code',val:code||'',ph:'ABC123',max:6})+'<p class="hint">'+esc(t('Ask the family member who invited you for the code.'))+'</p>',function(d){var c=(d.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(c.length!==6)return t('The code has 6 letters and numbers.');
    return Cloud.join(c).then(function(cid){DB.cloud.join=null;save();try{history.replaceState(null,'',location.pathname);}catch(e){}
      setTimeout(function(){whoAmISheet(cid);},400);}).catch(function(e){return /invalid|expired/i.test(String(e.message))?t('This code is not valid or has expired. Ask for a new one.'):authErr(e);});},{ok:'Join',focus:'#f_code'});
}
function whoAmISheet(cid){
  var ppl=live('people').filter(function(p){return p.circle===cid;});
  var h='<p class="lead">'+esc(t('You joined {c}.',{c:Cloud.circleName(cid)}))+' '+esc(t('Is one of these people you?'))+'</p><ul class="list">'+ppl.map(function(p){return '<li><button class="navrow" data-act="iAm" data-id="'+p.id+'"><span class="av" style="background:'+esc(p.color||'#1877F2')+'">'+esc((p.name||'?').charAt(0).toUpperCase())+'</span><div class="main"><b>'+esc(pname(p))+'</b><span>'+esc(t('Yes, this is me — remind me on this phone'))+'</span></div></button></li>';}).join('')+'</ul>'+
    '<button class="btn s full mt" data-act="iAm" data-id="">'+esc(t('No, I am a caregiver'))+'</button>';
  openSheet('👋 '+t('Welcome!'),h);
}
function inviteSheet(cid){
  Cloud.invite(cid).then(function(code){var url=location.origin+location.pathname+'?join='+code,msg=t('Join our family on My Health to help manage medicines and health. Open {url} , create an account and enter the code {code}.',{url:url,code:code});
    openSheet('➕ '+t('Invite to {c}',{c:Cloud.circleName(cid)}),'<p class="lead">'+esc(t('Share this code. It works for 7 days.'))+'</p><div class="code">'+code.split('').map(function(c){return '<span>'+c+'</span>';}).join('')+'</div>'+
      '<a class="btn p full mt" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(msg)+'">🟢 '+esc(t('Send on WhatsApp'))+'</a><button class="btn s full mt" data-act="shareMsg" data-msg="'+esc(msg)+'">📤 '+esc(t('Share another way'))+'</button>');})
  .catch(function(e){toast(authErr(e));});
}

/* ---------- Notifications screen ---------- */
function notifySetup(){
  if(!Cloud.user){openSheet('🔔 '+t('Medicine alarms'),'<p class="lead">'+esc(t('For alarms that ring even when the app is closed, create a free account. While the app is open, alarms already work without an account.'))+'</p><div class="grid2"><button class="btn p" data-act="signUp">'+esc(t('Create account'))+'</button><button class="btn s" data-act="signIn">'+esc(t('Sign in'))+'</button></div><button class="btn link full mt" data-act="localAlarmsOnly">'+esc(t('Not now — use in-app alarms only'))+'</button>');return;}
  go('more','notify');
}
function vNotify(){
  var s=DB.settings.push,h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Alarms & notifications'))+'</div></div>',perm=typeof Notification!=='undefined'?Notification.permission:'unsupported';
  if(isIOS()&&!isStandalone())h+='<section class="card warnbox"><b>📲 '+esc(t('Install the app first'))+'</b><p class="small" style="margin:6px 0 10px">'+esc(t('On iPhone, alarms when the app is closed only work after adding My Health to your Home Screen (iOS 16.4 or newer).'))+'</p><button class="btn p full" data-act="installHelp">'+esc(t('Show me how'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('Alarms when the app is closed'))+'</h2>';
  if(!Cloud.user)h+='<p class="small muted">'+esc(t('Sign in to turn on alarms that work when the app is closed.'))+'</p><div class="grid2"><button class="btn p" data-act="signUp">'+esc(t('Create account'))+'</button><button class="btn s" data-act="signIn">'+esc(t('Sign in'))+'</button></div>';
  else if(s.on&&perm==='granted')h+='<div class="row"><span class="tag c-ok">● '+esc(t('On for this phone'))+'</span><span style="flex:1"></span><button class="btn s sm" data-act="pushTest">'+esc(t('Send test'))+'</button><button class="btn s sm" data-act="pushOff">'+esc(t('Turn off'))+'</button></div>';
  else h+=(perm==='denied'?'<div class="alert c-bad small">'+esc(t('Notifications are blocked. Allow them in your phone settings for this app, then try again.'))+'</div>':'')+'<button class="btn p full" data-act="pushOn">🔔 '+esc(t('Turn on alarms'))+'</button>';
  h+='</section>';
  var ppl=live('people');
  h+='<section class="card"><h2>'+esc(t('Who should this phone remind?'))+'</h2><p class="small muted" style="margin:-4px 0 8px">'+esc(t('Usually: alarms for yourself, missed-dose alerts for parents you look after.'))+'</p>';
  ppl.forEach(function(p){h+='<div class="pref"><div class="row"><span class="av sm" style="background:'+esc(p.color||'#1877F2')+'">'+esc((p.name||'?').charAt(0).toUpperCase())+'</span><b>'+esc(pname(p))+'</b>'+(!p.circle&&Cloud.user?'<span class="tag c-none small">'+esc(t('Not shared'))+'</span>':'')+'</div>'+
    '<label class="switch"><input type="checkbox" data-act2="remind" value="'+p.id+'"'+(s.remind.indexOf(p.id)>=0||(!s.remind.length&&p.id===DB.me)?' checked':'')+'><span>⏰ '+esc(t('Medicine alarms'))+'</span></label>'+
    '<label class="switch"><input type="checkbox" data-act2="missed" value="'+p.id+'"'+(s.missed.indexOf(p.id)>=0?' checked':'')+'><span>⚠️ '+esc(t('Tell me if a dose is missed'))+'</span></label></div>';});
  h+='<label class="switch mt"><input type="checkbox" data-act2="water"'+(s.water?' checked':'')+'><span>💧 '+esc(t('Water reminders (every 2 hours, 9 am – 7 pm)'))+'</span></label>';
  h+='<p class="hint">'+esc(t('Appointment reminders are sent 1 day and 1 hour before. Refill reminders come when medicine is running low.'))+'</p></section>';
  h+='<section class="card"><h2>'+esc(t('While the app is open'))+'</h2><label class="switch"><input type="checkbox" data-act2="alarms"'+(DB.settings.alarms?' checked':'')+'><span>'+esc(t('Full-screen alarm with sound'))+'</span></label><button class="btn s full mt" data-act="alarmTest">🔔 '+esc(t('Preview the alarm screen'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('Backup reminders'))+'</h2><p class="small muted" style="margin:0 0 10px">'+esc(t('Also add every dose to your phone calendar with an alert — works even without internet.'))+'</p><button class="btn s full" data-act="medIcs">📅 '+esc(t('Add to phone calendar'))+'</button></section>';
  return h+'</div>';
}

/* =====================================================================
   WATCH & DEVICE SYNC (Apple Health, Shortcuts, CSV, Bluetooth)
   ===================================================================== */
var HK={HKQuantityTypeIdentifierStepCount:'steps',HKCategoryTypeIdentifierSleepAnalysis:'sleep',HKQuantityTypeIdentifierHeartRate:'hr',HKQuantityTypeIdentifierRestingHeartRate:'rhr',
  HKQuantityTypeIdentifierBodyMass:'weight',HKQuantityTypeIdentifierOxygenSaturation:'spo2',HKQuantityTypeIdentifierBodyTemperature:'temp',
  HKQuantityTypeIdentifierBloodPressureSystolic:'bps',HKQuantityTypeIdentifierBloodPressureDiastolic:'bpd',HKQuantityTypeIdentifierBloodGlucose:'glucose'};
var ALIAS={steps:'steps',step:'steps','step count':'steps',stepcount:'steps',sleep:'sleep','sleep analysis':'sleep',hr:'hr','heart rate':'hr',heartrate:'hr',
  rhr:'rhr','resting heart rate':'rhr',restinghr:'rhr',weight:'weight','body mass':'weight',spo2:'spo2','blood oxygen':'spo2','oxygen saturation':'spo2',
  temp:'temp','body temperature':'temp',bps:'bps',bpd:'bpd',glucose:'glucose','blood glucose':'glucose'};
function parseAnyDT(s){
  if(s instanceof Date)return s;if(!s)return null;s=String(s).trim();
  var m=/(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/.exec(s);
  if(m)return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0));
  m=/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?)?/.exec(s);
  if(m){var a=+m[1],b=+m[2],d,mo;if(a>12){d=a;mo=b;}else if(b>12){mo=a;d=b;}else{d=a;mo=b;}var h=+(m[4]||0);if(m[6]){var pm=/p/i.test(m[6]);if(h===12)h=0;if(pm)h+=12;}return new Date(+m[3],mo-1,d,h,+(m[5]||0));}
  var t=Date.parse(s);return isNaN(t)?null:new Date(t);
}
function cleanNum(s){s=String(s==null?'':s).trim();var m=/-?\d{1,3}(,\d{3})+(\.\d+)?|-?\d+(\.\d+)?|-?\.\d+/.exec(s.replace(/\s/g,''));if(!m)return NaN;return parseFloat(m[0].replace(/,/g,''));}
function hhmm(d){return pad(d.getHours())+':'+pad(d.getMinutes());}

function Agg(since){this.since=since||null;this.steps={};this.sleep={};this.hr={};this.rhr={};this.pts=[];this.bp={};this.n=0;}
Agg.prototype.add=function(type,start,end,value,unit,source){
  var k=HK[type]||ALIAS[String(type||'').toLowerCase().trim()];if(!k)return;
  var s=parseAnyDT(start);if(!s||isNaN(s))return;
  if(this.since&&s<this.since)return;
  var e=end?parseAnyDT(end):null;if(!e||isNaN(e))e=s;
  var day=dKey(s),u=String(unit||'').toLowerCase(),v;this.n++;
  if(k==='sleep'){
    var kind=String(value==null?'':value).toLowerCase().replace('hkcategoryvaluesleepanalysis','');
    var num=cleanNum(value);
    if(!(e>s)&&!isNaN(num)&&num>0){var hrs=num>24?num/60:num;var o0=this.sleepNight(day);o0.hours=(o0.hours||0)+hrs;return;}
    var cat=/inbed|in bed/.test(kind)?'bed':/awake/.test(kind)?null:'asleep';if(!cat||!(e>s))return;
    this.sleepNight(dKey(e))[cat].push([s.getTime(),e.getTime()]);return;
  }
  v=cleanNum(value);if(isNaN(v))return;
  if(k==='steps'){var src=source||'_';var o=this.steps[day]=this.steps[day]||{};o[src]=(o[src]||0)+v;return;}
  if(k==='hr'){if(v<25||v>250)return;var h=this.hr[day]=this.hr[day]||{sum:0,n:0,min:999,max:0};h.sum+=v;h.n++;if(v<h.min)h.min=v;if(v>h.max)h.max=v;return;}
  if(k==='rhr'){if(v<25||v>200)return;(this.rhr[day]=this.rhr[day]||[]).push(v);return;}
  var t=localDT(s)+':00';
  if(k==='weight'){if(/lb/.test(u))v*=0.45359237;if(v>=2&&v<=350)this.pts.push({type:'weight',t:t,v:{v:r1(v)}});return;}
  if(k==='spo2'){if(v<=1)v*=100;v=Math.round(v);if(v>=50&&v<=100)this.pts.push({type:'spo2',t:t,v:{v:v}});return;}
  if(k==='temp'){if(/f/.test(u)||v>50)v=(v-32)*5/9;if(v>=30&&v<=45)this.pts.push({type:'temp',t:t,v:{v:r1(v)}});return;}
  if(k==='glucose'){if(/mmol/.test(u)||v<35)v*=18;v=Math.round(v);if(v>=10&&v<=700)this.pts.push({type:'sugar',t:t,v:{v:v,ctx:'random'}});return;}
  if(k==='bps'||k==='bpd'){var key=s.getTime(),b=this.bp[key]=this.bp[key]||{t:t};b[k==='bps'?'s':'d']=Math.round(v);return;}
};
Agg.prototype.sleepNight=function(n){return this.sleep[n]=this.sleep[n]||{asleep:[],bed:[],hours:null};};
function unionMs(iv){if(!iv.length)return {ms:0};iv.sort(function(a,b){return a[0]-b[0];});var tot=0,cs=iv[0][0],ce=iv[0][1],first=cs,last=ce;
  for(var i=1;i<iv.length;i++){if(iv[i][0]<=ce){if(iv[i][1]>ce)ce=iv[i][1];}else{tot+=ce-cs;cs=iv[i][0];ce=iv[i][1];}if(iv[i][1]>last)last=iv[i][1];}tot+=ce-cs;return {ms:tot,from:first,to:last};}
Agg.prototype.result=function(){
  var out={steps:[],sleep:[],hrday:[],pulse:[],pts:this.pts.slice(),bp:[]},self=this;
  Object.keys(this.steps).forEach(function(d){var o=self.steps[d],mx=0;for(var k in o)if(o[k]>mx)mx=o[k];if(mx>0)out.steps.push({day:d,v:Math.round(mx)});});
  Object.keys(this.sleep).forEach(function(n){var o=self.sleep[n],u=unionMs(o.asleep);if(!u.ms)u=unionMs(o.bed);var hrs=u.ms/36e5,v={};
    if(hrs>=0.5&&hrs<=20){v={v:r1(hrs),from:hhmm(new Date(u.from)),to:hhmm(new Date(u.to))};out.sleep.push({day:n,t:localDT(new Date(u.to))+':00',v:v});}
    else if(o.hours&&o.hours>=0.5&&o.hours<=20)out.sleep.push({day:n,t:n+'T07:00:00',v:{v:r1(o.hours)}});});
  Object.keys(this.hr).forEach(function(d){var h=self.hr[d];out.hrday.push({day:d,v:{v:Math.round(h.sum/h.n),min:Math.round(h.min),max:Math.round(h.max)}});});
  Object.keys(this.rhr).forEach(function(d){var a=self.rhr[d];out.pulse.push({day:d,v:{v:Math.round(a.reduce(function(x,y){return x+y;},0)/a.length)}});});
  Object.keys(this.bp).forEach(function(k){var b=self.bp[k];if(b.s&&b.d&&b.s>b.d&&b.s>=50&&b.s<=260&&b.d>=30&&b.d<=180)out.bp.push({t:b.t,v:{s:b.s,d:b.d}});});
  out.total=out.steps.length+out.sleep.length+out.hrday.length+out.pulse.length+out.pts.length+out.bp.length;
  return out;
};
/* ---------- Shortcut / clipboard payload ---------- */
function parsePayload(text){
  var agg=new Agg(null),lines=String(text||'').replace(/\r/g,'\n').split('\n');
  lines.forEach(function(line){line=line.trim();if(!line||/^mh\d/i.test(line))return;
    var f=line.indexOf(';')>=0?line.split(';'):line.indexOf('\t')>=0?line.split('\t'):line.split(',');
    f=f.map(function(x){return x.trim();});if(f.length<3)return;
    if(f.length===3)agg.add(f[0],f[1],null,f[2],'','sc');else agg.add(f[0],f[1],f[2],f[3],f[4]||'','sc');});
  return agg.result();
}
function pasteSync(){
  var go2=function(t){var r=parsePayload(t);if(!r.total){manualPaste(t('The clipboard did not contain sync data. Run the shortcut first, or paste the data below.'));return;}previewSync(r,'shortcut');};
  if(navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(go2,function(){manualPaste();});}else manualPaste();
}
function manualPaste(msg){openSheet(t('Paste synced data'),(msg?'<p class="small" style="color:var(--bad);margin:0 0 10px">'+esc(msg)+'</p>':'')+field({k:'payload',l:'Synced data',type:'textarea',ph:'steps;2026-11-07 00:00;2026-11-08 00:00;8432'}),
  function(d){var r=parsePayload(d.payload);if(!r.total)return t('No valid lines found. Expected: type;start;end;value');setTimeout(function(){previewSync(r,'shortcut');},380);},{ok:'Continue'});}

/* ---------- Apple Health export (zip / xml, streamed) ---------- */
var importBusy=false,importCancel=false;
async function zipEntry(file,test){
  var tail=Math.min(file.size,65557+22),buf=new Uint8Array(await file.slice(file.size-tail).arrayBuffer()),dv=new DataView(buf.buffer),eo=-1;
  for(var i=buf.length-22;i>=0;i--){if(dv.getUint32(i,true)===0x06054b50){eo=i;break;}}
  if(eo<0)throw new Error(t('This does not look like a valid zip file.'));
  var cdSize=dv.getUint32(eo+12,true),cdOff=dv.getUint32(eo+16,true);
  if(cdOff===0xFFFFFFFF||cdSize===0xFFFFFFFF){var loc=eo-20;if(loc>=0&&dv.getUint32(loc,true)===0x07064b50){var z64=Number(dv.getBigUint64(loc+8,true));
    var zb=new DataView(await file.slice(z64,z64+56).arrayBuffer());cdSize=Number(zb.getBigUint64(40,true));cdOff=Number(zb.getBigUint64(48,true));}}
  var cd=new DataView(await file.slice(cdOff,cdOff+cdSize).arrayBuffer()),p=0,td=new TextDecoder();
  while(p+46<=cd.byteLength&&cd.getUint32(p,true)===0x02014b50){
    var method=cd.getUint16(p+10,true),cs=cd.getUint32(p+20,true),us=cd.getUint32(p+24,true),nl=cd.getUint16(p+28,true),xl=cd.getUint16(p+30,true),cl=cd.getUint16(p+32,true),lho=cd.getUint32(p+42,true);
    var name=td.decode(new Uint8Array(cd.buffer,p+46,nl));
    if(test.test(name)){
      var x=p+46+nl,xe=x+xl;while(x+4<=xe){var id=cd.getUint16(x,true),sz=cd.getUint16(x+2,true);if(id===1){var q=x+4;if(us===0xFFFFFFFF){us=Number(cd.getBigUint64(q,true));q+=8;}if(cs===0xFFFFFFFF){cs=Number(cd.getBigUint64(q,true));q+=8;}if(lho===0xFFFFFFFF){lho=Number(cd.getBigUint64(q,true));}}x+=4+sz;}
      var lh=new DataView(await file.slice(lho,lho+30).arrayBuffer()),start=lho+30+lh.getUint16(26,true)+lh.getUint16(28,true);
      return {method:method,start:start,size:cs};
    }
    p+=46+nl+xl+cl;
  }
  return null;
}
async function importApple(file,days){
  if(importBusy)return;importBusy=true;importCancel=false;
  var since=null;if(days){since=new Date();since.setDate(since.getDate()-days);since.setHours(0,0,0,0);}
  openSheet(t('Importing Apple Health…'),'<div class="prog"><i id="progBar"></i></div><p class="small muted" id="progTxt" style="margin:10px 0 14px">'+esc(t('Opening file…'))+'</p><p class="hint">'+esc(t('Large exports can take a minute or two. Keep this screen open.'))+'</p><div class="ft"><button class="btn s" data-act="closeSheet">'+esc(t('Cancel'))+'</button></div>');
  try{
    var raw,total,read=0,agg=new Agg(since);
    if(/\.zip$/i.test(file.name)||/zip/.test(file.type)){
      var z=await zipEntry(file,/(^|\/)export\.xml$/i);if(!z)throw new Error(t('export.xml was not found inside this zip. Please choose the export.zip from the Health app.'));
      raw=file.slice(z.start,z.start+z.size).stream();total=z.size;
      if(z.method===8){if(typeof DecompressionStream==='undefined')throw new Error(t('This browser cannot open zip files. In the Files app, tap export.zip to unzip it, then choose export.xml inside the apple_health_export folder.'));}
      var counter=new TransformStream({transform:function(ch,ctl){read+=ch.byteLength;ctl.enqueue(ch);}});
      raw=raw.pipeThrough(counter);if(z.method===8)raw=raw.pipeThrough(new DecompressionStream('deflate-raw'));
    }else{total=file.size;raw=file.stream().pipeThrough(new TransformStream({transform:function(ch,ctl){read+=ch.byteLength;ctl.enqueue(ch);}}));}
    var reader=raw.pipeThrough(new TextDecoderStream()).getReader(),buf='',re=/<Record\s([^>]*?)\/?>/g,lastUI=0,found=0;
    var at=function(s,n){var k=s.indexOf(' '+n+'="');if(k<0)return '';k+=n.length+3;return s.slice(k,s.indexOf('"',k));};
    for(;;){
      if(importCancel)throw new Error('cancelled');
      var r=await reader.read();if(r.done)break;buf+=r.value;
      var li=buf.lastIndexOf('>');if(li<0)continue;var chunk=buf.slice(0,li+1);buf=buf.slice(li+1);
      re.lastIndex=0;var m;while((m=re.exec(chunk))){var a=' '+m[1],ty=at(a,'type');if(!HK[ty])continue;found++;
        agg.add(ty,at(a,'startDate'),at(a,'endDate'),at(a,'value'),at(a,'unit'),at(a,'sourceName'));}
      var now=Date.now();if(now-lastUI>150){lastUI=now;var pc=clamp(read/total*100,0,100),pb=$('#progBar'),pt=$('#progTxt');
        if(pb)pb.style.width=pc.toFixed(1)+'%';if(pt)pt.textContent=Math.floor(pc)+'% · '+t('{n} health records read',{n:fNum(found)});}
    }
    importBusy=false;closeSheet();var res=agg.result();setTimeout(function(){previewSync(res,'apple');},380);
  }catch(err){importBusy=false;closeSheet();if(err&&err.message==='cancelled'){toast(t('Import cancelled'));return;}
    setTimeout(function(){infoBox(t('Import failed'),'<p class="lead">'+esc(err&&err.message?err.message:t('Could not read this file.'))+'</p>');},380);}
}

/* ---------- CSV (other watches) ---------- */
function parseCSV(text){
  text=text.replace(/^﻿/,'');var first=text.split(/\r?\n/)[0]||'',cnt=function(c){return first.split(c).length;};
  var dl=cnt('\t')>cnt(',')&&cnt('\t')>cnt(';')?'\t':cnt(';')>cnt(',')?';':',';
  var rows=[],row=[],f='',q=false;
  for(var i=0;i<text.length;i++){var c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else if(c==='"')q=true;else if(c===dl){row.push(f);f='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);f='';if(row.some(function(x){return x.trim()!=='';}))rows.push(row);row=[];}
    else f+=c;}
  row.push(f);if(row.some(function(x){return x.trim()!=='';}))rows.push(row);
  return rows;
}
var csvRows=null;
var CSV_METRICS=[['steps','👟 Steps',/step/i],['sleep','😴 Sleep',/sleep|asleep/i],['rhr','❤️ Resting heart rate',/resting/i],['hr','⌚ Heart rate (average)',/heart|^hr\b|bpm|pulse/i],['weight','⚖️ Weight (kg)',/weight|mass/i],['spo2','🫁 Blood oxygen',/spo2|oxygen|o2/i]];
function csvSheet(text){
  var rows=parseCSV(text);if(rows.length<2){toast(t('The CSV file looks empty'));return;}
  csvRows=rows;var hd=rows[0].map(function(x){return x.trim();}),opts={'':t('— not in file —')};hd.forEach(function(x,i){opts[i]=x||(t('Column {n}',{n:i+1}));});
  var guess=function(re,not){for(var i=0;i<hd.length;i++)if(re.test(hd[i])&&!(not&&not.test(hd[i])))return String(i);return '';};
  var h='<p class="muted" style="margin:0 0 12px">'+esc(t('{n} rows found. Match the columns:',{n:rows.length-1}))+'</p>'+field({k:'date',l:'📅 Date column',type:'select',raw:true,opts:opts,val:guess(/date|time|day/i)||'0'});
  CSV_METRICS.forEach(function(m){h+=field({k:'m_'+m[0],l:m[1],type:'select',raw:true,opts:opts,val:guess(m[2],m[0]==='hr'?/resting|zone|max|min/i:null)});});
  var sleepCol=guess(/sleep|asleep/i),unit='hours';if(sleepCol!==''){var vals=rows.slice(1,30).map(function(r){return cleanNum(r[+sleepCol]);}).filter(function(v){return !isNaN(v);});if(vals.length&&vals.sort(function(a,b){return a-b;})[Math.floor(vals.length/2)]>24)unit='minutes';}
  h+=field({k:'sunit',l:'Sleep values are in',type:'select',opts:{hours:'Hours',minutes:'Minutes'},val:unit});
  openSheet(t('Import from CSV'),h,function(d){
    if(d.date===''||d.date==null)return t('Choose the date column.');
    var any=CSV_METRICS.some(function(m){return d['m_'+m[0]]!=='';});if(!any)return t('Match at least one health column.');
    var agg=new Agg(null),di=+d.date;
    csvRows.slice(1).forEach(function(r){var dt=parseAnyDT(r[di]);if(!dt||isNaN(dt))return;
      CSV_METRICS.forEach(function(m){var c=d['m_'+m[0]];if(c===''||r[+c]==null||String(r[+c]).trim()==='')return;var v=cleanNum(r[+c]);if(isNaN(v))return;
        if(m[0]==='sleep'){v=d.sunit==='minutes'?v/60:v;agg.add('sleep',dt,null,v);}else agg.add(m[0],dt,null,v,m[0]==='weight'?'kg':'','csv');});});
    var res=agg.result();if(!res.total)return t('No valid values found in the matched columns.');setTimeout(function(){previewSync(res,'csv');},380);
  },{ok:'Continue'});
}

/* ---------- Live heart rate via Bluetooth (Android Chrome) ---------- */
var ble={dev:null,bpm:null};
function bleSupported(){return !!(navigator.bluetooth&&navigator.bluetooth.requestDevice);}
function bleConnect(){
  if(!bleSupported()){toast(t('Bluetooth is not available in this browser'));return;}
  navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}]}).then(function(dev){ble.dev=dev;dev.addEventListener('gattserverdisconnected',function(){ble.dev=null;ble.bpm=null;toast(t('Heart rate device disconnected'));if(R.sub==='sync')view(true);});
    return dev.gatt.connect();}).then(function(s){return s.getPrimaryService('heart_rate');}).then(function(svc){return svc.getCharacteristic('heart_rate_measurement');})
  .then(function(ch){return ch.startNotifications().then(function(){ch.addEventListener('characteristicvaluechanged',function(e){var dv=e.target.value,f=dv.getUint8(0),bpm=(f&1)?dv.getUint16(1,true):dv.getUint8(1);if(!bpm)return;ble.bpm=bpm;
    var el=$('#bleBpm'),hh=$('#bleHeart');if(el)el.textContent=bpm;if(hh)hh.style.animationDuration=(60/bpm).toFixed(2)+'s';});toast(t('Connected to {n}',{n:ble.dev&&ble.dev.name||t('device')}));view(true);});})
  .catch(function(err){if(err&&err.name==='NotFoundError')return;toast(t('Could not connect')+': '+(err&&err.message||''));});
}
function bleDisconnect(){try{if(ble.dev&&ble.dev.gatt.connected)ble.dev.gatt.disconnect();}catch(e){}ble.dev=null;ble.bpm=null;view(true);}
function bleSave(){if(!ble.bpm){toast(t('Waiting for a heart rate reading…'));return;}put('logs',{id:uid(),pid:P().id,type:'pulse',t:localDT(new Date())+':00',v:{v:ble.bpm},note:(ble.dev&&ble.dev.name)||'',src:'ble'});toast(t('Saved')+' · '+ble.bpm+' bpm');}


/* ---------- Commit imported data (newest import wins per day) ---------- */
function commitSync(res,src){
  var pid=P().id,logs=DB.logs,added=0,updated=0;
  function up(type,tm,v,match,daily){
    for(var i=0;i<logs.length;i++){var e=logs[i];if(e._del||e.pid!==pid||e.type!==type)continue;if(!(daily?(e.src&&e.src!=='ble'):e.src===src))continue;if(!match(e))continue;
      if(JSON.stringify(e.v)!==JSON.stringify(v)||e.t!==tm||e.src!==src){e.v=v;e.t=tm;e.src=src;put('logs',e);updated++;}return;}
    put('logs',{id:uid(),pid:pid,type:type,t:tm,v:v,note:'',src:src});added++;}
  var byDay=function(day){return function(e){return e.t.slice(0,10)===day;};},byT=function(tm){return function(e){return e.t===tm;};};
  res.steps.forEach(function(x){up('steps',x.day+'T12:00:00',{v:x.v},byDay(x.day),1);});
  res.sleep.forEach(function(x){up('sleep',x.t,x.v,byDay(x.day),1);});
  res.hrday.forEach(function(x){up('hrday',x.day+'T12:00:00',x.v,byDay(x.day),1);});
  res.pulse.forEach(function(x){up('pulse',x.day+'T08:00:00',x.v,function(e){return isDaily(e)&&e.t.slice(0,10)===x.day;},1);});
  res.pts.forEach(function(x){up(x.type,x.t,x.v,byT(x.t));});
  res.bp.forEach(function(x){up('bp',x.t,x.v,byT(x.t));});
  DB.watch[pid]={last:new Date().toISOString(),src:src};save();
  return {added:added,updated:updated};
}
var pendingSync=null;
function previewSync(res,src){
  if(!res.total){infoBox(t('Nothing to import'),'<p class="lead">'+esc(t('No supported health data was found. Supported: steps, sleep, heart rate, resting heart rate, weight, blood pressure, blood oxygen, temperature and blood glucose.'))+'</p>');return;}
  pendingSync={res:res,src:src};var cnt=function(ty){return res.pts.filter(function(x){return x.type===ty;}).length;};
  var rows=[['👟','Steps',res.steps.length],['😴','Sleep',res.sleep.length],['❤️','Resting heart rate',res.pulse.length],['⌚','Daily heart rate',res.hrday.length],['⚖️','Weight',cnt('weight')],['🩺','Blood pressure',res.bp.length],['🫁','Blood oxygen',cnt('spo2')],['🌡️','Temperature',cnt('temp')],['🩸','Blood glucose',cnt('sugar')]].filter(function(r){return r[2];});
  openSheet(t('Ready to import'),'<p class="muted" style="margin:0 0 6px">'+esc(t('From {s} into {n}\'s records:',{s:t(SRC[src]),n:pname(P())}))+'</p><ul class="list">'+rows.map(function(r){return '<li><span class="em">'+r[0]+'</span><div class="main"><b>'+esc(t(r[1]))+'</b></div><div class="end"><b>'+r[2]+'</b></div></li>';}).join('')+'</ul>'+
    '<p class="hint">'+esc(t('Re-syncing the same days updates them instead of creating duplicates.'))+'</p><div class="ft"><button class="btn s" data-act="closeSheet">'+esc(t('Cancel'))+'</button><button class="btn p" data-act="doImport">'+esc(t('Import'))+'</button></div>');
}
var SHORTCUT_NAME='My Health Sync';
function vSync(){
  var p=P(),info=DB.watch[p.id],imp=mine('logs').filter(function(e){return e.src&&e.src!=='ble';}).length;
  var h='<div class="stack"><div>'+back()+'<div class="h1">'+esc(t('Connect your watch'))+'</div><p class="sub">'+esc(t('Bring steps, sleep and heart rate from your smartwatch into My Health.'))+'</p></div>';
  h+='<section class="card"><div class="row" style="align-items:flex-start"><span style="font-size:28px;line-height:1">⌚</span><div class="small" style="font-size:14px">'+esc(t('Apple Watch and iPhone store your data in Apple Health. For privacy, Apple does not let websites read it directly, so My Health imports it using one of the options below.'))+'</div></div>'+
    (info?'<div class="res mt"><div class="row between"><div><div class="small muted">'+esc(t('Last sync'))+'</div><b>'+relDay(new Date(info.last))+' · '+fTime(new Date(info.last))+'</b><div class="small muted">'+esc(t(SRC[info.src]||''))+' · '+esc(t('{n} imported readings',{n:imp}))+'</div></div><button class="btn s sm" data-act="clearImported">'+esc(t('Remove'))+'</button></div></div>':'')+'</section>';
  h+='<section class="card"><h2>⚡ '+esc(t('Quick sync · iPhone'))+' <span class="tag c-ok nocaps">'+esc(t('Recommended'))+'</span></h2><p class="pm">'+esc(t('Sync the last 7 days of steps, sleep and heart rate from your Apple Watch in two taps.'))+'</p>'+
    '<div class="grid2"><a class="btn p" href="shortcuts://run-shortcut?name='+encodeURIComponent(SHORTCUT_NAME)+'">1 · '+esc(t('Run shortcut'))+'</a><button class="btn s" data-act="pasteSync">2 · '+esc(t('Paste data'))+'</button></div>'+
    '<details class="howto"><summary>'+esc(t('One-time setup: create the shortcut (about 5 minutes)'))+'</summary><ol>'+
    '<li>'+t('Open the <b>Shortcuts</b> app, tap <b>+</b> and name the shortcut exactly <b>{n}</b>.',{n:SHORTCUT_NAME})+'</li>'+
    '<li>'+t('Add <b>Find Health Samples</b>. Set Type to <b>Steps</b>, add the filter <b>Start Date is in the last 7 days</b>, and set <b>Group By: Day</b>.')+'</li>'+
    '<li>'+t('Add <b>Repeat with Each</b>. Inside it add a <b>Text</b> action: type <code>steps;</code> then insert <i>Repeat Item</i> → <b>Start Date</b>, type <code>;</code>, insert <i>Repeat Item</i> → <b>End Date</b>, type <code>;</code>, insert <i>Repeat Item</i> → <b>Value</b>. Tap each date → Date Format <b>Custom</b> → <code>yyyy-MM-dd HH:mm</code>.')+'</li>'+
    '<li>'+t('Still inside the repeat, add <b>Add to Variable</b> named <b>Data</b>.')+'</li>'+
    '<li>'+t('Repeat steps 2–4 for <b>Sleep Analysis</b> (text starts with <code>sleep;</code>, no Group By) and <b>Resting Heart Rate</b> (<code>rhr;</code>). Optional: <b>Heart Rate</b> grouped by Hour (<code>hr;</code>), <b>Weight</b> (<code>weight;</code>), <b>Blood Oxygen</b> (<code>spo2;</code>).')+'</li>'+
    '<li>'+t('After the last repeat add <b>Combine Text</b> (Data, New Lines), then <b>Copy to Clipboard</b>.')+'</li>'+
    '<li>'+t('Run it once and tap <b>Allow</b> for Health access. Then come back and tap <b>Paste data</b>.')+'</li></ol>'+
    '<p class="hint">'+t('Each line looks like: <code>steps;2026-11-07 00:00;2026-11-08 00:00;8432</code>. Tip: in Shortcuts → <b>Automation</b>, run it every morning.')+'</p></details></section>';
  h+='<section class="card"><h2>📦 '+esc(t('Full Apple Health history'))+'</h2><ol class="steps"><li>'+t('Open the <b>Health</b> app → tap your <b>profile picture</b>.')+'</li><li>'+t('Tap <b>Export All Health Data</b> → <b>Export</b> → <b>Save to Files</b>.')+'</li><li>'+t('Choose the saved <b>export.zip</b> below.')+'</li></ol>'+
    field({k:'hkDays',l:'Import data from',type:'select',val:'90',opts:{'30':'Last 30 days','90':'Last 3 months','365':'Last 12 months','0':'Everything'}})+
    '<button class="btn p full" data-act="pickApple">'+esc(t('Choose export.zip'))+'</button></section>';
  h+='<section class="card"><h2>⌚ '+esc(t('Other smartwatches'))+'</h2><p class="pm">'+esc(t('Samsung Health, Fitbit, Garmin Connect, Mi Fitness, Huawei Health and Google Fit can export your data as a CSV file. Import it here and match the columns.'))+'</p><button class="btn s full" data-act="pickCsv">'+esc(t('Choose CSV file'))+'</button></section>';
  h+='<section class="card"><h2>📡 '+esc(t('Live heart rate (Bluetooth)'))+'</h2>';
  if(bleSupported()){
    if(ble.dev)h+='<div class="center" style="padding:6px 0"><div id="bleHeart" class="bheart" style="animation-duration:'+(ble.bpm?(60/ble.bpm).toFixed(2):'1')+'s">❤️</div><div class="bignum"><span id="bleBpm">'+(ble.bpm||'--')+'</span> <small class="muted">bpm</small></div><div class="small muted">'+esc(ble.dev.name||'')+'</div></div><div class="grid2 mt"><button class="btn s" data-act="bleDisconnect">'+esc(t('Disconnect'))+'</button><button class="btn p" data-act="bleSave">'+esc(t('Save reading'))+'</button></div>';
    else h+='<p class="pm">'+esc(t('Connect a chest strap or a watch that broadcasts heart rate to see your pulse live.'))+'</p><button class="btn p full" data-act="bleConnect">'+esc(t('Connect device'))+'</button>';
  }else h+='<p class="pm muted">'+esc(t('Not available in this browser. iPhone Safari does not allow websites to use Bluetooth. This works in Chrome on Android. On iPhone, use Quick sync above.'))+'</p>';
  return h+'</section></div>';
}
function checkHashSync(){
  var hs=location.hash||'';if(hs.indexOf('#sync=')!==0)return;var data='';try{data=decodeURIComponent(hs.slice(6).replace(/\+/g,' '));}catch(e){}
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  var r=parsePayload(data);if(r.total)setTimeout(function(){previewSync(r,'shortcut');},500);
}

/* =====================================================================
   ACTIONS, EVENTS, BOOT
   ===================================================================== */
function applyPrefs(){nativeLoc={};
  var s=DB.settings,l=s.lang;if(!l){var nl=(navigator.language||'en').slice(0,2);l=nl==='si'||nl==='ta'?nl:'en';}
  LANG=l;document.documentElement.lang=l;document.documentElement.setAttribute('data-size',s.size||'normal');
  var th=s.theme||'auto';document.documentElement.setAttribute('data-theme',th);
  var dark=th==='dark'||(th==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  var m=$('meta[name=theme-color]');if(m)m.setAttribute('content',dark?'#0B111B':'#F2F5FA');
  $$('[data-i18n]').forEach(function(el){el.textContent=t(el.getAttribute('data-i18n'));});
}
function takeGroup(time,status){var p=P(),day=dKey();schedule(p.id,day).forEach(function(x){if(!x.prn&&x.time===time&&!x.status)setDose(x.m,day,time,status);});
  toast(status==='taken'?'✓ '+t('Marked as taken'):t('Skipped'));if(status==='taken'&&navigator.vibrate)navigator.vibrate(20);view(true);}
var ACT={
  go:function(d){if(d.sub&&d.tab==='meds'){medSub=d.sub;go('meds');return;}go(d.tab,d.sub);},
  trackGo:function(d){trackType=d.type;if(R.tab!=='track')go('track');else view(true);},
  addLog:function(d){addLog(d.type);},editLog:function(d){editLog(d.id);},
  water:function(d){var ml=+d.ml,p=P(),before=waterOn(dKey());put('logs',{id:uid(),pid:p.id,type:'water',t:localDT(new Date())+':00',v:{v:ml},note:''});
    var goal=+p.waterGoal||2000;toast(before<goal&&before+ml>=goal?'🎉 '+t('Daily water goal reached!'):'💧 +'+ml+' ml');view(true);},
  waterUndo:function(){var day=dKey(),L=mine('logs').filter(function(e){return e.type==='water'&&e.t.slice(0,10)===day;}).sort(function(a,b){return a.t<b.t?-1:1;});if(L.length){del('logs',L[L.length-1]);toast(t('Removed'));view(true);}},
  moodQuick:function(d){put('logs',{id:uid(),pid:P().id,type:'mood',t:localDT(new Date())+':00',v:{v:+d.v},note:''});toast(MOODS[+d.v][0]+' '+t('Thanks for checking in.'));view(true);if(+d.v<=2)setTimeout(function(){addLog('symptom');},600);},
  moodPick:function(){addLog('mood');},
  tool:function(d){toolOpen=d.id;view();window.scrollTo(0,0);},toolBack:function(){toolOpen=null;view();window.scrollTo(0,0);},
  setWaterGoal:function(d){var p=P();p.waterGoal=+d.ml;put('people',p);toast(t('Water goal set to {n} L',{n:(+d.ml/1000).toFixed(1)}));},
  medSub:function(d){medSub=d.sub;view();},
  addMed:function(){addMed();},editMed:function(d){closeSheet();setTimeout(function(){editMed(d.id);},sheetOpen?330:0);},
  take:function(d,el){var m=byId('meds',d.id);if(!m)return;var st=setDose(m,d.day,d.time,'taken');
    if(el.classList.contains('s-row')){toast(st?'✓ '+t('Marked as taken'):t('Unmarked'));view(true);return;}
    el.classList.toggle('on',st==='taken');el.classList.remove('skip');el.setAttribute('aria-pressed',String(st==='taken'));var li=el.closest('li');if(li){li.classList.toggle('done',st==='taken');li.classList.remove('skipped');}
    if(st&&navigator.vibrate)navigator.vibrate(15);toast(st?'✓ '+t('Marked as taken'):t('Unmarked'));setTimeout(function(){view(true);},450);},
  doseMenu:function(d){doseMenu(d);},
  doseSet:function(d){var m=byId('meds',d.id);if(!m)return;var st=setDose(m,d.day,d.time,d.st);closeSheet();toast(st==='taken'?'✓ '+t('Marked as taken'):st==='skipped'?t('Skipped'):t('Unmarked'));view(true);},
  takeGroup:function(d){takeGroup(d.time,'taken');},skipGroup:function(d){takeGroup(d.time,'skipped');},
  prn:function(d){var m=byId('meds',d.id);if(!m)return;logPrn(m);toast(t('Dose logged at {t}',{t:fTime(new Date())}));view(true);},
  timesPreset:function(d){var v=d.v.split(',');$$('#timesBox input[type=time]').forEach(function(inp,i){inp.value=v[i]||'';inp.classList.toggle('hidden',i>=Math.max(3,v.length+1));});},
  medIcs:function(){medIcs();},addAppt:function(){addAppt();},editAppt:function(d){editAppt(d.id);},apptIcs:function(d){apptIcs(d.id);},
  editPerson:function(){editPerson();},addPerson:function(){closeSheet();setTimeout(addPerson,sheetOpen?330:0);},switcher:function(){switcher();},
  switchTo:function(d){DB.active=d.id;save();closeSheet();toast(t('Now viewing {n}',{n:pname(P())}));view(true);},
  delPerson:function(d){var x=byId('people',d.id);if(!x)return;confirmBox(t('Remove {n} and all their records? This cannot be undone.',{n:pname(x)}),'Remove',function(){delPerson(x);toast(t('{n} removed',{n:pname(x)}));view(true);});},
  addRecord:function(){addRecord();},editRecord:function(d){editRecord(d.id);},
  printCard:function(){printSummary();},shareLocation:function(){shareLocation();},shareMsg:function(d){shareText(t('My Health'),d.msg);},
  theme:function(d){DB.settings.theme=d.val;save();applyPrefs();view(true);},
  setLang:function(d){DB.settings.lang=d.val;save();applyPrefs();view(true);Push.refresh();},
  setSize:function(d){DB.settings.size=d.val;save();applyPrefs();view(true);},
  setSound:function(d){DB.settings.sound=d.val;save();view(true);if(d.val!=='off'){Alarm.sound();setTimeout(function(){Alarm.stopSound();},1500);}},
  toggleSimple:function(){DB.settings.simple=!DB.settings.simple;save();toast(t(DB.settings.simple?'Simple mode on':'Simple mode off'));go('home');},
  exitSimple:function(){confirmBox(t('Open the full app with all features?'),'Open',function(){DB.settings.simple=false;save();go('home');},false);},
  alarmTest:function(){Alarm.test();},alarmTake:function(){Alarm.act('take');},alarmSkip:function(){Alarm.act('skip');},alarmSnooze:function(){Alarm.act('snooze');},
  exportJson:exportJson,exportCsv:exportCsv,importJson:function(){$('#importFile').value='';$('#importFile').click();},
  eraseAll:function(){confirmBox(t('Erase ALL data on this phone? Data shared with your family stays in the cloud.'),'Erase everything',function(){var signed=!!Cloud.user;(signed?Cloud.signOut():Promise.resolve()).then(function(){try{localStorage.removeItem(KEY);localStorage.removeItem('myhealth.v1');}catch(e){}DB=defaults();DB.settings.onboarded=true;save(true);applyPrefs();toast(t('All data erased'));go('home');});});},
  installHelp:function(){installHelp();},
  setupHide:function(){DB.settings.setupDone=true;save();view(true);},
  notifySetup:function(){notifySetup();},familySetup:function(){go('more',Cloud.user?'family':'account');},
  localAlarmsOnly:function(){closeSheet();DB.settings.alarms=true;save();if(typeof Notification!=='undefined'&&Notification.permission==='default')Notification.requestPermission().then(function(){view(true);});toast(t('In-app alarms are on'));},
  signUp:function(){closeSheet();setTimeout(signUpSheet,sheetOpen?330:0);},signIn:function(){closeSheet();setTimeout(signInSheet,sheetOpen?330:0);},
  forgotPw:function(){closeSheet();setTimeout(forgotSheet,330);},changePw:function(){newPasswordSheet();},
  signOut:function(){confirmBox(t('Sign out? Your data stays on this phone, but alarms when the app is closed will stop.'),'Sign out',function(){Push.disable().catch(function(){}).then(function(){return Cloud.signOut();}).then(function(){toast(t('Signed out'));});},false);},
  deleteAccount:function(){confirmBox(t('Delete your account permanently? You will leave all family groups. Data on this phone is kept.'),'Delete account',function(){Push.disable().catch(function(){}).then(function(){return Cloud.sb.rpc('delete_my_account');}).then(function(r){if(r&&r.error)throw r.error;return Cloud.signOut();}).then(function(){toast(t('Account deleted'));}).catch(function(e){toast(authErr(e));});});},
  syncNow:function(){Cloud.sync().then(function(){toast(Cloud.lastErr?t('Could not sync — check your internet'):t('Synced'));view(true);});},
  invite:function(d){inviteSheet(d.id);},
  newCircle:function(){openSheet(t('New family group'),field({k:'name',l:'Group name',ph:'e.g. Wijesingha family'}),function(dd){if(!dd.name)return t('Please enter a name.');return Cloud.createCircle(dd.name).then(function(){toast(t('Family group created'));view(true);}).catch(authErr);},{ok:'Create',focus:'#f_name'});},
  joinCircle:function(){closeSheet();setTimeout(function(){joinSheet(pendingJoin()||'');},sheetOpen?330:0);},
  obCreate:function(){closeSheet();createCircleFlow().catch(function(e){toast(authErr(e));});},
  iAm:function(d){closeSheet();if(d.id){DB.me=d.id;DB.active=d.id;var s=DB.settings.push;if(s.remind.indexOf(d.id)<0)s.remind.push(d.id);
      live('people').forEach(function(p){if(!p.circle&&!p.name&&!mine('meds',p.id).length&&!mine('logs',p.id).length&&p.id!==d.id){DB.people.splice(DB.people.indexOf(p),1);}});save();
      Push.refresh();setTimeout(function(){if(!s.on)notifySetup();},500);}
    else{live('people').forEach(function(p){if(!p.circle&&!p.name&&!mine('meds',p.id).length){DB.people.splice(DB.people.indexOf(p),1);}});if(!byId('people',DB.active))DB.active=live('people')[0].id;if(!byId('people',DB.me))DB.me=DB.active;save();setTimeout(function(){go('more','notify');},400);}
    view(true);},
  leaveCircle:function(d){confirmBox(t('Leave {c}? You will stop seeing and syncing its people. Copies stay on this phone.',{c:Cloud.circleName(d.id)}),'Leave',function(){Cloud.leave(d.id).then(function(){toast(t('You left the group'));view(true);}).catch(function(e){toast(authErr(e));});});},
  pushOn:function(el){Push.enable().then(function(){toast('🔔 '+t('Alarms are on'));view(true);}).catch(function(e){infoBox(t('Could not turn on alarms'),'<p class="lead">'+esc(e.message||String(e))+'</p>');});},
  pushOff:function(){Push.disable().then(function(){toast(t('Alarms turned off'));view(true);});},
  pushTest:function(){toast(t('Sending…'));Push.test().then(function(){toast('✓ '+t('Test sent — it should arrive in a few seconds'));}).catch(function(e){toast(e.message||String(e),4000);});},
  syncPage:function(){go('more','sync');},pasteSync:function(){pasteSync();},
  pickApple:function(){$('#hkFile').value='';$('#hkFile').click();},pickCsv:function(){$('#csvFile').value='';$('#csvFile').click();},
  doImport:function(){var ps=pendingSync;pendingSync=null;closeSheet();if(!ps)return;var r=commitSync(ps.res,ps.src);toast('✓ '+t('Imported · {a} new, {b} updated',{a:r.added,b:r.updated}));setTimeout(function(){view(true);},50);},
  clearImported:function(){confirmBox(t('Remove all readings imported from watches for {n}? Readings you entered yourself are kept.',{n:pname(P())}),'Remove',function(){mine('logs').filter(function(e){return e.src&&e.src!=='ble';}).forEach(function(e){del('logs',e);});delete DB.watch[P().id];save();toast(t('Imported data removed'));view(true);});},
  bleConnect:function(){bleConnect();},bleDisconnect:function(){bleDisconnect();},bleSave:function(){bleSave();},
  welcomeLang:function(d){DB.settings.lang=d.val;save();applyPrefs();closeSheet();setTimeout(welcomeStep2,340);},
  reloadApp:function(){if(window.__swWaiting)window.__swWaiting.postMessage('skipWaiting');else location.reload();},
  closeSheet:function(){closeSheet();},
  sheetDel:function(){var fn=sheetDel;confirmBox(t('Delete this item? This cannot be undone.'),'Delete',fn);},
  confirmOk:function(){var fn=confirmFn;confirmFn=null;closeSheet();if(fn)setTimeout(fn,60);}
};
var ACT2={
  remind:function(el){var s=DB.settings.push;if(!s.remind.length&&!el.checked)s.remind=[DB.me];var i=s.remind.indexOf(el.value);if(el.checked&&i<0)s.remind.push(el.value);if(!el.checked&&i>=0)s.remind.splice(i,1);
    var p=byId('people',el.value);if(el.checked&&p&&!p.circle&&Cloud.circles[0]){Cloud.moveTo(p,Cloud.circles[0].id);toast(t('{n} is now shared with your family group so alarms can reach this phone',{n:pname(p)}),4000);}
    save();Push.refresh();},
  missed:function(el){var s=DB.settings.push,i=s.missed.indexOf(el.value);if(el.checked&&i<0)s.missed.push(el.value);if(!el.checked&&i>=0)s.missed.splice(i,1);
    var p=byId('people',el.value);if(el.checked&&p&&!p.circle&&Cloud.circles[0])Cloud.moveTo(p,Cloud.circles[0].id);save();Push.refresh();},
  water:function(el){DB.settings.push.water=el.checked;save();Push.refresh();},
  alarms:function(el){DB.settings.alarms=el.checked;save();},
  vibrate:function(el){DB.settings.vibrate=el.checked;save();}
};
function welcome(){
  openSheet('👋 Welcome · ආයුබෝවන් · வணக்கம்','<p class="lead center">Choose your language<br>භාෂාව තෝරන්න · மொழியைத் தேர்ந்தெடுக்கவும்</p><div class="choice">'+[['en','English'],['si','සිංහල'],['ta','தமிழ்']].map(function(x){return '<button class="btn s full big" data-act="welcomeLang" data-val="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>',null,{onClose:function(){if(!DB.settings.lang){DB.settings.lang=LANG;}}});
}
function welcomeStep2(){
  var me=personOf(DB.me);
  openSheet(t('Welcome to My Health'),'<p class="lead">'+esc(t('Medicines with alarms, health readings, family caregiving and emergency details — in one simple app.'))+'</p>'+
    field({k:'name',l:'Your name',val:me&&me.name||'',ph:'e.g. Ashen'})+
    field({k:'mode',l:'Who will use the app on this phone?',type:'select',val:'std',opts:{std:'Me — show all features',simple:'An older person — big buttons, simple screen'}}),
    function(d){if(me){me.name=(d.name||'').slice(0,40);put('people',me);}DB.settings.onboarded=true;DB.settings.simple=d.mode==='simple';save();view();toast(t('All set!'));},{ok:'Start'});
}
function handleUrl(){
  var q=new URLSearchParams(location.search),changed=false;
  if(q.get('alarm')&&q.get('alarm')!=='local'){var k=q.get('alarm'),tk=q.get('tok')||'';setTimeout(function(){Alarm.fromPush(k,tk);},600);changed=true;}
  if(q.get('person')&&byId('people',q.get('person'))){DB.active=q.get('person');changed=true;}
  if(q.get('go')){var g=q.get('go');if(g==='meds')R.tab='meds';else if(g==='sos'){R.tab='more';R.sub='sos';}else if(g==='bp'){setTimeout(function(){addLog('bp');},500);}changed=true;}
  if(q.get('join')){DB.cloud.join=q.get('join').toUpperCase();save();setTimeout(function(){if(Cloud.user)joinSheet(DB.cloud.join);else{toast(t('Create an account or sign in to join your family'),4000);go('more','account');}},900);}
  if(changed){try{history.replaceState(null,'',location.pathname);}catch(e){}}
}
function registerSW(){
  if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
  navigator.serviceWorker.register('sw.js').then(function(reg){
    var ask=function(w){window.__swWaiting=w;var b=$('#update');if(b)b.classList.add('on');};
    if(reg.waiting&&navigator.serviceWorker.controller)ask(reg.waiting);
    reg.addEventListener('updatefound',function(){var w=reg.installing;if(!w)return;w.addEventListener('statechange',function(){if(w.state==='installed'&&navigator.serviceWorker.controller)ask(w);});});
    setInterval(function(){reg.update().catch(function(){});},3600000);
  }).catch(function(e){console.warn('SW',e);});
  var reloading=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloading)return;reloading=true;location.reload();});
  navigator.serviceWorker.addEventListener('message',function(e){var d=e.data||{};if(d.type==='refresh'||d.type==='push'){Cloud.soon(300);}if(d.type==='push'&&d.data&&d.data.kind==='due'&&!document.hidden&&!Alarm.shown){Alarm.fromPush(d.data.key,d.data.tok);Alarm.sound();}if(d.type==='alarm'&&d.key)Alarm.fromPush(d.key,d.tok);});
}
document.addEventListener('click',function(e){
  var sb=e.target.closest('[data-seg] button');
  if(sb){var sg=sb.parentNode;$$('button',sg).forEach(function(b){b.setAttribute('aria-pressed',String(b===sb));});var hid=sg.nextElementSibling;if(hid&&hid.type==='hidden')hid.value=sb.dataset.val;if(sg.closest('[data-calc]'))runCalc();return;}
  var el=e.target.closest('[data-act]');if(!el)return;var a=el.dataset.act;if(!ACT[a])return;if(el.tagName==='A'&&el.getAttribute('href'))return;
  e.preventDefault();try{ACT[a](el.dataset,el,e);}catch(err){console.error(err);toast(t('Something went wrong'));}
});
document.addEventListener('change',function(e){var el=e.target;
  if(el.dataset&&el.dataset.act2&&ACT2[el.dataset.act2]){ACT2[el.dataset.act2](el);return;}
  if(el.closest('[data-calc]'))runCalc();
  if(el.id==='importFile'&&el.files[0])importJson(el.files[0]);
  if(el.id==='hkFile'&&el.files[0]){var ds=$('#f_hkDays');importApple(el.files[0],ds?+ds.value:90);}
  if(el.id==='csvFile'&&el.files[0]){var fr=new FileReader();fr.onload=function(){csvSheet(String(fr.result));};fr.readAsText(el.files[0]);}
});
document.addEventListener('input',function(e){if(e.target.closest('[data-calc]'))runCalc();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(Alarm.shown)return;if(sheetOpen)closeSheet();}if(e.key==='Enter'&&e.target.closest('[data-calc]')&&e.target.tagName==='INPUT'){e.preventDefault();e.target.blur();}});
window.addEventListener('scroll',function(){var tp=$('#top');if(tp)tp.classList.toggle('scrolled',window.scrollY>4);},{passive:true});
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e;});
window.addEventListener('appinstalled',function(){window.__bip=null;toast(t('My Health is installed'));});
(function(){var sy=null,dy=0,sh=$('#sheet');sh.addEventListener('touchstart',function(e){if($('#sheetBody').scrollTop>0&&!e.target.closest('.hd,.grab'))return;sy=e.touches[0].clientY;dy=0;},{passive:true});
  sh.addEventListener('touchmove',function(e){if(sy==null)return;dy=e.touches[0].clientY-sy;if(dy>0){sh.style.transition='none';sh.style.transform='translateY('+dy+'px)';}},{passive:true});
  sh.addEventListener('touchend',function(){if(sy==null)return;sh.style.transition='';sh.style.transform='';if(dy>110)closeSheet();sy=null;});})();
if(window.matchMedia){var mq=matchMedia('(prefers-color-scheme: dark)');var fn=function(){applyPrefs();};if(mq.addEventListener)mq.addEventListener('change',fn);else if(mq.addListener)mq.addListener(fn);}
var lastDay=dKey();document.addEventListener('visibilitychange',function(){if(!document.hidden){if(dKey()!==lastDay){lastDay=dKey();view(true);}Alarm.check();}});
window.addEventListener('storage',function(e){if(e.key===KEY){load();view(true);}});
window.addEventListener('hashchange',checkHashSync);
// keep "late / due" labels fresh
setInterval(function(){if(!sheetOpen&&!Alarm.shown&&!document.hidden&&(R.tab==='home'||R.tab==='meds')&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('input,select,textarea')))view(true);},60000);

/* ---------- Boot ---------- */
load();applyPrefs();handleUrl();view();
Cloud.init();Alarm.start();registerSW();checkHashSync();
if(!DB.settings.onboarded)setTimeout(welcome,400);
if(!storageOK)toast(t('Private browsing: data will not be saved'));

})();
