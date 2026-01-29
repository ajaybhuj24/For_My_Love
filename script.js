// script.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

/* =========================
   Helpers
========================= */
const $ = (id) => document.getElementById(id);

/* =========================
   DOM refs
========================= */
const heroHover = $("heroHover");

/* ---------- Birthday settings ---------- */
const BDAY_MONTH = 1; // Jan
const BDAY_DAY = 31; // 31st

function isBirthdayToday(month, day) {
  const now = new Date();
  return now.getMonth() === month - 1 && now.getDate() === day;
}

/* ---------- Fireworks (birthday day only) ---------- */
let fireworksDone = false;

function runFireworks(durationMs = 2200) {
  if (typeof confetti !== "function") return;

  const end = Date.now() + durationMs;

  (function frame() {
    confetti({
      particleCount: 6,
      spread: 70,
      startVelocity: 45,
      ticks: 140,
      origin: { x: Math.random(), y: 1 },
    });

    confetti({
      particleCount: 6,
      spread: 90,
      startVelocity: 55,
      ticks: 160,
      origin: { x: Math.random(), y: 1 },
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ---------- Dynamic hero message ---------- */
const heroTitle = $("heroTitle");
const heroSubtitle = $("heroSubtitle");

function setHeroMessage() {
  if (!heroTitle || !heroSubtitle) return;

  if (isBirthdayToday(BDAY_MONTH, BDAY_DAY)) {
    heroTitle.innerHTML = `Happy Birthday, <span class="name">Baby</span> 🎉✨`;
    heroSubtitle.innerHTML = `
      Today is your day 💛 I hope you feel loved, celebrated, and super happy.
      <br /><span class="small">(Open your letter and enjoy your surprise 🎁)</span>
    `;
  } else {
    heroTitle.innerHTML = `Your birthday is almost here, <span class="name">Baby</span> ✨`;
    heroSubtitle.innerHTML = `
      I’m counting down the days until we celebrate you 🎂💛
      <br /><span class="small">(A surprise is waiting for Jan 31 🎁)</span>
    `;
  }
}
setHeroMessage();

/* ---------- Countdown ---------- */
const cdDays = $("cdDays");
const cdHours = $("cdHours");
const cdMins = $("cdMins");
const cdSecs = $("cdSecs");
const countdownMsg = $("countdownMsg");

let birthdayConfettiDone = false;

function getNextBirthdayDate(month, day) {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, month - 1, day, 0, 0, 0);

  // if already passed today/this year, move to next year
  if (target.getTime() <= now.getTime()) {
    target = new Date(year + 1, month - 1, day, 0, 0, 0);
  }
  return target;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  const now = new Date();

  // Birthday day behavior
  if (isBirthdayToday(BDAY_MONTH, BDAY_DAY)) {
    cdDays.textContent = "0";
    cdHours.textContent = "00";
    cdMins.textContent = "00";
    cdSecs.textContent = "00";

    if (countdownMsg) {
      countdownMsg.textContent = "🎉 It’s Puja’s Birthday! Happy Birthday!";
    }

    if (!fireworksDone) {
      fireworksDone = true;
      runFireworks(2600);
    }

    if (!birthdayConfettiDone && typeof confetti === "function") {
      birthdayConfettiDone = true;
      confetti({
        particleCount: 260,
        spread: 120,
        origin: { x: 0.5, y: 0.35 },
      });
    }
    return;
  }

  // Normal countdown to next birthday
  const target = getNextBirthdayDate(BDAY_MONTH, BDAY_DAY);
  const diffMs = target.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  cdDays.textContent = String(days);
  cdHours.textContent = pad2(hours);
  cdMins.textContent = pad2(mins);
  cdSecs.textContent = pad2(secs);

  if (countdownMsg) {
    countdownMsg.textContent = `Next birthday: ${target.toDateString()}`;
  }

  // reset one-time effects
  fireworksDone = false;
  birthdayConfettiDone = false;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ---------- Hover confetti ---------- */
let lastConfetti = 0;
function burstConfetti() {
  const now = Date.now();
  if (now - lastConfetti < 450) return;
  lastConfetti = now;

  if (typeof confetti !== "function") return;

  if (isBirthdayToday(BDAY_MONTH, BDAY_DAY)) {
    runFireworks(900);
    return;
  }

  confetti({ particleCount: 110, spread: 70, origin: { x: 0.5, y: 0.18 } });
  setTimeout(() => {
    confetti({ particleCount: 70, spread: 110, origin: { x: 0.5, y: 0.2 } });
  }, 120);
}
if (heroHover) heroHover.addEventListener("mouseenter", burstConfetti);

/* ---------- Gift overlay ---------- */
const overlay = $("giftOverlay");
const openGiftBtn = $("openGiftBtn");
const siteContent = $("siteContent");

function openGift() {
  if (typeof confetti === "function") {
    if (isBirthdayToday(BDAY_MONTH, BDAY_DAY)) runFireworks(2500);
    else
      confetti({ particleCount: 180, spread: 90, origin: { x: 0.5, y: 0.45 } });
  }

  if (overlay) overlay.classList.add("hide");
  if (siteContent) {
    siteContent.classList.remove("hiddenContent");
    siteContent.classList.add("showContent");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}
if (openGiftBtn) openGiftBtn.addEventListener("click", openGift);

/* ---------- Love letter modal ---------- */
const letterModal = $("letterModal");
const openLetterBtn = $("openLetterBtn");
const closeLetterBtn = $("closeLetterBtn");
const closeLetterBtn2 = $("closeLetterBtn2");

function openLetter() {
  if (!letterModal) return;
  letterModal.classList.add("open");
  letterModal.setAttribute("aria-hidden", "false");
  if (typeof confetti === "function") {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.3 } });
  }
}

function closeLetter() {
  if (!letterModal) return;
  letterModal.classList.remove("open");
  letterModal.setAttribute("aria-hidden", "true");
}

if (openLetterBtn) openLetterBtn.addEventListener("click", openLetter);
if (closeLetterBtn) closeLetterBtn.addEventListener("click", closeLetter);
if (closeLetterBtn2) closeLetterBtn2.addEventListener("click", closeLetter);

if (letterModal) {
  letterModal.addEventListener("click", (e) => {
    if (e.target === letterModal) closeLetter();
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLetter();
});

/* ---------- Easter egg: 5 clicks on title ---------- */
const heroTitleEl = $("heroTitle");
const secretMsg = $("secretMsg");

let titleClicks = 0;
let clickResetTimer = null;

function showSecret() {
  if (!secretMsg) return;
  secretMsg.classList.add("show");
  setTimeout(() => secretMsg.classList.remove("show"), 4500);

  if (typeof confetti === "function") {
    confetti({ particleCount: 60, spread: 70, origin: { x: 0.5, y: 0.25 } });
  }
}

if (heroTitleEl) {
  heroTitleEl.style.cursor = "pointer";
  heroTitleEl.addEventListener("click", () => {
    titleClicks++;

    if (clickResetTimer) clearTimeout(clickResetTimer);
    clickResetTimer = setTimeout(() => (titleClicks = 0), 1200);

    if (titleClicks >= 5) {
      titleClicks = 0;
      showSecret();
    }
  });
}

/* ---------- Flip cards: tap/click to flip (mobile friendly) ---------- */
document.querySelectorAll(".flipCard").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("flipped"));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.classList.toggle("flipped");
    }
  });
});

