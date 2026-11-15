var SUBJECTS=[{k:"mat",n:"Matematik"},{k:"fen",n:"Fen Bilimleri"},{k:"tr",n:"Türkçe"},{k:"par",n:"Paragraf"},{k:"sos",n:"Sosyal Bilgiler"},{k:"din",n:"Din Kültürü"},{k:"ing",n:"İngilizce"}];
var REASONS=[{k:"bilgi",n:"Konuyu bilmiyordum"},{k:"dikkat",n:"Dikkatsizlik"},{k:"islem",n:"İşlem hatası"},{k:"okuma",n:"Soruyu yanlış okudum"},{k:"sure",n:"Süre yetmedi"},{k:"tahmin",n:"Tahminle işaretledim"}];
var TIPS={
  bilgi:"En çok konu eksiğinden yanlış çıkıyor. Bu konuların özetini bir kez daha oku, sonra az ama dikkatli soru çöz.",
  dikkat:"Dikkat hataları öne çıkıyor. Soru kökündeki “değildir, yanlıştır, en az” gibi ifadelerin altını çiz.",
  islem:"İşlem hataları çok. İşlemi kenara düzenli yaz ve sonucu soruya geri koyarak kontrol et.",
  okuma:"Soruyu yanlış okuma sık oluyor. Soruyu sonuna kadar okumadan şıklara bakma.",
  sure:"Süre yetmiyor. Önce kolay soruları çöz, takıldığın soruyu işaretleyip sona bırak.",
  tahmin:"Tahminle işaretleme çok. Emin olmadığın her soruyu bu deftere ekle; tekrarla kalıcı olur."
};
var INTERVALS=[1,3,7,15,30];
var MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
var DAYS=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
var VIEWS=["home","defter","analiz","ayarlar"];
var APP_VERSION="Sürüm 24 · 15 Kasım 2026";
var LOGO_TILE='{{LOGO_TILE}}';
var ICONS={
  cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  gal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  chev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  wand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20 16 8"/><path d="M14 4v3M18 6h3M19 10v2M10 3h2"/></svg>',
  pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  select:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 12l3 3 5-6"/></svg>'
};

var db=null, assets=null, col=null, readOnly=false, storeState="loading", items=[];
var view="home", sheetId=null, confirmDel=false, saving=false, addOpen=false, rv=null, lastKeep=null;
var filt={sub:"all",status:"all",q:"",topic:""};
var sel={on:false,ids:[]};
var S=loadSettings();
var form=blankForm();

function loadSettings(){
  var d={grade:0,name:"",newPerDay:10,maxPerDay:25,weekGoal:5,masterAfter:2,gapWrong:1,gaps:[7,14,30,60]};
  try{var o=JSON.parse(lsGet("settings")||"{}");Object.keys(d).forEach(function(k){if(o[k]!=null)d[k]=o[k]})}catch(e){}
  if(!Array.isArray(d.gaps)||d.gaps.length<4)d.gaps=[7,14,30,60];
  return d;
}
function saveSettings(){lsSet("settings",JSON.stringify(S))}
function blankForm(keep){
  return {editing:null, sub:keep?keep.sub:null, topic:"", unit:"", topicMode:"list", source:keep?keep.source:"", note:"", mine:null, correct:null, reason:null, solution:"", qFile:null, sFile:null, qPhoto:null, sPhoto:null, qPrev:null, sPrev:null, qRaw:null, sRaw:null, qEd:null, sEd:null, qRawOrig:false, sRawOrig:false, oFile:null, oPhoto:null, ai:null, tip:"", tipAudio:null, tipBlob:null, tipPrev:null, tipDel:false};
}
function lsGet(k){try{return localStorage.getItem("yd_"+k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem("yd_"+k,v)}catch(e){}}

/* ---------- helpers ---------- */
function $(s){return document.querySelector(s)}
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function svgEl(html){var s=el("span");s.innerHTML=html;return s.firstChild}
function ymd(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function todayStr(){return ymd(new Date())}
function addDays(n){var d=new Date();d.setDate(d.getDate()+n);return ymd(d)}
function addDaysFrom(s,n){var d=parse(s);d.setDate(d.getDate()+n);return ymd(d)}
/* days until the next showing after the n-th correct answer in a row, and after a wrong answer */
function gapAfter(n){var g=S.gaps||[7,14,30,60];return Math.max(1,+g[Math.max(0,Math.min(n,g.length)-1)]||7)}
function gapWrong(){return Math.max(1,+S.gapWrong||1)}
function parse(s){var p=s.split("-").map(Number);return new Date(p[0],p[1]-1,p[2])}
function diffDays(s){return Math.round((parse(s)-parse(todayStr()))/86400000)}
function fmtDate(s){if(!s)return "";var d=parse(s);return d.getDate()+" "+MONTHS[d.getMonth()]}
function relDay(s){var n=diffDays(s);if(n<0)return (-n)+" gün gecikti";if(n===0)return "bugün";if(n===1)return "yarın";return n+" gün sonra"}
function subj(k){for(var i=0;i<SUBJECTS.length;i++)if(SUBJECTS[i].k===k)return SUBJECTS[i];return {k:"x",n:"Ders"}}
function subjName(k,g){if(k==="sos"&&(g||S.grade)===8)return "İnkılap Tarihi";return subj(k).n}
function reasonName(k){for(var i=0;i<REASONS.length;i++)if(REASONS[i].k===k)return REASONS[i].n;return ""}
function subjChip(k,g){var s=subj(k);var c=el("span","chip dot",subjName(k,g));c.style.setProperty("--c","var(--s-"+s.k+")");return c}
function photoSrc(p){if(!p)return null;if(p.id)return photoUrls[p.id]||null;if(p.data)return p.data;return null}
function isDue(i){return !i.mastered&&i.next&&i.next<=todayStr()}
function byId(id){for(var i=0;i<items.length;i++)if(items[i].id===id)return items[i];return null}
function masterN(){return Math.max(1,Math.min(5,S.masterAfter||2))}
function stagesEl(n){var N=masterN(),w=el("span","stages");w.setAttribute("aria-label",Math.min(n||0,N)+" / "+N+" üst üste doğru");for(var i=0;i<N;i++){w.appendChild(el("i",i<(n||0)?"on":""))}return w}
/* how the schedule works, in words, for the current setting */
function scheduleText(short){
  var N=masterN(),iv=[];for(var k=1;k<N;k++)iv.push(gapAfter(k));
  var a="Yanlış çözülen soru "+(gapWrong()===1?"ertesi gün":gapWrong()+" gün sonra")+" yeniden gelir.";
  var b=N===1?" Doğru çözülen soru öğrenilmiş sayılır, bir daha sorulmaz.":" Doğru çözülen soru "+(iv.length===1?iv[0]+" gün sonra bir kez daha":iv.join(", ")+" gün arayla yeniden")+" sorulur; "+N+" kez üst üste doğru çözülünce öğrenilmiş sayılır ve bir daha sorulmaz.";
  return short?b.trim():a+b;
}
function toast(msg){var t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove("show")},2800)}
function btn(cls,text,fn,icon){var b=el("button","btn "+cls);b.type="button";if(icon)b.innerHTML=icon;b.appendChild(document.createTextNode(text));if(fn)b.addEventListener("click",fn);return b}
function iconButton(icon,label,fn){var b=el("button","iconbtn");b.type="button";b.innerHTML=icon;b.setAttribute("aria-label",label);b.addEventListener("click",fn);return b}
function trLower(s){return String(s||"").toLocaleLowerCase("tr")}

/* ---------- layers (overlays that the phone's back button closes) ---------- */
/* One history entry ("trap") stands for all open layers. The phone's back button uses it up and closes
   the top layer; if more layers are open the trap is set again. Closing a layer from the screen gives the
   entry back only when nothing else opened meanwhile, so closing one screen and opening the next can never
   step back past the app. */
var layers=[],ignorePop=0,popping=false,trap=false;
function armTrap(){try{history.pushState({yd:1},"");trap=true}catch(e){}}
function pushLayer(name,close){layers.push({name:name,close:close});if(!trap&&!ignorePop)armTrap();lockScroll()}
function uiClosed(name){
  lockScroll();
  for(var i=layers.length-1;i>=0;i--)if(layers[i].name===name){layers.splice(i,1);break}
  if(popping)return;
  if(!layers.length)setTimeout(function(){if(!layers.length&&trap&&!ignorePop){trap=false;ignorePop++;try{history.back()}catch(e){ignorePop--}}},0);
}
window.addEventListener("popstate",function(){
  if(ignorePop>0){ignorePop--;if(layers.length&&!trap)armTrap();return}
  trap=false;
  var l=layers.pop();
  if(l){popping=true;try{l.close()}finally{popping=false}}
  if(layers.length&&!trap)armTrap();
  lockScroll();
});
function lockScroll(){var any=!!document.querySelector(".screen:not([hidden]),#sheetWrap:not([hidden]),#welcome:not([hidden]),#dlg:not([hidden])");document.body.style.overflow=any?"hidden":""}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&layers.length){e.preventDefault();history.back()}});

/* ---------- daily queue ----------
   Every question waits until its "next" day. Each day S.maxPerDay questions come: first the due
   repeats, then never-seen questions fill the free places; the rest move to the next day.
   While never-seen questions are waiting, a few places (newReserve) are kept for them even on
   heavy days, so the backlog keeps moving; the repeats left out come first the next day.
   Never-seen questions are taken subject by subject in turn (oldest first within a subject), so a
   batch of 30 maths photos does not fill the next days with maths only. The turn order is worked
   out together with the questions already started today, so today's list stays the same while
   the student works through it.
   Fresh mistakes (added one by one in the last 3 days, not through "Toplu ekle") go before the
   old batch questions, but take at most every other new place, so the batch keeps moving too. */
