// Lade-Status Rotation
const status = document.querySelector(".status");
const messages = [
  "Lade Texturen...",
  "Initialisiere Waffen...",
  "Verbinde mit Workshop...",
  "Starte Lua-Skripte...",
  "Fast fertig...",
  "Willkommen bei Retarded Unicorns!"
];
let i = 0;
setInterval(() => {
  status.textContent = messages[i % messages.length];
  i++;
}, 2000);

// Musik + Visualizer
const audio = document.getElementById("bg-music");
const songTitle = document.querySelector(".song-title");

const playlist = [
  { src: "musik/FutureRemix98.ogg", title: "FutureRemix98" },
  { src: "musik/track2.mp3", title: "Track 2" },
  { src: "musik/track3.mp3", title: "Track 3" },
  { src: "musik/track4.mp3", title: "Track 4" },
  { src: "musik/track5.mp3", title: "Track 5" }
];

// Zufälligen Song starten
function playRandomSong() {
  const song = playlist[Math.floor(Math.random() * playlist.length)];
  audio.src = song.src;
  songTitle.textContent = song.title;
  audio.play();
}
playRandomSong();

// Wenn Song endet → nächster random Song
audio.addEventListener("ended", playRandomSong);

// Audio Visualizer
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2;
    ctx.fillStyle = `rgb(${barHeight+100}, 50, 200)`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}
draw();

// Fix: AudioContext muss nach User-Interaktion starten (Browser-Policy)
document.body.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
    audio.play();
  }
});
