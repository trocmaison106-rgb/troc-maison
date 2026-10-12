(function(){
if(window.GuideWidget)return;
var d=document;
var CONFIG={
  color:"#0b6b45",accent:"#f5b800",title:"Comment ça marche",
  toast:{text:"Comment ça marche",delayMs:1500,durationMs:7000,oncePerSession:true},
  roles:[
    {id:"visiteur",label:"Visiteur",intro:"Vous parcourez les annonces sans compte.",secs:[
      {t:"✅ Ce que je peux faire",p:["Parcourir les dernières annonces sur l'accueil.","Faire tourner la roue d'un geste vers la gauche ou la droite.","Chercher avec la loupe en haut, par mots-clés.","Lire les conseils de sécurité dans le menu ☰."]},
      {t:"⚠️ Ce que je dois faire",p:["Créer un compte gratuit pour voir une annonce.","Renseigner prénom, ville, quartier et e-mail.","Choisir un mot de passe de 8 caractères minimum."]},
      {t:"🔧 Comment faire",p:["Touchez une annonce, puis Créer mon compte.","Déjà inscrit ? Touchez J'ai déjà un compte.","Après la connexion, l'annonce choisie s'ouvre toute seule."]},
      {t:"⭐ Points importants",p:["L'inscription est gratuite.","Ne payez jamais d'avance.","Rencontrez-vous toujours dans un lieu public."]}]},
    {id:"membre",label:"Membre",intro:"Vous publiez des objets et échangez avec les autres membres.",secs:[
      {t:"✅ Ce que je peux faire",p:["Publier un objet avec 1 à 4 photos.","Contacter un membre par WhatsApp.","Obtenir l'itinéraire vers l'objet.","Gérer vos annonces dans Mes objets."]},
      {t:"⚠️ Ce que je dois faire",p:["Ajouter au moins une photo à chaque annonce.","Donner un titre clair et une valeur estimée.","Indiquer votre numéro WhatsApp pour être contacté."]},
      {t:"🔧 Comment faire",p:["Touchez + Publier, puis remplissez le formulaire.","Dans Mes objets : pause, échangé ou supprimer.","Dans Profil > Infos : numéro WhatsApp et position.","Cochez Afficher WhatsApp et position sur mes annonces."]},
      {t:"⭐ Points importants",p:["Choisissez un lieu public plutôt que votre domicile.","Vérifiez l'objet avant tout échange.","Ne donnez jamais d'informations bancaires.","Marquez l'annonce échangée une fois l'échange fait."]}]},
    {id:"admin",label:"Administrateur",intro:"Vous gérez les annonces et les membres.",secs:[
      {t:"✅ Ce que je peux faire",p:["Voir les statistiques de l'application.","Masquer, modifier ou supprimer une annonce.","Suspendre ou réactiver un membre.","Exporter annonces et membres en fichier CSV."]},
      {t:"⚠️ Ce que je dois faire",p:["Vérifier les annonces douteuses.","Confirmer avant chaque suppression définitive.","Contrôler les démonstrations avant de les supprimer."]},
      {t:"🔧 Comment faire",p:["Ouvrez ☰ puis Tableau de bord admin.","Touchez une tuile pour ouvrir son contenu.","Dans Annonces, cherchez par numéro TM, titre ou membre.","Dans Outils : exports CSV et suppression des démos."]},
      {t:"⭐ Points importants",p:["Une suppression est définitive, sans retour possible.","Suspendre un membre masque ses annonces actives.","Réactiver un membre ne remet pas ses annonces en ligne."]}]}
  ]
};
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
var C=CONFIG.color,A=CONFIG.accent,modal=null,tabs=null,body=null,cur='';
var CSS='#gw-modal{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center}'
+'#gw-modal.on{display:flex}'
+'.gw-box{background:#fff;color:#222;width:100%;max-width:520px;max-height:88vh;border-radius:18px 18px 0 0;display:flex;flex-direction:column;overflow:hidden}'
+'.gw-top{display:flex;align-items:center;padding:12px 14px;background:'+C+';color:#fff}.gw-top b{flex:1;font-size:1.05rem}'
+'.gw-x{border:0;background:transparent;color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;padding:2px 8px}'
+'.gw-tabs{display:flex;background:#f4f1e6}'
+'.gw-tabs button{flex:1;padding:11px 4px;border:0;background:transparent;font-weight:600;color:#555;border-bottom:3px solid transparent;cursor:pointer;font-size:.9rem}'
+'.gw-tabs button.on{color:'+C+';border-bottom-color:'+A+'}'
+'.gw-body{overflow-y:auto;padding:12px 16px 22px;-webkit-overflow-scrolling:touch}'
+'.gw-in{margin:0 0 6px;font-size:.92rem;color:#444}'
+'.gw-body h3{margin:14px 0 6px;font-size:1rem;color:'+C+'}'
+'.gw-body ul{margin:0;padding-left:20px}.gw-body li{margin:0 0 5px;font-size:.92rem;line-height:1.35}'
+'#gw-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:9990;display:flex;align-items:center;background:#0b3b2a;color:#fff;border:2px solid '+A+';border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35);overflow:hidden;max-width:92vw;white-space:nowrap}'
+'#gw-toast button{border:0;background:transparent;color:#fff;font-size:.95rem;font-weight:700;padding:11px 14px;cursor:pointer}'
+'#gw-toast .gw-tx{border-left:1px solid rgba(255,255,255,.25);font-size:1.1rem}'
+'.gw-fab{position:fixed;right:14px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9999;border:0;border-radius:999px;background:'+A+';color:#222;font-weight:700;font-size:.95rem;padding:12px 16px;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer}';
function adminAvail(){return !!d.getElementById('ts-admin');}
function roles(){return CONFIG.roles.filter(function(r){return r.id!=='admin'||adminAvail();});}
function defRole(){
  var ad=d.getElementById('ad');
  if(ad&&ad.classList.contains('on')&&adminAvail())return 'admin';
  if(d.querySelector('#ts-user .ts-dot'))return 'membre';
  return 'visiteur';
}
function build(){
  if(modal)return;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  modal=el('div');modal.id='gw-modal';
  var box=el('div','gw-box'),top=el('div','gw-top'),x=el('button','gw-x','✕');
  x.type='button';x.setAttribute('aria-label','Fermer');x.onclick=close;
  top.append(el('b','',CONFIG.title),x);
  tabs=el('div','gw-tabs');body=el('div','gw-body');
  box.append(top,tabs,body);modal.append(box);d.body.appendChild(modal);
  modal.addEventListener('click',function(e){if(e.target===modal)close();});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
}
function render(){
  var rs=roles();
  tabs.replaceChildren();body.replaceChildren();
  rs.forEach(function(r){
    var b=el('button',r.id===cur?'on':'',r.label);b.type='button';
    b.onclick=function(){cur=r.id;render();};tabs.append(b);
  });
  var r=rs.filter(function(x){return x.id===cur;})[0]||rs[0];
  body.append(el('p','gw-in',r.intro));
  r.secs.forEach(function(s){
    body.append(el('h3','',s.t));
    var ul=el('ul');s.p.forEach(function(p){ul.append(el('li','',p));});body.append(ul);
  });
  body.scrollTop=0;
}
function open(id){
  build();
  var rs=roles();
  cur=(id&&rs.some(function(r){return r.id===id;}))?id:defRole();
  render();modal.classList.add('on');hideToast();
}
function close(){if(modal)modal.classList.remove('on');}
window.GuideWidget={open:open,close:close};

/* Bulle éphémère à l'accueil */
function homeVisible(){var v=d.querySelector('[data-view="accueil"]');return !!v&&!v.hidden;}
function seen(){try{return sessionStorage.getItem('tm-guide-toast')==='1';}catch(e){return false;}}
function mark(){try{sessionStorage.setItem('tm-guide-toast','1');}catch(e){}}
function hideToast(){var t=d.getElementById('gw-toast');if(t)t.remove();}
function showToast(){
  if(d.getElementById('gw-toast')||!homeVisible())return;
  build();mark();
  var t=el('div');t.id='gw-toast';
  var b=el('button','',CONFIG.toast.text);b.type='button';b.onclick=function(){open();};
  var x=el('button','gw-tx','✕');x.type='button';x.setAttribute('aria-label','Fermer');x.onclick=hideToast;
  t.append(b,x);d.body.appendChild(t);
  setTimeout(hideToast,CONFIG.toast.durationMs);
}
if(!(CONFIG.toast.oncePerSession&&seen())){
  var n=0,iv=setInterval(function(){
    if(++n>60){clearInterval(iv);return;}
    if(d.documentElement.classList.contains('ts-splash')||!homeVisible())return;
    clearInterval(iv);setTimeout(showToast,CONFIG.toast.delayMs);
  },500);
}

/* Ligne du menu ☰ existante : ouvre ce guide */
d.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('[data-t="how"]');
  if(!a)return;
  e.preventDefault();e.stopImmediatePropagation();
  d.body.classList.remove('ts-open');open();
},true);

/* Bouton permanent dans le tableau de bord admin */
function addFab(){
  var ad=d.getElementById('ad');
  if(!ad||ad.querySelector('.gw-fab'))return;
  build();
  var b=el('button','gw-fab',CONFIG.title);b.type='button';b.onclick=function(){open('admin');};
  ad.appendChild(b);
}
new MutationObserver(addFab).observe(d.body,{childList:true});
addFab();
})();
