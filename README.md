# Condo Weights

Johnny's condo gym tracker: daily wall sits, hip and shoulder mobility, weights by muscle group, the stairs finisher, and a Zone 2 walk. Tick things off on your phone; each person who logs in gets their own log.

How it fits together:

- `public/index.html` is the whole page.
- `functions/api/days/` saves and loads each person's log.
- `lib/auth.js` checks who is logged in.
- Logins are handled by Cloudflare Access (a one-time code sent to your email, no passwords).
- Logs are kept in a Cloudflare D1 database, one row per person per day.

## One-time setup in Cloudflare (about 15 minutes, all clicking)

### 1. Put the site up

1. Log in at dash.cloudflare.com.
2. In the left menu click **Workers & Pages**, then **Create**, then the **Pages** tab, then **Connect to Git**.
3. Connect your GitHub account if asked, pick the `condo-weights` repo, and click **Begin setup**.
4. Leave **Framework preset** as None and leave **Build command** empty. Set **Build output directory** to `public`.
5. Click **Save and Deploy**. When it finishes you'll get an address like `condo-weights.pages.dev`. Don't share it yet.

### 2. Create the database

1. In the left menu click **Storage & Databases**, then **D1 SQL Database**, then **Create**.
2. Name it `condo-weights` and click **Create**. You don't need to add any tables because the site creates its own.
3. Go back to **Workers & Pages**, open the `condo-weights` project, then **Settings**, then **Bindings**, then **Add**, then **D1 database**.
4. Set **Variable name** to `DB` and pick the `condo-weights` database. Click **Save**.

### 3. Turn on logins (Cloudflare Access)

1. In the left menu click **Zero Trust**. If it's your first time, pick a team name (for example `johnny`) and choose the **Free** plan, which covers up to 50 people.
2. Go to **Access**, then **Applications**, then **Add an application**, then **Self-hosted**.
3. Set **Application name** to Condo Weights. Under **Application domain**, enter `condo-weights.pages.dev`.
4. Click **Add public hostname** a second time and enter `*.condo-weights.pages.dev`. This also locks the preview copies Cloudflare makes.
5. Add a policy named People, set **Action** to Allow, set **Include** to Emails, and type each email allowed in (yours, Veronica's, and anyone else's).
6. Under login methods, make sure **One-time PIN** is ticked. Save the application.
7. Open the application again and copy its **Application Audience (AUD) Tag**.

### 4. Tell the site your login settings

1. Go to **Workers & Pages**, open `condo-weights`, then **Settings**, then **Variables and Secrets**, then **Add**.
2. Add `TEAM_DOMAIN` with the value `<your team name>.cloudflareaccess.com` (for example `johnny.cloudflareaccess.com`).
3. Add `POLICY_AUD` with the AUD tag you copied.
4. Go to **Deployments**, click the three dots on the latest one, and choose **Retry deployment** so it picks up the settings.

### 5. Use it

Open `condo-weights.pages.dev` on your phone and enter your email. Type in the code you're emailed. You're in, and the bottom of the page shows "Logged in as ...". Use your browser's "Add to Home Screen" to make it feel like an app.

To let someone else in, add their email to the People policy (step 3.5). Each person only ever sees their own ticks and weights.

## Changing the workout

Edit `public/index.html` (the exercise lists sit near the top of the `<script>`), commit, and push. Cloudflare redeploys by itself in about a minute.
