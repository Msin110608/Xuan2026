// register.js — register + guest -> chuyển #dashboard

import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// ====== CONFIG ======
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

const $ = (id) => document.getElementById(id);

const emailInput = $("email");
const passwordInput = $("password");
const nameInput = $("displayName");

const btnRegister = $("btnRegister");
const btnGuest = $("btnGuest");
const btnLogout = $("btnLogout");

const msg = $("msg");
const loggedOut = $("loggedOut");
const loggedIn = $("loggedIn");
const avatar = $("avatar");
const nameEl = $("name");
const userEmail = $("userEmail");

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/thumbs/svg?seed=Xuan12A1";

function show(text, isError = false) {
  if (!msg) return;
  msg.textContent = text || "";
  msg.classList.toggle("danger", isError);
}

/* Register */
btnRegister?.addEventListener("click", async () => {
  try {
    show("");

    const email = (emailInput?.value || "").trim();
    const pass = (passwordInput?.value || "").trim();
    const name = (nameInput?.value || "").trim();

    if (!email || !pass) return show("Vui lòng nhập email và mật khẩu.", true);
    if (pass.length < 6) return show("Mật khẩu tối thiểu 6 ký tự.", true);

    const cred = await createUserWithEmailAndPassword(auth, email, pass);

    await updateProfile(cred.user, {
      displayName: name || "User",
      photoURL: DEFAULT_AVATAR
    });

    show("Đăng ký thành công! Đang vào Dashboard...");
    setTimeout(() => {
      window.location.hash = "#dashboard";
    }, 350);

  } catch (err) {
    show(err?.message || "Có lỗi xảy ra.", true);
  }
});

/* Guest */
btnGuest?.addEventListener("click", async () => {
  try {
    show("");

    const name = (nameInput?.value || "").trim();
    if (!name) return show("Bạn phải nhập Tên hiển thị để vào với tư cách Khách.", true);

    const cred = await signInAnonymously(auth);

    await updateProfile(cred.user, {
      displayName: `${name} (Khách)`,
      photoURL: DEFAULT_AVATAR
    });

    show("Đã vào với tư cách Khách! Đang vào Dashboard...");
    setTimeout(() => {
      window.location.hash = "#dashboard";
    }, 350);

  } catch (err) {
    show(err?.message || "Có lỗi xảy ra.", true);
  }
});

/* Logout */
btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  show("Đã đăng xuất.");
  window.location.hash = "#register";
});

/* Status demo */
onAuthStateChanged(auth, (user) => {
  if (!loggedOut || !loggedIn) return;

  if (!user) {
    loggedOut.classList.remove("hidden");
    loggedIn.classList.add("hidden");
    return;
  }

  loggedOut.classList.add("hidden");
  loggedIn.classList.remove("hidden");

  if (avatar) avatar.src = user.photoURL || DEFAULT_AVATAR;
  if (nameEl) nameEl.textContent = user.displayName || "User";
  if (userEmail) {
    userEmail.textContent = user.isAnonymous ? "Tài khoản Ẩn danh (Khách)" : (user.email || "");
  }
});
