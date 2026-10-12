(function(){
var d=document,FB='https://www.gstatic.com/firebasejs/10.14.1/firebase-',PK='tm-alerts-prefs';
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var M,FS,AU,uid='',isAdmin=false,offs=[],items=[],read=[],ui=null,ctx=null,unlocked=false,gen=0;
function prefs(){try{return Object.assign({sound:true,vibrate:true},JSON.parse(localStorage.getItem(PK)||'{}'));}catch(e){return {sound:true,vibrate:true};}}
function setPrefs(p){try{localStorage.setItem(PK,JSON.stringify(p));}catch(e){}}
function rkey(){return 'tm-alerts-read-'+uid;}
function loadRead(){try{var r=localStorage.getItem(rkey());return r===null?null:JSON.parse(r);}catch(e){return [];}}
function saveRead(){try{localStorage.setItem(rkey(),JSON.stringify(read.slice(-300)));}catch(e){}}
function ago(ms){if(!ms)return '';var s=Math.max(1,Math.round((Date.now()-ms)/1000));if(s<60)return 'À l\'instant';var m=Math.round(s/60);if(m<60)return 'Il y a '+m+' min';var h=Math.round(m/60);if(h<24)return 'Il y a '+h+' h';return 'Il y a '+Math.round(h/24)+' j';}

/* Son et vibration (sans fichier : généré par le navigateur) */
function unlock(){
  if(unlocked)return;
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC){ctx=new AC();if(ctx.resume)ctx.resume();}}catch(e){}
  unlocked=true;d.removeEventListener('pointerdown',unlock,true);
}
d.addEventListener('pointerdown',unlock,true);
function beep(f,t0,dur){
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001,ctx.currentTime+t0);
  g.gain.exponentialRampToValueAtTime(0.25,ctx.currentTime+t0+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+t0+dur);
  o.start(ctx.currentTime+t0);o.stop(ctx.currentTime+t0+dur+0.05);
}
function ring(){
  var p=prefs();
  if(p.sound&&unlocked&&ctx){try{beep(880,0,0.15);beep(1175,0.17,0.25);}catch(e){}}
  if(p.vibrate&&navigator.vibrate){try{navigator.vibrate([200,100,200]);}catch(e){}}
}

/* Pastille de la cloche */
function badge(n){
  try{if(window.TrocShell&&TrocShell.setNotifs)TrocShell.setNotifs(n);}catch(e){}
  try{if(n>0&&navigator.setAppBadge)navigator.setAppBadge(n).catch(function(){});else if(navigator.clearAppBadge)navigator.clearAppBadge().catch(function(){});}catch(e){}
}
function unreadList(){return items.filter(function(a){return read.indexOf(a.id)<0;});}
function refresh(){var n=unreadList().length;badge(n);if(ui&&ui.box.style.display!=='none')renderPanel();}

/* Navigation */
function openAd(id){
  var f=function(){return d.querySelector('#liste-annonces [data-item="'+id+'"]');};
  var b=f();if(b){b.click();return;}
  var g=d.querySelector('[data-go="parcourir"]');if(g)g.click();
  var n=0,t=setInterval(function(){var b2=f();if(b2){clearInterval(t);b2.click();}else if(++n>25)clearInterval(t);},150);
}
function goProfil(){var b=d.querySelector('.ts-bottom [data-t="prof"]');if(b)b.click();}
function go(a){if(a.kind==='item')openAd(a.itemId);else goProfil();}

