import subprocess,time,sys,json
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8804","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
DF="const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};"
def seed(mode):
  return "()=>new Promise(r=>{"+DF+"""
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',maxPerDay:4,weekGoal:5,masterAfter:2}));localStorage.setItem('yd_repairV10','1');localStorage.setItem('yd_masterRule','2');localStorage.setItem('yd_schedV15','1');
 if('"""+mode+"""'!=='repair')localStorage.setItem('yd_sheetFixV18','1');
 localStorage.setItem('yd_daily',JSON.stringify({date:D(-1),ids:['a','b','c']}));
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');const B={grade:7,subject:'mat',correct:'C',date:D(-9),mastered:false};
  if('"""+mode+"""'==='repair'){
   s.put(Object.assign({id:'a',topic:'A',note:'a',createdAt:1,stage:1,lastReview:D(0),next:D(7),reviews:2,firstSeen:D(-5),hist:[[D(-5),0],[D(0),1]]},B));
   s.put(Object.assign({id:'b',topic:'B',note:'b',createdAt:2,stage:0,lastReview:D(0),next:D(1),reviews:2,firstSeen:D(-4),hist:[[D(-4),1],[D(0),0]]},B));
   s.put(Object.assign({},B,{id:'c',topic:'C',note:'c',createdAt:3,stage:2,mastered:true,masteredAt:D(0),lastReview:D(0),next:null,reviews:2,firstSeen:D(-8),hist:[[D(-8),1],[D(0),1]]}));
  }else{
   s.put(Object.assign({id:'a',topic:'A',note:'a',createdAt:1,stage:0,lastReview:D(-5),next:D(-4),reviews:1,firstSeen:D(-5),hist:[[D(-5),0]]},B));
   s.put(Object.assign({id:'b',topic:'B',note:'b',createdAt:2,stage:1,lastReview:D(-4),next:D(-1),reviews:1,firstSeen:D(-4),hist:[[D(-4),1]]},B));
   s.put(Object.assign({id:'c',topic:'C',note:'c',createdAt:3,stage:0,next:D(-1),reviews:0},B));
  }
  for(let k=0;k<5;k++)s.put(Object.assign({id:'x'+k,topic:'Yeni '+k,note:'n',createdAt:10+k,stage:0,next:D(0),reviews:0},B));
  t.oncomplete=()=>r()}})"""
DB="()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const g=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(g.result.filter(x=>'abc'.includes(x.id)).sort((a,b)=>a.createdAt-b.createdAt).map(x=>[x.id,x.stage,!!x.mastered,x.lastReview,x.next,x.firstSeen||null,x.masteredAt||null,x.hist]))}})"
DAYS="()=>{"+DF+"const o={};for(let n=-10;n<=20;n++)o[D(n)]=n;return o}"
def show(pg,days,label):
  rows=pg.evaluate(DB);conv=lambda v:days.get(v,v) if isinstance(v,str) else v
  print(label,[[r[0],r[1],r[2],conv(r[3]),conv(r[4]),conv(r[5]),conv(r[6]),[[conv(h[0]),h[1]] for h in r[7]]] for r in rows])
try:
  with sync_playwright() as p:
    b=p.chromium.launch()
    for mode in ["normal","today","repair"]:
      ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2);pg=ctx.new_page()
      pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
      pg.goto("http://127.0.0.1:8804/");pg.evaluate(seed(mode));pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(2200)
      days=pg.evaluate(DAYS);print("=====",mode)
      if mode=="repair":
        show(pg,days,"R1 after boot (expect hist -1, lastReview -1, a next 6, b next 0, c masteredAt -1):")
        print("R2 toast:",pg.inner_text("#toast"),"| hero:",pg.inner_text(".hero").replace("\n"," | ")[:90])
        print("R3 week:",pg.eval_on_selector_all(".card.week .days button.d","e=>e.map(x=>x.getAttribute('aria-label').split('.')[0])"))
        pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(1800);show(pg,days,"R4 not re-applied:")
      else:
        print("1 hero before:",pg.inner_text(".hero").replace("\n"," | ")[:80])
        pg.click("button:has-text('Sonuçları gir')");pg.wait_for_selector("#results:not([hidden]) .resrow")
        print("2 solvedon:",pg.inner_text("#results .solvedon").replace("\n"," | "))
        if mode=="normal":pg.screenshot(path=OUT+"/late-results.png")
        if mode=="today":pg.select_option("#res-on",index=1);pg.wait_for_timeout(150);print("  changed:",pg.inner_text("#results .solvedon .muted"))
        rows=pg.locator("#results .resrow")
        rows.nth(0).locator("button.ok").click();rows.nth(1).locator("button.bad").click();rows.nth(2).locator("button.ok").click()
        pg.click("#results .screen-foot button");pg.wait_for_selector("#results",state="hidden");pg.wait_for_timeout(500)
        print("3 toast:",pg.inner_text("#toast"))
        show(pg,days,"4 db:")
        print("5 hero after:",pg.inner_text(".hero").replace("\n"," | ")[:90])
        print("6 week:",pg.eval_on_selector_all(".card.week .days button.d","e=>e.map(x=>x.getAttribute('aria-label').split('.')[0])"))
      ctx.close()
    b.close()
finally: srv.terminate()
print("errors:",errs)
