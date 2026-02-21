import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfZPIg6Nif_Mx_Wwyl0byM6vJCd5BLgo8",
  authDomain: "xuanbinhngo-2026.firebaseapp.com",
  projectId: "xuanbinhngo-2026",
  storageBucket: "xuanbinhngo-2026.appspot.com",
  messagingSenderId: "910448630867",
  appId: "1:910448630867:web:2b48e0b859e355aa0efaa6",
  measurementId: "G-FN0BFL9FQQ"
};

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/thumbs/svg?seed=Xuan12A1";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

/* ✅ DOM đúng theo HTML Dashboard */
const elAvatar = $("avatarDash");
const elName = $("nameDash");
const elEmail = $("emailDash");
const inputName = $("displayNameDash");
const inputFile = $("avatarFile");
const msg = $("msgDash");

const elCoins = $("coins");
const elInteractions = $("interactions");
const taAchievement = $("achievement");

const notifList = $("notifList");
const notifText = $("notifText");

const btnHome = $("btnHomeLocal");     // ✅ đúng id bạn đổi trong HTML
const btnLogout = $("btnLogoutDash");
const btnResetAvatar = $("btnResetAvatar");
const btnSaveProfile = $("btnSaveProfile");
const btnAddNotif = $("btnAddNotif");
const btnClearNotif = $("btnClearNotif");

function show(text, isError = false) {
  if (!msg) return;
  msg.textContent = text || "";
  msg.style.color = isError ? "#ffd0d0" : "";
}

function renderNotifs(items = []) {
  if (!notifList) return;
  notifList.innerHTML = "";
  if (!items.length) {
    notifList.innerHTML = `<div class="muted">Chưa có thông báo nào.</div>`;
    return;
  }
  items.slice(0, 10).forEach((n) => {
    const div = document.createElement("div");
    div.className = "notifItem";
    div.innerHTML = `
      <div style="font-weight:900;color:var(--gold)">${n.title || "📢 Thông báo"}</div>
      <div class="muted" style="margin-top:6px">${n.text || ""}</div>
    `;
    notifList.appendChild(div);
  });
}

async function ensureUserDoc(user) {
  const refUser = doc(db, "users", user.uid);
  const snap = await getDoc(refUser);
  if (!snap.exists()) {
    await setDoc(refUser, {
      uid: user.uid,
      displayName: user.displayName || "User",
      avatarBase64: "",
      photoURL: user.photoURL || DEFAULT_AVATAR,
      coins: 0,
      interactions: 0,
      achievement: "",
      notifications: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  return refUser;
}

/* ✅ NAV */
btnHome?.addEventListener("click", (e) => {
  // nếu là <a>, để nó mở link như bạn set href; không cần handler cũng được
});

btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  location.hash = "#login";
});

/* ✅ Avatar: đơn giản hoá (giữ y chang logic base64 bạn đang dùng) */
let croppedBase64 = null;

inputFile?.addEventListener("change", async () => {
  const file = inputFile.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    show("File không phải hình ảnh.", true);
    inputFile.value = "";
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    show("Ảnh quá lớn (tối đa ~3MB).", true);
    inputFile.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    croppedBase64 = reader.result;
    if (elAvatar) elAvatar.src = croppedBase64;
    show("Đã chọn avatar mới (chưa lưu). Bấm 'Lưu hồ sơ' để cập nhật.");
  };
  reader.readAsDataURL(file);
});

btnResetAvatar?.addEventListener("click", async () => {
  const u = auth.currentUser;
  if (!u) return;

  const refUser = doc(db, "users", u.uid);
  await updateDoc(refUser, {
    avatarBase64: "",
    photoURL: DEFAULT_AVATAR,
    updatedAt: serverTimestamp()
  });

  if (elAvatar) elAvatar.src = DEFAULT_AVATAR;
  croppedBase64 = null;
  if (inputFile) inputFile.value = "";
  show("Đã đặt avatar mặc định.");
});

btnSaveProfile?.addEventListener("click", async () => {
  try {
    show("");
    const u = auth.currentUser;
    if (!u) return;

    const newName = (inputName?.value || "").trim() || "User";
    const refUser = doc(db, "users", u.uid);

    await updateProfile(u, { displayName: newName }); // ✅ không nhét base64 vào photoURL

    await updateDoc(refUser, {
      displayName: newName,
      avatarBase64: croppedBase64 || "",
      photoURL: croppedBase64 ? "" : (u.photoURL || DEFAULT_AVATAR),
      updatedAt: serverTimestamp()
    });

    croppedBase64 = null;
    if (inputFile) inputFile.value = "";
    show("Đã lưu hồ sơ!");
  } catch (e) {
    show(e?.message || "Lỗi lưu hồ sơ", true);
  }
});

btnAddNotif?.addEventListener("click", async () => {
  try {
    show("");
    const u = auth.currentUser;
    if (!u) return;

    const text = (notifText?.value || "").trim();
    if (!text) return show("Nhập nội dung thông báo trước nhé.", true);

    const refUser = doc(db, "users", u.uid);
    const snap = await getDoc(refUser);
    const data = snap.data() || {};
    const arr = Array.isArray(data.notifications) ? data.notifications : [];

    const next = [{ title: "📢 Thông báo", text, ts: Date.now() }, ...arr].slice(0, 15);
    await updateDoc(refUser, { notifications: next, updatedAt: serverTimestamp() });

    if (notifText) notifText.value = "";
    show("Đã đăng thông báo!");
  } catch (e) {
    show(e?.message || "Lỗi đăng thông báo", true);
  }
});

btnClearNotif?.addEventListener("click", async () => {
  const u = auth.currentUser;
  if (!u) return;
  const refUser = doc(db, "users", u.uid);
  await updateDoc(refUser, { notifications: [], updatedAt: serverTimestamp() });
  show("Đã xóa tất cả thông báo.");
});

/* ✅ AUTH + realtime */
let unsubUserDoc = null;

onAuthStateChanged(auth, async (user) => {
  if (unsubUserDoc) { unsubUserDoc(); unsubUserDoc = null; }

  if (!user) {
    location.hash = "#login";
    return;
  }

  // ✅ đã login thì chắc chắn ở dashboard
  location.hash = "#dashboard";

  const refUser = await ensureUserDoc(user);

  unsubUserDoc = onSnapshot(refUser, (snap) => {
    const data = snap.data() || {};
    const avt = data.avatarBase64 || data.photoURL || user.photoURL || DEFAULT_AVATAR;

    if (elAvatar) elAvatar.src = avt;
    if (elName) elName.textContent = data.displayName || user.displayName || "User";
    if (elEmail) elEmail.textContent = user.email || (user.isAnonymous ? "Tài khoản Khách" : "—");
    if (inputName) inputName.value = data.displayName || user.displayName || "";

    if (elCoins) elCoins.textContent = data.coins ?? 0;
    if (elInteractions) elInteractions.textContent = data.interactions ?? 0;
    if (taAchievement) taAchievement.value = data.achievement ?? "";

    renderNotifs(data.notifications || []);
  });
});
