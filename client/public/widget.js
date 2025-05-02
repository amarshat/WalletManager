/**
 * PaySage Wallet Widget - Embedded Wallet Experience
 * 
 * This script allows third-party websites to embed PaySage Wallet widgets.
 * The widget communicates with the wallet backend using first-party cookies
 * for authentication, ensuring secure access to user financial data.
 * 
 * @author PaySage Wallet Team
 * @version 1.0.0
 */

(function() {
  // Configuration constants
  const DEFAULT_WIDTH = '100%';
  const DEFAULT_HEIGHT = '400px';
  const WIDGET_CLASS = 'paysage-widget';
  const WIDGET_CONTAINER_CLASS = 'paysage-widget-container';
  const LOADING_CLASS = 'paysage-widget-loading';
  const ERROR_CLASS = 'paysage-widget-error';
  const BASE_STYLES = `
    .${WIDGET_CONTAINER_CLASS} {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .${WIDGET_CONTAINER_CLASS}:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
    .${WIDGET_CONTAINER_CLASS}.dark {
      background-color: #1e1e2e;
      color: #ffffff;
    }
    .${WIDGET_CONTAINER_CLASS}.light {
      background-color: #ffffff;
      color: #1e1e2e;
      border: 1px solid #e2e8f0;
    }
    .${WIDGET_CLASS} {
      width: 100%;
      height: 100%;
      border: none;
    }
    .${LOADING_CLASS} {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: inherit;
      z-index: 1;
    }
    .${LOADING_CLASS} .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #3b82f6;
      animation: paysage-spin 1s ease-in-out infinite;
    }
    .${WIDGET_CONTAINER_CLASS}.dark .${LOADING_CLASS} .spinner {
      border-color: rgba(255, 255, 255, 0.1);
      border-top-color: #60a5fa;
    }
    .${ERROR_CLASS} {
      padding: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .${ERROR_CLASS} h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .${ERROR_CLASS} p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }
    .${WIDGET_CONTAINER_CLASS}.dark .${ERROR_CLASS} p {
      color: #94a3b8;
    }
    .paysage-powered {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 10px;
      opacity: 0.7;
      text-align: right;
      font-weight: 400;
    }
    .paysage-powered a {
      color: inherit;
      text-decoration: none;
    }
    .paysage-powered a:hover {
      text-decoration: underline;
    }
    @keyframes paysage-spin {
      to { transform: rotate(360deg); }
    }
  `;

  // Create global style
  function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = BASE_STYLES;
    document.head.appendChild(styleElement);
  }

  // Load widget
  function loadWidget(scriptElement) {
    // Extract widget configuration from script tag attributes
    const widgetType = scriptElement.getAttribute('data-widget') || 'balance';
    const theme = scriptElement.getAttribute('data-theme') || 'light';
    const title = scriptElement.getAttribute('data-title') || null;
    const width = scriptElement.getAttribute('data-width') || DEFAULT_WIDTH;
    const height = scriptElement.getAttribute('data-height') || 
                  (widgetType === 'transactions' || widgetType === 'prepaid-cards' ? '500px' : '300px');
    
    // Get widget host URL from script src
    const scriptSrc = scriptElement.src;
    const widgetHost = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    
    // Create widget container
    const container = document.createElement('div');
    container.className = `${WIDGET_CONTAINER_CLASS} ${theme}`;
    container.style.width = width;
    container.style.height = height;
    
    // Create loading spinner
    const loadingElement = document.createElement('div');
    loadingElement.className = LOADING_CLASS;
    loadingElement.innerHTML = '<div class="spinner"></div>';
    container.appendChild(loadingElement);
    
    // Insert container after script element
    scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
    
    // Create iframe for the widget
    const iframe = document.createElement('iframe');
    iframe.className = WIDGET_CLASS;
    iframe.loading = 'lazy';
    
    // Construct widget URL with parameters
    let widgetUrl = `${widgetHost}/api/widget/${widgetType}?theme=${theme}`;
    if (title) {
      widgetUrl += `&title=${encodeURIComponent(title)}`;
    }
    
    iframe.src = widgetUrl;
    
    // Add event listeners
    iframe.addEventListener('load', function() {
      // Remove loading spinner when iframe is loaded
      loadingElement.remove();
    });
    
    iframe.addEventListener('error', function() {
      handleError(container, 'Widget failed to load', 'Please try again later or contact support.');
    });
    
    // Add iframe to container
    container.appendChild(iframe);
    
    // Add "Powered by" branding
    const poweredBy = document.createElement('div');
    poweredBy.className = 'paysage-powered';
    poweredBy.innerHTML = 'Powered by <a href="https://paysage.ai" target="_blank">PaySage AI</a>';
    container.appendChild(poweredBy);
    
    // Handle timeout - show error if widget doesn't load within 15 seconds
    const timeout = setTimeout(function() {
      if (container.contains(loadingElement)) {
        handleError(container, 'Widget load timeout', 'The widget took too long to respond. Please try again later.');
      }
    }, 15000);
    
    // Clear timeout when iframe loads
    iframe.addEventListener('load', function() {
      clearTimeout(timeout);
    });
  }
  
  // Handle widget loading error
  function handleError(container, title, message) {
    // Remove loading spinner and iframe if they exist
    const spinner = container.querySelector(`.${LOADING_CLASS}`);
    if (spinner) spinner.remove();
    
    const iframe = container.querySelector(`.${WIDGET_CLASS}`);
    if (iframe) iframe.remove();
    
    // Create and show error message
    const errorElement = document.createElement('div');
    errorElement.className = ERROR_CLASS;
    errorElement.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
    `;
    container.appendChild(errorElement);
  }
  
  // Initialize all widgets on the page
  function initWidgets() {
    // Inject global styles
    injectStyles();
    
    // Find all widget script tags and initialize them
    const scripts = document.querySelectorAll(`script[src*="widget.js"][data-widget]`);
    scripts.forEach(loadWidget);
  }
  
  // Run initialization when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidgets);
  } else {
    initWidgets();
  }
})();