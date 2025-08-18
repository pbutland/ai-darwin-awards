function updateCountdown() {
  // Auto-updated by generate.ts - do not modify this date manually
  const lastNomineeDate = '2025-08-07';

  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastDate = new Date(lastNomineeDate);
  const lastDateLocal = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  
  const diffTime = Math.abs(todayLocal - lastDateLocal);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const countdownElement = document.getElementById('countdown-days');
  if (countdownElement) {
    countdownElement.textContent = diffDays;
    countdownElement.setAttribute('data-countdown', '8'.repeat(diffDays.toString().length));
  }
}

document.addEventListener('DOMContentLoaded', updateCountdown);