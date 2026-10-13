import { auth, db } from "./firebase-config.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getMessaging, getToken, isSupported } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";

const RELAIS = "https://troc-maison-relais.patrickessono06.workers.dev";
const VAPID = "BCN20-KCd2H1SzFdAQvxGp7oA7FDXTSmgAMIGRqDA_JcIFImAKbjxyreK_BsImevhrES2m_XvQA5DzW21Jg9hYE";

export function notifierRelais(id) {
  try {
    fetch(RELAIS + "/notify-item", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  } catch (_) {}
}

async function enregistrer(user) {
  const reg = await navigator.serviceWorker.register(new URL("../sw-push.js", import.meta.url).href);
  await navigator.serviceWorker.ready;
  const token = await getToken(getMessaging(getApp()), { vapidKey: VAPID, serviceWorkerRegistration: reg });
  if (token) await setDoc(doc(db, "pushTokens", token), { uid: user.uid, createdAt: serverTimestamp() });
}

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user || !("serviceWorker" in navigator) || !("Notification" in window) || !(await isSupported())) return;
    if (!(await getDoc(doc(db, "admins", user.uid))).exists()) return;
    if (Notification.permission === "granted") return await enregistrer(user);
    if (Notification.permission === "default") {
      document.addEventListener("click", async () => {
        try { if ((await Notification.requestPermission()) === "granted") await enregistrer(user); } catch (e) { console.warn(e); }
      }, { once: true });
    }
  } catch (e) { console.warn("push", e); }
});
