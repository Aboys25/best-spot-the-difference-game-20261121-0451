// Staged states for the screenshots: fixed, repeatable, no clock, no storage.
// Each shot is a moment of real play, frozen: a scene mid-hunt with some
// differences already ringed, some still hiding, and the counter showing how
// many are left — the same view the player sees, just staged so the screenshot
// is identical every time it is taken.

function stagePlay(hunt, sceneIndex, foundIds, timeLeft, score, message, crosshair) {
  hunt.phase = 'play';
  hunt.sceneIndex = sceneIndex;
  hunt.found = new Set(foundIds);
  hunt.foundCounts = hunt.scenes.map((scene, i) => (i < sceneIndex ? scene.differences.length : 0));
  hunt.hintsLeft = 3;
  hunt.timeLeft = timeLeft;
  hunt.score = score;
  hunt.sceneBonus = 0;
  hunt.timeUp = false;
  hunt.hint = null;
  hunt.flash = null;
  hunt.message = message;
  hunt.crosshair = crosshair;
  hunt.best = 0;
}

export function stageShot(hunt, name) {
  if (name === 'cover') {
    // Harbour, three found, four still hiding, crosshair hovering over the
    // lighthouse bands.
    stagePlay(hunt, 0, ['moon-shape', 'gull-count', 'lantern-lit'], 154, 300,
      'Found the lantern! 4 left.', { x: 475, y: 240 });
  } else if (name === 'market') {
    // Night Market, four found, five still hiding.
    stagePlay(hunt, 1, ['awning-stripes', 'fruit-colour', 'hat-colour', 'bicycle-present'], 121, 700,
      'Found the bicycle! 5 left.', { x: 400, y: 255 });
  } else if (name === 'garden') {
    // Garden Morning, five found, six still hiding.
    stagePlay(hunt, 2, ['sun-rays', 'bird-present', 'fountain-flow', 'dog-present', 'stones-count'], 96, 1500,
      'Found the stepping stone! 6 left.', { x: 480, y: 200 });
  } else if (name === 'end') {
    // All three scenes complete: the victory screen over the finished garden.
    // The clock and hints match the garden shot, so the story adds up:
    // 154 + 121 + 96 seconds of bonuses on top of 27 finds at 100 points.
    hunt.phase = 'victory';
    hunt.sceneIndex = 2;
    hunt.found = new Set(hunt.scenes[2].differences.map((d) => d.id));
    hunt.foundCounts = [7, 9, 11];
    hunt.hintsLeft = 3;
    hunt.timeLeft = 96;
    hunt.score = 3071;
    hunt.sceneBonus = 96;
    hunt.timeUp = false;
    hunt.hint = null;
    hunt.flash = null;
    hunt.message = 'You found them all!';
    hunt.crosshair = { x: 296, y: 256 };
    hunt.best = 0;
  }
  return name;
}
