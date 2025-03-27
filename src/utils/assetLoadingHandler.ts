
/**
 * Utility functions to handle asset loading errors and provide fallbacks
 */

/**
 * Registers error handlers for static assets like images, stylesheets, and scripts
 */
export const registerAssetErrorHandlers = () => {
  // Global error handler for asset loading
  window.addEventListener('error', (event) => {
    // Check if the error is related to asset loading
    if (event.target && 
        (event.target instanceof HTMLImageElement || 
         event.target instanceof HTMLLinkElement || 
         event.target instanceof HTMLScriptElement)) {
      
      const elementType = event.target.tagName.toLowerCase();
      const source = event.target instanceof HTMLImageElement ? event.target.src : 
                    (event.target instanceof HTMLLinkElement ? event.target.href : 
                    (event.target instanceof HTMLScriptElement ? event.target.src : 'unknown'));
      
      console.warn(`Failed to load ${elementType} from: ${source}`);
      
      // Prevent the error from crashing the application
      event.preventDefault();
      
      // Handle specific asset types
      if (event.target instanceof HTMLImageElement) {
        handleImageLoadError(event.target);
      } else if (event.target instanceof HTMLLinkElement && event.target.rel === 'icon') {
        handleFaviconLoadError(event.target);
      }
      
      return false;
    }
  }, true);
  
  console.log('Asset error handlers registered');
};

/**
 * Handles image loading errors by applying a fallback
 */
const handleImageLoadError = (imgElement: HTMLImageElement) => {
  // Only replace if not already using the fallback
  if (!imgElement.src.includes('placeholder.svg')) {
    imgElement.src = '/placeholder.svg';
    imgElement.onerror = null; // Prevent infinite loop if fallback also fails
  }
};

/**
 * Handles favicon loading errors
 */
const handleFaviconLoadError = (linkElement: HTMLLinkElement) => {
  // Only replace if not already using the fallback
  if (!linkElement.href.startsWith('data:')) {
    // Set a minimal data URI favicon as fallback
    linkElement.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wL+/v4C////AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///wLr6+tex8fH98fHx/fq6utg////Av///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///wPT09SYk5OT/5OTk/+Tk5P/k5OT/9PT1Jn///8D////AQAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///wPNzc6kjo6O/46Ojv+Ojo7/jo6O/46Ojv+Ojo7/zs7Ppf///wP///8BAAAAAAAAAAAAAAAA////Af///wPMzM2ljIyM/4yMjP+MjIz/jIyM/4yMjP+MjIz/jIyM/4yMjP/Nzc6m////A////wEAAAAAAAAAAP///wLNzc6kiYmJ/4mJif+JiYn/iYmJ/4mJif+JiYn/iYmJ/4mJif+JiYn/iYmJ/87Oz6X///8CAAAAAAAAAADV1daAh4eH/4eHh/+Hh4f/h4eH/4eHh/+Hh4f/h4eH/4eHh/+Hh4f/h4eH/4eHh/+Hh4f/1tbXgQAAAAD///8W0tLUwIWFhf+FhYX/hYWF/4WFhf+FhYX/hYWF/4WFhf+FhYX/hYWF/4WFhf+FhYX/hYWF/9LS1MH///8X////FtHR0sCCgoL/goKC/4KCgv+CgoL/goKC/4KCgv+CgoL/goKC/4KCgv+CgoL/goKC/4KCgv/R0dLA////FwAAAADU1NWAgICA/4CAgP+AgID/gICA/4CAgP+AgID/gICA/4CAgP+AgID/gICA/4CAgP+AgID/1NTVgQAAAAAAAAAA////As/P0KWlpaX/e3t7/3t7e/97e3v/e3t7/3t7e/97e3v/e3t7/3t7e/+mpqb/z8/Qpf///wIAAAAAAAAAAP///wH///8Dz8/RpcvLzP+6urr/eHh4/3h4eP94eHh/eHh4f3h4eP94eHj/ysrL/8/P0ab///8D////AQAAAAAAAAAAAAAAAP///wH///8Dz8/Ro83Nzv/ExMX/wcHC/8HBwn/BwcJ/wcHC/8TExf/Nzc7/z8/Ro////wP///8BAAAAAAAAAAAAAAAAAAAAAAAAAAD///8B////A9DQ0ZbPz9D/z8/Q/8/P0H/Pz9B/z8/Q/8/P0P/Q0NGW////A////wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wL///8X////FgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
  }
};

/**
 * Initialize all asset handling protections
 */
export const initializeAssetProtection = () => {
  // Register handlers when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAssetErrorHandlers);
  } else {
    registerAssetErrorHandlers();
  }
  
  return true;
};
