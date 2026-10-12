(function(){
function fix(a){
  if(a.dataset.fx)return;
  var n=a.firstChild;
  if(n&&n.nodeType===3&&n.textContent.trim()){
    var s=document.createElement('span');s.className='act-st';s.textContent=n.textContent.trim();
    a.replaceChild(s,n);
  }
  a.dataset.fx='1';
}
function run(){document.querySelectorAll('#liste-mes .actions').forEach(fix);}
new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
run();
})();
