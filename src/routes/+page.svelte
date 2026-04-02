<script>
  import '../app.css';
  import { dndzone, TRIGGERS } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { store } from '$lib/stores.js';
  import ClockWidget    from '$lib/components/ClockWidget.svelte';
  import SearchWidget   from '$lib/components/SearchWidget.svelte';
  import FocusWidget    from '$lib/components/FocusWidget.svelte';
  import ReminderWidget from '$lib/components/ReminderWidget.svelte';
  import GithubWidget   from '$lib/components/GithubWidget.svelte';
  import RoutineWidget  from '$lib/components/RoutineWidget.svelte';
  import TodoWidget     from '$lib/components/TodoWidget.svelte';
  import LinksWidget    from '$lib/components/LinksWidget.svelte';
  import SettingsModal  from '$lib/components/SettingsModal.svelte';
  import { onMount } from 'svelte';

  // Widget definitions: colSpan, rowSpan, label
  const DEFS = {
    clock:    { col: 1, row: 1, label: 'Clock', bgVariants: ['dark', 'light'] },
    search:   { col: 2, row: 1, label: 'Search', variants: { '1x1': { col: 1, row: 1 }, '2x1': { col: 2, row: 1 } } },
    focus:    { col: 2, row: 1, label: 'Focus', variants: { '1x1': { col: 1, row: 1 }, '2x1': { col: 2, row: 1 } } },
    reminder: { col: 1, row: 1, label: 'Reminder', variants: { '1x1': { col: 1, row: 1 }, '2x1': { col: 2, row: 1 } } },
    github:   { col: 1, row: 1, label: 'GitHub' },
    routine:  { col: 2, row: 2, label: 'Routine', variants: { '2x1': { col: 2, row: 1 }, '2x2': { col: 2, row: 2 } } },
    todo:     { col: 1, row: 2, label: 'To Do', variants: { '1x1': { col: 1, row: 1 }, '2x1': { col: 2, row: 1 }, '1x2': { col: 1, row: 2 }, '2x2': { col: 2, row: 2 } } },
    links:    { col: 1, row: 2, label: 'Links', variants: { '1x1': { col: 1, row: 1 }, '1x2': { col: 1, row: 2 }, '1x3': { col: 1, row: 3 } } },
  };

  const COLS = 5;
  const CELL = 230; // px per cell
  const GAP  = 8;

  let editMode = false;
  let settingsOpen = false;
  let settingsSection = '';
  let mounted = false;

  // widgets is our reactive order list, synced with store
  let widgets = $store.widgetOrder ?? Object.keys(DEFS).map(id => ({ id }));

  // sync store → local (only on init)
  $: if ($store.widgetOrder) widgets = $store.widgetOrder;

  function saveOrder() {
    store.update(s => ({ ...s, widgetOrder: widgets }));
  }

  function resetLayout() {
    widgets = Object.keys(DEFS).map(id => ({
      id,
      variant:
        id === 'links' ? '1x2'
        : id === 'search' ? '2x1'
        : id === 'focus' ? '2x1'
        : id === 'reminder' ? '1x1'
        : id === 'todo' ? '1x2'
        : id === 'routine' ? '2x2'
        : undefined,
    }));
    saveOrder();
  }

  function handleConsider(e) { widgets = e.detail.items; }
  function handleFinalize(e) { widgets = e.detail.items; saveOrder(); }

  // listen for github settings event from GithubWidget
  onMount(() => {
    mounted = true;
    document.addEventListener('open-settings', (e) => {
      settingsSection = e.detail ?? '';
      settingsOpen = true;
    });
  });

  const FLIP_MS = 200;
</script>

