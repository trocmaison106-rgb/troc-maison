(function(){
  var st=document.createElement('style');
  st.textContent='.ac-list>*:first-child{scroll-margin-top:72px}';
  document.head.appendChild(st);
  var touch=0,force=0,vu=false;
  ['touchstart','touchmove','wheel'].forEach(function(e){
    addEventListener(e,function(){touch=Date.now();},{passive:true});
  });
  addEventListener('click',function(){force=Date.now();},true);
  function aller(){
    var l=document.querySelector('.ac-list');
    if(!l||!l.firstElementChild)return;
    l.firstElementChild.scrollIntoView({behavior:'smooth',block:'start'});
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting&&!vu){
        vu=true;
        var manuel=Date.now()-touch<1500&&Date.now()-force>1500;
        if(!manuel)setTimeout(aller,350);
      }
      if(!e.isIntersecting)vu=false;
    });
  },{threshold:0.2});
  function brancher(){
    var l=document.querySelector('.ac-list');
    if(l&&!l.dataset.io){l.dataset.io='1';io.observe(l);}
  }
  new MutationObserver(brancher).observe(document.documentElement,{childList:true,subtree:true});
  brancher();
})();
