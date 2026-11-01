/* OrizonDrone — scène « jumeau 3D » v2 : abbaye en nuage de points éclairé, drone, relevé, modèle */
(function(){
var REDUCE=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var cv=document.getElementById('j-gl'),sec=document.getElementById('j-sc'),hud=document.getElementById('j-hud'),stepEls=[].slice.call(document.querySelectorAll('#j-steps li'));
if(!window.THREE){document.getElementById('j-fb').style.display='block';return;}
var renderer;try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});}catch(e){document.getElementById('j-fb').style.display='block';return;}
var MOB=window.innerWidth<760,BLOOM=!MOB&&!!THREE.UnrealBloomPass;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,MOB?1.5:1.75));
renderer.outputEncoding=THREE.sRGBEncoding;
var scene=new THREE.Scene();scene.background=new THREE.Color(0x040606);scene.fog=new THREE.Fog(0x040606,120,280);
var cam=new THREE.PerspectiveCamera(34,1,.5,600);
var TAU=Math.PI*2,R=Math.random,clamp=function(x,a,b){return Math.max(a===undefined?0:a,Math.min(b===undefined?1:b,x));},lerp=function(a,b,u){return a+(b-a)*u;},sm=function(x){x=clamp(x);return x*x*(3-2*x);};
var seed=7;R=function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};

/* ================= ABBAYE ================= */
var P=[],C=[],A=[],Nn=[];
var STONE=[.86,.79,.66],STONE2=[.74,.68,.57],ROOF=[.55,.33,.24],SLATE=[.30,.31,.33],GRASS=[.30,.38,.22],PATH=[.62,.58,.5],LEAF=[.18,.27,.15];
var DENS=MOB?.5:1;
function add(x,y,z,c,nx,ny,nz,v){v=v===undefined?.16:v;var k=1+(R()-.5)*v;P.push(x,y,z);C.push(c[0]*k,c[1]*k,c[2]*k);var a=Math.atan2(z,x)+.5;A.push(((a%TAU)+TAU)%TAU);Nn.push(nx,ny,nz);}
function course(y){return (Math.floor(y/.55)%2)?STONE:STONE2;}
function archHole(u,y,cx,w,y0,y1){if(Math.abs(u-cx)>w/2||y<y0||y>y1)return false;var yc=y1-w/2;return y<yc||Math.hypot(u-cx,y-yc)<w/2;}
// mur plan : axe 'x' (normale z) ou 'z' (normale x)
function wall(axis,a0,a1,fixed,y0,y1,n,nrm,hole){for(var i=0;i<n*DENS;i++){var a=lerp(a0,a1,R()),y=lerp(y0,y1,R());if(hole&&hole(a,y))continue;var c=course(y);
  if(axis==='x')add(a,y,fixed,c,0,0,nrm);else add(fixed,y,a,c,nrm,0,0);}}
