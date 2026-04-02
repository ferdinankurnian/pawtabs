import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const project = join(root, '..');
const buildDir = join(project, 'build');
const extDir = join(project, 'extension');
const newtab = join(extDir, 'newtab.html');
const appDir = join(extDir, 'app');
const bootstrap = join(extDir, 'newtab.js');

await rm(extDir, { recursive: true, force: true });
await mkdir(extDir, { recursive: true });

await cp(buildDir, extDir, { recursive: true });
await rm(join(extDir, 'index.html'));
await rename(join(extDir, '_app'), appDir);

const html = await readFile(join(buildDir, 'index.html'), 'utf8');
const startPath = html.match(/import\("([^"]*entry\/start[^"]*\.js)"\)/)?.[1];
const appPath = html.match(/import\("([^"]*entry\/app[^"]*\.js)"\)/)?.[1];
const kitVar = html.match(/(__sveltekit_[a-z0-9]+)/)?.[1] ?? '__sveltekit_app';

if (!startPath || !appPath) {
  throw new Error('Could not determine SvelteKit entrypoints from build/index.html');
}

await writeFile(
  bootstrap,
  `import { start } from '${startPath.replace('/_app/', './app/')}';
import * as app from '${appPath.replace('/_app/', './app/')}';

window.${kitVar} = { base: '' };
history.replaceState({}, '', '/');
start(app, document.getElementById('svelte'));
`
);

await writeFile(
  newtab,
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <title>New Tab</title>
    <link rel="icon" href="./newtab.png" type="image/png" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <meta name="theme-color" content="#09090b" />
    <script type="module" src="./newtab.js"></script>
  </head>
  <body>
    <div id="svelte"></div>
  </body>
</html>
`
);

await writeFile(
  join(extDir, 'manifest.json'),
  JSON.stringify(
    {
      manifest_version: 3,
      name: 'PawTabs',
      version: '1.0',
      chrome_url_overrides: {
        newtab: 'newtab.html',
      },
      icons: {
        '16': 'newtab.png',
        '48': 'newtab.png',
        '128': 'newtab.png',
      },
      action: {
        default_title: 'New Tab',
      },
    },
    null,
    2
  ) + '\n'
);
