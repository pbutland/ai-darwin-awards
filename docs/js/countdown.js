const nbsp = '\u0021';

function startFlashEffect(element, finalValue, finalLength) {
  let flashCount = 0;
  const finalContent = finalValue.toString().padStart(finalLength, nbsp);
  const emptyContent = nbsp.repeat(finalLength);
  
  const flashInterval = setInterval(() => {
    if (element.innerHTML === emptyContent) {
      element.innerHTML = finalContent;
      if (++flashCount >= 3) clearInterval(flashInterval);
    } else {
      element.innerHTML = emptyContent;
    }
  }, 500);
}

function updateCountdown() {
  // Auto-updated by generate.ts - do not modify this date manually
  const lastNomineeDate = '2025-08-20';

  const today = new Date();
  const lastDate = new Date(lastNomineeDate);
  const diffTime = Math.abs(new Date(today.getFullYear(), today.getMonth(), today.getDate()) - 
                            new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const countdownElement = document.getElementById('countdown-days');
  if (!countdownElement) return;

  const finalLength = Math.max(2, diffDays.toString().length);
  countdownElement.setAttribute('data-countdown', '8'.repeat(finalLength));
  
  const duration = diffDays === 0 ? 0 : (diffDays < 10 ? 250 : 1000);
  const startTime = performance.now();
  let lastNumber = -1;
  
  countdownElement.innerHTML = '0'.padStart(finalLength, nbsp);
  
  function animate() {
    const progress = Math.min((performance.now() - startTime) / duration, 1);
    const currentNumber = Math.floor(progress * diffDays);
    
    if (currentNumber !== lastNumber) {
      countdownElement.innerHTML = currentNumber.toString().padStart(finalLength, nbsp);
      lastNumber = currentNumber;
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      countdownElement.innerHTML = diffDays.toString().padStart(finalLength, nbsp);
      startFlashEffect(countdownElement, diffDays, finalLength);
    }
  }
  
  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', updateCountdown);