var _bkFor=null,_bk=null;
function isBulk(i){
  if(i.bulk!=null)return !!i.bulk;
  if(_bkFor!==items||!_bk){
    /* older batch saves carry no mark: they were written a few milliseconds apart */
    var s={},a=items.filter(function(x){return x.createdAt}).sort(function(x,y){return x.createdAt-y.createdAt});
    for(var k=1;k<a.length;k++)if(a[k].createdAt-a[k-1].createdAt<=60){s[a[k].id]=1;s[a[k-1].id]=1}
    _bkFor=items;_bk=s;
  }
  return !!_bk[i.id];
}
function isFresh(i){return !isBulk(i)&&!!i.date&&i.date>=addDays(-2)}
function takeTurns(a,b){var out=[];for(var k=0;k<Math.max(a.length,b.length);k++){if(a[k])out.push(a[k]);if(b[k])out.push(b[k])}return out}
function bySubjectTurns(list){
  var groups=[],by={},out=[];
  list.forEach(function(it){var k=it.subject||"-";if(!by[k]){by[k]=[];groups.push(by[k])}by[k].push(it)});
  for(var r=0;out.length<list.length;r++)groups.forEach(function(g){if(g[r])out.push(g[r])});
  return out;
}
function newReserve(){return S.maxPerDay>0?Math.max(1,Math.round(S.maxPerDay*0.15)):0}
function todayStats(){
  var t=todayStr(),n=0,r=0;
  items.forEach(function(i){if(i.lastReview===t){if(i.firstSeen===t)n++;else r++}});
  return {n:n,r:r,done:n+r};
}
function todayQueue(){
  var st=todayStats(),due=items.filter(isDue);
  var rev=due.filter(function(i){return (i.reviews||0)>0}).sort(function(a,b){return a.next<b.next?-1:a.next>b.next?1:(a.createdAt||0)-(b.createdAt||0)});
  var t=todayStr(),byAge=function(a,b){return (a.createdAt||0)-(b.createdAt||0)};
  var neu=due.filter(function(i){return !((i.reviews||0)>0)});
  var started=items.filter(function(i){return i.firstSeen===t&&i.lastReview===t});
  var pool=neu.concat(started).sort(byAge);
  neu=takeTurns(bySubjectTurns(pool.filter(isFresh)),bySubjectTurns(pool.filter(function(i){return !isFresh(i)}))).filter(function(i){return !(i.firstSeen===t&&i.lastReview===t)});
  if(!(S.maxPerDay>0))return rev.concat(neu);
  var cap=Math.max(0,S.maxPerDay-st.done),keep=Math.min(Math.max(0,newReserve()-st.n),neu.length,cap);
  var q=rev.slice(0,cap-keep).concat(neu).slice(0,cap);
  return q;
}

