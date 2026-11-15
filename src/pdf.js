/* ---------- PDF test sheet ----------
   Layout is computed once in millimetres as a list of drawing operations per page; the same
   operations draw the on-screen preview (canvas) and the PDF (jsPDF), so they always match. */
var pdfState=null,imgCache={},PDF_PT=0.3528;
function loadScript(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;s.onload=res;s.onerror=function(){rej(new Error(src))};document.head.appendChild(s)})}
async function pdfLib(){
  if(!window.jspdf)await loadScript("lib/jspdf.umd.min.js");
  if(!window.PDF_FONTS)await loadScript("lib/pdf-fonts.js");
  return window.jspdf.jsPDF;
}
function newDoc(J){
  var doc=new J({unit:"mm",format:"a4",compress:true}),F=window.PDF_FONTS;
  doc.addFileToVFS("pf-r.ttf",F.regular);doc.addFont("pf-r.ttf","PF","normal");
  doc.addFileToVFS("pf-b.ttf",F.bold);doc.addFont("pf-b.ttf","PF","bold");
  doc.setFont("PF","normal");return doc;
}
function loadPdfOpt(){
  var d={title:"",cols:2,order:"sel",nameLine:true,space:false,key:true,labels:false,size:"m"};
  try{var o=JSON.parse(lsGet("pdfOpt")||"{}");Object.keys(d).forEach(function(k){if(o[k]!=null&&k!=="title")d[k]=o[k]})}catch(e){}
  return d;
}
function savePdfOpt(){var o=Object.assign({},pdfState.opt);delete o.title;lsSet("pdfOpt",JSON.stringify(o))}
function defaultTitle(){var d=new Date();return (pdfState&&pdfState.daily?"Günlük Tekrar":"Tekrar Testi")+" · "+d.getDate()+" "+MONTHS[d.getMonth()]+" "+d.getFullYear()}

/* Trim white margins around a cleaned photo so questions sit tightly on the page. */
async function prepImage(p){
  var key=p.id||p.data;if(imgCache[key])return imgCache[key];
  var src=photoSrc(p);if(!src)return null;
  var img=await loadImg(src),W=img.naturalWidth,H=img.naturalHeight;
  var s=Math.min(1,320/Math.max(W,H)),sw=Math.max(1,Math.round(W*s)),sh=Math.max(1,Math.round(H*s));
  var sc=document.createElement("canvas");sc.width=sw;sc.height=sh;var sx=sc.getContext("2d",{willReadFrequently:true});
  sx.fillStyle="#fff";sx.fillRect(0,0,sw,sh);sx.drawImage(img,0,0,sw,sh);
  var d=sx.getImageData(0,0,sw,sh).data,rows=new Int32Array(sh),cols=new Int32Array(sw),x,y;
  for(y=0;y<sh;y++)for(x=0;x<sw;x++){var i=(y*sw+x)*4;if((d[i]+d[i+1]+d[i+2])/3<200){rows[y]++;cols[x]++}}
  var tr=Math.max(1,Math.round(sw*0.004)),tc=Math.max(1,Math.round(sh*0.004)),y0=0,y1=sh-1,x0=0,x1=sw-1;
  while(y0<sh&&rows[y0]<tr)y0++;while(y1>y0&&rows[y1]<tr)y1--;
  while(x0<sw&&cols[x0]<tc)x0++;while(x1>x0&&cols[x1]<tc)x1--;
  var cx=0,cy=0,cw=W,ch=H;
  if(y0<y1&&x0<x1){
    var pad=Math.round(0.025*Math.max(sw,sh));
    var a=Math.max(0,x0-pad),b=Math.max(0,y0-pad),c=Math.min(sw,x1+pad+1),e=Math.min(sh,y1+pad+1);
    if((c-a)*(e-b)<0.92*sw*sh){cx=Math.round(a/s);cy=Math.round(b/s);cw=Math.min(W-cx,Math.round((c-a)/s));ch=Math.min(H-cy,Math.round((e-b)/s))}
  }
  var k=Math.min(1,1600/Math.max(cw,ch)),out=document.createElement("canvas");
  out.width=Math.max(1,Math.round(cw*k));out.height=Math.max(1,Math.round(ch*k));
  var ox=out.getContext("2d");ox.fillStyle="#fff";ox.fillRect(0,0,out.width,out.height);ox.drawImage(img,cx,cy,cw,ch,0,0,out.width,out.height);
  imgCache[key]={c:out,key:"im"+Object.keys(imgCache).length,tx:textHeight(out)};
  return imgCache[key];
}
/* Typical letter height in the photo (in its pixels), from the sizes of dark blobs that look like letters.
   Used to print every question with its text about as large as in the book. null when unsure. */
