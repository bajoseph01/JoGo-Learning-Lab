# JoGo Learning Lab

A curriculum-first public library for JoGo interactive learning experiences, with an unlinked Studio catalogue for build management.

## Open locally

```bash
npm install
npm run dev
```

Public view: `http://127.0.0.1:4178/`

Studio view: `http://127.0.0.1:4178/#studio`

## Verify

```bash
npm test
npm run check:registry
npm run check:links
npm run build
```

## Add or update an activity

Edit `src/data/experiences.json`, then run `npm run check:registry`.

An activity appears publicly only when all three conditions are true:

1. `public` is `true`;
2. `status` is `published`;
3. `url` is a verified HTTPS address.

All other entries remain in JoGo Studio.

## Privacy boundary

`#studio` is unlinked from the public interface, but it is not authenticated. Store only non-sensitive build metadata there. Do not add passwords, API keys, learner information or confidential school notes to the registry.

## Deployment

The repository includes a GitHub Pages workflow. The Vite build uses relative asset paths so it works under a repository subpath.
