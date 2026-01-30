import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const heroHover = document.getElementById("heroHover");
/* =========================================================
   PIN LOCK (PIN = 9811)  [client-side gate]
========================================================= */
const pinOverlay = document.getElementById("pinOverlay");
const pinInput = document.getElementById("pinInput");
const pinBtn = document.getElementById("pinBtn");
const pinError = document.getElementById("pinError");

// SHA-256("9811") => stored hash (so PIN isn't plain in code)
const PIN_HASH = "f9e3ebbfd1b8975f9408d310959c05e6a80fd9517398a3758cc93dbcabb49673";
const PIN_KEY = "puja_pin_unlocked_v1";

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function lockPageScroll(lock) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

async function tryUnlock() {
  if (!pinInput) return;
  const entered = (pinInput.value || "").trim();

  if (entered.length !== 4) {
    if (pinError) pinError.textContent = "Enter 4 digits 🙂";
    return;
  }

  const enteredHash = await sha256Hex(entered);

  if (enteredHash === PIN_HASH) {
    localStorage.setItem(PIN_KEY, "1");
    if (pinOverlay) pinOverlay.classList.add("hide");
    lockPageScroll(false);

    if (pinError) pinError.textContent = "";
    if (pinInput) pinInput.value = "";

    // Optional: small celebration on unlock
    if (typeof confetti === "function") {
      confetti({ particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.35 } });
    }
  } else {
    if (pinError) pinError.textContent = "Wrong PIN 😅 Try again.";
    if (pinInput) pinInput.value = "";
    pinInput?.focus();
  }
}

function initPinGate() {
  const unlocked = localStorage.getItem(PIN_KEY) === "1";
  if (unlocked) {
    pinOverlay?.classList.add("hide");
    lockPageScroll(false);
  } else {
    pinOverlay?.classList.remove("hide");
    lockPageScroll(true);
    setTimeout(() => pinInput?.focus(), 50);
  }
}

pinBtn?.addEventListener("click", tryUnlock);

pinInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryUnlock();
});

// Only allow digits typed (nice UX)
pinInput?.addEventListener("input", () => {
  pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 4);
});

initPinGate();
/* =========================================================
   MUSIC PLAYER
========================================================= */
const musicAudio = document.getElementById("musicAudio");
const musicBtn = document.getElementById("musicBtn");
const musicBtnText = document.getElementById("musicBtnText");
const musicStatus = document.getElementById("musicStatus");
const musicSeek = document.getElementById("musicSeek");
const musicCur = document.getElementById("musicCur");
const musicDur = document.getElementById("musicDur");
const musicVol = document.getElementById("musicVol");

function fmtTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setPlayingUI(isPlaying) {
  if (!musicBtnText) return;
  musicBtnText.textContent = isPlaying ? "Pause" : "Play";
  if (musicStatus) musicStatus.textContent = isPlaying ? "Playing 💛" : "Paused";
  if (musicBtn)
    musicBtn.setAttribute("aria-label", isPlaying ? "Pause song" : "Play song");
}

if (musicAudio && musicBtn) {
  if (musicVol) musicAudio.volume = Number(musicVol.value || 0.8);

  musicBtn.addEventListener("click", async () => {
    try {
      if (musicAudio.paused) {
        await musicAudio.play();
        setPlayingUI(true);
      } else {
        musicAudio.pause();
        setPlayingUI(false);
      }
    } catch (err) {
      if (musicStatus) musicStatus.textContent = "Tap again to allow audio 🎵";
      console.warn("Audio play blocked:", err);
    }
  });

  musicAudio.addEventListener("loadedmetadata", () => {
    if (musicDur) musicDur.textContent = fmtTime(musicAudio.duration);
    if (musicCur) musicCur.textContent = fmtTime(0);
  });

  musicAudio.addEventListener("timeupdate", () => {
    if (musicCur) musicCur.textContent = fmtTime(musicAudio.currentTime);
    if (musicSeek && isFinite(musicAudio.duration)) {
      musicSeek.value = String(
        (musicAudio.currentTime / musicAudio.duration) * 100,
      );
    }
  });

  musicAudio.addEventListener("ended", () => {
    setPlayingUI(false);
    if (musicSeek) musicSeek.value = "0";
    if (musicCur) musicCur.textContent = "0:00";
    if (musicStatus) musicStatus.textContent = "Finished 🎶";
  });

  if (musicSeek) {
    let seeking = false;

    musicSeek.addEventListener("pointerdown", () => (seeking = true));
    window.addEventListener("pointerup", () => (seeking = false));

    musicSeek.addEventListener("input", () => {
      if (!isFinite(musicAudio.duration)) return;
      const pct = Number(musicSeek.value) / 100;
      musicAudio.currentTime = pct * musicAudio.duration;
      if (!musicAudio.paused) setPlayingUI(true);
      if (!seeking && musicStatus) musicStatus.textContent = "Playing 💛";
    });
  }

  if (musicVol) {
    musicVol.addEventListener("input", () => {
      musicAudio.volume = Number(musicVol.value);
    });
  }
}

