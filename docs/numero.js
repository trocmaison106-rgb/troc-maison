(function(){
function hash(s){var x=2166136261;for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return x>>>0;}
window.TMNO=function(it){
  if(it&&it.numero!=null&&it.numero!=='')return 'TM-'+String(it.numero).padStart(6,'0');
  var c=(hash(String((it&&it.id)||''))%2176782336).toString(36).toUpperCase();
  return 'TM-'+c.padStart(6,'0');
};
var st=document.createElement('style');
st.textContent='.ac-no{font-size:.72rem;font-weight:700;letter-spacing:.05em;color:#8a6d00;margin:0 0 2px}';
document.head.appendChild(st);
setTimeout(function(){if(window.TrocAccRender)window.TrocAccRender();},600);
})();
