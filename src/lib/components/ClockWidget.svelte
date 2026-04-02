<script>
  import { onMount, onDestroy } from 'svelte';

  export let variant = 'dark';

  const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  let hDeg = 0, mDeg = 0, sDeg = 0;
  let timeStr = '00:00';
  let dateStr = '—';
  let canvas;
  let interval;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    hDeg = ((h % 12) + m / 60) * 30;
    mDeg = (m + s / 60) * 6;
    sDeg = s * 6;
    timeStr = `${pad(h)}:${pad(m)}`;
    dateStr = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  }

  function drawTicks() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 60, cy = 60, r = 54;
    ctx.clearRect(0, 0, 120, 120);

    const tickColor = variant === 'dark' ? 'rgba(82,82,91,.9)' : 'rgba(160,160,170,.9)';
    const minorTickColor = variant === 'dark' ? 'rgba(39,39,42,.9)' : 'rgba(200,200,210,.9)';
    const numberColor = variant === 'dark' ? 'rgba(161,161,170,.85)' : 'rgba(63,63,70,.85)';

    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const maj = i % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5));
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.strokeStyle = maj ? tickColor : minorTickColor;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    ctx.font = '600 10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = numberColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let n = 1; n <= 12; n++) {
      const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
      const nr = r - 18;
      ctx.fillText(String(n), cx + Math.cos(a) * nr, cy + Math.sin(a) * nr);
    }
  }

  onMount(() => {
    drawTicks();
    tick();
    interval = setInterval(tick, 1000);
  });

  onDestroy(() => clearInterval(interval));

  $: if (canvas && variant) drawTicks();
</script>

<div class="clock-cell">
  <div class="analog-wrap">
    <div class="face" class:light={variant === 'light'}>
      <canvas bind:this={canvas} width="120" height="120" class="ticks"></canvas>
      <div class="hand hour" class:light={variant === 'light'} style="transform: rotate({hDeg}deg)"></div>
      <div class="hand min"  class:light={variant === 'light'} style="transform: rotate({mDeg}deg)"></div>
      <div class="hand sec" class:light={variant === 'light'} style="transform: rotate({sDeg}deg)"></div>
      <div class="dot" class:light={variant === 'light'}></div>
    </div>
  </div>
  <div class="dtime">{timeStr}</div>
  <div class="ddate">{dateStr}</div>
</div>

<style>
.clock-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
}
.analog-wrap { width: 120px; height: 120px; position: relative; flex-shrink: 0; }
.face {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--s2);
  position: relative;
  transition: background .2s, border-color .2s;
}
.face.light {
  background: #fff;
  border-color: rgba(0,0,0,.12);
}
.ticks {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  border-radius: 50%;
}
.hand {
  position: absolute;
  bottom: 50%; left: 50%;
  transform-origin: bottom center;
  border-radius: 999px;
}
.hour  { width: 5px; height: 32px; background: #ef4444; margin-left: -2.5px; }
.hour.light { background: #dc2626; }
.min   { width: 5px; height: 42px; background: var(--text); margin-left: -2.5px; opacity: .5; }
.min.light { background: #52525b; opacity: .7; }
.sec   { width: 1px;   height: 48px; background: var(--muted); margin-left: -.5px; }
.sec.light { background: #a1a1aa; }
.dot {
  position: absolute; top: 50%; left: 50%;
  width: 6px; height: 6px;
  background: var(--text); border-radius: 50%;
  transform: translate(-50%, -50%); z-index: 10;
}
.dot.light { background: #ef4444; }
.dtime { font-size: 26px; font-weight: 600; letter-spacing: -.5px; color: var(--text); }
.ddate { font-size: 12px; color: var(--muted2); }
</style>