/* ---------- navigation ---------- */
function go(v){
  if(VIEWS.indexOf(v)<0)v="home";
  if(v!=="defter"&&sel.on){sel.on=false;sel.ids=[]}
  view=v;
  VIEWS.forEach(function(x){$("#v-"+x).hidden=(x!==v)});
  document.querySelectorAll(".tab").forEach(function(t){if(t.dataset.v===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current")});
  try{history.replaceState(history.state,"","#"+v)}catch(e){}
  render();
  window.scrollTo(0,0);
}
document.querySelectorAll(".tab").forEach(function(t){t.addEventListener("click",function(){go(t.dataset.v)})});
$("#fab").addEventListener("click",function(){startAdd("camera")});
$("#gradePill").addEventListener("click",function(){go("ayarlar")});

/* ---------- render ---------- */
function render(fromData){
  $("#gradePill").textContent=S.grade?S.grade+". sınıf":"Sınıf seç";
  var n=todayQueue().length,b=$("#badge");b.hidden=!n;b.textContent=n;
  if(view==="home")renderHome();
  else if(view==="defter"){if(fromData&&$("#itemList"))drawItems();else renderList()}
  else if(view==="analiz")renderStats();
  else if(!(fromData&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest("#v-ayarlar")))renderSettings();
  updateSelbar();
  if(sheetId)renderSheet();
  if(rv&&fromData)renderReview();
  if(res&&fromData&&!res.saving)renderResults();
  if(simState&&fromData)renderSimilar();
  if(solState&&fromData)renderSolve();
  if(dayState&&fromData)renderDay();
}
function storeNotice(box){
  if(storeState==="loading"){box.appendChild(el("p","notice","Defter açılıyor…"));return true}
  if(storeState==="none"){box.appendChild(el("p","notice","Bu tarayıcı kayıt saklamaya izin vermiyor. Uygulamayı gizli sekmede değil, normal tarayıcıda ya da ana ekrandaki simgesinden aç."));return true}
  if(storeState==="error"){box.appendChild(el("p","notice","Defter şu an yüklenemedi. Uygulamayı kapatıp yeniden aç."));return true}
  return false;
}
function stack(box){var w=el("div","stack");box.appendChild(w);return w}

/* ---------- home ---------- */
function greeting(){var h=new Date().getHours();return h<5?"İyi geceler":h<12?"Günaydın":h<18?"Merhaba":"İyi akşamlar"}
function renderHome(){
  var box=$("#v-home");box.replaceChildren();var w=stack(box);w.style.gap="18px";
  var gr=el("div","greet-row"),g=el("div","greet");g.appendChild(el("h1",null,greeting()+(S.name?", "+S.name:"")));
  var d=new Date();g.appendChild(el("span","date",DAYS[d.getDay()]+", "+d.getDate()+" "+MONTHS[d.getMonth()]));gr.appendChild(g);w.appendChild(gr);
  if(storeNotice(w))return;
  var sk=streakChip();if(sk)gr.appendChild(sk);
  var q=todayQueue(),st=todayStats(),due=items.filter(isDue).length,waiting=Math.max(0,due-q.length);
  var hero=el("div","hero");
  if(!items.length){
    hero.classList.add("empty");
    hero.appendChild(el("h2",null,"Defterin hazır"));
    hero.appendChild(el("p","sub","Test çözerken yanlış yaptığın ya da boş bıraktığın soruların fotoğrafını çek. Defter onları öğrenene kadar yeniden sorar. "+scheduleText()));
    if(!readOnly){hero.appendChild(btn("block","İlk yanlışı ekle",function(){startAdd("camera")},ICONS.cam));hero.appendChild(btn("on-hero block","Eski yanlışları galeriden toplu ekle",startBulk,ICONS.gal))}
  }else if(q.length){
    var big=el("div","big");big.appendChild(el("span","num",String(q.length)));big.appendChild(el("span","lbl","soru bugün seni bekliyor"));hero.appendChild(big);
    var info="Yaklaşık "+Math.max(1,Math.round(q.length*1.2))+" dakika";
    if(waiting)info+=" · "+waiting+" soru sırada bekliyor";
    hero.appendChild(el("p","sub",info));
    var again=q.filter(function(i){var h=i.hist||[];return (i.reviews||0)>0&&h.length&&!h[h.length-1][1]}).length;
    if(again)hero.appendChild(el("p","sub",again+" tanesi son seferde yanlış yapıldığı için yeniden geliyor. "+scheduleText(true)));
    if(st.done){var tr=el("div","track");var fi=el("i");fi.style.width=Math.round(st.done/(st.done+q.length)*100)+"%";tr.appendChild(fi);hero.appendChild(tr);hero.appendChild(el("p","sub","Bugün "+st.done+" soru tekrar edildi."))}
    var hb=el("div","btns");hb.appendChild(btn("","Tekrara başla",startReview));
    hb.appendChild(btn("on-hero","Günlük PDF",function(){openPdf(q.map(function(i){return i.id}),{daily:true})}));
    hero.appendChild(hb);
  }else{
    hero.classList.add("done");
    hero.appendChild(el("h2",null,"Bugünlük tamam!"));
    var up=items.filter(function(i){return !i.mastered&&i.next}).sort(function(a,b){return a.next<b.next?-1:1});
    var msg=st.done?("Bugün "+st.done+" soru tekrar ettin. "):"";
    if(waiting)msg+="Günlük sınıra ulaştın; kalan "+waiting+" soru sonraki günlerde gelecek.";
    else if(up.length){var nx=up[0].next,cnt=up.filter(function(i){return i.next===nx}).length;msg+="Sıradaki tekrar "+relDay(nx)+": "+cnt+" soru."}
    else msg+="Bütün soruların öğrenildi.";
    hero.appendChild(el("p","sub",msg));
  }
  w.appendChild(hero);
  if(items.length)w.appendChild(weekCard());
  var sh=dailySheet();
  if(sh&&sh.open.length){
    var pc=el("div","card");var pr=el("div","paper");var pic=el("span","ic");pic.innerHTML=ICONS.pdf;pr.appendChild(pic);
    var pt=el("div");pt.appendChild(el("b",null,"Kâğıttaki test"+(sh.old?" ("+shortDate(sh.date)+")":"")+" · "+sh.ids.length+" soru"));
    pt.appendChild(el("p","muted small",sh.old?(sh.open.length+" sorunun sonucu henüz girilmedi. Girilmezse bu sorular her gün yeniden gelir."):(sh.open.length===sh.ids.length?"Kâğıtta çözdükten sonra her sorunun sonucunu işaretle; tekrar takvimi buna göre ilerler.":(sh.ids.length-sh.open.length)+" sorunun sonucu girildi, "+sh.open.length+" soru kaldı.")));
    if(sh.old)pc.classList.add("warncard");
    pr.appendChild(pt);pc.appendChild(pr);
    pc.appendChild(btn("primary block","Sonuçları gir",openResults,ICONS.check));
    w.appendChild(pc);
  }
  if(items.length&&!readOnly){
    var qa=el("button","quick");qa.type="button";
    var ic=el("span","ic");ic.innerHTML=ICONS.cam;qa.appendChild(ic);
    var tx=el("span");tx.appendChild(el("b",null,"Yeni yanlış ekle"));tx.appendChild(el("span",null,"Fotoğrafını çek, ders ve konuyu seç."));qa.appendChild(tx);
    var ch=el("span","chev");ch.innerHTML=ICONS.chev;qa.appendChild(ch);
    qa.addEventListener("click",function(){startAdd("camera")});w.appendChild(qa);
    var qb=el("button","quick alt");qb.type="button";var ic2=el("span","ic");ic2.innerHTML=ICONS.gal;qb.appendChild(ic2);
    var tx2=el("span");tx2.appendChild(el("b",null,"Toplu ekle"));tx2.appendChild(el("span",null,"Eski yanlışları galeriden topluca yükle."));qb.appendChild(tx2);
    var ch2=el("span","chev");ch2.innerHTML=ICONS.chev;qb.appendChild(ch2);qb.addEventListener("click",startBulk);w.appendChild(qb);
  }
  if(items.length&&new Date().getDay()===0){
    var rq=el("button","quick rep");rq.type="button";var ic3=el("span","ic");ic3.innerHTML=ICONS.chart;rq.appendChild(ic3);
    var tx3=el("span");tx3.appendChild(el("b",null,"Haftalık rapor hazır"));tx3.appendChild(el("span",null,"Bu haftanın özetini gör, WhatsApp'tan paylaş."));rq.appendChild(tx3);
    var ch3=el("span","chev");ch3.innerHTML=ICONS.chev;rq.appendChild(ch3);rq.addEventListener("click",function(){anTab="rapor";repOff=0;go("analiz")});w.appendChild(rq);
  }
  if(!items.length)return;
  var mastered=items.filter(function(i){return i.mastered}).length;
  var tiles=el("div","tiles");
  [[items.length,"Toplam"],[items.length-mastered,"Tekrarda"],[mastered,"Öğrenildi"]].forEach(function(f){var t=el("div","tile");t.appendChild(el("b",null,String(f[0])));t.appendChild(el("span",null,f[1]));tiles.appendChild(t)});
  w.appendChild(tiles);
  var rem=backupReminder();if(rem)w.appendChild(rem);
  var inQ={};q.forEach(function(i){inQ[i.id]=1});
  var per=SUBJECTS.map(function(s){var l=items.filter(function(i){return i.subject===s.k});return {s:s,n:l.length,d:l.filter(function(i){return inQ[i.id]}).length}}).filter(function(x){return x.n});
  if(per.length){
    var c=el("div","card");c.appendChild(el("h3",null,"Derslere göre"));var rows=el("div","subrows");
    per.forEach(function(x){
      var r=el("button","subrow");r.type="button";r.style.setProperty("--c","var(--s-"+x.s.k+")");
      r.appendChild(el("span","dot"));r.appendChild(el("span","nm",subjName(x.s.k)));
      r.appendChild(x.d?el("span","pill due",x.d+" bugün"):el("span"));
      r.appendChild(el("span","ct",x.n+" soru"));
      r.addEventListener("click",function(){filt.sub=x.s.k;filt.status="all";filt.q="";filt.topic="";go("defter")});
      rows.appendChild(r);
    });
    c.appendChild(rows);w.appendChild(c);
  }
}

/* ---------- review session ---------- */
function startReview(ids,label){
  var custom=Array.isArray(ids),q=custom?ids.map(byId).filter(Boolean):todayQueue();if(!q.length){toast("Bugün tekrar edilecek soru yok.");return}
  rv={ids:q.map(function(i){return i.id}),idx:0,revealed:false,ok:0,bad:0,custom:custom,label:label||null};
  $("#review").hidden=false;pushLayer("review",closeReview);renderReview();
}
function closeReview(){rv=null;$("#review").hidden=true;uiClosed("review");render()}
function renderReview(){
  if(!rv)return;
  var box=$("#review");box.replaceChildren();
  while(rv.idx<rv.ids.length&&!byId(rv.ids[rv.idx]))rv.idx++;
  var total=rv.ids.length,doneN=Math.min(rv.idx,total);
  var top=el("div","screen-top");
  top.appendChild(iconButton(ICONS.close,"Tekrarı kapat",closeReview));
  var pr=el("div","progress");var pi=el("i");pi.style.width=Math.round(doneN/total*100)+"%";pr.appendChild(pi);top.appendChild(pr);
  top.appendChild(el("span","counter",Math.min(doneN+1,total)+" / "+total));
  box.appendChild(top);
  var body=el("div","screen-body"),inn=el("div","in");body.appendChild(inn);box.appendChild(body);
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  if(rv.idx>=total){
    pi.style.width="100%";top.lastChild.textContent=total+" / "+total;
    var f=el("div","finish");var mk=el("div","mark");mk.innerHTML=ICONS.check;f.appendChild(mk);
    f.appendChild(el("h1",null,rv.custom?"Konu tekrarı bitti!":"Bugünlük tamam!"));
    f.appendChild(el("p","muted",rv.ok+" soruyu doğru çözdün"+(rv.bad?", "+rv.bad+" soru yarın yeniden gelecek.":".")));
    var si=streakInfo();if(si.cur&&si.today){var sl=el("p","streakline");sl.innerHTML=ICONS.flame;sl.appendChild(document.createTextNode(si.cur+" günlük seri"));f.appendChild(sl)}
    if(!rv.custom)f.appendChild(weekCard());
    if(!rv.cele&&rv.ok){rv.cele=true;setTimeout(confetti,150)}
    var more=rv.custom?0:todayQueue().length;
    if(more)f.appendChild(el("p","muted","Bugün için "+more+" soru daha var."));
    inn.appendChild(f);
    if(more)fin.appendChild(btn("primary","Devam et",function(){var q=todayQueue();rv={ids:q.map(function(i){return i.id}),idx:0,revealed:false,ok:rv.ok,bad:rv.bad};renderReview()}));
    fin.appendChild(btn(more?"ghost":"primary","Kapat",closeReview));
    box.appendChild(foot);return;
  }
  var it=byId(rv.ids[rv.idx]);
  inn.appendChild(questionCard(it,{reveal:rv.revealed,edit:true}));
  if(rv.revealed){
    inn.appendChild(aiRow(it));
    fin.appendChild(btn("bad","Yine yapamadım",function(){grade(it,false)}));
    fin.appendChild(btn("good","Doğru çözdüm",function(){grade(it,true)}));
  }else{
    fin.appendChild(btn("primary","Çözdüm, cevabı göster",function(){rv.revealed=true;renderReview();body.scrollTop=0}));
  }
  box.appendChild(foot);
}
function questionCard(it,o){
  var c=el("article","card");
  var top=el("div","row between");
  var l=el("div","row");l.appendChild(subjChip(it.subject,it.grade));if(it.source)l.appendChild(el("span","muted small",it.source));top.appendChild(l);
  top.appendChild(stagesEl(it.stage));c.appendChild(top);
  c.appendChild(el("div","topic",it.topic||"Konu yazılmamış"));
  var src=photoSrc(it.qPhoto);if(src)c.appendChild(photoEl(src,"Soru fotoğrafı"));
  if(it.photoBroken)c.appendChild(el("p","notice small","Bu sorunun fotoğrafı kaydedilirken bozulmuş. Soruyu açıp Düzenle → Yeni çek ile yeniden çekebilirsin."));
  if(it.note)c.appendChild(el("div","qtext",it.note));
  var tipOn=hasTip(it);
  if(tipOn&&!o.reveal){var hb=el("button","hintbtn");hb.type="button";hb.innerHTML=ICONS.bulb;hb.appendChild(document.createTextNode("Dikkat notumu göster"));var tn=tipNote(it);tn.hidden=true;hb.addEventListener("click",function(){tn.hidden=false;hb.hidden=true});c.appendChild(hb);c.appendChild(tn)}
  if(!o.reveal)return c;
  var a=el("div","answers");
  if(it.mine){var m=el("span","ans-mine","Senin cevabın: ");m.appendChild(it.mine==="bos"?el("span",null,"Boş"):el("s",null,it.mine.split(",").join(", ")));a.appendChild(m)}
  if(it.correct)a.appendChild(el("span","ans-right","Doğrusu: "+it.correct));
  if(it.correct&&it.keyFromAi)a.appendChild(el("span","muted small","Bu cevabı yapay zekâ çözdü; kitabın cevap anahtarıyla kontrol edilmedi."));
  if(a.childNodes.length)c.appendChild(a);
  if(!it.correct&&!readOnly)c.appendChild(correctBox(it));
  else if(!readOnly)c.appendChild(fixRow(it,o));
  if(it.reason){var rw=el("div","row");rw.appendChild(el("span","muted small","Neden:"));var rc=el("span","chip",reasonName(it.reason));rc.style.setProperty("--c","var(--pen)");rw.appendChild(rc);c.appendChild(rw)}
  if(it.solution)c.appendChild(el("div","solution",it.solution));
  if(tipOn)c.appendChild(tipNote(it));
  var o2=photoSrc(it.oPhoto);if(o2){c.appendChild(el("h3",null,"Kitaptaki işaretli hâli"));c.appendChild(photoEl(o2,"Sorunun işaretli hâli"))}
  var s2=photoSrc(it.sPhoto);if(s2){c.appendChild(el("h3",null,"Çözüm"));c.appendChild(photoEl(s2,"Çözüm fotoğrafı"))}
  return c;
}
function photoEl(src,alt){
  var b=el("button","photo");b.type="button";b.setAttribute("aria-label",alt+", büyütmek için dokun");
  var im=el("img");im.src=src;im.alt=alt;im.loading="lazy";
  im.onerror=function(){b.replaceChildren(el("div","notice small","Fotoğraf yüklenemedi."))};
  b.appendChild(im);b.addEventListener("click",function(){openLightbox(src)});
  return b;
}
/* on: the day the question was solved (a paper sheet may be graded days later); default today */
function histWith(it,d,ok){return (it.hist||[]).concat([[d,ok?1:0]]).map(function(h,i){return [h,i]}).sort(function(a,b){return a[0][0]<b[0][0]?-1:a[0][0]>b[0][0]?1:a[1]-b[1]}).map(function(x){return x[0]}).slice(-60)}
function gradePatch(it,ok,on){
  var t=on||todayStr(),patch;
  if(it.lastReview&&it.lastReview>t)return {reviews:(it.reviews||0)+1,hist:histWith(it,t,ok)};
  if(ok){var st=(it.stage||0)+1,N=masterN();patch=st>=N?{stage:st,mastered:true,next:null}:{stage:st,next:addDaysFrom(t,gapAfter(st))}}
  else patch={stage:0,next:addDaysFrom(t,gapWrong()),mastered:false,wrongCount:(it.wrongCount||1)+1};
  if(patch.mastered&&!it.mastered)patch.masteredAt=t;
  patch.lastReview=t;patch.reviews=(it.reviews||0)+1;patch.firstSeen=it.firstSeen||((it.reviews||0)>0?(it.lastReview||(it.hist&&it.hist[0]&&it.hist[0][0])||it.date||t):t);
  patch.hist=histWith(it,t,ok);
  return patch;
}
function grade(it,ok){
  var patch=gradePatch(it,ok),wk=weekNow(),mB=items.filter(function(i){return i.mastered}).length;
  if(rv){if(ok)rv.ok++;else rv.bad++;rv.idx++;rv.revealed=false}
  col.doc(it.id).update(patch).then(function(){
    afterStudy(wk);
    if(ok&&patch.mastered&&!it.mastered)celebrateMastered(mB,mB+1);
    else if(ok&&it.mastered)toast("Süper! Bu soru hâlâ aklında.");
    else if(ok)toast("Süper! "+relDay(patch.next).replace(/^./,function(c){return c.toLocaleUpperCase("tr")})+" yeniden gelecek.");
    else toast("Sorun değil. Çözümü bir daha oku; yarın yeniden gelecek.");
  },writeErr);
  if(rv){renderReview();var b=$("#review .screen-body");if(b)b.scrollTop=0}
}
/* ---------- paper test: enter results ----------
   The daily PDF remembers its question order, so the numbers here match the printed sheet. */
var res=null;
function sheetDone(i,date){return !!(i.mastered||(i.lastReview&&i.lastReview>=date))}
function dailySheet(){
  try{var d=JSON.parse(lsGet("daily")||"null");if(!d||!d.date||!Array.isArray(d.ids))return null;
    var ids=d.ids.filter(function(id){return byId(id)});
    return {ids:ids,date:d.date,old:d.date!==todayStr(),open:ids.filter(function(id){return !sheetDone(byId(id),d.date)})};
  }catch(e){return null}
}
function openResults(){
  var sh=dailySheet();if(!sh)return;
  res={ids:sh.ids,marks:{},saving:false,date:sh.date,on:sh.date};
  $("#results").hidden=false;pushLayer("results",closeResults);renderResults();
}
function closeResults(){res=null;$("#results").hidden=true;uiClosed("results");render()}
function renderResults(){
  if(!res)return;
  var box=$("#results"),sb=$("#results .screen-body"),sy=sb?sb.scrollTop:0;box.replaceChildren();
  var t=todayStr(),open=res.ids.filter(function(id){var i=byId(id);return i&&!sheetDone(i,res.date)});
  var marked=Object.keys(res.marks).length;
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closeResults));top.appendChild(el("h2",null,"Sonuçları gir"));top.appendChild(el("span","counter",marked+" / "+open.length));box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  w.appendChild(el("p","muted","Numaralar kâğıttakiyle aynı. Her soru için doğru mu yanlış mı işaretle. Boş bıraktığın sorular yarın yeniden gelir."));
  if(res.date<t)w.appendChild(solvedOnBox());
  if(open.length){var all=el("div","row");all.appendChild(btn("ghost sm","Hepsi doğru",function(){open.forEach(function(id){res.marks[id]=true});renderResults()}));
    all.appendChild(btn("ghost sm","Temizle",function(){res.marks={};renderResults()}));w.appendChild(all)}
  var c=el("div","card");c.style.gap="0";c.style.paddingBlock="6px";
  res.ids.forEach(function(id,ix){
    var it=byId(id);if(!it)return;
    var done=sheetDone(it,res.date);
    var r=el("div","resrow"+(done?" done":""));
    r.appendChild(el("span","no",String(ix+1)));
    var th=el("button","thumb");th.type="button";var src=photoSrc(it.qPhoto);if(src){var im=el("img");im.src=src;im.alt="";th.appendChild(im);th.setAttribute("aria-label",(ix+1)+". soruyu büyüt");th.addEventListener("click",function(){openLightbox(src)})}else th.textContent="Not";r.appendChild(th);
    var mid=el("div","mid");var tl=el("div","row");tl.appendChild(subjChip(it.subject,it.grade));mid.appendChild(tl);mid.appendChild(el("div","item-topic",it.topic||""));
    var al=el("div","ansline");al.appendChild(it.correct?el("span","ans-sm","Doğrusu: "+it.correct):el("span","muted small","Doğru cevap girilmemiş"));
    var fx=el("button","linkbtn",res.fix===id?"Kapat":(it.correct?"Değiştir":"Ekle"));fx.type="button";fx.addEventListener("click",function(){res.fix=res.fix===id?null:id;renderResults()});al.appendChild(fx);
    var eb=el("button","linkbtn icon");eb.type="button";eb.innerHTML=ICONS.edit;eb.setAttribute("aria-label","Soruyu düzenle");eb.title="Soruyu düzenle";eb.addEventListener("click",function(){startEdit(it)});al.appendChild(eb);
    mid.appendChild(al);
    if(res.fix===id)mid.appendChild(answerPicker(it,function(){res.fix=null;renderResults()}));
    if(done)mid.appendChild(el("span","pill done","Sonuç girildi"));
    else{
      var ob=el("div","okbad");var m=res.marks[id];
      var bo=el("button","ok",null);bo.type="button";bo.innerHTML=ICONS.check.replace('<svg ','<svg width="16" height="16" ');bo.appendChild(document.createTextNode("Doğru"));bo.setAttribute("aria-pressed",String(m===true));
      var bb=el("button","bad","Yanlış");bb.type="button";bb.setAttribute("aria-pressed",String(m===false));
      bo.addEventListener("click",function(){if(res.marks[id]===true)delete res.marks[id];else res.marks[id]=true;renderResults()});
      bb.addEventListener("click",function(){if(res.marks[id]===false)delete res.marks[id];else res.marks[id]=false;renderResults()});
      ob.appendChild(bo);ob.appendChild(bb);mid.appendChild(ob);
    }
    r.appendChild(mid);c.appendChild(r);
  });
  w.appendChild(c);
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  var sv=btn("primary",res.saving?"Kaydediliyor…":(marked?marked+" sonucu kaydet":"Sonuçları işaretle"),saveResults,ICONS.check);sv.disabled=!marked||res.saving;fin.appendChild(sv);
  box.appendChild(foot);
  var nb=$("#results .screen-body");if(nb)nb.scrollTop=sy;
}
async function saveResults(){
  if(!res||res.saving)return;
  var ids=Object.keys(res.marks);if(!ids.length)return;
  res.saving=true;renderResults();
  var ok=0,bad=0,nm=0,wk=weekNow(),mB=items.filter(function(i){return i.mastered}).length;
  try{
    var on=res.on&&res.on<todayStr()?res.on:null;
    for(var i=0;i<ids.length;i++){var it=byId(ids[i]);if(!it)continue;var g=res.marks[ids[i]],pt=gradePatch(it,g,on);await col.doc(it.id).update(pt);if(pt.mastered&&!it.mastered)nm++;if(g)ok++;else bad++}
    var nd=addDaysFrom(on||todayStr(),gapWrong());
    toast(ok+" doğru, "+bad+" yanlış "+(on?shortDate(on)+" tarihine ":"")+"kaydedildi."+(bad?(nd<=todayStr()?" Yanlışlar bugünün listesine eklendi.":" Yanlışlar "+relDay(nd)+" yeniden gelecek."):""));
    if(nm)setTimeout(function(){celebrateMastered(mB,mB+nm)},1500);else afterStudy(wk);
    var sh=dailySheet(),left=sh?sh.open.filter(function(id){return !(id in res.marks)}).length:0;
    res.marks={};res.saving=false;
    if(!left){closeResults();if(bad){var rd=on||todayStr();setTimeout(function(){if(!dayState)openDay(rd,true)},350)}}else renderResults();
  }catch(e){res.saving=false;renderResults();writeErr(e)}
}
function writeErr(e){toast("Kaydedilemedi. Uygulamayı kapatıp yeniden açmayı dene.")}

/* ---------- notebook list ---------- */
function filtered(){
  var q=trLower(filt.q.trim());
  return items.filter(function(i){
    if(filt.sub!=="all"&&i.subject!==filt.sub)return false;
    if(filt.status==="active"&&i.mastered)return false;
    if(filt.status==="mastered"&&!i.mastered)return false;
    if(filt.topic&&(filt.sub==="all"||trLower((i.topic||"").trim())!==filt.topic))return false;
    if(q&&trLower((i.topic||"")+" "+(i.unit||"")+" "+(i.source||"")+" "+(i.note||"")).indexOf(q)<0)return false;
    return true;
  });
}
function renderList(){
  var box=$("#v-defter");box.replaceChildren();var w=stack(box);
  var h=el("div","row between");var hl=el("div","row");hl.style.alignItems="baseline";hl.appendChild(el("h1",null,"Defterim"));hl.appendChild(el("span","muted",items.length+" soru"));h.appendChild(hl);
  if(items.length){
    if(sel.on)h.appendChild(btn("ghost sm","Vazgeç",function(){sel.on=false;sel.ids=[];renderList()}));
    else h.appendChild(btn("ghost sm","Seç",function(){sel.on=true;sel.ids=[];renderList()},ICONS.select));
  }
  w.appendChild(h);
  if(storeNotice(w))return;
  if(!items.length){w.appendChild(el("p","notice","Henüz soru yok. Alttaki + düğmesiyle ilk yanlışını ekle."));return}
  if(sel.on)w.appendChild(el("p","muted small","Sorulara dokunarak seç; hepsi için alttaki “Tümü”. Seçtiklerini silebilir ya da PDF yapabilirsin. Sayılar PDF'teki sırayı gösterir."));
  var sr=el("div","search");sr.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  var q=el("input","field");q.id="f-q";q.type="search";q.placeholder="Konu, ünite ya da kitap ara";q.value=filt.q;q.setAttribute("aria-label","Ara");
  q.addEventListener("input",function(){filt.q=q.value;drawItems()});sr.appendChild(q);w.appendChild(sr);
  var sc=el("div","scroller");
  [{k:"all",n:"Tümü"}].concat(SUBJECTS).forEach(function(s){
    var cnt=s.k==="all"?items.length:items.filter(function(i){return i.subject===s.k}).length;
    if(s.k!=="all"&&!cnt)return;
    var p=el("button","pick",(s.k==="all"?"Tümü":subjName(s.k))+" "+cnt);p.type="button";p.setAttribute("aria-pressed",String(filt.sub===s.k));
    if(s.k!=="all")p.style.setProperty("--c","var(--s-"+s.k+")");
    p.addEventListener("click",function(){if(filt.sub!==s.k)filt.topic="";filt.sub=s.k;renderList()});sc.appendChild(p);
  });
  w.appendChild(sc);
  if(filt.sub!=="all"){var tf=topicFilterEl();if(tf)w.appendChild(tf);else filt.topic=""}
  var sg=el("div","seg");
  [["all","Tümü"],["active","Tekrarda"],["mastered","Öğrenildi"]].forEach(function(o){var b=el("button",null,o[1]);b.type="button";b.setAttribute("aria-pressed",String(filt.status===o[0]));b.addEventListener("click",function(){filt.status=o[0];renderList()});sg.appendChild(b)});
  w.appendChild(sg);
  if(filt.sub!=="all"&&filt.topic&&!sel.on){var tt=topicTools();if(tt)w.appendChild(tt)}
  else if(filt.sub!=="all"&&!sel.on)w.appendChild(el("p","muted small","Yazılıya mı hazırlanıyorsun? Yukarıdan konu seç; o konunun bütün sorularını çöz ya da PDF test yap."));
  var list=el("div","items");list.id="itemList";w.appendChild(list);
  drawItems();
}
function drawItems(){
  var list=$("#itemList");if(!list)return;list.replaceChildren();
  var rows=filtered();
  if(!rows.length){list.appendChild(el("p","notice","Bu seçime uyan soru yok."));updateSelbar();return}
  var inQ={};todayQueue().forEach(function(i){inQ[i.id]=1});
  rows.forEach(function(i){
    var b=el("button","item");b.type="button";
    var th=el("div","thumb");var src=photoSrc(i.qPhoto);
    if(src){var im=el("img");im.src=src;im.alt="";im.loading="lazy";im.onerror=function(){im.remove()};th.appendChild(im)}else th.textContent="Not";
    b.appendChild(th);
    if(sel.on){var k=sel.ids.indexOf(i.id);b.setAttribute("aria-pressed",String(k>=0));var ck=el("span","check",k>=0?String(k+1):"");b.appendChild(ck)}
    var bd=el("div","item-body");
    var r1=el("div","row");r1.appendChild(subjChip(i.subject,i.grade));
    if(i.mastered)r1.appendChild(el("span","pill done","Öğrenildi"));
    else if(inQ[i.id])r1.appendChild(el("span","pill due","Bugün"));
    else if(isDue(i))r1.appendChild(el("span","pill","Sırada"));
    else if(!(i.reviews>0))r1.appendChild(el("span","pill new","Yeni"));
    if(i.photoBroken)r1.appendChild(el("span","pill fail","Fotoğraf yok"));
    bd.appendChild(r1);
    bd.appendChild(el("div","item-topic",i.topic||"Konu yazılmamış"));
    var r2=el("div","row");r2.appendChild(stagesEl(i.stage));
    var meta=fmtDate(i.date);if(!i.mastered&&i.next&&!isDue(i))meta+=" · tekrar "+relDay(i.next);
    r2.appendChild(el("span","muted small",meta));bd.appendChild(r2);b.appendChild(bd);
    b.addEventListener("click",function(){
      if(sel.on){var k2=sel.ids.indexOf(i.id);if(k2>=0)sel.ids.splice(k2,1);else sel.ids.push(i.id);drawItems()}
      else openSheet(i.id);
    });
    list.appendChild(b);
  });
  updateSelbar();
}
function updateSelbar(){
  var on=sel.on&&view==="defter"&&items.length>0;
  $("#selbar").hidden=!on;document.body.classList.toggle("selbar-on",on);if(!on)return;
  $("#selCount").textContent=sel.ids.length?sel.ids.length+" seçili":"Soru seç";
  $("#selGo").disabled=!sel.ids.length;$("#selDel").disabled=!sel.ids.length;
  var f=filtered();$("#selAll").textContent=f.length&&f.every(function(i){return sel.ids.indexOf(i.id)>=0})?"Hiçbiri":"Tümü";
}
$("#selAll").addEventListener("click",function(){
  var f=filtered(),allOn=f.length&&f.every(function(i){return sel.ids.indexOf(i.id)>=0});
  if(allOn){var drop={};f.forEach(function(i){drop[i.id]=1});sel.ids=sel.ids.filter(function(id){return !drop[id]})}
  else f.forEach(function(i){if(sel.ids.indexOf(i.id)<0)sel.ids.push(i.id)});
  drawItems();
});
$("#selGo").addEventListener("click",function(){if(sel.ids.length)openPdf(sel.ids)});

/* ---------- detail sheet ---------- */
function openSheet(id){sheetId=id;confirmDel=false;$("#sheetWrap").hidden=false;pushLayer("sheet",closeSheet);renderSheet()}
function closeSheet(){sheetId=null;$("#sheetWrap").hidden=true;uiClosed("sheet")}
$("#sheetWrap").addEventListener("click",function(e){if(e.target===this)closeSheet()});
function renderSheet(){
  var it=byId(sheetId);
  var s=$("#sheet");s.replaceChildren();
  if(!it){closeSheet();return}
  s.appendChild(el("div","grab"));
  s.appendChild(questionCard(it,{reveal:true}));
  var m=el("div","meta card");m.style.display="grid";
  [["Eklendi",fmtDate(it.date)],["Yanlış sayısı",String(it.wrongCount||1)],["Tekrar sayısı",String(it.reviews||0)],["Sıradaki tekrar",it.mastered?"Öğrenildi":(it.next?fmtDate(it.next)+" ("+relDay(it.next)+")":"-")]].forEach(function(p){var d=el("div");d.appendChild(el("span",null,p[0]));d.appendChild(el("b",null,p[1]));m.appendChild(d)});
  if(it.unit){var u=el("div");u.style.gridColumn="1/-1";u.appendChild(el("span",null,"Ünite / tema"));u.appendChild(el("b",null,it.unit));m.appendChild(u)}
  s.appendChild(m);
  if(!readOnly){
    var bs=el("div","btns");
    bs.appendChild(btn("ghost","Düzenle",function(){var x=it;closeSheet();startEdit(x)}));
    bs.appendChild(btn("ghost",it.mastered?"Tekrara al":"Bugün tekrar et",function(){reopen(it)}));
    s.appendChild(bs);
    s.appendChild(aiRow(it));
    if(!confirmDel)s.appendChild(btn("danger block","Sil",function(){confirmDel=true;renderSheet()}));
    else{
      var cf=el("div","confirm");cf.appendChild(el("b",null,"Bu soru defterden silinsin mi? Geri alınamaz."));
      var cb=el("div","btns");cb.appendChild(btn("ghost","Vazgeç",function(){confirmDel=false;renderSheet()}));cb.appendChild(btn("bad","Evet, sil",function(){del(it)}));
      cf.appendChild(cb);s.appendChild(cf);
    }
  }
  s.appendChild(btn("ghost block","Kapat",closeSheet));
}
function reopen(it){
  col.doc(it.id).update({mastered:false,stage:it.mastered?0:(it.stage||0),next:todayStr()}).then(function(){toast("Soru bugünkü tekrara eklendi.");closeSheet()},writeErr);
}
function del(it){
  var ids=[it.qPhoto&&it.qPhoto.id,it.oPhoto&&it.oPhoto.id,it.sPhoto&&it.sPhoto.id,it.tipAudio&&it.tipAudio.id].filter(Boolean);
  col.doc(it.id).delete().then(function(){
    closeSheet();toast("Soru silindi.");
    var k=sel.ids.indexOf(it.id);if(k>=0)sel.ids.splice(k,1);
    if(assets)ids.forEach(function(id){assets.delete(id).catch(function(){})});
  },writeErr);
}

/* ---------- topics ---------- */
function topicGroups(sub){var g=S.grade||7;return (MUFREDAT[g]&&MUFREDAT[g][sub])||[]}
function topicIndex(sub){
  var out=[];topicGroups(sub).forEach(function(gr){if(gr[1].length)gr[1].forEach(function(t){out.push({t:t,u:gr[0]})});else out.push({t:gr[0],u:gr[0]})});
  return out;
}
function findTopic(sub,text){
  var x=trLower(String(text||"").trim());if(!x)return null;
  var idx=topicIndex(sub),i;
  for(i=0;i<idx.length;i++)if(trLower(idx[i].t)===x)return idx[i];
  for(i=0;i<idx.length;i++)if(trLower(idx[i].t).indexOf(x)>=0||x.indexOf(trLower(idx[i].t))>=0)return idx[i];
  return null;
}
function setTopicFromText(text,sub){
  var m=sub?findTopic(sub,text):null;
  if(m){form.topic=m.t;form.unit=m.u;form.topicMode="list"}
  else{form.topic=String(text||"").trim().slice(0,80);form.unit="";form.topicMode=form.topic?"other":"list"}
}
function aiPrompt(){
  var g=S.grade||7,lines=[];
  SUBJECTS.forEach(function(s){var idx=topicIndex(s.k).filter(function(x){return x.u.indexOf("Eski program")!==0});if(idx.length)lines.push(s.k+": "+idx.map(function(x){return x.t}).join("; "))});
  return AI_PROMPT+"\nThe student is in grade "+g+". For topic, copy exactly one item from the list of the chosen subject below when one fits; otherwise write a short Turkish title.\n"+lines.join("\n");
}

/* ---------- add / edit form ---------- */
function startAdd(mode){
  if(readOnly||storeState!=="ready"){toast(storeState==="ready"?"Bu defter yalnızca görüntülenebilir.":"Defter henüz açılmadı.");return}
  if(!addOpen){form=blankForm(lastKeep);openAdd()}
  if(mode==="camera")$("#cam-q").click();
  else if(mode==="gallery")$("#file-q").click();
}
function startEdit(it){
  form=blankForm();
  form.editing=it.id;form.sub=it.subject;form.topic=it.topic||"";form.unit=it.unit||"";form.source=it.source||"";form.note=it.note||"";
  form.mine=it.mine||null;form.correct=it.correct||null;form.reason=it.reason||null;form.solution=it.solution||"";
  form.qPhoto=it.qPhoto||null;form.sPhoto=it.sPhoto||null;form.oPhoto=it.oPhoto||null;form.tip=it.tip||"";form.tipAudio=it.tipAudio||null;
  form.topicMode=form.topic&&!findTopic(form.sub,form.topic)?"other":"list";
  if(form.topicMode==="list"&&form.topic){var m=findTopic(form.sub,form.topic);if(m&&trLower(m.t)!==trLower(form.topic))form.topicMode="other"}
  openAdd();
}
function openAdd(){addOpen=true;$("#add").hidden=false;pushLayer("add",closeAdd);renderForm();var b=$("#add .screen-body");if(b)b.scrollTop=0}
function closeAdd(){
  addOpen=false;$("#add").hidden=true;
  if(rec){rec.form=null;stopRec()}
  if(form.qPrev)URL.revokeObjectURL(form.qPrev);if(form.sPrev)URL.revokeObjectURL(form.sPrev);if(form.tipPrev)URL.revokeObjectURL(form.tipPrev);
  form=blankForm();uiClosed("add");render();
}
function uniq(arr){var o={},r=[];arr.forEach(function(v){v=(v||"").trim();if(v&&!o[trLower(v)]){o[trLower(v)]=1;r.push(v)}});return r}
function renderForm(){
  if(!addOpen)return;
  var ae=document.activeElement,fid=ae&&ae.id&&/^i-/.test(ae.id)?ae.id:null,ss=null,se=null;
  if(fid){try{ss=ae.selectionStart;se=ae.selectionEnd}catch(_){}}
  var sb=$("#add .screen-body"),sy=sb?sb.scrollTop:0;
  renderFormInner();
  var nb=$("#add .screen-body");if(nb)nb.scrollTop=sy;
  if(fid){var n=document.getElementById(fid);if(n){n.focus({preventScroll:true});try{if(ss!=null)n.setSelectionRange(ss,se)}catch(_){}}}
}
function group(label,optional){var g=el("div","fgroup");var l=el("div","flabel",label+" ");if(optional)l.appendChild(el("em",null,"(isteğe bağlı)"));g.appendChild(l);return g}
function renderFormInner(){
  var box=$("#add");box.replaceChildren();
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closeAdd));top.appendChild(el("h2",null,form.editing?"Soruyu düzenle":"Yeni yanlış"));box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);

  // photo
  var ph=el("div","fgroup");
  var prev=form.qPrev||photoSrc(form.qPhoto);
  if(prev){
    var pb=el("div","photobox");var im=el("img");im.src=prev;im.alt="Soru fotoğrafı";pb.appendChild(im);
    var acts=el("div","acts");
    acts.appendChild(btn("ghost sm","Temizle",function(){openEditor("q")},ICONS.wand));
    acts.appendChild(btn("ghost sm","Yeni çek",function(){$("#cam-q").click()},ICONS.cam));
    acts.appendChild(btn("ghost sm","Galeri",function(){$("#file-q").click()},ICONS.gal));
    pb.appendChild(acts);ph.appendChild(pb);
  }else{
    var sh=el("div","shoot");var ic=el("div","ic");ic.innerHTML=ICONS.cam;sh.appendChild(ic);
    sh.appendChild(el("b",null,"Sorunun fotoğrafını çek"));
    sh.appendChild(el("span","muted small","Soruyu yakından ve ışık alacak şekilde çek. Kalem izlerini sonra temizleyebilirsin."));
    var bb=el("div","btns");bb.appendChild(btn("primary","Fotoğraf çek",function(){$("#cam-q").click()},ICONS.cam));bb.appendChild(btn("ghost","Galeriden seç",function(){$("#file-q").click()},ICONS.gal));
    sh.appendChild(bb);ph.appendChild(sh);
  }
  var an=aiNotice();if(an)ph.appendChild(an);
  w.appendChild(ph);

  // subject
  var g1=group("Ders");var ch=el("div","wrapchips");
  SUBJECTS.forEach(function(s){var p=el("button","pick",subjName(s.k));p.type="button";p.style.setProperty("--c","var(--s-"+s.k+")");p.setAttribute("aria-pressed",String(form.sub===s.k));
    p.addEventListener("click",function(){
      if(form.sub!==s.k){form.sub=s.k;var m=form.topic?findTopic(s.k,form.topic):null;if(m&&trLower(m.t)===trLower(form.topic)){form.unit=m.u;form.topicMode="list"}else if(form.topicMode==="list"){form.topic="";form.unit=""}}
      renderForm()});ch.appendChild(p)});
  g1.appendChild(ch);w.appendChild(g1);

  // topic
  var g2=group("Konu");
  var sl=el("select","field");sl.id="i-topicSel";sl.setAttribute("aria-label","Konu");
  if(!form.sub){sl.disabled=true;var o0=el("option",null,"Önce dersi seç");o0.value="";sl.appendChild(o0)}
  else{
    var o1=el("option",null,"Konu seç ("+(S.grade||7)+". sınıf)");o1.value="";sl.appendChild(o1);
    var groups=topicGroups(form.sub),loose=[];
    groups.forEach(function(gr){
      if(!gr[1].length){loose.push(gr[0]);return}
      var og=el("optgroup");og.label=gr[0];
      gr[1].forEach(function(t){var o=el("option",null,t);o.value=t;o.dataset.unit=gr[0];og.appendChild(o)});
      sl.appendChild(og);
    });
    if(loose.length){var og2=el("optgroup");og2.label=form.sub==="ing"?"Temalar":"Üniteler";loose.forEach(function(t){var o=el("option",null,t);o.value=t;o.dataset.unit=t;og2.appendChild(o)});sl.appendChild(og2)}
    var mine=uniq(items.filter(function(i){return i.subject===form.sub&&i.topic&&!findTopic(form.sub,i.topic)}).map(function(i){return i.topic}));
    if(mine.length){var og3=el("optgroup");og3.label="Daha önce yazdıkların";mine.forEach(function(t){var o=el("option",null,t);o.value="__mine:"+t;og3.appendChild(o)});sl.appendChild(og3)}
    var oo=el("option",null,"Listede yok, kendim yazacağım…");oo.value="__other";sl.appendChild(oo);
    if(form.topicMode==="other")sl.value="__other";
    else{sl.value=form.topic||"";if(sl.value!==(form.topic||""))sl.value=""}
  }
  sl.addEventListener("change",function(){
    var v=sl.value;
    if(v==="__other"){form.topicMode="other";form.topic="";form.unit="";renderForm();var ti=$("#i-topic");if(ti)ti.focus();return}
    if(v.indexOf("__mine:")===0){form.topicMode="other";form.topic=v.slice(7);form.unit="";renderForm();return}
    form.topicMode="list";form.topic=v;var op=sl.options[sl.selectedIndex];form.unit=(op&&op.dataset.unit)||"";
  });
  g2.appendChild(sl);
  if(form.topicMode==="other"&&form.sub){
    var ti=el("input","field");ti.id="i-topic";ti.placeholder="Konuyu yaz";ti.value=form.topic;ti.addEventListener("input",function(){form.topic=ti.value});
    g2.appendChild(ti);
  }
  w.appendChild(g2);

  // answers
  var two=el("div","two");
  var g7=group("Doğru cevap");g7.appendChild(letters("correct",["A","B","C","D"]));two.appendChild(g7);
  var g6=group("Senin cevabın",true);g6.appendChild(letters("mine",["A","B","C","D","bos"]));two.appendChild(g6);
  w.appendChild(two);

  // reason
  var g8=group("Neden yanlış yaptın?",true);var rc=el("div","wrapchips");
  REASONS.forEach(function(r){var p=el("button","pick",r.n);p.type="button";p.style.setProperty("--c","var(--pen)");p.setAttribute("aria-pressed",String(form.reason===r.k));
    p.addEventListener("click",function(){form.reason=form.reason===r.k?null:r.k;renderForm()});rc.appendChild(p)});
  g8.appendChild(rc);w.appendChild(g8);
  w.appendChild(tipGroup());

  // more
  var det=el("details","more");if(form.source||form.note||form.solution||form.sPhoto||form.sPrev)det.open=true;
  det.addEventListener("toggle",function(){form.moreOpen=det.open});if(form.moreOpen)det.open=true;
  det.appendChild(el("summary",null,"Daha fazla: kitap, not, çözüm"));
  var dg=el("div","sheet-grid");
  var g3=group("Kitap / test",true);var si=el("input","field");si.id="i-source";si.placeholder="Örn. Deneme 4, s. 32";si.value=form.source;si.setAttribute("list","dl-src");
  si.addEventListener("input",function(){form.source=si.value});
  var dl2=el("datalist");dl2.id="dl-src";uniq(items.map(function(i){return i.source})).forEach(function(t){var o=el("option");o.value=t;dl2.appendChild(o)});
  g3.appendChild(si);g3.appendChild(dl2);dg.appendChild(g3);
  var g5=group("Soru notu",true);var nt=el("textarea","field");nt.id="i-note";nt.placeholder="Fotoğraf yoksa soruyu kısaca yaz.";nt.value=form.note;nt.addEventListener("input",function(){form.note=nt.value});
  g5.appendChild(nt);dg.appendChild(g5);
  var g9=group("Doğru çözüm / öğrendiğim şey",true);var so=el("textarea","field");so.id="i-solution";so.placeholder="Örn. Negatif sayıyı çarparken işareti unuttum. (−)·(−) = (+)";so.value=form.solution;so.addEventListener("input",function(){form.solution=so.value});
  g9.appendChild(so);
  var sprev=form.sPrev||photoSrc(form.sPhoto);
  if(sprev){var spb=el("div","photobox");var sim=el("img");sim.src=sprev;sim.alt="Çözüm fotoğrafı";spb.appendChild(sim);var sa=el("div","acts");
    sa.appendChild(btn("ghost sm","Kırp",function(){openEditor("s")}));sa.appendChild(btn("ghost sm","Değiştir",function(){$("#cam-s").click()},ICONS.cam));
    sa.appendChild(btn("ghost sm","Kaldır",function(){form.sFile=null;form.sPhoto=null;form.sRaw=null;form.sEd=null;if(form.sPrev)URL.revokeObjectURL(form.sPrev);form.sPrev=null;renderForm()}));
    spb.appendChild(sa);g9.appendChild(spb)}
  else{var sb2=el("div","btns");sb2.appendChild(btn("ghost sm","Çözümün fotoğrafı",function(){$("#cam-s").click()},ICONS.cam));sb2.appendChild(btn("ghost sm","Galeriden",function(){$("#file-s").click()},ICONS.gal));g9.appendChild(sb2)}
  dg.appendChild(g9);det.appendChild(dg);w.appendChild(det);
  if(prev&&!form.editing)w.appendChild(el("p","muted small","Fotoğraf yoksa soru notu yeterli. Kayıtlar yalnızca bu telefonda saklanır."));

  // footer
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  if(form.editing)fin.appendChild(btn("primary",saving?"Kaydediliyor…":"Değişiklikleri kaydet",function(){save(false)}));
  else{
    fin.appendChild(btn("ghost fit",saving?"…":"Kaydet",function(){save(false)}));
    fin.appendChild(btn("primary",saving?"Kaydediliyor…":"Kaydet, yeni soru",function(){save(true)},ICONS.cam));
  }
  fin.querySelectorAll("button").forEach(function(b){b.disabled=saving});
  box.appendChild(foot);
}
function letters(key,opts){
  var w=el("div","letters");
  var cur=(form[key]||"").split(",").filter(Boolean);
  if(cur.indexOf("E")>=0&&opts.indexOf("E")<0)opts.splice(4,0,"E");
  opts.forEach(function(o){var b=el("button","letter"+(o==="bos"?" wide":"")+(key==="correct"?" right":""),o==="bos"?"Boş":o);b.type="button";b.setAttribute("aria-pressed",String(cur.indexOf(o)>=0));
    b.setAttribute("aria-label",(key==="mine"?"Senin cevabın ":"Doğru cevap ")+(o==="bos"?"boş":o));
    b.addEventListener("click",function(){
      if(key==="correct"||o==="bos")form[key]=form[key]===o?null:o;
      else{var c=cur.filter(function(x){return x!=="bos"});var i=c.indexOf(o);if(i>=0)c.splice(i,1);else c.push(o);c.sort();form[key]=c.length?c.join(","):null}
      renderForm()});
    w.appendChild(b)});
  return w;
}
function gotPhoto(k,f){
  if(!addOpen){form=blankForm(lastKeep);openAdd()}
  form[k+"Raw"]=f;form[k+"RawOrig"]=true;form[k+"Ed"]=null;form[k+"File"]=null;
  if(k==="q"){form.oFile=null;form.oPhoto=null;form.ai=null}
  if(form[k+"Prev"])URL.revokeObjectURL(form[k+"Prev"]);form[k+"Prev"]=null;
  if(k==="q"){renderForm();openEditor("q")}
  else{form.sFile=f;form.sPrev=URL.createObjectURL(f);renderForm()}
}
["cam-q","file-q","cam-s","file-s"].forEach(function(id){
  var inp=$("#"+id);inp.addEventListener("change",function(){var f=inp.files&&inp.files[0];inp.value="";if(f)gotPhoto(id.slice(-1),f)});
});
async function save(andNext){
  if(saving)return;
  if(!form.sub){toast("Önce dersi seç.");return}
  if(!form.topic.trim()){toast("Konuyu seç.");var t=$("#i-topicSel");if(t)t.focus();return}
  if(!form.qFile&&!form.qPhoto&&!form.note.trim()){toast("Sorunun fotoğrafını çek ya da soru notunu yaz.");return}
  if(rec){toast("Önce ses kaydını bitir.");return}
  saving=true;renderForm();
  try{
    var qP=form.qPhoto,sP=form.sPhoto,oP=form.oPhoto;
    if(form.qFile)qP=await storePhoto(form.qFile);
    if(form.oFile)oP=await storePhoto(form.oFile);
    if(form.sFile)sP=await storePhoto(form.sFile);
    if(!qP)oP=null;
    var tA=form.tipDel?null:(form.tipAudio||null);
    if(form.tipBlob){var up=await assets.upload(form.tipBlob);tA={id:up.id}}
    var newPhoto=!!form.qFile;
    var body={aiSolved:(!form.correct&&form.ai&&form.ai.solved)||null,keyFromAi:!!(form.ai&&form.ai.solved&&form.correct===form.ai.solved),tip:(form.tip||"").trim(),tipAudio:tA,subject:form.sub,topic:form.topic.trim(),unit:form.unit||"",grade:S.grade||null,source:form.source.trim(),note:form.note.trim(),mine:form.mine,correct:form.correct,reason:form.reason,solution:form.solution.trim(),qPhoto:qP||null,oPhoto:oP||null,sPhoto:sP||null};
    if(newPhoto)body.photoBroken=false;
    if(form.editing){
      var old=byId(form.editing)||{};
      var full={};Object.keys(old).forEach(function(k){if(k!=="id")full[k]=old[k]});Object.keys(body).forEach(function(k){full[k]=body[k]});
      if(old.grade)full.grade=old.grade;
      if(!(form.ai&&form.ai.solved)){full.keyFromAi=!!(old.keyFromAi&&old.correct===full.correct);full.aiSolved=full.correct?null:(old.aiSolved||null)}
      await col.doc(form.editing).set(full);
      if(assets)["q","o","s"].forEach(function(k){var o=old[k+"Photo"],n=body[k+"Photo"];if(o&&o.id&&(!n||n.id!==o.id))assets.delete(o.id).catch(function(){})});
      if(assets&&old.tipAudio&&old.tipAudio.id&&(!tA||tA.id!==old.tipAudio.id))assets.delete(old.tipAudio.id).catch(function(){});
      saving=false;closeAdd();toast("Değişiklikler kaydedildi.");
    }else{
      body.createdAt=Date.now();body.date=todayStr();body.stage=0;body.next=addDays(1);body.mastered=false;body.wrongCount=1;body.reviews=0;
      await col.add(body);
      saving=false;lastKeep={sub:body.subject,source:body.source};
      if(andNext){
        if(form.qPrev)URL.revokeObjectURL(form.qPrev);if(form.sPrev)URL.revokeObjectURL(form.sPrev);if(form.tipPrev)URL.revokeObjectURL(form.tipPrev);
        form=blankForm(lastKeep);renderForm();var b=$("#add .screen-body");if(b)b.scrollTop=0;
        toast("Kaydedildi. Sıradaki sorunun fotoğrafını çek.");
        try{$("#cam-q").click()}catch(e){}
      }else{closeAdd();toast("Deftere eklendi. Yarından itibaren tekrara girecek.")}
    }
  }catch(e){saving=false;renderForm();writeErr(e)}
}

