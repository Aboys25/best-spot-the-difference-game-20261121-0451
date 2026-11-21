// The three scenes, drawn procedurally on canvas: no images, no network, the
// same scene every time. Each painter draws one picture panel in 592x512 panel
// space. `changed` is false for the left panel (the base scene) and true for
// the right panel (every difference applied). A difference is always one small,
// designed change to one element: a colour, a count, a pose, a presence.

import { circle, ellipse, line, polygon, rect, ring, roundRect, star, text } from './drawShapes.js';

const PANEL_W = 592;
const PANEL_H = 512;

function clipPanel(ctx, panel) {
  ctx.save();
  ctx.translate(panel.x, panel.y);
  ctx.beginPath();
  ctx.rect(0, 0, PANEL_W, PANEL_H);
  ctx.clip();
}

function skyGradient(ctx, palette, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, bottom);
  g.addColorStop(0, palette.skyTop);
  g.addColorStop(0.55, palette.skyMid);
  g.addColorStop(1, palette.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, bottom);
}

function drawStars(ctx, stars) {
  for (const [x, y, r] of stars) circle(ctx, x, y, r, 'rgba(255,255,240,0.9)');
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * scale, 16 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 22 * scale, y + 5 * scale, 22 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 24 * scale, y + 5 * scale, 24 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGull(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 4, y - 8, x, y);
  ctx.quadraticCurveTo(x + 4, y - 8, x + 12, y);
  ctx.stroke();
}

// ---------------------------------------------------------------- harbour

const HARBOUR_STARS = [
  [30, 30, 2], [150, 24, 2], [210, 44, 1.6], [270, 26, 2], [330, 52, 1.6], [410, 30, 2],
  [470, 90, 1.6], [530, 40, 2], [60, 120, 1.6], [180, 110, 2], [250, 140, 1.6], [430, 150, 2],
  [520, 130, 1.6], [120, 170, 1.6], [300, 180, 2], [560, 180, 1.6], [40, 200, 2], [200, 200, 1.6],
];

function drawHarbourSky(ctx, palette, changed) {
  skyGradient(ctx, palette, 280);
  drawStars(ctx, HARBOUR_STARS);
  // The moon: a crescent in the base scene, a full disc in the changed one.
  if (changed) {
    circle(ctx, 90, 70, 30, '#f7e8b0');
    circle(ctx, 80, 62, 5, '#e8d28a');
    circle(ctx, 100, 78, 4, '#e8d28a');
  } else {
    circle(ctx, 90, 70, 30, '#f7e8b0');
    circle(ctx, 102, 62, 26, palette.skyMid);
  }
  drawCloud(ctx, 240, 70, 1, 'rgba(240,230,220,0.28)');
  drawCloud(ctx, 400, 110, 0.8, 'rgba(240,230,220,0.22)');
  // A dark headland on the horizon, left.
  polygon(ctx, [[0, 280], [0, 252], [60, 238], [130, 258], [200, 250], [230, 280]], '#1a2033');
}

function drawHarbourSea(ctx, palette) {
  rect(ctx, 0, 280, PANEL_W, 232, palette.sea);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 4; row += 1) {
    const y = 310 + row * 36;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 16) {
      const yy = y + Math.sin(x * 0.03 + row * 1.7) * 4;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Moonlight shimmering on the water, under the moon.
  ctx.fillStyle = 'rgba(247,232,176,0.35)';
  for (let i = 0; i < 6; i += 1) ctx.fillRect(70 + (i % 2) * 22, 300 + i * 20, 26 - i * 2, 4);
}

function drawHarbourPier(ctx, palette) {
  rect(ctx, 0, 440, PANEL_W, 72, palette.pier);
  rect(ctx, 0, 440, PANEL_W, 6, palette.pierDark);
  ctx.strokeStyle = palette.pierDark;
  ctx.lineWidth = 2;
  for (let x = 48; x < PANEL_W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 446);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
}

