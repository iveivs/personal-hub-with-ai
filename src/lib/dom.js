export const $ = (s) => document.querySelector(s);

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Поле ввода сейчас в фокусе внутри root? Тогда перерисовка сбила бы набор текста. */
export function isTypingIn(root) {
  const a = document.activeElement;
  return !!(a && root && root.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
}

/** textarea растёт вместе с текстом, но не выше ~60% экрана. */
export function autoGrow(el) {
  if (!el || el.tagName !== 'TEXTAREA') return;
  el.style.height = 'auto';
  const max = Math.max(160, Math.round(window.innerHeight * 0.6));
  el.style.height = Math.min(el.scrollHeight + 2, max) + 'px';
}

export function growAll(root) {
  if (root) root.querySelectorAll('textarea').forEach(autoGrow);
}
