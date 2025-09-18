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
