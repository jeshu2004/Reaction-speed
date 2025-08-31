const GRID_SIZE = 5;
const START_TIME_MS = 1600;
const MIN_TIME_MS = 550;
const TIME_DECAY = 60;
const START_SIZE = 88;
const MIN_SIZE = 42;
const SIZE_DECAY = 3;
const PENALTY_MISS_CLICK = 150;
const COUNTDOWN_MS = 1000; 

const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const timerBarEl = document.getElementById('timerBar');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const lbEl = document.getElementById('lb');

let running = false;
let paused = false;
let score = 0;
let best = Number(localStorage.getItem('bestScore') || 0);
let roundTime = START_TIME_MS;
let timeLeft = START_TIME_MS;
let size = START_SIZE;
let targetIndex = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
let rafId = null;
let lastTs = 0;
let countdownActive = false;

let leaderboardData = [
  { name: "Jaswanth", score: 23 },
  { name: "Sai", score: 17 },
  { name: "Vinuthna", score: 12 },
  { name: "Krithika", score: 9 }
];

let audioCtx = null;
function beep(freq = 880, duration = 0.1, vol = 0.04) {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { console.warn("Web Audio not supported", e); return; }
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  setTimeout(() => { osc.stop(); osc.disconnect(); gain.disconnect(); }, duration * 1000);
}

const targetSpans = [];
function buildGrid() {
  gridEl.innerHTML = '';
  const total = GRID_SIZE * GRID_SIZE;
  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn-cell relative aspect-square rounded-xl bg-slate-900 hover:bg-slate-800 transition overflow-hidden';
    btn.setAttribute('data-idx', i);

    const target = document.createElement('span');
    target.className = 'absolute inset-0 m-auto rounded-full shadow-glow';
    target.style.pointerEvents = 'none';
    btn.appendChild(target);
    targetSpans.push(target);

    btn.addEventListener('click', () => onCellClick(i));
    gridEl.appendChild(btn);
  }
}
buildGrid();

function renderTarget() {
  const total = GRID_SIZE * GRID_SIZE;
  for (let i = 0; i < total; i++) {
    const target = targetSpans[i];
    if (i === targetIndex && running && !paused) {
      target.style.width = `${size}px`;
      target.style.height = `${size}px`;
      target.style.background = 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6)';
      target.style.opacity = 1;
      gsap.fromTo(target, { scale: 0.5 }, { scale: 1, duration: 0.22, ease: 'back.out(2)', repeat: -1, yoyo: true });
    } else {
      target.style.opacity = 0;
      gsap.killTweensOf(target);
    }
  }
}

function startCountdown(callback) {
  countdownActive = true;
  let count = 3;
  statusEl.textContent = count;
  beep(440, 0.15, 0.05);

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      statusEl.textContent = count;
      beep(440 + 60 * count, 0.15, 0.05);
    } else {
      clearInterval(interval);
      statusEl.textContent = 'Go!';
      beep(880, 0.2, 0.08);
      countdownActive = false;
      callback();
    }
  }, COUNTDOWN_MS);
}

function startGame() {
  if (countdownActive) return;
  score = 0;
  roundTime = START_TIME_MS;
  timeLeft = START_TIME_MS;
  size = START_SIZE;
  targetIndex = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
  running = true;
  paused = false;
  scoreEl.textContent = score;
  bestEl.textContent = best;
  toggleButtons();
  startCountdown(() => {
    statusEl.textContent = 'Tap the glowing circle before time runs out!';
    renderTarget();
    tickStart();
  });
}

function pauseGame() {
  if (!running || paused) return;
  paused = true;
  cancelAnimationFrame(rafId);
  statusEl.textContent = 'Paused — press Resume.';
  toggleButtons();
  beep(440, 0.06, 0.04);
}

function resumeGame() {
  if (!running || !paused) return;
  paused = false;
  statusEl.textContent = 'Tap the glowing circle before time runs out!';
  toggleButtons();
  tickStart();
  beep(660, 0.06, 0.04);
}

