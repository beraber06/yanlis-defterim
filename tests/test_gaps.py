import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8800","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:5,maxPerDay:20,weekGoal:5,masterAfter:2}));localStorage.setItem('yd_repairV10','1');localStorage.setItem('yd_masterRule','2');
 localStorage.setItem('yd_daily',JSON.stringify({date:D(0),ids:['g2','g3']}));
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
  const B={subject:'mat',grade:7,correct:'C',date:D(-12),mastered:false};
  s.put(Object.assign({id:'g1',topic:'Bir doğru, eski 3 gün',note:'1',createdAt:1,stage:1,lastReview:D(-2),next:D(1),reviews:2,hist:[[D(-3),0],[D(-2),1]]},B));
  s.put(Object.assign({id:'g2',topic:'Dün yanlış',note:'2',createdAt:2,stage:0,lastReview:D(-1),next:D(0),reviews:1,hist:[[D(-1),0]]},B));
  s.put(Object.assign({id:'g3',topic:'Eski bir doğru',note:'3',createdAt:3,stage:1,lastReview:D(-10),next:D(-7),reviews:2,hist:[[D(-11),0],[D(-10),1]]},B));
  for(let k=0;k<+(localStorage.getItem('xrev')||0);k++)s.put(Object.assign({id:'r'+k,topic:'Tekrar '+k,note:'r',createdAt:100+k,stage:1,lastReview:D(-7),next:D(0),reviews:1,firstSeen:D(-7),hist:[[D(-7),1]]},B));
  for(let k=0;k<30;k++)s.put(Object.assign({id:'n'+k,topic:'Yeni '+k,note:'n',createdAt:10+k,stage:0,next:D(0),reviews:0},B));
  t.oncomplete=()=>r()}})"""
DB="""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const g=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(g.result.filter(x=>x.id[0]=='g').sort((a,b)=>a.createdAt-b.createdAt).map(x=>[x.id,x.stage,!!x.mastered,x.next]))}})"""
DAYS="""()=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};const o={};for(let n=-10;n<=20;n++)o[D(n)]=n;return o}"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2)
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8800/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(2500)
    days=pg.evaluate(DAYS);rel=lambda rows:[(i,s,m,days.get(n,n)) for i,s,m,n in rows]
    print("1 boot reschedule (expect g1 +5, g2 0, g3 -3):",rel(pg.evaluate(DB)))
    print("  hero:",pg.inner_text(".hero").replace("\n"," | ")[:200])
    pg.click(".tab[data-v=ayarlar]");pg.wait_for_timeout(300)
    print("2 daily card:",pg.inner_text("#set-daily").replace("\n"," | "))
    print("3 repeat card:",pg.inner_text("#set-repeat").replace("\n"," | "))
    pg.screenshot(path=OUT+"/gaps-settings.png",full_page=True)
    pg.select_option("#set-repeat select[aria-label='1. doğrudan sonra']","10");pg.wait_for_timeout(700)
    print("4 1st gap->10:",pg.inner_text("#toast"),"|",rel(pg.evaluate(DB)))
    pg.select_option("#set-masterAfter","3");pg.wait_for_timeout(800)
    print("5 master 3 rows:",pg.eval_on_selector_all("#set-repeat .ivrow","e=>e.map(x=>x.className+':'+x.textContent.slice(0,40))"))
    print("  plan:",pg.inner_text("#set-repeat .hint.plan"))
    pg.screenshot(path=OUT+"/gaps-settings3.png",full_page=True)
    pg.select_option("#set-repeat select[aria-label='Yanlış çözülünce']","2");pg.wait_for_timeout(700)
    print("6 wrong->2:",pg.inner_text("#toast"),"|",rel(pg.evaluate(DB)))
    pg.select_option("#set-maxPerDay","10");pg.wait_for_timeout(300)
    print("7 max 10 text:",pg.inner_text("#set-daily .hint.plan"))
    pg.select_option("#set-maxPerDay","20");pg.wait_for_timeout(300)
    pg.click(".tab[data-v=home]");pg.wait_for_timeout(300)
    pg.click("button:has-text('Sonuçları gir')");pg.wait_for_selector("#results:not([hidden]) .resrow")
    pg.click("#results button:has-text('Hepsi doğru')");pg.click("#results .screen-foot button");pg.wait_for_selector("#results",state="hidden");pg.wait_for_timeout(600)
    print("8 graded both right (expect g2 st1 +10, g3 st2 +14):",rel(pg.evaluate(DB)))
    pg.click(".tab[data-v=ayarlar]");pg.wait_for_timeout(300)
    print("9 after grading:",pg.inner_text("#set-daily .hint.plan"))
    print("10 reload settings persisted:",pg.evaluate("()=>localStorage.getItem('yd_settings')"))
    ctx2=b.new_context(viewport={"width":390,"height":844});pg=ctx2.new_page();pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8800/");pg.evaluate("()=>{localStorage.setItem('xrev','25');localStorage.setItem('yd_schedV15','1')}");pg.evaluate(SEED)
    pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(1500)
    print("11 heavy day hero:",pg.inner_text(".hero").replace("\n"," | ")[:120])
    pg.click(".tab[data-v=ayarlar]");pg.wait_for_timeout(300)
    print("12 heavy day plan:",pg.inner_text("#set-daily .hint.plan"))
    print("13 help:",pg.inner_text("#set-daily > p.hint:not(.plan)"))
    b.close()
finally: srv.terminate()
print("errors:",errs)
