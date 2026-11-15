import { $, esc } from '../lib/dom.js';

let timer;

/** Всплывающее сообщение внизу экрана. С undo — появляется кнопка «Отменить». */
export function toast(msg, undo) {
  const t = $('#toast');
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button" id="undoBtn">Отменить</button>' : '');
  t.hidden = false;
  if (undo) {
    $('#undoBtn').onclick = () => {
      undo();
      t.hidden = true;
    };
  }
  clearTimeout(timer);
  timer = setTimeout(() => (t.hidden = true), undo ? 5000 : 2400);
}
