/* OrizonDrone — illustration avant / après d'une toiture en tuiles canal */
(function(){
  var cv=document.getElementById('roof-cv'),box=document.getElementById('roof'),inp=document.getElementById('roof-in');
  if(!cv||!cv.getContext)return;
  var W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  var seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  function mk(){var c=document.createElement('canvas');c.width=W;c.height=H;return c;}

  /* --- toiture propre --- */
  var clean=mk(),c=clean.getContext('2d');
  var TW=86,TH=128,STEP=92;
  var cols=Math.ceil(W/TW)+2,rows=Math.ceil(H/STEP)+2;
  var tones=[[186,90,56],[192,98,60],[178,84,52],[198,106,66],[182,94,60]];
  var grid=[];
  for(var r=-1;r<rows;r++){grid[r]=[];for(var k=-1;k<cols;k++){grid[r][k]=tones[Math.floor(rnd()*tones.length)].map(function(v){return v+Math.round((rnd()-.5)*10);});}}
  c.fillStyle='#3a1d12';c.fillRect(0,0,W,H);
  for(var r=-1;r<rows;r++){
    var y=r*STEP;
    for(var k=-1;k<cols;k++){
      var x=k*TW+(r%2?0:0),conv=(k%2===0),col=grid[r][k];
      var g=c.createLinearGradient(x,0,x+TW,0);
      var d=function(m){return 'rgb('+col.map(function(v){return Math.max(0,Math.min(255,Math.round(v*m)));}).join(',')+')';};
      if(conv){g.addColorStop(0,d(.55));g.addColorStop(.3,d(.95));g.addColorStop(.5,d(1.12));g.addColorStop(.7,d(.95));g.addColorStop(1,d(.55));}
      else{g.addColorStop(0,d(.9));g.addColorStop(.5,d(.62));g.addColorStop(1,d(.9));}
      c.fillStyle=g;
      c.beginPath();
      var w=conv?TW+8:TW-2,xx=conv?x-4:x+1,top=y-(conv?4:0),bot=y+TH;
      c.moveTo(xx+w*.08,top);c.lineTo(xx+w*.92,top);
      c.quadraticCurveTo(xx+w,bot-20,xx+w*.97,bot);
      c.quadraticCurveTo(xx+w/2,bot+(conv?10:-6),xx+w*.03,bot);
      c.quadraticCurveTo(xx,bot-20,xx+w*.08,top);
      c.fill();
      /* ombre portée au bas de la tuile */
      var sg=c.createLinearGradient(0,bot-4,0,bot+22);sg.addColorStop(0,'rgba(20,6,2,.55)');sg.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=sg;c.beginPath();c.moveTo(xx,bot-2);c.quadraticCurveTo(xx+w/2,bot+(conv?12:-4),xx+w,bot-2);c.lineTo(xx+w,bot+20);c.lineTo(xx,bot+20);c.fill();
      if(conv){c.strokeStyle='rgba(255,215,180,.18)';c.lineWidth=1.5;c.beginPath();c.moveTo(xx+3,bot-3);c.quadraticCurveTo(xx+w/2,bot+9,xx+w-3,bot-3);c.stroke();}
      /* grain */
      for(var i=0;i<14;i++){c.fillStyle='rgba('+(rnd()>.5?'255,230,200':'60,25,10')+','+(rnd()*.08)+')';c.fillRect(xx+rnd()*w,top+rnd()*(bot-top),2,2);}
    }
  }
  /* lumière rasante */
  var lg=c.createLinearGradient(0,0,W,H);lg.addColorStop(0,'rgba(255,220,180,.10)');lg.addColorStop(1,'rgba(0,0,0,.22)');c.fillStyle=lg;c.fillRect(0,0,W,H);

  /* --- toiture moussue --- */
  var dirty=mk(),d=dirty.getContext('2d');
  d.drawImage(clean,0,0);
  d.fillStyle='rgba(38,40,28,.38)';d.fillRect(0,0,W,H);
  function blob(x,y,rad,rgb,a){var g=d.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(.6,'rgba('+rgb+','+(a*.6)+')');g.addColorStop(1,'rgba('+rgb+',0)');d.fillStyle=g;d.beginPath();d.arc(x,y,rad,0,7);d.fill();}
  var mosses=['58,84,28','74,102,34','46,70,22','96,124,42','38,58,20'];
  function tuft(x,y,rad,dense){
    blob(x,y,rad*1.1,'34,48,18',.55);
    for(var j=0;j<dense;j++){var a=rnd()*6.283,q=Math.sqrt(rnd())*rad;d.fillStyle='rgba('+mosses[Math.floor(rnd()*mosses.length)]+','+(.55+rnd()*.45)+')';d.beginPath();d.arc(x+Math.cos(a)*q,y+Math.sin(a)*q*.75,1+rnd()*2.4,0,7);d.fill();}
    for(var j=0;j<dense/5;j++){var a=rnd()*6.283,q=Math.sqrt(rnd())*rad*.8;d.fillStyle='rgba(160,186,80,'+(.35+rnd()*.3)+')';d.fillRect(x+Math.cos(a)*q,y+Math.sin(a)*q*.75,1.5,1.5);}
  }
  for(var i=0;i<40;i++)blob(rnd()*W,rnd()*H,80+rnd()*160,rnd()>.5?'60,80,40':'70,74,52',.22+rnd()*.15);
  for(var k=-1;k<cols;k++){
    var conv=(k%2===0),x=k*TW+TW/2,chan=rnd();
    for(var r=-1;r<rows;r++){
      var by=r*STEP+TH-10,lvl=Math.min(1,.35+(r/rows)*.9);
      if(!conv&&chan>.1){var n=2+Math.floor(rnd()*4*lvl);for(var i=0;i<n;i++)tuft(x+(rnd()-.5)*TW*.5,by-rnd()*STEP,16+rnd()*28*lvl,140+rnd()*160);}
      if(conv&&rnd()<.75*lvl)tuft(x+(rnd()-.5)*TW*.7,by-rnd()*22,12+rnd()*18,90+rnd()*90);
      if(conv&&rnd()<.5){var m=1+Math.floor(rnd()*3);for(var i=0;i<m;i++)blob(x+(rnd()-.5)*TW*.5,r*STEP+rnd()*TH,2+rnd()*5,rnd()>.5?'200,196,150':'168,172,138',.45+rnd()*.25);}
      if(rnd()>.7){var sx=x+(rnd()-.5)*TW*.4;var sg=d.createLinearGradient(0,r*STEP,0,r*STEP+TH);sg.addColorStop(0,'rgba(20,24,14,0)');sg.addColorStop(1,'rgba(20,24,14,.3)');d.fillStyle=sg;d.fillRect(sx-3,r*STEP,5+rnd()*6,TH);}
    }
  }

  /* --- rendu --- */
  var split=.5,target=.5,t0=0,visible=false,particles=[];
  function drawDrone(x,y,t){
    ctx.save();ctx.translate(x,y);
    ctx.strokeStyle='#e9fdfb';ctx.fillStyle='#0b0b0b';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(-46,-6);ctx.lineTo(46,-6);ctx.stroke();
    [-46,46].forEach(function(px){ctx.beginPath();ctx.ellipse(px,-12,26,4+Math.abs(Math.sin(t/40+px))*1.5,0,0,7);ctx.strokeStyle='rgba(233,253,251,.55)';ctx.stroke();});
    ctx.strokeStyle='#e9fdfb';ctx.fillStyle='#111';ctx.beginPath();ctx.roundRect?ctx.roundRect(-16,-10,32,18,5):ctx.rect(-16,-10,32,18);ctx.fill();ctx.stroke();
    ctx.fillStyle='#14B8A6';ctx.beginPath();ctx.arc(0,-1,3.5,0,7);ctx.fill();
    ctx.restore();
  }
  function frame(t){
    if(!t0)t0=t;
    split+=(target-split)*.12;
    var sx=Math.round(W*split);
    ctx.drawImage(dirty,0,0);
    ctx.save();ctx.beginPath();ctx.rect(0,0,sx,H);ctx.clip();ctx.drawImage(clean,0,0);ctx.restore();
    /* brume pulvérisée le long de la ligne */
    var dy=110+Math.sin(t/700)*10;
    if(visible){for(var i=0;i<4;i++)particles.push({x:sx+(Math.random()-.5)*14,y:dy+12,vx:(Math.random()-.5)*1.6,vy:2.2+Math.random()*2.4,a:.55,r:1+Math.random()*2.2});}
    for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vx*=1.01;p.a*=.985;if(p.y>H||p.a<.03){particles.splice(i,1);continue;}ctx.fillStyle='rgba(205,245,240,'+p.a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();}
    if(particles.length>500)particles.splice(0,particles.length-500);
    /* ligne et poignée */
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(sx-1.5,0,3,H);
    ctx.beginPath();ctx.arc(sx,H/2,30,0,7);ctx.fillStyle='rgba(5,6,6,.82)';ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle='#14B8A6';ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(sx-8,H/2-8);ctx.lineTo(sx-17,H/2);ctx.lineTo(sx-8,H/2+8);ctx.fill();ctx.beginPath();ctx.moveTo(sx+8,H/2-8);ctx.lineTo(sx+17,H/2);ctx.lineTo(sx+8,H/2+8);ctx.fill();
    drawDrone(sx,dy,t);
    if(visible||Math.abs(target-split)>.001||particles.length)requestAnimationFrame(frame);else running=false;
  }
  var running=false;function run(){if(!running){running=true;requestAnimationFrame(frame);}}
  inp.addEventListener('input',function(){target=inp.value/100;run();});
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window){
    var first=true;
    new IntersectionObserver(function(es){es.forEach(function(e){visible=e.isIntersecting&&!reduce;
      if(e.isIntersecting&&first){first=false;split=.92;target=.5;}
      run();});},{threshold:.25}).observe(box);
  }else{visible=false;run();}
  run();
})();
