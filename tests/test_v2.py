import subprocess, time, sys, json, os
from playwright.sync_api import sync_playwright

SP = __import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
PHOTO = "/mnt/user-data/attachments/bae31379-8827-55ca-bf4e-e1891bb149aa/afcca981-image.jpg"
OUT = SP + "/tests/out"
os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8780", "--bind", "127.0.0.1"], cwd=SP + "/docs",
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
URL = "http://127.0.0.1:8780/"
errs = []


def shot(pg, name, full=False):
    pg.wait_for_timeout(250)
    pg.screenshot(path=f"{OUT}/{name}.png", full_page=full)


def idb_put_many(pg, n, start_days_ago=60):
    # bulk-insert n old questions (no photos), all due, never reviewed
    pg.evaluate("""(n)=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');
      const subs=['mat','fen','tr','par','sos','din','ing'];
      for(let i=0;i<n;i++){s.put({id:'bulk'+i,subject:subs[i%7],topic:'Toplu soru '+(i+1),unit:'',grade:7,source:'Eski test',note:'Eski yanlış soru '+(i+1),mine:'B',correct:'C',reason:null,solution:i%5==0?'Önce paydaları eşitle.':'',qPhoto:null,oPhoto:null,sPhoto:null,createdAt:Date.now()-100000+i,date:'2026-09-01',stage:0,next:'2026-10-01',mastered:false,wrongCount:1,reviews:0})}
      t.oncomplete=()=>r()}})""", n)


