(function(){
var d=document;
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var ANG=8,TOP=10,VIS=2.4,GAP=16;
// Hauteur de la roue : ~82 % de l'ecran (entre 460 et 740 px)
function getH(){var h=Math.round((window.innerHeight||700)*0.82);return Math.max(460,Math.min(h,740));}
var H=getH(),IH=H-2*TOP;
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var useRoue=true;try{useRoue=localStorage.getItem('tm-roue')!=='0';}catch(e){}
var ui=null,items=[],cells=[],rot=0,mk=null,key='',vel=0,raf=0,drag=null,moved=0,cw=300;
function mod(v,n){return ((v%n)+n)%n;}
var CSS=['.rw{position:relative;width:100%;margin:4px 0 10px}',
'.rw-st{position:relative;overflow:hidden;perspective:1100px;touch-action:pan-y;user-select:none;-webkit-user-select:none;border-radius:0;background:linear-gradient(#f4f1e6,#e6ecdf)}',
'.rw-it{position:absolute;left:0;top:'+TOP+'px;height:var(--rwih,600px);overflow:hidden;will-change:transform;border-radius:18px;background:#fff;pointer-events:none;backface-visibility:hidden;display:block!important;padding:0!important;margin:0!important;gap:0!important}',
'.rw-it.on{box-shadow:0 10px 26px rgba(0,0,0,.32);pointer-events:auto}',
'.rw-it .ac-card{margin:0!important;height:100%!important;width:100%!important;box-sizing:border-box;border-radius:18px;overflow:hidden;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important}',
'.rw-it .ac-main{display:flex!important;flex-direction:column!important;flex:1 1 auto;width:100%!important;max-width:100%!important;min-width:0!important;min-height:0;height:100%;padding:0!important;box-sizing:border-box}',
'.rw-it .ac-ph{display:flex!important;width:100%!important;height:auto!important;flex:1 1 46%!important;min-height:26%;max-height:72%;margin:0!important;border-radius:0!important;overflow:hidden}',
'.rw-it .ac-ph img{flex:1 1 0;min-width:0;min-height:0;width:50%!important;height:auto!important;align-self:stretch;object-fit:cover}',
'.rw-it .ac-ph.n1 img{width:100%!important}',
'.rw-it .ac-info{box-sizing:border-box;width:100%;min-width:0;padding:14px 16px!important;flex:0 0 auto;min-height:0;max-height:74%;overflow-x:hidden;overflow-y:auto}',
'.rw-it .ac-ti{font-size:1.3rem!important;line-height:1.22!important;margin:0 0 6px!important;overflow-wrap:anywhere;word-break:break-word}',
'.rw-it .ac-lo,.rw-it .ac-pr{font-size:1.02rem!important;line-height:1.3!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere;margin:0 0 5px!important}',
'.rw-it .ac-de{font-size:1rem!important;line-height:1.35!important;display:block!important;overflow:visible!important;white-space:pre-line;overflow-wrap:anywhere}',
'.rw-it .ac-act{display:none!important}',
'.rw-ar{position:absolute;top:18%;z-index:5;width:42px;height:42px;margin-top:-21px;padding:0;border-radius:50%;border:2px solid #FCD116;background:rgba(15,61,43,.85);color:#FCD116;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 3px 10px rgba(0,0,0,.35);animation:rwpv 1.3s ease-in-out infinite}',
'.rw-pv{left:6px}',
'.rw-nx{right:6px;animation-name:rwnx}',
'.rw.calme .rw-ar{animation:none;opacity:.65}',
'@keyframes rwpv{0%,100%{transform:translateX(0)}50%{transform:translateX(-5px)}}',
'@keyframes rwnx{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}',
'@media (prefers-reduced-motion:reduce){.rw-ar{animation:none}}',
'.rw-tg{margin-left:6px;padding:6px 10px;border-radius:10px;border:1px solid #0b6b45;background:#fff;color:#0b6b45;font-weight:600;cursor:pointer}'].join('');

function place(){
  var n=cells.length;if(!n)return;
  H=getH();IH=H-2*TOP;
  ui.stage.style.height=H+'px';
  ui.stage.style.setProperty('--rwih',IH+'px');
  var W=ui.stage.clientWidth||360;
  cw=Math.min(Math.round(W*0.86),460);
  var R=cw*0.95;
  for(var i=0;i<n;i++){
    var c=cells[i],a=mod(i-rot+n/2,n)-n/2,aa=Math.abs(a);
    if(aa>VIS){c.style.display='none';continue;}
    c.style.display='block';c.style.width=cw+'px';
    var x=W/2-cw/2+a*(cw+GAP),z=-Math.min(aa,2)*40;
    c.style.transform='translate3d('+x.toFixed(1)+'px,0,'+z.toFixed(1)+'px) rotateY('+(a*ANG).toFixed(1)+'deg)';
    c.style.opacity=String(1-0.25*Math.min(aa,2));
    c.style.zIndex=String(100-Math.round(aa*10));
    c.classList.toggle('on',aa<0.5);
  }
}
function build(){
  ui.stage.replaceChildren();cells=[];
  for(var i=0;i<items.length;i++){
    var w=el('div','ac-list m-moyen rw-it');
    w.append(mk(items[i]));ui.stage.append(w);cells.push(w);
  }
  place();
}
function stopAnim(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function norm(){var n=cells.length;if(n){rot=mod(rot,n);place();}}
function animTo(t,ms){
  stopAnim();var f=rot,s=performance.now();
  if(reduce||Math.abs(t-f)<0.001){rot=t;norm();return;}
  (function step(now){
    var p=Math.min(1,(now-s)/ms),e=1-Math.pow(1-p,3);
    rot=f+(t-f)*e;place();
    if(p<1)raf=requestAnimationFrame(step);else{raf=0;rot=t;norm();}
  })(s);
}
function snap(){animTo(Math.round(rot),220);}
function fling(){
  if(reduce){snap();return;}
  (function f(){
    if(drag){raf=0;return;}
    if(Math.abs(vel)<0.02){raf=0;snap();return;}
    rot+=vel;vel*=0.94;place();raf=requestAnimationFrame(f);
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
  var SV='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="';
  var pv=el('button','rw-ar rw-pv'),nx=el('button','rw-ar rw-nx');
  pv.type='button';nx.type='button';
  pv.setAttribute('aria-label','Annonce précédente');nx.setAttribute('aria-label','Annonce suivante');
  pv.innerHTML=SV+'M15 5l-7 7 7 7"/></svg>';nx.innerHTML=SV+'M9 5l7 7-7 7"/></svg>';
  wrap.append(pv,nx);ui.pv=pv;ui.nx=nx;
  function go(k){stopAnim();vel=0;wrap.classList.add('calme');animTo(Math.round(rot)+k,280);}
  pv.onclick=function(){go(-1);};nx.onclick=function(){go(1);};
  tg.onclick=function(){useRoue=!useRoue;try{localStorage.setItem('tm-roue',useRoue?'1':'0');}catch(e){}if(window.TrocAccRender)window.TrocAccRender();};
  stage.addEventListener('pointerdown',function(e){stopAnim();vel=0;moved=0;drag={x:e.clientX,id:e.pointerId,cap:0};});
  stage.addEventListener('pointermove',function(e){
    if(!drag)return;
    var dx=e.clientX-drag.x;drag.x=e.clientX;moved+=Math.abs(dx);
    if(moved>6&&!drag.cap){try{stage.setPointerCapture(drag.id);}catch(x){}drag.cap=1;ui.wrap.classList.add('calme');}
    var u=-dx/(cw*0.6);rot+=u;vel=0.6*vel+0.4*u;place();
  });
  function up(e){
    if(!drag)return;drag=null;
    if(moved>6){fling();return;}
    if(e&&e.type==='pointerup'&&e.target===stage){
      var r=stage.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2);
      if(Math.abs(dx)>cw*0.3){var k=Math.max(1,Math.round(Math.abs(dx)/(cw*0.75)));animTo(Math.round(rot)+(dx>0?k:-k),280);}
    }
  }
  stage.addEventListener('pointerup',up);
  stage.addEventListener('pointercancel',up);
  addEventListener('resize',function(){if(ui)place();});
}
window.TrocRoue={
goTo:function(i){
  var n=cells.length;if(!n)return false;
  i=mod(i<0?n+i:i,n);
  var cur=Math.round(rot),dl=mod(i-cur+n/2,n)-n/2;
  animTo(cur+dl,420);return true;
},
count:function(){return cells.length;},
draw:function(f,cardFn,l,cnt,more){
  ensure(l);mk=cardFn;
  ui.tg.textContent=useRoue?'▦ Liste':'🎡 Roue';
  if(!useRoue){ui.wrap.style.display='none';l.style.display='';return false;}
  l.style.display='none';more.style.display='none';
  var k=f.map(function(i){return i.id;}).join(',');
  if(k!==key){key=k;rot=0;}
  items=f;
  if(!f.length){ui.wrap.style.display='none';cnt.textContent='Aucune annonce trouvée.';return true;}
  ui.wrap.style.display='';
  cnt.textContent=f.length+' annonce'+(f.length>1?'s':'')+' · faites glisser, la roue tourne sans fin';
  ui.pv.style.display=ui.nx.style.display=f.length>1?'':'none';
  build();rot=mod(rot,f.length);place();
  return true;
}};
var box=d.getElementById('acc-annonces');
if(box&&box.querySelector('.ac-card')&&window.TrocAccRender)window.TrocAccRender();
})();