/* ---------- analysis ---------- */
function renderGeneral(w){
  if(!items.length){w.appendChild(el("p","notice","Soru ekledikçe hangi derste, hangi konuda ve neden yanlış yaptığın burada görünecek."));return}
  var total=items.length,mastered=items.filter(function(i){return i.mastered}).length;
  var tiles=el("div","tiles");
  [[total,"Toplam soru"],[total-mastered,"Tekrarda"],[mastered,"Öğrenildi"]].forEach(function(f){var d=el("div","tile");d.appendChild(el("b",null,String(f[0])));d.appendChild(el("span",null,f[1]));tiles.appendChild(d)});
  w.appendChild(tiles);
  w.appendChild(badgesCard());
  var rc={};items.forEach(function(i){if(i.reason)rc[i.reason]=(rc[i.reason]||0)+1});
  var topR=Object.keys(rc).sort(function(a,b){return rc[b]-rc[a]})[0];
  if(topR&&rc[topR]>=2){var tp=el("div","tip");tp.appendChild(el("b",null,"İpucu"));tp.appendChild(el("span",null,TIPS[topR]));w.appendChild(tp)}
  var c1=el("div","card");c1.appendChild(el("h3",null,"Derslere göre yanlışlar"));
  var lg=el("div","legend");var a=el("span");var ai=el("i");ai.style.background="var(--ink-soft)";a.appendChild(ai);a.appendChild(document.createTextNode("Tekrarda"));
  var b=el("span");var bi=el("i");bi.style.background="color-mix(in srgb,var(--ink-soft) 40%,transparent)";b.appendChild(bi);b.appendChild(document.createTextNode("Öğrenildi"));lg.appendChild(a);lg.appendChild(b);c1.appendChild(lg);
  var bars=el("div","bars");
  var per=SUBJECTS.map(function(s){var l=items.filter(function(i){return i.subject===s.k});return {s:s,n:l.length,m:l.filter(function(i){return i.mastered}).length}}).filter(function(x){return x.n}).sort(function(x,y){return y.n-x.n});
  var max=Math.max.apply(null,per.map(function(x){return x.n}).concat([1]));
  per.forEach(function(x){
    var r=el("div","bar");r.style.setProperty("--c","var(--s-"+x.s.k+")");
    r.appendChild(el("span","lbl",subjName(x.s.k)));
    var tr=el("div","track");var f1=el("div","fill");f1.style.width=((x.n-x.m)/max*100)+"%";var f2=el("div","fill ok");f2.style.width=(x.m/max*100)+"%";tr.appendChild(f1);tr.appendChild(f2);
    r.appendChild(tr);r.appendChild(el("span","n",String(x.n)));bars.appendChild(r);
  });
  c1.appendChild(bars);w.appendChild(c1);
  var tc={};items.forEach(function(i){if(!i.topic)return;var k=i.subject+"|"+trLower(i.topic.trim());if(!tc[k])tc[k]={s:i.subject,t:i.topic.trim(),n:0,open:0};tc[k].n++;if(!i.mastered)tc[k].open++});
  var tl=Object.keys(tc).map(function(k){return tc[k]}).sort(function(x,y){return y.n-x.n||y.open-x.open}).slice(0,8);
  if(tl.length){
    var c3=el("div","card");c3.appendChild(el("h3",null,"En çok yanlış yapılan konular"));
    var lst=el("div","bars");
    tl.forEach(function(x){var r=el("div","row between");r.style.flexWrap="nowrap";var l=el("div","row");l.style.minWidth="0";l.style.flexWrap="nowrap";l.appendChild(subjChip(x.s));var tn=el("span",null,x.t);tn.style.fontWeight="500";tn.style.overflow="hidden";tn.style.textOverflow="ellipsis";tn.style.whiteSpace="nowrap";l.appendChild(tn);r.appendChild(l);r.appendChild(el("span","muted small",x.n+" soru"));lst.appendChild(r)});
    c3.appendChild(lst);w.appendChild(c3);
  }
  var keys=Object.keys(rc);
  if(keys.length){
    var c2=el("div","card");c2.appendChild(el("h3",null,"Yanlış nedenleri"));var b2=el("div","bars");
    var mx=Math.max.apply(null,keys.map(function(k){return rc[k]}));
    keys.sort(function(x,y){return rc[y]-rc[x]}).forEach(function(k){
      var r=el("div","bar");r.style.setProperty("--c","var(--pen)");r.appendChild(el("span","lbl",reasonName(k)));
      var tr=el("div","track");var f=el("div","fill");f.style.width=(rc[k]/mx*100)+"%";tr.appendChild(f);r.appendChild(tr);r.appendChild(el("span","n",String(rc[k])));b2.appendChild(r);
    });
    c2.appendChild(b2);w.appendChild(c2);
  }
}

