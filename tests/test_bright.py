# New photos are only brightened: no automatic crop or pencil removal (single add and bulk).
import subprocess,time,sys,os
from playwright.sync_api import sync_playwright
SP=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));PHOTO=SP+"/tests/test-question.jpg"
srv=subprocess.Popen([sys.executable,"-m","http.server","8811","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":390,"height":844},device_scale_factor=2)
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://127.0.0.1:8811/");pg.evaluate("()=>{localStorage.setItem('yd_settings',JSON.stringify({grade:7}));['repairV10','schedV15','sheetFixV18'].forEach(k=>localStorage.setItem('yd_'+k,'1'))}");pg.reload();pg.wait_for_timeout(800)
    with pg.expect_file_chooser() as fc: pg.click("#fab")
    fc.value.set_files(PHOTO);pg.wait_for_selector("#editor:not([hidden])");pg.wait_for_function("document.getElementById('ed-busy').hidden===true",timeout=20000);pg.wait_for_timeout(300)
    print("1 single: scan",pg.is_checked("#ed-scan"),"| pencil",pg.is_checked("#ed-pencil"),"| toast:",pg.inner_text("#toast") if pg.is_visible("#toast") else "-")
    pg.screenshot(path=SP+"/tests/out/bright-editor.png")
    pg.click("#ed-use");pg.wait_for_selector("#editor",state="hidden");pg.wait_for_timeout(800)
    sz=pg.evaluate("()=>new Promise(r=>{const i=document.querySelector('#add img');if(!i)return r(null);const f=()=>r([i.naturalWidth,i.naturalHeight]);i.complete?f():i.onload=f})")
    from PIL import Image;W,H=Image.open(PHOTO).size;print("  saved preview size",sz,"orig",(W,H),"ratio same:",sz and abs(sz[0]/sz[1]-W/H)<0.02)
    b.close()
finally: srv.terminate()
print("errors:",errs)
