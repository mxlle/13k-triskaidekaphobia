export function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function areArraysEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((item, index) => item === arr2[index])
  );
}

export function areArraysEqualIgnoreOrder(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.sort().every((item, index) => item === arr2.sort()[index])
  );
}

export function getArrayIntersection(arr1, arr2) {
  return arr1.filter((item) => arr2.includes(item));
}
