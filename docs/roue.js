(function(){
var d=document;
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var ANG=36,PAGE=20,H=176,TOP=14,VIS=2.6;
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var useRoue=true;try{useRoue=localStorage.getItem('tm-roue')!=='0';}catch(e){}
var ui=null,items=[],cells=[],rot=0,sel=-1,lim=PAGE,mk=null,key='',vel=0,raf=0,drag=null,moved=0,cw=240;
function clamp(v){return Math.max(0,Math.min(Math.max(0,cells.length-1),v));}
var CSS=['.rw{margin:4px 0 10px}',
'.rw-st{position:relative;height:'+H+'px;overflow:hidden;perspective:900px;touch-action:pan-y;user-select:none;-webkit-user-select:none;border-radius:16px;background:linear-gradient(#f4f1e6,#e6ecdf)}',
'.rw-it{position:absolute;left:0;top:'+TOP+'px;height:'+(H-TOP-8)+'px;overflow:hidden;will-change:transform;border-radius:16px;background:#fff;pointer-events:none;backface-visibility:hidden}',
'.rw-it .ac-card{margin:0;height:100%;box-sizing:border-box}',
'.rw-it.ac-list{display:block!important;padding:0!important;gap:0!important}',
'.rw-it.on{box-shadow:0 8px 22px rgba(0,0,0,.28);pointer-events:auto}',
'.rw-tg{margin-left:6px;padding:6px 10px;border-radius:10px;border:1px solid #0b6b45;background:#fff;color:#0b6b45;font-weight:600;cursor:pointer}'].join('');

function place(){
  var W=ui.stage.clientWidth||360;
  cw=Math.min(Math.round(W*0.7),300);
  var R=cw*0.95;
  for(var i=0;i<cells.length;i++){
    var c=cells[i],a=i-rot,aa=Math.abs(a);
    if(aa>VIS){c.style.display='none';continue;}
    c.style.display='';c.style.width=cw+'px';
    var th=a*ANG*Math.PI/180,x=W/2+R*Math.sin(th)-cw/2,z=-R*(1-Math.cos(th))*0.9;
    c.style.transform='translate3d('+x.toFixed(1)+'px,0,'+z.toFixed(1)+'px) rotateY('+(a*ANG).toFixed(1)+'deg)';
    c.style.opacity=String(1-0.28*Math.min(aa,2));
    c.style.zIndex=String(100-Math.round(aa*10));
    c.classList.toggle('on',aa<0.5);
  }
}
function build(){
  var n=Math.min(items.length,lim),m='moyen';
  try{m=localStorage.getItem('tm-mode')||'moyen';}catch(e){}
  ui.stage.replaceChildren();cells=[];
  for(var i=0;i<n;i++){
    var w=el('div','ac-list m-'+m+' rw-it');
    w.append(mk(items[i]));ui.stage.append(w);cells.push(w);
  }
  place();
}
function setSel(i){
  if(i<0||i>=cells.length)return;sel=i;
  if(i>=cells.length-3&&cells.length<items.length){lim+=PAGE;var r=rot;build();rot=r;place();}
}
function stopAnim(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function animTo(t,ms){
  stopAnim();t=clamp(t);var f=rot,s=performance.now();
  if(reduce||Math.abs(t-f)<0.001){rot=t;place();setSel(Math.round(rot));return;}
  (function step(now){
    var p=Math.min(1,(now-s)/ms),e=1-Math.pow(1-p,3);
    rot=f+(t-f)*e;place();
    if(p<1)raf=requestAnimationFrame(step);else{raf=0;setSel(Math.round(rot));}
  })(s);
}
function snap(){animTo(Math.round(rot),220);}
function fling(){
  if(reduce){snap();return;}
  (function f(){
    if(drag){raf=0;return;}
    if(Math.abs(vel)<0.004){raf=0;snap();return;}
    var n=clamp(rot+vel);if(n!==rot+vel)vel=0;
    rot=n;vel*=0.94;place();raf=requestAnimationFrame(f);
  })();
}
function ensure(l){
  if(ui)return;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var wrap=el('div','rw'),stage=el('div','rw-st'),tg=el('button','rw-tg');
  tg.type='button';wrap.append(stage);
  l.parentNode.insertBefore(wrap,l);
  var bar=l.parentNode.querySelector('.ac-modes');
  if(bar)bar.parentNode.appendChild(tg);else wrap.prepend(tg);
  ui={wrap:wrap,stage:stage,tg:tg};
  tg.onclick=function(){useRoue=!useRoue;try{localStorage.setItem('tm-roue',useRoue?'1':'0');}catch(e){}if(window.TrocAccRender)window.TrocAccRender();};
  stage.addEventListener('pointerdown',function(e){stopAnim();vel=0;moved=0;drag={x:e.clientX,id:e.pointerId,cap:0};});
  stage.addEventListener('pointermove',function(e){
    if(!drag)return;
    var dx=e.clientX-drag.x;drag.x=e.clientX;moved+=Math.abs(dx);
    if(moved>6&&!drag.cap){try{stage.setPointerCapture(drag.id);}catch(x){}drag.cap=1;}
    var u=-dx/(cw*0.55);rot=clamp(rot+u);vel=0.6*vel+0.4*u;place();
  });
  function up(e){
    if(!drag)return;drag=null;
    if(moved>6){fling();return;}
    if(e&&e.target===stage&&e.type==='pointerup'){
      var r=stage.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2);
      if(Math.abs(dx)>cw*0.3)animTo(Math.round(rot)+(dx>0?1:-1),260);
    }
  }
  stage.addEventListener('pointerup',up);
  stage.addEventListener('pointercancel',up);
  addEventListener('resize',function(){if(ui)place();});
}
window.TrocRoue={draw:function(f,cardFn,l,cnt,more){
  ensure(l);mk=cardFn;
  ui.tg.textContent=useRoue?'▦ Liste':'🎡 Roue';
  if(!useRoue){ui.wrap.style.display='none';l.style.display='';return false;}
  l.style.display='none';
  var k=f.map(function(i){return i.id;}).join(',');
  if(k!==key){key=k;lim=PAGE;rot=0;sel=-1;}
  items=f;more.style.display='none';
  if(!f.length){ui.wrap.style.display='none';cnt.textContent='Aucune annonce trouvée.';return true;}
  ui.wrap.style.display='';
  cnt.textContent=f.length+' annonce'+(f.length>1?'s':'')+' · faites glisser vers la gauche ou la droite';
  var keep=rot;build();rot=clamp(keep);place();setSel(Math.round(rot));
  return true;
}};
var box=d.getElementById('acc-annonces');
if(box&&box.querySelector('.ac-card')&&window.TrocAccRender)window.TrocAccRender();
})();
