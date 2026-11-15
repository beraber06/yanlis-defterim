import subprocess, time, sys, json, os
from playwright.sync_api import sync_playwright

SP = __import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
PHOTO = "/mnt/user-data/attachments/bae31379-8827-55ca-bf4e-e1891bb149aa/afcca981-image.jpg"
PHOTO2 = SP + "/tests/test-question.jpg"
OUT = SP + "/tests/out"
os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8784", "--bind", "127.0.0.1"], cwd=SP + "/docs",
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
URL = "http://127.0.0.1:8784/"
errs = []
ai_calls = []

ANALYZE = {"marks": [{"label": "circle", "box_2d": [520, 80, 600, 260], "points": [[530, 100], [560, 250], [595, 120]]}],
           "correct": "C", "marked": ["B"], "subject": "mat", "topic": "Rasyonel Sayılarla İşlemler ve Problemler"}
SIMILAR = {"questions": [
    {"q": "(−4) · (+3) − (−8) ÷ (+2) işleminin sonucu kaçtır?", "options": ["A) −16", "B) −8", "C) 8", "D) 16"], "answer": "B", "why": "(−4)·(+3) = −12; (−8)÷(+2) = −4; −12 − (−4) = −8."},
    {"q": "(+18) ÷ (−3) + (−2) · (−5) işleminin sonucu kaçtır?", "options": ["−16", "−4", "4", "16"], "answer": "C", "why": "(+18)÷(−3) = −6; (−2)·(−5) = 10; −6 + 10 = 4."},
    {"q": "Bir kuyunun derinliği −12 m'dir. Bir kova önce 5 m aşağı inip sonra 3 m yukarı çıkıyor. Kova kaç metrededir?", "options": ["−20", "−14", "−10", "−4"], "answer": "B", "why": "−12 − 5 + 3 = −14."}]}


def ai_route(route):
    req = route.request
    hdr = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, OPTIONS"}
    if req.method == "OPTIONS":
        route.fulfill(status=204, headers=hdr); return
    body = req.post_data or ""
    if "practice questions" in body:
        payload = SIMILAR; ai_calls.append("similar")
    elif "Yalnızca OK" in body:
        payload = "OK"; ai_calls.append("ping")
    else:
        payload = ANALYZE; ai_calls.append("analyze")
    time.sleep(0.3)
    route.fulfill(status=200, headers=hdr, content_type="application/json",
                  body=json.dumps({"output_text": payload if isinstance(payload, str) else json.dumps(payload, ensure_ascii=False)}))


SEED = """()=>new Promise(r=>{
  localStorage.setItem('yd_settings',JSON.stringify({grade:7,name:'Elif',newPerDay:10,maxPerDay:25,weekGoal:5}));
  localStorage.setItem('yd_aiKey','AIzaTESTKEY0123456789abcdef');
  localStorage.setItem('yd_exams',JSON.stringify([
   {id:'e1',name:'Bilgi Sarmal Deneme 1',date:'2026-10-05',grade:7,created:1,rows:[{k:'tr',n:20,d:14,y:4},{k:'sos',n:10,d:6,y:2},{k:'din',n:10,d:8,y:1},{k:'ing',n:10,d:6,y:3},{k:'mat',n:20,d:9,y:6},{k:'fen',n:20,d:12,y:5}]},
   {id:'e2',name:'Bilgi Sarmal Deneme 2',date:'2026-10-19',grade:7,created:2,rows:[{k:'tr',n:20,d:15,y:3},{k:'sos',n:10,d:7,y:2},{k:'din',n:10,d:8,y:1},{k:'ing',n:10,d:7,y:2},{k:'mat',n:20,d:11,y:5},{k:'fen',n:20,d:13,y:4}]},
   {id:'e3',name:'Okul Denemesi',date:'2026-10-26',grade:7,created:3,rows:[{k:'tr',n:20,d:15,y:4},{k:'sos',n:10,d:8,y:1},{k:'din',n:10,d:9,y:1},{k:'ing',n:10,d:7,y:1},{k:'mat',n:20,d:12,y:4},{k:'fen',n:20,d:14,y:3}]}]));
  const q=indexedDB.open('yanlis-defterim',1);
  q.onupgradeneeded=()=>{const d=q.result;d.createObjectStore('mistakes',{keyPath:'id'});d.createObjectStore('photos')};
  q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
    const subs=['mat','fen','tr','par','sos','din','ing'];
    const tops={mat:'Rasyonel Sayılarla İşlemler ve Problemler',fen:'Vücudumuzdaki Sistemler',tr:'Fiillerde Anlam Kayması',par:'Ana Fikir (Ana Düşünce)',sos:'Osmanlı Kültür ve Medeniyeti',din:'Hac, Umre ve Kurban',ing:'Personal Life & Well-Being'};
    const D=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};const days=[D(-11),D(-10),D(-4),D(-3),D(-2),D(-1)];
    for(let i=0;i<28;i++){
      const sub=subs[i%7];const hist=[];
      days.forEach((d,j)=>{if((i+j)%3!==0)hist.push([d,(i+j)%4===0?0:1])});
      const it={id:'s'+i,subject:sub,topic:tops[sub],grade:7,source:'Deneme '+(i%4+1),note:'Örnek soru '+(i+1),correct:'C',mine:'B',reason:['bilgi','dikkat','islem'][i%3],
        createdAt:1000+i,date:i<6?'2026-10-28':'2026-10-0'+(i%9+1),stage:i%4,next:i<12?'2026-10-30':'2026-11-05',mastered:false,reviews:hist.length,wrongCount:1,hist:hist,tip:'',tipAudio:null};
      if(i>=24){it.mastered=true;it.stage=5;it.next=null;it.masteredAt=i===24?'2026-10-28':'2026-10-21'}
      if(i===0){it.tip='Soru kökündeki “değildir”in altını çiz.';it.next='2026-10-28';it.stage=1}
      if(i===1){it.stage=4;it.next='2026-10-29'}
      s.put(it)}
    t.oncomplete=()=>r()}})"""


