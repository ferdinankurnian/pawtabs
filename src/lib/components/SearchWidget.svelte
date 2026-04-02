<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  export let autoFocus = false;
  export let variant = '1x1';

  let query = '';
  let inputEl;

  function submit() {
    const q = query.trim();
    if (!q) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    if (browser) window.open(url, '_blank', 'noopener,noreferrer');
  }

  function keydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  }

  onMount(() => {
    if (autoFocus && inputEl) {
      requestAnimationFrame(() => inputEl.focus());
    }
  });
</script>

<div class="wrap" class:h1={variant === '1x1'} class:h2={variant === '2x1'}>
  <div class="header">
    <div class="label">search</div>
  </div>

  <div class="body">
    <input
      bind:this={inputEl}
      bind:value={query}
      class="inp"
      placeholder="search the web..."
      spellcheck="false"
      on:keydown={keydown}
    />
    <button class="btn" on:click={submit}>go</button>
  </div>
</div>

<style>
.wrap { display: flex; flex-direction: column; height: 100%; }
.header { display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.label { font-size: 12px; color: var(--muted2); letter-spacing: .08em; text-transform: lowercase; }
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
.wrap.h1 .body { justify-content: center; }
.wrap.h2 .body { justify-content: center; }
.inp {
  width: 100%;
  background: var(--s2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text);
  font-size: 15px;
  outline: none;
}
.inp:focus { border-color: var(--border2); }
.inp::placeholder { color: var(--muted2); }
.btn {
  background: var(--text);
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--bg);
  font-size: 14px;
  font-weight: 600;
}
</style>
