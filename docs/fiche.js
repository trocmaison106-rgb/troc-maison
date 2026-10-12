(function(){
var d=document,st=d.createElement('style');
st.textContent='.dt-sl{position:relative;margin:0 0 10px}'
+'.dt-tr{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none;border-radius:14px}'
+'.dt-tr::-webkit-scrollbar{display:none}'
+'.dt-tr img.grande{flex:0 0 100%;width:100%!important;max-width:100%!important;height:230px!important;max-height:230px!important;object-fit:cover;scroll-snap-align:center;border-radius:14px;margin:0!important;display:block}'
+'.dt-dots{display:flex;justify-content:center;gap:6px;margin-top:6px}'
+'.dt-dots i{width:8px;height:8px;border-radius:50%;background:#c9c4b0;display:block}.dt-dots i.on{background:#0b6b45}'
+'.dt-n{position:absolute;right:8px;top:8px;background:rgba(0,0,0,.55);color:#fff;font-size:.75rem;padding:2px 8px;border-radius:10px}';
d.head.appendChild(st);
var t=0;
function build(p,imgs){
  var sl=d.createElement('div');sl.className='dt-sl';
  var tr=d.createElement('div');tr.className='dt-tr';
  p.insertBefore(sl,imgs[0]);sl.appendChild(tr);
  imgs.forEach(function(i){tr.appendChild(i);});
  if(imgs.length<2)return;
  var n=d.createElement('div');n.className='dt-n';n.textContent='1/'+imgs.length;sl.appendChild(n);
  var dots=d.createElement('div');dots.className='dt-dots';
  imgs.forEach(function(_,k){var e=d.createElement('i');if(!k)e.className='on';dots.appendChild(e);});
  sl.appendChild(dots);
  tr.addEventListener('scroll',function(){
    var k=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));
    n.textContent=(k+1)+'/'+imgs.length;
    [].forEach.call(dots.children,function(e,j){e.className=j===k?'on':'';});
  },{passive:true});
}
function run(){
  var done=[];
  d.querySelectorAll('img.grande').forEach(function(i){
    var p=i.parentElement;
    if(!p||p.classList.contains('dt-tr')||done.indexOf(p)>-1)return;
    done.push(p);
    var imgs=[].filter.call(p.children,function(c){return c.tagName==='IMG'&&c.classList.contains('grande');});
    if(imgs.length)build(p,imgs);
  });
}
new MutationObserver(function(){cancelAnimationFrame(t);t=requestAnimationFrame(run);}).observe(d.body,{childList:true,subtree:true});
run();
})();
