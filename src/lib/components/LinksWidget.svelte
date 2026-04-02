<script>
  import { store } from '$lib/stores.js';
  import { dndzone } from 'svelte-dnd-action';

  export let variant = '1x2';

  let showForm = false;
  let name = '', url = '';
  const FLIP_MS = 180;

  $: heightClass = variant === '1x1' ? 'h1' : variant === '1x3' ? 'h3' : 'h2';

  function faviconFor(link) {
    try {
      const host = new URL(link).hostname.replace(/^www\./, '');
      return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
    } catch {
      return '';
    }
  }

  function add() {
    const n = name.trim();
    let u = url.trim();
    if (!n || !u) return;
    if (!u.startsWith('http')) u = 'https://' + u;
    store.update(s => ({ ...s, links: [...s.links, { n, u }] }));
    name = ''; url = '';
    showForm = false;
  }

  function remove(i) {
    store.update(s => {
      const links = [...s.links];
      links.splice(i, 1);
      return { ...s, links };
    });
  }

  function handleConsider(e) {
    store.update(s => ({ ...s, links: e.detail.items }));
  }

  function handleFinalize(e) {
    store.update(s => ({ ...s, links: e.detail.items }));
  }

  function formKey(e) { if (e.key === 'Enter') add(); }
</script>

<div class="wrap" class:h1={heightClass === 'h1'} class:h2={heightClass === 'h2'} class:h3={heightClass === 'h3'}>
  <div class="header">
    <div class="label">links</div>
    <button class="add-btn" on:click={() => showForm = !showForm}>+</button>
  </div>

  {#if showForm}
    <div class="form">
      <input class="fi" bind:value={name} placeholder="name" on:keydown={formKey} />
      <input class="fi" bind:value={url} placeholder="https://..." on:keydown={formKey} />
      <div class="form-btns">
        <button class="fbtn cancel" on:click={() => showForm = false}>cancel</button>
        <button class="fbtn" on:click={add}>add</button>
      </div>
    </div>
  {/if}

  <div
    class="list"
    use:dndzone={{
      items: $store.links,
      flipDurationMs: FLIP_MS,
      dragDisabled: false,
      idKey: 'id',
      dropTargetStyle: { outline: 'none', background: 'transparent', boxShadow: 'none' }
    }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
  >
    {#each $store.links as l, i (l.id)}
      <a class="pill" href={l.u} title={l.u}>
        {#if faviconFor(l.u)}
          <img class="fav" src={faviconFor(l.u)} alt="" loading="lazy" referrerpolicy="no-referrer" />
        {:else}
          <span class="fav fallback"></span>
        {/if}
        <span class="ln">{l.n}</span>
        <span class="drag">⠿</span>
        <button class="del" on:click|preventDefault|stopPropagation={() => remove(i)}>×</button>
      </a>
    {/each}
  </div>
</div>

<style>
.wrap   { display: flex; flex-direction: column; height: 100%; }
.wrap.h1 { overflow: hidden; }
.wrap.h2 { overflow: hidden; }
.wrap.h3 { overflow: hidden; }
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.label  { font-size: 12px; color: var(--muted2); text-align: center; }
.add-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none; border: none; color: var(--muted2);
  font-size: 18px; line-height: 1; padding: 0; transition: color .15s;
}
.add-btn:hover { color: var(--text); }

.form {
  display: flex; flex-direction: column; gap: 5px;
  margin-bottom: 10px; padding: 10px;
  background: var(--s2); border: 1px solid var(--border); border-radius: 6px;
}
.fi {
  background: var(--s3); border: 1px solid var(--border);
  border-radius: 4px; padding: 5px 8px;
  color: var(--text); font-size: 14px; outline: none;
  transition: border-color .15s; width: 100%;
}
.fi:focus { border-color: var(--border2); }
.fi::placeholder { color: var(--muted2); }
.form-btns { display: flex; gap: 5px; justify-content: flex-end; }
.fbtn {
  background: var(--text); border: none; border-radius: 4px;
  padding: 4px 12px; color: var(--bg); font-size: 12px; font-weight: 500;
  transition: opacity .15s;
}
.fbtn:hover { opacity: .85; }
.fbtn.cancel {
  background: transparent; border: 1px solid var(--border); color: var(--muted2);
}
.fbtn.cancel:hover { border-color: var(--border2); color: var(--text); opacity: 1; }

.list { display: flex; flex-direction: column; gap: 1px; overflow-y: auto; flex: 1; }

.pill {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 8px; border-radius: 5px;
  text-decoration: none; color: var(--muted);
  font-size: 15px; transition: background .15s, color .15s;
  position: relative;
  cursor: pointer;
}
.pill:hover { background: var(--s2); color: var(--text); }
.pill:hover .del { opacity: 1; }
.pill:hover .drag { opacity: 1; }
.fav {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  background: var(--s3);
}
.fallback { display: inline-block; }
.ln  { flex: 1; }
.drag {
  opacity: 0;
  color: var(--muted2);
  font-size: 14px;
  cursor: pointer;
}
.del {
  background: none; border: none; color: var(--muted2);
  font-size: 14px; padding: 0; opacity: 0;
  transition: opacity .15s, color .15s;
}
.del:hover { color: var(--text); }

:global(#dnd-action-dragged-el) {
  outline: none !important;
  box-shadow: none !important;
}
:global(.dnd-drop-target) {
  outline: none !important;
}
:global(a.pill),
:global(a.pill:visited),
:global(a.pill:hover),
:global(a.pill:active) {
  cursor: pointer !important;
}
</style>
