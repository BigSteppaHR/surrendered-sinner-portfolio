/*************
 * Utility functions to handle asset loading errors and provide fallbacks
 *************/

export const registerAssetErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    if (event.target && 
        (event.target instanceof HTMLImageElement || 
         event.target instanceof HTMLLinkElement || 
         event.target instanceof HTMLScriptElement)) {
      
      const elementType = event.target.tagName.toLowerCase();
      const source = event.target instanceof HTMLImageElement ? event.target.src : 
                    (event.target instanceof HTMLLinkElement ? event.target.href : 
                    (event.target instanceof HTMLScriptElement ? event.target.src : 'unknown'));
      
      console.warn(`Failed to load ${elementType} from: ${source}`);
      
      event.preventDefault();
      
      if (event.target instanceof HTMLImageElement) {
        handleImageLoadError(event.target);
      } else if (event.target instanceof HTMLLinkElement) {
        if (event.target.rel === 'icon' || event.target.rel === 'apple-touch-icon') {
          handleFaviconLoadError(event.target);
        } else if (event.target.rel === 'manifest') {
          handleManifestLoadError(event.target);
        }
      }
      
      return false;
    }
  }, true);
  
  console.log('Asset error handlers registered');
};

const handleImageLoadError = (imgElement: HTMLImageElement) => {
  if (!imgElement.src.includes('placeholder.svg')) {
    imgElement.src = '/placeholder.svg';
    imgElement.onerror = null;
  }
};

const handleFaviconLoadError = (linkElement: HTMLLinkElement) => {
  if (!linkElement.href.startsWith('data:')) {
    linkElement.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wL+/v4C////AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///wLr6+tex8fH98fHx/fq6utg////Av///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///wPT09SYk5OT/5OTk/+Tk5P/k5OT/9PT1Jn///8D////AQAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///wPNzc6kjo6O/46Ojv+Ojo7/jo6O/46Ojv+Ojo7/zs7Ppf///wP///8BAAAAAAAAAAAAAAAA////Af///wPMzM2ljIyM/4yMjP+MjIz/jIyM/4yMjP+MjIz/jIyM/4yMjP/Nzc6m////A////wEAAAAAAAAAAP///wLNzc6kiYmJ/4mJif+JiYn/iYmJ/4mJif+JiYn/iYmJ/4mJif+JiYn/iYmJ/87Oz6X///8CAAAAAAAAAADV1daAh4eH/4eHh/+Hh4f/h4eH/4eHh/+Hh4f/h4eH/4eHh/+Hh4f/h4eH/4eHh/+Hh4f/1tbXgQAAAAD///8W0tLUwIWFhf+FhYX/hYWF/4WFhf+FhYX/hYWF/4WFhf+FhYX/hYWF/4WFhf+FhYX/hYWF/9LS1MH///8X////FtHR0sCCgoL/goKC/4KCgv+CgoL/goKC/4KCgv+CgoL/goKC/4KCgv+CgoL/goKC/4KCgv/R0dLA////FwAAAADU1NWAgICA/4CAgP+AgID/gICA/4CAgP+AgID/gICA/4CAgP+AgID/gICA/4CAgP+AgID/1NTVgQAAAAAAAAAA////As/P0KWlpaX/e3t7/3t7e/97e3v/e3t7/3t7e/97e3v/e3t7/3t7e/+mpqb/z8/Qpf///wIAAAAAAAAAAP///wH///8Dz8/RpcvLzP+6urr/eHh4/3h4eP94eHh/eHh4f3h4eP94eHj/ysrL/8/P0ab///8D////AQAAAAAAAAAAAAAAAP///wH///8Dz8/Ro83Nzv/ExMX/wcHC/8HBwn/BwcJ/wcHC/8TExf/Nzc7/z8/Ro////wP///8BAAAAAAAAAAAAAAAAAAAAAAAAAAD///8B////A9DQ0ZbPz9D/z8/Q/8/P0H/Pz9B/z8/Q/8/P0P/Q0NGW////A////wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wL///8X////FgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
  }
};

const handleManifestLoadError = (linkElement: HTMLLinkElement) => {
  console.warn('Manifest file could not be loaded. Using fallback...');
  
  try {
    const manifestJSON = {
      "short_name": "SSF",
      "name": "Surrendered Sinner Fitness",
      "icons": [
        {
          "src": "/favicon.ico",
          "sizes": "64x64 32x32 24x24 16x16",
          "type": "image/x-icon"
        },
        {
          "src": "/logo192.png",
          "type": "image/png",
          "sizes": "192x192"
        },
        {
          "src": "/logo512.png",
          "type": "image/png",
          "sizes": "512x512"
        }
      ],
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#ea384c",
      "background_color": "#000000"
    };
    
    const blob = new Blob([JSON.stringify(manifestJSON)], {type: 'application/manifest+json'});
    const manifestUrl = URL.createObjectURL(blob);
    
    linkElement.href = manifestUrl;
  } catch (err) {
    console.error('Failed to create dynamic manifest:', err);
  }
};

export const initializeAssetProtection = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAssetErrorHandlers);
  } else {
    registerAssetErrorHandlers();
  }
  
  ensureManifestFiles();
  preloadLogoImages();
  
  return true;
};

const ensureManifestFiles = () => {
  const isDevEnvironment = typeof window !== 'undefined' && 
    (window.location.hostname === 'codecove.dev' || 
     window.location.hostname.includes('codecove.dev') || 
     window.location.hostname === 'localhost' ||
     window.location.hostname.includes('localhost'));
  
  if (isDevEnvironment) {
    console.log('Development environment detected, checking manifest files...');
    
    const testImage = (url: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };
    
    Promise.all([
      testImage('/logo192.png'),
      testImage('/logo512.png')
    ]).then(results => {
      if (results.some(result => !result)) {
        console.warn('Some manifest image files are not accessible. Using fallback strategy.');
      } else {
        console.log('All manifest image files are accessible.');
      }
    });
  }
};

const preloadLogoImages = () => {
  const logoUrls = ['/logo192.png', '/logo512.png', '/favicon.ico'];
  
  logoUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};