function drawLighthouse(ctx, palette, changed) {
  const x = 450;
  // Tower: white with red bands; the changed scene drops the middle band.
  polygon(ctx, [[x, 440], [x + 8, 96], [x + 42, 96], [x + 50, 440]], palette.lighthouse);
  ctx.fillStyle = palette.band;
  ctx.fillRect(x + 3, 150, 44, 30);
  if (!changed) ctx.fillRect(x + 5, 230, 40, 30);
  ctx.fillRect(x + 7, 310, 36, 30);
  // Gallery and lamp room.
  rect(ctx, x - 2, 84, 54, 12, '#2b3040');
  rect(ctx, x + 8, 58, 34, 28, '#f7d774');
  polygon(ctx, [[x + 4, 58], [x + 25, 34], [x + 46, 58]], '#2b3040');
  // The beam, sweeping left over the sea.
  ctx.fillStyle = 'rgba(247,215,116,0.18)';
  polygon(ctx, [[x + 8, 72], [x - 260, 40], [x - 260, 130], [x + 8, 84]]);
  // The flag: left in the base scene, right in the changed one.
  line(ctx, x + 25, 34, x + 25, 12, 3, '#2b3040');
  if (changed) polygon(ctx, [[x + 25, 12], [x + 52, 19], [x + 25, 26]], palette.band);
  else polygon(ctx, [[x + 25, 12], [x - 2, 19], [x + 25, 26]], palette.band);
}

function drawHarbourBoats(ctx, palette, changed) {
  // The near boat: red sail in the base scene, teal in the changed one.
  polygon(ctx, [[110, 380], [230, 380], [210, 404], [130, 404]], '#5d3d22');
  line(ctx, 170, 380, 170, 306, 4, '#3a2a18');
  polygon(ctx, [[170, 310], [170, 372], [214, 372]], changed ? '#2e8b8b' : '#d84a3a');
  // The far boat: a small grey-blue sail, never a difference.
  polygon(ctx, [[300, 322], [372, 322], [356, 340], [316, 340]], '#4a5568');
  line(ctx, 336, 322, 336, 282, 3, '#2b3040');
  polygon(ctx, [[336, 284], [336, 318], [362, 318]], '#7c8ba0');
  // Reflections.
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(130, 412, 80, 3);
  ctx.fillRect(316, 346, 40, 3);
}

function drawHarbourDetails(ctx, palette, changed) {
  // Gulls: three in the base scene, two in the changed one.
  drawGull(ctx, 320, 110, '#f2f0e6');
  if (!changed) drawGull(ctx, 350, 120, '#f2f0e6');
  drawGull(ctx, 382, 104, '#f2f0e6');
  // Crates on the pier, and the cat sitting on them (absent when changed).
  rect(ctx, 58, 408, 40, 32, '#8a5a2e');
  rect(ctx, 100, 408, 40, 32, '#7a4e26');
  line(ctx, 58, 424, 98, 424, 2, '#5d3d22');
  line(ctx, 100, 424, 140, 424, 2, '#5d3d22');
  if (!changed) {
    ellipse(ctx, 95, 392, 16, 12, '#2b2b33');
    circle(ctx, 104, 376, 9, '#2b2b33');
    polygon(ctx, [[98, 370], [100, 360], [104, 368]], '#2b2b33');
    polygon(ctx, [[106, 368], [110, 360], [112, 370]], '#2b2b33');
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 398);
    ctx.quadraticCurveTo(68, 388, 76, 378);
    ctx.stroke();
  }
  // The pier lantern: lit in the base scene, dark in the changed one.
  line(ctx, 560, 440, 560, 382, 4, '#2b3040');
  if (changed) {
    roundRect(ctx, 548, 382, 24, 26, 4, '#4a4a55');
  } else {
    circle(ctx, 560, 395, 26, 'rgba(247,183,51,0.30)');
    roundRect(ctx, 548, 382, 24, 26, 4, '#f7b733');
    circle(ctx, 560, 395, 7, '#fff3c4');
  }
}

