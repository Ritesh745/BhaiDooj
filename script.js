
/* ==========================================
   BHAI DOOJ — INTERACTIVE EXPERIENCE
========================================== */

/* ==========================================
   PERSONALIZE YOUR WEBSITE HERE
========================================== */

const CONFIG = {
  sisterName: "Pagal Ladkiii",
  letter: `I know we fight, argue and annoy each other
  more than we should.

  But honestly, I wouldn't trade this bond
  for anything in the world.

  I may not say it every day, but I am
  always proud of you.

  Keep smiling, keep growing, and never
  stop being the wonderful person you are.

  No matter where life takes us,
  you'll always have your brother.

  Happy Bhai Dooj! ❤️`
};

/* ==========================================
   ELEMENTS
========================================== */

const scenes = [...document.querySelectorAll(".scene")];

const progressFill = document.getElementById("progressFill");
const sceneCounter = document.getElementById("sceneCounter");

const particleCanvas = document.getElementById("particleCanvas");
const fireworksCanvas = document.getElementById("fireworksCanvas");

const pctx = particleCanvas.getContext("2d");
const fctx = fireworksCanvas.getContext("2d");

let currentScene = 0;
let soundEnabled = false;
let giftOpened = false;
let letterOpened = false;
let roastIndex = 0;
let fireworksActive = false;

document.getElementById("sisterName").textContent =
  `To ${CONFIG.sisterName} ❤️`;

/* ==========================================
   CANVAS RESPONSIVE SETUP
========================================== */

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  [particleCanvas, fireworksCanvas].forEach(canvas => {
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  });

  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ==========================================
   SCENE NAVIGATION
========================================== */

function changeScene(index) {
  if (index < 0 || index >= scenes.length) return;

  const previous = scenes[currentScene];

  previous.classList.remove("active");
  previous.classList.add("exit");

  setTimeout(() => {
    previous.classList.remove("exit");
  }, 850);

  currentScene = index;

  scenes[currentScene].classList.add("active");

  progressFill.style.width =
    ((currentScene + 1) / scenes.length) * 100 + "%";

  sceneCounter.textContent =
    String(currentScene + 1).padStart(2, "0") +
    " — " +
    String(scenes.length).padStart(2, "0");

  if (index === 6) {
    startFinale();
  } else {
    stopFireworks();
  }

  if (soundEnabled) playChime(660, 0.12);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextScene() {
  changeScene(currentScene + 1);
}

/* ==========================================
   SOUND ENGINE
========================================== */

let audioContext = null;
let masterGain = null;

function initializeAudio() {
  if (audioContext) {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    return;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  audioContext = new AudioContextClass();

  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(audioContext.destination);
}

function playChime(frequency = 520, duration = 0.3) {
  if (!soundEnabled) return;

  initializeAudio();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 1.4,
    audioContext.currentTime + duration
  );

  gain.gain.setValueAtTime(
    0.0001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.12,
    audioContext.currentTime + 0.04
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(masterGain);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

document.getElementById("soundToggle").addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  document.getElementById("soundIcon").textContent =
    soundEnabled ? "♫" : "♪";

  if (soundEnabled) {
    initializeAudio();
    playChime(720, 0.35);
  }
});

/* ==========================================
   PARTICLE SYSTEM
========================================== */

const particles = [];
const particleCount = Math.min(
  85,
  Math.max(35, Math.floor(width / 6))
);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = random(0, width);
    this.y = initial ? random(0, height) : height + 10;

    this.size = random(0.6, 2.3);
    this.speedY = random(0.15, 0.75);
    this.speedX = random(-0.25, 0.25);

    this.alpha = random(0.2, 0.8);
    this.twinkle = random(0.01, 0.035);
    this.phase = random(0, Math.PI * 2);

    this.gold = Math.random() > 0.25;
  }

  update(time) {
    this.y -= this.speedY;
    this.x += this.speedX + Math.sin(time * 0.001 + this.phase) * 0.12;

    this.alpha += this.twinkle;

    if (this.alpha > 0.85 || this.alpha < 0.15) {
      this.twinkle *= -1;
    }

    if (this.y < -10) this.reset();
  }

  draw() {
    pctx.beginPath();

    pctx.fillStyle = this.gold
      ? `rgba(255, 204, 115, ${this.alpha})`
      : `rgba(245, 207, 207, ${this.alpha * 0.7})`;

    pctx.shadowBlur = 9;
    pctx.shadowColor = "#e6a849";

    pctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pctx.fill();

    pctx.shadowBlur = 0;
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

/* Touch-responsive particles */

const touchPoints = [];

function createTouchBurst(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = random(1, 3);

    touchPoints.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: random(1, 3)
    });
  }
}

