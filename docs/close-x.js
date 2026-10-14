(function(){
  var x=document.createElement('button');
  x.type='button';x.className='x-close';x.setAttribute('aria-label','Fermer');x.textContent='✕';
  x.style.display='none';
  document.body.appendChild(x);
  function btn(){return [].slice.call(document.querySelectorAll('button[data-go="parcourir"]')).find(function(e){return /Retour aux annonces/.test(e.textContent);});}
  x.addEventListener('click',function(){var b=btn();if(b)b.click();});
  setInterval(function(){var b=btn();x.style.display=(b&&b.offsetParent!==null)?'block':'none';},400);
})();
