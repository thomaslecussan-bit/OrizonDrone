/* OrizonDrone — menu mobile */
(function(){
  var nav=[].slice.call(document.querySelectorAll('nav')).filter(function(n){return !n.classList.contains('breadcrumb-nav');})[0];
  if(!nav||document.getElementById('mnav-btn'))return;
  var css='#mnav-btn{display:none;position:relative;width:44px;height:44px;margin-left:auto;border:1px solid rgba(20,184,166,.45);border-radius:8px;background:rgba(5,6,6,.6);cursor:pointer;padding:0}'+
  '#mnav-btn i{position:absolute;left:11px;right:11px;height:2px;background:#e9fdfb;border-radius:2px;transition:transform .25s,opacity .2s,top .25s}'+
  '#mnav-btn i:nth-child(1){top:14px}#mnav-btn i:nth-child(2){top:21px}#mnav-btn i:nth-child(3){top:28px}'+
  '.mnav-open #mnav-btn i:nth-child(1){top:21px;transform:rotate(45deg)}.mnav-open #mnav-btn i:nth-child(2){opacity:0}.mnav-open #mnav-btn i:nth-child(3){top:21px;transform:rotate(-45deg)}'+
  '#mnav{position:fixed;inset:0;z-index:99;background:rgba(4,6,6,.97);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);display:flex;flex-direction:column;justify-content:flex-start;padding:5.5rem 1.5rem 2rem;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s;overflow-y:auto}'+
  '.mnav-open #mnav{opacity:1;visibility:visible}.mnav-open{overflow:hidden}'+
  '#mnav a{display:block;color:#f2f2f2;text-decoration:none;font:600 1.35rem/1.2 Inter,"DM Sans",sans-serif;padding:.8rem 0;border-bottom:1px solid rgba(15,118,110,.25)}'+
  '#mnav a small{display:block;font:500 .78rem/1.4 Inter,"DM Sans",sans-serif;color:#8a8a8a;margin-top:.2rem}'+
  '#mnav .mnav-cta{margin-top:1.6rem;border:0;background:#0F766E;color:#fff;text-align:center;border-radius:8px;padding:1rem;font-size:1.05rem}'+
  '#mnav .mnav-tel{border:1px solid rgba(20,184,166,.45);text-align:center;border-radius:8px;margin-top:.7rem;padding:1rem;font-size:1.05rem;color:#14B8A6}'+
  '.mnav-open #fixed-contact-btn{display:none}@media(max-width:768px){#mnav-btn{display:block}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var b=document.createElement('button');b.id='mnav-btn';b.type='button';b.setAttribute('aria-label','Ouvrir le menu');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','mnav');b.innerHTML='<i></i><i></i><i></i>';
  var holder=nav.querySelector('.nav-in')||nav;holder.appendChild(b);
  var m=document.createElement('div');m.id='mnav';m.setAttribute('aria-label','Menu');
  var B=((document.currentScript&&document.currentScript.src)||'/menu.js').replace(/menu\.js.*$/,''),IX='';
  var L=[['/photogrammetrie-drone/','Photogrammétrie et 3D','Nuages de points, modèles 3D, orthophotos'],['/inspection-drone/','Inspection','Toitures, façades, bâtiments'],['/nettoyage-drone/','Nettoyage et démoussage','Par drone et à la perche'],['/captation-aerienne/','Photo et vidéo aérienne',''],['/realisations/','Réalisations',''],['/journal/','Journal de chantier',''],['/faq/','Questions fréquentes',''],['/a-propos/','À propos','']];
  var h='';L.forEach(function(l){h+='<a href="'+B+l[0].slice(1)+IX+'">'+l[1]+(l[2]?'<small>'+l[2]+'</small>':'')+'</a>';});
  h+='<a class="mnav-cta" href="'+B+(IX?'index.html':'')+'#contact">Demander un devis</a><a class="mnav-tel" href="tel:0759654934">07 59 65 49 34</a>';
  m.innerHTML=h;document.body.appendChild(m);
  function set(o){document.documentElement.classList.toggle('mnav-open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu');}
  b.addEventListener('click',function(){set(!document.documentElement.classList.contains('mnav-open'));});
  m.addEventListener('click',function(e){if(e.target.tagName==='A'||e.target.parentNode.tagName==='A')set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
})();
