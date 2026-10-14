(function(){
  var NOMS=['Liste','Description','Fiche intégrale'];
  var st=document.createElement('style');
  st.textContent='.ac-modes{display:flex!important;justify-content:center!important;align-items:stretch;gap:8px!important;width:100%;max-width:420px;margin-left:auto;margin-right:auto;flex-wrap:nowrap!important}'
  +'.ac-modes button{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:3px;flex:1 1 0!important;width:auto!important;min-width:0!important;max-width:120px;height:auto!important;min-height:52px;padding:6px 4px!important;line-height:1}'
  +'.ac-modes button .ml{display:block;font-size:10px;font-weight:600;line-height:1.1;text-align:center;white-space:normal;word-break:keep-all;color:inherit;opacity:.95}'
  +'.ac-modes-cap{width:100%;text-align:center;font-size:10.5px;color:#5c6b5c;margin:4px 0 8px;letter-spacing:.3px}';
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
