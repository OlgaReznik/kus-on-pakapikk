// Browser storage can be unavailable (private mode, sandboxed frames). These wrappers never throw.

function createStore(getBackend) {
  const backend = () => {
    try { return getBackend(); } catch { return null; }
  };
  return {
    get(key) {
      try { return backend()?.getItem(key) ?? null; } catch { return null; }
    },
    set(key, value) {
      try { backend()?.setItem(key, value); } catch { /* storage full or blocked */ }
    },
    remove(key) {
      try { backend()?.removeItem(key); } catch { /* storage blocked */ }
    },
    getJson(key, fallback) {
      try { return JSON.parse(this.get(key)) ?? fallback; } catch { return fallback; }
    },
    setJson(key, value) {
      this.set(key, JSON.stringify(value));
    },
  };
}

export const localStore = createStore(() => window.localStorage);
export const sessionStore = createStore(() => window.sessionStorage);
