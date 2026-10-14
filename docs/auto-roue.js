(function(){
  var st=document.createElement('style');
  st.textContent='.tm-roue-tete{scroll-margin-top:72px}';
  document.head.appendChild(st);
  var touch=0,force=0,vu=false;
  ['touchstart','touchmove','wheel'].forEach(function(e){
    addEventListener(e,function(){touch=Date.now();},{passive:true});
  });
  addEventListener('click',function(){force=Date.now();},true);
  function tete(n){
    if(window.TrocRoue&&window.TrocRoue.goTo(0))return;
    if(n<8)setTimeout(function(){tete(n+1);},250);
  }
  function aller(ar){
    var w=ar.parentNode;
    if(w){w.classList.add('tm-roue-tete');
      try{w.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){w.scrollIntoView();}}
    tete(0);
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting&&!vu){
        vu=true;
        var manuel=Date.now()-touch<1500&&Date.now()-force>1500;
        if(!manuel)setTimeout(function(){aller(e.target);},350);
      }
      if(!e.isIntersecting)vu=false;
    });
  },{threshold:0.2});
  function brancher(){
    var ar=document.querySelector('.rw-ar');
    if(ar&&!ar.dataset.io){ar.dataset.io='1';io.observe(ar);}
  }
  new MutationObserver(brancher).observe(document.documentElement,{childList:true,subtree:true});
  brancher();
})();
