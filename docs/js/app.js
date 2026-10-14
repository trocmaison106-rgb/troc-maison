import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { initItems, chargerAnnonces, chargerMesObjets } from "./items.js?v=2";

const VUES_APP = ["profil", "parcourir", "mesobjets", "publier", "detail"];
const $ = (s, r = document) => r.querySelector(s);
const views = document.querySelectorAll("[data-view]");
const nav = $("#nav");
const VILLES = ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", "Lambaréné",
  "Mouila", "Tchibanga", "Koulamoutou", "Makokou", "Autre ville"];

let currentUser = null;
let profileExists = false;
let registering = false;

// Listes de villes
document.querySelectorAll("[data-villes]").forEach((sel) => {
  VILLES.forEach((v) => { const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o); });
});

function show(name) {
  views.forEach((v) => { v.hidden = v.dataset.view !== name; });
  nav.hidden = !VUES_APP.includes(name);
  nav.querySelectorAll("[data-go]").forEach((b) => b.classList.toggle("actif", b.dataset.go === name));
  window.tmAncre ? window.tmAncre(name) : window.scrollTo(0, 0);
}

function setMsg(form, text, ok = false) {
  const m = $(".msg", form);
  m.textContent = text || "";
  m.classList.toggle("ok", ok);
}

function setBusy(form, busy) {
  const b = $("button[type=submit]", form);
  if (!b.dataset.txt) b.dataset.txt = b.textContent;
  b.disabled = busy;
  b.textContent = busy ? "Patientez…" : b.dataset.txt;
}

function erreur(err) {
  const c = err && err.code ? err.code : "";
  const t = {
    "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.",
    "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
    "auth/weak-password": "Mot de passe trop faible : 8 caractères minimum.",
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/user-not-found": "E-mail ou mot de passe incorrect.",
    "auth/wrong-password": "E-mail ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop d'essais. Patientez quelques minutes puis réessayez.",
    "auth/network-request-failed": "Pas de connexion internet. Vérifiez votre réseau.",
    "auth/unauthorized-domain": "Ce site n'est pas encore autorisé dans Firebase (domaine).",
    "auth/operation-not-allowed": "La connexion par e-mail n'est pas activée dans Firebase.",
    "permission-denied": "Enregistrement refusé : les règles Firestore ne sont pas encore publiées."
  };
  return t[c] || "Une erreur est survenue. Réessayez dans un instant.";
}

function lire(form) {
  const d = new FormData(form);
  const o = {};
  for (const [k, v] of d.entries()) o[k] = typeof v === "string" ? v.trim() : v;
  return o;
}

async function loadProfile() {
  const f = $("#form-profil");
  if (!currentUser) return;
  profileExists = false;
  let data = {};
  try {
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    if (snap.exists()) { data = snap.data(); profileExists = true; }
  } catch (e) { /* profil non lisible : formulaire vide */ }
  f.prenom.value = data.prenom || "";
  f.telephone.value = data.telephone || "";
  f.ville.value = VILLES.includes(data.ville) ? data.ville : "Libreville";
  f.quartier.value = data.quartier || "";
  $("#salut").textContent = data.prenom ? "Bonjour, " + data.prenom : "Mon profil";
  let depuis = "";
  if (data.createdAt && data.createdAt.toDate) depuis = " · Membre depuis le " + data.createdAt.toDate().toLocaleDateString("fr-FR");
  $("#info-compte").textContent = currentUser.email + depuis;
  setMsg(f, "");
}

// Navigation
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-go]");
  if (!t) return;
  e.preventDefault();
  const name = t.dataset.go;
  document.querySelectorAll(".msg").forEach((m) => { m.textContent = ""; });
  if (VUES_APP.includes(name) && !currentUser) return show("accueil");
  if (name === "profil") loadProfile();
  if (name === "parcourir") chargerAnnonces();
  if (name === "mesobjets") chargerMesObjets();
  show(name);
});

document.addEventListener("change", (e) => {
  if (e.target.matches("[data-voir-mdp]")) {
    e.target.closest("form").querySelectorAll("input[data-mdp]").forEach((i) => { i.type = e.target.checked ? "text" : "password"; });
  }
});

// Inscription
$("#form-inscription").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const d = lire(f);
  if (!d.prenom) return setMsg(f, "Indiquez votre prénom.");
  if (!d.email) return setMsg(f, "Indiquez votre adresse e-mail.");
  if (d.mdp.length < 8) return setMsg(f, "Le mot de passe doit contenir au moins 8 caractères.");
  if (d.mdp !== d.mdp2) return setMsg(f, "Les deux mots de passe ne sont pas identiques.");
  setMsg(f, ""); setBusy(f, true); registering = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, d.email, d.mdp);
    currentUser = cred.user;
    await setDoc(doc(db, "users", cred.user.uid), {
      prenom: d.prenom, telephone: d.telephone, ville: d.ville, quartier: d.quartier,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    await loadProfile();
    f.reset();
    show("profil");
  } catch (err) {
    if (auth.currentUser) {
      currentUser = auth.currentUser;
      await loadProfile();
      show("profil");
      setMsg($("#form-profil"), "Votre compte est créé, mais le profil n'a pas pu être enregistré (" + erreur(err) + ") Appuyez sur Enregistrer pour réessayer.");
    } else {
      setMsg(f, erreur(err));
    }
  } finally {
    registering = false; setBusy(f, false);
  }
});

// Connexion
$("#form-connexion").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const d = lire(f);
  if (!d.email || !d.mdp) return setMsg(f, "Indiquez votre e-mail et votre mot de passe.");
  setMsg(f, ""); setBusy(f, true);
  try {
    await signInWithEmailAndPassword(auth, d.email, d.mdp);
    f.reset();
  } catch (err) { setMsg(f, erreur(err)); }
  finally { setBusy(f, false); }
});

// Mot de passe oublié
$("#form-reset").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const d = lire(f);
  if (!d.email) return setMsg(f, "Indiquez votre adresse e-mail.");
  setMsg(f, ""); setBusy(f, true);
  try {
    await sendPasswordResetEmail(auth, d.email);
    setMsg(f, "Si cette adresse existe, un e-mail vient d'être envoyé. Pensez à vérifier les courriers indésirables.", true);
  } catch (err) {
    if (err.code === "auth/invalid-email" || err.code === "auth/network-request-failed") setMsg(f, erreur(err));
    else setMsg(f, "Si cette adresse existe, un e-mail vient d'être envoyé. Pensez à vérifier les courriers indésirables.", true);
  } finally { setBusy(f, false); }
});

// Profil
$("#form-profil").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const d = lire(f);
  if (!d.prenom) return setMsg(f, "Indiquez votre prénom.");
  if (!currentUser) return show("accueil");
  setMsg(f, ""); setBusy(f, true);
  try {
    const data = { prenom: d.prenom, telephone: d.telephone, ville: d.ville, quartier: d.quartier, updatedAt: serverTimestamp() };
    if (!profileExists) data.createdAt = serverTimestamp();
    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
    profileExists = true;
    await loadProfile();
    setMsg(f, "Profil enregistré.", true);
  } catch (err) { setMsg(f, erreur(err)); }
  finally { setBusy(f, false); }
});

$("#btn-deconnexion").addEventListener("click", async () => {
  try { await signOut(auth); } catch (err) { /* ignoré */ }
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (registering) return;
  if (user) { await loadProfile(); show("profil"); }
  else show("accueil");
});

initItems(show);
