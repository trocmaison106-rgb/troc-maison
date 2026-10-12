(function(){
const d=document,q=s=>d.querySelector(s);
const logged=()=>!!q('#ts-user .ts-dot');
let pend=null;
try{pend=sessionStorage.getItem('tm-pending');}catch(e){}
const save=id=>{pend=id;try{id?sessionStorage.setItem('tm-pending',id):sessionStorage.removeItem('tm-pending');}catch(e){}};

const st=d.createElement('style');
st.textContent='#vis-modal{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:20px}'
+'#vis-modal.on{display:flex}'
+'.vis-box{background:#fff;color:#222;border-radius:16px;padding:22px 18px;width:100%;max-width:340px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.35)}'
+'.vis-box h2{margin:0 0 8px;font-size:1.15rem}'
+'.vis-box p{margin:0 0 16px;font-size:.95rem;line-height:1.4}'
+'.vis-box button{display:block;width:100%;padding:12px;margin-top:8px;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;border:2px solid #f5b800}'
+'.vis-a{background:#f5b800;color:#222}.vis-b{background:#fff;color:#222}'
+'.vis-c{background:transparent;border-color:transparent!important;color:#666;font-weight:400!important}';
d.head.appendChild(st);

const w=d.createElement('div');w.id='vis-modal';
w.innerHTML='<div class="vis-box"><h2>Annonce réservée aux membres</h2>'
+'<p>Créez un compte gratuit pour voir cette annonce.</p>'
+'<button class="vis-a" data-v="new">Créer mon compte</button>'
+'<button class="vis-b" data-v="old">J\'ai déjà un compte</button>'
+'<button class="vis-c" data-v="x">Fermer</button></div>';
d.body.appendChild(w);

w.addEventListener('click',e=>{
  const b=e.target.closest('[data-v]');
  if(e.target===w){w.classList.remove('on');return;}
  if(!b)return;
  w.classList.remove('on');
  if(b.dataset.v==='x'){save(null);return;}
  if(b.dataset.v==='new'){const g=q('[data-go="inscription"]');if(g)g.click();else{const u=q('#ts-user');if(u)u.click();}return;}
  if(b.dataset.v==='old'){const u=q('#ts-user');if(u)u.click();}
});

/* Visiteur : bloque l'ouverture d'une annonce, WhatsApp et Itinéraire */
d.addEventListener('click',e=>{
  if(logged()||e.target.closest('#vis-modal'))return;
  const c=e.target.closest('.ac-card'),i=e.target.closest('#liste-annonces [data-item]');
  if(!c&&!i)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  save(c?c.dataset.id:i.dataset.item);
  w.classList.add('on');
},true);

/* Après connexion : rouvre l'annonce touchée */
function reopen(){
  if(!pend||!logged())return;
  const id=pend;save(null);
  const sel='#liste-annonces [data-item="'+id+'"]';
  const g=q('[data-go="parcourir"]');if(g)g.click();
  let n=0;const t=setInterval(()=>{const b=q(sel);if(b){clearInterval(t);b.click();}else if(++n>30)clearInterval(t);},200);
}
new MutationObserver(reopen).observe(d.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
reopen();
})();
