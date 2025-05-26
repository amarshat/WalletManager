# Technical Implementation Guide

## Multi-Tenant Ring-Fencing Implementation

### Database Schema Design

The platform implements true multi-tenancy through a carefully designed database schema that ensures complete data isolation between tenants while leveraging Paysafe's underlying wallet infrastructure.

#### Core Tables Structure

**Tenants Table**
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Users Table (Ring-Fenced)**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  paysafe_customer_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Enforce tenant isolation at database level
  CONSTRAINT users_tenant_isolation CHECK (tenant_id IS NOT NULL)
);
```

**Brand Settings (Tenant-Specific Customization)**
```sql
CREATE TABLE brand_settings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER UNIQUE REFERENCES tenants(id),
  name VARCHAR(255),
  tagline TEXT,
  logo TEXT,
  primary_color VARCHAR(7) DEFAULT '#4f46e5',
  secondary_color VARCHAR(7) DEFAULT '#7c3aed',
  custom_css TEXT,
  global_brand_name VARCHAR(255),
  global_brand_logo TEXT,
  global_brand_color VARCHAR(7),
  global_brand_position VARCHAR(20) DEFAULT 'left'
);
```

### Ring-Fencing Enforcement

#### 1. Middleware-Level Isolation
```typescript
// Tenant context middleware
const ensureTenantContext = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  // Inject tenant context into all requests
  req.tenantId = req.user.tenant_id;
  next();
};

// Tenant admin middleware (ring-fenced operations)
const ensureTenantAdmin = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated() || req.user.role !== 'tenant_admin') {
    return res.sendStatus(403);
  }
  
  // Ensure admin can only access their tenant's data
  req.tenantId = req.user.tenant_id;
  next();
};
```

#### 2. Query-Level Enforcement
```typescript
// Example: Get users for tenant admin (ring-fenced)
async getUsersForTenant(tenantId: number): Promise<User[]> {
  return await db.select()
    .from(users)
    .where(eq(users.tenant_id, tenantId));
}

// Example: Bulk transfer within tenant ecosystem only
async bulkTransferWithinTenant(
  fromUserId: number, 
  transfers: Transfer[], 
  tenantId: number
): Promise<void> {
  // Verify all users belong to the same tenant
  const userIds = transfers.map(t => t.toUserId);
  const tenantUsers = await db.select()
    .from(users)
    .where(and(
      inArray(users.id, userIds),
      eq(users.tenant_id, tenantId)
    ));
  
  if (tenantUsers.length !== userIds.length) {
    throw new Error('Cross-tenant transfer attempted - blocked');
  }
  
  // Proceed with ring-fenced transfers
  for (const transfer of transfers) {
    await processTransfer(fromUserId, transfer.toUserId, transfer.amount);
  }
}
```

### Paysafe Integration Layer

#### 1. Wallet Account Mapping
```typescript
// Each tenant user maps to a Paysafe customer
interface PaysafeMapping {
  userId: number;
  tenantId: number;
  paysafeCustomerId: string;
  paysafeAccountId: string;
}

// Create wallet through Paysafe API
async createTenantUserWallet(user: User): Promise<string> {
  const paysafeData = {
    customer: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: `tenant_${user.tenant_id}_user_${user.id}`
    }
  };
  
  const paysafeResponse = await paysafeClient.createWallet(paysafeData);
  
  // Store mapping for ring-fenced operations
  await db.update(users)
    .set({ paysafe_customer_id: paysafeResponse.customerId })
    .where(eq(users.id, user.id));
    
  return paysafeResponse.customerId;
}
```

#### 2. Transaction Processing
```typescript
// Ring-fenced transaction processing
async processTenantTransaction(
  fromUserId: number,
  toUserId: number,
  amount: number,
  tenantId: number
): Promise<Transaction> {
  // Verify both users belong to same tenant
  const [fromUser, toUser] = await Promise.all([
    getUserById(fromUserId),
    getUserById(toUserId)
  ]);
  
  if (fromUser.tenant_id !== tenantId || toUser.tenant_id !== tenantId) {
    throw new Error('Cross-tenant transaction blocked');
  }
  
  // Process through Paysafe
  const paysafeTransfer = await paysafeClient.transferMoney({
    fromCustomerId: fromUser.paysafe_customer_id,
    toCustomerId: toUser.paysafe_customer_id,
    amount: amount,
    currencyCode: 'USD',
    description: `Tenant transfer within ${tenantId}`
  });
  
  return paysafeTransfer;
}
```

### Co-Branding System Implementation

#### 1. Dynamic Theme Engine
```typescript
// Brand configuration retrieval
async getBrandConfigForTenant(tenantId: string): Promise<BrandConfig> {
  const tenant = await db.select()
    .from(tenants)
    .where(eq(tenants.tenant_id, tenantId))
    .limit(1);
    
  const brandSettings = await db.select()
    .from(brand_settings)
    .where(eq(brand_settings.tenant_id, tenant[0].id))
    .limit(1);
    
  return {
    tenantName: tenant[0].name,
    logo: brandSettings[0]?.logo,
    primaryColor: brandSettings[0]?.primary_color || '#4f46e5',
    secondaryColor: brandSettings[0]?.secondary_color || '#7c3aed',
    customCss: brandSettings[0]?.custom_css,
    globalBranding: {
      name: brandSettings[0]?.global_brand_name,
      logo: brandSettings[0]?.global_brand_logo,
      color: brandSettings[0]?.global_brand_color
    }
  };
}

