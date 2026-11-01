/* OrizonDrone — animations de la page d'accueil (hero scan, séquence au scroll, comparateur) */
(function(){
var REDUCE=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function clamp(x,a,b){a=a||0;b=(b===undefined)?1:b;return Math.max(a,Math.min(b,x));}
function eo(x){return 1-Math.pow(1-x,3);} function eio(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
var seed=11;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
function loadImg(src,cb){var i=new Image();i.onload=function(){cb(i);};i.src=src;return i;}
function coverRect(img,W,H,fx,fy){var r=Math.max(W/img.width,H/img.height),w=img.width*r,h=img.height*r;return{x:(W-w)*fx,y:(H-h)*fy,w:w,h:h};}
// échantillonne une image en points colorés, dans le repère du canvas
function samplePoints(img,R,W,H,g,dens){
  var tw=Math.ceil(W/g),th=Math.ceil(H/g),c=document.createElement('canvas');c.width=tw;c.height=th;
  var x=c.getContext('2d');x.drawImage(img,R.x/g,R.y/g,R.w/g,R.h/g);
  var d=x.getImageData(0,0,tw,th).data,P=[];
  for(var y=0;y<th;y++)for(var i=0;i<tw;i++){var k=(y*tw+i)*4,s=d[k]+d[k+1]+d[k+2];if(s<20)continue;var l=s/765;
    if(rnd()<dens*(.3+l*.7))P.push({x:i*g+(rnd()-.5)*g,y:y*g+(rnd()-.5)*g,l:l,r:d[k],g:d[k+1],b:d[k+2]});}
  return P;
}
function ptColor(q,a){return 'rgba('+((50+q.r*.35)|0)+','+((185+q.g*.27)|0)+','+((170+q.b*.3)|0)+','+a+')';}
function fitCanvas(cv){var dpr=Math.min(window.devicePixelRatio||1,2),W=cv.clientWidth,H=cv.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);var ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx:ctx,W:W,H:H};}

/* ========== HERO : nuage de points → modèle texturé ========== */
(function(){
  var cv=document.getElementById('hx-cv');if(!cv)return;
  var hero=document.getElementById('hero'),lbl=document.createElement('div');lbl.className='hx-scanlbl';hero.appendChild(lbl);
  var img,S,R,P=[],t0=0,done=false;
  function layout(){S=fitCanvas(cv);var mob=S.W<=760;R=coverRect(img,S.W,S.H,mob?.5:.62,.5);P=samplePoints(img,R,S.W,S.H,mob?4:5,1);}
  function draw(now){
    if(!t0)t0=now;var t=(now-t0)/1000,c=S.ctx,W=S.W,H=S.H;
    var p=REDUCE?1:clamp((t-.4)/3.6),e=eio(p),scan=e*(H+80)-40,z=1+(REDUCE?0:Math.min(t,40)*.0018);
    c.clearRect(0,0,W,H);c.save();c.translate(W*.6,H*.5);c.scale(z,z);c.translate(-W*.6,-H*.5);
    if(scan<H)for(var j=0;j<P.length;j++){var q=P[j];if(q.y<scan)continue;var a=.3+q.l*.65+(REDUCE?0:Math.sin(t*2+q.x*.05)*.08);c.fillStyle=ptColor(q,a);var s=q.l>.5?2:1.5;c.fillRect(q.x,q.y,s,s);}
    if(scan>0){c.save();c.beginPath();c.rect(0,0,W,Math.min(scan,H));c.clip();c.drawImage(img,R.x,R.y,R.w,R.h);c.restore();}
    c.restore();
    if(p<1){var gr=c.createLinearGradient(0,scan-90,0,scan+4);gr.addColorStop(0,'rgba(20,184,166,0)');gr.addColorStop(1,'rgba(20,184,166,.28)');c.fillStyle=gr;c.fillRect(0,scan-90,W,94);
      c.fillStyle='rgba(153,246,228,.95)';c.fillRect(0,scan,W,1.5);
      lbl.style.top=Math.max(84,Math.min(H-110,scan-24))+'px';lbl.textContent='RECONSTRUCTION 3D · '+Math.round(p*100)+' %';}
    else if(!done){done=true;lbl.textContent='MODÈLE 3D · CENTRE ÉQUESTRE';lbl.style.top='96px';}
    if(!REDUCE&&(now-t0)<45000&&!document.hidden)requestAnimationFrame(draw);
  }
  img=loadImg('hero_haras.webp',function(){layout();requestAnimationFrame(draw);});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(!img.complete)return;layout();t0=0;done=false;requestAnimationFrame(draw);},200);});
})();

