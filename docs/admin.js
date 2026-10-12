(function(){
var d=document,ADMIN='patrickessono06@gmail.com',FB='https://www.gstatic.com/firebasejs/10.14.1/firebase-';
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function pad(n){return 'TM-'+String(n).padStart(6,'0');}
function fcfa(n){return n?Number(n).toLocaleString('fr-FR')+' FCFA':'';}
function rec(a,b){return ((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0);}
function fdate(t){return t&&t.seconds?new Date(t.seconds*1000).toLocaleDateString('fr-FR'):'';}
function isDemo(it){return norm(it.recherche).indexOf('demo')===0||norm(it.ownerPrenom).indexOf('demo')>-1;}
function fail(e){alert('Action refusée : '+((e&&(e.code||e.message))||e));}
function btn(l,fn,c){var b=el('button','ad-b '+(c||''),l);b.type='button';b.onclick=fn;return b;}
var STL={actif:'Active',pause:'En pause',echange:'Échangée',masque:'Masquée'};
var M,FS,AU,me=null,isAdmin=false,ui=null,ITEMS=[],USERS=[],tab='stats',ready=false,shown=40,mshown=40;
var CSS='#ad{position:fixed;inset:0;z-index:9996;background:#f8f5ea;display:none;flex-direction:column;color:#222}'
+'#ad.on{display:flex}'
+'.ad-top{display:flex;align-items:center;gap:6px;padding:10px 12px;background:#0b3b2a;color:#fff}'
+'.ad-h{flex:1;font-weight:700;font-size:1.05rem}'
+'.ad-ic{border:0!important;background:transparent!important;color:#fff!important;font-size:1.4rem!important;padding:4px 10px!important;width:auto!important}'
+'.ad-tabs{display:flex;background:#fff;border-bottom:1px solid #ddd}'
+'.ad-tabs button{flex:1;padding:12px 4px;border:0;background:transparent;font-weight:600;color:#555;border-bottom:3px solid transparent;cursor:pointer;font-size:.9rem}'
+'.ad-tabs button.on{color:#0b6b45;border-bottom-color:#f5b800}'
+'.ad-body{flex:1;overflow-y:auto;padding:12px;-webkit-overflow-scrolling:touch}'
+'.ad-body input,.ad-body select,.ad-mb input,.ad-mb select,.ad-mb textarea{width:100%;box-sizing:border-box;font-size:16px;padding:11px 12px;border-radius:10px;border:1px solid #bbb;background:#fff;margin:0 0 8px;color:#222}'
+'.ad-n{font-size:.85rem;color:#555;margin:2px 0 8px}'
+'.ad-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
+'.ad-st{background:#fff;border-radius:14px;padding:14px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.1)}'
+'.ad-st{cursor:pointer}.ad-st:active{transform:scale(.97)}.ad-st b{display:block;font-size:1.7rem;color:#0b6b45}.ad-st span{font-size:.85rem;color:#555}'
+'.ad-card{background:#fff;border-radius:14px;padding:10px;margin:0 0 10px;box-shadow:0 1px 4px rgba(0,0,0,.1)}'
+'.ad-r{display:flex;gap:10px;align-items:center}'
+'.ad-ph{flex:none;width:56px;height:56px;border-radius:10px;overflow:hidden;background:#eee;display:grid;place-items:center;font-size:1.5rem}'
+'.ad-ph img{width:100%;height:100%;object-fit:cover;display:block}'
+'.ad-i{min-width:0;flex:1}.ad-t{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.ad-s{font-size:.82rem;color:#555;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.ad-bd{display:inline-block;font-size:.72rem;font-weight:700;border-radius:8px;padding:2px 7px;margin:3px 4px 0 0;background:#e3eee8;color:#0b6b45}'
+'.ad-bd.st-masque,.ad-bd.sus{background:#f8d7da;color:#a10020}.ad-bd.st-pause{background:#fff3cd;color:#8a6d00}.ad-bd.demo{background:#e6e0f8;color:#4b2fa0}'
+'.ad-a{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}'
+'.ad-b{padding:8px 11px;border-radius:10px;border:1px solid #0b6b45;background:#fff;color:#0b6b45;font-weight:600;font-size:.85rem;cursor:pointer}'
+'.ad-b.dg{border-color:#a10020;color:#a10020}.ad-b.pr{background:#0b6b45;color:#fff}'
+'.ad-mo{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:14px}'
+'.ad-mb{background:#fff;border-radius:16px;padding:16px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto}'
+'.ad-l{display:block;font-size:.85rem;font-weight:600;margin:4px 0}'
+'.ad-tool{background:#fff;border-radius:14px;padding:14px;margin:0 0 10px}.ad-tool p{margin:0 0 8px;font-size:.9rem;color:#444}'
+'.ad-setup{background:#fff;border-radius:14px;padding:16px}.ad-setup code{display:block;word-break:break-all;background:#f1f1f1;padding:8px;border-radius:8px;user-select:all}';

async function loadAll(){
  var a=await FS.getDocs(FS.query(FS.collection(M.db,'items'),FS.limit(500)));
  ITEMS=a.docs.map(function(x){return Object.assign({id:x.id},x.data());}).sort(rec);
  var b=await FS.getDocs(FS.query(FS.collection(M.db,'users'),FS.limit(500)));
  USERS=b.docs.map(function(x){return Object.assign({id:x.id},x.data());}).sort(rec);
  ready=true;
}
function build(){
  if(ui)return;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var box=el('div');box.id='ad';
  var top=el('div','ad-top');
  top.append(el('div','ad-h','🛠️ Tableau de bord admin'),btn('↻',refresh,'ad-ic'),btn('✕',close,'ad-ic'));
  var tabs=el('div','ad-tabs');
  [['stats','Statistiques'],['items','Annonces'],['users','Membres'],['tools','Outils']].forEach(function(t){
    var b=el('button','',t[1]);b.type='button';b.dataset.tab=t[0];b.onclick=function(){tab=t[0];render();};tabs.append(b);});
  var body=el('div','ad-body');
  var ai=el('input');ai.type='search';ai.placeholder='N°, titre, membre, ville…';
  var asel=el('select');[['','Toutes les annonces'],['actif','Actives'],['pause','En pause'],['echange','Échangées'],['masque','Masquées'],['demo','Démonstration'],['today','Aujourd\'hui']].forEach(function(o){asel.add(new Option(o[1],o[0]));});
  var mi=el('input');mi.type='search';mi.placeholder='Nom, ville, téléphone…';
  ai.oninput=function(){shown=40;renderItems();};asel.onchange=function(){shown=40;renderItems();};
  mi.oninput=function(){mshown=40;renderUsers();};
  box.append(top,tabs,body);d.body.appendChild(box);
  ui={box:box,tabs:tabs,body:body,ai:ai,asel:asel,mi:mi,icnt:el('div','ad-n'),ilist:el('div'),ucnt:el('div','ad-n'),ulist:el('div')};
}
function close(){if(ui)ui.box.classList.remove('on');}
function render(){
  ui.tabs.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===tab);});
  ui.body.replaceChildren();
  if(!ready){ui.body.textContent='Chargement…';return;}
  if(tab==='stats')return renderStats();
  if(tab==='items'){ui.body.append(ui.ai,ui.asel,ui.icnt,ui.ilist);return renderItems();}
  if(tab==='users'){ui.body.append(ui.mi,ui.ucnt,ui.ulist);return renderUsers();}
  renderTools();
}
function renderStats(){
  var c=function(s){return ITEMS.filter(function(i){return i.statut===s;}).length;};
  var t0=new Date();t0.setHours(0,0,0,0);
  var today=ITEMS.filter(function(i){return i.createdAt&&i.createdAt.seconds*1000>=t0.getTime();}).length;
  var g=el('div','ad-grid');
  [['Membres',USERS.length,'users',''],['Annonces',ITEMS.length,'items',''],['Actives',c('actif'),'items','actif'],['En pause',c('pause'),'items','pause'],['Échangées',c('echange'),'items','echange'],['Masquées',c('masque'),'items','masque'],['Nouvelles aujourd\'hui',today,'items','today'],['Démonstration',ITEMS.filter(isDemo).length,'items','demo']].forEach(function(x){
    var k=el('div','ad-st');k.setAttribute('role','button');k.tabIndex=0;
    k.append(el('b','',x[1]),el('span','',x[0]));
    k.onclick=function(){tab=x[2];render();if(x[2]==='items'){ui.ai.value='';ui.asel.value=x[3];shown=40;renderItems();}else{ui.mi.value='';mshown=40;renderUsers();}};
    g.append(k);});
  ui.body.append(g);
}
function badge(t,c){return el('span','ad-bd '+(c||''),t);}
function itemCard(it){
  var card=el('div','ad-card'),r=el('div','ad-r'),ph=el('div','ad-ph'),p=(it.photos||[])[0];
  if(p){var im=el('img');im.src=p;im.alt='';im.loading='lazy';im.onerror=function(){im.remove();ph.textContent='📦';};ph.append(im);}else ph.textContent='📦';
  var i=el('div','ad-i');
  i.append(el('div','ad-t',(window.TMNO?TMNO(it)+' · ':'')+(it.titre||'Objet')));
  i.append(el('div','ad-s',[it.ownerPrenom,it.ville,it.quartier,fcfa(it.valeurEstimee)].filter(Boolean).join(' · ')));
  var bs=el('div');bs.append(badge(STL[it.statut]||it.statut||'?','st-'+it.statut));if(isDemo(it))bs.append(badge('Démo','demo'));
  var dt=fdate(it.createdAt);if(dt)bs.append(badge(dt));
  i.append(bs);r.append(ph,i);
  var a=el('div','ad-a');
  a.append(btn(it.statut==='masque'?'👁 Réactiver':'🚫 Masquer',function(){setStatut(it,it.statut==='masque'?'actif':'masque');}));
  a.append(btn('✏️ Modifier',function(){editItem(it);}));
  a.append(btn('🗑 Supprimer',function(){delItem(it);},'dg'));
  card.append(r,a);return card;
}
function renderItems(){
  var w=norm(ui.ai.value).split(/\s+/).filter(Boolean),af=ui.asel.value;
  var f=ITEMS.filter(function(it){
    if(af==='demo'&&!isDemo(it))return false;if(af==='today'){var t0=new Date();t0.setHours(0,0,0,0);if(!(it.createdAt&&it.createdAt.seconds*1000>=t0.getTime()))return false;}
    if(af&&af!=='demo'&&af!=='today'&&it.statut!==af)return false;
    var h=norm([it.titre,it.ownerPrenom,it.categorie,it.ville,it.quartier,it.id,(window.TMNO?TMNO(it):'')].join(' '));
    return w.every(function(x){return h.indexOf(x)>-1;});
  });
  ui.icnt.textContent=f.length+' annonce'+(f.length>1?'s':'');
  var n=f.slice(0,shown).map(itemCard);
  if(f.length>shown){var m=btn('Voir plus ('+(f.length-shown)+')',function(){shown+=40;renderItems();});n.push(m);}
  ui.ilist.replaceChildren.apply(ui.ilist,n);
}
async function setStatut(it,s){
  try{await FS.updateDoc(FS.doc(M.db,'items',it.id),{statut:s,updatedAt:FS.serverTimestamp()});it.statut=s;renderItems();}catch(e){fail(e);}
}
async function delItem(it){
  if(!confirm('Supprimer définitivement « '+(it.titre||'cette annonce')+' » ?'))return;
  try{await FS.deleteDoc(FS.doc(M.db,'items',it.id));ITEMS=ITEMS.filter(function(x){return x.id!==it.id;});renderItems();}catch(e){fail(e);}
}
function editItem(it){
  var m=el('div','ad-mo'),b=el('div','ad-mb'),f={};
  b.append(el('h3','','Modifier l\'annonce'));
  function fld(l,k,type,v){var i=type==='ta'?el('textarea'):el('input');if(type==='ta')i.rows=4;else i.type=type;i.value=v==null?'':v;f[k]=i;b.append(el('label','ad-l',l),i);}
  fld('Titre','titre','text',it.titre);fld('Description','description','ta',it.description||it.desc);
  fld('Catégorie','categorie','text',it.categorie);fld('Valeur estimée (FCFA)','valeurEstimee','number',it.valeurEstimee);
  fld('Ville','ville','text',it.ville);fld('Quartier','quartier','text',it.quartier);
  var sl=el('select');[['actif','Active'],['pause','En pause'],['echange','Échangée'],['masque','Masquée']].forEach(function(o){sl.add(new Option(o[1],o[0]));});
  sl.value=it.statut||'actif';b.append(el('label','ad-l','Statut'),sl);
  var row=el('div','ad-a');
  row.append(btn('Enregistrer',async function(){
    var data={titre:f.titre.value.trim(),description:f.description.value.trim(),categorie:f.categorie.value.trim(),valeurEstimee:Number(f.valeurEstimee.value)||0,ville:f.ville.value.trim(),quartier:f.quartier.value.trim(),statut:sl.value};
    if(data.titre.length<3){alert('Le titre doit avoir au moins 3 caractères.');return;}
    try{await FS.updateDoc(FS.doc(M.db,'items',it.id),Object.assign({updatedAt:FS.serverTimestamp()},data));Object.assign(it,data);m.remove();renderItems();}catch(e){fail(e);}
  },'pr'),btn('Annuler',function(){m.remove();}));
  b.append(row);m.append(b);d.body.appendChild(m);
}
function userCard(u){
  var card=el('div','ad-card'),i=el('div','ad-i');
  var nb=ITEMS.filter(function(x){return x.ownerId===u.id;}).length;
  i.append(el('div','ad-t',u.prenom||'Membre'));
  i.append(el('div','ad-s',[u.ville,u.quartier,u.telephone].filter(Boolean).join(' · ')));
  var bs=el('div');bs.append(badge(nb+' annonce'+(nb>1?'s':'')));var dt=fdate(u.createdAt);if(dt)bs.append(badge('Inscrit le '+dt));
  if(u.suspendu)bs.append(badge('Suspendu','sus'));i.append(bs);
  var a=el('div','ad-a');
  a.append(btn(u.suspendu?'✅ Réactiver':'⛔ Suspendre',function(){toggleSusp(u);},u.suspendu?'':'dg'));
  card.append(i,a);return card;
}
function renderUsers(){
  var w=norm(ui.mi.value).split(/\s+/).filter(Boolean);
  var f=USERS.filter(function(u){var h=norm([u.prenom,u.ville,u.quartier,u.telephone,u.id].join(' '));return w.every(function(x){return h.indexOf(x)>-1;});});
  ui.ucnt.textContent=f.length+' membre'+(f.length>1?'s':'');
  var n=f.slice(0,mshown).map(userCard);
  if(f.length>mshown){n.push(btn('Voir plus ('+(f.length-mshown)+')',function(){mshown+=40;renderUsers();}));}
  ui.ulist.replaceChildren.apply(ui.ulist,n);
}
async function toggleSusp(u){
  var on=!u.suspendu,mine=ITEMS.filter(function(i){return i.ownerId===u.id&&i.statut==='actif';});
  var msg=on?'Suspendre '+(u.prenom||'ce membre')+(mine.length?' et masquer ses '+mine.length+' annonce(s) active(s) ?':' ?'):'Réactiver '+(u.prenom||'ce membre')+' ? Ses annonces masquées restent à réactiver une par une.';
  if(!confirm(msg))return;
  try{
    var b=FS.writeBatch(M.db);
    b.update(FS.doc(M.db,'users',u.id),{suspendu:on});
    if(on)mine.forEach(function(i){b.update(FS.doc(M.db,'items',i.id),{statut:'masque',updatedAt:FS.serverTimestamp()});});
    await b.commit();u.suspendu=on;if(on)mine.forEach(function(i){i.statut='masque';});renderUsers();
  }catch(e){fail(e);}
}
function csv(name,rows){
  var t=rows.map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a=d.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+t],{type:'text/csv;charset=utf-8'}));a.download=name;d.body.appendChild(a);a.click();a.remove();
}
function renderTools(){
  var t1=el('div','ad-tool');t1.append(el('p','','Exporter les annonces au format CSV (tableur).'),btn('⬇️ Annonces CSV',function(){
    csv('annonces-troc-maison.csv',[['numero','id','titre','categorie','valeur','ville','quartier','statut','membre','date']].concat(ITEMS.map(function(i){return [(window.TMNO?TMNO(i):''),i.id,i.titre,i.categorie,i.valeurEstimee,i.ville,i.quartier,i.statut,i.ownerPrenom,fdate(i.createdAt)];})));
  }));
  var t2=el('div','ad-tool');t2.append(el('p','','Exporter la liste des membres au format CSV.'),btn('⬇️ Membres CSV',function(){
    csv('membres-troc-maison.csv',[['id','prenom','ville','quartier','telephone','inscription','suspendu']].concat(USERS.map(function(u){return [u.id,u.prenom,u.ville,u.quartier,u.telephone,fdate(u.createdAt),u.suspendu?'oui':''];})));
  }));
  var demos=ITEMS.filter(isDemo);
  var t3=el('div','ad-tool');t3.append(el('p','','Annonces de démonstration détectées : '+demos.length+'. Vérifiez-les d\'abord dans Annonces > Démonstration.'),btn('🗑 Supprimer les démos ('+demos.length+')',async function(){
    if(!demos.length){alert('Aucune annonce de démonstration.');return;}
    if(!confirm('Supprimer définitivement '+demos.length+' annonce(s) de démonstration ?'))return;
    try{
      for(var k=0;k<demos.length;k+=400){var b=FS.writeBatch(M.db);demos.slice(k,k+400).forEach(function(i){b.delete(FS.doc(M.db,'items',i.id));});await b.commit();}
      ITEMS=ITEMS.filter(function(i){return !isDemo(i);});renderTools();alert('Démos supprimées.');
    }catch(e){fail(e);}
  },'dg'));
  ui.body.append(t1,t2,t3);
}
async function refresh(){
  if(!isAdmin)return;ready=false;render();
  try{await loadAll();}catch(e){ui.body.textContent='Erreur de chargement : '+((e&&(e.code||e.message))||e);return;}
  render();
}
async function openDash(){
  build();ui.box.classList.add('on');
  if(!isAdmin){
    ui.body.replaceChildren();var p=el('div','ad-setup');
    p.append(el('h3','','Compte admin à activer'),el('p','','Dans la console Firebase : Firestore Database > Démarrer une collection > ID de collection : admins > ID du document : l\'identifiant ci-dessous > ajoutez un champ actif (booléen) = true. Puis rechargez l\'appli.'),el('code','',me?me.uid:''));
    ui.body.append(p);return;
  }
  if(!ready)await refresh();else render();
}
function addLink(){
  if(d.getElementById('ts-admin'))return true;
  var out=d.querySelector('.ts-drawer [data-t="out"]');if(!out)return false;
  var a=d.createElement('a');a.id='ts-admin';a.textContent='🛠️ Tableau de bord admin';
  a.onclick=function(){d.body.classList.remove('ts-open');openDash();};
  var hr=out.previousElementSibling;out.parentNode.insertBefore(a,hr&&hr.tagName==='HR'?hr:out);return true;
}
function showLink(){var n=0,t=setInterval(function(){if(addLink()||++n>40)clearInterval(t);},250);}
(async function(){
  try{
    M=await import('./js/firebase-config.js');AU=await import(FB+'auth.js');FS=await import(FB+'firestore.js');
    AU.onAuthStateChanged(M.auth,async function(u){
      me=u;isAdmin=false;ready=false;var o=d.getElementById('ts-admin');if(o)o.remove();close();
      if(!u||!u.email||u.email.toLowerCase()!==ADMIN)return;
      try{isAdmin=(await FS.getDoc(FS.doc(M.db,'admins',u.uid))).exists();}catch(e){isAdmin=false;}
      showLink();
    });
  }catch(e){}
})();
})();
