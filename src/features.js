/* ======================================================================
   v8: review history, streak, weekly goal, celebrations, badges,
   exams (deneme), weekly parent report, topic review, attention notes,
   bulk add, similar questions
   ====================================================================== */
function sic(p,fill){return '<svg viewBox="0 0 24 24" fill="'+(fill?"currentColor":"none")+'" stroke="'+(fill?"none":"currentColor")+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
Object.assign(ICONS,{
  flame:sic('<path d="M12 2c1 3.2-.6 5-2.2 6.7C8.2 10.4 6.5 12.2 6.5 15a5.5 5.5 0 0 0 11 0c0-2.3-1-4.2-2.3-5.6.1 1.6-.5 2.8-1.6 3.4.4-3.6-.6-7.2-1.6-10.8z"/>',true),
  bulb:sic('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>'),
  mic:sic('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  spark:sic('<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>'),
  star:sic('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',true),
  target:sic('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2"/>'),
  loop:sic('<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/>'),
  trophy:sic('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>'),
  plus:sic('<path d="M12 5v14M5 12h14"/>'),
  chart:sic('<path d="M4 19h16"/><path d="M5 15l4.5-4.5 3 3L19 7"/>'),
  stack:sic('<rect x="4" y="9" width="16" height="11" rx="3"/><path d="M7 6h10M9 3h6"/>'),
  edit:sic('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>')
});

/* ---------- dates ---------- */
var WD=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
function weekStartDate(off){var n=new Date(),d=new Date(n.getFullYear(),n.getMonth(),n.getDate());d.setDate(d.getDate()-((d.getDay()+6)%7)+7*(off||0));return d}
function weekDays(off){var s=weekStartDate(off),out=[];for(var i=0;i<7;i++){var d=new Date(s);d.setDate(s.getDate()+i);out.push(ymd(d))}return out}
function daysBetween(a,b){return Math.round((parse(b)-parse(a))/86400000)}
function shortDate(s){var d=parse(s);return d.getDate()+" "+MONTHS[d.getMonth()].slice(0,3)}
function weekRange(off){var d=weekDays(off);return shortDate(d[0])+" – "+shortDate(d[6])}
function fmtSec(s){return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}

/* ---------- study history (from each question's hist list) ---------- */
var _sdFor=null,_sd=null;
function studyMap(){
  if(_sdFor===items&&_sd)return _sd;
  var m={};
  items.forEach(function(it){(it.hist||[]).forEach(function(h){var x=m[h[0]]||(m[h[0]]={n:0,ok:0});x.n++;if(h[1])x.ok++})});
  _sdFor=items;_sd=m;return m;
}
function streakInfo(){
  var m=studyMap(),d=new Date(),t=todayStr(),cur=0;
  if(!m[t])d.setDate(d.getDate()-1);
  while(m[ymd(d)]){cur++;d.setDate(d.getDate()-1)}
  var ds=Object.keys(m).sort(),best=0,run=0;
  for(var i=0;i<ds.length;i++){run=(i&&daysBetween(ds[i-1],ds[i])===1)?run+1:1;if(run>best)best=run}
  return {cur:cur,best:Math.max(best,cur),today:!!m[t]};
}
function goalWeeks(){
  var m=studyMap(),wk={},g=S.weekGoal||5;
  Object.keys(m).forEach(function(s){var d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));var k=ymd(d);wk[k]=(wk[k]||0)+1});
  return Object.keys(wk).filter(function(k){return wk[k]>=g}).length;
}
function weekNow(){var m=studyMap();return {today:!!m[todayStr()],done:weekDays(0).filter(function(d){return m[d]}).length,streak:streakInfo().cur}}

/* ---------- home pieces ---------- */
function streakChip(){
  var s=streakInfo();if(!s.cur)return null;
  var c=el("span","streak"+(s.today?"":" wait"));c.innerHTML=ICONS.flame;c.appendChild(document.createTextNode(s.cur+" gün"));
  c.title=s.today?"Seri devam ediyor":"Bugün tekrar yaparsan seri devam eder";
  c.setAttribute("aria-label",s.cur+" günlük seri");return c;
}
function daysRow(days,m,t){
  var r=el("div","days");
  days.forEach(function(d,i){
    var x=el("button","d"+(m[d]?" on":"")+(d===t?" today":"")+(d>t?" future":""));x.type="button";
    var ic=el("i");if(m[d])ic.innerHTML=ICONS.check;x.appendChild(ic);x.appendChild(el("span",null,WD[i]));
    x.setAttribute("aria-label",WD[i]+" "+shortDate(d)+(m[d]?", çalışıldı":"")+". O günün sorularını aç");
    x.addEventListener("click",function(){openDay(d)});r.appendChild(x);
  });
  return r;
}
function weekCard(){
  var m=studyMap(),days=weekDays(0),done=days.filter(function(d){return m[d]}).length,g=S.weekGoal||5;
  var c=el("div","card week");var h=el("div","head");
  var l=el("div");l.appendChild(el("h3",null,"Bu hafta"));l.appendChild(el("b",null,done+" / "+g+" gün"));h.appendChild(l);
  h.appendChild(el("span","pill"+(done>=g?" done":""),done>=g?"Hedef tamam":"Hedef: haftada "+g+" gün"));
  c.appendChild(h);c.appendChild(daysRow(days,m,todayStr()));
  c.appendChild(el("p","muted small daytip","Bir güne dokun: o gün çözülen, eklenen ya da gelecek sorular açılır."));return c;
}

/* ---------- celebrations ---------- */
var MILESTONES=[1,10,25,50,100,150,200,300,400,500,750,1000];
function celebrateMastered(from,to){
  var hit=MILESTONES.filter(function(x){return x>from&&x<=to}).pop();
  if(hit){confetti();toast(hit===1?"🎉 İlk sorunu öğrendin! Böyle devam.":"🎉 "+hit+". soruyu öğrendin! Harikasın.")}
  else toast("🎉 Öğrenildi! Toplam "+to+" soru öğrendin.");
}
function afterStudy(wk){
  if(wk.today)return;
  var g=S.weekGoal||5,done=wk.done+1;
  setTimeout(function(){
    if(done===g){confetti();toast("🎯 Haftalık hedef tamam! Bu hafta "+done+" gün çalıştın.")}
    else if(wk.streak>=1)toast("🔥 Seri "+(wk.streak+1)+" gün oldu!");
  },1700);
}
function confetti(){
  try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return}catch(e){}
  var c=document.createElement("canvas");c.className="confetti";c.setAttribute("aria-hidden","true");document.body.appendChild(c);
  var dpr=Math.min(2,window.devicePixelRatio||1),W=c.width=innerWidth*dpr,H=c.height=innerHeight*dpr,x=c.getContext("2d");
  var cols=["#3B5BFD","#E5484D","#FFC93C","#14915A","#8B5CF6","#FF8A3D"],P=[];
  for(var i=0;i<130;i++)P.push({x:W/2+(Math.random()-.5)*W*.35,y:H*.38,vx:(Math.random()-.5)*W*.02,vy:-(Math.random()*H*.022+H*.006),s:(6+Math.random()*6)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.35,c:cols[i%cols.length]});
  var t0=performance.now();
  (function f(t){
    x.clearRect(0,0,W,H);
    P.forEach(function(p){p.vy+=H*.0007;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
    if(t-t0<2400)requestAnimationFrame(f);else c.remove();
  })(t0);
}

/* ---------- badges ---------- */
var BADGES=[
  ["İlk tekrar","reviews",1,"star"],["3 gün seri","best",3,"flame"],["7 gün seri","best",7,"flame"],["30 gün seri","best",30,"flame"],
  ["10 öğrenildi","mastered",10,"check"],["50 öğrenildi","mastered",50,"check"],["100 öğrenildi","mastered",100,"trophy"],["Hafta hedefi","goalWeeks",1,"target"],
  ["100 tekrar","reviews",100,"loop"],["500 tekrar","reviews",500,"loop"],["5 deneme","exams",5,"chart"],["100 soru","added",100,"stack"]
];
function badgesCard(){
  var si=streakInfo(),st={best:si.best,mastered:items.filter(function(i){return i.mastered}).length,reviews:items.reduce(function(s,i){return s+(i.reviews||0)},0),goalWeeks:goalWeeks(),exams:loadExams().length,added:items.length};
  var got=BADGES.filter(function(b){return st[b[1]]>=b[2]}).length;
  var c=el("div","card");var h=el("div","row between");h.appendChild(el("h3",null,"Rozetler"));h.appendChild(el("span","muted small",got+" / "+BADGES.length));c.appendChild(h);
  var g=el("div","badges");
  BADGES.forEach(function(b){
    var on=st[b[1]]>=b[2],d=el("div","badge-i"+(on?" on":""));var i=el("span","b");i.innerHTML=ICONS[b[3]];d.appendChild(i);
    d.appendChild(el("span","t",b[0]));if(!on)d.appendChild(el("span","p",Math.min(st[b[1]],b[2])+" / "+b[2]));
    d.setAttribute("aria-label",b[0]+(on?", kazanıldı":", "+Math.min(st[b[1]],b[2])+" / "+b[2]));g.appendChild(d);
  });
  c.appendChild(g);return c;
}

/* ---------- analysis tabs ---------- */
var anTab="genel";
function renderStats(){
  var box=$("#v-analiz");box.replaceChildren();var w=stack(box);w.style.gap="16px";
  w.appendChild(el("h1",null,"Analiz"));
  var sg=el("div","seg");
  [["genel","Genel"],["deneme","Denemeler"],["rapor","Rapor"]].forEach(function(o){var b=el("button",null,o[1]);b.type="button";b.setAttribute("aria-pressed",String(anTab===o[0]));b.addEventListener("click",function(){anTab=o[0];renderStats();window.scrollTo(0,0)});sg.appendChild(b)});
  w.appendChild(sg);
  if(anTab==="deneme"){renderExams(w);return}
  if(storeNotice(w))return;
  if(anTab==="rapor")renderReport(w);else renderGeneral(w);
}

/* ---------- exams (deneme) ---------- */
var EXAM_ROWS=[["tr",20],["sos",10],["din",10],["ing",10],["mat",20],["fen",20]];
function exShort(k,g){return {tr:"Türkçe",sos:(g||S.grade)===8?"İnkılap":"Sosyal",din:"Din Kült.",ing:"İngilizce",mat:"Matematik",fen:"Fen Bil."}[k]||subj(k).n}
function loadExams(){try{var a=JSON.parse(lsGet("exams")||"[]");return Array.isArray(a)?a.filter(function(e){return e&&e.id&&Array.isArray(e.rows)}):[]}catch(e){return []}}
function saveExams(a){lsSet("exams",JSON.stringify(a))}
function mergeExams(arr){
  if(!Array.isArray(arr))return 0;var cur=loadExams(),map={},n=0;
  cur.forEach(function(e){map[e.id]=e});arr.forEach(function(e){if(e&&e.id&&Array.isArray(e.rows)){map[e.id]=e;n++}});
  saveExams(Object.keys(map).map(function(k){return map[k]}));return n;
}
function rowNet(r){return (+r.d||0)-(+r.y||0)/3}
function examNet(e){return e.rows.reduce(function(s,r){return s+rowNet(r)},0)}
function examMax(e){return e.rows.reduce(function(s,r){return s+(+r.n||0)},0)}
function fmtNet(v){var x=Math.round(v*100)/100;return x.toLocaleString("tr-TR",{minimumFractionDigits:Math.abs(x%1)>0.001?2:0,maximumFractionDigits:2})}
function sortedExams(){return loadExams().sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:(a.created||0)-(b.created||0)})}
var exState=null;
function openExam(id){
  var e=id?loadExams().filter(function(x){return x.id===id})[0]:null;
  if(e)exState=JSON.parse(JSON.stringify(e));
  else{
    var last=sortedExams().pop();
    exState={id:null,name:"",date:todayStr(),grade:S.grade||7,rows:(last?last.rows.map(function(r){return [r.k,r.n]}):EXAM_ROWS).map(function(r){return {k:r[0],n:r[1],d:"",y:""}})};
  }
  exState.confirm=false;
  $("#exam").hidden=false;pushLayer("exam",closeExam);renderExam();
}
function closeExam(){exState=null;$("#exam").hidden=true;uiClosed("exam");render()}
function renderExam(){
  var E=exState;if(!E)return;var box=$("#exam");box.replaceChildren();
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closeExam));top.appendChild(el("h2",null,E.id?"Denemeyi düzenle":"Deneme ekle"));box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  var c=el("div","card");
  var g1=group("Deneme adı",true);var ni=el("input","field");ni.id="ex-name";ni.placeholder="Örn. Yayınevi adı, Deneme 3";ni.value=E.name||"";ni.maxLength=60;ni.setAttribute("list","dl-ex");ni.addEventListener("input",function(){E.name=ni.value});
  var dl=el("datalist");dl.id="dl-ex";uniq(loadExams().map(function(x){return x.name})).forEach(function(t){var o=el("option");o.value=t;dl.appendChild(o)});g1.appendChild(ni);g1.appendChild(dl);c.appendChild(g1);
  var g2=group("Tarih");var di=el("input","field");di.type="date";di.id="ex-date";di.value=E.date;di.max=todayStr();di.addEventListener("change",function(){if(di.value)E.date=di.value});g2.appendChild(di);c.appendChild(g2);
  w.appendChild(c);
  var c2=el("div","card");c2.appendChild(el("h3",null,"Doğru ve yanlış sayıları"));
  var gr=el("div","exgrid");["Ders","Soru","Doğru","Yanlış","Net"].forEach(function(h){gr.appendChild(el("span","h",h))});
  E.rows.forEach(function(r){
    var nm=el("span","nm",exShort(r.k,E.grade));nm.style.setProperty("--c","var(--s-"+r.k+")");gr.appendChild(nm);
    ["n","d","y"].forEach(function(f){
      var i=el("input");i.type="text";i.inputMode="numeric";i.autocomplete="off";i.id="ex-"+r.k+"-"+f;i.value=(r[f]===""||r[f]==null)?"":String(r[f]);i.placeholder=f==="n"?"":"0";
      i.setAttribute("aria-label",exShort(r.k,E.grade)+" "+({n:"soru sayısı",d:"doğru",y:"yanlış"})[f]);
      i.addEventListener("input",function(){var v=i.value.replace(/[^0-9]/g,"").slice(0,2);if(v!==i.value)i.value=v;r[f]=v===""?"":+v;examLive()});
      i.addEventListener("focus",function(){try{i.select()}catch(e){}});
      gr.appendChild(i);
    });
    var nt=el("span","net");nt.id="ex-net-"+r.k;gr.appendChild(nt);
  });
  c2.appendChild(gr);
  var tot=el("div","extotal");var tl=el("div");tl.appendChild(el("span","muted small","Toplam net"));var tb=el("b");tb.id="ex-total";tl.appendChild(tb);tot.appendChild(tl);var ts=el("span","muted small");ts.id="ex-sub";tot.appendChild(ts);c2.appendChild(tot);
  c2.appendChild(el("p","muted small","Net = Doğru − Yanlış ÷ 3. LGS kuralı: 3 yanlış 1 doğruyu götürür, boşlar hesaba katılmaz."));
  w.appendChild(c2);
  if(E.id){
    if(!E.confirm)w.appendChild(btn("danger block","Denemeyi sil",function(){E.confirm=true;renderExam()}));
    else{var cf=el("div","confirm");cf.appendChild(el("b",null,"Bu deneme silinsin mi?"));var cb=el("div","btns");cb.appendChild(btn("ghost","Vazgeç",function(){E.confirm=false;renderExam()}));
      cb.appendChild(btn("bad","Evet, sil",function(){saveExams(loadExams().filter(function(x){return x.id!==E.id}));anTab="deneme";closeExam();toast("Deneme silindi.")}));cf.appendChild(cb);w.appendChild(cf)}
  }
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  var sv=btn("primary","Kaydet",saveExam,ICONS.check);sv.id="ex-save";fin.appendChild(sv);box.appendChild(foot);
  examLive();
}
function examLive(){
  var E=exState;if(!E)return;var bad=false,any=false,blank=0;
  E.rows.forEach(function(r){
    var n=+r.n||0,d=+r.d||0,y=+r.y||0,over=d+y>n;if(over)bad=true;if(r.d!==""||r.y!=="")any=true;blank+=Math.max(0,n-d-y);
    var ne=$("#ex-net-"+r.k);if(ne){ne.textContent=(r.d===""&&r.y==="")?"–":fmtNet(rowNet(r));ne.classList.toggle("bad",over)}
    ["d","y"].forEach(function(f){var i=$("#ex-"+r.k+"-"+f);if(i)i.classList.toggle("bad",over)});
  });
  var t=$("#ex-total");if(t)t.textContent=fmtNet(examNet(E))+" / "+examMax(E);
  var s=$("#ex-sub");if(s){s.textContent=bad?"Doğru + yanlış, soru sayısını geçemez.":"Boş: "+blank;s.classList.toggle("errtxt",bad)}
  var b=$("#ex-save");if(b)b.disabled=bad||!any;
}
function saveExam(){
  var E=exState;if(!E)return;
  var rec={id:E.id||newId("e"),name:(E.name||"").trim(),date:E.date||todayStr(),grade:E.grade||S.grade||7,created:E.created||Date.now(),rows:E.rows.map(function(r){return {k:r.k,n:+r.n||0,d:+r.d||0,y:+r.y||0}})};
  var prevBest=sortedExams().filter(function(x){return x.id!==rec.id}).map(examNet);
  var all=loadExams().filter(function(x){return x.id!==rec.id});all.push(rec);saveExams(all);
  var wasNew=!E.id;anTab="deneme";closeExam();
  toast(wasNew?"Deneme kaydedildi. Toplam net: "+fmtNet(examNet(rec)):"Değişiklikler kaydedildi.");
  if(wasNew&&prevBest.length&&examNet(rec)>Math.max.apply(null,prevBest))setTimeout(function(){confetti();toast("🏆 Şimdiye kadarki en yüksek netin: "+fmtNet(examNet(rec)))},1600);
}
var exChart="all";
function renderExams(w){
  var list=sortedExams();
  w.appendChild(btn("primary block","Deneme ekle",function(){openExam(null)},ICONS.plus));
  if(!list.length){w.appendChild(el("p","notice","Her deneme sınavından sonra ders ders doğru ve yanlış sayılarını gir. Program LGS kuralıyla neti hesaplar (3 yanlış 1 doğruyu götürür) ve gelişimi grafikte gösterir."));return}
  var nets=list.map(examNet),last=nets[nets.length-1],prev=nets.length>1?nets[nets.length-2]:null;
  var tiles=el("div","tiles");
  var t1=el("div","tile");t1.appendChild(el("b",null,fmtNet(last)));t1.appendChild(el("span",null,"Son net"));
  if(prev!=null){var df=last-prev;t1.appendChild(el("span","delta "+(df>0.001?"up":df<-0.001?"down":""),(df>0.001?"▲ ":df<-0.001?"▼ ":"")+fmtNet(Math.abs(df))))}
  tiles.appendChild(t1);
  [[nets.reduce(function(a,b){return a+b},0)/nets.length,"Ortalama"],[Math.max.apply(null,nets),"En yüksek"]].forEach(function(f){var t=el("div","tile");t.appendChild(el("b",null,fmtNet(f[0])));t.appendChild(el("span",null,f[1]));tiles.appendChild(t)});
  w.appendChild(tiles);
  var c=el("div","card");
  var keys=[["all","Toplam"]].concat(EXAM_ROWS.map(function(r){return [r[0],exShort(r[0])]}));
  c.appendChild(el("h3",null,exChart==="all"?"Toplam net":exShort(exChart)+" neti"));
  var sc=el("div","scroller");
  keys.forEach(function(k){var p=el("button","pick",k[1]);p.type="button";p.setAttribute("aria-pressed",String(exChart===k[0]));if(k[0]!=="all")p.style.setProperty("--c","var(--s-"+k[0]+")");p.addEventListener("click",function(){exChart=k[0];renderStats()});sc.appendChild(p)});
  c.appendChild(sc);
  var pts=list.map(function(e){
    if(exChart==="all")return {v:examNet(e),max:examMax(e),label:e.name||"Deneme",date:e.date};
    var r=e.rows.filter(function(x){return x.k===exChart})[0];return r?{v:rowNet(r),max:r.n,label:e.name||"Deneme",date:e.date}:null;
  }).filter(Boolean);
  c.appendChild(lineChart(pts));
  w.appendChild(c);
  var recent=list.slice(-5),c2=el("div","card");c2.appendChild(el("h3",null,"Ders ortalamaları"+(list.length>5?" (son 5 deneme)":"")));
  var bars=el("div","bars"),worst=null;
  EXAM_ROWS.forEach(function(rr){
    var k=rr[0],sum=0,n=0,mx=0;recent.forEach(function(e){var r=e.rows.filter(function(x){return x.k===k})[0];if(r){sum+=rowNet(r);mx+=r.n;n++}});
    if(!n||!mx)return;var avg=sum/n,am=mx/n,ratio=avg/am;if(!worst||ratio<worst.r)worst={k:k,r:ratio};
    var b=el("div","bar wide");b.style.setProperty("--c","var(--s-"+k+")");b.appendChild(el("span","lbl",exShort(k)));
    var tr=el("div","track");var f=el("div","fill");f.style.width=Math.max(0,Math.min(100,ratio*100))+"%";tr.appendChild(f);b.appendChild(tr);b.appendChild(el("span","n",fmtNet(avg)+" / "+Math.round(am)));bars.appendChild(b);
  });
  c2.appendChild(bars);
  if(worst&&list.length>=2){var tp=el("p","muted small","En çok net kaybı: "+exShort(worst.k)+". Bu dersin yanlışlarını deftere eklemeyi ve tekrar etmeyi öncelikle.");c2.appendChild(tp)}
  w.appendChild(c2);
  var c3=el("div","card");c3.appendChild(el("h3",null,"Denemeler"));var lw=el("div","subrows");
  list.slice().reverse().forEach(function(e){
    var ix=list.indexOf(e),pv=ix>0?examNet(list[ix-1]):null,v=examNet(e);
    var r=el("button","exrow");r.type="button";
    var l=el("div");l.appendChild(el("div","nm",e.name||"Deneme"));l.appendChild(el("div","muted small",fmtDate(e.date)+" · "+e.rows.map(function(x){return exShort(x.k).slice(0,3)+" "+fmtNet(rowNet(x))}).join(" · ")));r.appendChild(l);
    var rt=el("div","rt");rt.appendChild(el("b",null,fmtNet(v)));if(pv!=null){var df=v-pv;rt.appendChild(el("span","delta "+(df>0.001?"up":df<-0.001?"down":""),(df>0.001?"▲ ":df<-0.001?"▼ ":"")+fmtNet(Math.abs(df))))}r.appendChild(rt);
    r.addEventListener("click",function(){openExam(e.id)});lw.appendChild(r);
  });
  c3.appendChild(lw);w.appendChild(c3);
}
/* One series, so no legend: the card title names it. Thin 2px line, 9px markers, recessive grid,
   direct label on the last point, tap/hover tooltip on every point. */
