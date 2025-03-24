
import React, { useEffect, useRef } from 'react';

const RemoveBadge: React.FC = () => {
  const isMountedRef = useRef(true);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    // Function to safely check if an element is still in the DOM
    const isElementInDOM = (element: Element): boolean => {
      try {
        return document.body.contains(element);
      } catch (err) {
        console.debug('Error checking if element is in DOM:', err);
        return false;
      }
    };

    // Function to safely remove elements that match selectors
    const safelyRemoveElements = (selectors: string[]) => {
      if (!isMountedRef.current) return;

      // Use requestIdleCallback if available for non-critical operations
      const scheduleIdleTask = window.requestIdleCallback || 
                              ((cb) => setTimeout(cb, 50));
      
      scheduleIdleTask(() => {
        if (!isMountedRef.current) return;
        
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
                  } else if (el.parentNode && isElementInDOM(el)) {
                    // Double check: Only remove if parent exists AND element is still in the DOM
                    el.parentNode.removeChild(el);
                  }
                } catch (err) {
                  // Log detailed info for debugging but don't break execution
                  console.debug('Error removing element:', {
                    selector, 
                    element: el.outerHTML.slice(0, 100), 
                    error: err
                  });
                }
              });
            }
          } catch (err) {
            // Silently handle selection errors
            console.debug('Error selecting elements with selector:', selector, err);
          }
        });
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
      '.toast-container',
      '[class*="toast"]',
      '[class*="Toaster"]',
      '[id*="toast"]',
      '[role="status"]',
    ];
    
    // Delay initial removal to ensure DOM is ready
    const initialRemovalTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        safelyRemoveElements(selectors);
      }
    }, 1000);
    
    timeoutIdsRef.current.push(initialRemovalTimeout);

    // Set up periodic checks
    const periodicRemovalTimeout = setInterval(() => {
      if (isMountedRef.current) {
        safelyRemoveElements(selectors);
      }
    }, 5000);
    
    // Store interval ID - no need for casting as setInterval returns NodeJS.Timeout
    timeoutIdsRef.current.push(periodicRemovalTimeout);

    // Set up a more careful MutationObserver with debouncing
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const debouncedRemoval = () => {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      
      debounceTimer = setTimeout(() => {
        if (isMountedRef.current) {
          safelyRemoveElements(selectors);
        }
      }, 200);
      
      if (debounceTimer) {
        timeoutIdsRef.current.push(debounceTimer);
      }
    };

    try {
      observerRef.current = new MutationObserver(debouncedRemoval);
      
      // Start observing with a more focused approach
      observerRef.current.observe(document.body, { 
        childList: true,
        subtree: true,
        attributes: false
      });
    } catch (err) {
      console.debug('Error setting up MutationObserver:', err);
    }

    // Clean up function
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Clear all timeout IDs
      timeoutIdsRef.current.forEach(id => {
        clearTimeout(id);
      });
      timeoutIdsRef.current = [];
      
      // Clear interval
      clearInterval(periodicRemovalTimeout);
      
      // Disconnect observer
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (err) {
          console.debug('Error disconnecting observer:', err);
        }
      }
      
      // Clear debounce timer
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RemoveBadge;
