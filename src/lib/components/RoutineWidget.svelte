<script>
  import { store, todayKey, calculateStreak } from '$lib/stores.js';
  import { dndzone } from 'svelte-dnd-action';

  $: routines = $store.routines;
  $: checks   = $store.routineChecks;
  $: done     = routines.filter(r => {
    const c = checks[r.id];
    return typeof c === 'string' ? c === todayKey() : c?.[todayKey()];
  }).length;
  $: pct      = routines.length ? (done / routines.length) * 100 : 0;
  let showForm = false;
  let draft = '';
  let draftColor = '#22c55e';
  const COLORS = ['#22c55e', '#06b6d4', '#f97316', '#eab308', '#ec4899', '#a855f7'];
  const FLIP_MS = 180;

  function toggle(id) {
    store.update(s => {
      const c = { ...s.routineChecks };
      const today = todayKey();
      
      // migrate old format to new format
      if (typeof c[id] === 'string') {
        c[id] = { [c[id]]: true };
      }
      
      // toggle today
      if (!c[id]) c[id] = {};
      if (c[id][today]) {
        delete c[id][today];
        if (Object.keys(c[id]).length === 0) delete c[id];
      } else {
        c[id] = { ...c[id], [today]: true };
      }
      
      return { ...s, routineChecks: c };
    });
  }

  function addRoutine() {
    const text = draft.trim();
    if (!text) return;
    store.update(s => ({
      ...s,
      routines: [...s.routines, { id: Date.now(), text, color: draftColor || COLORS[s.routines.length % COLORS.length] }],
    }));
    draft = '';
    draftColor = '#22c55e';
    showForm = false;
  }

  function handleConsider(e) {
    store.update(s => ({ ...s, routines: e.detail.items }));
  }

  function handleFinalize(e) {
    store.update(s => ({ ...s, routines: e.detail.items }));
  }
</script>

<div class="wrap">
  <div class="header">
    <div class="label">routine</div>
    <button class="add-btn" on:click={() => showForm = !showForm}>+</button>
  </div>
  <div class="prog-row">
    <div class="bar"><div class="fill" style="width:{pct}%"></div></div>
    <span class="prog-txt">{done}/{routines.length}</span>
  </div>
  {#if showForm}
    <div class="form">
      <input class="inp" bind:value={draft} placeholder="add a routine..." on:keydown={e => e.key === 'Enter' && addRoutine()} />
      <input class="color" type="color" bind:value={draftColor} aria-label="routine color" />
      <button class="fbtn" on:click={addRoutine}>add</button>
    </div>
  {/if}
  <div
    class="list"
    use:dndzone={{
      items: routines,
      flipDurationMs: FLIP_MS,
      dragDisabled: false,
      idKey: 'id',
      dropTargetStyle: { outline: 'none', background: 'transparent', boxShadow: 'none' }
    }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
  >
    {#if routines.length === 0}
      <div class="empty">no routines yet — add in settings</div>
    {/if}
    {#each routines as r (r.id)}
      {@const c = checks[r.id]}
      {@const isDone = typeof c === 'string' ? c === todayKey() : c?.[todayKey()]}
      {@const streak = calculateStreak(r.id, checks)}
      <button class="item" class:done={isDone} on:click={() => toggle(r.id)}>
        <div class="box" style={`--accent:${r.color || '#22c55e'}`}>{isDone ? '✓' : ''}</div>
        <span class="rtxt">{r.text}</span>
        {#if streak > 0}
          <span class="streak" style={`color:${r.color || '#22c55e'}`}>{streak} 🔥</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
.wrap  { display: flex; flex-direction: column; height: 100%; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.label { font-size: 12px; color: var(--muted2); }
.add-btn {
  background: none; border: none; color: var(--muted2);
  font-size: 20px; line-height: 1; padding: 0;
}
.add-btn:hover { color: var(--text); }
.prog-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.bar  { flex: 1; height: 2px; background: var(--s3); border-radius: 2px; overflow: hidden; }
.fill { height: 100%; background: var(--text); border-radius: 2px; transition: width .3s; }
.prog-txt { font-size: 12px; color: var(--muted2); white-space: nowrap; min-width: 30px; text-align: right; }

.form { display: flex; gap: 8px; margin-bottom: 12px; }
.inp {
  flex: 1; background: var(--s2); border: 1px solid var(--border);
  border-radius: 8px; padding: 9px 10px;
  color: var(--text); font-size: 14px; outline: none;
}
.inp:focus { border-color: var(--border2); }
.fbtn {
  background: var(--text); border: none; border-radius: 8px;
  padding: 9px 14px; color: var(--bg); font-size: 14px; font-weight: 600;
}
.color {
  width: 38px; height: 38px; padding: 0;
  border: none; background: transparent;
}

.list  { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.empty { font-size: 13px; color: var(--muted2); }

.item {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; padding: 0;
  color: inherit; text-align: left;
  cursor: pointer;
}
.streak {
  font-size: 13px;
  font-weight: 600;
  margin-left: auto;
  opacity: 0.9;
}
.box {
  width: 18px; height: 18px;
  border: 1px solid var(--accent, var(--border2)); border-radius: 999px;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  font-size: 10px; transition: all .15s;
}
.item.done .box { background: var(--accent, var(--text)); border-color: var(--accent, var(--text)); color: var(--bg); }
.rtxt { font-size: 15px; transition: color .15s; }
.item.done .rtxt { color: var(--muted2); text-decoration: line-through; }

:global(#dnd-action-dragged-el) {
  outline: none !important;
  box-shadow: none !important;
}
:global(.dnd-drop-target) {
  outline: none !important;
}
:global(.list *),
:global(.list *:hover),
:global(.list *:active),
:global(.list *:focus),
:global(.list *:focus-visible) {
  cursor: pointer !important;
}
</style>
