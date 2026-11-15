// Модальное окно («шторка»). Одновременно открыто не больше одного.

import { $, esc, growAll } from '../lib/dom.js';
import { app } from '../state.js';
import { render } from './render.js';

export function openModal(kind, html) {
  app.modalKind = kind;
  $('#sheet').innerHTML = html;
  $('#modal').hidden = false;
  growAll($('#sheet'));
  const f = $('#sheet [autofocus]');
  if (f) setTimeout(() => f.focus(), 30);
}

/** Спрятать окно и сбросить его состояние, без перерисовки. */
export function hideModal() {
  $('#modal').hidden = true;
  app.modalKind = null;
  app.process = null;
  app.confirmFn = null;
}

/** Закрыть окно (кроме приветствия: его закрывает только кнопка «Начать»). */
export function closeModal() {
  if (app.modalKind === 'welcome') return;
  hideModal();
  render();
}

export function askConfirm(text, okLabel, fn) {
  app.confirmFn = fn;
  openModal(
    'confirm',
    `<div class="q" style="font-size:17px">${esc(text).replace(/\n/g, '<br>')}</div>
    <div class="sheet-actions"><span class="spacer"></span><button type="button" class="btn" data-action="close">Отмена</button>
    <button type="button" class="btn primary" data-action="confirmOk">${esc(okLabel)}</button></div>`,
  );
}

export function openWelcome() {
  openModal(
    'welcome',
    `<div class="welcome">
    <h2>👋 Привет! Это твой Personal Hub</h2>
    <p>Работает он так:</p>
    <ol>
      <li><b>Записываешь всё</b>, что приходит в голову, в одно поле. Оно попадает во «Входящие».</li>
      <li><b>Разбираешь Входящие</b> с помощью мастера. Он задаёт простые вопросы и сам раскладывает пункты по спискам.</li>
      <li><b>Делаешь</b> из «Сегодня» и «Следующих действий», выбирая по месту, времени и силам.</li>
      <li><b>Раз в неделю делаешь обзор.</b> Для него есть пошаговый чек-лист.</li>
    </ol>
    <p style="color:var(--muted);font-size:14px">Сон и питание ведутся в отдельных разделах. Claude видит те же данные и может заполнять их за тебя.</p>
    <div class="sheet-actions">
      <button type="button" class="btn primary" data-action="startEmpty">Начать</button>
    </div></div>`,
  );
}