/* ========== SÉQUENCE AU SCROLL : vol → alignement → maillage → modèle ========== */
(function(){
  var sec=document.getElementById('methode'),cv=document.getElementById('sq-cv');if(!sec||!cv)return;
  var steps=[].slice.call(document.querySelectorAll('#sq-steps li')),hud=document.getElementById('sq-hud');
  var img,S,R,P=[],TIE=[],PATH=[],FOOT=[],CAMS=[],TRI=[],lastP=-1,ready=false,ticking=false;
  function build(){
    S=fitCanvas(cv);var W=S.W,H=S.H,mob=W<=760;seed=23;
    R=coverRect(img,W,H,mob?.5:.66,mob?.35:.5);
    P=samplePoints(img,R,W,H,mob?5:4,.9);
    TIE=[];for(var i=0;i<P.length;i+=14)if(P[i].l>.25)TIE.push(P[i]);
    // zone de vol = moitié droite (ordi) ou haut (mobile)
    var x0=mob?W*.06:W*.4,x1=mob?W*.94:W*.95,y0=mob?H*.12:H*.14,y1=mob?H*.55:H*.86,rows=mob?5:6;
    PATH=[];for(var r=0;r<rows;r++){var y=y0+(y1-y0)*r/(rows-1);if(r%2===0){PATH.push([x0,y],[x1,y]);}else{PATH.push([x1,y],[x0,y]);}}
    // longueur cumulée
    var L=[0];for(i=1;i<PATH.length;i++)L.push(L[i-1]+Math.hypot(PATH[i][0]-PATH[i-1][0],PATH[i][1]-PATH[i-1][1]));PATH.L=L;
    var step=mob?W*.11:W*.045,fw=mob?W*.16:W*.07,fh=fw*.68;FOOT=[];CAMS=[];
    for(var s=0;s<=L[L.length-1];s+=step){var pt=at(s/L[L.length-1]);FOOT.push({x:pt[0],y:pt[1],w:fw,h:fh,f:s/L[L.length-1]});CAMS.push(pt);}
    // maillage : triangles sur une grille déformée, gardés là où il y a du modèle
    TRI=[];var gx=mob?34:46,cols=Math.ceil(W/gx)+1,rws=Math.ceil(H/gx)+1,V=[],tc=document.createElement('canvas');tc.width=cols;tc.height=rws;
    var x2=tc.getContext('2d');x2.drawImage(img,R.x/gx,R.y/gx,R.w/gx,R.h/gx);var d=x2.getImageData(0,0,cols,rws).data;
    for(var yy=0;yy<rws;yy++)for(var xx=0;xx<cols;xx++){var k=(yy*cols+xx)*4;V.push({x:xx*gx+(rnd()-.5)*gx*.6,y:yy*gx+(rnd()-.5)*gx*.6,on:d[k]+d[k+1]+d[k+2]>40});}
    for(yy=0;yy<rws-1;yy++)for(xx=0;xx<cols-1;xx++){var a=V[yy*cols+xx],b=V[yy*cols+xx+1],c2=V[(yy+1)*cols+xx],e=V[(yy+1)*cols+xx+1];
      if(a.on&&b.on&&c2.on)TRI.push([a,b,c2]);if(b.on&&e.on&&c2.on)TRI.push([b,e,c2]);}
    ready=true;lastP=-1;render(progress());
  }
  function at(f){var L=PATH.L,tot=L[L.length-1],s=f*tot;for(var i=1;i<PATH.length;i++)if(L[i]>=s){var u=(s-L[i-1])/(L[i]-L[i-1]||1);return[PATH[i-1][0]+(PATH[i][0]-PATH[i-1][0])*u,PATH[i-1][1]+(PATH[i][1]-PATH[i-1][1])*u];}return PATH[PATH.length-1];}
  function progress(){var r=sec.getBoundingClientRect(),span=r.height-window.innerHeight;return clamp(-r.top/span)*4;}
  function grid(c,W,H,a){c.strokeStyle='rgba(20,184,166,'+a+')';c.lineWidth=1;c.beginPath();for(var x=0;x<=W;x+=64){c.moveTo(x+.5,0);c.lineTo(x+.5,H);}for(var y=0;y<=H;y+=64){c.moveTo(0,y+.5);c.lineTo(W,y+.5);}c.stroke();}
  function render(p){
    if(!ready)return;var c=S.ctx,W=S.W,H=S.H,i,q;
    c.fillStyle='#050606';c.fillRect(0,0,W,H);grid(c,W,H,.05);
    var s0=clamp(p),s1=clamp(p-1),s2=clamp(p-2),s3=clamp(p-3);
    // terrain fantôme (étape 1) qui s'efface ensuite
    var ghost=.32*(1-s1);if(ghost>.01){c.save();c.globalAlpha=ghost;c.filter='grayscale(1) brightness(.8)';c.drawImage(img,R.x,R.y,R.w,R.h);c.restore();c.filter='none';}
    // 01 — plan de vol + empreintes photo
    var fly=eo(s0),fade=1-s1;
    if(fade>0){
      c.save();c.globalAlpha=fade;
      var n=0;for(i=0;i<FOOT.length;i++){q=FOOT[i];if(q.f>fly)break;n++;var age=fly-q.f;
        c.fillStyle='rgba(20,184,166,'+(.06)+')';c.fillRect(q.x-q.w/2,q.y-q.h/2,q.w,q.h);
        c.strokeStyle=age<.02?'rgba(255,255,255,.95)':'rgba(94,234,212,.45)';c.lineWidth=age<.02?2:1;c.strokeRect(q.x-q.w/2+.5,q.y-q.h/2+.5,q.w,q.h);}
      c.strokeStyle='rgba(204,251,241,.85)';c.lineWidth=1.5;c.setLineDash([6,6]);c.beginPath();var nSeg=120;for(i=0;i<=nSeg;i++){var f=fly*i/nSeg,pt=at(f);if(i===0)c.moveTo(pt[0],pt[1]);else c.lineTo(pt[0],pt[1]);}c.stroke();c.setLineDash([]);
      if(s1<.05){var d=at(fly);c.save();c.shadowColor='#14b8a6';c.shadowBlur=24;c.fillStyle='#ccfbf1';c.beginPath();c.arc(d[0],d[1],7,0,7);c.fill();c.restore();
        c.strokeStyle='rgba(204,251,241,.9)';c.lineWidth=1.5;c.beginPath();c.arc(d[0],d[1],16,0,7);c.stroke();}
      c.restore();
      hud.innerHTML='PLAN DE VOL<br>PHOTOS <b>'+String(n).padStart(3,'0')+'</b><br>RECOUVREMENT <b>80 %</b>';
    }
    // 02 — points de liaison + rayons depuis les positions de prise de vue
    if(s1>0&&s2<1){
      var a1=eo(clamp(s1*1.4))*(1-s2);
      c.fillStyle='rgba(204,251,241,'+(.9*a1)+')';for(i=0;i<CAMS.length;i++)c.fillRect(CAMS[i][0]-2.5,CAMS[i][1]-2.5,5,5);
      var shown=Math.floor(TIE.length*eo(s1));
      for(i=0;i<shown;i++){q=TIE[i];c.fillStyle=ptColor(q,(.55+q.l*.45)*a1);c.fillRect(q.x-1.2,q.y-1.2,2.6,2.6);}
      c.strokeStyle='rgba(94,234,212,'+(.16*a1)+')';c.lineWidth=1;c.beginPath();
      for(i=0;i<shown;i+=9){q=TIE[i];for(var k=0;k<3;k++){var cam=CAMS[(i*7+k*11)%CAMS.length];c.moveTo(cam[0],cam[1]);c.lineTo(q.x,q.y);}}c.stroke();
      if(s1>0&&s2===0)hud.innerHTML='ALIGNEMENT<br>POINTS DE LIAISON <b>'+(Math.round(eo(s1)*100))+' %</b><br>POSITIONS <b>RTK</b>';
    }
    // 03 — nuage dense puis maillage
    if(s2>0){
      var a2=eo(clamp(s2*1.6)),scan=s3>0?eio(s3)*(H+160)-80:-1;
      for(i=0;i<P.length;i++){q=P[i];if(q.y<scan)continue;c.fillStyle=ptColor(q,(.35+q.l*.6)*a2);var sz=q.l>.5?2:1.5;c.fillRect(q.x,q.y,sz,sz);}
      var m=clamp((s2-.45)/.55);
      if(m>0){c.strokeStyle='rgba(153,246,228,'+(.42*m)+')';c.lineWidth=.8;c.beginPath();
        var lim=Math.floor(TRI.length*eo(m));for(i=0;i<lim;i++){var T=TRI[i];if(T[0].y<scan)continue;c.moveTo(T[0].x,T[0].y);c.lineTo(T[1].x,T[1].y);c.lineTo(T[2].x,T[2].y);c.closePath();}c.stroke();}
      if(s3===0)hud.innerHTML=(m>0?'MAILLAGE':'NUAGE DENSE')+'<br>RECONSTRUCTION <b>'+Math.round(s2*100)+' %</b><br>METASHAPE <b>PRO</b>';
      // 04 — texture
      if(s3>0){c.save();c.beginPath();c.rect(0,0,W,Math.max(0,Math.min(scan,H)));c.clip();c.drawImage(img,R.x,R.y,R.w,R.h);c.restore();
        if(scan<H+40){var gr=c.createLinearGradient(0,scan-120,0,scan);gr.addColorStop(0,'rgba(20,184,166,0)');gr.addColorStop(1,'rgba(20,184,166,.3)');c.fillStyle=gr;c.fillRect(0,scan-120,W,120);c.fillStyle='rgba(204,251,241,.95)';c.fillRect(0,scan-1,W,2);}
        hud.innerHTML='MODÈLE TEXTURÉ<br>EXPORT <b>OBJ · LAS · GeoTIFF</b><br>ÉCHELLE <b>RÉELLE</b>';}
    }
    var act=Math.min(3,Math.floor(p+.0001));steps.forEach(function(li,k){li.classList.toggle('on',k===act);});
  }
  function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;var p=progress();if(Math.abs(p-lastP)>.002){lastP=p;render(p);}});}
  img=loadImg('hero_haras.webp',build);
  window.addEventListener('scroll',onScroll,{passive:true});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(img.complete)build();},200);});
})();

