import subprocess,time,sys
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,"-m","http.server","8805","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',maxPerDay:6,weekGoal:5,masterAfter:2}));['repairV10','schedV15','sheetFixV18'].forEach(k=>localStorage.setItem('yd_'+k,'1'));localStorage.setItem('yd_masterRule','2');
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');let c=0;
  const add=(sub,n)=>{for(let k=1;k<=n;k++){c++;s.put({id:sub+k,subject:sub,grade:7,topic:sub+k,note:sub+k,correct:'C',date:D(-3),createdAt:c,stage:0,next:D(0),reviews:0,mastered:false})}};
  add('mat',12);add('tr',4);add('fen',3);
  t.oncomplete=()=>r()}})"""
Q=None
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844})
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8805/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(800)
    def q():
      pg.click(".card.week .days button.d.today");pg.wait_for_selector("#day:not([hidden])")
      r=" ".join(pg.eval_on_selector_all("#day .dayitem .item-topic","e=>e.map(x=>x.textContent)"));pg.go_back();pg.wait_for_selector("#day",state="hidden");pg.wait_for_timeout(200);return r
    print("1 queue (expect mat1 tr1 fen1 mat2 tr2 fen2):",q())
    pg.click(".hero button:has-text('Tekrara başla')")
    for k in range(2):
      pg.click("#review button:has-text('cevabı göster')");pg.click("#review button:has-text('Doğru çözdüm')" if k==0 else "#review button:has-text('Yine yapamadım')");pg.wait_for_timeout(300)
    pg.go_back();pg.wait_for_selector("#review",state="hidden");pg.wait_for_timeout(300)
    print("2 after 2 solved: day list (solved first, then remaining; expect remaining fen1 mat2 tr2 fen2):",q())
    pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(600);print("3 after reload same:",q())
    b.close()
finally: srv.terminate()
print("errors:",errs)