export function paintHarbour(ctx, panel, scene, changed) {
  clipPanel(ctx, panel);
  const palette = scene.palette;
  drawHarbourSky(ctx, palette, changed);
  drawHarbourSea(ctx, palette);
  drawHarbourPier(ctx, palette);
  drawLighthouse(ctx, palette, changed);
  drawHarbourBoats(ctx, palette, changed);
  drawHarbourDetails(ctx, palette, changed);
  ctx.restore();
}

// ---------------------------------------------------------------- market

const MARKET_BULBS = [40, 85, 130, 175, 220, 265, 310, 355, 400, 445, 490, 535];

function drawMarketSky(ctx, palette, changed) {
  skyGradient(ctx, palette, 220);
  drawStars(ctx, [[40, 30, 2], [120, 44, 1.6], [200, 26, 2], [280, 50, 1.6], [360, 30, 2], [440, 44, 1.6], [560, 30, 2], [80, 90, 1.6], [340, 90, 1.6]]);
  if (!changed) {
    circle(ctx, 500, 70, 26, '#f7e8b0');
    circle(ctx, 492, 62, 5, '#e8d28a');
    circle(ctx, 508, 76, 4, '#e8d28a');
  }
  // String lights across the top, sagging between the poles.
  ctx.strokeStyle = '#0f1220';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.quadraticCurveTo(296, 116, 592, 56);
  ctx.stroke();
  for (const x of MARKET_BULBS) {
    const t = x / PANEL_W;
    const y = 56 + 4 * 60 * t * (1 - t) + 8;
    const out = changed && x === 250;
    if (out) {
      // A dead bulb: dark, with a faint outline so it can still be spotted.
      circle(ctx, x, y + 8, 6, '#3a3f52');
      ring(ctx, x, y + 8, 7, 2, '#6a7086');
    } else {
      circle(ctx, x, y + 8, 11, 'rgba(247,183,51,0.25)');
      circle(ctx, x, y + 8, 6, '#f7b733');
    }
  }
}

function drawAwning(ctx, x, y, w, stripeA, stripeB) {
  const stripes = 6;
  for (let i = 0; i < stripes; i += 1) {
    rect(ctx, x + (i * w) / stripes, y, w / stripes, 58, i % 2 === 0 ? stripeA : stripeB);
  }
  rect(ctx, x, y + 58, w, 6, '#2b3040');
}

function drawStall(ctx, palette, x, awningA, awningB) {
  drawAwning(ctx, x, 150, 240, awningA, awningB);
  line(ctx, x + 8, 214, x + 8, 330, 5, '#2b3040');
  line(ctx, x + 232, 214, x + 232, 330, 5, '#2b3040');
  rect(ctx, x, 330, 240, 70, palette.stallWood);
  rect(ctx, x, 330, 240, 8, palette.stallDark);
  ctx.strokeStyle = palette.stallDark;
  ctx.lineWidth = 2;
  for (let px = x + 40; px < x + 240; px += 40) {
    ctx.beginPath();
    ctx.moveTo(px, 338);
    ctx.lineTo(px, 400);
    ctx.stroke();
  }
}

function drawMarketLanterns(ctx, changed) {
  const spots = [80, 160, 240, 320, 400, 480];
  for (const x of spots) {
    if (changed && x === 400) continue;
    ellipse(ctx, x, 258, 16, 20, '#e5534b');
    rect(ctx, x - 6, 236, 12, 6, '#f7b733');
    line(ctx, x, 278, x, 290, 2, '#f7b733');
    ellipse(ctx, x, 258, 7, 12, 'rgba(247,183,51,0.55)');
  }
}

