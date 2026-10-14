import { notifierRelais } from "./push.js";
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
  try {
    let bmp;
    try { bmp = await createImageBitmap(file); }
    catch (e) {
      bmp = await new Promise((ok, ko) => {
        const i = new Image();
        i.onload = () => ok(i); i.onerror = ko; i.src = URL.createObjectURL(file);
      });
    }
    const w = bmp.width || bmp.naturalWidth, hh = bmp.height || bmp.naturalHeight;
    const r = Math.min(1, 1200 / Math.max(w, hh));
    const c = document.createElement("canvas");
    c.width = Math.round(w * r); c.height = Math.round(hh * r);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.8));
    return blob || file;
  } catch (e) { return file; }
}

async function envoyer(blob) {
  const fd = new FormData();
  fd.append("file", blob, "photo.jpg"); fd.append("upload_preset", PRESET);
  const r = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD + "/image/upload", { method: "POST", body: fd });
  if (!r.ok) throw new Error("photo " + r.status + " " + (await r.text()).slice(0, 80));
  return (await r.json()).secure_url;
}

function collage(ph) {
  const l = (ph || []).slice(0, 4);
  if (!l.length) return h("div", { class: "collage n1" }, h("div", { class: "sans-photo" }));
  return h("div", { class: "collage n" + l.length },
    l.map((src) => h("img", { src, alt: "", loading: "lazy" })));
}

function carte(it, actions) {
  const photo = it.photos && it.photos[0];
  const corps = [
    collage(it.photos),
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
    h("button", { type: "button", onclick: () => modifier(it) }, "Modifier"),
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
      const itemRef = await addDoc(collection(db, "items"), {
        ownerId: u.uid, ownerPrenom: p.data().prenom, titre,
        description: f.description.value.trim(), categorie: f.categorie.value, etat: f.etat.value,
        valeurEstimee: Math.max(0, Math.round(Number(f.valeur.value) || 0)),
        recherche: f.recherche.value.trim(), photos: urls,
        quartier: p.data().quartier, ville: p.data().ville, whatsapp: "", geo: (p.data().partage?p.data().geo:null)||null, statut: "actif",
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      notifierRelais(itemRef.id); f.reset(); show("mesobjets"); chargerMesObjets();
    } catch (err) {
      console.error(err); msg(err.code === "permission-denied" ? "Refusé : publiez d'abord les nouvelles règles Firestore." : "Échec de l'envoi (" + (err.code || err.message) + "). Réessayez.");
    } finally { b.disabled = false; b.textContent = "Publier"; }
  });
}

/* ===== Modifier une annonce ===== */
function modifier(it) {
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const liste = (it.photos || []).slice(0, 4).map((src) => ({ src, file: null }));
  const ov = mk("div", "ed-ov"), box = mk("div", "ed-box");
  const champ = (lab, el) => { const w = mk("label", "ed-l", lab); w.append(el); return w; };
  const titre = mk("input"); titre.type = "text"; titre.maxLength = 80; titre.value = it.titre || "";
  const desc = mk("textarea"); desc.rows = 4; desc.value = it.description || "";
  const cat = mk("select"); CATS.forEach((v) => cat.append(new Option(v, v))); cat.value = it.categorie || CATS[0];
  const etat = mk("select"); ETATS.forEach((v) => etat.append(new Option(v, v))); etat.value = it.etat || ETATS[0];
  const val = mk("input"); val.type = "number"; val.min = "0"; val.value = it.valeurEstimee || 0;
  const rech = mk("input"); rech.type = "text"; rech.value = it.recherche || "";
  const grille = mk("div", "ed-ph"), msg = mk("p", "ed-msg");
  const ajout = mk("input"); ajout.type = "file"; ajout.accept = "image/*"; ajout.multiple = true;
  function dessiner() {
    grille.replaceChildren(...liste.map((p, i) => {
      const c = mk("div", "ed-p"), im = mk("img"); im.src = p.src; im.alt = "";
      c.append(im);
      if (i === 0) c.append(mk("span", "", "★ Photo principale"));
      else {
        const b = mk("button", "ed-sm", "★ Mettre en principale"); b.type = "button";
        b.onclick = () => { liste.unshift(liste.splice(i, 1)[0]); dessiner(); };
        c.append(b);
      }
      const r = mk("button", "ed-sm ed-rm", "Retirer"); r.type = "button";
      r.onclick = () => { liste.splice(i, 1); dessiner(); };
      c.append(r);
      return c;
    }));
  }
  ajout.addEventListener("change", () => {
    for (const f of [...ajout.files]) {
      if (liste.length >= 4) { msg.textContent = "4 photos maximum."; break; }
      liste.push({ src: URL.createObjectURL(f), file: f });
    }
    ajout.value = ""; dessiner();
  });
  const ok = mk("button", "ed-ok", "Enregistrer"); ok.type = "button";
  const non = mk("button", "", "Annuler"); non.type = "button";
  non.onclick = () => ov.remove();
  ok.onclick = async () => {
    msg.textContent = "";
    if (titre.value.trim().length < 3) { msg.textContent = "Indiquez un titre (3 caractères minimum)."; return; }
    if (!liste.length) { msg.textContent = "Gardez au moins une photo."; return; }
    ok.disabled = true; ok.textContent = "Enregistrement…";
    try {
      const urls = [];
      for (const p of liste) urls.push(p.file ? await envoyer(await compresser(p.file)) : p.src);
      await updateDoc(doc(db, "items", it.id), {
        titre: titre.value.trim(), description: desc.value.trim(), categorie: cat.value, etat: etat.value,
        valeurEstimee: Math.max(0, Math.round(Number(val.value) || 0)), recherche: rech.value.trim(),
        photos: urls, updatedAt: serverTimestamp()
      });
      ov.remove(); chargerMesObjets();
    } catch (err) {
      console.error(err);
      msg.textContent = err.code === "permission-denied" ? "Refusé par les règles Firestore." : "Échec (" + (err.code || err.message) + "). Réessayez.";
      ok.disabled = false; ok.textContent = "Enregistrer";
    }
  };
  const act = mk("div", "ed-act"); act.append(non, ok);
  box.append(mk("h2", "", "Modifier l'annonce"), champ("Titre", titre), champ("Description", desc),
    champ("Catégorie", cat), champ("État", etat), champ("Valeur estimée (FCFA)", val), champ("Je recherche", rech),
    mk("p", "ed-l", "Photos (la première est celle affichée)"), grille, champ("Ajouter des photos", ajout), msg, act);
  ov.append(box); document.body.append(ov); dessiner();
}
