# PawTabs

minimalist new tab extension untuk chrome/edge. bento-style dashboard buat routine tracking, links, clock, github activity, sama productivity tools.

## features

- **analog clock** - clean analog + digital time display
- **routine tracker** - daily habits dengan streak counter 🔥
- **github activity** - contribution heatmap real-time
- **quick links** - bookmark favorit dengan custom icons
- **search** - instant web search
- **todo list** - simple task tracking
- **focus mode** - daily focus reminder
- **drag & drop** - atur layout sesuka lo
- **scrollable grid** - unlimited widgets ke bawah

## tech stack

- svelte + sveltekit
- vite
- chrome extension manifest v3
- localStorage untuk persistence

## development

```bash
# install dependencies
npm install

# dev mode (browser preview)
npm run dev

# build extension
npm run build:extension
```

## install extension

1. jalanin `npm run build:extension`
2. buka `chrome://extensions`
3. nyalain **developer mode**
4. klik **load unpacked**
5. pilih folder `extension/`

## customization

- **edit layout**: klik "edit layout" di kanan atas
- **widget variants**: resize widgets (1x1, 2x1, 1x2, 2x2, 1x3)
- **routine colors**: custom color per routine
- **clock theme**: dark/light mode

## file structure

```
src/
├── lib/
│   ├── components/       # semua widget components
│   └── stores.js         # state management
├── routes/
│   └── +page.svelte      # main dashboard
├── app.css               # global styles
└── service-worker.js     # extension background script
```

## notes

- data disimpan di localStorage browser
- streak counter track consecutive days
- github widget butuh username di settings
- scroll support buat unlimited widgets

## license

MIT
