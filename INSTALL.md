# Eidetic — Installation Guide

## Quick Install (Developer / Sideload)

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Chrome (or Chromium-based browser)

### Build

```bash
npm install
npm run build
```

This creates a `dist/` folder containing the production extension.

### Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project
5. The Eidetic icon appears in your toolbar

### Verify It Works

1. Visit [claude.ai](https://claude.ai) (or any supported platform)
2. Look for a small **gold dot** in the bottom-right corner — this means Eidetic is tracking
3. Type a message containing a personal fact (e.g., "My name is Glen and I live in Salt Lake City")
4. Click the Eidetic extension icon to open the popup
5. Check the **Dashboard** — you should see the extracted memory

## How Web Tracking Works

Eidetic uses **content scripts** that inject into 5 AI platforms:

| Platform | URL | Auth Required |
|----------|-----|---------------|
| Claude | claude.ai | None |
| Gemini | gemini.google.com | None |
| ChatGPT | chatgpt.com | None |
| Perplexity | perplexity.ai | None |
| Grok | grok.com | None |

When you chat on any of these platforms, Eidetic silently watches your messages for personal facts (name, location, preferences, etc.) and stores them in your local vault. **No data leaves your browser** — everything stays in IndexedDB.

### The Gold Dot

A small gold dot appears in the bottom-right corner of tracked pages. This confirms Eidetic is active and watching for facts. The dot is non-interactive and won't interfere with the page.

### Primary vs Secondary Agents

- **Primary (Claude by default):** Facts are automatically trusted and added to your vault
- **Secondary (all others):** Facts are queued as "conflicts" for your manual review

You can change which platform is primary in the Platforms tab.

## API Sync (Optional)

For advanced users who want to push memories directly via API, expand the **API Sync (Advanced)** section in the Platforms tab. This requires API keys and is not needed for basic web tracking.

## Distribution

### Chrome Web Store

1. Build the extension: `npm run build`
2. Zip the `dist/` folder:
   ```bash
   cd dist && zip -r ../eidetic-v0.1.0.zip . && cd ..
   ```
3. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Click **New Item** and upload `eidetic-v0.1.0.zip`
5. Fill in the listing details and submit for review

### Self-Hosted (.crx)

1. Go to `chrome://extensions`
2. Click **Pack extension**
3. Set Extension root to the `dist/` folder
4. Click **Pack Extension** — this generates a `.crx` file and `.pem` key
5. Host the `.crx` file on your website for download

### Direct Download (ZIP)

1. Build and zip the `dist/` folder (same as Chrome Web Store step)
2. Host the zip on your site
3. Users download, unzip, and load unpacked via `chrome://extensions`

## Supported Browsers

- Google Chrome (primary)
- Microsoft Edge (Chromium)
- Brave
- Arc
- Any Chromium-based browser supporting Manifest V3

## Troubleshooting

**Gold dot not appearing:**
- Check that the extension is enabled in `chrome://extensions`
- Refresh the page — content scripts inject on page load
- Check the browser console for `[Eidetic]` log messages

**Facts not extracting:**
- Ensure the platform is enabled in the Platforms tab
- Ensure "Auto-extract facts" is checked
- Facts must be clear statements (e.g., "I work at Acme Corp") — conversational mentions may not be detected

**Extension not loading:**
- Make sure you ran `npm run build` successfully
- Load the `dist/` folder, not the project root
- Check for TypeScript errors: `npx tsc --noEmit`
