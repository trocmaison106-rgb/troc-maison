(function(){
  var NOMS=['Liste','Description','Fiche intégrale'];
  var st=document.createElement('style');
  st.textContent='.ac-modes button{display:inline-flex!important;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:auto!important;min-height:44px;padding:5px 8px!important;line-height:1}'
  +'.ac-modes button .ml{font-size:9.5px;font-weight:600;letter-spacing:.2px;white-space:nowrap;color:inherit;opacity:.9}'
  +'.ac-modes-cap{width:100%;text-align:center;font-size:10.5px;color:#5c6b5c;margin:4px 0 6px;letter-spacing:.3px}';
  document.head.appendChild(st);
  function deco(){
    document.querySelectorAll('.ac-modes').forEach(function(m){
      if(m.dataset.lab)return;
      var bs=m.querySelectorAll('button');
      if(bs.length<3)return;
      m.dataset.lab='1';
      bs.forEach(function(b,i){
        var s=document.createElement('span');
        s.className='ml';s.textContent=NOMS[i]||'';
        b.appendChild(s);
        b.setAttribute('aria-label',NOMS[i]||'');
      });
      var c=document.createElement('div');
      c.className='ac-modes-cap';c.textContent="Modes d'affichage";
      m.insertAdjacentElement('afterend',c);
    });
  }
  new MutationObserver(deco).observe(document.documentElement,{childList:true,subtree:true});
  deco();
})();
