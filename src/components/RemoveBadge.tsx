
import React from 'react';

const RemoveBadge: React.FC = () => {
  React.useEffect(() => {
    // Function to safely remove elements that match selectors
    const safelyRemoveElements = (selectors: string[]) => {
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements.length) {
            elements.forEach(el => {
              try {
                // For meta tags, update content instead of removing
                if (el.tagName === 'META' && el.getAttribute('content')?.includes('lovable.dev')) {
                  const content = el.getAttribute('content');
                  if (content) {
                    el.setAttribute('content', content.replace(/lovable\.dev/g, 'surrenderedsinner.fitness'));
                  }
                } else if (el.parentNode) {
                  // Only remove if the element has a parent
                  el.parentNode.removeChild(el);
                }
              } catch (err) {
                // Silently handle individual element errors
                console.debug('Error removing element:', err);
              }
            });
          }
        } catch (err) {
          // Silently handle selection errors
          console.debug('Error selecting elements:', err);
        }
      });
    };

    // Extended list of selectors to ensure we catch all variants of branding
    const selectors = [
      '#lovable-badge',
      'a[href*="lovable.dev"]',
      'a[href*="codecove.dev"]',
      'a[href*="gpteng.co"]',
      'a[href*="gptengineer"]',
      '[id*="lovable"]',
      '[class*="lovable"]',
      '[id*="gpt"]',
      '[class*="gpt"]',
      '[data-testid*="lovable"]',
      '[aria-label*="lovable"]',
      '[alt*="lovable"]',
      'script[src*="gpteng.co"]',
      'script[src*="lovable.dev"]',
      'meta[content*="lovable.dev"]',
      '.toast-container', // Target toast containers
      '[class*="toast"]', // Target toast elements
      '[class*="Toaster"]', // Target toaster elements
      '[id*="toast"]', // Target toast by ID
      '[role="status"]', // Often used for toast notifications
    ];
    
    // Initial removal
    safelyRemoveElements(selectors);

    // Set up a more careful MutationObserver that won't throw during removal
    const observer = new MutationObserver(() => {
      // Use requestAnimationFrame to ensure DOM is stable before manipulating
      requestAnimationFrame(() => {
        safelyRemoveElements(selectors);
      });
    });

    // Start observing with a more limited scope to reduce overhead
    observer.observe(document.body, { 
      childList: true,
      subtree: true,
      attributes: false
    });

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RemoveBadge;
