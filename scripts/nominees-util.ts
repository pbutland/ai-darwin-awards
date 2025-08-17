
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Generate nominee HTML for the list page
export function nomineeHtml(nominee: any) {
  return `
            <details class="nominee" id="${escapeHtml(nominee.id)}">
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
                    ${nominee.sections.map((section: any) => `<div class="nominee-section">
                        <h3>${escapeHtml(section.heading)}</h3>
                        <p>${escapeHtml(section.content)}</p>
                    </div>
                    `).join('')}<p>
                        <strong>Sources:</strong> ${nominee.sources.map((src: any) => `<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.name)}</a>`).join(' | ')}
                    </p>
                </div>
            </details>`;
// TODO - add action buttons
                    // <div class="nominee-actions">
                    //     <button class="share-button" title="Share this nominee" aria-label="Share this nominee">
                    //         <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 8.5V6.75A2.75 2.75 0 0 0 12.25 4h-6.5A2.75 2.75 0 0 0 3 6.75v6.5A2.75 2.75 0 0 0 5.75 16h6.5A2.75 2.75 0 0 0 15 13.25V11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 7l-4 4m0 0l4 4m-4-4h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    //     </button>
                    //     <button class="open-new-window-button" title="Open in new window" aria-label="Open in new window">
                    //         <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 13h6a2 2 0 0 0 2-2V7m-8 6V7a2 2 0 0 1 2-2h6m-8 6h6m0 0V7a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    //     </button>
                    // </div>
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
  const detailsHtml = `
    <div class="nominee-details">
      <p class="attribution"><strong>Nominee:</strong> ${escapeHtml(nominee.nominee)}</p>
      <p class="attribution"><strong>Reported by:</strong> ${escapeHtml(nominee.reportedBy)}</p>
      ${nominee.sections.map((section) => `<div class="nominee-section"><h3>${escapeHtml(section.heading)}</h3><p>${escapeHtml(section.content)}</p></div>`).join('')}
      <p><strong>Sources:</strong> ${nominee.sources.map((src) => `<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.name)}</a>`).join(' | ')}</p>
    </div>
  `;
  // Get the first part of the title before the first ' - '
  const h1Title = nominee.title.split(' - ')[0];
  return nomineeTemplate
    .replace(/<h1>.*?<\/h1>/, `<h1>${escapeHtml(h1Title)}</h1>`)
    .replace(/\[Nominee Title\]/g, escapeHtml(nominee.title))
    .replace(/\[Nominee-specific description\]/g, escapeHtml(summary))
    .replace(/\[Nominee description\]/g, escapeHtml(summary))
    .replace(/\[Nominee Description\]/g, escapeHtml(summary))
    .replace(/\[nominee-slug\]/g, escapeHtml(slug))
    .replace(/\[nominee-image\]/g, escapeHtml(image.replace(/\.(png|jpg|jpeg|svg)$/i, '')))
    .replace(/\[Image description\]/g, escapeHtml(nominee.title))
    .replace(/\[Brief nominee summary\]/g, escapeHtml(summary))
    .replace('[Details, sources, quotes, images]', detailsHtml);
}
