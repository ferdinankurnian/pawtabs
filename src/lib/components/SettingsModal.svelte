<script>
  import { browser } from '$app/environment';
  import { store } from '$lib/stores.js';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let initialSection = '';

  let ghInput = '';
  let searchFocusOnOpen = true;
  let remInput = '';
  let routInput = '';
  let routColor = '#22c55e';
  let ghSection;
  const ROUTINE_COLORS = ['#22c55e', '#06b6d4', '#f97316', '#eab308', '#ec4899', '#a855f7'];
  let openedSection = '';
  let prevOpen = false;

  $: if (open && !prevOpen) {
    openedSection = initialSection;
    ghInput = $store.gh || '';
    searchFocusOnOpen = $store.searchFocusOnOpen ?? true;
  }
  $: prevOpen = open;
  function saveGh() {
    store.update(s => ({ ...s, gh: ghInput.trim() }));
    dispatch('close');
  }

  function saveSearchFocus() {
    store.update(s => ({ ...s, searchFocusOnOpen }));
  }

  function addRem() {
    const v = remInput.trim(); if (!v) return;
    store.update(s => ({ ...s, reminders: [...s.reminders, v] }));
    remInput = '';
  }

  function delRem(i) {
    store.update(s => {
      const r = [...s.reminders]; r.splice(i, 1); return { ...s, reminders: r };
    });
  }

  function addRout() {
    const v = routInput.trim(); if (!v) return;
    store.update(s => ({
      ...s,
      routines: [...s.routines, { id: Date.now(), text: v, color: routColor || ROUTINE_COLORS[s.routines.length % ROUTINE_COLORS.length] }],
    }));
    routInput = '';
    routColor = '#22c55e';
  }

  function delRout(i) {
    store.update(s => {
      const routines = [...s.routines];
      const checks = { ...s.routineChecks };
      delete checks[routines[i].id];
      routines.splice(i, 1);
      return { ...s, routines, routineChecks: checks };
    });
  }

  function overlayClick(e) {
    if (e.target === e.currentTarget) dispatch('close');
  }

  function keydown(e) { if (e.key === 'Escape') dispatch('close'); }
  onMount(() => {
    if (!browser) return;
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener('keydown', keydown);
  });
</script>

{#if open}
<div class="overlay" role="presentation" tabindex="-1" on:click={overlayClick}>
  <div class="modal">
    <div class="title">Settings</div>

    <div class="section" bind:this={ghSection}>
      <div class="stitle">GitHub Username</div>
      <div class="row">
        <input class="inp" class:focus-me={openedSection === 'gh'} bind:value={ghInput} placeholder="your github username"
          on:keydown={e => e.key === 'Enter' && saveGh()} />
        <button class="btn" on:click={saveGh}>save</button>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="stitle">Search Widget</div>
      <label class="check">
        <input type="checkbox" bind:checked={searchFocusOnOpen} on:change={saveSearchFocus} />
        <span>focus search input on open</span>
      </label>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="stitle">Reminders</div>
      <div class="list">
        {#each $store.reminders as r, i}
          <div class="li"><span>{r}</span><button on:click={() => delRem(i)}>×</button></div>
        {/each}
      </div>
      <div class="row">
        <input class="inp" bind:value={remInput} placeholder="add a reminder..."
          on:keydown={e => e.key === 'Enter' && addRem()} />
        <button class="btn" on:click={addRem}>add</button>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="stitle">Routine Items</div>
      <div class="list">
        {#each $store.routines as r, i}
          <div class="li">
            <span class="dot" style={`--accent:${r.color || ROUTINE_COLORS[i % ROUTINE_COLORS.length]}`}></span>
            <span class="txt">{r.text}</span>
            <button on:click={() => delRout(i)}>×</button>
          </div>
        {/each}
      </div>
      <div class="row">
        <input class="inp" bind:value={routInput} placeholder="daily habit..."
          on:keydown={e => e.key === 'Enter' && addRout()} />
        <input class="color" type="color" bind:value={routColor} aria-label="routine color" />
        <button class="btn" on:click={addRout}>add</button>
      </div>
    </div>

    <div class="footer">
      <button class="btn sec" on:click={() => dispatch('close')}>close</button>
    </div>
  </div>
</div>
{/if}

<style>
.overlay {
  position: fixed; inset: 0;
  background: rgba(9,9,11,.85); backdrop-filter: blur(6px);
  z-index: 200; display: flex; align-items: center; justify-content: center;
}
.modal {
  background: var(--s1); border: 1px solid var(--border2);
  border-radius: 12px; padding: 26px;
  width: 460px; max-width: 94vw; max-height: 85vh;
  overflow-y: auto; display: flex; flex-direction: column; gap: 20px;
}
.title   { font-size: 19px; font-weight: 600; }
.section { display: flex; flex-direction: column; gap: 8px; }
.stitle  { font-size: 13px; color: var(--muted2); }
.divider { height: 1px; background: var(--border); }
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--muted);
}
.check input { accent-color: var(--text); }

.list { display: flex; flex-direction: column; gap: 4px; max-height: 150px; overflow-y: auto; }
.li {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: var(--muted); padding: 6px 10px;
  background: var(--s2); border-radius: 5px;
}
.txt { flex: 1; }
.dot {
  width: 10px; height: 10px; border-radius: 999px;
  background: var(--accent, var(--text));
  flex: none;
}
.li button {
  background: none; border: none; color: var(--muted2);
  font-size: 15px; padding: 0; transition: color .15s;
}
.li button:hover { color: var(--text); }

.row { display: flex; gap: 6px; }
.inp {
  flex: 1; background: var(--s2); border: 1px solid var(--border);
  border-radius: 5px; padding: 8px 10px;
  color: var(--text); font-size: 14px; outline: none;
  transition: border-color .15s;
}
.inp:focus { border-color: var(--border2); }
.inp.focus-me { border-color: var(--border2); }
.inp::placeholder { color: var(--muted2); }

.btn {
  background: var(--text); border: none; border-radius: 5px;
  padding: 8px 16px; color: var(--bg); font-size: 14px; font-weight: 500;
  white-space: nowrap; transition: opacity .15s;
}
.btn:hover { opacity: .85; }
.btn.sec { background: transparent; border: 1px solid var(--border); color: var(--muted2); }
.btn.sec:hover { border-color: var(--border2); color: var(--text); opacity: 1; }

.color {
  width: 40px; height: 38px; padding: 0;
  border: 1px solid var(--border); border-radius: 5px;
  background: transparent;
}

.footer { display: flex; justify-content: flex-end; padding-top: 4px; border-top: 1px solid var(--border); }
</style>
