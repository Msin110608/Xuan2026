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

/* ====== CONFIG ====== */
const firebaseConfig = {
  apiKey: "AIzaSyDfZPIg6Nif_Mx_Wwyl0byM6vJCd5BLgo8",
  authDomain: "xuanbinhngo-2026.firebaseapp.com",
  projectId: "xuanbinhngo-2026",
  storageBucket: "xuanbinhngo-2026.appspot.com",
  messagingSenderId: "910448630867",
  appId: "1:910448630867:web:2b48e0b859e355aa0efaa6",
  measurementId: "G-FN0BFL9FQQ"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

/* ✅ Nếu bạn có “Trang chủ” riêng thì dán link vào đây
   Nếu không có thì để "" và nó sẽ về #home / #login theo hash */
const HOME_WEBSITE = ""; // ví dụ: "https://spring-celebration-hub.lovable.app/"

/* ====== DOM ====== */
const elAvatar = $("avatar");
const elName = $("name");
const elEmail = $("email");
const inputName = $("displayName");
const inputFile = $("avatarFile");
const msg = $("msg");

const elCoins = $("coins");
const elInteractions = $("interactions");
const taAchievement = $("achievement");

const notifList = $("notifList");
const notifText = $("notifText");

const btnLogout = $("btnLogout");
const btnResetAvatar = $("btnResetAvatar");
const btnSaveProfile = $("btnSaveProfile");
const btnAddNotif = $("btnAddNotif");
const btnClearNotif = $("btnClearNotif");
const btnHome = $("btnHome");

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/thumbs/svg?seed=Xuan12A1";

/* ====== UI HELPERS ====== */
function show(text, isError = false) {
  if (!msg) return;
  msg.textContent = text || "";
  msg.style.color = isError ? "#ffd0d0" : "";
}

function renderNotifs(items = []) {
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

/* ====== FIRESTORE USER DOC ====== */
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

/* =======================
   AVATAR CROP (Canvas)
======================= */
const cropModal = $("cropModal");
const cropCanvas = $("cropCanvas");
const cropPreview = $("cropPreview");
const zoomRange = $("zoomRange");
const btnCropClose = $("btnCropClose");
const btnCropApply = $("btnCropApply");
const btnCropReset = $("btnCropReset");

let cropImage = null;
let cropZoom = 1.2;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;
let croppedBase64 = null;

const ctx = cropCanvas ? cropCanvas.getContext("2d") : null;

function openCropModal() {
  if (!cropModal) return;
  cropModal.classList.add("show");
  cropModal.setAttribute("aria-hidden", "false");
}
function closeCropModal() {
  if (!cropModal) return;
  cropModal.classList.remove("show");
  cropModal.setAttribute("aria-hidden", "true");
}

function drawCrop() {
  if (!cropImage || !ctx || !cropCanvas) return;

  const W = cropCanvas.width;
  const H = cropCanvas.height;

  ctx.clearRect(0, 0, W, H);

  const baseScale = Math.max(W / cropImage.width, H / cropImage.height);
  const scale = baseScale * cropZoom;

  const imgW = cropImage.width * scale;
  const imgH = cropImage.height * scale;

  const x = (W - imgW) / 2 + offsetX;
  const y = (H - imgH) / 2 + offsetY;

  ctx.drawImage(cropImage, x, y, imgW, imgH);

  ctx.save();
  ctx.strokeStyle = "rgba(255,215,0,0.85)";
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  ctx.restore();

  if (cropPreview) cropPreview.src = cropCanvas.toDataURL("image/jpeg", 0.9);
}

function canvasToBase64() {
  if (!cropCanvas) return "";
  return cropCanvas.toDataURL("image/jpeg", 0.9);
}

// Drag + zoom
if (cropCanvas) {
  cropCanvas.style.cursor = "grab";

  cropCanvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    cropCanvas.setPointerCapture(e.pointerId);
    lastX = e.clientX;
    lastY = e.clientY;
    cropCanvas.style.cursor = "grabbing";
  });

  cropCanvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    offsetX += dx;
    offsetY += dy;
    drawCrop();
  });

  cropCanvas.addEventListener("pointerup", () => {
    dragging = false;
    cropCanvas.style.cursor = "grab";
  });

  cropCanvas.addEventListener("pointercancel", () => {
    dragging = false;
    cropCanvas.style.cursor = "grab";
  });
}

zoomRange?.addEventListener("input", () => {
  cropZoom = Number(zoomRange.value);
  drawCrop();
});

