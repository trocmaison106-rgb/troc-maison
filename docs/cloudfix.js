(function(){
var RE=/^(https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(v\d+\/.+)$/;
function fix(img){
  var s=img.getAttribute('src');if(!s)return;
  var m=RE.exec(s);if(m)img.setAttribute('src',m[1]+'f_jpg,q_auto,w_1000,c_limit/'+m[2]);
}
function scan(root){
  if(root.tagName==='IMG')fix(root);
  if(root.querySelectorAll)root.querySelectorAll('img').forEach(fix);
}
new MutationObserver(function(ms){
  ms.forEach(function(m){
    m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n);});
    if(m.type==='attributes'&&m.target.tagName==='IMG')fix(m.target);
  });
}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
scan(document);
})();
