import React, { useEffect, useRef } from 'react';

const RemoveBadge: React.FC = () => {
  const isMountedRef = useRef(true);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const lastOperationTimeRef = useRef<number>(0);
  const processingElementsRef = useRef<Set<Element>>(new Set());
  const pendingRemovalsRef = useRef<Map<Element, number>>(new Map());

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    // Function to safely check if an element is still in the DOM
    const isElementInDOM = (element: Element | null): boolean => {
      if (!element) return false;
      try {
        return document.body.contains(element);
      } catch (err) {
        console.debug('Error checking if element is in DOM:', err);
        return false;
      }
    };

    // Function to safely attempt to remove an element with retry mechanism
    const safelyRemoveElement = (element: Element, parentNode: Node) => {
      try {
        // Only attempt removal if element is attached to this parent
        if (parentNode.contains(element)) {
          parentNode.removeChild(element);
          return true;
        } else {
          // Element is not a child of this parent
          console.debug('Element is not a child of the parent node');
          return false;
        }
      } catch (err) {
        console.debug('Error in removeChild operation:', err);
        return false;
      }
    };

    // Function to safely remove elements that match selectors
    const safelyRemoveElements = (selectors: string[]) => {
      if (!isMountedRef.current) return;
      
      // Rate limit the DOM operations to prevent rendering issues
      const now = Date.now();
      if (now - lastOperationTimeRef.current < 300) {
        return; // Skip if called too frequently - increased throttle time
      }
      lastOperationTimeRef.current = now;

      // Clean up any elements that have been in pending state too long
      pendingRemovalsRef.current.forEach((timestamp, element) => {
        if (now - timestamp > 5000) { // After 5 seconds, abandon the removal attempt
          pendingRemovalsRef.current.delete(element);
          processingElementsRef.current.delete(element);
        }
      });
      
      // Use requestIdleCallback if available for non-critical operations
      const scheduleIdleTask = window.requestIdleCallback || 
                              ((cb) => setTimeout(cb, 300)); // Increased timeout
      
      scheduleIdleTask(() => {
        if (!isMountedRef.current) return;
        
        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            if (elements.length) {
              elements.forEach(el => {
                try {
                  // Skip if we're already processing this element
                  if (processingElementsRef.current.has(el)) {
                    return;
                  }
                  
                  processingElementsRef.current.add(el);
                  
                  // For meta tags, update content instead of removing
                  if (el.tagName === 'META' && el.getAttribute('content')?.includes('lovable.dev')) {
                    const content = el.getAttribute('content');
                    if (content) {
                      el.setAttribute('content', content.replace(/lovable\.dev/g, 'surrenderedsinner.fitness'));
                    }
                    processingElementsRef.current.delete(el);
                  } else if (isElementInDOM(el)) {
                    // Only attempt to remove if element is still in the DOM
                    if (el.parentNode) {
                      // Record this removal attempt
                      pendingRemovalsRef.current.set(el, Date.now());
                      
                      // Attempt to remove with safety checks
                      const removed = safelyRemoveElement(el, el.parentNode);
                      
                      if (removed) {
                        pendingRemovalsRef.current.delete(el);
                        processingElementsRef.current.delete(el);
                      }
                      // If not removed, we keep it in the pending map for later cleanup
                    } else {
                      // No parent node found
                      processingElementsRef.current.delete(el);
                    }
                  } else {
                    // Element not in DOM anymore, just clean up
                    processingElementsRef.current.delete(el);
                  }
                } catch (err) {
                  // Clean up processing state in case of error
                  processingElementsRef.current.delete(el);
                  pendingRemovalsRef.current.delete(el);
                  console.debug('Error processing element:', err);
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
    }, 1500); // Increased initial delay
    
    timeoutIdsRef.current.push(initialRemovalTimeout);

    // Set up periodic checks but with a longer interval to reduce DOM operations
    const periodicRemovalTimeout = setInterval(() => {
      if (isMountedRef.current) {
        safelyRemoveElements(selectors);
      }
    }, 15000); // Less frequent checks (15 seconds)
    
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
      }, 800); // Longer debounce to prevent too many operations
      
      if (debounceTimer) {
        timeoutIdsRef.current.push(debounceTimer);
      }
    };

    try {
      // Only observe if the document is ready
      if (document && document.body) {
        // First, disconnect any existing observer
        if (observerRef.current) {
          try {
            observerRef.current.disconnect();
          } catch (err) {
            console.debug('Error disconnecting existing observer:', err);
          }
        }
        
        // Create a new observer
        observerRef.current = new MutationObserver((mutations) => {
          // Only process if we detect relevant additions
          const shouldProcess = mutations.some(mutation => 
            mutation.type === 'childList' && 
            mutation.addedNodes.length > 0
          );
          
          if (shouldProcess) {
            debouncedRemoval();
          }
        });
        
        // Start observing with a more focused approach
        observerRef.current.observe(document.body, { 
          childList: true,
          subtree: true,
          attributes: false // Disable attribute monitoring to reduce callbacks
        });
      }
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
      
      // Clear processing set
      processingElementsRef.current.clear();
      
      // Clear pending removals
      pendingRemovalsRef.current.clear();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RemoveBadge;
