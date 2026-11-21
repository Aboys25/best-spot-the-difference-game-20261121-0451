// The three scenes and their differences. Coordinates are in panel space: each
// picture panel is 592 by 512, and a difference's circle (x, y, r) is where a
// click counts and where the found ring is drawn. The circles never overlap, so
// a click can only ever mean one difference. Each difference is a change the
// painter can draw two ways: the left panel always shows the base scene, the
// right panel shows the changed one. Nothing here is random: the same scene
// always draws the same way.

export const SCENES = [
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    tagline: '7 differences hide where the day meets the sea',
    palette: {
      skyTop: '#1d2340',
      skyMid: '#4a3a63',
      skyLow: '#e8915a',
      sea: '#22466e',
      seaDark: '#16304e',
      pier: '#6b4a2f',
      pierDark: '#54371f',
      lighthouse: '#f2ede0',
      band: '#d84a3a',
      beam: '#f7d774',
    },
    differences: [
      { id: 'moon-shape', x: 90, y: 70, r: 36, label: 'the moon' },
      { id: 'flag-direction', x: 475, y: 48, r: 28, label: 'the flag' },
      { id: 'gull-count', x: 350, y: 120, r: 30, label: 'a gull' },
      { id: 'lighthouse-bands', x: 475, y: 240, r: 40, label: 'a lighthouse band' },
      { id: 'sail-colour', x: 170, y: 350, r: 42, label: 'the sail' },
      { id: 'cat-present', x: 95, y: 385, r: 30, label: 'the cat' },
      { id: 'lantern-lit', x: 560, y: 400, r: 30, label: 'the lantern' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: '9 differences hide between the lanterns',
    palette: {
      skyTop: '#141a2e',
      skyMid: '#232c4a',
      skyLow: '#3a2f52',
      stallWood: '#7a5230',
      stallDark: '#5d3d22',
      awningRed: '#c8442f',
      awningCream: '#f2e3c2',
      fruitRed: '#d84a3a',
      fruitGreen: '#7cb342',
      lantern: '#e5534b',
      lanternGlow: '#f7b733',
    },
    differences: [
      { id: 'moon-present', x: 500, y: 70, r: 32, label: 'the moon' },
      { id: 'bulb-out', x: 250, y: 80, r: 22, label: 'a string bulb' },
      { id: 'awning-stripes', x: 160, y: 180, r: 40, label: 'the awning' },
      { id: 'hat-colour', x: 300, y: 250, r: 28, label: 'the hat' },
      { id: 'lantern-count', x: 400, y: 255, r: 26, label: 'a lantern' },
      { id: 'fruit-colour', x: 120, y: 300, r: 36, label: 'the apples' },
      { id: 'cat-pose', x: 200, y: 300, r: 30, label: 'the cat' },
      { id: 'basket-full', x: 90, y: 455, r: 32, label: 'the basket' },
      { id: 'bicycle-present', x: 530, y: 440, r: 40, label: 'the bicycle' },
    ],
  },
  {
    id: 'garden',
    name: 'Garden Morning',
    tagline: '11 differences hide in the morning garden',
    palette: {
      skyTop: '#a8d8ea',
      skyMid: '#cfecc9',
      skyLow: '#fff3c4',
      lawn: '#7cbf5a',
      lawnDark: '#5da244',
      hedge: '#4e8a3a',
      fountain: '#7cc4e8',
      fountainDark: '#4a9ac8',
      bench: '#8a5a2e',
      benchDark: '#6b4423',
      petals: '#e86a92',
    },
    differences: [
      { id: 'sun-rays', x: 90, y: 70, r: 38, label: 'the sun' },
      { id: 'cloud-missing', x: 400, y: 90, r: 30, label: 'a cloud' },
      { id: 'butterfly-count', x: 450, y: 140, r: 24, label: 'a butterfly' },
      { id: 'apple-count', x: 480, y: 200, r: 30, label: 'an apple' },
      { id: 'bird-present', x: 120, y: 210, r: 26, label: 'the bird' },
      { id: 'fountain-flow', x: 296, y: 330, r: 40, label: 'the fountain' },
      { id: 'cushion-present', x: 485, y: 330, r: 32, label: 'the cushion' },
      { id: 'can-tipped', x: 360, y: 400, r: 30, label: 'the watering can' },
      { id: 'tulip-colour', x: 140, y: 420, r: 28, label: 'a tulip' },
      { id: 'dog-present', x: 210, y: 450, r: 36, label: 'the dog' },
      { id: 'stones-count', x: 300, y: 470, r: 26, label: 'a stepping stone' },
    ],
  },
];

/** Total differences across all three scenes: 7 + 9 + 11. */
export const TOTAL_DIFFERENCES = SCENES.reduce((n, scene) => n + scene.differences.length, 0);