/* ---------- Birthday settings ---------- */
const BDAY_MONTH = 1; // Jan
const BDAY_DAY = 31; // 31st

/* =========================================================
   ✅ NEPAL TIMEZONE HELPERS (Asia/Kathmandu)
========================================================= */
const NEPAL_TZ = "Asia/Kathmandu";
const NEPAL_OFFSET_MS = 345 * 60 * 1000; // +05:45

function getNepalParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: NEPAL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map = {};
  for (const p of parts) map[p.type] = p.value;

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function isBirthdayTodayNepal(month, day) {
  const np = getNepalParts();
  return np.month === month && np.day === day;
}

// Returns NEXT birthday moment as UTC ms, where the birthday moment is 00:00 Nepal time.
function getNextBirthdayUtcMsNepal(month, day) {
  const np = getNepalParts();

  const todayKey = np.year * 10000 + np.month * 100 + np.day;
  const bdayKeyThisYear = np.year * 10000 + month * 100 + day;

  const targetYear = todayKey > bdayKeyThisYear ? np.year + 1 : np.year;

  // Nepal midnight -> UTC = Nepal time - 5:45
  return Date.UTC(targetYear, month - 1, day, 0, 0, 0) - NEPAL_OFFSET_MS;
}

function formatNepalDate(utcMs) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: NEPAL_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(utcMs));
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
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");

