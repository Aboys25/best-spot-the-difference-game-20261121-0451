// Assembling the frame: the two picture panels, the markers on found
// differences, the top bar (scene name, how many are left, the clock, the hint
// button) and the bottom bar (found dots, the message, the score), plus the
// title, pause, scene-complete and victory screens. The scenes themselves are
// painted by sceneArt.js; this file only frames them.

import { FIELD, HUD, PALETTE, PANELS } from './config.js';
import { paintScene } from './sceneArt.js';
import { circle, ellipse, line, polygon, rect, ring, roundRect, text } from './drawShapes.js';
import { currentScene, remainingCount, totalFound } from './hunt.js';
import { TOTAL_DIFFERENCES } from './scenes.js';
import { createSeededRandom } from './random.js';

/** Confetti for the victory screen: fixed positions, same every time. */
const VICTORY_CONFETTI = (() => {
  const rand = createSeededRandom(20261121);
  const colours = ['#f2c94c', '#e5534b', '#4fc3f7', '#7cbf5a', '#e86a92'];
  return Array.from({ length: 48 }, () => ({
    x: 60 + rand() * 1160,
    y: 100 + rand() * 500,
    colour: colours[Math.floor(rand() * colours.length)],
    r: 3 + rand() * 4,
  }));
})();

export const HINT_BUTTON = { x: 1088, y: 14, width: 160, height: 44 };

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawPanelBack(ctx, panel) {
  roundRect(ctx, panel.x - 6, panel.y - 6, panel.width + 12, panel.height + 12, 10, PALETTE.frame);
  rect(ctx, panel.x, panel.y, panel.width, panel.height, PALETTE.backdrop);
}

function drawPanelFront(ctx, panel, tag) {
  ctx.strokeStyle = PALETTE.panelLine;
  ctx.lineWidth = 2;
  ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
  roundRect(ctx, panel.x + 10, panel.y + 10, 74, 26, 6, 'rgba(20,22,29,0.75)');
  text(ctx, tag, panel.x + 47, panel.y + 29, 15, PALETTE.text, 'center', 'middle');
}

function drawMarkers(ctx, panel, hunt, now) {
  const scene = currentScene(hunt);
  for (const diff of scene.differences) {
    if (!hunt.found.has(diff.id)) continue;
    const x = panel.x + diff.x;
    const y = panel.y + diff.y;
    ring(ctx, x, y, diff.r + 6, 5, PALETTE.foundRing);
    ring(ctx, x, y, diff.r + 12, 2, 'rgba(229,83,75,0.5)');
    circle(ctx, x, y, 4, PALETTE.gold);
  }
  if (hunt.hint && now < hunt.hint.until) {
    const pulse = 3 + Math.sin(now * 8) * 2;
    ring(ctx, panel.x + hunt.hint.x, panel.y + hunt.hint.y, hunt.hint.r + 10 + pulse, 4, PALETTE.hintRing);
  }
  if (hunt.flash && now < hunt.flash.until) {
    if (hunt.flash.kind === 'found') {
      const age = hunt.flash.until - now;
      ring(ctx, panel.x + hunt.flash.x, panel.y + hunt.flash.y, 14 + (0.9 - age) * 40, 4, PALETTE.gold);
    } else {
      const x = panel.x + hunt.flash.x;
      const y = panel.y + hunt.flash.y;
      line(ctx, x - 12, y - 12, x + 12, y + 12, 5, PALETTE.foundRing);
      line(ctx, x + 12, y - 12, x - 12, y + 12, 5, PALETTE.foundRing);
    }
  }
}

function drawCrosshair(ctx, panel, crosshair) {
  const x = panel.x + crosshair.x;
  const y = panel.y + crosshair.y;
  ctx.strokeStyle = PALETTE.crosshair;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, x - 20, y, x - 8, y, 2, PALETTE.crosshair);
  line(ctx, x + 8, y, x + 20, y, 2, PALETTE.crosshair);
  line(ctx, x, y - 20, x, y - 8, 2, PALETTE.crosshair);
  line(ctx, x, y + 8, x, y + 20, 2, PALETTE.crosshair);
}

function drawHud(ctx, hunt) {
  rect(ctx, 0, 0, FIELD.width, HUD.height, PALETTE.bar);
  const scene = currentScene(hunt);
  text(ctx, `${hunt.sceneIndex + 1} · ${scene.name}`, 32, 30, 24, PALETTE.text);
  text(ctx, scene.tagline, 32, 56, 14, PALETTE.muted);
  const left = remainingCount(hunt);
  text(ctx, `${left}`, 640, 46, 44, PALETTE.gold, 'center', 'middle');
  text(ctx, 'LEFT', 640, 66, 13, PALETTE.muted, 'center', 'middle');
  const low = hunt.timeLeft <= 30;
  text(ctx, formatTime(hunt.timeLeft), 1064, 40, 30, low ? PALETTE.foundRing : PALETTE.text, 'right', 'middle');
  roundRect(ctx, HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.width, HINT_BUTTON.height, 8, '#2b3040');
  text(ctx, `Hint (${hunt.hintsLeft})`, HINT_BUTTON.x + 80, HINT_BUTTON.y + 29, 18, PALETTE.text, 'center', 'middle');
}