function lineChart(pts){
  var wrap=el("div","chart");if(!pts.length){wrap.appendChild(el("p","muted small","Bu ders için veri yok."));return wrap}
  var W=340,H=190,L=30,R=16,T=22,B=26,n=pts.length;
  var mx=Math.max.apply(null,pts.map(function(p){return p.max}).concat([1])),mn=Math.min(0,Math.min.apply(null,pts.map(function(p){return p.v})));
  function X(i){return n===1?(L+(W-L-R)/2):L+i*(W-L-R)/(n-1)}
  function Y(v){return T+(1-(v-mn)/(mx-mn))*(H-T-B)}
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Net grafiği, '+n+' deneme">';
  [mn,(mn+mx)/2,mx].forEach(function(g){s+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(g).toFixed(1)+'" y2="'+Y(g).toFixed(1)+'"/><text class="ax" x="'+(L-6)+'" y="'+(Y(g)+3.5).toFixed(1)+'" text-anchor="end">'+fmtNet(g)+'</text>'});
  if(n>1)s+='<path class="ln" d="'+pts.map(function(p,i){return (i?"L":"M")+X(i).toFixed(1)+" "+Y(p.v).toFixed(1)}).join("")+'"/>';
  pts.forEach(function(p,i){s+='<circle class="mk'+(i===n-1?" last":"")+'" cx="'+X(i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="4.5"/>'});
  var lp=pts[n-1];s+='<text class="lab" x="'+X(n-1).toFixed(1)+'" y="'+(Y(lp.v)-11).toFixed(1)+'" text-anchor="'+(n===1?"middle":"end")+'">'+fmtNet(lp.v)+'</text>';
  s+='<text class="ax" x="'+X(0).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(n===1?"middle":"start")+'">'+shortDate(pts[0].date)+'</text>';
  if(n>1)s+='<text class="ax" x="'+X(n-1).toFixed(1)+'" y="'+(H-6)+'" text-anchor="end">'+shortDate(lp.date)+'</text>';
  pts.forEach(function(p,i){s+='<circle class="hit" data-i="'+i+'" cx="'+X(i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="16"/>'});
  s+='</svg>';wrap.innerHTML=s;
  var tt=el("div","tt");tt.hidden=true;wrap.appendChild(tt);
  wrap.querySelectorAll(".hit").forEach(function(h){
    function show(){
      var p=pts[+h.getAttribute("data-i")];tt.replaceChildren(el("b",null,fmtNet(p.v)+" net"),el("span",null,p.label+" · "+shortDate(p.date)));tt.hidden=false;
      var r=wrap.getBoundingClientRect(),cr=h.getBoundingClientRect(),half=tt.offsetWidth/2,x=cr.left+cr.width/2-r.left;
      tt.style.left=Math.max(half,Math.min(r.width-half,x))+"px";tt.style.top=(cr.top+cr.height/2-r.top-12)+"px";
    }
    h.addEventListener("pointerenter",show);h.addEventListener("click",show);h.addEventListener("pointerleave",function(){tt.hidden=true});
  });
  return wrap;
}

/* ---------- weekly parent report ---------- */
var repOff=0;
function weekReport(off){
  var days=weekDays(off),set={};days.forEach(function(d){set[d]=1});
  var rev=0,ok=0,added=0,learned=0,tp={};
  function key(it){var k=it.subject+"|"+trLower((it.topic||"").trim());if(!tp[k])tp[k]={s:it.subject,t:(it.topic||"").trim()||"Konu yazılmamış",bad:0,add:0};return tp[k]}
  items.forEach(function(it){
    (it.hist||[]).forEach(function(h){if(!set[h[0]])return;rev++;if(h[1])ok++;else key(it).bad++});
    if(set[it.date]){added++;key(it).add++}
    if(it.masteredAt&&set[it.masteredAt])learned++;
  });
  var weak=Object.keys(tp).map(function(k){return tp[k]}).filter(function(x){return x.bad+x.add>0}).sort(function(a,b){return (b.bad*2+b.add)-(a.bad*2+a.add)}).slice(0,3);
  var m=studyMap();
  return {days:days,m:m,rev:rev,ok:ok,added:added,learned:learned,weak:weak,ex:sortedExams().filter(function(e){return set[e.date]}),studied:days.filter(function(d){return m[d]}).length,goal:S.weekGoal||5,off:off,streak:streakInfo()};
}
function renderReport(w){
  var sg=el("div","seg two");
  [[0,"Bu hafta"],[-1,"Geçen hafta"]].forEach(function(o){var b=el("button",null,o[1]);b.type="button";b.setAttribute("aria-pressed",String(repOff===o[0]));b.addEventListener("click",function(){repOff=o[0];renderStats()});sg.appendChild(b)});
  w.appendChild(sg);
  var R=weekReport(repOff);
  var c=el("div","card");var h=el("div","row between");h.appendChild(el("b",null,weekRange(repOff)));h.appendChild(el("span","pill"+(R.studied>=R.goal?" done":""),R.studied+" / "+R.goal+" gün çalıştı"));c.appendChild(h);
  c.appendChild(daysRow(R.days,R.m,todayStr()));
  if(R.streak.cur||R.streak.best)c.appendChild(el("p","muted small","Şu anki seri: "+R.streak.cur+" gün · En uzun seri: "+R.streak.best+" gün"));
  w.appendChild(c);
  var tiles=el("div","tiles two");
  [[R.rev,"Tekrar edilen soru"],[R.rev?"%"+Math.round(R.ok/R.rev*100):"–","Doğru çözme oranı"],[R.added,"Yeni eklenen yanlış"],[R.learned,"Öğrenilen soru"]].forEach(function(f){var t=el("div","tile");t.appendChild(el("b",null,String(f[0])));t.appendChild(el("span",null,f[1]));tiles.appendChild(t)});
  w.appendChild(tiles);
  if(R.weak.length){
    var c2=el("div","card");c2.appendChild(el("h3",null,"Zorlandığı konular"));var l=el("div","bars");
    R.weak.forEach(function(x){var r=el("div","weakrow");var a=el("div","row");a.style.minWidth="0";a.style.flexWrap="nowrap";a.appendChild(subjChip(x.s));a.appendChild(el("span","ell",x.t));r.appendChild(a);
      var parts=[];if(x.bad)parts.push(x.bad+" kez tekrarda yanlış");if(x.add)parts.push(x.add+" yeni yanlış eklendi");r.appendChild(el("span","muted small",parts.join(" · ")));l.appendChild(r)});
    c2.appendChild(l);w.appendChild(c2);
  }
  if(R.ex.length){
    var c3=el("div","card");c3.appendChild(el("h3",null,"Bu haftaki denemeler"));
    R.ex.forEach(function(e){var r=el("div","row between");r.appendChild(el("span",null,(e.name||"Deneme")+" · "+fmtDate(e.date)));r.appendChild(el("b",null,fmtNet(examNet(e))+" net"));c3.appendChild(r)});
    w.appendChild(c3);
  }
  if(!R.rev&&!R.added&&!R.ex.length)w.appendChild(el("p","notice",repOff?"Geçen hafta için kayıt yok.":"Bu hafta henüz kayıt yok. Tekrar yaptıkça, yanlış ekledikçe ve deneme girdikçe rapor dolacak."));
  var sb=btn("primary block","Raporu paylaş",function(){shareReport(R,sb)},ICONS.share);w.appendChild(sb);
  w.appendChild(el("p","muted small","Rapor resim olarak hazırlanır; WhatsApp'tan aileyle ya da öğretmenle paylaşabilirsin."));
}
var SUBJ_HEX={mat:"#4466FF",fen:"#0E9F68",tr:"#DD7612",par:"#8B5CF6",din:"#0B9DB0",sos:"#A8741C",ing:"#D63C86"};
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function fitText(x,t,maxW){if(x.measureText(t).width<=maxW)return t;while(t.length>1&&x.measureText(t+"…").width>maxW)t=t.slice(0,-1);return t+"…"}
async function reportImage(R){
  try{await Promise.all(["400","500","600","700"].map(function(wt){return document.fonts.load(wt+' 30px "Lexend"',"ÇĞİÖŞÜçğıöşü")}))}catch(e){}
  var W=1080,P=64,F='"Lexend",sans-serif';
  var H=300+250+460+(R.weak.length?110+R.weak.length*86:0)+(R.ex.length?110+R.ex.length*72:0)+120;
  var c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");
  x.fillStyle="#F4F6FB";x.fillRect(0,0,W,H);
  var g=x.createLinearGradient(0,0,W,300);g.addColorStop(0,"#5C8DFF");g.addColorStop(.55,"#4B5CFF");g.addColorStop(1,"#7B3BEF");x.fillStyle=g;x.fillRect(0,0,W,300);
  try{var ic=await loadImg("icon-v2-192.png");x.drawImage(ic,P,62,104,104)}catch(e){}
  x.fillStyle="#fff";x.font="700 58px "+F;x.fillText("Haftalık Rapor",P+132,112);
  x.font="500 32px "+F;x.globalAlpha=.92;x.fillText(fitText(x,[S.name,S.grade?S.grade+". sınıf":"",weekRange(R.off)].filter(Boolean).join(" · "),W-P*2-132),P+132,160);x.globalAlpha=1;
  x.font="600 38px "+F;x.fillText(R.studied+" / "+R.goal+" gün çalıştı"+(R.streak.cur?"  ·  "+R.streak.cur+" gün seri":""),P,252);
  var y=330,cw=(W-P*2)/7;
  R.days.forEach(function(d,i){var cx=P+cw*i+cw/2,on=!!R.m[d];x.beginPath();x.arc(cx,y+42,40,0,Math.PI*2);x.fillStyle=on?"#14915A":"#E2E6F0";x.fill();
    if(on){x.strokeStyle="#fff";x.lineWidth=8;x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(cx-16,y+43);x.lineTo(cx-4,y+55);x.lineTo(cx+18,y+30);x.stroke()}
    x.fillStyle="#5A6080";x.font="500 26px "+F;x.textAlign="center";x.fillText(WD[i],cx,y+122);x.textAlign="left"});
  y=530;var tw=(W-P*2-24)/2,th=200;
  [[R.rev,"Tekrar edilen soru"],[R.rev?"%"+Math.round(R.ok/R.rev*100):"–","Doğru çözme oranı"],[R.added,"Yeni eklenen yanlış"],[R.learned,"Öğrenilen soru"]].forEach(function(f,i){
    var X=P+(i%2)*(tw+24),Y=y+Math.floor(i/2)*(th+24);rr(x,X,Y,tw,th,28);x.fillStyle="#fff";x.fill();x.strokeStyle="#E2E6F0";x.lineWidth=2;x.stroke();
    x.fillStyle="#141834";x.font="700 76px "+F;x.fillText(String(f[0]),X+32,Y+100);x.fillStyle="#5A6080";x.font="500 30px "+F;x.fillText(f[1],X+32,Y+158)});
  y=y+th*2+24+70;
  function head(t){x.fillStyle="#5A6080";x.font="600 26px "+F;x.fillText(t.toLocaleUpperCase("tr"),P,y);y+=30}
  if(R.weak.length){head("Zorlandığı konular");
    R.weak.forEach(function(t){y+=56;x.fillStyle=SUBJ_HEX[t.s]||"#5A6080";x.beginPath();x.arc(P+10,y-11,10,0,Math.PI*2);x.fill();
      var parts=[];if(t.bad)parts.push(t.bad+" yanlış");if(t.add)parts.push(t.add+" yeni");var right=parts.join(", ");
      x.font="500 28px "+F;var rw=x.measureText(right).width;x.fillStyle="#5A6080";x.textAlign="right";x.fillText(right,W-P,y);x.textAlign="left";
      x.fillStyle="#141834";x.font="600 32px "+F;x.fillText(fitText(x,subjName(t.s)+": "+t.t,W-P*2-48-rw),P+36,y);y+=30});
    y+=50}
  if(R.ex.length){head("Denemeler");
    R.ex.forEach(function(e){y+=56;x.fillStyle="#141834";x.font="600 32px "+F;var r2=fmtNet(examNet(e))+" net";x.textAlign="right";x.fillText(r2,W-P,y);var rw=x.measureText(r2).width;x.textAlign="left";
      x.font="500 30px "+F;x.fillText(fitText(x,(e.name||"Deneme")+" · "+fmtDate(e.date),W-P*2-rw-30),P,y);y+=16});
    y+=50}
  x.fillStyle="#8C92AD";x.font="600 26px "+F;x.textAlign="center";x.fillText("Yanlış Defterim",W/2,H-50);
  return await new Promise(function(res,rej){c.toBlob(function(b){b?res(b):rej(new Error("png"))},"image/png")});
}
async function shareOrDownload(file,title){
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:title});return "shared"}}catch(e){if(e&&e.name==="AbortError")return "cancel"}
  var a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},5000);return "downloaded";
}
async function shareReport(R,b){
  if(b){b.disabled=true;b.lastChild.textContent="Hazırlanıyor…"}
  try{var blob=await reportImage(R);var f=new File([blob],"haftalik-rapor-"+R.days[0]+".png",{type:"image/png"});var r=await shareOrDownload(f,"Haftalık rapor");if(r==="downloaded")toast("Rapor resmi indirildi.")}
  catch(e){toast("Rapor hazırlanamadı. Tekrar dene.")}
  if(b){b.disabled=false;b.lastChild.textContent="Raporu paylaş"}
}

