import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const DEFAULTS = {
  focus: '',
  searchFocusOnOpen: true,
  routines: [],
  routineChecks: {},
  todos: [],
  links: [
    { e: '✦', n: 'Claude',     u: 'https://claude.ai' },
    { e: '⬡', n: 'GitHub',     u: 'https://github.com' },
    { e: '◈', n: 'Cloudflare', u: 'https://dash.cloudflare.com' },
    { e: '◉', n: 'Neon',       u: 'https://console.neon.tech' },
    { e: '◫', n: 'Figma',      u: 'https://figma.com' },
  ],
  reminders: [
    'minum air dulu bro',
    'udah makan belum?',
    'istirahat 5 menit, mata lo pasti lelah',
    'jangan lupa push ke git',
    'tarik napas. lo udah cukup bagus',
  ],
  gh: '',
  widgetOrder: [
    { id: 'clock', variant: '1x2' },
    { id: 'routine', variant: '2x1' },
    { id: 'github', variant: '1x2' },
    { id: 'links', variant: '1x3' },
    { id: 'search', variant: '2x1' },
    { id: 'todo', variant: '2x2' },
    { id: 'reminder' },
    { id: 'focus', variant: '1x1' },
  ],
};

const ROUTINE_COLORS = ['#22c55e', '#06b6d4', '#f97316', '#eab308', '#ec4899', '#a855f7'];
let idSeq = Date.now();

function uid() {
  idSeq += 1;
  return idSeq;
}

function normalizeRoutine(routine, index = 0) {
  if (typeof routine === 'string') {
    return {
      id: uid(),
      text: routine,
      color: ROUTINE_COLORS[index % ROUTINE_COLORS.length],
    };
  }

  return {
    id: routine.id ?? uid(),
    text: routine.text ?? '',
    color: routine.color ?? ROUTINE_COLORS[index % ROUTINE_COLORS.length],
  };
}

function normalizeLink(link, index = 0) {
  if (typeof link === 'string') {
    return { id: uid(), n: link, u: link };
  }

  return {
    id: link.id ?? uid(),
    e: link.e,
    n: link.n ?? '',
    u: link.u ?? '',
  };
}

function normalizeTodo(todo) {
  if (typeof todo === 'string') {
    return { id: uid(), text: todo, done: false };
  }

  return {
    id: todo.id ?? uid(),
    text: todo.text ?? '',
    done: !!todo.done,
  };
}

function normalizeSearch(val) {
  return !!val;
}

function normalizeWidget(widget) {
  if (typeof widget === 'string') return { id: widget };
  return {
    id: widget.id,
    variant: widget.variant,
    bgVariant: widget.bgVariant,
  };
}

function createStore() {
  let initial = { ...DEFAULTS };
  if (browser) {
    try {
      const saved = localStorage.getItem('pawtabs');
      if (saved) initial = { ...DEFAULTS, ...JSON.parse(saved) };
    } catch {}
  }

  initial.routines = (initial.routines ?? []).map((routine, index) => normalizeRoutine(routine, index));
  initial.links = (initial.links ?? []).map((link, index) => normalizeLink(link, index));
  initial.todos = (initial.todos ?? []).map((todo) => normalizeTodo(todo));
  initial.searchFocusOnOpen = normalizeSearch(initial.searchFocusOnOpen ?? DEFAULTS.searchFocusOnOpen);
  initial.widgetOrder = (initial.widgetOrder ?? DEFAULTS.widgetOrder).map(normalizeWidget);

  const { subscribe, set, update } = writable(initial);

  function persist(val) {
    if (browser) localStorage.setItem('pawtabs', JSON.stringify(val));
    return val;
  }

  return {
    subscribe,
    set: (val) => set(persist(val)),
    update: (fn) => update(val => persist(fn(val))),
  };
}

export const store = createStore();

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function dateKeyBefore(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function calculateStreak(routineId, checks) {
  const c = checks[routineId];
  if (!c) return 0;
  
  const today = todayKey();
  let streak = 0;
  let checkDate = today;
  
  // migrate old format
  if (typeof c === 'string') {
    return c === today ? 1 : 0;
  }
  
  // if today not done yet, start from yesterday
  if (!c[today]) {
    checkDate = dateKeyBefore(today, 1);
  }
  
  // count consecutive days backwards
  for (let i = 0; i < 365; i++) {
    if (c[checkDate]) {
      streak++;
      checkDate = dateKeyBefore(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
}