function animateParticles(time) {
  pctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    p.update(time);
    p.draw();
  });

  for (let i = touchPoints.length - 1; i >= 0; i--) {
    const p = touchPoints[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.025;
    p.life -= 0.018;

    pctx.beginPath();
    pctx.fillStyle = `rgba(255, 209, 124, ${p.life})`;
    pctx.shadowBlur = 12;
    pctx.shadowColor = "#ffbc61";
    pctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    pctx.fill();
    pctx.shadowBlur = 0;

    if (p.life <= 0) touchPoints.splice(i, 1);
  }

  requestAnimationFrame(animateParticles);
}

requestAnimationFrame(animateParticles);

/* ==========================================
   TOUCH SPARKLES
========================================== */

document.addEventListener("pointerdown", event => {
  if (event.target.closest("button")) return;

  createTouchBurst(event.clientX, event.clientY);
});

/* ==========================================
   FLOATING PETAL EFFECT
========================================== */

function createPetal() {
  const petal = document.createElement("div");

  const size = random(7, 15);

  petal.style.position = "fixed";
  petal.style.zIndex = "10";
  petal.style.pointerEvents = "none";
  petal.style.top = "-25px";
  petal.style.left = random(0, 100) + "vw";
  petal.style.width = size + "px";
  petal.style.height = size * 1.5 + "px";
  petal.style.borderRadius = "80% 10% 80% 10%";

  const colours = [
    "#c65b52",
    "#dca45b",
    "#d68b9d",
    "#e4bd76"
  ];

  petal.style.background =
    colours[Math.floor(Math.random() * colours.length)];

  petal.style.opacity = random(0.4, 0.9);
  petal.style.filter = "drop-shadow(0 0 4px #e6a84955)";

  document.body.appendChild(petal);

  const duration = random(4000, 7500);
  const drift = random(-120, 120);
  const rotation = random(360, 900);

  const animation = petal.animate([
    {
      transform: "translate3d(0,0,0) rotate(0deg)",
      opacity: 0
    },
    {
      opacity: 0.9,
      offset: 0.15
    },
    {
      transform:
        `translate3d(${drift}px, ${height + 100}px, 0) rotate(${rotation}deg)`,
      opacity: 0
    }
  ], {
    duration,
    easing: "linear"
  });

  animation.onfinish = () => petal.remove();
}

let petalInterval = null;

function startPetals() {
  if (petalInterval) return;

  petalInterval = setInterval(() => {
    if (document.hidden) return;
    if (Math.random() > 0.15) createPetal();
  }, 500);
}

function stopPetals() {
  clearInterval(petalInterval);
  petalInterval = null;
}

/* ==========================================
   SCENE 1: START
========================================== */

document.getElementById("startButton").addEventListener("click", () => {
  initializeAudio();

  if (!soundEnabled) {
    // No automatic sound: the experience stays silent
    // until the sound control is enabled.
  }

  for (let i = 0; i < 18; i++) {
    createTouchBurst(
      width / 2 + random(-90, 90),
      height / 2 + random(-80, 80)
    );
  }

  startPetals();
  nextScene();
});

/* ==========================================
   SCENE 2: RANGOLI WISH
========================================== */

const rangoli = document.getElementById("rangoli");