/* ---------- notebook: topic filter + pre-exam tools ---------- */
function topicFilterEl(){
  var m={};items.forEach(function(i){if(i.subject!==filt.sub)return;var t=(i.topic||"").trim();if(!t)return;var k=trLower(t);if(!m[k])m[k]={t:t,n:0};m[k].n++});
  var keys=Object.keys(m).sort(function(a,b){return m[b].n-m[a].n||m[a].t.localeCompare(m[b].t,"tr")});
  if(!keys.length)return null;
  var s=el("select","field");s.id="f-topic";s.setAttribute("aria-label","Konu");
  var o0=el("option",null,"Tüm konular");o0.value="";s.appendChild(o0);
  keys.forEach(function(k){var o=el("option",null,m[k].t+" ("+m[k].n+")");o.value=k;s.appendChild(o)});
  s.value=filt.topic||"";if(s.value!==(filt.topic||"")){filt.topic="";s.value=""}
  s.addEventListener("change",function(){filt.topic=s.value;renderList()});
  return s;
}
function topicTools(){
  var l=items.filter(function(i){return i.subject===filt.sub&&trLower((i.topic||"").trim())===filt.topic}).reverse();
  if(!l.length)return null;var t=l[0].topic.trim(),ids=l.map(function(i){return i.id});
  var c=el("div","topictools");
  c.appendChild(el("b",null,"Yazılı / sınav öncesi tekrar"));
  c.appendChild(el("span","small","“"+t+"” konusundaki "+l.length+" sorunun hepsi, öğrenilenler dahil."));
  var b=el("div","btns");
  b.appendChild(btn("primary sm","Şimdi çöz",function(){startReview(ids,t)}));
  b.appendChild(btn("ghost sm","PDF test",function(){openPdf(ids,{title:"Yazılı Tekrarı · "+t})},ICONS.pdf));
  c.appendChild(b);return c;
}

/* ---------- attention note (text + voice) ---------- */
var rec=null;
function tipGroup(){
  var g=group("Dikkat notu",true);
  g.appendChild(el("p","muted small","Bir dahakine neye dikkat edeceksin? Tekrarda ipucu olarak gösterilir."));
  var ti=el("input","field");ti.id="i-tip";ti.maxLength=140;ti.placeholder="Örn. Soru kökündeki “değildir”in altını çiz.";ti.value=form.tip||"";ti.addEventListener("input",function(){form.tip=ti.value});g.appendChild(ti);
  var r=el("div","row");
  if(rec&&rec.form===form){
    var sb=btn("bad sm","Kaydı bitir",stopRec);sb.prepend(el("span","recdot"));r.appendChild(sb);
    var tm=el("span","muted small",fmtSec(Math.round((Date.now()-rec.t0)/1000)));tm.id="rec-time";r.appendChild(tm);
  }else{
    var src=form.tipPrev||(form.tipDel?null:photoSrc(form.tipAudio));
    if(src){var au=el("audio","tipaudio");au.controls=true;au.preload="metadata";au.src=src;r.appendChild(au);
      r.appendChild(btn("ghost sm","Sil",function(){if(form.tipPrev)URL.revokeObjectURL(form.tipPrev);form.tipPrev=null;form.tipBlob=null;form.tipDel=true;renderForm()}))}
    else r.appendChild(btn("ghost sm","Sesli not kaydet",startRec,ICONS.mic));
  }
  g.appendChild(r);return g;
}
async function startRec(){
  if(rec)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){toast("Bu telefonda ses kaydı desteklenmiyor.");return}
  var stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){toast("Mikrofon izni verilmedi. Telefon ayarlarından izin verebilirsin.");return}
  var mime=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"].filter(function(m){try{return MediaRecorder.isTypeSupported(m)}catch(e){return false}})[0]||"";
  var mr;try{mr=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)}catch(e){stream.getTracks().forEach(function(t){t.stop()});toast("Ses kaydı başlatılamadı.");return}
  var chunks=[],me={mr:mr,t0:Date.now(),form:form,timer:null};rec=me;
  mr.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
  mr.onstop=function(){
    stream.getTracks().forEach(function(t){t.stop()});clearInterval(me.timer);if(rec===me)rec=null;
    var f=me.form;if(!f)return;
    var b=new Blob(chunks,{type:(mr.mimeType||mime||"audio/webm").split(";")[0]});
    if(b.size<400){toast("Kayıt çok kısa oldu.");if(addOpen&&form===f)renderForm();return}
    if(f.tipPrev)URL.revokeObjectURL(f.tipPrev);f.tipBlob=b;f.tipPrev=URL.createObjectURL(b);f.tipDel=false;
    if(addOpen&&form===f)renderForm();
  };
  mr.start(250);
  me.timer=setInterval(function(){var s=Math.round((Date.now()-me.t0)/1000),l=$("#rec-time");if(l)l.textContent=fmtSec(s);if(s>=60)stopRec()},500);
  renderForm();
}
function stopRec(){if(rec&&rec.mr.state!=="inactive")rec.mr.stop()}
function tipNote(it){
  var n=el("div","tipnote");var h=el("div","row");h.innerHTML=ICONS.bulb;h.appendChild(el("b",null,"Dikkat notun"));n.appendChild(h);
  if(it.tip)n.appendChild(el("p",null,it.tip));
  var src=photoSrc(it.tipAudio);if(src){var a=el("audio");a.controls=true;a.preload="metadata";a.src=src;n.appendChild(a)}
  return n;
}
function hasTip(it){return !!(it.tip||(it.tipAudio&&photoSrc(it.tipAudio)))}

/* ---------- similar questions (AI) ---------- */
var simState=null;
var SIM_SCHEMA={type:"object",properties:{questions:{type:"array",items:{type:"object",properties:{q:{type:"string"},options:{type:"array",items:{type:"string"}},answer:{type:"string"},why:{type:"string"}},required:["q","options","answer","why"]}}},required:["questions"]};
function simPrompt(it){
  var g=it.grade||S.grade||7;
  return ["You write practice questions for a Turkish grade "+g+" student preparing for LGS-style tests.",
    "Subject: "+subjName(it.subject,g)+". Topic: "+(it.topic||"-")+".",
    it.correct?"In the attached question the correct choice is "+it.correct+".":"",
    "Write 3 NEW multiple-choice questions that test the same skill as the attached question, at the same difficulty. Change the numbers, names and context; never copy the question.",
    "Each question has exactly 4 options and exactly one correct option. Solve every question yourself and make sure the answer key is right.",
    "Write everything in Turkish. Plain text only: no LaTeX, no markdown. Use ×, ÷, −, ², ³, √ and fractions like 3/4.",
    "Do not refer to figures, tables or pictures. If the skill needs a figure, describe it fully in words or choose a closely related skill that does not need one.",
    "For paragraph or reading questions put the short text inside q.",
    "options: the 4 option texts without letter prefixes. answer: A, B, C or D. why: a short solution in Turkish, 1 to 3 sentences."].filter(Boolean).join("\n");
}
function cleanSim(r){
  var arr=r&&Array.isArray(r.questions)?r.questions:(Array.isArray(r)?r:[]),out=[];
  arr.forEach(function(x){
    if(!x||typeof x.q!=="string"||!x.q.trim()||!Array.isArray(x.options))return;
    var o=x.options.map(function(t){return String(t==null?"":t).replace(/^\s*[A-Da-d]\s*[\)\.\-:]\s*/,"").trim()}).filter(Boolean).slice(0,4);
    var a=toLetter(x.answer);if(o.length<4||!a||"ABCD".indexOf(a)<0)return;
    out.push({q:x.q.trim().slice(0,1500),o:o,a:a,w:String(x.why||"").trim().slice(0,800)});
  });
  return out.slice(0,5);
}
async function srcToB64(src){var b=await (await fetch(src)).blob();var u=await toDataURL(b);return {data:u.split(",")[1],mime:(b.type||"image/jpeg").split(";")[0]}}
function similarBtn(it,cls){var n=(it.similar||[]).length;return btn(cls||"ghost block",n?"Benzer soruları çöz ("+n+")":"Benzer soru üret ve çöz",function(){openSimilar(it.id)},ICONS.spark)}
function openSimilar(id){
  var it=byId(id);if(!it)return;
  simState={id:id,busy:false,err:null,picks:{},local:null,ctl:null};
  $("#sim").hidden=false;pushLayer("sim",closeSimilar);renderSimilar();
  if(!(it.similar&&it.similar.length))genSimilar();
}
function closeSimilar(){if(simState&&simState.ctl)try{simState.ctl.abort()}catch(e){}simState=null;$("#sim").hidden=true;uiClosed("sim")}
async function genSimilar(){
  var st=simState,it=st&&byId(st.id);if(!it)return;
  if(!aiKey()){st.err="Benzer soru üretmek için yapay zekâ anahtarı gerekir. Ayarlar → Yapay zekâ yardımı bölümünden ücretsiz anahtar ekleyebilirsin.";renderSimilar();return}
  st.busy=true;st.err=null;st.picks={};renderSimilar();st.ctl=new AbortController();
  try{
    var input=[{type:"text",text:simPrompt(it)}],src=photoSrc(it.qPhoto);
    if(src){var im=await srcToB64(src);input.push({type:"image",mime_type:im.mime,data:im.data})}
    if(it.note)input.push({type:"text",text:"Question text / note: "+it.note});
    var inter=await aiCall({input:input,response_format:{type:"text",mime_type:"application/json",schema:SIM_SCHEMA}},st.ctl.signal);
    var qs=cleanSim(aiJSON(aiText(inter)));
    if(!qs.length)throw aiErr("empty",AI_MSG.empty);
    if(simState!==st)return;
    st.local=qs;st.busy=false;renderSimilar();
    col.doc(it.id).update({similar:qs,simAt:todayStr()}).catch(function(){});
  }catch(e){
    if(simState!==st)return;st.busy=false;if(e&&e.code==="cancel"){renderSimilar();return}
    st.err=(e&&e.message)||AI_MSG.other;renderSimilar();
  }
}
function renderSimilar(){
  var st=simState;if(!st)return;var it=byId(st.id),box=$("#sim");
  if(!it){closeSimilar();return}
  var sb=$("#sim .screen-body"),sy=sb?sb.scrollTop:0;box.replaceChildren();
  var qs=st.local||it.similar||[];
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closeSimilar));top.appendChild(el("h2",null,"Benzer sorular"));
  if(qs.length&&!st.busy)top.appendChild(el("span","counter",Object.keys(st.picks).length+" / "+qs.length));
  box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  var hd=el("div","row");hd.appendChild(subjChip(it.subject,it.grade));hd.appendChild(el("span","muted small",it.topic||""));w.appendChild(hd);
  if(st.busy){
    var bc=el("div","card busycard");bc.appendChild(el("b",null,"Yapay zekâ bu konudan yeni sorular hazırlıyor…"));bc.appendChild(el("span","muted small","Genellikle 10–30 saniye sürer."));
    bc.appendChild(btn("ghost sm","Vazgeç",function(){if(st.ctl)try{st.ctl.abort()}catch(e){}}));w.appendChild(bc);
  }else if(st.err){
    w.appendChild(el("p","notice",st.err));
    if(aiKey())w.appendChild(btn("primary block","Tekrar dene",genSimilar));
  }
  if(!st.busy&&qs.length){
    qs.forEach(function(q,i){
      var c=el("div","card simq");c.appendChild(el("h3",null,"Soru "+(i+1)));c.appendChild(el("div","q",q.q));
      var ops=el("div","opts"),pick=st.picks[i];
      q.o.forEach(function(t,j){
        var L="ABCD"[j],b=el("button","opt");b.type="button";b.appendChild(el("span","l",L));b.appendChild(el("span",null,t));
        if(pick){b.disabled=true;if(L===q.a)b.classList.add("right");else if(L===pick)b.classList.add("wrong")}
        else b.addEventListener("click",function(){st.picks[i]=L;renderSimilar()});
        ops.appendChild(b);
      });
      c.appendChild(ops);
      if(pick){var ok=pick===q.a;c.appendChild(el("p","verdict "+(ok?"ok":"bad"),ok?"Doğru! 🎉":"Doğrusu "+q.a+"."));if(q.w)c.appendChild(el("div","solution",q.w))}
      w.appendChild(c);
    });
    var ans=Object.keys(st.picks).length;
    if(ans===qs.length){var right=qs.filter(function(q,i){return st.picks[i]===q.a}).length;var tp=el("div","tip");tp.appendChild(el("b",null,"Sonuç: "+qs.length+" sorudan "+right+" doğru"));
      tp.appendChild(el("span",null,right===qs.length?"Bu konuyu kavramışsın. Asıl soru da sırası gelince tekrar sorulacak.":"Yanlış yaptığın sorunun çözümünü oku; istersen yeni sorular üret."));w.appendChild(tp)}
    w.appendChild(el("p","muted small","Bu soruları yapay zekâ üretti; nadiren hatalı olabilir. Emin olamadığında öğretmenine sor."));
  }
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  if(!st.busy&&qs.length&&aiKey())fin.appendChild(btn("ghost","Yeni sorular",function(){st.local=null;genSimilar()},ICONS.spark));
  fin.appendChild(btn("primary","Kapat",closeSimilar));box.appendChild(foot);
  var nb=$("#sim .screen-body");if(nb)nb.scrollTop=sy;
}

