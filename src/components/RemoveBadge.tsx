
import { useEffect } from 'react';

const RemoveBadge = () => {
  useEffect(() => {
    // Function to remove the badge
    const removeBadge = () => {
      const badge = document.getElementById('lovable-badge');
      if (badge) {
        badge.remove();
      }
    };

    // Initial removal attempt
    removeBadge();

    // Set up a MutationObserver to watch for the badge being added to the DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          removeBadge();
        }
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { 
      childList: true,
      subtree: true 
    });

    // Clean up the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RemoveBadge;