// CSS generation for tenant themes
function generateTenantCSS(brandConfig: BrandConfig): string {
  return `
    :root {
      --primary-color: ${brandConfig.primaryColor};
      --secondary-color: ${brandConfig.secondaryColor};
      --brand-gradient: linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor});
    }
    
    .tenant-branded {
      background: var(--brand-gradient);
    }
    
    ${brandConfig.customCss || ''}
  `;
}
```

#### 2. Widget Embedding with Tenant Context
```typescript
// Widget authentication with tenant isolation
app.get('/widgets/:widgetType', async (req, res) => {
  const { tenantId, theme } = req.query;
  
  if (!tenantId) {
    return res.status(400).send('Tenant ID required');
  }
  
  const brandConfig = await getBrandConfigForTenant(tenantId as string);
  const widgetCSS = generateTenantCSS(brandConfig);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>${widgetCSS}</style>
    </head>
    <body>
      <div id="widget-${req.params.widgetType}" 
           data-tenant="${tenantId}"
           data-theme="${theme}">
        <!-- Widget content with tenant branding -->
      </div>
    </body>
    </html>
  `);
});
```

### Administrative Access Control

#### 1. Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  USER = 'user'
}

// Permission matrix
const PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    'manage_all_tenants',
    'manage_global_branding',
    'view_system_analytics',
    'manage_system_config'
  ],
  [UserRole.TENANT_ADMIN]: [
    'manage_tenant_users',
    'manage_tenant_branding',
    'process_bulk_transfers',
    'view_tenant_analytics'
  ],
  [UserRole.USER]: [
    'manage_own_wallet',
    'view_own_transactions',
    'update_own_profile'
  ]
};
```

#### 2. Tenant Admin Operations (Ring-Fenced)
```typescript
// Bulk payout within tenant ecosystem
async processTenantBulkPayout(
  adminUserId: number,
  payouts: Payout[],
  tenantId: number
): Promise<PayoutResult[]> {
  const admin = await getUserById(adminUserId);
  
  if (admin.role !== 'tenant_admin' || admin.tenant_id !== tenantId) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Verify all recipient users belong to the same tenant
  const recipientIds = payouts.map(p => p.userId);
  const tenantUsers = await db.select()
    .from(users)
    .where(and(
      inArray(users.id, recipientIds),
      eq(users.tenant_id, tenantId)
    ));
    
  if (tenantUsers.length !== recipientIds.length) {
    throw new Error('Cross-tenant payout blocked');
  }
  
  // Process payouts through Paysafe
  const results: PayoutResult[] = [];
  for (const payout of payouts) {
    const user = tenantUsers.find(u => u.id === payout.userId);
    const result = await paysafeClient.depositMoney({
      customerId: user.paysafe_customer_id,
      amount: payout.amount,
      currencyCode: 'USD',
      description: `Tenant payout from admin`
    });
    results.push(result);
  }
  
  return results;
}
```

### Mobile WebView Integration

#### 1. Cross-Platform Architecture
```javascript
// Mobile app configuration
const MOBILE_CONFIG = {
  webUrl: 'https://wallet.amar.im',
  features: {
    persistentBottomPanel: true,
    nativeBackButton: true,
    offlineSupport: false,
    pushNotifications: false
  },
  security: {
    sharedCookies: true,
    thirdPartyCookies: true,
    allowHttps: true
  }
};

// Injected mobile enhancements
const MOBILE_INJECTED_JS = `
  // Add persistent bottom navigation
  const createMobileNav = () => {
    const nav = document.createElement('div');
    nav.innerHTML = \`
      <div class="mobile-nav-panel">
        <button onclick="navigateToBalance()">💳 Balance</button>
        <button onclick="navigateToCards()">🪪 Cards</button>
        <button onclick="navigateToSend()">⬆️ Send</button>
        <button onclick="navigateToReceive()">⬇️ Receive</button>
        <button onclick="navigateToHistory()">📋 History</button>
      </div>
    \`;
    document.body.appendChild(nav);
  };
  
  // Initialize mobile features
  if (window.ReactNativeWebView) {
    createMobileNav();
  }
`;
```

### Security Implementation

#### 1. Authentication Security
```typescript
// Secure password hashing
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Session management with tenant context
export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
}
```

#### 2. API Security
```typescript
// Rate limiting per tenant
const createTenantRateLimit = (maxRequests: number) => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests,
  keyGenerator: (req) => `${req.ip}-${req.tenantId || 'unknown'}`,
  message: 'Too many requests from this tenant'
});

// CORS configuration for widgets
const corsOptions = {
  origin: (origin, callback) => {
    // Allow widget embedding from any domain
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
};
```

This technical implementation demonstrates how the multi-tenant architecture maintains complete ring-fencing while leveraging Paysafe's robust wallet infrastructure, ensuring both security and scalability for enterprise deployments.