/* ---------- bulk add ---------- */
var bulk=null,bulkEditing=null,bulkSeq=0;
$("#file-bulk").addEventListener("change",function(){var fs=this.files?[].slice.call(this.files):[];this.value="";if(fs.length)openBulk(fs)});
function startBulk(){if(readOnly||storeState!=="ready"){toast("Defter henüz açılmadı.");return}$("#file-bulk").click()}
function topicFor(sub,text){var m=sub?findTopic(sub,text):null;if(m)return {topic:m.t,unit:m.u,mode:"list"};var t=String(text||"").trim().slice(0,80);return {topic:t,unit:"",mode:t?"other":"list"}}
function newBulkItem(f){var x=blankForm();x.qRaw=f;x.qRawOrig=true;return {key:"b"+(++bulkSeq),f:x,st:"wait",msg:""}}
function openBulk(files){
  var imgs=files.filter(function(f){return !f.type||/^image\//.test(f.type)});
  if(!imgs.length){toast("Fotoğraf seçilmedi.");return}
  var room=40-(bulk?bulk.list.length:0);
  if(imgs.length>room){toast("Bir seferde en fazla 40 fotoğraf eklenir. İlk "+Math.max(0,room)+" tanesi alındı.");imgs=imgs.slice(0,Math.max(0,room))}
  if(bulk){imgs.forEach(function(f){bulk.list.push(newBulkItem(f))});renderBulk();runBulk();return}
  bulk={list:imgs.map(newBulkItem),running:false,src:(lastKeep&&lastKeep.source)||"",sub:null,saving:false,saved:0,aiOff:true,askClose:false};
  $("#bulk").hidden=false;pushLayer("bulk",bulkBack);renderBulk();runBulk();
}
function bulkUnsaved(){return bulk?bulk.list.filter(function(b){return b.st!=="fail"}).length:0}
function bulkBack(){
  if(!bulk)return;
  if(bulkUnsaved()&&!bulk.saving&&!bulk.askClose){bulk.askClose=true;if(popping)pushLayer("bulk",bulkBack);renderBulk();var sb=$("#bulk .screen-body");if(sb)sb.scrollTop=0;return}
  closeBulkNow();
}
function closeBulkNow(){
  if(bulk)bulk.list.forEach(function(b){if(b.f.qPrev)URL.revokeObjectURL(b.f.qPrev)});
  bulk=null;$("#bulk").hidden=true;uiClosed("bulk");render();
}
async function runBulk(){
  var me=bulk;if(!me||me.running)return;me.running=true;bulkHead();
  try{
    for(var i=0;i<me.list.length;i++){
      if(bulk!==me)return;
      var b=me.list[i];if(b.st!=="wait")continue;
      b.st="work";b.msg="Temizleniyor…";bulkItemUpdate(b);bulkHead();
      await new Promise(function(r){setTimeout(r,40)});
      try{await bulkProcess(b,me)}catch(e){ed=null;b.st="fail";b.msg="Fotoğraf açılamadı"}
      if(bulk!==me)return;
      bulkItemUpdate(b);bulkHead();
    }
  }finally{me.running=false}
  if(bulk===me)renderBulk();
}
async function aiAnalyseRetry(cnv,b){
  for(var k=0;;k++){
    try{return await aiAnalyse(cnv)}
    catch(e){
      if(e&&(e.code==="rate"||e.code==="server"||e.code==="network")&&k<2){b.msg=e.code==="rate"?"Ücretsiz sınır doldu, bekleniyor…":"Bağlantı bekleniyor…";bulkItemUpdate(b);await new Promise(function(r){setTimeout(r,e.code==="rate"?30000:5000)});b.msg="Yapay zekâ okuyor…";bulkItemUpdate(b);continue}
      throw e;
    }
  }
}
function aiMarks(r,c){
  var out=[],L=Math.max(c.w,c.h);
  (Array.isArray(r&&r.marks)?r.marks:[]).forEach(function(m){
    var b=m&&m.box_2d;if(!Array.isArray(b)||b.length!==4)return;
    var y0=clamp(+b[0],0,1000),x0=clamp(+b[1],0,1000),y1=clamp(+b[2],0,1000),x1=clamp(+b[3],0,1000);
    if(!(x1>x0&&y1>y0))return;if((x1-x0)*(y1-y0)>0.45*1e6)return;
    var mm={label:String(m.label||"").toLowerCase(),x0:c.x+x0/1000*c.w,y0:c.y+y0/1000*c.h,x1:c.x+x1/1000*c.w,y1:c.y+y1/1000*c.h,pts:[]};
    if((mm.x1-mm.x0)<L*0.004&&(mm.y1-mm.y0)<L*0.004)return;
    (Array.isArray(m.points)?m.points:[]).forEach(function(q){if(Array.isArray(q)&&q.length===2)mm.pts.push([c.x+clamp(+q[1],0,1000)/1000*c.w,c.y+clamp(+q[0],0,1000)/1000*c.h])});
    out.push(mm);
  });
  return out;
}
/* ---------- safety checks for automatic cleaning ----------
   inkRatio: share of dark pixels. A question photo has some; a blank (white) result has almost none. */
function inkRatio(src){
  var w0=src.naturalWidth||src.width,h0=src.naturalHeight||src.height;if(!w0||!h0)return 0;
  var k=Math.min(1,400/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*k)),h=Math.max(1,Math.round(h0*k));
  var t=document.createElement("canvas");t.width=w;t.height=h;var x=t.getContext("2d",{willReadFrequently:true});
  x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(src,0,0,w,h);
  var d=x.getImageData(0,0,w,h).data,n=0;for(var i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]<480)n++;
  return n/(w*h);
}
function inkOfData(d){var n=0,k=0;for(var i=0;i<d.length;i+=16){k++;if(d[i]+d[i+1]+d[i+2]<450)n++}return k?n/k:0}
var BLANK=0.004;
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
async function decodedImg(raw){var img=await loadImg(raw);try{if(img.decode)await img.decode()}catch(e){}return img}
/* Paper clean-up + faint pencil removal on one photo, off screen. Undoes the pencil step if it took
   away too much, and falls back to the photo itself if the result is (almost) empty. */
function cleanOffscreen(img,raw){
  var E={k:"q",raw:raw,isOrig:true,s:edDefaults(true),mode:"clean",draft:null,showOrig:false,drawing:null,cropStart:null,tapStart:null,bg:null,W:0,H:0,img:img,headless:true};
  ed=E;
  try{
    buildOrig();
    var oc=document.createElement("canvas");oc.width=E.W;oc.height=E.H;oc.getContext("2d").drawImage(edOrig,0,0);
    var srcInk=inkRatio(oc);
    if(srcInk<0.0005)return {E:E,oc:oc,pre:null,blankSrc:true};
    process();
    if(inkOfData(E.base)<0.6*inkOfData(E.pre)){E.s.pencilOn=false;applyAuto();E.pencilUndone=true}
    var cr=autoCropRect(E);E.s.crop=cr;var c=cr||{x:0,y:0,w:E.W,h:E.H};
    var pre=cropOf(edProc,c);oc=cropOf(edOrig,c);
    if(inkRatio(pre)<BLANK){pre=oc;E.usedOriginal=true}
    return {E:E,oc:oc,pre:pre,c:c,blankSrc:false};
  }finally{ed=null}
}
/* Same pipeline as the photo cleaner, without the screen: paper clean-up and faint pencil removal,
   then (with a key) the AI finds the remaining marks and reads subject, topic and answers.
   Marks are only removed when that does not take away a large part of the question. */
async function bulkProcess(b,me){
  var f=b.f;
  while(ed&&!ed.headless)await sleep(500);
  var img=await decodedImg(f.qRaw),r=cleanOffscreen(img,f.qRaw);
  if(r.blankSrc){
    /* the phone could not open the photo properly (often low memory): wait and try once more */
    img=null;await sleep(700);img=await decodedImg(f.qRaw);r=cleanOffscreen(img,f.qRaw);
    if(r.blankSrc){b.st="fail";b.msg="Fotoğraf okunamadı, yeniden ekle";return}
  }
  img=null;
  var E=r.E,W=E.W,H=E.H,oc=r.oc,pre=r.pre,ai=null;
  if(!me.aiOff&&aiKey()){
    b.msg="Yapay zekâ okuyor…";bulkItemUpdate(b);
    try{ai=await aiAnalyseRetry(oc,b)}catch(e){b.aiMsg=(e&&e.message)||AI_MSG.other;if(e&&(e.code==="badkey"||e.code==="nokey"||e.code==="offline"))me.aiOff=true}
    if(bulk!==me)return;
  }
  /* the program's own clean-up is used; marks the AI found are kept and removed only when asked */
  var out=pre,marks=ai&&!E.usedOriginal?aiMarks(ai,r.c):[];
  b.marks=marks.length?marks:null;b.aiClean=false;b.plain=null;b.aiNote="";b.crop=r.c;b.usedOrig=!!E.usedOriginal;
  if(E.usedOriginal)b.aiNote="Otomatik temizleme yazıyı soldurduğu için fotoğraf olduğu gibi kullanıldı.";
  f.qEd=JSON.parse(JSON.stringify(E.s));
  f.qFile=await canvasBlob(out,0.9);f.oFile=await canvasBlob(oc,0.85);
  if(f.qPrev)URL.revokeObjectURL(f.qPrev);f.qPrev=URL.createObjectURL(f.qFile);
  if(ai)bulkApplyAi(b,ai);
  if(!f.sub&&me.sub){f.sub=me.sub;f.subBy="common"}
  b.st="ready";b.msg="";
}
/* fills only what is still empty, so choices made by hand are kept */
function bulkApplyAi(b,ai){
  var f=b.f,a=cleanAnswers(ai);
  if(a.correct&&!f.correct)f.correct=a.correct;
  if(a.marked.length&&!f.mine)f.mine=a.marked.join(",");
  f.ai={state:"done",correct:a.correct,marked:a.marked,solved:a.solved};
  if(a.subject&&(!f.sub||f.subBy==="common")){if(f.sub!==a.subject&&f.topicMode==="list"){f.topic="";f.unit=""}f.sub=a.subject;f.subBy="ai"}
  if(a.topic&&!(f.topic||"").trim()){var tt=topicFor(f.sub,a.topic);f.topic=tt.topic;f.unit=tt.unit;f.topicMode=tt.mode}
  b.ai=true;
}
/* ---------- AI reading only when asked (Toplu ekle no longer waits for it) ---------- */
async function bulkAiRead(b){
  var B=bulk;if(!B||b.busy||b.st!=="ready"||b.ai||!aiKey())return false;
  b.busy=true;b.msg="Yapay zekâ okuyor…";b.aiMsg="";bulkItemUpdate(b);bulkHead();
  try{
    var src=b.f.oFile||b.f.qFile,img=await decodedImg(src);
    var cv=document.createElement("canvas");cv.width=img.naturalWidth||img.width;cv.height=img.naturalHeight||img.height;cv.getContext("2d").drawImage(img,0,0);img=null;
    var ai=await aiAnalyseRetry(cv,b);if(bulk!==B)return false;
    bulkApplyAi(b,ai);
    var c=b.crop||{x:0,y:0,w:cv.width,h:cv.height},m=!b.usedOrig&&b.f.oFile?aiMarks(ai,c):[];
    b.marks=m.length?m:null;return true;
  }catch(e){b.aiMsg=(e&&e.message)||AI_MSG.other;if(e&&(e.code==="badkey"||e.code==="nokey"||e.code==="offline"))B.aiStop=true;return false}
  finally{b.busy=false;b.msg="";if(bulk===B){bulkItemUpdate(b);bulkHead()}}
}
async function bulkAiReadAll(){
  var B=bulk;if(!B||B.reading)return;B.reading=true;B.aiStop=false;bulkHead();
  try{
    var l=B.list.filter(function(b){return b.st==="ready"&&!b.ai});B.readTot=l.length;B.readDone=0;
    for(var i=0;i<l.length;i++){if(bulk!==B||B.aiStop)break;await bulkAiRead(l[i]);B.readDone=i+1;bulkHead()}
  }finally{B.reading=false;if(bulk===B)bulkHead()}
}

