import subprocess, time, sys, json, os
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
PHOTO="/mnt/user-data/attachments/bae31379-8827-55ca-bf4e-e1891bb149aa/afcca981-image.jpg"
OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8786","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
URL="http://127.0.0.1:8786/";errs=[];prompts=[]
V=[{"marks":[{"label":"arrow","box_2d":[500,40,560,120],"points":[[530,50],[530,110]]},{"label":"circle","box_2d":[600,60,660,140],"points":[[610,70],[650,130]]}],"correct":"C","marked":["B"],"solved":"","subject":"mat","topic":"Tam Sayılar"},
   {"marks":[],"correct":"","marked":[],"solved":"D","subject":"mat","topic":"Tam Sayılar"},
   {"marks":[],"correct":"","marked":[],"solved":"","subject":"fen","topic":"Vücudumuzdaki Sistemler"},
   {"marks":[],"correct":"","marked":[],"solved":"A","subject":"mat","topic":"Tam Sayılar"}]
n=[0]
def route(r):
  h={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*","Access-Control-Allow-Methods":"POST, OPTIONS"}
  if r.request.method=="OPTIONS":r.fulfill(status=204,headers=h);return
  body=r.request.post_data or "";prompts.append(body)
  v=V[min(n[0],len(V)-1)];n[0]+=1
  r.fulfill(status=200,headers=h,content_type="application/json",body=json.dumps({"output_text":json.dumps(v)}))
def db(pg):
  return pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const a=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(a.result)}})""")
try:
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2)
    ctx.route("https://generativelanguage.googleapis.com/**",route)
    pg=ctx.new_page();pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto(URL);pg.evaluate("localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:10,maxPerDay:25,weekGoal:5}));localStorage.setItem('yd_aiKey','AIzaTESTKEY0123456789abcdef')");pg.reload();pg.wait_for_selector(".hero")
    with pg.expect_file_chooser() as fc: pg.click(".hero button:has-text('toplu ekle')")
    fc.value.set_files([PHOTO,SP+"/tests/test-question.jpg",PHOTO])
    pg.wait_for_function("(()=>{const b=document.querySelector('#bulk-save');return b&&!b.disabled})()",timeout=90000)
    print("0 prompt has Task 2b:", "Task 2b" in prompts[0], "| schema solved:", '"solved"' in prompts[0])
    cards=pg.locator("#bulk .bitem")
    for i in range(3):
      c=cards.nth(i);print(f"1.{i} correct:",c.locator(".letter.right[aria-pressed=true]").all_inner_texts(),"mine:",c.locator(".ansrow").nth(1).locator(".letter[aria-pressed=true]").all_inner_texts(),"| note:",(c.locator(".nokey").inner_text().replace("\n"," / ") if c.locator(".nokey").count() else "-"))
    print("2 head:",pg.inner_text("#bulk-head").replace("\n"," | "))
    pg.locator("#bulk .bitem").nth(1).scroll_into_view_if_needed();pg.screenshot(path=OUT+"/c1-bulk-nokey.png")
    pg.locator("#bulk .bitem").nth(1).locator(".nokey button").click()
    print("3 after accept:",pg.locator("#bulk .bitem").nth(1).locator(".letter.right[aria-pressed=true]").all_inner_texts(),"|",pg.locator("#bulk .bitem").nth(1).locator("p.muted").all_inner_texts())
    pg.click("#bulk-save");pg.wait_for_selector("#bulk",state="hidden",timeout=30000)
    its=sorted(db(pg),key=lambda x:x["createdAt"])
    print("4 saved:",[(x["subject"],x["correct"],x["mine"],x.get("aiSolved"),x.get("keyFromAi")) for x in its])
    # set the missing answer from the detail sheet
    miss=[x for x in its if not x["correct"]][0]
    pg.click(".tab[data-v=defter]");pg.locator(".item:has-text('Vücudumuzdaki')").first.click()
    print("5 sheet keybox:",pg.inner_text("#sheet .keybox").replace("\n"," / "))
    pg.screenshot(path=OUT+"/c2-sheet-keybox.png")
    pg.click("#sheet .keybox button:has-text('B')");pg.wait_for_timeout(500)
    print("6 updated correct:",[x["correct"] for x in db(pg) if x["id"]==miss["id"]],"| keybox gone:",pg.locator("#sheet .keybox").count()==0,"| shows:",pg.inner_text("#sheet .ans-right"))
    pg.go_back()
    # single add with an erased question
    with pg.expect_file_chooser() as fc2: pg.click("#fab")
    fc2.value.set_files(PHOTO);pg.wait_for_selector("#editor:not([hidden])");pg.wait_for_function("document.getElementById('ed-busy').hidden===true",timeout=20000)
    pg.click("#ed-use");pg.wait_for_selector("#editor",state="hidden");pg.wait_for_selector("#add .ai-note:not(.busy)",timeout=10000)
    print("7 add-form note:",pg.inner_text("#add .ai-note").replace("\n"," / "))
    pg.screenshot(path=OUT+"/c3-add-note.png")
    pg.click("#add .ai-note button");print("   correct pressed:",pg.locator("#add .letter.right[aria-pressed=true]").all_inner_texts())
    b.close()
finally: srv.terminate()
print("errors:",errs[:8])