/* ---------- settings ---------- */
function gradeSeg(onPick,cur){
  var gp=el("div","gradepick");
  [5,6,7,8].forEach(function(g){var b=el("button");b.type="button";b.setAttribute("aria-pressed",String(cur===g));b.appendChild(document.createTextNode(String(g)));b.appendChild(el("span",null,"sınıf"));b.addEventListener("click",function(){onPick(g)});gp.appendChild(b)});
  return gp;
}
function renderSettings(){
  var box=$("#v-ayarlar");box.replaceChildren();var w=stack(box);w.style.gap="16px";
  w.appendChild(el("h1",null,"Ayarlar"));
  var c=el("div","card");c.appendChild(el("h3",null,"Öğrenci"));
  var g1=group("Adın",true);var ni=el("input","field");ni.id="set-name";ni.value=S.name||"";ni.placeholder="Karşılama ekranında görünür";ni.maxLength=24;
  ni.addEventListener("change",function(){S.name=ni.value.trim();saveSettings();toast("Kaydedildi.")});g1.appendChild(ni);c.appendChild(g1);
  var g2=group("Sınıf");g2.appendChild(gradeSeg(function(g){S.grade=g;saveSettings();toast("Konu listeleri "+g+". sınıfa göre güncellendi.");render()},S.grade));
  g2.appendChild(el("p","muted small","Konu listeleri MEB programından gelir: 5, 6 ve 7. sınıfta Türkiye Yüzyılı Maarif Modeli, 8. sınıfta önceki program (LGS)."));
  c.appendChild(g2);w.appendChild(c);

  function limitRow(label,hint,key,opts,unit){
    var r=el("div","setrow");var l=el("label",null,label);l.htmlFor="set-"+key;r.appendChild(l);
    if(opts.indexOf(+S[key])<0)opts=opts.concat([+S[key]]);
    var s=el("select","field");s.id="set-"+key;opts.forEach(function(o){var op=el("option",null,o?o+(unit?" "+unit:""):"Sınırsız");op.value=String(o);s.appendChild(op)});
    s.value=String(S[key]);s.addEventListener("change",function(){S[key]=+s.value;saveSettings();render();toast("Kaydedildi.")});
    r.appendChild(s);if(hint)r.appendChild(el("p","hint",hint));return r;
  }
  var c2=el("div","card");c2.id="set-daily";c2.appendChild(el("h3",null,"Günlük soru"));
  c2.appendChild(limitRow("Günde kaç soru gelsin",null,"maxPerDay",[5,10,15,20,25,30,40,50,60],"soru"));
  c2.appendChild(el("p","hint",dailyHelpText()));
  c2.appendChild(el("p","hint plan",dailyPlanText()));
  w.appendChild(c2);

  var c3=el("div","card");c3.id="set-repeat";c3.appendChild(el("h3",null,"Soru ne zaman yeniden gelsin"));
  var mrow=limitRow("Kaç kez üst üste doğru çözülünce öğrenilsin","Bu kadar kez arka arkaya doğru çözülen soru öğrenilmiş sayılır ve bir daha gelmez. Yanlış çözülürse sayaç sıfırlanır.","masterAfter",[1,2,3,4,5],"kez");
  mrow.querySelector("select").addEventListener("change",function(){applyMasterRule(true);renderSettings()});c3.appendChild(mrow);
  c3.appendChild(intervalsBox());
  w.appendChild(c3);

  var c5=el("div","card");c5.appendChild(el("h3",null,"Haftalık hedef"));
  c5.appendChild(limitRow("Haftada kaç gün çalışılsın","Bugün ekranındaki hafta takibi, kutlamalar ve rozetler buna göre.","weekGoal",[3,4,5,6,7],"gün"));
  w.appendChild(c5);
  w.appendChild(aiCard());
  w.appendChild(backupCard());
  w.appendChild(repairCard());
  var c4=el("div","card");c4.appendChild(el("h3",null,"Hakkında"));
  c4.appendChild(el("p","small",APP_VERSION));
  c4.appendChild(el("p","muted small","Yanlış Defterim internetsiz çalışır; sorular ve fotoğraflar yalnızca bu telefonda saklanır. "+scheduleText()));
  w.appendChild(c4);
}

