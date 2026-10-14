window.trocPartager=function(id,titre){
  var u=location.origin+location.pathname+'?a='+encodeURIComponent(id);
  var t='TROC MAISON : '+(titre||'annonce');
  if(navigator.share){navigator.share({title:t,text:t,url:u}).catch(function(){});}
  else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){alert('Lien copié : '+u);});}
  else{prompt('Copiez ce lien :',u);}
};
(function(){
  var id=(new URLSearchParams(location.search).get('a')||'').replace(/[^A-Za-z0-9_-]/g,'');
  if(!id)return;
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
  function lnk(c,x,h){var a=el('a','sh-btn '+c,x);a.href=h;a.target='_blank';a.rel='noopener';return a;}
  var ov=el('div','sh-ov'),inn=el('div','sh-in'),body=el('div','sh-body');
  var xb=el('button','sh-x','✕');xb.type='button';xb.setAttribute('aria-label','Fermer');
  body.append(el('p','sh-m','Chargement de l\u2019annonce…'));
  inn.append(body);ov.append(xb,inn);
  document.body.append(ov);document.body.classList.add('sh-open');
  function fermer(){ov.remove();document.body.classList.remove('sh-open');history.replaceState(null,'',location.pathname);}
  xb.addEventListener('click',fermer);
  (async function(){
    try{
      const M=await import('./js/firebase-config.js');
      const A=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
      const FS=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
      const s=await FS.getDoc(FS.doc(M.db,'items',id));
      body.textContent='';
      if(!s.exists()){
        body.append(el('p','sh-m','Cette annonce n\u2019est plus disponible.'));
        var b0=el('button','sh-btn','Voir les annonces');b0.type='button';b0.onclick=fermer;body.append(b0);return;
      }
      const it=s.data();
      const ph=el('div','sh-ph');
      (it.photos||[]).forEach(function(p){
        var src=typeof p==='string'?p:(p&&(p.url||p.secure_url||p.src));
        if(src){var im=el('img');im.src=src;im.alt=it.titre||'';ph.append(im);}
      });
      if(ph.children.length)body.append(ph);
      body.append(el('h1','sh-t',it.titre||'Annonce'));
      var v=Number(it.valeurEstimee);
      body.append(el('p','sh-m',[it.categorie,it.etat,isFinite(v)?v.toLocaleString('fr-FR')+' FCFA':''].filter(Boolean).join(' · ')));
      if(it.description)body.append(el('p','sh-d',it.description));
      if(it.recherche)body.append(el('p','sh-d','Recherche : '+it.recherche));
      body.append(el('p','sh-m','Proposé par '+(it.ownerPrenom||'un membre')+' · '+[it.quartier,it.ville].filter(Boolean).join(', ')));
      const usr=await new Promise(function(r){var off=A.onAuthStateChanged(M.auth||A.getAuth(),function(x){off();r(x);});});
      if(usr){
        try{
          const c=it.ownerId?await FS.getDoc(FS.doc(M.db,'contacts',it.ownerId)):null;
          const ct=c&&c.exists()?c.data():null;
          var msg='Bonjour, votre annonce « '+(it.titre||'')+' » sur TROC MAISON m\'intéresse.';
          if(ct&&ct.whatsapp)body.append(lnk('sh-wa','💬 Écrire sur WhatsApp','https://wa.me/'+ct.whatsapp+'?text='+encodeURIComponent(msg)));
          if(ct&&ct.telephone)body.append(lnk('','📞 Appeler','tel:'+ct.telephone.replace(/[^+0-9]/g,'')));
          if(ct&&ct.email)body.append(lnk('','✉️ E-mail','mailto:'+ct.email+'?subject='+encodeURIComponent('TROC MAISON : '+(it.titre||''))));
          if(!ct||(!ct.whatsapp&&!ct.telephone&&!ct.email))body.append(el('p','sh-m','Coordonnées non partagées pour le moment.'));
        }catch(e){body.append(el('p','sh-m','Coordonnées indisponibles.'));}
      }else{
        body.append(el('p','sh-m','Connectez-vous ou inscrivez-vous gratuitement pour contacter l\u2019annonceur.'));
      }
      var sb=el('button','sh-btn sh-alt','🔗 Partager cette annonce');sb.type='button';
      sb.onclick=function(){window.trocPartager(id,it.titre);};body.append(sb);
      var ob=el('button','sh-btn sh-alt',usr?'Voir toutes les annonces':'Se connecter / S\u2019inscrire');
      ob.type='button';ob.onclick=fermer;body.append(ob);
    }catch(e){
      body.textContent='';
      body.append(el('p','sh-m','Impossible de charger l\u2019annonce.'));
      var bx=el('button','sh-btn','Ouvrir TROC MAISON');bx.type='button';bx.onclick=fermer;body.append(bx);
    }
  })();
})();
