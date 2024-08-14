export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForPromiseAndTime(promise, ms) {
  return Promise.all([promise, sleep(ms)]);
}
