// Boot and the fixed-step loop. The hunt owns the rules, the painter owns the
// frame, input only translates keys and clicks into hunt calls. A shot query
// (?shot=cover|market|garden|end&seed=N) stages a frozen moment of play and
// sets window.__shotReady once it is painted, so screenshots are repeatable.
// window.__hunt and window.__layout are exposed for the play-test driver.

import { FIELD, PANELS, STEP } from './config.js';
import { SCENES } from './scenes.js';
import {
  advanceScene,
  clickAt,
  createHunt,
  startGame,
  tick,
  togglePause,
  useHint,
} from './hunt.js';
import { HINT_BUTTON, createPainter } from './painter.js';
import { attachInput } from './input.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');

function loadBest() {
  try {
    const stored = Number(window.localStorage.getItem('spot-the-difference.best'));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem('spot-the-difference.best', String(score));
  } catch {
    // Private mode or no storage: the game still works, the best is forgotten.
  }
}

const hunt = createHunt(SCENES, loadBest());
const painter = createPainter(canvas);
const sound = createSound();
let now = 0;
let shotMode = null;

function panelAt(fieldX, fieldY) {
  for (const panel of [PANELS.left, PANELS.right]) {
    if (
      fieldX >= panel.x &&
      fieldX < panel.x + panel.width &&
      fieldY >= panel.y &&
      fieldY < panel.y + panel.height
    ) {
      return { x: fieldX - panel.x, y: fieldY - panel.y };
    }
  }
  return null;
}

function refreshBest() {
  if (hunt.score > hunt.best) {
    hunt.newBest = true;
    hunt.best = hunt.score;
    if (!shotMode) saveBest(hunt.best);
  }
}

function handleClick(fieldX, fieldY) {
  if (hunt.phase === 'title') {
    startGame(hunt);
    sound.click();
    return;
  }
  if (hunt.phase === 'sceneDone') {
    advanceScene(hunt);
    sound.click();
    return;
  }
  if (hunt.phase === 'victory') {
    startGame(hunt);
    sound.click();
    return;
  }
  if (hunt.phase === 'paused') {
    togglePause(hunt);
    return;
  }
  if (
    fieldX >= HINT_BUTTON.x &&
    fieldX < HINT_BUTTON.x + HINT_BUTTON.width &&
    fieldY >= HINT_BUTTON.y &&
    fieldY < HINT_BUTTON.y + HINT_BUTTON.height
  ) {
    const hinted = useHint(hunt, now);
    if (hinted) sound.hint();
    return;
  }
  const hit = panelAt(fieldX, fieldY);
  if (!hit) return;
  const result = clickAt(hunt, hit.x, hit.y, now);
  if (result === 'found') sound.found();
  else if (result === 'wrong') sound.wrong();
}

function confirm() {
  if (hunt.phase === 'title' || hunt.phase === 'sceneDone' || hunt.phase === 'victory') {
    handleClick(0, 0);
    return;
  }
  if (hunt.phase === 'paused') {
    togglePause(hunt);
    return;
  }
  const result = clickAt(hunt, hunt.crosshair.x, hunt.crosshair.y, now);
  if (result === 'found') sound.found();
  else if (result === 'wrong') sound.wrong();
}

attachInput(canvas, {
  click: handleClick,
  hover(fieldX, fieldY) {
    const hit = panelAt(fieldX, fieldY);
    if (hit) {
      hunt.crosshair.x = hit.x;
      hunt.crosshair.y = hit.y;
    }
  },
  move(dx, dy) {
    hunt.crosshair.x = Math.max(0, Math.min(592, hunt.crosshair.x + dx));
    hunt.crosshair.y = Math.max(0, Math.min(512, hunt.crosshair.y + dy));
  },
  confirm,
  hint() {
    if (hunt.phase !== 'play') return;
    const hinted = useHint(hunt, now);
    if (hinted) sound.hint();
  },
  pause() {
    togglePause(hunt);
  },
  restart() {
    startGame(hunt);
    sound.click();
  },
  mute() {
    sound.toggleMute();
  },
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  shotMode = shot;
  // The status line is for screen readers; in a staged shot it would sit on
  // top of the game's bottom bar, so it is hidden there.
  status.style.display = 'none';
  stageShot(hunt, shot);
}

window.__hunt = hunt;
window.__layout = { FIELD, PANELS };
window.__shotReady = false;

let last = performance.now();
let accumulator = 0;
let lastMessage = '';
function frame(time) {
  const dt = Math.min(0.1, (time - last) / 1000);
  last = time;
  now += dt;
  accumulator += dt;
  while (accumulator >= STEP) {
    tick(hunt, STEP);
    accumulator -= STEP;
  }
  if (hunt.phase === 'victory') refreshBest();
  painter.draw(hunt, now);
  if (hunt.message !== lastMessage) {
    status.textContent = hunt.message;
    lastMessage = hunt.message;
  }
  if (shotMode && !window.__shotReady) window.__shotReady = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
setTimeout(() => {
  if (shotMode && !window.__shotReady) {
    painter.draw(hunt, now);
    window.__shotReady = true;
  }
}, 3000);
