# Deployment Guide

## Platform Deployment Overview

The Paysafe Embedded Wallet Platform is designed for flexible deployment across multiple environments, supporting both development and production scenarios with comprehensive tenant isolation and scalability.

## Environment Configuration

### Development Environment
- **Local Development Server**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with tenant-scoped data
- **Mock Backend**: PhantomPay sandbox for testing
- **Frontend**: Vite-based React application
- **Mobile**: Expo WebView application

### Production Environment
- **Live Deployment**: `wallet.amar.im` (HTTPS enabled)
- **Database**: Production PostgreSQL with connection pooling
- **Paysafe Integration**: Live Paysafe API endpoints
- **CDN**: Static asset delivery optimization
- **SSL/TLS**: Full encryption for all communications

## Deployment Architecture

```
Internet
    │
    ├── Web Users ────────► wallet.amar.im (HTTPS)
    │                         │
    ├── Mobile App ───────────┤
    │                         │
    └── Widget Embeds ────────┤
                              │
                    ┌─────────▼─────────┐
                    │   Load Balancer   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Application      │
                    │  Server Layer     │
                    │  • Express.js     │
                    │  • Tenant Routing │
                    │  • Authentication │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
    │   PostgreSQL  │ │   Paysafe     │ │   External    │
    │   Database    │ │   Wallet API  │ │   Services    │
    │   • Tenants   │ │   • Accounts  │ │   • Stripe    │
    │   • Users     │ │   • Transfers │ │   • Analytics │
    │   • Branding  │ │   • Balances  │ │   • Monitoring│
    └───────────────┘ └───────────────┘ └───────────────┘
```

## Environment Variables Configuration

### Core Application Settings
```bash
# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_secure_session_secret_here

# Database
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your_pg_host
PGPORT=5432
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=your_database_name

# Paysafe Integration
PAYSAFE_API_BASE_URL=https://api.paysafe.com
PAYSAFE_CLIENT_ID=your_paysafe_client_id
PAYSAFE_CLIENT_SECRET=your_paysafe_client_secret
PAYSAFE_BRAND=your_paysafe_brand

# Optional: Stripe Integration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_PRICE_ID=price_your_subscription_price_id
```

### Widget Embedding Configuration
```bash
# CORS and Security
ALLOWED_ORIGINS=https://your-client-sites.com,https://another-site.com
WIDGET_DOMAIN=wallet.amar.im
SECURE_COOKIES=true

# Branding
DEFAULT_BRAND_COLOR=#4f46e5
ENABLE_CUSTOM_CSS=true
```

## Database Setup

### 1. Initial Database Creation
```sql
-- Create main database
CREATE DATABASE paysafe_wallet_platform;

-- Create application user
CREATE USER wallet_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE paysafe_wallet_platform TO wallet_app;
```

### 2. Schema Migration
```bash
# Run database migrations
npm run db:push

# Seed initial tenants (optional)
npm run seed:tenants
```

### 3. Database Indexes for Performance
```sql
-- Tenant isolation indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_transactions_user_tenant ON transactions(user_id, tenant_id);
CREATE INDEX idx_brand_settings_tenant ON brand_settings(tenant_id);

-- Performance indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

## Application Deployment

### 1. Server Deployment
```bash
# Install dependencies
npm install --production

# Build application
npm run build

# Start production server
npm run start
```

### 2. Process Management (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# PM2 Configuration
module.exports = {
  apps: [{
    name: 'paysafe-wallet',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log'
  }]
};
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name wallet.amar.im;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wallet.amar.im;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Widget embedding support
    location /widgets/ {
        add_header X-Frame-Options "ALLOWALL";
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }
    
    # Static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ @proxy;
    }
    
    location @proxy {
        proxy_pass http://localhost:5000;
    }
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
}
```

## Mobile App Deployment

### 1. Expo Build Configuration
```json
{
  "expo": {
    "name": "Paysafe Wallet",
    "slug": "paysafe-wallet",
    "version": "1.0.0",
    "orientation": "portrait",
    "backgroundColor": "#4F46E5",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.paysafe.wallet",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.paysafe.wallet",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#4F46E5"
      }
    },
    "extra": {
      "walletUrl": "https://wallet.amar.im"
    }
  }
}
```

### 2. App Store Deployment
```bash
# iOS Build
eas build --platform ios --profile production

# Android Build  
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Widget Deployment

### 1. Iframe Integration
```html
<!-- Balance Widget -->
<iframe 
  src="https://wallet.amar.im/widgets/balance?tenant=paysafe&theme=dark&currency=USD"
  width="300" 
  height="200"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>

<!-- Full Wallet Widget -->
<iframe 
  src="https://wallet.amar.im/widgets/full?tenant=justpark"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

### 2. JavaScript SDK Integration
```javascript
// Initialize Paysafe Widget SDK
<script src="https://wallet.amar.im/js/widget-sdk.js"></script>
<script>
  PaysafeWidgets.init({
    tenant: 'paysafe',
    theme: 'light',
    onReady: function() {
      console.log('Widgets ready');
    }
  });
  
  // Create balance widget
  PaysafeWidgets.create('balance', {
    container: '#balance-widget',
    currency: 'USD',
    showActions: true
  });
</script>
```

## Monitoring and Analytics

### 1. Application Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});

// Metrics collection
app.use('/metrics', (req, res) => {
  // Prometheus metrics endpoint
  res.set('Content-Type', 'text/plain');
  res.send(collectMetrics());
});
```

### 2. Database Monitoring
```sql
-- Monitor tenant usage
SELECT 
  t.name as tenant_name,
  COUNT(u.id) as user_count,
  COUNT(CASE WHEN u.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
GROUP BY t.id, t.name
ORDER BY user_count DESC;

-- Monitor transaction volume
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_volume
FROM transactions 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;
```

## Security Considerations

### 1. SSL/TLS Configuration
- Use TLS 1.2+ only
- Implement HSTS headers
- Regular certificate renewal
- Perfect Forward Secrecy

### 2. Database Security
- Encrypted connections only
- Regular backups with encryption
- Access logging and monitoring
- Principle of least privilege

### 3. Application Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations
- Rate limiting per tenant
- Session security

## Scaling Considerations

### 1. Horizontal Scaling
- Stateless application design
- Load balancer configuration
- Database connection pooling
- Redis session store for multi-instance

### 2. Database Scaling
- Read replicas for reporting
- Tenant-based sharding strategies
- Connection pooling optimization
- Query performance monitoring

### 3. CDN and Caching
- Static asset delivery via CDN
- API response caching
- Widget content caching
- Mobile app asset optimization

This deployment guide ensures a robust, secure, and scalable deployment of the multi-tenant wallet platform while maintaining complete tenant isolation and optimal performance.