<script>
  import { store } from '$lib/stores.js';
  import { dndzone } from 'svelte-dnd-action';

  let input = '';
  const FLIP_MS = 180;

  function add() {
    const text = input.trim();
    if (!text) return;
    store.update(s => ({
      ...s,
      todos: [{ id: Date.now(), text, done: false }, ...s.todos].slice(0, 80)
    }));
    input = '';
  }

  function toggleDone(id) {
    store.update(s => ({
      ...s,
      todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
  }

  function remove(id) {
    store.update(s => ({ ...s, todos: s.todos.filter(t => t.id !== id) }));
  }

  function handleConsider(e) {
    store.update(s => ({ ...s, todos: e.detail.items }));
  }

  function handleFinalize(e) {
    store.update(s => ({ ...s, todos: e.detail.items }));
  }

  function keydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  }
</script>

<div class="wrap">
  <div class="label">to do</div>
  <textarea
    bind:value={input}
    on:keydown={keydown}
    placeholder="enter to add..."
    rows="2"
  ></textarea>
  <div
    class="list"
    use:dndzone={{
      items: $store.todos,
      flipDurationMs: FLIP_MS,
      dragDisabled: false,
      idKey: 'id',
      dropTargetStyle: { outline: 'none', background: 'transparent', boxShadow: 'none' }
    }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
  >
    {#each $store.todos as t (t.id)}
      <div class="item" class:done={t.done}>
        <button class="chk" on:click={() => toggleDone(t.id)}>{t.done ? '✓' : ''}</button>
        <span class="ttxt">{t.text}</span>
        <span class="drag">⠿</span>
        <button class="del" on:click={() => remove(t.id)}>×</button>
      </div>
    {/each}
  </div>
</div>

<style>
.wrap  { display: flex; flex-direction: column; height: 100%; }
.label { font-size: 12px; color: var(--muted2); margin-bottom: 10px; }

textarea {
  width: 100%; background: var(--s2);
  border: 1px solid var(--border); border-radius: 5px;
  padding: 7px 10px; color: var(--text); font-size: 13px;
  outline: none; resize: none; transition: border-color .15s;
  margin-bottom: 10px; caret-color: var(--text);
}
textarea:focus { border-color: var(--border2); }
textarea::placeholder { color: var(--muted2); }

.list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1; }

.item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}
.item:last-child { border-bottom: none; }
.item.done .ttxt { color: var(--muted2); text-decoration: line-through; }
.drag { color: var(--muted2); font-size: 14px; cursor: pointer; user-select: none; }
.item:hover .drag { color: var(--text); }

.chk {
  width: 15px; height: 15px; flex-shrink: 0; margin-top: 1px;
  border: 1px solid var(--border2); border-radius: 3px;
  background: none; display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: var(--bg); transition: all .15s;
}
.item.done .chk { background: var(--text); border-color: var(--text); }
.ttxt { flex: 1; font-size: 13px; line-height: 1.4; word-break: break-word; }
.del  { background: none; border: none; color: var(--muted2); font-size: 14px; padding: 0; transition: color .15s; flex-shrink: 0; }
.del:hover { color: var(--text); }

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
