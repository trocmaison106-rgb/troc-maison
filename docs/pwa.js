(function () {
  var dp = null, KEY = "tm_pwa_x", ban = null;
  var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if ("serviceWorker" in navigator) {
    addEventListener("load", function () { navigator.serviceWorker.register("sw-push.js").catch(function () {}); });
  }
  if (standalone) return;

  var st = document.createElement("style");
  st.textContent =
    ".tm-ban{position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:99999;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:#0F3D2B;color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.35);border:1px solid #F2C230;font:14px system-ui,sans-serif;animation:tmin .3s ease}" +
    ".tm-ban img{width:42px;height:42px;border-radius:10px}" +
    ".tm-ban div{flex:1;line-height:1.25}.tm-ban small{display:block;opacity:.8;font-size:12px}" +
    ".tm-ban button{border:0;font:inherit;cursor:pointer}" +
    ".tm-ban .tm-go{background:#F2C230;color:#0F3D2B;font-weight:700;padding:9px 14px;border-radius:12px}" +
    ".tm-ban .tm-x{background:transparent;color:#fff;font-size:22px;line-height:1;padding:4px 8px}" +
    ".tm-inst-d{display:block;width:calc(100% - 32px);margin:14px 16px;padding:12px;border:0;border-radius:12px;background:#F2C230;color:#0F3D2B;font:700 15px system-ui,sans-serif;cursor:pointer}" +
    ".tm-toast{position:fixed;left:16px;right:16px;bottom:110px;z-index:100000;background:#0F3D2B;color:#fff;padding:12px 14px;border-radius:12px;font:14px system-ui,sans-serif;text-align:center;box-shadow:0 8px 28px rgba(0,0,0,.35)}" +
    "@keyframes tmin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}";
  document.head.appendChild(st);

  function toast(t) {
    var d = document.createElement("div"); d.className = "tm-toast"; d.textContent = t;
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 6000);
  }
  function hideBanner() { if (ban) { ban.remove(); ban = null; } }
  function install() {
    if (dp) {
      dp.prompt();
      dp.userChoice.then(function () {}, function () {}).then(function () { dp = null; hideBanner(); });
      return;
    }
    toast(ios ? "Touchez Partager, puis « Sur l'écran d'accueil »." : "Ouvrez le menu ⋮ de Chrome, puis « Installer l'application ».");
  }
  function showBanner() {
    try { if (Date.now() - Number(localStorage.getItem(KEY) || 0) < 3 * 86400000) return; } catch (_) {}
    if (ban) return;
    ban = document.createElement("div"); ban.className = "tm-ban";
    ban.innerHTML = '<img src="icons/icon-192.png" alt=""><div>Installer TROC MAISON<small>Accès rapide depuis votre écran d\'accueil</small></div>' +
      '<button class="tm-go" type="button">Installer</button><button class="tm-x" type="button" aria-label="Fermer">✕</button>';
    ban.querySelector(".tm-go").onclick = install;
    ban.querySelector(".tm-x").onclick = function () { try { localStorage.setItem(KEY, String(Date.now())); } catch (_) {} hideBanner(); };
    document.body.appendChild(ban);
    setTimeout(hideBanner, 8000);
  }

  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); dp = e; showBanner(); });
  addEventListener("appinstalled", function () {
    dp = null; hideBanner();
    var b = document.getElementById("tm-install-d"); if (b) b.remove();
    new MutationObserver(function () {}).disconnect();
  });

  // Bouton dans le menu latéral (le menu est construit par shell.js)
  function addDrawerBtn() {
    var d = document.querySelector(".ts-drawer");
    if (!d) return;
    if (d.querySelector("#tm-install-d")) return;
    var b = document.createElement("button");
    b.id = "tm-install-d"; b.type = "button"; b.className = "tm-inst-d";
    b.textContent = "📲 Installer l'application";
    b.onclick = install;
    d.appendChild(b);
  }
  new MutationObserver(addDrawerBtn).observe(document.documentElement, { childList: true, subtree: true });
  addDrawerBtn();
})();
