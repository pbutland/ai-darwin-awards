
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Generate JSON-LD hasPart array for nominees
export function generateJsonLdNominees(nominees: any[]) {
  return nominees.map(nominee => {
    const slug = getSlug(nominee);
    const summary = nominee.summary || nominee.sections?.[0]?.content?.slice(0, 160) || '';
    return {
      "@type": "Article",
      "name": nominee.title,
      "description": summary,
      "url": `https://aidarwinawards.org/nominees/${slug}.html`,
      "author": {
        "@type": "Organization",
        "name": "AI Darwin Awards"
      }
    };
  });
}

// Generate nominee HTML for the list page
export function nomineeHtml(nominee: any) {
  const slug = getSlug(nominee);
  const nomineeUrl = `nominees/${slug}.html`;
  const nomineeShareUrl = `https://aidarwinawards.org/nominees/${slug}.html`;
  return `
            <article class="nominee" id="${escapeHtml(nominee.id)}">
                <details>
                    <summary>
                        <span class="nominee-title">${escapeHtml(nominee.title)}</span>
                        <h3 class="category">${escapeHtml(nominee.category)}</h3>
                        <span class="${escapeHtml(nominee.badge.toLowerCase())}-badge">${escapeHtml(nominee.badge)}</span>
                    </summary>
                    <div class="nominee-details">
                        <p class="attribution">
                            <strong>Nominee:</strong> ${escapeHtml(nominee.nominee)}
                        </p>
                        <p class="attribution">
                            <strong>Reported by:</strong> ${escapeHtml(nominee.reportedBy)}
                        </p>
                        <div class="nominee-actions">
                            <button class="share-button" data-share-url="${escapeHtml(nomineeShareUrl)}" title="Share this nominee" aria-label="Share this nominee">
                                <img src="images/share.svg" alt="Share this nominee" />
                            </button>
                            <button class="open-new-window-button" data-open-url="${escapeHtml(nomineeUrl)}" title="Open in new window" aria-label="Open in new window">
                                <img src="images/open-new-window.svg" alt="Open in new window" />
                            </button>
                        </div>
                        ${nominee.sections.map((section: any) => `
                        <div class="nominee-section">
                            <h3>${escapeHtml(section.heading)}</h3>
                            <p>${escapeHtml(section.content)}</p>
                        </div>`).join('')}
                        <p>
                            <strong>Sources:</strong> ${nominee.sources.map((src: any) => `<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.name)}</a>`).join(' | ')}
                        </p>
                    </div>
                </details>
            </article>`;
}


// Utility to get slug for a nominee
export function getSlug(nominee) {
  if (nominee.slug) return nominee.slug;
  return nominee.id.replace(/-nominee$/, '');
}

// Generate detail HTML for a nominee, given the nominee object and the template string
export function nomineeDetailHtml(nominee, nomineeTemplate) {
  const slug = getSlug(nominee);
  const summary = nominee.summary || nominee.sections?.[0]?.content?.slice(0, 160) || '';
  const image = nominee.image ? nominee.image.replace(/^docs\/images\//, '') : 'aidarwinawards-banner.png';
  const nomineeUrl = `https://aidarwinawards.org/nominees/${slug}.html`;
  const breadcrumbTitle = nominee.title.split(' - ')[0];
  const detailsHtml = `
        <div class="nominee-details">
          <div class="nominee-actions">
            <button class="share-button" data-share-url="${nomineeUrl}" title="Share this nominee" aria-label="Share this nominee">
              <img src="../images/share.svg" alt="Share this nominee" />
            </button>
            <span class="${escapeHtml(nominee.badge.toLowerCase())}-badge">${escapeHtml(nominee.badge)}</span>
          </div>
          <p class="attribution"><strong>Nominee:</strong> ${escapeHtml(nominee.nominee)}</p>
          <p class="attribution"><strong>Reported by:</strong> ${escapeHtml(nominee.reportedBy)}</p>
          ${nominee.sections.map((section) => `<div class="nominee-section"><h3>${escapeHtml(section.heading)}</h3><p>${escapeHtml(section.content)}</p></div>`).join('')}
          <p><strong>Sources:</strong> ${nominee.sources.map((src) => `<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.name)}</a>`).join(' | ')}</p>
        </div>
      `;
  // Get the first part of the title before the first ' - '
  const h1Title = nominee.title.split(' - ')[0];
  // Add script and toast container if not present
  let html = nomineeTemplate
    .replace(/<h1>.*?<\/h1>/, `<h1>${escapeHtml(h1Title)}</h1>`)
    .replace(/\[Nominee Title\]/g, escapeHtml(nominee.title))
    .replace(/\[Nominee-specific description\]/g, escapeHtml(summary))
    .replace(/\[Nominee description\]/g, escapeHtml(summary))
    .replace(/\[Nominee Description\]/g, escapeHtml(summary))
    .replace(/\[Nominee Breadcrumb Title\]/g, escapeHtml(breadcrumbTitle))
    .replace(/\[nominee-slug\]/g, escapeHtml(slug))
    .replace(/\[nominee-image\]/g, escapeHtml(image.replace(/\.(png|jpg|jpeg|svg)$/i, '')))
    .replace(/\[Image description\]/g, escapeHtml(nominee.title))
    .replace('[Details, sources, quotes, images]', detailsHtml)
    .replace(/\[Nominee tagline\]/g, escapeHtml(nominee.tagline));
  // Ensure nominee-actions.js is included
  if (!/nominee-actions\.js/.test(html)) {
    html = html.replace('</body>', `<script src=\"../js/nominee-actions.js\"></script>\n</body>`);
  }
  // Add toast container if not present
  if (!/id=\"nominee-toast\"/.test(html)) {
    html = html.replace('</body>', `<div id=\"nominee-toast\" style=\"display:none\"></div>\n</body>`);
  }
  return html;
}
