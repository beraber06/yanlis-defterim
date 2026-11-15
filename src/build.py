import sys, pathlib

# Depo kökü; kaynaklar src/ içinde, yayınlanan site docs/ içinde.
SP = pathlib.Path(__file__).resolve().parent.parent
B = SP / "src"
old = (B / "temel.html").read_text(encoding="utf-8")


def between(s, a, b):
    i = s.index(a)
    j = s.index(b, i)
    return s[i:j]


def rep(s, a, b, count=1):
    n = s.count(a)
    if n != count:
        sys.exit(f"expected {count}, found {n}: {a[:90]!r}")
    return s.replace(a, b)


editor_html = between(old, '<div id="editor" class="editor"', '<div id="toast"').rstrip() + "\n"
photos_js = between(old, "/* ---------- photos ---------- */", "/* ---------- form ---------- */")
editor_js = between(old, "/* ---------- photo cleaner ---------- */", "/* ---------- AI help (Google Gemini, free tier) ---------- */")
ai_js = between(old, "/* ---------- AI help (Google Gemini, free tier) ---------- */", "/* ---------- stats ---------- */")
store_js = between(old, "/* ---------- local storage (IndexedDB) ---------- */", "/* ---------- boot ---------- */")

# --- adapt reused blocks ---
ai_js = rep(ai_js, "Önce Durum bölümünden", "Önce Ayarlar bölümünden")
ai_js = rep(ai_js, "Durum bölümünden anahtarı", "Ayarlar bölümünden anahtarı")
ai_js = rep(ai_js, 'function softForm(){if(view==="ekle"&&!ed)renderForm()}', "function softForm(){if(addOpen&&!ed)renderForm()}")
ai_js = rep(ai_js, '{type:"text",text:AI_PROMPT}', '{type:"text",text:aiPrompt()}')
ai_js = rep(ai_js, "if(a.topic&&!form.topic.trim())form.topic=a.topic;", "if(a.topic&&!form.topic.trim())setTopicFromText(a.topic,form.sub||a.subject);")
ai_js = rep(ai_js, "renderStats()", "renderSettings()", count=4)
# eraser: brush by default; new photos are cropped automatically (undo: Kırp -> Tüm fotoğraf)
editor_js = rep(editor_js, 'crop:null,brush:22,tool:"tap"}}', 'crop:null,brush:22,tool:"brush"}}')
editor_js = rep(editor_js, "  ed={k:k,raw:raw,isOrig:isOrig,s:st,mode:\"clean\",", "  st.tool=\"brush\";\n  ed={k:k,raw:raw,isOrig:isOrig,s:st,mode:\"clean\",")
editor_js = rep(editor_js, '    process();$("#ed-busy").hidden=true;draw();', '    process();\n    if(!form[k+"Ed"]&&!st.crop){var ac=autoCropRect(ed);if(ac){ed.s.crop=ac;ed.autoCrop=true;toast("Soru otomatik kırpıldı. Beğenmezsen Kırp → Tüm fotoğraf.")}}\n    $("#ed-busy").hidden=true;draw();')
editor_js = rep(editor_js, """  var had=ed.s.strokes.length||ed.s.crop;
  ed.s.rot=((ed.s.rot||0)+dir+4)%4;ed.s.strokes=[];ed.s.crop=null;ed.draft=null;
  heavy(function(){buildOrig();process()});""", """  var auto=!!ed.autoCrop||(!ed.s.crop&&!ed.userUncrop),had=ed.s.strokes.length||(ed.s.crop&&!ed.autoCrop);
  ed.s.rot=((ed.s.rot||0)+dir+4)%4;ed.s.strokes=[];ed.s.crop=null;ed.draft=null;
  heavy(function(){buildOrig();process();if(auto){var ac=autoCropRect(ed);ed.s.crop=ac;ed.autoCrop=!!ac}});""")
editor_js = rep(editor_js, '  ed.s.crop={x:r.x,y:r.y,w:r.w,h:r.h};setMode("clean");toast("Kırpıldı.");', '  ed.s.crop={x:r.x,y:r.y,w:r.w,h:r.h};ed.autoCrop=false;setMode("clean");toast("Kırpıldı.");')
editor_js = rep(editor_js, '$("#ed-uncrop").addEventListener("click",function(){ed.s.crop=null;ed.draft=null;draw()});', '$("#ed-uncrop").addEventListener("click",function(){ed.s.crop=null;ed.autoCrop=false;ed.userUncrop=true;ed.draft=null;draw()});')

# circled choice = the student's answer, arrow = the correct answer; erased questions have neither
ai_js = rep(ai_js, '"Task 3. Give subject as one code:', '"Task 2b. If no hand-drawn arrow shows the correct answer (for example the marks were erased), solve the question yourself and give the letter of your answer as solved, but only when you are confident; otherwise, and whenever there is an arrow, give an empty string.",\n"Task 3. Give subject as one code:')
ai_js = rep(ai_js, "correct:{type:\"string\"},marked:", "correct:{type:\"string\"},solved:{type:\"string\"},marked:")
ai_js = rep(ai_js, "return {correct:cor,marked:mk,", "return {correct:cor,solved:cor?null:toLetter(r.solved),marked:mk,")
ai_js = rep(ai_js, 'form.ai={state:"done",correct:a.correct,marked:a.marked};', 'form.ai={state:"done",correct:a.correct,marked:a.marked,solved:a.solved};')
ai_js = rep(ai_js, '''  if(!a.correct&&!a.marked.length){box.appendChild(el("span",null,"Fotoğrafta ok ya da işaret bulunamadı. Cevapları aşağıdan seç."));return box}''', '''  if(!a.correct&&a.solved){
    box.appendChild(el("span",null,"Fotoğrafta doğru cevabı gösteren ok yok."+(a.marked.length?" Yuvarlak içindeki (işaretlenen): "+a.marked.join(", ")+".":"")+" Yapay zekâ soruyu çözdü: cevap muhtemelen "+a.solved+". Kitabın cevap anahtarından kontrol et."));
    if(form.correct!==a.solved){var ub=el("button","linkbtn",a.solved+" doğru cevap olsun");ub.type="button";ub.addEventListener("click",function(){form.correct=a.solved;renderForm()});box.appendChild(ub)}
    return box;
  }
  if(!a.correct&&!a.marked.length){box.appendChild(el("span",null,"Fotoğrafta işaret yok. Doğru cevabı kitabın cevap anahtarından seç; boş bırakırsan tekrarda da girebilirsin."));return box}''')
