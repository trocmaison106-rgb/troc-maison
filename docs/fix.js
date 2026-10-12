(function(){
const d=document,q=s=>d.querySelector(s),H=d.documentElement;
/* Sens de glissement des pages */
const ORD={accueil:0,inscription:0,connexion:0,reset:0,publier:1,parcourir:2,detail:2,mesobjets:3,profil:4};
let last=0;const m=q('main');
if(m)new MutationObserver(()=>{
  const v=q('[data-view]:not([hidden])');if(!v)return;
  const n=ORD[v.dataset.view];if(n===undefined||n===last)return;
  H.dataset.dir=n<last?'back':'fwd';last=n;
}).observe(m,{attributes:true,subtree:true,attributeFilter:['hidden']});
/* Trait jaune sous l'onglet ouvert */
const bar=q('.ts-bottom');
if(bar){
  const ind=d.createElement('i');ind.className='ts-ind';bar.appendChild(ind);
  const place=()=>{const on=bar.querySelector('button.on');
    if(!on){ind.style.opacity=0;return;}
    ind.style.opacity=1;ind.style.transform='translateX('+(on.offsetLeft+on.offsetWidth/2-14)+'px)';};
  new MutationObserver(place).observe(bar,{attributes:true,subtree:true,attributeFilter:['class']});
  addEventListener('resize',place);setTimeout(place,300);place();
}
/* Cartes d'annonces : cadre photo carré, images cassées retirées */
const cnt=b=>{b.dataset.n=b.querySelectorAll('img').length;};
function fixCard(c){
  if(c.querySelector('.ts-photo'))return;
  const imgs=[...c.querySelectorAll('img')];if(!imgs.length)return;
  const box=d.createElement('div');box.className='ts-photo';
  const olds=new Set(imgs.map(i=>i.parentElement));
  imgs.slice(0,4).forEach(i=>box.appendChild(i));
  imgs.slice(4).forEach(i=>i.remove());
  const host=c.querySelector('.carte-btn')||c;
  host.insertBefore(box,host.firstChild);
  olds.forEach(p=>{if(p&&p!==host&&p!==c&&!p.querySelector('img')&&!p.textContent.trim())p.remove();});
  cnt(box);
}
d.addEventListener('error',e=>{
  const i=e.target;if(!i||i.tagName!=='IMG'||!i.closest('.carte'))return;
  const b=i.closest('.ts-photo');i.remove();if(b)cnt(b);
},true);
let t;const run=()=>{cancelAnimationFrame(t);t=requestAnimationFrame(()=>d.querySelectorAll('.carte').forEach(fixCard));};
new MutationObserver(run).observe(d.body,{childList:true,subtree:true});run();
})();
/* Diagnostic temporaire : affiche toute erreur JavaScript en haut de l'écran */
addEventListener('error',e=>{if(!e.message)return;const t=document.createElement('div');
t.style.cssText='position:fixed;top:60px;left:8px;right:8px;z-index:9999;background:#b00020;color:#fff;padding:8px;font-size:.7rem;border-radius:8px';
t.textContent=e.message+' ('+(e.filename||'').split('/').pop()+':'+e.lineno+')';document.body.appendChild(t);setTimeout(()=>t.remove(),9000);});
/* Navigation : ferme la fenêtre ouverte, explique la redirection si non connecté */
(function(){
const d=document;
function toast(t){const o=d.querySelector('.ts-toast');if(o)o.remove();
  const e=d.createElement('div');e.className='ts-toast';e.textContent=t;d.body.appendChild(e);setTimeout(()=>e.remove(),2600);}
d.addEventListener('click',e=>{
  const b=e.target.closest('[data-t]');if(!b)return;
  const s=d.querySelector('#ts-sheet');if(s)s.classList.remove('on');
  const logged=!!d.querySelector('#ts-user .ts-dot');
  if(!logged&&['pub','ads','mine','prof'].indexOf(b.dataset.t)>-1)toast('Connectez-vous pour accéder à cette page');
},true);
})();
