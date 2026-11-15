import subprocess,time,sys
from playwright.sync_api import sync_playwright
SP=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,"-m","http.server","8806","--bind","127.0.0.1"],cwd=SP+"/docs",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
mode={"m":None}
def route(r):
  if mode["m"]=="503":r.fulfill(status=503,content_type="text/html",body="<html><title>Site not available</title>Paused</html>")
  elif mode["m"]=="foreign":r.fulfill(status=200,content_type="text/html",body="<html><title>Site paused</title>This site is paused</html>")
  else:r.continue_()
try:
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(service_workers="allow");pg=ctx.new_page()
    pg.goto("http://127.0.0.1:8806/");pg.evaluate("()=>localStorage.setItem('yd_settings',JSON.stringify({grade:7}))")
    pg.evaluate("()=>navigator.serviceWorker.ready.then(()=>1)");pg.reload();pg.wait_for_timeout(1500)
    print("controlled:",pg.evaluate("()=>!!navigator.serviceWorker.controller"))
    ctx.route("http://127.0.0.1:8806/",route);ctx.route("http://127.0.0.1:8806/index.html",route)
    for m in ["503","foreign",None]:
      mode["m"]=m;pg.reload();pg.wait_for_timeout(1500)
      print(m,"-> title:",pg.title(),"| app body:",pg.locator("nav, .tabbar, .tab").count()>0)
    b.close()
finally: srv.terminate()
