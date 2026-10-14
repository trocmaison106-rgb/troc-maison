(function(){
  function init(){
    var b=[].slice.call(document.querySelectorAll('button[data-go="parcourir"]')).find(function(e){return /Retour aux annonces/.test(e.textContent);});
    if(!b)return;
    var v=b.closest('section')||b.parentElement;
    if(!v||v.querySelector('.x-close'))return;
    if(getComputedStyle(v).position==='static')v.style.position='relative';
    var x=document.createElement('button');
    x.type='button';x.className='x-close';x.setAttribute('aria-label','Fermer');x.textContent='✕';
    x.addEventListener('click',function(){b.click();});
    v.prepend(x);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