/* ---------- repairing saved questions whose photo came out blank ---------- */
var repairing=false,bootDone=false;
async function repairPhotos(manual){
  if(repairing||storeState!=="ready"||!assets)return;
  repairing=true;var fixed=0,broken=0,checked=0;
  try{
    var list=items.filter(function(it){return it.qPhoto&&it.qPhoto.id&&!it.photoBroken});
    for(var i=0;i<list.length;i++){
      var it=list[i],src=photoSrc(it.qPhoto);if(!src)continue;checked++;
      if(manual&&i%5===0)toast("Fotoğraflar kontrol ediliyor… "+(i+1)+" / "+list.length);
      var im;try{im=await decodedImg(src)}catch(e){continue}
      var qInk=inkRatio(im);if(qInk>=0.0015)continue;
      var osrc=photoSrc(it.oPhoto),oi=null,oInk=0;
      if(osrc){try{oi=await decodedImg(osrc);oInk=inkRatio(oi)}catch(e){}}
      if(!oi||oInk<0.0015){await col.doc(it.id).update({photoBroken:true});broken++;continue}
      if(oInk<BLANK||oInk<4*qInk)continue;
      while(ed||(bulk&&bulk.running))await sleep(800);
      var r=cleanOffscreen(oi,osrc),use=r.pre||r.oc;
      var blob=await canvasBlob(use,0.9),np=await storePhoto(blob),old=it.qPhoto.id;
      await col.doc(it.id).update({qPhoto:np,photoBroken:false});
      assets.delete(old).catch(function(){});fixed++;
    }
  }catch(e){}
  repairing=false;lsSet("repairV10","1");
  var msg=[];
  if(fixed)msg.push(fixed+" sorunun boş görünen fotoğrafı onarıldı");
  if(broken)msg.push(broken+" sorunun fotoğrafı kayıtta da boş; Defter'de “Fotoğraf yok” etiketiyle işaretlendi, yeniden çekilmesi gerekiyor");
  if(msg.length)toast(msg.join(". ")+".");
  else if(manual)toast(checked+" fotoğraf kontrol edildi, sorun bulunmadı.");
  return {fixed:fixed,broken:broken,checked:checked};
}
function maybeAutoRepair(){
  if(lsGet("masterRule")!==String(masterN()))setTimeout(function(){applyMasterRule(false)},800);
  if(lsGet("schedV15")!=="1")setTimeout(function(){applySchedule(false)},1600);
  if(!lsGet("repairV10")&&items.length)setTimeout(function(){repairPhotos(false)},2500);
  if(!lsGet("sheetFixV18"))setTimeout(fixLateSheet,1200);
}
/* questions already answered right N times in a row count as learned under the current setting */
async function applyMasterRule(announce){
  if(storeState!=="ready"||readOnly)return;
  var N=masterN(),t=todayStr(),l=items.filter(function(i){return !i.mastered&&(i.stage||0)>=N});
  try{
    if(l.length){
      await idbTx(idbHandle,"mistakes","readwrite",function(s){l.forEach(function(i){s.put(Object.assign({},i,{mastered:true,next:null,masteredAt:i.masteredAt||t}))});return null});
      await db.notify();
    }
    lsSet("masterRule",String(N));
    if(l.length)toast(l.length+" soru "+N+" kez üst üste doğru çözüldüğü için öğrenildi sayıldı.");
    else if(announce)toast("Kaydedildi. Bundan sonra "+N+" kez üst üste doğru çözülen soru öğrenilmiş sayılır.");
  }catch(e){}
}
function repairCard(){
  var c=el("div","card");c.appendChild(el("h3",null,"Fotoğraf onarımı"));
  c.appendChild(el("p","muted small","Beyaz ya da boş görünen soru fotoğraflarını bulur ve kitaptaki işaretli hâlinden yeniden temizler."));
  var b=btn("ghost block","Fotoğrafları kontrol et",async function(){b.disabled=true;b.lastChild.textContent="Kontrol ediliyor…";await repairPhotos(true);b.disabled=false;b.lastChild.textContent="Fotoğrafları kontrol et"});
  c.appendChild(b);return c;
}
async function bulkAiClean(b){
  if(!bulk||!b.marks||b.aiClean||b.busy||b.st!=="ready")return false;
  b.busy=true;b.msg="Yapay zekâ ile temizleniyor…";bulkItemUpdate(b);bulkHead();var ok=false;
  try{
    while(ed)await sleep(300);
    var img=await decodedImg(b.f.qRaw),r=cleanOffscreen(img,b.f.qRaw);img=null;
    if(r.blankSrc||r.E.usedOriginal){b.aiNote="Bu fotoğrafta yapay zekâ temizliği yapılamadı.";return false}
    var E=r.E,cand;
    while(ed)await sleep(300);
    ed=E;
    try{E.s.strokes.push({t:"ai",marks:b.marks});compose();cand=cropOf(edProc,r.c)}
    finally{ed=null}
    if(inkRatio(cand)<0.6*inkRatio(r.pre)){b.aiNote="Yapay zekânın bulduğu izler sorunun yazısıyla karıştığı için silinmedi. Gerekirse sihirli değnekle elle sil.";b.marks=null;return false}
    b.plain={file:b.f.qFile,ed:b.f.qEd};
    b.f.qFile=await canvasBlob(cand,0.9);b.f.qEd=JSON.parse(JSON.stringify(E.s));
    if(b.f.qPrev)URL.revokeObjectURL(b.f.qPrev);b.f.qPrev=URL.createObjectURL(b.f.qFile);
    b.aiClean=true;b.aiNote="";ok=true;return true;
  }catch(e){b.aiNote="Yapay zekâ temizliği yapılamadı.";return false}
  finally{b.busy=false;b.msg="";bulkItemUpdate(b);bulkHead()}
}
function bulkAiUndo(b){
  if(!b.plain||b.busy)return;
  if(b.f.qPrev)URL.revokeObjectURL(b.f.qPrev);
  b.f.qFile=b.plain.file;b.f.qEd=b.plain.ed;b.f.qPrev=URL.createObjectURL(b.f.qFile);b.plain=null;b.aiClean=false;
  bulkItemUpdate(b);bulkHead();
}
async function bulkAiCleanAll(){
  var B=bulk;if(!B||B.cleaning)return;B.cleaning=true;bulkHead();
  try{var l=B.list.filter(function(b){return b.st==="ready"&&b.marks&&!b.aiClean});for(var i=0;i<l.length;i++){if(bulk!==B)return;await bulkAiClean(l[i])}}
  finally{B.cleaning=false;if(bulk===B)bulkHead()}
}
function bulkItemUpdate(b){if(!bulk||!b.el||!b.el.isConnected)return;var i=bulk.list.indexOf(b);if(i<0)return;var n=bulkCard(b,i);b.el.replaceWith(n);b.el=n}
function bulkRemove(b){
  if(!bulk)return;var i=bulk.list.indexOf(b);if(i<0)return;
  bulk.list.splice(i,1);if(b.f.qPrev&&b.st!=="work")URL.revokeObjectURL(b.f.qPrev);
  if(!bulk.list.length){closeBulkNow();return}
  renderBulk();
}
function bulkEdit(b){
  if(!bulk)return;if(bulk.running||bulk.cleaning||b.busy){toast("Fotoğraflar hazırlanırken düzeltme yapılamaz. Biraz bekle.");return}
  bulkEditing=b;form=b.f;openEditor("q");
}
var _ceBulk=closeEditor;closeEditor=function(){
  _ceBulk();
  if(bulkEditing){var bb=bulkEditing;bulkEditing=null;setTimeout(function(){if(form===bb.f)form=blankForm(lastKeep);bulkItemUpdate(bb);bulkHead()},0)}
};
function bulkLetters(b,key,opts){
  var f=b.f,w=el("div","letters sm"),cur=(f[key]||"").split(",").filter(Boolean);opts=opts.slice();
  if(cur.indexOf("E")>=0&&opts.indexOf("E")<0)opts.splice(4,0,"E");
  opts.forEach(function(o){
    var x=el("button","letter"+(o==="bos"?" wide":"")+(key==="correct"?" right":""),o==="bos"?"Boş":o);x.type="button";x.setAttribute("aria-pressed",String(cur.indexOf(o)>=0));
    x.setAttribute("aria-label",(key==="mine"?"İşaretlenen ":"Doğru cevap ")+(o==="bos"?"boş":o));
    x.addEventListener("click",function(){
      if(key==="correct"||o==="bos")f[key]=f[key]===o?null:o;
      else{var c=cur.filter(function(v){return v!=="bos"}),k=c.indexOf(o);if(k>=0)c.splice(k,1);else c.push(o);c.sort();f[key]=c.length?c.join(","):null}
      bulkItemUpdate(b);if(key==="correct")bulkHead();
    });
    w.appendChild(x);
  });
  return w;
}
function topicSelect(f,onChange){
  var sl=el("select","field");sl.setAttribute("aria-label","Konu");
  if(!f.sub){sl.disabled=true;var o0=el("option",null,"Konu");o0.value="";sl.appendChild(o0);return sl}
  var o1=el("option",null,"Konu seç");o1.value="";sl.appendChild(o1);
  var loose=[];
  topicGroups(f.sub).forEach(function(gr){if(!gr[1].length){loose.push(gr[0]);return}var og=el("optgroup");og.label=gr[0];gr[1].forEach(function(t){var o=el("option",null,t);o.value=t;o.dataset.unit=gr[0];og.appendChild(o)});sl.appendChild(og)});
  if(loose.length){var og2=el("optgroup");og2.label=f.sub==="ing"?"Temalar":"Üniteler";loose.forEach(function(t){var o=el("option",null,t);o.value=t;o.dataset.unit=t;og2.appendChild(o)});sl.appendChild(og2)}
  var mine=uniq(items.filter(function(i){return i.subject===f.sub&&i.topic&&!findTopic(f.sub,i.topic)}).map(function(i){return i.topic}));
  var cur=(f.topic||"").trim();
  if(f.topicMode==="other"&&cur&&mine.map(trLower).indexOf(trLower(cur))<0)mine.unshift(cur);
  if(mine.length){var og3=el("optgroup");og3.label="Kendi yazdıkların";mine.forEach(function(t){var o=el("option",null,t);o.value="__mine:"+t;og3.appendChild(o)});sl.appendChild(og3)}
  var oo=el("option",null,"Listede yok, kendim yazacağım…");oo.value="__other";sl.appendChild(oo);
  if(f.topicMode==="other"){sl.value=cur&&!f.otherEdit?"__mine:"+cur:"__other";if(!sl.value)sl.value="__other"}
  else{sl.value=f.topic||"";if(sl.value!==(f.topic||""))sl.value=""}
  sl.addEventListener("change",function(){
    var v=sl.value;
    if(v==="__other"){f.topicMode="other";f.topic="";f.unit="";f.otherEdit=true}
    else if(v.indexOf("__mine:")===0){f.topicMode="other";f.topic=v.slice(7);f.unit="";f.otherEdit=false}
    else{f.topicMode="list";f.topic=v;var op=sl.options[sl.selectedIndex];f.unit=(op&&op.dataset.unit)||"";f.otherEdit=false}
    onChange();
  });
  return sl;
}
function bulkCard(b,i){
  var f=b.f,c=el("div","card bitem"+(b.st==="ready"&&!f.sub?" need":""));
  var tp=el("div","top");
  var th=el("button","thumb");th.type="button";th.setAttribute("aria-label",(i+1)+". fotoğraf, büyütmek için dokun");
  if(f.qPrev){var im=el("img");im.src=f.qPrev;im.alt="";th.appendChild(im);th.addEventListener("click",function(){openLightbox(f.qPrev)})}
  else if(b.st==="work")th.appendChild(el("span","spin"));else th.textContent=String(i+1);
  tp.appendChild(th);
  var mid=el("div","st");mid.appendChild(el("b",null,(i+1)+". soru"));
  mid.appendChild(b.busy?el("span","pill due",b.msg||"Temizleniyor…"):b.st==="ready"?(b.ai?el("span","pill done","Yapay zekâ doldurdu"):el("span","pill","Hazır")):b.st==="work"?el("span","pill due",b.msg||"Hazırlanıyor…"):b.st==="fail"?el("span","pill fail",b.msg||"Açılamadı"):el("span","pill","Sırada"));
  if(b.aiMsg&&b.st==="ready")mid.appendChild(el("span","muted small","Yapay zekâ okuyamadı: "+b.aiMsg));
  if(b.aiNote&&b.st==="ready")mid.appendChild(el("span","muted small",b.aiNote));
  if(b.st==="ready"&&!b.ai&&!b.busy&&aiKey()&&!(bulk&&bulk.reading)){var rb=el("button","linkbtn sm","Yapay zekâ ile oku");rb.type="button";rb.addEventListener("click",function(){bulkAiRead(b)});mid.appendChild(rb)}
  if(b.st==="ready"&&b.marks&&!b.aiClean&&!b.busy){var cb=el("button","linkbtn sm","Yapay zekâ ile temizle ("+b.marks.length+" iz)");cb.type="button";cb.addEventListener("click",function(){bulkAiClean(b)});mid.appendChild(cb)}
  if(b.st==="ready"&&b.aiClean&&!b.busy){var ugb=el("button","linkbtn sm","Yapay zekâ temizliğini geri al");ugb.type="button";ugb.addEventListener("click",function(){bulkAiUndo(b)});mid.appendChild(ugb)}
  tp.appendChild(mid);
  var acts=el("div","bacts");
  if(b.st==="ready")acts.appendChild(iconButton(ICONS.wand,"Fotoğrafı düzelt",function(){bulkEdit(b)}));
  acts.appendChild(iconButton(ICONS.close,"Bu fotoğrafı çıkar",function(){bulkRemove(b)}));
  tp.appendChild(acts);c.appendChild(tp);
  if(b.st!=="ready")return c;
  var r2=el("div","row2");
  var ss=el("select","field");ss.setAttribute("aria-label",(i+1)+". soru dersi");var o0=el("option",null,"Ders seç");o0.value="";ss.appendChild(o0);
  SUBJECTS.forEach(function(s){var o=el("option",null,subjName(s.k));o.value=s.k;ss.appendChild(o)});ss.value=f.sub||"";
  ss.addEventListener("change",function(){
    var v=ss.value||null;
    if(v!==f.sub){f.sub=v;f.subBy="user";var m=f.topic&&v?findTopic(v,f.topic):null;if(m&&trLower(m.t)===trLower(f.topic)){f.unit=m.u;f.topicMode="list"}else if(f.topicMode==="list"){f.topic="";f.unit=""}}
    bulkItemUpdate(b);bulkHead();
  });
  r2.appendChild(ss);r2.appendChild(topicSelect(f,function(){bulkItemUpdate(b);bulkHead()}));c.appendChild(r2);
  if(f.topicMode==="other"&&f.sub&&(f.otherEdit||!f.topic.trim())){var ti=el("input","field");ti.placeholder="Konuyu yaz";ti.value=f.topic;ti.addEventListener("input",function(){f.topic=ti.value});ti.addEventListener("change",bulkHead);c.appendChild(ti)}
  var a1=el("div","ansrow");a1.appendChild(el("span","blabel","Doğru"));a1.appendChild(bulkLetters(b,"correct",["A","B","C","D"]));c.appendChild(a1);
  var sv=f.ai&&f.ai.solved;
  if(!f.correct){
    var nk=el("div","nokey");
    if(sv){nk.appendChild(el("span",null,"Ok yok. Yapay zekâ çözdü: muhtemelen "+sv+". Cevap anahtarından kontrol et."));var ub=el("button","linkbtn",sv+" doğru cevap olsun");ub.type="button";ub.addEventListener("click",function(){f.correct=sv;bulkItemUpdate(b);bulkHead()});nk.appendChild(ub)}
    else nk.appendChild(el("span",null,"Doğru cevap yok. Kitabın cevap anahtarından seç ya da boş bırak; tekrarda da girilebilir."));
    c.appendChild(nk);
  }else if(sv&&f.correct===sv)c.appendChild(el("p","muted small","Doğru cevap yapay zekânın çözümünden alındı."));
  var a2=el("div","ansrow");a2.appendChild(el("span","blabel","İşaretli"));a2.appendChild(bulkLetters(b,"mine",["A","B","C","D","bos"]));c.appendChild(a2);
  return c;
}
function renderBulk(){
  if(!bulk)return;var B=bulk,box=$("#bulk"),sb=$("#bulk .screen-body"),sy=sb?sb.scrollTop:0;box.replaceChildren();
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",bulkBack));top.appendChild(el("h2",null,"Toplu ekleme"));var ct=el("span","counter");ct.id="bulk-count";top.appendChild(ct);box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  if(B.askClose){var cf=el("div","confirm");cf.appendChild(el("b",null,"Kaydedilmemiş "+bulkUnsaved()+" soru silinecek. Çıkılsın mı?"));var cb=el("div","btns");
    cb.appendChild(btn("ghost","Vazgeç",function(){B.askClose=false;renderBulk()}));cb.appendChild(btn("bad","Evet, çık",closeBulkNow));cf.appendChild(cb);w.appendChild(cf)}
  var hd=el("div","card bulkhead");hd.id="bulk-head";w.appendChild(hd);
  var cc=el("div","card");cc.appendChild(el("h3",null,"Hepsi için"));
  var g1=group(B.aiOff?"Ders":"Ders (yapay zekâ bulamazsa)");var ch=el("div","wrapchips");
  SUBJECTS.forEach(function(s){var p=el("button","pick",subjName(s.k));p.type="button";p.style.setProperty("--c","var(--s-"+s.k+")");p.setAttribute("aria-pressed",String(B.sub===s.k));
    p.addEventListener("click",function(){B.sub=B.sub===s.k?null:s.k;B.list.forEach(function(b){var f=b.f;if(b.st==="ready"&&(!f.sub||f.subBy==="common")){var was=f.sub;f.sub=B.sub;f.subBy=B.sub?"common":null;if(was!==f.sub&&f.topicMode==="list"){f.topic="";f.unit=""}}});renderBulk()});ch.appendChild(p)});
  g1.appendChild(ch);cc.appendChild(g1);
  var g2=group("Kitap / test",true);var si=el("input","field");si.id="bulk-src";si.placeholder="Örn. Deneme 4";si.value=B.src;si.addEventListener("input",function(){B.src=si.value});g2.appendChild(si);cc.appendChild(g2);
  if(B.aiOff)w.appendChild(cc);
  var list=el("div","stack");list.id="bulk-list";w.appendChild(list);
  B.list.forEach(function(b,i){b.el=bulkCard(b,i);list.appendChild(b.el)});
  if(!B.aiOff)w.appendChild(cc);
  if(B.list.length<40)w.appendChild(btn("ghost block","Fotoğraf ekle",function(){$("#file-bulk").click()},ICONS.gal));
  var foot=el("div","screen-foot"),fin=el("div","in");fin.id="bulk-foot";foot.appendChild(fin);box.appendChild(foot);
  bulkHead();
  var nb=$("#bulk .screen-body");if(nb)nb.scrollTop=sy;
}
function bulkHead(){
  var B=bulk;if(!B)return;var hd=$("#bulk-head"),fin=$("#bulk-foot"),ct=$("#bulk-count");if(!hd)return;
  var tot=B.list.length,done=B.list.filter(function(b){return b.st==="ready"||b.st==="fail"}).length,ok=B.list.filter(function(b){return b.st==="ready"}).length;
  var noSub=B.list.filter(function(b){return b.st==="ready"&&!b.f.sub}).length,noTop=B.list.filter(function(b){return b.st==="ready"&&b.f.sub&&!(b.f.topic||"").trim()}).length;
  var noKey=B.list.filter(function(b){return b.st==="ready"&&!b.f.correct}).length;
  var withMarks=B.list.filter(function(b){return b.st==="ready"&&b.marks&&!b.aiClean}).length,busyN=B.list.filter(function(b){return b.busy}).length;
  if(ct)ct.textContent=tot+" fotoğraf";
  hd.replaceChildren();
  function bar(v){var pr=el("div","progress");var pi=el("i");pi.style.width=Math.round(v*100)+"%";pr.appendChild(pi);return pr}
  if(B.saving){hd.appendChild(el("b",null,"Kaydediliyor… "+B.saved+" / "+ok));hd.appendChild(bar(ok?B.saved/ok:0))}
  else if(done<tot){
    hd.appendChild(el("b",null,"Fotoğraflar hazırlanıyor… "+done+" / "+tot));hd.appendChild(bar(tot?done/tot:0));
    hd.appendChild(el("span","muted small","Kalem izlerini program kendisi temizliyor. Hazır olanları bu sırada kontrol edebilirsin."));
  }else{
    hd.appendChild(el("b",null,ok+" soru hazır"));
    var msg=[];if(noSub)msg.push(noSub+" sorunun dersi seçilmedi");if(noTop)msg.push(noTop+" sorunun konusu boş, sonra Defter'den düzenleyebilirsin");if(noKey)msg.push(noKey+" sorunun doğru cevabı seçilmedi; cevap anahtarından seçebilir ya da tekrarda girebilirsin");
    hd.appendChild(el("span","muted small",msg.length?msg.join(" · ")+".":"Kontrol et; yanlış okunan bir şey varsa düzelt ve kaydet. Sorular günlük sınıra göre sırayla tekrara girer."));
  }
  if(!aiKey())hd.appendChild(el("span","muted small","İpucu: Ayarlar → Yapay zekâ yardımı bölümünden ücretsiz anahtar eklersen ders, konu ve cevapları istediğinde yapay zekâya okutabilirsin."));
  var unread=B.list.filter(function(b){return b.st==="ready"&&!b.ai}).length;
  if(!B.saving&&aiKey()&&(B.reading||unread)){
    var rd=el("div","aiclean");
    if(B.reading){rd.appendChild(el("span","small","Yapay zekâ okuyor… "+(B.readDone||0)+" / "+(B.readTot||0)));rd.appendChild(btn("ghost sm","Durdur",function(){B.aiStop=true;bulkHead()}))}
    else{rd.appendChild(el("span","small","İstersen ders, konu, doğru cevap ve işaretli şıkkı yapay zekâ doldursun. Fotoğraf başına birkaç saniye sürer; ücretsiz sınır dolarsa bekler. Senin seçtiklerin değişmez."));
      rd.appendChild(btn("ghost sm","Yapay zekâ ile oku ("+unread+")",bulkAiReadAll,ICONS.spark))}
    hd.appendChild(rd);
  }
  if(!B.saving&&(withMarks||B.cleaning)){
    var ab=el("div","aiclean");
    ab.appendChild(el("span","small",B.cleaning?"Yapay zekâ izleri siliyor… ":"Kalem izlerini program kendisi temizledi. Yapay zekâ "+withMarks+" fotoğrafta kalan iz buldu; istersen onları da yapay zekâ silsin."));
    if(!B.cleaning)ab.appendChild(btn("ghost sm","Hepsini yapay zekâ ile temizle",bulkAiCleanAll,ICONS.spark));
    hd.appendChild(ab);
  }
  if(fin){
    fin.replaceChildren();
    var label=B.saving?"Kaydediliyor…":B.running?"Hazırlanıyor…":B.reading?"Yapay zekâ okuyor…":(B.cleaning||busyN)?"Yapay zekâ çalışıyor…":noSub?"Önce "+noSub+" sorunun dersini seç":(ok?ok+" soruyu kaydet":"Kaydedilecek soru yok");
    var sv=btn("primary",label,saveBulk,ICONS.check);sv.id="bulk-save";sv.disabled=B.saving||B.running||B.cleaning||B.reading||busyN>0||!ok||!!noSub;fin.appendChild(sv);
  }
}
async function saveBulk(){
  var B=bulk;if(!B||B.saving||B.running)return;
  var list=B.list.filter(function(b){return b.st==="ready"});if(!list.length)return;
  if(list.some(function(b){return !b.f.sub})){toast("Önce her sorunun dersini seç.");return}
  B.saving=true;B.saved=0;bulkHead();
  var base=Date.now(),src=(B.src||"").trim();
  try{
    for(var i=0;i<list.length;i++){
      var f=list[i].f;
      var qP=await storePhoto(f.qFile),oP=f.oFile?await storePhoto(f.oFile):null;
      await col.add({aiSolved:(!f.correct&&f.ai&&f.ai.solved)||null,keyFromAi:!!(f.ai&&f.ai.solved&&f.correct===f.ai.solved),subject:f.sub,topic:(f.topic||"").trim(),unit:f.unit||"",grade:S.grade||null,source:src,note:"",mine:f.mine,correct:f.correct,reason:null,solution:"",qPhoto:qP,oPhoto:oP,sPhoto:null,tip:"",tipAudio:null,
        createdAt:base+i,date:todayStr(),stage:0,next:addDays(1),mastered:false,wrongCount:1,reviews:0,bulk:true});
      B.saved=i+1;bulkHead();
    }
    if(src)lastKeep={sub:(lastKeep&&lastKeep.sub)||null,source:src};
    B.list=B.list.filter(function(b){return b.st!=="ready"});
    closeBulkNow();
    toast(list.length+" soru deftere eklendi. Günlük sınıra göre sırayla tekrara girecek.");
  }catch(e){
    var savedOnes=list.slice(0,B.saved);B.list=B.list.filter(function(b){return savedOnes.indexOf(b)<0});
    B.saving=false;renderBulk();writeErr(e);
  }
}

