import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8798","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:10,maxPerDay:25,weekGoal:5}));localStorage.setItem('yd_repairV10','1');
 localStorage.setItem('yd_daily',JSON.stringify({date:D(-1),ids:['p1','p2','p3','p4','p5']}));
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
  for(let i=1;i<=5;i++)s.put({id:'p'+i,subject:'mat',topic:'Konu '+i,grade:7,correct:'C',note:'Soru '+i,createdAt:i,date:D(-5),stage:1,next:D(-1),mastered:false,reviews:1,lastReview:D(-4),hist:[[D(-4),1]]});
  for(let i=6;i<=8;i++)s.put({id:'p'+i,subject:'fen',topic:'Yanlış '+i,grade:7,correct:'A',note:'Soru '+i,createdAt:i,date:D(-5),stage:0,next:D(0),mastered:false,reviews:2,lastReview:D(-1),hist:[[D(-3),1],[D(-1),0]]});
  t.oncomplete=()=>r()}})"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2)
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8798/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero")
    print("1 hero:",pg.inner_text(".hero").replace("\n"," | "))
    print("2 old sheet card:",pg.inner_text(".card.warncard").replace("\n"," | "))
    pg.screenshot(path=OUT+"/sheet-home.png",full_page=True)
    pg.click(".hero button:has-text('Günlük PDF')");pg.wait_for_selector("#pdf:not([hidden])")
    print("3 pdf warning:",pg.inner_text("#pdf .callout.warn").replace("\n"," | "))
    pg.click("#pdf .callout.warn button");pg.wait_for_selector("#results:not([hidden]) .resrow")
    print("4 results rows:",pg.locator("#results .resrow").count(),"| done:",pg.locator("#results .resrow.done").count())
    pg.click("#results button:has-text('Hepsi doğru')");pg.click("#results .screen-foot button");pg.wait_for_selector("#results",state="hidden");pg.wait_for_timeout(500)
    print("5 card after saving:",pg.locator("button:has-text('Sonuçları gir')").count(),"| hero:",pg.inner_text(".hero .num"),pg.inner_text(".hero").split("\n")[2][:80])
    b.close()
finally: srv.terminate()
print("errors:",errs)
