const KEY = "jogo-dividend-dash-progress-v1";

export const JogoStorage = {
  key: KEY,
  load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { bestAccuracy: 0, races: 0 };
    } catch {
      return { bestAccuracy: 0, races: 0 };
    }
  },
  save(data, { dev = false } = {}) {
    if (dev) return false;
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  },
  reset() {
    localStorage.removeItem(KEY);
  },
};
