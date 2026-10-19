(function(){
var d=document,ADMIN='patrickessono06@gmail.com',FB='https://www.gstatic.com/firebasejs/10.14.1/firebase-';
var M,AU,FS,isAdmin=false,busy=false;
var COL={voiture:['#e8f1fb','#1f5fa8'],camion:['#fdf0e0','#a85f12'],tente:['#e6f6ea','#1f7a43']};
var ART={
voiture:'<path d="M14 64v-10q0-5 5-6l9-2 9-12q2-3 6-3h20q4 0 6 3l9 12 8 2q5 1 5 6v10q0 2-2 2H16q-2 0-2-2z"/><circle cx="32" cy="68" r="8"/><circle cx="70" cy="68" r="8"/><path d="M38 46h12V35H43zM54 46h12l-8-11h-4z"/>',
camion:'<rect x="10" y="36" width="44" height="28" rx="3"/><path d="M54 44h16l12 12v8H54z"/><circle cx="28" cy="68" r="8"/><circle cx="68" cy="68" r="8"/>',
tente:'<path d="M50 22L14 72h72z"/><path d="M50 22v50M34 72l16-26 16 26"/>'};
var BASE='https://trocmaison106-rgb.github.io/troc-maison/img/cat/';var CATS=[['vehicule-camion',/camion|canter|benne|plateau/],['tente-location',/tente|bache|bâche|chapiteau|evenement|événement/],['vehicule-voiture',/voiture|berline|mitsubishi|gls|pajero|l200|hilux|prado|land ?cruiser|fortuner|\bkm\b|automatique|essence|diesel|suv|4x4|pick.?up|toyota|corolla|rav4|hyundai|kia|nissan|honda|peugeot|renault|mercedes|bmw|ford|v[ée]hicule/],['electromenager',/frigo|r[ée]frig|cong[ée]lateur|micro.?onde|machine [àa] laver|lave.?linge|climatiseur|t[ée]l[ée]vis|ventilateur|cuisini[èe]re/],['telephones-informatique',/iphone|samsung|t[ée]l[ée]phone|smartphone|ordinateur|laptop|portable|tablette|macbook|imprimante|\bpc\b/],['meubles',/canap|fauteuil|table|chaise|\blit\b|armoire|matelas|meuble|commode|bureau|salon/],['cuisine-vaisselle',/casserole|assiette|vaisselle|marmite|couvert|po[êe]le|cuisine/],['enfants-bebes',/b[ée]b[ée]|enfant|poussette|jouet|peluche|berceau/],['livres-ecole',/livre|cahier|manuel|scolaire|[ée]cole/],['sport-loisirs',/ballon|football|halt[èe]re|raquette|sport|v[ée]lo|musculation/],['outils-bricolage',/perceuse|marteau|outil|meuleuse|soudure|[ée]lectrog[èe]ne/],['chaussures',/chaussure|basket|sandale|botte|soulier/],['vetements',/robe|chemise|pantalon|v[êe]tement|t-?shirt|jean|veste|pagne/]];function photoUrl(k,t){t=String(t||'').toLowerCase();var s=null;for(var i=0;i<CATS.length;i++){if(CATS[i][1].test(t)){s=CATS[i][0];break;}}return BASE+(s||{voiture:'vehicule-voiture',camion:'vehicule-camion',tente:'tente-location'}[k]||'autre')+'.jpg';}
function avatar(k){var c=COL[k]||COL.voiture;
var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="'+c[0]+'"/><g fill="'+c[0]+'" stroke="'+c[1]+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+(ART[k]||ART.voiture)+'</g></svg>';
return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);}
var st=d.createElement('style');
st.textContent='#ad-sync{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#e7f4ee;border-bottom:1px solid #cfe5d8}#ad-sync button{flex:none;border:0;border-radius:10px;background:#16a34a;color:#fff;font-weight:700;padding:11px 14px;font-size:.95rem;cursor:pointer}#ad-sync button:disabled{opacity:.6}#ad-sync span{flex:1;font-size:.82rem;color:#2b4a3a}';
d.head.appendChild(st);
function inject(){
  var top=d.querySelector('#ad .ad-top');if(!top||d.getElementById('ad-sync'))return;
  var w=d.createElement('div');w.id='ad-sync';
  var b=d.createElement('button');b.type='button';b.textContent='🔄 Synchroniser les annonces';
  var s=d.createElement('span');s.textContent='Ajoute les nouvelles annonces du fichier, sans doublons.';
  b.onclick=function(){run(b,s);};w.append(b,s);top.insertAdjacentElement('afterend',w);
}
async function run(b,s){
  if(busy)return;busy=true;b.disabled=true;b.textContent='⏳ Synchronisation…';
  try{
    var u=M.auth.currentUser;if(!u)throw new Error('non connecté');
    var r=await fetch('annonces-troc.json?t='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('fichier annonces introuvable ('+r.status+')');
    var list=(await r.json()).filter(function(a){return a&&a.titre&&a.titre.length>=3&&a.contact;});
    var q=await FS.getDocs(FS.query(FS.collection(M.db,'items'),FS.where('ownerId','==',u.uid),FS.limit(500)));
    var have=q.docs.map(function(x){return x.data();});
var upd=0;for(var j=0;j<q.docs.length;j++){var dd=q.docs[j].data(),p0=(dd.photos||[])[0];if(p0&&(String(p0).indexOf('data:image/svg')===0||String(p0).indexOf('/img/cat/')>0)){try{await FS.updateDoc(FS.doc(M.db,'items',q.docs[j].id),{photos:[photoUrl(null,Object.values(dd).filter(function(v){return typeof v==='string'&&v.length<2000&&v.indexOf('data:')!==0&&v.indexOf('http')!==0;}).join(' '))],updatedAt:FS.serverTimestamp()});upd++;}catch(e){}}}
if(upd)alert(upd+' image(s) mise(s) à jour');
    var fresh=list.filter(function(a){return !have.some(function(h){return h.titre===a.titre&&String(h.description||'').indexOf(a.contact)>-1;});});
    if(!fresh.length){s.textContent='✅ Déjà à jour : '+list.length+' annonces présentes.';return;}
    if(!confirm('Ajouter '+fresh.length+' nouvelle(s) annonce(s) sur '+list.length+' ?'))return;
    var prenom='TROC MAISON';
    try{var p=await FS.getDoc(FS.doc(M.db,'users',u.uid));if(p.exists()&&p.data().prenom)prenom=String(p.data().prenom).slice(0,40);}catch(e){}
    var ok=0,err=null;
    for(var i=0;i<fresh.length;i++){var a=fresh[i];
      try{
        await FS.addDoc(FS.collection(M.db,'items'),{ownerId:u.uid,ownerPrenom:prenom,titre:a.titre,description:a.description,categorie:a.categorie||'Autre',etat:a.etat||'Bon état',valeurEstimee:a.valeurEstimee||0,recherche:a.recherche||'',photos:[photoUrl(a.avatar,Object.values(a).filter(function(v){return typeof v==='string'&&v.length<2000&&v.indexOf('data:')!==0&&v.indexOf('http')!==0;}).join(' '))],quartier:'',ville:'Libreville',whatsapp:'',geo:null,statut:'actif',createdAt:FS.serverTimestamp(),updatedAt:FS.serverTimestamp()});
        ok++;
      }catch(e){err=err||(e&&(e.code||e.message))||String(e);}
    }
    s.textContent=(ok?'✅ '+ok+' ajoutée(s). ':'')+(err?'⚠️ Erreur : '+err:'');
    var rf=d.querySelector('#ad .ad-top .ad-ic');if(ok&&rf)rf.click();
  }catch(e){s.textContent='⚠️ '+((e&&(e.code||e.message))||e);}
  finally{busy=false;b.disabled=false;b.textContent='🔄 Synchroniser les annonces';}
}
(async function(){
  try{
    M=await import('./js/firebase-config.js');AU=await import(FB+'auth.js');FS=await import(FB+'firestore.js');
    AU.onAuthStateChanged(M.auth,async function(u){
      isAdmin=false;var o=d.getElementById('ad-sync');if(o)o.remove();
      if(!u||!u.email||u.email.toLowerCase()!==ADMIN)return;
      try{isAdmin=(await FS.getDoc(FS.doc(M.db,'admins',u.uid))).exists();}catch(e){isAdmin=false;}
      if(isAdmin)inject();
    });
    new MutationObserver(function(){if(isAdmin)inject();}).observe(d.documentElement,{childList:true,subtree:true});
  }catch(e){}
})();
})();
