// Экран по id. Каждый экран — функция без аргументов, возвращающая HTML.

import { calendarView } from './calendar.js';
import { doneView } from './done.js';
import { foodView } from './food.js';
import { helpView } from './help.js';
import { inboxView } from './inbox.js';
import { nextView } from './next.js';
import { projectsView } from './projects.js';
import { referenceView } from './reference.js';
import { reviewView } from './review.js';
import { sleepView } from './sleep.js';
import { somedayView } from './someday.js';
import { todayView } from './today.js';
import { waitingView } from './waiting.js';

export const VIEW_RENDER = {
  today: todayView,
  inbox: inboxView,
  next: nextView,
  calendar: calendarView,
  waiting: waitingView,
  projects: projectsView,
  someday: somedayView,
  reference: referenceView,
  done: doneView,
  sleep: sleepView,
  food: foodView,
  review: reviewView,
  help: helpView,
};
