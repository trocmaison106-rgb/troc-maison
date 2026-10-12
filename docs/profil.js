(function(){
const q=s=>document.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
const go=n=>{const e=q('[data-go="'+n+'"]');if(e)e.click();};
const trig=k=>{const a=q('.ts-drawer [data-t="'+k+'"]');if(a)a.click();};
const shut=()=>{const o=q('#tp');if(o)o.classList.remove('on');};
let M,FS;
async function open(){
  let o=q('#tp');
  if(!o){o=el('div','tp');o.id='tp';document.body.appendChild(o);}
  const H=q('.ts-header'),B=q('.ts-bottom');
  o.style.top=(H?H.offsetHeight:0)+'px';o.style.bottom=(B?B.offsetHeight:0)+'px';
  o.replaceChildren(el('p','tp-empty','Chargement…'));o.classList.add('on');
  try{
    M=M||await import('./js/firebase-config.js');
    FS=FS||await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  }catch(e){}
  const u=M&&M.auth&&M.auth.currentUser;
  if(!u){shut();go('connexion');return;}
  let d={},items=[];
  try{const s=await FS.getDoc(FS.doc(M.db,'users',u.uid));if(s.exists())d=s.data();}catch(e){}
  try{const s=await FS.getDocs(FS.query(FS.collection(M.db,'items'),FS.where('ownerId','==',u.uid),FS.limit(50)));items=s.docs.map(x=>Object.assign({id:x.id},x.data()));}catch(e){}
  const nom=d.prenom||u.displayName||'Membre';
  const btn=(l,fn)=>{const b=el('button','tp-b',l);b.onclick=fn;return b;};
  const head=el('div','tp-head');
  const x=el('button','tp-x','✕');x.onclick=shut;
  const av=el('div','tp-av');
  if(u.photoURL){const i=el('img');i.src=u.photoURL;i.alt='';av.appendChild(i);}else av.textContent=nom.charAt(0).toUpperCase();
  head.append(x,av,el('h2','',nom));
  const lieu=[d.quartier,d.ville].filter(Boolean).join(' · ');
  if(lieu)head.append(el('p','','📍 '+lieu));
  head.append(el('p','',[d.telephone,u.email].filter(Boolean).join(' · ')));
  head.append(el('p','tp-n',items.length+' annonce'+(items.length>1?'s':'')));
  function annonces(){
    const f=el('div');
    if(!items.length)f.append(el('p','tp-empty',"Vous n'avez pas encore d'annonce."));
    items.forEach(it=>{
      const r=el('div','tp-item'),ph=(it.photos||[])[0];
      if(ph){const i=el('img');i.src=ph;i.alt='';r.append(i);}else r.append(el('div','tp-ph','📦'));
      const t=el('div','tp-it');
      t.append(el('b','',it.titre||'Objet'),el('span','',[it.categorie,it.etat].filter(Boolean).join(' · ')),el('span','tp-st',it.statut||''));
      r.append(t);f.append(r);
    });
    f.append(btn('➕ Publier un objet',()=>{shut();go('publier');}),btn('📦 Gérer mes objets',()=>{shut();go('mesobjets');}));
    return f;
  }
  function galerie(){
    const f=el('div'),g=el('div','tp-grid');
    items.forEach(it=>(it.photos||[]).forEach(p=>{const i=el('img');i.src=p;i.alt='';g.append(i);}));
    f.append(g.children.length?g:el('p','tp-empty','Aucune photo pour le moment.'));
    return f;
  }
  function infos(){
    const f=el('div');
    [['Prénom',d.prenom],['Téléphone',d.telephone],['Ville',d.ville],['Quartier',d.quartier],['E-mail',u.email]].forEach(a=>{
      const r=el('div','tp-row');r.append(el('span','',a[0]),el('b','',a[1]||'—'));f.append(r);
    });
    f.append(el('p','tp-note','Votre téléphone et votre e-mail ne sont jamais affichés publiquement.'),btn('✏️ Modifier mes informations',()=>{shut();go('profil');}));
    return f;
  }
  function options(){
    const f=el('div');
    [['✏️ Modifier mon profil',()=>{shut();go('profil');}],
     ['➕ Publier un objet',()=>{shut();go('publier');}],
     ['📦 Mes objets',()=>{shut();go('mesobjets');}],
     ['❤️ Favoris',()=>{shut();trig('fav');}],
     ['💬 Messages',()=>{shut();trig('msg');}],
     ['🔔 Notifications',()=>{shut();trig('notif');}],
     ['❓ Comment ça marche',()=>{shut();trig('how');}],
     ['🛡️ Conseils de sécurité',()=>{shut();trig('rules');}],
     ['ℹ️ À propos',()=>{shut();trig('about');}],
     ['🔗 Partager l’appli',()=>{const s=q('#ts-share');if(s)s.click();}],
     ['🚪 Déconnexion',()=>{shut();trig('out');}]
    ].forEach(a=>f.append(btn(a[0],a[1])));
    return f;
  }
  const T={Annonces:annonces,Galerie:galerie,Infos:infos,Options:options};
  const tabs=el('div','tp-tabs'),body=el('div','tp-body');
  Object.keys(T).forEach(k=>{
    const b=el('button','',k);
    b.onclick=()=>{[...tabs.children].forEach(c=>c.classList.toggle('on',c===b));body.replaceChildren(T[k]());};
    tabs.append(b);
  });
  o.replaceChildren(head,tabs,body);
  tabs.firstChild.click();
}
window.TrocProfil={open};
})();
