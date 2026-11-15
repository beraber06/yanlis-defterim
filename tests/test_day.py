import subprocess,time,sys,json
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8802","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[];calls=[]
SOL={"steps":["Birinci adım.","İkinci adım.","Sonuç."],"answer":"C","idea":"Kural.","trap":"Tuzak."}
def route(r):
  h={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*","Access-Control-Allow-Methods":"POST, OPTIONS"}
  if r.request.method=="OPTIONS":r.fulfill(status=204,headers=h);return
  calls.append(1);time.sleep(0.3);r.fulfill(status=200,headers=h,content_type="application/json",body=json.dumps({"output_text":json.dumps(SOL,ensure_ascii=False)}))
SEED="""()=>new Promise(r=>{const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
 localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',maxPerDay:20,weekGoal:5,masterAfter:2}));localStorage.setItem('yd_repairV10','1');localStorage.setItem('yd_masterRule','2');localStorage.setItem('yd_schedV15','1');localStorage.setItem('yd_aiKey','AIzaTESTKEY0123456789abcdef');
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
  const B={grade:7,correct:'C',mastered:false};
  s.put(Object.assign({id:'a',subject:'mat',topic:'Oran orantı',note:'a',createdAt:1,date:D(-9),stage:0,lastReview:D(-1),next:D(0),reviews:2,hist:[[D(-8),1],[D(-1),0]]},B));
  s.put(Object.assign({id:'b',subject:'fen',topic:'Kuvvet ve enerji',note:'b',createdAt:2,date:D(-9),stage:1,lastReview:D(-1),next:D(6),reviews:1,hist:[[D(-1),1]]},B));
  s.put(Object.assign({id:'c',subject:'tur',topic:'Fiilimsiler',note:'c',createdAt:3,date:D(-9),stage:0,lastReview:D(-1),next:D(0),reviews:1,hist:[[D(-1),0]],aiSol:{steps:['eski çözüm'],answer:'C',idea:'',trap:''}},B));
  s.put(Object.assign({id:'d',subject:'ing',topic:'Daily routines',note:'d',createdAt:4,date:D(-1),stage:0,next:D(-1),reviews:0},B));
  s.put(Object.assign({id:'e',subject:'mat',topic:'Cebirsel ifadeler',note:'e',createdAt:5,date:D(-9),stage:1,lastReview:D(-5),next:D(2),reviews:1,hist:[[D(-5),1]]},B));
  t.oncomplete=()=>r()}})"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2);ctx.route("https://generativelanguage.googleapis.com/**",route)
    pg=ctx.new_page();pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8802/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.wait_for_timeout(800)
    hl=pg.evaluate("()=>history.length")
    pg.locator(".card.week").scroll_into_view_if_needed();pg.screenshot(path=OUT+"/day-week.png")
    print("1 week buttons:",pg.eval_on_selector_all(".card.week .days button.d","e=>e.map(x=>x.getAttribute('aria-label'))"))
    # open yesterday: if today is Monday yesterday is not in this week; use the day screen arrows from today instead
    pg.click(".card.week .days button.d.today");pg.wait_for_selector("#day:not([hidden])")
    print("2 today:",pg.inner_text("#day .screen-top h2"),"|",pg.inner_text("#day .screen-body").replace("\n"," | ")[:400])
    pg.click("#day .screen-top button[aria-label='Önceki gün']");pg.wait_for_timeout(200)
    print("3 yesterday:",pg.inner_text("#day .screen-top h2"),"|",pg.inner_text("#day .screen-body").replace("\n"," | ")[:500])
    pg.screenshot(path=OUT+"/day-yesterday.png")
    pg.click("#day .seg button:has-text('Yalnız yanlışlar')");pg.wait_for_timeout(200)
    print("4 only wrong:",pg.eval_on_selector_all("#day .dayitem .item-topic","e=>e.map(x=>x.textContent)"),"| main btn:",pg.inner_text("#day .screen-body > .in > .btn.primary"))
    pg.click("#day .seg button:has-text('Hepsi')");pg.wait_for_timeout(200)
    print("5 all:",pg.eval_on_selector_all("#day .dayitem .item-topic","e=>e.map(x=>x.textContent)"),"| aib:",pg.eval_on_selector_all("#day .dayitem .aib","e=>e.map(x=>x.textContent)"))
    pg.click("#day .screen-body > .in > .btn.primary");pg.wait_for_selector("#solve .steps li",timeout=15000)
    print("6 solve first:",pg.inner_text("#solve .screen-top").replace("\n"," "),"| topic:",pg.inner_text("#solve .card .muted.small"),"| foot:",pg.eval_on_selector_all("#solve .screen-foot .btn","e=>e.map(x=>x.textContent)"),"| calls",len(calls))
    pg.screenshot(path=OUT+"/day-solve.png")
    pg.click("#solve .screen-foot button:has-text('Sonraki soru')");pg.wait_for_timeout(300)
    print("7 next:",pg.inner_text("#solve .screen-top").replace("\n"," "),"| topic:",pg.inner_text("#solve .card .muted.small"),"| steps:",pg.eval_on_selector_all("#solve .steps li","e=>e.map(x=>x.textContent)"),"| calls",len(calls))
    pg.click("#solve .screen-foot button:has-text('Sonraki soru')");pg.wait_for_selector("#solve .steps li",timeout=15000);pg.wait_for_timeout(300)
    print("8 next2:",pg.inner_text("#solve .screen-top").replace("\n"," "),"| topic:",pg.inner_text("#solve .card .muted.small"),"| foot:",pg.eval_on_selector_all("#solve .screen-foot .btn","e=>e.map(x=>x.textContent)"),"| calls",len(calls))
    pg.go_back();pg.wait_for_selector("#solve",state="hidden");pg.wait_for_timeout(300)
    print("9 back to day:",pg.is_visible("#day"),"| aib:",pg.eval_on_selector_all("#day .dayitem .aib","e=>e.map(x=>x.textContent)"))
    pg.click("#day .dayitem .open >> nth=0");pg.wait_for_selector("#sheetWrap:not([hidden])");pg.wait_for_timeout(200)
    print("10 sheet over day visible:",pg.evaluate("()=>{const r=document.querySelector('#sheet').getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+40);return !!(e&&e.closest('#sheet'))}"))
    pg.go_back();pg.wait_for_selector("#sheetWrap",state="hidden")
    pg.click("#day .screen-top button[aria-label='Sonraki gün']");pg.click("#day .screen-top button[aria-label='Sonraki gün']");pg.click("#day .screen-top button[aria-label='Sonraki gün']");pg.wait_for_timeout(200)
    print("11 +2 days:",pg.inner_text("#day .screen-top h2"),"|",pg.inner_text("#day .screen-body").replace("\n"," | ")[:300])
    pg.click("#day .screen-top button[aria-label='Sonraki gün']");pg.wait_for_timeout(200)
    print("12 +3 days:",pg.inner_text("#day .screen-top h2"),"|",pg.inner_text("#day .screen-body").replace("\n"," | ")[:200])
    pg.go_back();pg.wait_for_selector("#day",state="hidden");pg.wait_for_timeout(300)
    print("13 closed; history same:",pg.evaluate("()=>history.length")==hl or pg.evaluate("()=>history.length"),"| url:",pg.url)
    b.close()
finally: srv.terminate()
print("errors:",errs)
