document.addEventListener('DOMContentLoaded', function () {
  if (!document.body.classList.contains('faq-page')) return;

  document.querySelectorAll('details.faq-item').forEach(function (details) {
    const summary = details.querySelector('summary');
    if (!summary) return;
    const icon = summary.querySelector('.faq-link-icon');
    if (!icon) return;
    icon.style.cursor = 'pointer';
    icon.style.pointerEvents = 'auto';

    // Prevent summary click when clicking icon
    icon.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    icon.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      const anchor = details.id;
      const url = window.location.origin + window.location.pathname + '#' + anchor;
      if (typeof copyToClipboard === 'function') {
        copyToClipboard(url);
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
      if (typeof showToast === 'function') {
        showToast('Link copied to clipboard!');
      }
    });
    // Keyboard activation (if focused programmatically)
    icon.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        icon.click();
      }
    });
  });
});
