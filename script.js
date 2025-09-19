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
const songs = [
  { file: "musik/song1.mp3", title: "Song 1", volume: 0.5 },
  { file: "musik/song2.mp3", title: "Song 2", volume: 0.4 },
  { file: "musik/song3.mp3", title: "Song 3", volume: 0.6 }
];

const audio = document.getElementById("bg-music");
const songTitle = document.querySelector(".song-title");

// Zufälligen Song starten
function playRandomSong() {
  const song = songs[Math.floor(Math.random() * songs.length)];
  audio.src = song.file;
  audio.volume = song.volume;
  songTitle.textContent = song.title;
  audio.play();
}
playRandomSong();

audio.addEventListener("ended", playRandomSong);

// Visualizer
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 64;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 1.5;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;
    ctx.fillStyle = `rgb(${100+barHeight*2},50,255)`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}
draw();

// AudioContext Policy Fix (für Browser)
document.body.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
    audio.play();
  }
});
