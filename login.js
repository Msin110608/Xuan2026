const dashboard_html = "http://127.0.0.1:5500/test%20mode/dashboard.html";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

/** DÁN firebaseConfig CỦA BẠN VÀO ĐÂY (GIỐNG register.js) */
const firebaseConfig = {
  apiKey: "AIzaSyDfZPIg6Nif_Mx_Wwyl0byM6vJCd5BLgo8",
  authDomain: "xuanbinhngo-2026.firebaseapp.com",
  projectId: "xuanbinhngo-2026",
  storageBucket: "xuanbinhngo-2026.appspot.com",
  messagingSenderId: "910448630867",
  appId: "1:910448630867:web:2b48e0b859e355aa0efaa6",
  measurementId: "G-FN0BFL9FQQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = (id) => document.getElementById(id);

const emailInput = $("email");
const passwordInput = $("password");

const btnLogin = $("btnLogin");
const btnGoogle = $("btnGoogle");
const btnLogout = $("btnLogout");

const msg = $("msg");
const loggedOut = $("loggedOut");
const loggedIn = $("loggedIn");
const avatar = $("avatar");
const nameEl = $("name");
const userEmail = $("userEmail");

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/thumbs/svg?seed=Xuan12A1";

function show(text, isError=false){
  msg.textContent = text || "";
  msg.classList.toggle("danger", isError);
}

/* Đăng nhập Email */
btnLogin.addEventListener("click", async () => {
  try{
    show("");
    const email = emailInput.value.trim();
    const pass = passwordInput.value.trim();

    if(!email || !pass) return show("Vui lòng nhập email và mật khẩu.", true);

    await signInWithEmailAndPassword(auth, email, pass);
 show("Đăng nhập thành công! Đang chuyển...");

setTimeout(() => {
  window.location.href = dashboard_html;
}, 1000);

  }catch(err){
    show(err.message, true);
  }
});

/* Google */
btnGoogle.addEventListener("click", async () => {
  try{
    show("");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    show("Đăng nhập Google thành công!");
  }catch(err){
    show(err.message, true);
  }
});

/* Đăng xuất */
btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  show("Đã đăng xuất.");
});

/* Trạng thái */
onAuthStateChanged(auth, (user) => {
  if(!user){
    loggedOut.classList.remove("hidden");
    loggedIn.classList.add("hidden");
    return;
  }

  loggedOut.classList.add("hidden");
  loggedIn.classList.remove("hidden");

  avatar.src = user.photoURL || DEFAULT_AVATAR;
  nameEl.textContent = user.displayName || "User";
  userEmail.textContent = user.email || "";
});
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = MAIN_WEBSITE;
  }
});

