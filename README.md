# AI Darwin Awards 2025

A satirical project documenting the most spectacular, misguided, or catastrophic uses of AI in 2025. This site highlights nominees for the "AI Darwin Awards" - from AI fraud and data breaches to legal hallucinations and tone-deaf corporate AI deployments.

## Project Structure

- `index.html`, `nominees-2025.html`, `faq.html`, `endorsements.html`: Main site pages.
- `scripts/`: Automation scripts and nominee data.
  - `nominees-2025.json`: Source of truth for all nominee details (structured as an array of nominees, each with narrative `sections`).
  - `generate-nominees.ts`: TypeScript script to generate HTML and meta tags from the JSON data and update `nominees-2025.html`.
- `styles/`: CSS files for site styling.
- `email-templates/`: Markdown templates for acceptance/rejection emails.


## Automation Script

The automation script (`scripts/generate-nominees.ts`) is designed to keep the nominee details on the website consistent, up-to-date, and optimised for both readers and social media/SEO. It works by:

- Reading all nominee data from the single source-of-truth JSON file (`docs/data/v1/nominees-2025.json`), which contains detailed narrative sections and sources for each nominee.
- Automatically generating the full nominee HTML sections for `docs/nominees-2025.html`.
- Updating only the content between special comment markers in the HTML file, so manual edits elsewhere are preserved.
- Automatically generating a separate HTML file for each nominee in `docs/nominees/`.
- Automatically generating a sitemap.
- Making it easy to add, edit, or remove nominees by simply editing the JSON file and rerunning the script - no manual HTML or meta tag editing required.

### How to Install and Run

1. **Install dependencies** (if not already):
   ```sh
   npm install
   ```

2. **Edit nominee data** in `/docs/data/v1/nominees.json` and `/docs/data/v1/results.json` as needed.

3. **Run the script** to generate the HTML:
   ```sh
   npm run generate
   ```
   This will read the JSON, generate nominee HTML files, results HTML files, create a sitemap,
   and create `nominees-YYYY.html` and `results-YYYY.html` files.