/* ---------- welcome ---------- */
function showWelcome(){
  var box=$("#welcome");box.replaceChildren();box.hidden=false;lockScroll();
  var w=el("div","in");box.appendChild(w);
  var lg=el("div","logo");lg.innerHTML=LOGO_TILE;w.appendChild(lg);
  var t=el("div","stack");t.style.gap="8px";t.appendChild(el("h1",null,"Yanlış Defterim"));
  t.appendChild(el("p","muted","Yanlış yaptığın soruların fotoğrafını çek. Defter onları öğrenene kadar yeniden sorar."));w.appendChild(t);
  var pick=S.grade||0;
  var g=el("div","stack");g.style.gap="10px";g.appendChild(el("h2",null,"Kaçıncı sınıftasın?"));
  var holder=el("div");g.appendChild(holder);
  function drawPick(){holder.replaceChildren(gradeSeg(function(v){pick=v;drawPick();go2.disabled=false},pick))}
  w.appendChild(g);
  var nm=group("Adın",true);var ni=el("input","field");ni.id="w-name";ni.placeholder="Örn. Elif";ni.maxLength=24;ni.value=S.name||"";nm.appendChild(ni);w.appendChild(nm);
  w.appendChild(el("p","muted small","Seçtiğin sınıfa göre konular MEB programından otomatik gelir. Sonradan Ayarlar'dan değiştirebilirsin."));
  w.appendChild(el("div","spacer"));
  var go2=btn("primary block","Başla",function(){if(!pick)return;S.grade=pick;S.name=ni.value.trim();saveSettings();box.hidden=true;lockScroll();render()});
  go2.disabled=!pick;w.appendChild(go2);
  drawPick();
}