rangoli.addEventListener("click", () => {
  rangoli.classList.remove("wished");
  void rangoli.offsetWidth;
  rangoli.classList.add("wished");

  playChime(800, 0.35);

  const rect = rangoli.getBoundingClientRect();

  createTouchBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );

  for (let i = 0; i < 3; i++) {
    setTimeout(createPetal, i * 200);
  }

  showFloatingMessage("Make a beautiful wish ✨");
});

document.getElementById("ritualButton").addEventListener("click", () => {
  nextScene();
});

/* ==========================================
   SCENE 3: TILAK
========================================== */

const tilakButton = document.getElementById("tilakButton");

tilakButton.addEventListener("click", () => {
  const message = document.getElementById("tilakMessage");

  message.classList.add("show");
  tilakButton.textContent = "CONTINUE ✨";

  playChime(660, 0.4);

  const thali = document.getElementById("thali");
  thali.style.transform = "scale(1.08)";
  setTimeout(() => {
    thali.style.transform = "";
  }, 500);

  if (tilakButton.dataset.done === "true") {
    nextScene();
  } else {
    tilakButton.dataset.done = "true";
    createPetal();
  }
});

/* ==========================================
   SCENE 4: GIFT BOX
========================================== */

const giftBox = document.getElementById("giftBox");
const giftButton = document.getElementById("giftButton");
const giftInstruction = document.getElementById("giftInstruction");

function openGift() {
  if (giftOpened) return;

  giftOpened = true;

  giftBox.classList.add("opened");

  giftInstruction.textContent =
    "A LITTLE LOVE, WRAPPED JUST FOR YOU ❤️";

  giftButton.textContent = "CONTINUE THE SURPRISE ↗";

  playChime(880, 0.55);

  const rect = giftBox.getBoundingClientRect();

  for (let i = 0; i < 45; i++) {
    createTouchBurst(
      rect.left + rect.width / 2 + random(-60, 60),
      rect.top + rect.height / 2 + random(-40, 40)
    );
  }

  for (let i = 0; i < 12; i++) {
    setTimeout(createPetal, i * 90);
  }
}

giftBox.addEventListener("click", openGift);

giftButton.addEventListener("click", () => {
  if (!giftOpened) {
    openGift();
  } else {
    nextScene();
  }
});

/* ==========================================
   SCENE 5: SIBLING ROAST
========================================== */

const roasts = [
  {
    emoji: "🙄",
    title: "Your unnecessary arguments.",
    sub: "You somehow always have a point."
  },
  {
    emoji: "😂",
    title: "Your professional-level drama.",
    sub: "Even Bollywood needs to learn from you."
  },
  {
    emoji: "😌",
    title: "Your talent for being right.",
    sub: "At least according to you."
  },
  {
    emoji: "🤦",
    title: "Your ability to irritate me.",
    sub: "A skill you have truly mastered."
  },
  {
    emoji: "❤️",
    title: "But I wouldn't change a thing.",
    sub: "Life is better with you around."
  }
];

const roastButton = document.getElementById("roastButton");

roastButton.addEventListener("click", () => {
  const card = document.getElementById("roastCard");

  if (roastIndex < roasts.length - 1) {
    roastIndex++;
  } else {
    nextScene();
    return;
  }

  card.classList.remove("change");
  void card.offsetWidth;
  card.classList.add("change");

  const roast = roasts[roastIndex];

  setTimeout(() => {
    document.getElementById("roastEmoji").textContent =
      roast.emoji;

    document.getElementById("roastText").textContent =
      roast.title;

    document.getElementById("roastSubtext").textContent =
      roast.sub;

    document.getElementById("roastNumber").textContent =
      String(roastIndex + 1).padStart(2, "0") + " / 05";
  }, 160);

  playChime(500 + roastIndex * 80, 0.2);

  roastButton.textContent =
    roastIndex === roasts.length - 1
      ? "ONE LAST THING ❤️"
      : "REVEAL NEXT ↗";
});

