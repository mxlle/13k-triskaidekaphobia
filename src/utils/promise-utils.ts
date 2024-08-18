export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForPromiseAndTime(promise: Promise<unknown>, ms: number) {
  return Promise.all([promise, sleep(ms)]);
}
