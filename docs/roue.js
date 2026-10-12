(function(){
var d=document;
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var ANG=30,H=300,TOP=10,VIS=2.4;
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var useRoue=true;try{useRoue=localStorage.getItem('tm-roue')!=='0';}catch(e){}
var ui=null,items=[],cells=[],rot=0,mk=null,key='',vel=0,raf=0,drag=null,moved=0,cw=250;
function mod(v,n){return ((v%n)+n)%n;}
var IH=H-2*TOP;
var CSS=['.rw{margin:4px 0 10px}',
'.rw-st{position:relative;height:'+H+'px;overflow:hidden;perspective:1000px;touch-action:pan-y;user-select:none;-webkit-user-select:none;border-radius:16px;background:linear-gradient(#f4f1e6,#e6ecdf)}',
'.rw-it{position:absolute;left:0;top:'+TOP+'px;height:'+IH+'px;overflow:hidden;will-change:transform;border-radius:16px;background:#fff;pointer-events:none;backface-visibility:hidden;display:block!important;padding:0!important;margin:0!important;gap:0!important}',
'.rw-it.on{box-shadow:0 8px 22px rgba(0,0,0,.3);pointer-events:auto}',
'.rw-it .ac-card{margin:0!important;height:100%!important;box-sizing:border-box;border-radius:16px;overflow:hidden}',
'.rw-it .ac-main{display:flex!important;flex-direction:column!important;height:100%;padding:0!important}',
'.rw-it .ac-ph{display:flex!important;width:100%!important;height:122px!important;flex:none;margin:0!important;border-radius:0!important}',
'.rw-it .ac-ph img{flex:1 1 0;min-width:0;width:50%!important;height:100%!important;object-fit:cover}',
'.rw-it .ac-ph.n1 img{width:100%!important}',
'.rw-it .ac-info{padding:8px 12px!important;overflow:hidden;flex:1;min-height:0}',
'.rw-it .ac-ti{font-size:1rem!important;line-height:1.2!important;margin:0 0 3px!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
'.rw-it .ac-lo,.rw-it .ac-pr{font-size:.82rem!important;line-height:1.25!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 0 2px!important}',
'.rw-it .ac-de{font-size:.8rem!important;line-height:1.25!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
'.rw-it .ac-act{display:none!important}',
'.rw-tg{margin-left:6px;padding:6px 10px;border-radius:10px;border:1px solid #0b6b45;background:#fff;color:#0b6b45;font-weight:600;cursor:pointer}'].join('');

function place(){
  var n=cells.length;if(!n)return;
  var W=ui.stage.clientWidth||360;
  cw=Math.min(Math.round(W*0.74),300);
  var R=cw*1.5;
  for(var i=0;i<n;i++){
    var c=cells[i],a=mod(i-rot+n/2,n)-n/2,aa=Math.abs(a);
    if(aa>VIS){c.style.display='none';continue;}
    c.style.display='block';c.style.width=cw+'px';
    var th=a*ANG*Math.PI/180,x=W/2+R*Math.sin(th)-cw/2,z=-R*(1-Math.cos(th))*0.9;
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
    if(Math.abs(vel)<0.004){raf=0;snap();return;}
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
  tg.onclick=function(){useRoue=!useRoue;try{localStorage.setItem('tm-roue',useRoue?'1':'0');}catch(e){}if(window.TrocAccRender)window.TrocAccRender();};
  stage.addEventListener('pointerdown',function(e){stopAnim();vel=0;moved=0;drag={x:e.clientX,id:e.pointerId,cap:0};});
  stage.addEventListener('pointermove',function(e){
    if(!drag)return;
    var dx=e.clientX-drag.x;drag.x=e.clientX;moved+=Math.abs(dx);
    if(moved>6&&!drag.cap){try{stage.setPointerCapture(drag.id);}catch(x){}drag.cap=1;}
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
window.TrocRoue={draw:function(f,cardFn,l,cnt,more){
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
  build();rot=mod(rot,f.length);place();
  return true;
}};
var box=d.getElementById('acc-annonces');
if(box&&box.querySelector('.ac-card')&&window.TrocAccRender)window.TrocAccRender();
})();
