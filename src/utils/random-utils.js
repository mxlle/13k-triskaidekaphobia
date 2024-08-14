/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
export function shuffleArray(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function getRandomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
