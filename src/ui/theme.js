import { THEME_KEY } from '../config.js';

const root = () => document.documentElement;

/** Применить тему, выбранную вручную раньше. Без выбора — как в системе. */
export function applySavedTheme() {
  try {
    const th = localStorage.getItem(THEME_KEY);
    if (th) root().dataset.theme = th;
  } catch {
    /* нет доступа к localStorage — остаётся системная тема */
  }
}

export function toggleTheme() {
  const cur = root().dataset.theme;
  const dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root().dataset.theme = dark ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_KEY, root().dataset.theme);
  } catch {
    /* не запомнится, но переключится */
  }
}