function restartGame() {
  running = false;
  paused = false;
  cancelAnimationFrame(rafId);
  startGame();
}

function gameOver() {
  running = false;
  paused = false;
  cancelAnimationFrame(rafId);
  if (score > best) {
    best = score;
    localStorage.setItem('bestScore', String(best));
  }
  bestEl.textContent = best;
  statusEl.textContent = 'Time up — press Start to try again.';
  toggleButtons();
  renderTarget();
  beep(220, 0.25, 0.06);

  if (score > 0) {
    leaderboardData.push({ name: "You", score });
    leaderboardData.sort((a, b) => b.score - a.score);
    if (leaderboardData.length > 10) leaderboardData.pop();
    renderLeaderboard(leaderboardData);
  }
}

function tickStart() {
  lastTs = performance.now();
  rafId = requestAnimationFrame(tick);
}
function tick(now) {
  const dt = now - lastTs;
  lastTs = now;
  if (running && !paused) {
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerBar();
      return gameOver();
    }
    updateTimerBar();
  }
  rafId = requestAnimationFrame(tick);
}

function updateTimerBar() {
  const pct = Math.max(0, Math.min(100, (timeLeft / roundTime) * 100 || 0));
  if (!updateTimerBar._setter) {
    updateTimerBar._setter = gsap.quickSetter('#timerBar', 'width', 'px');
    updateTimerBar._maxW = timerBarEl.parentElement.clientWidth;
  }
  const maxW = updateTimerBar._maxW || timerBarEl.parentElement.clientWidth;
  updateTimerBar._setter((pct / 100) * maxW);
}

function toggleButtons() {
  startBtn.classList.toggle('hidden', running || countdownActive);
  pauseBtn.classList.toggle('hidden', !(running && !paused));
  resumeBtn.classList.toggle('hidden', !(running && paused));
}

function nextRound() {
  score++;
  scoreEl.textContent = score;
  beep(880, 0.08, 0.05);

  roundTime = Math.max(MIN_TIME_MS, roundTime - TIME_DECAY);
  timeLeft = roundTime;
  size = Math.max(MIN_SIZE, size - SIZE_DECAY);

  const total = GRID_SIZE * GRID_SIZE;
  let idx = Math.floor(Math.random() * total);
  if (idx === targetIndex) idx = (idx + 1) % total;
  targetIndex = idx;

  renderTarget();
  gsap.fromTo(timerBarEl, { opacity: 0.2 }, { opacity: 1, duration: 0.15, ease: 'power2.out' });
}

function onCellClick(i) {
  if (!running || paused) return;
  const btn = gridEl.children[i];

  gsap.fromTo(btn, { boxShadow: '0 0 0px rgba(96,165,250,0.0)' }, { boxShadow: '0 0 24px rgba(96,165,250,0.45)', duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' });

  if (i === targetIndex) {
    nextRound();
  } else {
    timeLeft = Math.max(0, timeLeft - PENALTY_MISS_CLICK);
    beep(520, 0.05, 0.04);
    gsap.fromTo(timerBarEl, { backgroundColor: '#ef4444' }, { backgroundColor: '#3b82f6', duration: 0.2 });
    if (timeLeft === 0) gameOver();
  }
}

function renderLeaderboard(data) {
  lbEl.innerHTML = '';
  data.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between bg-slate-900 rounded-xl py-2 px-3';
    const nameClasses = r.name === "You" ? "text-blue-400 font-semibold" : "";
    row.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xs opacity-60 w-6 text-right">${i + 1}.</span>
        <span class="${nameClasses}">${r.name}</span>
      </div>
      <span class="font-medium">${r.score}</span>
    `;
    lbEl.appendChild(row);
  });
}

bestEl.textContent = best;
renderTarget();
updateTimerBar();
renderLeaderboard(leaderboardData);

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
restartBtn.addEventListener('click', restartGame);

window.addEventListener('resize', () => { updateTimerBar._setter = null; updateTimerBar(); });

