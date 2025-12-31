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
  const countdownElement = document.getElementById('countdown-days');
  if (!countdownElement) return;

  // Auto-updated by generate.ts - do not modify this date manually
  const lastNomineeDate = '2025-10-24';

  const today = new Date();
  const lastDate = new Date(lastNomineeDate);
  const diffTime = Math.abs(new Date(today.getFullYear(), today.getMonth(), today.getDate()) - 
                            new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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

function updateVotingCountdown() {
    const countdownElement = document.getElementById('voting-countdown-days');
    if (!countdownElement) return;

    // Get phase information from phase manager - REQUIRED, no defaults
    if (typeof phaseManager === 'undefined') {
        // Hide countdown if phase manager not available
        const countdownContainer = countdownElement.closest('.countdown-container');
        if (countdownContainer) {
            countdownContainer.style.display = 'none';
        }
        return;
    }
    
    const currentPhase = phaseManager.getCurrentPhase();
    const awardsYear = phaseManager.awardsYear;
    const currentYear = phaseManager.currentYear;
    
    // Determine which page we're on by checking the URL
    const isVotePage = window.location.pathname.includes('vote.html');
    const isAwardsYearPage = window.location.pathname.includes(`nominees-${awardsYear}.html`);
    const isCurrentYearPage = window.location.pathname.includes(`nominees-${currentYear}.html`);
    
    let votingDate;
    let labelText;
    
    // Determine target date and label based on page and phase
    if (isVotePage) {
        // Vote page: always countdown to voting closing (Jan 31)
        votingDate = new Date(awardsYear + 1, 0, 31);
        labelText = 'Days Until Voting Closes:';
    } else if (isCurrentYearPage) {
        // CURRENT_YEAR page: only show countdown when NOT in voting phase
        if (currentPhase === 'voting') {
            // Hide countdown during voting phase (voting is for awards year, not current year)
            const countdownContainer = countdownElement.closest('.countdown-container');
            if (countdownContainer) {
                countdownContainer.style.display = 'none';
            }
            return;
        }
        // Show countdown to voting opening (Jan 1 of next year)
        votingDate = new Date(currentYear + 1, 0, 1);
        labelText = 'Days Until Official Voting Opens:';
    } else if (isAwardsYearPage && currentPhase === 'voting') {
        // AWARDS_YEAR page during VOTING phase: countdown to voting closing (Jan 31)
        votingDate = new Date(awardsYear + 1, 0, 31);
        labelText = 'Days Until Voting Closes:';
    } else {
        // AWARDS_YEAR page before voting: countdown to voting opening (Jan 1)
        votingDate = new Date(awardsYear + 1, 0, 1);
        labelText = 'Days Until Official Voting Opens:';
    }
    
    // Update the label text
    const labelElement = document.querySelector('.countdown-container .countdown-label');
    if (labelElement) {
        labelElement.textContent = labelText;
    }
    
    const today = new Date();
    const diffTime = votingDate - today;
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const nbsp = '\u0021';
    const finalLength = Math.max(2, diffDays.toString().length);
    countdownElement.setAttribute('data-countdown', '8'.repeat(finalLength));
    countdownElement.innerHTML = '0'.padStart(finalLength, nbsp);
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
    const duration = diffDays === 0 ? 0 : (diffDays < 10 ? 250 : 1000);
    const startTime = performance.now();
    let lastNumber = -1;
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
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  updateVotingCountdown();
});
