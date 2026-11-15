# New versions must show on the next open even though GitHub Pages lets browsers cache pages for 10 minutes.
import subprocess,time,sys,os,shutil,tempfile
from playwright.sync_api import sync_playwright
SP=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D=tempfile.mkdtemp();shutil.copytree(SP+"/docs",D+"/s")
SRV='''import http.server,sys,os
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control","max-age=600");super().end_headers()
os.chdir(sys.argv[1]);http.server.ThreadingHTTPServer(("127.0.0.1",8810),H).serve_forever()
'''
open(D+"/srv.py","w").write(SRV)
srv=subprocess.Popen([sys.executable,D+"/srv.py",D+"/s"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
def ver(pg):return pg.evaluate("()=>(document.documentElement.innerHTML.match(/Sürüm \\d+ ·/)||[''])[0]")
try:
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(service_workers="allow");pg=ctx.new_page()
    pg.goto("http://127.0.0.1:8810/");pg.evaluate("()=>localStorage.setItem('yd_settings',JSON.stringify({grade:7}))")
    pg.evaluate("()=>navigator.serviceWorker.ready.then(()=>1)");pg.reload();pg.wait_for_timeout(1500)
    print("1 first:",ver(pg),"| controlled:",pg.evaluate("()=>!!navigator.serviceWorker.controller"))
    import re;s=open(D+"/s/index.html").read();open(D+"/s/index.html","w").write(re.sub(r"Sürüm \d+ ·","Sürüm 99 ·",s))
    w=open(D+"/s/sw.js").read();open(D+"/s/sw.js","w").write(re.sub(r"yanlis-defterim-v\d+","yanlis-defterim-v99",w))
    pg.goto("about:blank");pg.goto("http://127.0.0.1:8810/");pg.wait_for_timeout(4000)
    print("2 after one reopen:",ver(pg))
    pg.goto("about:blank");pg.goto("http://127.0.0.1:8810/");pg.wait_for_timeout(1500)
    print("3 after second reopen:",ver(pg))
    b.close()
finally:
  srv.terminate();shutil.rmtree(D,ignore_errors=True)
