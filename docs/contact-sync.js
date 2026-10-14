(async function(){
  try{
    const M=await import('./js/firebase-config.js');
    const A=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const FS=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const norm=s=>{s=String(s||'').trim();const inter=s[0]==='+'||/^00/.test(s.replace(/\s/g,''));let n=s.replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n&&!inter&&!n.startsWith('241'))n='241'+n.replace(/^0/,'');return n;};
    A.onAuthStateChanged(M.auth||A.getAuth(),async u=>{
      if(!u)return;
      try{
        const p=await FS.getDoc(FS.doc(M.db,'users',u.uid));
        if(!p.exists())return;
        const d=p.data();
        const w=String(d.whatsapp||'')||norm(d.telephone);
        const nv={whatsapp:w.slice(0,30),telephone:String(d.telephone||'').slice(0,30),email:String(u.email||'').slice(0,100)};
        const c=await FS.getDoc(FS.doc(M.db,'contacts',u.uid));
        const o=c.exists()?c.data():null;
        if(o&&o.whatsapp===nv.whatsapp&&o.telephone===nv.telephone&&o.email===nv.email)return;
        await FS.setDoc(FS.doc(M.db,'contacts',u.uid),Object.assign(nv,{updatedAt:FS.serverTimestamp()}));
      }catch(e){}
    });
  }catch(e){}
})();
