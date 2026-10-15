// RealmQuest authentication. Add your Firebase web app config below to enable real accounts.
// Firebase Console -> Project settings -> Your apps -> Web app config.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  appId: "PASTE_YOUR_APP_ID"
};
const $ = id => document.getElementById(id);
const panel = $("accountPanel");
let auth = null;
const ready = firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_API_KEY" && firebaseConfig.projectId !== "PASTE_YOUR_PROJECT_ID";

function message(text) { $("authMessage").textContent = text; }
function emailAndPassword() {
  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  if (!email || password.length < 6) { message("Enter a valid email and a password of at least 6 characters."); return null; }
  return { email, password };
}
if (ready) {
  try {
    auth = getAuth(initializeApp(firebaseConfig));
    onAuthStateChanged(auth, user => {
      $("accountStatus").textContent = user ? user.email : "Guest Mode";
      if (user) message("Signed in as " + user.email + ". Your current game save is still device-only in this version.");
    });
  } catch (e) { message("Firebase setup issue. Check the config in auth.js."); }
} else {
  message("Guest play is ready. To enable real accounts, connect your Firebase web config and enable Email/Password sign-in.");
}
const savedAvatar = (() => { try { return JSON.parse(localStorage.getItem("realmquest-avatar") || "{}"); } catch { return {}; } })();
if (savedAvatar.name) $("avatarName").value = savedAvatar.name;
if (savedAvatar.emoji) $("avatarEmoji").value = savedAvatar.emoji;
if (savedAvatar.aura) $("avatarAura").value = savedAvatar.aura;
function renderAvatar() {
  const emoji = $("avatarEmoji").value;
  const aura = $("avatarAura").value;
  $("avatarPreview").textContent = emoji;
  $("avatarPreview").className = "avatar-preview aura-" + aura;
}
$("avatarEmoji").addEventListener("change", renderAvatar);
$("avatarAura").addEventListener("change", renderAvatar);
renderAvatar();
$("saveAvatarBtn").addEventListener("click", () => {
  const avatar = { name: $("avatarName").value.trim().slice(0,18), emoji: $("avatarEmoji").value, aura: $("avatarAura").value };
  localStorage.setItem("realmquest-avatar", JSON.stringify(avatar));
  message("Avatar saved on this device" + (avatar.name ? " for " + avatar.name : "") + "!");
});
$("signupBtn").addEventListener("click", async () => {
  if (!auth) { message("Online login is not configured yet. You can still play as a guest; see README.md to connect Firebase."); return; }
  const data = emailAndPassword(); if (!data) return;
  try { await createUserWithEmailAndPassword(auth, data.email, data.password); message("Account created and signed in!"); }
  catch (e) { message(e.message.replace("Firebase: ", "")); }
});
$("loginBtn").addEventListener("click", async () => {
  if (!auth) { message("Online login is not configured yet. You can still play as a guest; see README.md to connect Firebase."); return; }
  const data = emailAndPassword(); if (!data) return;
  try { await signInWithEmailAndPassword(auth, data.email, data.password); message("Login successful!"); }
  catch (e) { message(e.message.replace("Firebase: ", "")); }
});
$("logoutBtn").addEventListener("click", async () => {
  if (!auth) { message("No account session is active. Configure Firebase to use online login."); return; }
  try { await signOut(auth); message("Logged out. You can continue as a guest."); }
  catch (e) { message(e.message.replace("Firebase: ", "")); }
});
