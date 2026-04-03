# PawTabs

minimalist new tab extension for chrome/edge. bento-style dashboard for routine tracking, links, clock, github activity, and productivity tools.

## features

- **analog clock** - clean analog + digital time display
- **routine tracker** - daily habits with streak counter 🔥
- **github activity** - real-time contribution heatmap
- **quick links** - favorite bookmarks with custom icons
- **search** - instant web search
- **todo list** - simple task tracking
- **focus mode** - daily focus reminder
- **drag & drop** - arrange layout however you want
- **scrollable grid** - unlimited widgets downwards

## tech stack

- svelte + sveltekit
- vite
- chrome extension manifest v3
- localStorage for persistence

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

1. run `npm run build:extension`
2. open `chrome://extensions`
3. enable **developer mode**
4. click **load unpacked**
5. select `extension/` folder

## customization

- **edit layout**: click "edit layout" in top right
- **widget variants**: resize widgets (1x1, 2x1, 1x2, 2x2, 1x3)
- **routine colors**: custom color per routine
- **clock theme**: dark/light mode

## file structure

```
src/
├── lib/
│   ├── components/       # all widget components
│   └── stores.js         # state management
├── routes/
│   └── +page.svelte      # main dashboard
├── app.css               # global styles
└── service-worker.js     # extension background script
```

## notes

- data stored in browser localStorage
- streak counter tracks consecutive days
- github widget requires username in settings
- scroll support for unlimited widgets

## license

MIT
