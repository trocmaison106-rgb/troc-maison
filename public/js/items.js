import { auth, db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, getDoc, doc, query, where, limit,
  updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CLOUD = "phkmhizg", PRESET = "troc_maison";
const CATS = ["Électroménager", "Meubles", "Vêtements", "Chaussures", "Téléphones et informatique",
  "Cuisine et vaisselle", "Enfants et bébés", "Livres et école", "Sport et loisirs", "Outils et bricolage", "Autre"];
const ETATS = ["Neuf", "Très bon état", "Bon état", "À réparer"];
const $ = (s, r = document) => r.querySelector(s);
let annonces = [];
let showFn = () => {};

function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  kids.flat().filter((c) => c !== null && c !== undefined).forEach((c) => e.append(c));
  return e;
}
const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";
const recent = (a, b) => ((b.createdAt && b.createdAt.seconds) || 0) - ((a.createdAt && a.createdAt.seconds) || 0);

async function compresser(file) {
  const bmp = await createImageBitmap(file);
  const r = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, "image/jpeg", 0.8));
}

async function envoyer(blob) {
  const fd = new FormData();
  fd.append("file", blob); fd.append("upload_preset", PRESET);
  const r = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD + "/image/upload", { method: "POST", body: fd });
  if (!r.ok) throw new Error("upload");
  return (await r.json()).secure_url;
}

function carte(it, actions) {
  const photo = it.photos && it.photos[0];
  const corps = [
    photo ? h("img", { src: photo, alt: "", loading: "lazy" }) : h("div", { class: "sans-photo" }),
    h("b", {}, it.titre),
    h("span", {}, it.quartier ? it.quartier + " · " + it.ville : it.ville),
    h("span", {}, it.categorie + " · " + fcfa(it.valeurEstimee))
  ];
  const btn = h("button", { class: "carte-btn", type: "button", "data-item": it.id }, corps);
  return h("div", { class: "carte" }, btn, actions || null);
}

function afficher() {
  const q = $("#f-q").value.trim().toLowerCase(), cat = $("#f-cat").value;
  const l = annonces.filter((a) => (!cat || a.categorie === cat)
    && (!q || (a.titre + " " + a.description).toLowerCase().includes(q)));
  const box = $("#liste-annonces");
  box.replaceChildren(...l.map((a) => carte(a)));
  $("#vide-annonces").hidden = l.length > 0;
}

export async function chargerAnnonces() {
  try {
    const s = await getDocs(query(collection(db, "items"), where("statut", "==", "actif"), limit(50)));
    annonces = s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(recent);
  } catch (e) { annonces = []; }
  afficher();
}

export async function chargerMesObjets() {
  const u = auth.currentUser; if (!u) return;
  let l = [];
  try {
    const s = await getDocs(query(collection(db, "items"), where("ownerId", "==", u.uid), limit(50)));
    l = s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(recent);
  } catch (e) { /* liste vide */ }
  const lib = { actif: "En ligne", pause: "En pause", echange: "Échangé" };
  const maj = async (id, statut) => { await updateDoc(doc(db, "items", id), { statut, updatedAt: serverTimestamp() }); chargerMesObjets(); };
  $("#liste-mes").replaceChildren(...l.map((it) => carte(it, h("div", { class: "actions" },
    h("em", {}, lib[it.statut] || it.statut),
    it.statut !== "echange" ? h("button", { type: "button", onclick: () => maj(it.id, it.statut === "actif" ? "pause" : "actif") }, it.statut === "actif" ? "Mettre en pause" : "Remettre en ligne") : null,
    it.statut !== "echange" ? h("button", { type: "button", onclick: () => maj(it.id, "echange") }, "Marquer échangé") : null,
    h("button", { type: "button", class: "danger", onclick: async () => {
      if (confirm("Supprimer cet objet ?")) { await deleteDoc(doc(db, "items", it.id)); chargerMesObjets(); }
    } }, "Supprimer")
  ))));
  $("#vide-mes").hidden = l.length > 0;
}

async function ouvrir(id) {
  const s = await getDoc(doc(db, "items", id));
  if (!s.exists()) return;
  const it = s.data();
  $("#detail-contenu").replaceChildren(
    ...(it.photos || []).map((p) => h("img", { class: "grande", src: p, alt: "" })),
    h("h1", {}, it.titre),
    h("p", { class: "note" }, [it.categorie, it.etat, fcfa(it.valeurEstimee)].join(" · ")),
    h("p", {}, it.description || ""),
    it.recherche ? h("p", {}, h("b", {}, "Recherche : "), it.recherche) : null,
    h("p", { class: "note" }, "Proposé par " + it.ownerPrenom + " · " + (it.quartier ? it.quartier + ", " : "") + it.ville)
  );
  showFn("detail");
}

export function initItems(show) {
  showFn = show;
  const fill = (sel, list, tout) => {
    if (tout) sel.append(new Option("Toutes les catégories", ""));
    list.forEach((v) => sel.append(new Option(v, v)));
  };
  fill($("#f-cat"), CATS, true); fill($("#n-cat"), CATS); fill($("#n-etat"), ETATS);
  $("#f-cat").addEventListener("change", afficher);
  $("#f-q").addEventListener("input", afficher);
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-item]");
    if (c) ouvrir(c.dataset.item);
  });
  $("#form-item").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, u = auth.currentUser;
    const msg = (t) => { $(".msg", f).textContent = t || ""; };
    if (!u) return;
    const titre = f.titre.value.trim(), files = [...f.photos.files].slice(0, 4);
    if (titre.length < 3) return msg("Indiquez un titre (3 caractères minimum).");
    if (!files.length) return msg("Ajoutez au moins une photo.");
    const b = $("button[type=submit]", f);
    b.disabled = true; b.textContent = "Envoi des photos…"; msg("");
    try {
      const p = await getDoc(doc(db, "users", u.uid));
      if (!p.exists()) return msg("Complétez d'abord votre profil.");
      const urls = [];
      for (const file of files) urls.push(await envoyer(await compresser(file)));
      await addDoc(collection(db, "items"), {
        ownerId: u.uid, ownerPrenom: p.data().prenom, titre,
        description: f.description.value.trim(), categorie: f.categorie.value, etat: f.etat.value,
        valeurEstimee: Math.max(0, Math.round(Number(f.valeur.value) || 0)),
        recherche: f.recherche.value.trim(), photos: urls,
        quartier: p.data().quartier, ville: p.data().ville, statut: "actif",
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      f.reset(); show("mesobjets"); chargerMesObjets();
    } catch (err) {
      msg(err.code === "permission-denied" ? "Refusé : publiez d'abord les nouvelles règles Firestore." : "Échec de l'envoi. Vérifiez votre connexion et réessayez.");
    } finally { b.disabled = false; b.textContent = "Publier"; }
  });
}
