/* ---------------------------
   Team-Liste + Seiten-Animation
   --------------------------- */

const teamListEl = document.querySelector(".team-list");

// Alle Team-Mitglieder (Rolle + Name) — passe hier an / erweitere
const teamMembers = [
  { role: "Owner",      name: "[R.U]Yu" },
  { role: "Head Admin", name: "[R.U]Kariko" },
  { role: "Head Admin", name: "[R.U]Unkown" },
  // zusätzliche Beispiel-Einträge (ersetzbar)
  { role: "Bewirb dich gerne bei uns",      name: "Als Teamler" },
  { role: "Alle weiteren Infos bei uns",  name: "auf dem Discord" },
  { role: "https://discord.gg/NcaRsM7MHP",  name: "[R.U]DeinName" },
  //{ role: "Supporter",  name: "[R.U]" }
];

let teamPage = 0;
function renderTeamPage() {
  const start = teamPage * 3;
  const pageMembers = teamMembers.slice(start, start + 3);

  // prepare fade reset
  teamListEl.classList.remove("fade-in");
  // force reflow to restart animation
  void teamListEl.offsetWidth;

  teamListEl.innerHTML = ""; // clear

  pageMembers.forEach(member => {
    const li = document.createElement("li");
    const roleSpan = document.createElement("span");
    roleSpan.textContent = member.role + ":";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = member.name;
    li.appendChild(roleSpan);
    li.appendChild(nameSpan);
    teamListEl.appendChild(li);
  });

  // trigger fade animation
  teamListEl.classList.add("fade-in");

  // advance page index
  teamPage++;
  if (teamPage * 3 >= teamMembers.length) teamPage = 0;
}

renderTeamPage();
setInterval(renderTeamPage, 5000); // wechselt alle 5s

/* ---------------------------
   Lade-Status + Fortschritt
   --------------------------- */

const statusEl = document.querySelector(".status");
const barEl = document.getElementById("progress-bar");

// Technische Nachrichten (laufen *einmal* durch während Ladebalken)
const techMessages = [
  "Lade Texturen...",
  "Initialisiere Waffen...",
  "Verbinde mit Workshop...",
  "Starte Lua-Skripte..."
];

// Endzustände (nachdem Balken fertig)
const finalMessages = ["Fast fertig...", "Willkommen bei Retarded Unicorns!"];

let techIndex = 0;
let techTimer = null;
let finalTimer = null;

// Funktion: starte technische Nachrichten (einmal nacheinander)
function startTechMessages() {
  statusEl.textContent = techMessages[techIndex] || "";
  techTimer = setInterval(() => {
    techIndex++;
    if (techIndex < techMessages.length) {
      statusEl.textContent = techMessages[techIndex];
    } else {
      // Stoppe; weiter wird durch Balken-Finish gesteuert
      clearInterval(techTimer);
      techTimer = null;
    }
  }, 2000);
}

// Start direkt beim Laden der Seite
startTechMessages();

// Wenn die Balkenanimation endet, wecheln wir auf finalMessages toggle
let fallbackFinishTimeout = null;
function onBarFinished() {
  // Stoppe techTimer falls noch laufend
  if (techTimer) {
    clearInterval(techTimer);
    techTimer = null;
  }

  // Start toggle zwischen finalMessages
  let toggle = 0;
  if (finalTimer) clearInterval(finalTimer);
  finalTimer = setInterval(() => {
    statusEl.textContent = finalMessages[toggle % finalMessages.length];
    toggle++;
  }, 2500);
}

// Listen auf CSS animationend (name 'load')
barEl.addEventListener("animationend", (e) => {
  if (e.animationName === "load") {
    onBarFinished();
    if (fallbackFinishTimeout) {
      clearTimeout(fallbackFinishTimeout);
      fallbackFinishTimeout = null;
    }
  }
});

// Fallback: falls browser/edge-case kein animationend feuert, entferne nach 12.2s
fallbackFinishTimeout = setTimeout(() => {
  onBarFinished();
}, 12200);

/* ---------------------------
   Musik + Visualizer
   --------------------------- */

const songs = [
  { file: "musik/FutureRemix98.ogg", title: "Future Remix 98", volume: 0.025 },
  { file: "musik/Children.ogg", title: "Robert Miles - Children", volume: 0.025 },
  { file: "musik/DarudeSandstorm.ogg", title: "Darude - Sandstorm", volume: 0.025 },
  { file: "musik/AliceDeejayBetterOffAlone.ogg", title: "Alice Deejay - Better Off Alone", volume: 0.025 }
];

const audio = document.getElementById("bg-music");
const songTitle = document.querySelector(".song-title");

function playRandomSong() {
  const song = songs[Math.floor(Math.random() * songs.length)];
  audio.src = song.file;
  audio.volume = song.volume;
  songTitle.textContent = song.title;
  audio.play().catch(()=>{ /* autoplay might be blocked until user gesture */ });
}
playRandomSong();
audio.addEventListener("ended", playRandomSong);

/* Visualizer setup */
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let audioCtx, analyser, source;
try {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 64;
} catch (err) {
  // AudioContext/createMediaElementSource may fail in some envs - fallback gracefully
  console.warn("AudioContext/visualizer nicht verfügbar:", err);
}

const bufferLength = analyser ? analyser.frequencyBinCount : 32;
const dataArray = new Uint8Array(bufferLength);

function draw() {
  requestAnimationFrame(draw);
  if (!analyser) return;
  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 1.2;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;
    ctx.fillStyle = `rgb(${120 + barHeight * 1.2},50,255)`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}
draw();

// Browser Autoplay policy: user-gesture resume
document.body.addEventListener("click", () => {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().then(() => {
      audio.play().catch(()=>{});
    });
  } else {
    audio.play().catch(()=>{});
  }
});

/* ---------------------------
   optional: expose updateMap from Lua (if used later)
   --------------------------- */
// No map functionality included / requested - removed.