function drawBottom(ctx, hunt) {
  rect(ctx, 0, HUD.bottomY, FIELD.width, HUD.bottomHeight, PALETTE.bar);
  const scene = currentScene(hunt);
  text(ctx, 'FOUND', 32, HUD.bottomY + 30, 13, PALETTE.muted);
  scene.differences.forEach((diff, i) => {
    const x = 32 + i * 24 + 8;
    const y = HUD.bottomY + 58;
    if (hunt.found.has(diff.id)) circle(ctx, x, y, 7, PALETTE.gold);
    else ring(ctx, x, y, 7, 2, PALETTE.muted);
  });
  text(ctx, hunt.message, 640, HUD.bottomY + 46, 18, PALETTE.text, 'center', 'middle');
  text(ctx, `Scene ${hunt.sceneIndex + 1}/3`, 1248, HUD.bottomY + 30, 16, PALETTE.muted, 'right', 'middle');
  text(ctx, `Score ${hunt.score}`, 1248, HUD.bottomY + 58, 16, PALETTE.text, 'right', 'middle');
}

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(10,11,16,${alpha})`;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
}

function overlayCard(ctx, y, height) {
  roundRect(ctx, 290, y, 700, height, 16, 'rgba(29,33,44,0.96)');
  ctx.strokeStyle = PALETTE.frame;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(290, y, 700, height, 16);
  ctx.stroke();
}

function drawTitle(ctx, hunt) {
  dim(ctx, 0.55);
  overlayCard(ctx, 150, 400);
  text(ctx, 'SPOT THE', 640, 240, 64, PALETTE.text, 'center', 'middle');
  text(ctx, 'DIFFERENCE', 640, 310, 64, PALETTE.gold, 'center', 'middle');
  text(ctx, 'Harbour · Market · Garden — 27 hidden differences', 640, 368, 20, PALETTE.muted, 'center', 'middle');
  text(ctx, 'Click a difference in either picture. Arrows move the', 640, 420, 18, PALETTE.text, 'center', 'middle');
  text(ctx, 'crosshair, Space clicks it. H hint · P pause · R restart', 640, 448, 18, PALETTE.text, 'center', 'middle');
  if (hunt.best > 0) text(ctx, `Best score: ${hunt.best}`, 640, 496, 18, PALETTE.gold, 'center', 'middle');
  text(ctx, 'Click anywhere or press Space to play', 640, 524, 18, PALETTE.text, 'center', 'middle');
}

function drawSceneDone(ctx, hunt) {
  dim(ctx, 0.45);
  overlayCard(ctx, 210, 280);
  const scene = currentScene(hunt);
  text(ctx, hunt.timeUp ? 'Time up!' : 'Scene complete!', 640, 290, 40, PALETTE.gold, 'center', 'middle');
  text(ctx, `${scene.name} — you found ${hunt.found.size} of ${scene.differences.length}`, 640, 348, 20, PALETTE.text, 'center', 'middle');
  if (!hunt.timeUp) text(ctx, `Time bonus +${hunt.sceneBonus} · Score ${hunt.score}`, 640, 388, 20, PALETTE.text, 'center', 'middle');
  else text(ctx, `Score ${hunt.score}`, 640, 388, 20, PALETTE.text, 'center', 'middle');
  text(ctx, 'Click or press Space for the next scene', 640, 448, 18, PALETTE.muted, 'center', 'middle');
}

function drawVictory(ctx, hunt) {
  dim(ctx, 0.45);
  for (const piece of VICTORY_CONFETTI) circle(ctx, piece.x, piece.y, piece.r, piece.colour);
  overlayCard(ctx, 180, 340);
  text(ctx, 'You found them all!', 640, 262, 44, PALETTE.gold, 'center', 'middle');
  text(ctx, `${totalFound(hunt)} of ${TOTAL_DIFFERENCES} differences across 3 scenes`, 640, 322, 20, PALETTE.text, 'center', 'middle');
  text(ctx, `Final score ${hunt.score}`, 640, 362, 24, PALETTE.text, 'center', 'middle');
  if (hunt.newBest) {
    text(ctx, 'New best score!', 640, 402, 20, PALETTE.gold, 'center', 'middle');
  } else if (hunt.best > 0) {
    text(ctx, `Best score ${hunt.best}`, 640, 402, 20, PALETTE.muted, 'center', 'middle');
  }
  text(ctx, 'Click or press Space to play again', 640, 472, 18, PALETTE.muted, 'center', 'middle');
}

function drawPaused(ctx) {
  dim(ctx, 0.6);
  text(ctx, 'Paused', 640, 330, 48, PALETTE.text, 'center', 'middle');
  text(ctx, 'Press P or click to continue', 640, 388, 20, PALETTE.muted, 'center', 'middle');
}

export function createPainter(canvas) {
  const ctx = canvas.getContext('2d');

  function draw(hunt, now) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    rect(ctx, 0, 0, FIELD.width, FIELD.height, PALETTE.backdrop);
    const scene = currentScene(hunt);
    drawPanelBack(ctx, PANELS.left);
    drawPanelBack(ctx, PANELS.right);
    paintScene(ctx, PANELS.left, scene, false);
    paintScene(ctx, PANELS.right, scene, true);
    drawMarkers(ctx, PANELS.left, hunt, now);
    drawMarkers(ctx, PANELS.right, hunt, now);
    drawPanelFront(ctx, PANELS.left, 'LEFT');
    drawPanelFront(ctx, PANELS.right, 'RIGHT');
    if (hunt.phase === 'play') {
      drawCrosshair(ctx, PANELS.left, hunt.crosshair);
      drawCrosshair(ctx, PANELS.right, hunt.crosshair);
    }
    drawHud(ctx, hunt);
    drawBottom(ctx, hunt);
    if (hunt.phase === 'title') drawTitle(ctx, hunt);
    else if (hunt.phase === 'sceneDone') drawSceneDone(ctx, hunt);
    else if (hunt.phase === 'victory') drawVictory(ctx, hunt);
    else if (hunt.phase === 'paused') drawPaused(ctx);
  }

  return { draw };
}
