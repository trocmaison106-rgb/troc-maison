(function(){
var d=document,FSU='https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js',PAGE=30;
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function fcfa(n){return n?Number(n).toLocaleString('fr-FR')+' FCFA':'';}
var M,FS,ALL=[],loaded=0,shown=PAGE,timer=0,ui=null;
var CSS='#rs{position:fixed;inset:0;z-index:9997;background:#f8f5ea;display:none;flex-direction:column}'
+'#rs.on{display:flex}'
+'.rs-top{display:flex;gap:8px;align-items:center;padding:10px 12px;background:#0b3b2a}'
+'.rs-top input{flex:1;min-width:0;font-size:16px;padding:12px 14px;border-radius:12px;border:2px solid #f5b800;background:#fff;color:#222}'
+'.rs-x{border:0;background:transparent;color:#fff;font-size:1.6rem;line-height:1;padding:6px 10px;cursor:pointer}'
+'.rs-n{padding:8px 14px;font-size:.88rem;color:#555}'
+'.rs-res{flex:1;overflow-y:auto;padding:0 12px 24px;-webkit-overflow-scrolling:touch}'
+'.rs-res .ac-card{display:flex!important;gap:10px;align-items:center;padding:8px!important;margin:0 0 8px!important;background:#fff;border-radius:14px;cursor:pointer}'
+'.rs-ph{flex:none;width:64px;height:64px;border-radius:10px;overflow:hidden;background:#eee;display:grid;place-items:center;font-size:1.6rem}'
+'.rs-ph img{width:100%;height:100%;object-fit:cover;display:block}'
+'.rs-i{min-width:0;flex:1}'
+'.rs-ti{font-weight:700;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
+'.rs-s{font-size:.82rem;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
+'.rs-p{font-size:.85rem;font-weight:700;color:#0b6b45}'
+'.rs-more{display:block;width:100%;padding:12px;border-radius:12px;border:1px solid #0b6b45;background:#fff;color:#0b6b45;font-weight:600;margin:6px 0;cursor:pointer}';

async function load(){
  if(ALL.length&&Date.now()-loaded<60000)return;
  M=M||await import('./js/firebase-config.js');
  FS=FS||await import(FSU);
  var s=await FS.getDocs(FS.query(FS.collection(M.db,'items'),FS.where('statut','==','actif'),FS.limit(300)));
  ALL=s.docs.map(function(x){var o=Object.assign({id:x.id},x.data());
    o._t=norm(o.titre);
    o._h=norm([o.titre,o.description||o.desc,o.categorie,o.quartier,o.ville,o.etat,o.numero,o.id,(window.TMNO?TMNO(o):'')].join(' '));
    return o;});
  ALL.sort(function(a,b){return ((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0);});
  loaded=Date.now();
}
function openAd(id){
  var f=function(){return d.querySelector('#liste-annonces [data-item="'+id+'"]');};
  var b=f();if(b){b.click();return;}
  var g=d.querySelector('[data-go="parcourir"]');if(g)g.click();
  var n=0,t=setInterval(function(){var b2=f();if(b2){clearInterval(t);b2.click();}else if(++n>25)clearInterval(t);},150);
}
function close(){if(ui)ui.box.classList.remove('on');}
function card(it){
  var c=el('div','ac-card');c.dataset.id=it.id;
  var ph=el('div','rs-ph'),p=(it.photos||[])[0];
  if(p){var im=el('img');im.src=p;im.alt='';im.loading='lazy';im.onerror=function(){im.remove();ph.textContent='📦';};ph.append(im);}else ph.textContent='📦';
  var i=el('div','rs-i');
  i.append(el('div','rs-ti',(window.TMNO?TMNO(it)+' · ':'')+(it.titre||'Objet')));
  i.append(el('div','rs-s','📍 '+[it.quartier,it.ville].filter(Boolean).join(' · ')));
  var pr=[it.categorie,fcfa(it.valeurEstimee)].filter(Boolean).join(' · ');if(pr)i.append(el('div','rs-p',pr));
  c.append(ph,i);
  c.onclick=function(){close();openAd(it.id);};
  return c;
}
function show(){
  var words=norm(ui.inp.value).split(/\s+/).filter(Boolean);
  if(!words.length){ui.res.replaceChildren();ui.cnt.textContent=ALL.length?ALL.length+' annonces. Tapez un ou plusieurs mots-clés.':'Tapez un ou plusieurs mots-clés.';return;}
  var r=[];
  ALL.forEach(function(it,idx){
    for(var k=0;k<words.length;k++)if(it._h.indexOf(words[k])<0)return;
    var s=0;words.forEach(function(w){s+=it._t.indexOf(w)>-1?3:1;if(it._t.indexOf(w)===0)s+=2;});
    r.push({it:it,s:s,i:idx});
  });
  r.sort(function(a,b){return b.s-a.s||a.i-b.i;});
  ui.cnt.textContent=r.length?r.length+' résultat'+(r.length>1?'s':''):'Aucun résultat. Essayez d\'autres mots-clés.';
  var nodes=r.slice(0,shown).map(function(x){return card(x.it);});
  if(r.length>shown){var m=el('button','rs-more','Voir plus ('+(r.length-shown)+')');m.type='button';m.onclick=function(){shown+=PAGE;show();};nodes.push(m);}
  ui.res.replaceChildren.apply(ui.res,nodes);
}
function build(){
  if(ui)return;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var box=el('div');box.id='rs';
  var top=el('div','rs-top'),inp=el('input'),x=el('button','rs-x','✕');
  inp.type='search';inp.placeholder='Rechercher : objet, lieu, catégorie…';inp.setAttribute('enterkeyhint','search');inp.autocomplete='off';
  x.type='button';x.setAttribute('aria-label','Fermer la recherche');
  var cnt=el('div','rs-n'),res=el('div','rs-res');
  top.append(inp,x);box.append(top,cnt,res);d.body.appendChild(box);
  ui={box:box,inp:inp,cnt:cnt,res:res};
  x.onclick=close;
  inp.addEventListener('input',function(){shown=PAGE;clearTimeout(timer);timer=setTimeout(show,150);});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#vis-modal [data-v]');if(b&&(b.dataset.v==='new'||b.dataset.v==='old'))close();},true);
}
async function open(){
  build();ui.box.classList.add('on');
  ui.cnt.textContent='Chargement…';
  setTimeout(function(){ui.inp.focus();},120);
  try{await load();show();}catch(e){ui.cnt.textContent='Impossible de charger les annonces pour le moment.';}
}
function addBtn(){
  if(d.getElementById('ts-search'))return true;
  var bell=d.getElementById('ts-bell');
  if(!bell||!bell.parentNode)return false;
  var b=d.createElement('button');b.id='ts-search';b.type='button';b.className=bell.className;b.setAttribute('aria-label','Recherche avancée');
  b.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  b.onclick=open;
  bell.parentNode.insertBefore(b,bell);
  return true;
}
var n=0,t=setInterval(function(){if(addBtn()||++n>40)clearInterval(t);},250);
addBtn();
})();
