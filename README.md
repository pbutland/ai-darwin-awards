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

- Reading all nominee data from the single source-of-truth JSON file (`scripts/nominees-2025.json`), which contains detailed narrative sections and sources for each nominee.
- Automatically generating the full nominee HTML sections for `nominees-2025.html`.
- Updating only the content between special comment markers in the HTML file, so manual edits elsewhere are preserved.
- Making it easy to add, edit, or remove nominees by simply editing the JSON file and rerunning the script - no manual HTML or meta tag editing required.

### How to Install and Run

1. **Install dependencies** (if not already):
   ```sh
   npm install --save-dev tsx typescript @types/node
   ```

2. **Edit nominee data** in `scripts/nominees-2025.json` as needed.

3. **Run the script** to update the HTML:
   ```sh
   npx tsx scripts/generate-nominees.ts
   ```
   This will read the JSON, generate nominee HTML, and update `nominees-2025.html` between the designated comment markers.
