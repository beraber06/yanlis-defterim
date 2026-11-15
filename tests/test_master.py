import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8800","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:10,maxPerDay:25,weekGoal:5}));localStorage.setItem('yd_repairV10','1');
 localStorage.setItem('yd_daily',JSON.stringify({date:D(0),ids:['m2','m3']}));
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
  const B={subject:'mat',grade:7,correct:'C',date:D(-9),mastered:false};
  s.put(Object.assign({id:'m1',topic:'İki kez doğru',note:'1',createdAt:1,stage:2,next:D(5),reviews:2,hist:[[D(-6),1],[D(-3),1]]},B));
  s.put(Object.assign({id:'m2',topic:'Bir kez doğru',note:'2',createdAt:2,stage:1,next:D(0),reviews:1,hist:[[D(-3),1]]},B));
  s.put(Object.assign({id:'m3',topic:'Dün yanlış',note:'3',createdAt:3,stage:0,next:D(0),reviews:2,hist:[[D(-4),1],[D(-1),0]]},B));
  s.put(Object.assign({id:'m4',topic:'Üç kez doğru',note:'4',createdAt:4,stage:3,next:D(10),reviews:3},B));
  t.oncomplete=()=>r()}})"""
DB="""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const g=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(g.result.sort((a,b)=>a.createdAt-b.createdAt).map(x=>[x.id,x.stage,!!x.mastered,x.next]))}})"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2)
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8800/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(1500)
    print("1 boot toast:",pg.inner_text("#toast"),"| db:",pg.evaluate(DB))
    print("  hero:",pg.inner_text(".hero").replace("\n"," | "))
    pg.click("button:has-text('Sonuçları gir')");pg.wait_for_selector("#results:not([hidden]) .resrow")
    pg.click("#results button:has-text('Hepsi doğru')");pg.click("#results .screen-foot button");pg.wait_for_selector("#results",state="hidden");pg.wait_for_timeout(600)
    print("2 after paper results (both right):",pg.evaluate(DB),"| toast:",pg.inner_text("#toast"))
    pg.click(".tab[data-v=defter]");print("3 stage dots per item:",pg.eval_on_selector_all(".item .stages","e=>e.map(x=>x.getAttribute('aria-label'))"))
    pg.click(".tab[data-v=ayarlar]");print("4 setting value:",pg.input_value("#set-masterAfter"))
    pg.screenshot(path=OUT+"/master-settings.png",full_page=True)
    pg.select_option("#set-masterAfter","1");pg.wait_for_timeout(800);print("5 set to 1:",pg.inner_text("#toast"),"| db:",pg.evaluate(DB))
    pg.select_option("#set-masterAfter","3");pg.wait_for_timeout(800);print("6 set to 3:",pg.inner_text("#toast"))
    print("7 about:",pg.eval_on_selector_all("#v-ayarlar p.muted.small","e=>e.map(x=>x.textContent).filter(t=>t.includes('ertesi gün'))"))
    b.close()
finally: srv.terminate()
print("errors:",errs)