def shot(pg, name, full=False):
    pg.wait_for_timeout(300)
    pg.evaluate("document.querySelectorAll('.confetti').forEach(c=>c.remove());document.getElementById('toast').classList.remove('show')")
    pg.wait_for_timeout(250)
    pg.screenshot(path=f"{OUT}/{name}.png", full_page=full)


def db_items(pg):
    return pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const a=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(a.result)}})""")


try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"])
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, accept_downloads=True)
        ctx.grant_permissions(["microphone"], origin=URL.rstrip("/"))
        ctx.route("https://generativelanguage.googleapis.com/**", ai_route)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console: " + m.text) if m.type == "error" else None)
        pg.goto(URL)
        pg.evaluate(SEED)
        pg.reload(); pg.wait_for_selector(".hero")
        print("1 streak:", pg.inner_text(".streak"), "| week:", pg.inner_text(".week .head").replace("\n", " "), "| hero:", pg.inner_text(".hero .num"))
        shot(pg, "01-home", full=True)

        # --- bulk add ---
        n0 = len(db_items(pg))
        with pg.expect_file_chooser() as fc:
            pg.click("button.quick.alt")
        fc.value.set_files([PHOTO, PHOTO2, PHOTO])
        pg.wait_for_selector("#bulk:not([hidden])")
        shot(pg, "02a-bulk-working")
        pg.wait_for_function("(()=>document.querySelectorAll('#bulk .bitem .pill').length===3&&[...document.querySelectorAll('#bulk .bitem .pill')].every(x=>x.textContent==='Hazır'))()", timeout=90000)
        print("2a before AI (no automatic AI): analyze calls", ai_calls.count("analyze"), "| pills:", pg.eval_on_selector_all("#bulk .bitem .pill", "e=>e.map(x=>x.textContent)"))
        print("   head:", pg.inner_text("#bulk-head").replace("\n", " | "))
        shot(pg, "02a2-bulk-before-ai")
        pg.locator("#bulk .bitem").nth(0).locator("button:has-text('Yapay zekâ ile oku')").click()
        pg.wait_for_function("(()=>document.querySelectorAll('#bulk .bitem .pill.done').length===1)()", timeout=30000)
        print("2b one read: analyze calls", ai_calls.count("analyze"))
        pg.click("#bulk-head button:has-text('Yapay zekâ ile oku')")
        pg.wait_for_function("(()=>document.querySelectorAll('#bulk .bitem .pill.done').length===3)()", timeout=60000)
        pg.wait_for_function("(()=>{const b=document.querySelector('#bulk-save');return b&&!b.disabled})()", timeout=30000)
        print("2 bulk pills:", pg.eval_on_selector_all("#bulk .bitem .pill", "e=>e.map(x=>x.textContent)"), "| head:", pg.inner_text("#bulk-head").split("\n")[0], "| analyze calls", ai_calls.count("analyze"))
        print("  correct letters:", pg.eval_on_selector_all("#bulk .letters .letter.right[aria-pressed=true]", "e=>e.map(x=>x.textContent)"))
        shot(pg, "02b-bulk-ready")
        pg.locator("#bulk .bitem").nth(1).locator("select").first.select_option("fen")
        pg.wait_for_timeout(200)
        sel2 = pg.locator("#bulk .bitem").nth(1).locator("select").nth(1)
        sel2.select_option(index=2)
        pg.fill("#bulk-src", "Hız Deneme 5")
        pg.click("#bulk-save")
        pg.wait_for_selector("#bulk", state="hidden", timeout=30000)
        its = db_items(pg)
        new = [x for x in its if x["id"] not in [f"s{i}" for i in range(28)]]
        print("3 bulk saved:", len(its) - n0, [(x["subject"], x["topic"], x["correct"], x["mine"], x["source"], bool(x["qPhoto"]), bool(x["oPhoto"])) for x in sorted(new, key=lambda x: x["createdAt"])])

        # --- add with attention note (text + voice) ---
        with pg.expect_file_chooser() as fc2:
            pg.click("#fab")
        fc2.value.set_files(PHOTO)
        pg.wait_for_selector("#editor:not([hidden])")
        pg.wait_for_function("document.getElementById('ed-busy').hidden===true", timeout=20000)
        pg.click("#ed-use"); pg.wait_for_selector("#editor", state="hidden")
        pg.wait_for_timeout(1200)
        pg.fill("#i-tip", "Negatif sayıyla çarparken işarete dikkat!")
        pg.click("#add button:has-text('Sesli not kaydet')")
        pg.wait_for_selector("#rec-time"); pg.wait_for_timeout(1600)
        shot(pg, "03a-recording")
        pg.click("#add button:has-text('Kaydı bitir')")
        pg.wait_for_selector("#add .tipaudio", timeout=5000)
        pg.locator("#i-tip").scroll_into_view_if_needed()
        shot(pg, "03b-tip")
        pg.click("#add .screen-foot button:has-text('Kaydet')>>nth=0")
        pg.wait_for_selector("#add", state="hidden")
        its = db_items(pg)
        tipped = [x for x in its if x.get("tip") and x["id"] != "s0"]
        print("4 tip saved:", [(x["subject"], x["topic"], x["tip"], bool(x.get("tipAudio"))) for x in tipped])
        aud = pg.evaluate("""(id)=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('photos');const g=t.objectStore('photos').get(id);t.oncomplete=()=>r(g.result?[g.result.t,g.result.b.byteLength]:null)}})""", tipped[0]["tipAudio"]["id"])
        print("   audio blob:", aud)

        # --- review: hint, similar questions, mastery celebration, weekly goal ---
        pg.click(".hero button:has-text('Tekrara başla')")
        pg.wait_for_selector("#review:not([hidden])")
        print("5 first card topic:", pg.inner_text("#review .topic"), "| hint button:", pg.locator("#review .hintbtn").count())
        pg.click("#review .hintbtn")
        shot(pg, "05a-review-hint")
        pg.click("#review button:has-text('cevabı göster')")
        pg.click("#review button:has-text('Benzer soru')")
        pg.wait_for_selector("#sim .simq", timeout=15000)
        pg.locator("#sim .simq").nth(0).locator(".opt").nth(1).click()
        pg.locator("#sim .simq").nth(1).locator(".opt").nth(0).click()
        print("6 similar verdicts:", pg.eval_on_selector_all("#sim .verdict", "e=>e.map(x=>x.textContent)"), "| ai calls:", ai_calls)
        shot(pg, "06-similar")
        pg.go_back(); pg.wait_for_selector("#sim", state="hidden")
        print("   back closed similar; review open:", pg.is_visible("#review"))
        pg.click("#review button:has-text('Doğru çözdüm')")
        pg.wait_for_timeout(400); print("7 toast1:", pg.inner_text("#toast"))
        pg.wait_for_timeout(1800); print("   toast after goal:", pg.inner_text("#toast"))
        print("   second card topic:", pg.inner_text("#review .topic"), "| stages:", pg.get_attribute("#review .stages", "aria-label"))
        pg.click("#review button:has-text('cevabı göster')")
        pg.click("#review button:has-text('Doğru çözdüm')")
        pg.wait_for_timeout(400); print("8 mastered toast:", pg.inner_text("#toast"))
        pg.go_back(); pg.wait_for_selector("#review", state="hidden")
        print("   streak now:", pg.inner_text(".streak"), "| week:", pg.inner_text(".week .head").replace("\n", " "))
        shot(pg, "08-home-after")

        # --- notebook topic tools ---
        pg.click(".tab[data-v=defter]")
        pg.click("#v-defter .pick:has-text('Matematik')")
        print("9 topic options:", pg.eval_on_selector_all("#f-topic option", "e=>e.map(x=>x.textContent)"))
        pg.select_option("#f-topic", index=1)
        print("   tools:", pg.inner_text(".topictools").replace("\n", " | "), "| list:", pg.locator(".item").count())
        shot(pg, "09-topic")
        pg.click(".topictools button:has-text('Şimdi çöz')")
        pg.wait_for_selector("#review:not([hidden])")
        print("10 topic review counter:", pg.inner_text("#review .counter"))
        pg.go_back(); pg.wait_for_selector("#review", state="hidden")
        pg.click(".topictools button:has-text('PDF test')")
        pg.wait_for_selector("#pdf .pages canvas", timeout=30000)
        print("11 pdf title:", pg.input_value("#pdf-title"))
        pg.go_back(); pg.wait_for_selector("#pdf", state="hidden")

        # --- analysis: badges, exams, report ---
        pg.click(".tab[data-v=analiz]")
        print("12 badges:", pg.inner_text(".badges").replace("\n", " ")[:220])
        shot(pg, "12-analiz", full=True)
        pg.click("#v-analiz .seg button:has-text('Denemeler')")
        pg.click("#v-analiz button:has-text('Deneme ekle')")
        pg.wait_for_selector("#exam:not([hidden])")
        pg.fill("#ex-name", "Hız Deneme 4")
        vals = {"tr": (16, 3), "sos": (8, 1), "din": (9, 1), "ing": (7, 2), "mat": (14, 4), "fen": (15, 3)}
        for k, (d, y) in vals.items():
            pg.fill(f"#ex-{k}-d", str(d)); pg.fill(f"#ex-{k}-y", str(y))
        print("13 exam total:", pg.inner_text("#ex-total"), "|", pg.inner_text("#ex-sub"))
        pg.fill("#ex-mat-d", "18"); print("   over:", pg.inner_text("#ex-sub"), "save disabled:", pg.is_disabled("#ex-save"))
        pg.fill("#ex-mat-d", "14")
        shot(pg, "13-exam-form")
        pg.click("#ex-save"); pg.wait_for_selector("#exam", state="hidden")
        pg.wait_for_timeout(300); print("14 toast:", pg.inner_text("#toast"))
        pg.wait_for_timeout(1700); print("   toast2:", pg.inner_text("#toast"))
        pg.locator("#v-analiz .chart .hit").last.click()
        print("   tooltip:", pg.inner_text("#v-analiz .chart .tt").replace("\n", " "))
        shot(pg, "14-exams", full=True)
        pg.click("#v-analiz .seg button:has-text('Rapor')")
        print("15 report tiles:", pg.inner_text("#v-analiz .tiles").replace("\n", " "))
        shot(pg, "15-report", full=True)
        with pg.expect_download() as dl:
            pg.click("#v-analiz button:has-text('Raporu paylaş')")
        dl.value.save_as(OUT + "/report.png")
        print("16 report png:", dl.value.suggested_filename, os.path.getsize(OUT + "/report.png") // 1024, "KB")
        pg.click("#v-analiz .seg.two button:has-text('Geçen hafta')")
        print("   last week tiles:", pg.inner_text("#v-analiz .tiles").replace("\n", " "))

        # --- settings + backup with exams and audio ---
        pg.click(".tab[data-v=ayarlar]")
        print("17 weekGoal:", pg.input_value("#set-weekGoal"))
        with pg.expect_download() as dl2:
            pg.click("#v-ayarlar button:has-text('Yedek al')")
        dl2.value.save_as(OUT + "/backup.json")
        bk = json.load(open(OUT + "/backup.json"))
        aud_ids = [x["tipAudio"]["id"] for x in bk["items"] if x.get("tipAudio")]
        print("18 backup: items", len(bk["items"]), "exams", len(bk.get("exams", [])), "audio in photos:", [bk["photos"][i][:22] for i in aud_ids])

        # --- detail sheet similar button + dark mode screens ---
        pg.click(".tab[data-v=defter]")
        pg.locator(".item").first.click()
        print("19 sheet buttons:", pg.eval_on_selector_all("#sheet .btn", "e=>e.map(x=>x.textContent)"))
        pg.go_back()
        b.close()

        b2 = p.chromium.launch()
        c2 = b2.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme="dark")
        p2 = c2.new_page(); p2.on("pageerror", lambda e: errs.append("dark pageerror: " + str(e)))
        p2.goto(URL); p2.evaluate(SEED); p2.reload(); p2.wait_for_selector(".hero")
        p2.screenshot(path=f"{OUT}/20-dark-home.png")
        p2.click(".tab[data-v=analiz]"); p2.click("#v-analiz .seg button:has-text('Denemeler')"); p2.wait_for_timeout(300)
        p2.screenshot(path=f"{OUT}/21-dark-exams.png", full_page=True)
        p2.click("#v-analiz .seg button:has-text('Genel')"); p2.wait_for_timeout(300)
        p2.screenshot(path=f"{OUT}/22-dark-badges.png", full_page=True)
        b2.close()
finally:
    srv.terminate()
print("errors:", errs[:12])
