// The hunt itself: rules and state only, no drawing, no DOM. Every decision the
// game makes lives here, so the same rules can be tested without a browser.
// A click lands in panel space (592x512); a difference counts when the click
// falls within its circle, plus a small tolerance for near misses.

import {
  CLICK_TOLERANCE,
  FIND_POINTS,
  HINTS_PER_SCENE,
  HINT_COST_SECONDS,
  HINT_SHOW_SECONDS,
  SCENE_SECONDS,
  WRONG_COST_SECONDS,
} from './config.js';

export function createHunt(scenes, best) {
  return {
    scenes,
    best,
    newBest: false,
    phase: 'title',
    sceneIndex: 0,
    found: new Set(),
    foundCounts: scenes.map(() => 0),
    hintsLeft: HINTS_PER_SCENE,
    timeLeft: SCENE_SECONDS,
    score: 0,
    sceneBonus: 0,
    timeUp: false,
    hint: null,
    flash: null,
    message: 'Find every difference between the two pictures.',
    crosshair: { x: 296, y: 256 },
  };
}

export function currentScene(hunt) {
  return hunt.scenes[hunt.sceneIndex];
}

export function remainingCount(hunt) {
  return currentScene(hunt).differences.length - hunt.found.size;
}

export function startGame(hunt) {
  hunt.phase = 'play';
  hunt.sceneIndex = 0;
  hunt.found = new Set();
  hunt.foundCounts = hunt.scenes.map(() => 0);
  hunt.hintsLeft = HINTS_PER_SCENE;
  hunt.timeLeft = SCENE_SECONDS;
  hunt.score = 0;
  hunt.newBest = false;
  hunt.sceneBonus = 0;
  hunt.timeUp = false;
  hunt.hint = null;
  hunt.flash = null;
  hunt.message = 'Find every difference between the two pictures.';
}

export function beginScene(hunt, index) {
  hunt.sceneIndex = index;
  hunt.found = new Set();
  hunt.hintsLeft = HINTS_PER_SCENE;
  hunt.timeLeft = SCENE_SECONDS;
  hunt.sceneBonus = 0;
  hunt.timeUp = false;
  hunt.hint = null;
  hunt.flash = null;
  hunt.phase = 'play';
  hunt.message = `${currentScene(hunt).name} — find ${currentScene(hunt).differences.length} differences.`;
}

function finishScene(hunt, timeUp) {
  hunt.timeUp = timeUp;
  hunt.sceneBonus = timeUp ? 0 : Math.max(0, Math.round(hunt.timeLeft));
  hunt.score += hunt.sceneBonus;
  hunt.foundCounts[hunt.sceneIndex] = hunt.found.size;
  hunt.hint = null;
  hunt.flash = null;
  hunt.phase = hunt.sceneIndex === hunt.scenes.length - 1 ? 'victory' : 'sceneDone';
  hunt.message = timeUp
    ? `Time up! You found ${hunt.found.size} of ${currentScene(hunt).differences.length}.`
    : `Scene complete! Time bonus +${hunt.sceneBonus}.`;
}

/** A click at panel coordinates. Returns 'found', 'wrong', or 'ignored'. */
export function clickAt(hunt, x, y, now) {
  if (hunt.phase !== 'play') return 'ignored';
  const scene = currentScene(hunt);
  for (const diff of scene.differences) {
    if (hunt.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    const radius = diff.r + CLICK_TOLERANCE;
    if (dx * dx + dy * dy <= radius * radius) {
      hunt.found.add(diff.id);
      hunt.score += FIND_POINTS;
      hunt.flash = { x: diff.x, y: diff.y, kind: 'found', until: now + 0.9 };
      const left = remainingCount(hunt);
      hunt.message = left === 0 ? 'All found!' : `Found ${diff.label}! ${left} left.`;
      if (left === 0) finishScene(hunt, false);
      return 'found';
    }
  }
  hunt.timeLeft = Math.max(0, hunt.timeLeft - WRONG_COST_SECONDS);
  hunt.flash = { x, y, kind: 'wrong', until: now + 0.6 };
  hunt.message = `Not a difference — minus ${WRONG_COST_SECONDS} seconds.`;
  if (hunt.timeLeft <= 0) finishScene(hunt, true);
  return 'wrong';
}

/** Ring one unfound difference for a few seconds, at a cost. Returns its id or null. */
export function useHint(hunt, now) {
  if (hunt.phase !== 'play' || hunt.hintsLeft <= 0) return null;
  const next = currentScene(hunt).differences.find((d) => !hunt.found.has(d.id));
  if (!next) return null;
  hunt.hintsLeft -= 1;
  hunt.timeLeft = Math.max(0, hunt.timeLeft - HINT_COST_SECONDS);
  hunt.hint = { x: next.x, y: next.y, r: next.r, until: now + HINT_SHOW_SECONDS };
  hunt.message = `Hint: look near ${next.label}. Minus ${HINT_COST_SECONDS} seconds.`;
  if (hunt.timeLeft <= 0) finishScene(hunt, true);
  return next.id;
}

export function advanceScene(hunt) {
  if (hunt.phase === 'sceneDone') beginScene(hunt, hunt.sceneIndex + 1);
  else if (hunt.phase === 'victory') startGame(hunt);
}

export function togglePause(hunt) {
  if (hunt.phase === 'play') hunt.phase = 'paused';
  else if (hunt.phase === 'paused') hunt.phase = 'play';
}

export function tick(hunt, dt) {
  if (hunt.phase !== 'play') return;
  hunt.timeLeft -= dt;
  if (hunt.timeLeft <= 0) {
    hunt.timeLeft = 0;
    finishScene(hunt, true);
  }
}

export function totalFound(hunt) {
  const finished = hunt.foundCounts.reduce((n, c) => n + c, 0);
  // Once a scene is finished, its found set is already counted in foundCounts;
  // only count the live set while the scene is still being played.
  return hunt.phase === 'play' || hunt.phase === 'paused' ? finished + hunt.found.size : finished;
}