function gable(axis,a0,a1,fixed,y0,h,n,nrm,hole){var c0=(a0+a1)/2,w=(a1-a0)/2;for(var i=0;i<n*DENS;i++){var a=lerp(a0,a1,R()),ym=y0+h*(1-Math.abs(a-c0)/w),y=lerp(y0,ym,R());if(hole&&hole(a,y))continue;var c=course(y);if(axis==='x')add(a,y,fixed,c,0,0,nrm);else add(fixed,y,a,c,nrm,0,0);}}
function roofX(x0,x1,z0,z1,y0,h,n,col){var c0=(z0+z1)/2,w=(z1-z0)/2+.7,len=Math.hypot(w,h);for(var i=0;i<n*DENS;i++){var x=lerp(x0-.4,x1+.4,R()),s=R()<.5?-1:1,u=R(),z=c0+s*w*(1-u),y=y0+h*u;var row=Math.floor(u*len/.45)%2,cc=row?col:[col[0]*.86,col[1]*.86,col[2]*.86];add(x,y,z,cc,s*h/len,w/len,0*1,.1);var L=Nn.length;Nn[L-3]=0;Nn[L-2]=w/len;Nn[L-1]=s*h/len;}}
// --- nef 32 x 11, murs 10 m, toit +6
var navWin=function(a,y){for(var k=0;k<5;k++){if(archHole(a,y,-9.5+k*5.2,1.5,3.6,8.2))return true;}return false;};
wall('x',-14,16,-5.5,0,10,13000,-1,navWin);wall('x',-14,16,5.5,0,10,13000,1,navWin);
// contreforts
for(var k=0;k<6;k++){var bx=-12+k*5.2;[-1,1].forEach(function(s){var z=s*5.5;for(var i=0;i<500*DENS;i++){var y=R()*7.5,f=R();if(f<.5)add(bx-.5+R(),y,z+s*1.1,course(y),0,0,s);else if(f<.75)add(bx-.5,y,z+s*R()*1.1,course(y),-1,0,0);else add(bx+.5,y,z+s*R()*1.1,course(y),1,0,0);}});}
roofX(-14,16,-5.5,5.5,10,6,17000,ROOF);
// pignon est + rosace
var rose=function(a,y){var r=Math.hypot(a,y-13);if(r>2.1)return false;if(r>1.75)return false;var an=Math.atan2(y-13,a);return !(Math.abs(Math.sin(an*4))<.18||r<.35||(r>1.2&&r<1.4));};
gable('z',-5.5,5.5,16,10,6,2600,1,rose);wall('z',-5.5,5.5,16,8,10,900,1);
// chevet
for(var i=0;i<7500*DENS;i++){var t=lerp(-Math.PI/2,Math.PI/2,R()),y=R()*8;var ang=t*180/Math.PI;if(y>3.2&&y<6.6&&(Math.abs(ang)<7||Math.abs(Math.abs(ang)-50)<6))continue;add(16+Math.cos(t)*5,y,Math.sin(t)*5,course(y),Math.cos(t),0,Math.sin(t));}
for(i=0;i<4200*DENS;i++){var t2=lerp(-Math.PI/2,Math.PI/2,R()),u=R(),r=5.7*(1-u);add(16+Math.cos(t2)*r,8+u*3.6,Math.sin(t2)*r,ROOF,Math.cos(t2)*.6,.8,Math.sin(t2)*.6,.1);}
// clocher 7x7, 26 m, baies géminées, flèche en ardoise, croix
var belfry=function(a,y,c){return archHole(a,y,c-1.3,1.3,19,23.5)||archHole(a,y,c+1.3,1.3,19,23.5);};
wall('x',-21,-14,-3.5,0,26,7000,-1,function(a,y){return belfry(a,y,-17.5)||archHole(a,y,-17.5,1.2,9,12);});
wall('x',-21,-14,3.5,0,26,7000,1,function(a,y){return belfry(a,y,-17.5)||archHole(a,y,-17.5,1.2,9,12);});
wall('z',-3.5,3.5,-21,0,26,7000,-1,function(a,y){return belfry(a,y,0)||archHole(a,y,0,2.4,0,4.6);});
wall('z',-3.5,3.5,-14,10,26,4000,1,function(a,y){return belfry(a,y,0);});
for(i=0;i<1500*DENS;i++){var s2=(R()*4)|0,v2=lerp(-4,4,R()),y2=26+R()*.6,px,pz;if(s2===0){px=v2;pz=4;}else if(s2===1){px=v2;pz=-4;}else if(s2===2){px=4;pz=v2;}else{px=-4;pz=v2;}add(-17.5+px,y2,pz,STONE2,s2>1?(s2===2?1:-1):0,0,s2<2?(s2===0?1:-1):0);}
for(i=0;i<5200*DENS;i++){var u3=R(),sd=(R()*4)|0,h3=(1-u3)*3.9,v3=lerp(-h3,h3,R()),qx,qz,nx=0,nz=0;if(sd===0){qx=v3;qz=h3;nz=1;}else if(sd===1){qx=v3;qz=-h3;nz=-1;}else if(sd===2){qx=h3;qz=v3;nx=1;}else{qx=-h3;qz=v3;nx=-1;}add(-17.5+qx,26.6+u3*10,qz,SLATE,nx*.9,.45,nz*.9,.12);}
for(i=0;i<160;i++){var cy=R();add(-17.5,36.6+cy*2.2,0,[.9,.85,.7],1,0,0,.05);if(i<60)add(-17.5,37.9,lerp(-.7,.7,R()),[.9,.85,.7],1,0,0,.05);}
// cloître : galeries à arcades + toits appentis
var arc=function(a,y){var m=((a+40)%3.2+3.2)%3.2;return archHole(m,y,1.6,2.1,0,3.6);};
wall('x',-12,10,9,0,4.6,4200,-1,arc);wall('x',-12,10,19,0,4.6,4200,1,arc);
wall('z',9,19,-12,0,4.6,2200,-1,arc);wall('z',9,19,10,0,4.6,2200,1,arc);
for(i=0;i<3000*DENS;i++){var x4=lerp(-12.5,10.5,R()),u4=R();add(x4,4.6+u4*1.4,lerp(8.3,12.6,u4),ROOF,0,.9,-.4,.1);add(x4,4.6+u4*1.4,lerp(19.7,15.4,u4),ROOF,0,.9,.4,.1);}
// sol, chemin, préau du cloître, arbres
for(i=0;i<42000*DENS;i++){var rr=Math.sqrt(R())*56,aa=R()*TAU,gx=Math.cos(aa)*rr,gz=Math.sin(aa)*rr;
  if(gz>-5.6&&gz<5.6&&gx>-21.2&&gx<21.2)continue;var gy=Math.sin(gx*.12)*.35+Math.cos(gz*.17)*.35,col=GRASS;
  if(gx<-21&&Math.abs(gz)<1.6)col=PATH;if(gz>9&&gz<19&&gx>-12&&gx<10)col=(Math.abs(gx+1)<.9||Math.abs(gz-14)<.9)?PATH:[.36,.45,.26];add(gx,gy,gz,col,0,1,0,.28);}
