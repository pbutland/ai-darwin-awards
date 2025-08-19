document.addEventListener('DOMContentLoaded', function () {
  // Delegate for share buttons
  document.body.addEventListener('click', function (e) {
    const shareBtn = e.target.closest('.share-button');
    if (shareBtn) {
      const url = shareBtn.getAttribute('data-share-url') || window.location.href;
      copyToClipboard(url);
      showToast('Link copied to clipboard!');
      e.preventDefault();
    }
    const openBtn = e.target.closest('.open-new-window-button');
    if (openBtn) {
      const url = openBtn.getAttribute('data-open-url');
      if (url) window.open(url, '_blank', 'noopener');
      e.preventDefault();
    }
  });
});

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 1800);
}
