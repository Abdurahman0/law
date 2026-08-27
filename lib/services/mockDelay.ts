// Simulated network latency for the mock service layer. Keeps the UI honest
// about loading/skeleton/optimistic states before the real backend exists.
export function mockDelay(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deterministic-ish jitter so repeated calls don't feel robotic.
export function jitter(base: number, spread = 250): number {
  return base + Math.floor(Math.random() * spread);
}