function drawMarketFruit(ctx, palette, changed) {
  // Left pile: red apples in the base scene, green in the changed one. A small
  // leaf on top keeps the pile reading as fruit rather than a flower.
  const colour = changed ? palette.fruitGreen : palette.fruitRed;
  for (const [dx, dy] of [[-22, 0], [0, -8], [22, 0], [-11, -16], [11, -16], [0, -26]]) {
    circle(ctx, 120 + dx, 318 + dy, 11, colour);
  }
  ellipse(ctx, 120, 286, 8, 4, '#5da244');
  line(ctx, 120, 288, 120, 280, 2, '#6b4423');
  // Right pile: oranges, never a difference.
  for (const [dx, dy] of [[-22, 0], [0, -8], [22, 0], [-11, -16], [11, -16], [0, -26]]) {
    circle(ctx, 430 + dx, 318 + dy, 11, '#e8913a');
  }
  ellipse(ctx, 430, 286, 8, 4, '#5da244');
  line(ctx, 430, 288, 430, 280, 2, '#6b4423');
}

function drawMarketCat(ctx, changed) {
  if (changed) {
    // Lying down: a long low body, head at the right.
    ellipse(ctx, 200, 322, 26, 9, '#2b2b33');
    circle(ctx, 224, 316, 9, '#2b2b33');
    polygon(ctx, [[218, 310], [220, 300], [224, 308]], '#2b2b33');
    polygon(ctx, [[226, 308], [230, 300], [232, 310]], '#2b2b33');
  } else {
    // Sitting up: upright body, head high.
    ellipse(ctx, 196, 312, 13, 18, '#2b2b33');
    circle(ctx, 200, 290, 10, '#2b2b33');
    polygon(ctx, [[193, 283], [195, 272], [199, 281]], '#2b2b33');
    polygon(ctx, [[201, 281], [205, 272], [207, 283]], '#2b2b33');
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(184, 326);
    ctx.quadraticCurveTo(172, 318, 180, 308);
    ctx.stroke();
  }
}

function drawMarketGround(ctx, palette, changed) {
  rect(ctx, 0, 400, PANEL_W, 112, '#3a2f28');
  // The hat on its hook: red in the base scene, yellow in the changed one.
  line(ctx, 300, 214, 300, 232, 3, '#2b3040');
  ellipse(ctx, 300, 244, 26, 7, changed ? '#f2c94c' : '#c8442f');
  ellipse(ctx, 300, 238, 13, 10, changed ? '#f2c94c' : '#c8442f');
  // Baskets: the left one heaped in the base scene, empty in the changed one.
  polygon(ctx, [[64, 480], [116, 480], [108, 440], [72, 440]], '#8a5a2e');
  if (!changed) {
    circle(ctx, 78, 436, 9, '#d84a3a');
    circle(ctx, 90, 430, 9, '#e8913a');
    circle(ctx, 102, 436, 9, '#7cb342');
  }
  polygon(ctx, [[444, 480], [496, 480], [488, 440], [452, 440]], '#8a5a2e');
  circle(ctx, 458, 436, 9, '#d84a3a');
  circle(ctx, 470, 430, 9, '#e8913a');
  circle(ctx, 482, 436, 9, '#7cb342');
  // The bicycle: present in the base scene, absent in the changed one.
  if (!changed) {
    ring(ctx, 505, 462, 16, 3, '#c8ccd8');
    ring(ctx, 555, 462, 16, 3, '#c8ccd8');
    line(ctx, 505, 462, 528, 436, 3, '#c8ccd8');
    line(ctx, 555, 462, 528, 436, 3, '#c8ccd8');
    line(ctx, 528, 436, 540, 436, 3, '#c8ccd8');
    line(ctx, 505, 462, 540, 462, 3, '#c8ccd8');
  }
}

export function paintMarket(ctx, panel, scene, changed) {
  clipPanel(ctx, panel);
  const palette = scene.palette;
  drawMarketSky(ctx, palette, changed);
  drawStall(ctx, palette, 40, changed ? '#2e8b8b' : palette.awningRed, palette.awningCream);
  drawStall(ctx, palette, 320, palette.awningRed, palette.awningCream);
  drawMarketLanterns(ctx, changed);
  drawMarketFruit(ctx, palette, changed);
  drawMarketCat(ctx, changed);
  drawMarketGround(ctx, palette, changed);
  ctx.restore();
}

// ---------------------------------------------------------------- garden

