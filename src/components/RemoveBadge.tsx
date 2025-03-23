
import { useEffect } from 'react';

const RemoveBadge = () => {
  useEffect(() => {
    // Function to remove the badge by different selectors
    const removeBadge = () => {
      // Try multiple selectors to ensure we catch all variants of the badge
      const selectors = [
        '#lovable-badge',
        'a[href*="lovable.dev"]',
        'a[href*="codecove.dev"]',
        '[id*="lovable"]',
        '[class*="lovable"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length) {
          elements.forEach(el => el.remove());
        }
      });
    };

    // Initial removal attempt
    removeBadge();

    // Try again after a short delay to catch badges that might be added after initial load
    const timeoutId = setTimeout(removeBadge, 1000);
    
    // Set up a more aggressive MutationObserver to watch for the badge being added to the DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          removeBadge();
        }
      }
    });

    // Start observing the entire document for changes
    observer.observe(document.documentElement, { 
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'style']
    });

    // Clean up
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RemoveBadge;