/* ---------- Polaroid captions: tap/click to show (mobile) ---------- */
document.querySelectorAll(".imgCard").forEach((figure) => {
  figure.addEventListener("click", () =>
    figure.classList.toggle("showCaption"),
  );
});

/* ---------- Heart click trail ---------- */
const hearts = ["💛", "💖", "💘", "💝", "💗", "💞"];

function spawnHeart(x, y) {
  const el = document.createElement("span");
  el.className = "heart";
  el.textContent = hearts[Math.floor(Math.random() * hearts.length)];

  const ox = (Math.random() - 0.5) * 12;
  const oy = (Math.random() - 0.5) * 10;

  el.style.left = `${x + ox}px`;
  el.style.top = `${y + oy}px`;
  el.style.fontSize = `${16 + Math.floor(Math.random() * 10)}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

document.addEventListener("click", (e) => {
  const inModal = e.target.closest && e.target.closest(".modalCard");
  const clickedButton = e.target.closest && e.target.closest("button");
  if (inModal || clickedButton) return;

  spawnHeart(e.clientX, e.clientY);
});

/* ---------- Cursor sparkles (mousemove trail) ---------- */
let lastSparkle = 0;

function spawnSparkle(x, y) {
  const s = document.createElement("span");
  s.className = "sparkle";

  const ox = (Math.random() - 0.5) * 10;
  const oy = (Math.random() - 0.5) * 10;

  s.style.left = `${x + ox}px`;
  s.style.top = `${y + oy}px`;

  const size = 6 + Math.floor(Math.random() * 6);
  s.style.width = `${size}px`;
  s.style.height = `${size}px`;

  document.body.appendChild(s);
  setTimeout(() => s.remove(), 560);
}

window.addEventListener("mousemove", (e) => {
  const now = performance.now();
  if (now - lastSparkle < 28) return;
  lastSparkle = now;

  // stop sparkles when modal open (optional)
  if (letterModal && letterModal.classList.contains("open")) return;

  spawnSparkle(e.clientX, e.clientY);
});

/* =========================
   Three.js background
========================= */
const canvas = $("bg");
if (!canvas) throw new Error("Canvas #bg not found. Check your HTML.");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0, 9);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 8, 6);
scene.add(dir);

// Fog
scene.fog = new THREE.Fog(0x0b1020, 7, 18);

// Floaty objects
const floatGroup = new THREE.Group();
scene.add(floatGroup);

const pastel = [0xffd6e7, 0xfff2b6, 0xc4f1ff, 0xd7c4ff, 0xc7ffd8, 0xffd9b6];

function makeFloatyMesh() {
  const type = Math.floor(Math.random() * 3);
  let geometry;

  if (type === 0) geometry = new THREE.IcosahedronGeometry(0.45, 0);
  else if (type === 1)
    geometry = new THREE.TorusKnotGeometry(0.24, 0.08, 90, 10);
  else geometry = new THREE.SphereGeometry(0.38, 18, 18);

  const color = pastel[Math.floor(Math.random() * pastel.length)];
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.25,
    roughness: 0.35,
    transparent: true,
    opacity: 0.85,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
  );

  mesh.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );

  mesh.userData = {
    speed: 0.35 + Math.random() * 0.55,
    drift: new THREE.Vector3(
      (Math.random() - 0.5) * 0.12,
      (Math.random() - 0.5) * 0.18,
      (Math.random() - 0.5) * 0.1,
    ),
    rot: new THREE.Vector3(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7,
    ),
  };

  return mesh;
}

for (let i = 0; i < 18; i++) floatGroup.add(makeFloatyMesh());

/* ---------- 3D Heart object ---------- */
function createHeartMesh() {
  const x = 0,
    y = 0;
  const heartShape = new THREE.Shape();

  heartShape.moveTo(x + 0.25, y + 0.25);
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
  heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
  heartShape.bezierCurveTo(
    x - 0.3,
    y + 0.55,
    x - 0.1,
    y + 0.77,
    x + 0.25,
    y + 0.95,
  );
  heartShape.bezierCurveTo(
    x + 0.6,
    y + 0.77,
    x + 0.8,
    y + 0.55,
    x + 0.8,
    y + 0.35,
  );
  heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
  heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

  const geom = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 6,
    steps: 1,
  });

  geom.center();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xff6fae,
    metalness: 0.25,
    roughness: 0.35,
    transparent: true,
    opacity: 0.9,
  });

  const heart = new THREE.Mesh(geom, mat);
  heart.position.set(-2.2, 1.4, -1.6);
  heart.rotation.set(0.2, 0.7, 0.0);
  heart.scale.set(1.25, 1.25, 1.25);

  return heart;
}

const heartMesh = createHeartMesh();
scene.add(heartMesh);

/* ---------- Mouse parallax ---------- */
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

/* ---------- Animate ---------- */
let running = true;

function animate(t) {
  if (!running) return;

  const time = t * 0.001;

  camera.position.x = THREE.MathUtils.lerp(
    camera.position.x,
    mouse.x * 0.6,
    0.05,
  );
  camera.position.y = THREE.MathUtils.lerp(
    camera.position.y,
    mouse.y * 0.4,
    0.05,
  );
  camera.lookAt(0, 0, 0);

  floatGroup.children.forEach((m, idx) => {
    const u = m.userData;

    m.rotation.x += u.rot.x * 0.003;
    m.rotation.y += u.rot.y * 0.003;
    m.rotation.z += u.rot.z * 0.003;

    m.position.y += Math.sin(time * u.speed + idx) * 0.002;
    m.position.addScaledVector(u.drift, 0.003);

    if (m.position.x > 6) m.position.x = -6;
    if (m.position.x < -6) m.position.x = 6;
    if (m.position.y > 4) m.position.y = -4;
    if (m.position.y < -4) m.position.y = 4;
    if (m.position.z > 4) m.position.z = -4;
    if (m.position.z < -4) m.position.z = 4;
  });

  // Heart rotation
  heartMesh.rotation.y += 0.006;
  heartMesh.rotation.x += 0.002;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) requestAnimationFrame(animate);
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

/* =========================
   Scratch Card (Canvas)
========================= */
/* =========================
   Scratch Card (Fixed)
========================= */
const scratchWrap = document.getElementById("scratchWrap");
const scratchCanvas = document.getElementById("scratchCanvas");
const scratchResetBtn = document.getElementById("scratchResetBtn");

if (scratchCanvas && scratchWrap) {
  const ctx = scratchCanvas.getContext("2d", { willReadFrequently: true });

  let scratching = false;
  let revealed = false;

  function resizeScratch() {
    const rect = scratchCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    scratchCanvas.width = Math.floor(rect.width * dpr);
    scratchCanvas.height = Math.floor(rect.height * dpr);

    // draw using CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCover();
  }

  function drawCover() {
    revealed = false;
    scratchWrap.classList.remove("revealed");

    const rect = scratchCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // paint opaque cover
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    // Strong opaque "scratch" cover (NOT transparent)
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(120,120,130,1)");
    g.addColorStop(0.5, "rgba(210,210,220,1)");
    g.addColorStop(1, "rgba(110,110,125,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Foil speckles
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    // Hint text on cover
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.font = "800 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Scratch here ✨", w / 2, h / 2 - 6);

    ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Use mouse / finger", w / 2, h / 2 + 20);

    // now switch to erase mode for scratching
    ctx.globalCompositeOperation = "destination-out";
  }

  function scratchAt(clientX, clientY) {
    if (revealed) return;

    const rect = scratchCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  function getRevealedPercent() {
    // Downsample for speed
    const sampleW = 220;
    const rect = scratchCanvas.getBoundingClientRect();
    const sampleH = Math.max(
      120,
      Math.floor((rect.height / rect.width) * sampleW),
    );

    const off = document.createElement("canvas");
    off.width = sampleW;
    off.height = sampleH;
    const octx = off.getContext("2d");

    octx.drawImage(scratchCanvas, 0, 0, sampleW, sampleH);
    const img = octx.getImageData(0, 0, sampleW, sampleH).data;

    let transparent = 0;
    const total = sampleW * sampleH;

    for (let i = 3; i < img.length; i += 4) {
      if (img[i] < 20) transparent++;
    }
    return (transparent / total) * 100;
  }

  function revealAll() {
    if (revealed) return;
    revealed = true;

    // Clear canvas fully
    const rect = scratchCanvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, rect.width, rect.height);

    scratchWrap.classList.add("revealed");

    if (typeof confetti === "function") {
      confetti({ particleCount: 140, spread: 90, origin: { x: 0.5, y: 0.6 } });
    }
  }

  function autoRevealIfEnough() {
    const percent = getRevealedPercent();
    if (percent >= 35) revealAll();
  }

  // Pointer events
  scratchCanvas.addEventListener("pointerdown", (e) => {
    scratching = true;
    scratchCanvas.setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  });

  scratchCanvas.addEventListener("pointermove", (e) => {
    if (!scratching) return;
    scratchAt(e.clientX, e.clientY);
  });

  scratchCanvas.addEventListener("pointerup", () => {
    scratching = false;
    autoRevealIfEnough();
  });

  scratchCanvas.addEventListener("pointercancel", () => {
    scratching = false;
  });

  // Reset
  if (scratchResetBtn) {
    scratchResetBtn.addEventListener("click", drawCover);
  }

  // Init
  setTimeout(resizeScratch, 60);
  window.addEventListener("resize", () => setTimeout(resizeScratch, 120));
}

/* =========================
   Balloon Pop Game
========================= */
const balloonArea = document.getElementById("balloonArea");
const balloonScoreEl = document.getElementById("balloonScore");
const balloonStartBtn = document.getElementById("balloonStartBtn");
const balloonResetBtn = document.getElementById("balloonResetBtn");

let balloonTimer = null;
let balloonScore = 0;

const balloonColors = [
  "rgba(255, 214, 231, 0.9)",
  "rgba(255, 242, 182, 0.9)",
  "rgba(196, 241, 255, 0.9)",
  "rgba(215, 196, 255, 0.9)",
  "rgba(199, 255, 216, 0.9)",
  "rgba(255, 217, 182, 0.9)",
];

function setBalloonScore(n) {
  balloonScore = n;
  if (balloonScoreEl) balloonScoreEl.textContent = String(balloonScore);
}

function clearBalloons() {
  if (!balloonArea) return;
  balloonArea.querySelectorAll(".balloon").forEach((b) => b.remove());
}

function spawnBalloon() {
  if (!balloonArea) return;

  const b = document.createElement("div");
  b.className = "balloon";
  b.style.background =
    balloonColors[Math.floor(Math.random() * balloonColors.length)];

  const areaRect = balloonArea.getBoundingClientRect();
  const x = Math.random() * Math.max(0, areaRect.width - 60);
  b.style.left = `${x}px`;

  // random speed
  const duration = 2600 + Math.floor(Math.random() * 2400);
  b.style.animationDuration = `${duration}ms`;

  b.innerHTML = `<span>🎈</span>`;

  b.addEventListener("click", () => {
    if (b.classList.contains("pop")) return;
    b.classList.add("pop");
    setBalloonScore(balloonScore + 1);

    if (typeof confetti === "function") {
      confetti({
        particleCount: 18,
        spread: 60,
        origin: { x: 0.5, y: 0.6 },
      });
    }

    setTimeout(() => b.remove(), 180);
  });

  b.addEventListener("animationend", () => {
    // balloon escaped
    b.remove();
  });

  balloonArea.appendChild(b);
}

function startBalloonGame() {
  if (!balloonArea) return;
  stopBalloonGame();
  clearBalloons();
  setBalloonScore(0);

  // spawn periodically
  balloonTimer = setInterval(() => {
    spawnBalloon();
    if (Math.random() > 0.55) spawnBalloon(); // sometimes 2 at once
  }, 700);
}

function stopBalloonGame() {
  if (balloonTimer) {
    clearInterval(balloonTimer);
    balloonTimer = null;
  }
}

if (balloonStartBtn)
  balloonStartBtn.addEventListener("click", startBalloonGame);

if (balloonResetBtn) {
  balloonResetBtn.addEventListener("click", () => {
    stopBalloonGame();
    clearBalloons();
    setBalloonScore(0);
  });
}
