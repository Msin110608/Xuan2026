// fx.js — Cành mai + hoa/tiền rơi + nút bấm nổi bật

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function setupBranches() {
  const left = createEl("div", "fx-branch left");
  const right = createEl("div", "fx-branch right");

  const bloomsL = createEl("div", "fx-blossoms");
  const bloomsR = createEl("div", "fx-blossoms");

  const blossomCount = 14;

  for (let i = 0; i < blossomCount; i++) {
    const b1 = createEl("span");
    b1.textContent = "🌼";
    b1.style.left = `${rand(40, 200)}px`;
    b1.style.top = `${rand(40, 560)}px`;
    b1.style.transform = `rotate(${rand(-30, 30)}deg)`;
    b1.style.opacity = `${rand(0.65, 0.95)}`;
    bloomsL.appendChild(b1);

    const b2 = createEl("span");
    b2.textContent = "🌼";
    b2.style.left = `${rand(40, 200)}px`;
    b2.style.top = `${rand(40, 560)}px`;
    b2.style.transform = `rotate(${rand(-30, 30)}deg)`;
    b2.style.opacity = `${rand(0.65, 0.95)}`;
    bloomsR.appendChild(b2);
  }

  left.appendChild(bloomsL);
  right.appendChild(bloomsR);

  document.body.appendChild(left);
  document.body.appendChild(right);
}

function setupFallingFX() {
  const layer = createEl("div", "fx-layer");
  layer.id = "fx-layer";
  document.body.appendChild(layer);

  const makeItem = (type) => {
    const s = createEl("span", `fall-item ${type === "flower" ? "fall-flower" : "fall-coin"}`);

    // dùng emoji cho nhanh, đẹp, nhẹ
    s.textContent = type === "flower" ? "🌸" : "🪙";

    const size = type === "flower" ? rand(14, 24) : rand(16, 30);
    s.style.fontSize = `${size}px`;

    const left = rand(0, window.innerWidth);
    s.style.left = `${left}px`;

    const duration = type === "flower" ? rand(7.5, 13) : rand(9, 16);
    s.style.animationDuration = `${duration}s`;

    const delay = rand(0, 6);
    s.style.animationDelay = `${delay}s`;

    s.style.setProperty("--x", `${rand(-60, 60)}px`);
    s.style.setProperty("--drift", `${rand(-160, 160)}px`);
    s.style.setProperty("--rot", `${rand(240, 900)}deg`);

    layer.appendChild(s);
  };

  // số lượng: hoa nhiều hơn, tiền ít + mờ
  const flowerCount = 26;
  const coinCount = 10;

  for (let i = 0; i < flowerCount; i++) makeItem("flower");
  for (let i = 0; i < coinCount; i++) makeItem("coin");

  // cập nhật khi resize
  window.addEventListener("resize", () => {
    // không cần xoá, chỉ để hệ số left lần sau ok
  });
}

function setupButtonFX() {
  const ids = ["btnLogin", "btnRegister", "btnGoogle", "btnGuest", "btnLogout"];

  ids.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener("click", () => {
      btn.classList.add("btn-active");
      setTimeout(() => btn.classList.remove("btn-active"), 260);
    });
  });
}

// chạy
setupBranches();
setupFallingFX();
setupButtonFX();
