(function(){
var d=document;
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var STEP=24,R=200,B=64,TOPY=80,PAGE=20,DEG=180/(Math.PI*R);
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var useRoue=true;try{useRoue=localStorage.getItem('tm-roue')!=='0';}catch(e){}
var ui=null,items=[],bubs=[],rot=0,sel=-1,lim=PAGE,mk=null,list=null,key='',vel=0,raf=0,drag=null,moved=0;
function fcfa(n){return n?Number(n).toLocaleString('fr-FR')+' FCFA':'';}
function clamp(v){var m=Math.max(0,(bubs.length-1)*STEP);return Math.max(0,Math.min(m,v));}
var CSS=['.rw{margin:4px 0 10px}',
'.rw-st{position:relative;height:180px;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none;border-radius:16px;background:rgba(11,107,69,.07)}',
'.rb{position:absolute;left:0;top:0;width:64px;height:64px;border-radius:50%;border:3px solid #fff;padding:0;overflow:hidden;background:#eee;box-shadow:0 2px 8px rgba(0,0,0,.25);font-size:1.6rem;will-change:transform;cursor:pointer}',
'.rb img{width:100%;height:100%;object-fit:cover;pointer-events:none;display:block}',
'.rb.on{border-color:#f5b800;box-shadow:0 0 0 3px rgba(245,184,0,.5),0 4px 12px rgba(0,0,0,.3)}',
'.rw-lab{text-align:center;font-weight:700;color:#0b6b45;margin:8px 0 2px;font-size:1rem}',
'.rw-tg{margin-left:6px;padding:6px 10px;border-radius:10px;border:1px solid #0b6b45;background:#fff;color:#0b6b45;font-weight:600;cursor:pointer}'].join('');

function place(){
  var W=ui.stage.clientWidth||360,cy=TOPY+R;
  for(var i=0;i<bubs.length;i++){
    var a=i*STEP-rot,b=bubs[i];
    if(Math.abs(a)>75){b.style.display='none';continue;}
    b.style.display='';
    var r=a*Math.PI/180,x=W/2+R*Math.sin(r)-B/2,y=cy-R*Math.cos(r)-B/2,s=1-0.4*Math.min(Math.abs(a)/60,1);
    b.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+s.toFixed(3)+')';
    b.style.zIndex=String(100-Math.round(Math.abs(a)));
  }
}
function mark(){bubs.forEach(function(b,i){b.classList.toggle('on',i===sel);});}
function build(){
  var n=Math.min(items.length,lim);
  ui.stage.replaceChildren();bubs=[];
  for(var i=0;i<n;i++){(function(i){
    var it=items[i],b=el('button','rb');b.type='button';b.setAttribute('aria-label',it.titre||'Annonce');
    var p=(it.photos||[])[0];
    if(p){var im=el('img');im.src=p;im.alt='';im.loading='lazy';im.onerror=function(){im.remove();b.textContent='📦';};b.append(im);}
    else b.textContent='📦';
    b.onclick=function(){if(moved>6)return;goTo(i);};
    ui.stage.append(b);bubs.push(b);
  })(i);}
  mark();place();
}
function setSel(i){
  if(i<0||i>=bubs.length||!items[i])return;
  var changed=i!==sel;sel=i;mark();
  var it=items[i];
  ui.lab.textContent=(it.titre||'Objet')+(it.valeurEstimee?' · '+fcfa(it.valeurEstimee):'');
  if(changed||!list.firstChild){
    var m='moyen';try{m=localStorage.getItem('tm-mode')||'moyen';}catch(e){}
    list.className='ac-list m-'+m;list.replaceChildren(mk(it));
  }
  if(i>=bubs.length-3&&bubs.length<items.length){lim+=PAGE;build();}
}
function stopAnim(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function animTo(t,ms){
  stopAnim();t=clamp(t);var f=rot,s=performance.now();
  if(reduce||Math.abs(t-f)<0.01){rot=t;place();setSel(Math.round(rot/STEP));return;}
  (function step(now){
    var p=Math.min(1,(now-s)/ms),e=1-Math.pow(1-p,3);
    rot=f+(t-f)*e;place();
    if(p<1)raf=requestAnimationFrame(step);else{raf=0;setSel(Math.round(rot/STEP));}
  })(s);
}
function goTo(i){animTo(i*STEP,260);}
function snap(){animTo(Math.round(rot/STEP)*STEP,200);}
function fling(){
  if(reduce){snap();return;}
  (function f(){
    if(drag){raf=0;return;}
    if(Math.abs(vel)<0.05){raf=0;snap();return;}
    var n=clamp(rot+vel);if(n!==rot+vel)vel=0;
    rot=n;vel*=0.95;place();raf=requestAnimationFrame(f);
  })();
}
function ensure(l){
  if(ui)return;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var wrap=el('div','rw'),stage=el('div','rw-st'),lab=el('div','rw-lab'),tg=el('button','rw-tg');
  tg.type='button';wrap.append(stage,lab);
  l.parentNode.insertBefore(wrap,l);
  var bar=l.parentNode.querySelector('.ac-modes');
  if(bar)bar.parentNode.appendChild(tg);else wrap.prepend(tg);
  ui={wrap:wrap,stage:stage,lab:lab,tg:tg};
  tg.onclick=function(){useRoue=!useRoue;try{localStorage.setItem('tm-roue',useRoue?'1':'0');}catch(e){}if(window.TrocAccRender)window.TrocAccRender();};
  stage.addEventListener('pointerdown',function(e){stopAnim();vel=0;moved=0;drag={x:e.clientX,id:e.pointerId,cap:0};});
  stage.addEventListener('pointermove',function(e){
    if(!drag)return;
    var dx=e.clientX-drag.x;drag.x=e.clientX;moved+=Math.abs(dx);
    if(moved>6&&!drag.cap){try{stage.setPointerCapture(drag.id);}catch(x){}drag.cap=1;}
    rot=clamp(rot-dx*DEG);vel=0.6*vel+0.4*(-dx*DEG);place();
  });
  function up(){if(!drag)return;drag=null;if(moved>6)fling();}
  stage.addEventListener('pointerup',up);
  stage.addEventListener('pointercancel',up);
  addEventListener('resize',function(){if(ui)place();});
}
window.TrocRoue={draw:function(f,cardFn,l,cnt,more){
  ensure(l);mk=cardFn;list=l;
  ui.tg.textContent=useRoue?'▦ Liste':'🎡 Roue';
  if(!useRoue){ui.wrap.style.display='none';return false;}
  var k=f.map(function(i){return i.id;}).join(',');
  if(k!==key){key=k;lim=PAGE;rot=0;sel=-1;}
  items=f;more.style.display='none';
  if(!f.length){ui.wrap.style.display='none';l.replaceChildren();cnt.textContent='Aucune annonce trouvée.';return true;}
  ui.wrap.style.display='';
  cnt.textContent=f.length+' annonce'+(f.length>1?'s':'')+' · faites tourner la roue';
  build();
  var keep=sel<0?0:sel;sel=-1;
  setSel(Math.max(0,Math.min(keep,bubs.length-1)));
  return true;
}};
var box=d.getElementById('acc-annonces');
if(box&&box.querySelector('.ac-card')&&window.TrocAccRender)window.TrocAccRender();
})();
