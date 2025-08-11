// Mobile Browser Compatibility Utilities

/**
 * Detect if the current device is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

/**
 * Detect if the current device is iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Detect if the current device is Android
 */
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Fix viewport height issues on mobile browsers
 * Especially important for iOS Safari
 */
export const fixViewportHeight = () => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
  };
};

/**
 * Prevent zoom on input focus for iOS
 */
export const preventIOSZoom = () => {
  if (isIOS()) {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.style.fontSize = '16px';
    });
  }
};

/**
 * Add touch event handling for better mobile experience
 */
export const addTouchHandling = (element, options = {}) => {
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    preventDefault = true
  } = options;

  if (isMobile()) {
    element.addEventListener('touchstart', (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchStart) onTouchStart(e);
    }, { passive: !preventDefault });

    element.addEventListener('touchmove', (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchMove) onTouchMove(e);
    }, { passive: !preventDefault });

    element.addEventListener('touchend', (e) => {
      if (preventDefault) e.preventDefault();
      if (onTouchEnd) onTouchEnd(e);
    }, { passive: !preventDefault });
  }
};

/**
 * Optimize form inputs for mobile
 */
export const optimizeFormForMobile = (formElement) => {
  if (!isMobile()) return;

  const inputs = formElement.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    // Prevent zoom on iOS
    if (isIOS()) {
      input.style.fontSize = '16px';
    }
    
    // Add mobile-specific attributes
    input.setAttribute('autocomplete', input.type === 'password' ? 'current-password' : 'on');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    
    // Ensure minimum touch target size
    input.style.minHeight = '48px';
  });
};

/**
 * Handle mobile keyboard events
 */
export const handleMobileKeyboard = (inputElement, onShow, onHide) => {
  if (!isMobile()) return;

  let initialViewportHeight = window.innerHeight;
  
  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDifference = initialViewportHeight - currentHeight;
    
    if (heightDifference > 150) {
      // Keyboard is likely shown
      if (onShow) onShow();
    } else if (heightDifference < 50) {
      // Keyboard is likely hidden
      if (onHide) onHide();
    }
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Prevent double-tap zoom on mobile
 */
export const preventDoubleTapZoom = (element) => {
  if (!isMobile()) return;

  let lastTouchEnd = 0;
  
  element.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

/**
 * Add smooth scrolling for mobile
 */
export const enableSmoothScrolling = () => {
  if (isMobile()) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }
};

/**
 * Optimize images for mobile
 */
export const optimizeImagesForMobile = () => {
  if (!isMobile()) return;

  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Add loading="lazy" for better performance
    img.setAttribute('loading', 'lazy');
    
    // Ensure images don't exceed viewport width
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
  });
};

/**
 * Handle mobile orientation changes
 */
export const handleOrientationChange = (callback) => {
  if (!isMobile()) return;

  const handleOrientation = () => {
    // Wait for orientation change to complete
    setTimeout(() => {
      if (callback) callback();
    }, 100);
  };

  window.addEventListener('orientationchange', handleOrientation);
  
  return () => {
    window.removeEventListener('orientationchange', handleOrientation);
  };
};

/**
 * Get mobile-safe viewport dimensions
 */
export const getMobileViewport = () => {
  const vh = window.innerHeight * 0.01;
  const vw = window.innerWidth * 0.01;
  
  return {
    vh,
    vw,
    height: window.innerHeight,
    width: window.innerWidth,
    cssVh: `calc(var(--vh, ${vh}px) * 100)`,
    cssVw: `calc(var(--vw, ${vw}px) * 100)`
  };
};

/**
 * Initialize all mobile optimizations
 */
export const initializeMobileOptimizations = () => {
  if (!isMobile()) return;

  // Fix viewport height
  fixViewportHeight();
  
  // Prevent iOS zoom
  preventIOSZoom();
  
  // Enable smooth scrolling
  enableSmoothScrolling();
  
  // Optimize images
  optimizeImagesForMobile();
  
  // Add mobile-specific CSS classes
  document.body.classList.add('mobile-device');
  
  if (isIOS()) {
    document.body.classList.add('ios-device');
  } else if (isAndroid()) {
    document.body.classList.add('android-device');
  }
};

export default {
  isMobile,
  isIOS,
  isAndroid,
  fixViewportHeight,
  preventIOSZoom,
  addTouchHandling,
  optimizeFormForMobile,
  handleMobileKeyboard,
  preventDoubleTapZoom,
  enableSmoothScrolling,
  optimizeImagesForMobile,
  handleOrientationChange,
  getMobileViewport,
  initializeMobileOptimizations
};
