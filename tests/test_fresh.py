import subprocess,time,sys
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,"-m","http.server","8807","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',maxPerDay:8,weekGoal:5,masterAfter:2}));['repairV10','schedV15','sheetFixV18'].forEach(k=>localStorage.setItem('yd_'+k,'1'));localStorage.setItem('yd_masterRule','2');
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');let c=0;
  const base=1700000000000;const P=(o)=>s.put(Object.assign({grade:7,correct:'C',stage:0,reviews:0,mastered:false,next:D(0)},o));
  for(let k=1;k<=10;k++)P({id:'mat'+k,subject:'mat',topic:'mat'+k,note:'x',date:D(-5),createdAt:base+k});
  for(let k=1;k<=3;k++)P({id:'fen'+k,subject:'fen',topic:'fen'+k,note:'x',date:D(-5),createdAt:base+10+k});
  P({id:'o1',subject:'ing',topic:'o1-eski-tek',note:'x',date:D(-10),createdAt:base-9e7});
  P({id:'f1',subject:'tr',topic:'f1-taze',note:'x',date:D(-1),createdAt:base+9e7});
  P({id:'f3',subject:'fen',topic:'f3-taze',note:'x',date:D(-1),createdAt:base+9.1e7});
  P({id:'f4',subject:'mat',topic:'f4-taze-dunden-once',note:'x',date:D(-2),createdAt:base+8e7});
  P({id:'f2',subject:'mat',topic:'f2-bugun',note:'x',date:D(0),createdAt:base+9.5e7,next:D(1)});
  P({id:'b1',subject:'tr',topic:'b1-toplu-isaretli',note:'x',date:D(-1),createdAt:base+9.3e7,bulk:true});
  t.oncomplete=()=>r()}})"""
Q=None
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844})
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8807/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(800)
    def q():
      pg.click(".card.week .days button.d.today");pg.wait_for_selector("#day:not([hidden])")
      r=" ".join(pg.eval_on_selector_all("#day .dayitem .item-topic","e=>e.map(x=>x.textContent)"));pg.go_back();pg.wait_for_selector("#day",state="hidden");pg.wait_for_timeout(200);return r
    print("1 queue (expect f4 o1 f1 mat1 f3 fen1 mat2 b1? ...):",q())
    b.close()
finally: srv.terminate()
print("errors:",errs)
