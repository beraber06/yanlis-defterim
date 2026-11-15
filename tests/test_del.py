import subprocess,time,sys
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)));OUT=SP+"/tests/out"
srv=subprocess.Popen([sys.executable,"-m","http.server","8788","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
SEED="""()=>new Promise(r=>{localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'',newPerDay:10,maxPerDay:25,weekGoal:5}));
 const q=indexedDB.open('yanlis-defterim',1);q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
 q.onsuccess=async()=>{const c=document.createElement('canvas');c.width=60;c.height=40;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,60,40);x.fillStyle='#333';x.fillText('Soru',10,25);
  const blob=await new Promise(res=>c.toBlob(res,'image/jpeg'));const buf=await blob.arrayBuffer();
  const t=q.result.transaction(['mistakes','photos'],'readwrite');const s=t.objectStore('mistakes'),ph=t.objectStore('photos');
  const subs=['mat','fen','tr','ing'];
  for(let i=0;i<12;i++){ph.put({t:'image/jpeg',b:buf},'p'+i);s.put({id:'m'+i,subject:subs[i%4],topic:'Konu '+(i+1),grade:7,correct:'C',createdAt:1000+i,date:'2026-10-2'+(i%9),stage:0,next:'2026-11-02',mastered:false,reviews:0,qPhoto:{id:'p'+i}})}
  t.oncomplete=()=>r()}})"""
COUNT="""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction(['mistakes','photos']);const a=t.objectStore('mistakes').count(),b=t.objectStore('photos').count();t.oncomplete=()=>r([a.result,b.result])}})"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2);pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://127.0.0.1:8788/");pg.evaluate(SEED);pg.reload();pg.wait_for_selector(".hero");pg.click(".tab[data-v=defter]");pg.wait_for_selector(".item")
    print("0 start (items, photos):",pg.evaluate(COUNT))
    pg.click("#v-defter button:has-text('Seç')")
    for k in [0,2,5]:pg.locator(".item").nth(k).click()
    print("1 selbar:",pg.inner_text("#selbar").replace("\n"," | "))
    pg.screenshot(path=OUT+"/d1-select.png")
    pg.click("#selDel");pg.wait_for_selector("#dlg:not([hidden])")
    print("2 dialog:",pg.inner_text("#dlg .dialog").replace("\n"," | "))
    pg.screenshot(path=OUT+"/d2-confirm.png")
    pg.click("#dlg button:has-text('Vazgeç')");pg.wait_for_selector("#dlg",state="hidden")
    print("3 after cancel:",pg.evaluate(COUNT),pg.inner_text("#selCount"))
    pg.click("#selDel");pg.wait_for_selector("#dlg:not([hidden])");pg.go_back();pg.wait_for_selector("#dlg",state="hidden")
    print("4 back closed dialog; still selecting:",pg.is_visible("#selbar"),pg.evaluate(COUNT))
    pg.click("#selDel");pg.click("#dlg button:has-text('Evet, sil')");pg.wait_for_selector("#dlg",state="hidden");pg.wait_for_timeout(400)
    print("5 deleted 3:",pg.evaluate(COUNT),"| toast:",pg.inner_text("#toast"),"| list:",pg.locator(".item").count(),"| select mode off:",not pg.is_visible("#selbar"))
    # filter by subject, select all visible, delete
    pg.click("#v-defter .pick:has-text('Türkçe')");pg.click("#v-defter button:has-text('Seç')");pg.click("#selAll")
    print("6 all visible:",pg.inner_text("#selCount"),"| toggle label:",pg.inner_text("#selAll"))
    pg.click("#selAll");print("   after Hiçbiri:",pg.inner_text("#selCount"));pg.click("#selAll")
    pg.click("#selDel");pg.click("#dlg button:has-text('Evet, sil')");pg.wait_for_selector("#dlg",state="hidden");pg.wait_for_timeout(400)
    print("7 subject deleted:",pg.evaluate(COUNT))
    pg.click("#v-defter .pick:has-text('Tümü')");pg.click("#v-defter button:has-text('Seç')");pg.click("#selAll")
    pg.click("#selDel");print("8 dialog all:",pg.inner_text("#dlg h2"));pg.click("#dlg button:has-text('Evet, sil')");pg.wait_for_selector("#dlg",state="hidden");pg.wait_for_timeout(400)
    print("9 all deleted:",pg.evaluate(COUNT),"| notice:",pg.inner_text("#v-defter .notice"))
    b.close()
finally: srv.terminate()
print("errors:",errs)