function drawGardenSky(ctx, palette, changed) {
  skyGradient(ctx, palette, 220);
  // The sun: rays in the base scene, a plain disc in the changed one.
  if (!changed) {
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      line(ctx, 90 + Math.cos(a) * 40, 70 + Math.sin(a) * 40, 90 + Math.cos(a) * 54, 70 + Math.sin(a) * 54, 4, '#f2c94c');
    }
  }
  circle(ctx, 90, 70, 30, '#f7d774');
  drawCloud(ctx, 250, 80, 1, 'rgba(255,255,255,0.9)');
  if (!changed) drawCloud(ctx, 400, 90, 0.9, 'rgba(255,255,255,0.9)');
  drawCloud(ctx, 520, 60, 0.7, 'rgba(255,255,255,0.85)');
  // The hedge, with a bumpy top so it reads as bushes rather than a wall.
  rect(ctx, 0, 200, PANEL_W, 60, palette.hedge);
  for (const x of [40, 120, 200, 280, 360, 440, 520, 580]) {
    circle(ctx, x, 202, 26, palette.hedge);
  }
  ellipse(ctx, 480, 190, 70, 55, '#5da244');
  rect(ctx, 474, 240, 12, 40, '#6b4423');
  const apples = [[448, 170], [470, 150], [495, 168], [455, 195], [500, 195], [480, 200]];
  for (let i = 0; i < apples.length; i += 1) {
    if (changed && i === 5) continue;
    circle(ctx, apples[i][0], apples[i][1], 7, '#d84a3a');
  }
}

function drawGardenLawn(ctx, palette) {
  rect(ctx, 0, 260, PANEL_W, 252, palette.lawn);
  for (let i = 0; i < 6; i += 1) {
    if (i % 2 === 0) rect(ctx, 0, 260 + i * 42, PANEL_W, 42, 'rgba(255,255,255,0.05)');
  }
}

function drawFountain(ctx, palette, changed) {
  ellipse(ctx, 296, 356, 74, 22, '#c8ccd8');
  ellipse(ctx, 296, 352, 62, 16, palette.fountain);
  rect(ctx, 290, 300, 12, 52, '#c8ccd8');
  ellipse(ctx, 296, 300, 20, 7, '#c8ccd8');
  if (!changed) {
    ctx.strokeStyle = palette.fountainDark;
    ctx.lineWidth = 3;
    for (const [dx, peak] of [[-26, 306], [-12, 296], [0, 292], [12, 296], [26, 306]]) {
      ctx.beginPath();
      ctx.moveTo(296 + dx * 0.4, 300);
      ctx.quadraticCurveTo(296 + dx, peak, 296 + dx * 1.5, 344);
      ctx.stroke();
    }
    circle(ctx, 270, 340, 3, palette.fountainDark);
    circle(ctx, 296, 336, 3, palette.fountainDark);
    circle(ctx, 322, 340, 3, palette.fountainDark);
  }
}

function drawGardenFlowers(ctx, changed) {
  // Left bed: tulips; one is red in the base scene, yellow in the changed one.
  for (let i = 0; i < 5; i += 1) {
    const x = 96 + i * 22;
    line(ctx, x, 452, x, 424, 3, '#3e7a2e');
    const colour = changed && i === 2 ? '#f2c94c' : i % 2 === 0 ? '#e86a92' : '#d84a3a';
    polygon(ctx, [[x - 8, 424], [x - 8, 410], [x, 402], [x + 8, 410], [x + 8, 424]], colour);
  }
  // Right bed: daisies, never a difference.
  for (let i = 0; i < 5; i += 1) {
    const x = 420 + i * 22;
    line(ctx, x, 452, x, 424, 3, '#3e7a2e');
    circle(ctx, x, 414, 8, '#f2f0e6');
    circle(ctx, x, 414, 3, '#f2c94c');
  }
}