/* ========== RÉALISATIONS : comparateur nuage de points / modèle ========== */
(function(){
  var box=document.getElementById('cmp'),cv=document.getElementById('cmp-cv');if(!box||!cv)return;
  var bar=document.getElementById('cmp-bar'),rng=document.getElementById('cmp-range'),tabs=[].slice.call(document.querySelectorAll('.cmp-tabs .z-tab'));
  var img,S,R,pc,pos=.5,cache={},swept=false;
  function prep(){
    S=fitCanvas(cv);R=coverRect(img,S.W,S.H,.5,.5);seed=31;
    var P=samplePoints(img,R,S.W,S.H,S.W<=760?3:3,1);
    var dpr=Math.min(window.devicePixelRatio||1,2);pc=document.createElement('canvas');pc.width=S.W*dpr;pc.height=S.H*dpr;var x=pc.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
    x.fillStyle='#030404';x.fillRect(0,0,S.W,S.H);
    for(var i=0;i<P.length;i++){var q=P[i];x.fillStyle=ptColor(q,.35+q.l*.65);var s=q.l>.5?1.9:1.4;x.fillRect(q.x,q.y,s,s);}
    draw();
  }
  function draw(){var c=S.ctx,W=S.W,H=S.H,x=W*pos;c.drawImage(img,R.x,R.y,R.w,R.h);c.save();c.beginPath();c.rect(0,0,x,H);c.clip();c.drawImage(pc,0,0,W,H);c.restore();bar.style.left=(pos*100)+'%';rng.value=Math.round(pos*100);}
  function set(v){pos=clamp(v,0,1);if(S)draw();}
  function fromEvent(e){var r=box.getBoundingClientRect();return (e.clientX-r.left)/r.width;}
  var drag=false;
  box.addEventListener('pointerdown',function(e){drag=true;swept=true;set(fromEvent(e));});
  window.addEventListener('pointermove',function(e){if(drag)set(fromEvent(e));});
  window.addEventListener('pointerup',function(){drag=false;});
  box.addEventListener('mousemove',function(e){if(e.pointerType!=='touch'&&!drag&&swept)set(fromEvent(e));});
  rng.addEventListener('input',function(){swept=true;set(rng.value/100);});
  function load(src){if(cache[src]){img=cache[src];prep();return;}loadImg(src,function(i){cache[src]=i;img=i;prep();});}
  tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(o){o.setAttribute('aria-selected',o===t?'true':'false');});
    document.getElementById('cmp-cap').textContent=t.dataset.cap;document.getElementById('cmp-fmt').textContent=t.dataset.fmt;load(t.dataset.img);});});
  load(tabs[0].dataset.img);
  // balayage d'invitation quand le bloc arrive à l'écran
  if('IntersectionObserver' in window&&!REDUCE){var io=new IntersectionObserver(function(en){if(!en[0].isIntersecting||swept)return;io.disconnect();var t0=performance.now();
    (function a(now){if(swept)return;var t=(now-t0)/2400;if(t>=1){set(.5);return;}var k=[.5,.88,.12,.5],seg=Math.min(2,Math.floor(t*3)),u=eio(t*3-seg);set(k[seg]+(k[seg+1]-k[seg])*u);requestAnimationFrame(a);})(t0);},{threshold:.5});io.observe(box);}
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(img)prep();},200);});
})();
})();

/* bandes photo : léger effet de profondeur au défilement */
(function(){var bs=[].slice.call(document.querySelectorAll('.zb img'));if(!bs.length||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;var tk=false;
function up(){tk=false;var vh=window.innerHeight;bs.forEach(function(im){var r=im.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=(r.top+r.height/2-vh/2)/(vh+r.height);im.style.transform='translate3d(0,'+(p*-10).toFixed(2)+'%,0)';});}
window.addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(up);}},{passive:true});up();})();