try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, accept_downloads=True)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: errs.append("console: " + m.text) if m.type == "error" else None)
        pg.goto(URL)
        pg.wait_for_selector("#welcome:not([hidden])")
        shot(pg, "01-welcome")
        pg.click(".gradepick button:has-text('7')")
        pg.fill("#w-name", "Elif")
        pg.click("#welcome button:has-text('Başla')")
        pg.wait_for_selector("#welcome", state="hidden")
        pg.wait_for_selector(".hero")
        shot(pg, "02-home-empty")
        print("1 welcome ok; pill:", pg.inner_text("#gradePill"), "| greeting:", pg.inner_text(".greet h1"))

        # add via FAB -> file chooser (camera input)
        with pg.expect_file_chooser() as fc:
            pg.click("#fab")
        print("2 FAB opens camera input; capture:", fc.value.element.get_attribute("capture"))
        fc.value.set_files(PHOTO)
        pg.wait_for_selector("#editor:not([hidden])")
        pg.wait_for_function("document.getElementById('ed-busy').hidden===true", timeout=20000)
        pg.click("#ed-rotl"); pg.wait_for_timeout(200)
        pg.wait_for_function("document.getElementById('ed-busy').hidden===true", timeout=20000)
        pg.click("#ed-use")
        pg.wait_for_selector("#editor", state="hidden")
        shot(pg, "03-add-form")
        pg.click("#add .pick:has-text('Matematik')")
        opts = pg.evaluate("[...document.querySelectorAll('#i-topicSel optgroup')].map(g=>g.label+': '+[...g.children].map(o=>o.textContent).join(' | '))")
        print("3 topic groups (7. sınıf mat):", len(opts)); print("   ", opts[0]); print("   ", opts[-1])
        pg.select_option("#i-topicSel", "Rasyonel Sayılar ve Gösterimleri")
        pg.click("button.letter[aria-label='Doğru cevap C']")
        pg.click("button.letter[aria-label='Senin cevabın B']")
        pg.click("#add .pick:has-text('İşlem hatası')")
        shot(pg, "04-add-filled")
        # save & next: should save and re-open the camera chooser
        with pg.expect_file_chooser() as fc2:
            pg.click("#add button:has-text('Kaydet, yeni soru')")
        print("4 save&next reopened camera:", fc2.value.element.get_attribute("id"))
        fc2.value.set_files(SP + "/tests/test-question.jpg")
        pg.wait_for_selector("#editor:not([hidden])")
        pg.wait_for_function("document.getElementById('ed-busy').hidden===true", timeout=20000)
        pg.click("#ed-use"); pg.wait_for_selector("#editor", state="hidden")
        subj = pg.evaluate("[...document.querySelectorAll('#add .pick[aria-pressed=true]')].map(b=>b.textContent)")
        print("   subject kept for next question:", subj)
        pg.select_option("#i-topicSel", "__other")
        pg.fill("#i-topic", "İşlem önceliği karışık")
        pg.click("button.letter[aria-label='Doğru cevap D']")
        pg.click("#add .screen-foot button:has-text('Kaydet')>>nth=0")
        pg.wait_for_selector("#add", state="hidden")
        n_items = pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const a=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(a.result.map(x=>[x.subject,x.topic,x.unit,x.grade,x.correct,x.next]))}})""")
        print("5 saved:", n_items)

        # bulk import 40 old questions -> daily limits
        idb_put_many(pg, 40)
        pg.reload(); pg.wait_for_selector(".hero")
        print("6 hero:", pg.inner_text(".hero .num"), "|", pg.inner_text(".hero .sub"), "| badge:", pg.inner_text("#badge"))
        shot(pg, "05-home")
        shot(pg, "05-home-full", full=True)

        # daily PDF + results
        pg.click(".hero button:has-text('Günlük PDF')", timeout=8000)
        pg.wait_for_selector("#pdf .pages canvas", timeout=30000)
        shot(pg, "05b-daily-pdf")
        pg.click("#pdf button:has-text('PDF oluştur')")
        pg.wait_for_selector("#pdf button:has-text('İndir')", timeout=30000)
        with pg.expect_download() as dl0:
            pg.click("#pdf button:has-text('İndir')")
        dl0.value.save_as(OUT + "/daily.pdf")
        print("6b daily pdf:", dl0.value.suggested_filename, os.path.getsize(OUT + "/daily.pdf") // 1024, "KB")
        pg.click("#pdf .screen-top .iconbtn")
        pg.wait_for_selector("#pdf", state="hidden")
        pg.wait_for_selector("button:has-text('Sonuçları gir')")
        shot(pg, "05c-home-paper", full=True)
        pg.click("button:has-text('Sonuçları gir')")
        pg.wait_for_selector("#results:not([hidden]) .resrow")
        pg.click("#results button:has-text('Hepsi doğru')")
        pg.locator("#results .okbad button.bad").nth(2).click()
        shot(pg, "05d-results")
        print("6c results counter:", pg.inner_text("#results .counter"))
        pg.click("#results .screen-foot button")
        pg.wait_for_selector("#results", state="hidden", timeout=10000)
        st = pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes');const a=t.objectStore('mistakes').getAll();t.oncomplete=()=>r(a.result.filter(x=>x.lastReview).map(x=>[x.stage,x.next]))}})""")
        print("6d graded from paper:", len(st), "| stages/next:", sorted(set(map(tuple, st))))
        print("   hero after paper:", pg.inner_text(".hero"))

        # review session (reset today's grading so the queue has items)
        pg.evaluate("""()=>new Promise(r=>{const q=indexedDB.open('yanlis-defterim');q.onsuccess=()=>{const t=q.result.transaction('mistakes','readwrite');const s=t.objectStore('mistakes');s.getAll().onsuccess=e=>{for(const it of e.target.result){if(it.lastReview){delete it.lastReview;delete it.firstSeen;it.reviews=0;it.stage=0;it.next='2026-10-01';s.put(it)}}};t.oncomplete=()=>r()}})""")
        pg.evaluate("localStorage.removeItem('yd_daily')")
        pg.reload(); pg.wait_for_selector(".hero .num")
        pg.click(".hero button:has-text('Tekrara başla')")
        pg.wait_for_selector("#review:not([hidden])")
        shot(pg, "06-review")
        pg.click("#review button:has-text('cevabı göster')")
        shot(pg, "07-review-revealed")
        pg.click("#review button:has-text('Doğru çözdüm')")
        pg.wait_for_timeout(300)
        print("7 counter after 1:", pg.inner_text("#review .counter"))
        # back button closes review
        pg.go_back(); pg.wait_for_selector("#review", state="hidden", timeout=5000)
        print("8 back button closed review; hero now:", pg.inner_text(".hero .num"))

        # settings
        pg.click(".tab[data-v=ayarlar]")
        pg.wait_for_selector("#set-maxPerDay")
        shot(pg, "08-settings")
        pg.select_option("#set-maxPerDay", "5")
        pg.click(".tab[data-v=home]")
        print("9 hero with 5/day:", pg.inner_text(".hero .num"), "|", pg.inner_text(".hero .sub"))

        # defter + selection + pdf
        pg.click(".tab[data-v=defter]")
        pg.wait_for_selector(".item")
        shot(pg, "09-defter")
        pg.click("#v-defter button:has-text('Seç')")
        items = pg.locator(".item")
        for k in [0, 1, 4, 9, 2]:
            items.nth(k).click()
        shot(pg, "10-defter-select")
        print("10 selected:", pg.inner_text("#selCount"))
        pg.click("#selGo")
        pg.wait_for_selector("#pdf .pages canvas", timeout=30000)
        shot(pg, "11-pdf")
        pg.click("#pdf-key")  # toggle key off then on
        pg.wait_for_timeout(200)
        pg.click("#pdf-key")
        pg.click("#pdf .seg button:has-text('Derse göre')")
        pg.wait_for_selector("#pdf .pages canvas")
        pg.click("#pdf button:has-text('PDF oluştur')")
        pg.wait_for_selector("#pdf button:has-text('İndir')", timeout=30000)
        with pg.expect_download() as dl:
            pg.click("#pdf button:has-text('İndir')")
        path = OUT + "/test.pdf"
        dl.value.save_as(path)
        print("11 pdf saved:", dl.value.suggested_filename, os.path.getsize(path) // 1024, "KB")
        shot(pg, "12-pdf-ready")
        pg.go_back(); pg.wait_for_selector("#pdf", state="hidden", timeout=5000)
        print("12 back closed pdf")

        # analiz
        pg.click(".tab[data-v=analiz]")
        shot(pg, "13-analiz")

        # offline reopen
        ctx.set_offline(True)
        pg.reload(); pg.wait_for_selector("#v-analiz h1", timeout=10000)
        print("13 offline reload ok:", pg.inner_text("#v-analiz h1"), "| fonts:", pg.evaluate("document.fonts.check('600 16px Lexend')"))

        # dark mode look
        pg2 = ctx.new_page(color_scheme="dark") if False else None
        b.close()
finally:
    srv.terminate()
print("errors:", errs[:12])