[[-34,-14,4.2],[-32,12,3.6],[-8,-24,4.6],[6,-27,3.8],[26,-16,4.4],[30,10,3.4],[24,24,4.8],[-28,26,4],[-38,2,3.2],[12,30,3.6]].forEach(function(tr){var n=1700*DENS*(tr[2]/4);for(var j=0;j<n;j++){var th=R()*TAU,ph=Math.acos(2*R()-1),rad=tr[2]*(.75+.25*R()),nx2=Math.sin(ph)*Math.cos(th),ny2=Math.cos(ph),nz2=Math.sin(ph)*Math.sin(th);add(tr[0]+nx2*rad*.8,tr[2]*1.25+3+ny2*rad*1.25,tr[1]+nz2*rad*.8,LEAF,nx2,ny2,nz2,.35);}
  for(j=0;j<120;j++)add(tr[0],R()*3.2,tr[1],[.25,.2,.16],1,0,0,.1);});
var N=P.length/3;
var geo=new THREE.BufferGeometry();
geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('aCol',new THREE.Float32BufferAttribute(C,3));geo.setAttribute('aAng',new THREE.Float32BufferAttribute(A,1));geo.setAttribute('aNor',new THREE.Float32BufferAttribute(Nn,3));
var U={uScan:{value:0},uMix:{value:0},uSize:{value:MOB?115:130},uPR:{value:renderer.getPixelRatio()},uSun:{value:new THREE.Vector3(.55,.62,.55).normalize()},uSolid:{value:0}};
var pts=new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:U,
  vertexShader:'attribute vec3 aCol;attribute float aAng;attribute vec3 aNor;uniform float uScan,uMix,uSize,uPR,uSolid;uniform vec3 uSun;varying vec3 vC;varying float vV;'+
  'void main(){float d=uScan-aAng;float v=smoothstep(0.0,0.45,d);float fr=1.0-smoothstep(0.0,0.5,d);'+
  'float lam=max(dot(normalize(aNor),uSun),0.0);vec3 warm=aCol*(0.38+0.9*lam)*vec3(1.08,0.98,0.86)+vec3(0.02,0.05,0.06);'+
  'vec3 teal=vec3(0.22,0.95,0.82)*(0.35+0.75*lam);'+
  'vC=mix(teal,warm,uMix)+fr*v*vec3(1.4,1.6,1.5);vV=v;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;'+
  'gl_PointSize=uSize*uPR*(0.3+0.7*v)*(1.0+uSolid*0.55)/-mv.z;}',
  fragmentShader:'varying vec3 vC;varying float vV;void main(){vec2 c=gl_PointCoord-0.5;float r=dot(c,c);if(r>0.25||vV<0.03)discard;gl_FragColor=vec4(vC*(1.0-r*0.8),1.0);}'}));
scene.add(pts);

