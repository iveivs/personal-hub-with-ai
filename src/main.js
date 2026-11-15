import './styles/main.css';

import { bindEvents } from './events.js';
import { connect } from './store/sync.js';
import { render, scheduleRender } from './ui/render.js';
import { applySavedTheme } from './ui/theme.js';
import { toast } from './ui/toast.js';

applySavedTheme();
bindEvents();
connect({
  onChange: scheduleRender,
  onFail: render,
  onMessage: toast,
});
