<script>
  import { store } from '$lib/stores.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let weeks = [];
  let total = 0;
  let state = 'idle'; // idle | loading | error | done
  let hover = null;
  let offline = false;
  const CACHE_KEY = 'pawtabs:github-contribs';

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function localDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function prettyDate(key) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${DAYS[date.getDay()]} ${date.getDate()} ${MONS[date.getMonth()]} ${date.getFullYear()}`;
  }

  function tooltipText(day) {
    return `${day.count} commit${day.count === 1 ? '' : 's'} on ${prettyDate(day.date)}`;
  }

  function applyContrib(contrib) {
    total = contrib.reduce((s, d) => s + d.count, 0);

    const byDate = new Map(contrib.map(d => [d.date, d]));
    const todayKey = localDateKey(new Date());
    const end = new Date(contrib[contrib.length - 1].date);
    const sunday = new Date(end);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(sunday.getDate() - sunday.getDay());

    weeks = Array.from({ length: 7 }, (_, weekIdx) => {
      const start = new Date(sunday);
      start.setDate(start.getDate() - (7 * (6 - weekIdx)));

      return Array.from({ length: 7 }, (_, dayIdx) => {
        const date = new Date(start);
        date.setDate(start.getDate() + dayIdx);
        const key = localDateKey(date);
        if (key > todayKey) return null;
        return byDate.get(key) ?? { count: 0, level: 0, date: key };
      });
    });
  }

  function showHover(day, el) {
    const rect = el.getBoundingClientRect();
    const pad = 8;
    const width = 240;
    const x = Math.max(pad, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - pad));
    const y = Math.max(pad, rect.top - 42);
    hover = {
      label: tooltipText(day),
      level: day.level ?? 0,
      x,
      y,
    };
  }

  $: username = $store.gh;
  $: if (username) load(username);

  async function load(u) {
    state = 'loading';
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${u}?y=last`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const contrib = data.contributions ?? [];
      if (!contrib.length) throw new Error();
      applyContrib(contrib);
      offline = false;
      if (browser) localStorage.setItem(CACHE_KEY, JSON.stringify({ u, contrib }));
      state = 'done';
    } catch {
      if (browser) {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          const parsed = cached ? JSON.parse(cached) : null;
          if (parsed?.u === u && Array.isArray(parsed.contrib) && parsed.contrib.length) {
            applyContrib(parsed.contrib);
            offline = true;
            state = 'done';
            return;
          }
        } catch {}
      }
      state = 'error';
    }
  }

  onMount(() => {
    if (browser && !navigator.onLine) offline = true;
    if (username) load(username);
    const onOnline = () => { offline = false; if (username) load(username); };
    const onOffline = () => { offline = true; if (username) load(username); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  });
</script>

<div class="wrap">
  {#if !username}
    <div class="ph">no username — <button on:click={() => document.dispatchEvent(new CustomEvent('open-settings', { detail: 'gh' }))}>set username</button></div>
  {:else if state === 'loading'}
    <div class="ph">loading...</div>
  {:else if state === 'error'}
    <div class="ph">failed — <button on:click={() => load(username)}>retry</button></div>
  {:else if state === 'done'}
    <div class="graph" class:offline={offline} role="presentation" on:mouseleave={() => hover = null}>
      {#if offline}
        <div class="offline-badge">offline</div>
      {/if}
      {#if hover}
        <div class="tooltip active" data-level={hover.level} style={`left:${hover.x}px; top:${hover.y}px;`}>
          {hover.label}
        </div>
      {/if}
      <div class="grid">
        {#each weeks as week}
          <div class="col">
            {#each week as day}
              {#if day}
                <button
                  type="button"
                  class="sq"
                  data-level={day.level ?? 0}
                  on:mouseenter={(e) => showHover(day, e.currentTarget)}
                  on:focus={(e) => showHover(day, e.currentTarget)}
                  on:blur={() => hover = null}
                  aria-label={day.date ? tooltipText(day) : 'empty day'}
                ></button>
              {:else}
                <button type="button" class="sq empty" aria-hidden="true" tabindex="-1"></button>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
.wrap { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.ph { font-size: 12px; color: var(--muted2); padding: 8px 0; }
.ph button {
  background: none; border: none; color: var(--muted);
  text-decoration: underline; font-size: 12px; padding: 0;
}
.graph { flex: 1; display: flex; min-height: 0; overflow: visible; position: relative; }
.graph.offline {
  filter: grayscale(1);
  opacity: 0.82;
}
.offline-badge {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 12;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--muted2);
  background: rgba(9, 9, 11, 0.8);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 8px;
}
.tooltip {
  position: fixed;
  z-index: 10;
  padding: 7px 10px;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: rgba(9, 9, 11, 0.98);
  color: var(--text);
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity .15s, transform .15s;
  transform: translateY(-4px);
}
.tooltip.active { opacity: 1; transform: translateY(0); }
.tooltip[data-level="1"] { border-color: var(--gh1); }
.tooltip[data-level="2"] { border-color: var(--gh2); }
.tooltip[data-level="3"] { border-color: var(--gh3); }
.tooltip[data-level="4"] { border-color: var(--gh4); }
.grid {
  display: flex;
  gap: 4px;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.col {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  overflow: visible;
}
.sq   {
  width: 100%;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  border-radius: 4px;
  background: var(--gh0);
  transition: transform .15s, opacity .15s;
  outline: none;
  border: none;
  padding: 0;
  appearance: none;
  cursor: default;
}
.sq:hover,
.sq:focus-visible {
  transform: scale(1.05);
}
.sq.empty {
  background: transparent;
  pointer-events: none;
}
.sq:focus-visible {
  box-shadow: 0 0 0 2px rgba(250, 250, 250, 0.15);
}
.sq[data-level="1"] { background: var(--gh1); }
.sq[data-level="2"] { background: var(--gh2); }
.sq[data-level="3"] { background: var(--gh3); }
.sq[data-level="4"] { background: var(--gh4); }
</style>
