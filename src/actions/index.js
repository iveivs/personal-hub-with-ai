// Все обработчики кнопок: data-action="имя" → ACTIONS[имя](элемент, событие).

import { processActions } from '../process/wizard.js';
import { appActions } from './app.js';
import { healthActions } from './health.js';
import { itemActions } from './items.js';
import { projectActions } from './projects.js';
import { reviewActions } from './review.js';

export const ACTIONS = {
  ...appActions,
  ...itemActions,
  ...projectActions,
  ...processActions,
  ...reviewActions,
  ...healthActions,
};
