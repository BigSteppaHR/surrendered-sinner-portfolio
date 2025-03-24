
import React from 'react';

// This is a functional component that uses React hooks
const RemoveBadge: React.FC = () => {
  React.useEffect(() => {
    // Function to remove the badge and all other Lovable-related elements
    const removeAllBranding = () => {
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
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length) {
          elements.forEach(el => {
            // For meta tags, update content instead of removing
            if (el.tagName === 'META' && el.getAttribute('content')?.includes('lovable.dev')) {
              const content = el.getAttribute('content');
              if (content) {
                el.setAttribute('content', content.replace(/lovable\.dev/g, 'surrenderedsinner.fitness'));
              }
            } else {
              el.remove();
            }
          });
        }
      });

      // Also modify any og:image, twitter:image URLs that might contain lovable references
      const imageMetaTags = document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]');
      imageMetaTags.forEach(tag => {
        const content = tag.getAttribute('content');
        if (content && (content.includes('lovable.dev') || content.includes('gptengineer'))) {
          // Replace with your logo URL
          tag.setAttribute('content', '/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png');
        }
      });

      // Remove any toast notifications that might appear
      const removeToastNotifications = () => {
        // Look for various toast implementations
        const toastSelectors = [
          '.toast',
          '.Toaster',
          '[role="alert"]',
          '[role="status"]',
          '.notification',
          '.alert',
          '.sonner-toast',
          '.react-toast-notifications',
          '[class*="toast"]',
          '[id*="toast"]'
        ];
        
        toastSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            if (el.innerHTML.toLowerCase().includes('lovable') || 
                el.innerHTML.toLowerCase().includes('gpt') ||
                el.textContent?.toLowerCase().includes('lovable') ||
                el.textContent?.toLowerCase().includes('gpt')) {
              el.remove();
            }
          });
        });
      };
      
      // Run toast removal
      removeToastNotifications();
    };

    // Run immediately on component mount
    removeAllBranding();

    // Run after a delay to catch dynamically loaded elements
    const timeoutId = setTimeout(removeAllBranding, 1000);
    
    // Set up a more aggressive MutationObserver to watch for elements being added
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length || mutation.type === 'attributes') {
          removeAllBranding();
        }
      }
    });

    // Start observing the entire document for any changes
    observer.observe(document.documentElement, { 
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'style', 'src', 'href', 'content']
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
