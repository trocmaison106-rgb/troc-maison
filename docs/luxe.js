(function(){
const d=document,q=s=>d.querySelector(s),H=d.documentElement;
/* Tuiles de luxe sur l'accueil */
const home=q('[data-view=accueil]');
if(home&&!q('.ts-tiles')){
  const t=d.createElement('div');t.className='ts-tiles';
  [['🛍️','Annonces','ads'],['➕','Publier','pub'],['💡','Comment ça marche','how'],['🛡️','Sécurité','rules']].forEach(a=>{
    const b=d.createElement('button');b.className='ts-tile';b.innerHTML='<span>'+a[0]+'</span>'+a[1];
    b.onclick=()=>{const x=q('.ts-drawer [data-t="'+a[2]+'"]');if(x)x.click();};
    t.appendChild(b);
  });
  const btn=home.querySelector('.btn');
  btn?home.insertBefore(t,btn):home.appendChild(t);
}
/* Effet d'onde au toucher */
d.addEventListener('pointerdown',e=>{
  const el=e.target.closest('.btn,.ts-tile,.etapes li');if(!el)return;
  const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height),sp=d.createElement('span');
  sp.className='ts-rip';sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
  el.style.position='relative';el.style.overflow='hidden';el.appendChild(sp);setTimeout(()=>sp.remove(),650);
});
/* Écran de démarrage */
if(!H.classList.contains('ts-splash'))return;
const o=d.createElement('div');o.className='ts-splash-o';
const letters=(w,g,off)=>[...w].map((c,i)=>'<span class="'+(g?'g':'')+'" style="--i:'+(i+off)+'">'+c+'</span>').join('');
o.innerHTML='<div class="ts-s-logo"><div class="ts-s-ring"></div><img src="icons/icon-192.png" alt=""></div>'
 +'<div class="ts-s-name">'+letters('TROC',0,0)+'<span class="sp"></span>'+letters('MAISON',1,5)+'</div>'
 +'<div class="ts-s-tag">DONNEZ · TROQUEZ · RÉEMPLOYEZ</div><div class="ts-s-bar"><i></i></div>';
for(let i=0;i<16;i++){const p=d.createElement('i');p.className='ts-p';
  p.style.cssText='left:'+Math.random()*100+'%;animation-duration:'+(3+Math.random()*3)+'s;animation-delay:'+Math.random()*2.5+'s;width:'+(3+Math.random()*5)+'px;height:'+(3+Math.random()*5)+'px';o.appendChild(p);}
d.body.appendChild(o);
let done=false;
function fin(){
  if(done)return;done=true;
  try{sessionStorage.setItem('ts_s','1');}catch(e){}
  H.classList.remove('ts-splash');
  const v=q('[data-view]:not([hidden])');
  if(v){v.hidden=true;void v.offsetWidth;v.hidden=false;}   /* relance l'animation d'entrée */
  o.classList.add('out');setTimeout(()=>o.remove(),900);
}
setTimeout(fin,2900);o.addEventListener('click',fin);
})();