/* ---------- questions saved without a correct answer (marks were erased) ---------- */
function correctBox(it){
  var c=el("div","keybox");
  c.appendChild(el("b",null,"Doğru cevap girilmemiş"));
  c.appendChild(el("span","small",it.aiSolved?"Yapay zekânın çözümüne göre muhtemelen "+it.aiSolved+" (kontrol edilmedi). Kitabın cevap anahtarına bakıp doğru şıkkı işaretle:":"Kitabın cevap anahtarına bakıp doğru şıkkı işaretle:"));
  var w=el("div","letters sm");
  ["A","B","C","D","E"].forEach(function(L){
    var x=el("button","letter right",L);x.type="button";x.setAttribute("aria-label","Doğru cevap "+L);
    x.addEventListener("click",function(){col.doc(it.id).update({correct:L,keyFromAi:false}).then(function(){toast("Doğru cevap kaydedildi: "+L)},writeErr)});
    w.appendChild(x);
  });
  c.appendChild(w);return c;
}

/* ---------- confirm dialog + deleting several questions at once ---------- */
ICONS.trash=sic('<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/>');
function confirmDialog(o){
  var w=$("#dlg"),d=w.firstElementChild;d.replaceChildren();
  d.appendChild(el("h2",null,o.title));if(o.text)d.appendChild(el("p","muted",o.text));if(o.note)d.appendChild(el("p","small notebox",o.note));
  var bs=el("div","btns"),no=btn("ghost","Vazgeç",closeDialog);bs.appendChild(no);
  var ok=btn(o.danger?"bad solid":"primary",o.ok,async function(){ok.disabled=true;no.disabled=true;ok.lastChild.textContent="Siliniyor…";try{await o.onOk()}finally{closeDialog()}},o.danger?ICONS.trash:null);
  bs.appendChild(ok);d.appendChild(bs);
  w.hidden=false;pushLayer("dlg",closeDialog);try{no.focus({preventScroll:true})}catch(e){}
}
function closeDialog(){var w=$("#dlg");if(w.hidden)return;w.hidden=true;uiClosed("dlg")}
$("#dlg").addEventListener("click",function(e){if(e.target===this)closeDialog()});
async function deleteItems(ids){
  var list=ids.map(byId).filter(Boolean);if(!list.length)return 0;
  var pids=[];list.forEach(function(it){["qPhoto","oPhoto","sPhoto","tipAudio"].forEach(function(k){var p=it[k];if(p&&p.id&&pids.indexOf(p.id)<0)pids.push(p.id)})});
  await idbTx(idbHandle,"mistakes","readwrite",function(s){list.forEach(function(it){s.delete(it.id)});return null});
  try{await idbTx(idbHandle,"photos","readwrite",function(s){pids.forEach(function(id){s.delete(id)});return null})}catch(e){}
  pids.forEach(function(id){if(photoUrls[id]){URL.revokeObjectURL(photoUrls[id]);delete photoUrls[id]}});
  await db.notify();
  return list.length;
}
$("#selDel").addEventListener("click",function(){
  var n=sel.ids.length;if(!n||readOnly)return;
  var all=n===items.length;
  confirmDialog({
    title:all?"Bütün sorular ("+n+") silinsin mi?":n+" soru silinsin mi?",
    text:"Fotoğrafları, notları ve tekrar geçmişiyle birlikte silinir. Geri alınamaz.",
    note:n>=10?"İstersen önce Ayarlar → Yedek al ile yedek al; yanlışlıkla silersen yedekten geri yükleyebilirsin.":null,
    ok:"Evet, sil",danger:true,
    onOk:async function(){
      try{var k=await deleteItems(sel.ids.slice());sel.on=false;sel.ids=[];render();toast(k+" soru silindi.")}
      catch(e){writeErr(e)}
    }
  });
});

/* ---------- fixing a stored answer while reviewing ---------- */
function answerPicker(it,done){
  var w=el("div","fixpick");w.appendChild(el("span","small","Doğru cevap hangisi?"));
  var ls=el("div","letters sm");
  ["A","B","C","D","E"].forEach(function(L){
    var x=el("button","letter right",L);x.type="button";x.setAttribute("aria-pressed",String(it.correct===L));x.setAttribute("aria-label","Doğru cevap "+L);
    x.addEventListener("click",function(){
      if(L===it.correct){if(done)done();return}
      col.doc(it.id).update({correct:L,keyFromAi:false,aiSolved:null}).then(function(){toast("Doğru cevap "+L+" olarak düzeltildi.");if(done)done()},writeErr);
    });
    ls.appendChild(x);
  });
  w.appendChild(ls);return w;
}
function fixRow(it,o){
  var w=el("div","fixrow"),r=el("div","row"),pick=answerPicker(it,function(){pick.hidden=true});pick.hidden=true;
  var b1=el("button","linkbtn","Doğru cevabı düzelt");b1.type="button";b1.addEventListener("click",function(){pick.hidden=!pick.hidden});r.appendChild(b1);
  if(o&&o.edit){var b2=el("button","linkbtn","Soruyu düzenle");b2.type="button";b2.addEventListener("click",function(){startEdit(it)});r.appendChild(b2)}
  w.appendChild(r);w.appendChild(pick);return w;
}

/* ---------- AI step-by-step solution ---------- */
var solState=null;
var SOL_SCHEMA={type:"object",properties:{steps:{type:"array",items:{type:"string"}},answer:{type:"string"},idea:{type:"string"},trap:{type:"string"}},required:["steps","answer","idea","trap"]};
function aiRow(it){
  var r=el("div","airow");
  r.appendChild(btn("ghost",it.aiSol?"Çözümü aç":"Yapay zekâ çözsün",function(){openSolve(it.id)},ICONS.bulb));
  var n=(it.similar||[]).length;r.appendChild(btn("ghost",n?"Benzer sorular ("+n+")":"Benzer soru üret",function(){openSimilar(it.id)},ICONS.spark));
  r.appendChild(claudeBtn(it,"ghost wide"));
  return r;
}
function solvePrompt(it,simple){
  var g=it.grade||S.grade||7,mine=it.mine&&it.mine!=="bos"?it.mine.split(",").join(", "):"";
  return ["You are a patient Turkish middle-school teacher. The attached photo shows one multiple-choice question for a grade "+g+" student.",
    "Subject: "+subjName(it.subject,g)+". Topic: "+(it.topic||"-")+".",
    it.correct?"The answer key says the correct choice is "+it.correct+".":"The correct choice is not known.",
    mine?"The student chose "+mine+", which was wrong.":"",
    "Solve the question step by step for the student, in Turkish, at grade "+g+" level. At most 8 steps; each step one or two short sentences.",
    "Plain text only: no LaTeX, no markdown, no asterisks. Use ×, ÷, −, ², ³, √ and fractions like 3/4. If there is a figure, describe only the parts you use.",
    "Solve it yourself. answer: the letter (A-E) your solution reaches, or an empty string if you cannot tell. If your result differs from the answer key, still give your own solution; never force the key's answer.",
    "idea: one sentence with the key rule or idea to remember. trap: one sentence about the typical mistake here"+(mine?" and why choice "+mine+" is wrong.":"."),
    simple?"The student did not understand the first explanation: explain much more simply, with smaller steps and, if it helps, a short everyday example.":""].filter(Boolean).join("\n");
}
function cleanSol(r){
  if(!r||!Array.isArray(r.steps))return null;
  var st=r.steps.map(function(s){return String(s==null?"":s).replace(/^\s*(adım\s*)?\d+[\.\):-]\s*/i,"").replace(/\*\*/g,"").trim()}).filter(Boolean).slice(0,10);
  if(!st.length)return null;
  return {steps:st,answer:toLetter(r.answer),idea:String(r.idea||"").trim().slice(0,400),trap:String(r.trap||"").trim().slice(0,400)};
}
function openSolve(id,list){
  var it=byId(id);if(!it)return;
  solState={id:id,busy:false,err:null,ctl:null,local:null,list:list&&list.length>1?list.slice():null};
  $("#solve").hidden=false;pushLayer("solve",closeSolve);renderSolve();
  if(!it.aiSol)genSolve(false);
}
/* next / previous question when the solution screen was opened from a day's list */
function solveGo(dir){
  var st=solState;if(!st||!st.list)return;
  var ids=st.list.filter(function(x){return byId(x)}),i=ids.indexOf(st.id)+dir;if(i<0||i>=ids.length)return;
  if(st.ctl)try{st.ctl.abort()}catch(e){}
  solState={id:ids[i],busy:false,err:null,ctl:null,local:null,list:ids};renderSolve();
  var b=$("#solve .screen-body");if(b)b.scrollTop=0;
  if(!byId(ids[i]).aiSol)genSolve(false);
}
function closeSolve(){if(solState&&solState.ctl)try{solState.ctl.abort()}catch(e){}solState=null;$("#solve").hidden=true;uiClosed("solve")}
async function genSolve(simple){
  var st=solState,it=st&&byId(st.id);if(!it)return;
  if(!aiKey()){st.err="Yapay zekâ çözümü için anahtar gerekir. Ayarlar → Yapay zekâ yardımı bölümünden ücretsiz anahtar ekleyebilirsin.";renderSolve();return}
  st.busy=simple?"simple":"solve";st.err=null;renderSolve();st.ctl=new AbortController();
  try{
    var input=[{type:"text",text:solvePrompt(it,simple)}],src=photoSrc(it.qPhoto);
    if(src){var im=await srcToB64(src);input.push({type:"image",mime_type:im.mime,data:im.data})}
    if(it.note)input.push({type:"text",text:"Question text / note: "+it.note});
    var inter=await aiCall({input:input,response_format:{type:"text",mime_type:"application/json",schema:SOL_SCHEMA}},st.ctl.signal);
    var sol=cleanSol(aiJSON(aiText(inter)));if(!sol)throw aiErr("empty",AI_MSG.empty);
    sol.simple=!!simple;sol.at=todayStr();
    if(solState!==st)return;
    st.local=sol;st.busy=false;renderSolve();
    col.doc(it.id).update({aiSol:sol}).catch(function(){});
  }catch(e){
    if(solState!==st)return;st.busy=false;if(e&&e.code==="cancel"){renderSolve();return}
    st.err=(e&&e.message)||AI_MSG.other;renderSolve();
  }
}
function solText(sol){return sol.steps.map(function(s,i){return (i+1)+") "+s}).join("\n")+(sol.idea?"\nPüf noktası: "+sol.idea:"")}
function renderSolve(){
  var st=solState;if(!st)return;var it=byId(st.id),box=$("#solve");
  if(!it){closeSolve();return}
  var sb=$("#solve .screen-body"),sy=sb?sb.scrollTop:0;box.replaceChildren();
  var sol=st.local||it.aiSol||null;
  var lst=st.list?st.list.filter(function(x){return byId(x)}):null,li=lst?lst.indexOf(st.id):-1;if(lst&&lst.length<2)lst=null;
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closeSolve));top.appendChild(el("h2",null,"Yapay zekâ çözümü"));
  if(lst)top.appendChild(el("span","pill",(li+1)+" / "+lst.length));box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  var qc=el("div","card");var hd=el("div","row");hd.appendChild(subjChip(it.subject,it.grade));hd.appendChild(el("span","muted small",it.topic||""));qc.appendChild(hd);
  var src=photoSrc(it.qPhoto);if(src)qc.appendChild(photoEl(src,"Soru fotoğrafı"));if(it.note)qc.appendChild(el("div","qtext",it.note));
  w.appendChild(qc);
  if(st.busy){
    var bc=el("div","card busycard");bc.appendChild(el("b",null,st.busy==="simple"?"Daha basit anlatım hazırlanıyor…":"Yapay zekâ soruyu çözüyor…"));bc.appendChild(el("span","muted small","Genellikle 10–30 saniye sürer."));
    bc.appendChild(btn("ghost sm","Vazgeç",function(){if(st.ctl)try{st.ctl.abort()}catch(e){}}));w.appendChild(bc);
  }else if(st.err){
    w.appendChild(el("p","notice",st.err));if(aiKey())w.appendChild(btn("primary block","Tekrar dene",function(){genSolve(false)}));
  }
  if(sol&&!st.busy){
    var c=el("div","card");var h=el("div","row between");h.appendChild(el("h3",null,sol.simple?"Çözüm (basit anlatım)":"Çözüm"));c.appendChild(h);
    var ol=el("ol","steps");sol.steps.forEach(function(s){ol.appendChild(el("li",null,s))});c.appendChild(ol);
    if(sol.answer){var an=el("div","solans");an.appendChild(el("span","muted","Yapay zekânın bulduğu cevap:"));an.appendChild(el("span","ans-right",sol.answer));c.appendChild(an)}
    w.appendChild(c);
    if(sol.answer&&it.correct&&sol.answer!==it.correct){
      var wb=el("div","callout warn");wb.appendChild(el("b",null,"Cevaplar farklı"));
      wb.appendChild(el("span",null,"Yapay zekâ "+sol.answer+" buldu, kayıtlı doğru cevap "+it.correct+". Kitabın cevap anahtarına bak. Yapay zekâ da yanılabilir."));
      var fb=el("button","linkbtn",sol.answer+" doğru cevap olsun");fb.type="button";fb.addEventListener("click",function(){col.doc(it.id).update({correct:sol.answer,keyFromAi:true}).then(function(){toast("Doğru cevap "+sol.answer+" olarak değiştirildi.")},writeErr)});wb.appendChild(fb);
      w.appendChild(wb);
    }else if(sol.answer&&!it.correct){
      var nb2=el("div","callout warn");nb2.appendChild(el("b",null,"Kayıtlı doğru cevap yok"));nb2.appendChild(el("span",null,"Yapay zekâ "+sol.answer+" buldu. Kitabın cevap anahtarıyla kontrol et."));
      var fb2=el("button","linkbtn",sol.answer+" doğru cevap olsun");fb2.type="button";fb2.addEventListener("click",function(){col.doc(it.id).update({correct:sol.answer,keyFromAi:true}).then(function(){toast("Doğru cevap "+sol.answer+" olarak kaydedildi.")},writeErr)});nb2.appendChild(fb2);
      w.appendChild(nb2);
    }
    if(sol.idea){var ib=el("div","callout idea");ib.appendChild(el("b",null,"Püf noktası"));ib.appendChild(el("span",null,sol.idea));w.appendChild(ib)}
    if(sol.trap){var tb=el("div","callout trap");tb.appendChild(el("b",null,"Dikkat"));tb.appendChild(el("span",null,sol.trap));w.appendChild(tb)}
    var txt=solText(sol),saved=(it.solution||"").indexOf(sol.steps[0])>=0;
    var sv=btn("ghost block",saved?"Çözüm notunda kayıtlı":"Çözüm notuna ekle",function(){
      var cur=(it.solution||"").trim();col.doc(it.id).update({solution:(cur?cur+"\n\n":"")+txt}).then(function(){toast("Çözüm notuna eklendi. Tekrarda ve PDF cevap anahtarında görünür.")},writeErr);
    },ICONS.check);sv.disabled=saved;w.appendChild(sv);
    w.appendChild(el("p","muted small","Bu çözümü yapay zekâ yazdı; nadiren hatalı olabilir. Çözüm kaydedildi, internetsiz de açılır."));
  }
  if(!st.busy){var cb=el("div","claudebox");cb.appendChild(el("span","muted small",sol?"İkinci bir görüş ister misin?":"Ücretsiz yapay zekâ olmadı mı?"));cb.appendChild(claudeBtn(it,"ghost block"));w.appendChild(cb)}
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  if(lst){
    if(sol&&!st.busy&&aiKey()){var sbtn=btn("ghost block","Daha basit anlat",function(){genSolve(true)});if(sv&&sv.parentNode===w)w.insertBefore(sbtn,sv);else w.appendChild(sbtn)}
    if(li>0)fin.appendChild(btn("ghost","Önceki soru",function(){solveGo(-1)}));
    fin.appendChild(li<lst.length-1?btn("primary","Sonraki soru",function(){solveGo(1)}):btn("primary","Bitti, kapat",closeSolve));
  }else{
    if(sol&&!st.busy&&aiKey())fin.appendChild(btn("ghost","Daha basit anlat",function(){genSolve(true)}));
    fin.appendChild(btn("primary","Kapat",closeSolve));
  }
  box.appendChild(foot);
  var nb=$("#solve .screen-body");if(nb)nb.scrollTop=sy;
}