btnCropClose?.addEventListener("click", () => {
  closeCropModal();
  croppedBase64 = null;
  if (inputFile) inputFile.value = "";
});

btnCropReset?.addEventListener("click", () => {
  if (zoomRange) zoomRange.value = "1.2";
  cropZoom = 1.2;
  offsetX = 0;
  offsetY = 0;
  drawCrop();
});

btnCropApply?.addEventListener("click", () => {
  croppedBase64 = canvasToBase64();
  if (elAvatar && croppedBase64) elAvatar.src = croppedBase64;
  show("Đã chọn avatar mới (chưa lưu). Bấm 'Lưu hồ sơ' để cập nhật.");
  closeCropModal();
});

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

  const url = URL.createObjectURL(file);
  cropImage = new Image();
  cropImage.onload = () => {
    if (zoomRange) zoomRange.value = "1.2";
    cropZoom = 1.2;
    offsetX = 0;
    offsetY = 0;
    openCropModal();
    drawCrop();
  };
  cropImage.src = url;
});

/* =======================
   ACTIONS
======================= */
let unsubUserDoc = null;

// ✅ Logout về #login (1-file)
btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.hash = "#login";
});

// ✅ Trang chủ
btnHome?.addEventListener("click", () => {
  if (HOME_WEBSITE) {
    window.location.href = HOME_WEBSITE;
  } else {
    window.location.hash = "#login";
  }
});

// Reset avatar
btnResetAvatar?.addEventListener("click", async () => {
  const u = auth.currentUser;
  if (!u) return;

  await updateProfile(u, { photoURL: DEFAULT_AVATAR });

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

// ✅ Save profile (FIX: không set photoURL = base64)
btnSaveProfile?.addEventListener("click", async () => {
  try {
    show("");
    const u = auth.currentUser;
    if (!u) return;

    const newName = (inputName?.value || "").trim() || "User";
    const avatarToSave = croppedBase64 || ""; // base64 chỉ lưu Firestore

    // ✅ Chỉ update displayName trong Auth
    await updateProfile(u, { displayName: newName });

    const refUser = doc(db, "users", u.uid);
    await updateDoc(refUser, {
      displayName: newName,
      avatarBase64: avatarToSave,
      photoURL: u.photoURL || DEFAULT_AVATAR,
      updatedAt: serverTimestamp()
    });

    if (elName) elName.textContent = newName;
    if (elAvatar) elAvatar.src = avatarToSave || u.photoURL || DEFAULT_AVATAR;

    croppedBase64 = null;
    if (inputFile) inputFile.value = "";
    show("Đã lưu hồ sơ!");
  } catch (e) {
    show(e?.message || "Lưu hồ sơ lỗi.", true);
  }
});

// Notifications
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

    const newItem = { title: "📢 Thông báo", text, ts: Date.now() };
    const next = [newItem, ...arr].slice(0, 15);

    await updateDoc(refUser, { notifications: next, updatedAt: serverTimestamp() });

    notifText.value = "";
    show("Đã đăng thông báo!");
  } catch (e) {
    show(e?.message || "Đăng thông báo lỗi.", true);
  }
});

btnClearNotif?.addEventListener("click", async () => {
  const u = auth.currentUser;
  if (!u) return;
  const refUser = doc(db, "users", u.uid);
  await updateDoc(refUser, { notifications: [], updatedAt: serverTimestamp() });
  show("Đã xóa tất cả thông báo.");
});

/* Realtime load */
onAuthStateChanged(auth, async (user) => {
  if (unsubUserDoc) unsubUserDoc();

  if (!user) {
    // 1-file => về login
    window.location.hash = "#login";
    return;
  }

  const refUser = await ensureUserDoc(user);

  // UI từ auth trước
  if (elName) elName.textContent = user.displayName || "User";
  if (elEmail) elEmail.textContent = user.email || (user.isAnonymous ? "Tài khoản Khách" : "—");
  if (inputName) inputName.value = user.displayName || "";

  unsubUserDoc = onSnapshot(refUser, (snap) => {
    const data = snap.data() || {};
    const avt = data.avatarBase64 || data.photoURL || user.photoURL || DEFAULT_AVATAR;

    if (elAvatar) elAvatar.src = avt;
    if (elName) elName.textContent = data.displayName || user.displayName || "User";

    if (elCoins) elCoins.textContent = data.coins ?? 0;
    if (elInteractions) elInteractions.textContent = data.interactions ?? 0;
    if (taAchievement) taAchievement.value = data.achievement ?? "";

    renderNotifs(data.notifications || []);
  });
});
