
import { useEffect } from 'react';

const RemoveBadge = () => {
  useEffect(() => {
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
        '.sonner-toast-container', // Sonner specific
        '.sonner-toast', // Sonner specific
        '.sonner-toast-message', // Sonner specific
        '.react-hot-toast', // React Hot Toast
        '.Toastify', // React Toastify
        '[aria-live="polite"]', // Accessibility attribute often used by toast libraries
      ];
      
      // Instead of immediately removing elements, check their content first
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
              // Check if it contains Lovable branding text
              const innerText = el.textContent?.toLowerCase() || '';
              const innerHTML = el.innerHTML?.toLowerCase() || '';
              
              if (innerText.includes('lovable') || 
                  innerText.includes('gpt') || 
                  innerText.includes('created by') ||
                  innerText.includes('generated with') ||
                  innerHTML.includes('lovable') || 
                  innerHTML.includes('gpt')) {
                el.remove();
              }
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

      // Remove toast notifications
      const removeToastNotifications = () => {
        // Look for various toast implementations and their text content
        document.querySelectorAll('*').forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          const html = el.innerHTML?.toLowerCase() || '';
          
          // More comprehensive check for branding
          const brandingKeywords = ['lovable', 'gpt', 'engineer', 'ai assistant', 'generated', 'created by'];
          
          if (brandingKeywords.some(keyword => text.includes(keyword) || html.includes(keyword)) &&
              // And it looks like a notification (small UI element)
              (el.getBoundingClientRect().width < 500 && 
               el.getBoundingClientRect().height < 200)) {
            
            // Remove the element and potentially its parent if it's a toast container
            el.remove();
            
            // If parent might be a toast container, remove it too
            if (el.parentElement && 
                (el.parentElement.className.toLowerCase().includes('toast') || 
                 el.parentElement.id.toLowerCase().includes('toast'))) {
              el.parentElement.remove();
            }
          }
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

    // Additional interval to check for toasts that might appear after delays
    const intervalId = setInterval(removeAllBranding, 1000);

    // Clean up
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RemoveBadge;