/* ================= MAILLAGE (étape 3) : arêtes qui se dessinent ================= */
var wire=[];function seg(a,b){wire.push(a[0],a[1],a[2],b[0],b[1],b[2]);}
function boxE(x0,x1,y0,y1,z0,z1){var v=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function(e){seg(v[e[0]],v[e[1]]);});}
boxE(-14,16,0,10,-5.5,5.5);seg([-14,16,0],[16,16,0]);seg([-14,16,0],[-14,10,-6.2]);seg([-14,16,0],[-14,10,6.2]);seg([16,16,0],[16,10,-6.2]);seg([16,16,0],[16,10,6.2]);
boxE(-21,-14,0,26,-3.5,3.5);[[4,4],[4,-4],[-4,-4],[-4,4]].forEach(function(q){seg([-17.5+q[0],26.6,q[1]],[-17.5,36.6,0]);});
for(var a2=0;a2<12;a2++){var t3=lerp(-Math.PI/2,Math.PI/2,a2/12),t4=lerp(-Math.PI/2,Math.PI/2,(a2+1)/12);seg([16+Math.cos(t3)*5,8,Math.sin(t3)*5],[16+Math.cos(t4)*5,8,Math.sin(t4)*5]);seg([16+Math.cos(t3)*5,0,Math.sin(t3)*5],[16+Math.cos(t3)*5,8,Math.sin(t3)*5]);seg([16+Math.cos(t3)*5.7,8,Math.sin(t3)*5.7],[16,11.6,0]);}
boxE(-12,10,0,4.6,8.3,9.7);boxE(-12,10,0,4.6,18.3,19.7);boxE(-12,-10.6,0,4.6,9,19);boxE(8.6,10,0,4.6,9,19);
var wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wire,3));
var wm=new THREE.LineBasicMaterial({color:0x7ff5df,transparent:true,opacity:.9});var wl=new THREE.LineSegments(wg,wm);wl.visible=false;scene.add(wl);
var WN=wire.length/3;

/* ================= DRONE type quadri industriel ================= */
var drone=new THREE.Group(),dm=new THREE.MeshStandardMaterial({color:0x2b3232,roughness:.45,metalness:.4}),dm2=new THREE.MeshStandardMaterial({color:0x151a1a,roughness:.6});
scene.add(new THREE.HemisphereLight(0xe6f2ee,0x101414,.9));var sun=new THREE.DirectionalLight(0xffe6c8,1.3);sun.position.set(40,60,30);scene.add(sun);
var body=new THREE.Mesh(new THREE.BoxGeometry(1.5,.55,2),dm);drone.add(body);
var top=new THREE.Mesh(new THREE.BoxGeometry(1.1,.25,1.3),dm2);top.position.y=.38;drone.add(top);
[[-.35,.35],[.35,.35]].forEach(function(q){var an=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.6,6),dm2);an.position.set(q[0],.75,-.4);drone.add(an);});
var rotors=[];[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(q,i){var arm=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.9,8),dm);arm.rotation.z=Math.PI/2;arm.rotation.y=Math.atan2(q[1],q[0]);arm.position.set(q[0]*.82,.05,q[1]*.82);drone.add(arm);
  var mot=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.35,12),dm2);mot.position.set(q[0]*1.55,.18,q[1]*1.55);drone.add(mot);
  var disc=new THREE.Mesh(new THREE.CircleGeometry(1.05,28),new THREE.MeshBasicMaterial({color:0xe9fbf7,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.set(q[0]*1.55,.4,q[1]*1.55);drone.add(disc);
  var bl=new THREE.Mesh(new THREE.BoxGeometry(2,.03,.14),new THREE.MeshBasicMaterial({color:0xdfe8e8,transparent:true,opacity:.75}));bl.position.set(q[0]*1.55,.4,q[1]*1.55);drone.add(bl);rotors.push(bl);
  var led=new THREE.Mesh(new THREE.SphereGeometry(.1,8,8),new THREE.MeshBasicMaterial({color:i%2?0x5eead4:0xef4444}));led.position.set(q[0]*1.55,-.05,q[1]*1.55);led.userData.blink=true;drone.add(led);});
[-1,1].forEach(function(s){var leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.7,.08),dm2);leg.position.set(s*.55,-.6,0);drone.add(leg);var sk=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.8,6),dm2);sk.rotation.x=Math.PI/2;sk.position.set(s*.55,-.95,0);drone.add(sk);});
var gim=new THREE.Group();var gb=new THREE.Mesh(new THREE.BoxGeometry(.55,.5,.5),new THREE.MeshStandardMaterial({color:0x0e1111,roughness:.3,metalness:.6}));gim.add(gb);
var lens=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.2,16),new THREE.MeshBasicMaterial({color:0x14b8a6}));lens.rotation.x=Math.PI/2;lens.position.z=.32;gim.add(lens);gim.position.set(0,-.55,.75);drone.add(gim);
drone.scale.setScalar(MOB?1.9:2);scene.add(drone);
// cône de prise de vue + empreintes
var fr=new THREE.BufferGeometry();fr.setAttribute('position',new THREE.Float32BufferAttribute(new Array(48).fill(0),3));
var frM=new THREE.LineBasicMaterial({color:0x7ff5df,transparent:true,opacity:.5});var frustum=new THREE.LineSegments(fr,frM);scene.add(frustum);
var shots=[];for(i=0;i<14;i++){var fq=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1,1)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0}));fq.visible=false;scene.add(fq);shots.push({m:fq,t:-9});}
var si=0;
// poussière en suspension
var dust=new THREE.BufferGeometry(),dp2=[];for(i=0;i<(MOB?300:700);i++)dp2.push((R()-.5)*120,R()*45,(R()-.5)*120);dust.setAttribute('position',new THREE.Float32BufferAttribute(dp2,3));
var dustM=new THREE.PointsMaterial({color:0x9fe9dc,size:.18,transparent:true,opacity:.35,depthWrite:false});scene.add(new THREE.Points(dust,dustM));

