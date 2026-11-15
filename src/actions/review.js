import { S } from '../state.js';
import { save } from '../store/sync.js';
import { render } from '../ui/render.js';
import { toast } from '../ui/toast.js';

export const reviewActions = {
  reviewCheck(el) {
    const id = el.dataset.id;
    S.review.checks[id] = !S.review.checks[id];
    save();
    render();
  },
  reviewReset() {
    S.review.checks = {};
    save();
    render();
  },
  reviewFinish() {
    S.review.lastDone = Date.now();
    S.review.checks = {};
    save();
    render();
    toast('Обзор завершён. Система в порядке 🧘');
  },
};
