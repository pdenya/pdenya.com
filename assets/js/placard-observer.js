/**
 * Placard Observer
 * Handles scroll-based fade-in animations for placard elements
 */

const OBSERVER_CONFIG = {
  threshold: 0.15,
  rootMargin: '0px',
};

/**
 * Initialize intersection observer for placards
 */
export function initPlacardObserver() {
  const placards = document.querySelectorAll('.sv-placard');

  if (!placards.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, OBSERVER_CONFIG);

  placards.forEach((placard) => observer.observe(placard));
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', initPlacardObserver);
