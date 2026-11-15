import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8790","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'Elif',newPerDay:10,maxPerDay:25,weekGoal:5}));
 const t0=new Date();const td=t0.getFullYear()+'-'+String(t0.getMonth()+1).padStart(2,'0')+'-'+String(t0.getDate()).padStart(2,'0');
 localStorage.setItem('yd_daily',JSON.stringify({date:td,ids:['a1','a2','a3']}));
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
  [['a1','mat','Tam Sayılar','C','(−3)+(+5)=?'],['a2','fen','Vücudumuzdaki Sistemler','A','Kalbin görevi nedir?'],['a3','tr','Fiillerde Anlam Kayması','D','Hangisinde anlam kayması var?']].forEach((x,i)=>s.put({id:x[0],subject:x[1],topic:x[2],grade:7,correct:x[3],mine:'B',note:x[4],createdAt:100+i,date:'2026-10-20',stage:1,next:'2026-11-01',mastered:false,reviews:1,hist:[['2026-10-28',1]]}));
  t.oncomplete=()=>r()}})"""
DB="""(id)=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const g=t.objectStore('mistakes').get(id);t.oncomplete=()=>r(g.result)}})"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2)
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8790/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero")
    # review: fix answer inline
    pg.click(".hero button:has-text('Tekrara başla')");pg.wait_for_selector("#review:not([hidden])")
    first=pg.inner_text("#review .topic");pg.click("#review button:has-text('cevabı göster')")
    pg.click("#review button:has-text('Doğru cevabı düzelt')");pg.screenshot(path=OUT+"/f1-review-fix.png")
    pg.click("#review .fixpick button:has-text('B')");pg.wait_for_timeout(500)
    print("1 review fix:",first,"->",pg.inner_text("#review .ans-right"),"| toast:",pg.inner_text("#toast"))
    # review: full edit form over the review
    pg.click("#review button:has-text('Soruyu düzenle')");pg.wait_for_selector("#add:not([hidden])")
    pg.click("#add button.letter[aria-label='Doğru cevap D']");pg.click("#add button:has-text('Değişiklikleri kaydet')");pg.wait_for_selector("#add",state="hidden");pg.wait_for_timeout(400)
    print("2 after full edit, review open:",pg.is_visible("#review"),"| shows:",pg.inner_text("#review .ans-right"))
    pg.go_back();pg.wait_for_selector("#review",state="hidden")
    # results screen
    pg.click("button:has-text('Sonuçları gir')");pg.wait_for_selector("#results:not([hidden]) .resrow")
    print("3 rows:",pg.eval_on_selector_all("#results .ansline .ans-sm","e=>e.map(x=>x.textContent)"))
    pg.locator("#results .resrow").nth(1).locator("button:has-text('Değiştir')").click()
    pg.screenshot(path=OUT+"/f2-results-fix.png")
    pg.locator("#results .resrow").nth(1).locator(".fixpick button:has-text('C')").click();pg.wait_for_timeout(500)
    print("4 row2 fixed:",pg.eval_on_selector_all("#results .ansline .ans-sm","e=>e.map(x=>x.textContent)"),"| picker open:",pg.locator("#results .fixpick").count())
    pg.locator("#results .resrow").nth(2).locator("button[aria-label='Soruyu düzenle']").click();pg.wait_for_selector("#add:not([hidden])")
    pg.go_back();pg.wait_for_selector("#add",state="hidden");print("5 edit closed, results open:",pg.is_visible("#results"))
    pg.locator("#results .resrow").nth(0).locator(".thumb").click();pg.wait_for_timeout(200)
    pg.click("#results button:has-text('Hepsi doğru')");pg.click("#results .screen-foot button");pg.wait_for_selector("#results",state="hidden")
    a=[pg.evaluate(DB,i) for i in ["a1","a2","a3"]]
    print("6 db:",[(x["id"],x["correct"],x.get("keyFromAi"),x.get("lastReview")) for x in a])
    b.close()
finally: srv.terminate()
print("errors:",errs)
