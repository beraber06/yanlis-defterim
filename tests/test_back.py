import subprocess,time,sys
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,"-m","http.server","8799","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
SEED="""()=>new Promise(r=>{localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:10,maxPerDay:25,weekGoal:5}));localStorage.setItem('yd_repairV10','1');
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
  for(let i=1;i<=3;i++)s.put({id:'b'+i,subject:'mat',topic:'Tam Sayılar',grade:7,correct:'C',note:'Soru '+i,createdAt:i,date:'2026-11-01',stage:0,next:'2026-11-20',mastered:false,reviews:0});
  t.oncomplete=()=>r()}})"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844});errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8799/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.click(".tab[data-v=defter]")
    for k in range(3):
      pg.locator(".item").first.click();pg.click("#sheet button:has-text('Düzenle')");pg.wait_for_selector("#add:not([hidden])")
      pg.click("#add button:has-text('Değişiklikleri kaydet')");pg.wait_for_selector("#add",state="hidden");pg.wait_for_timeout(300)
    print("1 after 3 edit cycles, still in app:",pg.url.startswith("http"),"| history:",pg.evaluate("history.length"))
    pg.locator(".item").first.click();pg.wait_for_selector("#sheetWrap:not([hidden])");pg.go_back();pg.wait_for_timeout(300)
    print("2 back closed sheet:",not pg.is_visible("#sheetWrap"),"| still in app:",pg.url.startswith("http"))
    pg.locator(".item").first.click();pg.click("#sheet button:has-text('Yapay zekâ çözsün')");pg.wait_for_selector("#solve:not([hidden])")
    pg.go_back();pg.wait_for_timeout(300);print("3 back closed solve, sheet open:",pg.is_visible("#sheetWrap"),"solve hidden:",not pg.is_visible("#solve"))
    pg.go_back();pg.wait_for_timeout(300);print("4 back closed sheet:",not pg.is_visible("#sheetWrap"),"| still in app:",pg.url.startswith("http"))
    print("errors:",errs);b.close()
finally: srv.terminate()