ai_js = rep(ai_js, "/* --- settings card (Durum) --- */", "/* --- settings card (Ayarlar) --- */")
store_js = rep(store_js, "renderStats()", "renderSettings()", count=4)
store_js = rep(store_js, "Durum bölümünden", "Ayarlar bölümünden", count=2)
store_js = rep(store_js, '["qPhoto","oPhoto","sPhoto"].forEach', '["qPhoto","oPhoto","sPhoto","tipAudio"].forEach')
store_js = rep(store_js, 'var keys=["qPhoto","oPhoto","sPhoto"];', 'var keys=["qPhoto","oPhoto","sPhoto","tipAudio"];')
store_js = rep(store_js, "items:all,photos:photos}", "items:all,photos:photos,exams:loadExams()}")
store_js = rep(store_js, "  await db.notify();\n  return n;", "  if(Array.isArray(data.exams))mergeExams(data.exams);\n  await db.notify();\n  return n;")
editor_html = editor_html.replace(' style="min-height:40px;padding:6px 14px"', "")
editor_html = rep(editor_html, 'class="btn ghost" type="button" id="ed-cancel"', 'class="btn ghost sm" type="button" id="ed-cancel"')

overrides = r'''
/* ---------- back button support for the photo cleaner and the viewer ---------- */
var _openEditor=openEditor;openEditor=function(k){pushLayer("editor",function(){if(ed)cancelEditor()});return _openEditor(k)};
var _closeEditor=closeEditor;closeEditor=function(){_closeEditor();uiClosed("editor")};
var _openLb=openLightbox;openLightbox=function(src){_openLb(src);pushLayer("lightbox",closeLightbox)};
var _closeLb=closeLightbox;closeLightbox=function(){_closeLb();uiClosed("lightbox")};
$("#lb-close").removeEventListener("click",_closeLb);$("#lb-close").addEventListener("click",function(){closeLightbox()});
'''

boot = r'''
/* ---------- boot ---------- */
var h0=(location.hash||"").replace("#","");
go(VIEWS.indexOf(h0)>=0?h0:"home");
if(!S.grade)showWelcome();
(async function init(){
  try{var idb=await idbOpen();idbHandle=idb;db=makeLocalDB(idb);assets=makeLocalAssets(idb)}
  catch(e){storeState="none";render();return}
  try{if(navigator.storage&&navigator.storage.persisted)navigator.storage.persisted().then(function(p){if(!p&&navigator.storage.persist)return navigator.storage.persist()}).catch(function(){})}catch(e){}
  col=db.collection("mistakes");
  col.orderBy("createdAt","desc").onSnapshot(function(snap){
    items=snap.docs.map(function(d){var o=Object.assign({},d.data());o.id=d.id;return o});
    storeState="ready";
    if(sel.on)sel.ids=sel.ids.filter(function(id){return byId(id)});
    render(true);
    if(!bootDone){bootDone=true;maybeAutoRepair()}
  },function(err){storeState="error";render()});
})();
'''

head = (B / "head.html").read_text(encoding="utf-8")
head = rep(head, "{{LOGO_MARK}}", (B / "logo_mark.svg").read_text())
head = rep(head, "{{EDITOR_HTML}}", editor_html)
core = (B / "core.js").read_text(encoding="utf-8")
core = rep(core, "{{LOGO_TILE}}", (B / "logo_tile.svg").read_text().replace("'", "\\'"))
js = ("<script>\n(function(){\n\"use strict\";\n" + (B / "mufredat.js").read_text(encoding="utf-8") + "\n" + core + "\n" + photos_js +
      editor_js + overrides + ai_js + (B / "pdf.js").read_text(encoding="utf-8") + "\n" + (B / "features.js").read_text(encoding="utf-8") + "\n" + store_js + boot +
      "})();\nif(\"serviceWorker\" in navigator&&location.protocol!==\"file:\"){window.addEventListener(\"load\",function(){var t0=Date.now(),had=!!navigator.serviceWorker.controller,done=false;navigator.serviceWorker.addEventListener(\"controllerchange\",function(){if(!had||done)return;done=true;if(Date.now()-t0<15000&&!document.querySelector(\".screen:not([hidden]),.overlay:not([hidden])\"))location.reload();else if(typeof toast===\"function\")toast(\"Yeni sürüm yüklendi. Uygulamayı kapatıp açınca görünür.\")});navigator.serviceWorker.register(\"sw.js\",{updateViaCache:\"none\"}).then(function(r){try{r.update()}catch(e){}}).catch(function(){})})}\n</script>\n</body>\n</html>\n")
out = head + js
for bad in ["{{", "renderStats()", "view===\"ekle\""]:
    if bad in out.replace("renderStats(){", ""):
        if bad == "renderStats()" and out.count("renderStats()") == out.count("renderStats();") and False:
            pass
(SP / "docs" / "index.html").write_text(out, encoding="utf-8")
print("ok", len(out))
