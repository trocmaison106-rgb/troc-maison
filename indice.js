(function(){
// Texte affiche a cote de la main (modifiable ici)
var TEXTE='Annonces en haut';
// Carte sur laquelle la roue s'arrete au clic : 'recente' (1re de la roue = annonce la plus recente)
// ou 'derniere' (derniere carte de la liste)
var CARTE='recente';
var d=document;
if(d.getElementById('tm-indice'))return;
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var st=d.createElement('style');
st.textContent=[
'#tm-indice{position:fixed;left:50%;top:66px;transform:translateX(-50%);z-index:900;display:none;align-items:center;gap:8px;padding:8px 16px 8px 12px;border-radius:999px;background:#0F3D2B;color:#fff;border:2px solid #FCD116;font:700 14px/1.2 system-ui,-apple-system,Roboto,sans-serif;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.3);cursor:pointer;opacity:0;transition:opacity .35s;-webkit-tap-highlight-color:transparent}',
'#tm-indice.on{display:flex}',
'#tm-indice.vu{opacity:1}',
'#tm-indice .tm-main{font-size:26px;line-height:1;display:inline-block;animation:tmmain 2.4s ease-in-out infinite}',
'@keyframes tmmain{0%,72%,100%{transform:translateY(5px)}12%,36%,60%{transform:translateY(-8px)}24%,48%{transform:translateY(5px)}}',
'@media (prefers-reduced-motion:reduce){#tm-indice .tm-main{animation:none}}'
].join('');
d.head.appendChild(st);
var btn=d.createElement('button');
btn.id='tm-indice';btn.type='button';
btn.setAttribute('aria-label','Aller aux annonces en haut de la page');
var m=d.createElement('span');m.className='tm-main';m.setAttribute('aria-hidden','true');m.textContent='\u261D\uFE0F';
var t=d.createElement('span');t.textContent=TEXTE;
btn.append(m,t);d.body.appendChild(btn);
var fini=false,shown=false,hideT=0,poll=0,t0=Date.now();
function box(){return d.getElementById('acc-annonces');}
function enHaut(){var b=box();if(!b)return false;var r=b.getBoundingClientRect();return r.height>80&&r.bottom<90;}
function hide(){
  fini=true;clearInterval(poll);clearTimeout(hideT);
  btn.classList.remove('vu');
  setTimeout(function(){btn.classList.remove('on');},380);
}
function show(){
  shown=true;btn.classList.add('on');
  requestAnimationFrame(function(){requestAnimationFrame(function(){btn.classList.add('vu');});});
  hideT=setTimeout(hide,10000);
}
// Zone visible de la page, entre l'en-tete fixe et la barre du bas
function bande(){
  var vh=innerHeight,hh=0,nh=0;
  function fix(e){while(e&&e!==d.body&&e!==d.documentElement){var p=getComputedStyle(e).position;if(p==='fixed'||p==='sticky')return e;e=e.parentElement;}return null;}
  var fa=fix(d.elementFromPoint(innerWidth/2,4)),fb=fix(d.elementFromPoint(innerWidth/2,vh-4));
  if(fa){var r=fa.getBoundingClientRect();if(r.bottom<vh*0.3)hh=r.bottom;}
  if(fb){var q=fb.getBoundingClientRect();if(q.top>vh*0.7)nh=vh-q.top;}
  return [hh||57,nh||56];
}
function centrer(){
  var b=box();if(!b)return;
  var st=b.querySelector('.rw-st')||b;
  var bd=bande(),vh=innerHeight;
  function delta(){var r=st.getBoundingClientRect();return (r.top+r.height/2)-(bd[0]+(vh-bd[0]-bd[1])/2);}
  var dy=delta();
  var avant=st.getBoundingClientRect().top;
  try{scrollBy({top:dy,left:0,behavior:reduce?'auto':'smooth'});}catch(e){scrollBy(0,dy);}
  // Secours si la page defile dans un autre conteneur que la fenetre
  setTimeout(function(){
    if(Math.abs(delta())>8){
      st.style.scrollMarginTop=bd[0]+'px';st.style.scrollMarginBottom=bd[1]+'px';
      try{st.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){st.scrollIntoView();}
    }
  },900);
}
btn.addEventListener('click',function(){
  if(window.TrocRoue&&window.TrocRoue.goTo){window.TrocRoue.goTo(CARTE==='derniere'?-1:0);}
  centrer();
  hide();
});
poll=setInterval(function(){
  if(fini)return;
  if(!shown){
    if(enHaut())show();
    else if(Date.now()-t0>25000){fini=true;clearInterval(poll);}
  }else if(!enHaut()){hide();}
},500);
})();