/* ---------- automatic crop ----------
   Finds the text blocks in the cleaned photo, starts from the biggest one near the middle and adds the
   blocks above/below it that line up with it (question text, figure, choices). Partial text cut off at
   the left/right edges (the next column) is left out. When unsure it keeps more, never less. */
function cropOf(src,c){var o=document.createElement("canvas");o.width=c.w;o.height=c.h;o.getContext("2d").drawImage(src,c.x,c.y,c.w,c.h,0,0,c.w,c.h);return o}
function autoCropRect(E){
  try{
    var W0=E.W,H0=E.H,src=E.base;if(!src||!W0||!H0)return null;
    var k=Math.min(1,520/Math.max(W0,H0)),w=Math.max(1,Math.round(W0*k)),h=Math.max(1,Math.round(H0*k)),n=w*h,i,x,y;
    /* downscale (box average) to grey */
    var g=new Float32Array(n),cnt=new Uint16Array(n);
    for(y=0;y<H0;y++){var yy=Math.min(h-1,Math.floor(y*k));for(x=0;x<W0;x++){var o=(y*W0+x)*4,j=yy*w+Math.min(w-1,Math.floor(x*k));g[j]+=(src[o]+src[o+1]+src[o+2])/3;cnt[j]++}}
    for(i=0;i<n;i++)g[i]=cnt[i]?g[i]/cnt[i]:255;
    /* the paper: bright, colourless area of the original photo (the table, cloth or hand around it is left out) */
    var pb={x0:0,y0:0,x1:w-1,y1:h-1};
    try{
      var tc=document.createElement("canvas");tc.width=w;tc.height=h;var tcx=tc.getContext("2d",{willReadFrequently:true});tcx.drawImage(edOrig,0,0,w,h);
      var od=tcx.getImageData(0,0,w,h).data,vv=new Uint8Array(n),vs=[];
      for(i=0;i<n;i++){var r0=od[i*4],g0=od[i*4+1],b0=od[i*4+2],mx=Math.max(r0,g0,b0),mn=Math.min(r0,g0,b0);vv[i]=(mx>100&&(mx-mn)/mx<0.3)?mx:0;if(i%5===0)vs.push(mx)}
      vs.sort(function(a,b){return a-b});var P=vs[Math.floor(vs.length*0.9)]||255,pm=new Uint8Array(n),seenP=new Uint8Array(n),stP=new Int32Array(n),best=null;
      for(i=0;i<n;i++)if(vv[i]>0.7*P)pm[i]=1;
      for(i=0;i<n;i++){
        if(!pm[i]||seenP[i])continue;var spP=0,aP=0,X0=w,Y0=h,X1=0,Y1=0;stP[spP++]=i;seenP[i]=1;
        while(spP){var qP=stP[--spP],qxP=qP%w,qyP=(qP-qxP)/w;aP++;if(qxP<X0)X0=qxP;if(qxP>X1)X1=qxP;if(qyP<Y0)Y0=qyP;if(qyP>Y1)Y1=qyP;
          if(qxP>0&&pm[qP-1]&&!seenP[qP-1]){seenP[qP-1]=1;stP[spP++]=qP-1}if(qxP<w-1&&pm[qP+1]&&!seenP[qP+1]){seenP[qP+1]=1;stP[spP++]=qP+1}
          if(qyP>0&&pm[qP-w]&&!seenP[qP-w]){seenP[qP-w]=1;stP[spP++]=qP-w}if(qyP<h-1&&pm[qP+w]&&!seenP[qP+w]){seenP[qP+w]=1;stP[spP++]=qP+w}}
        if(!best||aP>best.a)best={a:aP,x0:X0,y0:Y0,x1:X1,y1:Y1};
      }
      if(best&&best.a>n*0.15)pb={x0:Math.min(w-1,best.x0+3),y0:Math.min(h-1,best.y0+3),x1:Math.max(0,best.x1-3),y1:Math.max(0,best.y1-3)};
    }catch(e){}
    /* ink: darker than its surroundings */
    var I=new Float64Array((w+1)*(h+1));
    for(y=0;y<h;y++){var rs=0;for(x=0;x<w;x++){rs+=g[y*w+x];I[(y+1)*(w+1)+x+1]=I[y*(w+1)+x+1]+rs}}
    var R=10,ink=new Uint8Array(n),total=0;
    for(y=pb.y0;y<=pb.y1;y++)for(x=pb.x0;x<=pb.x1;x++){
      var x0=Math.max(0,x-R),y0=Math.max(0,y-R),x1=Math.min(w,x+R+1),y1=Math.min(h,y+R+1);
      var m=(I[y1*(w+1)+x1]-I[y0*(w+1)+x1]-I[y1*(w+1)+x0]+I[y0*(w+1)+x0])/((x1-x0)*(y1-y0)),v=g[y*w+x];
      if(v<175&&v<m*0.86){ink[y*w+x]=1;total++}
    }
    if(total<n*0.003)return null;
    /* letter height -> line height */
    var lab=new Int32Array(n).fill(-1),stack=new Int32Array(n),hs=[];
    for(i=0;i<n;i++){
      if(!ink[i]||lab[i]>=0)continue;var sp=0,mny=h,mxy=0,mnx=w,mxx=0,c=0;stack[sp++]=i;lab[i]=0;
      while(sp){var q=stack[--sp],qx=q%w,qy=(q-qx)/w;c++;if(qy<mny)mny=qy;if(qy>mxy)mxy=qy;if(qx<mnx)mnx=qx;if(qx>mxx)mxx=qx;
        if(qx>0&&ink[q-1]&&lab[q-1]<0){lab[q-1]=0;stack[sp++]=q-1}if(qx<w-1&&ink[q+1]&&lab[q+1]<0){lab[q+1]=0;stack[sp++]=q+1}
        if(qy>0&&ink[q-w]&&lab[q-w]<0){lab[q-w]=0;stack[sp++]=q-w}if(qy<h-1&&ink[q+w]&&lab[q+w]<0){lab[q+w]=0;stack[sp++]=q+w}}
      var bh=mxy-mny+1,bw=mxx-mnx+1;if(bh>=3&&bh<=h*0.08&&bw<=bh*4+2&&c>=4)hs.push(bh);
    }
    hs.sort(function(a,b){return a-b});
    var L=hs.length>=15?hs[hs.length>>1]*1.9:Math.max(6,h*0.025);
    /* merge letters into blocks: dilate */
    var rx=Math.max(2,Math.round(L*0.9)),ry=Math.max(2,Math.round(L*0.45));
    function dil(a,horiz){var out=new Uint8Array(n),r=horiz?rx:ry;
      if(horiz)for(y=0;y<h;y++){var run=0,base=y*w;for(x=0;x<w+r;x++){if(x<w&&a[base+x])run=2*r+1;if(run>0){var t=x-r;if(t>=0&&t<w)out[base+t]=1;run--}else{}}}
      else for(x=0;x<w;x++){var run2=0;for(y=0;y<h+r;y++){if(y<h&&a[y*w+x])run2=2*r+1;if(run2>0){var t2=y-r;if(t2>=0&&t2<h)out[t2*w+x]=1;run2--}}}
      return out}
    var dm=dil(dil(ink,true),false);
    /* blocks */
    var bl=[];lab.fill(-1);
    for(i=0;i<n;i++){
      if(!dm[i]||lab[i]>=0)continue;var id=bl.length,b={x0:w,y0:h,x1:0,y1:0,ink:0};bl.push(b);var sp2=0;stack[sp2++]=i;lab[i]=id;
      while(sp2){var q2=stack[--sp2],px=q2%w,py=(q2-px)/w;if(ink[q2])b.ink++;if(px<b.x0)b.x0=px;if(px>b.x1)b.x1=px;if(py<b.y0)b.y0=py;if(py>b.y1)b.y1=py;
        if(px>0&&dm[q2-1]&&lab[q2-1]<0){lab[q2-1]=id;stack[sp2++]=q2-1}if(px<w-1&&dm[q2+1]&&lab[q2+1]<0){lab[q2+1]=id;stack[sp2++]=q2+1}
        if(py>0&&dm[q2-w]&&lab[q2-w]<0){lab[q2-w]=id;stack[sp2++]=q2-w}if(py<h-1&&dm[q2+w]&&lab[q2+w]<0){lab[q2+w]=id;stack[sp2++]=q2+w}}
    }
    bl=bl.filter(function(b){return b.ink>=Math.max(12,total*0.004)});
    /* drop rules and page edges: long blocks whose ink sits in only a few rows (or columns) */
    bl=bl.filter(function(b){
      var bw=b.x1-b.x0+1,bh=b.y1-b.y0+1,yy,xx,r=0,cc=0;
      if(bw>w*0.3&&bh<L*2.2){for(yy=b.y0;yy<=b.y1;yy++){for(xx=b.x0;xx<=b.x1;xx++)if(ink[yy*w+xx]){r++;break}}if(r<=Math.max(3,L*0.45))return false}
      if(bh>h*0.3&&bw<L*2.2){for(xx=b.x0;xx<=b.x1;xx++){for(yy=b.y0;yy<=b.y1;yy++)if(ink[yy*w+xx]){cc++;break}}if(cc<=Math.max(3,L*0.45))return false}
      if(bw>w*0.6&&bh>h*0.6&&b.ink/(bw*bh)<0.025)return false;
      /* background / table / page border around the paper: touches three or four sides of the photo */
      var sides=(b.x0<=pb.x0+2?1:0)+(b.y0<=pb.y0+2?1:0)+(b.x1>=pb.x1-2?1:0)+(b.y1>=pb.y1-2?1:0);if(sides>=3)return false;
      return true;
    });
    if(!bl.length)return null;
    var e=2;bl.forEach(function(b){b.side=b.x0<=pb.x0+e||b.x1>=pb.x1-e;b.tb=b.y0<=pb.y0+e||b.y1>=pb.y1-e;b.edge=b.side||b.tb;b.cx=(b.x0+b.x1)/2;b.cy=(b.y0+b.y1)/2});
    function score(b){var dx=Math.abs(b.cx-w/2)/w,dy=Math.abs(b.cy-h/2)/h;return b.ink*(1-0.9*Math.min(1,dx+dy))*(b.side?0.35:1)}
    var seed=bl.slice().sort(function(a,b){return score(b)-score(a)})[0];
    var Rr={x0:seed.x0,y0:seed.y0,x1:seed.x1,y1:seed.y1},used=[seed],G=L*2.2,changed=true;
    function ovx(a,b){return Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))/Math.max(1,Math.min(a.x1-a.x0,b.x1-b.x0))}
    while(changed){changed=false;
      bl.forEach(function(b){
        if(used.indexOf(b)>=0)return;
        var gy=Math.max(0,Math.max(Rr.y0,b.y0)-Math.min(Rr.y1,b.y1)),gx=Math.max(0,Math.max(Rr.x0,b.x0)-Math.min(Rr.x1,b.x1)),ov=ovx(Rr,b);
        var inside=b.x0>=Rr.x0-L&&b.x1<=Rr.x1+L&&b.y0>=Rr.y0-L&&b.y1<=Rr.y1+L;
        var stacked=gy<=(b.tb?L*1.1:G)&&ov>=(b.side?0.6:0.3)&&!(b.side&&b.x1-b.x0<(Rr.x1-Rr.x0)*0.5&&ov<0.9);
        var beside=gy===0&&gx<=L*1.2&&!b.side;
        if(inside||stacked||beside){used.push(b);Rr.x0=Math.min(Rr.x0,b.x0);Rr.y0=Math.min(Rr.y0,b.y0);Rr.x1=Math.max(Rr.x1,b.x1);Rr.y1=Math.max(Rr.y1,b.y1);changed=true}
      });
    }
    var pad=L*0.9;
    var cx0=Math.max(0,Rr.x0-pad),cy0=Math.max(0,Rr.y0-pad),cx1=Math.min(w,Rr.x1+1+pad),cy1=Math.min(h,Rr.y1+1+pad);
    var area=(cx1-cx0)*(cy1-cy0)/n;
    if(area>0.88||area<0.04||(cx1-cx0)<w*0.22)return null;
    var out={x:Math.floor(cx0/k),y:Math.floor(cy0/k),w:Math.ceil((cx1-cx0)/k),h:Math.ceil((cy1-cy0)/k)};
    out.w=Math.min(out.w,W0-out.x);out.h=Math.min(out.h,H0-out.y);
    return out.w>=40&&out.h>=40?out:null;
  }catch(err){return null}
}