/* ================= RENDU (lueur) ================= */
var composer=null,bloom=null;
if(BLOOM){composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,cam));bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),.5,.35,.78);composer.addPass(bloom);}
function resize(){var w=cv.clientWidth,h=cv.clientHeight;renderer.setSize(w,h,false);MOB=w<760;cam.fov=MOB?50:34;cam.aspect=w/h;if(MOB)cam.clearViewOffset();else cam.setViewOffset(w,h,-w*.2,0,w,h);cam.updateProjectionMatrix();if(composer){composer.setSize(w,h);}}
window.addEventListener('resize',resize);resize();

/* ================= ÉTIQUETTES ================= */
var LBL=[['Clocher',[-17.5,38.5,0]],['Nef',[1,16.5,0]],['Chevet',[19,12,0]],['Cloître',[-1,6.5,19.5]]].map(function(l){var d=document.createElement('div');d.className='j-lbl';d.innerHTML='<b>'+l[0]+'</b><i></i>';document.querySelector('.j-st').appendChild(d);return{el:d,p:new THREE.Vector3(l[1][0],l[1][1],l[1][2])};});

/* ================= INTERACTION ================= */
var drag=0,dragV=0,down=false,lx=0;
cv.addEventListener('pointerdown',function(e){down=true;lx=e.clientX;try{cv.setPointerCapture(e.pointerId);}catch(_){}document.getElementById('j-hint').style.opacity=0;});
cv.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-lx;lx=e.clientX;dragV=dx*.006;drag+=dragV;});
cv.addEventListener('pointerup',function(){down=false;});cv.addEventListener('pointercancel',function(){down=false;});