function textHeight(c){
  try{
    var k=Math.min(1,1000/Math.max(c.width,c.height)),W=Math.max(1,Math.round(c.width*k)),H=Math.max(1,Math.round(c.height*k));
    var t=document.createElement("canvas");t.width=W;t.height=H;var x=t.getContext("2d",{willReadFrequently:true});x.drawImage(c,0,0,W,H);
    var d=x.getImageData(0,0,W,H).data,n=W*H,lum=new Uint8Array(n),i;
    for(i=0;i<n;i++)lum[i]=(d[i*4]+d[i*4+1]+d[i*4+2])/3;
    var I=new Float64Array((W+1)*(H+1)),X,Y;
    for(Y=0;Y<H;Y++){var rs=0;for(X=0;X<W;X++){rs+=lum[Y*W+X];I[(Y+1)*(W+1)+X+1]=I[Y*(W+1)+X+1]+rs}}
    var R=12,ink=new Uint8Array(n);
    for(Y=0;Y<H;Y++)for(X=0;X<W;X++){
      var x0=Math.max(0,X-R),y0=Math.max(0,Y-R),x1=Math.min(W,X+R+1),y1=Math.min(H,Y+R+1);
      var m=(I[y1*(W+1)+x1]-I[y0*(W+1)+x1]-I[y1*(W+1)+x0]+I[y0*(W+1)+x0])/((x1-x0)*(y1-y0)),v=lum[Y*W+X];
      if(v<170&&v<m*0.82)ink[Y*W+X]=1;
    }
    var seen=new Uint8Array(n),stack=new Int32Array(n),hs=[];
    for(i=0;i<n;i++){
      if(!ink[i]||seen[i])continue;
      var sp=0,cnt=0,minx=W,maxx=0,miny=H,maxy=0;stack[sp++]=i;seen[i]=1;
      while(sp){
        var q=stack[--sp],qx=q%W,qy=(q-qx)/W;cnt++;
        if(qx<minx)minx=qx;if(qx>maxx)maxx=qx;if(qy<miny)miny=qy;if(qy>maxy)maxy=qy;
        for(var dy=-1;dy<=1;dy++){var ny=qy+dy;if(ny<0||ny>=H)continue;for(var dx=-1;dx<=1;dx++){var nx=qx+dx;if(nx<0||nx>=W)continue;var j=ny*W+nx;if(ink[j]&&!seen[j]){seen[j]=1;stack[sp++]=j}}}
      }
      var bw=maxx-minx+1,bh=maxy-miny+1;
      if(bh>=5&&bh<=H*0.08&&bw>=2&&bw<=bh*4+2&&cnt>=8){var f=cnt/(bw*bh);if(f>0.08&&f<0.95)hs.push(bh)}
    }
    if(hs.length<25)return null;
    hs.sort(function(a,b){return a-b});var med=hs[hs.length>>1];
    var hs2=hs.filter(function(h){return h>=med*0.5&&h<=med*2.2});if(hs2.length<20)return null;
    return hs2[hs2.length>>1]/k;
  }catch(e){return null}
}
var LETTER_MM={s:2.0,m:2.5,l:3.0};
function orderedItems(){
  var list=pdfState.ids.map(byId).filter(Boolean),o=pdfState.opt;
  if(o.order==="subject"){var rank={};SUBJECTS.forEach(function(s,i){rank[s.k]=i});list=list.map(function(it,i){return {it:it,i:i}}).sort(function(a,b){return (rank[a.it.subject]-rank[b.it.subject])||(a.i-b.i)}).map(function(x){return x.it})}
  else if(o.order==="shuffle"){
    if(!pdfState.shuffled||pdfState.shuffled.length!==list.length){var arr=list.map(function(it){return it.id});for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t}pdfState.shuffled=arr}
    list=pdfState.shuffled.map(byId).filter(Boolean);
  }
  return list;
}
function layoutPdf(doc){
  var o=pdfState.opt,list=orderedItems(),PW=210,PH=297,M=12,cols=o.cols,gut=8;
  var colW=(PW-2*M-(cols-1)*gut)/cols,numW=7.5,imgW=colW-numW;
  var bottom=PH-M-8,pages=[],page,top,col,y,n=0,title=(o.title||"").trim()||defaultTitle();
  var ink="#141834",soft="#6B7290",faint="#C9CEDD";
  function T(p,x,yy,str,pt,bold,color,align){p.ops.push({t:"text",x:x,y:yy,s:str,pt:pt,b:!!bold,c:color||ink,a:align||"left"})}
  function startPage(){
    page={ops:[]};pages.push(page);
    if(pages.length===1){
      T(page,M,M,title,15,true);
      var sub=list.length+" soru"+(S.grade?" · "+S.grade+". sınıf":"");T(page,PW-M,M+1.4,sub,9,false,soft,"right");
      if(o.nameLine){
        var ly=M+13;
        T(page,M,ly,"Ad Soyad",9,false,soft);page.ops.push({t:"line",x1:M+17,y1:ly+3.6,x2:M+86,y2:ly+3.6,c:faint,w:.3});
        T(page,M+92,ly,"Tarih",9,false,soft);page.ops.push({t:"line",x1:M+102,y1:ly+3.6,x2:M+132,y2:ly+3.6,c:faint,w:.3});
        T(page,M+138,ly,"Doğru",9,false,soft);page.ops.push({t:"line",x1:M+150,y1:ly+3.6,x2:M+168,y2:ly+3.6,c:faint,w:.3});T(page,M+169,ly,"/ "+list.length,9,false,soft);
        top=M+23;
      }else top=M+12;
      page.ops.push({t:"line",x1:M,y1:top-4,x2:PW-M,y2:top-4,c:"#DDE1EB",w:.35});
    }else{
      T(page,M,M-1,title,8.5,false,soft);
      page.ops.push({t:"line",x1:M,y1:M+4,x2:PW-M,y2:M+4,c:"#DDE1EB",w:.3});
      top=M+9;
    }
    page.top=top;col=0;y=top;
  }
  var bandTop,colMax,dividers=[];
  function closeBand(){if(cols===2&&col===1)dividers.push({p:page,y1:bandTop-1,y2:Math.max(colMax[0],colMax[1])-5})}
  function startBand(yy){bandTop=yy;col=0;y=yy;colMax=[yy,yy]}
  var _sp=startPage;startPage=function(){if(page)closeBand();_sp();startBand(top)};
  function nextCol(){if(col<cols-1){col++;y=bandTop}else startPage()}
  var fullW=PW-2*M-numW,letter=LETTER_MM[o.size]||LETTER_MM.m;
  /* natural width: the question's letters print about as tall as in the book */
  function natW(im){return im.tx?im.c.width*letter/im.tx:null}
  startPage();
  var maxTop=top,lastSub=null;
  for(var bi=0;bi<list.length;bi++){
    var it=list[bi],x;
    if(o.order==="subject"&&it.subject!==lastSub){
      lastSub=it.subject;
      if(y+9+30>bottom){if(y>bandTop)nextCol();if(y+9+30>bottom&&y>page.top)startPage()}
      x=M+col*(colW+gut);
      T(page,x,y,subjName(it.subject,it.grade).toLocaleUpperCase("tr"),9.5,true,ink);
      page.ops.push({t:"line",x1:x,y1:y+5.2,x2:x+colW,y2:y+5.2,c:ink,w:.4});
      y+=9;
    }
    n++;
    var lab=o.labels?5:0,sp=o.space?(cols===2?38:52):0,ch,w=0,h=0,lines=null,im=it.qPhoto?imgCache[it.qPhoto.id||it.qPhoto.data]:null;
    var maxH=bottom-maxTop-lab-sp-2,span=false,boxW=imgW;
    if(im){
      var r=im.c.height/im.c.width,nw=natW(im);
      if(nw==null)w=cols===2?imgW:Math.min(fullW,120);
      else if(cols===2&&nw>imgW*1.15){span=true;w=Math.min(nw,fullW)}
      else w=Math.max(Math.min(nw,cols===2?imgW:fullW),Math.min(45,cols===2?imgW:fullW));
      h=w*r;if(h>maxH){h=maxH;w=h/r}ch=h;
    }
    else{doc.setFont("PF","normal");doc.setFontSize(10.5);lines=doc.splitTextToSize(it.note||"(Bu sorunun fotoğrafı yok.)",cols===2?imgW:Math.min(fullW,150));ch=lines.length*10.5*PDF_PT*1.4}
    if(span||cols===1)boxW=cols===2?fullW:Math.min(fullW,Math.max(w,120));
    var total=lab+ch+sp;
    if(span){
      var ys=Math.max(colMax[0],colMax[1],y);
      if(ys+total>bottom&&ys>page.top){startPage();ys=top}
      closeBand();x=M;y=ys;
    }else{
      if(y+total>bottom){if(y>bandTop)nextCol();if(y+total>bottom&&y>page.top)startPage()}
      x=M+col*(colW+gut);
    }
    T(page,x,y+lab,n+".",11,true,ink);
    if(o.labels)T(page,x+numW,y,subjName(it.subject,it.grade)+" · "+(it.topic||""),7.5,false,soft);
    if(im)page.ops.push({t:"img",x:x+numW,y:y+lab,w:w,h:h,im:im});
    else lines.forEach(function(ln,li){T(page,x+numW,y+lab+li*10.5*PDF_PT*1.4,ln,10.5,false,ink)});
    if(sp){page.ops.push({t:"rect",x:x+numW,y:y+lab+ch+2,w:boxW,h:sp-4,c:"#D5DAE6",w2:.3,dash:true});T(page,x+numW+2,y+lab+ch+3.5,"Çözüm",7,false,"#A0A6BA")}
    if(span)startBand(y+total+8);
    else{y+=total+8;colMax[col]=Math.max(colMax[col],y)}
  }
  closeBand();
  dividers.forEach(function(dv){if(dv.y2>dv.y1+4)dv.p.ops.unshift({t:"line",x1:M+colW+gut/2,y1:dv.y1,x2:M+colW+gut/2,y2:dv.y2,c:"#E3E6EF",w:.3})});
  if(o.key){
    var kp={ops:[],key:true};pages.push(kp);
    T(kp,M,M,"Cevap Anahtarı",15,true);T(kp,M,M+8,title,9,false,soft);
    kp.ops.push({t:"line",x1:M,y1:M+15,x2:PW-M,y2:M+15,c:"#DDE1EB",w:.35});
    var per=5,cw=(PW-2*M)/per,ry=M+21;
    list.forEach(function(it,i){
      var cx=M+(i%per)*cw,cy=ry+Math.floor(i/per)*9;
      T(kp,cx,cy,(i+1)+".",11,true,ink);T(kp,cx+9,cy,it.correct||"–",11,false,it.correct?"#C8322F":soft);
    });
    var rowsN=Math.ceil(list.length/per),ny=ry+rowsN*9+6;
    var withNotes=list.map(function(it,i){return {n:i+1,s:(it.solution||"").trim()}}).filter(function(x){return x.s});
    if(withNotes.length&&ny<bottom-20){
      T(kp,M,ny,"Çözüm notları",10,true,ink);ny+=7;
      doc.setFont("PF","normal");doc.setFontSize(9);
      for(var k=0;k<withNotes.length;k++){
        var ls=doc.splitTextToSize(withNotes[k].n+". "+withNotes[k].s,PW-2*M);
        if(ny+ls.length*4.6>bottom){T(kp,M,ny,"…",9,false,soft);break}
        ls.forEach(function(l2){T(kp,M,ny,l2,9,false,ink);ny+=4.6});ny+=1.5;
      }
    }
  }
  pages.forEach(function(p,i){T(p,M,PH-M+1,"Yanlış Defterim",7.5,false,"#A0A6BA");T(p,PW-M,PH-M+1,"Sayfa "+(i+1)+" / "+pages.length,7.5,false,"#A0A6BA","right")});
  return pages;
}
function drawPageCanvas(page,canvas,wpx){
  var s=wpx/210;canvas.width=Math.round(wpx);canvas.height=Math.round(297*s);
  var x=canvas.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,canvas.width,canvas.height);x.textBaseline="top";
  page.ops.forEach(function(op){
    if(op.t==="text"){x.fillStyle=op.c;x.font=(op.b?"600 ":"400 ")+(op.pt*PDF_PT*s)+"px Lexend, sans-serif";x.textAlign=op.a;x.fillText(op.s,op.x*s,op.y*s)}
    else if(op.t==="line"){x.strokeStyle=op.c;x.lineWidth=Math.max(.6,op.w*s);x.setLineDash([]);x.beginPath();x.moveTo(op.x1*s,op.y1*s);x.lineTo(op.x2*s,op.y2*s);x.stroke()}
    else if(op.t==="rect"){x.strokeStyle=op.c;x.lineWidth=Math.max(.6,op.w2*s);x.setLineDash(op.dash?[2*s,1.5*s]:[]);x.strokeRect(op.x*s,op.y*s,op.w*s,op.h*s);x.setLineDash([])}
    else if(op.t==="img"){x.drawImage(op.im.c,op.x*s,op.y*s,op.w*s,op.h*s)}
  });
}
function openPdf(ids,o){
  if(!ids||!ids.length){toast("Bugün PDF'e konacak soru yok.");return}
  pdfState={ids:ids.slice(),opt:loadPdfOpt(),daily:!!(o&&o.daily),shuffled:null,pages:null,ready:false,busy:false,file:null,err:null};
  if(pdfState.daily&&pdfState.opt.order==="sel")pdfState.opt.order="sel";
  if(o&&o.title)pdfState.opt.title=o.title;
  $("#pdf").hidden=false;pushLayer("pdf",closePdf);renderPdf();preparePdf();
}
function closePdf(){pdfState=null;$("#pdf").hidden=true;uiClosed("pdf");render()}
async function preparePdf(){
  var me=pdfState;
  try{
    var J=await pdfLib();if(pdfState!==me)return;
    me.doc=newDoc(J);
    var list=me.ids.map(byId).filter(Boolean);
    for(var i=0;i<list.length;i++){if(list[i].qPhoto){try{await prepImage(list[i].qPhoto)}catch(e){}}if(pdfState!==me)return}
    me.ready=true;relayout();
  }catch(e){me.err="PDF aracı yüklenemedi. İnternet açıkken uygulamayı bir kez açıp kapat, sonra tekrar dene.";renderPdf()}
}
function relayout(){
  if(!pdfState||!pdfState.ready)return;
  pdfState.pages=layoutPdf(pdfState.doc);pdfState.file=null;renderPdf();
}
function pdfOptChanged(){if(!pdfState)return;savePdfOpt();relayout()}
function renderPdf(){
  var P=pdfState;if(!P)return;
  var box=$("#pdf"),sb=$("#pdf .screen-body"),sy=sb?sb.scrollTop:0;box.replaceChildren();
  var top=el("div","screen-top");top.appendChild(iconButton(ICONS.close,"Kapat",closePdf));top.appendChild(el("h2",null,P.daily?"Günlük PDF":"PDF hazırla"));top.appendChild(el("span","counter",P.ids.length+" soru"));box.appendChild(top);
  var body=el("div","screen-body"),w=el("div","in");body.appendChild(w);box.appendChild(body);
  var o=P.opt,c=el("div","card optgrid");
  var g0=group("Başlık");var ti=el("input","field");ti.id="pdf-title";ti.placeholder=defaultTitle();ti.value=o.title;
  ti.addEventListener("change",function(){o.title=ti.value;relayout()});g0.appendChild(ti);c.appendChild(g0);
  function seg(label,key,opts,cls){
    var g=group(label);var s=el("div","seg"+(cls?" "+cls:""));
    opts.forEach(function(op){var b=el("button",null,op[1]);b.type="button";b.setAttribute("aria-pressed",String(o[key]===op[0]));b.addEventListener("click",function(){o[key]=op[0];if(key==="order"&&op[0]==="shuffle")P.shuffled=null;pdfOptChanged()});s.appendChild(b)});
    g.appendChild(s);return g;
  }
  c.appendChild(seg("Düzen","cols",[[2,"İki sütun"],[1,"Tek sütun"]],"two"));
  var sz=seg("Yazı boyutu","size",[["s","Küçük"],["m","Kitaptaki gibi"],["l","Büyük"]]);
  sz.appendChild(el("p","muted small","Her sorunun yazısı seçilen boyutta basılır. Geniş sorular iki sütuna yayılır, küçük sorular aynı sayfaya sığar."));c.appendChild(sz);
  c.appendChild(seg("Sıra","order",[["sel",P.daily?"Günün sırası":"Seçtiğim sıra"],["subject","Derse göre"],["shuffle","Karışık"]]));
  function cb(label,key){var r=el("label","ctl");var i=el("input");i.type="checkbox";i.id="pdf-"+key;i.checked=!!o[key];i.addEventListener("change",function(){o[key]=i.checked;pdfOptChanged()});r.appendChild(el("span",null,label));r.appendChild(i);return r}
  c.appendChild(cb("Ad, tarih ve doğru sayısı satırı","nameLine"));
  c.appendChild(cb("Her sorunun altına çözüm boşluğu","space"));
  c.appendChild(cb("Sorunun üstüne ders ve konu yaz","labels"));
  c.appendChild(cb("Sona cevap anahtarı ekle","key"));
  w.appendChild(c);
  var pv=el("div","stack");pv.style.gap="8px";
  var hd=el("div","row between");hd.appendChild(el("h3",null,"Önizleme"));
  if(P.pages)hd.appendChild(el("span","muted small",P.pages.length+" sayfa"+(o.key?" · son sayfa cevap anahtarı":"")));
  pv.appendChild(hd);
  if(P.err)pv.appendChild(el("p","notice",P.err));
  else if(!P.pages)pv.appendChild(el("p","notice","Sayfalar hazırlanıyor…"));
  else{
    var row=el("div","pages");
    P.pages.forEach(function(pg,i){
      var b=el("button");b.type="button";b.setAttribute("aria-label","Sayfa "+(i+1)+", büyütmek için dokun");
      var cv=el("canvas");drawPageCanvas(pg,cv,300);b.appendChild(cv);b.appendChild(el("span",null,pg.key?"Cevap anahtarı":"Sayfa "+(i+1)));
      b.addEventListener("click",function(){var big=el("canvas");drawPageCanvas(pg,big,1240);openLightbox(big.toDataURL("image/jpeg",0.9))});
      row.appendChild(b);
    });
    pv.appendChild(row);
    pv.appendChild(el("p","muted small","Sayfaya dokunarak büyütebilirsin. Kenarlardaki boşluklar otomatik kırpılır. Bir soru hâlâ çok küçük ya da çok büyükse fotoğrafını Düzenle → Temizle ile kırp; soru dışındaki kısımlar kalmasın."));
  }
  w.appendChild(pv);
  var osh=P.daily&&!P.file?dailySheet():null;
  if(osh&&osh.open.length){var wn=el("div","callout warn");wn.appendChild(el("b",null,"Önceki kâğıdın sonuçları girilmedi"));
    wn.appendChild(el("span",null,(osh.old?shortDate(osh.date)+" tarihli ":"")+"kâğıttaki "+osh.open.length+" sorunun sonucu bekliyor. Sonuçlar girilmezse o sorular ilerlemez ve tekrar tekrar gelir."));
    var rb=el("button","linkbtn","Önce sonuçları gir");rb.type="button";rb.addEventListener("click",function(){closePdf();openResults()});wn.appendChild(rb);w.appendChild(wn)}
  if(P.daily)w.appendChild(el("p","notice",P.file?"Yazdırıp kâğıtta çözdükten sonra Bugün ekranındaki “Sonuçları gir” ile her sorunun sonucunu işaretle.":"Günün soruları: önce zamanı gelen tekrarlar, kalan yer sıradaki yeni sorularla dolar. PDF'i oluşturunca Bugün ekranında kâğıttaki numaralarla “Sonuçları gir” çıkar."));
  var foot=el("div","screen-foot"),fin=el("div","in");foot.appendChild(fin);
  if(P.file){
    fin.appendChild(btn("ghost","İndir",function(){downloadFile(P.file)},ICONS.down));
    fin.appendChild(btn("primary","Paylaş / Yazdır",function(){shareFile(P.file)},ICONS.share));
  }else{
    var mk=btn("primary",P.busy?"PDF oluşturuluyor…":"PDF oluştur",makePdf,ICONS.pdf);mk.disabled=!P.pages||P.busy;fin.appendChild(mk);
  }
  box.appendChild(foot);
  var nb=$("#pdf .screen-body");if(nb)nb.scrollTop=sy;
}
async function makePdf(){
  var P=pdfState;if(!P||!P.pages||P.busy)return;
  P.busy=true;renderPdf();
  try{
    var J=await pdfLib(),doc=newDoc(J),pages=layoutPdf(doc),added={};
    pages.forEach(function(pg,i){
      if(i)doc.addPage();
      pg.ops.forEach(function(op){
        if(op.t==="text"){doc.setFont("PF",op.b?"bold":"normal");doc.setFontSize(op.pt);doc.setTextColor(op.c);doc.text(op.s,op.x,op.y,{baseline:"top",align:op.a==="right"?"right":"left"})}
        else if(op.t==="line"){doc.setDrawColor(op.c);doc.setLineWidth(op.w);doc.setLineDashPattern([],0);doc.line(op.x1,op.y1,op.x2,op.y2)}
        else if(op.t==="rect"){doc.setDrawColor(op.c);doc.setLineWidth(op.w2);doc.setLineDashPattern(op.dash?[1.6,1.2]:[],0);doc.rect(op.x,op.y,op.w,op.h);doc.setLineDashPattern([],0)}
        else if(op.t==="img"){
          var c=op.im.c,tw=Math.min(c.width,Math.round(op.w/25.4*220));
          if(!added[op.im.key]){
            var src=c;if(tw<c.width){src=document.createElement("canvas");src.width=tw;src.height=Math.max(1,Math.round(c.height*tw/c.width));src.getContext("2d").drawImage(c,0,0,src.width,src.height)}
            added[op.im.key]=src.toDataURL("image/jpeg",0.86);
          }
          doc.addImage(added[op.im.key],"JPEG",op.x,op.y,op.w,op.h,op.im.key,"FAST");
        }
      });
    });
    var blob=doc.output("blob"),t=((P.opt.title||"").trim()||(P.daily?"Günlük Tekrar":"Tekrar Testi"));
    var name=t.replace(/[\\/:*?"<>|]+/g,"").replace(/\s+/g," ").trim().slice(0,60)+" "+todayStr()+".pdf";
    P.file=new File([blob],name,{type:"application/pdf"});
    if(P.daily)lsSet("daily",JSON.stringify({date:todayStr(),ids:orderedItems().map(function(i){return i.id})}));
    toast("PDF hazır: "+pages.length+" sayfa.");
  }catch(e){toast("PDF oluşturulamadı. Tekrar dene.")}
  P.busy=false;renderPdf();
}
async function shareFile(file){
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:file.name});return}
  }catch(e){if(e&&e.name==="AbortError")return}
  downloadFile(file);
}
function downloadFile(file){
  var a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},8000);
  toast("PDF indirildi. İndirilenler klasöründe bulabilirsin.");
}
