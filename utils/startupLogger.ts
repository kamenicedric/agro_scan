const STARTUP_KEY = '__AGROSCAN_STARTUP_T0__';
type GlobalWithStartup = typeof globalThis & { [STARTUP_KEY]?: number };

const globalWithStartup = globalThis as GlobalWithStartup;

if (typeof globalWithStartup[STARTUP_KEY] !== 'number') {
  globalWithStartup[STARTUP_KEY] = Date.now();
}

const startupT0 = globalWithStartup[STARTUP_KEY] ?? Date.now();

export function markStartup(step: string, meta?: Record<string, unknown>) {
  if (!__DEV__) return;
  const deltaMs = Date.now() - startupT0;
  const tag = `[Startup +${deltaMs}ms] ${step}`;
  if (meta) {
    console.log(tag, meta);
    return;
  }
  console.log(tag);
}

export function getStartupElapsedMs() {
  return Date.now() - startupT0;
}