{#if mounted}
  <!-- TOP BAR -->
  <div class="topbar">
    <button
      class="tbtn edit-btn"
      class:active={editMode}
      on:click={() => { editMode = !editMode; if (!editMode) saveOrder(); }}
    >
      {editMode ? '✓ done' : '⠿ edit layout'}
    </button>
    {#if editMode}
      <button class="tbtn" on:click={resetLayout}>reset</button>
    {/if}
    <button class="tbtn" on:click={() => { settingsSection = ''; settingsOpen = true; }}>
      settings
    </button>
  </div>

  <!-- BENTO GRID -->
  <main>
    <div
      class="bento"
      class:edit={editMode}
      style="grid-template-columns: repeat({COLS}, {CELL}px);"
      use:dndzone={{ items: widgets, flipDurationMs: FLIP_MS, dragDisabled: !editMode, dropTargetStyle: {} }}
      on:consider={handleConsider}
      on:finalize={handleFinalize}
    >
      {#each widgets as w (w.id)}
        {@const def = DEFS[w.id]}
        {@const variant = def?.variants?.[w.variant] ?? def}
        <div
          class="cell"
          class:github-cell={w.id === 'github'}
          class:links-cell={w.id === 'links'}
          animate:flip={{ duration: FLIP_MS }}
          style="grid-column: span {variant?.col ?? 1}; grid-row: span {variant?.row ?? 1};"
        >
          {#if editMode}
            {#if w.id === 'links'}
              <div class="edit-overlay links-overlay">
                <div class="links-title">
                  <span class="drag-handle">⠿</span>
                  <span class="widget-name">{def?.label ?? w.id}</span>
                </div>
              </div>
            {:else}
              <div class="edit-overlay">
                <span class="drag-handle">⠿</span>
                <span class="widget-name">{def?.label ?? w.id}</span>
              </div>
            {/if}
            {#if w.id === 'clock'}
              <div class="variant-picker" role="group" aria-label="Clock background">
                <button class="variant-btn" class:active={(w.bgVariant ?? 'dark') === 'dark'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'clock' ? { ...item, bgVariant: 'dark' } : item);
                  saveOrder();
                }}>dark</button>
                <button class="variant-btn" class:active={(w.bgVariant ?? 'dark') === 'light'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'clock' ? { ...item, bgVariant: 'light' } : item);
                  saveOrder();
                }}>light</button>
              </div>
            {/if}
            {#if w.id === 'focus'}
              <div class="variant-picker" role="group" aria-label="Focus size">
                <button class="variant-btn" class:active={(w.variant ?? '2x1') === '1x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'focus' ? { ...item, variant: '1x1' } : item);
                  saveOrder();
                }}>1x1</button>
                <button class="variant-btn" class:active={(w.variant ?? '2x1') === '2x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'focus' ? { ...item, variant: '2x1' } : item);
                  saveOrder();
                }}>2x1</button>
              </div>
            {/if}
            {#if w.id === 'search'}
              <div class="variant-picker" role="group" aria-label="Search size">
                <button class="variant-btn" class:active={(w.variant ?? '1x1') === '1x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'search' ? { ...item, variant: '1x1' } : item);
                  saveOrder();
                }}>1x1</button>
                <button class="variant-btn" class:active={(w.variant ?? '1x1') === '2x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'search' ? { ...item, variant: '2x1' } : item);
                  saveOrder();
                }}>2x1</button>
              </div>
            {/if}
            {#if w.id === 'reminder'}
              <div class="variant-picker" role="group" aria-label="Reminder size">
                <button class="variant-btn" class:active={(w.variant ?? '1x1') === '1x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'reminder' ? { ...item, variant: '1x1' } : item);
                  saveOrder();
                }}>1x1</button>
                <button class="variant-btn" class:active={(w.variant ?? '1x1') === '2x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'reminder' ? { ...item, variant: '2x1' } : item);
                  saveOrder();
                }}>2x1</button>
              </div>
            {/if}
            {#if w.id === 'todo'}
              <div class="variant-picker" role="group" aria-label="To Do size">
                <button class="variant-btn" class:active={(w.variant ?? '1x2') === '1x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'todo' ? { ...item, variant: '1x1' } : item);
                  saveOrder();
                }}>1x1</button>
                <button class="variant-btn" class:active={(w.variant ?? '1x2') === '2x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'todo' ? { ...item, variant: '2x1' } : item);
                  saveOrder();
                }}>2x1</button>
                <button class="variant-btn" class:active={(w.variant ?? '1x2') === '1x2'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'todo' ? { ...item, variant: '1x2' } : item);
                  saveOrder();
                }}>1x2</button>
                <button class="variant-btn" class:active={(w.variant ?? '1x2') === '2x2'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'todo' ? { ...item, variant: '2x2' } : item);
                  saveOrder();
                }}>2x2</button>
              </div>
            {/if}
            {#if w.id === 'routine'}
              <div class="variant-picker" role="group" aria-label="Routine size">
                <button class="variant-btn" class:active={(w.variant ?? '2x2') === '2x1'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'routine' ? { ...item, variant: '2x1' } : item);
                  saveOrder();
                }}>2x1</button>
                <button class="variant-btn" class:active={(w.variant ?? '2x2') === '2x2'} on:click|stopPropagation={() => {
                  widgets = widgets.map(item => item.id === 'routine' ? { ...item, variant: '2x2' } : item);
                  saveOrder();
                }}>2x2</button>
              </div>
            {/if}
            {#if w.id === 'links'}
              <div class="variant-picker" role="group" aria-label="Links size">
                <button
                  class="variant-btn"
                  class:active={(w.variant ?? '1x2') === '1x1'}
                  on:click|stopPropagation={() => {
                    widgets = widgets.map(item => item.id === 'links' ? { ...item, variant: '1x1' } : item);
                    saveOrder();
                  }}
                >1x1</button>
                <button
                  class="variant-btn"
                  class:active={(w.variant ?? '1x2') === '1x2'}
                  on:click|stopPropagation={() => {
                    widgets = widgets.map(item => item.id === 'links' ? { ...item, variant: '1x2' } : item);
                    saveOrder();
                  }}
                >1x2</button>
                <button
                  class="variant-btn"
                  class:active={(w.variant ?? '1x2') === '1x3'}
                  on:click|stopPropagation={() => {
                    widgets = widgets.map(item => item.id === 'links' ? { ...item, variant: '1x3' } : item);
                    saveOrder();
                  }}
                >1x3</button>
              </div>
            {/if}
          {/if}

          <div class="widget-content" class:blurred={editMode}>
            {#if w.id === 'clock'}
              <ClockWidget variant={w.bgVariant ?? 'dark'} />
            {:else if w.id === 'focus'}
              <FocusWidget />
            {:else if w.id === 'search'}
              <SearchWidget autoFocus={$store.searchFocusOnOpen ?? true} variant={w.variant ?? '1x1'} />
            {:else if w.id === 'reminder'}
              <ReminderWidget />
            {:else if w.id === 'github'}
              <GithubWidget />
            {:else if w.id === 'routine'}
              <RoutineWidget />
            {:else if w.id === 'todo'}
              <TodoWidget />
            {:else if w.id === 'links'}
              <LinksWidget variant={w.variant ?? '1x2'} />
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </main>

  <!-- SETTINGS -->
  <SettingsModal
    bind:open={settingsOpen}
    initialSection={settingsSection}
    on:close={() => settingsOpen = false}
  />
{/if}

<style>
main {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  padding: 52px 32px 180px;
  overflow: hidden;
}

.bento {
  display: grid;
  grid-auto-rows: 230px;
  gap: 8px;
  margin-bottom: 160px;
}

.cell {
  background: var(--s1);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px;
  overflow: hidden;
  position: relative;
  transition: border-color .2s;
}
.cell.github-cell { overflow: visible; }

/* edit mode */
.bento.edit .cell {
  border-color: var(--border2);
  cursor: grab;
}
.bento.edit .cell:active { cursor: grabbing; }

.edit-overlay {
  position: absolute; inset: 0;
  z-index: 10;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(9,9,11,.6);
  pointer-events: none;
  flex-direction: column;
  padding: 14px;
}
.links-overlay {
  justify-content: flex-start;
}
.links-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.drag-handle { font-size: 22px; color: var(--muted); }
.drag-handle { cursor: pointer; }
.widget-name { font-size: 14px; font-weight: 500; color: var(--text); }

.variant-picker {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: inline-flex;
  gap: 6px;
  pointer-events: auto;
  z-index: 30;
}
.variant-btn {
  background: var(--s2);
  border: 1px solid var(--border);
  color: var(--muted2);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1;
}
.variant-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.cell.links-cell .edit-overlay { justify-content: flex-start; }

.widget-content { height: 100%; transition: filter .2s; }
.widget-content.blurred { filter: blur(1px); pointer-events: none; }

/* TOP BAR */
.topbar {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: flex-end;
  gap: 8px; padding: 14px 22px; z-index: 100;
}
.tbtn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 16px;
  color: var(--muted2); font-size: 13px;
  transition: all .15s;
}
.tbtn:hover { border-color: var(--border2); color: var(--text); }
.tbtn.edit-btn.active {
  background: var(--text); color: var(--bg);
  border-color: var(--text);
}
</style>
