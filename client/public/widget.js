/**
 * PaySage Wallet Widget System
 * 
 * Universal widget loader that creates and injects different wallet widgets
 * based on data-widget attribute and other configuration options.
 * 
 * Usage:
 * <script src="https://wallet.amar.im/widget.js" data-widget="balance" data-theme="light"></script>
 */

(function() {
  const WIDGET_BASE_URL = window.location.hostname.includes('localhost') 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://wallet.amar.im';
  
  const API_BASE_URL = `${WIDGET_BASE_URL}/api`;
  
  // Widget definitions
  const WIDGETS = {
    'balance': {
      name: 'Balance Widget',
      description: 'Shows current wallet balance',
      endpoint: '/wallet',
      width: '300px',
      height: '140px'
    },
    'transactions': {
      name: 'Recent Transactions',
      description: 'Shows recent wallet transactions',
      endpoint: '/transactions',
      width: '300px',
      height: '300px'
    },
    'prepaid-cards': {
      name: 'Prepaid Cards',
      description: 'Shows available prepaid cards',
      endpoint: '/prepaid-cards',
      width: '300px',
      height: '200px'
    },
    'profile': {
      name: 'User Profile',
      description: 'Shows user profile information',
      endpoint: '/user',
      width: '300px',
      height: '160px'
    },
    'carbon-impact': {
      name: 'Carbon Impact',
      description: 'Shows carbon impact overview',
      endpoint: '/carbon/summary',
      width: '300px',
      height: '180px'
    },
    'quick-actions': {
      name: 'Quick Actions',
      description: 'Provides quick money actions',
      endpoint: '/wallet',
      width: '300px',
      height: '130px'
    }
  };
  
  // Create and inject styles
  function injectStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .paysage-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
      }
      
      .paysage-widget:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }
      
      .paysage-widget.theme-dark {
        background-color: #1a1a1a;
        color: #ffffff;
      }
      
      .paysage-widget.theme-light {
        background-color: #ffffff;
        color: #1a1a1a;
      }
      
      .paysage-widget-header {
        padding: 12px 16px;
        font-weight: 600;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .theme-dark .paysage-widget-header {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .paysage-widget-content {
        padding: 16px;
      }
      
      .paysage-widget-footer {
        padding: 8px 12px;
        font-size: 10px;
        text-align: right;
        opacity: 0.6;
        background: rgba(0, 0, 0, 0.02);
        transition: opacity 0.3s ease;
      }
      
      .theme-dark .paysage-widget-footer {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .paysage-widget:hover .paysage-widget-footer {
        opacity: 1;
      }
      
      .paysage-logo {
        display: inline-block;
        margin-right: 6px;
        vertical-align: middle;
      }

      .paysage-error {
        padding: 30px 20px;
        text-align: center;
        color: #e53e3e;
      }

      .paysage-login-button {
        display: inline-block;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        margin-top: 12px;
        border: none;
        cursor: pointer;
      }

      .paysage-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        min-height: 80px;
      }

      .paysage-loader:after {
        content: " ";
        display: block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid;
        border-color: #3498db transparent;
        animation: paysage-loader 1.2s linear infinite;
      }

      @keyframes paysage-loader {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Balance widget styles */
      .paysage-balance-amount {
        font-size: 28px;
        font-weight: 700;
        margin: 10px 0;
      }

      .paysage-currency-code {
        font-size: 14px;
        opacity: 0.7;
        margin-left: 4px;
      }

      /* Transaction styles */
      .paysage-transaction-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
        max-height: 220px;
        overflow-y: auto;
      }

      .paysage-transaction-item {
        padding: 8px 0;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .theme-dark .paysage-transaction-item {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .paysage-transaction-details {
        flex: 1;
      }

      .paysage-transaction-type {
        font-size: 13px;
        font-weight: 500;
      }

      .paysage-transaction-date {
        font-size: 11px;
        opacity: 0.7;
      }

      .paysage-transaction-amount {
        font-weight: 600;
      }

      .paysage-amount-positive {
        color: #38a169;
      }

      .paysage-amount-negative {
        color: #e53e3e;
      }

      /* Prepaid card styles */
      .paysage-card {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        color: white;
      }

      .paysage-card-number {
        font-size: 14px;
        letter-spacing: 2px;
        margin: 10px 0;
      }

      .paysage-card-expiry {
        font-size: 12px;
        opacity: 0.8;
      }

      .paysage-card-network {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 11px;
        font-weight: 700;
        opacity: 0.9;
      }

      /* Profile styles */
      .paysage-profile-name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .paysage-profile-email {
        font-size: 14px;
        opacity: 0.7;
        margin-bottom: 12px;
      }

      .paysage-profile-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-top: 10px;
      }

      .paysage-profile-info-label {
        opacity: 0.7;
      }

      /* Carbon impact styles */
      .paysage-carbon-impact {
        display: flex;
        align-items: center;
        margin: 10px 0;
      }

      .paysage-impact-chart {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: conic-gradient(#38a169 var(--percentage), #e2e8f0 0);
        margin-right: 15px;
        position: relative;
      }

      .paysage-impact-chart::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        height: 70%;
        border-radius: 50%;
        background-color: inherit;
      }

      .paysage-impact-details {
        flex: 1;
      }

      .paysage-impact-total {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .paysage-impact-offset {
        font-size: 12px;
        color: #38a169;
      }

      /* Quick actions styles */
      .paysage-actions {
        display: flex;
        justify-content: space-between;
      }

      .paysage-action-button {
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 15px;
        text-align: center;
        flex: 1;
        margin: 0 5px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .theme-dark .paysage-action-button {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .paysage-action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      .theme-dark .paysage-action-button:hover {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }

      .paysage-action-icon {
        font-size: 20px;
        margin-bottom: 6px;
      }

      .paysage-action-label {
        font-size: 11px;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Handles API fetch requests with credentials
  async function fetchWithAuth(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include', // Includes cookies
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-store'
        }
      });
      
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Widget fetch error:', error);
      throw error;
    }
  }
  
  // Render widgets based on API data
  function renderWidget(container, type, data, config) {
    const theme = config.theme || 'light';
    const widgetInfo = WIDGETS[type];
    
    // Set container properties
    container.className = `paysage-widget theme-${theme}`;
    container.style.width = config.width || widgetInfo.width;
    container.style.height = config.height || widgetInfo.height;
    
    // Create header
    const header = document.createElement('div');
    header.className = 'paysage-widget-header';
    header.textContent = config.title || widgetInfo.name;
    
    // Create content
    const content = document.createElement('div');
    content.className = 'paysage-widget-content';
    
    // Create footer with branding
    const footer = document.createElement('div');
    footer.className = 'paysage-widget-footer';
    footer.innerHTML = '<span class="paysage-logo">💱</span> Powered by PaySage AI';
    
    // Add elements to container
    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(footer);
    
    // Render specific widget content based on type
    switch (type) {
      case 'balance':
        renderBalanceWidget(content, data);
        break;
      case 'transactions':
        renderTransactionsWidget(content, data);
        break;
      case 'prepaid-cards':
        renderPrepaidCardsWidget(content, data);
        break;
      case 'profile':
        renderProfileWidget(content, data);
        break;
      case 'carbon-impact':
        renderCarbonImpactWidget(content, data);
        break;
      case 'quick-actions':
        renderQuickActionsWidget(content, data);
        break;
      default:
        content.textContent = 'Unknown widget type';
    }
  }
  
  // Balance widget renderer
  function renderBalanceWidget(container, data) {
    const balance = data.balances[0] || { availableBalance: 0, currencyCode: 'USD', currencySymbol: '$' };
    
    const content = `
      <div>
        <div class="paysage-balance-amount">
          ${balance.currencySymbol}${balance.availableBalance.toFixed(2)}
          <span class="paysage-currency-code">${balance.currencyCode}</span>
        </div>
        <div>Available in your wallet</div>
      </div>
    `;
    
    container.innerHTML = content;
  }
  
  // Transactions widget renderer
  function renderTransactionsWidget(container, data) {
    if (!data.transactions || data.transactions.length === 0) {
      container.innerHTML = '<div class="paysage-empty-state">No recent transactions</div>';
      return;
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const getAmountClass = (type) => {
      if (type === 'DEPOSIT' || type === 'TRANSFER_IN') return 'paysage-amount-positive';
      if (type === 'WITHDRAWAL' || type === 'TRANSFER_OUT') return 'paysage-amount-negative';
      return '';
    };
    
    const getAmountPrefix = (type) => {
      if (type === 'DEPOSIT' || type === 'TRANSFER_IN') return '+';
      if (type === 'WITHDRAWAL' || type === 'TRANSFER_OUT') return '-';
      return '';
    };
    
    let transactionsHtml = '<ul class="paysage-transaction-list">';
    
    data.transactions.slice(0, 5).forEach(transaction => {
      transactionsHtml += `
        <li class="paysage-transaction-item">
          <div class="paysage-transaction-details">
            <div class="paysage-transaction-type">${transaction.type.replace('_', ' ')}</div>
            <div class="paysage-transaction-date">${formatDate(transaction.timestamp)}</div>
          </div>
          <div class="paysage-transaction-amount ${getAmountClass(transaction.type)}">
            ${getAmountPrefix(transaction.type)}${transaction.currencyCode} ${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </li>
      `;
    });
    
    transactionsHtml += '</ul>';
    container.innerHTML = transactionsHtml;
  }
  
  // Prepaid cards widget renderer
  function renderPrepaidCardsWidget(container, data) {
    if (!data.cards || data.cards.length === 0) {
      container.innerHTML = '<div class="paysage-empty-state">No prepaid cards available</div>';
      return;
    }
    
    let cardsHtml = '';
    
    data.cards.slice(0, 2).forEach(card => {
      const maskedNumber = `•••• •••• •••• ${card.last4}`;
      cardsHtml += `
        <div class="paysage-card">
          <div class="paysage-card-network">${card.cardType}</div>
          <div class="paysage-card-number">${maskedNumber}</div>
          <div class="paysage-card-expiry">Expires: ${card.expiryMonth}/${card.expiryYear}</div>
        </div>
      `;
    });
    
    container.innerHTML = cardsHtml;
  }
  
  // Profile widget renderer
  function renderProfileWidget(container, data) {
    const content = `
      <div class="paysage-profile-name">${data.fullName || data.username}</div>
      <div class="paysage-profile-email">${data.email || 'No email provided'}</div>
      
      <div class="paysage-profile-info">
        <div>
          <div class="paysage-profile-info-label">Customer since</div>
          <div>${new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
        </div>
        <div>
          <div class="paysage-profile-info-label">Status</div>
          <div>${data.isActive ? 'Active' : 'Inactive'}</div>
        </div>
      </div>
    `;
    
    container.innerHTML = content;
  }
  
  // Carbon impact widget renderer
  function renderCarbonImpactWidget(container, data) {
    const totalImpact = data.totalImpact || 0;
    const totalOffset = data.totalOffset || 0;
    const netImpact = data.netImpact || 0;
    
    // Calculate offset percentage for the chart
    const offsetPercentage = totalImpact > 0 
      ? Math.min((totalOffset / totalImpact) * 100, 100)
      : 0;
    
    const formatCO2 = (amount) => {
      if (amount < 1) {
        return `${(amount * 1000).toFixed(0)}g CO₂`;
      }
      return `${amount.toFixed(2)}kg CO₂`;
    };
    
    const content = `
      <div class="paysage-carbon-impact">
        <div class="paysage-impact-chart" style="--percentage: ${offsetPercentage}%"></div>
        <div class="paysage-impact-details">
          <div class="paysage-impact-total">Net impact: ${formatCO2(netImpact)}</div>
          <div class="paysage-impact-offset">Offset: ${Math.round(offsetPercentage)}%</div>
        </div>
      </div>
      <div>
        Your carbon footprint from transactions in the last 30 days
      </div>
    `;
    
    container.innerHTML = content;
  }
  
  // Quick actions widget renderer
  function renderQuickActionsWidget(container, data) {
    const content = `
      <div class="paysage-actions">
        <div class="paysage-action-button">
          <div class="paysage-action-icon">↑</div>
          <div class="paysage-action-label">Send</div>
        </div>
        <div class="paysage-action-button">
          <div class="paysage-action-icon">↓</div>
          <div class="paysage-action-label">Receive</div>
        </div>
        <div class="paysage-action-button">
          <div class="paysage-action-icon">+</div>
          <div class="paysage-action-label">Add</div>
        </div>
      </div>
    `;
    
    container.innerHTML = content;
  }
  
  // Error handler that shows login button
  function renderError(container, error, config) {
    const theme = config.theme || 'light';
    
    container.className = `paysage-widget theme-${theme}`;
    container.style.width = config.width || '300px';
    container.style.height = config.height || '200px';
    
    if (error.message === 'Unauthorized') {
      container.innerHTML = `
        <div class="paysage-error">
          <div>Please log in to view this widget</div>
          <a href="${WIDGET_BASE_URL}/auth" target="_blank" class="paysage-login-button">
            Log in to PaySage
          </a>
        </div>
        <div class="paysage-widget-footer">
          <span class="paysage-logo">💱</span> Powered by PaySage AI
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="paysage-error">
          <div>Unable to load widget</div>
          <div>${error.message}</div>
        </div>
        <div class="paysage-widget-footer">
          <span class="paysage-logo">💱</span> Powered by PaySage AI
        </div>
      `;
    }
  }
  
  // Show loading state
  function renderLoading(container, config) {
    const theme = config.theme || 'light';
    
    container.className = `paysage-widget theme-${theme}`;
    container.style.width = config.width || '300px';
    container.style.height = config.height || '200px';
    
    container.innerHTML = `
      <div class="paysage-loader"></div>
      <div class="paysage-widget-footer">
        <span class="paysage-logo">💱</span> Powered by PaySage AI
      </div>
    `;
  }
  
  // Initialize widget from script tag attributes
  async function initializeWidget(scriptElement) {
    // Get widget type and configuration from script attributes
    const widgetType = scriptElement.getAttribute('data-widget');
    if (!widgetType || !WIDGETS[widgetType]) {
      console.error('Invalid or missing widget type');
      return;
    }
    
    // Parse configuration attributes
    const config = {
      theme: scriptElement.getAttribute('data-theme') || 'light',
      title: scriptElement.getAttribute('data-title'),
      width: scriptElement.getAttribute('data-width'),
      height: scriptElement.getAttribute('data-height')
    };
    
    // Create container for widget
    const container = document.createElement('div');
    scriptElement.parentNode.insertBefore(container, scriptElement);
    
    // Show loading state
    renderLoading(container, config);
    
    try {
      // Fetch widget data
      const widgetInfo = WIDGETS[widgetType];
      const data = await fetchWithAuth(widgetInfo.endpoint);
      
      // Render widget with data
      renderWidget(container, widgetType, data, config);
    } catch (error) {
      // Handle error (unauthorized, network issue, etc.)
      renderError(container, error, config);
    }
  }
  
  // Main entry point
  function main() {
    // Inject required styles
    injectStyles();
    
    // Find all widget script tags
    const widgetScripts = document.querySelectorAll('script[src*="widget.js"]');
    
    // Initialize each widget
    widgetScripts.forEach(script => {
      initializeWidget(script);
    });
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();