(function(){
const q=s=>document.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
const PAGE=12,FSU='https://www.gstatic.com/firebasejs/10.14.1/firebase-';
let M,FS,ALL=[],shown=PAGE,fq='',fc='',last=0,mode='moyen';
try{mode=localStorage.getItem('tm-mode')||'moyen';}catch(e){}
const fcfa=n=>n?Number(n).toLocaleString('fr-FR')+' FCFA':'';
const rec=(a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0);
const box=el('div','ac');box.id='acc-annonces';
const bar=el('div','ac-bar'),inp=el('input'),sel=el('select'),modes=el('div','ac-modes');
const list=el('div','ac-list'),cnt=el('p','ac-n'),more=el('button','ac-more');
inp.type='search';inp.placeholder='Rechercher un objet…';
[['compact','▤','Compact'],['moyen','▦','Moyen'],['grand','▭','Grand']].forEach(a=>{
  const b=el('button','',a[1]);b.title=a[2];b.setAttribute('aria-label',a[2]);b.dataset.m=a[0];
  b.onclick=()=>{mode=a[0];try{localStorage.setItem('tm-mode',mode);}catch(e){}render();};
  modes.append(b);
});
bar.append(inp,sel,modes);
box.append(el('h2','','Dernières annonces'),bar,list,cnt,more);
inp.oninput=()=>{fq=inp.value.trim().toLowerCase();shown=PAGE;render();};
sel.onchange=()=>{fc=sel.value;shown=PAGE;render();};
more.onclick=()=>{shown+=PAGE;render();};
function open(id){
  const f=()=>q('#liste-annonces [data-item="'+id+'"]');
  const b=f();if(b){b.click();return;}
  const g=q('[data-go="parcourir"]');if(g)g.click();
  let n=0;const t=setInterval(()=>{const b2=f();if(b2){clearInterval(t);b2.click();}else if(++n>25)clearInterval(t);},150);
}
function card(it){
  const c=el('div','ac-card'),m=el('div','ac-main'),ph=el('div','ac-ph'),p=(it.photos||[])[0];
  if(p){const i=el('img');i.src=p;i.alt='';i.loading='lazy';ph.append(i);}else ph.textContent='📦';
  const inf=el('div','ac-info');
  inf.append(el('div','ac-ti',it.titre||'Objet'));
  const pr=fcfa(it.valeurEstimee);if(pr)inf.append(el('div','ac-pr',pr));
  inf.append(el('div','ac-lo','📍 '+[it.quartier,it.ville].filter(Boolean).join(' · ')));
  const ds=it.description||it.desc;if(ds)inf.append(el('div','ac-de',ds));
  m.append(ph,inf);m.onclick=()=>open(it.id);c.append(m);
  const act=el('div','ac-act');
  const lk=(cls,t,h)=>{const a=el('a','ac-lk '+cls,t);a.href=h;a.target='_blank';a.rel='noopener';act.append(a);};
  if(it.whatsapp)lk('wa','💬 WhatsApp','https://wa.me/'+it.whatsapp+'?text='+encodeURIComponent('Bonjour, votre annonce « '+(it.titre||'')+' » sur TROC MAISON m\'intéresse.'));
  if(it.geo&&it.geo.lat!=null)lk('dir','🧭 Itinéraire','https://www.google.com/maps/dir/?api=1&destination='+it.geo.lat+','+it.geo.lng);
  if(act.children.length)c.append(act);
  return c;
}
function render(){
  const f=ALL.filter(it=>(!fc||it.categorie===fc)&&(!fq||[it.titre,it.description,it.categorie,it.quartier,it.ville].join(' ').toLowerCase().includes(fq)));
  list.className='ac-list m-'+mode;
  list.replaceChildren(...f.slice(0,shown).map(card));
  modes.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
  cnt.textContent=f.length?(Math.min(shown,f.length)+' sur '+f.length+' annonce'+(f.length>1?'s':'')):(ALL.length?'Aucun résultat.':'Aucune annonce pour le moment.');
  more.style.display=f.length>shown?'block':'none';
  more.textContent='Voir plus ('+(f.length-shown)+')';
}
async function load(){
  try{
    M=M||await import('./js/firebase-config.js');
    FS=FS||await import(FSU+'firestore.js');
    const s=await FS.getDocs(FS.query(FS.collection(M.db,'items'),FS.where('statut','==','actif'),FS.limit(100)));
    ALL=s.docs.map(d=>Object.assign({id:d.id},d.data())).sort(rec);
    last=Date.now();
    const keep=fc,cats=[...new Set(ALL.map(i=>i.categorie).filter(Boolean))].sort();
    sel.replaceChildren(new Option('Toutes les catégories',''),...cats.map(c=>new Option(c,c)));
    sel.value=keep;
  }catch(e){ALL=[];}
  render();
}
const sec=q('[data-view="accueil"]');
if(sec){
  sec.prepend(box);
  new MutationObserver(()=>{if(!sec.hidden&&Date.now()-last>60000)load();}).observe(sec,{attributes:true,attributeFilter:['hidden']});
}
(async()=>{
  try{
    M=M||await import('./js/firebase-config.js');
    const A=await import(FSU+'auth.js');
    A.onAuthStateChanged(M.auth,()=>load());
  }catch(e){load();}
})();
})();
