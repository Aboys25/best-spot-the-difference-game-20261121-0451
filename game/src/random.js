// A small seeded random number generator: the same seed gives the same numbers,
// which is what makes the screenshot scenes repeatable. Mulberry32, written here
// from the algorithm's definition.

export function createSeededRandom(seed) {
  let state = seed | 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
