addEventListener('error',function(e){
  var i=e.target;if(!i||i.tagName!=='IMG')return;
  var s=i.getAttribute('src')||'(vide)';
  var t=document.createElement('div');
  t.style.cssText='position:fixed;left:8px;right:8px;bottom:90px;z-index:99999;background:#a10020;color:#fff;padding:10px;font-size:.72rem;border-radius:10px;word-break:break-all';
  t.textContent='Image KO : '+s.slice(0,160);
  document.body.appendChild(t);setTimeout(function(){t.remove();},20000);
},true);
