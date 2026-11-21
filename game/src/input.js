// Keyboard and pointer input. The canvas is drawn at the fixed field size and
// scaled by CSS, so pointer coordinates are converted from the element's box
// back into field coordinates. Arrow keys move the crosshair, Space or Enter
// clicks where it points, H spends a hint, P pauses, R restarts the scene.

import { FIELD } from './config.js';

const CROSSHAIR_STEP = 16;

export function attachInput(canvas, handlers) {
  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = toField(event);
    handlers.click(point.x, point.y);
  });

  canvas.addEventListener('pointermove', (event) => {
    const point = toField(event);
    handlers.hover(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlers.move(-CROSSHAIR_STEP, 0);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handlers.move(CROSSHAIR_STEP, 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      handlers.move(0, -CROSSHAIR_STEP);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      handlers.move(0, CROSSHAIR_STEP);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handlers.confirm();
    } else if (event.key === 'h' || event.key === 'H') {
      handlers.hint();
    } else if (event.key === 'p' || event.key === 'P') {
      handlers.pause();
    } else if (event.key === 'r' || event.key === 'R') {
      handlers.restart();
    } else if (event.key === 'm' || event.key === 'M') {
      handlers.mute();
    }
  });
}