/* ---------- daily amount + repetition intervals (settings) ---------- */
function dailyHelpText(){
  var k=newReserve();
  return "Her gün önce tekrar günü gelen sorular listeye girer, kalan yer daha hiç sorulmamış (yeni) sorularla dolar. Son 3 günde tek tek eklenen taze yanlışlar, toplu eklenen eski soruların önüne geçer (yeni soru yerlerinin en fazla yarısını alır). Yeni sorular ders ders sırayla seçilir. Tekrarın çok olduğu günlerde bile en az "+k+" yeni soruya yer ayrılır. Sığmayan soru kaybolmaz, sonraki günlerde ilk sırada gelir.";
}
function dailyPlanText(){
  var q=todayQueue(),r=q.filter(function(i){return (i.reviews||0)>0}).length,n=q.length-r,st=todayStats();
  var wait=items.filter(function(i){return !i.mastered&&!((i.reviews||0)>0)}).length-n;
  var s=(st.done?"Bugün "+st.done+" soru çözüldü. Kalan: ":"Bugün: ")+(q.length?q.length+" soru ("+r+" tekrar, "+n+" yeni).":"soru yok.");
  if(q.length&&S.maxPerDay&&q.length+st.done<S.maxPerDay)s+=" Defterde bugün gelebilecek başka soru olmadığı için "+S.maxPerDay+"'ye tamamlanamadı.";
  var rl=items.filter(isDue).filter(function(i){return (i.reviews||0)>0}).length-r;
  if(rl>0)s+=" Tekrar çok olduğu için "+rl+" tekrar yarına kaldı; yarın listenin başında gelecek.";
  if(wait>0)s+=" Sırada daha hiç sorulmamış "+wait+" soru bekliyor; sonraki günlerde boş kalan yerlere sırayla gelecek.";
  return s;
}
function intervalsBox(){
  var N=masterN(),box=el("div","ivbox");
  function row(label,val,opts,onPick,off){
    var r=el("div","ivrow"+(off?" off":""));r.appendChild(el("span",null,label));
    var s=el("select","field");opts.forEach(function(o){var op=el("option",null,o===1?"Ertesi gün":o+" gün sonra");op.value=String(o);s.appendChild(op)});
    if(opts.indexOf(val)<0){var op2=el("option",null,val+" gün sonra");op2.value=String(val);s.appendChild(op2)}
    s.value=String(val);s.setAttribute("aria-label",label);s.addEventListener("change",function(){onPick(+s.value)});r.appendChild(s);return r;
  }
  box.appendChild(row("Yanlış çözülünce",gapWrong(),[1,2,3],function(v){S.gapWrong=v;saveSettings();applySchedule(true)}));
  var OPTS=[[2,3,5,7,10,14],[5,7,10,14,21,30],[7,14,21,30,45,60],[14,30,45,60,90]];
  var shown=Math.min(N,4);
  for(var i=1;i<=shown;i++)(function(i){
    box.appendChild(row(i+". doğrudan sonra",gapAfter(i),OPTS[i-1],function(v){var g=(S.gaps||[7,14,30,60]).slice();g[i-1]=v;S.gaps=g;saveSettings();applySchedule(true)},i>=N));
  })(i);
  if(N<=4)box.appendChild(el("p","hint",N===1?"Soru ilk doğru çözümde öğrenilmiş sayıldığı için soluk satır şu an kullanılmıyor. Kullanmak için yukarıdan 2 kez seç.":"Soluk satır şu an kullanılmıyor, çünkü soru "+N+". doğruda öğrenilmiş sayılıyor. Onu da kullanmak için yukarıdan "+(N+1)+" kez seç."));
  box.appendChild(el("p","hint plan",scheduleText()));
  return box;
}
/* move already scheduled questions to the new intervals (from their last answer) */
async function applySchedule(announce){
  if(storeState!=="ready"||readOnly)return;
  var ch=[];
  items.forEach(function(i){
    if(i.mastered||!i.lastReview||!i.next)return;
    var n=(i.stage||0)>0?addDaysFrom(i.lastReview,gapAfter(i.stage)):addDaysFrom(i.lastReview,gapWrong());
    if(n!==i.next)ch.push(Object.assign({},i,{next:n}));
  });
  try{
    if(ch.length){await idbTx(idbHandle,"mistakes","readwrite",function(s){ch.forEach(function(x){s.put(x)});return null});await db.notify()}
    lsSet("schedV15","1");
    if(announce){renderSettings();toast(ch.length?"Kaydedildi. "+ch.length+" sorunun tekrar günü yeni aralığa göre değişti.":"Kaydedildi.")}
  }catch(e){}
}
/* ---------- one day's questions (tap a day in the week strip) ---------- */
var dayState=null;
function openDay(d,only){dayState={date:d,only:!!only,cFrom:0};$("#day").hidden=false;pushLayer("day",closeDay);renderDay()}
function closeDay(){dayState=null;$("#day").hidden=true;uiClosed("day")}
function dayTitle(d){var x=parse(d),n=diffDays(d);return (n===0?"Bugün":n===-1?"Dün":n===1?"Yarın":DAYS[x.getDay()])+", "+x.getDate()+" "+MONTHS[x.getMonth()]}
function dayData(d){
  var t=todayStr(),seen={},solved=[],added=[],coming=[];
  items.forEach(function(it){
    var r=null;(it.hist||[]).forEach(function(h){if(h[0]===d)r=h[1]?1:0});
    if(r!==null){solved.push({it:it,ok:r});seen[it.id]=1}
  });
  solved.sort(function(a,b){return a.ok-b.ok||(a.it.createdAt||0)-(b.it.createdAt||0)});
  if(d>=t){
    var q=d===t?todayQueue():items.filter(function(i){return !i.mastered&&i.next===d});
    q.forEach(function(it){if(!seen[it.id]){coming.push(it);seen[it.id]=1}});
  }
  items.filter(function(i){return i.date===d&&!seen[i.id]}).sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0)}).forEach(function(it){added.push(it);seen[it.id]=1});
  return {solved:solved,added:added,coming:coming};
}
function dayItem(it,res,list){
  var w=el("div","dayitem");
  var b=el("button","open");b.type="button";
  var th=el("div","thumb");var src=photoSrc(it.qPhoto);
  if(src){var im=el("img");im.src=src;im.alt="";im.loading="lazy";im.onerror=function(){im.remove()};th.appendChild(im)}else th.textContent="Not";
  b.appendChild(th);
  var bd=el("div","item-body"),r1=el("div","row");r1.appendChild(subjChip(it.subject,it.grade));
  if(res===1)r1.appendChild(el("span","pill done","Doğru"));else if(res===0)r1.appendChild(el("span","pill fail","Yanlış"));
  bd.appendChild(r1);bd.appendChild(el("div","item-topic",it.topic||"Konu yazılmamış"));
  if(it.aiSol)bd.appendChild(el("span","muted small","Çözümü hazır"));
  b.appendChild(bd);b.addEventListener("click",function(){openSheet(it.id)});w.appendChild(b);
  var a=el("button","aib"+(it.aiSol?" has":""));a.type="button";a.innerHTML=ICONS.bulb;a.appendChild(el("span",null,it.aiSol?"Çözüm":"Çöz"));
  a.setAttribute("aria-label",(it.aiSol?"Yapay zekâ çözümünü aç: ":"Yapay zekâ çözsün: ")+(it.topic||"soru"));
  a.addEventListener("click",function(){openSolve(it.id,list)});w.appendChild(a);
  return w;
}
function renderDay(){
  var st=dayState;if(!st)return;var box=$("#day"),d=st.date,t=todayStr();
  var sb=$("#day .screen-body"),sy=sb?sb.scrollTop:0;box.replaceChildren();
  var D=dayData(d),wrong=D.solved.filter(function(x){return !x.ok}).length,right=D.solved.length-wrong;
  if(!wrong)st.only=false;
  var solved=st.only?D.solved.filter(function(x){return !x.ok}):D.solved;
  var ids=solved.map(function(x){return x.it.id}).concat(st.only?[]:D.coming.concat(D.added).map(function(i){return i.id}));
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closeDay));
  top.appendChild(el("h2",null,dayTitle(d)));
  var pv=iconButton(ICONS.chev,"Önceki gün",function(){st.date=addDaysFrom(d,-1);renderDay();var b=$("#day .screen-body");if(b)b.scrollTop=0});pv.classList.add("flip");top.appendChild(pv);
  var nx=iconButton(ICONS.chev,"Sonraki gün",function(){st.date=addDaysFrom(d,1);renderDay();var b=$("#day .screen-body");if(b)b.scrollTop=0});nx.disabled=diffDays(d)>=30;top.appendChild(nx);
  box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  var sum=[];
  if(D.solved.length)sum.push(D.solved.length+" soru çözüldü ("+right+" doğru, "+wrong+" yanlış)");
  if(D.coming.length)sum.push(D.coming.length+" soru "+(d===t?"bugün gelecek":"bu güne planlı"));
  if(D.added.length)sum.push(D.added.length+" soru eklendi");
  if(!sum.length){
    w.appendChild(el("p","notice",d>t?"Bu güne planlanmış tekrar yok.":d===t?"Bugün henüz soru çözülmedi, eklenmedi; bugünkü liste de boş.":"Bu gün soru çözülmedi, soru da eklenmedi."));
  }else{
    w.appendChild(el("p","daysum",sum.join(" · ")));
    if(wrong&&right){
      var sg=el("div","seg two");[[false,"Hepsi ("+ (D.solved.length+D.coming.length+D.added.length)+")"],[true,"Yalnız yanlışlar ("+wrong+")"]].forEach(function(o){var b=el("button",null,o[1]);b.type="button";b.setAttribute("aria-pressed",String(st.only===o[0]));b.addEventListener("click",function(){st.only=o[0];renderDay()});sg.appendChild(b)});
      w.appendChild(sg);
    }
    if(ids.length)w.appendChild(btn("primary block",ids.length>1?"Yapay zekâ sırayla çözsün ("+ids.length+" soru)":"Yapay zekâ çözsün",function(){var f=ids.filter(function(x){var i=byId(x);return i&&!i.aiSol})[0]||ids[0];openSolve(f,ids)},ICONS.bulb));
    if(ids.length>1)w.appendChild(el("p","muted small","Çözümler tek tek açılır; “Sonraki soru” ile ilerlersin. Daha önce çözülenler hazır gelir, internet gerekmez."));
    if(ids.length){
      var CB=10;if(st.cFrom>=ids.length)st.cFrom=0;
      var part=ids.slice(st.cFrom,st.cFrom+CB),lbl=ids.length<=CB?(ids.length>1?"Hepsini Claude'da çöz ("+ids.length+" soru)":"Claude'da çöz"):"Claude'da çöz ("+(st.cFrom+1)+"–"+(st.cFrom+part.length)+". sorular / "+ids.length+")";
      w.appendChild(btn("ghost block",lbl,function(){claudeGo(part.map(byId).filter(Boolean),function(){if(ids.length>CB){st.cFrom+=CB;renderDay()}})},ICONS.share));
      if(ids.length>1)w.appendChild(el("p","muted small",ids.length<=CB?"Sorular tek mesajda, fotoğraflarıyla Claude uygulamasına gider.":"Claude'a tek seferde en fazla "+CB+" soru gönderilir; gönderdikten sonra düğme sıradaki "+CB+" soruya geçer."));
    }
    function sec(title,arr,resOf){if(!arr.length)return;var s=el("div","stack");s.style.gap="10px";s.appendChild(el("h3",null,title));arr.forEach(function(x){s.appendChild(resOf(x))});w.appendChild(s)}
    sec(d===t?"Bugün çözülenler":"Çözülen sorular",solved,function(x){return dayItem(x.it,x.ok,ids)});
    if(!st.only){
      sec(d===t?"Bugün gelecek sorular":"Bu güne planlı tekrarlar",D.coming,function(i){return dayItem(i,null,ids)});
      if(D.coming.length&&d>t)w.appendChild(el("p","muted small","Plan o gün kesinleşir: günlük soru sayısına göre bir kısmı kayabilir, sırada bekleyen yeni sorular da eklenebilir."));
      sec(d===t?"Bugün eklenenler":"Bu gün eklenen sorular",D.added,function(i){return dayItem(i,null,ids)});
    }
  }
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);fin.appendChild(btn("primary","Kapat",closeDay));box.appendChild(foot);
  var nb=$("#day .screen-body");if(nb)nb.scrollTop=sy;
}
/* ---------- solve in the Claude app: share the photo + a ready prompt (uses the parent's own Claude subscription) ---------- */
function claudePrompt(it){
  var g=it.grade||S.grade||7,mine=it.mine&&it.mine!=="bos"?it.mine.split(",").join(", "):"",photo=!!photoSrc(it.qPhoto);
  var L=[g+". sınıf "+subjName(it.subject,g)+" sorusu"+(it.topic?" (konu: "+it.topic+")":"")+"."+(photo?" Soru ekteki fotoğrafta.":"")];
  if(it.correct)L.push("Cevap anahtarına göre doğru cevap "+it.correct+".");
  if(mine)L.push("Öğrenci "+mine+" şıkkını işaretlemiş ve yanlış yapmış.");else if(it.mine==="bos")L.push("Öğrenci bu soruyu boş bırakmış.");
  L.push("Bu soruyu "+g+". sınıf öğrencisine adım adım, kısa ve sade cümlelerle anlatarak çöz. Kendin çöz; sonucun cevap anahtarından farklı çıkarsa bunu açıkça yaz.");
  L.push("Sonunda akılda tutulacak kuralı bir cümleyle"+(mine?" ve "+mine+" şıkkının neden yanlış olduğunu":"")+" yaz.");
  if(it.note)L.push("Soru metni / not: "+it.note);
  return L.join("\n");
}
function claudeBtn(it,cls){return btn(cls||"ghost block","Claude'da çöz",function(){claudeGo(it)},ICONS.share)}
/* several questions in one message: photos are numbered 1-soru, 2-soru … in the same order as the text */
function claudePromptMany(list){
  if(list.length===1)return claudePrompt(list[0]);
  var g=list[0].grade||S.grade||7;
  var L=["Ekte "+g+". sınıf öğrencimin yanlış yaptığı "+list.length+" soru var. Fotoğraflar sırayla 1. soru, 2. soru… (dosya adları da 1-soru, 2-soru…).",""];
  list.forEach(function(it,k){
    var mine=it.mine&&it.mine!=="bos"?it.mine.split(",").join(", "):"";
    var s=(k+1)+". soru: "+subjName(it.subject,it.grade||g)+(it.topic?" (konu: "+it.topic+")":"")+".";
    if(it.correct)s+=" Cevap anahtarına göre doğru cevap "+it.correct+".";
    if(mine)s+=" Öğrenci "+mine+" şıkkını işaretlemiş.";else if(it.mine==="bos")s+=" Öğrenci boş bırakmış.";
    if(!photoSrc(it.qPhoto))s+=" (Fotoğrafı yok.)";
    if(it.note)s+=" Soru metni / not: "+it.note;
    L.push(s);
  });
  L.push("","Her soruyu ayrı başlık altında, "+g+". sınıf öğrencisine adım adım, kısa ve sade cümlelerle anlatarak çöz. Kendin çöz; sonucun cevap anahtarından farklı çıkarsa bunu açıkça yaz. Her sorunun sonunda akılda tutulacak kuralı bir cümleyle ve öğrencinin şıkkının neden yanlış olduğunu yaz.");
  return L.join("\n");
}
async function claudeShareList(list){
  var text=claudePromptMany(list),files=[],copied=false,many=list.length>1;
  for(var k=0;k<list.length;k++){
    var src=photoSrc(list[k].qPhoto);if(!src)continue;
    try{var bl=await (await fetch(src)).blob();var ty=(bl.type||"image/jpeg").split(";")[0];files.push(new File([bl],(many?(k+1)+"-soru.":"soru.")+(ty.indexOf("png")>=0?"png":"jpg"),{type:ty}))}catch(e){}
  }
  try{await navigator.clipboard.writeText(text);copied=true}catch(e){}
  var data={text:text};
  if(files.length&&navigator.canShare&&navigator.canShare({files:files}))data.files=files;
  if(navigator.share&&(!navigator.canShare||navigator.canShare(data))){
    try{await navigator.share(data);if(copied)toast("Claude'da metin görünmezse yazı kutusuna uzun basıp Yapıştır'ı seç.");return true}
    catch(e){if(e&&e.name==="AbortError")return false}
  }
  toast(copied?"Metin kopyalandı. Claude'u açıp yazı kutusuna yapıştır"+(files.length?", soru fotoğraflarını da ekle.":"."):"Bu cihaz paylaşmayı desteklemiyor.");
  return false;
}
function claudeShare(it){return claudeShareList([it])}
function claudeGo(x,done){
  var list=Array.isArray(x)?x:[x],it=list[0];
  if(lsGet("claudeTip")){claudeShareList(list).then(function(r){if(r&&done)done()});return}
  var w=$("#dlg"),d=w.firstElementChild;d.replaceChildren();
  d.appendChild(el("h2",null,"Claude'da çözdür"));
  var ol=el("ol","dlgsteps");
  ["Açılan paylaş menüsünden Claude'u seç.",(list.length>1?list.length+" sorunun fotoğrafları":"Soru fotoğrafı")+" ve hazır metin Claude'a gelir; gönder.","Metin gelmezse yazı kutusuna uzun basıp Yapıştır'ı seç. Metin kopyalanmış olur."].forEach(function(s){ol.appendChild(el("li",null,s))});
  d.appendChild(ol);
  d.appendChild(el("p","muted small","Claude uygulamasının telefonda yüklü olması gerekir. Kendi Claude aboneliğin kullanılır, ek ücret çıkmaz. Claude'un çözümü Claude uygulamasında kalır, programa kaydedilmez."));
  var bs=el("div","btns");bs.appendChild(btn("ghost","Vazgeç",closeDialog));
  var ok=btn("primary","Devam",async function(){lsSet("claudeTip","1");ok.disabled=true;var r=false;try{r=await claudeShareList(list)}finally{closeDialog()}if(r&&done)done()},ICONS.share);
  bs.appendChild(ok);d.appendChild(bs);
  w.hidden=false;pushLayer("dlg",closeDialog);try{ok.focus({preventScroll:true})}catch(e){}
}
/* ---------- paper sheet graded later: results go to the day it was solved ---------- */
function solvedOnBox(){
  var t=todayStr(),ds=[];for(var d=res.date;d<=t&&ds.length<40;d=addDaysFrom(d,1))ds.push(d);
  if(ds.length>8)ds=[ds[0]].concat(ds.slice(-7));
  var b=el("div","card solvedon");var l=el("label",null,"Kâğıt hangi gün çözüldü?");l.htmlFor="res-on";b.appendChild(l);
  var s=el("select","field");s.id="res-on";ds.forEach(function(d){var o=el("option",null,dayTitle(d));o.value=d;s.appendChild(o)});
  s.value=res.on||res.date;s.addEventListener("change",function(){res.on=s.value;renderResults()});b.appendChild(s);
  b.appendChild(el("p","muted small",res.on<t?"Sonuçlar "+shortDate(res.on)+" gününe yazılır. Bugünün soruları azalmaz; tekrar günleri o günden sayılır.":"Sonuçlar bugüne yazılır; bugünün soru sayısından düşer."));
  return b;
}
/* Sürüm 18: an old sheet graded before this version was written to the grading day; move it to the sheet's day */
async function fixLateSheet(){
  lsSet("sheetFixV18","1");
  if(storeState!=="ready"||readOnly)return;
  var d=null;try{d=JSON.parse(lsGet("daily")||"null")}catch(e){}
  var t=todayStr();if(!d||!d.date||!Array.isArray(d.ids)||d.date>=t||daysBetween(d.date,t)>7)return;
  var ch=[];
  d.ids.forEach(function(id){
    var it=byId(id);if(!it||it.lastReview!==t)return;
    var h=(it.hist||[]).slice(),last=h[h.length-1];if(!last||last[0]!==t)return;
    if(h.filter(function(x){return x[0]===t}).length!==1||h.some(function(x){return x[0]>=d.date&&x[0]<t}))return;
    last=[d.date,last[1]];h[h.length-1]=last;
    var p={hist:h,lastReview:d.date};
    if(it.firstSeen===t)p.firstSeen=d.date;
    if(it.mastered){if(it.masteredAt===t)p.masteredAt=d.date}
    else p.next=last[1]?addDaysFrom(d.date,gapAfter(it.stage||1)):addDaysFrom(d.date,gapWrong());
    ch.push(Object.assign({},it,p));
  });
  if(!ch.length)return;
  try{
    await idbTx(idbHandle,"mistakes","readwrite",function(s){ch.forEach(function(x){s.put(x)});return null});await db.notify();
    toast(shortDate(d.date)+" tarihli kâğıdın "+ch.length+" sonucu o güne taşındı. Bugünün soruları geldi.");
  }catch(e){}
}