/* ==========================================
   SCENE 6: LOVE LETTER
========================================== */

const envelope = document.getElementById("envelope");
const letterButton = document.getElementById("letterButton");
const letterInstruction =
  document.getElementById("letterInstruction");

const letterText = document.getElementById("letterText");

const letterLines = CONFIG.letter
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean);

function displayLetter() {
  letterText.innerHTML = "";

  let lineIndex = 0;

  function addLine() {
    if (lineIndex >= letterLines.length) return;

    const p = document.createElement("p");
    p.textContent = letterLines[lineIndex];

    p.style.marginBottom = "10px";
    p.style.opacity = "0";
    p.style.transform = "translateY(8px)";
    p.style.transition = "opacity .5s, transform .5s";

    letterText.appendChild(p);

    requestAnimationFrame(() => {
      p.style.opacity = "1";
      p.style.transform = "translateY(0)";
    });

    lineIndex++;
    setTimeout(addLine, 850);
  }

  addLine();
}

function openLetter() {
  if (letterOpened) return;

  letterOpened = true;

  envelope.classList.add("opened");

  letterInstruction.textContent =
    "A FEW WORDS FROM YOUR BROTHER ❤️";

  letterButton.textContent = "CONTINUE TO THE FINALE ↗";

  playChime(740, 0.5);

  setTimeout(displayLetter, 700);

  for (let i = 0; i < 10; i++) {
    setTimeout(createPetal, i * 150);
  }
}

envelope.addEventListener("click", openLetter);

letterButton.addEventListener("click", () => {
  if (!letterOpened) {
    openLetter();
  } else {
    nextScene();
  }
});

/* ==========================================
   FLOATING MESSAGES
========================================== */

function showFloatingMessage(message) {
  const element = document.getElementById("touchMessage");

  element.textContent = message;
  element.style.left = "50%";
  element.style.top = "48%";
  element.style.transform = "translateX(-50%)";

  element.classList.remove("show");
  void element.offsetWidth;
  element.classList.add("show");
}

/* ==========================================
   FIREWORKS ENGINE
========================================== */

const fireworks = [];
const sparks = [];

class Firework {
  constructor(x, targetY) {
    this.x = x;
    this.y = height + 5;
    this.targetY = targetY;

    this.speed = random(4, 7);
    this.color = [
      "#ffd58a",
      "#ffb66a",
      "#e6a0a7",
      "#f9e3b4",
      "#d99a69"
    ][Math.floor(Math.random() * 5)];

    this.exploded = false;
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      this.speed *= 0.985;

      if (this.y <= this.targetY) {
        this.explode();
      }
    }
  }

  explode() {
    this.exploded = true;

    const count = Math.floor(random(35, 75));

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = random(1, 4);

      sparks.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: random(1, 2.5),
        color: this.color,
        gravity: 0.035
      });
    }

    playChime(900, 0.2);
  }

  draw() {
    if (this.exploded) return;

    fctx.beginPath();
    fctx.fillStyle = this.color;
    fctx.shadowBlur = 15;
    fctx.shadowColor = this.color;
    fctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    fctx.fill();
    fctx.shadowBlur = 0;
  }
}

function launchFirework() {
  fireworks.push(
    new Firework(
      random(width * 0.1, width * 0.9),
      random(height * 0.12, height * 0.48)
    )
  );
}

function animateFireworks() {
  fctx.clearRect(0, 0, width, height);

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i];

    firework.update();
    firework.draw();

    if (firework.exploded) {
      fireworks.splice(i, 1);
    }
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];

    s.x += s.vx;
    s.y += s.vy;
    s.vy += s.gravity;

    s.vx *= 0.985;
    s.vy *= 0.985;
    s.alpha -= 0.014;

    fctx.beginPath();
    fctx.fillStyle = s.color;
    fctx.globalAlpha = Math.max(0, s.alpha);
    fctx.shadowBlur = 10;
    fctx.shadowColor = s.color;
    fctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    fctx.fill();

    if (s.alpha <= 0) {
      sparks.splice(i, 1);
    }
  }

  fctx.globalAlpha = 1;
  fctx.shadowBlur = 0;

  requestAnimationFrame(animateFireworks);
}

