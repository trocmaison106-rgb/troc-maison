(function(){
const I={
home:'<path d="M3 11l9-8 9 8v10H4z"/>',plus:'<path d="M12 5v14M5 12h14"/>',
list:'<path d="M4 6h16M4 12h16M4 18h16"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',grid:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'};
const svg=n=>'<svg viewBox="0 0 24 24">'+I[n]+'</svg>';
/* cible = texte d'un bouton/lien déjà présent dans l'appli, sinon hash */
function go(re,hash){
  const el=[...document.querySelectorAll('a,button')].find(e=>!e.closest('.ts-header,.ts-bottom,.ts-drawer')&&re.test(e.textContent.trim()));
  if(el)el.click();else if(hash!==undefined)location.hash=hash;
  scrollTo(0,0);
}
const T={
 home:()=>{location.hash='';go(/^accueil$/i);},
 pub:()=>go(/publier/i,'#/publier'),
 ads:()=>go(/^annonces$/i,'#/annonces'),
 mine:()=>go(/mes objets/i,'#/mes-objets'),
 prof:()=>go(/mon profil/i,'#/profil'),
 login:()=>go(/(connexion|se connecter|créer mon compte|mon profil)/i,'#/login'),
 about:()=>go(/propos/i,'#/apropos'),
 fav:()=>go(/favoris/i,'#/favoris'),
 msg:()=>go(/messages/i,'#/messages'),
 how:()=>go(/comment ça marche/i,'#/aide'),
 rules:()=>go(/(conditions|sécurité)/i,'#/securite'),
 notif:()=>go(/notifications/i,'#/notifications'),
 out:()=>go(/déconnexion/i)
};
document.body.insertAdjacentHTML('afterbegin',`
<header class="ts-header">
 <div class="ts-brand"><img src="icons/icon-192.png" alt=""><span>TROC <b>MAISON</b></span></div>
 <div class="ts-actions">
  <button class="ts-btn" id="ts-user" aria-label="Connexion">${svg('user')}</button>
  <button class="ts-btn" id="ts-bell" aria-label="Notifications">${svg('bell')}<span class="ts-badge" id="ts-badge">0</span></button>
  <button class="ts-btn" id="ts-menu" aria-label="Menu">${svg('menu')}</button>
 </div>
</header>
<div class="ts-veil" id="ts-veil"></div>
<aside class="ts-drawer">
 <div class="ts-dhead">TROC MAISON<small>Donnez, troquez, réemployez</small></div>
 <a data-t="home">🏠 Accueil</a><a data-t="ads">📋 Annonces</a><a data-t="pub">➕ Publier un objet</a>
 <hr><a data-t="mine">📦 Mes objets</a><a data-t="fav">❤️ Favoris</a><a data-t="msg">💬 Messages</a><a data-t="notif">🔔 Notifications</a><a data-t="prof">👤 Mon profil</a>
 <hr><a data-t="how">❓ Comment ça marche</a><a data-t="rules">🛡️ Conseils de sécurité</a><a data-t="about">ℹ️ À propos</a>
 <a href="tel:+24160141924">📞 Nous contacter</a><a id="ts-share">🔗 Partager l'appli</a>
 <hr><a data-t="out">🚪 Déconnexion</a>
</aside>
<nav class="ts-bottom">
 <button data-t="home" class="on">${svg('home')}Accueil</button>
 <button data-t="pub" class="pub">${svg('plus')}Publier</button>
 <button data-t="ads">${svg('grid')}Annonces</button>
 <button data-t="about">${svg('info')}À propos</button>
</nav>`);
const B=document.body,q=s=>document.querySelector(s);
const close=()=>B.classList.remove('ts-open');
q('#ts-menu').onclick=()=>B.classList.add('ts-open');
q('#ts-veil').onclick=close;
q('#ts-user').onclick=T.login;q('#ts-bell').onclick=T.notif;
q('#ts-share').onclick=()=>{close();navigator.share?navigator.share({title:'TROC MAISON',url:location.origin+location.pathname}):0};
document.querySelectorAll('[data-t]').forEach(e=>e.addEventListener('click',()=>{
  close();T[e.dataset.t]();
  if(e.closest('.ts-bottom')){document.querySelectorAll('.ts-bottom button').forEach(b=>b.classList.toggle('on',b===e));}
}));
/* API publique : TrocShell.setUser({photo:'url'}) ou setUser(null) ; TrocShell.setNotifs(3) */
window.TrocShell={
 setUser(u){const b=q('#ts-user');
  b.innerHTML=u?(u.photo?`<img class="ts-avatar" src="${u.photo}" alt="">`:svg('user'))+'<span class="ts-dot"></span>':svg('user');},
 setNotifs(n){const b=q('#ts-badge');b.textContent=n;b.style.display=n?'grid':'none';}
};
/* Branchement automatique si Firebase Auth est présent */
try{if(window.firebase&&firebase.auth)firebase.auth().onAuthStateChanged(u=>TrocShell.setUser(u&&{photo:u.photoURL}));}catch(e){}
})();
