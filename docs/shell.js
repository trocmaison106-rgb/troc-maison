(function(){
const I={
home:'<path d="M3 11l9-8 9 8v10H4z"/>',plus:'<path d="M12 5v14M5 12h14"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
grid:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'};
const svg=n=>'<svg viewBox="0 0 24 24">'+I[n]+'</svg>';
const q=s=>document.querySelector(s);
let user=null;
function go(name){
  const el=document.querySelector('[data-go="'+name+'"]');
  if(el)el.click();
}
const SHEETS={
 about:['À propos','<p>TROC MAISON permet aux particuliers du Gabon d\'échanger les objets dont ils n\'ont plus besoin. Simple, gratuit et solidaire.</p><p>Un service PC-INFORMATIQUE · Libreville, Gabon</p><p>Contact : +241 60 14 19 24<br>pcinformatique28@gmail.com</p>'],
 how:['Comment ça marche','<ul><li><b>1. Publiez</b> un objet avec une photo et une description.</li><li><b>2. Trouvez</b> les personnes qui cherchent cet objet.</li><li><b>3. Rencontrez-vous</b> et échangez en confiance.</li></ul>'],
 rules:['Conseils de sécurité','<ul><li>Rencontrez-vous dans un lieu public et fréquenté.</li><li>Venez accompagné si possible, de jour de préférence.</li><li>Vérifiez l\'objet avant d\'échanger.</li><li>Ne payez jamais d\'avance et ne donnez pas d\'informations bancaires.</li></ul>'],
 soon:['Bientôt disponible','<p>Cette fonction arrive prochainement.</p>']
};
function sheet(k){const s=SHEETS[k];q('#ts-sheet div').innerHTML='<h2>'+s[0]+'</h2>'+s[1]+'<button id="ts-x">Fermer</button>';q('#ts-sheet').classList.add('on');q('#ts-x').onclick=()=>q('#ts-sheet').classList.remove('on');}
const T={
 home:()=>go('accueil'),
 pub:()=>user?go('publier'):go('connexion'),
 ads:()=>user?go('parcourir'):go('connexion'),
 mine:()=>go('mesobjets'),
 prof:()=>user?profil():go('connexion'),
 login:()=>user?profil():go('connexion'),
 notif:()=>sheet('soon'),fav:()=>sheet('soon'),msg:()=>sheet('soon'),
 about:()=>sheet('about'),how:()=>sheet('how'),rules:()=>sheet('rules'),
 out:()=>{const b=[...document.querySelectorAll('button')].find(e=>!e.closest('.ts-drawer')&&/déconnexion/i.test(e.textContent));if(b)b.click();}
};
document.body.insertAdjacentHTML('afterbegin',`
<header class="ts-header">
 <div class="ts-brand" data-t="home"><img src="icons/icon-192.png" alt=""><span>TROC <b>MAISON</b></span></div>
 <div class="ts-actions">
  <button class="ts-btn" id="ts-user" aria-label="Connexion">${svg('user')}</button>
  <button class="ts-btn" id="ts-bell" aria-label="Notifications">${svg('bell')}<span class="ts-badge" id="ts-badge">0</span></button>
  <button class="ts-btn" id="ts-menu" aria-label="Menu">${svg('menu')}</button>
 </div>
</header>
<div class="ts-veil" id="ts-veil"></div>
<aside class="ts-drawer">
 <div class="ts-dhead">TROC MAISON<small>Troquez, échangez, remplacez</small></div>
 <a data-t="home">🏠 Accueil</a><a data-t="ads">📋 Annonces</a><a data-t="pub">➕ Publier un objet</a>
 <hr><a data-t="mine">📦 Mes objets</a><a data-t="fav">❤️ Favoris</a><a data-t="msg">💬 Messages</a><a data-t="notif">🔔 Notifications</a><a data-t="prof">👤 Mon profil</a>
 <hr><a data-t="how">❓ Comment ça marche</a><a data-t="rules">🛡️ Conseils de sécurité</a><a data-t="about">ℹ️ À propos</a>
 <a href="tel:+24160141924">📞 Nous contacter</a><a id="ts-share">🔗 Partager l'appli</a>
 <hr><a data-t="out">🚪 Déconnexion</a>
</aside>
<nav class="ts-bottom">
 <button data-t="home" data-k="home" class="on">${svg('home')}Accueil</button>
 <button data-t="prof" data-k="prof">${svg('user')}Profil</button>
 <button data-t="pub" data-k="pub" class="pub">${svg('plus')}Publier</button>
 <button data-t="ads" data-k="ads">${svg('grid')}Annonces</button>
 <button data-t="about">${svg('info')}À propos</button>
</nav>
<div class="ts-sheet" id="ts-sheet"><div></div></div>`);
const B=document.body,close=()=>B.classList.remove('ts-open');
q('#ts-menu').onclick=()=>B.classList.add('ts-open');
q('#ts-veil').onclick=close;
q('#ts-user').onclick=T.login;q('#ts-bell').onclick=T.notif;
q('#ts-sheet').onclick=e=>{if(e.target.id==='ts-sheet')e.target.classList.remove('on');};
q('#ts-share').onclick=()=>{close();if(navigator.share)navigator.share({title:'TROC MAISON',url:location.origin+location.pathname});};
document.querySelectorAll('[data-t]').forEach(e=>e.addEventListener('click',()=>{close();T[e.dataset.t]();}));
/* Surbrillance selon la vue affichée par l'appli */
const MAP={accueil:'home',inscription:'home',connexion:'home',reset:'home',publier:'pub',parcourir:'ads',detail:'ads'};
function sync(){
  const v=document.querySelector('[data-view]:not([hidden])');
  const k=v&&MAP[v.dataset.view];
  document.querySelectorAll('.ts-bottom [data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
}
const main=q('main');if(main){new MutationObserver(sync).observe(main,{attributes:true,subtree:true,attributeFilter:['hidden']});sync();}
window.TrocShell={
 setUser(u){
  user=u;const b=q('#ts-user');
  b.innerHTML=u?(u.photo?'<img class="ts-avatar" src="'+u.photo+'" alt="">':svg('user'))+'<span class="ts-dot"></span>':svg('user');
 },
 setNotifs(n){const b=q('#ts-badge');b.textContent=n;b.style.display=n?'grid':'none';}
};
/* Connexion : suit l'état Firebase de votre appli */
import('./js/firebase-config.js').then(m=>import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js').then(a=>{
  a.onAuthStateChanged(m.auth,u=>TrocShell.setUser(u?{photo:u.photoURL,name:u.displayName,email:u.email}:null));
})).catch(()=>{});
})();
