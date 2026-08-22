let enabled = localStorage.getItem("jogo-dividend-dash-sound") !== "off";
let context;

function ensureContext() {
  if (!context) {
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      context = null;
    }
  }
  return context;
}

function tone(frequency, duration = 0.08, delay = 0) {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.025;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  const start = ctx.currentTime + delay;
  oscillator.start(start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.stop(start + duration + 0.02);
}

export const JogoSound = {
  get enabled() {
    return enabled;
  },
  toggle() {
    enabled = !enabled;
    localStorage.setItem("jogo-dividend-dash-sound", enabled ? "on" : "off");
    return enabled;
  },
  good() {
    tone(660, 0.08);
    tone(880, 0.12, 0.07);
  },
  bad() {
    tone(190, 0.16);
  },
  finish() {
    tone(523, 0.1);
    tone(659, 0.1, 0.09);
    tone(784, 0.18, 0.18);
  },
};
