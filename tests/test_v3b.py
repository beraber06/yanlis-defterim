import subprocess, time, sys, json, os
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
PHOTO="/mnt/user-data/attachments/bae31379-8827-55ca-bf4e-e1891bb149aa/afcca981-image.jpg"
OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8785","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
URL="http://127.0.0.1:8785/";errs=[];calls=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2)
    ctx.route("https://generativelanguage.googleapis.com/**",lambda r:(calls.append(1),r.abort()))
    pg=ctx.new_page();pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto(URL);pg.evaluate("localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:10,maxPerDay:25,weekGoal:5}))");pg.reload()
    pg.wait_for_selector(".hero")
    with pg.expect_file_chooser() as fc: pg.click(".hero button:has-text('toplu ekle')")
    fc.value.set_files([PHOTO,SP+"/tests/test-question.jpg"])
    pg.wait_for_function("(()=>{const h=document.querySelector('#bulk-head');return h&&/soru hazır/.test(h.textContent)})()",timeout=60000)
    print("1 no-key head:",pg.inner_text("#bulk-head").replace("\n"," | ")[:200])
    print("  save label:",pg.inner_text("#bulk-save"),"disabled:",pg.is_disabled("#bulk-save"))
    pg.click("#bulk .pick:has-text('Türkçe')")
    print("2 after common subject:",pg.inner_text("#bulk-save"),"| subjects:",pg.eval_on_selector_all("#bulk .bitem select:first-of-type","e=>e.map(x=>x.value)"))
    pg.screenshot(path=OUT+"/b1-nokey.png")
    # fix photo of item 1 via editor
    pg.locator("#bulk .bitem").nth(0).locator("button[aria-label='Fotoğrafı düzelt']").click()
    pg.wait_for_selector("#editor:not([hidden])");pg.wait_for_function("document.getElementById('ed-busy').hidden===true",timeout=20000)
    before=pg.get_attribute("#bulk .bitem >> nth=0 >> img","src")
    pg.click("#ed-rotl");pg.wait_for_function("document.getElementById('ed-busy').hidden===true",timeout=20000)
    pg.click("#ed-use");pg.wait_for_selector("#editor",state="hidden");pg.wait_for_timeout(400)
    after=pg.get_attribute("#bulk .bitem >> nth=0 >> img","src")
    print("3 edit changed photo:",before!=after,"| bulk still open:",pg.is_visible("#bulk"),"| form reset:",pg.evaluate("document.querySelector('#add').hidden"))
    # back button asks before discarding
    pg.go_back();pg.wait_for_timeout(300)
    print("4 back -> confirm shown:",pg.locator("#bulk .confirm").count(),"| bulk visible:",pg.is_visible("#bulk"))
    pg.click("#bulk .confirm button:has-text('Vazgeç')")
    pg.go_back();pg.wait_for_timeout(300);pg.click("#bulk .confirm button:has-text('Evet, çık')")
    pg.wait_for_selector("#bulk",state="hidden");pg.wait_for_timeout(300)
    print("5 closed; items in db:",pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const a=t.objectStore('mistakes').count();t.oncomplete=()=>r(a.result)}})"""),"| ai calls:",len(calls),"| history ok:",pg.evaluate("location.hash"))
    # similar without key
    pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');t.objectStore('mistakes').put({id:'x1',subject:'mat',topic:'Tam Sayılar',grade:7,note:'(-3)+5=?',correct:'B',createdAt:1,date:'2026-10-30',stage:0,next:'2026-10-31',mastered:false,reviews:0});t.oncomplete=()=>r()}})""")
    pg.reload();pg.click(".tab[data-v=defter]");pg.locator(".item").first.click();pg.click("#sheet button:has-text('Benzer soru')")
    pg.wait_for_selector("#sim:not([hidden])");print("6 sim without key:",pg.inner_text("#sim .notice"))
    pg.go_back();pg.wait_for_selector("#sim",state="hidden");print("   sheet still open:",pg.is_visible("#sheetWrap"))
    b.close()
finally: srv.terminate()
print("errors:",errs[:8])
