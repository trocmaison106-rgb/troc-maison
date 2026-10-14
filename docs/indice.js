(function(){
// Texte affiche a cote de la main (modifiable ici)
var TEXTE='Annonces en haut';
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
btn.addEventListener('click',function(){
  var b=box();
  if(b){b.style.scrollMarginTop='72px';try{b.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}catch(e){b.scrollIntoView();}}
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
