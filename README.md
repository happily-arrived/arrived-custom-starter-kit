# Arrived Custom Starter

Branded event sites, your way. A Next.js starter that turns a [Happily Arrived](https://app.happily.events) event into a fully designable site — bring your event data, redesign every pixel.

## How it works

The starter ships a complete event site out of the box — hero, agenda, speakers, sponsors, FAQ, registration, the lot. Each custom site job gets its own copy of this starter, pointed at one Happily event, and you redesign the `components/` directory however you want. The data layer and registration handle themselves; you focus on look-and-feel. Happily builds the previews and publishes the site for you.

Design references and starting-point templates live in Figma: [Design Templates](https://www.figma.com/design/k8CN5DFdzpeLCYfhXZmpeT/Design-Jam-Templates). Use them as inspiration or ignore them — your call.

## Prerequisites

- Node 20+ and npm
- A GitHub account (Happily invites you by your GitHub username)

## Get started

### 1. Accept your invitation

Happily HQ creates a private repo for your job in the [`happily-arrived`](https://github.com/happily-arrived) GitHub organization, built from this starter and named after the job. GitHub emails you an invitation to that one repo. Accept it; the invitation expires after 7 days.

The event already exists in Arrived. Happily sends you its event ID in your job email or brief. Happily HQ may also add you as a collaborator on the event in [Arrived](https://app.happily.events); if so, the event ID is in the event's URL: `app.happily.events/<EVENT_ID>/...`. You don't need a Vercel account.

### 2. Clone and install

```bash
git clone git@github.com:happily-arrived/<your-repo>.git
cd <your-repo>
npm install
```

`npm install` also turns on the git hooks that keep your work off `main` (see [Sharing your work](#sharing-your-work)).

### 3. Configure

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your event ID into `HAPPILY_EVENT_ID`. That is the only required variable: the API URLs default to production in code. The commented-out variables are optional overrides for development (for example, pointing at a locally running CMS).

### 4. Generate the API types

```bash
npm run api:types
```

Fetches the live OpenAPI schema and writes typed bindings to `lib/happily/generated/schema.d.ts`. Re-run any time the API changes.

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your event site renders with the event's content from Happily. Content changes made in Happily show up here on refresh. If the event hasn't been published yet, you'll see a "Not found" page: open [http://localhost:3000/?preview=true](http://localhost:3000/?preview=true) instead to see your draft.

### 6. Preview your draft

The site shows the published event by default. To see unpublished changes, open any page with `?preview=true`:

```
http://localhost:3000/?preview=true
```

Preview sticks for the rest of your browser session (it is stored in a session cookie), so internal navigation stays in preview — a banner at the top of the page reminds you while it is active, with an **Exit preview** link. Append `?preview=false` to go back to the published site, or just close the browser. If you prefer the site to always render your draft locally, set `HAPPILY_EVENT_ENV=staging` in `.env.local` instead.

Preview is handled by `proxy.ts` at the repo root (Next.js 16 renamed `middleware` to `proxy`). If you add a custom `middleware.ts`, consolidate its logic into `proxy.ts`.

## Analytics

If analytics is configured for your event in Happily, the starter automatically injects the tracking script on the published site. There is nothing to configure: the analytics ID comes from the event payload. The script is not injected in preview mode or when fetching staging data, so your metrics only count real visits.

## What's where

- `components/` — **all the visual stuff.** Every section (hero, agenda, speakers, sponsors, FAQ, registration, footer, etc.) lives here. Redesign freely.
- `components/ui/` — shadcn primitives (button, input, etc.) styled with Tailwind v4. Use them or replace them.
- `app/(event)/` — the route pages (home, confirmation, livestream, photos). Add or change pages here when your design calls for it.
- `lib/happily/` — API client and data queries. Leave alone unless you're pulling new fields from the API.
- `app/globals.css` — global styles. Event-specific colors come from CSS variables (`--event-primary-bg`, `--event-accent-text`, etc.) set automatically from the event's design tokens.

## Customizing

- **Event data comes from the API. Never override it.** Anything the Arrived API provides (event name, dates, venue, copy, agenda, speakers, sponsors, FAQs, images, links, form fields) must be rendered from the event payload, in new and existing components alike, even if your design wants different wording: ask Happily HQ to change it in Arrived. If a field is empty for this event, hide the element instead of filling in placeholder content. Customizing means changing how the data looks, not replacing it.
- **Adding content.** If your design calls for something the API doesn't have at all (an extra tagline, an illustration, a section the event data doesn't cover), you can add it in your components. Use real content from the brief, not placeholders.
- **Colors and fonts.** By default the site uses the colors set for the event in Arrived, applied as `--event-*` CSS variables in `app/(event)/layout.tsx`, and ships with Open Sans. Your design can override them: use your own colors and fonts where the design calls for them, and keep the `--event-*` variables everywhere else so those parts still follow the event's settings. The variables are set inline on `<body>`, so redefining them in a stylesheet won't work; apply your values directly (Tailwind classes, or your own CSS variables in `app/globals.css`).
- **Tailwind v4 CSS-var syntax.** Use `bg-(--event-primary-bg)`, *not* the older `bg-[var(--event-primary-bg)]` arbitrary-value form. Match the surrounding code.
- **Add a section.** Drop a new component into `components/`, then render it from `components/event-page.tsx`.
- **Add or change pages.** Most sites are one page, but your design can add more or rework the existing ones. Create a new page at `app/(event)/<name>/page.tsx` so it picks up the site's layout, theme and header/footer, and add a link to it in the nav in `components/event-shell.tsx`. Keep the `/confirmation` page working: the registration form sends people there after they sign up.
- **Feature toggles.** The photos page, livestream, calendar buttons, and registration CTA are gated by fields on the event payload (`event.photos_toggle`, `event.live_toggle`, `event.display_add_to_calendar`, `event.display_settings.*`). Happily HQ turns them on or off for the event, so build each gated section to show or hide with its toggle.

## Registration

The registration form submits via a server action (`app/actions/register.ts`) to the Happily API. It sends attendee data only — Happily handles confirmation emails on the server. Any custom form fields set up for the event in Happily show up automatically.

Errors to expect on the form: `CAPACITY_REACHED`, `DUPLICATE_EMAIL`, `VALIDATION_ERROR`.

## Sharing your work

Every change reaches the site through a pull request that Happily reviews. Never commit to `main`, push to it, or merge your own pull request.

1. **Create a branch** before you change anything:
   ```bash
   git switch -c my-change
   ```
   Already made changes on `main` without committing? Run the same command: your uncommitted changes come with you to the new branch.
2. **Commit and push the branch**, then open a pull request into `main` on GitHub.
3. **Wait for the preview.** A Happily bot comments on the pull request with "⏳ Building…", then edits that same comment to "✅ Ready" with a preview link. Every push to the pull request builds a new preview and updates the comment. If the build fails, the comment shows the last lines of the build log. Happily HQ sees each preview automatically. Previews are public but unguessable, and they never change the live site. Add `?preview=true` to see the event's unpublished draft content.
4. **Happily takes it from there.** Happily HQ reviews the preview (and shows it to the client), then merges the pull request. Publishing is a separate step Happily HQ does. If you need changes after review, push more commits to the same pull request or open a new one.

Don't connect this repo to Vercel or any other host yourself: Happily builds every preview and every production deploy. Merging into `main` never publishes anything on its own.

Hooks block commits and pushes to `main` on your machine:

- **Git `pre-commit` and `pre-push` hooks** (`.githooks/`). These cover everyone: you, Codex, Claude Code, any other agent. `pre-commit` refuses to commit while you're on `main`; `pre-push` refuses to push to `main` from any branch. `npm install` turns them on through the `prepare` script (`scripts/setup.mjs`), which points `core.hooksPath` at `.githooks`. If you skipped `npm install`, turn them on yourself:
  ```bash
  git config core.hooksPath .githooks
  ```
  Check that it's on with `git config core.hooksPath`, which should print `.githooks`.
- **Claude Code hook** (`.claude/settings.json` → `.claude/hooks/block-push-to-main.mjs`). This one stops Claude Code before it even runs a `git push` that targets `main`, including a bare `git push` while you're on `main`. There's nothing to set up: Claude Code loads it automatically. Open `/hooks` in Claude Code to see it.

Don't get around them with `--no-verify`. GitHub can't stop someone with write access from changing `main` directly, so Happily watches for it: any push, force-push or merge to `main` by someone outside the Happily team is flagged to Happily HQ, and you'll be asked to undo it and send it again as a pull request.

## API reference

- Endpoint docs: [app.happily.events/api/docs](https://app.happily.events/api/docs)
- OpenAPI schema: [app.happily.events/api/openapi.json](https://app.happily.events/api/openapi.json)
- Domain types: `lib/happily/types.ts` (re-exports from the generated schema — import from here, not from `generated/schema`)

## Troubleshooting

- **`Missing HAPPILY_EVENT_ID in .env.local`**: you skipped step 3, or the file is empty. Run `cp .env.example .env.local` and paste your event ID.
- **`Failed to fetch OpenAPI schema`**: check that you have network access. If you set the `HAPPILY_API_SCHEMA_URL` override, make sure it points at a reachable schema URL.
- **"Not found" page at `/`**: wrong `HAPPILY_EVENT_ID`, or the event isn't published yet (the site fetches published data by default). Open the page with `?preview=true` or set `HAPPILY_EVENT_ENV=staging` while drafting.
- **`[setup] .claude/skills is not a symlink` during `npm install`** (usually Windows): git checked the skills symlink out as a plain file, so Claude Code won't load the repo's skills. Enable Windows Developer Mode, run `git config core.symlinks true`, delete `.claude/skills`, then run `git checkout -- .claude/skills`. Codex isn't affected.
- **Styles look broken**: run `npm run api:types` once to make sure the generated schema is up to date.

## Resources

- [Happily Arrived](https://app.happily.events) — the CMS
- [Product overview](https://teamhappily.com/arrived/)
- [Design templates (Figma)](https://www.figma.com/design/k8CN5DFdzpeLCYfhXZmpeT/Design-Jam-Templates)
- [API reference](https://app.happily.events/api/docs)
- [Discord community](https://discord.com/invite/d7HnMZfvB7) — questions, show-and-tell, help
