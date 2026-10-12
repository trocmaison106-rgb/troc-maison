(function(){
let M,FS,last=null,busy=false;const done=new WeakSet();
const q=s=>document.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-item]');if(b)last=b.dataset.item;},true);
async function inject(){
  const v=q('[data-view="detail"]');
  if(!v||v.hidden||busy||!last)return;
  const anchor=[...v.querySelectorAll('p.note')].find(p=>/^Propos/.test(p.textContent));
  if(!anchor||done.has(anchor))return;
  done.add(anchor);busy=true;
  try{
    M=M||await import('./js/firebase-config.js');
    FS=FS||await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const s=await FS.getDoc(FS.doc(M.db,'items',last));
    if(!s.exists())return;
    const it=s.data(),box=el('div','tc-box');
    const lnk=(cls,txt,href)=>{const a=el('a','tc-btn '+cls,txt);a.href=href;a.target='_blank';a.rel='noopener';box.append(a);};
    if(it.whatsapp)lnk('tc-wa','💬 Écrire sur WhatsApp','https://wa.me/'+it.whatsapp+'?text='+encodeURIComponent('Bonjour, votre annonce « '+(it.titre||'')+' » sur TROC MAISON m\'intéresse.'));
    if(it.geo&&it.geo.lat!=null){
      const c=it.geo.lat+','+it.geo.lng;
      lnk('tc-map','📍 Voir le lieu','https://www.google.com/maps/search/?api=1&query='+c);
      lnk('tc-dir','🧭 Itinéraire','https://www.google.com/maps/dir/?api=1&destination='+c);
    }
    if(box.children.length&&anchor.isConnected)anchor.before(box);
  }catch(e){}finally{busy=false;}
}
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
})();