function setHeroMessage() {
  if (!heroTitle || !heroSubtitle) return;

  if (isBirthdayTodayNepal(BDAY_MONTH, BDAY_DAY)) {
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
const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");
const countdownMsg = document.getElementById("countdownMsg");

let birthdayConfettiDone = false;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  // ✅ Birthday based on Nepal date
  if (isBirthdayTodayNepal(BDAY_MONTH, BDAY_DAY)) {
    cdDays.textContent = "0";
    cdHours.textContent = "00";
    cdMins.textContent = "00";
    cdSecs.textContent = "00";

    if (countdownMsg)
      countdownMsg.textContent = "🎉 It’s baby's Birthday (Nepal time)! Happy Birthday!";

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

  // ✅ Next birthday moment is Nepal midnight (00:00 NPT)
  const targetMs = getNextBirthdayUtcMsNepal(BDAY_MONTH, BDAY_DAY);
  const diffMs = targetMs - Date.now();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  cdDays.textContent = String(days);
  cdHours.textContent = pad2(hours);
  cdMins.textContent = pad2(mins);
  cdSecs.textContent = pad2(secs);

  if (countdownMsg)
    countdownMsg.textContent = `Next birthday (Nepal time): ${formatNepalDate(targetMs)}`;

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

  if (isBirthdayTodayNepal(BDAY_MONTH, BDAY_DAY)) {
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
const overlay = document.getElementById("giftOverlay");
const openGiftBtn = document.getElementById("openGiftBtn");
const siteContent = document.getElementById("siteContent");

function openGift() {
  if (isBirthdayTodayNepal(BDAY_MONTH, BDAY_DAY)) runFireworks(2500);
  else
    confetti({ particleCount: 180, spread: 90, origin: { x: 0.5, y: 0.45 } });

  if (overlay) overlay.classList.add("hide");
  if (siteContent) {
    siteContent.classList.remove("hiddenContent");
    siteContent.classList.add("showContent");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (musicAudio && musicAudio.paused) {
    musicAudio
      .play()
      .then(() => setPlayingUI(true))
      .catch(() => {});
  }
}
if (openGiftBtn) openGiftBtn.addEventListener("click", openGift);

/* ---------- Love letter modal ---------- */
const letterModal = document.getElementById("letterModal");
const openLetterBtn = document.getElementById("openLetterBtn");
const closeLetterBtn = document.getElementById("closeLetterBtn");
const closeLetterBtn2 = document.getElementById("closeLetterBtn2");

function openLetter() {
  if (!letterModal) return;
  letterModal.classList.add("open");
  letterModal.setAttribute("aria-hidden", "false");
  confetti({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.3 } });
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
const heroTitleEl = document.getElementById("heroTitle");
const secretMsg = document.getElementById("secretMsg");

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
  figure.addEventListener("click", () => figure.classList.toggle("showCaption"));
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

  if (letterModal && letterModal.classList.contains("open")) return;
  spawnSparkle(e.clientX, e.clientY);
});

/* =========================================================
   SCRATCH CARD (random image reveal + 50% threshold)
========================================================= */
const scratchWrap = document.getElementById("scratchWrap");
const scratchCanvas = document.getElementById("scratchCanvas");
const scratchResetBtn = document.getElementById("scratchResetBtn");
const scratchImgEl = document.getElementById("scratchImg");

const SURPRISE_IMAGES = [
  "images/surprise/1.jpeg",
  "images/surprise/2.jpeg",
  "images/surprise/3.jpeg",
  "images/surprise/4.jpeg",
];

let revealed = false;
let drawing = false;
let ctx = null;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function pickRandomSurprise() {
  if (!scratchImgEl) return;
  const idx = Math.floor(Math.random() * SURPRISE_IMAGES.length);
  scratchImgEl.src = SURPRISE_IMAGES[idx];

  scratchImgEl.onload = () => {
    const portrait = scratchImgEl.naturalHeight > scratchImgEl.naturalWidth;
    scratchImgEl.style.objectFit = portrait ? "contain" : "cover";
    scratchImgEl.style.padding = portrait ? "10px" : "0";
  };
}

function sizeScratchCanvas() {
  if (!scratchCanvas) return;
  const rect = scratchCanvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  scratchCanvas.width = Math.floor(rect.width * dpr);
  scratchCanvas.height = Math.floor(rect.height * dpr);

  ctx = scratchCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawCover() {
  if (!scratchCanvas || !ctx || !scratchWrap) return;
  revealed = false;
  scratchWrap.classList.remove("revealed");

  const rect = scratchCanvas.getBoundingClientRect();

  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(0, 0, rect.width, rect.height);

  const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  g.addColorStop(0, "rgba(255,255,255,0.22)");
  g.addColorStop(0.5, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    const r = 1 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "600 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Scratch here ✨", rect.width / 2, rect.height / 2);
  ctx.textAlign = "start";
}

function scratchAt(clientX, clientY) {
  if (!ctx || revealed) return;
  const rect = scratchCanvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fill();
}

function getScratchedPercent(step = 10) {
  if (!ctx || revealed) return 0;
  const img = ctx.getImageData(
    0,
    0,
    scratchCanvas.width,
    scratchCanvas.height,
  ).data;

  let cleared = 0;
  let total = 0;

  for (let y = 0; y < scratchCanvas.height; y += step * dpr) {
    for (let x = 0; x < scratchCanvas.width; x += step * dpr) {
      const idx = (y * scratchCanvas.width + x) * 4 + 3;
      total++;
      if (img[idx] === 0) cleared++;
    }
  }

  return total ? (cleared / total) * 100 : 0;
}

function revealAll() {
  if (revealed || !ctx || !scratchWrap) return;
  revealed = true;

  const rect = scratchCanvas.getBoundingClientRect();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillRect(0, 0, rect.width, rect.height);

  scratchWrap.classList.add("revealed");

  if (typeof confetti === "function") {
    confetti({ particleCount: 140, spread: 90, origin: { x: 0.5, y: 0.6 } });
  }
}

function onMove(clientX, clientY) {
  scratchAt(clientX, clientY);
  const percent = getScratchedPercent(12);
  if (percent >= 50) revealAll();
}

function pointerDown(e) {
  if (revealed) return;
  drawing = true;
  scratchCanvas.setPointerCapture?.(e.pointerId);
  onMove(e.clientX, e.clientY);
}
function pointerMove(e) {
  if (!drawing) return;
  onMove(e.clientX, e.clientY);
}
function pointerUp() {
  drawing = false;
}

function initScratch() {
  if (!scratchCanvas || !scratchWrap) return;

  pickRandomSurprise();
  sizeScratchCanvas();
  drawCover();

  scratchCanvas.addEventListener("pointerdown", pointerDown);
  scratchCanvas.addEventListener("pointermove", pointerMove);
  scratchCanvas.addEventListener("pointerup", pointerUp);
  scratchCanvas.addEventListener("pointercancel", pointerUp);

  if (scratchResetBtn) {
    scratchResetBtn.addEventListener("click", () => {
      pickRandomSurprise();
      sizeScratchCanvas();
      drawCover();
    });
  }
}

initScratch();

/* ---------- Three.js background (floaties + 3D heart) ---------- */
const canvas = document.getElementById("bg");
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

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 8, 6);
scene.add(dir);

scene.fog = new THREE.Fog(0x0b1020, 7, 18);

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

function createHeartMesh() {
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x + 0.25, y + 0.25);
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
  heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
  heartShape.bezierCurveTo(
    x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95
  );
  heartShape.bezierCurveTo(
    x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35
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

const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

let running = true;

function animate(t) {
  if (!running) return;

  const time = t * 0.001;

  camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.6, 0.05);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.4, 0.05);
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

  // keep scratch canvas correct on resize
  sizeScratchCanvas();
  drawCover();
});

/* =========================================================
   BALLOON POP GAME (WORKING)
========================================================= */
const balloonStage = document.getElementById("balloonStage");
const gameStartBtn = document.getElementById("gameStartBtn");
const gameTimeEl = document.getElementById("gameTime");
const gameScoreEl = document.getElementById("gameScore");
const gameResult = document.getElementById("gameResult");

let gameRunning = false;
let score = 0;
let timeLeft = 30;
let spawnTimer = null;
let tickTimer = null;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function setGameUI() {
  if (gameTimeEl) gameTimeEl.textContent = String(timeLeft);
  if (gameScoreEl) gameScoreEl.textContent = String(score);
}

function clearStage() {
  if (!balloonStage) return;
  balloonStage.innerHTML = "";
}

function popBalloon(el) {
  if (!el || el.classList.contains("pop")) return;

  el.classList.add("pop");
  score += 1;
  setGameUI();

  if (typeof confetti === "function" && score % 7 === 0) {
    confetti({ particleCount: 35, spread: 60, origin: { x: 0.5, y: 0.7 } });
  }

  setTimeout(() => el.remove(), 220);
}

function createBalloon() {
  if (!balloonStage || !gameRunning) return;

  const b = document.createElement("div");
  b.className = "balloon";

  const size = Math.floor(rand(42, 82));
  b.style.width = `${size}px`;
  b.style.height = `${Math.floor(size * 1.18)}px`;

  const left = rand(8, 92);
  b.style.left = `${left}%`;

  const hue = Math.floor(rand(0, 360));
  b.style.background = `hsla(${hue}, 85%, 65%, 0.95)`;

  const dur = rand(3.8, 6.2);
  b.style.animationDuration = `${dur}s`;

  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    popBalloon(b);
  });

  b.addEventListener("click", () => popBalloon(b));

  b.addEventListener("animationend", () => {
    // balloon floated away
    b.remove();
  });

  balloonStage.appendChild(b);

  // prevent too many balloons
  const maxBalloons = 22;
  if (balloonStage.children.length > maxBalloons) {
    balloonStage.removeChild(balloonStage.firstElementChild);
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(tickTimer);
  spawnTimer = null;
  tickTimer = null;

  if (gameStartBtn) gameStartBtn.disabled = false;

  if (gameResult) {
    gameResult.classList.add("show");
    gameResult.textContent = `Game over 🎉 Your score: ${score}`;
  }

  if (typeof confetti === "function") {
    confetti({ particleCount: 120, spread: 90, origin: { x: 0.5, y: 0.65 } });
  }
}

function startGame() {
  if (!balloonStage) return;

  clearStage();
  score = 0;
  timeLeft = 30;
  gameRunning = true;

  if (gameResult) {
    gameResult.classList.remove("show");
    gameResult.textContent = "";
  }

  setGameUI();
  if (gameStartBtn) gameStartBtn.disabled = true;

  // spawn balloons
  spawnTimer = setInterval(createBalloon, 520);

  // countdown timer
  tickTimer = setInterval(() => {
    timeLeft -= 1;
    setGameUI();
    if (timeLeft <= 0) endGame();
  }, 1000);

  // spawn a few instantly
  for (let i = 0; i < 5; i++) createBalloon();
}

if (gameStartBtn) {
  gameStartBtn.addEventListener("click", startGame);
} else {
  console.warn("Balloon game: #gameStartBtn not found in HTML.");
}

