<script>
  import { store } from '$lib/stores.js';

  function update(e) {
    store.update(s => ({ ...s, focus: e.target.value }));
  }
</script>

<div class="wrap">
  <div class="label">focus</div>
  <textarea
    value={$store.focus}
    on:input={update}
    placeholder="hari ini gw harus..."
    spellcheck="false"
  ></textarea>
</div>

<style>
.wrap { display: flex; flex-direction: column; height: 100%; }
.label { font-size: 12px; color: var(--muted2); margin-bottom: 10px; }
textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.65;
  resize: none;
  caret-color: var(--text);
  font-family: 'Geist', sans-serif;
}
textarea::placeholder { color: var(--muted2); }
</style>
