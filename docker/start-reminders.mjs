// Waits for the app to come up, then hits /api/reminders once so the
// in-process reminder scheduler is started without a manual page visit.
const url = `http://127.0.0.1:${process.env.PORT || 3000}/api/reminders`;
const attempts = 60;
const delayMs = 2_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (let i = 1; i <= attempts; i++) {
  await sleep(delayMs);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      console.log("[start-reminders] Reminder scheduler started.");
      process.exit(0);
    }
  } catch {
    // Server not ready yet.
  }
}

console.error(`[start-reminders] Could not reach ${url} after ${attempts} attempts.`);
process.exit(1);
