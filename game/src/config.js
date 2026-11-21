// Every tuning number, colour and layout constant in one place. The game draws
// on a fixed 1280x720 logical field; the painter scales it to the window, so no
// rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The two picture panels, in field coordinates. */
export const PANELS = {
  left: { x: 32, y: 88, width: 592, height: 512 },
  right: { x: 656, y: 88, width: 592, height: 512 },
  gap: 32,
};

/** The top bar and the bottom bar, in field coordinates. */
export const HUD = { height: 72, bottomY: 616, bottomHeight: 88 };

/** Seconds on the clock when a scene starts. */
export const SCENE_SECONDS = 180;
/** Seconds a wrong click costs. */
export const WRONG_COST_SECONDS = 5;
/** Seconds a hint costs, and how many hints a scene allows. */
export const HINT_COST_SECONDS = 15;
export const HINTS_PER_SCENE = 3;
/** How long a hint ring stays visible, in seconds. */
export const HINT_SHOW_SECONDS = 3;
/** Points for a find, plus one point per second left on the clock at the scene's end. */
export const FIND_POINTS = 100;

/** The fixed step the hunt advances in, in seconds. */
export const STEP = 1 / 60;

/** How far, in panel pixels, a click may land from a difference's centre and count. */
export const CLICK_TOLERANCE = 14;

export const PALETTE = {
  backdrop: '#14161d',
  frame: '#2b3040',
  panelLine: '#3a4157',
  text: '#f2f0e6',
  muted: '#9aa0b4',
  gold: '#f2c94c',
  foundRing: '#e5534b',
  hintRing: '#4fc3f7',
  panelTag: '#20242f',
  bar: '#1d212c',
  crosshair: '#f2c94c',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'spot-the-difference.best';
