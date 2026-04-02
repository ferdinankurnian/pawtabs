<script>
  import { store } from '$lib/stores.js';

  let idx = 0;
  let fading = false;

  $: reminders = $store.reminders;
  $: current = reminders[idx] ?? 'add reminders in settings';

  function next() {
    if (reminders.length <= 1) return;
    fading = true;
    setTimeout(() => {
      let next;
      do { next = Math.floor(Math.random() * reminders.length); }
      while (next === idx && reminders.length > 1);
      idx = next;
      fading = false;
    }, 200);
  }
</script>

<button class="wrap" on:click={next}>
  <div class="label">reminder</div>
  <div class="text" class:fade={fading}>{current}</div>
  <div class="hint">click to shuffle</div>
</button>

<style>
.wrap {
  display: flex; flex-direction: column; justify-content: space-between;
  height: 100%; width: 100%;
  background: none; border: none; padding: 0;
  text-align: left; color: inherit;
}
.label { font-size: 12px; color: var(--muted2); margin-bottom: 10px; }
.text  { font-size: 14px; color: var(--muted); line-height: 1.65; flex: 1; transition: opacity .2s; }
.text.fade { opacity: 0; }
.hint  { font-size: 11px; color: var(--muted2); margin-top: 8px; }
</style>