requestAnimationFrame(animateFireworks);

let fireworkInterval = null;

function startFinale() {
  fireworksActive = true;

  launchFirework();

  for (let i = 0; i < 4; i++) {
    setTimeout(launchFirework, 350 + i * 400);
  }

  fireworkInterval = setInterval(() => {
    if (!fireworksActive || document.hidden) return;
    launchFirework();
  }, 850);

  startPetals();

  for (let i = 0; i < 20; i++) {
    setTimeout(createPetal, i * 170);
  }
}

function stopFireworks() {
  fireworksActive = false;
  clearInterval(fireworkInterval);
  fireworkInterval = null;

  fireworks.length = 0;
  sparks.length = 0;

  fctx.clearRect(0, 0, width, height);
}

/* ==========================================
   REPLAY EXPERIENCE
========================================== */

document.getElementById("replayButton").addEventListener("click", () => {
  stopFireworks();
  stopPetals();

  giftOpened = false;
  letterOpened = false;
  roastIndex = 0;

  giftBox.classList.remove("opened");
  envelope.classList.remove("opened");

  giftInstruction.textContent = "TAP THE GIFT TO OPEN IT";
  giftButton.textContent = "OPEN YOUR GIFT ↗";

  letterInstruction.textContent = "TAP THE ENVELOPE TO READ";
  letterButton.textContent = "OPEN MY LETTER ↗";

  letterText.innerHTML = "";

  document.getElementById("roastEmoji").textContent = roasts[0].emoji;
  document.getElementById("roastText").textContent = roasts[0].title;
  document.getElementById("roastSubtext").textContent = roasts[0].sub;
  document.getElementById("roastNumber").textContent = "01 / 05";
  roastButton.textContent = "REVEAL NEXT ↗";

  const tilakMessage = document.getElementById("tilakMessage");
  tilakMessage.classList.remove("show");
  tilakButton.dataset.done = "false";
  tilakButton.textContent = "SEND YOUR BLESSINGS ↗";

  rangoli.classList.remove("wished");

  changeScene(0);
});

/* ==========================================
   OPTIONAL: SHAKE TO CREATE A PETAL SHOWER
========================================== */

let lastShake = 0;
let previousMagnitude = 0;

function handleMotion(event) {
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;
const magnitude = Math.sqrt(
    (acc.x || 0) ** 2 +
    (acc.y || 0) ** 2 +
    (acc.z || 0) ** 2
  );

  const difference = Math.abs(magnitude - previousMagnitude);
  previousMagnitude = magnitude;

  if (
    difference > 17 &&
    Date.now() - lastShake > 2500
  ) {
    lastShake = Date.now();

    for (let i = 0; i < 18; i++) {
      setTimeout(createPetal, i * 70);
    }

    showFloatingMessage("A little magic for you ✨");
    playChime(850, 0.3);
}
}

/* Motion permission is requested only after a user gesture */
async function enableShake() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    try {
      const permission = await DeviceMotionEvent.requestPermission();

      if (permission === "granted") {
        window.addEventListener("devicemotion", handleMotion);
      }
    } catch (error) {
      console.log("Motion access unavailable.");
}
  } else if ("DeviceMotionEvent" in window) {
    window.addEventListener("devicemotion", handleMotion);
  }
}

document.getElementById("startButton").addEventListener(
  "click",
  enableShake,
  { once: true }
);

/* ==========================================
   PAGE VISIBILITY
========================================== */

document.addEventListener("visibilitychange", () => {
if (document.hidden) {
    // Stop expensive effects while in the background
    return;
  }

  if (currentScene === 6 && !fireworksActive) {
    startFinale();
  }
});

/* ==========================================
   INITIAL STATE
========================================== */

changeScene(0);

console.log(
  "✨ Bhai Dooj Experience loaded successfully!"
);