function drawBench(ctx, palette, changed) {
  rect(ctx, 430, 306, 110, 12, palette.bench);
  rect(ctx, 430, 326, 110, 12, palette.benchDark);
  rect(ctx, 438, 338, 10, 26, palette.benchDark);
  rect(ctx, 522, 338, 10, 26, palette.benchDark);
  if (!changed) roundRect(ctx, 442, 296, 86, 12, 5, '#c8442f');
}

function drawBirdhouse(ctx, changed) {
  line(ctx, 120, 300, 120, 236, 5, '#6b4423');
  rect(ctx, 96, 196, 48, 44, '#8a5a2e');
  polygon(ctx, [[90, 198], [120, 176], [150, 198]], '#a03d2a');
  circle(ctx, 120, 220, 8, '#2b2118');
  if (!changed) {
    ellipse(ctx, 120, 176, 10, 7, '#4a7ab8');
    circle(ctx, 126, 170, 5, '#4a7ab8');
    polygon(ctx, [[122, 178], [126, 186], [130, 178]], '#4a7ab8');
  }
}

function drawButterfly(ctx, x, y, colour) {
  ellipse(ctx, x - 7, y, 8, 5, colour);
  ellipse(ctx, x + 7, y, 8, 5, colour);
  line(ctx, x, y - 4, x, y + 5, 2, '#2b2b33');
}

function drawGardenCreatures(ctx, changed) {
  drawButterfly(ctx, 150, 150, '#e86a92');
  drawButterfly(ctx, 260, 110, '#f2c94c');
  drawButterfly(ctx, 350, 170, '#7c5cd6');
  if (!changed) drawButterfly(ctx, 450, 140, '#e86a92');
  // The dog, lying on the lawn: present in the base scene, absent when changed.
  if (!changed) {
    ellipse(ctx, 210, 452, 34, 13, '#b08954');
    circle(ctx, 240, 442, 11, '#b08954');
    polygon(ctx, [[234, 434], [236, 424], [240, 432]], '#8a6a3a');
    ellipse(ctx, 178, 448, 12, 6, '#8a6a3a');
  }
}

function drawGardenPath(ctx, changed) {
  // The watering can: upright in the base scene, tipped in the changed one.
  if (changed) {
    ctx.save();
    ctx.translate(360, 400);
    ctx.rotate(1.1);
    rect(ctx, -14, -10, 28, 20, '#5a7a9a');
    rect(ctx, 12, -4, 22, 5, '#5a7a9a');
    ctx.restore();
    circle(ctx, 392, 424, 3, '#4a9ac8');
    circle(ctx, 398, 434, 3, '#4a9ac8');
    circle(ctx, 386, 436, 3, '#4a9ac8');
  } else {
    rect(ctx, 346, 388, 28, 22, '#5a7a9a');
    line(ctx, 374, 394, 392, 388, 4, '#5a7a9a');
    line(ctx, 346, 392, 336, 382, 4, '#5a7a9a');
  }
  // Stepping stones: five in the base scene, four in the changed one.
  const stones = [[268, 428], [296, 452], [324, 428], [288, 486], [318, 486]];
  for (let i = 0; i < stones.length; i += 1) {
    if (changed && i === 3) continue;
    ellipse(ctx, stones[i][0], stones[i][1], 18, 9, '#c8ccd8');
  }
}

export function paintGarden(ctx, panel, scene, changed) {
  clipPanel(ctx, panel);
  const palette = scene.palette;
  drawGardenSky(ctx, palette, changed);
  drawGardenLawn(ctx, palette);
  drawFountain(ctx, palette, changed);
  drawGardenFlowers(ctx, changed);
  drawBench(ctx, palette, changed);
  drawBirdhouse(ctx, changed);
  drawGardenCreatures(ctx, changed);
  drawGardenPath(ctx, changed);
  ctx.restore();
}

// ---------------------------------------------------------------- dispatch

export function paintScene(ctx, panel, scene, changed) {
  if (scene.id === 'harbour') paintHarbour(ctx, panel, scene, changed);
  else if (scene.id === 'market') paintMarket(ctx, panel, scene, changed);
  else paintGarden(ctx, panel, scene, changed);
}