/* ================= BOUCLE ================= */
var t0=performance.now(),last=t0,photos=0,lastShot=-9,visible=true,TAKE=2.2,ORBIT=REDUCE?0:10,AZ0=-.5,ORR=29;
new IntersectionObserver(function(e){visible=e[0].isIntersecting;if(visible){last=performance.now();requestAnimationFrame(loop);}}).observe(sec);
var V=new THREE.Vector3(),aim=new THREE.Vector3(),toA=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),pv=new THREE.Vector3();
function loop(now){var dt=Math.min(.05,(now-last)/1000);last=now;var t=REDUCE?60:(now-t0)/1000;
  var rb=sec.getBoundingClientRect(),span=sec.offsetHeight-window.innerHeight,p=REDUCE?.5:clamp(-rb.top/span);
  var take=sm(t/TAKE),flyU=clamp((t-TAKE)/ORBIT),az=AZ0+flyU*TAU*1.04,dh=lerp(.9,23,take)+Math.sin(t*1.3)*.35*take;
  U.uScan.value=flyU>=1?99:(t<TAKE?-1:flyU*TAU*1.04+.35);
  var colMix=sm((t-TAKE-ORBIT-.2)/2.4),s2=sm((p-.26)/.2),s3=sm((p-.6)/.2);
  U.uMix.value=Math.max(colMix,s2);U.uSolid.value=s3;
  var post=Math.max(0,t-TAKE-ORBIT),daz=flyU<1?az:AZ0+TAU*1.04+post*.1;
  drone.position.set(Math.cos(daz)*ORR,dh,Math.sin(daz)*ORR);
  V.set(Math.cos(daz+.3)*ORR,dh,Math.sin(daz+.3)*ORR);drone.lookAt(V);drone.rotateX(t<TAKE?0:.08);
  rotors.forEach(function(b,i){b.rotation.y+=(i%2?-1:1)*dt*55;});
  drone.children.forEach(function(c){if(c.userData.blink)c.visible=(Math.floor(t*2.2)%2)===0;});
  // visée
  aim.set(Math.cos(daz)*7,7.5,Math.sin(daz)*5);gim.lookAt(drone.localToWorld(V.set(0,0,0)).lerp(aim,1));
  var dpos=drone.position;toA.subVectors(aim,dpos).normalize();right.crossVectors(toA,Y).normalize();up.crossVectors(right,toA).normalize();
  var dist=dpos.distanceTo(aim),hw=dist*.27,hh=dist*.19,cs=[];[[1,1],[1,-1],[-1,-1],[-1,1]].forEach(function(q){cs.push(new THREE.Vector3().copy(aim).addScaledVector(right,q[0]*hw).addScaledVector(up,q[1]*hh));});
  var pa=fr.attributes.position.array,k=0;cs.forEach(function(c){pa[k++]=dpos.x;pa[k++]=dpos.y-1;pa[k++]=dpos.z;pa[k++]=c.x;pa[k++]=c.y;pa[k++]=c.z;});
  for(var j=0;j<4;j++){var a1=cs[j],b1=cs[(j+1)%4];pa[k++]=a1.x;pa[k++]=a1.y;pa[k++]=a1.z;pa[k++]=b1.x;pa[k++]=b1.y;pa[k++]=b1.z;}
  while(k<48)pa[k++]=0;fr.attributes.position.needsUpdate=true;
  if(flyU>0&&flyU<1&&t-lastShot>.24){lastShot=t;photos++;var s=shots[si++%shots.length];s.t=t;s.m.visible=true;s.m.position.copy(aim);s.m.lookAt(dpos);s.m.scale.set(hw*2,hh*2,1);}
  shots.forEach(function(s){var a=1-(t-s.t)/1.4;s.m.material.opacity=Math.max(0,a)*.8*(1-s3);if(a<=0)s.m.visible=false;});
  var scanning=flyU>0&&flyU<1?1:0,flash=scanning?Math.max(0,1-(t-lastShot)/.16):0;
  frM.opacity=(.22+.65*flash)*scanning*(1-s2);frustum.visible=scanning>0&&s2<.9;
  drone.visible=s3<.98&&s2<.6;
  // maillage qui se dessine
  wl.visible=s3>.01;wg.setDrawRange(0,Math.floor(WN*sm(s3*1.25)/2)*2);wm.opacity=.9*s3;
  // caméra
  if(!down){drag+=dragV;dragV*=.94;}
  var intro=REDUCE?1:sm(t/5),camAz=-1.05+t*.018+drag+s2*.6+s3*.9;
  var R1=(MOB?118:100)-(1-intro)*(MOB?40:38),H1=(MOB?44:38)-(1-intro)*24,R2=MOB?40:44,H2=MOB?120:108,R3=MOB?96:96,H3=MOB?20:15;
  var camR=lerp(lerp(R1,R2,s2),R3,s3),camH=lerp(lerp(H1,H2,s2),H3,s3),ly=MOB?lerp(lerp(-2,-16,s2),2,s3):lerp(lerp(11,2,s2),14,s3);
  cam.position.set(Math.cos(camAz)*camR,camH,4+Math.sin(camAz)*camR);cam.lookAt(0,ly-(1-intro)*6,4);
  if(composer){bloom.strength=.3+.4*(1-U.uMix.value)+.35*flash;composer.render();}else renderer.render(scene,cam);
  // étiquettes
  var W=cv.clientWidth,H=cv.clientHeight;LBL.forEach(function(l){pv.copy(l.p).project(cam);var x=(pv.x*.5+.5)*W,y=(-pv.y*.5+.5)*H,o=sm((s3-.55)/.3);l.el.style.opacity=o;l.el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-100%)';});
  var n=Math.min(N,Math.round(N*clamp(flyU*1.02)));
  hud.innerHTML='<i></i>RTK FIX<br>ALT <b>'+(dh*2.7).toFixed(1)+' M</b><br>PHOTOS <b>'+String(photos).padStart(3,'0')+'</b><br>POINTS <b>'+n.toLocaleString('fr-FR')+'</b>';
  var st=s3>.5?2:(s2>.5||flyU>=1?1:0);stepEls.forEach(function(l,i){l.classList.toggle('on',i===st);});
  if(visible&&!document.hidden&&!REDUCE)requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&visible){last=performance.now();requestAnimationFrame(loop);}});
requestAnimationFrame(loop);
window.addEventListener('scroll',function(){if(REDUCE)requestAnimationFrame(loop);},{passive:true});
})();