/* Panneau */
var CSS='#al-box{position:fixed;top:68px;right:8px;z-index:9995;width:340px;max-width:94vw;max-height:70vh;overflow-y:auto;background:#12372a;color:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.4);padding:8px}'
+'.al-h{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;font-size:.95rem}'
+'.al-h button{background:transparent;border:0;color:#f5b800;text-decoration:underline;font-size:.82rem;cursor:pointer}'
+'.al-opt{display:flex;gap:14px;padding:2px 8px 8px;font-size:.8rem;opacity:.9}.al-opt label{display:flex;align-items:center;gap:5px}'
+'.al-it{display:block;width:100%;text-align:left;border:0;border-radius:10px;padding:9px 10px;margin:0 0 4px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:.88rem;opacity:.65}'
+'.al-it.u{background:rgba(255,255,255,.16);font-weight:700;opacity:1}'
+'.al-it small{display:block;font-weight:400;opacity:.8;margin-top:2px}'
+'.al-e{padding:16px 10px;font-size:.88rem;opacity:.75}';
function buildUI(){
  if(ui)return;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var box=el('div');box.id='al-box';box.style.display='none';d.body.appendChild(box);ui={box:box};
  d.addEventListener('click',function(e){
    if(box.style.display==='none')return;
    if(e.target.closest&&(e.target.closest('#al-box')||e.target.closest('#ts-bell')))return;
    box.style.display='none';
  },true);
}
function renderPanel(){
  var box=ui.box,p=prefs(),ur=unreadList(),ids={};ur.forEach(function(a){ids[a.id]=1;});
  box.replaceChildren();
  var h=el('div','al-h');h.append(el('b','','Notifications'));
  if(ur.length){var b=el('button','','Tout marquer comme lu');b.type='button';b.onclick=function(){items.forEach(function(a){if(read.indexOf(a.id)<0)read.push(a.id);});saveRead();refresh();};h.append(b);}
  box.append(h);
  var o=el('div','al-opt');
  [['sound','Son'],['vibrate','Vibration']].forEach(function(x){
    var l=el('label'),c=el('input');c.type='checkbox';c.checked=!!p[x[0]];
    c.onchange=function(){var q=prefs();q[x[0]]=c.checked;setPrefs(q);};
    l.append(c,d.createTextNode(x[1]));o.append(l);
  });
  box.append(o);
  if(!items.length)box.append(el('div','al-e','Rien de nouveau.'));
  items.forEach(function(a){
    var b=el('button','al-it'+(ids[a.id]?' u':''));b.type='button';
    b.append(d.createTextNode(a.title));b.append(el('small','',a.body));
    var w=ago(a.at);if(w)b.append(el('small','',w));
    b.onclick=function(){if(read.indexOf(a.id)<0){read.push(a.id);saveRead();}box.style.display='none';refresh();go(a);};
    box.append(b);
  });
}
function togglePanel(){
  buildUI();
  if(ui.box.style.display==='none'){renderPanel();ui.box.style.display='block';}else ui.box.style.display='none';
}
function hookBell(){
  var bell=d.getElementById('ts-bell');
  if(!bell||bell.dataset.al)return !!bell;
  bell.dataset.al='1';
  var orig=bell.onclick;
  bell.onclick=function(e){if(uid)togglePanel();else if(orig)return orig.call(this,e);};
  return true;
}
var hn=0,ht=setInterval(function(){if(hookBell()||++hn>40)clearInterval(ht);},250);

/* Écoute des données */
function stop(){offs.forEach(function(f){try{f();}catch(e){}});offs=[];items=[];badge(0);if(ui)ui.box.style.display='none';}
function start(){
  var my=++gen;
  var saved=loadRead(),firstRun=(saved===null);read=saved||[];
  var srcs=[];
  srcs.push({q:function(){return FS.query(FS.collection(M.db,'items'),FS.where('ownerId','==',uid),FS.where('statut','==','masque'),FS.limit(50));},
    map:function(id,x){return {id:'mq-'+id,kind:'mine',title:'Votre annonce a été masquée',body:(x.titre||'Annonce')+' · contactez l\'administration',at:(x.updatedAt&&x.updatedAt.seconds||0)*1000};}});
  if(isAdmin)srcs.push({q:function(){return FS.query(FS.collection(M.db,'items'),FS.where('statut','==','actif'),FS.limit(50));},
    map:function(id,x){var no=window.TMNO?TMNO(Object.assign({id:id},x))+' · ':'';return {id:'it-'+id,kind:'item',itemId:id,title:'Nouvelle annonce',body:no+(x.titre||'Objet')+(x.ownerPrenom?' · '+x.ownerPrenom:''),at:(x.createdAt&&x.createdAt.seconds||0)*1000};}});
  var per={},done={},known=null;
  function handle(i,list){
    if(my!==gen)return;
    per[i]=list;done[i]=1;
    var all=[];Object.keys(per).forEach(function(k){all=all.concat(per[k]);});
    all.sort(function(a,b){return b.at-a.at;});items=all;
    if(Object.keys(done).length<srcs.length){refresh();return;}
    if(known===null){
      known={};all.forEach(function(a){known[a.id]=1;});
      if(firstRun){all.forEach(function(a){read.push(a.id);});saveRead();firstRun=false;}
      refresh();return;
    }
    var fresh=false;
    all.forEach(function(a){if(!known[a.id]){known[a.id]=1;if(read.indexOf(a.id)<0)fresh=true;}});
    if(fresh)ring();
    refresh();
  }
  srcs.forEach(function(s,i){
    offs.push(FS.onSnapshot(s.q(),function(snap){handle(i,snap.docs.map(function(x){return s.map(x.id,x.data());}));},function(){handle(i,[]);}));
  });
}
(async function(){
  try{
    M=await import('./js/firebase-config.js');AU=await import(FB+'auth.js');FS=await import(FB+'firestore.js');
    AU.onAuthStateChanged(M.auth,async function(u){
      gen++;stop();uid=u?u.uid:'';isAdmin=false;
      if(!uid)return;
      try{isAdmin=(await FS.getDoc(FS.doc(M.db,'admins',uid))).exists();}catch(e){isAdmin=false;}
      if(uid!==(M.auth.currentUser&&M.auth.currentUser.uid))return;
      start();
    });
  }catch(e){}
})();
})();
